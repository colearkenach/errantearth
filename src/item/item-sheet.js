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

  async getData(options) {
    const ctx = await super.getData(options);
    ctx.config = CONFIG.EE ?? {};
    ctx.system = foundry.utils.deepClone(this.item.system);
    if (this.item.type === "occ") {
      ctx.system.skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
    }
    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.on("click", "[data-action='add-occ-skill']", this._onAddOccSkill.bind(this));
    html.on("click", "[data-action='delete-occ-skill']", this._onDeleteOccSkill.bind(this));
  }

  async _onAddOccSkill(ev) {
    ev.preventDefault();
    const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
    skills.push({ name: "", base: 0, perLvl: 0, category: "occ" });
    return this.item.update({ "system.skills": skills });
  }

  async _onDeleteOccSkill(ev) {
    ev.preventDefault();
    const idx = Number(ev.currentTarget.dataset.index);
    const skills = ErrantEarthItemSheet._toArray(this.item.system.skills);
    skills.splice(idx, 1);
    return this.item.update({ "system.skills": skills });
  }

  async _updateObject(event, formData) {
    const expanded = ErrantEarthItemSheet._coerceArrays(foundry.utils.expandObject(formData));
    return this.document.update(expanded);
  }
}
