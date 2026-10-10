// Run: node --experimental-vm-modules --test tests/legacy-sheet.test.mjs
// Rendering uses Foundry's bundled Handlebars/parse5; set FOUNDRY_APP_PATH on other installations.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));
const schema = JSON.parse(read("template.json"));
const getProperty = (object, key) => key.split(".").reduce((o, k) => o?.[k], object);
function expandObject(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    const last = parts.pop();
    let cursor = result;
    for (const part of parts) cursor = cursor[part] ??= {};
    cursor[last] = value;
  }
  return result;
}
const hooks = new Map();
class SheetStub {
  constructor(document = {}, options = {}) { this.actor = this.item = this.document = document; this.options = options; }
  async getData() { return { actor: this.actor, item: this.item }; }
  async _render() {}
}
const context = vm.createContext({
  console, structuredClone, CONFIG: {}, ActorSheet: SheetStub, ItemSheet: SheetStub, Application: SheetStub,
  game: { user: { id: "test", isGM: true }, settings: { get: (_, key) => ({ rulesMode: "perSheet" })[key] } },
  foundry: { utils: { deepClone: structuredClone, getProperty, expandObject,
    mergeObject: (a, b) => ({ ...a, ...b }), flattenObject: value => value } },
  Hooks: { on: (key, fn) => hooks.set(key, fn), once: () => {} }
});
const modules = new Map();
async function load(name) {
  const filename = path.resolve(root, name);
  if (!modules.has(filename)) {
    const module = new vm.SourceTextModule(fs.readFileSync(filename, "utf8"), { context, identifier: filename });
    modules.set(filename, module);
    await module.link((specifier, referencing) => load(path.resolve(path.dirname(referencing.identifier), specifier)));
  }
  return modules.get(filename);
}
async function namespace(name) {
  const module = await load(name);
  if (module.status !== "evaluated") await module.evaluate();
  return module.namespace;
}
context.CONFIG.EE = (await namespace("src/config.js")).EE;
const { LegacyRules } = await namespace("src/rules/legacy.js");
const { ErrantEarthCharacterSheet: CharacterSheet } = await namespace("src/actor/character-sheet.js");
const { ErrantEarthItemSheet: ItemSheet } = await namespace("src/item/item-sheet.js");
const { computeTokenBars, registerErrantEarthTokenTools } = await namespace("src/token/token-tools.js");
const { legacyDerived, collectCombatRolls, collectWeaponRolls } = await namespace("src/rolls/weapon-rolls.js");

function fixture() {
  const system = structuredClone(schema.Actor.character);
  for (const entry of Object.values(system.attributes)) entry.value = 10;
  const items = [];
  items.get = id => items.find(item => item.id === id);
  return { id: "fixture", type: "character", name: "Legacy fixture", system, items, isOwner: true,
    updates: [], async update(change, options) { this.updates.push({ change, options }); }, getActiveTokens: () => [] };
}

test("RCC counted as race keeps its benefits when an OCC is equipped", async () => {
  const actor = fixture();
  actor.update = async change => {
    for (const [key, value] of Object.entries(change)) {
      const parts = key.split(".");
      const last = parts.pop();
      parts.reduce((obj, part) => obj[part], actor)[last] = value;
    }
  };
  const rcc = { id: "rcc", name: "Racial package", type: "occ", system: { isRCC: true, rccAsRace: true, poolBonuses: { hp: 7 }, abilities: [{ name: "Racial ability" }] } };
  const occ = { id: "occ", name: "Occupation", type: "occ", system: { poolBonuses: { hp: 3 } } };
  actor.items.push(rcc, occ);
  const sheet = new CharacterSheet(actor);
  sheet._promptPackagePlan = async () => ({ hth: null, specs: {}, attributeChoices: [], wp: {}, picks: [], trades: [] });
  await sheet._equipCcItem(rcc);
  assert.equal(actor.system.equippedRace, "rcc");
  assert.equal(actor.system.equippedOcc, "");
  await sheet._equipCcItem(occ);
  assert.equal(actor.system.equippedRace, "rcc");
  assert.equal(actor.system.equippedOcc, "occ");
  const data = await sheet.getData({});
  assert.equal(data.isRCC, false);
  assert.equal(data.itemsByType.race[0].id, "rcc");
  assert.equal(data.itemsByType.occ.length, 1);
  assert.equal(data.riftsDerived.pools.hp.total, actor.system.hp.max + 10);
  assert.ok(data.grantedAbilities.some(ability => ability.name === "Racial ability"));
  assert.equal(LegacyRules._isRccAsRace({ type: "occ", system: { isRCC: false, rccAsRace: true } }), false);
});

test("RCC race checkbox normalizes submitted boolean values", () => {
  const expanded = { system: { rccAsRace: ["false", "on"] } };
  ItemSheet._normalizeCcUpdate(expanded);
  assert.equal(expanded.system.rccAsRace, true);
  const unchecked = { system: { rccAsRace: "false" } };
  ItemSheet._normalizeCcUpdate(unchecked);
  assert.equal(unchecked.system.rccAsRace, false);
});

test("checking an equipped RCC moves it from OCC to Race", async () => {
  const actor = fixture();
  actor.system.equippedOcc = "rcc";
  const item = { id: "rcc", name: "Racial package", type: "occ", actor,
    system: { isRCC: true, rccAsRace: false },
    async update(change) { Object.assign(this.system, change.system); return this; } };
  const sheet = new ItemSheet(item);
  await sheet._updateObject({}, { "system.rccAsRace": ["false", "on"] });
  assert.deepEqual(plain(actor.updates[0].change), {
    "system.equippedOcc": "", "system.occ": "", "system.equippedRace": "rcc", "system.race": "Racial package"
  });
});

test("package and physical skill pool bonuses agree on sheet and token bars without changing base data", async () => {
  const actor = fixture();
  actor.system.hp = { value: 27, max: 20 };
  actor.system.equippedOcc = "occ";
  actor.items.push({ id: "occ", type: "occ", name: "Package", system: { poolBonuses: { hp: 10, isp: 5 } } });
  actor.system.skills.list = [{ name: "Physical training", statBonuses: { hp: 2, sdc: 8 } }];
  const before = plain(actor.system);
  const data = await new CharacterSheet(actor).getData({});
  const bars = computeTokenBars(actor);
  assert.equal(data.riftsDerived.pools.hp.total, 32);
  assert.equal(bars.hp.max, 32);
  assert.equal(bars.hp.value, 27);
  assert.equal(bars.sdc.max, actor.system.sdc.max + 8);
  assert.equal(bars.isp.max, actor.system.isp.max + 5);
  assert.deepEqual(plain(actor.system), before);
  assert.equal(actor.updates.length, 0);
});

test("PE magic bonus reaches spell and ritual totals; manual and source bonuses still stack", () => {
  const actor = fixture();
  actor.system.attributes.pe.value = 20;
  actor.system.savingThrows.spell.bonus = 2;
  actor.system.equippedRace = "race";
  actor.items.push({ id: "race", type: "race", system: { saveBonuses: { spell: 1 } } });
  const result = LegacyRules.derive(actor.system, actor.items);
  assert.equal(result.saves.spell.attribute, 3);
  assert.equal(result.saves.spell.total, 6);
  assert.equal(result.saves.ritual.total, 3);
  assert.equal(result.saves.drugPoison.total, 3);
});

test("low attributes apply numeric penalties once in sheet, weapons and token quick rolls", () => {
  const actor = fixture();
  for (const key of ["pp", "me", "pe", "spd"]) actor.system.attributes[key].value = 6;
  actor.system.weapons.modern = [{ name: "Rifle", damage: "2d6", strike: 1, quickRoll: true }];
  const result = LegacyRules.derive(actor.system, actor.items);
  assert.equal(result.handToHand.strike.total, -2);
  assert.equal(result.handToHand.initiative.total, -2);
  assert.equal(result.handToHand.dodge.total, -3);
  assert.equal(result.handToHand.perception.total, 1);
  assert.equal(result.saves.spell.total, -3);
  assert.equal(result.saves.horrorFactor.total, -3);
  assert.equal(result.saves.psionics.total, -1);
  assert.equal(legacyDerived(actor).handToHand.dodge, -3);
  assert.equal(collectCombatRolls(actor).find(r => r.id === "dodge").bonus, -3);
  assert.equal(collectWeaponRolls(actor).find(r => r.name === "Rifle").strike, -1);
  // Temporary improvements replace the penalty instead of retaining a stale adjustment.
  actor.system.attributes.pp.temporary = 10;
  assert.equal(LegacyRules.derive(actor.system, actor.items).handToHand.strike.total, 1);
});

test("custom skills inherit their clicked category and acquisition level", async () => {
  const actor = fixture();
  actor.system.level = 5;
  actor.system.skills.list = [{ name: "Existing", category: "occ", misc: 7 }];
  await new CharacterSheet(actor)._onAddRow({ preventDefault() {}, currentTarget: { dataset: { path: "skills.list", kind: "skill", category: "secondary" } } });
  const rows = actor.updates[0].change["system.skills.list"];
  assert.equal(rows[0].misc, 7);
  assert.equal(rows[1].category, "secondary");
  assert.equal(rows[1].learnedAtLevel, 5);
});

test("the single damage-scale control honors old MDC items and can switch back to SDC", async () => {
  assert.equal(LegacyRules.weaponDamageScale({ isMDC: true, damageScale: "S" }), "M");
  const item = { type: "weapon", system: { isMDC: true, damageScale: "M" }, async update(data) { this.saved = data; } };
  const sheet = new ItemSheet(item);
  await sheet._updateObject(null, { "system.damageScale": "S" });
  assert.equal(item.saved.system.damageScale, "S");
  assert.equal(item.saved.system.isMDC, false);
  await sheet._updateObject(null, { "system.damageScale": "M" });
  assert.equal(item.saved.system.isMDC, true);
});

test("open disclosures survive document-driven rerenders", async () => {
  const sheet = new CharacterSheet(fixture());
  sheet.element = { find: () => ({ each: fn => fn(0, { dataset: { disclosureKey: "attribute-effects" }, open: true }) }) };
  await sheet._render(false);
  const replacement = { dataset: { disclosureKey: "attribute-effects" }, open: false, addEventListener() {} };
  sheet._restoreDisclosureStates({ find: () => ({ each: fn => fn(0, replacement) }) });
  assert.equal(replacement.open, true);
});

test("editing equipped items refreshes token maxima on the initiating client", async () => {
  registerErrantEarthTokenTools();
  const actor = fixture();
  actor.system.equippedOcc = "occ";
  const item = { id: "occ", type: "occ", system: { poolBonuses: { hp: 12 } }, parent: actor };
  actor.items.push(item);
  await hooks.get("updateItem")(item, {}, {}, "test");
  assert.equal(actor.updates.at(-1).change["system.tokenBars.hp.max"], actor.system.hp.max + 12);
  const count = actor.updates.length;
  await hooks.get("updateItem")(item, {}, {}, "another-client");
  assert.equal(actor.updates.length, count);
});

const foundryApp = process.env.FOUNDRY_APP_PATH ?? path.join(process.env.ProgramFiles ?? "C:/Program Files", "Foundry Virtual Tabletop/resources/app");
const requireFoundry = createRequire(path.join(foundryApp, "package.json"));
const H = requireFoundry("handlebars");
const parse5 = requireFoundry("parse5");
H.registerHelper("eq", (a, b) => a === b);
H.registerHelper("or", (...values) => values.slice(0, -1).some(Boolean));
H.registerHelper("eeChecked", value => value ? "checked" : "");
H.registerHelper("ee_default", (value, fallback) => value === "" || value == null ? fallback : value);
H.registerHelper("eeSelectOptions", (options, selected, blank) => new H.SafeString(
  (blank !== false ? '<option value=""></option>' : "") + Object.entries(options ?? {}).map(([value, label]) => `<option value="${H.escapeExpression(value)}"${value === selected ? " selected" : ""}>${H.escapeExpression(label)}</option>`).join("")));
H.registerHelper("eeDatalistOptions", () => "");
for (const tab of ["derived", "skills", "combat", "powers", "vehicle", "items", "profile", "misc"]) H.registerPartial(`eeActor${tab[0].toUpperCase()}${tab.slice(1)}`, read(`templates/actor/partials/${tab}.html`));
H.registerPartial("legacySkillSection", read("templates/actor/partials/legacy-skill-section.html"));
const render = H.compile(read("templates/actor/character-sheet.html"));
function elements(html) {
  const list = [];
  function walk(node) { if (node.tagName) list.push(node); for (const child of node.childNodes ?? []) walk(child); }
  walk(parse5.parseFragment(html));
  return list;
}
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;

test("old saved fields stay editable, compact skill rows retain metadata, and tab partials do not duplicate form fields", async () => {
  const actor = fixture();
  actor.system.weapons.modern = [{ name: "SAVED_RIFLE", damage: "2d6", quickRoll: true }];
  actor.system.vehicle.name = "SAVED_ROBOT";
  actor.system.armor.primary.name = "SAVED_ARMOR";
  actor.system.skills.list = [{ name: "Pilot", key: "pilot-test", category: "occ", base: 40, perLvl: 5, misc: 2, learnedAtLevel: 1, sourceItemId: "occ", sourceChoiceIndex: 0, statBonuses: { sdc: { bonus: 3, value: 0, rolled: false } } }];
  const html = render(await new CharacterSheet(actor).getData({}));
  const dom = elements(html);
  for (const name of ["SAVED_RIFLE", "SAVED_ROBOT", "SAVED_ARMOR"]) assert.ok(html.includes(name));
  for (const name of ["sourceItemId", "sourceChoiceIndex", "learnedAtLevel", "statBonuses.sdc.bonus"]) assert.ok(html.includes(`name="system.skills.list.0.${name}"`));
  const names = new Map();
  for (const node of dom.filter(node => ["input", "select", "textarea"].includes(node.tagName))) {
    const name = attr(node, "name");
    if (name) names.set(name, [...(names.get(name) ?? []), node]);
  }
  for (const [name, fields] of names) {
    if (fields.length === 1) continue;
    assert.equal(fields.length, 2, name);
    assert.deepEqual(fields.map(f => attr(f, "type")).sort(), ["checkbox", "hidden"], name);
  }
  assert.ok(html.indexOf('aria-label="Combat quick actions"') < html.indexOf('data-disclosure-key="combat-modifiers"'));
  assert.equal(dom.filter(n => n.tagName === "form").length, 1);
  if (process.env.EE_PREVIEW_DIR) {
    fs.mkdirSync(process.env.EE_PREVIEW_DIR, { recursive: true });
    fs.writeFileSync(path.join(process.env.EE_PREVIEW_DIR, "legacy-render.html"), html);
  }
});

test("EE mode retains its combat layout and does not show Legacy play controls", async () => {
  const actor = fixture(); actor.system.mode = "errantEarth";
  const html = render(await new CharacterSheet(actor).getData({}));
  assert.ok(html.includes("Errant Earth Weapons"));
  assert.ok(html.includes('name="system.eeCombat.actions"'));
  assert.ok(!html.includes('aria-label="Combat quick actions"'));
  assert.ok(!html.includes('data-disclosure-key="combat-modifiers"'));
  assert.ok(!html.includes('data-disclosure-key="saved-weapons"'));
});

const { LegacyPackages } = await namespace("src/rules/legacy-packages.js");
const { LegacyPackageWizard } = await namespace("src/apps/legacy-package-wizard.js");
H.registerPartial("ccPackageEditor", read("templates/item/partials/package-editor.html"));
const renderItem = H.compile(read("templates/item/item-sheet.html"));

function assertUniqueFields(html, label) {
  const names = new Map();
  for (const node of elements(html).filter(node => ["input", "select", "textarea"].includes(node.tagName))) {
    const name = attr(node, "name");
    if (name) names.set(name, [...(names.get(name) ?? []), node]);
  }
  for (const [name, fields] of names) {
    if (fields.length === 1) continue;
    assert.equal(fields.length, 2, `${label}: ${name}`);
    assert.deepEqual(fields.map(f => attr(f, "type")).sort(), ["checkbox", "hidden"], `${label}: ${name}`);
  }
  return names;
}

test("Palladium pool text splits into starting and per-level formulas", () => {
  const split = text => plain(LegacyPackages.splitPoolText(text));
  assert.deepEqual(split("3d4 * 10 plus 2d6/lvl"), { start: "3d4 * 10", perLevel: "2d6" });
  assert.deepEqual(split("2D6x10, +2D6 per level of experience"), { start: "2D6x10", perLevel: "2D6" });
  assert.deepEqual(split("P.E. attribute number plus 1D6 per level of experience"), { start: "P.E. attribute number + 1D6", perLevel: "1D6" });
  assert.equal(LegacyPackages.toRollFormula("3D6x1O+20 added to the character's P.E. attribute number"), "3d6*10+20 + @pe");
  assert.equal(LegacyPackages.toRollFormula("M.E. +4D6"), "@me +4d6");
  assert.equal(LegacyPackages.toRollFormula("1D4x100+50 M.D.C."), "1d4*100+50");
  assert.equal(LegacyPackages.flatValue("10 M.D.C."), 10);
  assert.equal(LegacyPackages.flatValue("P.P.E. 3D6"), null);
});

test("pool maxima add flat starts, flat per-level gains and active rolled entries only", () => {
  const actor = fixture();
  actor.system.level = 4;
  actor.system.hp.max = 0;
  actor.system.mdc.max = 0;
  actor.system.equippedOcc = "rcc";
  actor.items.push({ id: "rcc", type: "occ", name: "Dragon", system: { isRCC: true, poolBonuses: { mdc: "1D4x100+50", ppe: "40" }, poolPerLevel: { mdc: "10", ppe: "2D6" } } });
  actor.system.advancement = { pools: [
    { key: "mdc", level: 1, source: "rcc", value: 230 },
    { key: "ppe", level: 2, source: "rcc", value: 7 },
    { key: "ppe", level: 6, source: "rcc", value: 9 },
    { key: "hp", level: 1, source: "standard", value: 15 },
    { key: "sdc", level: 1, source: "removed", value: 40 }
  ], trades: [] };
  const pools = LegacyRules.derive(actor.system, actor.items).pools;
  assert.equal(pools.mdc.total, 230 + 10 * 3);
  assert.equal(pools.ppe.total, 40 + 7);
  assert.equal(pools.hp.total, 15);
  assert.equal(pools.sdc.total, actor.system.sdc.max);
  const pending = plain(LegacyPackages.pendingPoolRolls(actor.system, actor.items).map(row => `${row.key}@${row.level}`));
  assert.deepEqual(pending.sort(), ["hp@2", "hp@3", "hp@4", "ppe@3", "ppe@4"].sort());
  // Older packages that spell out "P.E. + ..." replace the standard Hit Points rule.
  assert.equal(LegacyPackages.usesStandardHitPoints([{ system: { poolBonuses: { hp: "P.E. + 1d6/lvl" } } }]), false);
  assert.equal(LegacyPackages.usesStandardHitPoints([{ system: { poolBonuses: { hp: "P.E. + 1d6/lvl" }, standardHitPoints: "true" } }]), true);
});

test("choice rules grant later-level picks and count double-cost skills and trades", () => {
  const actor = fixture();
  const rule = { count: 5, level: 1, laterLevels: "3, 7, 10 and 13", laterCount: 1, category: "occRelated" };
  assert.equal(LegacyPackages.choiceBudget(rule, 1), 5);
  assert.equal(LegacyPackages.choiceBudget(rule, 7), 7);
  assert.equal(LegacyPackages.choiceBudget(rule, 15), 9);
  actor.system.skills.list = [
    { key: "paramedic", sourceItemId: "occ", sourceChoiceIndex: 0, choiceCost: 2 },
    { key: "radioBasic", sourceItemId: "occ", sourceChoiceIndex: 0 }
  ];
  actor.system.advancement = { pools: [], trades: [{ sourceItemId: "occ", choiceIndex: 0, kind: "hth", cost: 1 }] };
  assert.equal(LegacyPackages.choiceUsage(actor.system, "occ", 0), 4);
  actor.system.equippedOcc = "occ";
  actor.items.push({ id: "occ", type: "occ", name: "Merc", system: { skillChoices: [rule] } });
  assert.equal(LegacyPackages.pendingChoices(actor.system, actor.items)[0].remaining, 1);
});

test("level-listed bonuses count each reached level", () => {
  const actor = fixture();
  actor.system.level = 7;
  actor.system.equippedOcc = "occ";
  actor.items.push({ id: "occ", type: "occ", name: "Walker", system: { levelBonuses: [
    { target: "save.spell", levels: "3, 6, 9, 11, 14", value: 1 },
    { target: "combat.perception", levels: "2, 5, 7, 10, 13", value: 1 }
  ] } });
  const derived = LegacyRules.derive(actor.system, actor.items);
  assert.equal(derived.saves.spell.source, 2);
  assert.equal(derived.handToHand.perception.source, 3);
});

test("a fixed skill's printed bonus is never added twice", async () => {
  const actor = fixture();
  actor.system.equippedOcc = "occ";
  actor.items.push({ id: "occ", type: "occ", name: "Cyber-Knight", system: {
    skills: [{ key: "languageOther", name: "Language: Other", base: 50, perLvl: 3, bonus: 30 }],
    skillBonuses: [{ key: "languageOther", name: "Language: Other", bonus: 30 }, { key: "prowl", name: "Prowl", bonus: 5 }]
  } });
  actor.system.skills.list = [
    { key: "languageOther", name: "Language: Other", base: 50, perLvl: 3, category: "occ", sourceItemId: "occ" },
    { key: "languageOther", name: "Language: Euro", base: 50, perLvl: 3, category: "occ", sourceItemId: "occ", occBonus: 30 },
    { key: "languageOther", name: "Language: Spanish", base: 50, perLvl: 3, category: "secondary", sourceItemId: "occ", sourceChoiceIndex: 1, occBonus: 0 },
    { key: "prowl", name: "Prowl", base: 25, perLvl: 5, category: "secondary" }
  ];
  const data = await new CharacterSheet(actor).getData({});
  const totals = Object.fromEntries([...data.skills.occ, ...data.skills.secondary].map(row => [row.name, row.total]));
  assert.equal(totals["Language: Other"], 80);
  assert.equal(totals["Language: Euro"], 80);
  assert.equal(totals["Language: Spanish"], 50);
  assert.equal(totals.Prowl, 30);
});

test("taking an O.C.C. names languages, buys a Hand to Hand upgrade and spends picks", () => {
  const actor = fixture();
  actor.system.equippedRace = "race";
  actor.items.push({ id: "race", type: "race", name: "Human", system: { nativeLanguage: "American" } });
  const occ = { id: "occ", type: "occ", name: "Merc", system: {
    skills: [
      { key: "languageNative", name: "Language: Native Tongue", base: 96, perLvl: 1 },
      { key: "languageOther", name: "Language: Other", base: 50, perLvl: 3, bonus: 20, count: 2 },
      { key: "radioBasic", name: "Radio: Basic", base: 45, perLvl: 5, bonus: 10 }
    ],
    handToHand: { type: "expert", upgrades: [{ type: "martialArts", cost: 1 }] },
    skillChoices: [{ label: "O.C.C. Related Skills", count: 5, level: 1, category: "occRelated", allowWp: true,
      allowedGroups: [{ group: "Medical", bonus: 5 }, { group: "Communication", bonus: 10 }], costs: { paramedic: 2 } }]
  } };
  actor.items.push(occ);
  const context = LegacyPackageWizard.buildContext({ sys: actor.system, item: occ, items: actor.items, mode: "equip" });
  assert.equal(context.hth.options.length, 2);
  assert.equal(context.specSkills[0].inputs[0].value, "American");
  assert.equal(context.specSkills[1].inputs.length, 2);
  const related = context.skillChoices[0];
  const options = related.groups.flatMap(group => group.options);
  assert.ok(!options.some(option => option.key === "radioBasic"), "fixed skills are not offered again");
  const field = key => options.find(option => option.key === key && option.slot === 0);
  const values = {
    hth: "martialArts",
    "spec.1.0": "Euro", "spec.1.1": "Spanish",
    [field("paramedic").field]: true,
    [field("wpEnergyRifle").field]: true,
    [field("languageOther").field]: true, [field("languageOther").specField]: "Japanese"
  };
  const over = LegacyPackageWizard.planFromValues({ ...values, [field("firstAid").field]: true }, context);
  assert.equal(over.errors.length, 1, "six picks do not fit in five");
  const { plan, errors } = LegacyPackageWizard.planFromValues(values, context);
  assert.deepEqual(plain(errors), []);
  const { actorUpdate } = LegacyPackageWizard.planUpdates({ sys: actor.system, item: occ, items: actor.items, plan, mode: "equip" });
  const rows = actorUpdate["system.skills.list"];
  const byName = Object.fromEntries(rows.map(row => [row.name, row]));
  assert.ok(byName["Language: American"]);
  assert.equal(byName["Language: Euro"].occBonus, 20);
  assert.equal(byName["Language: Spanish"].occBonus, 20);
  assert.equal(byName.Paramedic.occBonus, 5);
  assert.equal(byName.Paramedic.choiceCost, 2);
  assert.equal(byName["Language: Japanese"].occBonus, 10);
  assert.equal(actorUpdate["system.handToHand.type"], "martialArts");
  assert.equal(actorUpdate["system.weaponProficiencies.selected"].wpEnergyRifle, true);
  actor.system.skills.list = rows;
  actor.system.advancement = { pools: [], trades: actorUpdate["system.advancement.trades"] };
  actor.system.equippedOcc = "occ";
  assert.equal(LegacyPackages.choiceUsage(actor.system, "occ", 0), 5);
  assert.equal(LegacyPackages.pendingChoices(actor.system, actor.items).length, 0);
});

test("race and R.C.C. dice replace the standard attribute roll; O.C.C. dice add to it", () => {
  const actor = fixture();
  actor.system.equippedRace = "race";
  actor.system.equippedOcc = "occ";
  actor.items.push({ id: "race", type: "race", name: "Satori", system: { attributeBonuses: { iq: { formula: "4D6" }, me: { formula: "3D6+2" } } } });
  actor.items.push({ id: "occ", type: "occ", name: "Walker", system: { attributeBonuses: { iq: { formula: "1D4" }, pe: { min: 12 } },
    attributeChoices: [{ label: "Any one Mental attribute", formula: "1D4", options: { iq: true, me: true, ma: true }, chosen: "me", value: 3, rolled: true }] } });
  const plan = Object.fromEntries(LegacyPackages.attributeRollPlan(actor.system, actor.items).map(row => [row.key, row]));
  assert.equal(plan.iq.source, "race");
  assert.equal(plan.iq.formula, "4D6");
  assert.equal(plan.iq.bonusRolls[0].itemId, "occ");
  assert.equal(plan.ps.source, "standard");
  assert.equal(plan.ps.exceptional, true);
  const derived = LegacyRules.derive(actor.system, actor.items);
  assert.equal(derived.attributeScores.me, 13);
  assert.ok(derived.sourceWarnings.some(warning => warning.includes("P.E. 12")));
});

test("Race and O.C.C. editors render every saved field once", async () => {
  for (const type of ["race", "occ"]) {
    const item = { id: `${type}1`, name: `Test ${type}`, type, img: "", system: structuredClone(schema.Item[type]) };
    Object.assign(item.system, {
      skills: [{ key: "languageOther", name: "Language: Other", base: 50, perLvl: 3, bonus: 20, count: 2, custom: false, category: "occ" }],
      skillChoices: [{ label: "Related", count: 5, level: 1, laterLevels: "3, 7", laterCount: 1, category: "occRelated", bonus: 0,
        allowedKeys: ["paramedic"], allowedGroups: [{ group: "Medical", excludedKeys: ["fieldSurgery"], bonus: 5 }],
        keyBonuses: { paramedic: 5 }, costs: { paramedic: 2, cyberneticMedicine: 2 }, allowWp: true, wpCost: 1 }],
      attributeChoices: [{ label: "Mental", formula: "1D4", options: { iq: true }, chosen: "", value: 0, rolled: false }],
      levelBonuses: [{ target: "save.spell", levels: "3, 6", value: 1, note: "" }],
      handToHand: { type: "basic", upgrades: [{ type: "expert", cost: 1, note: "" }] },
      languageList: [{ name: "Gobblely", base: 60, perLvl: 3, literacy: true }]
    });
    const data = await new ItemSheet(item).getData({});
    const html = renderItem(data);
    const names = assertUniqueFields(html, type);
    for (const name of ["system.skillChoices.0.costs.cyberneticMedicine", "system.skillChoices.0.allowedGroups.0.excludedKeys.0",
      "system.skillChoices.0.keyBonuses.paramedic", "system.skills.0.count", "system.attributeChoices.0.rolled",
      "system.levelBonuses.0.levels", "system.handToHand.upgrades.0.cost", "system.poolPerLevel.ppe", "system.attributeBonuses.pe.min"]) {
      assert.ok(names.has(name), `${type} renders ${name}`);
    }
    assert.equal(names.has("system.languageList.0.literacy"), type === "race");
    assert.equal(names.has("system.xpTrack.preset"), type === "occ");
  }
});

test("Legacy profile renders the advancement ledger without duplicate fields", async () => {
  const actor = fixture();
  actor.system.level = 3;
  actor.system.equippedOcc = "occ";
  actor.items.push({ id: "occ", type: "occ", name: "Mystic", system: { poolBonuses: { ppe: "1D6x10+20 + P.E." }, poolPerLevel: { ppe: "2D6" },
    skillChoices: [{ label: "Related", count: 2, level: 1, category: "occRelated" }] } });
  actor.system.advancement = { pools: [{ key: "ppe", level: 1, source: "occ", label: "Mystic P.P.E.", formula: "1D6x10+20 + P.E.", value: 52 }],
    trades: [{ sourceItemId: "occ", choiceIndex: 0, kind: "custom", label: "Psionic power", cost: 1 }] };
  const data = await new CharacterSheet(actor).getData({});
  const html = render(data);
  assertUniqueFields(html, "legacy profile");
  assert.ok(html.includes('name="system.advancement.pools.0.value"'));
  assert.ok(html.includes("Psionic power"));
  assert.ok(html.includes('data-action="roll-pending-pools" data-level="2"'));
  assert.equal(data.pendingOccSkillPickCount, 1);
  assert.equal(data.riftsDerived.pools.ppe.total, actor.system.ppe.max + 52);
});

test("printed Hand to Hand lines become a type with priced upgrades", () => {
  const parse = text => plain(LegacyPackages.parseHandToHandText(text));
  assert.deepEqual(parse("Hand to Hand: Basic; can be changed to Hand to Hand: Expert at the cost of one \"O.C.C. Related Skill,\" or Martial Arts (or Assassin, if an evil alignment) for the cost of two O.C.C. Related Skills. O.C.C. Related Skills: Select seven"), {
    type: "basic",
    upgrades: [
      { type: "expert", cost: 1, note: "" },
      { type: "martialArts", cost: 2, note: "" },
      { type: "assassin", cost: 2, note: "Evil alignments only" }
    ],
    text: "Hand to Hand: Basic; can be changed to Hand to Hand: Expert at the cost of one \"O.C.C. Related Skill,\" or Martial Arts (or Assassin, if an evil alignment) for the cost of two O.C.C. Related Skills."
  });
  assert.equal(parse("Weapons: Two of choice.\nHand to Hand: Martial Arts\nCybernetics & Bionics: None").upgrades.length, 0);
  assert.equal(LegacyPackages.parseHandToHandText("+6 to initiative"), null);
});

test("printed bonus text becomes structured bonuses, and applying it twice changes nothing", () => {
  const text = "+10% Psychology, +5% Intelligence, +1D4 on any one Mental attribute (I.Q., M.E. or M.A.), +4 to save vs Horror Factor, "
    + "+1 to save vs magic at levels three, six and nine, +1 on Perception Rolls at levels 2, 5, and 10, +2 to P.S., +3D6+10 S.D.C., +3 to save vs curses";
  const parsed = plain(LegacyPackages.parseBonusText(text));
  assert.deepEqual(parsed.skills.map(row => [row.key, row.bonus]), [["psychology", 10], ["intelligence", 5]]);
  assert.deepEqual(parsed.attributeChoices.map(row => [row.formula, Object.keys(row.options)]), [["1D4", ["iq", "me", "ma"]]]);
  assert.deepEqual(parsed.saves.map(row => [row.key, row.value]), [["horrorFactor", 4]]);
  assert.deepEqual(parsed.levelBonuses.map(row => [row.target, LegacyPackages.levelList(row.levels).join(",")]), [["save.spell", "3,6,9"], ["combat.perception", "2,5,10"]]);
  assert.deepEqual(parsed.attributes.map(row => [row.key, row.bonus]), [["ps", 2]]);
  assert.deepEqual(parsed.pools.map(row => [row.key, row.formula]), [["sdc", "3D6+10"]]);
  assert.deepEqual(parsed.unparsed, ["+3 to save vs curses"]);

  const system = structuredClone(schema.Item.race);
  system.bonuses = text;
  const first = ItemSheet._bonusPlan(system);
  assert.equal(first.chips.length, 8);
  const applied = structuredClone(system);
  for (const [path, value] of Object.entries(first.update)) {
    const parts = path.replace(/^system\./, "").split(".");
    const last = parts.pop();
    parts.reduce((obj, part) => obj[part] ??= {}, applied)[last] = value;
  }
  assert.equal(ItemSheet._bonusPlan(applied).chips.length, 0);
  assert.equal(ItemSheet._bonusSuggestion(applied), null);
});

test("older free-text race languages split into a native language and racial languages", () => {
  assert.deepEqual(plain(LegacyPackages.parseLanguageText("American, Sori (Northern Japanese dialect)")), { native: "American", others: ["Sori (Northern Japanese dialect)"] });
  assert.equal(ItemSheet._languageSuggestion({ languages: "Gobblely", nativeLanguage: "Gobblely" }), null);
});
