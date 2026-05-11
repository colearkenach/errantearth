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

  static _eeCollectBonuses(sys, path, textKeys = []) {
    const sources = [
      ...ErrantEarthCharacterSheet._toArray(sys.backgrounds),
      ...ErrantEarthCharacterSheet._toArray(sys.occupations),
      sys.species
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

  static eeDerivedData(sys = {}) {
    const attrs = sys.eeAttributes ?? {};
    const attr = key => Number(attrs[key]?.value ?? 0);
    const anm = attr("anm");
    const brv = attr("brv");
    const com = attr("com");
    const hrd = attr("hrd");
    const pow = attr("pow");
    const spd = attr("spd");
    const wil = attr("wil");
    const level = Math.max(1, Number(sys.level ?? 1));
    const stored = sys.eeDerived ?? {};

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

    const size = String(stored.defense?.size ?? sys.species?.size ?? "Average");
    const nsrBase = ErrantEarthCharacterSheet._EE_NSR_BY_SIZE[size.toLowerCase()] ?? ErrantEarthCharacterSheet._EE_NSR_BY_SIZE.average;
    const enduranceBase = 7 + hrd + Math.ceil(2.5 * level);
    const healthBase = hrd;
    const espBase = anm * 2;
    const mpBase = wil * 2;
    const glimmerBase = ErrantEarthCharacterSheet._eeGlimmer(espBase, mpBase);
    const glimmerBand = ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_GLIMMER_TABLE, glimmerBase);
    const carryBase = (pow + hrd) / 2;

    const actionsBase = Number(sys.eeCombat?.actions ?? 0) || 1;
    const actions = ErrantEarthCharacterSheet._eeAdjustable(actionsBase, stored.combat?.actions, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "combat.actions", ["actions?", "combat actions?"]));
    const momentum = ErrantEarthCharacterSheet._eeAdjustable(Number(sys.eeCombat?.momentum ?? 0), stored.combat?.momentum, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "combat.momentum", ["momentum"]));
    const reactions = ErrantEarthCharacterSheet._eeAdjustable(Number(sys.eeCombat?.reactions ?? 0), stored.combat?.reactions, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "combat.reactions", ["reactions?"]));

    return {
      tier: sys.eeAttributeTier ?? "Mortal",
      health: {
        endurance: ErrantEarthCharacterSheet._eeAdjustable(enduranceBase, stored.health?.endurance, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "health.endurance", ["endurance"])),
        health: ErrantEarthCharacterSheet._eeAdjustable(healthBase, stored.health?.health, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "health.health", ["health"])),
        scars: { value: Number(stored.health?.scars?.value ?? 0), max: Number(stored.health?.scars?.max ?? 5) }
      },
      defense: {
        size,
        nsr: ErrantEarthCharacterSheet._eeAdjustable(nsrBase, stored.defense?.nsr, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "defense.nsr", ["nsr", "survival rating"])),
        msr: ErrantEarthCharacterSheet._eeAdjustable(0, stored.defense?.msr, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "defense.msr", ["msr"])),
        armorRating: ErrantEarthCharacterSheet._eeAdjustable(0, stored.defense?.armorRating, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "defense.armorRating", ["armor rating", "ar"]))
      },
      resources: {
        esp: ErrantEarthCharacterSheet._eeAdjustable(espBase, stored.resources?.esp, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "resources.esp", ["esp", "extra sensory power"])),
        mp: ErrantEarthCharacterSheet._eeAdjustable(mpBase, stored.resources?.mp, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "resources.mp", ["mp", "magic power"])),
        glimmer: { ...ErrantEarthCharacterSheet._eeAdjustable(glimmerBase, stored.resources?.glimmer, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "resources.glimmer", ["glimmer"])), description: glimmerBand.description, detectionBonus: glimmerBand.bonus, detectionPercent: glimmerBand.percent }
      },
      combat: {
        strength,
        actions,
        momentum,
        reactions,
        initiative: ErrantEarthCharacterSheet._eeAdjustable(reaction.initiativeBonus, stored.combat?.initiative, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "combat.initiative", ["initiative"]))
      },
      movement: {
        reaction,
        pace: ErrantEarthCharacterSheet._eeAdjustable(reaction.pace, stored.movement?.pace, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "movement.pace", ["pace", "movement"])),
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
        atbBonus: ErrantEarthCharacterSheet._eeAdjustable(ErrantEarthCharacterSheet._eeBand(ErrantEarthCharacterSheet._EE_ATB_TABLE, anm).bonus, stored.social?.atbBonus, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "social.atbBonus", ["atb"]))
      },
      saves: {
        psychicResistance: ErrantEarthCharacterSheet._eeAdjustable(wil, stored.saves?.psychicResistance, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "saves.psychicResistance", ["psychic resistance"])),
        magicResistance: ErrantEarthCharacterSheet._eeAdjustable(anm, stored.saves?.magicResistance, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "saves.magicResistance", ["magic resistance"])),
        horrorAnima: ErrantEarthCharacterSheet._eeAdjustable(anm, stored.saves?.horrorAnima, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "saves.horrorAnima", ["horror anima", "horror factor"])),
        horrorWillpower: ErrantEarthCharacterSheet._eeAdjustable(wil, stored.saves?.horrorWillpower, ErrantEarthCharacterSheet._eeCollectBonuses(sys, "saves.horrorWillpower", ["horror willpower", "horror factor"]))
      }
    };
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

    ctx.derived = {
      iqBonus:         C.iqSkillBonus(iq),
      psionicSave:     C.psionicSave(me),
      insanitySave:    C.insanitySave(me),
      trustIntimidate: C.trustIntimidate(ma),
      psDamage:        C.psDamage(ps),
      ppStrike:        C.ppStrike(pp),
      ppParryDodge:    C.ppParryDodge(pp),
      peComaSave:      C.peComaSave(pe),
      peMagicPoison:   C.peMagicPoison(pe),
      charmImpress:    C.charmImpress(pb),
      attrBonuses: {
        iq:  C.iqSkillBonus(iq) ? `+${C.iqSkillBonus(iq)}% skills` : "",
        me:  [C.psionicSave(me) ? `+${C.psionicSave(me)} psi` : "", C.insanitySave(me) ? `+${C.insanitySave(me)} insanity` : ""].filter(Boolean).join(", "),
        ma:  C.trustIntimidate(ma) ? `${C.trustIntimidate(ma)}% trust/intim.` : "",
        ps:  C.psDamage(ps) ? `+${C.psDamage(ps)} damage` : "",
        pp:  [C.ppStrike(pp) ? `+${C.ppStrike(pp)} strike` : "", C.ppParryDodge(pp) ? `+${C.ppParryDodge(pp)} parry/dodge` : ""].filter(Boolean).join(", "),
        pe:  [C.peComaSave(pe) ? `+${C.peComaSave(pe)}% coma/death` : "", C.peMagicPoison(pe) ? `+${C.peMagicPoison(pe)} magic/poison` : ""].filter(Boolean).join(", "),
        pb:  C.charmImpress(pb) ? `${C.charmImpress(pb)}% charm/impress` : "",
        spd: ""
      }
    };

    ctx.eeDerived = C.eeDerivedData(sys);

    const toArr = ErrantEarthCharacterSheet._toArray;

    // Auto-compute skill totals: Base + PerLvl * (Level - 1) + Misc [+ IQ bonus, RIFTS only].
    const iqBonusForSkills = ctx.isEE ? 0 : ctx.derived.iqBonus;
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

    // Master-list picker: only show skills not already on the actor.
    const usedKeys = new Set(skillRows.map(r => r.key).filter(Boolean));
    const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => !usedKeys.has(s.key));
    const grouped = {};
    for (const s of masterList) (grouped[s.group] ??= []).push(s);
    ctx.skillPicker = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, items]) => ({ group, items }));

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
    if (ctx.system.money) ctx.system.money.outfits = toArr(sys.money?.outfits);

    const itemBuckets = {
      psionicPower: [], spell: [], weapon: [], armor: [], powerArmor: [],
      vehicle: [], race: [], occ: [], gear: []
    };
    for (const item of this.actor.items) {
      const type = item.type in itemBuckets ? item.type : "gear";
      itemBuckets[type].push(item);
    }
    ctx.itemsByType = itemBuckets;
    ctx.weaponItemsModern  = itemBuckets.weapon.filter(i => (i.system?.category ?? "modern") === "modern");
    ctx.weaponItemsAncient = itemBuckets.weapon.filter(i => i.system?.category === "ancient");

    ctx.equippedRaceId = sys.equippedRace ?? "";
    ctx.equippedOccId  = sys.equippedOcc  ?? "";
    ctx.equippedRaceItem = ctx.equippedRaceId ? this.actor.items.get(ctx.equippedRaceId) : null;
    ctx.equippedOccItem  = ctx.equippedOccId  ? this.actor.items.get(ctx.equippedOccId)  : null;
    ctx.isRCC = !!ctx.equippedOccItem?.system?.isRCC;

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

  /** Pop a single-select dialog asking the player which difficulty band the
   *  GM has set for this skill check. Returns { modifier, label } or null on
   *  cancel. */
  static async _promptDifficulty(rollLabel) {
    const bands = [
      { key: "easy",     label: "Easy",     modifier: 20 },
      { key: "routine",  label: "Routine",  modifier: 10 },
      { key: "standard", label: "Standard", modifier: 0  },
      { key: "difficult",label: "Difficult",modifier: -10 },
      { key: "hard",     label: "Hard",     modifier: -20 },
      { key: "hellish",  label: "Hellish",  modifier: -30 }
    ];
    return new Promise((resolve) => {
      const buttons = {};
      for (const b of bands) {
        const sign = b.modifier >= 0 ? "+" : "";
        buttons[b.key] = {
          label: `${b.label} (${sign}${b.modifier}%)`,
          callback: () => resolve({ modifier: b.modifier, label: b.label })
        };
      }
      new Dialog({
        title: `Difficulty: ${rollLabel}`,
        content: `<p>Pick the difficulty band for this skill check.</p>`,
        buttons,
        default: "standard",
        close: () => resolve(null)
      }, { classes: ["errantearth", "dialog", "ee-difficulty"], width: 460 }).render(true);
    });
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

    const card = { kind: type, label, subtitle: "", outcome: "", outcomeClass: "" };

    try {
      let roll;
      switch (type) {
        case "skill": {
          const baseTarget = Number(el.dataset.target ?? 0);
          const isEE = this.actor.system.mode === "errantEarth";
          let modifier = 0;
          let modLabel = "";
          if (isEE) {
            const choice = await ErrantEarthCharacterSheet._promptDifficulty(label);
            if (choice === null) return; // cancelled
            modifier = choice.modifier;
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
          // EE attribute check: d20 roll-under against the attribute value.
          const target = Number(el.dataset.target ?? 0);
          roll = await new Roll("1d20").evaluate();
          const success = roll.total <= target;
          card.subtitle = `${label} ${target} (d20 roll-under)`;
          card.outcome = success ? "Success" : "Failure";
          card.outcomeClass = success ? "success" : "failure";
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
    const path = btn.dataset.path;
    const kind = btn.dataset.kind;
    const arr  = foundry.utils.deepClone(this._getArrayPath(path));
    arr.push(this._blankRow(kind));
    await this.actor.update({ [`system.${path}`]: arr });
  }

  async _onAddSkill(ev) {
    ev.preventDefault();
    const sel = ev.currentTarget;
    const key = sel.value;
    const category = sel.dataset.category;
    if (!key) return;
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

  _blankRow(kind) {
    switch (kind) {
      case "skill":         return { key: "", name: "", base: 0, perLvl: 0, misc: 0, category: "", custom: true };
      case "wpCustom":      return { name: "" };
      case "modernWeapon":  return { name: "", damageType: "", damage: "", ammo: "", payload: "", strike: "", range: "", rate: "", special: "" };
      case "ancientWeapon": return { name: "", damageType: "", damage: "", ammo: "", strike: "", parry: "", special: "" };
      case "saveExtra":     return { name: "", base: 0, bonus: 0 };
      case "h2hExtra":      return { name: "", value: 0 };
      case "armorExtra":    return { name: "", current: 0, max: 0 };
      case "power":         return { name: "", source: "", cost: "", range: "", saving: "", damage: "", duration: "", description: "" };
      case "paWeapon":      return { name: "", damageType: "", damage: "", ammo: "", strike: "", range: "", special: "" };
      case "vehicleWeapon": return { type: "", damageType: "", damage: "", ammo: "" };
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
    scrubArr(sys.powers,             "source",     cfg.POWER_SOURCES);
    return expanded;
  }

  async _updateObject(event, formData) {
    const expanded = ErrantEarthCharacterSheet._coerceArrays(foundry.utils.expandObject(formData));
    ErrantEarthCharacterSheet._validateEnums(expanded);
    return this.document.update(expanded);
  }
}
