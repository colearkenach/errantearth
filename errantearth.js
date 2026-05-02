import { ErrantEarthCharacterSheet } from "./src/actor/character-sheet.js";

Hooks.once("init", async () => {
  CONFIG.Actor.types = ["character"];

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("errantearth", ErrantEarthCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Errant Earth Character Sheet"
  });

  await loadTemplates([
    "systems/errantearth/templates/actor/character-sheet.html"
  ]);

  Handlebars.registerHelper("ee_default", (val, fallback) =>
    (val === undefined || val === null || val === "") ? fallback : val
  );
  Handlebars.registerHelper("eq", (a, b) => a === b);
});
