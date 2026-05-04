export class ErrantEarthItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["errantearth", "sheet", "item"],
      template: "systems/errantearth/templates/item/item-sheet.html",
      width: 520,
      height: 420
    });
  }

  async getData(options) {
    const ctx = await super.getData(options);
    ctx.config = CONFIG.EE ?? {};
    return ctx;
  }
}
