import { ErrantEarthCharacterSheet } from "./src/actor/character-sheet.js";
import { ErrantEarthItemSheet } from "./src/item/item-sheet.js";
import { EE } from "./src/config.js";

Hooks.once("init", async () => {
  CONFIG.Actor.types = ["character"];
  CONFIG.EE = EE;
  game.ee = EE;

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);
  Actors.registerSheet("errantearth", ErrantEarthCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Errant Earth Character Sheet"
  });


  Items.registerSheet("errantearth", ErrantEarthItemSheet, {
    types: ["psionicPower", "spell", "weapon", "armor", "powerArmor", "vehicle", "race", "occ", "gear"],
    makeDefault: true,
    label: "Errant Earth Item Sheet"
  });

  await loadTemplates({
    "ee-actor-sheet": "systems/errantearth/templates/actor/character-sheet.html",
    "ee-roll-card":   "systems/errantearth/templates/chat/roll-card.html",
    "ee-item-sheet":  "systems/errantearth/templates/item/item-sheet.html",
    "ccBonusBlocks":  "systems/errantearth/templates/item/partials/cc-bonus-blocks.html"
  });

  Handlebars.registerHelper("ee_default", (val, fallback) =>
    (val === undefined || val === null || val === "") ? fallback : val
  );
  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("or", (...args) => { args.pop(); return args.some(Boolean); });
  Handlebars.registerHelper("eeChecked", (v) => v ? "checked" : "");

  Handlebars.registerHelper("eeSelectOptions", function (options, selected) {
    const sel = selected ?? "";
    let html = `<option value=""${sel === "" ? " selected" : ""}></option>`;
    for (const [value, label] of Object.entries(options ?? {})) {
      const isSel = value === sel ? " selected" : "";
      html += `<option value="${value}"${isSel}>${label}</option>`;
    }
    return new Handlebars.SafeString(html);
  });

  Handlebars.registerHelper("eeDatalistOptions", function (values) {
    let html = "";
    for (const v of values ?? []) html += `<option value="${v}">`;
    return new Handlebars.SafeString(html);
  });
});

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  const alignMap = {
    "Principled": "principled", "Scrupulous": "scrupulous",
    "Unprincipled": "unprincipled", "Anarchist": "anarchist",
    "Miscreant": "miscreant", "Aberrant": "aberrant", "Diabolic": "diabolic"
  };
  const psiMap = { "None": "none", "Minor": "minor", "Major": "major", "Master": "master" };
  const hthMap = {
    "Basic": "basic", "Expert": "expert", "Martial Arts": "martialArts",
    "Commando": "commando", "Assassin": "assassin"
  };

  for (const actor of game.actors.contents) {
    if (actor.type !== "character") continue;
    const update = {};
    const a = actor.system.alignment;
    if (a && alignMap[a]) update["system.alignment"] = alignMap[a];
    const p = actor.system.psionicLevel;
    if (p && psiMap[p]) update["system.psionicLevel"] = psiMap[p];
    const ht = actor.system.handToHand?.type;
    if (ht && hthMap[ht]) update["system.handToHand.type"] = hthMap[ht];
    const pht = actor.system.powerArmor?.handToHand?.type;
    if (pht && hthMap[pht]) update["system.powerArmor.handToHand.type"] = hthMap[pht];

    // Clear auto-populated psionic lists (detected by first-entry sentinel).
    const psiSentinels = {
      healing:   "Bio-Regeneration (Self)",
      sensitive: "Astral Projection",
      physical:  "Alter Aura",
      super:     "Bio-Manipulation"
    };
    for (const [bucket, sentinel] of Object.entries(psiSentinels)) {
      const arr = actor.system.psionics?.[bucket];
      if (Array.isArray(arr) && arr[0]?.name === sentinel) {
        update[`system.psionics.${bucket}`] = [];
      }
    }

    if (Object.keys(update).length) await actor.update(update);
  }
});
