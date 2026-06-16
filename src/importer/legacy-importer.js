const ITEM_IMPORT_TYPES = {
  weapon: "Weapon",
  armor: "Armor",
  occ: "OCC",
  rcc: "RCC",
  race: "Race",
  spell: "Spell",
  psionicPower: "Psionic Power",
  vehicle: "Vehicle",
  powerArmor: "Power Armor"
};

const ATTRIBUTE_KEYS = ["iq", "me", "ma", "ps", "pp", "pe", "pb", "spd"];
const ATTRIBUTE_LABELS = { iq: "IQ", me: "ME", ma: "MA", ps: "PS", pp: "PP", pe: "PE", pb: "PB", spd: "SPD" };
const LOCATION_FIELDS = {
  mainbody: "mainBody",
  body: "mainBody",
  helmet: "head",
  head: "head",
  arms: ["leftArm", "rightArm"],
  leftarm: "leftArm",
  rightarm: "rightArm",
  legs: ["leftLeg", "rightLeg"],
  leftleg: "leftLeg",
  rightleg: "rightLeg"
};
const BOOK_HEADINGS = new Set([
  "name", "alignment", "alignments", "attributes", "hitpoints", "hp", "sdc", "mdc", "ppe", "isp",
  "weight", "height", "age", "horrorfactor", "experiencelevel", "level", "naturalarmorrating",
  "psionicpowers", "magicknowledge", "combat", "attackspermelee", "bonuses",
  "skillsofnote", "favoriteweapons", "specialweapon", "bodyarmor", "specialvehicle",
  "cybernetics", "cyberneticsbionics", "money", "alliancesallies", "allies",
  "requirements", "occskills", "occrelatedskills", "secondaryskills", "occbonuses",
  "standardequipment", "weapons", "armor", "powerarmor", "vehicle", "description",
  "notes", "type", "category", "damage", "megadamage", "damagetype", "range", "effectiverange", "duration",
  "savingthrow", "cost", "blackmarketcost", "ppecost", "ispcost", "payload", "ammo", "rate",
  "rateoffire", "ar", "armorrating", "prowlpenalty", "lifespan", "size",
  "averagelifespan", "naturalabilities", "psionics", "habitat", "enemies",
  "languages", "equipment", "abilities", "skillbonuses", "weaponproficiencies",
  "crew", "capacity", "speed", "maximumspeed", "maxspeed", "cruise", "engine", "running", "leaping",
  "maximumrange", "maximummrange", "maximunrange", "cargo", "powers",
  "vehicletype", "modeltype", "class", "statisticaldata", "weaponsystems",
  "physicalstrength", "powersystem", "primarypurpose", "primarypurnose", "missiletype",
  "mdcbylocation", "mdebylocation", "mdcbylocatio", "mdcbylocationmainbody"
]);
const NUMBER_WORDS = {
  one: 1, first: 1,
  two: 2, second: 2,
  three: 3, third: 3,
  four: 4, fourth: 4,
  five: 5, fifth: 5,
  six: 6, sixth: 6,
  seven: 7, seventh: 7,
  eight: 8, eighth: 8,
  nine: 9, ninth: 9,
  ten: 10, tenth: 10,
  eleven: 11, eleventh: 11,
  twelve: 12, twelfth: 12,
  thirteen: 13, thirteenth: 13,
  fourteen: 14, fourteenth: 14,
  fifteen: 15, fifteenth: 15
};

export class ErrantEarthLegacyImporter {
  static registerHooks() {
    Hooks.on("renderActorDirectory", (app, html) => {
      this._addDirectoryButton(html, {
        action: "ee-import-npc",
        label: "Import NPC",
        title: "Import an EE Legacy NPC",
        icon: "fa-user-plus",
        onClick: () => this.showActorImportDialog()
      });
    });

    Hooks.on("renderItemDirectory", (app, html) => {
      this._addDirectoryButton(html, {
        action: "ee-import-item",
        label: "Import EE Legacy",
        title: "Import an EE Legacy item",
        icon: "fa-file-import",
        onClick: () => this.showItemImportDialog()
      });
    });
  }

  static _addDirectoryButton(html, { action, label, title, icon, onClick }) {
    const root = this._htmlRoot(html);
    if (!root || root.querySelector(`[data-action="${action}"]`)) return;

    const target = root.querySelector(".directory-header .header-actions")
      ?? root.querySelector(".directory-header")
      ?? root.querySelector(".header-actions")
      ?? root.querySelector(".window-content")
      ?? root;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ee-directory-import";
    button.dataset.action = action;
    button.title = title;
    button.innerHTML = `<i class="fas ${icon}"></i><span>${label}</span>`;
    button.addEventListener("click", ev => {
      ev.preventDefault();
      onClick();
    });
    target.appendChild(button);
  }

  static _htmlRoot(html) {
    if (!html) return null;
    if (html instanceof HTMLElement) return html;
    if (html[0] instanceof HTMLElement) return html[0];
    if (html.querySelector) return html;
    return null;
  }

  static showActorImportDialog() {
    const openChecked = this._setting("legacyImporterOpenSheet", true) ? "checked" : "";
    const content = `
      <form class="ee-import-form">
        <p class="ee-import-hint">Paste EE Legacy NPC text or Foundry-style JSON. Plain text accepts lines like <code>Name:</code>, <code>IQ:</code>, <code>HP:</code>, <code>Skills:</code>, <code>Weapons:</code>, and <code>Notes:</code>.</p>
        <label>Name Override
          <input type="text" name="name" placeholder="Optional; otherwise uses imported name" />
        </label>
        <label>Import Text / JSON
          <textarea name="source" placeholder="Name: Coalition Grunt&#10;Level: 2&#10;IQ: 10&#10;ME: 9&#10;HP: 18/18&#10;SDC: 35/35&#10;Weapons: C-18 Laser Pistol - 2D6 M.D., Range 800 ft&#10;Notes: Patrol soldier."></textarea>
        </label>
        <label class="ee-import-check"><input type="checkbox" name="openSheet" ${openChecked} /> Open imported sheet</label>
      </form>`;

    new Dialog({
      title: "Import EE Legacy NPC",
      content,
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: "Import",
          callback: html => this._importActorsFromDialog(html)
        },
        cancel: { label: "Cancel" }
      },
      default: "import"
    }, { classes: ["errantearth", "dialog", "ee-import-dialog"], width: 560 }).render(true);
  }

  static showItemImportDialog(defaultType = "weapon") {
    const openChecked = this._setting("legacyImporterOpenSheet", true) ? "checked" : "";
    const options = Object.entries(ITEM_IMPORT_TYPES)
      .map(([value, label]) => `<option value="${value}"${value === defaultType ? " selected" : ""}>${label}</option>`)
      .join("");
    const content = `
      <form class="ee-import-form">
        <p class="ee-import-hint">Imports create EE Legacy item records only. Use JSON for exact fields, or paste key/value text for quick drafts.</p>
        <div class="ee-import-grid">
          <label>Importer
            <select name="type">${options}</select>
          </label>
          <label>Name Override
            <input type="text" name="name" placeholder="Optional" />
          </label>
        </div>
        <label>Import Text / JSON
          <textarea name="source" placeholder="Name: NG-L5 Laser Rifle&#10;Damage: 3D6 M.D.&#10;Range: 1600 ft&#10;Payload: 20 shots&#10;Rate: Single shot or burst&#10;Cost: 20,000 credits&#10;Notes: Common Northern Gun rifle."></textarea>
        </label>
        <label class="ee-import-check"><input type="checkbox" name="openSheet" ${openChecked} /> Open imported sheet</label>
      </form>`;

    new Dialog({
      title: "Import EE Legacy Item",
      content,
      buttons: {
        import: {
          icon: '<i class="fas fa-file-import"></i>',
          label: "Import",
          callback: html => this._importItemsFromDialog(html)
        },
        cancel: { label: "Cancel" }
      },
      default: "import"
    }, { classes: ["errantearth", "dialog", "ee-import-dialog"], width: 560 }).render(true);
  }

  static async _importActorsFromDialog(html) {
    const form = this._dialogForm(html);
    if (!form) return;
    const data = new FormData(form);
    const records = this._recordsFromInput(data.get("source"));
    if (!records.length) return ui.notifications?.warn("Nothing to import.");

    const overrideName = String(data.get("name") ?? "").trim();
    const openSheet = data.get("openSheet") === "on";
    const created = [];
    const folderId = this._defaultImportFolder("Actor");
    for (const [index, record] of records.entries()) {
      const actorData = this._actorDataFromRecord(record, overrideName || null, index);
      if (folderId) actorData.folder = folderId;
      const actor = await Actor.create(actorData);
      if (actor) created.push(actor);
    }
    if (openSheet && created.length === 1) created[0].sheet?.render(true);
    ui.notifications?.info(`Imported ${created.length} EE Legacy NPC${created.length === 1 ? "" : "s"}.`);
  }

  static async _importItemsFromDialog(html) {
    const form = this._dialogForm(html);
    if (!form) return;
    const data = new FormData(form);
    const records = this._recordsFromInput(data.get("source"));
    if (!records.length) return ui.notifications?.warn("Nothing to import.");

    const selectedType = String(data.get("type") || "weapon");
    const overrideName = String(data.get("name") ?? "").trim();
    const openSheet = data.get("openSheet") === "on";
    const created = [];
    const folderId = this._defaultImportFolder("Item");
    for (const [index, record] of records.entries()) {
      const itemData = this._itemDataFromRecord(record, selectedType, overrideName || null, index);
      if (folderId) itemData.folder = folderId;
      const item = await Item.create(itemData);
      if (item) created.push(item);
    }
    if (openSheet && created.length === 1) created[0].sheet?.render(true);
    ui.notifications?.info(`Imported ${created.length} EE Legacy item${created.length === 1 ? "" : "s"}.`);
  }

  static _setting(key, fallback) {
    try {
      return game.settings.get("errantearth", key) ?? fallback;
    } catch (err) {
      return fallback;
    }
  }

  static _defaultImportFolder(type) {
    const id = String(this._setting("legacyImporterFolder", "") ?? "").trim();
    if (!id) return null;
    const folder = game.folders?.get(id);
    if (!folder) return null;
    if (folder.type && folder.type !== type) return null;
    return id;
  }

  static _dialogForm(html) {
    const root = this._htmlRoot(html);
    return root?.querySelector("form") ?? null;
  }

  static _recordsFromInput(source) {
    const text = String(source ?? "").trim();
    if (!text) return [];

    const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    try {
      const parsed = JSON.parse(jsonText);
      return (Array.isArray(parsed) ? parsed : [parsed]).filter(v => v && typeof v === "object");
    } catch (err) {
      // Fall through to the forgiving key/value importer.
    }

    return text
      .split(/\n\s*---+\s*\n/g)
      .map(block => this._parseKeyValueBlock(block))
      .filter(record => Object.keys(record).length);
  }

  static _parseKeyValueBlock(block) {
    const record = {};
    let currentKey = null;
    for (const rawLine of String(block ?? "").split(/\r?\n/)) {
      const line = this._tidyOcrText(rawLine.trim());
      if (!line) continue;
      const match = line.match(/^([^:]{1,60}):\s*(.*)$/);
      if (match && this._isBookHeading(match[1])) {
        currentKey = this._canonicalHeading(match[1]);
        record[currentKey] = this._appendBlock(record[currentKey], match[2].trim());
      } else if (match && !record.Name && !currentKey) {
        record.Name = this._cleanWhitespace(match[1]);
        currentKey = "Description";
        record.Description = this._appendBlock(record.Description, match[2].trim());
      } else if (!record.Name && !currentKey) {
        record.Name = line;
      } else if (currentKey) {
        record[currentKey] = this._appendBlock(record[currentKey], line);
      } else {
        record.Description = this._appendBlock(record.Description, line);
      }
    }
    return record;
  }

  static _actorDataFromRecord(record, overrideName, index = 0) {
    const systemSource = this._systemSource(record);
    const hasSystem = !!record.system || !!record.data?.data;
    const system = hasSystem ? this._clone(systemSource) : {};
    const name = this._cleanName(overrideName || this._field(record, "name", "Name") || `Imported NPC ${index + 1}`);

    system.mode = "rifts";
    this._setIf(system, "trueName", this._field(systemSource, "trueName", "True Name"));
    this._setIf(system, "race", this._field(systemSource, "race", "Race"));
    this._setIf(system, "occ", this._field(systemSource, "occ", "OCC", "RCC", "Class"));
    this._setIf(system, "gender", this._field(systemSource, "gender", "Gender"));
    this._setIf(system, "level", this._number(this._field(systemSource, "level", "Level"), null));
    if (system.level == null) this._setIf(system, "level", this._number(this._field(systemSource, "Experience Level"), null));
    this._setIf(system, "xp", this._number(this._field(systemSource, "xp", "XP", "Experience"), null));

    const alignment = this._choice(this._field(systemSource, "alignment", "Alignment"), CONFIG.EE?.ALIGNMENTS);
    if (alignment) system.alignment = alignment;
    const psionicLevel = this._choice(this._field(systemSource, "psionicLevel", "Psionic Level", "Psionics"), CONFIG.EE?.PSIONIC_LEVELS);
    if (psionicLevel) system.psionicLevel = psionicLevel;

    const attrs = this._actorAttributes(systemSource);
    if (Object.keys(attrs).length) system.attributes = { ...(system.attributes ?? {}), ...attrs };
    this._applyLegacyPools(system, systemSource);
    this._applyActorBio(system, systemSource);
    this._applyActorCombat(system, systemSource);
    this._applyActorArmorAndVehicle(system, systemSource);

    const skills = this._skillRows(this._field(systemSource, "skills", "Skills", "Skills of Note"));
    if (skills.length) system.skills = { ...(system.skills ?? {}), list: skills };

    const weapons = this._weaponRows(this._field(systemSource, "weapons", "Weapons", "Favorite Weapons", "Attacks"));
    if (weapons.length) system.weapons = { ...(system.weapons ?? {}), modern: weapons };

    const powers = this._powerRows(this._field(systemSource, "powers", "Powers", "Spells", "Psionics", "Psionic Powers"));
    if (powers.length) system.powers = powers;

    const notes = this._actorNotes(systemSource);
    if (notes) system.notes = String(notes);

    return {
      name,
      type: "character",
      img: record.img || record.image || "icons/svg/mystery-man.svg",
      system,
      items: Array.isArray(record.items) ? record.items : []
    };
  }

  static _itemDataFromRecord(record, selectedType, overrideName, index = 0) {
    const rawType = this._normalizeItemType(record.type || this._field(record, "type", "Type") || selectedType);
    const type = rawType === "rcc" ? "occ" : rawType;
    const systemSource = this._systemSource(record);
    const hasSystem = !!record.system || !!record.data?.data;
    const system = hasSystem ? this._clone(systemSource) : this._systemForItemType(rawType, systemSource);
    if (rawType === "rcc") system.isRCC = true;

    return {
      name: this._cleanName(overrideName || this._field(record, "name", "Name") || `Imported ${ITEM_IMPORT_TYPES[rawType] ?? "Item"} ${index + 1}`),
      type,
      img: record.img || record.image || this._defaultItemImage(type),
      system
    };
  }

  static _systemForItemType(type, source) {
    switch (type) {
      case "weapon": return this._weaponSystem(source);
      case "armor": return this._armorSystem(source);
      case "powerArmor": return this._powerArmorSystem(source);
      case "occ":
      case "rcc": return this._occSystem(source, type === "rcc");
      case "race": return this._raceSystem(source);
      case "spell": return this._spellSystem(source);
      case "psionicPower": return this._psionicSystem(source);
      case "vehicle": return this._vehicleSystem(source);
      default: return {};
    }
  }

  static _weaponSystem(source) {
    const category = this._choice(this._field(source, "category", "Category"), CONFIG.EE?.WEAPON_CATEGORIES) || "modern";
    const damage = this._field(source, "damage", "Damage", "Mega-Damage") ?? "";
    const isMDC = this._bool(this._field(source, "isMDC", "MDC", "Mega-Damage")) || /\bM\.?D\.?C?\.?\b|mega/i.test(String(damage));
    return {
      category,
      damage: this._cleanDamage(damage),
      damageScale: this._damageScale(source, isMDC),
      damageType: this._choice(this._field(source, "damageType", "Damage Type"), CONFIG.EE?.DAMAGE_TYPES),
      range: this._textField(source, "range", "Range", "Effective Range"),
      ammo: this._textField(source, "ammo", "Ammo"),
      payload: this._textField(source, "payload", "Payload", "Shots"),
      rate: this._textField(source, "rate", "Rate", "Rate of Fire", "ROF"),
      strike: this._textField(source, "strike", "Strike"),
      parry: this._textField(source, "parry", "Parry"),
      special: this._textField(source, "special", "Special"),
      notes: this._joinText(
        this._textField(source, "notes", "Notes", "Description"),
        this._prefixedText("Weight", this._field(source, "Weight")),
        this._prefixedText("Black Market Cost", this._field(source, "Black Market Cost", "Cost"))
      ),
      isMDC
    };
  }

  static _armorSystem(source) {
    const locationText = this._field(source, "M.D.C. by Location", "M.D.C. by Locatio n", "MDC by Location", "Locations");
    const isMDC = this._bool(this._field(source, "isMDC", "MDC", "Mega-Damage")) || /\bM\.?\s*D\.?\s*C/i.test(this._sourceText(source));
    return {
      ar: this._number(this._field(source, "ar", "AR", "Armor Rating"), 0),
      isMDC,
      locations: this._locations({ ...source, Locations: locationText }),
      weight: this._textField(source, "weight", "Weight") || this._extractWeight(this._sourceText(source)),
      cost: this._textField(source, "cost", "Cost", "Black Market Cost"),
      prowlPenalty: this._mobilityPenalty(source),
      notes: this._joinText(
        this._textField(source, "notes", "Notes", "Description"),
        this._prefixedText("M.D.C. by Location", locationText)
      ),
      soak: this._number(this._field(source, "soak", "Soak"), 0),
      resistance: this._number(this._field(source, "resistance", "Resistance"), 0),
      damageScale: this._damageScale(source, isMDC)
    };
  }

  static _powerArmorSystem(source) {
    const locationText = this._field(source, "M.D.C. by Location", "MDC by Location", "Locations");
    const speedText = this._field(source, "Speed");
    const statText = this._field(source, "Statistical Data");
    const weaponText = this._field(source, "Weapon Systems", "Weapons");
    return {
      ...this._armorSystem({ ...source, Locations: locationText }),
      description: this._joinText(
        this._textField(source, "description", "Description"),
        this._prefixedText("Class", this._field(source, "Class")),
        this._prefixedText("Crew", this._field(source, "Crew")),
        this._prefixedText("Statistical Data", statText),
        this._prefixedText("Weapon Systems", weaponText)
      ),
      speed: this._joinText(
        this._textField(source, "speed", "Speed") || this._cleanWhitespace(speedText),
        this._prefixedText("Running", this._field(source, "Running")),
        this._prefixedText("Leaping", this._field(source, "Leaping"))
      ),
      cost: this._textField(source, "cost", "Cost", "Black Market Cost"),
      weight: this._textField(source, "weight", "Weight") || this._extractFieldFromText(statText, "Weight")
    };
  }

  static _occSystem(source, isRCC = false) {
    const occSkills = this._field(source, "skills", "O.C.C. Skills", "OCC Skills", "Starting Skills");
    const related = this._field(source, "O.C.C. Related Skills", "OCC Related Skills");
    const secondary = this._field(source, "Secondary Skills");
    const bonusText = this._field(source, "O.C.C. Bonuses", "OCC Bonuses", "Bonuses");
    const bonusMaps = this._legacyBonusMaps(bonusText);
    return {
      description: this._joinText(
        this._textField(source, "description", "Description", "Notes"),
        this._prefixedText("Requirements", this._field(source, "Requirements"))
      ),
      category: this._textField(source, "category", "Category") || (isRCC ? "RCC" : ""),
      isRCC,
      skills: this._skillRows(occSkills, "occ"),
      skillChoices: this._occSkillChoices(related, secondary),
      bonuses: this._joinText(
        this._textField(source, "bonuses", "Bonuses", "Special", "O.C.C. Bonuses", "OCC Bonuses"),
        this._prefixedText("Hand to Hand", this._field(source, "Hand to Hand"))
      ),
      equipment: this._joinText(
        this._textField(source, "equipment", "Equipment", "Standard Equipment"),
        this._prefixedText("Weapons", this._field(source, "Weapons")),
        this._prefixedText("Armor", this._field(source, "Armor")),
        this._prefixedText("Cybernetics & Bionics", this._field(source, "Cybernetics & Bionics", "Cybernetics"))
      ),
      money: this._textField(source, "money", "Money"),
      attributeBonuses: this._attributeBonuses(source),
      poolBonuses: this._poolBonuses(source),
      skillBonuses: this._skillBonusRows(this._field(source, "skillBonuses", "Skill Bonuses")),
      weaponProficiencies: { selected: this._weaponProficiencies(source), custom: [], choices: this._wpChoices(occSkills) },
      combatBonuses: { ...this._numberMap(source, ["attacks", "initiative", "damage", "strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll"], "bonus"), ...bonusMaps.combat },
      saveBonuses: { ...this._numberMap(source, ["spell", "ritual", "psionics", "drugPoison", "harmfulDrugs", "insanity", "possession", "horrorFactor", "death", "pain"], "save"), ...bonusMaps.saves },
      grantsMagic: this._bool(this._field(source, "grantsMagic", "Magic", "Grants Magic")),
      grantsPsionics: this._bool(this._field(source, "grantsPsionics", "Psionics", "Grants Psionics")),
      abilities: this._abilityRows(this._field(source, "abilities", "Abilities", "Powers"))
    };
  }

  static _raceSystem(source) {
    const bonusText = this._field(source, "bonuses", "Bonuses", "Special");
    const bonusMaps = this._legacyBonusMaps(bonusText);
    const attributeBonuses = this._attributeBonuses(source);
    const attrBlock = this._field(source, "Attributes");
    if (attrBlock) {
      for (const [key, formula] of Object.entries(this._attributeFormulaMap(attrBlock))) {
        attributeBonuses[key] = { bonus: 0, formula, value: 0, rolled: false };
      }
    }
    const naturalAbilities = this._field(source, "Natural Abilities");
    const skillsOfNote = this._field(source, "Skills of Note");
    return {
      description: this._joinText(
        this._prefixedText("Alignments", this._field(source, "Alignments", "Alignment")),
        this._prefixedText("Hit Points", this._field(source, "Hit Points")),
        this._prefixedText("S.D.C.", this._field(source, "S.D.C.", "SDC")),
        this._prefixedText("Natural Armor Rating", this._field(source, "Natural Armor Rating")),
        this._prefixedText("Horror Factor", this._field(source, "Horror Factor")),
        this._prefixedText("P.P.E.", this._field(source, "P.P.E.", "PPE")),
        this._prefixedText("Combat", this._field(source, "Combat")),
        this._prefixedText("Psionics", this._field(source, "Psionics")),
        this._prefixedText("Habitat", this._field(source, "Habitat")),
        this._prefixedText("Enemies", this._field(source, "Enemies")),
        this._prefixedText("Allies", this._field(source, "Allies")),
        this._textField(source, "description", "Description", "Notes")
      ),
      lifespan: this._textField(source, "lifespan", "Lifespan", "Average Life Span"),
      size: this._textField(source, "size", "Size"),
      bonuses: this._textField(source, "bonuses", "Bonuses", "Special"),
      languages: this._textField(source, "languages", "Languages"),
      isMDC: this._bool(this._field(source, "isMDC", "MDC", "Mega-Damage")),
      attributeBonuses,
      poolBonuses: this._poolBonuses(source),
      skillBonuses: this._skillBonusRows(this._field(source, "skillBonuses", "Skill Bonuses")),
      weaponProficiencies: { selected: this._weaponProficiencies(source), custom: [], choices: this._wpChoices(skillsOfNote) },
      combatBonuses: { ...this._numberMap(source, ["attacks", "initiative", "damage", "strike", "parry", "dodge", "disarm", "entangle", "pullPunch", "roll"], "bonus"), ...bonusMaps.combat },
      saveBonuses: { ...this._numberMap(source, ["spell", "ritual", "psionics", "drugPoison", "harmfulDrugs", "insanity", "possession", "horrorFactor", "death", "pain"], "save"), ...bonusMaps.saves },
      grantsMagic: this._bool(this._field(source, "grantsMagic", "Magic", "Grants Magic")),
      grantsPsionics: this._bool(this._field(source, "grantsPsionics", "Psionics", "Grants Psionics")),
      abilities: this._abilityRows(this._joinText(naturalAbilities, skillsOfNote))
    };
  }

  static _spellSystem(source) {
    const damage = this._field(source, "damage", "Damage") ?? "";
    return {
      description: this._joinText(
        this._textField(source, "description", "Description", "Notes"),
        this._fieldTail(source, "P.P.E.", "PPE", "Cost")
      ),
      level: this._number(this._field(source, "level", "Level"), 1),
      ppeCost: this._number(this._firstLine(this._field(source, "ppeCost", "PPE Cost", "P.P.E.", "PPE", "Cost")), 0),
      duration: this._textField(source, "duration", "Duration"),
      range: this._textField(source, "range", "Range", "Effective Range"),
      savingThrow: this._textField(source, "savingThrow", "Saving Throw", "Save"),
      damage: String(damage),
      isMDC: this._bool(this._field(source, "isMDC", "MDC", "Mega-Damage")) || /\bM\.?D/i.test(String(damage))
    };
  }

  static _psionicSystem(source) {
    const damage = this._field(source, "damage", "Damage") ?? "";
    return {
      description: this._joinText(
        this._textField(source, "description", "Description", "Notes"),
        this._fieldTail(source, "I.S.P.", "ISP", "Cost")
      ),
      ispCost: this._number(this._firstLine(this._field(source, "ispCost", "ISP Cost", "I.S.P.", "ISP", "Cost")), 0),
      duration: this._textField(source, "duration", "Duration"),
      range: this._textField(source, "range", "Range", "Effective Range"),
      savingThrow: this._textField(source, "savingThrow", "Saving Throw", "Save"),
      damage: String(damage),
      isMDC: this._bool(this._field(source, "isMDC", "MDC", "Mega-Damage")) || /\bM\.?D/i.test(String(damage))
    };
  }

  static _vehicleSystem(source) {
    const isMDC = this._field(source, "isMDC", "MDC", "Mega-Damage");
    const locationText = this._field(source, "M.D.C. by Location", "MDC by Location", "Locations");
    const sizeText = this._field(source, "Size");
    const statText = this._field(source, "Statistical Data");
    const maxSpeed = this._textField(source, "maxSpeed", "Max Speed", "Maximum Speed", "Speed");
    const maxRange = this._textField(source, "range", "Range", "Maximum Range", "Max Range");
    const armorLocations = this._locations({ ...source, Locations: locationText });
    return {
      description: this._textField(source, "description", "Description"),
      vehicleType: this._choice(this._field(source, "vehicleType", "Vehicle Type", "Type"), CONFIG.EE?.VEHICLE_TYPES),
      isMDC: isMDC === undefined ? true : this._bool(isMDC),
      crew: this._textField(source, "crew", "Crew"),
      capacity: this._textField(source, "capacity", "Capacity", "Passengers"),
      stats: {
        height: this._textField(source, "height", "Height") || this._extractFieldFromText(statText, "Height"),
        width: this._textField(source, "width", "Width") || this._extractFieldFromText(statText, "Width"),
        length: this._textField(source, "length", "Length") || this._extractFieldFromText(statText, "Length") || this._extractLength(sizeText),
        weight: this._textField(source, "weight", "Weight") || this._extractFieldFromText(statText, "Weight") || this._extractWeight(sizeText),
        cargo: this._textField(source, "cargo", "Cargo") || this._extractFieldFromText(statText, "Cargo"),
        powerSource: this._textField(source, "powerSource", "Power Source", "Power System", "Engine") || this._extractFieldFromText(statText, "Power System"),
        flightCeiling: this._textField(source, "flightCeiling", "Flight Ceiling"),
        leaps: this._textField(source, "leaps", "Leaps", "Leaping"),
        valueNew: this._textField(source, "valueNew", "Value New", "New Value"),
        valueUsed: this._textField(source, "valueUsed", "Value Used", "Used Value"),
        availability: this._extractAvailability(this._field(source, "Black Market Cost", "Cost"))
      },
      speed: {
        max: maxSpeed,
        cruise: this._textField(source, "cruise", "Cruise"),
        range: maxRange,
        flyingSpace: this._textField(source, "flyingSpace", "Flying Space"),
        flyingAtm: this._textField(source, "flyingAtm", "Flying Atm", "Flying Atmosphere"),
        ftl: this._textField(source, "ftl", "FTL"),
        running: this._textField(source, "running", "Running")
      },
      armor: {
        ar: this._number(this._field(source, "ar", "AR", "Armor Rating"), 0),
        sensorBonus: this._textField(source, "sensorBonus", "Sensor Bonus"),
        pilotComp: this._textField(source, "pilotComp", "Pilot Comp", "Pilot's Comp."),
        ...armorLocations,
        extras: armorLocations.extras ?? []
      },
      weapons: this._weaponRows(this._field(source, "weapons", "Weapon Systems", "Weapons")),
      notes: this._joinText(
        this._textField(source, "notes", "Notes"),
        this._prefixedText("Cost", this._field(source, "Black Market Cost", "Cost")),
        this._prefixedText("M.D.C. by Location", locationText)
      )
    };
  }

  static _systemSource(record) {
    return record?.system ?? record?.data?.data ?? record?.data ?? record ?? {};
  }

  static _isBookHeading(value) {
    return BOOK_HEADINGS.has(this._norm(value));
  }

  static _canonicalHeading(value) {
    const normalized = this._norm(value);
    const map = {
      occskills: "O.C.C. Skills",
      occrelatedskills: "O.C.C. Related Skills",
      secondaryskills: "Secondary Skills",
      occbonuses: "O.C.C. Bonuses",
      cyberneticsbionics: "Cybernetics & Bionics",
      alliancesallies: "Alliances & Allies",
      skillsofnote: "Skills of Note",
      favoriteweapons: "Favorite Weapons",
      specialweapon: "Special Weapon",
      bodyarmor: "Body Armor",
      specialvehicle: "Special Vehicle",
      experiencelevel: "Experience Level",
      attackspermelee: "Attacks Per Melee",
      psionicpowers: "Psionic Powers",
      magicknowledge: "Magic Knowledge",
      megadamage: "Mega-Damage",
      effectiverange: "Effective Range",
      blackmarketcost: "Black Market Cost",
      vehicletype: "Vehicle Type",
      modeltype: "Model Type",
      maximumspeed: "Maximum Speed",
      maxspeed: "Maximum Speed",
      maximumrange: "Maximum Range",
      maximumranger: "Maximum Range",
      running: "Running",
      leaping: "Leaping",
      weaponsystems: "Weapon Systems",
      statisticaldata: "Statistical Data",
      physicalstrength: "Physical Strength",
      powersystem: "Power System",
      primarypurpose: "Primary Purpose",
      primarypurnose: "Primary Purpose",
      missiletype: "Missile Type",
      mdcbylocation: "M.D.C. by Location",
      mdebylocation: "M.D.C. by Location",
      mdcbylocatio: "M.D.C. by Location",
      naturalarmorrating: "Natural Armor Rating",
      naturalabilities: "Natural Abilities",
      averagelifespan: "Average Life Span",
      standardequipment: "Standard Equipment"
    };
    return map[normalized] ?? value.trim();
  }

  static _tidyOcrText(value) {
    return String(value ?? "")
      .replace(/\bM\.D\.e\./gi, "M.D.C.")
      .replace(/\bM\.D\.e\b/gi, "M.D.C.")
      .replace(/\bLocati\s+o\s+n\b/gi, "Location")
      .replace(/\bMaxim\s+u\s+m\b/gi, "Maximum")
      .replace(/\bS\s+u\s+per\b/gi, "Super")
      .replace(/\bRa\s+i\s+l\b/gi, "Rail")
      .replace(/\bPurnose\b/gi, "Purpose")
      .replace(/\bfe\s+et\b/gi, "feet")
      .replace(/\bab\s+ility\b/gi, "ability")
      .replace(/\bobj\s+ect\b/gi, "object")
      .replace(/\brep\s+laced\b/gi, "replaced")
      .replace(/\bfuel\s+milage\b/gi, "fuel mileage");
  }

  static _appendBlock(existing, value) {
    const text = String(value ?? "").trim();
    if (!text) return existing ?? "";
    return existing ? `${existing}\n${text}` : text;
  }

  static _cleanWhitespace(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  static _cleanName(value) {
    return this._cleanWhitespace(value).replace(/\.$/, "");
  }

  static _firstLine(value) {
    return String(value ?? "").split(/\r?\n/)[0]?.trim() ?? "";
  }

  static _joinText(...parts) {
    return parts
      .map(p => String(p ?? "").trim())
      .filter(Boolean)
      .join("\n\n");
  }

  static _prefixedText(label, value) {
    const text = String(value ?? "").trim();
    return text ? `${label}: ${text}` : "";
  }

  static _fieldTail(source, ...names) {
    const value = this._field(source, ...names);
    const parts = String(value ?? "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return parts.slice(1).join("\n");
  }

  static _extractFieldFromText(text, label) {
    const source = String(text ?? "");
    if (!source) return "";
    const pattern = new RegExp(`${this._regexEscape(label)}\\s*[:.]\\s*([^\\n]+(?:\\n(?![A-Z][A-Za-z\\s/-]{1,35}\\s*[:.]).+)*)`, "i");
    return this._cleanWhitespace(source.match(pattern)?.[1] ?? "");
  }

  static _extractWeight(text) {
    return this._cleanWhitespace(String(text ?? "").match(/(?:Weight\s*[:.]?\s*)?(\d[\d\s,.]*(?:lbs?|pounds?|tons?)[^.;,\n]*)/i)?.[1] ?? "");
  }

  static _extractLength(text) {
    return this._cleanWhitespace(String(text ?? "").match(/(\d[\d\s,.]*(?:ft|feet|m)\b[^.;,\n]*(?:long|length)?)/i)?.[1] ?? "");
  }

  static _extractAvailability(text) {
    return this._cleanWhitespace(String(text ?? "").match(/(?:credits?\.?\s*)([^.\n]*availability[^.\n]*)/i)?.[1] ?? "");
  }

  static _mobilityPenalty(source) {
    const explicit = this._number(this._field(source, "prowlPenalty", "Prowl Penalty"), null);
    if (explicit !== null) return explicit;
    const text = this._sourceText(source);
    const value = this._number(text.match(/[-–]\s*(\d+)\s*%\s*(?:penalty|to|on)/i)?.[1], 0);
    return value ? -Math.abs(value) : 0;
  }

  static _attributeFormulaMap(value) {
    const text = String(value ?? "").replace(/\s+/g, " ");
    const out = {};
    const labels = "I\\.?\\s*Q\\.?|M\\.?\\s*E\\.?|M\\.?\\s*A\\.?|P\\.?\\s*S\\.?|P\\.?\\s*P\\.?|P\\.?\\s*E\\.?|P\\.?\\s*B\\.?|Spd\\.?";
    const rx = new RegExp(`\\b(${labels})\\s*[:.]?\\s*([^,]+?)(?=,\\s*(?:${labels})\\b|$)`, "gi");
    for (const match of text.matchAll(rx)) {
      const raw = this._norm(match[1]);
      const key = raw === "spd" ? "spd" : raw.slice(0, 2);
      out[key] = this._cleanFormula(match[2]);
    }
    return out;
  }

  static _cleanFormula(value) {
    return this._cleanWhitespace(String(value ?? "")
      .replace(/\bl\s*(?=D|\d)/g, "1")
      .replace(/\bI\s*(?=D|\d)/g, "1")
      .replace(/\bO\b/g, "0"));
  }

  static _cleanDamage(value) {
    return this._cleanFormula(value)
      .replace(/\bM\.?\s*D\.?\s*C?\.?\b/i, "M.D.")
      .replace(/\bS\.?\s*D\.?\s*C?\.?\b/i, "S.D.C.")
      .replace(/\bM\.D\.\.+/g, "M.D.")
      .replace(/\bS\.D\.C\.\.+/g, "S.D.C.");
  }

  static _normalizeItemType(value) {
    const key = this._norm(value);
    const aliases = {
      psionic: "psionicPower",
      psionicpower: "psionicPower",
      psychicpower: "psionicPower",
      psychic: "psionicPower",
      occ: "occ",
      occupation: "occ",
      rcc: "rcc",
      racialcharacterclass: "rcc",
      race: "race",
      species: "race",
      spell: "spell",
      magic: "spell",
      weapon: "weapon",
      armor: "armor",
      armour: "armor",
      vehicle: "vehicle",
      powerarmor: "powerArmor",
      powerarmour: "powerArmor"
    };
    return aliases[key] ?? "weapon";
  }

  static _defaultItemImage(type) {
    const icons = {
      weapon: "icons/svg/sword.svg",
      armor: "icons/svg/shield.svg",
      powerArmor: "icons/svg/upgrade.svg",
      vehicle: "icons/svg/wing.svg",
      spell: "icons/svg/book.svg",
      psionicPower: "icons/svg/aura.svg",
      race: "icons/svg/dna.svg",
      occ: "icons/svg/upgrade.svg"
    };
    return icons[type] ?? "icons/svg/item-bag.svg";
  }

  static _field(source, ...names) {
    if (!source || typeof source !== "object") return undefined;
    for (const name of names) {
      if (source[name] !== undefined) return source[name];
      const wanted = this._norm(name);
      for (const [key, value] of Object.entries(source)) {
        if (this._norm(key) === wanted) return value;
      }
    }
    return undefined;
  }

  static _textField(source, ...names) {
    const value = this._field(source, ...names);
    return value == null ? "" : this._cleanWhitespace(value);
  }

  static _setIf(object, key, value) {
    if (value !== undefined && value !== null && value !== "") object[key] = value;
  }

  static _clone(value) {
    if (foundry.utils?.deepClone) return foundry.utils.deepClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  static _norm(value) {
    return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  static _number(value, fallback = 0) {
    if (value === undefined || value === null || value === "") return fallback;
    const match = String(value).replace(/,/g, "").replace(/(\d)\s+(?=\d)/g, "$1").match(/[-+]?\d+(?:\.\d+)?/);
    if (match) return Number(match[0]);
    const word = String(value).toLowerCase().match(/\b([a-z]+)\b/)?.[1];
    return NUMBER_WORDS[word] ?? fallback;
  }

  static _bool(value) {
    if (typeof value === "boolean") return value;
    const text = String(value ?? "").trim().toLowerCase();
    return ["true", "yes", "y", "1", "on", "mdc", "mega", "mega-damage"].includes(text);
  }

  static _choice(value, choices = {}) {
    if (value === undefined || value === null || value === "") return "";
    const text = String(value).trim();
    if (Object.prototype.hasOwnProperty.call(choices, text)) return text;
    const wanted = this._norm(text);
    for (const [key, label] of Object.entries(choices ?? {})) {
      if (this._norm(key) === wanted || this._norm(label) === wanted) return key;
    }
    return "";
  }

  static _damageScale(source, isMDC = false) {
    const explicit = this._choice(this._field(source, "damageScale", "Damage Scale", "Scale"), CONFIG.EE?.EE_DAMAGE_SCALES);
    if (explicit) return explicit;
    const text = JSON.stringify(source ?? {});
    if (/\bG\.?D|giga/i.test(text)) return "G";
    if (/\bU\.?D|ultra/i.test(text)) return "U";
    return isMDC ? "M" : "S";
  }

  static _actorAttributes(source) {
    const attrs = {};
    const combined = [this._field(source, "attributes", "Attributes"), ...ATTRIBUTE_KEYS.map(k => this._field(source, k, ATTRIBUTE_LABELS[k]))]
      .filter(v => v !== undefined && v !== null)
      .join("\n");

    for (const key of ATTRIBUTE_KEYS) {
      const explicit = this._field(source, `attributes.${key}`, key, ATTRIBUTE_LABELS[key]);
      const value = this._number(explicit, null);
      if (value !== null) attrs[key] = { value };
    }

    const regex = /\b(I\.?\s*Q\.?|M\.?\s*E\.?|M\.?\s*A\.?|P\.?\s*S\.?|P\.?\s*P\.?|P\.?\s*E\.?|P\.?\s*B\.?|Spd\.?)\s*[:=]?\s*([-+]?\d+)/gi;
    for (const match of combined.matchAll(regex)) {
      const raw = this._norm(match[1]);
      const key = raw === "spd" ? "spd" : raw.slice(0, 2);
      attrs[key] = { value: Number(match[2]) };
    }
    return attrs;
  }

  static _attributeBonuses(source) {
    const out = {};
    for (const key of ATTRIBUTE_KEYS) {
      const value = this._field(source, `${ATTRIBUTE_LABELS[key]} Bonus`, `${key}Bonus`, key, ATTRIBUTE_LABELS[key]);
      const text = value == null ? "" : String(value).trim();
      const numeric = /^[-+]?\d+$/.test(text) ? Number(text) : 0;
      out[key] = {
        bonus: numeric,
        formula: numeric ? "" : text,
        value: 0,
        rolled: false
      };
    }
    return out;
  }

  static _applyPool(system, key, source, ...labels) {
    const value = this._field(source, key, ...labels);
    if (value === undefined || value === null || value === "") return;
    const parts = String(value).replace(/,/g, "").match(/[-+]?\d+(?:\.\d+)?/g) ?? [];
    const current = parts[0] ? Number(parts[0]) : 0;
    const max = parts[1] ? Number(parts[1]) : current;
    system[key] = { ...(system[key] ?? {}), value: current, max };
  }

  static _applyLegacyPools(system, source) {
    for (const [key, labels] of Object.entries({
      hp: ["HP", "H.P.", "Hit Points"],
      sdc: ["SDC", "S.D.C."],
      mdc: ["MDC", "M.D.C."],
      isp: ["ISP", "I.S.P."],
      ppe: ["PPE", "P.P.E."]
    })) {
      this._applyPool(system, key, source, ...labels);
    }

    const allText = this._sourceText(source);
    const patterns = {
      hp: [/(?:Hit Points|H\.?\s*P\.?)\s*[:.]?\s*(\d[\d,]*)(?:\s*\/\s*(\d[\d,]*))?/i, /(\d[\d,]*)\s*H\.?\s*P\.?/i],
      sdc: [/(?:S\.?\s*D\.?\s*C\.?)\s*[:.]?\s*(\d[\d,]*)(?:\s*\/\s*(\d[\d,]*))?/i, /(\d[\d,]*)\s*S\.?\s*D\.?\s*C\.?/i],
      mdc: [/(?:M\.?\s*D\.?\s*C\.?)\s*[:.]?\s*(\d[\d,]*)(?:\s*\/\s*(\d[\d,]*))?/i, /(\d[\d,]*)\s*M\.?\s*D\.?\s*C\.?/i],
      isp: [/(?:I\.?\s*S\.?\s*P\.?)\s*[:.]?\s*(\d[\d,]*)(?:\s*\/\s*(\d[\d,]*))?/i, /(\d[\d,]*)\s*I\.?\s*S\.?\s*P\.?/i],
      ppe: [/(?:P\.?\s*P\.?\s*E\.?)\s*[:.]?\s*(\d[\d,]*)(?:\s*\/\s*(\d[\d,]*))?/i, /(\d[\d,]*)\s*P\.?\s*P\.?\s*E\.?/i]
    };
    for (const [key, tests] of Object.entries(patterns)) {
      const match = tests.map(rx => allText.match(rx)).find(Boolean);
      if (!match?.[1]) continue;
      const current = Number(match[1].replace(/,/g, ""));
      const max = match[2] ? Number(match[2].replace(/,/g, "")) : current;
      system[key] = { ...(system[key] ?? {}), value: current, max };
    }
  }

  static _applyActorBio(system, source) {
    const bio = { ...(system.bio ?? {}) };
    const allText = this._sourceText(source);
    const age = this._field(source, "Age") ?? allText.match(/\bAge\s*[:.]?\s*([^\n,]+)/i)?.[1];
    const height = this._field(source, "Height") ?? allText.match(/\bHeight\s*[:.]?\s*([^\n,]+)/i)?.[1];
    const weight = this._field(source, "Weight") ?? allText.match(/\bWeight\s*[:.]?\s*([^\n,]+)/i)?.[1];
    if (age) bio.age = String(age).trim();
    if (height) bio.height = String(height).trim();
    if (weight) bio.weight = String(weight).trim();
    if (Object.keys(bio).length) system.bio = bio;
  }

  static _applyActorCombat(system, source) {
    const combat = this._field(source, "Combat");
    const bonuses = this._field(source, "Bonuses");
    const handToHand = { ...(system.handToHand ?? {}) };
    const hthText = this._joinText(combat, this._field(source, "Hand to Hand"));
    const hthMatch = hthText.match(/hand\s*to\s*hand\s*:\s*([^.\n]+)/i);
    const hthType = this._choice(hthMatch?.[1] ?? hthText, CONFIG.EE?.HTH_TYPES);
    if (hthType) handToHand.type = hthType;

    const attacks = this._number(this._field(source, "Attacks Per Melee", "Attacks"), null);
    if (attacks !== null) handToHand.attacks = attacks;

    const maps = this._legacyBonusMaps(bonuses);
    Object.assign(handToHand, maps.combat);
    system.handToHand = handToHand;

    if (Object.keys(maps.saves).length) {
      system.savingThrows = { ...(system.savingThrows ?? {}) };
      for (const [key, bonus] of Object.entries(maps.saves)) {
        system.savingThrows[key] = { ...(system.savingThrows[key] ?? {}), bonus };
      }
    }
  }

  static _applyActorArmorAndVehicle(system, source) {
    const armor = this._field(source, "Body Armor", "Armor");
    if (armor) {
      const current = system.armor?.primary ?? {};
      const max = this._number(armor.match(/(\d[\d,]*)\s*M\.?\s*D\.?\s*C\.?/i)?.[1], 0);
      const prowlPenalty = this._number(armor.match(/[-–]\s*(\d+)\s*%\s*to\s*prowl/i)?.[1], 0);
      system.armor = {
        ...(system.armor ?? {}),
        primary: {
          ...current,
          name: String(armor).split(":")[0]?.trim() || current.name || "Body Armor",
          prowlPenalty: prowlPenalty ? -Math.abs(prowlPenalty) : 0,
          locations: {
            ...(current.locations ?? {}),
            mainBody: { current: max, max }
          }
        }
      };
    }

    const vehicle = this._field(source, "Special Vehicle", "Vehicle");
    if (vehicle) {
      system.vehicle = { ...(system.vehicle ?? {}), name: String(vehicle).trim() };
    }
  }

  static _actorNotes(source) {
    const used = new Set([
      "Name", "Alignment", "Attributes", "Hit Points", "HP", "SDC", "MDC", "PPE", "ISP",
      "P.P.E.", "I.S.P.", "Weight", "Height", "Age", "Combat", "Attacks Per Melee",
      "Bonuses", "Skills of Note", "Favorite Weapons", "Body Armor", "Special Vehicle"
    ].map(k => this._norm(k)));
    const parts = [];
    for (const [key, value] of Object.entries(source ?? {})) {
      if (used.has(this._norm(key))) continue;
      if (value === undefined || value === null || value === "") continue;
      parts.push(`${key}: ${value}`);
    }
    return this._joinText(this._field(source, "Notes", "Description", "Bio"), ...parts);
  }

  static _poolBonuses(source) {
    const text = this._sourceText(source);
    const bonusFor = label => {
      const rx = new RegExp(`([+-]?\\s*\\d+)\\s*(?:${label})`, "i");
      const value = text.match(rx)?.[1];
      return value ? String(Number(value.replace(/\s/g, ""))) : "";
    };
    return {
      hp: this._textField(source, "hpBonus", "HP Bonus") || bonusFor("H\\.?\\s*P\\.?|Hit Points"),
      sdc: this._textField(source, "sdcBonus", "SDC Bonus") || bonusFor("S\\.?\\s*D\\.?\\s*C\\.?"),
      mdc: this._textField(source, "mdcBonus", "MDC Bonus") || bonusFor("M\\.?\\s*D\\.?\\s*C\\.?"),
      isp: this._textField(source, "ispBonus", "ISP Bonus") || bonusFor("I\\.?\\s*S\\.?\\s*P\\.?"),
      ppe: this._textField(source, "ppeBonus", "PPE Bonus") || bonusFor("P\\.?\\s*P\\.?\\s*E\\.?")
    };
  }

  static _numberMap(source, keys, suffix) {
    const out = {};
    for (const key of keys) {
      const label = `${key} ${suffix}`;
      out[key] = this._number(this._field(source, key, label), 0);
    }
    return out;
  }

  static _legacyBonusMaps(value) {
    const text = String(value ?? "");
    const combat = {};
    const saves = {};
    const find = (...patterns) => {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return Number(match[1].replace(/\s/g, ""));
      }
      return null;
    };
    const initiative = find(/([+-]\s*\d+)\s+(?:on\s+)?initiative/i);
    if (initiative !== null) combat.initiative = initiative;
    const strike = find(/([+-]\s*\d+)\s+to\s+strike/i);
    if (strike !== null) combat.strike = strike;
    const parryDodge = find(/([+-]\s*\d+)\s+to\s+parry\s+and\s+dodge/i);
    if (parryDodge !== null) {
      combat.parry = parryDodge;
      combat.dodge = parryDodge;
    }
    const parry = find(/([+-]\s*\d+)\s+to\s+parry(?!\s+and)/i);
    if (parry !== null) combat.parry = parry;
    const dodge = find(/([+-]\s*\d+)\s+to\s+dodge/i);
    if (dodge !== null) combat.dodge = dodge;
    const damage = find(/([+-]\s*\d+)\s+(?:S\.?\s*D\.?\s*C\.?\s+)?damage/i);
    if (damage !== null) combat.damage = damage;
    const roll = find(/([+-]\s*\d+)\s+to\s+roll/i);
    if (roll !== null) combat.roll = roll;
    const pullPunch = find(/([+-]\s*\d+)\s+to\s+pull\s+punch/i);
    if (pullPunch !== null) combat.pullPunch = pullPunch;
    const attacks = find(/([+-]\s*\d+)\s+attacks?/i);
    if (attacks !== null) combat.attacks = attacks;

    const horror = find(/([+-]\s*\d+)\s+to\s+save\s+vs\.?\s+horror/i);
    if (horror !== null) saves.horrorFactor = horror;
    const psionics = find(/([+-]\s*\d+)\s+to\s+save\s+vs\.?\s+psionic/i);
    if (psionics !== null) saves.psionics = psionics;
    const magic = find(/([+-]\s*\d+)\s+to\s+save\s+vs\.?\s+magic/i);
    if (magic !== null) saves.spell = magic;
    const poison = find(/([+-]\s*\d+)\s+to\s+save\s+vs\.?\s+poison/i);
    if (poison !== null) saves.drugPoison = poison;
    return { combat, saves };
  }

  static _occSkillChoices(related, secondary) {
    const choices = [];
    const relatedCount = this._choiceCount(related);
    if (relatedCount) {
      choices.push({
        label: "O.C.C. Related Skills",
        count: relatedCount,
        category: "occRelated",
        bonus: 0,
        allowedKeys: []
      });
    }
    const secondaryCount = this._choiceCount(secondary);
    if (secondaryCount) {
      choices.push({
        label: "Secondary Skills",
        count: secondaryCount,
        category: "secondary",
        bonus: 0,
        allowedKeys: []
      });
    }
    return choices;
  }

  static _choiceCount(value) {
    const text = String(value ?? "");
    const direct = text.match(/select\s+([a-z]+|\d+)/i)?.[1] ?? text.match(/gets\s+to\s+select\s+([a-z]+|\d+)/i)?.[1];
    return direct ? this._number(direct, 0) : 0;
  }

  static _wpChoices(value) {
    const text = String(value ?? "");
    const choices = [];
    const ancient = text.match(/select\s+([a-z]+|\d+)\s+ancient/i)?.[1];
    if (ancient) choices.push({ label: "Ancient W.P.", count: this._number(ancient, 1), pool: "ancient" });
    const modern = text.match(/(?:select\s+|and\s+)([a-z]+|\d+)\s+modern/i)?.[1];
    if (modern) choices.push({ label: "Modern W.P.", count: this._number(modern, 1), pool: "modern" });
    const any = !ancient && !modern ? text.match(/W\.?P\.?\s*:\s*(?:Select\s+)?([a-z]+|\d+)/i)?.[1] : null;
    if (any) choices.push({ label: "W.P. of choice", count: this._number(any, 1), pool: "any" });
    return choices;
  }

  static _sourceText(source) {
    if (!source || typeof source !== "object") return String(source ?? "");
    return Object.entries(source)
      .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`)
      .join("\n");
  }

  static _lineList(value) {
    if (Array.isArray(value)) return value;
    return String(value ?? "")
      .split(/\r?\n|;(?=\s*[A-Z0-9])/)
      .map(s => s.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean);
  }

  static _skillLineList(value) {
    if (Array.isArray(value)) return value;
    const text = String(value ?? "");
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const out = [];
    for (const line of lines) {
      if (/^W\.?\s*P\.?\s*[:.]?/i.test(line) || /^Hand\s+to\s+Hand\s*:/i.test(line)) {
        out.push(line);
        continue;
      }
      const splitCommas = !/[()]/.test(line) && /,/.test(line);
      out.push(...(splitCommas ? line.split(",") : [line]).map(s => s.trim()).filter(Boolean));
    }
    return out;
  }

  static _skillRows(value, category = "") {
    if (Array.isArray(value)) return value.map(v => ({ ...v }));
    const master = CONFIG.EE?.SKILL_LIST ?? [];
    return this._skillLineList(value).map(line => {
      if (/^W\.?\s*P\.?\s*[:.]?/i.test(line) || /^Hand\s+to\s+Hand\s*:/i.test(line)) return null;
      const bonus = this._number(line.match(/\(\s*([+-]?\s*\d+)\s*%/i)?.[1], 0);
      const withoutParens = line.replace(/\([^)]*\)/g, "").trim();
      const explicitPercent = this._number(withoutParens.match(/(\d+)\s*%/)?.[1], null);
      const name = withoutParens
        .replace(/\s*[-,]?\s*\d+\s*%?.*$/, "")
        .replace(/\s+/g, " ")
        .trim();
      const known = this._findLegacySkill(name, master);
      const base = explicitPercent ?? ((known?.base ?? 0) + bonus);
      return {
        key: known?.key ?? "",
        name: known?.name ?? name,
        base,
        perLvl: known?.perLvl ?? 0,
        misc: 0,
        category,
        custom: !known,
        statBonuses: known ? this._clone(known.statBonuses ?? {}) : {}
      };
    }).filter(row => row?.name);
  }

  static _skillBonusRows(value) {
    if (Array.isArray(value)) return value.map(v => ({ ...v }));
    const master = CONFIG.EE?.SKILL_LIST ?? [];
    return this._lineList(value).map(line => {
      const bonus = this._number(line, 0);
      const name = line.replace(/[-+]?\d+\s*%?.*$/, "").trim();
      const known = master.find(s => this._norm(s.name) === this._norm(name));
      return { key: known?.key ?? "", name: known?.name ?? name, bonus, note: "", custom: !known };
    }).filter(row => row.name);
  }

  static _weaponRows(value) {
    if (Array.isArray(value)) return value.map(v => ({ ...v, name: v.name ?? v.type ?? "" }));
    const numberedRows = this._numberedWeaponRows(value);
    if (numberedRows.length) return numberedRows;
    const parentheticalRows = this._parentheticalWeaponRows(value);
    if (parentheticalRows.length) return parentheticalRows;
    return this._weaponLineList(value).map(line => {
      const [namePart, rest = ""] = line.split(/\s[-–—]\s/, 2);
      const source = rest || line;
      const damage = this._cleanDamage((source.match(/((?:\d+|[IDl])\s*D\s*\d+(?:\s*[xX]\s*(?:\d+|[IDl])\d*)?(?:\s*(?:M\.?D\.?C?\.?|S\.?D\.?C?\.?|M\.?D\.?|S\.D\.?))?)/i)?.[1] ?? "").trim());
      const range = source.match(/(?:range|ranges?)\s*[:=]?\s*([^,;)]+)/i)?.[1]?.trim() ?? source.match(/(\d[\d,]*\s*(?:ft|feet)\b[^,;)]*|\d[\d,]*\s*m(?!\.)\b[^,;)]*)/i)?.[1]?.trim() ?? "";
      const payload = rest.match(/payload|shots|ammo/i) ? rest.match(/(?:payload|shots|ammo)\s*[:=]?\s*([^,;]+)/i)?.[1]?.trim() ?? "" : "";
      const isMDC = /\bM\.?D/i.test(line);
      return {
        name: damage || range ? namePart.replace(/\([^)]*\)/g, "").trim() : "Weapon Notes",
        damageType: "",
        damage,
        damageScale: isMDC ? "M" : "S",
        ammo: "",
        payload,
        strike: "",
        range,
        rate: rest.match(/(?:rate|rof)\s*[:=]?\s*([^,;]+)/i)?.[1]?.trim() ?? "",
        special: !damage && !range ? source : ""
      };
    }).filter(row => row.name);
  }

  static _numberedWeaponRows(value) {
    const text = String(value ?? "").replace(/\r/g, "");
    if (!/^\s*\d+\s*[.)]/m.test(text)) return [];
    const sections = text
      .split(/\n(?=\s*\d+\s*[.)]\s*)/g)
      .map(s => s.trim())
      .filter(Boolean);
    return sections.map(section => {
      const first = section.split(/\n/)[0] ?? "";
      const name = this._cleanWhitespace(first
        .replace(/^\d+\s*[.)]\s*/, "")
        .replace(/\([^)]*\)\s*:\s*$/, "")
        .replace(/\s*:\s*$/, ""));
      const damage = this._cleanDamage(this._extractFieldFromText(section, "Mega-Damage") || this._extractFieldFromText(section, "Missile Type"));
      const range = this._extractFieldFromText(section, "Effective Range");
      const rate = this._extractFieldFromText(section, "Rate of Fire");
      const payload = this._extractFieldFromText(section, "Payload");
      const isMDC = /\bM\.?\s*D/i.test(section);
      return {
        name,
        type: name,
        damageType: "",
        damage,
        damageScale: isMDC ? "M" : "S",
        ammo: "",
        payload,
        strike: "",
        range,
        rate,
        special: this._cleanWhitespace(section)
      };
    }).filter(row => row.name);
  }

  static _parentheticalWeaponRows(value) {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    if (!/\([^)]*(?:M\.?\s*D|S\.?\s*D|shots?|range)[^)]*\)/i.test(text)) return [];
    const rows = [];
    const rx = /([^()]{2,120})\(([^)]*(?:M\.?\s*D|S\.?\s*D|shots?|range)[^)]*)\)/gi;
    for (const match of text.matchAll(rx)) {
      const name = match[1]
        .split(/,\s*/)
        .pop()
        .replace(/^(?:and\s+|a\s+|an\s+|the\s+)/i, "")
        .trim();
      const details = match[2].trim();
      if (!name || /^(?:or|and)$/i.test(name)) continue;
      const damage = this._cleanDamage(details.match(/(\d+D\d+(?:\s*x\s*\d+)?(?:\s*(?:M\.?\s*D\.?\s*C?\.?|S\.?\s*D\.?\s*C?\.?))?(?:\s+per\s+[^;,.]+)?)/i)?.[1]?.trim() ?? "");
      const range = details.match(/(\d[\d,]*\s*(?:ft|feet)\b[^;,.]*|\d[\d,]*\s*m(?!\.)\b[^;,.]*)/i)?.[1]?.trim() ?? "";
      const payload = details.match(/(\d+\s*shots?)/i)?.[1]?.trim() ?? "";
      const isMDC = /\bM\.?\s*D/i.test(details);
      rows.push({
        name,
        damageType: "",
        damage,
        damageScale: isMDC ? "M" : "S",
        ammo: "",
        payload,
        strike: "",
        range,
        rate: "",
        special: details
      });
    }
    return rows;
  }

  static _weaponLineList(value) {
    if (Array.isArray(value)) return value;
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    if (!text) return [];
    if (/\n/.test(String(value)) || (/;/.test(String(value)) && /\b(?:M\.?\s*D|S\.?\s*D|range|payload|shots?|ammo|rate)\b/i.test(text))) {
      return this._lineList(value);
    }
    return text
      .split(/,\s+(?=(?:[A-Z][\w'-]+|\d+D|a\s+|an\s+|the\s+))/)
      .map(s => s.trim().replace(/^(?:and\s+)/i, ""))
      .filter(Boolean);
  }

  static _findLegacySkill(name, master = CONFIG.EE?.SKILL_LIST ?? []) {
    const wanted = this._norm(name);
    if (!wanted) return null;
    const aliases = {
      landnavigation: "landnavigation",
      wildernesssurvival: "wildernesssurvival",
      horsemanship: "horsemanshipgeneral",
      paramedic: "paramedic",
      mathbasic: "mathematicsbasic",
      basicmathematics: "mathematicsbasic",
      dance: "dance",
      boxing: "boxing",
      radiobasic: "radiobasic",
      pilothovervehicle: "hovercraftground"
    };
    const target = aliases[wanted] ?? wanted;
    return master.find(s => this._norm(s.key) === target)
      ?? master.find(s => this._norm(s.name) === wanted)
      ?? master.find(s => wanted && this._norm(s.name).includes(wanted))
      ?? null;
  }

  static _powerRows(value) {
    if (Array.isArray(value)) return value.map(v => ({ ...v }));
    return this._lineList(value).map(line => ({ name: line, source: "", cost: "", range: "", saving: "", damage: "", duration: "", description: "" }));
  }

  static _abilityRows(value) {
    if (Array.isArray(value)) return value.map(v => typeof v === "string" ? { name: v, description: "" } : { ...v });
    return this._lineList(value).map(line => {
      const [name, description = ""] = line.split(/\s[-–—]\s/, 2);
      return { name: name.trim(), description: description.trim() };
    }).filter(row => row.name || row.description);
  }

  static _weaponProficiencies(source) {
    const text = this._sourceText(source);
    const selected = {};
    for (const entry of [...(CONFIG.EE?.WP_LIST?.ancient ?? []), ...(CONFIG.EE?.WP_LIST?.modern ?? [])]) {
      const name = entry.name.replace(/^W\.P\.\s*/i, "").replace(/\s*\([^)]*\)\s*/g, "");
      const pattern = new RegExp(`\\bW\\.?\\s*P\\.?\\s*:?\\s*${this._regexEscape(name)}\\b`, "i");
      if (pattern.test(text)) selected[entry.key] = true;
    }
    return selected;
  }

  static _regexEscape(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  }

  static _locations(source) {
    const out = {
      mainBody: { current: 0, max: 0 },
      head: { current: 0, max: 0 },
      leftArm: { current: 0, max: 0 },
      rightArm: { current: 0, max: 0 },
      leftLeg: { current: 0, max: 0 },
      rightLeg: { current: 0, max: 0 },
      extras: []
    };

    const applyLocation = (field, value) => {
      const current = this._number(value, 0);
      const max = current;
      if (Array.isArray(field)) {
        for (const f of field) out[f] = { current, max };
      } else {
        out[field] = { current, max };
      }
    };

    for (const [label, field] of Object.entries(LOCATION_FIELDS)) {
      const names = Array.isArray(field) ? [label] : [field, label, this._titleLocation(field)];
      const value = this._field(source, ...names);
      if (value === undefined || value === null || value === "") continue;
      if (typeof value === "object") {
        const current = this._number(value.current, this._number(value.value, 0));
        const max = this._number(value.max, current);
        if (Array.isArray(field)) for (const f of field) out[f] = { current, max };
        else out[field] = { current, max };
      } else {
        applyLocation(field, value);
      }
    }

    const locationBlock = this._field(source, "locations", "Location MDC", "Location SDC", "Armor");
    if (typeof locationBlock === "string") {
      const normalized = locationBlock
        .replace(/[“”"]/g, "")
        .replace(/\*/g, "")
        .replace(/\s+/g, " ");
      const rx = /([A-Za-z][A-Za-z\s/'-]*?(?:\([^)]*\))?)\s*(?::|-)\s*(\d[\d\s,]*)(?:\s*each)?/g;
      for (const match of normalized.matchAll(rx)) {
        const label = this._cleanWhitespace(match[1]);
        const field = LOCATION_FIELDS[this._norm(label.replace(/\([^)]*\)/g, ""))];
        const value = match[2];
        if (field) {
          applyLocation(field, value);
        } else {
          const max = this._number(value, 0);
          out.extras.push({ name: label, current: max, max });
        }
      }
    }
    return out;
  }

  static _titleLocation(field) {
    return field.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
  }
}
