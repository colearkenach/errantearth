import { ErrantEarthCharacterSheet } from "../actor/character-sheet.js";

const SAVE_LABELS = {
  spell: "Spell",
  ritual: "Ritual",
  psionics: "Psionics",
  insanity: "Insanity",
  drugPoison: "Toxins/Poisons",
  harmfulDrugs: "Harmful Drugs",
  horrorFactor: "Horror Factor",
  death: "Coma/Death",
  possession: "Possession",
  pain: "Pain"
};

const COMBAT_ROLLS = [
  { key: "initiative", label: "Initiative", icon: "fa-bolt" },
  { key: "strike", label: "Strike", icon: "fa-crosshairs" },
  { key: "parry", label: "Parry", icon: "fa-shield-alt" },
  { key: "dodge", label: "Dodge", icon: "fa-running" },
  { key: "disarm", label: "Disarm", icon: "fa-hand" },
  { key: "entangle", label: "Entangle", icon: "fa-link" },
  { key: "pullPunch", label: "Pull Punch", icon: "fa-fist-raised" },
  { key: "roll", label: "Roll w/ Impact", icon: "fa-sync-alt" }
];

export class ErrantEarthLegacyTools extends Application {
  static _instance = null;

  constructor(actor = null, options = {}) {
    super(options);
    this.actor = actor ?? ErrantEarthLegacyTools._preferredActor();
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "ee-legacy-tools",
      classes: ["errantearth", "ee-legacy-tools"],
      template: "systems/errantearth/templates/apps/legacy-tools.html",
      title: "EE Legacy Tools",
      width: 560,
      height: 720,
      resizable: true
    });
  }

  static registerHooks() {
    Hooks.on("renderActorDirectory", (app, html) => {
      if (!ErrantEarthLegacyTools._setting("legacyToolsButton", true)) return;
      ErrantEarthLegacyTools._addDirectoryButton(html);
    });
  }

  static open(actor = null) {
    if (!this._instance) this._instance = new this(actor);
    if (actor) this._instance.actor = actor;
    else this._instance.actor ??= this._preferredActor();
    return this._instance.render(true);
  }

  get title() {
    return this.actor ? `EE Legacy Tools: ${this.actor.name}` : "EE Legacy Tools";
  }

  async getData(options) {
    const ctx = await super.getData(options);
    const actors = ErrantEarthLegacyTools._legacyActors();
    if (!this.actor || !actors.some(actor => actor.id === this.actor.id)) {
      this.actor = ErrantEarthLegacyTools._preferredActor();
    }

    const actor = this.actor;
    const data = {
      ...ctx,
      actors: actors.map(a => ({ id: a.id, name: a.name, selected: a.id === actor?.id })),
      actor,
      hasActor: !!actor,
      isLegacy: false,
      modeLabel: "",
      summary: {},
      combatRolls: [],
      saves: [],
      skills: [],
      weapons: [],
      warnings: []
    };

    if (!actor) return data;

    const sheetData = await ErrantEarthLegacyTools._sheetData(actor);
    data.isLegacy = sheetData.mode === "rifts";
    data.modeLabel = sheetData.isEE ? "Errant Earth" : "EE Legacy";
    data.summary = ErrantEarthLegacyTools._summary(sheetData);
    data.combatRolls = ErrantEarthLegacyTools._combatRolls(sheetData);
    data.saves = ErrantEarthLegacyTools._saves(sheetData);
    data.skills = ErrantEarthLegacyTools._skills(sheetData);
    data.weapons = ErrantEarthLegacyTools._weapons(sheetData);
    data.warnings = sheetData.riftsDerived?.sourceWarnings ?? [];
    if (!data.isLegacy) data.warnings = ["This actor is currently in Errant Earth mode. Legacy rolls may not match the visible sheet.", ...data.warnings];
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.on("change", "[data-action='select-legacy-actor']", this._onSelectActor.bind(this));
    html.on("click", "[data-action='legacy-roll']", this._onLegacyRoll.bind(this));
    html.on("click", "[data-action='refresh-legacy-tools']", ev => {
      ev.preventDefault();
      this.render(false);
    });
    html.on("click", "[data-action='open-legacy-sheet']", ev => {
      ev.preventDefault();
      this.actor?.sheet?.render(true);
    });
  }

  _onSelectActor(ev) {
    const id = ev.currentTarget.value;
    this.actor = game.actors?.get(id) ?? null;
    this.render(false);
  }

  async _onLegacyRoll(ev) {
    ev.preventDefault();
    if (!this.actor) return ui.notifications?.warn("Choose an actor first.");
    const sheet = this.actor.sheet instanceof ErrantEarthCharacterSheet
      ? this.actor.sheet
      : new ErrantEarthCharacterSheet(this.actor);
    return sheet._onRoll({
      preventDefault: () => {},
      currentTarget: ev.currentTarget
    });
  }

  static _addDirectoryButton(html) {
    const root = this._htmlRoot(html);
    if (!root || root.querySelector("[data-action='ee-legacy-tools']")) return;
    const target = root.querySelector(".directory-header .header-actions")
      ?? root.querySelector(".directory-header")
      ?? root.querySelector(".header-actions")
      ?? root.querySelector(".window-content")
      ?? root;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ee-directory-import";
    button.dataset.action = "ee-legacy-tools";
    button.title = "Open EE Legacy quick tools";
    button.innerHTML = `<i class="fas fa-tools"></i><span>Legacy Tools</span>`;
    button.addEventListener("click", ev => {
      ev.preventDefault();
      ErrantEarthLegacyTools.open();
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

  static _setting(key, fallback) {
    try {
      return game.settings.get("errantearth", key) ?? fallback;
    } catch (err) {
      return fallback;
    }
  }

  static _legacyActors() {
    return (game.actors?.contents ?? [])
      .filter(actor => actor.type === "character")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  static _preferredActor() {
    const controlled = globalThis.canvas?.tokens?.controlled?.find(token => token.actor?.type === "character")?.actor;
    if (controlled) return controlled;
    if (game.user?.character?.type === "character") return game.user.character;
    return ErrantEarthLegacyTools._legacyActors()[0] ?? null;
  }

  static async _sheetData(actor) {
    const sheet = new ErrantEarthCharacterSheet(actor);
    return sheet.getData();
  }

  static _summary(ctx) {
    const hth = ctx.riftsDerived?.handToHand ?? {};
    const pools = ctx.riftsDerived?.pools ?? {};
    return {
      level: Number(ctx.actor?.system?.level ?? 1) || 1,
      handToHand: hth.label ?? "None",
      attacks: hth.attacks?.total ?? 0,
      hp: pools.hp?.total ?? ctx.actor?.system?.hp?.max ?? 0,
      sdc: pools.sdc?.total ?? ctx.actor?.system?.sdc?.max ?? 0,
      mdc: pools.mdc?.total ?? ctx.actor?.system?.mdc?.max ?? 0,
      ppe: pools.ppe?.total ?? ctx.actor?.system?.ppe?.max ?? 0,
      isp: pools.isp?.total ?? ctx.actor?.system?.isp?.max ?? 0
    };
  }

  static _combatRolls(ctx) {
    const hth = ctx.riftsDerived?.handToHand ?? {};
    return COMBAT_ROLLS.map(entry => {
      const bonus = Number(hth[entry.key]?.total ?? 0) || 0;
      return {
        ...entry,
        rollType: "d20",
        label: entry.label,
        rollLabel: `${entry.label}`,
        bonus,
        display: ErrantEarthCharacterSheet._formatSigned(bonus)
      };
    });
  }

  static _saves(ctx) {
    const saves = ctx.riftsDerived?.saves ?? {};
    return Object.entries(SAVE_LABELS)
      .map(([key, label]) => {
        const save = saves[key];
        if (!save) return null;
        return {
          key,
          label,
          base: save.base ?? "",
          bonus: Number(save.total ?? 0) || 0,
          display: save.display ?? save.total ?? 0
        };
      })
      .filter(Boolean);
  }

  static _skills(ctx) {
    const groups = [
      ...(ctx.skills?.occ ?? []),
      ...(ctx.skills?.occRelated ?? []),
      ...(ctx.skills?.secondary ?? []),
      ...(ctx.skills?.unassigned ?? [])
    ];
    return groups
      .filter(row => row?.name)
      .map(row => ({
        name: row.name,
        category: row.category ?? "",
        target: Number(row.total ?? 0) || 0
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  static _weapons(ctx) {
    const weapons = [];
    const addWeapon = (row, group, strikeKey = "effectiveStrike") => {
      const name = row?.name ?? "";
      if (!name) return;
      const strike = Number(row?.[strikeKey] ?? row?.strike ?? 0) || 0;
      const damage = String(row?.effectiveDamage ?? row?.damage ?? "").trim();
      weapons.push({
        name,
        group,
        strike,
        strikeDisplay: ErrantEarthCharacterSheet._formatSigned(strike),
        damage,
        hasDamage: !!damage
      });
    };

    for (const row of ctx.system?.weapons?.modern ?? []) addWeapon(row, "Modern");
    for (const row of ctx.system?.weapons?.ancient ?? []) addWeapon(row, "Ancient");
    for (const row of ctx.system?.weapons?.unarmed ?? []) addWeapon(row, "Unarmed", "effectiveStrike");
    return weapons;
  }
}
