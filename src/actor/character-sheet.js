import { LegacyRules } from "../rules/legacy.js";

/**
 * Errant Earth Character Sheet
 */
export class ErrantEarthCharacterSheet extends ActorSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["errantearth", "sheet", "actor", "character"],
      template: "systems/errantearth/templates/actor/character-sheet.html",
      width: 980,
      height: 820,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }],
      scrollY: [".tab"],
      dragDrop: [{ dragSelector: ".ee-item-row", dropSelector: null }]
    });
  }

  // Compatibility aliases for existing macros and sheet callers. Rules live in LegacyRules.
  static _ATTR_TABLES = LegacyRules._ATTR_TABLES;
  static _lookup = LegacyRules._lookup;
  static iqSkillBonus = LegacyRules.iqSkillBonus;
  static psionicSave = LegacyRules.psionicSave;
  static insanitySave = LegacyRules.insanitySave;
  static trustIntimidate = LegacyRules.trustIntimidate;
  static psDamage = LegacyRules.psDamage;
  static ppParryDodge = LegacyRules.ppParryDodge;
  static ppStrike = LegacyRules.ppStrike;
  static ppInitiative = LegacyRules.ppInitiative;
  static peComaSave = LegacyRules.peComaSave;
  static peMagicPoison = LegacyRules.peMagicPoison;
  static charmImpress = LegacyRules.charmImpress;
  static mePossession = LegacyRules.mePossession;
  static _formatRiftsNumber = LegacyRules._formatRiftsNumber;
  static _legacyPhysicalStats = LegacyRules._legacyPhysicalStats;
  static _legacyLowAttributePenalties = LegacyRules._legacyLowAttributePenalties;
  static _legacyAttributeEffects = LegacyRules._legacyAttributeEffects;
  static _countLegacyWpLevels = LegacyRules._countLegacyWpLevels;
  static _legacyWpRule = LegacyRules._legacyWpRule;
  static _legacyWpBonus = LegacyRules._legacyWpBonus;
  static _legacyWpEntrySummary = LegacyRules._legacyWpEntrySummary;
  static _legacyWpOptions = LegacyRules._legacyWpOptions;
  static _decorateLegacyWeaponRow = LegacyRules._decorateLegacyWeaponRow;
  static _appendDamageBonus = LegacyRules._appendDamageBonus;
  static _legacyCombatReferences = LegacyRules._legacyCombatReferences;
  static _decorateUnarmedStrikeRow = LegacyRules._decorateUnarmedStrikeRow;
  static _defaultUnarmedStrikeRows = LegacyRules._defaultUnarmedStrikeRows;
  static _parseFlatBonus = LegacyRules._parseFlatBonus;
  static _normalizeRiftsAttributeRoll = LegacyRules._normalizeRiftsAttributeRoll;
  static _riftsAttributeBonusParts = LegacyRules._riftsAttributeBonusParts;
  static _legacySkillDefinition = LegacyRules._legacySkillDefinition;
  static _legacySkillStatBonuses = LegacyRules._legacySkillStatBonuses;
  static _legacySkillStatEntries = LegacyRules._legacySkillStatEntries;
  static _buildLegacySkillStatSources = LegacyRules._buildLegacySkillStatSources;
  static _formatSigned = LegacyRules._formatSigned;
  static _blankRiftsSourceTotals = LegacyRules._blankRiftsSourceTotals;
  static _addRiftsSourceTotal = LegacyRules._addRiftsSourceTotal;
  static _addRiftsSkillBonus = LegacyRules._addRiftsSkillBonus;
  static _riftsSkillSourceBonus = LegacyRules._riftsSkillSourceBonus;
  static _parseRiftsTextBonuses = LegacyRules._parseRiftsTextBonuses;
  static _buildRiftsSources = LegacyRules._buildRiftsSources;
  static _toArray = LegacyRules._toArray;
  static _legacyXpTrack = LegacyRules._legacyXpTrack;
  static _legacyXpProgress = LegacyRules._legacyXpProgress;
  static _parseIntSafe = LegacyRules._parseIntSafe;
  static _coerceBoolean = LegacyRules._coerceBoolean;

  /** Errant Earth derived-value bands from the core rules source of truth. */
  static _EE_STRENGTH_TABLE = [
    { min: 0,  max: 3,        sdBonus: -3, mdCapable: false, meleeToHit: -4 },
    { min: 4,  max: 6,        sdBonus: -2, mdCapable: false, meleeToHit: -2 },
    { min: 7,  max: 9,        sdBonus: -1, mdCapable: false, meleeToHit: 0 },
    { min: 10, max: 12,       sdBonus: 0,  mdCapable: false, meleeToHit: 1 },
    { min: 13, max: 15,       sdBonus: 2,  mdCapable: false, meleeToHit: 2 },
    { min: 16, max: 18,       sdBonus: 4,  mdCapable: false, meleeToHit: 3 },
    { min: 19, max: 21,       sdBonus: 6,  mdCapable: true,  meleeToHit: 4 },
    { min: 22, max: 24,       sdBonus: 8,  mdCapable: true,  meleeToHit: 5 },
    { min: 25, max: Infinity, sdBonus: 10, mdCapable: true,  meleeToHit: 6 }
  ];

  static _EE_DEMEANOR_TABLE = [
    { min: 0,  max: 3,        bonus: -6, contacts: 1, attitude: "Repulsed, Horrified, Hated" },
    { min: 4,  max: 6,        bonus: -3, contacts: 1, attitude: "Disgusted, Distanced, Pained" },
    { min: 7,  max: 9,        bonus: 0,  contacts: 2, attitude: "Plain, Neutral, Uninterested" },
    { min: 10, max: 12,       bonus: 1,  contacts: 3, attitude: "Interested, Understood" },
    { min: 13, max: 15,       bonus: 2,  contacts: 4, attitude: "Friendly, Kind, Welcoming" },
    { min: 16, max: 18,       bonus: 3,  contacts: 5, attitude: "Charismatic, Magnetic" },
    { min: 19, max: 21,       bonus: 4,  contacts: 6, attitude: "Contagious, Empathetic" },
    { min: 22, max: 24,       bonus: 5,  contacts: 7, attitude: "Lovely, Enrapturing" },
    { min: 25, max: Infinity, bonus: 6,  contacts: 8, attitude: "Divine, Uncomfortable" }
  ];

  static _EE_REACTION_TABLE = [
    { min: 0,  max: 3,        initiativeBonus: -6, pace: 0.25 },
    { min: 4,  max: 6,        initiativeBonus: -3, pace: 0.5 },
    { min: 7,  max: 9,        initiativeBonus: 0,  pace: 1 },
    { min: 10, max: 12,       initiativeBonus: 1,  pace: 2 },
    { min: 13, max: 15,       initiativeBonus: 2,  pace: 2 },
    { min: 16, max: 18,       initiativeBonus: 4,  pace: 3 },
    { min: 19, max: 21,       initiativeBonus: 6,  pace: 3 },
    { min: 22, max: 24,       initiativeBonus: 8,  pace: 4 },
    { min: 25, max: Infinity, initiativeBonus: 10, pace: 5 }
  ];

  static _EE_GLIMMER_TABLE = [
    { min: 0,  max: 0,        bonus: -10, percent: -100, description: "None / Flickering" },
    { min: 1,  max: 2,        bonus: 0,   percent: 0,    description: "Throbbing" },
    { min: 3,  max: 4,        bonus: 1,   percent: 10,   description: "Faint / Subdued" },
    { min: 5,  max: 5,        bonus: 2,   percent: 20,   description: "Dim / Vibrant" },
    { min: 6,  max: 6,        bonus: 3,   percent: 30,   description: "Glowing / Present" },
    { min: 7,  max: 7,        bonus: 4,   percent: 40,   description: "Fiery / Imposing" },
    { min: 8,  max: 8,        bonus: 5,   percent: 50,   description: "Luminous / Resonant" },
    { min: 9,  max: 9,        bonus: 6,   percent: 60,   description: "Bonfire / Majestic" },
    { min: 10, max: Infinity, bonus: 7,   percent: 70,   description: "Inferno / Raging" }
  ];

  static _EE_ATB_TABLE = [
    { min: 0,  max: 6,        bonus: 0 },
    { min: 7,  max: 12,       bonus: 1 },
    { min: 13, max: 18,       bonus: 2 },
    { min: 19, max: 24,       bonus: 3 },
    { min: 25, max: Infinity, bonus: 5 }
  ];

  static _EE_SIZE_CATEGORIES = ["Tiny", "Small", "Average", "Big", "Huge", "Massive"];

  static _EE_NSR_BY_SIZE = { tiny: 6, small: 5, average: 4, big: 3, huge: 2, massive: 1 };

  static _EE_TIER_MODS = {
    Mortal:       { actions: 1, momentum: 0, reactions: 0, health: 0, endurance: 0, damageScale: "S" },
    Augmented:    { actions: 1, momentum: 1, reactions: 1, health: 2, endurance: 5, damageScale: "S" },
    Mechanical:   { actions: 2, momentum: 1, reactions: 1, health: 4, endurance: 10, damageScale: "M" },
    Supernatural: { actions: 2, momentum: 2, reactions: 2, health: 6, endurance: 15, damageScale: "M" },
    Exalted:      { actions: 3, momentum: 3, reactions: 3, health: 8, endurance: 20, damageScale: "G" },
    Divine:       { actions: 4, momentum: 4, reactions: 4, health: 10, endurance: 25, damageScale: "U" }
  };

  static _eeCanonicalSize(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    return ErrantEarthCharacterSheet._EE_SIZE_CATEGORIES.find(size => size.toLowerCase() === lower) ?? null;
  }

  static _eeBand(table, value) {
    const numeric = Number(value ?? 0);
    return table.find(row => numeric >= row.min && numeric <= row.max) ?? table[0];
  }

  static _eeAvg(...values) {
    const nums = values.map(v => Number(v ?? 0));
    return Math.ceil(nums.reduce((sum, v) => sum + v, 0) / Math.max(1, nums.length));
  }

  /** Aggregate the Drifter's worn armor per the Errant Earth rules:
   *  Durability/Maneuverability/SR/Formality/Resistances all add together,
   *  while Armor Rating takes the BEST base and adds every AR bonus on top.
   *  Only pieces flagged `equipped` are counted. */
  static _eeAggregateArmor(pieces) {
    const equipped = ErrantEarthCharacterSheet._toArray(pieces)
      .map((p, i) => ({ ...p, _index: i }))
      .filter(p => p && ErrantEarthCharacterSheet._coerceBoolean(p.equipped));
    const num = (p, path) => Number(path.split(".").reduce((o, k) => (o ? o[k] : undefined), p)) || 0;
    const sum = path => equipped.reduce((t, p) => t + num(p, path), 0);
    const best = path => equipped.reduce((m, p) => Math.max(m, num(p, path)), 0);
    const bestBase = best("ar.base");
    const bonus = sum("ar.bonus");
    return {
      count: equipped.length,
      durability: { value: sum("durability.value"), max: sum("durability.max") },
      ar: { best: bestBase, bonus, total: bestBase + bonus },
      maneuver: { flat: sum("maneuver.flat"), percent: sum("maneuver.percent") },
      sr: sum("sr"),
      formality: sum("formality"),
      resist: {
        heat: sum("resist.heat"),
        cold: sum("resist.cold"),
        radiation: sum("resist.radiation"),
        earthblood: sum("resist.earthblood")
      }
    };
  }

  static _eeAdjustable(base, path, bonus = 0) {
    const stored = path && typeof path === "object" ? path : {};
    const manualBonus = Number(stored.bonus ?? 0);
    const sourceBonus = Number(bonus ?? 0);
    const override = stored.override === "" || stored.override === null || stored.override === undefined ? null : Number(stored.override);
    const total = Number.isFinite(override) ? override : Number(base ?? 0) + sourceBonus + manualBonus;
    return {
      base: Number(base ?? 0),
      sourceBonus,
      manualBonus,
      bonus: sourceBonus + manualBonus,
      override: Number.isFinite(override) ? override : null,
      total
    };
  }

  static _eeCurrentValue(value, fallback = 0) {
    if (value === "" || value === null || value === undefined) return Number(fallback ?? 0) || 0;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : Number(fallback ?? 0) || 0;
  }

  static _eePoolState(sys = {}, eeDerived = {}) {
    const health = sys.eeCombat?.health ?? {};
    const resources = sys.eeCombat?.resources ?? {};
    const current = ErrantEarthCharacterSheet._eeCurrentValue;
    const legacyNonZero = value => {
      if (value === "" || value === null || value === undefined) return undefined;
      const numeric = Number(value);
      return Number.isFinite(numeric) && numeric !== 0 ? numeric : undefined;
    };
    const pool = (value, maxValue) => {
      const max = current(maxValue, 0);
      return { value: current(value, max), max };
    };
    const heatPool = (value, rawMax) => {
      const max = current(rawMax, value);
      return { value, max: max === 0 && value !== 0 ? value : max };
    };
    const magicHeat = current(sys.magic?.heat, 0);
    const psychicHeat = current(sys.psychic?.heat, 0);

    return {
      endurance: pool(health.enduranceCurrent ?? legacyNonZero(health.endurance), eeDerived.health?.endurance?.total),
      health: pool(health.healthCurrent ?? legacyNonZero(health.health), eeDerived.health?.health?.total),
      esp: pool(resources.espCurrent, eeDerived.resources?.esp?.total),
      mp: pool(resources.mpCurrent, eeDerived.resources?.mp?.total),
      glimmer: pool(resources.glimmerCurrent, eeDerived.resources?.glimmer?.total),
      magicHeat: heatPool(magicHeat, sys.magic?.heatMax),
      psychicHeat: heatPool(psychicHeat, sys.psychic?.heatMax)
    };
  }

  static _eeTextBonus(source, keys) {
    const text = [source?.notes, source?.bonuses, source?.description, source?.effects]
      .filter(Boolean)
      .join(" ");
    if (!text) return 0;
    const pattern = new RegExp(`([+-]\\d+)\\s*(?:to\\s*)?(?:${keys.join("|")})`, "ig");
    let total = 0;
    for (const match of text.matchAll(pattern)) total += Number(match[1] ?? 0);
    return total;
  }

  static _eeSourceBonus(source, path) {
    if (!source || typeof source !== "object") return 0;
    const value = path.split(".").reduce((obj, key) => obj?.[key], source);
    if (value && typeof value === "object") return Number(value.bonus ?? value.value ?? value.total ?? 0);
    return Number(value ?? 0);
  }

  static _eeCollectBonuses(sys, path, textKeys = [], extraSources = []) {
    const sources = [
      ...ErrantEarthCharacterSheet._toArray(sys.backgrounds),
      ...ErrantEarthCharacterSheet._toArray(sys.occupations),
      sys.species,
      { notes: sys.equipment },
      ...extraSources
    ].filter(Boolean);
    return sources.reduce((total, source) => {
      return total + ErrantEarthCharacterSheet._eeSourceBonus(source.eeDerived, path)
        + ErrantEarthCharacterSheet._eeSourceBonus(source.derived, path)
        + (textKeys.length ? ErrantEarthCharacterSheet._eeTextBonus(source, textKeys) : 0);
    }, 0);
  }

  static _eeGlimmer(esp, mp) {
    const fromEsp = Math.floor(Number(esp ?? 0) / 10);
    const fromMp = Math.floor(Number(mp ?? 0) / 10);
    return fromEsp + fromMp;
  }

  static eeDerivedData(sys = {}, equipmentSources = []) {
    const attrs = sys.eeAttributes ?? {};
    const attr = key => Number(attrs[key]?.value ?? 0);
    const anm = attr("anm");
    const brv = attr("brv");
    const com = attr("com");
    const fin = attr("fin");
    const hrd = attr("hrd");
    const pow = attr("pow");
    const spd = attr("spd");
    const wil = attr("wil");
    const level = Math.max(1, Number(sys.level ?? 1));
    const stored = sys.eeDerived ?? {};
    const combatStored = sys.eeCombat ?? {};
    const tier = sys.eeAttributeTier ?? "Mortal";
    const tierMods = ErrantEarthCharacterSheet._EE_TIER_MODS[tier] ?? ErrantEarthCharacterSheet._EE_TIER_MODS.Mortal;
    const bonus = (path, textKeys = []) => ErrantEarthCharacterSheet._eeCollectBonuses(sys, path, textKeys, equipmentSources);

    const strengthRating = ErrantEarthCharacterSheet._eeAvg(hrd, pow);
    const strength = { rating: strengthRating, ...ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_STRENGTH_TABLE, strengthRating) };
    delete strength.min;
    delete strength.max;

    const demeanorRating = ErrantEarthCharacterSheet._eeAvg(brv, wil);
    const demeanor = { rating: demeanorRating, ...ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_DEMEANOR_TABLE, demeanorRating) };
    delete demeanor.min;
    delete demeanor.max;

    const reactionRating = ErrantEarthCharacterSheet._eeAvg(com, spd);
    const reaction = { rating: reactionRating, ...ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_REACTION_TABLE, reactionRating) };
    delete reaction.min;
    delete reaction.max;

    const size = ErrantEarthCharacterSheet._eeCanonicalSize(combatStored.defenses?.size) ?? "Average";
    const nsrBase = ErrantEarthCharacterSheet._EE_NSR_BY_SIZE[size.toLowerCase()];
    const enduranceBase = 7 + hrd + Math.ceil(2.5 * level) + tierMods.endurance;
    const healthBase = hrd + tierMods.health;
    const espBase = anm * 2;
    const mpBase = wil * 2;
    const glimmerBase = ErrantEarthCharacterSheet._eeGlimmer(espBase, mpBase);
    const glimmerBand = ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_GLIMMER_TABLE, glimmerBase);
    const carryBase = (pow + hrd) / 2;

    const actionsBase = Number(combatStored.actions ?? tierMods.actions) || tierMods.actions || 1;
    const momentumBase = Number(combatStored.momentum ?? tierMods.momentum);
    const reactionsBase = Number(combatStored.reactions ?? tierMods.reactions);
    const initiativeBase = reaction.initiativeBonus + Number(combatStored.initiative ?? 0);
    const meleeToHitBase = strength.meleeToHit + Number(combatStored.meleeToHit ?? 0);
    const rangedToHitBase = ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_ATB_TABLE, fin).bonus + Number(combatStored.rangedToHit ?? 0);
    const damageBonusBase = strength.sdBonus + Number(combatStored.damageBonus ?? 0);
    const actions = ErrantEarthCharacterSheet._eeAdjustable(actionsBase, stored.combat?.actions, bonus("combat.actions", ["actions?", "combat actions?"]));
    const momentum = ErrantEarthCharacterSheet._eeAdjustable(momentumBase, stored.combat?.momentum, bonus("combat.momentum", ["momentum"]));
    const reactions = ErrantEarthCharacterSheet._eeAdjustable(reactionsBase, stored.combat?.reactions, bonus("combat.reactions", ["reactions?"]));
    const thresholds = combatStored.health?.thresholds ?? {};
    const eeArmor = ErrantEarthCharacterSheet._eeAggregateArmor(combatStored.armorPieces);
    const equipmentArmorRating = equipmentSources.reduce((max, source) => Math.max(max, Number(source?.ar ?? source?.system?.ar ?? 0)), 0);
    // EE rule: best Base AR among all sources, plus the sum of every AR bonus.
    const armorRatingBase = Math.max(Number(combatStored.defenses?.armorRating ?? combatStored.armor?.rating ?? 0), equipmentArmorRating, eeArmor.ar.best) + eeArmor.ar.bonus;

    return {
      tier,
      armorSummary: eeArmor,
      health: {
        endurance: ErrantEarthCharacterSheet._eeAdjustable(enduranceBase, stored.health?.endurance, bonus("health.endurance", ["endurance"])),
        health: ErrantEarthCharacterSheet._eeAdjustable(healthBase, stored.health?.health, bonus("health.health", ["health"])),
        scars: ErrantEarthCharacterSheet._eeScars(combatStored, stored),
        thresholds: {
          wounded: Number(thresholds.wounded ?? Math.ceil(healthBase * 0.75)),
          bloodied: Number(thresholds.bloodied ?? Math.ceil(healthBase * 0.5)),
          critical: Number(thresholds.critical ?? Math.ceil(healthBase * 0.25)),
          death: Number(thresholds.death ?? -healthBase)
        }
      },
      defense: {
        size,
        nsr: ErrantEarthCharacterSheet._eeAdjustable(Number(combatStored.defenses?.nsr ?? nsrBase), stored.defense?.nsr, bonus("defense.nsr", ["nsr", "survival rating"])),
        msr: ErrantEarthCharacterSheet._eeAdjustable(Number(combatStored.defenses?.msr ?? 0), stored.defense?.msr, bonus("defense.msr", ["msr"])),
        armorRating: ErrantEarthCharacterSheet._eeAdjustable(armorRatingBase, stored.defense?.armorRating, bonus("defense.armorRating", ["armor rating", "ar"]))
      },
      resources: {
        esp: ErrantEarthCharacterSheet._eeAdjustable(espBase, stored.resources?.esp, bonus("resources.esp", ["esp", "extra sensory power"])),
        mp: ErrantEarthCharacterSheet._eeAdjustable(mpBase, stored.resources?.mp, bonus("resources.mp", ["mp", "magic power"])),
        glimmer: { ...ErrantEarthCharacterSheet._eeAdjustable(glimmerBase, stored.resources?.glimmer, bonus("resources.glimmer", ["glimmer"])), description: glimmerBand.description, detectionBonus: glimmerBand.bonus, detectionPercent: glimmerBand.percent }
      },
      combat: {
        strength,
        actions,
        momentum,
        reactions,
        initiative: ErrantEarthCharacterSheet._eeAdjustable(initiativeBase, stored.combat?.initiative, bonus("combat.initiative", ["initiative"])),
        meleeToHit: ErrantEarthCharacterSheet._eeAdjustable(meleeToHitBase, stored.combat?.meleeToHit, bonus("combat.meleeToHit", ["melee to-hit", "melee to hit", "melee attack"])),
        rangedToHit: ErrantEarthCharacterSheet._eeAdjustable(rangedToHitBase, stored.combat?.rangedToHit, bonus("combat.rangedToHit", ["ranged to-hit", "ranged to hit", "ranged attack"])),
        damageBonus: ErrantEarthCharacterSheet._eeAdjustable(damageBonusBase, stored.combat?.damageBonus, bonus("combat.damageBonus", ["damage bonus", "damage"])),
        damageScale: combatStored.damageScale || tierMods.damageScale
      },
      movement: {
        reaction,
        pace: ErrantEarthCharacterSheet._eeAdjustable(Number(combatStored.movement?.pace ?? reaction.pace), stored.movement?.pace, bonus("movement.pace", ["pace", "movement"])),
        run: ErrantEarthCharacterSheet._eeAdjustable(Number(combatStored.movement?.run ?? reaction.pace * 2), stored.movement?.run, bonus("movement.run", ["run"])),
        sprint: ErrantEarthCharacterSheet._eeAdjustable(Number(combatStored.movement?.sprint ?? reaction.pace * 4), stored.movement?.sprint, bonus("movement.sprint", ["sprint"])),
        climb: ErrantEarthCharacterSheet._eeAdjustable(Number(combatStored.movement?.climb ?? reaction.pace), stored.movement?.climb, bonus("movement.climb", ["climb"])),
        swim: ErrantEarthCharacterSheet._eeAdjustable(Number(combatStored.movement?.swim ?? reaction.pace), stored.movement?.swim, bonus("movement.swim", ["swim"])),
        liftCarryJump: {
          light: Math.ceil(carryBase * 5),
          medium: Math.ceil(carryBase * 10),
          heavy: Math.ceil(carryBase * 12.5),
          overhead: Math.ceil(carryBase * 12.5 * 1.5),
          offGround: Math.ceil(carryBase * 12.5 * 2),
          push: Math.ceil(carryBase * 12.5 * 4),
          verticalStand: Math.ceil(pow / 5),
          verticalRun: Math.ceil(pow / 3),
          horizontalStand: Math.max(0, pow - 6),
          horizontalRun: Math.max(0, pow - 2)
        }
      },
      social: {
        demeanor,
        atbBonus: ErrantEarthCharacterSheet._eeAdjustable(ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_ATB_TABLE, anm).bonus, stored.social?.atbBonus, bonus("social.atbBonus", ["atb"]))
      },
      saves: {
        psychicResistance: ErrantEarthCharacterSheet._eeAdjustable(ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_ATB_TABLE, wil).bonus, stored.saves?.psychicResistance, bonus("saves.psychicResistance", ["psychic resistance"])),
        magicResistance: ErrantEarthCharacterSheet._eeAdjustable(ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_ATB_TABLE, anm).bonus, stored.saves?.magicResistance, bonus("saves.magicResistance", ["magic resistance"])),
        horrorAnima: ErrantEarthCharacterSheet._eeAdjustable(anm, stored.saves?.horrorAnima, bonus("saves.horrorAnima", ["horror anima", "horror factor"])),
        horrorWillpower: ErrantEarthCharacterSheet._eeAdjustable(wil, stored.saves?.horrorWillpower, bonus("saves.horrorWillpower", ["horror willpower", "horror factor"]))
      }
    };
  }

  static _eeHasScars(scars) {
    return !!scars && (scars.value !== undefined || scars.max !== undefined);
  }

  static _eeScars(combatStored = {}, stored = {}) {
    const combatScars = combatStored.health?.scars;
    const legacyScars = stored.health?.scars;
    return {
      value: Number(combatScars?.value ?? legacyScars?.value ?? 0),
      max: Number(combatScars?.max ?? legacyScars?.max ?? 5)
    };
  }

  static async _migrateLegacyScars(actor) {
    const sourceSys = actor?._source?.system;
    if (!sourceSys) return;
    const legacyScars = sourceSys.eeDerived?.health?.scars;
    if (!ErrantEarthCharacterSheet._eeHasScars(legacyScars)) return;

    const combatScars = sourceSys.eeCombat?.health?.scars;
    const update = {};
    if (combatScars?.value === undefined && legacyScars.value !== undefined) {
      update["system.eeCombat.health.scars.value"] = Number(legacyScars.value ?? 0);
    }
    if (combatScars?.max === undefined && legacyScars.max !== undefined) {
      update["system.eeCombat.health.scars.max"] = Number(legacyScars.max ?? 5);
    }
    if (Object.keys(update).length) await actor.update(update, { render: false });
  }

  static _migrateSubmittedLegacyScars(expanded) {
    const legacyScars = expanded?.system?.eeDerived?.health?.scars;
    if (!ErrantEarthCharacterSheet._eeHasScars(legacyScars)) return;
    expanded.system.eeCombat ??= {};
    expanded.system.eeCombat.health ??= {};
    expanded.system.eeCombat.health.scars ??= {};
    if (expanded.system.eeCombat.health.scars.value === undefined && legacyScars.value !== undefined) {
      expanded.system.eeCombat.health.scars.value = Number(legacyScars.value ?? 0);
    }
    if (expanded.system.eeCombat.health.scars.max === undefined && legacyScars.max !== undefined) {
      expanded.system.eeCombat.health.scars.max = Number(legacyScars.max ?? 5);
    }
    delete expanded.system.eeDerived.health.scars;
  }

  async getData(options) {
    const ctx = await super.getData(options);
    const C = ErrantEarthCharacterSheet;
    await C._migrateLegacyScars(this.actor);
    const sys = ctx.actor.system;
    ctx.config = CONFIG.EE ?? {};

    ctx.rulesModeSetting = C._rulesModeSetting();
    ctx.canToggleMode = ctx.rulesModeSetting === "perSheet";
    ctx.mode = C._effectiveRulesMode(sys);
    ctx.isEE = ctx.mode === "errantEarth";
    ctx.tokenBarOptions = C._tokenBarOptions(ctx.mode);
    ctx.tokenSettings = C._tokenSettings(sys, ctx.mode);
    ctx.rulesModeLabel = ctx.isEE ? "Use Errant Earth Rules" : "Use EE Legacy Rules";
    ctx.rulesModeHint = ctx.canToggleMode
      ? "Switch this character between Errant Earth and EE Legacy rules. Character data is preserved."
      : `World setting is forcing ${ctx.rulesModeLabel}; per-sheet switching is disabled.`;
    ctx.sheetTitle = ctx.isEE ? "ERRANT EARTH" : "EE LEGACY";

    const level = Number(sys.level ?? 1);
    ctx.eeSizeOptions = C._EE_SIZE_CATEGORIES;

    const itemBuckets = {
      psionicPower: [], spell: [], ability: [], weapon: [], armor: [], powerArmor: [],
      vehicle: [], race: [], occ: [], gear: []
    };
    for (const item of this.actor.items) {
      const type = LegacyRules._isRccAsRace(item) ? "race" : (item.type in itemBuckets ? item.type : "gear");
      itemBuckets[type].push(item);
    }
    ctx.itemsByType = itemBuckets;
    ctx.equippedRaceId = sys.equippedRace ?? "";
    ctx.equippedOccId  = sys.equippedOcc  ?? "";
    ctx.equippedRaceItem = ctx.equippedRaceId ? this.actor.items.get(ctx.equippedRaceId) : null;
    ctx.equippedOccItem  = ctx.equippedOccId  ? this.actor.items.get(ctx.equippedOccId)  : null;
    ctx.isRCC = !!ctx.equippedOccItem?.system?.isRCC;
    ctx.legacyXp = C._legacyXpProgress(sys.xp, level, ctx.equippedOccItem?.system);
    const rawLegacySkillRows = C._toArray(sys.skills?.list);
    const appliedOccChoiceCounts = new Map();
    for (const row of rawLegacySkillRows) {
      if (row?.sourceItemId !== ctx.equippedOccId || row?.sourceChoiceIndex === undefined || row?.sourceChoiceIndex === "") continue;
      const key = String(row.sourceChoiceIndex);
      appliedOccChoiceCounts.set(key, (appliedOccChoiceCounts.get(key) ?? 0) + 1);
    }
    ctx.pendingOccSkillChoiceCount = ctx.equippedOccItem
      ? C._toArray(ctx.equippedOccItem.system?.skillChoices)
        .filter((choice, index) => Number(choice?.count ?? 0) > 0
          && Math.max(1, Number(choice?.level ?? 1) || 1) <= level
          && (appliedOccChoiceCounts.get(String(index)) ?? 0) < Math.max(1, Number(choice?.count ?? 1) || 1)).length
      : 0;
    ctx.riftsDerived = LegacyRules.derive(sys, this.actor.items);
    const { sourceTotals: riftsSourceTotals, effectiveAttrs, handToHand } = ctx.riftsDerived;
    const saveLabels = { spell: "Spell", ritual: "Ritual", psionics: "Psionics", insanity: "Insanity", drugPoison: "Toxins / Poison", harmfulDrugs: "Harmful Drugs", horrorFactor: "Horror Factor", death: "Coma / Death", possession: "Possession", pain: "Pain" };
    ctx.legacySaveRows = Object.entries(ctx.riftsDerived.saves).map(([key, save]) => ({
      ...save, key, label: saveLabels[key],
      rollType: save.percent ? "percentSave" : "save",
      display: save.percent ? save.display : C._formatSigned(save.total),
      hint: save.percent ? `Roll ${save.total}% or under` : `Target ${save.base}; bonus ${C._formatSigned(save.total)}`
    }));
    const hasSavedValue = value => {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === "object") return Object.values(value).some(hasSavedValue);
      return value !== undefined && value !== null && value !== "" && value !== "none" && value !== 0 && value !== false;
    };
    ctx.hasLegacyWeapons = C._toArray(sys.weapons?.modern).length + C._toArray(sys.weapons?.ancient).length > 0;
    ctx.hasLegacyArmor = hasSavedValue(sys.armor?.primary) || hasSavedValue(sys.armor?.secondary);
    ctx.hasLegacyVehicle = hasSavedValue(sys.vehicle);

    const toArr = ErrantEarthCharacterSheet._toArray;

    // New skills begin at first-level proficiency when acquired. Starting
    // skills default to learnedAtLevel 1, preserving legacy actor data.
    const iqBonusForSkills = ctx.isEE ? 0 : ctx.riftsDerived.iqSkillBonus;
    const skillRows = rawLegacySkillRows.map((r, i) => {
      const base   = Number(r.base   ?? 0);
      const perLvl = Number(r.perLvl ?? 0);
      const misc   = Number(r.misc   ?? 0);
      const definition = C._legacySkillDefinition(r);
      const name = !r.custom && r.key && definition && !definition.specialization ? definition.name : r.name;
      const sourceBonus = C._riftsSkillSourceBonus(riftsSourceTotals, r);
      const learnedAtLevel = Math.max(1, Number(r.learnedAtLevel ?? 1) || 1);
      const skillLevel = Math.max(1, level - learnedAtLevel + 1);
      const total  = base + perLvl * Math.max(0, skillLevel - 1) + misc + iqBonusForSkills + sourceBonus;
      const hasSourceChoice = r.sourceChoiceIndex !== undefined && r.sourceChoiceIndex !== "";
      return { ...r, name, learnedAtLevel, skillLevel, hasSourceChoice, _index: i, statBonusEntries: C._legacySkillStatEntries(r, i), sourceBonus, total };
    });
    ctx.skills = {
      occ:        skillRows.filter(r => r.category === "occ"),
      occRelated: skillRows.filter(r => r.category === "occRelated"),
      secondary:  skillRows.filter(r => r.category === "secondary"),
      unassigned: skillRows.filter(r => !r.category)
    };

    const eeSkillRows = toArr(sys.eeSkills?.list).map((r, i) => {
      const rank        = Number(r.rank ?? 0);
      const proficiency = Number(r.proficiency ?? 0);
      const bonus       = Number(r.bonus ?? 0);
      const total       = rank + (proficiency * Math.max(1, level)) + bonus;
      return { ...r, _index: i, total };
    });
    ctx.eeSkills = { list: eeSkillRows };

    // Master-list pickers: only show skills not already on the actor, except
    // repeatable specialized skills such as Language: Other.
    const usedKeys = new Set(skillRows.map(r => r.key).filter(Boolean));
    const buildSkillPicker = ({ secondary = false } = {}) => {
      const masterList = (CONFIG.EE?.SKILL_LIST ?? [])
        .filter(s => s.repeatable || !usedKeys.has(s.key))
        .filter(s => !secondary || s.secondary !== false);
      const grouped = {};
      for (const s of masterList) (grouped[s.group] ??= []).push(s);
      return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, items]) => ({ group, items }));
    };
    ctx.skillPicker = buildSkillPicker();
    ctx.skillPickerSecondary = buildSkillPicker({ secondary: true });

    const usedEeKeys = new Set(eeSkillRows.map(r => r.key).filter(Boolean));
    const eeMasterList = (CONFIG.EE?.EE_SKILL_LIST ?? []).filter(s => s.open || !usedEeKeys.has(s.key));
    const eeGrouped = {};
    for (const s of eeMasterList) (eeGrouped[s.category] ??= []).push(s);
    ctx.eeSkillPicker = Object.entries(eeGrouped)
      .sort(([a], [b]) => (CONFIG.EE?.EE_SKILL_CATEGORIES?.[a] ?? a).localeCompare(CONFIG.EE?.EE_SKILL_CATEGORIES?.[b] ?? b))
      .map(([category, items]) => ({ category, label: CONFIG.EE?.EE_SKILL_CATEGORIES?.[category] ?? category, items }));

    // Normalize every other array-shaped collection used by the template so
    // {{#each}} keeps working even after Foundry's merge corrupts them.
    ctx.system = foundry.utils.deepClone(sys);
    ctx.system.handToHand.extras = toArr(sys.handToHand?.extras);
    ctx.system.savingThrows.extras = toArr(sys.savingThrows?.extras);
    ctx.system.weapons.modern = toArr(sys.weapons?.modern);
    ctx.system.weapons.ancient = toArr(sys.weapons?.ancient);
    const unarmedRows = Object.prototype.hasOwnProperty.call(sys.weapons ?? {}, "unarmed")
      ? sys.weapons?.unarmed
      : C._defaultUnarmedStrikeRows();
    ctx.system.weapons.unarmed = toArr(unarmedRows);
    // weaponProficiencies: { selected: {key: bool}, custom: [{name}] }
    const actorWpSelected = (sys.weaponProficiencies && typeof sys.weaponProficiencies === "object" && !Array.isArray(sys.weaponProficiencies))
      ? (sys.weaponProficiencies.selected ?? {})
      : {};
    const wpCustom = (sys.weaponProficiencies && typeof sys.weaponProficiencies === "object")
      ? toArr(sys.weaponProficiencies.custom)
      : [];
    const wpSelected = { ...actorWpSelected, ...(riftsSourceTotals.weaponProficiencies?.selected ?? {}) };
    ctx.system.weaponProficiencies = { selected: actorWpSelected, custom: wpCustom };
    const wpDecorate = (entries) => entries.map(e => C._legacyWpEntrySummary(e, level, effectiveAttrs, wpSelected, actorWpSelected));
    ctx.wpAncient = wpDecorate(CONFIG.EE?.WP_LIST?.ancient ?? []);
    ctx.wpModern  = wpDecorate(CONFIG.EE?.WP_LIST?.modern  ?? []);
    ctx.eeWp      = wpDecorate(CONFIG.EE?.EE_WP_LIST ?? []);
    ctx.wpAncientOptions = C._legacyWpOptions(CONFIG.EE?.WP_LIST?.ancient ?? []);
    ctx.wpModernOptions = C._legacyWpOptions(CONFIG.EE?.WP_LIST?.modern ?? []);
    ctx.riftsWpNotes = CONFIG.EE?.RIFTS_WP_NOTES ?? [];
    ctx.riftsDerived.weaponProficiencies = {
      ancient: ctx.wpAncient.filter(wp => wp.checked),
      modern: ctx.wpModern.filter(wp => wp.checked)
    };
    ctx.system.weapons.modern = ctx.system.weapons.modern
      .map((row, index) => C._decorateLegacyWeaponRow(row, index, level, effectiveAttrs, wpSelected));
    ctx.system.weapons.ancient = ctx.system.weapons.ancient
      .map((row, index) => C._decorateLegacyWeaponRow(row, index, level, effectiveAttrs, wpSelected));
    const unarmedReferenceEntries = (CONFIG.EE?.RIFTS_COMBAT_REFERENCES ?? [])
      .find(section => section.section === "Unarmed Attacks")?.entries ?? [];
    const unarmedReferenceByName = new Map(unarmedReferenceEntries.map(entry => [String(entry.name ?? "").trim().toLowerCase(), entry]));
    ctx.system.weapons.unarmed = ctx.system.weapons.unarmed
      .map((row, index) => {
        const decorated = C._decorateUnarmedStrikeRow(row, index, handToHand);
        const reference = unarmedReferenceByName.get(String(row?.name ?? "").trim().toLowerCase());
        return {
          ...decorated,
          referenceSource: reference?.source ?? "",
          referenceTarget: reference?.target ?? "",
          referenceNote: reference?.note ?? ""
        };
      });
    ctx.system.armor.primary.extras = toArr(sys.armor?.primary?.extras);
    ctx.system.armor.secondary.extras = toArr(sys.armor?.secondary?.extras);
    ctx.system.powerArmor.handToHand.extras = toArr(sys.powerArmor?.handToHand?.extras);
    ctx.system.powerArmor.armor.extras = toArr(sys.powerArmor?.armor?.extras);
    ctx.system.powerArmor.weapons = toArr(sys.powerArmor?.weapons);
    ctx.system.powers = toArr(sys.powers);
    if (ctx.system.vehicle) {
      ctx.system.vehicle.handToHand.extras = toArr(sys.vehicle?.handToHand?.extras);
      ctx.system.vehicle.armor.extras = toArr(sys.vehicle?.armor?.extras);
      ctx.system.vehicle.weapons = toArr(sys.vehicle?.weapons).map(row => ({ ...row, name: row?.name ?? row?.type ?? "" }));
    }
    ctx.system.contacts = toArr(sys.contacts);
    ctx.system.backgrounds = toArr(sys.backgrounds);
    ctx.system.occupations = toArr(sys.occupations);
    ctx.system.eeSkills = { ...(ctx.system.eeSkills ?? {}), list: toArr(sys.eeSkills?.list) };
    if (ctx.system.eeCombat) ctx.system.eeCombat.armorPieces = toArr(sys.eeCombat?.armorPieces);
    if (ctx.system.money) ctx.system.money.outfits = toArr(sys.money?.outfits);

    const equipmentSources = this.actor.items.map(item => ({ ...item.system, name: item.name, type: item.type, system: item.system }));
    ctx.eeDerived = C.eeDerivedData(sys, equipmentSources);
    ctx.eePools = C._eePoolState(sys, ctx.eeDerived);
    ctx.weaponItems = itemBuckets.weapon.map(item => {
      const raw = foundry.utils.deepClone(item.system ?? {});
      const decorated = ctx.isEE
        ? {
            ...raw,
            effectiveStrike: C._parseIntSafe(raw.strike),
            effectiveParry: C._parseIntSafe(raw.parry),
            effectiveStrikeDisplay: C._formatSigned(C._parseIntSafe(raw.strike)),
            effectiveParryDisplay: C._formatSigned(C._parseIntSafe(raw.parry)),
            effectiveDamage: raw.damage ?? ""
          }
        : C._decorateLegacyWeaponRow(raw, 0, level, effectiveAttrs, wpSelected);
      return {
        id: item.id,
        name: item.name,
        img: item.img,
        categoryLabel: CONFIG.EE?.WEAPON_CATEGORIES?.[raw.category] ?? raw.category ?? "Weapon",
        system: decorated
      };
    });

    // Granted abilities from equipped OCC + Race, flattened with a source label
    // for display on the Powers tab.
    ctx.grantedAbilities = [];
    for (const src of [ctx.equippedOccItem, ctx.equippedRaceItem]) {
      if (!src) continue;
      for (const a of toArr(src.system?.abilities)) {
        if (a?.name || a?.description) {
          ctx.grantedAbilities.push({ source: src.name, name: a.name ?? "", description: a.description ?? "" });
        }
      }
    }
    ctx.grantsMagic    = !!(ctx.equippedOccItem?.system?.grantsMagic    || ctx.equippedRaceItem?.system?.grantsMagic);
    ctx.grantsPsionics = !!(ctx.equippedOccItem?.system?.grantsPsionics || ctx.equippedRaceItem?.system?.grantsPsionics);

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    this._restoreDisclosureStates(html);
    if (!this.isEditable) return;

    html.on("click", "[data-action='add-row']",    this._onAddRow.bind(this));
    html.on("change", "[data-action='add-skill']", this._onAddSkill.bind(this));
    html.on("click", "[data-action='delete-row']", this._onDeleteRow.bind(this));
    html.on("change", "[data-action='armor-equip']", this._onArmorEquip.bind(this));
    html.on("click", "[data-action='ee-alignment']", this._onEeAlignment.bind(this));
    html.on("click", "[data-action='roll']",       this._onRoll.bind(this));
    html.on("click", "[data-action='edit-adjustable']", this._onEditAdjustable.bind(this));
    html.on("click", "[data-action='edit-item']",  this._onEditItem.bind(this));
    html.on("click", "[data-action='delete-item']", this._onDeleteItem.bind(this));
    html.on("click", "[data-action='create-item']", this._onCreateItem.bind(this));
    html.on("click", "[data-action='equip-item']",   this._onEquipItem.bind(this));
    html.on("click", "[data-action='unequip-item']", this._onUnequipItem.bind(this));
    html.on("change", "[data-action='toggle-item-quick-roll']", this._onToggleItemQuickRoll.bind(this));
    html.on("change", "[data-action='update-armor-location']", this._onUpdateArmorLocation.bind(this));
    html.on("click", "[data-action='roll-cc-attribute']", this._onRollCcAttribute.bind(this));
    html.on("change", "[data-action='set-legacy-attribute']", this._onSetLegacyAttribute.bind(this));
    html.on("contextmenu", "[data-action='set-legacy-attribute']", this._onEditLegacyAttribute.bind(this));
    html.on("change", "[data-action='toggle-mode']", this._onToggleMode.bind(this));
    html.on("change", "[data-action='cc-pick']",     this._onCcPick.bind(this));
    html.on("click", "[data-action='apply-occ-skill-choices']", this._onApplyOccSkillChoices.bind(this));

    const dropZone = html.find(".ee-items-tab")[0];
    if (dropZone) {
      dropZone.addEventListener("dragenter", () => dropZone.classList.add("ee-drop-hover"));
      dropZone.addEventListener("dragleave", (ev) => {
        if (!dropZone.contains(ev.relatedTarget)) dropZone.classList.remove("ee-drop-hover");
      });
      dropZone.addEventListener("drop", () => dropZone.classList.remove("ee-drop-hover"));
    }
  }

  _restoreDisclosureStates(html) {
    this._disclosureStates ??= {};
    html.find("details[data-disclosure-key]").each((_, el) => {
      const key = el.dataset.disclosureKey;
      if (!key) return;
      if (Object.prototype.hasOwnProperty.call(this._disclosureStates, key)) {
        el.open = !!this._disclosureStates[key];
      }
      el.addEventListener("toggle", () => {
        this._disclosureStates[key] = el.open;
      });
    });
  }

  async _render(force, options = {}) {
    // Read the current DOM before replacement, including updates from other clients.
    this._disclosureStates ??= {};
    this.element?.find("details[data-disclosure-key]").each((_, el) => {
      this._disclosureStates[el.dataset.disclosureKey] = el.open;
    });
    return super._render(force, options);
  }

  async _onCreateItem(ev) {
    ev.preventDefault();
    const type = ev.currentTarget.dataset.type;
    const labels = {
      psionicPower: "Psionic Power",
      spell: "Spell",
      ability: "Ability",
      weapon: "Weapon",
      armor: "Armor",
      powerArmor: "Power Armor",
      vehicle: "Vehicle",
      race: "Race",
      occ: "OCC",
      gear: "Gear"
    };
    const name = `New ${labels[type] ?? "Item"}`;
    const [created] = await this.actor.createEmbeddedDocuments("Item", [{ name, type }]);
    return created?.sheet?.render(true);
  }

  async _onApplyOccSkillChoices(ev) {
    ev.preventDefault();
    const occId = this.actor.system.equippedOcc;
    const occItem = occId ? this.actor.items.get(occId) : null;
    if (!occItem) return ui.notifications?.warn("Equip an O.C.C. before resolving its skill choices.");
    const choiceSkills = await this._promptOccSkillChoices(occItem);
    if (choiceSkills === null) return this.render(false);
    if (!choiceSkills.length) return ui.notifications?.info(`${occItem.name} has no unresolved skill choices at this level.`);
    const mergedSkills = this._mergeOccSkillsIntoActor(occItem, choiceSkills);
    if (!mergedSkills) return ui.notifications?.info("Those skills are already on the character.");
    await this.actor.update({ "system.skills.list": mergedSkills });
    return ui.notifications?.info(`Applied ${choiceSkills.length} skill${choiceSkills.length === 1 ? "" : "s"} from ${occItem.name}.`);
  }

  async _onEquipItem(ev) {
    ev.preventDefault();
    const id = ev.currentTarget.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    return this._equipCcItem(item);
  }

  async _onRollCcAttribute(ev) {
    ev.preventDefault();
    const el = ev.currentTarget;
    const item = this.actor.items.get(el.dataset.itemId);
    const key = el.dataset.attribute;
    if (!item || !key) return;

    const entry = ErrantEarthCharacterSheet._normalizeRiftsAttributeRoll(item.system?.attributeBonuses?.[key]);
    if (entry.rolled) {
      return ui.notifications?.warn(`${item.name}: ${key.toUpperCase()} has already been rolled.`);
    }
    if (!entry.formula) {
      return ui.notifications?.warn(`${item.name}: no ${key.toUpperCase()} formula set.`);
    }

    let formula = entry.formula.trim();
    if (/^\+\d/.test(formula)) formula = formula.slice(1);
    if (/^-\d/.test(formula)) formula = `0${formula}`;

    try {
      const roll = await new Roll(formula).evaluate();
      await item.update({
        [`system.attributeBonuses.${key}.formula`]: entry.formula,
        [`system.attributeBonuses.${key}.value`]: roll.total,
        [`system.attributeBonuses.${key}.rolled`]: true
      });
      await this.render(false);
      return roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${item.name}: ${key.toUpperCase()} creation bonus (${entry.formula})`
      });
    } catch (err) {
      console.error("Errant Earth attribute source roll failed", err);
      return ui.notifications?.error(`Attribute roll failed: ${err.message}`);
    }
  }

  async _onSetLegacyAttribute(ev) {
    const input = ev.currentTarget;
    const key = input.dataset.attribute;
    const score = Number(input.value);
    const permanentSource = Number(input.dataset.source ?? 0) || 0;
    if (!key || !Number.isFinite(score)) return this.render(false);
    return this.actor.update({ [`system.attributes.${key}.value`]: score - permanentSource });
  }

  async _onEditLegacyAttribute(ev) {
    ev.preventDefault();
    const input = ev.currentTarget;
    const key = input.dataset.attribute;
    if (!key) return;
    const label = input.dataset.label || key.toUpperCase();
    const permanentSource = Number(input.dataset.source ?? 0) || 0;
    const currentScore = Number(input.value ?? 0) || 0;
    const currentTemporary = Number(this.actor.system.attributes?.[key]?.temporary ?? 0) || 0;
    const content = `
      <form class="ee-legacy-attribute-dialog">
        <div class="form-group">
          <label>Permanent score</label>
          <input type="number" name="score" value="${currentScore}" autofocus />
        </div>
        <p class="hint">The finished score, including Race/RCC/OCC and permanent skill gains.</p>
        <div class="form-group">
          <label>Temporary modifier</label>
          <input type="number" name="temporary" value="${currentTemporary}" />
        </div>
        <p class="hint">Temporary modifiers affect derived values and appear beneath the attributes.</p>
      </form>`;

    return new Promise(resolve => {
      new Dialog({
        title: `${label} Score`,
        content,
        buttons: {
          save: {
            label: "Save",
            callback: async html => {
              const form = html[0].querySelector("form");
              const score = Number(form.elements.score.value ?? 0) || 0;
              const temporary = Number(form.elements.temporary.value ?? 0) || 0;
              await this.actor.update({
                [`system.attributes.${key}.value`]: score - permanentSource,
                [`system.attributes.${key}.temporary`]: temporary
              });
              resolve();
            }
          },
          cancel: { label: "Cancel", callback: () => resolve() }
        },
        default: "save",
        close: () => resolve()
      }, { classes: ["errantearth", "dialog", "ee-legacy-attribute-editor"], width: 420 }).render(true);
    });
  }

  /** Merge OCC starting skills into the actor's skill list. Skips any that
   *  are already on the actor (matched by key for canonical skills, by
   *  name+custom for free-text rows). Existing skill values are never
   *  overwritten. */
  _mergeOccSkillsIntoActor(occItem, choiceSkills = []) {
    const occSkills = [
      ...ErrantEarthCharacterSheet._toArray(occItem.system?.skills),
      ...ErrantEarthCharacterSheet._toArray(choiceSkills)
    ];
    if (!occSkills.length) return null;
    const current = ErrantEarthCharacterSheet._toArray(this.actor.system.skills?.list);
    const usedKeys  = new Set(current.map(r => r.key).filter(Boolean));
    const usedNames = new Set(current.filter(r => r.custom && r.name).map(r => r.name.trim().toLowerCase()));
    const merged = foundry.utils.deepClone(current);
    let added = 0;
    for (const s of occSkills) {
      const isCustom = !!s.custom || !s.key;
      if (isCustom) {
        const nm = (s.name ?? "").trim();
        if (!nm || usedNames.has(nm.toLowerCase())) continue;
        usedNames.add(nm.toLowerCase());
      } else {
        const definition = ErrantEarthCharacterSheet._legacySkillDefinition(s);
        if (!definition?.repeatable && usedKeys.has(s.key)) continue;
        if (!definition?.repeatable) usedKeys.add(s.key);
      }
      merged.push({
        key: s.key ?? "",
        name: s.name ?? "",
        base: Number(s.base ?? 0),
        perLvl: Number(s.perLvl ?? 0),
        misc: Number(s.misc ?? 0) || 0,
        category: s.category || "occ",
        custom: !!isCustom,
        learnedAtLevel: Math.max(1, Number(s.learnedAtLevel ?? 1) || 1),
        sourceItemId: s.sourceItemId ?? occItem.id,
        ...(s.sourceChoiceIndex !== undefined ? { sourceChoiceIndex: Number(s.sourceChoiceIndex) } : {}),
        statBonuses: foundry.utils.deepClone(s.statBonuses ?? ErrantEarthCharacterSheet._legacySkillDefinition(s)?.statBonuses ?? {})
      });
      added++;
    }
    return added ? merged : null;
  }

  _existingLegacySkillKeys(extraRows = []) {
    return new Set([
      ...ErrantEarthCharacterSheet._toArray(this.actor.system.skills?.list),
      ...ErrantEarthCharacterSheet._toArray(extraRows)
    ].map(r => r.key).filter(Boolean));
  }

  static _wpChoicePool(pool = "any") {
    const ancient = CONFIG.EE?.WP_LIST?.ancient ?? [];
    const modern = CONFIG.EE?.WP_LIST?.modern ?? [];
    if (pool === "ancient") return ancient;
    if (pool === "modern") return modern;
    return [...ancient, ...modern];
  }

  static _promptCheckboxChoice({ title, message, options, count, name }) {
    if (!options.length || !count) return Promise.resolve([]);
    const safeName = ErrantEarthCharacterSheet._escapeHtml(name);
    const optionHtml = options.map(opt => `
      <label class="ee-choice-option">
        <input type="checkbox" name="${safeName}" value="${ErrantEarthCharacterSheet._escapeHtml(opt.key)}" />
        <span>${ErrantEarthCharacterSheet._escapeHtml(opt.name)}</span>
      </label>`).join("");
    return new Promise((resolve) => {
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      new Dialog({
        title,
        content: `
          <form class="ee-choice-dialog">
            <p>${ErrantEarthCharacterSheet._escapeHtml(message)}</p>
            <p class="hint">Select exactly ${count}.</p>
            <div class="ee-choice-options">${optionHtml}</div>
          </form>`,
        buttons: {
          ok: {
            label: "Apply",
            callback: (html) => {
              const checked = Array.from(html[0].querySelectorAll(`input[type="checkbox"]:checked`)).map(el => el.value);
              if (checked.length !== count) {
                ui.notifications?.warn(`Select exactly ${count} option${count === 1 ? "" : "s"} for ${title}.`);
                return false;
              }
              finish(checked);
            }
          },
          cancel: { label: "Cancel", callback: () => finish(null) }
        },
        default: "ok",
        close: () => finish(null)
      }, { classes: ["errantearth", "dialog", "ee-choice-dialog"], width: 520 }).render(true);
    });
  }

  async _promptOccSkillChoices(occItem) {
    const actorLevel = Math.max(1, Number(this.actor.system.level ?? 1) || 1);
    const appliedCounts = new Map();
    for (const row of ErrantEarthCharacterSheet._toArray(this.actor.system.skills?.list)) {
      if (row?.sourceItemId !== occItem.id || row?.sourceChoiceIndex === undefined || row?.sourceChoiceIndex === "") continue;
      const key = String(row.sourceChoiceIndex);
      appliedCounts.set(key, (appliedCounts.get(key) ?? 0) + 1);
    }
    const choices = ErrantEarthCharacterSheet._toArray(occItem.system?.skillChoices)
      .map((choice, index) => ({
        ...choice,
        _sourceIndex: index,
        _remainingCount: Math.max(0, Math.max(1, Number(choice?.count ?? 1) || 1) - (appliedCounts.get(String(index)) ?? 0))
      }))
      .filter(choice => Number(choice?.count ?? 0) > 0
        && Math.max(1, Number(choice?.level ?? 1) || 1) <= actorLevel
        && choice._remainingCount > 0);
    if (!choices.length) return [];

    const master = CONFIG.EE?.SKILL_LIST ?? [];
    const fixedOccSkills = ErrantEarthCharacterSheet._toArray(occItem.system?.skills);
    const usedKeys = this._existingLegacySkillKeys(fixedOccSkills);
    const rows = [];

    for (const choice of choices) {
      const choiceIndex = choice._sourceIndex;
      const count = choice._remainingCount;
      const learnedAtLevel = Math.max(1, Number(choice.level ?? 1) || 1);
      const category = choice.category || "occRelated";
      const allowedKeys = ErrantEarthCharacterSheet._toArray(choice.allowedKeys).filter(Boolean);
      const allowed = new Set(allowedKeys);
      const allowedGroups = ErrantEarthCharacterSheet._toArray(choice.allowedGroups)
        .map(rule => ({
          group: String(rule?.group ?? "").trim(),
          excluded: new Set(ErrantEarthCharacterSheet._toArray(rule?.excludedKeys).filter(Boolean))
        }))
        .filter(rule => rule.group);
      const hasRestrictions = !!(allowed.size || allowedGroups.length);
      const available = master
        .filter(skill => !hasRestrictions
          || allowed.has(skill.key)
          || allowedGroups.some(rule => rule.group === skill.group && !rule.excluded.has(skill.key)))
        .filter(skill => category !== "secondary" || skill.secondary !== false)
        .filter(skill => skill.repeatable || !usedKeys.has(skill.key));
      const label = choice.label || (category === "secondary" ? "Secondary Skills" : "OCC Related Skills");

      if (available.length < count) {
        ui.notifications?.warn(`${occItem.name}: ${label} has only ${available.length} available option${available.length === 1 ? "" : "s"} for ${count} pick${count === 1 ? "" : "s"}.`);
        return null;
      }

      const selected = await ErrantEarthCharacterSheet._promptCheckboxChoice({
        title: `${occItem.name}: ${label}`,
        message: `Choose ${count} ${label.toLowerCase()} to add as ${CONFIG.EE?.SKILL_CATEGORIES?.[category] ?? category}.`,
        options: available,
        count,
        name: `skillChoice${choiceIndex}`
      });
      if (selected === null) return null;

      for (const key of selected) {
        const skill = master.find(s => s.key === key);
        if (!skill) continue;
        const name = skill.specialization
          ? await ErrantEarthCharacterSheet._promptSkillSpecialization(skill)
          : skill.name;
        if (!name) return null;
        rows.push({
          key: skill.key,
          name,
          base: skill.base,
          perLvl: skill.perLvl,
          misc: Number(choice.bonus ?? 0) || 0,
          category,
          custom: false,
          learnedAtLevel,
          sourceItemId: occItem.id,
          sourceChoiceIndex: choiceIndex,
          statBonuses: foundry.utils.deepClone(skill.statBonuses ?? {})
        });
        if (!skill.repeatable) usedKeys.add(skill.key);
      }
    }

    return rows;
  }

  async _promptCcWpChoices(item) {
    const choices = ErrantEarthCharacterSheet._toArray(item.system?.weaponProficiencies?.choices)
      .filter(choice => Number(choice?.count ?? 0) > 0);
    if (!choices.length) return {};

    const actorSelected = this.actor.system.weaponProficiencies?.selected ?? {};
    const sourceSelected = item.system?.weaponProficiencies?.selected ?? {};
    const usedKeys = new Set([
      ...Object.entries(actorSelected).filter(([, selected]) => selected).map(([key]) => key),
      ...Object.entries(sourceSelected).filter(([, selected]) => selected).map(([key]) => key)
    ]);
    const selectedWp = {};

    for (const [choiceIndex, choice] of choices.entries()) {
      const count = Math.max(1, Number(choice.count ?? 1) || 1);
      const label = choice.label || "W.P. of choice";
      const allowedKeys = ErrantEarthCharacterSheet._toArray(choice.allowedKeys).filter(Boolean);
      const allowed = new Set(allowedKeys);
      const available = ErrantEarthCharacterSheet._wpChoicePool(allowed.size ? "any" : choice.pool)
        .filter(wp => !allowed.size || allowed.has(wp.key))
        .filter(wp => !usedKeys.has(wp.key));

      if (available.length < count) {
        ui.notifications?.warn(`${item.name}: ${label} has only ${available.length} available option${available.length === 1 ? "" : "s"} for ${count} pick${count === 1 ? "" : "s"}.`);
        return null;
      }

      const selected = await ErrantEarthCharacterSheet._promptCheckboxChoice({
        title: `${item.name}: ${label}`,
        message: `Choose ${count} ${label}.`,
        options: available,
        count,
        name: `wpChoice${choiceIndex}`
      });
      if (selected === null) return null;
      for (const key of selected) {
        selectedWp[key] = true;
        usedKeys.add(key);
      }
    }

    return selectedWp;
  }

  async _onUnequipItem(ev) {
    ev.preventDefault();
    const slot = ev.currentTarget.dataset.slot;
    if (slot === "race") return this.actor.update({ "system.equippedRace": "" });
    if (slot === "occ")  return this.actor.update({ "system.equippedOcc": "" });
  }

  /** Header dropdown for OCC/Race: equip an existing item, create a new one,
   *  or unequip when the blank option is chosen. */
  async _onCcPick(ev) {
    const sel = ev.currentTarget;
    const slot = sel.dataset.slot;          // "occ" | "race"
    const value = sel.value;
    const type = slot === "occ" ? "occ" : "race";

    if (value === "__new__") {
      const name = `New ${type === "occ" ? "OCC" : "Race"}`;
      const [created] = await this.actor.createEmbeddedDocuments("Item", [{ name, type }]);
      if (!created) return this.render(false);
      await this._equipCcItem(created);
      return created.sheet?.render(true);
    }

    if (!value) {
      // Unequip
      const update = slot === "occ"
        ? { "system.equippedOcc": "", "system.occ": "" }
        : { "system.equippedRace": "", "system.race": "" };
      return this.actor.update(update);
    }

    const item = this.actor.items.get(value);
    if (!item) return this.render(false);
    return this._equipCcItem(item);
  }

  async _equipCcItem(item) {
    if (item.type === "race" || LegacyRules._isRccAsRace(item)) {
      const equippedOccId = this.actor.system.equippedOcc;
      const equippedOcc = equippedOccId ? this.actor.items.get(equippedOccId) : null;
      if (equippedOcc?.system?.isRCC && equippedOcc.id !== item.id) {
        const enforcement = ErrantEarthCharacterSheet._legacyPackageEnforcement();
        if (enforcement === "strict") {
          ui.notifications?.warn(`Cannot equip a Race while an RCC ("${equippedOcc.name}") is equipped.`);
          return this.render(false);
        }
        if (enforcement === "warn") {
          ui.notifications?.warn(`Equipping a Race while an RCC ("${equippedOcc.name}") is equipped. The Active EE Legacy Sources panel will flag this.`);
        }
      }
      const choiceSkills = await this._promptOccSkillChoices(item);
      if (choiceSkills === null) return this.render(false);
      const choiceWps = await this._promptCcWpChoices(item);
      if (choiceWps === null) return this.render(false);
      const update = { "system.equippedRace": item.id, "system.race": item.name };
      if (equippedOccId === item.id) {
        update["system.equippedOcc"] = "";
        update["system.occ"] = "";
      }
      const mergedSkills = this._mergeOccSkillsIntoActor(item, choiceSkills);
      if (mergedSkills) update["system.skills.list"] = mergedSkills;
      if (Object.keys(choiceWps).length) {
        update["system.weaponProficiencies.selected"] = {
          ...(this.actor.system.weaponProficiencies?.selected ?? {}),
          ...choiceWps
        };
      }
      return this.actor.update(update);
    }
    if (item.type === "occ") {
      const update = { "system.equippedOcc": item.id, "system.occ": item.name };
      if (item.system?.isRCC) {
        const enforcement = ErrantEarthCharacterSheet._legacyPackageEnforcement();
        if (enforcement === "strict") {
          update["system.equippedRace"] = "";
          update["system.race"] = item.name;
        } else if (enforcement === "warn" && this.actor.system.equippedRace) {
          ui.notifications?.warn(`Equipping an RCC while a Race is equipped. The Active EE Legacy Sources panel will flag this.`);
        } else if (!this.actor.system.equippedRace) {
          update["system.race"] = item.name;
        }
      }
      const choiceSkills = await this._promptOccSkillChoices(item);
      if (choiceSkills === null) return this.render(false);
      const choiceWps = await this._promptCcWpChoices(item);
      if (choiceWps === null) return this.render(false);
      const mergedSkills = this._mergeOccSkillsIntoActor(item, choiceSkills);
      if (mergedSkills) update["system.skills.list"] = mergedSkills;
      if (Object.keys(choiceWps).length) {
        update["system.weaponProficiencies.selected"] = {
          ...(this.actor.system.weaponProficiencies?.selected ?? {}),
          ...choiceWps
        };
      }
      return this.actor.update(update);
    }
  }

  /** Errant Earth alignment picker: choose a Morality and an Ethics; the 5x4
   *  grid names the resulting alignment (e.g. Paragon + Ontological = Messiah). */
  async _onEeAlignment(ev) {
    ev.preventDefault();
    const moralities = CONFIG.EE?.EE_ALIGNMENT_MORALITIES ?? {};
    const ethics = CONFIG.EE?.EE_ALIGNMENT_ETHICS ?? {};
    const grid = CONFIG.EE?.EE_ALIGNMENT_GRID ?? {};
    const current = this.actor.system.eeAlignment ?? {};
    const opt = (obj, sel) => Object.entries(obj)
      .map(([k, v]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${v}</option>`).join("");
    const content = `
      <form class="ee-ee-alignment">
        <div class="form-group"><label>Morality</label>
          <select name="morality"><option value="">—</option>${opt(moralities, current.morality)}</select></div>
        <div class="form-group"><label>Ethics</label>
          <select name="ethics"><option value="">—</option>${opt(ethics, current.ethics)}</select></div>
        <p class="hint">The intersection names your alignment (e.g. Paragon + Ontological = Messiah).</p>
      </form>`;
    return new Promise((resolve) => {
      new Dialog({
        title: "Errant Earth Alignment",
        content,
        buttons: {
          save: {
            label: "Save",
            callback: async (html) => {
              const form = html[0].querySelector("form");
              const morality = form.elements.morality.value;
              const ethics = form.elements.ethics.value;
              const name = grid[morality]?.[ethics] ?? "";
              await this.actor.update({ "system.eeAlignment": { morality, ethics, name } });
              resolve();
            }
          },
          cancel: { label: "Cancel", callback: () => resolve() }
        },
        default: "save"
      }, { classes: ["errantearth", "dialog", "ee-alignment"], width: 400 }).render(true);
    });
  }

  static _rulesModeSetting() {
    return ErrantEarthCharacterSheet._setting("rulesMode", "perSheet");
  }

  static _setting(key, fallback) {
    try {
      return game.settings.get("errantearth", key) ?? fallback;
    } catch (err) {
      return fallback;
    }
  }

  static _legacyPackageEnforcement() {
    return ErrantEarthCharacterSheet._setting("legacyPackageEnforcement", "strict");
  }

  static _legacySkillModifierMode() {
    return ErrantEarthCharacterSheet._setting("legacySkillModifierMode", "prompt");
  }

  static _effectiveRulesMode(sys = {}) {
    const setting = ErrantEarthCharacterSheet._rulesModeSetting();
    if (setting === "errantEarth" || setting === "rifts") return setting;
    return sys.mode === "errantEarth" ? "errantEarth" : "rifts";
  }

  static _tokenBarOptions(mode = "rifts") {
    if (mode === "errantEarth") {
      return {
        health: "Health",
        endurance: "Endurance",
        esp: "ESP",
        mp: "MP",
        glimmer: "Glimmer"
      };
    }
    return {
      hp: "HP",
      sdc: "SDC",
      mdc: "MDC",
      isp: "ISP",
      ppe: "PPE",
      hunger: "Hunger"
    };
  }

  static _sanitizeTokenBar(mode, value, slot = "bar2") {
    const options = ErrantEarthCharacterSheet._tokenBarOptions(mode);
    if (mode === "errantEarth" && slot === "bar1") return "health";
    const fallback = mode === "errantEarth" ? (slot === "bar1" ? "health" : "endurance") : (slot === "bar1" ? "hp" : "sdc");
    return Object.prototype.hasOwnProperty.call(options, value) ? value : fallback;
  }

  static _tokenSettings(sys = {}, mode = "rifts") {
    return {
      bar1: ErrantEarthCharacterSheet._sanitizeTokenBar(mode, sys.token?.bar1, "bar1"),
      bar2: ErrantEarthCharacterSheet._sanitizeTokenBar(mode, sys.token?.bar2, "bar2")
    };
  }

  _isErrantEarthMode() {
    return ErrantEarthCharacterSheet._effectiveRulesMode(this.actor.system) === "errantEarth";
  }

  async _onToggleMode(ev) {
    if (ErrantEarthCharacterSheet._rulesModeSetting() !== "perSheet") {
      return this.render(false);
    }
    const mode = ev.currentTarget.checked ? "errantEarth" : "rifts";
    return this.actor.update({ "system.mode": mode });
  }

  static _EE_DIFFICULTY_BANDS = [
    { key: "easy",      label: "Easy",      d20: 4,  percent: 20 },
    { key: "routine",   label: "Routine",   d20: 2,  percent: 10 },
    { key: "standard",  label: "Standard",  d20: 0,  percent: 0  },
    { key: "difficult", label: "Difficult", d20: -2, percent: -10 },
    { key: "hard",      label: "Hard",      d20: -4, percent: -20 },
    { key: "hellish",   label: "Hellish",   d20: -6, percent: -30 }
  ];

  // Defaulting complexity table (Drifter Defaulting rules): attribute × multiplier = target.
  static _EE_DEFAULT_COMPLEXITY = [
    { key: "pathetic",  label: "Pathetic",  mult: 4,    display: "×4"  },
    { key: "easy",      label: "Easy",      mult: 3,    display: "×3"  },
    { key: "routine",   label: "Routine",   mult: 2,    display: "×2"  },
    { key: "difficult", label: "Difficult", mult: 1,    display: "×1"  },
    { key: "hard",      label: "Hard",      mult: 0.5,  display: "×½"  },
    { key: "hellish",   label: "Hellish",   mult: 0.25, display: "×¼"  }
  ];

  static _EE_TIER_STEPS = {
    Mortal: 0,
    Augmented: 1,
    Mechanical: 2,
    Supernatural: 3,
    Exalted: 4,
    Divine: 5
  };

  static _EE_DAMAGE_SCALE_STEPS = { S: 0, M: 1, G: 2, U: 3 };

  /** Pop a single-select dialog asking the player which difficulty band the
   *  GM has set for this Errant Earth check. Returns a difficulty descriptor
   *  with d20 and percentage modifiers, or null on cancel. */
  static async _promptDifficulty(rollLabel, mode = "percent") {
    return new Promise((resolve) => {
      const buttons = {};
      for (const b of ErrantEarthCharacterSheet._EE_DIFFICULTY_BANDS) {
        const modifier = mode === "d20" ? b.d20 : b.percent;
        const suffix = mode === "d20" ? "" : "%";
        const sign = modifier >= 0 ? "+" : "";
        buttons[b.key] = {
          label: `${b.label} (${sign}${modifier}${suffix})`,
          callback: () => resolve({ ...b, modifier, mode })
        };
      }
      new Dialog({
        title: `Difficulty: ${rollLabel}`,
        content: `<p>Pick the difficulty band for this Errant Earth roll.</p>`,
        buttons,
        default: "standard",
        close: () => resolve(null)
      }, { classes: ["errantearth", "dialog", "ee-difficulty"], width: 460 }).render(true);
    });
  }

  static _escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  static async _promptLegacySkillModifier(rollLabel) {
    return new Promise((resolve) => {
      const bands = [
        { key: "bonus10", label: "Bonus +10%", modifier: 10 },
        { key: "bonus20", label: "Bonus +20%", modifier: 20 },
        { key: "bonus30", label: "Bonus +30%", modifier: 30 },
        { key: "penalty10", label: "Penalty -10%", modifier: -10 },
        { key: "penalty20", label: "Penalty -20%", modifier: -20 },
        { key: "penalty30", label: "Penalty -30%", modifier: -30 }
      ];
      const buttons = {
        standard: { label: "No Modifier", callback: () => resolve({ label: "No Modifier", modifier: 0 }) }
      };
      for (const b of bands) buttons[b.key] = { label: b.label, callback: () => resolve(b) };
      new Dialog({
        title: `Skill Modifier: ${rollLabel}`,
        content: `<p>Add a situational bonus or impose a penalty for this EE Legacy skill roll.</p>`,
        buttons,
        default: "standard",
        close: () => resolve(null)
      }, { classes: ["errantearth", "dialog", "ee-legacy-skill-modifier"], width: 460 }).render(true);
    });
  }

  static async _promptSkillSpecialization(master) {
    return new Promise((resolve) => {
      const baseName = master?.specializationBase ?? String(master?.name ?? "").replace(/:\s*Other\b/i, "");
      const label = master?.specializationLabel ?? "Specialization";
      new Dialog({
        title: `${baseName}: ${label}`,
        content: `
          <form>
            <div class="form-group">
              <label>${ErrantEarthCharacterSheet._escapeHtml(label)}</label>
              <input type="text" name="specialization" placeholder="Other" autofocus />
            </div>
            <p class="hint">Example: ${ErrantEarthCharacterSheet._escapeHtml(baseName)}: Euro</p>
          </form>`,
        buttons: {
          ok: {
            label: "Add",
            callback: (html) => {
              const form = html?.[0]?.querySelector("form");
              const raw = form?.elements?.specialization?.value?.trim() ?? "";
              resolve(raw ? `${baseName}: ${raw}` : master.name);
            }
          },
          cancel: { label: "Cancel", callback: () => resolve(null) }
        },
        default: "ok",
        close: () => resolve(null)
      }, { classes: ["errantearth", "dialog", "ee-skill-specialization"], width: 420 }).render(true);
    });
  }

  /** First-step dialog: Raw attribute check (d20 roll-under) or Defaulting
   *  (skill check with attribute × complexity multiplier). Returns
   *  { mode: "raw" | "default" } or null on cancel. */
  static async _promptCheckMode(rollLabel) {
    return new Promise((resolve) => {
      new Dialog({
        title: `Attribute Check: ${rollLabel}`,
        content: `<p>How is ${rollLabel} being checked?</p>
                  <p class="ee-muted">A <strong>Raw Check</strong> rolls 1d20 and must come in at or under the attribute value.
                  <strong>Defaulting</strong> makes a Skill Check (d100) against the attribute multiplied by a Complexity step.</p>`,
        buttons: {
          raw:     { label: "Raw Check",   callback: () => resolve({ mode: "raw" }) },
          default: { label: "Defaulting",  callback: () => resolve({ mode: "default" }) }
        },
        default: "raw",
        close: () => resolve(null)
      }, { classes: ["errantearth", "dialog", "ee-attribute-mode"], width: 460 }).render(true);
    });
  }

  /** Defaulting complexity selector. Returns the chosen complexity entry or null. */
  static async _promptComplexity(rollLabel) {
    return new Promise((resolve) => {
      const buttons = {};
      for (const c of ErrantEarthCharacterSheet._EE_DEFAULT_COMPLEXITY) {
        buttons[c.key] = { label: `${c.label} (${c.display})`, callback: () => resolve(c) };
      }
      new Dialog({
        title: `Defaulting Complexity: ${rollLabel}`,
        content: `<p>Pick the Complexity the GM has set for this Defaulted check.</p>`,
        buttons,
        default: "routine",
        close: () => resolve(null)
      }, { classes: ["errantearth", "dialog", "ee-complexity"], width: 460 }).render(true);
    });
  }

  static _parseSkillTags(raw) {
    if (!raw) return [];
    const cfg = CONFIG.EE?.EE_SKILL_TAGS ?? {};
    return String(raw).split(/[|,]/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => Object.keys(cfg).find(k => k.toLowerCase() === t.toLowerCase()) ?? t);
  }

  static _formatSkillTags(tags) {
    const cfg = CONFIG.EE?.EE_SKILL_TAGS ?? {};
    return tags.map(t => cfg[t] ?? t).join(", ");
  }

  static _eeTierStep(tier) {
    return ErrantEarthCharacterSheet._EE_TIER_STEPS[tier] ?? 0;
  }

  static _eeDifficultyParts(choice, suffix = "") {
    if (!choice) return ["Standard"];
    const sign = choice.modifier >= 0 ? "+" : "";
    return [`${choice.label} (${sign}${choice.modifier}${suffix})`];
  }

  static _eeAutoRule(natural, die, mode = "rollUnder") {
    if (die === 100) {
      if (natural <= 1) return "success";
      if (natural >= 99) return "failure";
      return null;
    }
    if (die === 20) {
      if (mode === "rollOver") {
        if (natural === 20) return "success";
        if (natural === 1) return "failure";
      } else {
        if (natural === 1) return "success";
        if (natural === 20) return "failure";
      }
    }
    return null;
  }

  static _eeDegree({ success, margin = 0, natural, die, tags = [] }) {
    const has = tag => tags.includes(tag);
    if (success) {
      let degree = natural && ErrantEarthCharacterSheet._eeAutoRule(natural, die) === "success" ? "Critical Success"
        : margin >= (die === 100 ? 30 : 6) ? "Strong Success"
        : "Success";
      if (has("Aced") && degree === "Success") degree = "Strong Success";
      if (has("Fated") && degree === "Strong Success") degree = "Critical Success";
      return degree;
    }
    if (has("Reliable") && margin >= -(die === 100 ? 5 : 1)) return "Mixed Success";
    return natural && ErrantEarthCharacterSheet._eeAutoRule(natural, die) === "failure" ? "Critical Failure" : "Failure";
  }

  static _eeApplyTags({ success, auto, target, natural, tags = [] }) {
    if (auto === "failure" && tags.includes("Assurance") && natural <= target) {
      return { success: true, auto: null, note: "Assurance cancels automatic failure." };
    }
    if (auto === "failure" && tags.includes("Fated")) {
      return { success: false, auto: null, note: "Fated downgrades automatic failure." };
    }
    return { success, auto, note: "" };
  }

  static _eeDamageScale(rawScale = "S", tier = "Mortal") {
    const cfg = CONFIG.EE?.EE_DAMAGE_SCALES ?? {};
    const key = String(rawScale || "S").trim().toUpperCase();
    const scale = Object.prototype.hasOwnProperty.call(cfg, key) ? key : "S";
    const label = cfg[scale] ?? scale;
    const tierStep = ErrantEarthCharacterSheet._eeTierStep(tier);
    const scaleStep = ErrantEarthCharacterSheet._EE_DAMAGE_SCALE_STEPS[scale] ?? 0;
    const delta = scaleStep - tierStep;
    return { key: scale, label, tier, scaleStep, tierStep, delta };
  }

  static _eeSpendableResources(sys = {}, eeDerived = {}) {
    const resources = [];
    const add = (label, value) => resources.push(`${label}: ${Number(value ?? 0)}`);
    const addPool = (label, pool) => resources.push(`${label}: ${Number(pool?.value ?? 0)}/${Number(pool?.max ?? 0)}`);
    const pools = ErrantEarthCharacterSheet._eePoolState(sys, eeDerived);
    add("Momentum", eeDerived.combat?.momentum?.total ?? sys.eeCombat?.momentum);
    addPool("ESP", pools.esp);
    addPool("MP", pools.mp);
    addPool("Glimmer", pools.glimmer);
    return resources.join(", ");
  }


  static _rollFormula(value) {
    let formula = String(value ?? "").trim();
    if (!formula) return "";
    formula = formula
      .replace(/\bM\.?\s*D\.?\s*C?\.?(?=\s|$|[,;])/gi, "")
      .replace(/\bS\.?\s*D\.?\s*C?\.?(?=\s|$|[,;])/gi, "")
      .replace(/\b(?:mega|standard)[ -]?damage\b/gi, "")
      .replace(/[x×](?=\s*\d)/gi, "*")
      .trim();

    try {
      if (globalThis.Roll?.validate?.(formula)) return formula;
    } catch (_err) {
      // Fall through to extraction for descriptive legacy damage strings.
    }

    const operand = "[+-]?(?:(?:\\d+)?\\s*[dD]\\s*\\d+|\\d+(?:\\.\\d+)?)";
    const extracted = formula.match(new RegExp(`${operand}(?:\\s*[+*/-]\\s*${operand})*`))?.[0] ?? "";
    return extracted.replace(/\s+/g, "").replace(/d/gi, "d");
  }

  async _onRoll(ev) {
    ev.preventDefault();
    const el = ev.currentTarget;
    const type  = el.dataset.rollType;
    const label = el.dataset.label || "Roll";
    const PIS = ErrantEarthCharacterSheet._parseIntSafe;
    const isEE = this._isErrantEarthMode();
    const eeDerived = ErrantEarthCharacterSheet.eeDerivedData(this.actor.system);

    const card = { kind: type, label, subtitle: "", outcome: "", outcomeClass: "" };

    try {
      let roll;
      switch (type) {
        case "eeSkill": {
          const baseTarget = Number(el.dataset.target ?? 0);
          const tags = ErrantEarthCharacterSheet._parseSkillTags(el.dataset.tags);
          const choice = await ErrantEarthCharacterSheet._promptDifficulty(label, "percent");
          if (choice === null) return;
          const target = Math.clamp?.(baseTarget + choice.percent, 1, 100) ?? Math.max(1, Math.min(100, baseTarget + choice.percent));
          roll = await new Roll("1d100").evaluate();
          const natural = roll.total;
          const auto = ErrantEarthCharacterSheet._eeAutoRule(natural, 100);
          const preliminary = auto ? auto === "success" : natural <= target;
          const tagged = ErrantEarthCharacterSheet._eeApplyTags({ success: preliminary, auto, target, natural, tags });
          const success = tagged.auto ? tagged.auto === "success" : tagged.success;
          const margin = target - natural;
          const subParts = [`Target ${target}% (roll under)`, ...ErrantEarthCharacterSheet._eeDifficultyParts(choice, "%"), `Tier ${el.dataset.tier || eeDerived.tier}`];
          if (tags.length) subParts.push(`Tags: ${ErrantEarthCharacterSheet._formatSkillTags(tags)}`);
          if (tagged.note) subParts.push(tagged.note);
          card.subtitle = subParts.join(" — ");
          card.tags = ErrantEarthCharacterSheet._formatSkillTags(tags);
          card.tier = el.dataset.tier || eeDerived.tier;
          card.difficulty = choice.label;
          card.spendableResources = ErrantEarthCharacterSheet._eeSpendableResources(this.actor.system, eeDerived);
          card.successDegree = ErrantEarthCharacterSheet._eeDegree({ success, margin, natural, die: 100, tags });
          card.outcome = card.successDegree;
          card.outcomeClass = success ? "success" : "failure";
          break;
        }
        case "eeAttribute": {
          const baseTarget = Number(el.dataset.target ?? 0);
          const tier = el.dataset.tier || eeDerived.tier;
          const mode = await ErrantEarthCharacterSheet._promptCheckMode(label);
          if (mode === null) return;

          if (mode.mode === "default") {
            const complexity = await ErrantEarthCharacterSheet._promptComplexity(label);
            if (complexity === null) return;
            const target = Math.max(1, Math.floor(baseTarget * complexity.mult));
            roll = await new Roll("1d100").evaluate();
            const natural = roll.total;
            const auto = ErrantEarthCharacterSheet._eeAutoRule(natural, 100);
            const success = auto ? auto === "success" : natural <= target;
            const margin = target - natural;
            card.subtitle = [`Defaulting`, `${label} ${baseTarget} ${complexity.display} = ${target} (d100 roll-under)`, `${complexity.label} Complexity`, `Tier ${tier}`].join(" — ");
            card.tier = tier;
            card.difficulty = `${complexity.label} (${complexity.display})`;
            card.spendableResources = ErrantEarthCharacterSheet._eeSpendableResources(this.actor.system, eeDerived);
            card.successDegree = ErrantEarthCharacterSheet._eeDegree({ success, margin, natural, die: 100 });
            card.outcome = card.successDegree;
            card.outcomeClass = success ? "success" : "failure";
            break;
          }

          const choice = await ErrantEarthCharacterSheet._promptDifficulty(label, "d20");
          if (choice === null) return;
          const tierBonus = ErrantEarthCharacterSheet._eeTierStep(tier);
          const target = Math.max(1, Math.min(20, baseTarget + choice.d20 + tierBonus));
          roll = await new Roll("1d20").evaluate();
          const natural = roll.total;
          const auto = ErrantEarthCharacterSheet._eeAutoRule(natural, 20, "rollUnder");
          const success = auto ? auto === "success" : natural <= target;
          const margin = target - natural;
          card.subtitle = [`Raw Check`, `Target ${target} (d20 roll-under)`, ...ErrantEarthCharacterSheet._eeDifficultyParts(choice), `Tier ${tier}${tierBonus ? ` (+${tierBonus})` : ""}`].join(" — ");
          card.tier = tier;
          card.difficulty = choice.label;
          card.spendableResources = ErrantEarthCharacterSheet._eeSpendableResources(this.actor.system, eeDerived);
          card.successDegree = ErrantEarthCharacterSheet._eeDegree({ success, margin, natural, die: 20 });
          card.outcome = card.successDegree;
          card.outcomeClass = success ? "success" : "failure";
          break;
        }
        case "eeSave": {
          const baseTarget = Number(el.dataset.target ?? el.dataset.base ?? 0);
          const tier = el.dataset.tier || eeDerived.tier;
          const choice = await ErrantEarthCharacterSheet._promptDifficulty(label, "d20");
          if (choice === null) return;
          const tierBonus = ErrantEarthCharacterSheet._eeTierStep(tier);
          const target = Math.max(1, Math.min(20, baseTarget + choice.d20 + tierBonus));
          roll = await new Roll("1d20").evaluate();
          const natural = roll.total;
          const auto = ErrantEarthCharacterSheet._eeAutoRule(natural, 20, "rollUnder");
          const success = auto ? auto === "success" : natural <= target;
          const margin = target - natural;
          card.subtitle = [`Resist ${target} or under`, ...ErrantEarthCharacterSheet._eeDifficultyParts(choice), `Tier ${tier}${tierBonus ? ` (+${tierBonus})` : ""}`].join(" — ");
          card.tier = tier;
          card.difficulty = choice.label;
          card.spendableResources = ErrantEarthCharacterSheet._eeSpendableResources(this.actor.system, eeDerived);
          card.successDegree = ErrantEarthCharacterSheet._eeDegree({ success, margin, natural, die: 20 });
          card.outcome = card.successDegree;
          card.outcomeClass = success ? "success" : "failure";
          break;
        }
        case "eeDamage": {
          const formula = ErrantEarthCharacterSheet._rollFormula(el.dataset.formula);
          if (!formula) return ui.notifications?.warn(`${label}: no damage formula set.`);
          const tier = el.dataset.tier || eeDerived.tier;
          const scale = ErrantEarthCharacterSheet._eeDamageScale(el.dataset.scale, tier);
          roll = await new Roll(formula).evaluate();
          card.damageScale = scale.label;
          card.tier = tier;
          card.subtitle = [`Damage`, `${scale.label} scale`, `Tier ${tier}`].join(" — ");
          if (scale.delta > 0) card.subtitle += ` — ${scale.delta} scale step${scale.delta === 1 ? "" : "s"} above tier`;
          else if (scale.delta < 0) card.subtitle += ` — ${Math.abs(scale.delta)} scale step${Math.abs(scale.delta) === 1 ? "" : "s"} below tier`;
          break;
        }
        case "skill": {
          const baseTarget = Number(el.dataset.target ?? 0);
          let modifier = 0;
          let modLabel = "";
          if (isEE) {
            const choice = await ErrantEarthCharacterSheet._promptDifficulty(label, "percent");
            if (choice === null) return; // cancelled
            modifier = choice.percent;
            modLabel = choice.label;
          } else {
            const mode = ErrantEarthCharacterSheet._legacySkillModifierMode();
            if (mode === "none") {
              modifier = 0;
              modLabel = "No Modifier";
            } else {
              const choice = await ErrantEarthCharacterSheet._promptLegacySkillModifier(label);
              if (choice === null) return; // cancelled
              modifier = choice.modifier;
              modLabel = choice.label;
            }
          }
          const target = baseTarget + modifier;
          roll = await new Roll("1d100").evaluate();
          const autoFail = isEE && roll.total >= 99;
          const success = !autoFail && roll.total <= target;
          const subParts = [`Target ${target}% (roll under)`];
          if (isEE) {
            subParts.push(modLabel ? `${modLabel} (${modifier >= 0 ? "+" : ""}${modifier}%)` : "Standard");
            subParts.push("EE");
          } else {
            subParts.push(modifier ? `${modLabel} (${modifier >= 0 ? "+" : ""}${modifier}%)` : "No Modifier");
            subParts.push("EE Legacy");
          }
          card.subtitle = subParts.join(" — ");
          card.outcome = autoFail ? "Auto-Fail (99/00)" : (success ? "Success" : "Failure");
          card.outcomeClass = success ? "success" : "failure";
          break;
        }
        case "attrCheck": {
          const target = Number(el.dataset.target ?? 0);
          roll = await new Roll("1d20").evaluate();
          const success = roll.total <= target;
          card.subtitle = `${label} ${target} (d20 roll-under)`;
          card.outcome = success ? "Success" : "Failure";
          card.outcomeClass = success ? "success" : "failure";
          break;
        }
        case "eeInitiative": {
          const bonus = PIS(el.dataset.bonus);
          const sign = bonus >= 0 ? "+" : "";
          roll = await new Roll(`1d20${sign}${bonus}`).evaluate();
          card.subtitle = bonus ? `Errant Earth initiative: 1d20 ${sign} ${Math.abs(bonus)}` : "Errant Earth initiative: 1d20";
          break;
        }
        case "eeAttack": {
          const bonus = PIS(el.dataset.bonus);
          const sign = bonus >= 0 ? "+" : "";
          roll = await new Roll(`1d20${sign}${bonus}`).evaluate();
          card.subtitle = bonus ? `Errant Earth attack: 1d20 ${sign} ${Math.abs(bonus)}` : "Errant Earth attack: 1d20";
          break;
        }
        case "eeDefense": {
          const target = Number(el.dataset.target ?? 0);
          roll = await new Roll("1d20").evaluate();
          card.subtitle = target ? `Errant Earth defense rating ${target}` : "Errant Earth defense rating";
          if (target) {
            const success = roll.total >= target;
            card.outcome = success ? "Holds" : "Breached";
            card.outcomeClass = success ? "success" : "failure";
          }
          break;
        }
        case "eeResistance": {
          const bonus = PIS(el.dataset.bonus);
          const sign = bonus >= 0 ? "+" : "";
          roll = await new Roll(`1d20${sign}${bonus}`).evaluate();
          card.subtitle = bonus ? `Errant Earth resistance: 1d20 ${sign} ${Math.abs(bonus)}` : "Errant Earth resistance: 1d20";
          break;
        }
        case "d20": {
          const bonus = PIS(el.dataset.bonus);
          const sign = bonus >= 0 ? "+" : "";
          roll = await new Roll(`1d20${sign}${bonus}`).evaluate();
          card.subtitle = bonus ? `1d20 ${sign} ${Math.abs(bonus)}` : "1d20";
          break;
        }
        case "save": {
          const baseRaw = el.dataset.base ?? "";
          const bonus = PIS(el.dataset.bonus);
          const sign = bonus >= 0 ? "+" : "";
          roll = await new Roll(`1d20${sign}${bonus}`).evaluate();
          const baseNum = Number(baseRaw);
          if (baseRaw !== "" && Number.isFinite(baseNum)) {
            const success = roll.total >= baseNum;
            card.subtitle = `Need ${baseNum}+`;
            card.outcome = success ? "Success" : "Failure";
            card.outcomeClass = success ? "success" : "failure";
          } else if (baseRaw) {
            card.subtitle = `Target: ${baseRaw}`;
          }
          break;
        }
        case "percentSave": {
          const target = Math.max(0, Math.min(100, Number(el.dataset.target ?? 0) || 0));
          roll = await new Roll("1d100").evaluate();
          const success = roll.total <= target;
          card.subtitle = `Target ${target}% (d100 roll under)`;
          card.outcome = success ? "Success" : "Failure";
          card.outcomeClass = success ? "success" : "failure";
          break;
        }
        case "damage": {
          const formula = ErrantEarthCharacterSheet._rollFormula(el.dataset.formula);
          if (!formula) return ui.notifications?.warn(`${label}: no damage formula set.`);
          roll = await new Roll(formula).evaluate();
          card.subtitle = "Damage";
          break;
        }
        default:
          return ui.notifications?.warn(`Unknown roll type: ${type}`);
      }

      card.formula = roll.formula;
      card.total = roll.total;
      card.actorName = this.actor.name;
      card.actorImg  = this.actor.img;
      card.dice = roll.dice.flatMap(d => d.results.map(r => ({
        value: r.result,
        cls: [
          d.faces === r.result ? "ee-die-max" : "",
          r.result === 1 ? "ee-die-min" : ""
        ].filter(Boolean).join(" ")
      })));

      const content = await renderTemplate("systems/errantearth/templates/chat/roll-card.html", card);
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content,
        rolls: [roll],
        sound: CONFIG.sounds.dice,
        rollMode: game.settings.get("core", "rollMode")
      });
    } catch (err) {
      console.error("Errant Earth roll failed", err);
      ui.notifications?.error(`Roll failed: ${err.message}`);
    }
  }


  /** Pencil-icon edit dialog for any Errant Earth derived adjustable value.
   *  Lets the user edit the manual `bonus` and `override` stored under
   *  `system.eeDerived.<path>`. If `data-base-path` is supplied, the dialog
   *  also exposes that path (e.g. `eeCombat.armor.soak`) as the "Gear Base"
   *  so equipped armor's underlying soak/resistance/AR can be set too. */
  async _onEditAdjustable(ev) {
    ev.preventDefault();
    const el = ev.currentTarget;
    const path = el.dataset.path;
    if (!path) return;
    const label = el.dataset.label || path;
    const basePath = el.dataset.basePath || "";

    const eeDerived = ErrantEarthCharacterSheet.eeDerivedData(this.actor.system);
    const adj = path.split(".").reduce((o, k) => (o ? o[k] : undefined), eeDerived);
    if (!adj) return ui.notifications?.warn(`No derived value at ${path}.`);

    const sys = this.actor.system;
    const stored = path.split(".").reduce((o, k) => (o ? o[k] : undefined), sys.eeDerived ?? {}) ?? {};
    const baseValue = basePath
      ? basePath.split(".").reduce((o, k) => (o ? o[k] : undefined), sys)
      : undefined;

    const baseRow = basePath
      ? `<div class="form-group"><label>Gear Base</label>
           <input type="number" name="baseValue" value="${baseValue ?? 0}" />
           <p class="hint">Stored at <code>system.${basePath}</code>. Treated as the gear's raw value.</p>
         </div>`
      : `<div class="form-group"><label>Computed Base</label>
           <input type="number" value="${Number(adj.base ?? 0)}" disabled />
           <p class="hint">Derived from attributes/tier/species. Use Bonus or Override to adjust.</p>
         </div>`;

    const content = `
      <form class="ee-edit-adjustable">
        <p class="ee-muted">Editing <strong>${label}</strong>. Total = Base + Bonus, unless an Override is set (which replaces the total).</p>
        ${baseRow}
        <div class="form-group">
          <label>Manual Bonus</label>
          <input type="number" name="bonus" value="${Number(stored.bonus ?? 0)}" />
          <p class="hint">Adds on top of the base and any auto-detected source bonuses.</p>
        </div>
        <div class="form-group">
          <label>Override</label>
          <input type="number" name="override" value="${stored.override ?? ""}" placeholder="(blank = use computed total)" />
          <p class="hint">If set, replaces the computed total entirely.</p>
        </div>
        <div class="form-group">
          <label>Current Total</label>
          <input type="number" value="${Number(adj.total ?? 0)}" disabled />
        </div>
      </form>`;

    return new Promise((resolve) => {
      new Dialog({
        title: `Edit ${label}`,
        content,
        buttons: {
          save: {
            label: "Save",
            callback: async (html) => {
              const form = html[0].querySelector("form");
              const bonusRaw = form.elements.bonus.value;
              const overrideRaw = form.elements.override.value;
              const update = {
                [`system.eeDerived.${path}.bonus`]: bonusRaw === "" ? 0 : Number(bonusRaw),
                [`system.eeDerived.${path}.override`]: overrideRaw === "" ? null : Number(overrideRaw)
              };
              if (basePath) {
                const raw = form.elements.baseValue.value;
                update[`system.${basePath}`] = raw === "" ? 0 : Number(raw);
              }
              await this.actor.update(update);
              resolve();
            }
          },
          clear: {
            label: "Reset",
            callback: async () => {
              const update = {
                [`system.eeDerived.${path}.bonus`]: 0,
                [`system.eeDerived.${path}.override`]: null
              };
              await this.actor.update(update);
              resolve();
            }
          },
          cancel: { label: "Cancel", callback: () => resolve() }
        },
        default: "save",
        close: () => resolve()
      }, { classes: ["errantearth", "dialog", "ee-edit-adjustable"], width: 460 }).render(true);
    });
  }

  async _onEditItem(ev) {
    ev.preventDefault();
    const id = ev.currentTarget.dataset.itemId;
    const item = this.actor.items.get(id);
    return item?.sheet?.render(true);
  }

  async _onDeleteItem(ev) {
    ev.preventDefault();
    const id = ev.currentTarget.dataset.itemId;
    return this.actor.deleteEmbeddedDocuments("Item", [id]);
  }

  async _onToggleItemQuickRoll(ev) {
    const id = ev.currentTarget.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    return item.update({ "system.quickRoll": ev.currentTarget.checked });
  }

  async _onUpdateArmorLocation(ev) {
    const input = ev.currentTarget;
    const item = this.actor.items.get(input.dataset.itemId);
    const location = input.dataset.location;
    if (!item || !["armor", "powerArmor", "vehicle"].includes(item.type) || !location) return;
    const locationRoot = item.type === "vehicle" ? item.system?.armor : item.system?.locations;
    const updateRoot = item.type === "vehicle" ? "system.armor" : "system.locations";
    const max = Math.max(0, Number(locationRoot?.[location]?.max ?? 0) || 0);
    const current = Math.min(max, Math.max(0, Number(input.value ?? 0) || 0));
    input.value = String(current);
    return item.update({ [`${updateRoot}.${location}.current`]: current });
  }

  _getArrayPath(path) {
    const raw = path.split(".").reduce((o, k) => (o ? o[k] : undefined), this.actor.system);
    if (path === "weapons.unarmed" && raw === undefined) return ErrantEarthCharacterSheet._defaultUnarmedStrikeRows();
    return ErrantEarthCharacterSheet._toArray(raw);
  }

  async _onAddRow(ev) {
    ev.preventDefault();
    const btn = ev.currentTarget;
    let path = btn.dataset.path;
    const kind = btn.dataset.kind;
    if (kind === "skill" && this._isErrantEarthMode()) path = "eeSkills.list";
    const arr  = foundry.utils.deepClone(this._getArrayPath(path));
    const row = this._blankRow(kind, path);
    if (kind === "skill" && path === "skills.list") {
      row.category = btn.dataset.category ?? "";
      row.learnedAtLevel = Math.max(1, Number(this.actor.system.level ?? 1) || 1);
    }
    arr.push(row);
    await this.actor.update({ [`system.${path}`]: arr });
  }

  async _onAddSkill(ev) {
    ev.preventDefault();
    const sel = ev.currentTarget;
    const key = sel.value;
    const category = sel.dataset.category;
    const isEE = this._isErrantEarthMode() || sel.dataset.ee === "true";
    if (!key) return;

    if (isEE) {
      const master = (CONFIG.EE?.EE_SKILL_LIST ?? []).find(s => s.key === key);
      if (!master) { sel.value = ""; return; }
      const arr = foundry.utils.deepClone(this._getArrayPath("eeSkills.list"));
      if (!master.open && arr.some(row => row?.key === key)) { sel.value = ""; return; }
      const name = master.open
        ? await ErrantEarthCharacterSheet._promptSkillSpecialization({
            ...master,
            specializationBase: master.name.replace(/\s*\(Open\)\s*$/i, ""),
            specializationLabel: "Specialization"
          })
        : master.name;
      if (!name) { sel.value = ""; return; }
      arr.push({
        key: master.key,
        name,
        category: master.category ?? category ?? "",
        tags: master.tags ?? "",
        rank: 0,
        proficiency: 0,
        bonus: 0,
        notes: "",
        custom: false
      });
      sel.value = "";
      return this.actor.update({ "system.eeSkills.list": arr });
    }

    const master = (CONFIG.EE?.SKILL_LIST ?? []).find(s => s.key === key);
    if (!master) { sel.value = ""; return; }
    if (category === "secondary" && master.secondary === false) {
      sel.value = "";
      return ui.notifications?.warn(`${master.name} is not available as a Secondary Skill.`);
    }
    const arr = foundry.utils.deepClone(this._getArrayPath("skills.list"));
    if (!master.repeatable && arr.some(row => row?.key === key)) { sel.value = ""; return; }
    const name = master.specialization
      ? await ErrantEarthCharacterSheet._promptSkillSpecialization(master)
      : master.name;
    if (!name) { sel.value = ""; return; }
    arr.push({
      key: master.key,
      name,
      base: master.base,
      perLvl: master.perLvl,
      misc: 0,
      category,
      custom: false,
      statBonuses: foundry.utils.deepClone(master.statBonuses ?? {})
    });
    sel.value = "";
    await this.actor.update({ "system.skills.list": arr });
  }

  /** Toggle a worn armor piece. Equipping a piece auto-unequips any other
   *  piece sharing its layer (one Under, one Over, one Plating at a time). */
  async _onArmorEquip(ev) {
    ev.preventDefault();
    const checked = ev.currentTarget.checked;
    const pieces = foundry.utils.deepClone(this._getArrayPath("eeCombat.armorPieces"));
    const idx = ErrantEarthCharacterSheet._validIndex(ev.currentTarget.dataset.index, pieces.length);
    if (idx < 0) return;
    pieces[idx].equipped = checked;
    if (checked) {
      const layer = pieces[idx].layer;
      pieces.forEach((p, i) => { if (i !== idx && p.layer === layer) p.equipped = false; });
    }
    await this.actor.update({ "system.eeCombat.armorPieces": pieces });
  }

  async _onDeleteRow(ev) {
    ev.preventDefault();
    const btn  = ev.currentTarget;
    const path = btn.dataset.path;
    const arr  = foundry.utils.deepClone(this._getArrayPath(path));
    const idx  = ErrantEarthCharacterSheet._validIndex(btn.dataset.index, arr.length);
    if (idx < 0) return;
    arr.splice(idx, 1);
    await this.actor.update({ [`system.${path}`]: arr });
  }

  _blankRow(kind, path = "") {
    switch (kind) {
      case "skill":
        if (path === "eeSkills.list" || this._isErrantEarthMode()) {
          return { key: "", name: "", category: "", tags: "", rank: 0, proficiency: 0, bonus: 0, notes: "", custom: true };
        }
        return { key: "", name: "", base: 0, perLvl: 0, misc: 0, category: "", custom: true };
      case "wpCustom":      return { name: "" };
      case "modernWeapon":  return { name: "", wpKey: "", damageType: "", damage: "", damageScale: "S", ammo: "", payload: "", strike: "", range: "", rate: "", special: "", quickRoll: false };
      case "ancientWeapon": return { name: "", wpKey: "", damageType: "", damage: "", damageScale: "S", ammo: "", strike: "", parry: "", special: "", quickRoll: false };
      case "unarmedStrike": return { name: "Unarmed Strike", damageType: "kinetic", damage: "", damageScale: "S", strike: "", parry: "", actions: "1", special: "", quickRoll: false };
      case "saveExtra":     return { name: "", base: 0, bonus: 0 };
      case "h2hExtra":      return { name: "", value: 0 };
      case "armorExtra":    return { name: "", current: 0, max: 0 };
      case "eeArmor":       return { name: "", layer: "OA", weight: "", variant: "", equipped: false, durability: { value: 0, max: 0 }, ar: { base: 0, bonus: 0 }, maneuver: { flat: 0, percent: 0 }, sr: 0, formality: 0, resist: { heat: 0, cold: 0, radiation: 0, earthblood: 0 }, notes: "" };
      case "power":         return { name: "", source: "", cost: "", range: "", saving: "", damage: "", duration: "", description: "" };
      case "paWeapon":      return { name: "", damageType: "", damage: "", damageScale: "S", ammo: "", strike: "", range: "", special: "" };
      case "vehicleWeapon": return { name: "", damageType: "", damage: "", damageScale: "S", ammo: "", payload: "", strike: "", range: "", rate: "", special: "" };
      case "contact":       return { name: "", occupation: "", notes: "" };
      case "outfit":        return { name: "", checked: false };
      case "bgocc":         return { name: "", notes: "" };
      default:              return { name: "" };
    }
  }

  /**
   * Coerce any object whose keys are all sequential integers into a real
   * array, recursively. Foundry's mergeObject treats arrays atomically but
   * merges objects — so once an array field has been written via a flattened
   * "system.path.0.field" key it becomes {"0": ...} and stays that way unless
   * we re-send it as an array.
   */
  static _coerceArrays(v) {
    if (v === null || typeof v !== "object") return v;
    if (Array.isArray(v)) return v.map(ErrantEarthCharacterSheet._coerceArrays);
    const keys = Object.keys(v);
    const numeric = keys.length > 0 && keys.every(k => /^\d+$/.test(k));
    if (numeric) {
      const arr = [];
      for (const k of keys.sort((a, b) => Number(a) - Number(b))) {
        arr.push(ErrantEarthCharacterSheet._coerceArrays(v[k]));
      }
      return arr;
    }
    const out = {};
    for (const k of keys) out[k] = ErrantEarthCharacterSheet._coerceArrays(v[k]);
    return out;
  }

  static _validateEnum(value, choices) {
    if (value === "" || value === undefined || value === null) return "";
    return Object.prototype.hasOwnProperty.call(choices, value) ? value : "";
  }


  static _validIndex(value, length) {
    if (value === null || value === undefined || String(value).trim() === "") return -1;
    const index = Number(value);
    return Number.isInteger(index) && index >= 0 && index < length ? index : -1;
  }

  static _normalizeWeaponProficiencies(expanded) {
    const selected = expanded?.system?.weaponProficiencies?.selected;
    const wpList = CONFIG.EE?.WP_LIST;
    if (!selected || !wpList) return expanded;

    const normalized = { ...selected };
    const known = [
      ...(wpList.ancient ?? []),
      ...(wpList.modern ?? []),
      ...(CONFIG.EE?.EE_WP_LIST ?? [])
    ];

    for (const { key } of known) {
      if (!key) continue;
      normalized[key] = ErrantEarthCharacterSheet._coerceBoolean(selected[key]);
    }

    expanded.system.weaponProficiencies.selected = normalized;
    return expanded;
  }

  static _normalizeTokenSettings(expanded, mode = "rifts") {
    const sys = expanded?.system;
    if (!sys?.token) return expanded;
    sys.token.bar1 = ErrantEarthCharacterSheet._sanitizeTokenBar(mode, sys.token.bar1, "bar1");
    sys.token.bar2 = ErrantEarthCharacterSheet._sanitizeTokenBar(mode, sys.token.bar2, "bar2");
    return expanded;
  }

  static _normalizeQuickRollFlags(expanded) {
    const sys = expanded?.system;
    if (!sys) return expanded;
    const normalizeRows = (rows, key = "quickRoll") => {
      if (!Array.isArray(rows)) return;
      for (const row of rows) {
        if (row && typeof row === "object" && key in row) {
          row[key] = ErrantEarthCharacterSheet._coerceBoolean(row[key]);
        }
      }
    };
    normalizeRows(sys.weapons?.modern);
    normalizeRows(sys.weapons?.ancient);
    normalizeRows(sys.weapons?.unarmed);
    normalizeRows(sys.money?.outfits, "checked");
    return expanded;
  }

  static _normalizeEeDerivedAdjustments(expanded) {
    const walk = value => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return;
      if (Object.prototype.hasOwnProperty.call(value, "override") && value.override === "") value.override = null;
      for (const child of Object.values(value)) walk(child);
    };
    walk(expanded?.system?.eeDerived);
    return expanded;
  }

  static _validateEnums(expanded) {
    const cfg = CONFIG.EE;
    if (!cfg || !expanded?.system) return expanded;
    const sys = expanded.system;
    if ("alignment" in sys)    sys.alignment    = ErrantEarthCharacterSheet._validateEnum(sys.alignment,    cfg.ALIGNMENTS);
    if ("psionicLevel" in sys) sys.psionicLevel = ErrantEarthCharacterSheet._validateEnum(sys.psionicLevel, cfg.PSIONIC_LEVELS);
    if (sys.vehicle && "type" in sys.vehicle)
      sys.vehicle.type = ErrantEarthCharacterSheet._validateEnum(sys.vehicle.type, cfg.VEHICLE_TYPES);
    if (sys.handToHand && "type" in sys.handToHand)
      sys.handToHand.type = ErrantEarthCharacterSheet._validateEnum(sys.handToHand.type, cfg.HTH_TYPES);
    if (sys.handToHand && "strengthType" in sys.handToHand)
      sys.handToHand.strengthType = ErrantEarthCharacterSheet._validateEnum(sys.handToHand.strengthType, cfg.LEGACY_PHYSICAL_TYPES);
    if (sys.handToHand && "enduranceType" in sys.handToHand)
      sys.handToHand.enduranceType = ErrantEarthCharacterSheet._validateEnum(sys.handToHand.enduranceType, cfg.LEGACY_PHYSICAL_TYPES);
    if (sys.powerArmor?.handToHand && "type" in sys.powerArmor.handToHand)
      sys.powerArmor.handToHand.type = ErrantEarthCharacterSheet._validateEnum(sys.powerArmor.handToHand.type, cfg.POWER_ARMOR_HTH_TYPES);
    if (sys.vehicle?.handToHand && "type" in sys.vehicle.handToHand)
      sys.vehicle.handToHand.type = ErrantEarthCharacterSheet._validateEnum(sys.vehicle.handToHand.type, cfg.POWER_ARMOR_HTH_TYPES);
    const scrubArr = (arr, field, choices) => {
      if (!Array.isArray(arr)) return;
      for (const row of arr) {
        if (row && typeof row === "object" && field in row)
          row[field] = ErrantEarthCharacterSheet._validateEnum(row[field], choices);
      }
    };
    scrubArr(sys.weapons?.modern,    "damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.weapons?.ancient,   "damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.weapons?.unarmed,   "damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.powerArmor?.weapons,"damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.vehicle?.weapons,   "damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.weapons?.modern,    "damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.weapons?.ancient,   "damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.weapons?.unarmed,   "damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.powerArmor?.weapons,"damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.vehicle?.weapons,   "damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.powers,             "source",     cfg.POWER_SOURCES);
    scrubArr(sys.eeSkills?.list,     "category",   cfg.EE_SKILL_CATEGORIES);
    return expanded;
  }

  /** The armor-piece `equipped` toggle is handler-driven (no form input), so a
   *  normal field edit would otherwise resubmit the array without it. Restore
   *  each row's worn flag from the actor's current state, keyed by index. */
  _preserveArmorEquipped(expanded) {
    const submitted = expanded?.system?.eeCombat?.armorPieces;
    if (!Array.isArray(submitted)) return;
    const current = ErrantEarthCharacterSheet._toArray(this.actor.system?.eeCombat?.armorPieces);
    submitted.forEach((row, i) => {
      if (row && typeof row === "object" && current[i]) row.equipped = !!current[i].equipped;
    });
  }

  async _updateObject(event, formData) {
    const expanded = ErrantEarthCharacterSheet._coerceArrays(foundry.utils.expandObject(formData));
    this._preserveArmorEquipped(expanded);
    ErrantEarthCharacterSheet._migrateSubmittedLegacyScars(expanded);
    ErrantEarthCharacterSheet._normalizeEeDerivedAdjustments(expanded);
    ErrantEarthCharacterSheet._validateEnums(expanded);
    ErrantEarthCharacterSheet._normalizeWeaponProficiencies(expanded);
    ErrantEarthCharacterSheet._normalizeTokenSettings(expanded, ErrantEarthCharacterSheet._effectiveRulesMode(this.actor.system));
    ErrantEarthCharacterSheet._normalizeQuickRollFlags(expanded);
    return this.document.update(expanded);
  }
}
