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
  console, structuredClone, CONFIG: {}, ActorSheet: SheetStub, ItemSheet: SheetStub,
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
  sheet._promptOccSkillChoices = async () => [];
  sheet._promptCcWpChoices = async () => ({});
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
for (const tab of ["derived", "skills", "combat", "powers", "vehicle", "items", "misc"]) H.registerPartial(`eeActor${tab[0].toUpperCase()}${tab.slice(1)}`, read(`templates/actor/partials/${tab}.html`));
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
