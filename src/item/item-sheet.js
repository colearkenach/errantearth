export class ErrantEarthItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["errantearth", "sheet", "item"],
      template: "systems/errantearth/templates/item/item-sheet.html",
      width: 600,
      height: 600,
      submitOnChange: true,
      closeOnSubmit: false,
      submitOnClose: true,
      scrollY: [".ee-item-body"],
      resizable: true
    });
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

  async getData(options) {
    const ctx = await super.getData(options);
    ctx.config = CONFIG.EE ?? {};
    ctx.system = foundry.utils.deepClone(this.item.system);
    if (this.item.type === "occ") {
      const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
      ctx.system.skills = skills;

      const usedKeys = new Set(skills.map(r => r.key).filter(Boolean));
      const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => !usedKeys.has(s.key));
      const grouped = {};
      for (const s of masterList) (grouped[s.group] ??= []).push(s);
      ctx.skillPicker = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, items]) => ({ group, items }));
    }
    if (this.item.type === "occ" || this.item.type === "race") {
      ctx.system = ErrantEarthItemSheet._normalizeCcData(ctx.system);
      const skillBonuses = ctx.system.skillBonuses;
      const usedBonusKeys = new Set(skillBonuses.map(r => r.key).filter(Boolean));
      const masterList = (CONFIG.EE?.SKILL_LIST ?? []).filter(s => !usedBonusKeys.has(s.key));
      const grouped = {};
      for (const s of masterList) (grouped[s.group] ??= []).push(s);
      ctx.ccSkillBonusPicker = Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, items]) => ({ group, items }));
      const wp = ErrantEarthItemSheet._legacyWpOptions(ctx.system.weaponProficiencies.selected);
      ctx.wpAncient = wp.ancient;
      ctx.wpModern = wp.modern;
    }
    if (this.item.type === "vehicle") {
      ctx.system.armor = ctx.system.armor ?? {};
      ctx.system.armor.extras = ErrantEarthItemSheet._toArray(this.item.system.armor?.extras);
      ctx.system.weapons = ErrantEarthItemSheet._toArray(this.item.system.weapons);
    }
    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.on("click",  "[data-action='add-occ-skill']",         this._onAddOccSkill.bind(this));
    html.on("change", "[data-action='add-occ-skill-from-list']", this._onAddOccSkillFromList.bind(this));
    html.on("click",  "[data-action='delete-occ-skill']",      this._onDeleteOccSkill.bind(this));
    html.on("click", "[data-action='add-cc-ability']",    this._onAddCcAbility.bind(this));
    html.on("click", "[data-action='delete-cc-ability']", this._onDeleteCcAbility.bind(this));
    html.on("click", "[data-action='add-cc-skill-bonus']",    this._onAddCcSkillBonus.bind(this));
    html.on("change", "[data-action='add-cc-skill-bonus-from-list']", this._onAddCcSkillBonusFromList.bind(this));
    html.on("click", "[data-action='delete-cc-skill-bonus']", this._onDeleteCcSkillBonus.bind(this));
    html.on("click", "[data-action='add-cc-wp-custom']",    this._onAddCcWpCustom.bind(this));
    html.on("click", "[data-action='delete-cc-wp-custom']", this._onDeleteCcWpCustom.bind(this));
    html.on("click", "[data-action='add-vehicle-armor-extra']",    this._onAddVehicleArmorExtra.bind(this));
    html.on("click", "[data-action='delete-vehicle-armor-extra']", this._onDeleteVehicleArmorExtra.bind(this));
    html.on("click", "[data-action='add-vehicle-weapon']",         this._onAddVehicleWeapon.bind(this));
    html.on("click", "[data-action='delete-vehicle-weapon']",      this._onDeleteVehicleWeapon.bind(this));
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
    const expanded = ErrantEarthItemSheet._coerceArrays(foundry.utils.expandObject(formData));
    ErrantEarthItemSheet._normalizeCcUpdate(expanded);
    return this.document.update(expanded);
  }
}
