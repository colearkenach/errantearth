import { LegacyPackages } from "./legacy-packages.js";

/** Shared EE Legacy rules. These helpers read data and never update documents. */
export class LegacyRules {
  /** EE Legacy attribute-bonus chart (p.281). Each table is keyed 16..30; values
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
    const base = LegacyRules._lookup(LegacyRules._ATTR_TABLES.iqSkill, iq);
    if (iq <= 30) return base;
    return base + Math.floor((iq - 30) / 5) * 2;
  }
  static psionicSave(me)    { return LegacyRules._lookup(LegacyRules._ATTR_TABLES.mePsionic, me); }
  static insanitySave(me)   { return LegacyRules._lookup(LegacyRules._ATTR_TABLES.meInsanity, me); }
  static trustIntimidate(ma){ return LegacyRules._lookup(LegacyRules._ATTR_TABLES.maTrustPct, ma); }
  static psDamage(ps) {
    const base = LegacyRules._lookup(LegacyRules._ATTR_TABLES.psDamage, ps);
    if (ps <= 30) return base;
    return base + (ps - 30);
  }
  static ppParryDodge(pp)   { return LegacyRules._lookup(LegacyRules._ATTR_TABLES.ppParryDodge, pp); }
  static ppStrike(pp)       { return LegacyRules._lookup(LegacyRules._ATTR_TABLES.ppStrike, pp); }
  static ppInitiative(pp)   { return pp > 30 ? Math.min(6, Math.ceil((pp - 30) / 3)) : 0; }
  static peComaSave(pe) {
    const base = LegacyRules._lookup(LegacyRules._ATTR_TABLES.peComaPct, pe);
    if (pe <= 30) return base;
    return base + (pe - 30);
  }
  static peMagicPoison(pe)  { return LegacyRules._lookup(LegacyRules._ATTR_TABLES.peMagicPoison, pe); }
  static charmImpress(pb)   { return LegacyRules._lookup(LegacyRules._ATTR_TABLES.pbCharmPct, pb); }
  static mePossession(me)   { return me >= 30 ? Math.max(1, Math.floor(me / 10) - 2) : 0; }

  static _formatRiftsNumber(value, decimals = 1) {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return "";
    const fixed = numeric.toFixed(decimals);
    return fixed.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  }

  static _legacyPhysicalStats(attrs = {}, handToHand = {}) {
    const ps = Number(attrs.ps ?? 0);
    const pe = Number(attrs.pe ?? 0);
    const spd = Number(attrs.spd ?? 0);
    const attacks = Math.max(1, Number(handToHand?.attacks?.total ?? 1) || 1);
    const carryMultiplier = ps >= 17 ? 20 : 10;
    const carry = Math.max(0, ps * carryMultiplier);
    const lift = carry * 2;
    const runYardsPerMinute = spd * 20;
    const runYardsPerMelee = spd * 5;
    const runFeetPerAttack = Math.round((runYardsPerMelee * 3 / attacks) * 10) / 10;
    const runMph = spd * 15 / 22;
    const runKph = runMph * 1.609344;
    return {
      carry: `${carry}`,
      lift: `${lift}`,
      throwMax: `${carry}`,
      throwFt: "≤ carried weight; see W.P. Targeting for heavy/awkward objects",
      runMph: LegacyRules._formatRiftsNumber(runMph),
      runKph: LegacyRules._formatRiftsNumber(runKph),
      runYardsPerMinute: `${runYardsPerMinute}`,
      runYardsPerMelee: `${runYardsPerMelee}`,
      runFeetPerAttack: LegacyRules._formatRiftsNumber(runFeetPerAttack),
      startingHp: pe ? `${pe} + 1D6` : "PE + 1D6",
      startingSdc: "2D6 + 12"
    };
  }

  static _legacyLowAttributePenalties(attrs = {}) {
    const attr = key => Number(attrs[key] ?? 0);
    const penalties = {};
    const set = (key, text) => { if (text) penalties[key] = text; };

    const iq = attr("iq");
    if (iq >= 7 && iq <= 8) set("iq", "O.C.C. Related Skills are halved; add 1D4 initial Secondary Skills.");
    else if (iq >= 5 && iq <= 6) set("iq", "O.C.C. Skills -4, O.C.C. Related Skills halved, all skill bonuses halved; add 1D4+2 Secondary Skills.");
    else if (iq >= 3 && iq <= 4) set("iq", "O.C.C. Skills halved, O.C.C. Related Skills total 1D4, no O.C.C. skill bonuses, related skill bonuses halved.");
    else if (iq >= 1 && iq <= 2) set("iq", "Only 1D4+1 O.C.C. Skills, no O.C.C. Related Skills, only 1D4 Secondary Skills, and base/per-level skill progression is halved.");

    const ma = attr("ma");
    if (ma >= 5 && ma <= 7) set("ma", "-10% to several social/information skills, -20% Interrogation; +5% to skills where being overlooked helps.");
    else if (ma >= 3 && ma <= 4) set("ma", "-20% to several social/information skills; -30% Interrogation and Seduction.");
    else if (ma >= 1 && ma <= 2) set("ma", "Severe social penalties: -50% to many social/information skills, worse Seduction/Interrogation vulnerability, and no convincing lie.");

    const me = attr("me");
    if (me >= 5 && me <= 7) set("me", "-3 vs Horror Factor, -2 vs illusions, -1 vs will/psionics/mind control/insanity/possession, and -10% to several social skills.");
    else if (me >= 3 && me <= 4) set("me", "-6 vs Horror Factor, -4 vs illusions, -3 vs will/psionics/mind control/possession, -2 vs insanity, plus phobia risk.");
    else if (me >= 1 && me <= 2) set("me", "-8 vs Horror Factor, -6 vs illusions/will/psionics/mind control/possession, -5 vs insanity, and 1D4+1 phobias.");

    const ps = attr("ps");
    if (ps >= 5 && ps <= 7) set("ps", "No Hand to Hand/O.C.C./weapon damage bonuses; throwing range reduced by 25%. Guns do full damage.");
    else if (ps >= 3 && ps <= 4) set("ps", "Physical damage and throwing range are halved. Guns do full damage.");
    else if (ps >= 1 && ps <= 2) set("ps", "Punches do 1 damage, kicks 1D4, melee weapon damage halved, no damage bonuses, throwing range reduced by 75%.");

    const pp = attr("pp");
    if (pp >= 5 && pp <= 7) set("pp", "-1 initiative; -2 strike, parry, dodge, disarm, entangle, pull punch, and roll with impact; manual-dexterity skill penalties.");
    else if (pp >= 3 && pp <= 4) set("pp", "-3 initiative; combat bonuses are halved; stronger manual-dexterity skill penalties.");
    else if (pp >= 1 && pp <= 2) set("pp", "-5 initiative, no combat bonuses, drops/trips on some 1-4 rolls, and cannot perform high-dexterity skills.");

    const pe = attr("pe");
    if (pe >= 5 && pe <= 7) set("pe", "-2 vs disease, -3 vs drugs/poison, -3 vs magic, -5% vs coma/death, fatigues 25% faster.");
    else if (pe >= 3 && pe <= 4) set("pe", "-6 vs disease, -5 vs drugs/poison, -4 vs magic, -10% vs coma/death, fatigues 50% faster.");
    else if (pe >= 1 && pe <= 2) set("pe", "-8 vs disease, -6 vs drugs/poison, -5 vs magic, -20% vs coma/death, fatigues 75% faster.");

    const pb = attr("pb");
    if (pb >= 5 && pb <= 7) set("pb", "-5% to appearance-sensitive skills, -20% Seduction; +5% Interrogation.");
    else if (pb >= 3 && pb <= 4) set("pb", "-10% to appearance-sensitive skills, -30% Seduction; +10% Interrogation and intimidation.");
    else if (pb >= 1 && pb <= 2) set("pb", "-15% to appearance-sensitive skills, -40% Seduction, -10% Prowl; +15% Interrogation, +5% Gambling, +20% intimidation; Horror Factor 1D6+9.");

    const spd = attr("spd");
    if (spd >= 1 && spd <= 6) set("spd", "-1 initiative, -1 dodge, -10% Dance; +5% Prowl/Palm/Track and +1 Perception from slow careful movement.");

    return penalties;
  }

  static _legacyAttributeEffects(attrs = {}, bonuses = {}, penalties = {}) {
    const labels = { iq: "IQ", me: "ME", ma: "MA", ps: "PS", pp: "PP", pe: "PE", pb: "PB", spd: "SPD" };
    return Object.entries(labels).map(([key, label]) => {
      const bonus = bonuses[key] ?? "";
      const penalty = penalties[key] ?? "";
      return {
        key,
        label,
        value: Number(attrs[key] ?? 0) || 0,
        bonus,
        penalty,
        hasEffect: !!(bonus || penalty),
        tone: penalty ? "penalty" : (bonus ? "bonus" : "")
      };
    });
  }

  static _countLegacyWpLevels(levels = [], level = 1) {
    const current = Math.max(1, Number(level ?? 1) || 1);
    return levels.filter(lvl => current >= Number(lvl ?? 0)).length;
  }

  static _legacyWpRule(key) {
    const rules = CONFIG.EE?.RIFTS_WP_RULES ?? {};
    const rule = rules[key] ?? {};
    if (!rule.sameAs) return rule;
    return { ...(rules[rule.sameAs] ?? {}), ...rule };
  }

  static _legacyWpBonus(key, level = 1, attrs = {}) {
    if (!key) return {};
    const rule = LegacyRules._legacyWpRule(key);
    const count = levels => LegacyRules._countLegacyWpLevels(levels, level);
    const bonus = {
      strike: count(rule.strikeLevels),
      parry: count(rule.parryLevels) + Number(rule.parryFlat ?? 0),
      thrownStrike: count(rule.thrownStrikeLevels),
      damage: count(rule.damageLevels),
      disarm: count(rule.disarmLevels),
      entangle: count(rule.entangleLevels),
      initiative: 0,
      rateOfFire: rule.rateOfFireBase ? Number(rule.rateOfFireBase) + count(rule.rateOfFireLevels) : 0,
      thrownPenalty: Number(rule.thrownPenalty ?? 0)
    };

    if (rule.quickDraw) {
      const pp = Number(attrs.pp ?? 0);
      bonus.initiative = pp >= 31 ? 4 : pp >= 24 ? 3 : pp >= 18 ? 2 : 1;
    }

    return bonus;
  }

  static _legacyWpEntrySummary(entry, level = 1, attrs = {}, selected = {}, actorSelected = {}) {
    const key = entry?.key ?? "";
    const rule = LegacyRules._legacyWpRule(key);
    const bonus = LegacyRules._legacyWpBonus(key, level, attrs);
    const parts = [];
    const add = (label, value, extra = "") => {
      if (!value) return;
      parts.push(`${label} ${LegacyRules._formatSigned(value)}${extra}`);
    };

    add("Strike", bonus.strike);
    add("Parry", bonus.parry, rule.parryLabel ? ` (${rule.parryLabel})` : "");
    add("Thrown Strike", bonus.thrownStrike);
    add("Damage", bonus.damage);
    add("Disarm", bonus.disarm);
    add("Entangle", bonus.entangle);
    add("Initiative", bonus.initiative);
    if (bonus.rateOfFire) parts.push(`Rate ${bonus.rateOfFire}/melee`);
    if (bonus.thrownPenalty) parts.push(`Thrown ${LegacyRules._formatSigned(bonus.thrownPenalty)}`);
    if (rule.skillBonus) parts.push(rule.skillBonus);

    const summary = rule.summary ?? (parts.length ? parts.join("; ") : "No level bonus listed.");
    return {
      ...entry,
      checked: !!selected[key],
      actorChecked: !!actorSelected[key],
      sourceGranted: !!selected[key] && !actorSelected[key],
      sourceOnly: !!selected[key] && !actorSelected[key],
      summary,
      damage: rule.damage ?? "",
      range: rule.range ?? "",
      note: rule.note ?? "",
      bonus
    };
  }

  static _legacyWpOptions(entries = []) {
    return Object.fromEntries(entries.map(e => [e.key, e.name]));
  }

  static _decorateLegacyWeaponRow(row, index, level, attrs, selected) {
    const wpKey = row?.wpKey ?? "";
    const wpName = [
      ...(CONFIG.EE?.WP_LIST?.ancient ?? []),
      ...(CONFIG.EE?.WP_LIST?.modern ?? [])
    ].find(e => e.key === wpKey)?.name ?? "";
    const wpSelected = !!(wpKey && selected?.[wpKey]);
    const wpBonus = wpSelected ? LegacyRules._legacyWpBonus(wpKey, level, attrs) : {};
    const manualStrike = LegacyRules._parseIntSafe(row?.strike);
    const manualParry = LegacyRules._parseIntSafe(row?.parry);
    const penalties = LegacyRules.flatAttributeModifiers(attrs).combat;
    const effectiveStrike = manualStrike + Number(wpBonus.strike ?? 0) + (penalties.strike ?? 0);
    const effectiveParry = manualParry + Number(wpBonus.parry ?? 0) + (penalties.parry ?? 0);
    const effectiveDamage = String(row?.damage ?? "").trim();
    return {
      ...row,
      damageScale: LegacyRules.weaponDamageScale(row),
      _index: index,
      wpKey,
      wpName,
      wpSelected,
      wpBonus,
      effectiveStrike,
      effectiveParry,
      effectiveStrikeDisplay: LegacyRules._formatSigned(effectiveStrike),
      effectiveParryDisplay: LegacyRules._formatSigned(effectiveParry),
      effectiveDamage,
      effectiveDamageDisplay: effectiveDamage || "No formula"
    };
  }

  static _appendDamageBonus(formula, bonus = 0) {
    const base = String(formula ?? "").trim();
    const numericBonus = Number(bonus ?? 0) || 0;
    if (!numericBonus) return base;
    const sign = numericBonus >= 0 ? "+" : "-";
    return base ? `${base} ${sign} ${Math.abs(numericBonus)}` : String(numericBonus);
  }

  static _legacyCombatReferences(handToHand = {}) {
    const sections = CONFIG.EE?.RIFTS_COMBAT_REFERENCES ?? [];
    const hthDamage = Number(handToHand?.damage?.total ?? 0) || 0;
    const bonusFor = key => Number(handToHand?.[key]?.total ?? 0) || 0;
    return sections.map(section => ({
      ...section,
      entries: (section.entries ?? []).map(entry => {
        const bonus = entry.bonusKey ? bonusFor(entry.bonusKey) : 0;
        const damageFormula = entry.damage
          ? LegacyRules._appendDamageBonus(entry.damage, entry.damageAddsHth ? hthDamage : 0)
          : "";
        return {
          ...entry,
          bonus,
          bonusDisplay: entry.bonusKey ? LegacyRules._formatSigned(bonus) : "",
          damageFormula
        };
      })
    }));
  }

  static _decorateUnarmedStrikeRow(row, index, handToHand = {}) {
    const manualStrike = LegacyRules._parseIntSafe(row?.strike);
    const manualParry = LegacyRules._parseIntSafe(row?.parry);
    const hthStrike = Number(handToHand?.strike?.total ?? 0) || 0;
    const hthParry = Number(handToHand?.parry?.total ?? 0) || 0;
    const hthDamage = Number(handToHand?.damage?.total ?? 0) || 0;
    const effectiveStrike = hthStrike + manualStrike;
    const effectiveParry = hthParry + manualParry;
    const effectiveDamage = LegacyRules._appendDamageBonus(row?.damage, hthDamage);
    return {
      ...row,
      _index: index,
      effectiveStrike,
      effectiveParry,
      effectiveStrikeDisplay: LegacyRules._formatSigned(effectiveStrike),
      effectiveParryDisplay: LegacyRules._formatSigned(effectiveParry),
      hthDamageDisplay: LegacyRules._formatSigned(hthDamage),
      effectiveDamage,
      effectiveDamageDisplay: effectiveDamage || "No formula"
    };
  }

  static _defaultUnarmedStrikeRows() {
    return [
      { name: "Punch", damageType: "kinetic", damage: "1d4", damageScale: "S", strike: "", parry: "", actions: "1", special: "", quickRoll: false },
      { name: "Kick", damageType: "kinetic", damage: "1d8", damageScale: "S", strike: "", parry: "", actions: "1", special: "", quickRoll: false },
      { name: "Power Punch", damageType: "kinetic", damage: "(1d4 * 2)", damageScale: "S", strike: "", parry: "", actions: "2", special: "", quickRoll: false },
      { name: "Power Kick", damageType: "kinetic", damage: "(1d8 * 2)", damageScale: "S", strike: "", parry: "", actions: "2", special: "", quickRoll: false },
      { name: "Karate Punch", damageType: "kinetic", damage: "2d4", damageScale: "S", strike: "", parry: "", actions: "1", special: "Requires suitable HtH training", quickRoll: false },
      { name: "Karate Kick", damageType: "kinetic", damage: "2d6", damageScale: "S", strike: "", parry: "", actions: "1", special: "Requires suitable HtH training", quickRoll: false },
      { name: "Knee", damageType: "kinetic", damage: "1d6", damageScale: "S", strike: "", parry: "", actions: "1", special: "", quickRoll: false },
      { name: "Leap Kick", damageType: "kinetic", damage: "3d8", damageScale: "S", strike: "", parry: "", actions: "2", special: "Requires suitable HtH training", quickRoll: false },
      { name: "Body Flip / Throw", damageType: "kinetic", damage: "1d6", damageScale: "S", strike: "", parry: "", actions: "1", special: "Victim loses initiative and one action", quickRoll: false },
      { name: "Body Block / Tackle", damageType: "kinetic", damage: "1d4", damageScale: "S", strike: "", parry: "", actions: "2", special: "May knock target down", quickRoll: false }
    ];
  }

  static _parseFlatBonus(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    const text = String(value ?? "").trim();
    if (!text) return 0;
    if (!/^[+-]?\d+$/.test(text)) return null;
    return Number(text);
  }

  static _normalizeRiftsAttributeRoll(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const bonus = Number(value.bonus ?? 0);
      const numeric = Number(value.value ?? 0);
      const rolled = LegacyRules._coerceBoolean(value.rolled);
      const rollValue = rolled && Number.isFinite(numeric) ? numeric : 0;
      return {
        bonus: Number.isFinite(bonus) ? bonus : 0,
        formula: String(value.formula ?? "").trim(),
        value: Number.isFinite(numeric) ? numeric : 0,
        rolled,
        rollValue,
        total: (Number.isFinite(bonus) ? bonus : 0) + rollValue
      };
    }

    const text = String(value ?? "").trim();
    const parsed = LegacyRules._parseFlatBonus(text);
    if (parsed !== null && parsed !== 0) return { bonus: parsed, formula: "", value: 0, rolled: false, rollValue: 0, total: parsed };
    return { bonus: 0, formula: text, value: 0, rolled: false, rollValue: 0, total: 0 };
  }

  static _riftsAttributeBonusParts(roll) {
    const parts = [];
    if (roll.bonus) parts.push(`Stat ${LegacyRules._formatSigned(roll.bonus)}`);
    if (roll.rolled && roll.rollValue) parts.push(`Roll ${LegacyRules._formatSigned(roll.rollValue)}`);
    return parts;
  }

  static _legacySkillDefinition(row = {}) {
    const key = String(row.key ?? "").trim();
    if (!key) return null;
    return (CONFIG.EE?.SKILL_LIST ?? []).find(s => s.key === key) ?? null;
  }

  static _legacySkillStatBonuses(row = {}) {
    const raw = (row.statBonuses && typeof row.statBonuses === "object")
      ? row.statBonuses
      : (LegacyRules._legacySkillDefinition(row)?.statBonuses ?? {});
    const out = {};
    for (const [key, value] of Object.entries(raw ?? {})) {
      out[key] = LegacyRules._normalizeRiftsAttributeRoll(value);
    }
    return out;
  }

  static _legacySkillStatEntries(row = {}, index = 0) {
    const labels = { iq: "IQ", me: "ME", ma: "MA", ps: "PS", pp: "PP", pe: "PE", pb: "PB", spd: "SPD", hp: "HP", sdc: "SDC", mdc: "MDC", isp: "ISP", ppe: "PPE" };
    return Object.entries(LegacyRules._legacySkillStatBonuses(row))
      .filter(([key]) => labels[key])
      .map(([key, roll]) => {
        const total = Number(roll.total ?? 0) || 0;
        const parts = LegacyRules._riftsAttributeBonusParts(roll);
        const manualValue = !!roll.formula;
        return {
          skillIndex: index,
          key,
          label: labels[key],
          bonus: roll.bonus,
          formula: roll.formula,
          value: roll.value,
          inputValue: roll.value || "",
          rolled: roll.rolled,
          rollValue: roll.rollValue,
          total,
          manualValue,
          display: parts.length ? `${parts.join(", ")} = ${LegacyRules._formatSigned(total)}` : LegacyRules._formatSigned(total),
          rollable: false
        };
      });
  }

  static _buildLegacySkillStatSources(skillRows = []) {
    const totals = {
      attributeBonuses: { iq: 0, me: 0, ma: 0, ps: 0, pp: 0, pe: 0, pb: 0, spd: 0 },
      poolBonuses: { hp: 0, sdc: 0, mdc: 0, isp: 0, ppe: 0 }
    };
    const entries = [];
    for (const [index, row] of skillRows.entries()) {
      const statEntries = LegacyRules._legacySkillStatEntries(row, index);
      for (const entry of statEntries) {
        if (!entry.total) continue;
        if (entry.key in totals.attributeBonuses) totals.attributeBonuses[entry.key] += entry.total;
        else if (entry.key in totals.poolBonuses) totals.poolBonuses[entry.key] += entry.total;
        entries.push({ ...entry, skillName: row.name ?? row.key ?? "Skill" });
      }
    }
    return { totals, entries };
  }

  static _formatSigned(value) {
    const n = Number(value ?? 0) || 0;
    return n >= 0 ? `+${n}` : String(n);
  }

  static _blankRiftsSourceTotals() {
    return {
      attributeBonuses: { iq: 0, me: 0, ma: 0, ps: 0, pp: 0, pe: 0, pb: 0, spd: 0 },
      poolBonuses: { hp: 0, sdc: 0, mdc: 0, isp: 0, ppe: 0 },
      skillBonuses: { byKey: {}, byName: {}, entries: [] },
      weaponProficiencies: { selected: {}, custom: [] },
      combatBonuses: { attacks: 0, initiative: 0, perception: 0, damage: 0, strike: 0, parry: 0, dodge: 0, disarm: 0, entangle: 0, pullPunch: 0, roll: 0 },
      saveBonuses: { spell: 0, ritual: 0, psionics: 0, drugPoison: 0, harmfulDrugs: 0, insanity: 0, possession: 0, horrorFactor: 0, death: 0, pain: 0 }
    };
  }

  static _addRiftsSourceTotal(target, section, key, value) {
    if (!target?.[section] || !(key in target[section])) return;
    target[section][key] += Number(value ?? 0) || 0;
  }

  static _addRiftsSkillBonus(target, row, value, meta = {}) {
    const bonus = Number(value ?? 0) || 0;
    if (!bonus) return;
    const key = String(row?.key ?? "").trim();
    const name = String(row?.name ?? "").trim().toLowerCase();
    if (key) target.skillBonuses.byKey[key] = (target.skillBonuses.byKey[key] ?? 0) + bonus;
    else if (name) target.skillBonuses.byName[name] = (target.skillBonuses.byName[name] ?? 0) + bonus;
    target.skillBonuses.entries ??= [];
    target.skillBonuses.entries.push({ key, name, value: bonus, itemId: meta.itemId ?? "", fixedDuplicate: !!meta.fixedDuplicate });
  }

  /** Package skill bonuses that repeat a fixed skill's own O.C.C. bonus only
   *  reach skill rows saved before rows carried their own occBonus; newer rows,
   *  chosen skills and Secondary Skills are not bonused twice. */
  static _riftsSkillSourceBonus(totals, row) {
    const key = String(row?.key ?? "").trim();
    const name = String(row?.name ?? "").trim().toLowerCase();
    const entries = totals?.skillBonuses?.entries;
    if (!Array.isArray(entries)) {
      const byKey = totals?.skillBonuses?.byKey ?? {};
      const byName = totals?.skillBonuses?.byName ?? {};
      return Number((key ? byKey[key] : undefined) ?? byName[name] ?? 0) || 0;
    }
    const hasOwnBonus = row?.occBonus !== undefined && row?.occBonus !== null && row?.occBonus !== "";
    const isChoice = row?.sourceChoiceIndex !== undefined && row?.sourceChoiceIndex !== null && row?.sourceChoiceIndex !== "";
    const keyed = key ? entries.filter(entry => entry.key === key) : [];
    const matching = keyed.length ? keyed : entries.filter(entry => !entry.key && entry.name && entry.name === name);
    return matching
      .filter(entry => !(entry.fixedDuplicate && (hasOwnBonus || isChoice || row?.category === "secondary")))
      .reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
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

  static _buildRiftsSources(items, { level = 1 } = {}) {
    const toArr = LegacyRules._toArray;
    const totals = LegacyRules._blankRiftsSourceTotals();
    const sources = [];
    const attrLabels = { iq: "IQ", me: "ME", ma: "MA", ps: "PS", pp: "PP", pe: "PE", pb: "PB", spd: "SPD" };
    const poolLabels = { hp: "HP", sdc: "SDC", mdc: "MDC", isp: "ISP", ppe: "PPE" };
    const combatLabels = {
      attacks: "Attacks/Melee",
      initiative: "Initiative",
      perception: "Perception",
      damage: "Damage",
      strike: "Strike",
      parry: "Parry",
      dodge: "Dodge",
      disarm: "Disarm",
      entangle: "Entangle",
      pullPunch: "Pull Punch",
      roll: "Roll with Punch/Fall"
    };
    const saveLabels = {
      spell: "Save vs Spell",
      ritual: "Save vs Ritual",
      psionics: "Save vs Psionics",
      drugPoison: "Save vs Toxins/Poisons",
      harmfulDrugs: "Save vs Harmful Drugs",
      insanity: "Save vs Insanity",
      possession: "Save vs Possession",
      horrorFactor: "Save vs Horror Factor",
      death: "Save vs Coma/Death",
      pain: "Save vs Pain"
    };
    const combatPatterns = [
      { key: "attacks", label: "Attacks", tests: [/\b(attacks?|actions?)\b/, /\b(melee|round|action)\b/] },
      { key: "initiative", label: "Initiative", tests: [/\binit(iative)?\b/] },
      { key: "perception", label: "Perception", tests: [/\bperception\b/] },
      { key: "damage", label: "Damage", tests: [/\bdamage\b/] },
      { key: "strike", label: "Strike", tests: [/\bstrike\b/] },
      { key: "parry", label: "Parry", tests: [/\bparry\b/] },
      { key: "dodge", label: "Dodge", tests: [/\bdodge\b/, /^(?!.*\b(auto|automatic)\b)/] },
      { key: "disarm", label: "Disarm", tests: [/\bdisarm\b/] },
      { key: "entangle", label: "Entangle", tests: [/\bentangle\b/] },
      { key: "pullPunch", label: "Pull Punch", tests: [/\bpull\b/, /\bpunch\b/] },
      { key: "roll", label: "Roll with Punch/Fall", tests: [/\broll\b/, /\b(punch|fall|impact)\b/] }
    ];
    const savePatterns = [
      { key: "spell", label: "Save vs Spell", tests: [/\bspell\b/] },
      { key: "ritual", label: "Save vs Ritual", tests: [/\britual\b/] },
      { key: "psionics", label: "Save vs Psionics", tests: [/\b(psi|psionic|psionics)\b/] },
      { key: "drugPoison", label: "Save vs Toxins/Poisons", tests: [/\b(poison|poisons|toxin|toxins|drug|drugs)\b/] },
      { key: "harmfulDrugs", label: "Save vs Harmful Drugs", tests: [/\bharmful\b/, /\bdrug|drugs\b/] },
      { key: "insanity", label: "Save vs Insanity", tests: [/\binsanity\b/] },
      { key: "possession", label: "Save vs Possession", tests: [/\bpossession\b/] },
      { key: "horrorFactor", label: "Save vs Horror Factor", tests: [/\bhorror\b/] },
      { key: "death", label: "Save vs Coma/Death", tests: [/\b(coma|death)\b/] },
      { key: "pain", label: "Save vs Pain", tests: [/\bpain\b/] }
    ];

    for (const item of items.filter(Boolean)) {
      const source = {
        itemId: item.id,
        name: item.name,
        type: item.system?.isRCC ? "RCC" : (item.type === "race" ? "Race" : "OCC"),
        isRCC: !!item.system?.isRCC,
        handToHand: null,
        levelBonuses: [],
        attributeBonuses: [],
        poolBonuses: [],
        skillBonuses: [],
        weaponProficiencies: [],
        combatBonuses: [],
        saveBonuses: [],
        abilities: [],
        warnings: [],
        hasDetails: false
      };

      for (const [key, label] of Object.entries(attrLabels)) {
        const roll = LegacyRules._normalizeRiftsAttributeRoll(item.system?.attributeBonuses?.[key]);
        const total = Number(roll.total ?? 0) || 0;
        const parts = LegacyRules._riftsAttributeBonusParts(roll);
        if (total) {
          LegacyRules._addRiftsSourceTotal(totals, "attributeBonuses", key, total);
          source.attributeBonuses.push({
            key,
            label,
            value: total,
            bonus: roll.bonus,
            rollValue: roll.rollValue,
            formula: roll.formula,
            display: parts.length ? `${parts.join(", ")} = ${LegacyRules._formatSigned(total)}` : LegacyRules._formatSigned(total),
            rollable: !!(roll.formula && !roll.rolled),
            applied: true
          });
        } else if (roll.formula) {
          source.attributeBonuses.push({ key, label, formula: roll.formula, rollable: true, applied: false });
        }
      }

      for (const choice of LegacyPackages.attributeChoices(item.system)) {
        const value = LegacyPackages.isFlatNumber(choice.formula) ? Number(choice.formula) : (choice.rolled ? choice.value : 0);
        if (choice.chosen && value) {
          LegacyRules._addRiftsSourceTotal(totals, "attributeBonuses", choice.chosen, value);
          source.attributeBonuses.push({ key: choice.chosen, label: attrLabels[choice.chosen], value, display: `${LegacyRules._formatSigned(value)} (${choice.label || "choice"})`, applied: true });
        } else if (choice.formula) {
          source.attributeBonuses.push({ key: "", label: choice.label || "Attribute choice", formula: choice.formula, applied: false, pendingChoice: true });
        }
      }

      // Flat starting values apply automatically; dice formulas are rolled from
      // the character's Advancement panel and counted from its ledger.
      for (const [key, label] of Object.entries(poolLabels)) {
        const { start, perLevel } = LegacyPackages.poolFormulas(item.system, key);
        if (start) {
          const flat = LegacyPackages.flatValue(start);
          if (flat !== null) {
            if (flat) {
              LegacyRules._addRiftsSourceTotal(totals, "poolBonuses", key, flat);
              source.poolBonuses.push({ key, label, value: flat, display: LegacyRules._formatSigned(flat), applied: true });
            }
          } else {
            source.poolBonuses.push({ key, label, raw: start, display: start, applied: false, rolled: true });
          }
        }
        if (perLevel) source.poolBonuses.push({ key, label, raw: perLevel, display: `${perLevel} / level`, applied: LegacyPackages.flatValue(perLevel) !== null, perLevel: true });
      }

      const combatData = item.system?.combatBonuses;
      if (combatData && typeof combatData === "object" && !Array.isArray(combatData)) {
        for (const [key, label] of Object.entries(combatLabels)) {
          const value = Number(combatData[key] ?? 0) || 0;
          if (!value) continue;
          LegacyRules._addRiftsSourceTotal(totals, "combatBonuses", key, value);
          source.combatBonuses.push({ key, label, value, display: LegacyRules._formatSigned(value), applied: true });
        }
      } else {
        const combat = LegacyRules._parseRiftsTextBonuses(combatData, combatPatterns);
        for (const bonus of combat.applied) {
          LegacyRules._addRiftsSourceTotal(totals, "combatBonuses", bonus.key, bonus.value);
          source.combatBonuses.push({ ...bonus, display: LegacyRules._formatSigned(bonus.value), applied: true });
        }
        for (const raw of combat.ambiguous) {
          source.combatBonuses.push({ raw, applied: false });
          source.warnings.push(`Combat bonus "${raw}" was left as a note.`);
        }
      }

      const saveData = item.system?.saveBonuses;
      if (saveData && typeof saveData === "object" && !Array.isArray(saveData)) {
        for (const [key, label] of Object.entries(saveLabels)) {
          const value = Number(saveData[key] ?? 0) || 0;
          if (!value) continue;
          LegacyRules._addRiftsSourceTotal(totals, "saveBonuses", key, value);
          source.saveBonuses.push({ key, label, value, display: LegacyRules._formatSigned(value), applied: true });
        }
      } else {
        const saves = LegacyRules._parseRiftsTextBonuses(saveData, savePatterns);
        for (const bonus of saves.applied) {
          LegacyRules._addRiftsSourceTotal(totals, "saveBonuses", bonus.key, bonus.value);
          source.saveBonuses.push({ ...bonus, display: LegacyRules._formatSigned(bonus.value), applied: true });
        }
        for (const raw of saves.ambiguous) {
          source.saveBonuses.push({ raw, applied: false });
          source.warnings.push(`Save bonus "${raw}" was left as a note.`);
        }
      }

      const fixedBonuses = new Map(LegacyPackages.fixedSkills(item.system)
        .filter(row => row.key && row.bonus)
        .map(row => [row.key, row.bonus]));
      for (const row of toArr(item.system?.skillBonuses)) {
        const value = Number(row?.bonus ?? 0) || 0;
        if (!value) continue;
        const fixedDuplicate = !!row?.key && fixedBonuses.get(row.key) === value;
        LegacyRules._addRiftsSkillBonus(totals, row, value, { itemId: item.id, fixedDuplicate });
        source.skillBonuses.push({
          key: row.key ?? "",
          name: row.name ?? "",
          label: row.name ?? row.key ?? "Skill",
          value,
          display: LegacyRules._formatSigned(value),
          note: row.note ?? "",
          applied: true
        });
      }

      const selectedWp = item.system?.weaponProficiencies?.selected ?? {};
      const allWp = [
        ...(CONFIG.EE?.WP_LIST?.ancient ?? []),
        ...(CONFIG.EE?.WP_LIST?.modern ?? [])
      ];
      for (const wp of allWp) {
        if (!selectedWp?.[wp.key]) continue;
        totals.weaponProficiencies.selected[wp.key] = true;
        source.weaponProficiencies.push({ key: wp.key, name: wp.name, applied: true });
      }
      for (const custom of toArr(item.system?.weaponProficiencies?.custom)) {
        if (!custom?.name) continue;
        totals.weaponProficiencies.custom.push({ name: custom.name, source: item.name });
        source.weaponProficiencies.push({ name: custom.name, custom: true, applied: true });
      }

      source.abilities = toArr(item.system?.abilities)
        .filter(a => a?.name || a?.description)
        .map(a => ({ name: a.name ?? "", description: a.description ?? "" }));

      const levelBonuses = LegacyPackages.levelBonusTotals([item], level);
      for (const [key, value] of Object.entries(levelBonuses.combat)) LegacyRules._addRiftsSourceTotal(totals, "combatBonuses", key, value);
      for (const [key, value] of Object.entries(levelBonuses.saves)) LegacyRules._addRiftsSourceTotal(totals, "saveBonuses", key, value);
      const targetLabels = CONFIG.EE?.LEGACY_LEVEL_BONUS_TARGETS ?? {};
      source.levelBonuses = levelBonuses.entries
        .filter(entry => entry.target || entry.note)
        .map(entry => {
          const label = targetLabels[entry.target] ?? (entry.note || entry.target);
          return {
            label,
            note: entry.note,
            value: entry.total,
            display: entry.target && entry.target !== "note" ? `${LegacyRules._formatSigned(entry.total)} ${label}` : label,
            levels: entry.levelList.join(", "),
            applied: !!entry.total
          };
        });

      const hth = LegacyPackages.handToHand(item.system);
      if (hth.type) {
        const hthLabels = CONFIG.EE?.HTH_TYPES ?? {};
        source.handToHand = {
          label: hthLabels[hth.type] ?? hth.type,
          upgrades: hth.upgrades
            .filter(upgrade => upgrade.type)
            .map(upgrade => `${hthLabels[upgrade.type] ?? upgrade.type} (${upgrade.cost} pick${upgrade.cost === 1 ? "" : "s"})`)
            .join(", ")
        };
      }

      source.hasDetails = !!(source.attributeBonuses.length || source.poolBonuses.length || source.skillBonuses.length || source.weaponProficiencies.length || source.combatBonuses.length || source.saveBonuses.length || source.abilities.length || source.levelBonuses.length || source.handToHand || source.warnings.length);
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

  static _legacyXpTrack(system = {}) {
    const raw = system?.xpTrack ?? {};
    const preset = String(raw.preset ?? "");
    const configured = CONFIG.EE?.RIFTS_XP_TRACKS?.[preset] ?? null;
    const source = configured?.thresholds ?? LegacyRules._toArray(raw.thresholds);
    const thresholds = Array.from({ length: 15 }, (_, index) => {
      if (index === 0) return 0;
      const numeric = Number(source[index] ?? 0);
      return Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : 0;
    });
    const level15Max = Math.max(0, Math.trunc(Number(configured?.level15Max ?? raw.level15Max ?? 0) || 0));
    const valid = (!!configured || preset === "custom")
      && thresholds.every((value, index) => index === 0 || value > thresholds[index - 1])
      && level15Max >= thresholds[14];
    return {
      preset,
      label: configured?.label ?? (preset === "custom" ? "Custom experience track" : ""),
      thresholds,
      level15Max,
      valid
    };
  }

  static _legacyXpProgress(xpValue, levelValue, occSystem = {}) {
    const track = LegacyRules._legacyXpTrack(occSystem);
    if (!track.valid) return { hasTrack: false, nextDisplay: "", label: track.label };

    const xp = Math.max(0, Math.trunc(Number(xpValue ?? 0) || 0));
    const level = Math.max(1, Math.min(15, Math.trunc(Number(levelValue ?? 1) || 1)));
    let calculatedLevel = 1;
    for (let index = 1; index < track.thresholds.length; index += 1) {
      if (xp < track.thresholds[index]) break;
      calculatedLevel = index + 1;
    }

    const currentMin = track.thresholds[level - 1];
    const next = level < 15 ? track.thresholds[level] : null;
    const currentMax = next === null ? track.level15Max : next - 1;
    const range = Math.max(1, currentMax - currentMin + 1);
    const progress = Math.max(0, Math.min(100, Math.round(((xp - currentMin) / range) * 100)));
    const format = value => Number(value ?? 0).toLocaleString("en-US");
    const nextDisplay = next === null ? "Maximum level" : format(next);
    const remaining = next === null ? 0 : Math.max(0, next - xp);
    return {
      hasTrack: true,
      label: track.label,
      level,
      xp,
      currentMin,
      currentMax,
      next,
      nextDisplay,
      remaining,
      remainingDisplay: format(remaining),
      progress,
      calculatedLevel,
      levelMismatch: calculatedLevel !== level,
      tooltip: `${track.label}: level ${level} covers ${format(currentMin)}-${format(currentMax)} XP.${next === null ? " This is the maximum level." : ` ${format(remaining)} XP remaining to level ${level + 1}.`}`
    };
  }

  static _parseIntSafe(v) {
    if (v === null || v === undefined) return 0;
    const m = String(v).trim().match(/^([+-]?\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  static _coerceBoolean(value) {
    if (Array.isArray(value)) return LegacyRules._coerceBoolean(value.at(-1));
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return ["true", "on", "1", "yes"].includes(value.toLowerCase());
    return !!value;
  }
  /** Only unconditional numeric modifiers are automated. Skill-specific and
   * multiplicative rules remain explicit notes until their context is known. */
  static flatAttributeModifiers(attrs = {}) {
    const combat = {};
    const saves = {};
    const inBand = (key, min, max) => Number(attrs[key]) >= min && Number(attrs[key]) <= max;
    const add = (target, key, value) => { target[key] = (target[key] ?? 0) + value; };
    if (inBand("pp", 1, 7)) {
      add(combat, "initiative", inBand("pp", 5, 7) ? -1 : inBand("pp", 3, 4) ? -3 : -5);
      if (inBand("pp", 5, 7)) {
        for (const key of ["strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll"]) add(combat, key, -2);
      }
    }
    if (inBand("spd", 1, 6)) {
      add(combat, "initiative", -1);
      add(combat, "dodge", -1);
      add(combat, "perception", 1);
    }
    if (inBand("me", 1, 7)) {
      const band = inBand("me", 5, 7) ? 0 : inBand("me", 3, 4) ? 1 : 2;
      saves.horrorFactor = [-3, -6, -8][band];
      saves.psionics = [-1, -3, -6][band];
      saves.possession = [-1, -3, -6][band];
      saves.insanity = [-1, -2, -5][band];
    }
    if (inBand("pe", 1, 7)) {
      const band = inBand("pe", 5, 7) ? 0 : inBand("pe", 3, 4) ? 1 : 2;
      saves.spell = saves.ritual = [-3, -4, -5][band];
      saves.drugPoison = saves.harmfulDrugs = [-3, -5, -6][band];
      saves.death = [-5, -10, -20][band];
    }
    return { combat, saves };
  }

  static weaponDamageScale(system = {}) {
    if (["M", "G", "U"].includes(system.damageScale)) return system.damageScale;
    // Older imports used only isMDC, while the template supplies a default S.
    return LegacyRules._coerceBoolean(system.isMDC) ? "M" : "S";
  }

  static _isRccAsRace(item) {
    return item?.type === "occ" && !!item.system?.isRCC && !!item.system?.rccAsRace;
  }

  static derive(sys = {}, items = []) {
    const C = LegacyRules;
    const A = sys.attributes ?? {};
    const iq = Number(A.iq?.value ?? 0);
    const me = Number(A.me?.value ?? 0);
    const ma = Number(A.ma?.value ?? 0);
    const ps = Number(A.ps?.value ?? 0);
    const pp = Number(A.pp?.value ?? 0);
    const pe = Number(A.pe?.value ?? 0);
    const pb = Number(A.pb?.value ?? 0);
    const level = Number(sys.level ?? 1);
    const equippedOccItem = Array.from(items).find(item => item.id === sys.equippedOcc);
    const equippedRaceItem = Array.from(items).find(item => item.id === sys.equippedRace);
    const isRCC = !!equippedOccItem?.system?.isRCC;
    const rawLegacySkillRows = C._toArray(sys.skills?.list);
    const legacySkillStatSources = C._buildLegacySkillStatSources(rawLegacySkillRows);

    const riftsSources = C._buildRiftsSources([equippedOccItem, equippedRaceItem], { level });
    if (isRCC && equippedRaceItem) riftsSources.warnings.push("RCC replaces Race.");
    const riftsSourceTotals = riftsSources.totals;
    for (const [key, value] of Object.entries(legacySkillStatSources.totals.attributeBonuses)) {
      riftsSourceTotals.attributeBonuses[key] += Number(value ?? 0) || 0;
    }
    for (const [key, value] of Object.entries(legacySkillStatSources.totals.poolBonuses)) {
      riftsSourceTotals.poolBonuses[key] += Number(value ?? 0) || 0;
    }
    // Race/RCC/OCC and permanent skill gains are creation-time parts of the
    // visible score. Only explicit temporary modifiers are shown separately.
    const attributeScores = {
      iq: iq + riftsSourceTotals.attributeBonuses.iq,
      me: me + riftsSourceTotals.attributeBonuses.me,
      ma: ma + riftsSourceTotals.attributeBonuses.ma,
      ps: ps + riftsSourceTotals.attributeBonuses.ps,
      pp: pp + riftsSourceTotals.attributeBonuses.pp,
      pe: pe + riftsSourceTotals.attributeBonuses.pe,
      pb: pb + riftsSourceTotals.attributeBonuses.pb,
      spd: Number(A.spd?.value ?? 0) + riftsSourceTotals.attributeBonuses.spd
    };
    const temporaryAttributeModifiers = Object.fromEntries(
      Object.keys(attributeScores).map(key => [key, Number(A[key]?.temporary ?? 0) || 0])
    );
    const effectiveAttrs = Object.fromEntries(
      Object.entries(attributeScores).map(([key, score]) => [key, score + temporaryAttributeModifiers[key]])
    );

    const packages = LegacyPackages.equippedPackages(sys, items);
    riftsSources.warnings.push(...LegacyPackages.requirementWarnings(packages, attributeScores));
    const poolAdvancement = LegacyPackages.poolAdvancementTotals(sys, items);
    const flatModifiers = C.flatAttributeModifiers(effectiveAttrs);
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
      const numericBase = Number(entry?.base);
      const base = percent && Number.isFinite(numericBase) ? numericBase : 0;
      const manual = riftsNumber(entry?.bonus);
      const total = base + manual + attribute + source;
      return { base: entry?.base ?? "", manual, attribute, source, total, percent, display: percent ? `${total}%` : total };
    };

    const iqSkillBonus = C.iqSkillBonus(effectiveAttrs.iq);
    const psionicSave = C.psionicSave(effectiveAttrs.me);
    const insanitySave = C.insanitySave(effectiveAttrs.me);
    const trustIntimidate = C.trustIntimidate(effectiveAttrs.ma);
    const psDamage = C.psDamage(effectiveAttrs.ps);
    const ppStrike = C.ppStrike(effectiveAttrs.pp);
    const ppParryDodge = C.ppParryDodge(effectiveAttrs.pp);
    const ppInitiative = C.ppInitiative(effectiveAttrs.pp);
    const peComaSave = C.peComaSave(effectiveAttrs.pe);
    const peMagicPoison = C.peMagicPoison(effectiveAttrs.pe);
    const charmImpress = C.charmImpress(effectiveAttrs.pb);
    const possessionSave = C.mePossession(effectiveAttrs.me);
    const attrBonuses = {
      iq:  iqSkillBonus ? `+${iqSkillBonus}% skills` : "",
      me:  [psionicSave ? `+${psionicSave} psi` : "", insanitySave ? `+${insanitySave} insanity` : ""].filter(Boolean).join(", "),
      ma:  trustIntimidate ? `${trustIntimidate}% trust/intim.` : "",
      ps:  psDamage ? `+${psDamage} damage` : "",
      pp:  [ppStrike ? `+${ppStrike} strike` : "", ppParryDodge ? `+${ppParryDodge} parry/dodge` : "", ppInitiative ? `+${ppInitiative} initiative` : ""].filter(Boolean).join(", "),
      pe:  [peComaSave ? `+${peComaSave}% coma/death` : "", peMagicPoison ? `+${peMagicPoison} magic/poison` : ""].filter(Boolean).join(", "),
      pb:  charmImpress ? `${charmImpress}% charm/impress` : "",
      spd: ""
    };
    const attrPenalties = C._legacyLowAttributePenalties(effectiveAttrs);
    const attrEffects = C._legacyAttributeEffects(effectiveAttrs, attrBonuses, attrPenalties);

    const hthTables = CONFIG.EE?.RIFTS_HTH_TABLES ?? {};
    const hthChoices = CONFIG.EE?.HTH_TYPES ?? {};
    const hthType = Object.prototype.hasOwnProperty.call(hthChoices, sys.handToHand?.type) ? sys.handToHand.type : "none";
    const hthTable = hthTables[hthType] ?? { levels: [] };
    const hthBase = {
      attacks: 0, initiative: 0, strike: 0, parry: 0, dodge: 0, damage: 0,
      disarm: 0, entangle: 0, pullPunch: 0, roll: 0, horrorFactor: 0, critical: 20, knockout: 20
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
      perception: riftsNumber(sys.handToHand?.perception),
      damage: riftsNumber(sys.handToHand?.damage),
      strike: riftsNumber(sys.handToHand?.strike),
      parry: riftsNumber(sys.handToHand?.parry),
      dodge: riftsNumber(sys.handToHand?.dodge),
      disarm: riftsNumber(sys.handToHand?.disarm),
      entangle: riftsNumber(sys.handToHand?.entangle),
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
      initiative: riftsCombatTotal(hthManual.initiative, ppInitiative, riftsNumber(hthBase.initiative), riftsSourceTotals.combatBonuses.initiative),
      perception: riftsCombatTotal(hthManual.perception, 0, 0, riftsSourceTotals.combatBonuses.perception),
      damage: riftsCombatTotal(hthManual.damage, psDamage, riftsNumber(hthBase.damage), riftsSourceTotals.combatBonuses.damage),
      strike: riftsCombatTotal(hthManual.strike, ppStrike, riftsNumber(hthBase.strike), riftsSourceTotals.combatBonuses.strike),
      parry: riftsCombatTotal(hthManual.parry, ppParryDodge, riftsNumber(hthBase.parry), riftsSourceTotals.combatBonuses.parry),
      dodge: riftsCombatTotal(hthManual.dodge, ppParryDodge, riftsNumber(hthBase.dodge), riftsSourceTotals.combatBonuses.dodge),
      disarm: riftsCombatTotal(hthManual.disarm, 0, riftsNumber(hthBase.disarm), riftsSourceTotals.combatBonuses.disarm),
      entangle: riftsCombatTotal(hthManual.entangle, 0, riftsNumber(hthBase.entangle), riftsSourceTotals.combatBonuses.entangle),
      pullPunch: riftsCombatTotal(hthManual.pullPunch, 0, riftsNumber(hthBase.pullPunch), riftsSourceTotals.combatBonuses.pullPunch),
      roll: riftsCombatTotal(hthManual.roll, 0, riftsNumber(hthBase.roll), riftsSourceTotals.combatBonuses.roll),
      critical: riftsThresholdTotal(hthManual.critical, hthBase.critical),
      knockout: riftsThresholdTotal(hthManual.knockout, hthBase.knockout)
    };
    for (const [key, modifier] of Object.entries(flatModifiers.combat)) {
      handToHand[key].attribute += modifier;
      handToHand[key].total += modifier;
    }
    const vehicleHthTables = CONFIG.EE?.POWER_ARMOR_HTH_TABLES ?? {};
    const vehicleHthChoices = CONFIG.EE?.POWER_ARMOR_HTH_TYPES ?? {};
    const vehicleHthSys = sys.vehicle?.handToHand ?? {};
    const vehicleHthType = Object.prototype.hasOwnProperty.call(vehicleHthChoices, vehicleHthSys.type) ? vehicleHthSys.type : "none";
    const vehicleHthTable = vehicleHthTables[vehicleHthType] ?? { levels: [] };
    const vehicleHthBase = {
      attacks: 0, initiative: 0, strike: 0, parry: 0, dodge: 0, damage: 0,
      disarm: 0, entangle: 0, pullPunch: 0, roll: 0, horrorFactor: 0, critical: 20, knockout: 20
    };
    const vehicleHthNotes = [];
    for (const entry of vehicleHthTable.levels ?? []) {
      if (Number(entry.level ?? 0) > level) continue;
      for (const key of Object.keys(vehicleHthBase)) {
        if (entry[key] !== undefined) vehicleHthBase[key] = entry[key];
      }
      vehicleHthNotes.push(...(entry.notes ?? []).map(note => ({ level: entry.level, text: note })));
    }
    const vehicleHthManual = {
      attacks: riftsNumber(vehicleHthSys.attacks),
      initiative: riftsNumber(vehicleHthSys.initiative),
      damage: riftsNumber(vehicleHthSys.damage),
      strike: riftsNumber(vehicleHthSys.strike),
      parry: riftsNumber(vehicleHthSys.parry),
      dodge: riftsNumber(vehicleHthSys.dodge),
      disarm: riftsNumber(vehicleHthSys.disarm),
      entangle: riftsNumber(vehicleHthSys.entangle),
      pullPunch: riftsNumber(vehicleHthSys.pullPunch ?? vehicleHthSys.pullRoll),
      roll: riftsNumber(vehicleHthSys.roll ?? vehicleHthSys.pullRoll),
      critical: vehicleHthSys.critical ?? 0,
      knockout: vehicleHthSys.knockout ?? 0
    };
    const vehicleHandToHand = {
      type: vehicleHthType,
      label: vehicleHthTable.label ?? CONFIG.EE?.POWER_ARMOR_HTH_TYPES?.[vehicleHthType] ?? vehicleHthType,
      level,
      base: vehicleHthBase,
      notes: vehicleHthNotes,
      attacks: riftsCombatTotal(vehicleHthManual.attacks, 0, riftsNumber(vehicleHthBase.attacks)),
      initiative: riftsCombatTotal(vehicleHthManual.initiative, 0, riftsNumber(vehicleHthBase.initiative)),
      damage: riftsCombatTotal(vehicleHthManual.damage, 0, riftsNumber(vehicleHthBase.damage)),
      strike: riftsCombatTotal(vehicleHthManual.strike, 0, riftsNumber(vehicleHthBase.strike)),
      parry: riftsCombatTotal(vehicleHthManual.parry, 0, riftsNumber(vehicleHthBase.parry)),
      dodge: riftsCombatTotal(vehicleHthManual.dodge, 0, riftsNumber(vehicleHthBase.dodge)),
      disarm: riftsCombatTotal(vehicleHthManual.disarm, 0, riftsNumber(vehicleHthBase.disarm)),
      entangle: riftsCombatTotal(vehicleHthManual.entangle, 0, riftsNumber(vehicleHthBase.entangle)),
      pullPunch: riftsCombatTotal(vehicleHthManual.pullPunch, 0, riftsNumber(vehicleHthBase.pullPunch)),
      roll: riftsCombatTotal(vehicleHthManual.roll, 0, riftsNumber(vehicleHthBase.roll)),
      critical: riftsThresholdTotal(vehicleHthManual.critical, vehicleHthBase.critical),
      knockout: riftsThresholdTotal(vehicleHthManual.knockout, vehicleHthBase.knockout)
    };

    const derived = {
      iqSkillBonus,
      psionicSave,
      insanitySave,
      trustIntimidate,
      psDamage,
      ppStrike,
      ppParryDodge,
      ppInitiative,
      peComaSave,
      peMagicPoison,
      charmImpress,
      attrBonuses,
      attrPenalties,
      attrEffects,
      attrEffectsActive: attrEffects.filter(effect => effect.hasEffect),
      handToHand,
      vehicleHandToHand,
      combat: {
        damage: handToHand.damage,
        strike: handToHand.strike,
        parry: handToHand.parry,
        dodge: handToHand.dodge
      },
      combatReferences: C._legacyCombatReferences(handToHand),
      saves: {
        spell: riftsSaveTotal(sys.savingThrows?.spell, peMagicPoison, false, riftsSourceTotals.saveBonuses.spell),
        ritual: riftsSaveTotal(sys.savingThrows?.ritual, peMagicPoison, false, riftsSourceTotals.saveBonuses.ritual),
        psionics: riftsSaveTotal(sys.savingThrows?.psionics, psionicSave, false, riftsSourceTotals.saveBonuses.psionics),
        insanity: riftsSaveTotal(sys.savingThrows?.insanity, insanitySave, false, riftsSourceTotals.saveBonuses.insanity),
        drugPoison: riftsSaveTotal(sys.savingThrows?.drugPoison, peMagicPoison, false, riftsSourceTotals.saveBonuses.drugPoison),
        harmfulDrugs: riftsSaveTotal(sys.savingThrows?.harmfulDrugs, 0, false, riftsSourceTotals.saveBonuses.harmfulDrugs),
        horrorFactor: riftsSaveTotal(sys.savingThrows?.horrorFactor, 0, false, riftsSourceTotals.saveBonuses.horrorFactor + riftsNumber(hthBase.horrorFactor)),
        death: riftsSaveTotal(sys.savingThrows?.death, peComaSave, true, riftsSourceTotals.saveBonuses.death),
        possession: riftsSaveTotal(sys.savingThrows?.possession, possessionSave, false, riftsSourceTotals.saveBonuses.possession),
        pain: riftsSaveTotal(sys.savingThrows?.pain, 0, false, riftsSourceTotals.saveBonuses.pain)
      },
      sources: riftsSources.sources,
      sourceWarnings: riftsSources.warnings,
      sourceTotals: riftsSourceTotals,
      skillStatSources: legacySkillStatSources.entries,
      attributeScores,
      temporaryAttributeModifiers,
      effectiveAttrs,
      pools: Object.fromEntries(["hp", "sdc", "mdc", "isp", "ppe"].map(key => {
        const base = riftsNumber(sys[key]?.max);
        const sourceBonus = riftsSourceTotals.poolBonuses[key];
        const rolled = poolAdvancement[key];
        return [key, { base, bonus: sourceBonus + rolled, sourceBonus, rolled, total: base + sourceBonus + rolled }];
      }))
    };
    for (const [key, modifier] of Object.entries(flatModifiers.saves)) {
      const save = derived.saves[key];
      save.attribute += modifier;
      save.total += modifier;
      save.display = save.percent ? `${save.total}%` : save.total;
    }
    derived.flatAttributeModifiers = flatModifiers;
    derived.poolRows = Object.entries(derived.pools).map(([key, entry]) => ({
      key, label: key.toUpperCase(), value: riftsNumber(sys[key]?.value), ...entry
    }));
    derived.physical = C._legacyPhysicalStats(effectiveAttrs, handToHand);
    derived.attributeSourceRows = Object.entries({
      iq: "IQ", me: "ME", ma: "MA", ps: "PS", pp: "PP", pe: "PE", pb: "PB", spd: "SPD"
    }).map(([key, label]) => ({
      key,
      label,
      base: attributeScores[key] ?? 0,
      source: temporaryAttributeModifiers[key] ?? 0,
      total: effectiveAttrs[key] ?? 0,
      hasSource: !!temporaryAttributeModifiers[key],
      display: LegacyRules._formatSigned(temporaryAttributeModifiers[key] ?? 0)
    }));
    derived.hasTemporaryAttributeModifiers = derived.attributeSourceRows.some(row => row.hasSource);

    return derived;
  }
}
