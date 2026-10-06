import { ErrantEarthCharacterSheet } from "../actor/character-sheet.js";
import { LegacyRules } from "../rules/legacy.js";

const TOKEN_BAR_PREFIX = "tokenBars";
const TOKEN_BAR_KEYS = ["health", "endurance", "esp", "mp", "glimmer", "hp", "sdc", "mdc", "isp", "ppe", "hunger"];

export const EE_TOKEN_BAR_OPTIONS = {
  errantEarth: {
    health: "Health",
    endurance: "Endurance",
    esp: "ESP",
    mp: "MP",
    glimmer: "Glimmer"
  },
  rifts: {
    hp: "HP",
    sdc: "SDC",
    mdc: "MDC",
    isp: "ISP",
    ppe: "PPE",
    hunger: "Hunger"
  }
};

function number(value, fallback = 0) {
  const numeric = Number(value ?? fallback);
  return Number.isFinite(numeric) ? numeric : Number(fallback ?? 0) || 0;
}

function effectiveRulesMode(actor) {
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

function defaultBarSelection(mode) {
  if (mode === "errantEarth") return { bar1: "health", bar2: "endurance" };
  return { bar1: "hp", bar2: "sdc" };
}

function sanitizeBarKey(mode, key, slot = "bar2") {
  const options = mode === "errantEarth" ? EE_TOKEN_BAR_OPTIONS.errantEarth : EE_TOKEN_BAR_OPTIONS.rifts;
  const defaults = defaultBarSelection(mode);
  if (mode === "errantEarth" && slot === "bar1") return "health";
  return Object.prototype.hasOwnProperty.call(options, key) ? key : defaults[slot];
}

function barPath(key) {
  return key ? `${TOKEN_BAR_PREFIX}.${key}` : null;
}

function barConfigFor(actor) {
  const mode = effectiveRulesMode(actor);
  const token = actor?.system?.token ?? {};
  const bar1Key = sanitizeBarKey(mode, token.bar1, "bar1");
  const bar2Key = sanitizeBarKey(mode, token.bar2, "bar2");
  return {
    mode,
    bar1Key,
    bar2Key,
    bar1: { attribute: barPath(bar1Key) },
    bar2: { attribute: barPath(bar2Key) }
  };
}

function pool(value, max) {
  return {
    value: Math.trunc(number(value, max)),
    max: Math.trunc(number(max, 0))
  };
}

export function computeTokenBars(actor) {
  const sys = actor?.system ?? {};
  const legacy = LegacyRules.derive(sys, actor?.items ?? []);
  const eeDerived = ErrantEarthCharacterSheet.eeDerivedData(sys, actor?.items?.map(item => ({
    ...item.system,
    name: item.name,
    type: item.type,
    system: item.system
  })) ?? []);
  const eePools = ErrantEarthCharacterSheet._eePoolState(sys, eeDerived);
  return {
    health: pool(eePools.health?.value, eePools.health?.max),
    endurance: pool(eePools.endurance?.value, eePools.endurance?.max),
    esp: pool(eePools.esp?.value, eePools.esp?.max),
    mp: pool(eePools.mp?.value, eePools.mp?.max),
    glimmer: pool(eePools.glimmer?.value, eePools.glimmer?.max),
    ...Object.fromEntries(legacy.poolRows.map(entry => [entry.key, pool(entry.value, entry.total)])),
    hunger: pool(sys.hunger?.value, sys.hunger?.max)
  };
}

function flattenTokenBars(bars) {
  const update = {};
  for (const key of TOKEN_BAR_KEYS) {
    update[`system.${TOKEN_BAR_PREFIX}.${key}.value`] = bars[key]?.value ?? 0;
    update[`system.${TOKEN_BAR_PREFIX}.${key}.max`] = bars[key]?.max ?? 0;
  }
  return update;
}

function tokenBarRealValuePath(attribute) {
  const key = String(attribute ?? "").replace(`${TOKEN_BAR_PREFIX}.`, "");
  const map = {
    health: "eeCombat.health.healthCurrent",
    endurance: "eeCombat.health.enduranceCurrent",
    esp: "eeCombat.resources.espCurrent",
    mp: "eeCombat.resources.mpCurrent",
    glimmer: "eeCombat.resources.glimmerCurrent",
    hp: "hp.value",
    sdc: "sdc.value",
    mdc: "mdc.value",
    isp: "isp.value",
    ppe: "ppe.value",
    hunger: "hunger.value"
  };
  return map[key] ?? null;
}

function tokenBarMax(sys, key) {
  return number(sys?.[TOKEN_BAR_PREFIX]?.[key]?.max, 0);
}

function applyTokenBarConfiguration(actor, { updateActiveTokens = false } = {}) {
  if (!actor || actor.type !== "character") return {};
  const config = barConfigFor(actor);
  const update = {
    "prototypeToken.bar1.attribute": config.bar1.attribute,
    "prototypeToken.bar2.attribute": config.bar2.attribute
  };
  if (updateActiveTokens) {
    const tokenUpdates = [];
    for (const tokenDoc of actor.getActiveTokens?.(false, true) ?? []) {
      tokenUpdates.push(tokenDoc.update({
        "bar1.attribute": config.bar1.attribute,
        "bar2.attribute": config.bar2.attribute
      }, { render: false }));
    }
    Promise.allSettled(tokenUpdates);
  }
  return update;
}

async function syncActorTokenData(actor, { updateActiveTokens = false, render = false } = {}) {
  if (!actor || actor.type !== "character") return;
  const update = {
    ...flattenTokenBars(computeTokenBars(actor)),
    ...applyTokenBarConfiguration(actor, { updateActiveTokens })
  };
  await actor.update(update, { errantEarthTokenSync: true, render });
}

function maybeSyncActorTokenData(actor, change = {}, options = {}, userId) {
  if (!actor || actor.type !== "character" || options.errantEarthTokenSync) return;
  if (userId && userId !== game.user.id) return;
  const changed = foundry.utils.flattenObject(change ?? {});
  const shouldSync = Object.keys(changed).some(path =>
    path === "system.mode"
    || path.startsWith("system.token.")
    || path.startsWith("system.ee")
    || path.startsWith("system.magic.")
    || path.startsWith("system.psychic.")
    || path.startsWith("system.equipped")
    || path.startsWith("system.skills")
    || TOKEN_BAR_KEYS.some(key => path.startsWith(`system.${key}.`))
  );
  if (!shouldSync) return;
  syncActorTokenData(actor, { updateActiveTokens: true });
}

export function tokenBarOptionsForMode(mode) {
  return mode === "errantEarth" ? EE_TOKEN_BAR_OPTIONS.errantEarth : EE_TOKEN_BAR_OPTIONS.rifts;
}

export function tokenSettingsForActor(actor) {
  const config = barConfigFor(actor);
  return {
    mode: config.mode,
    bar1: config.bar1Key,
    bar2: config.bar2Key,
    bar1Attribute: config.bar1.attribute,
    bar2Attribute: config.bar2.attribute
  };
}

export function normalizeTokenSettings(expanded) {
  const sys = expanded?.system;
  if (!sys) return expanded;
  const existingMode = sys.mode;
  const mode = existingMode === "errantEarth" ? "errantEarth" : "rifts";
  sys.token ??= {};
  sys.token.bar1 = sanitizeBarKey(mode, sys.token.bar1, "bar1");
  sys.token.bar2 = sanitizeBarKey(mode, sys.token.bar2, "bar2");
  return expanded;
}

export function registerErrantEarthTokenTools() {
  Hooks.on("modifyTokenAttribute", (data, updates, actor) => {
    if (actor?.type !== "character" || !String(data.attribute ?? "").startsWith(`${TOKEN_BAR_PREFIX}.`)) return;
    const key = data.attribute.replace(`${TOKEN_BAR_PREFIX}.`, "");
    const path = tokenBarRealValuePath(data.attribute);
    if (!path) return;
    const current = number(foundry.utils.getProperty(actor.system, data.attribute)?.value, 0);
    const max = tokenBarMax(actor.system, key);
    const next = data.isDelta ? current + number(data.value, 0) : number(data.value, current);
    delete updates[`system.${data.attribute}.value`];
    updates[`system.${path}`] = Math.clamp?.(next, 0, max) ?? Math.max(0, Math.min(max, next));
  });

  Hooks.on("createActor", actor => {
    if (!game.user.isGM || actor.type !== "character") return;
    syncActorTokenData(actor, { render: false });
  });

  Hooks.on("updateActor", maybeSyncActorTokenData);

  // Equipped packages can change maxima without an Actor update of their own.
  const syncItemParent = (item, userId) => {
    if (userId && userId !== game.user.id) return;
    if (item.parent?.type === "character" && item.parent.isOwner) {
      return syncActorTokenData(item.parent, { render: false });
    }
  };
  Hooks.on("createItem", (item, options, userId) => syncItemParent(item, userId));
  Hooks.on("updateItem", (item, change, options, userId) => syncItemParent(item, userId));
  Hooks.on("deleteItem", (item, options, userId) => syncItemParent(item, userId));

  Hooks.once("ready", async () => {
    if (!game.user.isGM) return;
    for (const actor of game.actors?.filter(actor => actor.type === "character") ?? []) {
      await syncActorTokenData(actor, { render: false });
    }
  });

}
