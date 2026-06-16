export class ErrantEarthItemSheet extends ItemSheet {
  constructor(...args) {
    super(...args);
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
        addRaw("ISP", system.ispCost ?? 0);
        add("Range", system.range);
        add("Duration", system.duration);
        add("Damage", system.damage);
        break;
      case "spell":
        addRaw("Level", system.level ?? 1);
        addRaw("PPE", system.ppeCost ?? 0);
        add("Range", system.range);
        add("Duration", system.duration);
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
        add("Type", system.isRCC ? "R.C.C." : "O.C.C.");
        add("Skills", ErrantEarthItemSheet._toArray(system.skills).length);
        add("Money", system.money);
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
    const combatKeys = ["attacks", "initiative", "damage", "strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll"];
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

  static _decorateOccSkillChoices(choices = []) {
    const master = CONFIG.EE?.SKILL_LIST ?? [];
    const byKey = new Map(master.map(s => [s.key, s]));
    return ErrantEarthItemSheet._toArray(choices).map((choice, index) => {
      const allowedKeys = ErrantEarthItemSheet._toArray(choice?.allowedKeys).filter(Boolean);
      const usedKeys = new Set(allowedKeys);
      return {
        label: choice?.label ?? "",
        count: Number(choice?.count ?? 1) || 1,
        category: choice?.category || "occRelated",
        bonus: Number(choice?.bonus ?? 0) || 0,
        allowedKeys,
        _index: index,
        selectedSkillRows: allowedKeys.map(key => byKey.get(key)).filter(Boolean),
        picker: ErrantEarthItemSheet._groupSkillPicker(master.filter(s => !usedKeys.has(s.key)))
      };
    });
  }

  static _decorateWpChoices(choices = []) {
    return ErrantEarthItemSheet._toArray(choices).map((choice, index) => ({
      label: choice?.label ?? "",
      count: Number(choice?.count ?? 1) || 1,
      pool: choice?.pool || "any",
      _index: index
    }));
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
    if (this.item.type === "occ") {
      const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
      ctx.system.skills = skills;
      ctx.system.skillChoices = ErrantEarthItemSheet._decorateOccSkillChoices(this.item.system.skillChoices);

      const usedKeys = new Set(skills.map(r => r.key).filter(Boolean));
      const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => !usedKeys.has(s.key));
      ctx.skillPicker = ErrantEarthItemSheet._groupSkillPicker(masterList);
    }
    if (this.item.type === "occ" || this.item.type === "race") {
      ctx.system = ErrantEarthItemSheet._normalizeCcData(ctx.system);
      const skillBonuses = ctx.system.skillBonuses;
      const usedBonusKeys = new Set(skillBonuses.map(r => r.key).filter(Boolean));
      const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => !usedBonusKeys.has(s.key));
      ctx.ccSkillBonusPicker = ErrantEarthItemSheet._groupSkillPicker(masterList);
      const wp = ErrantEarthItemSheet._legacyWpOptions(ctx.system.weaponProficiencies.selected);
      ctx.wpAncient = wp.ancient;
      ctx.wpModern = wp.modern;
      ctx.system.weaponProficiencies.choices = ErrantEarthItemSheet._decorateWpChoices(ctx.system.weaponProficiencies.choices);
    }
    if (this.item.type === "vehicle") {
      ctx.system.armor = ctx.system.armor ?? {};
      ctx.system.armor.extras = ErrantEarthItemSheet._toArray(this.item.system.armor?.extras);
      ctx.system.weapons = ErrantEarthItemSheet._toArray(this.item.system.weapons);
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
    html.on("click", "[data-action='add-cc-ability']",    this._onAddCcAbility.bind(this));
    html.on("click", "[data-action='delete-cc-ability']", this._onDeleteCcAbility.bind(this));
    html.on("click", "[data-action='add-cc-skill-bonus']",    this._onAddCcSkillBonus.bind(this));
    html.on("change", "[data-action='add-cc-skill-bonus-from-list']", this._onAddCcSkillBonusFromList.bind(this));
    html.on("click", "[data-action='delete-cc-skill-bonus']", this._onDeleteCcSkillBonus.bind(this));
    html.on("click", "[data-action='add-cc-wp-custom']",    this._onAddCcWpCustom.bind(this));
    html.on("click", "[data-action='delete-cc-wp-custom']", this._onDeleteCcWpCustom.bind(this));
    html.on("click", "[data-action='add-cc-wp-choice']",    this._onAddCcWpChoice.bind(this));
    html.on("click", "[data-action='delete-cc-wp-choice']", this._onDeleteCcWpChoice.bind(this));
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
    const extras = ErrantEarthItemSheet._toArray(this.item.system.armor?.extras);
    extras.push({ name: "", current: 0, max: 0 });
    return this.item.update({ "system.armor.extras": extras });
  }

  async _onDeleteVehicleArmorExtra(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const extras = ErrantEarthItemSheet._toArray(this.item.system.armor?.extras);
    extras.splice(idx, 1);
    return this.item.update({ "system.armor.extras": extras });
  }

  async _onAddVehicleWeapon(ev) {
    ev.preventDefault();
    const weapons = ErrantEarthItemSheet._toArray(this.item.system.weapons);
    weapons.push({ type: "", damageType: "", damage: "", range: "", rate: "", payload: "" });
    return this.item.update({ "system.weapons": weapons });
  }

  async _onDeleteVehicleWeapon(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const weapons = ErrantEarthItemSheet._toArray(this.item.system.weapons);
    weapons.splice(idx, 1);
    return this.item.update({ "system.weapons": weapons });
  }

  async _onAddOccSkill(ev) {
    ev.preventDefault();
    const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
    skills.push({ key: "", name: "", base: 0, perLvl: 0, category: "occ", custom: true });
    return this.item.update({ "system.skills": skills });
  }

  async _onAddOccSkillFromList(ev) {
    const sel = ev.currentTarget;
    const key = sel.value;
    if (!key) return;
    const master = (CONFIG.EE?.SKILL_LIST ?? []).find(s => s.key === key);
    if (!master) { sel.value = ""; return; }
    const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
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
    const idx = Number(ev.currentTarget.dataset.index);
    const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
    skills.splice(idx, 1);
    return this.item.update({ "system.skills": skills });
  }

  async _onAddOccSkillChoice(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._toArray(this.item.system.skillChoices);
    choices.push({ label: "OCC Related Skills", count: 1, category: "occRelated", bonus: 0, allowedKeys: [] });
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onDeleteOccSkillChoice(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const choices = ErrantEarthItemSheet._toArray(this.item.system.skillChoices);
    choices.splice(idx, 1);
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onAddOccChoiceSkill(ev) {
    const sel = ev.currentTarget;
    const idx = Number(sel.dataset.index);
    const key = sel.value;
    if (!key) return;
    const choices = ErrantEarthItemSheet._toArray(this.item.system.skillChoices);
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
    const idx = Number(ev.currentTarget.dataset.index);
    const skillIndex = Number(ev.currentTarget.dataset.skillIndex);
    const choices = ErrantEarthItemSheet._toArray(this.item.system.skillChoices);
    const choice = choices[idx];
    if (!choice) return;
    const allowedKeys = ErrantEarthItemSheet._toArray(choice.allowedKeys);
    allowedKeys.splice(skillIndex, 1);
    choice.allowedKeys = allowedKeys;
    return this.item.update({ "system.skillChoices": choices });
  }

  async _onAddCcAbility(ev) {
    ev.preventDefault();
    const abilities = ErrantEarthItemSheet._toArray(this.item.system.abilities);
    abilities.push({ name: "", description: "" });
    return this.item.update({ "system.abilities": abilities });
  }

  async _onDeleteCcAbility(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const abilities = ErrantEarthItemSheet._toArray(this.item.system.abilities);
    abilities.splice(idx, 1);
    return this.item.update({ "system.abilities": abilities });
  }

  async _onAddCcSkillBonus(ev) {
    ev.preventDefault();
    const bonuses = ErrantEarthItemSheet._toArray(this.item.system.skillBonuses);
    bonuses.push({ key: "", name: "", bonus: 0, note: "", custom: true });
    return this.item.update({ "system.skillBonuses": bonuses });
  }

  async _onAddCcSkillBonusFromList(ev) {
    const sel = ev.currentTarget;
    const key = sel.value;
    if (!key) return;
    const master = (CONFIG.EE?.SKILL_LIST ?? []).find(s => s.key === key);
    if (!master) { sel.value = ""; return; }
    const bonuses = ErrantEarthItemSheet._toArray(this.item.system.skillBonuses);
    bonuses.push({ key: master.key, name: master.name, bonus: 0, note: "", custom: false });
    sel.value = "";
    return this.item.update({ "system.skillBonuses": bonuses });
  }

  async _onDeleteCcSkillBonus(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const bonuses = ErrantEarthItemSheet._toArray(this.item.system.skillBonuses);
    bonuses.splice(idx, 1);
    return this.item.update({ "system.skillBonuses": bonuses });
  }

  async _onAddCcWpCustom(ev) {
    ev.preventDefault();
    const custom = ErrantEarthItemSheet._toArray(this.item.system.weaponProficiencies?.custom);
    custom.push({ name: "" });
    return this.item.update({ "system.weaponProficiencies.custom": custom });
  }

  async _onDeleteCcWpCustom(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const custom = ErrantEarthItemSheet._toArray(this.item.system.weaponProficiencies?.custom);
    custom.splice(idx, 1);
    return this.item.update({ "system.weaponProficiencies.custom": custom });
  }

  async _onAddCcWpChoice(ev) {
    ev.preventDefault();
    const choices = ErrantEarthItemSheet._toArray(this.item.system.weaponProficiencies?.choices);
    choices.push({ label: "W.P. of choice", count: 1, pool: "any" });
    return this.item.update({ "system.weaponProficiencies.choices": choices });
  }

  async _onDeleteCcWpChoice(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const choices = ErrantEarthItemSheet._toArray(this.item.system.weaponProficiencies?.choices);
    choices.splice(idx, 1);
    return this.item.update({ "system.weaponProficiencies.choices": choices });
  }

  static _normalizeCcUpdate(expanded) {
    const sys = expanded?.system;
    if (!sys) return expanded;
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
    return expanded;
  }

  async _updateObject(event, formData) {
    this._captureDisclosureState();
    const expanded = ErrantEarthItemSheet._coerceArrays(foundry.utils.expandObject(formData));
    ErrantEarthItemSheet._normalizeCcUpdate(expanded);
    return this.document.update(expanded);
  }
}
