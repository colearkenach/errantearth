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

    const iq = Number(sys.attributes?.iq?.value ?? 0);
    const ma = Number(sys.attributes?.ma?.value ?? 0);
    const pb = Number(sys.attributes?.pb?.value ?? 0);
    const level = Number(sys.level ?? 1);

    ctx.derived = {
      iqBonus: ErrantEarthCharacterSheet.iqSkillBonus(iq),
      trustIntimidate: ErrantEarthCharacterSheet.trustIntimidate(ma),
      charmImpress: ErrantEarthCharacterSheet.charmImpress(pb)
    };

    const toArr = ErrantEarthCharacterSheet._toArray;

    // Auto-compute skill totals: Base + PerLvl * (Level - 1) + IQ bonus.
    const computeRows = (rows) => toArr(rows).map((r, i) => {
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

    // Normalize every other array-shaped collection used by the template so
    // {{#each}} keeps working even after Foundry's merge corrupts them.
    ctx.system = foundry.utils.deepClone(sys);
    ctx.system.handToHand.extras = toArr(sys.handToHand?.extras);
    ctx.system.savingThrows.extras = toArr(sys.savingThrows?.extras);
    ctx.system.weapons.modern = toArr(sys.weapons?.modern);
    ctx.system.weapons.ancient = toArr(sys.weapons?.ancient);
    ctx.system.weaponProficiencies = toArr(sys.weaponProficiencies);
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

    return ctx;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.on("click", "[data-action='add-row']",    this._onAddRow.bind(this));
    html.on("click", "[data-action='delete-row']", this._onDeleteRow.bind(this));
    html.on("click", "[data-action='roll']",       this._onRoll.bind(this));
    html.on("click", "[data-action='edit-item']",  this._onEditItem.bind(this));
    html.on("click", "[data-action='delete-item']", this._onDeleteItem.bind(this));
    html.on("click", "[data-action='create-item']", this._onCreateItem.bind(this));
    html.on("click", "[data-action='equip-item']",   this._onEquipItem.bind(this));
    html.on("click", "[data-action='unequip-item']", this._onUnequipItem.bind(this));

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
    if (item.type === "race") {
      return this.actor.update({ "system.equippedRace": id, "system.race": item.name });
    }
    if (item.type === "occ") {
      return this.actor.update({ "system.equippedOcc": id, "system.occ": item.name });
    }
  }

  async _onUnequipItem(ev) {
    ev.preventDefault();
    const slot = ev.currentTarget.dataset.slot;
    if (slot === "race") return this.actor.update({ "system.equippedRace": "" });
    if (slot === "occ")  return this.actor.update({ "system.equippedOcc": "" });
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
          const target = Number(el.dataset.target ?? 0);
          roll = await new Roll("1d100").evaluate();
          const success = roll.total <= target;
          card.subtitle = `Target ${target}% (roll under)`;
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
      case "skill":         return { name: "", base: 0, perLvl: 0 };
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
      case "wp":            return { name: "", aimed: "", burst: "", parry: "", range: "", damageRate: "" };
      case "psionic":       return { name: "", isp: "", notes: "" };
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
