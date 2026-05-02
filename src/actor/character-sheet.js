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
      scrollY: [".tab"]
    });
  }

  /** Standard RIFTS-style attribute bonus tables. Returns the % or modifier for a given attribute value. */
  static iqSkillBonus(iq) {
    if (iq < 16) return 0;
    return (iq - 15) * 3;
  }
  static trustIntimidate(ma) {
    const table = { 16: 50, 17: 55, 18: 60, 19: 65, 20: 70, 21: 75, 22: 80, 23: 84, 24: 88, 25: 92, 26: 94, 27: 96, 28: 97, 29: 98, 30: 99 };
    if (ma < 16) return 0;
    if (ma >= 30) return 99;
    return table[ma] ?? 0;
  }
  static charmImpress(pb) {
    const table = { 16: 25, 17: 30, 18: 35, 19: 40, 20: 45, 21: 50, 22: 55, 23: 60, 24: 65, 25: 70, 26: 75, 27: 80, 28: 84, 29: 88, 30: 92 };
    if (pb < 16) return 0;
    if (pb >= 30) return 92;
    return table[pb] ?? 0;
  }

  async getData(options) {
    const ctx = await super.getData(options);
    const sys = ctx.actor.system;

    const iq = Number(sys.attributes?.iq?.value ?? 0);
    const ma = Number(sys.attributes?.ma?.value ?? 0);
    const pb = Number(sys.attributes?.pb?.value ?? 0);
    const level = Number(sys.level ?? 1);

    ctx.derived = {
      iqBonus: ErrantEarthCharacterSheet.iqSkillBonus(iq),
      trustIntimidate: ErrantEarthCharacterSheet.trustIntimidate(ma),
      charmImpress: ErrantEarthCharacterSheet.charmImpress(pb)
    };

    // Auto-compute skill totals: Base + PerLvl * (Level - 1) + IQ bonus.
    const computeRows = (rows) => (rows ?? []).map((r, i) => {
      const base   = Number(r.base   ?? 0);
      const perLvl = Number(r.perLvl ?? 0);
      const total  = base + perLvl * Math.max(0, level - 1) + ctx.derived.iqBonus;
      return { ...r, _index: i, total };
    });
    ctx.skills = {
      occ:        computeRows(sys.skills?.occ),
      occRelated: computeRows(sys.skills?.occRelated),
      secondary:  computeRows(sys.skills?.secondary)
    };

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.on("click", "[data-action='add-row']",    this._onAddRow.bind(this));
    html.on("click", "[data-action='delete-row']", this._onDeleteRow.bind(this));
  }

  _getArrayPath(path) {
    return path.split(".").reduce((o, k) => (o ? o[k] : undefined), this.actor.system);
  }

  async _onAddRow(ev) {
    ev.preventDefault();
    const btn = ev.currentTarget;
    const path = btn.dataset.path;
    const kind = btn.dataset.kind;
    const arr  = foundry.utils.deepClone(this._getArrayPath(path) ?? []);
    arr.push(this._blankRow(kind));
    await this.actor.update({ [`system.${path}`]: arr });
  }

  async _onDeleteRow(ev) {
    ev.preventDefault();
    const btn  = ev.currentTarget;
    const path = btn.dataset.path;
    const idx  = Number(btn.dataset.index);
    const arr  = foundry.utils.deepClone(this._getArrayPath(path) ?? []);
    arr.splice(idx, 1);
    await this.actor.update({ [`system.${path}`]: arr });
  }

  _blankRow(kind) {
    switch (kind) {
      case "skill":         return { name: "", base: 0, perLvl: 0 };
      case "modernWeapon":  return { name: "", damage: "", ammo: "", strike: "", range: "", special: "" };
      case "ancientWeapon": return { name: "", damage: "", ammo: "", strike: "", parry: "", special: "" };
      case "saveExtra":     return { name: "", base: 0, bonus: 0 };
      case "h2hExtra":      return { name: "", value: 0 };
      case "armorExtra":    return { name: "", current: 0, max: 0 };
      case "power":         return { name: "", cost: "", range: "", saving: "", damage: "", duration: "", description: "" };
      case "paWeapon":      return { name: "", damage: "", ammo: "", strike: "", range: "", special: "" };
      default:              return { name: "" };
    }
  }

  /** Persist auto-computed bonus fields so they show numerically in inputs even when read-only. */
  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    return super._updateObject(event, foundry.utils.flattenObject(expanded));
  }
}
