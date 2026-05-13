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

  /** RIFTS attribute-bonus chart (p.281). Each table is keyed 16..30; values
   *  beyond 30 are extended by the rules in "Attributes Beyond 30" (p.284). */
  static _ATTR_TABLES = {
    iqSkill:        { 16:2, 17:3, 18:4, 19:5, 20:6, 21:7, 22:8, 23:9, 24:10, 25:11, 26:12, 27:13, 28:14, 29:15, 30:16 },
    mePsionic:      { 16:1, 17:1, 18:2, 19:2, 20:3, 21:3, 22:4, 23:4, 24:5, 25:5, 26:6, 27:6, 28:7, 29:7, 30:8 },
    meInsanity:     { 16:1, 17:1, 18:2, 19:2, 20:3, 21:4, 22:5, 23:6, 24:7, 25:8, 26:9, 27:10, 28:11, 29:12, 30:13 },
    maTrustPct:     { 16:40, 17:45, 18:50, 19:55, 20:60, 21:65, 22:70, 23:75, 24:80, 25:84, 26:88, 27:92, 28:94, 29:96, 30:97 },
    psDamage:       { 16:1, 17:2, 18:3, 19:4, 20:5, 21:6, 22:7, 23:8, 24:9, 25:10, 26:11, 27:12, 28:13, 29:14, 30:15 },
    ppParryDodge:   { 16:1, 17:1, 18:2, 19:2, 20:3, 21:3, 22:4, 23:4, 24:5, 25:5, 26:6, 27:6, 28:7, 29:7, 30:8 },
    ppStrike:       { 16:1, 17:1, 18:2, 19:2, 20:3, 21:3, 22:4, 23:4, 24:5, 25:5, 26:6, 27:6, 28:7, 29:7, 30:8 },
    peComaPct:      { 16:4, 17:5, 18:6, 19:8, 20:10, 21:12, 22:14, 23:16, 24:18, 25:20, 26:22, 27:24, 28:26, 29:28, 30:30 },
    peMagicPoison:  { 16:1, 17:1, 18:2, 19:2, 20:3, 21:3, 22:4, 23:4, 24:5, 25:5, 26:6, 27:6, 28:7, 29:7, 30:8 },
    pbCharmPct:     { 16:30, 17:35, 18:40, 19:45, 20:50, 21:55, 22:60, 23:65, 24:70, 25:75, 26:80, 27:83, 28:86, 29:90, 30:92 }
  };

  static _lookup(table, val) {
    if (val < 16) return 0;
    if (val <= 30) return table[val] ?? 0;
    return table[30];
  }

  /** Beyond-30 extensions. Most caps at 30 except the few called out in the rules. */
  static iqSkillBonus(iq) {
    const base = ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.iqSkill, iq);
    if (iq <= 30) return base;
    return base + Math.floor((iq - 30) / 5) * 2;
  }
  static psionicSave(me)    { return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.mePsionic, me); }
  static insanitySave(me)   { return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.meInsanity, me); }
  static trustIntimidate(ma){ return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.maTrustPct, ma); }
  static psDamage(ps)       { return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.psDamage, ps); }
  static ppParryDodge(pp)   { return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.ppParryDodge, pp); }
  static ppStrike(pp)       { return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.ppStrike, pp); }
  static peComaSave(pe) {
    const base = ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.peComaPct, pe);
    if (pe <= 30) return base;
    return base + (pe - 30);
  }
  static peMagicPoison(pe)  { return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.peMagicPoison, pe); }
  static charmImpress(pb)   { return ErrantEarthCharacterSheet._lookup(ErrantEarthCharacterSheet._ATTR_TABLES.pbCharmPct, pb); }



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

  static _EE_NSR_BY_SIZE = { tiny: 6, small: 5, average: 4, big: 3, huge: 2, massive: 1 };

  static _EE_TIER_MODS = {
    Mortal:       { actions: 1, momentum: 0, reactions: 0, health: 0, endurance: 0, damageScale: "S" },
    Augmented:    { actions: 1, momentum: 1, reactions: 1, health: 2, endurance: 5, damageScale: "S" },
    Mechanical:   { actions: 2, momentum: 1, reactions: 1, health: 4, endurance: 10, damageScale: "M" },
    Supernatural: { actions: 2, momentum: 2, reactions: 2, health: 6, endurance: 15, damageScale: "M" },
    Exalted:      { actions: 3, momentum: 3, reactions: 3, health: 8, endurance: 20, damageScale: "G" },
    Divine:       { actions: 4, momentum: 4, reactions: 4, health: 10, endurance: 25, damageScale: "U" }
  };

  static _eeBand(table, value) {
    const numeric = Number(value ?? 0);
    return table.find(row => numeric >= row.min && numeric <= row.max) ?? table[0];
  }

  static _eeAvg(...values) {
    const nums = values.map(v => Number(v ?? 0));
    return Math.ceil(nums.reduce((sum, v) => sum + v, 0) / Math.max(1, nums.length));
  }

  static _eeAdjustable(base, path, bonus = 0) {
    const stored = path && typeof path === "object" ? path : {};
    const storedBonus = Number(stored.bonus ?? 0);
    const override = stored.override === "" || stored.override === null || stored.override === undefined ? null : Number(stored.override);
    const total = Number.isFinite(override) ? override : Number(base ?? 0) + Number(bonus ?? 0) + storedBonus;
    return { base: Number(base ?? 0), bonus: Number(bonus ?? 0) + storedBonus, override: Number.isFinite(override) ? override : null, total };
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
    const fromEsp = Math.floor(Number(esp ?? 0) / 25) * 2;
    const fromMp = Math.floor(Number(mp ?? 0) / 25) * 2;
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

    const size = String(stored.defense?.size ?? combatStored.defenses?.size ?? sys.species?.size ?? "Average");
    const nsrBase = ErrantEarthCharacterSheet._EE_NSR_BY_SIZE[size.toLowerCase()] ?? ErrantEarthCharacterSheet._EE_NSR_BY_SIZE.average;
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
    const armorBlock = combatStored.armor ?? {};
    const equipmentArmorRating = equipmentSources.reduce((max, source) => Math.max(max, Number(source?.ar ?? source?.system?.ar ?? 0)), 0);
    const armorRatingBase = Math.max(Number(combatStored.defenses?.armorRating ?? combatStored.armor?.rating ?? 0), equipmentArmorRating);
    const soakSource = key => Number(combatStored.soak?.[key] ?? 0) + Number(armorBlock.soak ?? 0);
    const resistanceSource = key => Number(combatStored.resistance?.[key] ?? 0) + Number(armorBlock.resistance ?? 0);

    return {
      tier,
      health: {
        endurance: ErrantEarthCharacterSheet._eeAdjustable(enduranceBase, stored.health?.endurance, bonus("health.endurance", ["endurance"])),
        health: ErrantEarthCharacterSheet._eeAdjustable(healthBase, stored.health?.health, bonus("health.health", ["health"])),
        scars: { value: Number(stored.health?.scars?.value ?? combatStored.health?.scars?.value ?? 0), max: Number(stored.health?.scars?.max ?? combatStored.health?.scars?.max ?? 5) },
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
      armor: {
        name: armorBlock.name || "",
        rating: ErrantEarthCharacterSheet._eeAdjustable(armorRatingBase, stored.armor?.rating, bonus("armor.rating", ["armor rating", "ar"])),
        soak: ErrantEarthCharacterSheet._eeAdjustable(Number(armorBlock.soak ?? 0), stored.armor?.soak, bonus("armor.soak", ["soak"])),
        resistance: ErrantEarthCharacterSheet._eeAdjustable(Number(armorBlock.resistance ?? 0), stored.armor?.resistance, bonus("armor.resistance", ["resistance"])),
        damageScale: armorBlock.damageScale || combatStored.damageScale || tierMods.damageScale,
        notes: armorBlock.notes || ""
      },
      soak: {
        physical: ErrantEarthCharacterSheet._eeAdjustable(soakSource("physical"), stored.soak?.physical, bonus("soak.physical", ["physical soak"])),
        energy: ErrantEarthCharacterSheet._eeAdjustable(soakSource("energy"), stored.soak?.energy, bonus("soak.energy", ["energy soak"])),
        magic: ErrantEarthCharacterSheet._eeAdjustable(soakSource("magic"), stored.soak?.magic, bonus("soak.magic", ["magic soak"])),
        psychic: ErrantEarthCharacterSheet._eeAdjustable(soakSource("psychic"), stored.soak?.psychic, bonus("soak.psychic", ["psychic soak"]))
      },
      resistance: {
        physical: ErrantEarthCharacterSheet._eeAdjustable(resistanceSource("physical"), stored.resistance?.physical, bonus("resistance.physical", ["physical resistance"])),
        energy: ErrantEarthCharacterSheet._eeAdjustable(resistanceSource("energy"), stored.resistance?.energy, bonus("resistance.energy", ["energy resistance"])),
        magic: ErrantEarthCharacterSheet._eeAdjustable(resistanceSource("magic"), stored.resistance?.magic, bonus("resistance.magic", ["magic resistance"])),
        psychic: ErrantEarthCharacterSheet._eeAdjustable(resistanceSource("psychic"), stored.resistance?.psychic, bonus("resistance.psychic", ["psychic resistance"])),
        toxins: ErrantEarthCharacterSheet._eeAdjustable(resistanceSource("toxins"), stored.resistance?.toxins, bonus("resistance.toxins", ["toxin resistance", "poison resistance"])),
        horror: ErrantEarthCharacterSheet._eeAdjustable(resistanceSource("horror"), stored.resistance?.horror, bonus("resistance.horror", ["horror resistance"]))
      },
      social: {
        demeanor,
        atbBonus: ErrantEarthCharacterSheet._eeAdjustable(ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_ATB_TABLE, anm).bonus, stored.social?.atbBonus, bonus("social.atbBonus", ["atb"]))
      },
      saves: {
        psychicResistance: ErrantEarthCharacterSheet._eeAdjustable(wil, stored.saves?.psychicResistance, bonus("saves.psychicResistance", ["psychic resistance"])),
        magicResistance: ErrantEarthCharacterSheet._eeAdjustable(anm, stored.saves?.magicResistance, bonus("saves.magicResistance", ["magic resistance"])),
        horrorAnima: ErrantEarthCharacterSheet._eeAdjustable(anm, stored.saves?.horrorAnima, bonus("saves.horrorAnima", ["horror anima", "horror factor"])),
        horrorWillpower: ErrantEarthCharacterSheet._eeAdjustable(wil, stored.saves?.horrorWillpower, bonus("saves.horrorWillpower", ["horror willpower", "horror factor"]))
      }
    };
  }

  static _parseFlatBonus(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const text = String(value ?? "").trim();
    if (!text) return 0;
    if (!/^[+-]?\d+$/.test(text)) return null;
    return Number(text);
  }

  static _formatSigned(value) {
    const n = Number(value ?? 0) || 0;
    return n >= 0 ? `+${n}` : String(n);
  }

  static _blankRiftsSourceTotals() {
    return {
      attributeBonuses: { iq: 0, me: 0, ma: 0, ps: 0, pp: 0, pe: 0, pb: 0, spd: 0 },
      poolBonuses: { hp: 0, sdc: 0, mdc: 0, isp: 0, ppe: 0 },
      combatBonuses: { attacks: 0, initiative: 0, damage: 0, strike: 0, parry: 0, dodge: 0, pullPunch: 0, roll: 0 },
      saveBonuses: { psionics: 0, drugPoison: 0, insanity: 0, death: 0 }
    };
  }

  static _addRiftsSourceTotal(target, section, key, value) {
    if (!target?.[section] || !(key in target[section])) return;
    target[section][key] += Number(value ?? 0) || 0;
  }

  static _parseRiftsTextBonuses(text, patterns) {
    const raw = String(text ?? "").trim();
    const applied = [];
    const ambiguous = [];
    if (!raw) return { applied, ambiguous };

    const chunks = raw.split(/[\n;,]+/).map(part => part.trim()).filter(Boolean);
    for (const chunk of chunks) {
      const match = chunk.match(/([+-]\s*\d+)/);
      if (!match) {
        ambiguous.push(chunk);
        continue;
      }

      const value = Number(match[1].replace(/\s+/g, ""));
      const lower = chunk.toLowerCase();
      const matches = patterns.filter(pattern => pattern.tests.every(test => test.test(lower)));
      if (matches.length === 1) {
        applied.push({ key: matches[0].key, label: matches[0].label, value, text: chunk });
      } else {
        ambiguous.push(chunk);
      }
    }
    return { applied, ambiguous };
  }

  static _buildRiftsSources(items) {
    const toArr = ErrantEarthCharacterSheet._toArray;
    const totals = ErrantEarthCharacterSheet._blankRiftsSourceTotals();
    const sources = [];
    const attrLabels = { iq: "IQ", me: "ME", ma: "MA", ps: "PS", pp: "PP", pe: "PE", pb: "PB", spd: "SPD" };
    const poolLabels = { hp: "HP", sdc: "SDC", mdc: "MDC", isp: "ISP", ppe: "PPE" };
    const combatPatterns = [
      { key: "attacks", label: "Attacks", tests: [/\b(attacks?|actions?)\b/, /\b(melee|round|action)\b/] },
      { key: "initiative", label: "Initiative", tests: [/\binit(iative)?\b/] },
      { key: "damage", label: "Damage", tests: [/\bdamage\b/] },
      { key: "strike", label: "Strike", tests: [/\bstrike\b/] },
      { key: "parry", label: "Parry", tests: [/\bparry\b/] },
      { key: "dodge", label: "Dodge", tests: [/\bdodge\b/, /^(?!.*\b(auto|automatic)\b)/] },
      { key: "pullPunch", label: "Pull Punch", tests: [/\bpull\b/, /\bpunch\b/] },
      { key: "roll", label: "Roll with Punch/Fall", tests: [/\broll\b/, /\b(punch|fall|impact)\b/] }
    ];
    const savePatterns = [
      { key: "psionics", label: "Save vs Psionics", tests: [/\b(psi|psionic|psionics)\b/] },
      { key: "drugPoison", label: "Save vs Toxins/Poisons", tests: [/\b(poison|poisons|toxin|toxins|drug|drugs)\b/] },
      { key: "insanity", label: "Save vs Insanity", tests: [/\binsanity\b/] },
      { key: "death", label: "Save vs Coma/Death", tests: [/\b(coma|death)\b/] }
    ];

    for (const item of items.filter(Boolean)) {
      const source = {
        name: item.name,
        type: item.system?.isRCC ? "RCC" : (item.type === "race" ? "Race" : "OCC"),
        isRCC: !!item.system?.isRCC,
        attributeBonuses: [],
        poolBonuses: [],
        combatBonuses: [],
        saveBonuses: [],
        abilities: [],
        warnings: [],
        hasDetails: false
      };

      for (const [key, label] of Object.entries(attrLabels)) {
        const raw = item.system?.attributeBonuses?.[key];
        const parsed = ErrantEarthCharacterSheet._parseFlatBonus(raw);
        if (parsed === null) {
          source.attributeBonuses.push({ key, label, raw, applied: false });
          source.warnings.push(`${label} bonus “${raw}” was not auto-applied.`);
        } else if (parsed) {
          ErrantEarthCharacterSheet._addRiftsSourceTotal(totals, "attributeBonuses", key, parsed);
          source.attributeBonuses.push({ key, label, value: parsed, display: ErrantEarthCharacterSheet._formatSigned(parsed), applied: true });
        }
      }

      for (const [key, label] of Object.entries(poolLabels)) {
        const raw = item.system?.poolBonuses?.[key];
        const parsed = ErrantEarthCharacterSheet._parseFlatBonus(raw);
        if (parsed === null) {
          source.poolBonuses.push({ key, label, raw, applied: false });
          source.warnings.push(`${label} pool bonus “${raw}” was not auto-applied.`);
        } else if (parsed) {
          ErrantEarthCharacterSheet._addRiftsSourceTotal(totals, "poolBonuses", key, parsed);
          source.poolBonuses.push({ key, label, value: parsed, display: ErrantEarthCharacterSheet._formatSigned(parsed), applied: true });
        }
      }

      const combat = ErrantEarthCharacterSheet._parseRiftsTextBonuses(item.system?.combatBonuses, combatPatterns);
      for (const bonus of combat.applied) {
        ErrantEarthCharacterSheet._addRiftsSourceTotal(totals, "combatBonuses", bonus.key, bonus.value);
        source.combatBonuses.push({ ...bonus, display: ErrantEarthCharacterSheet._formatSigned(bonus.value), applied: true });
      }
      for (const raw of combat.ambiguous) {
        source.combatBonuses.push({ raw, applied: false });
        source.warnings.push(`Combat bonus “${raw}” was left as a note.`);
      }

      const saves = ErrantEarthCharacterSheet._parseRiftsTextBonuses(item.system?.saveBonuses, savePatterns);
      for (const bonus of saves.applied) {
        ErrantEarthCharacterSheet._addRiftsSourceTotal(totals, "saveBonuses", bonus.key, bonus.value);
        source.saveBonuses.push({ ...bonus, display: ErrantEarthCharacterSheet._formatSigned(bonus.value), applied: true });
      }
      for (const raw of saves.ambiguous) {
        source.saveBonuses.push({ raw, applied: false });
        source.warnings.push(`Save bonus “${raw}” was left as a note.`);
      }

      source.abilities = toArr(item.system?.abilities)
        .filter(a => a?.name || a?.description)
        .map(a => ({ name: a.name ?? "", description: a.description ?? "" }));

      source.hasDetails = !!(source.attributeBonuses.length || source.poolBonuses.length || source.combatBonuses.length || source.saveBonuses.length || source.abilities.length || source.warnings.length);
      sources.push(source);
    }

    return { sources, totals, warnings: [] };
  }

  /** Coerce a value that may be an object with numeric keys back into an array. */
  static _toArray(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") return Object.keys(v)
      .filter(k => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map(k => v[k]);
    return [];
  }

  async getData(options) {
    const ctx = await super.getData(options);
    const sys = ctx.actor.system;
    ctx.config = CONFIG.EE ?? {};

    ctx.mode = sys.mode === "errantEarth" ? "errantEarth" : "rifts";
    ctx.isEE = ctx.mode === "errantEarth";
    ctx.sheetTitle = ctx.isEE ? "ERRANT EARTH" : "RIFTS / PALLADIUM";

    const A = sys.attributes ?? {};
    const iq = Number(A.iq?.value ?? 0);
    const me = Number(A.me?.value ?? 0);
    const ma = Number(A.ma?.value ?? 0);
    const ps = Number(A.ps?.value ?? 0);
    const pp = Number(A.pp?.value ?? 0);
    const pe = Number(A.pe?.value ?? 0);
    const pb = Number(A.pb?.value ?? 0);
    const level = Number(sys.level ?? 1);
    const C = ErrantEarthCharacterSheet;

    const itemBuckets = {
      psionicPower: [], spell: [], weapon: [], armor: [], powerArmor: [],
      vehicle: [], race: [], occ: [], gear: []
    };
    for (const item of this.actor.items) {
      const type = item.type in itemBuckets ? item.type : "gear";
      itemBuckets[type].push(item);
    }
    ctx.itemsByType = itemBuckets;
    ctx.equippedRaceId = sys.equippedRace ?? "";
    ctx.equippedOccId  = sys.equippedOcc  ?? "";
    ctx.equippedRaceItem = ctx.equippedRaceId ? this.actor.items.get(ctx.equippedRaceId) : null;
    ctx.equippedOccItem  = ctx.equippedOccId  ? this.actor.items.get(ctx.equippedOccId)  : null;
    ctx.isRCC = !!ctx.equippedOccItem?.system?.isRCC;

    const riftsSources = C._buildRiftsSources([ctx.equippedOccItem, ctx.equippedRaceItem]);
    if (ctx.isRCC && ctx.equippedRaceItem) riftsSources.warnings.push("RCC replaces Race.");
    const riftsSourceTotals = riftsSources.totals;
    const effectiveAttrs = {
      iq: iq + riftsSourceTotals.attributeBonuses.iq,
      me: me + riftsSourceTotals.attributeBonuses.me,
      ma: ma + riftsSourceTotals.attributeBonuses.ma,
      ps: ps + riftsSourceTotals.attributeBonuses.ps,
      pp: pp + riftsSourceTotals.attributeBonuses.pp,
      pe: pe + riftsSourceTotals.attributeBonuses.pe,
      pb: pb + riftsSourceTotals.attributeBonuses.pb,
      spd: Number(A.spd?.value ?? 0) + riftsSourceTotals.attributeBonuses.spd
    };

    const riftsNumber = value => Number(value ?? 0) || 0;
    const riftsText = value => value == null ? "" : String(value);
    const riftsCombatTotal = (manual, attribute, base = 0, source = 0) => {
      const sourcedBase = base + source;
      return { base: sourcedBase, styleBase: base, manual, attribute, source, total: sourcedBase + manual + attribute };
    };
    const riftsThresholdTotal = (manual, base = "") => {
      const numericBase = Number(base);
      const numericManual = Number(manual);
      if (Number.isFinite(numericBase) && Number.isFinite(numericManual)) {
        return { base, manual, attribute: "", total: numericBase + numericManual };
      }
      return { base, manual: riftsText(manual), attribute: "", total: riftsText(manual) || riftsText(base) };
    };
    const riftsSaveTotal = (entry, attribute, percent = false, source = 0) => {
      const manual = riftsNumber(entry?.bonus);
      const total = manual + attribute + source;
      return { base: entry?.base ?? "", manual, attribute, source, total, percent, display: percent ? `${total}%` : total };
    };

    const iqSkillBonus = C.iqSkillBonus(effectiveAttrs.iq);
    const psionicSave = C.psionicSave(effectiveAttrs.me);
    const insanitySave = C.insanitySave(effectiveAttrs.me);
    const trustIntimidate = C.trustIntimidate(effectiveAttrs.ma);
    const psDamage = C.psDamage(effectiveAttrs.ps);
    const ppStrike = C.ppStrike(effectiveAttrs.pp);
    const ppParryDodge = C.ppParryDodge(effectiveAttrs.pp);
    const peComaSave = C.peComaSave(effectiveAttrs.pe);
    const peMagicPoison = C.peMagicPoison(effectiveAttrs.pe);
    const charmImpress = C.charmImpress(effectiveAttrs.pb);

    const hthTables = CONFIG.EE?.RIFTS_HTH_TABLES ?? {};
    const hthType = hthTables[sys.handToHand?.type] ? sys.handToHand.type : "basic";
    const hthTable = hthTables[hthType] ?? { levels: [] };
    const hthBase = {
      attacks: 0, initiative: 0, strike: 0, parry: 0, dodge: 0, damage: 0,
      pullPunch: 0, roll: 0, critical: "", knockout: ""
    };
    const hthNotes = [];
    for (const entry of hthTable.levels ?? []) {
      if (Number(entry.level ?? 0) > level) continue;
      for (const key of Object.keys(hthBase)) {
        if (entry[key] !== undefined) hthBase[key] = entry[key];
      }
      hthNotes.push(...(entry.notes ?? []).map(note => ({ level: entry.level, text: note })));
    }
    const hthManual = {
      attacks: riftsNumber(sys.handToHand?.attacks),
      initiative: riftsNumber(sys.handToHand?.initiative),
      damage: riftsNumber(sys.handToHand?.damage),
      strike: riftsNumber(sys.handToHand?.strike),
      parry: riftsNumber(sys.handToHand?.parry),
      dodge: riftsNumber(sys.handToHand?.dodge),
      pullPunch: riftsNumber(sys.handToHand?.pullPunch ?? sys.handToHand?.pullRoll),
      roll: riftsNumber(sys.handToHand?.roll ?? sys.handToHand?.pullRoll),
      critical: sys.handToHand?.critical ?? 0,
      knockout: sys.handToHand?.knockout ?? 0
    };
    const handToHand = {
      type: hthType,
      label: hthTable.label ?? CONFIG.EE?.HTH_TYPES?.[hthType] ?? hthType,
      level,
      base: hthBase,
      notes: hthNotes,
      attacks: riftsCombatTotal(hthManual.attacks, 0, riftsNumber(hthBase.attacks), riftsSourceTotals.combatBonuses.attacks),
      initiative: riftsCombatTotal(hthManual.initiative, 0, riftsNumber(hthBase.initiative), riftsSourceTotals.combatBonuses.initiative),
      damage: riftsCombatTotal(hthManual.damage, psDamage, riftsNumber(hthBase.damage), riftsSourceTotals.combatBonuses.damage),
      strike: riftsCombatTotal(hthManual.strike, ppStrike, riftsNumber(hthBase.strike), riftsSourceTotals.combatBonuses.strike),
      parry: riftsCombatTotal(hthManual.parry, ppParryDodge, riftsNumber(hthBase.parry), riftsSourceTotals.combatBonuses.parry),
      dodge: riftsCombatTotal(hthManual.dodge, ppParryDodge, riftsNumber(hthBase.dodge), riftsSourceTotals.combatBonuses.dodge),
      pullPunch: riftsCombatTotal(hthManual.pullPunch, 0, riftsNumber(hthBase.pullPunch), riftsSourceTotals.combatBonuses.pullPunch),
      roll: riftsCombatTotal(hthManual.roll, 0, riftsNumber(hthBase.roll), riftsSourceTotals.combatBonuses.roll),
      critical: riftsThresholdTotal(hthManual.critical, hthBase.critical),
      knockout: riftsThresholdTotal(hthManual.knockout, hthBase.knockout)
    };

    ctx.riftsDerived = {
      iqSkillBonus,
      psionicSave,
      insanitySave,
      trustIntimidate,
      psDamage,
      ppStrike,
      ppParryDodge,
      peComaSave,
      peMagicPoison,
      charmImpress,
      attrBonuses: {
        iq:  iqSkillBonus ? `+${iqSkillBonus}% skills` : "",
        me:  [psionicSave ? `+${psionicSave} psi` : "", insanitySave ? `+${insanitySave} insanity` : ""].filter(Boolean).join(", "),
        ma:  trustIntimidate ? `${trustIntimidate}% trust/intim.` : "",
        ps:  psDamage ? `+${psDamage} damage` : "",
        pp:  [ppStrike ? `+${ppStrike} strike` : "", ppParryDodge ? `+${ppParryDodge} parry/dodge` : ""].filter(Boolean).join(", "),
        pe:  [peComaSave ? `+${peComaSave}% coma/death` : "", peMagicPoison ? `+${peMagicPoison} magic/poison` : ""].filter(Boolean).join(", "),
        pb:  charmImpress ? `${charmImpress}% charm/impress` : "",
        spd: ""
      },
      handToHand,
      combat: {
        damage: handToHand.damage,
        strike: handToHand.strike,
        parry: handToHand.parry,
        dodge: handToHand.dodge
      },
      saves: {
        psionics: riftsSaveTotal(sys.savingThrows?.psionics, psionicSave, false, riftsSourceTotals.saveBonuses.psionics),
        insanity: riftsSaveTotal(sys.savingThrows?.insanity, insanitySave, false, riftsSourceTotals.saveBonuses.insanity),
        drugPoison: riftsSaveTotal(sys.savingThrows?.drugPoison, peMagicPoison, false, riftsSourceTotals.saveBonuses.drugPoison),
        death: riftsSaveTotal(sys.savingThrows?.death, peComaSave, true, riftsSourceTotals.saveBonuses.death)
      },
      sources: riftsSources.sources,
      sourceWarnings: riftsSources.warnings,
      sourceTotals: riftsSourceTotals,
      effectiveAttrs,
      pools: {
        hp: { base: riftsNumber(sys.hp?.max), bonus: riftsSourceTotals.poolBonuses.hp, total: riftsNumber(sys.hp?.max) + riftsSourceTotals.poolBonuses.hp },
        sdc: { base: riftsNumber(sys.sdc?.max), bonus: riftsSourceTotals.poolBonuses.sdc, total: riftsNumber(sys.sdc?.max) + riftsSourceTotals.poolBonuses.sdc },
        mdc: { base: riftsNumber(sys.mdc?.max), bonus: riftsSourceTotals.poolBonuses.mdc, total: riftsNumber(sys.mdc?.max) + riftsSourceTotals.poolBonuses.mdc },
        isp: { base: riftsNumber(sys.isp?.max), bonus: riftsSourceTotals.poolBonuses.isp, total: riftsNumber(sys.isp?.max) + riftsSourceTotals.poolBonuses.isp },
        ppe: { base: riftsNumber(sys.ppe?.max), bonus: riftsSourceTotals.poolBonuses.ppe, total: riftsNumber(sys.ppe?.max) + riftsSourceTotals.poolBonuses.ppe }
      }
    };

    const toArr = ErrantEarthCharacterSheet._toArray;

    // Auto-compute skill totals: Base + PerLvl * (Level - 1) + Misc [+ IQ bonus, RIFTS only].
    const iqBonusForSkills = ctx.isEE ? 0 : ctx.riftsDerived.iqSkillBonus;
    const skillRows = toArr(sys.skills?.list).map((r, i) => {
      const base   = Number(r.base   ?? 0);
      const perLvl = Number(r.perLvl ?? 0);
      const misc   = Number(r.misc   ?? 0);
      const total  = base + perLvl * Math.max(0, level - 1) + misc + iqBonusForSkills;
      return { ...r, _index: i, total };
    });
    ctx.skills = {
      occ:        skillRows.filter(r => r.category === "occ"),
      occRelated: skillRows.filter(r => r.category === "occRelated"),
      secondary:  skillRows.filter(r => r.category === "secondary"),
      unassigned: skillRows.filter(r => !r.category)
    };

    const eeAttrs = sys.eeAttributes ?? {};
    const eeSkillRows = toArr(sys.eeSkills?.list).map((r, i) => {
      const attrKey     = r.attribute ?? "";
      const attrValue   = Number(eeAttrs[attrKey]?.value ?? 0);
      const rank        = Number(r.rank ?? 0);
      const proficiency = Number(r.proficiency ?? 0);
      const bonus       = Number(r.bonus ?? 0);
      const total       = attrValue + rank + proficiency + bonus;
      return { ...r, _index: i, attrValue, total };
    });
    ctx.eeSkills = { list: eeSkillRows };

    // Master-list pickers: only show skills not already on the actor.
    const usedKeys = new Set(skillRows.map(r => r.key).filter(Boolean));
    const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => !usedKeys.has(s.key));
    const grouped = {};
    for (const s of masterList) (grouped[s.group] ??= []).push(s);
    ctx.skillPicker = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, items]) => ({ group, items }));

    const usedEeKeys = new Set(eeSkillRows.map(r => r.key).filter(Boolean));
    const eeMasterList = (CONFIG.EE?.EE_SKILL_LIST ?? []).filter(s => !usedEeKeys.has(s.key));
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
    // weaponProficiencies: { selected: {key: bool}, custom: [{name}] }
    const wpSelected = (sys.weaponProficiencies && typeof sys.weaponProficiencies === "object" && !Array.isArray(sys.weaponProficiencies))
      ? (sys.weaponProficiencies.selected ?? {})
      : {};
    const wpCustom = (sys.weaponProficiencies && typeof sys.weaponProficiencies === "object")
      ? toArr(sys.weaponProficiencies.custom)
      : [];
    ctx.system.weaponProficiencies = { selected: wpSelected, custom: wpCustom };
    const wpDecorate = (entries) => entries.map(e => ({
      ...e, checked: !!wpSelected[e.key]
    }));
    ctx.wpAncient = wpDecorate(CONFIG.EE?.WP_LIST?.ancient ?? []);
    ctx.wpModern  = wpDecorate(CONFIG.EE?.WP_LIST?.modern  ?? []);
    ctx.system.armor.primary.extras = toArr(sys.armor?.primary?.extras);
    ctx.system.armor.secondary.extras = toArr(sys.armor?.secondary?.extras);
    ctx.system.powerArmor.handToHand.extras = toArr(sys.powerArmor?.handToHand?.extras);
    ctx.system.powerArmor.armor.extras = toArr(sys.powerArmor?.armor?.extras);
    ctx.system.powerArmor.weapons = toArr(sys.powerArmor?.weapons);
    ctx.system.powers = toArr(sys.powers);
    if (ctx.system.psionics) {
      ctx.system.psionics.healing   = toArr(sys.psionics?.healing);
      ctx.system.psionics.sensitive = toArr(sys.psionics?.sensitive);
      ctx.system.psionics.physical  = toArr(sys.psionics?.physical);
      ctx.system.psionics.super     = toArr(sys.psionics?.super);
    }
    if (ctx.system.vehicle) {
      ctx.system.vehicle.handToHand.extras = toArr(sys.vehicle?.handToHand?.extras);
      ctx.system.vehicle.armor.extras = toArr(sys.vehicle?.armor?.extras);
      ctx.system.vehicle.weapons = toArr(sys.vehicle?.weapons);
    }
    ctx.system.contacts = toArr(sys.contacts);
    ctx.system.backgrounds = toArr(sys.backgrounds);
    ctx.system.occupations = toArr(sys.occupations);
    ctx.system.eeSkills = { ...(ctx.system.eeSkills ?? {}), list: toArr(sys.eeSkills?.list) };
    if (ctx.system.money) ctx.system.money.outfits = toArr(sys.money?.outfits);

    const equipmentSources = this.actor.items.map(item => ({ ...item.system, name: item.name, type: item.type, system: item.system }));
    ctx.eeDerived = C.eeDerivedData(sys, equipmentSources);
    ctx.weaponItemsModern  = itemBuckets.weapon.filter(i => (i.system?.category ?? "modern") === "modern");
    ctx.weaponItemsAncient = itemBuckets.weapon.filter(i => i.system?.category === "ancient");

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
    if (!this.isEditable) return;

    html.on("click", "[data-action='add-row']",    this._onAddRow.bind(this));
    html.on("change", "[data-action='add-skill']", this._onAddSkill.bind(this));
    html.on("click", "[data-action='delete-row']", this._onDeleteRow.bind(this));
    html.on("click", "[data-action='roll']",       this._onRoll.bind(this));
    html.on("click", "[data-action='edit-item']",  this._onEditItem.bind(this));
    html.on("click", "[data-action='delete-item']", this._onDeleteItem.bind(this));
    html.on("click", "[data-action='create-item']", this._onCreateItem.bind(this));
    html.on("click", "[data-action='equip-item']",   this._onEquipItem.bind(this));
    html.on("click", "[data-action='unequip-item']", this._onUnequipItem.bind(this));
    html.on("change", "[data-action='toggle-mode']", this._onToggleMode.bind(this));
    html.on("change", "[data-action='cc-pick']",     this._onCcPick.bind(this));

    const dropZone = html.find(".ee-items-tab")[0];
    if (dropZone) {
      dropZone.addEventListener("dragenter", () => dropZone.classList.add("ee-drop-hover"));
      dropZone.addEventListener("dragleave", (ev) => {
        if (!dropZone.contains(ev.relatedTarget)) dropZone.classList.remove("ee-drop-hover");
      });
      dropZone.addEventListener("drop", () => dropZone.classList.remove("ee-drop-hover"));
    }
  }

  async _onCreateItem(ev) {
    ev.preventDefault();
    const type = ev.currentTarget.dataset.type;
    const labels = {
      psionicPower: "Psionic Power",
      spell: "Spell",
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

  async _onEquipItem(ev) {
    ev.preventDefault();
    const id = ev.currentTarget.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    return this._equipCcItem(item);
  }

  /** Merge OCC starting skills into the actor's skill list. Skips any that
   *  are already on the actor (matched by key for canonical skills, by
   *  name+custom for free-text rows). Existing skill values are never
   *  overwritten. */
  _mergeOccSkillsIntoActor(occItem) {
    const occSkills = ErrantEarthCharacterSheet._toArray(occItem.system?.skills);
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
        if (usedKeys.has(s.key)) continue;
        usedKeys.add(s.key);
      }
      merged.push({
        key: s.key ?? "",
        name: s.name ?? "",
        base: Number(s.base ?? 0),
        perLvl: Number(s.perLvl ?? 0),
        misc: 0,
        category: s.category || "occ",
        custom: !!isCustom
      });
      added++;
    }
    return added ? merged : null;
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
    if (item.type === "race") {
      const equippedOccId = this.actor.system.equippedOcc;
      const equippedOcc = equippedOccId ? this.actor.items.get(equippedOccId) : null;
      if (equippedOcc?.system?.isRCC) {
        ui.notifications?.warn(`Cannot equip a Race while an RCC ("${equippedOcc.name}") is equipped.`);
        return this.render(false);
      }
      return this.actor.update({ "system.equippedRace": item.id, "system.race": item.name });
    }
    if (item.type === "occ") {
      const update = { "system.equippedOcc": item.id, "system.occ": item.name };
      if (item.system?.isRCC) {
        update["system.equippedRace"] = "";
        update["system.race"] = item.name;
      }
      const mergedSkills = this._mergeOccSkillsIntoActor(item);
      if (mergedSkills) update["system.skills.list"] = mergedSkills;
      return this.actor.update(update);
    }
  }

  async _onToggleMode(ev) {
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
    add("Momentum", eeDerived.combat?.momentum?.total ?? sys.eeCombat?.momentum);
    add("ESP", eeDerived.resources?.esp?.total);
    add("MP", eeDerived.resources?.mp?.total);
    add("Glimmer", eeDerived.resources?.glimmer?.total);
    return resources.join(", ");
  }

  static _parseIntSafe(v) {
    if (v === null || v === undefined) return 0;
    const m = String(v).trim().match(/^([+-]?\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  async _onRoll(ev) {
    ev.preventDefault();
    const el = ev.currentTarget;
    const type  = el.dataset.rollType;
    const label = el.dataset.label || "Roll";
    const PIS = ErrantEarthCharacterSheet._parseIntSafe;
    const isEE = this.actor.system.mode === "errantEarth";
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
          const choice = await ErrantEarthCharacterSheet._promptDifficulty(label, "d20");
          if (choice === null) return;
          const tierBonus = ErrantEarthCharacterSheet._eeTierStep(tier);
          const target = Math.max(1, Math.min(20, baseTarget + choice.d20 + tierBonus));
          roll = await new Roll("1d20").evaluate();
          const natural = roll.total;
          const auto = ErrantEarthCharacterSheet._eeAutoRule(natural, 20, "rollUnder");
          const success = auto ? auto === "success" : natural <= target;
          const margin = target - natural;
          card.subtitle = [`Target ${target} (d20 roll-under)`, ...ErrantEarthCharacterSheet._eeDifficultyParts(choice), `Tier ${tier}${tierBonus ? ` (+${tierBonus})` : ""}`].join(" — ");
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
          const formula = (el.dataset.formula || "").trim();
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
          }
          const target = baseTarget + modifier;
          roll = await new Roll("1d100").evaluate();
          const autoFail = isEE && roll.total >= 99;
          const success = !autoFail && roll.total <= target;
          const subParts = [`Target ${target}% (roll under)`];
          if (isEE) {
            subParts.push(modLabel ? `${modLabel} (${modifier >= 0 ? "+" : ""}${modifier}%)` : "Standard");
            subParts.push("EE");
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
        case "damage": {
          const formula = (el.dataset.formula || "").trim();
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

  _getArrayPath(path) {
    const raw = path.split(".").reduce((o, k) => (o ? o[k] : undefined), this.actor.system);
    return ErrantEarthCharacterSheet._toArray(raw);
  }

  async _onAddRow(ev) {
    ev.preventDefault();
    const btn = ev.currentTarget;
    let path = btn.dataset.path;
    const kind = btn.dataset.kind;
    if (kind === "skill" && this.actor.system.mode === "errantEarth") path = "eeSkills.list";
    const arr  = foundry.utils.deepClone(this._getArrayPath(path));
    arr.push(this._blankRow(kind, path));
    await this.actor.update({ [`system.${path}`]: arr });
  }

  async _onAddSkill(ev) {
    ev.preventDefault();
    const sel = ev.currentTarget;
    const key = sel.value;
    const category = sel.dataset.category;
    const isEE = this.actor.system.mode === "errantEarth" || sel.dataset.ee === "true";
    if (!key) return;

    if (isEE) {
      const master = (CONFIG.EE?.EE_SKILL_LIST ?? []).find(s => s.key === key);
      if (!master) { sel.value = ""; return; }
      const arr = foundry.utils.deepClone(this._getArrayPath("eeSkills.list"));
      arr.push({
        key: master.key,
        name: master.name,
        attribute: master.attribute ?? "",
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
    const arr = foundry.utils.deepClone(this._getArrayPath("skills.list"));
    arr.push({
      key: master.key,
      name: master.name,
      base: master.base,
      perLvl: master.perLvl,
      misc: 0,
      category,
      custom: false
    });
    sel.value = "";
    await this.actor.update({ "system.skills.list": arr });
  }

  async _onDeleteRow(ev) {
    ev.preventDefault();
    const btn  = ev.currentTarget;
    const path = btn.dataset.path;
    const idx  = Number(btn.dataset.index);
    const arr  = foundry.utils.deepClone(this._getArrayPath(path));
    arr.splice(idx, 1);
    await this.actor.update({ [`system.${path}`]: arr });
  }

  _blankRow(kind, path = "") {
    switch (kind) {
      case "skill":
        if (path === "eeSkills.list" || this.actor.system.mode === "errantEarth") {
          return { key: "", name: "", attribute: "", category: "", tags: "", rank: 0, proficiency: 0, bonus: 0, notes: "", custom: true };
        }
        return { key: "", name: "", base: 0, perLvl: 0, misc: 0, category: "", custom: true };
      case "wpCustom":      return { name: "" };
      case "modernWeapon":  return { name: "", damageType: "", damage: "", damageScale: "S", ammo: "", payload: "", strike: "", range: "", rate: "", special: "" };
      case "ancientWeapon": return { name: "", damageType: "", damage: "", damageScale: "S", ammo: "", strike: "", parry: "", special: "" };
      case "saveExtra":     return { name: "", base: 0, bonus: 0 };
      case "h2hExtra":      return { name: "", value: 0 };
      case "armorExtra":    return { name: "", current: 0, max: 0 };
      case "power":         return { name: "", source: "", cost: "", range: "", saving: "", damage: "", duration: "", description: "" };
      case "paWeapon":      return { name: "", damageType: "", damage: "", damageScale: "S", ammo: "", strike: "", range: "", special: "" };
      case "vehicleWeapon": return { type: "", damageType: "", damage: "", damageScale: "S", ammo: "" };
      case "contact":       return { name: "", occupation: "", notes: "" };
      case "outfit":        return { name: "", checked: false };
      case "psionic":       return { name: "", isp: "", notes: "" };
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
    if (sys.powerArmor?.handToHand && "type" in sys.powerArmor.handToHand)
      sys.powerArmor.handToHand.type = ErrantEarthCharacterSheet._validateEnum(sys.powerArmor.handToHand.type, cfg.HTH_TYPES);
    const scrubArr = (arr, field, choices) => {
      if (!Array.isArray(arr)) return;
      for (const row of arr) {
        if (row && typeof row === "object" && field in row)
          row[field] = ErrantEarthCharacterSheet._validateEnum(row[field], choices);
      }
    };
    scrubArr(sys.weapons?.modern,    "damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.weapons?.ancient,   "damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.powerArmor?.weapons,"damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.vehicle?.weapons,   "damageType", cfg.DAMAGE_TYPES);
    scrubArr(sys.weapons?.modern,    "damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.weapons?.ancient,   "damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.powerArmor?.weapons,"damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.vehicle?.weapons,   "damageScale", cfg.EE_DAMAGE_SCALES);
    scrubArr(sys.powers,             "source",     cfg.POWER_SOURCES);
    scrubArr(sys.eeSkills?.list,     "attribute",  cfg.EE_ATTRIBUTES);
    scrubArr(sys.eeSkills?.list,     "category",   cfg.EE_SKILL_CATEGORIES);
    return expanded;
  }

  async _updateObject(event, formData) {
    const expanded = ErrantEarthCharacterSheet._coerceArrays(foundry.utils.expandObject(formData));
    ErrantEarthCharacterSheet._validateEnums(expanded);
    return this.document.update(expanded);
  }
}
