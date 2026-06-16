import { ErrantEarthCharacterSheet } from "./src/actor/character-sheet.js";
import { ErrantEarthItemSheet } from "./src/item/item-sheet.js";
import { ErrantEarthLegacyImporter } from "./src/importer/legacy-importer.js";
import { ErrantEarthLegacyTools } from "./src/apps/legacy-tools.js";
import { EE } from "./src/config.js";

Hooks.once("init", async () => {
  CONFIG.Actor.types = ["character"];
  CONFIG.EE = EE;
  game.ee = EE;
  game.errantearth = {
    ...(game.errantearth ?? {}),
    legacyTools: ErrantEarthLegacyTools,
    openLegacyTools: actor => ErrantEarthLegacyTools.open(actor)
  };

  game.settings.register("errantearth", "rulesMode", {
    name: "Rules Mode",
    hint: "Choose whether each character sheet can select its own rules mode, or force all sheets to use Errant Earth or EE Legacy rules.",
    scope: "world",
    config: true,
    type: String,
    default: "perSheet",
    choices: {
      perSheet: "Per-sheet toggle",
      errantEarth: "Use Errant Earth Rules",
      rifts: "Use EE Legacy Rules"
    },
    onChange: () => {
      for (const actor of game.actors ?? []) actor.sheet?.render(false);
    }
  });

  game.settings.register("errantearth", "legacyPackageEnforcement", {
    name: "EE Legacy Package Enforcement",
    hint: "Choose how strictly the sheet handles Race/RCC/OCC package conflicts.",
    scope: "world",
    config: true,
    type: String,
    default: "strict",
    choices: {
      strict: "Strict - prevent invalid package mixes",
      warn: "Warn - allow with a warning",
      relaxed: "Relaxed - allow without warnings"
    },
    onChange: () => {
      for (const actor of game.actors ?? []) actor.sheet?.render(false);
    }
  });

  game.settings.register("errantearth", "legacySkillModifierMode", {
    name: "EE Legacy Skill Roll Modifiers",
    hint: "Choose whether EE Legacy skill rolls ask for a situational modifier before rolling.",
    scope: "world",
    config: true,
    type: String,
    default: "prompt",
    choices: {
      prompt: "Prompt for a modifier",
      none: "Roll with no modifier"
    }
  });

  game.settings.register("errantearth", "legacyToolsButton", {
    name: "Show EE Legacy Tools Button",
    hint: "Adds a Legacy Tools button to the Actor Directory for quick rolls outside character sheets.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => ui.actors?.render(false)
  });

  game.settings.register("errantearth", "legacyImporterOpenSheet", {
    name: "Open EE Legacy Imports",
    hint: "New EE Legacy actor and item imports open their sheet after import by default.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register("errantearth", "legacyImporterFolder", {
    name: "EE Legacy Import Folder",
    hint: "Optional folder ID for newly imported EE Legacy records. It is used only when the folder matches the imported document type.",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);
  Actors.registerSheet("errantearth", ErrantEarthCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Errant Earth Character Sheet"
  });


  Items.registerSheet("errantearth", ErrantEarthItemSheet, {
    types: ["psionicPower", "spell", "ability", "weapon", "armor", "powerArmor", "vehicle", "race", "occ", "gear"],
    makeDefault: true,
    label: "Errant Earth Item Sheet"
  });

  await loadTemplates({
    "ee-actor-sheet": "systems/errantearth/templates/actor/character-sheet.html",
    "ee-roll-card":   "systems/errantearth/templates/chat/roll-card.html",
    "ee-item-sheet":  "systems/errantearth/templates/item/item-sheet.html",
    "ee-legacy-tools": "systems/errantearth/templates/apps/legacy-tools.html",
    "ccBonusBlocks":  "systems/errantearth/templates/item/partials/cc-bonus-blocks.html"
  });

  Handlebars.registerHelper("ee_default", (val, fallback) =>
    (val === undefined || val === null || val === "") ? fallback : val
  );
  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("or", (...args) => { args.pop(); return args.some(Boolean); });
  Handlebars.registerHelper("eeChecked", (v) => v ? "checked" : "");

  Handlebars.registerHelper("eeSelectOptions", function (options, selected, includeBlank = true) {
    const sel = selected ?? "";
    const shouldIncludeBlank = typeof includeBlank === "object" ? true : includeBlank !== false;
    let html = shouldIncludeBlank ? `<option value=""${sel === "" ? " selected" : ""}></option>` : "";
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

  ErrantEarthLegacyImporter.registerHooks();
  ErrantEarthLegacyTools.registerHooks();
});

Hooks.once("ready", async () => {
  if (!game.user.isGM) return;
  const alignMap = {
    "Principled": "principled", "Scrupulous": "scrupulous",
    "Taoist": "taoist", "Unprincipled": "unprincipled", "Anarchist": "anarchist",
    "Miscreant": "miscreant", "Aberrant": "aberrant", "Diabolic": "diabolic"
  };
  const psiMap = { "None": "none", "Minor": "minor", "Major": "major", "Master": "master" };
  const hthMap = {
    "None": "none", "No Hand to Hand Combat Skill": "none",
    "Basic": "basic", "Expert": "expert", "Martial Arts": "martialArts",
    "Commando": "commando", "Assassin": "assassin",
    "Aikido": "aikido", "Judo": "judo", "Jujitsu": "jujitsu", "Karate": "karate",
    "Kendo": "kendo", "Ninjitsu": "ninjitsu", "Samurai": "samurai", "Teng-Jutsu": "tengJutsu",
    "Drunken Style Kung Fu": "drunkenStyleKungFu", "Cyber-Knight Zen Combat": "cyberKnightZen", "Dragon": "dragon"
  };
  const paHthMap = {
    "None": "none",
    "Basic": "robotCombatBasic",
    "basic": "robotCombatBasic",
    "Robot Combat: Basic": "robotCombatBasic",
    "RPA Combat: Basic": "robotCombatBasic",
    "rpaBasic": "robotCombatBasic",
    "Power Armor Combat Elite: Flying Power Armor": "rpaFlyingPowerArmor",
    "RPA Combat: Flying Power Armor": "rpaFlyingPowerArmor",
    "rpaFlyingPowerArmor": "rpaFlyingPowerArmor",
    "Power Armor Combat Elite: Ground-Based Power Armor": "rpaGroundBasedPowerArmor",
    "RPA Combat: Ground-Based Power Armor": "rpaGroundBasedPowerArmor",
    "rpaGroundBasedPowerArmor": "rpaGroundBasedPowerArmor",
    "Robot Combat Elite: Heavy Vehicular Robots": "rpaHeavyVehicularRobots",
    "RPA Combat: Heavy Vehicular Style Robots": "rpaHeavyVehicularRobots",
    "rpaHeavyVehicularStyleRobots": "rpaHeavyVehicularRobots",
    "Robot Combat Elite: Heavy Ground Robots": "rpaHeavyGroundRobots",
    "RPA Combat: Heavy Ground Robots": "rpaHeavyGroundRobots",
    "rpaHeavyGroundRobots": "rpaHeavyGroundRobots",
    "Robot Combat Elite: Light Ground Robots": "rpaLightGroundRobots",
    "RPA Combat: Light Ground Robots": "rpaLightGroundRobots",
    "rpaLightGroundRobots": "rpaLightGroundRobots"
  };

  for (const actor of game.actors.contents) {
    if (actor.type !== "character") continue;
    const update = {};
    const a = actor.system.alignment;
    if (a && alignMap[a]) update["system.alignment"] = alignMap[a];
    const p = actor.system.psionicLevel;
    if (p && psiMap[p]) update["system.psionicLevel"] = psiMap[p];
    const ht = actor.system.handToHand?.type;
    if ((ht === "" || ht == null) && actor.system.handToHand) update["system.handToHand.type"] = "none";
    else if (ht && hthMap[ht]) update["system.handToHand.type"] = hthMap[ht];
    else if (ht && !Object.prototype.hasOwnProperty.call(EE.HTH_TYPES, ht)) update["system.handToHand.type"] = "none";
    const pht = actor.system.powerArmor?.handToHand?.type;
    if ((pht === "" || pht == null) && actor.system.powerArmor?.handToHand) update["system.powerArmor.handToHand.type"] = "none";
    else if (pht && paHthMap[pht]) update["system.powerArmor.handToHand.type"] = paHthMap[pht];
    else if (pht && !Object.prototype.hasOwnProperty.call(EE.POWER_ARMOR_HTH_TYPES, pht)) update["system.powerArmor.handToHand.type"] = "none";

    const pa = actor.system.powerArmor ?? {};
    const vehicle = actor.system.vehicle ?? {};
    const hasValue = value => {
      if (Array.isArray(value)) return value.length > 0;
      if (!value || typeof value !== "object") return value !== "" && value !== "none" && value !== 0 && value !== null && value !== undefined;
      return Object.values(value).some(hasValue);
    };
    const paHth = pa.handToHand ?? {};
    const hasPaHthData = Object.entries(paHth).some(([key, value]) => key !== "type" && hasValue(value));
    const hasSelectedPaHth = pht && !["", "none", "basic"].includes(pht);
    const hasPaData = hasValue(pa.name) || hasPaHthData || hasSelectedPaHth || hasValue(pa.armor) || hasValue(pa.weapons);
    if (hasPaData) {
      if (!hasValue(vehicle.name) && hasValue(pa.name)) update["system.vehicle.name"] = pa.name;
      if (!hasValue(vehicle.type)) update["system.vehicle.type"] = "powerArmor";
      const migratedType = paHthMap[pht] ?? (Object.prototype.hasOwnProperty.call(EE.POWER_ARMOR_HTH_TYPES, pht) ? pht : "none");
      if (!hasValue(vehicle.handToHand?.type) || vehicle.handToHand?.type === "none") update["system.vehicle.handToHand.type"] = migratedType;
      const vehHth = vehicle.handToHand ?? {};
      const hthKeys = ["attacks", "initiative", "damage", "strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll", "critical", "knockout"];
      for (const key of hthKeys) {
        const source = key === "pullPunch" ? (paHth.pullPunch ?? paHth.pullRoll) : key === "roll" ? (paHth.roll ?? paHth.pullRoll) : paHth[key];
        if (!hasValue(vehHth[key]) && hasValue(source)) update[`system.vehicle.handToHand.${key}`] = source;
      }
      if (!hasValue(vehHth.extras) && hasValue(paHth.extras)) update["system.vehicle.handToHand.extras"] = paHth.extras;
      const paArmor = pa.armor ?? {};
      const vehArmor = vehicle.armor ?? {};
      for (const key of ["mainBody", "head", "leftArm", "rightArm", "leftLeg", "rightLeg", "extras"]) {
        if (!hasValue(vehArmor[key]) && hasValue(paArmor[key])) update[`system.vehicle.armor.${key}`] = paArmor[key];
      }
      if (!hasValue(vehicle.weapons) && hasValue(pa.weapons)) {
        update["system.vehicle.weapons"] = (pa.weapons ?? []).map(w => ({
          name: w.name ?? w.type ?? "",
          damageType: w.damageType ?? "",
          damage: w.damage ?? "",
          damageScale: w.damageScale ?? "S",
          ammo: w.ammo ?? "",
          payload: w.payload ?? "",
          strike: w.strike ?? "",
          range: w.range ?? "",
          rate: w.rate ?? "",
          special: w.special ?? ""
        }));
      }
    }

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
