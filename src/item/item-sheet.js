import { LegacyRules } from "../rules/legacy.js";

export class ErrantEarthItemSheet extends ItemSheet {
  constructor(item, options = {}) {
    const size = ErrantEarthItemSheet.ITEM_SHEET_SIZES[item?.type] ?? {};
    const sizedOptions = foundry.utils.mergeObject(size, options ?? {}, { inplace: false });
    if (item?.type === "occ" && !sizedOptions.tabs) {
      sizedOptions.tabs = [{ navSelector: ".ee-item-tabs", contentSelector: ".ee-item-tab-body", initial: "overview" }];
    }
    super(item, sizedOptions);
    this._disclosureState = this._loadDisclosureState();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["errantearth", "sheet", "item"],
      template: "systems/errantearth/templates/item/item-sheet.html",
      width: 720,
      height: 760,
      submitOnChange: true,
      closeOnSubmit: false,
      submitOnClose: true,
      scrollY: [".ee-item-body"],
      resizable: true
    });
  }

  static ITEM_SHEET_SIZES = {
    psionicPower: { width: 580, height: 540 },
    spell: { width: 580, height: 560 },
    ability: { width: 540, height: 430 },
    weapon: { width: 640, height: 620 },
    armor: { width: 640, height: 640 },
    powerArmor: { width: 660, height: 680 },
    vehicle: { width: 780, height: 740 },
    race: { width: 720, height: 680 },
    occ: { width: 780, height: 720 },
    gear: { width: 540, height: 460 }
  };

  static ITEM_TYPE_META = {
    psionicPower: { label: "Psionic Power", kicker: "Mental discipline", icon: "fa-brain" },
    spell: { label: "Spell", kicker: "PPE formula and effect", icon: "fa-hat-wizard" },
    ability: { label: "Ability", kicker: "Granted feature or special rule", icon: "fa-star" },
    weapon: { label: "Weapon", kicker: "Attack profile", icon: "fa-crosshairs" },
    armor: { label: "Armor", kicker: "Protection by location", icon: "fa-shield-alt" },
    powerArmor: { label: "Power Armor", kicker: "Powered suit profile", icon: "fa-robot" },
    vehicle: { label: "Vehicle", kicker: "Platform, armor, and weapon systems", icon: "fa-truck" },
    race: { label: "Race", kicker: "Legacy ancestry package", icon: "fa-dna" },
    occ: { label: "O.C.C.", kicker: "Legacy occupation package", icon: "fa-id-badge" },
    gear: { label: "Gear", kicker: "Equipment and inventory", icon: "fa-box-open" }
  };

  static _titleCaseType(type = "") {
    return String(type)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  static _fieldValue(value, fallback = "Not set") {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
  }

  static _labelFrom(options = {}, value, fallback = "Not set") {
    if (value === null || value === undefined || value === "") return fallback;
    return options?.[value] ?? value;
  }

  static _isKnownChoice(options = {}, value) {
    return value !== null
      && value !== undefined
      && value !== ""
      && Object.prototype.hasOwnProperty.call(options ?? {}, value);
  }

  static _prepareCustomChoice(system = {}, field, flag, options = {}) {
    const value = system?.[field];
    if (system?.[flag] || (value && !ErrantEarthItemSheet._isKnownChoice(options, value))) {
      system[flag] = true;
    }
    return system;
  }

  static _summaryFor(type, system = {}) {
    const cfg = CONFIG.EE ?? {};
    const entries = [];
    const add = (label, value, fallback = "Not set") => {
      const text = ErrantEarthItemSheet._fieldValue(value, fallback);
      if (text !== "Not set" && text !== "0") entries.push({ label, value: text });
    };
    const addRaw = (label, value) => entries.push({ label, value: ErrantEarthItemSheet._fieldValue(value) });

    switch (type) {
      case "psionicPower":
        add("Type", ErrantEarthItemSheet._labelFrom(cfg.PSIONIC_TYPES, system.type));
        addRaw("ISP", system.ispCost ?? 0);
        add("Range", system.range);
        add("Duration", system.duration);
        break;
      case "spell":
        add("Category", ErrantEarthItemSheet._labelFrom(cfg.SPELL_CATEGORIES, system.category));
        addRaw("Level", system.level ?? 1);
        addRaw("PPE", system.ppeCost ?? 0);
        add("Range", system.range);
        break;
      case "weapon":
        add("Damage", system.damage);
        add("Range", system.range);
        add("Category", ErrantEarthItemSheet._labelFrom(cfg.WEAPON_CATEGORIES, system.category));
        add("Payload", system.payload || system.ammo);
        break;
      case "armor":
        addRaw("A.R.", system.ar ?? 0);
        add("Type", system.isMDC ? "MDC" : "SDC");
        add("Weight", system.weight);
        add("Cost", system.cost);
        break;
      case "powerArmor":
        addRaw("A.R.", system.ar ?? 0);
        add("Structure", system.isMDC ? "MDC" : "SDC");
        add("Speed", system.speed);
        add("Cost", system.cost);
        break;
      case "vehicle":
        add("Type", ErrantEarthItemSheet._labelFrom(cfg.VEHICLE_TYPES, system.vehicleType));
        add("Structure", system.isMDC ? "MDC" : "SDC");
        add("Crew", system.crew);
        add("Capacity", system.capacity);
        break;
      case "race":
        add("Size", system.size);
        add("Lifespan", system.lifespan);
        add("Languages", system.languages);
        add("Structure", system.isMDC ? "MDC being" : "SDC being");
        break;
      case "occ":
        add("Category", system.category);
        add("Type", system.isRCC ? (system.rccAsRace ? "R.C.C. (Race)" : "R.C.C.") : "O.C.C.");
        add("Skills", ErrantEarthItemSheet._toArray(system.skills).length);
        add("XP Track", cfg.RIFTS_XP_TRACKS?.[system.xpTrack?.preset]?.label ?? (system.xpTrack?.preset === "custom" ? "Custom" : ""));
        break;
      case "gear":
        addRaw("Qty", system.quantity ?? 1);
        add("Weight", system.weight);
        add("Cost", system.cost);
        break;
      default:
        break;
    }
    return entries.slice(0, 4);
  }

  static _toArray(v) {
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") return Object.keys(v)
      .filter(k => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map(k => v[k]);
    return [];
  }

  static _editableArray(value) {
    return foundry.utils.deepClone(ErrantEarthItemSheet._toArray(value));
  }

  static _validIndex(value, length) {
    if (value === null || value === undefined || String(value).trim() === "") return -1;
    const index = Number(value);
    return Number.isInteger(index) && index >= 0 && index < length ? index : -1;
  }

  static _coerceArrays(v) {
    if (v === null || typeof v !== "object") return v;
    if (Array.isArray(v)) return v.map(ErrantEarthItemSheet._coerceArrays);
    const keys = Object.keys(v);
    const numeric = keys.length > 0 && keys.every(k => /^\d+$/.test(k));
    if (numeric) {
      const arr = [];
      for (const k of keys.sort((a, b) => Number(a) - Number(b))) {
        arr.push(ErrantEarthItemSheet._coerceArrays(v[k]));
      }
      return arr;
    }
    const out = {};
    for (const k of keys) out[k] = ErrantEarthItemSheet._coerceArrays(v[k]);
    return out;
  }

  static _coerceBoolean(value) {
    if (Array.isArray(value)) return ErrantEarthItemSheet._coerceBoolean(value.at(-1));
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return ["true", "on", "1", "yes"].includes(value.toLowerCase());
    return !!value;
  }

  static _numberField(value) {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  static _normalizeAttributeRoll(entry) {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      return {
        bonus: ErrantEarthItemSheet._numberField(entry.bonus),
        formula: entry.formula ?? "",
        value: ErrantEarthItemSheet._numberField(entry.value),
        rolled: ErrantEarthItemSheet._coerceBoolean(entry.rolled)
      };
    }
    const raw = String(entry ?? "").trim();
    const numeric = /^[-+]?\d+$/.test(raw) ? Number(raw) : 0;
    return { bonus: numeric, formula: numeric ? "" : raw, value: 0, rolled: false };
  }

  static _normalizeCcData(system = {}) {
    const attrKeys = ["iq", "me", "ma", "ps", "pp", "pe", "pb", "spd"];
    const combatKeys = ["attacks", "initiative", "perception", "damage", "strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll"];
    const saveKeys = ["spell", "ritual", "psionics", "drugPoison", "harmfulDrugs", "insanity", "possession", "horrorFactor", "death", "pain"];
    const out = foundry.utils.deepClone(system);

    out.attributeBonuses = out.attributeBonuses ?? {};
    for (const key of attrKeys) out.attributeBonuses[key] = ErrantEarthItemSheet._normalizeAttributeRoll(out.attributeBonuses[key]);

    const normalizeNumbers = (section, keys) => {
      const raw = out[section];
      out[section] = {};
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        for (const key of keys) out[section][key] = ErrantEarthItemSheet._numberField(raw[key]);
      } else {
        for (const key of keys) out[section][key] = 0;
      }
    };
    normalizeNumbers("combatBonuses", combatKeys);
    normalizeNumbers("saveBonuses", saveKeys);

    out.skillBonuses = ErrantEarthItemSheet._toArray(out.skillBonuses);
    out.weaponProficiencies = (out.weaponProficiencies && typeof out.weaponProficiencies === "object")
      ? out.weaponProficiencies
      : {};
    out.weaponProficiencies.selected = out.weaponProficiencies.selected ?? {};
    out.weaponProficiencies.custom = ErrantEarthItemSheet._toArray(out.weaponProficiencies.custom);
    out.weaponProficiencies.choices = ErrantEarthItemSheet._toArray(out.weaponProficiencies.choices);
    out.abilities = ErrantEarthItemSheet._toArray(out.abilities);
    return out;
  }

  static _legacyWpOptions(selected = {}) {
    const decorate = entry => ({ ...entry, checked: !!selected?.[entry.key] });
    return {
      ancient: (CONFIG.EE?.WP_LIST?.ancient ?? []).map(decorate),
      modern: (CONFIG.EE?.WP_LIST?.modern ?? []).map(decorate)
    };
  }

  static _groupSkillPicker(skills = []) {
    const grouped = {};
    for (const s of skills) (grouped[s.group] ??= []).push(s);
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, items]) => ({ group, items }));
  }

  static _normalizeSkillChoiceGroups(groups = []) {
    return ErrantEarthItemSheet._toArray(groups)
      .map(rule => ({
        group: String(rule?.group ?? "").trim(),
        excludedKeys: ErrantEarthItemSheet._toArray(rule?.excludedKeys).filter(Boolean)
      }))
      .filter(rule => rule.group);
  }

  static _decorateOccSkillChoices(choices = []) {
    const master = CONFIG.EE?.SKILL_LIST ?? [];
    const byKey = new Map(master.map(s => [s.key, s]));
    return ErrantEarthItemSheet._toArray(choices).map((choice, index) => {
      const category = choice?.category || "occRelated";
      const eligible = master.filter(s => category !== "secondary" || s.secondary !== false);
      const allowedKeys = ErrantEarthItemSheet._toArray(choice?.allowedKeys).filter(Boolean);
      const allowedGroups = ErrantEarthItemSheet._normalizeSkillChoiceGroups(choice?.allowedGroups);
      const usedKeys = new Set(allowedKeys);
      const usedGroups = new Set(allowedGroups.map(rule => rule.group));
      const selectedGroupRows = allowedGroups.map((rule, groupIndex) => {
        const groupSkills = eligible.filter(s => s.group === rule.group);
        const excluded = new Set(rule.excludedKeys);
        return {
          ...rule,
          _groupIndex: groupIndex,
          excludedSkillRows: rule.excludedKeys.map(key => byKey.get(key)).filter(Boolean),
          exclusionPicker: groupSkills.filter(s => !excluded.has(s.key))
        };
      });
      return {
        label: choice?.label ?? "",
        count: Number(choice?.count ?? 1) || 1,
        level: Math.max(1, Number(choice?.level ?? 1) || 1),
        category,
        bonus: Number(choice?.bonus ?? 0) || 0,
        allowedKeys,
        allowedGroups,
        _index: index,
        selectedSkillRows: allowedKeys.map(key => byKey.get(key)).filter(Boolean),
        selectedGroupRows,
        hasRestrictions: !!(allowedKeys.length || allowedGroups.length),
        picker: ErrantEarthItemSheet._groupSkillPicker(eligible.filter(s => !usedKeys.has(s.key))),
        groupPicker: [...new Set(eligible.map(s => s.group))]
          .filter(group => !usedGroups.has(group))
          .sort((a, b) => a.localeCompare(b))
      };
    });
  }

  static _decorateWpChoices(choices = []) {
    const ancient = CONFIG.EE?.WP_LIST?.ancient ?? [];
    const modern = CONFIG.EE?.WP_LIST?.modern ?? [];
    const all = [...ancient, ...modern];
    const byKey = new Map(all.map(wp => [wp.key, wp]));
    return ErrantEarthItemSheet._toArray(choices).map((choice, index) => {
      const allowedKeys = ErrantEarthItemSheet._toArray(choice?.allowedKeys).filter(Boolean);
      const usedKeys = new Set(allowedKeys);
      return {
        label: choice?.label ?? "",
        count: Number(choice?.count ?? 1) || 1,
        pool: choice?.pool || "any",
        allowedKeys,
        selectedWpRows: allowedKeys.map(key => byKey.get(key)).filter(Boolean),
        wpPicker: [
          { group: "Ancient", items: ancient.filter(wp => !usedKeys.has(wp.key)) },
          { group: "Modern", items: modern.filter(wp => !usedKeys.has(wp.key)) }
        ],
        _index: index
      };
    });
  }

  static _normalizeXpThresholds(values = []) {
    const source = ErrantEarthItemSheet._toArray(values);
    const thresholds = Array.from({ length: 15 }, (_, index) => {
      if (index === 0) return 0;
      const numeric = Number(source[index] ?? 0);
      return Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : 0;
    });
    return thresholds;
  }

  static _prepareXpTrack(system = {}) {
    const tracks = CONFIG.EE?.RIFTS_XP_TRACKS ?? {};
    const raw = system.xpTrack ?? {};
    const preset = String(raw.preset ?? "");
    const configured = tracks[preset] ?? null;
    const isCustom = preset === "custom";
    const thresholds = configured
      ? ErrantEarthItemSheet._normalizeXpThresholds(configured.thresholds)
      : ErrantEarthItemSheet._normalizeXpThresholds(raw.thresholds);
    const level15Max = Number(configured?.level15Max ?? raw.level15Max ?? 0) || 0;
    const isValid = thresholds.every((value, index) => index === 0 || value > thresholds[index - 1])
      && level15Max >= thresholds[14];
    const format = value => Number(value ?? 0).toLocaleString("en-US");
    const rows = thresholds.map((min, index) => {
      const max = index < 14 ? Math.max(0, thresholds[index + 1] - 1) : level15Max;
      return {
        index,
        level: index + 1,
        min,
        max,
        minDisplay: format(min),
        maxDisplay: max ? format(max) : "—"
      };
    });
    return {
      preset,
      label: configured?.label ?? (isCustom ? "Custom experience track" : "No experience track"),
      isCustom,
      hasTrack: !!configured || isCustom,
      isValid,
      thresholds,
      level15Max,
      rows
    };
  }

  async getData(options) {
    const ctx = await super.getData(options);
    ctx.config = CONFIG.EE ?? {};
    ctx.system = foundry.utils.deepClone(this.item.system);
    ctx.itemTypeMeta = ErrantEarthItemSheet.ITEM_TYPE_META[this.item.type] ?? {
      label: ErrantEarthItemSheet._titleCaseType(this.item.type),
      kicker: "Item profile",
      icon: "fa-cube"
    };
    if (this.item.type === "psionicPower") {
      ErrantEarthItemSheet._prepareCustomChoice(ctx.system, "type", "typeCustom", CONFIG.EE?.PSIONIC_TYPES);
    }
    if (this.item.type === "spell") {
      ErrantEarthItemSheet._prepareCustomChoice(ctx.system, "category", "categoryCustom", CONFIG.EE?.SPELL_CATEGORIES);
    }
    if (this.item.type === "occ") {
      const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
      ctx.system.skills = skills;
      const usedKeys = new Set(skills.map(r => r.key).filter(Boolean));
      const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => s.repeatable || !usedKeys.has(s.key));
      ctx.skillPicker = ErrantEarthItemSheet._groupSkillPicker(masterList);
      ctx.occXpTrack = ErrantEarthItemSheet._prepareXpTrack(ctx.system);
      ctx.system.xpTrack = {
        preset: ctx.occXpTrack.preset,
        thresholds: ctx.occXpTrack.thresholds,
        level15Max: ctx.occXpTrack.level15Max
      };
      ctx.xpTrackOptions = {
        ...Object.fromEntries(Object.entries(CONFIG.EE?.RIFTS_XP_TRACKS ?? {}).map(([key, track]) => [key, track.label])),
        custom: "Custom / another sourcebook"
      };
    }
    if (this.item.type === "occ" || this.item.type === "race") {
      ctx.system = ErrantEarthItemSheet._normalizeCcData(ctx.system);
      ctx.system.skillChoices = ErrantEarthItemSheet._decorateOccSkillChoices(this.item.system.skillChoices);
      ctx.skillPicker ??= ErrantEarthItemSheet._groupSkillPicker(CONFIG.EE?.SKILL_LIST ?? []);
      const skillBonuses = ctx.system.skillBonuses;
      const usedBonusKeys = new Set(skillBonuses.map(r => r.key).filter(Boolean));
      const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => !usedBonusKeys.has(s.key));
      ctx.ccSkillBonusPicker = ErrantEarthItemSheet._groupSkillPicker(masterList);
      const wp = ErrantEarthItemSheet._legacyWpOptions(ctx.system.weaponProficiencies.selected);
      ctx.wpAncient = wp.ancient;
      ctx.wpModern = wp.modern;
      ctx.system.weaponProficiencies.choices = ErrantEarthItemSheet._decorateWpChoices(ctx.system.weaponProficiencies.choices);
      const nonzero = values => Object.values(values ?? {}).filter(value => Number(value) !== 0 && String(value ?? "").trim() !== "").length;
      const attributes = Object.values(ctx.system.attributeBonuses ?? {}).filter(value => Number(value?.bonus) || value?.formula || Number(value?.value)).length;
      const selectedWps = [...wp.ancient, ...wp.modern].filter(value => value.checked).length + ctx.system.weaponProficiencies.custom.length;
      const powers = [ctx.system.grantsMagic && "Magic", ctx.system.grantsPsionics && "Psionics", `${ctx.system.abilities.length} abilities`].filter(Boolean);
      ctx.ccGroupSummary = {
        attributes: `${attributes} configured`,
        pools: `${nonzero(ctx.system.poolBonuses)} configured`,
        skills: `${skillBonuses.length} bonuses`,
        weapons: `${selectedWps} fixed · ${ctx.system.weaponProficiencies.choices.length} choices`,
        combat: `${nonzero(ctx.system.combatBonuses)} combat · ${nonzero(ctx.system.saveBonuses)} saves`,
        powers: powers.join(" · ")
      };
    }
    if (this.item.type === "weapon") {
      ctx.system.damageScale = LegacyRules.weaponDamageScale(ctx.system);
      ctx.weaponDamageScales = { ...CONFIG.EE?.EE_DAMAGE_SCALES, S: "Standard (SDC)", M: "Mega (MDC)" };
      const ancient = (CONFIG.EE?.WP_LIST?.ancient ?? []).map(wp => [wp.key, `${wp.name} (Ancient)`]);
      const modern = (CONFIG.EE?.WP_LIST?.modern ?? []).map(wp => [wp.key, `${wp.name} (Modern)`]);
      ctx.weaponProficiencyOptions = Object.fromEntries([...ancient, ...modern]);
    }
    if (this.item.type === "vehicle") {
      ctx.system.armor = ctx.system.armor ?? {};
      ctx.system.armor.extras = ErrantEarthItemSheet._toArray(this.item.system.armor?.extras);
      ctx.system.weapons = ErrantEarthItemSheet._toArray(this.item.system.weapons)
        .map(row => ({ ...row, name: row?.name ?? row?.type ?? "" }));
    }
    ctx.itemSummary = ErrantEarthItemSheet._summaryFor(this.item.type, ctx.system);
    ctx.disclosureState = this._disclosureState ?? {};
    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("details[data-disclosure]").each((_, el) => {
      el.addEventListener("toggle", this._onDisclosureToggle.bind(this));
    });
    if (!this.isEditable) return;
    html.on("click",  "[data-action='add-occ-skill']",         this._onAddOccSkill.bind(this));
    html.on("change", "[data-action='add-occ-skill-from-list']", this._onAddOccSkillFromList.bind(this));
    html.on("click",  "[data-action='delete-occ-skill']",      this._onDeleteOccSkill.bind(this));
    html.on("click",  "[data-action='add-occ-skill-choice']",  this._onAddOccSkillChoice.bind(this));
    html.on("click",  "[data-action='delete-occ-skill-choice']", this._onDeleteOccSkillChoice.bind(this));
    html.on("change", "[data-action='add-occ-choice-skill']",  this._onAddOccChoiceSkill.bind(this));
    html.on("click",  "[data-action='delete-occ-choice-skill']", this._onDeleteOccChoiceSkill.bind(this));
    html.on("change", "[data-action='add-occ-choice-group']", this._onAddOccChoiceGroup.bind(this));
    html.on("click", "[data-action='delete-occ-choice-group']", this._onDeleteOccChoiceGroup.bind(this));
    html.on("change", "[data-action='exclude-occ-choice-group-skill']", this._onExcludeOccChoiceGroupSkill.bind(this));
    html.on("click", "[data-action='delete-occ-choice-group-exclusion']", this._onDeleteOccChoiceGroupExclusion.bind(this));
    html.on("click", "[data-action='add-cc-ability']",    this._onAddCcAbility.bind(this));
    html.on("click", "[data-action='delete-cc-ability']", this._onDeleteCcAbility.bind(this));
    html.on("click", "[data-action='add-cc-skill-bonus']",    this._onAddCcSkillBonus.bind(this));
    html.on("change", "[data-action='add-cc-skill-bonus-from-list']", this._onAddCcSkillBonusFromList.bind(this));
    html.on("click", "[data-action='delete-cc-skill-bonus']", this._onDeleteCcSkillBonus.bind(this));
    html.on("click", "[data-action='add-cc-wp-custom']",    this._onAddCcWpCustom.bind(this));
    html.on("click", "[data-action='delete-cc-wp-custom']", this._onDeleteCcWpCustom.bind(this));
    html.on("click", "[data-action='add-cc-wp-choice']",    this._onAddCcWpChoice.bind(this));
    html.on("click", "[data-action='delete-cc-wp-choice']", this._onDeleteCcWpChoice.bind(this));
    html.on("change", "[data-action='add-cc-wp-choice-option']", this._onAddCcWpChoiceOption.bind(this));
    html.on("click", "[data-action='delete-cc-wp-choice-option']", this._onDeleteCcWpChoiceOption.bind(this));
    html.on("click", "[data-action='add-vehicle-armor-extra']",    this._onAddVehicleArmorExtra.bind(this));
    html.on("click", "[data-action='delete-vehicle-armor-extra']", this._onDeleteVehicleArmorExtra.bind(this));
    html.on("click", "[data-action='add-vehicle-weapon']",         this._onAddVehicleWeapon.bind(this));
    html.on("click", "[data-action='delete-vehicle-weapon']",      this._onDeleteVehicleWeapon.bind(this));
  }

  _onDisclosureToggle(ev) {
    const key = ev.currentTarget.dataset.disclosure;
    if (!key) return;
    this._disclosureState[key] = ev.currentTarget.open;
    this._saveDisclosureState();
  }

  _captureDisclosureState() {
    const root = this.element?.[0];
    if (!root) return;
    for (const el of root.querySelectorAll("details[data-disclosure]")) {
      const key = el.dataset.disclosure;
      if (key) this._disclosureState[key] = el.open;
    }
    this._saveDisclosureState();
  }

  _disclosureStorageKey() {
    const documentKey = this.document?.uuid ?? this.item?.uuid ?? this.document?.id ?? "unknown";
    return `errantearth.itemSheet.${documentKey}.disclosures`;
  }

  _loadDisclosureState() {
    try {
      return JSON.parse(window.localStorage?.getItem(this._disclosureStorageKey()) ?? "{}") ?? {};
    } catch (_err) {
      return {};
    }
  }

  _saveDisclosureState() {
    try {
      window.localStorage?.setItem(this._disclosureStorageKey(), JSON.stringify(this._disclosureState ?? {}));
    } catch (_err) {
      // Storage can be unavailable in restricted browser contexts; the in-memory state still works.
    }
  }

  async _onAddVehicleArmorExtra(ev) {
    ev.preventDefault();
    const extras = ErrantEarthItemSheet._editableArray(this.item.system.armor?.extras);
    extras.push({ name: "", current: 0, max: 0 });
    return this.item.update({ "system.armor.extras": extras });
  }

  async _onDeleteVehicleArmorExtra(ev) {
    ev.preventDefault();
    const extras = ErrantEarthItemSheet._editableArray(this.item.system.armor?.extras);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, extras.length);
    if (idx < 0) return;
    extras.splice(idx, 1);
    return this.item.update({ "system.armor.extras": extras });
  }

  async _onAddVehicleWeapon(ev) {
    ev.preventDefault();
    const weapons = ErrantEarthItemSheet._editableArray(this.item.system.weapons);
    weapons.push({ name: "", damageType: "", damage: "", range: "", rate: "", payload: "" });
    return this.item.update({ "system.weapons": weapons });
  }

  async _onDeleteVehicleWeapon(ev) {
    ev.preventDefault();
    const weapons = ErrantEarthItemSheet._editableArray(this.item.system.weapons);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, weapons.length);
    if (idx < 0) return;
    weapons.splice(idx, 1);
    return this.item.update({ "system.weapons": weapons });
  }

  async _onAddOccSkill(ev) {
    ev.preventDefault();
    const skills = ErrantEarthItemSheet._editableArray(this.item.system.skills);
    skills.push({ key: "", name: "", base: 0, perLvl: 0, category: "occ", custom: true });
    return this.item.update({ "system.skills": skills });
  }

  async _onAddOccSkillFromList(ev) {
    const sel = ev.currentTarget;
    const key = sel.value;
    if (!key) return;
    const master = (CONFIG.EE?.SKILL_LIST ?? []).find(s => s.key === key);
    if (!master) { sel.value = ""; return; }
    const skills = ErrantEarthItemSheet._editableArray(this.item.system.skills);
    if (skills.some(skill => skill?.key === key && !master.repeatable)) { sel.value = ""; return; }
    skills.push({
      key: master.key,
      name: master.name,
      base: master.base,
      perLvl: master.perLvl,
      category: sel.dataset.category || "occ",
      custom: false,
      statBonuses: foundry.utils.deepClone(master.statBonuses ?? {})
    });
    sel.value = "";
    return this.item.update({ "system.skills": skills });
  }

  async _onDeleteOccSkill(ev) {
    ev.preventDefault();
    const skills = ErrantEarthItemSheet._editableArray(this.item.system.skills);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, skills.length);
    if (idx < 0) return;
    skills.splice(idx, 1);
    return this.item.update({ "system.skills": skills });
  }

  async _onAddOccSkillChoice(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    choices.push({ label: "O.C.C. Related Skills", count: 1, level: 1, category: "occRelated", bonus: 0, allowedKeys: [], allowedGroups: [] });
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onDeleteOccSkillChoice(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, choices.length);
    if (idx < 0) return;
    choices.splice(idx, 1);
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onAddOccChoiceSkill(ev) {
    const sel = ev.currentTarget;
    const key = sel.value;
    if (!key) return;
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    const idx = ErrantEarthItemSheet._validIndex(sel.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) { sel.value = ""; return; }
    const allowedKeys = ErrantEarthItemSheet._toArray(choice.allowedKeys);
    if (!allowedKeys.includes(key)) allowedKeys.push(key);
    choice.allowedKeys = allowedKeys;
    sel.value = "";
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onDeleteOccChoiceSkill(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) return;
    const allowedKeys = ErrantEarthItemSheet._toArray(choice.allowedKeys);
    const skillIndex = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.skillIndex, allowedKeys.length);
    if (skillIndex < 0) return;
    allowedKeys.splice(skillIndex, 1);
    choice.allowedKeys = allowedKeys;
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onAddOccChoiceGroup(ev) {
    const sel = ev.currentTarget;
    const group = sel.value;
    if (!group) return;
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    const idx = ErrantEarthItemSheet._validIndex(sel.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) { sel.value = ""; return; }
    const allowedGroups = ErrantEarthItemSheet._normalizeSkillChoiceGroups(choice.allowedGroups);
    if (!allowedGroups.some(rule => rule.group === group)) allowedGroups.push({ group, excludedKeys: [] });
    choice.allowedGroups = allowedGroups;
    sel.value = "";
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onDeleteOccChoiceGroup(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) return;
    const allowedGroups = ErrantEarthItemSheet._normalizeSkillChoiceGroups(choice.allowedGroups);
    const groupIndex = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.groupIndex, allowedGroups.length);
    if (groupIndex < 0) return;
    allowedGroups.splice(groupIndex, 1);
    choice.allowedGroups = allowedGroups;
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onExcludeOccChoiceGroupSkill(ev) {
    const sel = ev.currentTarget;
    const key = sel.value;
    if (!key) return;
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    const idx = ErrantEarthItemSheet._validIndex(sel.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) { sel.value = ""; return; }
    const allowedGroups = ErrantEarthItemSheet._normalizeSkillChoiceGroups(choice.allowedGroups);
    const groupIndex = ErrantEarthItemSheet._validIndex(sel.dataset.groupIndex, allowedGroups.length);
    const rule = allowedGroups[groupIndex];
    if (!rule) { sel.value = ""; return; }
    if (!rule.excludedKeys.includes(key)) rule.excludedKeys.push(key);
    choice.allowedGroups = allowedGroups;
    sel.value = "";
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onDeleteOccChoiceGroupExclusion(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.skillChoices);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) return;
    const allowedGroups = ErrantEarthItemSheet._normalizeSkillChoiceGroups(choice.allowedGroups);
    const groupIndex = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.groupIndex, allowedGroups.length);
    const rule = allowedGroups[groupIndex];
    if (!rule) return;
    const exclusionIndex = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.exclusionIndex, rule.excludedKeys.length);
    if (exclusionIndex < 0) return;
    rule.excludedKeys.splice(exclusionIndex, 1);
    choice.allowedGroups = allowedGroups;
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onAddCcAbility(ev) {
    ev.preventDefault();
    const abilities = ErrantEarthItemSheet._editableArray(this.item.system.abilities);
    abilities.push({ name: "", description: "" });
    return this.item.update({ "system.abilities": abilities });
  }

  async _onDeleteCcAbility(ev) {
    ev.preventDefault();
    const abilities = ErrantEarthItemSheet._editableArray(this.item.system.abilities);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, abilities.length);
    if (idx < 0) return;
    abilities.splice(idx, 1);
    return this.item.update({ "system.abilities": abilities });
  }

  async _onAddCcSkillBonus(ev) {
    ev.preventDefault();
    const bonuses = ErrantEarthItemSheet._editableArray(this.item.system.skillBonuses);
    bonuses.push({ key: "", name: "", bonus: 0, note: "", custom: true });
    return this.item.update({ "system.skillBonuses": bonuses });
  }

  async _onAddCcSkillBonusFromList(ev) {
    const sel = ev.currentTarget;
    const key = sel.value;
    if (!key) return;
    const master = (CONFIG.EE?.SKILL_LIST ?? []).find(s => s.key === key);
    if (!master) { sel.value = ""; return; }
    const bonuses = ErrantEarthItemSheet._editableArray(this.item.system.skillBonuses);
    if (bonuses.some(row => row?.key === key)) { sel.value = ""; return; }
    bonuses.push({ key: master.key, name: master.name, bonus: 0, note: "", custom: false });
    sel.value = "";
    return this.item.update({ "system.skillBonuses": bonuses });
  }

  async _onDeleteCcSkillBonus(ev) {
    ev.preventDefault();
    const bonuses = ErrantEarthItemSheet._editableArray(this.item.system.skillBonuses);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, bonuses.length);
    if (idx < 0) return;
    bonuses.splice(idx, 1);
    return this.item.update({ "system.skillBonuses": bonuses });
  }

  async _onAddCcWpCustom(ev) {
    ev.preventDefault();
    const custom = ErrantEarthItemSheet._editableArray(this.item.system.weaponProficiencies?.custom);
    custom.push({ name: "" });
    return this.item.update({ "system.weaponProficiencies.custom": custom });
  }

  async _onDeleteCcWpCustom(ev) {
    ev.preventDefault();
    const custom = ErrantEarthItemSheet._editableArray(this.item.system.weaponProficiencies?.custom);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, custom.length);
    if (idx < 0) return;
    custom.splice(idx, 1);
    return this.item.update({ "system.weaponProficiencies.custom": custom });
  }

  async _onAddCcWpChoice(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.weaponProficiencies?.choices);
    choices.push({ label: "W.P. of choice", count: 1, pool: "any", allowedKeys: [] });
    return this.item.update({ "system.weaponProficiencies.choices": choices });
  }

  async _onDeleteCcWpChoice(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.weaponProficiencies?.choices);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, choices.length);
    if (idx < 0) return;
    choices.splice(idx, 1);
    return this.item.update({ "system.weaponProficiencies.choices": choices });
  }

  async _onAddCcWpChoiceOption(ev) {
    const sel = ev.currentTarget;
    const key = sel.value;
    if (!key) return;
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.weaponProficiencies?.choices);
    const idx = ErrantEarthItemSheet._validIndex(sel.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) { sel.value = ""; return; }
    const allowedKeys = ErrantEarthItemSheet._toArray(choice.allowedKeys);
    if (!allowedKeys.includes(key)) allowedKeys.push(key);
    choice.allowedKeys = allowedKeys;
    sel.value = "";
    return this.item.update({ "system.weaponProficiencies.choices": choices });
  }

  async _onDeleteCcWpChoiceOption(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._editableArray(this.item.system.weaponProficiencies?.choices);
    const idx = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.index, choices.length);
    const choice = choices[idx];
    if (!choice) return;
    const allowedKeys = ErrantEarthItemSheet._toArray(choice.allowedKeys);
    const optionIndex = ErrantEarthItemSheet._validIndex(ev.currentTarget.dataset.optionIndex, allowedKeys.length);
    if (optionIndex < 0) return;
    allowedKeys.splice(optionIndex, 1);
    choice.allowedKeys = allowedKeys;
    return this.item.update({ "system.weaponProficiencies.choices": choices });
  }

  static _normalizeCcUpdate(expanded) {
    const sys = expanded?.system;
    if (!sys) return expanded;
    for (const key of ["quickRoll", "isMDC", "isRCC", "rccAsRace", "grantsMagic", "grantsPsionics"]) {
      if (key in sys) sys[key] = ErrantEarthItemSheet._coerceBoolean(sys[key]);
    }
    for (const entry of Object.values(sys.attributeBonuses ?? {})) {
      if (entry && typeof entry === "object" && "rolled" in entry) {
        entry.rolled = ErrantEarthItemSheet._coerceBoolean(entry.rolled);
      }
    }
    if ("categoryCustom" in sys) {
      sys.categoryCustom = ErrantEarthItemSheet._coerceBoolean(sys.categoryCustom);
      if (sys.categoryCustom && ErrantEarthItemSheet._isKnownChoice(CONFIG.EE?.SPELL_CATEGORIES, sys.category)) {
        sys.category = CONFIG.EE.SPELL_CATEGORIES[sys.category];
      }
      if (!sys.categoryCustom && !ErrantEarthItemSheet._isKnownChoice(CONFIG.EE?.SPELL_CATEGORIES, sys.category)) sys.category = "";
    }
    if ("typeCustom" in sys) {
      sys.typeCustom = ErrantEarthItemSheet._coerceBoolean(sys.typeCustom);
      if (sys.typeCustom && ErrantEarthItemSheet._isKnownChoice(CONFIG.EE?.PSIONIC_TYPES, sys.type)) {
        sys.type = CONFIG.EE.PSIONIC_TYPES[sys.type];
      }
      if (!sys.typeCustom && !ErrantEarthItemSheet._isKnownChoice(CONFIG.EE?.PSIONIC_TYPES, sys.type)) sys.type = "";
    }
    const selected = sys.weaponProficiencies?.selected;
    if (selected) {
      const known = [
        ...(CONFIG.EE?.WP_LIST?.ancient ?? []),
        ...(CONFIG.EE?.WP_LIST?.modern ?? [])
      ];
      const normalized = { ...selected };
      for (const { key } of known) normalized[key] = ErrantEarthItemSheet._coerceBoolean(selected[key]);
      sys.weaponProficiencies.selected = normalized;
    }
    if (sys.xpTrack && typeof sys.xpTrack === "object") {
      sys.xpTrack.preset = String(sys.xpTrack.preset ?? "");
      if ("thresholds" in sys.xpTrack) {
        sys.xpTrack.thresholds = ErrantEarthItemSheet._normalizeXpThresholds(sys.xpTrack.thresholds);
      }
      if ("level15Max" in sys.xpTrack) {
        sys.xpTrack.level15Max = Math.max(0, Math.trunc(Number(sys.xpTrack.level15Max ?? 0) || 0));
      }
    }
    return expanded;
  }

  async _updateObject(event, formData) {
    this._captureDisclosureState();
    const expanded = ErrantEarthItemSheet._coerceArrays(foundry.utils.expandObject(formData));
    ErrantEarthItemSheet._normalizeCcUpdate(expanded);
    if (this.item.type === "weapon" && expanded.system && "damageScale" in expanded.system) {
      const scale = expanded.system.damageScale;
      expanded.system.damageScale = ["S", "M", "G", "U"].includes(scale) ? scale : LegacyRules.weaponDamageScale(this.item.system);
      expanded.system.isMDC = expanded.system.damageScale !== "S";
    }
    const result = await this.document.update(expanded);
    const actor = this.item.actor;
    if (this.item.type === "occ" && actor && ("isRCC" in (expanded.system ?? {}) || "rccAsRace" in (expanded.system ?? {}))) {
      if (LegacyRules._isRccAsRace(this.item) && actor.system.equippedOcc === this.item.id) {
        await actor.update({ "system.equippedOcc": "", "system.occ": "", "system.equippedRace": this.item.id, "system.race": this.item.name });
      } else if (!LegacyRules._isRccAsRace(this.item) && actor.system.equippedRace === this.item.id) {
        await actor.update({ "system.equippedRace": "", "system.race": "" });
      }
    }
    return result;
  }
}
