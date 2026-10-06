import { LegacyRules } from "../rules/legacy.js";
import { ErrantEarthCharacterSheet } from "../actor/character-sheet.js";

const WEAPON_SOURCE_LABELS = {
  modern: "Modern Weapon",
  ancient: "Ancient Weapon",
  unarmed: "Unarmed",
  item: "Weapon"
};

function toArray(value) {
  return ErrantEarthCharacterSheet._toArray(value);
}

function coerceBoolean(value) {
  return ErrantEarthCharacterSheet._coerceBoolean(value);
}

function number(value, fallback = 0) {
  const numeric = Number(value ?? fallback);
  return Number.isFinite(numeric) ? numeric : Number(fallback ?? 0) || 0;
}

function signed(value) {
  const n = number(value, 0);
  if (!n) return "";
  return `${n >= 0 ? "+" : "-"}${Math.abs(n)}`;
}

function signedFormula(base, bonus) {
  const n = number(bonus, 0);
  if (!n) return base;
  return `${base}${n >= 0 ? "+" : ""}${n}`;
}

export function effectiveRulesMode(actor) {
  const setting = (() => {
    try {
      return game.settings.get("errantearth", "rulesMode") ?? "perSheet";
    } catch (_err) {
      return "perSheet";
    }
  })();
  if (setting === "errantEarth" || setting === "rifts") return setting;
  return actor?.system?.mode === "errantEarth" ? "errantEarth" : "rifts";
}

export function legacyDerived(actor) {
  const derived = LegacyRules.derive(actor.system ?? {}, actor.items ?? []);
  return {
    effectiveAttrs: derived.effectiveAttrs,
    wpSelected: { ...(actor.system?.weaponProficiencies?.selected ?? {}), ...(derived.sourceTotals.weaponProficiencies?.selected ?? {}) },
    handToHand: Object.fromEntries(Object.entries(derived.handToHand)
      .filter(([, entry]) => entry && typeof entry === "object" && "total" in entry)
      .map(([key, entry]) => [key, entry.total]))
  };
}

function weaponImage(source, item = null) {
  if (item?.img && item.img !== "icons/svg/item-bag.svg") return item.img;
  if (source === "modern") return "icons/weapons/guns/gun-pistol-flintlock.webp";
  if (source === "ancient") return "icons/weapons/swords/sword-broad-serrated-blue.webp";
  if (source === "unarmed") return "icons/skills/melee/unarmed-punch-fist.webp";
  return "icons/weapons/swords/sword-broad-serrated-blue.webp";
}

function isRangedWeapon(source, row) {
  if (source === "modern") return true;
  if (source === "unarmed") return false;
  const range = String(row?.range ?? "").trim();
  const ammo = String(row?.ammo ?? "").trim();
  const payload = String(row?.payload ?? "").trim();
  const rate = String(row?.rate ?? "").trim();
  return !!(range || ammo || payload || rate);
}

function weaponRecord(actor, source, key, row, { item = null, mode = "rifts" } = {}) {
  const ranged = isRangedWeapon(source, row);
  const strike = number(row?.effectiveStrike ?? row?.strike, 0);
  const damage = String(row?.effectiveDamage ?? row?.damage ?? "").trim();
  const scale = String(row?.damageScale ?? "S").trim() || "S";
  const name = String(row?.name || item?.name || WEAPON_SOURCE_LABELS[source] || "Weapon").trim();
  return {
    actor,
    source,
    key: String(key),
    id: `${source}:${key}`,
    name,
    fullName: name,
    sourceLabel: WEAPON_SOURCE_LABELS[source] ?? "Weapon",
    img: weaponImage(source, item),
    isRanged: ranged,
    rangeLabel: ranged ? "Ranged Strike" : "Melee Strike",
    defaultTn: ranged ? 8 : 5,
    strike,
    damage,
    damageScale: scale,
    actions: row?.actions ?? "",
    special: row?.special ?? item?.system?.description ?? "",
    mode
  };
}

function itemSystemData(item) {
  const system = item?.system ?? {};
  if (typeof system.toObject === "function") return system.toObject();
  return foundry.utils.deepClone(system);
}

export function collectWeaponRolls(actor, { quickOnly = true } = {}) {
  if (!actor || actor.type !== "character") return [];
  const mode = effectiveRulesMode(actor);
  const isEE = mode === "errantEarth";
  const derived = isEE ? null : legacyDerived(actor);
  const sys = actor.system ?? {};
  const level = number(sys.level, 1);
  const records = [];

  const decorate = (source, rows) => rows.map((row, index) => {
    if (isEE) return { ...row, _index: index, effectiveStrike: number(row?.strike), effectiveDamage: row?.damage ?? "" };
    if (source === "unarmed") {
      return ErrantEarthCharacterSheet._decorateUnarmedStrikeRow(row, index, {
        strike: { total: derived.handToHand.strike },
        parry: { total: derived.handToHand.parry },
        damage: { total: derived.handToHand.damage }
      });
    }
    return ErrantEarthCharacterSheet._decorateLegacyWeaponRow(row, index, level, derived.effectiveAttrs, derived.wpSelected);
  });

  const unarmedBase = Object.prototype.hasOwnProperty.call(sys.weapons ?? {}, "unarmed")
    ? sys.weapons?.unarmed
    : ErrantEarthCharacterSheet._defaultUnarmedStrikeRows();
  const groups = {
    modern: decorate("modern", toArray(sys.weapons?.modern)),
    ancient: decorate("ancient", toArray(sys.weapons?.ancient)),
    unarmed: decorate("unarmed", toArray(unarmedBase))
  };

  for (const [source, rows] of Object.entries(groups)) {
    for (const row of rows) {
      if (quickOnly && !coerceBoolean(row?.quickRoll)) continue;
      records.push(weaponRecord(actor, source, row._index, row, { mode }));
    }
  }

  for (const item of actor.items.filter(item => item.type === "weapon")) {
    if (quickOnly && !coerceBoolean(item.system?.quickRoll)) continue;
    const raw = { ...itemSystemData(item), name: item.name };
    const row = isEE
      ? { ...raw, effectiveStrike: number(raw.strike), effectiveDamage: raw.damage ?? "" }
      : ErrantEarthCharacterSheet._decorateLegacyWeaponRow(raw, 0, level, derived.effectiveAttrs, derived.wpSelected);
    records.push(weaponRecord(actor, "item", item.id, row, { item, mode }));
  }

  return records;
}

export function collectCombatRolls(actor) {
  if (!actor || actor.type !== "character") return [];
  const mode = effectiveRulesMode(actor);
  if (mode === "errantEarth") {
    const eeDerived = ErrantEarthCharacterSheet.eeDerivedData(actor.system);
    return [
      { id: "ee-initiative", name: "Initiative", rollType: "eeInitiative", bonus: eeDerived.combat?.initiative?.total ?? 0, img: "icons/svg/d20.svg" },
      { id: "ee-nsr", name: "NSR", rollType: "eeDefense", target: eeDerived.defense?.nsr?.total ?? 0, img: "icons/svg/shield.svg" }
    ];
  }

  const hth = legacyDerived(actor).handToHand;
  return [
    { id: "initiative", name: "Initiative", rollType: "d20", bonus: hth.initiative, img: "icons/svg/d20.svg" },
    { id: "parry", name: "Parry", rollType: "d20", bonus: hth.parry, img: "icons/svg/shield.svg" },
    { id: "dodge", name: "Dodge", rollType: "d20", bonus: hth.dodge, img: "icons/svg/aura.svg" },
    { id: "roll-impact", name: "Roll with Impact", rollType: "d20", bonus: hth.roll, img: "icons/svg/upgrade.svg" },
    { id: "pull-punch", name: "Pull Punch", rollType: "save", bonus: hth.pullPunch, base: 11, img: "icons/skills/melee/unarmed-punch-fist.webp" },
    { id: "entangle", name: "Entangle", rollType: "d20", bonus: hth.entangle, img: "icons/svg/net.svg" }
  ];
}

export function collectTokenHudActions(actor) {
  return {
    weapons: collectWeaponRolls(actor, { quickOnly: true }),
    combat: collectCombatRolls(actor)
  };
}

export function findWeaponRoll(actor, source, key) {
  return collectWeaponRolls(actor, { quickOnly: false }).find(weapon => weapon.source === source && weapon.key === String(key)) ?? null;
}

function rollDiceValues(roll) {
  return roll.dice.flatMap(d => d.results.map(r => ({
    value: r.result,
    cls: [
      d.faces === r.result ? "ee-die-max" : "",
      r.result === 1 ? "ee-die-min" : ""
    ].filter(Boolean).join(" ")
  })));
}

function promptWeaponRoll(weapon) {
  const escapedName = ErrantEarthCharacterSheet._escapeHtml(weapon.name);
  const rangedOptions = weapon.isRanged ? `
    <label>
      Circumstance
      <select name="circumstance">
        <option value="0">Standard</option>
        <option value="2">Aimed Shot (+2, 2 attacks)</option>
        <option value="0">Called Shot (2 attacks)</option>
        <option value="2">Aimed Called Shot (+2, 3 attacks)</option>
        <option value="-6">Shooting Wild (-6)</option>
        <option value="-10">Shooting Blind (-10)</option>
        <option value="-5">Beyond Normal Range (-5)</option>
      </select>
    </label>` : "";
  return new Promise(resolve => {
    let settled = false;
    const finish = (html, mode) => {
      if (settled) return;
      settled = true;
      const form = html?.[0]?.querySelector("form") ?? html?.querySelector?.("form");
      const value = name => form?.elements?.[name]?.value ?? "";
      resolve({
        mode,
        tn: Math.max(1, number(value("tn"), weapon.defaultTn)),
        armorRating: value("armorRating") === "" ? null : number(value("armorRating"), null),
        circumstance: number(value("circumstance"), 0),
        modifier: number(value("modifier"), 0)
      });
    };
    new Dialog({
      title: `${weapon.name}: Roll`,
      content: `
        <form class="ee-weapon-roll-dialog">
          <p class="hint">${escapedName} uses a default strike TN of ${weapon.defaultTn}+ (${weapon.isRanged ? "ranged" : "melee"}).</p>
          <div class="form-group">
            <label>Target Number</label>
            <input type="number" name="tn" value="${weapon.defaultTn}" min="1" step="1" />
          </div>
          <div class="form-group">
            <label>Situational Modifier</label>
            <input type="number" name="modifier" value="0" step="1" />
          </div>
          ${rangedOptions ? `<div class="form-group">${rangedOptions}</div>` : ""}
          <div class="form-group">
            <label>Armor Rating</label>
            <input type="number" name="armorRating" value="" min="1" step="1" placeholder="Optional" />
          </div>
        </form>`,
      buttons: {
        both: { label: "Attack + Damage", callback: html => finish(html, "both") },
        attack: { label: "Attack Only", callback: html => finish(html, "attack") },
        damage: { label: "Damage Only", callback: html => finish(html, "damage") },
        cancel: {
          label: "Cancel",
          callback: () => {
            settled = true;
            resolve(null);
          }
        }
      },
      default: "both",
      close: () => {
        if (!settled) resolve(null);
      }
    }, { classes: ["errantearth", "dialog", "ee-weapon-roll-dialog"], width: 420 }).render(true);
  });
}

export async function rollWeaponAction(actor, source, key) {
  const weapon = findWeaponRoll(actor, source, key);
  if (!weapon) return ui.notifications?.warn("Weapon roll not found.");
  const choice = await promptWeaponRoll(weapon);
  if (!choice) return;

  const rollAttack = choice.mode === "both" || choice.mode === "attack";
  const rollDamage = choice.mode === "both" || choice.mode === "damage";
  const damageFormula = rollDamage ? ErrantEarthCharacterSheet._rollFormula(weapon.damage) : "";
  if (rollDamage && !damageFormula) return ui.notifications?.warn(`${weapon.name}: no valid damage formula set.`);

  const rolls = [];
  let attack = null;
  let damage = null;
  let outcome = "";
  let outcomeClass = "";
  let armorOutcome = "";

  if (rollAttack) {
    const totalBonus = number(weapon.strike, 0) + number(choice.circumstance, 0) + number(choice.modifier, 0);
    const attackRoll = await new Roll(signedFormula("1d20", totalBonus)).evaluate();
    rolls.push(attackRoll);
    const natural = attackRoll.dice?.[0]?.results?.[0]?.result ?? attackRoll.total;
    const critical = natural === 20;
    const autoMiss = natural === 1;
    const hit = critical || (!autoMiss && attackRoll.total >= choice.tn);
    outcome = critical ? "Critical Hit" : hit ? "Hit" : "Miss";
    outcomeClass = hit ? "success" : "failure";
    if (hit && choice.armorRating !== null && !critical) {
      armorOutcome = attackRoll.total > choice.armorRating
        ? `Penetrates AR ${choice.armorRating}`
        : `Hits armor only (AR ${choice.armorRating})`;
    }
    attack = {
      formula: attackRoll.formula,
      total: attackRoll.total,
      natural,
      tn: choice.tn,
      strike: weapon.strike,
      circumstance: choice.circumstance,
      modifier: choice.modifier,
      hit,
      critical,
      outcome,
      outcomeClass,
      armorOutcome,
      dice: rollDiceValues(attackRoll)
    };
  }

  if (rollDamage) {
    const damageRoll = await new Roll(damageFormula).evaluate();
    rolls.push(damageRoll);
    damage = {
      formula: damageRoll.formula,
      total: damageRoll.total,
      criticalTotal: attack?.critical ? damageRoll.total * 2 : null,
      scale: weapon.damageScale,
      dice: rollDiceValues(damageRoll)
    };
  }

  const card = {
    actorName: actor.name,
    actorImg: actor.img,
    weaponName: weapon.name,
    weaponImg: weapon.img,
    sourceLabel: weapon.sourceLabel,
    rangeLabel: weapon.isRanged ? "Ranged Strike" : "Melee Strike",
    actionMode: choice.mode,
    attack,
    damage,
    outcome,
    outcomeClass,
    notes: [
      attack?.critical ? "Natural 20: critical hit, double damage before final application." : "",
      attack && !attack.critical && attack.natural <= 4 ? "A total below the strike TN misses; natural 1 always misses." : "",
      armorOutcome
    ].filter(Boolean),
    special: weapon.special
  };

  const content = await renderTemplate("systems/errantearth/templates/chat/weapon-roll-card.html", card);
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    rolls,
    sound: CONFIG.sounds.dice,
    rollMode: game.settings.get("core", "rollMode")
  });
}

export async function rollDatasetAction(actor, dataset) {
  const shim = {
    actor,
    _isErrantEarthMode: () => effectiveRulesMode(actor) === "errantEarth"
  };
  await ErrantEarthCharacterSheet.prototype._onRoll.call(shim, {
    preventDefault() {},
    currentTarget: { dataset }
  });
}

export async function rollCombatAction(actor, actionId) {
  const action = collectCombatRolls(actor).find(action => action.id === actionId);
  if (!action) return ui.notifications?.warn("Combat roll not found.");
  const dataset = {
    action: "roll",
    rollType: action.rollType,
    label: action.name,
    bonus: String(action.bonus ?? 0),
    target: String(action.target ?? ""),
    base: String(action.base ?? "")
  };
  return rollDatasetAction(actor, dataset);
}
