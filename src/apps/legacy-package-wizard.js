import { LegacyPackages } from "../rules/legacy-packages.js";

/** One window for applying a Race, O.C.C. or R.C.C. to an EE Legacy
 *  character: Hand to Hand upgrades paid for with skill picks, language and
 *  specialty names, attribute choices, W.P. choices, and O.C.C. Related /
 *  Secondary picks with trades. The static helpers are pure so they can be
 *  tested without Foundry's UI. */
export class LegacyPackageWizard extends Application {
  constructor(actor, item, { mode = "equip", resolve = null } = {}) {
    super({ title: `${mode === "equip" ? "Take" : "Choose Skills"}: ${item?.name ?? "Package"}` });
    this.actor = actor;
    this.item = item;
    this.mode = mode;
    this._resolve = resolve;
    this._context = null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["errantearth", "sheet", "ee-pkg-wizard-app"],
      template: "systems/errantearth/templates/apps/legacy-package-wizard.html",
      width: 660,
      height: 720,
      resizable: true
    });
  }

  /** Resolves with a plan object, or null when the window is cancelled. */
  static prompt(actor, item, options = {}) {
    return new Promise(resolve => {
      new LegacyPackageWizard(actor, item, { ...options, resolve }).render(true);
    });
  }

  /** True when applying the package needs any player input. */
  static needsInput(context) {
    return !!(context.hth || context.specSkills.length || context.attributeChoices.length
      || context.wpChoices.length || context.skillChoices.length);
  }

  async getData() {
    this._context = LegacyPackageWizard.buildContext({
      sys: this.actor.system,
      item: this.item,
      items: this.actor.items,
      mode: this.mode
    });
    return { ...this._context, appId: this.appId, languages: CONFIG.EE?.RIFTS_LANGUAGES ?? [] };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const root = html[0] ?? html;
    const refresh = () => LegacyPackageWizard._refreshBudgets(root);
    root.addEventListener("change", event => {
      const input = event.target;
      if (input?.matches?.("input[type=checkbox][data-spec]")) {
        const spec = root.querySelector(`[name="${CSS.escape(input.dataset.spec)}"]`);
        if (spec) {
          spec.disabled = !input.checked;
          if (input.checked) spec.focus();
        }
      }
      refresh();
    });
    root.addEventListener("input", event => {
      if (event.target?.matches?.(".ee-pkg-filter")) LegacyPackageWizard._filter(event.target);
      if (event.target?.matches?.("[data-cost-input]")) refresh();
    });
    root.querySelector("[data-action='cancel']")?.addEventListener("click", () => this.close());
    root.querySelector("form")?.addEventListener("submit", event => {
      event.preventDefault();
      this._apply(root);
    });
    refresh();
  }

  static _filter(input) {
    const term = input.value.trim().toLowerCase();
    const section = input.closest(".ee-pkg-choice");
    for (const option of section?.querySelectorAll(".ee-pkg-option") ?? []) {
      option.hidden = !!term && !option.dataset.search?.includes(term);
    }
    for (const group of section?.querySelectorAll(".ee-pkg-group") ?? []) {
      const visible = [...group.querySelectorAll(".ee-pkg-option")].some(option => !option.hidden);
      group.hidden = !visible;
      if (term && visible) group.open = true;
    }
  }

  static _refreshBudgets(root) {
    const hthCost = Number(root.querySelector("input[name='hth']:checked")?.dataset.cost ?? 0) || 0;
    const hthChoice = root.querySelector("[data-hth-choice]")?.dataset.hthChoice ?? "";
    for (const section of root.querySelectorAll(".ee-pkg-choice")) {
      const index = section.dataset.choice;
      let spent = 0;
      for (const box of section.querySelectorAll("input[type=checkbox]:checked")) spent += Number(box.dataset.cost ?? 1) || 0;
      spent += Math.max(0, Number(section.querySelector("[data-cost-input]")?.value ?? 0) || 0);
      if (hthChoice !== "" && hthChoice === index) spent += hthCost;
      const remaining = Number(section.dataset.remaining ?? 0) || 0;
      const counter = section.querySelector("[data-spent]");
      if (counter) counter.textContent = String(spent);
      section.classList.toggle("ee-pkg-choice--over", spent > remaining);
      section.classList.toggle("ee-pkg-choice--done", spent === remaining && remaining > 0);
    }
    for (const group of root.querySelectorAll(".ee-pkg-group")) {
      const chosen = group.querySelectorAll("input[type=checkbox]:checked").length;
      const badge = group.querySelector("[data-chosen]");
      if (badge) {
        badge.textContent = chosen ? `${chosen} chosen` : "";
        badge.hidden = !chosen;
      }
    }
    for (const section of root.querySelectorAll(".ee-pkg-wp-choice")) {
      const count = Number(section.dataset.count ?? 0) || 0;
      const chosen = section.querySelectorAll("input[type=checkbox]:checked").length;
      const counter = section.querySelector("[data-spent]");
      if (counter) counter.textContent = String(chosen);
      section.classList.toggle("ee-pkg-choice--over", chosen > count);
      section.classList.toggle("ee-pkg-choice--done", chosen === count && count > 0);
    }
  }

  static _collect(root) {
    const values = {};
    for (const input of root.querySelectorAll("input[name], select[name]")) {
      if (input.type === "checkbox") values[input.name] = input.checked;
      else if (input.type === "radio") { if (input.checked) values[input.name] = input.value; }
      else if (!input.disabled) values[input.name] = input.value;
    }
    return values;
  }

  async _apply(root) {
    const values = LegacyPackageWizard._collect(root);
    const { plan, errors } = LegacyPackageWizard.planFromValues(values, this._context);
    if (errors.length) {
      for (const error of errors) ui.notifications?.warn(error);
      return;
    }
    plan.attributeRolls = await LegacyPackageWizard.rollAttributeChoices(plan, this.actor, this.item);
    const resolve = this._resolve;
    this._resolve = null;
    resolve?.(plan);
    return this.close();
  }

  async close(options) {
    const resolve = this._resolve;
    this._resolve = null;
    resolve?.(null);
    return super.close(options);
  }

  /** Roll each attribute-choice formula once and post the results. */
  static async rollAttributeChoices(plan, actor, item) {
    const results = {};
    for (const pick of plan.attributeChoices) {
      const formula = LegacyPackages.toRollFormula(pick.formula);
      if (!formula || LegacyPackages.isFlatNumber(pick.formula)) continue;
      const roll = await new Roll(formula).evaluate();
      results[pick.index] = roll.total;
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${item.name}: ${pick.label || "Attribute choice"} → ${LegacyPackages.ATTR_LABELS[pick.key]} (${pick.formula})`
      });
    }
    return results;
  }

  // ------------------------------------------------------------- context

  static _optionId(kind, key, slot = 0) {
    return `${kind}-${String(key).replace(/[^A-Za-z0-9_-]/g, "_")}-${slot}`;
  }

  static buildContext({ sys = {}, item, items = [], mode = "equip" }) {
    const equip = mode === "equip";
    const level = Math.max(1, Number(sys.level ?? 1) || 1);
    const typeLabel = LegacyPackages.typeLabel(item);
    const categories = CONFIG.EE?.SKILL_CATEGORIES ?? {};
    const hthLabels = CONFIG.EE?.HTH_TYPES ?? {};
    const trades = LegacyPackages.trades(sys);
    const status = LegacyPackages.choiceStatus(sys, item, level);
    const choiceRules = status.map(entry => entry.rule);

    // Hand to Hand: the package's training, or a paid upgrade.
    let hth = null;
    const packageHth = LegacyPackages.handToHand(item?.system);
    const alreadyTraded = trades.some(trade => trade.kind === "hth" && trade.sourceItemId === item?.id);
    if (equip && packageHth.type && !alreadyTraded) {
      const choiceIndex = LegacyPackages.hthTradeChoiceIndex(item);
      const current = sys.handToHand?.type ?? "";
      const options = [
        { value: packageHth.type, cost: 0, label: hthLabels[packageHth.type] ?? packageHth.type, note: "Included" },
        ...packageHth.upgrades.filter(upgrade => upgrade.type).map(upgrade => ({
          value: upgrade.type,
          cost: upgrade.cost,
          label: hthLabels[upgrade.type] ?? upgrade.type,
          note: [
            upgrade.cost ? `Costs ${upgrade.cost} pick${upgrade.cost === 1 ? "" : "s"} from ${choiceIndex >= 0 ? (choiceRules[choiceIndex]?.label || "O.C.C. Related Skills") : "O.C.C. Related Skills"}` : "No cost",
            upgrade.note
          ].filter(Boolean).join(" · ")
        }))
      ];
      const checked = options.some(option => option.value === current) ? current : packageHth.type;
      hth = {
        choiceIndex: choiceIndex >= 0 ? String(choiceIndex) : "",
        options: options.map(option => ({ ...option, checked: option.value === checked }))
      };
    }

    // Languages and specialties named by the player.
    const race = LegacyPackages.equippedPackages(sys, items).find(pkg => pkg.type === "race" || pkg.system?.rccAsRace);
    const nativeDefault = String((item?.type === "race" ? item.system?.nativeLanguage : race?.system?.nativeLanguage) ?? "").trim();
    const specSkills = equip
      ? LegacyPackages.fixedSkills(item?.system)
        .filter(row => row.isSpecialization)
        .map(row => {
          const native = row.key === "languageNative" || row.key === "literacyNative";
          const fallback = row.spec || (native ? nativeDefault : "");
          return {
            index: row.index,
            label: row.count > 1 ? `${row.name} ×${row.count}` : row.name,
            meta: LegacyPackageWizard._skillMeta(row.base, row.perLvl, row.bonus),
            inputs: Array.from({ length: row.count }, (_, n) => ({
              name: `spec.${row.index}.${n}`,
              value: n === 0 || !row.spec ? fallback : "",
              placeholder: native ? "Native language" : (row.specializationBase === "Literacy" ? "Written language" : "Language")
            }))
          };
        })
      : [];

    const attributeChoices = LegacyPackages.attributeChoices(item?.system)
      .filter(choice => !choice.chosen)
      .map(choice => ({
        index: choice.index,
        name: `attr.${choice.index}`,
        label: choice.label || "Attribute choice",
        formula: choice.formula,
        options: choice.options.map(key => ({ key, label: LegacyPackages.ATTR_LABELS[key] }))
      }));

    const usedWps = LegacyPackages.selectedWps(sys, items);
    for (const [key, value] of Object.entries(item?.system?.weaponProficiencies?.selected ?? {})) {
      if (LegacyPackages.bool(value)) usedWps.add(key);
    }
    const wpPool = pool => {
      const lists = CONFIG.EE?.WP_LIST ?? {};
      if (pool === "ancient") return lists.ancient ?? [];
      if (pool === "modern") return lists.modern ?? [];
      return [...(lists.ancient ?? []), ...(lists.modern ?? [])];
    };
    const wpChoices = equip
      ? LegacyPackages.toArray(item?.system?.weaponProficiencies?.choices)
        .map((choice, index) => {
          const count = Math.max(1, Number(choice?.count ?? 1) || 1);
          const allowed = new Set(LegacyPackages.toArray(choice?.allowedKeys).filter(Boolean));
          const options = wpPool(allowed.size ? "any" : choice?.pool)
            .filter(wp => !allowed.size || allowed.has(wp.key))
            .filter(wp => !usedWps.has(wp.key))
            .map(wp => ({ key: wp.key, name: wp.name, field: `wp.${index}.${wp.key}` }));
          return { index, count, label: choice?.label || "W.P. of choice", options };
        })
        .filter(choice => choice.options.length)
      : [];

    const usedKeys = LegacyPackages.usedSkillKeys(sys);
    if (equip) {
      for (const row of LegacyPackages.fixedSkillRows(item, {}, { level, usedKeys, defaultNative: nativeDefault })) {
        if (!row.custom && row.key && !LegacyPackages.skillDefinition(row.key)?.repeatable) usedKeys.add(row.key);
      }
    }
    const skillChoices = status
      .filter(entry => entry.remaining > 0)
      .map(entry => {
        const options = LegacyPackages.choiceOptions(entry.rule, { usedKeys, usedWps });
        const grouped = new Map();
        for (const option of options) {
          const slots = option.kind === "skill" && option.specialization && option.repeatable ? Math.min(4, Math.max(1, entry.remaining)) : 1;
          for (let slot = 0; slot < slots; slot += 1) {
            const id = LegacyPackageWizard._optionId(option.kind, option.key, slot);
            const decorated = {
              ...option,
              id,
              slot,
              field: `pick.${entry.index}.${id}`,
              specField: option.specialization ? `pickSpec.${entry.index}.${id}` : "",
              spec: !!option.specialization,
              specPlaceholder: option.specializationLabel === "Literacy" ? "Written language" : "Language",
              displayName: slots > 1 ? `${option.name} #${slot + 1}` : option.name,
              meta: option.kind === "wp"
                ? (option.cost > 1 ? `${option.cost} picks` : "")
                : [LegacyPackageWizard._skillMeta(option.base, option.perLvl, option.bonus), option.cost > 1 ? `${option.cost} picks` : ""].filter(Boolean).join(" · "),
              search: `${option.name} ${option.group}`.toLowerCase()
            };
            if (!grouped.has(option.group)) grouped.set(option.group, []);
            grouped.get(option.group).push(decorated);
          }
        }
        const groupBonus = new Map(entry.rule.allowedGroups.map(group => [group.group, group.bonus]));
        const groups = [...grouped.entries()].map(([name, groupOptions]) => ({
          name,
          bonusLabel: groupBonus.get(name) ? `+${groupBonus.get(name)}%` : "",
          options: groupOptions
        }));
        return {
          index: entry.index,
          label: entry.rule.label || (entry.rule.category === "secondary" ? "Secondary Skills" : "O.C.C. Related Skills"),
          categoryLabel: categories[entry.rule.category] ?? entry.rule.category,
          remaining: entry.remaining,
          used: entry.used,
          budget: entry.budget,
          bonusNote: entry.rule.category === "secondary"
            ? "Secondary Skills get no O.C.C. bonus."
            : (entry.rule.bonus ? `+${entry.rule.bonus}% to every pick.` : ""),
          openGroups: groups.length <= 3,
          hthLinked: !!hth && hth.choiceIndex === String(entry.index),
          groups,
          optionCount: options.length
        };
      });

    return {
      mode,
      equip,
      level,
      typeLabel,
      itemId: item?.id,
      itemName: item?.name,
      itemImg: item?.img,
      title: equip ? `Take ${item?.name}` : `${item?.name}: Skill Choices`,
      intro: equip
        ? `Make this ${typeLabel}'s choices. Fixed skills, bonuses and abilities are added automatically. Picks left unspent stay available from the Skills tab.`
        : `Spend the skill picks available at level ${level}. Picks left unspent stay available.`,
      hth,
      specSkills,
      attributeChoices,
      wpChoices,
      skillChoices,
      choiceRules
    };
  }

  static _skillMeta(base, perLvl, bonus) {
    const parts = [];
    if (Number(base) || Number(perLvl)) parts.push(`${Number(base) || 0}% +${Number(perLvl) || 0}%/lvl`);
    if (Number(bonus)) parts.push(`+${Number(bonus)}%`);
    return parts.join(" · ");
  }

  // ---------------------------------------------------------------- plan

  /** Turn collected form values into a plan, with validation errors. */
  static planFromValues(values = {}, context = {}) {
    const errors = [];
    const plan = { hth: null, specs: {}, attributeChoices: [], wp: {}, picks: [], trades: [] };

    if (context.hth) {
      const chosen = context.hth.options.find(option => option.value === values.hth) ?? context.hth.options[0];
      plan.hth = { type: chosen.value, cost: chosen.cost, choiceIndex: context.hth.choiceIndex === "" ? null : Number(context.hth.choiceIndex), label: chosen.label };
    }

    for (const row of context.specSkills ?? []) {
      plan.specs[row.index] = row.inputs.map(input => String(values[input.name] ?? "").trim());
    }

    for (const choice of context.attributeChoices ?? []) {
      const key = values[choice.name];
      if (!key) continue;
      plan.attributeChoices.push({ index: choice.index, key, formula: choice.formula, label: choice.label });
    }

    for (const choice of context.wpChoices ?? []) {
      const chosen = choice.options.filter(option => values[option.field]);
      if (chosen.length > choice.count) errors.push(`${choice.label}: choose at most ${choice.count}.`);
      for (const option of chosen) plan.wp[option.key] = true;
    }

    for (const choice of context.skillChoices ?? []) {
      let spent = 0;
      for (const group of choice.groups) {
        for (const option of group.options) {
          if (!values[option.field]) continue;
          const spec = option.spec ? String(values[option.specField] ?? "").trim() : "";
          if (option.spec && !spec) {
            errors.push(`${choice.label}: name the language for ${option.displayName}.`);
            continue;
          }
          spent += option.cost;
          plan.picks.push({ choiceIndex: choice.index, kind: option.kind, key: option.key, spec, cost: option.cost, bonus: option.bonus, name: option.name });
        }
      }
      const tradeCost = Math.max(0, Math.trunc(Number(values[`trade.${choice.index}.cost`] ?? 0) || 0));
      const tradeLabel = String(values[`trade.${choice.index}.label`] ?? "").trim();
      if (tradeCost) {
        if (!tradeLabel) errors.push(`${choice.label}: describe what the ${tradeCost} traded pick${tradeCost === 1 ? " is" : "s are"} spent on.`);
        else plan.trades.push({ choiceIndex: choice.index, kind: "custom", label: tradeLabel, cost: tradeCost });
        spent += tradeCost;
      }
      if (plan.hth && plan.hth.cost && plan.hth.choiceIndex === choice.index) spent += plan.hth.cost;
      if (spent > choice.remaining) errors.push(`${choice.label}: ${spent} picks chosen but only ${choice.remaining} available.`);
    }

    if (plan.hth?.cost && plan.hth.choiceIndex !== null) {
      const linked = (context.skillChoices ?? []).find(choice => choice.index === plan.hth.choiceIndex);
      if (!linked) errors.push(`${plan.hth.label} needs ${plan.hth.cost} O.C.C. Related pick${plan.hth.cost === 1 ? "" : "s"}, but none are left.`);
    }
    return { plan, errors };
  }

  /** Actor and item updates for a plan. Equip-only parts (fixed skills,
   *  Hand to Hand, physical type, psionics) are skipped in "choices" mode. */
  static planUpdates({ sys = {}, item, items = [], plan, mode = "equip" }) {
    const level = Math.max(1, Number(sys.level ?? 1) || 1);
    const equip = mode === "equip";
    const actorUpdate = {};
    const itemUpdate = {};
    const currentSkills = foundry.utils.deepClone(LegacyPackages.toArray(sys.skills?.list));
    const usedKeys = LegacyPackages.usedSkillKeys(sys);
    const addedSkills = [];

    if (equip) {
      const race = LegacyPackages.equippedPackages(sys, items).find(pkg => pkg.type === "race" || pkg.system?.rccAsRace);
      const nativeDefault = String((item.type === "race" ? item.system?.nativeLanguage : race?.system?.nativeLanguage) ?? "").trim();
      addedSkills.push(...LegacyPackages.fixedSkillRows(item, plan.specs ?? {}, { level: 1, usedKeys, defaultNative: nativeDefault }));
      for (const row of addedSkills) {
        if (!row.custom && row.key) usedKeys.add(row.key);
        usedKeys.add(`name:${row.name.toLowerCase()}`);
      }
    }

    const choices = LegacyPackages.toArray(item.system?.skillChoices).map(LegacyPackages.normalizeChoice);
    const trades = foundry.utils.deepClone(LegacyPackages.toArray(sys.advancement?.trades));
    const wpSelected = { ...(sys.weaponProficiencies?.selected ?? {}) };
    let wpChanged = false;

    for (const pick of plan.picks ?? []) {
      const rule = choices[pick.choiceIndex];
      if (!rule) continue;
      if (pick.kind === "wp") {
        wpSelected[pick.key] = true;
        wpChanged = true;
        trades.push({ sourceItemId: item.id, choiceIndex: pick.choiceIndex, kind: "wp", key: pick.key, label: pick.name, cost: pick.cost, level });
        continue;
      }
      const definition = LegacyPackages.skillDefinition(pick.key);
      if (!definition) continue;
      const name = LegacyPackages.specializationName(definition, pick.spec, definition.name);
      if (usedKeys.has(`name:${name.toLowerCase()}`)) continue;
      usedKeys.add(`name:${name.toLowerCase()}`);
      if (!definition.repeatable) usedKeys.add(definition.key);
      addedSkills.push({
        key: definition.key,
        name,
        base: definition.base,
        perLvl: definition.perLvl,
        misc: 0,
        occBonus: rule.category === "secondary" ? 0 : Number(pick.bonus) || 0,
        category: rule.category,
        custom: false,
        learnedAtLevel: level,
        sourceItemId: item.id,
        sourceChoiceIndex: pick.choiceIndex,
        ...(pick.cost > 1 ? { choiceCost: pick.cost } : {}),
        statBonuses: foundry.utils.deepClone(definition.statBonuses ?? {})
      });
    }

    for (const trade of plan.trades ?? []) {
      trades.push({ sourceItemId: item.id, choiceIndex: trade.choiceIndex, kind: trade.kind, label: trade.label, cost: trade.cost, level });
    }

    if (equip && plan.hth) {
      actorUpdate["system.handToHand.type"] = plan.hth.type;
      if (plan.hth.cost) {
        trades.push({ sourceItemId: item.id, choiceIndex: plan.hth.choiceIndex, kind: "hth", key: plan.hth.type, label: `Hand to Hand: ${plan.hth.label}`, cost: plan.hth.cost, level: 1 });
      }
    }

    if (equip) {
      for (const [key, value] of Object.entries(plan.wp ?? {})) {
        if (!value) continue;
        wpSelected[key] = true;
        wpChanged = true;
      }
      const physical = item.system?.physical ?? {};
      const types = CONFIG.EE?.LEGACY_PHYSICAL_TYPES ?? {};
      if (physical.strengthType && Object.prototype.hasOwnProperty.call(types, physical.strengthType)) actorUpdate["system.handToHand.strengthType"] = physical.strengthType;
      if (physical.enduranceType && Object.prototype.hasOwnProperty.call(types, physical.enduranceType)) actorUpdate["system.handToHand.enduranceType"] = physical.enduranceType;
      const psionicLevel = item.system?.psionicLevel;
      if (psionicLevel && Object.prototype.hasOwnProperty.call(CONFIG.EE?.PSIONIC_LEVELS ?? {}, psionicLevel)) actorUpdate["system.psionicLevel"] = psionicLevel;
    }

    if (addedSkills.length) actorUpdate["system.skills.list"] = [...currentSkills, ...addedSkills];
    if (wpChanged) actorUpdate["system.weaponProficiencies.selected"] = wpSelected;
    if (trades.length !== LegacyPackages.toArray(sys.advancement?.trades).length) actorUpdate["system.advancement.trades"] = trades;

    if (plan.attributeChoices?.length) {
      const stored = foundry.utils.deepClone(LegacyPackages.toArray(item.system?.attributeChoices));
      for (const pick of plan.attributeChoices) {
        if (!stored[pick.index]) continue;
        const flat = LegacyPackages.isFlatNumber(pick.formula);
        const rolled = plan.attributeRolls?.[pick.index];
        stored[pick.index] = {
          ...stored[pick.index],
          chosen: pick.key,
          value: flat ? Number(pick.formula) : (Number(rolled) || 0),
          rolled: flat || rolled !== undefined
        };
      }
      itemUpdate["system.attributeChoices"] = stored;
    }

    return { actorUpdate, itemUpdate, addedSkills };
  }
}
