/** EE Legacy Race, O.C.C. and R.C.C. package rules. Like LegacyRules, these
 *  helpers only read item and actor data; sheets and apps perform updates. */

const ATTR_KEYS = ["iq", "me", "ma", "ps", "pp", "pe", "pb", "spd"];
const ATTR_LABELS = { iq: "I.Q.", me: "M.E.", ma: "M.A.", ps: "P.S.", pp: "P.P.", pe: "P.E.", pb: "P.B.", spd: "Spd." };
const POOL_KEYS = ["hp", "sdc", "mdc", "isp", "ppe"];
const POOL_LABELS = { hp: "Hit Points", sdc: "S.D.C.", mdc: "M.D.C.", isp: "I.S.P.", ppe: "P.P.E." };
const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

// Pool units are dropped before attribute names are converted, so "P.P.E."
// is never read as the P.E. attribute.
const POOL_UNIT_PATTERN = /(?<![A-Za-z])(?:M\.?\s?D\.?\s?C\.?|S\.?\s?D\.?\s?C\.?|P\.?\s?P\.?\s?E\.?|I\.?\s?S\.?\s?P\.?|H\.?\s?P\.?(?![A-Za-z])|hit\s+points?|points?)(?![A-Za-z])/gi;
const ATTRIBUTE_PATTERNS = [
  ["iq", /(?<![A-Za-z.@])I\.?\s?Q\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi],
  ["me", /(?<![A-Za-z.@])M\.?\s?E\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi],
  ["ma", /(?<![A-Za-z.@])M\.?\s?A\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi],
  ["ps", /(?<![A-Za-z.@])P\.?\s?S\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi],
  ["pp", /(?<![A-Za-z.@])P\.?\s?P\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi],
  ["pe", /(?<![A-Za-z.@])P\.?\s?E\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi],
  ["pb", /(?<![A-Za-z.@])P\.?\s?B\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi],
  ["spd", /(?<![A-Za-z.@])Sp(?:ee)?d\.?(?:\s+attribute(?:\s+number)?)?(?![A-Za-z])/gi]
];
const PER_LEVEL_SUFFIX = /\s*(?:\/\s*(?:lvl|level)\.?|(?:per|for\s+each)\s+(?:each\s+)?(?:additional\s+)?(?:new\s+)?(?:lvl|level)(?:\s+of\s+experience)?(?:\s*\(?\s*starting\s+at\s+level\s+(?:two|2)\s*\)?)?)\s*\.?\s*$/i;

export class LegacyPackages {
  static ATTR_KEYS = ATTR_KEYS;
  static ATTR_LABELS = ATTR_LABELS;
  static POOL_KEYS = POOL_KEYS;
  static POOL_LABELS = POOL_LABELS;
  static STANDARD_HP = { start: "P.E. + 1D6", perLevel: "1D6" };

  static toArray(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      return Object.keys(value)
        .filter(key => /^\d+$/.test(key))
        .sort((a, b) => Number(a) - Number(b))
        .map(key => value[key]);
    }
    return [];
  }

  static number(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  static bool(value) {
    if (Array.isArray(value)) return LegacyPackages.bool(value.at(-1));
    if (typeof value === "string") return ["true", "on", "1", "yes"].includes(value.toLowerCase());
    return !!value;
  }

  static isPackage(item) {
    return item?.type === "race" || item?.type === "occ";
  }

  static isRaceLike(item) {
    return item?.type === "race" || !!item?.system?.isRCC;
  }

  static typeLabel(item) {
    if (item?.type === "race") return "Race";
    return item?.system?.isRCC ? "R.C.C." : "O.C.C.";
  }

  /** Equipped Race/RCC and OCC items, in that order, without duplicates. */
  static equippedPackages(sys = {}, items = []) {
    const list = Array.from(items ?? []);
    const ids = [sys.equippedRace, sys.equippedOcc].filter(Boolean);
    return [...new Set(ids)].map(id => list.find(item => item?.id === id)).filter(Boolean);
  }

  // ---------------------------------------------------------------- formulas

  static isFlatNumber(text) {
    return /^\s*[+-]?\d+\s*$/.test(String(text ?? ""));
  }

  /** The number a pool or bonus text always grants ("110", "+10 M.D.C."), or
   *  null when it has dice or attribute references and must be rolled. */
  static flatValue(text) {
    if (LegacyPackages.isFlatNumber(text)) return Number(text);
    const formula = LegacyPackages.toRollFormula(text);
    return /^[+-]?\s*\d+$/.test(formula) ? Number(formula.replace(/\s+/g, "")) : null;
  }

  /** Convert Palladium notation ("3D6x10+20 + P.E.", "M.E. + 4D6") into a
   *  Foundry roll formula with @attribute references. Returns "" when the text
   *  is not a usable formula. */
  static toRollFormula(text) {
    let formula = String(text ?? "").trim();
    if (!formula) return "";
    formula = formula
      .replace(/[×]/g, "x")
      .replace(/(?<=\d)[oO](?![a-z])/g, "0")
      .replace(/\badded\s+to\s+(?:the\s+)?(?:character'?s\s+)?/gi, "+ ")
      .replace(/\bplus\b/gi, "+")
      .replace(/\btimes\b/gi, "*")
      .replace(POOL_UNIT_PATTERN, " ");
    for (const [key, pattern] of ATTRIBUTE_PATTERNS) formula = formula.replace(pattern, ` @${key} `);
    formula = formula
      .replace(/(?<=[\d)])\s*x\s*(?=[\d(])/gi, "*")
      .replace(/(\d+)\s*D\s*(\d+)/gi, "$1d$2")
      .replace(/(?<![\w@])D\s*(\d+)/g, "1d$1")
      .replace(/\.(?!\d)/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^\s*\+\s*/, "")
      .replace(/[+\-*/]\s*$/, "")
      .trim();
    if (!formula) return "";
    if (!/^[\d\s+\-*/().d@a-z]+$/i.test(formula)) return "";
    const withoutRefs = formula.replace(/@(?:iq|me|ma|ps|pp|pe|pb|spd)\b/g, "0");
    if (/[a-ce-z]/i.test(withoutRefs)) return "";
    return formula;
  }

  static rollData(attrs = {}) {
    return Object.fromEntries(ATTR_KEYS.map(key => [key, LegacyPackages.number(attrs[key])]));
  }

  static levelList(text) {
    const raw = Array.isArray(text) ? text.join(",") : String(text ?? "");
    const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15 };
    const normalized = raw
      .replace(/\bI\b/g, "1")
      .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen)\b/gi, word => String(words[word.toLowerCase()]));
    return [...new Set((normalized.match(/\d+/g) ?? []).map(Number).filter(n => n >= 1 && n <= 30))]
      .sort((a, b) => a - b);
  }

  static countWord(text, fallback = 1) {
    const raw = String(text ?? "").trim().toLowerCase();
    if (/^\d+$/.test(raw)) return Number(raw);
    return NUMBER_WORDS[raw] ?? fallback;
  }

  // ------------------------------------------------------------------- pools

  /** Split older single-field pool text such as "3d4 * 10 plus 2d6/lvl" into
   *  a starting formula and a per-level formula. */
  static splitPoolText(text) {
    const raw = String(text ?? "").trim();
    if (!raw) return { start: "", perLevel: "" };
    const suffix = raw.match(PER_LEVEL_SUFFIX);
    if (!suffix) return { start: raw, perLevel: "" };
    const body = raw.slice(0, suffix.index).trim();
    const separators = [...body.matchAll(/,\s*\+?\s*|\s+\+\s*|\s+plus\s+|\s+and\s+/gi)];
    const last = separators.at(-1);
    if (!last) return { start: "", perLevel: body };
    const start = body.slice(0, last.index).trim().replace(/[,+]\s*$/, "").trim();
    const perLevel = body.slice(last.index + last[0].length).trim();
    // "P.E. plus 1D6 per level" grants the 1D6 at first level too.
    const attributeOnly = /^@[a-z]+$/.test(LegacyPackages.toRollFormula(start));
    return { start: attributeOnly && !last[0].includes(",") ? `${start} + ${perLevel}` : start, perLevel };
  }

  static poolFormulas(system = {}, key) {
    const startRaw = String(system?.poolBonuses?.[key] ?? "").trim();
    const perLevelRaw = String(system?.poolPerLevel?.[key] ?? "").trim();
    if (perLevelRaw || !startRaw) return { start: startRaw, perLevel: perLevelRaw };
    return LegacyPackages.splitPoolText(startRaw);
  }

  /** Characters use P.E. + 1D6 Hit Points, +1D6 per level, unless a package
   *  defines its own Hit Points (older packages that wrote "P.E. + ..." count). */
  static usesStandardHitPoints(packages = []) {
    return packages.every(item => {
      const flag = item?.system?.standardHitPoints;
      if (flag !== undefined && flag !== null && flag !== "") return LegacyPackages.bool(flag);
      return !/P\.?\s?E\b/i.test(String(item?.system?.poolBonuses?.hp ?? ""));
    });
  }

  /** One row per pool source: the standard Hit Points rule, then each
   *  equipped package's starting and per-level formulas. */
  static poolPlan(sys = {}, items = []) {
    const packages = LegacyPackages.equippedPackages(sys, items);
    const rows = [];
    const add = (key, source, sourceName, start, perLevel) => {
      if (!start && !perLevel) return;
      const startFlat = start ? LegacyPackages.flatValue(start) : null;
      const perLevelFlat = perLevel ? LegacyPackages.flatValue(perLevel) : null;
      rows.push({
        key,
        label: POOL_LABELS[key],
        source,
        sourceName,
        start,
        perLevel,
        startFlat,
        perLevelFlat,
        startFormula: startFlat === null ? LegacyPackages.toRollFormula(start) : "",
        perLevelFormula: perLevelFlat === null ? LegacyPackages.toRollFormula(perLevel) : ""
      });
    };
    if (LegacyPackages.usesStandardHitPoints(packages)) {
      add("hp", "standard", "Standard", LegacyPackages.STANDARD_HP.start, LegacyPackages.STANDARD_HP.perLevel);
    }
    for (const item of packages) {
      for (const key of POOL_KEYS) {
        const { start, perLevel } = LegacyPackages.poolFormulas(item.system, key);
        add(key, item.id, item.name, start, perLevel);
      }
    }
    return rows;
  }

  static ledger(sys = {}) {
    return LegacyPackages.toArray(sys?.advancement?.pools)
      .map((entry, index) => ({ ...entry, _index: index }))
      .filter(entry => entry && POOL_KEYS.includes(entry.key));
  }

  /** Rolled pool entries count while their source is equipped (or is the
   *  standard rule) and their level has been reached. */
  static activeLedger(sys = {}, items = []) {
    const level = Math.max(1, LegacyPackages.number(sys.level, 1));
    const ids = new Set(LegacyPackages.equippedPackages(sys, items).map(item => item.id));
    return LegacyPackages.ledger(sys).filter(entry =>
      (entry.source === "standard" || ids.has(entry.source))
      && LegacyPackages.number(entry.level, 1) <= level);
  }

  /** Pool amounts from packages that are not already counted as flat starting
   *  bonuses: flat per-level gains and rolled ledger entries. */
  static poolAdvancementTotals(sys = {}, items = []) {
    const level = Math.max(1, LegacyPackages.number(sys.level, 1));
    const totals = Object.fromEntries(POOL_KEYS.map(key => [key, 0]));
    for (const row of LegacyPackages.poolPlan(sys, items)) {
      if (row.perLevelFlat) totals[row.key] += row.perLevelFlat * Math.max(0, level - 1);
    }
    for (const entry of LegacyPackages.activeLedger(sys, items)) {
      totals[entry.key] += LegacyPackages.number(entry.value);
    }
    return totals;
  }

  /** Rolls a tracked character still needs: starting formulas at level 1 and
   *  per-level formulas from level 2 up to the current level. */
  static pendingPoolRolls(sys = {}, items = []) {
    const level = Math.max(1, LegacyPackages.number(sys.level, 1));
    const ledger = LegacyPackages.ledger(sys);
    const done = new Set(ledger.map(entry => `${entry.key}|${entry.source}|${entry.level}`));
    const pending = [];
    for (const row of LegacyPackages.poolPlan(sys, items)) {
      if (row.startFormula && !done.has(`${row.key}|${row.source}|1`)) {
        pending.push({ ...row, level: 1, formula: row.startFormula, text: row.start });
      }
      if (!row.perLevelFormula) continue;
      for (let lvl = 2; lvl <= level; lvl += 1) {
        if (!done.has(`${row.key}|${row.source}|${lvl}`)) {
          pending.push({ ...row, level: lvl, formula: row.perLevelFormula, text: row.perLevel });
        }
      }
    }
    return pending;
  }

  // -------------------------------------------------------------- attributes

  static attributeEntry(system = {}, key) {
    const raw = system?.attributeBonuses?.[key];
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return {
        bonus: LegacyPackages.number(raw.bonus),
        formula: String(raw.formula ?? "").trim(),
        value: LegacyPackages.number(raw.value),
        rolled: LegacyPackages.bool(raw.rolled),
        min: LegacyPackages.number(raw.min)
      };
    }
    const text = String(raw ?? "").trim();
    if (LegacyPackages.isFlatNumber(text)) return { bonus: Number(text), formula: "", value: 0, rolled: false, min: 0 };
    return { bonus: 0, formula: text, value: 0, rolled: false, min: 0 };
  }

  /** "roll": the package's dice are the character's attribute rolls (most
   *  R.C.C.s and monster races). "bonus": they add to the character's own
   *  3D6 rolls (O.C.C. bonuses). Older packages are inferred. */
  static attributeMode(item) {
    const explicit = item?.system?.attributeMode;
    if (explicit === "roll" || explicit === "bonus") return explicit;
    // No O.C.C. grants a 3D6 bonus, so three or more dice is an attribute
    // roll on any package; races may also write "1D6+10" as Flat + and Dice.
    const raceLike = LegacyPackages.isRaceLike(item);
    return ATTR_KEYS.some(key => {
      const entry = LegacyPackages.attributeEntry(item?.system, key);
      const dice = Number(entry.formula.match(/(\d+)\s*d/i)?.[1] ?? 0);
      return dice >= 3 || (raceLike && !!entry.formula && entry.bonus >= 4);
    }) ? "roll" : "bonus";
  }

  /** How each attribute is rolled at character creation. */
  static attributeRollPlan(sys = {}, items = []) {
    const packages = LegacyPackages.equippedPackages(sys, items);
    return ATTR_KEYS.map(key => {
      const replacing = packages.find(item => LegacyPackages.attributeMode(item) === "roll"
        && LegacyPackages.attributeEntry(item.system, key).formula);
      const bonusRolls = packages
        .filter(item => item !== replacing)
        .map(item => ({ item, entry: LegacyPackages.attributeEntry(item.system, key) }))
        .filter(({ entry }) => entry.formula && !entry.rolled)
        .map(({ item, entry }) => ({ itemId: item.id, itemName: item.name, formula: entry.formula }));
      const replacingEntry = replacing ? LegacyPackages.attributeEntry(replacing.system, key) : null;
      return {
        key,
        label: ATTR_LABELS[key],
        source: replacing ? replacing.id : "standard",
        sourceName: replacing ? replacing.name : "Standard",
        formula: replacing ? replacingEntry.formula : "3D6",
        flat: replacing ? replacingEntry.bonus : 0,
        rolled: replacing ? replacingEntry.rolled : false,
        exceptional: !replacing || /^\s*3\s*d\s*6\s*$/i.test(replacingEntry.formula),
        bonusRolls
      };
    });
  }

  static attributeChoices(system = {}) {
    return LegacyPackages.toArray(system?.attributeChoices).map((choice, index) => {
      const options = ATTR_KEYS.filter(key => LegacyPackages.bool(choice?.options?.[key]));
      return {
        index,
        label: String(choice?.label ?? ""),
        formula: String(choice?.formula ?? "").trim(),
        options: options.length ? options : ATTR_KEYS,
        chosen: ATTR_KEYS.includes(choice?.chosen) ? choice.chosen : "",
        value: LegacyPackages.number(choice?.value),
        rolled: LegacyPackages.bool(choice?.rolled)
      };
    });
  }

  /** Resolved "+1D4 to any one mental attribute" style bonuses. */
  static attributeChoiceTotals(packages = []) {
    const totals = Object.fromEntries(ATTR_KEYS.map(key => [key, 0]));
    const entries = [];
    for (const item of packages) {
      for (const choice of LegacyPackages.attributeChoices(item.system)) {
        if (!choice.chosen) continue;
        const value = LegacyPackages.isFlatNumber(choice.formula) ? Number(choice.formula) : (choice.rolled ? choice.value : 0);
        if (!value) continue;
        totals[choice.chosen] += value;
        entries.push({ itemId: item.id, key: choice.chosen, label: ATTR_LABELS[choice.chosen], value, choiceLabel: choice.label });
      }
    }
    return { totals, entries };
  }

  static requirementWarnings(packages = [], attrs = {}) {
    const warnings = [];
    for (const item of packages) {
      for (const key of ATTR_KEYS) {
        const min = LegacyPackages.attributeEntry(item.system, key).min;
        if (min > 0 && LegacyPackages.number(attrs[key]) < min) {
          warnings.push(`${item.name} requires ${ATTR_LABELS[key]} ${min} (currently ${LegacyPackages.number(attrs[key])}).`);
        }
      }
    }
    return warnings;
  }

  // ------------------------------------------------------------ level bonuses

  static levelBonusRows(system = {}) {
    return LegacyPackages.toArray(system?.levelBonuses).map((row, index) => ({
      index,
      target: String(row?.target ?? ""),
      levels: String(row?.levels ?? ""),
      value: LegacyPackages.number(row?.value, 1),
      note: String(row?.note ?? "")
    }));
  }

  /** "+1 to save vs magic at levels 3, 6, 9" adds +1 for each listed level
   *  the character has reached. */
  static levelBonusTotals(packages = [], level = 1) {
    const combat = {};
    const saves = {};
    const entries = [];
    for (const item of packages) {
      for (const row of LegacyPackages.levelBonusRows(item.system)) {
        const levels = LegacyPackages.levelList(row.levels);
        const reached = levels.length ? levels.filter(lvl => lvl <= level).length : 0;
        const value = reached * row.value;
        const [section, key] = row.target.split(".");
        if (value && section === "combat" && key) combat[key] = (combat[key] ?? 0) + value;
        if (value && section === "save" && key) saves[key] = (saves[key] ?? 0) + value;
        entries.push({ itemId: item.id, ...row, reached, total: value, levelList: levels });
      }
    }
    return { combat, saves, entries };
  }

  // ------------------------------------------------------------------ skills

  static skillDefinition(key) {
    if (!key) return null;
    return (CONFIG.EE?.SKILL_LIST ?? []).find(skill => skill.key === key) ?? null;
  }

  static isSpecialization(row = {}) {
    return !!LegacyPackages.skillDefinition(row.key)?.specialization;
  }

  static specializationName(definition, spec, fallback = "") {
    const text = String(spec ?? "").trim();
    if (!definition?.specialization) return fallback || definition?.name || text;
    return text ? `${definition.specializationBase}: ${text}` : (fallback || definition.name);
  }

  /** Fixed package skills, with an O.C.C. bonus, a language/specialty and a
   *  count for entries such as "Language: Other: Two of choice (+20%)". */
  static fixedSkills(system = {}) {
    return LegacyPackages.toArray(system?.skills).map((row, index) => {
      const definition = LegacyPackages.skillDefinition(row?.key);
      const custom = LegacyPackages.bool(row?.custom) || !row?.key;
      return {
        ...row,
        index,
        custom,
        bonus: LegacyPackages.number(row?.bonus),
        spec: String(row?.spec ?? ""),
        count: Math.max(1, LegacyPackages.number(row?.count, 1)),
        isSpecialization: !!definition?.specialization && !custom,
        specializationLabel: definition?.specializationLabel ?? "",
        specializationBase: definition?.specializationBase ?? ""
      };
    });
  }

  static languageList(system = {}) {
    return LegacyPackages.toArray(system?.languageList)
      .map((row, index) => ({
        index,
        name: String(row?.name ?? "").trim(),
        base: LegacyPackages.number(row?.base, 50),
        perLvl: LegacyPackages.number(row?.perLvl, 3),
        literacy: LegacyPackages.bool(row?.literacy)
      }))
      .filter(row => row.name);
  }

  static normalizeChoice(choice = {}) {
    const allowedGroups = LegacyPackages.toArray(choice?.allowedGroups)
      .map(rule => ({
        group: String(rule?.group ?? "").trim(),
        excludedKeys: LegacyPackages.toArray(rule?.excludedKeys).filter(Boolean),
        bonus: LegacyPackages.number(rule?.bonus)
      }))
      .filter(rule => rule.group);
    const numericMap = value => Object.fromEntries(Object.entries(value && typeof value === "object" ? value : {})
      .map(([key, entry]) => [key, LegacyPackages.number(entry)])
      .filter(([, entry]) => entry));
    return {
      label: String(choice?.label ?? ""),
      count: Math.max(0, LegacyPackages.number(choice?.count, 1)),
      level: Math.max(1, LegacyPackages.number(choice?.level, 1)),
      laterLevels: String(choice?.laterLevels ?? ""),
      laterCount: Math.max(1, LegacyPackages.number(choice?.laterCount, 1)),
      category: choice?.category || "occRelated",
      bonus: LegacyPackages.number(choice?.bonus),
      allowedKeys: LegacyPackages.toArray(choice?.allowedKeys).filter(Boolean),
      allowedGroups,
      keyBonuses: numericMap(choice?.keyBonuses),
      costs: numericMap(choice?.costs),
      allowWp: LegacyPackages.bool(choice?.allowWp),
      wpCost: Math.max(1, LegacyPackages.number(choice?.wpCost, 1))
    };
  }

  /** Picks a rule grants by a level: its count once its level is reached,
   *  plus laterCount for each later level reached. */
  static choiceBudget(choice = {}, level = 1) {
    const rule = LegacyPackages.normalizeChoice(choice);
    const first = level >= rule.level ? rule.count : 0;
    const later = LegacyPackages.levelList(rule.laterLevels).filter(lvl => lvl <= level && lvl !== rule.level).length;
    return first + later * rule.laterCount;
  }

  static trades(sys = {}) {
    return LegacyPackages.toArray(sys?.advancement?.trades)
      .map((trade, index) => ({ ...trade, _index: index }))
      .filter(Boolean);
  }

  /** Picks already spent on a rule: chosen skills (some count double) and
   *  trades such as a Hand to Hand upgrade or a W.P. */
  static choiceUsage(sys = {}, itemId, choiceIndex) {
    let used = 0;
    for (const row of LegacyPackages.toArray(sys?.skills?.list)) {
      if (row?.sourceItemId !== itemId) continue;
      if (row?.sourceChoiceIndex === undefined || row?.sourceChoiceIndex === "" || row?.sourceChoiceIndex === null) continue;
      if (Number(row.sourceChoiceIndex) !== Number(choiceIndex)) continue;
      used += Math.max(1, LegacyPackages.number(row.choiceCost, 1));
    }
    for (const trade of LegacyPackages.trades(sys)) {
      if (trade.sourceItemId !== itemId) continue;
      if (trade.choiceIndex === undefined || trade.choiceIndex === "" || trade.choiceIndex === null) continue;
      if (Number(trade.choiceIndex) !== Number(choiceIndex)) continue;
      used += Math.max(0, LegacyPackages.number(trade.cost, 1));
    }
    return used;
  }

  static choiceStatus(sys = {}, item, level = 1) {
    return LegacyPackages.toArray(item?.system?.skillChoices).map((choice, index) => {
      const rule = LegacyPackages.normalizeChoice(choice);
      const budget = LegacyPackages.choiceBudget(rule, level);
      const used = LegacyPackages.choiceUsage(sys, item.id, index);
      return { index, rule, budget, used, remaining: Math.max(0, budget - used) };
    });
  }

  static pendingChoices(sys = {}, items = [], level = null) {
    const lvl = Math.max(1, LegacyPackages.number(level ?? sys.level, 1));
    return LegacyPackages.equippedPackages(sys, items).flatMap(item =>
      LegacyPackages.choiceStatus(sys, item, lvl)
        .filter(status => status.remaining > 0)
        .map(status => ({ ...status, item })));
  }

  /** The first first-level O.C.C. Related rule pays for Hand to Hand
   *  upgrades, matching the printed "at the cost of one O.C.C. Related Skill". */
  static hthTradeChoiceIndex(item) {
    const choices = LegacyPackages.toArray(item?.system?.skillChoices).map(LegacyPackages.normalizeChoice);
    const index = choices.findIndex(choice => choice.category === "occRelated" && choice.level <= 1 && choice.count > 0);
    if (index >= 0) return index;
    return choices.findIndex(choice => choice.category === "occRelated");
  }

  static handToHand(system = {}) {
    const raw = system?.handToHand && typeof system.handToHand === "object" ? system.handToHand : {};
    const types = CONFIG.EE?.HTH_TYPES ?? {};
    const type = Object.prototype.hasOwnProperty.call(types, raw.type) && raw.type !== "none" ? raw.type : "";
    const upgrades = LegacyPackages.toArray(raw.upgrades)
      .map((upgrade, index) => ({
        index,
        type: Object.prototype.hasOwnProperty.call(types, upgrade?.type) ? upgrade.type : "",
        cost: Math.max(0, LegacyPackages.number(upgrade?.cost, 1)),
        note: String(upgrade?.note ?? "")
      }));
    return { type, upgrades };
  }

  /** Read printed Hand to Hand text ("Hand to Hand: Basic; can be changed to
   *  Expert at the cost of one O.C.C. Related Skill, or Martial Arts (or
   *  Assassin, if an evil alignment) for the cost of two") into a type and
   *  priced upgrades. Returns null when no Hand to Hand line is found. */
  static parseHandToHandText(...texts) {
    const names = [
      ["martialArts", /martial\s+arts/i], ["assassin", /assassin/i], ["commando", /commando/i],
      ["expert", /expert/i], ["basic", /basic/i]
    ];
    const text = texts.map(value => String(value ?? "")).join("\n");
    const start = text.search(/hand\s*to\s*hand\s*(?:combat)?\s*:/i);
    if (start < 0) return null;
    // The line ends at a line break or at the next "Label:" section.
    const afterLabel = text.slice(start).replace(/^hand\s*to\s*hand\s*(?:combat)?\s*:\s*/i, "").split(/\n/)[0].replace(/\s+/g, " ");
    const end = afterLabel.search(/(?:O\.?\s*C\.?\s*C\.?|R\.?\s*C\.?\s*C\.?)\s+Related\s+Skills\s*:|Secondary\s+Skills\s*:|\b(?:W\.?\s*P\.?\s+[A-Z][a-z]+|Weapons|Armou?r|Vehicles?|Money|Equipment|Cybernetics(?:\s*&\s*Bionics)?|Bionics)\s*:/);
    const segment = (end > 0 ? afterLabel.slice(0, end) : afterLabel).slice(0, 400);
    const found = [];
    for (const [type, pattern] of names) {
      const global = new RegExp(pattern.source, "gi");
      for (const match of segment.matchAll(global)) found.push({ type, index: match.index });
    }
    found.sort((a, b) => a.index - b.index);
    if (!found.length) return null;
    const base = found[0];
    const costs = [...segment.matchAll(/(?:cost\s+of|sacrific\w*)\s+(one|two|three|four|\d+)/gi)]
      .map(match => ({ index: match.index, cost: LegacyPackages.countWord(match[1], 1) }));
    const upgrades = [];
    for (const entry of found.slice(1)) {
      if (entry.type === base.type || upgrades.some(upgrade => upgrade.type === entry.type)) continue;
      const after = costs.find(cost => cost.index > entry.index);
      const before = [...costs].reverse().find(cost => cost.index < entry.index);
      // "(or Assassin, if an evil alignment)" restricts only the style named
      // immediately before "evil".
      const evilAt = segment.slice(entry.index).search(/\bevil\b/i);
      const evil = evilAt >= 0 && evilAt <= 40
        && !/[.;)]/.test(segment.slice(entry.index, entry.index + evilAt))
        && !found.some(other => other.index > entry.index && other.index < entry.index + evilAt);
      upgrades.push({ type: entry.type, cost: (after ?? before)?.cost ?? 1, note: evil ? "Evil alignments only" : "" });
    }
    return { type: base.type, upgrades, text: `Hand to Hand: ${segment.trim()}` };
  }

  static _normName(text) {
    return String(text ?? "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
  }

  /** Read printed bonus text ("+10% Psychology, +2 to strike, +1 to save vs
   *  magic at levels 3, 6 and 9, +1D4 to P.S.") into structured bonuses.
   *  Anything not understood is returned as unparsed text. */
  static parseBonusText(text) {
    const result = { skills: [], attributes: [], attributeChoices: [], combat: [], saves: [], pools: [], levelBonuses: [], unparsed: [] };
    const raw = String(text ?? "").replace(/\s+/g, " ").trim();
    if (!raw) return result;
    const skills = (CONFIG.EE?.SKILL_LIST ?? []).map(skill => ({ ...skill, norm: LegacyPackages._normName(skill.name) }))
      .sort((a, b) => b.norm.length - a.norm.length);
    const attrPatterns = ATTRIBUTE_PATTERNS.map(([key, pattern]) => [key, new RegExp(pattern.source, "i")]);
    const combatTests = [
      ["attacks", /\b(attacks?|actions?)\b.*\b(melee|round)\b|\battacks? per melee\b/i],
      ["initiative", /\binit(iative)?\b/i], ["perception", /\bperception\b/i], ["pullPunch", /\bpull(ed)?\s+punch/i],
      ["roll", /\broll\b.*\b(punch|fall|impact)\b/i], ["disarm", /\bdisarm\b/i], ["entangle", /\bentangle\b/i],
      ["strike", /\bstrike\b/i], ["parry", /\bparry\b/i], ["dodge", /\bdodge\b/i], ["damage", /\bdamage\b/i]
    ];
    const saveTests = [
      ["horrorFactor", /\bhorror\b/i], ["possession", /\bpossession\b/i], ["insanity", /\binsanity\b/i],
      ["psionics", /\bpsi(onic)?s?\b/i], ["ritual", /\britual\b/i], ["harmfulDrugs", /\bharmful\s+drugs?\b/i],
      ["drugPoison", /\b(poisons?|toxins?|drugs?)\b/i], ["death", /\b(coma|death)\b/i], ["pain", /\bpain\b/i],
      ["spell", /\b(spells?|magic)\b/i]
    ];
    const levelWord = "(?:\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen)";
    const levelsPattern = new RegExp(`\\bat\\s+levels?\\s+(${levelWord}(?:(?:\\s*,\\s*(?:and\\s+)?|\\s+and\\s+|\\s*&\\s*)${levelWord})*)\\s*$`, "i");
    // A new bonus starts after a semicolon, a sentence break, or a comma or
    // "and" followed by "+N"; commas inside level lists stay together.
    const chunks = raw
      .split(/\s*;\s*|\.\s+(?=[A-Z+-])|\s*,\s*(?=[+-]\s*\d)|\s+and\s+(?=[+-]\s*\d)/)
      .map(chunk => chunk.trim().replace(/\.$/, ""))
      .filter(Boolean);
    for (const chunk of chunks) {
      const levelsMatch = chunk.match(levelsPattern);
      const body = levelsMatch ? chunk.slice(0, levelsMatch.index).trim() : chunk;
      // Skill percentages: "+10% Psychology", "+5% to Prowl", "Prowl +10%".
      const pct = body.match(/^([+-]\s*\d+)\s*%\s*(?:(?:to|on|in)\s+)?(.+)$/i) ?? body.match(/^(.+?)\s*\(?\s*([+-]\s*\d+)\s*%\s*\)?$/);
      if (pct) {
        const [value, name] = /^[+-]/.test(body) ? [pct[1], pct[2]] : [pct[2], pct[1]];
        const wanted = LegacyPackages._normName(name);
        const skill = skills.find(entry => entry.norm === wanted)
          ?? skills.find(entry => entry.norm.length > 3 && (wanted.startsWith(`${entry.norm} `) || wanted === entry.norm));
        if (skill && !levelsMatch) result.skills.push({ key: skill.key, name: skill.name, bonus: Number(value.replace(/\s/g, "")), text: chunk });
        else result.unparsed.push(chunk);
        continue;
      }
      const amount = body.match(/^([+-]\s*\d+(?:\s*D\s*\d+)?(?:\s*[x×*]\s*\d+)?(?:\s*\+\s*\d+(?!\s*D))?)\s*(?:(?:to|on)\s+)?(.*)$/i);
      if (!amount) {
        result.unparsed.push(chunk);
        continue;
      }
      const value = amount[1].replace(/\s/g, "");
      const target = amount[2];
      const isDice = /d/i.test(value);
      const numeric = isDice ? null : Number(value);
      // "+1D4 to any one Mental attribute" becomes a player's attribute choice.
      const anyOne = target.match(/\bany\s+one\s+(mental|physical)?\s*attribute/i);
      if (anyOne && !levelsMatch) {
        const kind = (anyOne[1] ?? "").toLowerCase();
        const keys = kind === "mental" ? ["iq", "me", "ma"] : kind === "physical" ? ["ps", "pp", "pe", "pb", "spd"] : ATTR_KEYS;
        result.attributeChoices.push({
          label: `Any one ${kind ? `${kind[0].toUpperCase()}${kind.slice(1)} ` : ""}attribute`,
          formula: value.replace(/^\+/, ""),
          options: Object.fromEntries(keys.map(key => [key, true])),
          chosen: "", value: 0, rolled: false, text: chunk
        });
        continue;
      }
      // "+3D6+10 S.D.C." and "+1D4x10 to P.P.E." add to a pool's starting value.
      const pool = target.match(/^(?:physical\s+)?(S\.?\s?D\.?\s?C|M\.?\s?D\.?\s?C|I\.?\s?S\.?\s?P|P\.?\s?P\.?\s?E|H\.?\s?P|hit\s+points)\b/i);
      if (pool && !levelsMatch) {
        const keyOf = { sdc: "sdc", mdc: "mdc", isp: "isp", ppe: "ppe", hp: "hp", hitpoints: "hp" };
        result.pools.push({ key: keyOf[pool[1].toLowerCase().replace(/[^a-z]/g, "")], formula: value.replace(/^\+/, ""), text: chunk });
        continue;
      }
      // Rules that are not plain combat or save bonuses stay notes.
      if (/\b(spell strength|auto(?:matic)?\s+dodge|teleport)\b/i.test(target)) {
        if (levelsMatch && numeric !== null) {
          result.levelBonuses.push({ target: "note", levels: levelsMatch[1].trim(), value: numeric, note: target.replace(/\s*\(.*?\)\s*/g, " ").trim(), text: chunk });
        } else {
          result.unparsed.push(chunk);
        }
        continue;
      }
      const attr = attrPatterns.find(([, pattern]) => pattern.test(target));
      if (attr && !levelsMatch && !/\bsave\b/i.test(target)
        && /^\s*(?:the\s+)?(?:I\.?\s?Q|M\.?\s?E|M\.?\s?A|P\.?\s?S|P\.?\s?P|P\.?\s?E|P\.?\s?B|Sp(?:ee)?d)\b/i.test(target)) {
        result.attributes.push({ key: attr[0], bonus: isDice ? 0 : numeric, formula: isDice ? value.replace(/^\+/, "") : "", text: chunk });
        continue;
      }
      if (/\bsave|\bvs\.?\b|\bversus\b/i.test(target)) {
        const save = saveTests.find(([, test]) => test.test(target));
        if (save && numeric !== null) {
          if (levelsMatch) result.levelBonuses.push({ target: `save.${save[0]}`, levels: levelsMatch[1].trim(), value: numeric, note: "", text: chunk });
          else result.saves.push({ key: save[0], value: numeric, text: chunk });
          continue;
        }
      } else {
        const combat = combatTests.find(([, test]) => test.test(target));
        if (combat && numeric !== null) {
          if (levelsMatch) result.levelBonuses.push({ target: `combat.${combat[0]}`, levels: levelsMatch[1].trim(), value: numeric, note: "", text: chunk });
          else result.combat.push({ key: combat[0], value: numeric, text: chunk });
          continue;
        }
      }
      if (levelsMatch && numeric !== null) {
        result.levelBonuses.push({ target: "note", levels: levelsMatch[1].trim(), value: numeric, note: target, text: chunk });
        continue;
      }
      result.unparsed.push(chunk);
    }
    return result;
  }

  /** Older free-text race languages: the first entry becomes the native
   *  language and the rest racial languages. */
  static parseLanguageText(text) {
    const names = String(text ?? "").split(/\s*(?:,|;|\band\b)\s*/i).map(name => name.trim().replace(/\.$/, "")).filter(Boolean);
    if (!names.length) return null;
    return { native: names[0], others: names.slice(1) };
  }

  /** Skills (and W.P.s) a rule allows, with the bonus and pick cost of each. */
  static choiceOptions(choice = {}, { usedKeys = new Set(), usedWps = new Set() } = {}) {
    const rule = LegacyPackages.normalizeChoice(choice);
    const master = CONFIG.EE?.SKILL_LIST ?? [];
    const allowed = new Set(rule.allowedKeys);
    const restricted = !!(allowed.size || rule.allowedGroups.length);
    const options = [];
    for (const skill of master) {
      if (rule.category === "secondary" && skill.secondary === false) continue;
      const groupRule = rule.allowedGroups.find(group => group.group === skill.group && !group.excludedKeys.includes(skill.key));
      if (restricted && !allowed.has(skill.key) && !groupRule) continue;
      if (!skill.repeatable && usedKeys.has(skill.key)) continue;
      const bonus = rule.category === "secondary"
        ? 0
        : rule.bonus + (rule.keyBonuses[skill.key] ?? (allowed.has(skill.key) ? 0 : (groupRule?.bonus ?? 0)));
      options.push({
        kind: "skill",
        key: skill.key,
        name: skill.name,
        group: skill.group,
        base: skill.base,
        perLvl: skill.perLvl,
        bonus,
        cost: Math.max(1, rule.costs[skill.key] ?? 1),
        specialization: !!skill.specialization,
        repeatable: !!skill.repeatable,
        specializationLabel: skill.specializationLabel ?? "",
        statBonuses: skill.statBonuses ?? {}
      });
    }
    if (rule.allowWp) {
      for (const [era, list] of Object.entries(CONFIG.EE?.WP_LIST ?? {})) {
        for (const wp of list) {
          if (usedWps.has(wp.key)) continue;
          options.push({ kind: "wp", key: wp.key, name: wp.name, group: `W.P. (${era === "ancient" ? "Ancient" : "Modern"})`, bonus: 0, cost: rule.wpCost });
        }
      }
    }
    return options;
  }

  /** Rows for an actor's skill list from a package's fixed skills, expanding
   *  specialized entries ("Language: Other: Two of choice") by the names
   *  chosen for them. */
  static fixedSkillRows(item, specs = {}, { level = 1, usedKeys = new Set(), defaultNative = "" } = {}) {
    const rows = [];
    const category = item?.type === "race" ? "racial" : null;
    const used = new Set(usedKeys);
    for (const row of LegacyPackages.fixedSkills(item?.system)) {
      const definition = LegacyPackages.skillDefinition(row.key);
      const isCustom = row.custom;
      const names = [];
      if (row.isSpecialization) {
        const chosen = LegacyPackages.toArray(specs[row.index]).map(value => String(value ?? "").trim());
        for (let n = 0; n < row.count; n += 1) {
          const fallbackSpec = row.spec || (row.key === "languageNative" || row.key === "literacyNative" ? defaultNative : "");
          names.push(LegacyPackages.specializationName(definition, chosen[n] || fallbackSpec, row.name));
        }
      } else {
        names.push(String(row.name ?? "").trim());
      }
      for (const name of names) {
        if (!name) continue;
        if (!isCustom && !definition?.repeatable && !row.isSpecialization && used.has(row.key)) continue;
        if (isCustom && used.has(`custom:${name.toLowerCase()}`)) continue;
        if (row.isSpecialization && used.has(`name:${name.toLowerCase()}`)) continue;
        used.add(isCustom ? `custom:${name.toLowerCase()}` : row.key);
        used.add(`name:${name.toLowerCase()}`);
        rows.push({
          key: row.key ?? "",
          name,
          base: LegacyPackages.number(row.base),
          perLvl: LegacyPackages.number(row.perLvl),
          misc: LegacyPackages.number(row.misc),
          occBonus: row.bonus,
          category: category ?? (row.category || "occ"),
          custom: isCustom,
          learnedAtLevel: Math.max(1, level),
          sourceItemId: item.id,
          statBonuses: foundry.utils.deepClone(row.statBonuses ?? definition?.statBonuses ?? {})
        });
      }
    }
    for (const language of LegacyPackages.languageList(item?.system)) {
      const languageName = `Language: ${language.name}`;
      if (!used.has(`name:${languageName.toLowerCase()}`)) {
        used.add(`name:${languageName.toLowerCase()}`);
        rows.push({
          key: "languageOther", name: languageName, base: language.base, perLvl: language.perLvl, misc: 0, occBonus: 0,
          category: category ?? "occ", custom: false, learnedAtLevel: 1, sourceItemId: item.id, statBonuses: {}
        });
      }
      const literacyName = `Literacy: ${language.name}`;
      if (language.literacy && !used.has(`name:${literacyName.toLowerCase()}`)) {
        used.add(`name:${literacyName.toLowerCase()}`);
        const literacy = LegacyPackages.skillDefinition("literacyOther");
        rows.push({
          key: "literacyOther", name: literacyName, base: literacy?.base ?? 30, perLvl: literacy?.perLvl ?? 5, misc: 0, occBonus: 0,
          category: category ?? "occ", custom: false, learnedAtLevel: 1, sourceItemId: item.id, statBonuses: {}
        });
      }
    }
    return rows;
  }

  /** Actor skill keys and names already taken, for duplicate checks. */
  static usedSkillKeys(sys = {}) {
    const used = new Set();
    for (const row of LegacyPackages.toArray(sys?.skills?.list)) {
      const name = String(row?.name ?? "").trim().toLowerCase();
      if (row?.custom || !row?.key) {
        if (name) used.add(`custom:${name}`);
      } else {
        used.add(row.key);
      }
      if (name) used.add(`name:${name}`);
    }
    return used;
  }

  static selectedWps(sys = {}, items = []) {
    const selected = new Set(Object.entries(sys?.weaponProficiencies?.selected ?? {})
      .filter(([, value]) => LegacyPackages.bool(value)).map(([key]) => key));
    for (const item of LegacyPackages.equippedPackages(sys, items)) {
      for (const [key, value] of Object.entries(item.system?.weaponProficiencies?.selected ?? {})) {
        if (LegacyPackages.bool(value)) selected.add(key);
      }
    }
    return selected;
  }
}
