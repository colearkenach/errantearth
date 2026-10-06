import { collectTokenHudActions, rollCombatAction, rollWeaponAction } from "../rolls/weapon-rolls.js";

const REQUIRED_CORE_MODULE_VERSION = "2.1";

function formatBonus(value) {
  const numeric = Number(value ?? 0) || 0;
  return numeric ? `${numeric >= 0 ? "+" : ""}${numeric}` : "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function defaults() {
  return {
    layout: [
      {
        nestId: "ee-weapons",
        id: "ee-weapons",
        name: "Weapons",
        settings: { grid: true, showTitle: true },
        groups: [
          { nestId: "ee-weapons_ee-weapons", id: "ee-weapons", name: "Weapons", type: "system" }
        ]
      },
      {
        nestId: "ee-combat",
        id: "ee-combat",
        name: "Combat",
        settings: { grid: true, showTitle: true },
        groups: [
          { nestId: "ee-combat_ee-combat", id: "ee-combat", name: "Combat", type: "system" }
        ]
      }
    ],
    groups: [
      { id: "ee-weapons", name: "Weapons", type: "system" },
      { id: "ee-combat", name: "Combat", type: "system" }
    ]
  };
}

export function registerErrantEarthTokenActionHud() {
  Hooks.once("tokenActionHudCoreApiReady", coreModule => {
    const CoreActionHandler = coreModule.api.ActionHandler;
    const CoreRollHandler = coreModule.api.RollHandler;
    const CoreSystemManager = coreModule.api.SystemManager;

    class ErrantEarthTahActionHandler extends CoreActionHandler {
      async buildSystemActions() {
        if (!this.actor || this.actor.type !== "character") return;
        const { weapons, combat } = collectTokenHudActions(this.actor);

        const weaponActions = weapons.map(weapon => {
          const safeName = escapeHtml(weapon.name);
          return {
            id: `ee-weapon-${weapon.source}-${weapon.key}`,
            name: weapon.name,
            fullName: weapon.name,
            listName: weapon.name,
            img: weapon.img,
            info1: { text: formatBonus(weapon.strike), title: "Strike bonus" },
            info2: { text: weapon.damageScale, title: "Damage scale" },
            tooltip: {
              content: `<strong>${safeName}</strong><br>${weapon.rangeLabel ?? (weapon.isRanged ? "Ranged Strike" : "Melee Strike")} TN ${weapon.defaultTn}+<br>Click to choose attack, damage, or both.`
            },
            encodedValue: ["eeWeapon", weapon.source, weapon.key].join("|"),
            actionTypeId: "eeWeapon",
            actionId: `${weapon.source}:${weapon.key}`
          };
        });
        this.addActions(weaponActions, { id: "ee-weapons", type: "system" });

        const combatActions = combat.map(action => ({
          id: `ee-combat-${action.id}`,
          name: action.name,
          fullName: action.name,
          listName: action.name,
          img: action.img,
          info1: { text: formatBonus(action.bonus ?? action.target), title: action.target ? "Target" : "Bonus" },
          tooltip: { content: `<strong>${action.name}</strong>` },
          encodedValue: ["eeCombat", action.id].join("|"),
          actionTypeId: "eeCombat",
          actionId: action.id
        }));
        this.addActions(combatActions, { id: "ee-combat", type: "system" });
      }
    }

    class ErrantEarthTahRollHandler extends CoreRollHandler {
      async handleActionClick(event, encodedValue) {
        const parts = String(encodedValue ?? "").split("|");
        const actionType = parts.shift();
        const actorTargets = this.actor
          ? [this.actor]
          : (canvas.tokens?.controlled ?? []).map(token => token.actor).filter(actor => actor?.type === "character");

        for (const actor of actorTargets) {
          if (actionType === "eeWeapon") {
            const [source, key] = parts;
            await rollWeaponAction(actor, source, key);
          } else if (actionType === "eeCombat") {
            await rollCombatAction(actor, parts[0]);
          } else {
            super.throwInvalidValueErr(encodedValue);
          }
        }
      }
    }

    class ErrantEarthTahSystemManager extends CoreSystemManager {
      getActionHandler() {
        return new ErrantEarthTahActionHandler();
      }

      getAvailableRollHandlers() {
        return { core: "Errant Earth" };
      }

      getRollHandler() {
        return new ErrantEarthTahRollHandler();
      }

      registerSettings() {}

      async registerDefaults() {
        return defaults();
      }
    }

    Hooks.call("tokenActionHudSystemReady", {
      id: "errantearth",
      api: {
        requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
        SystemManager: ErrantEarthTahSystemManager
      }
    });
  });
}
