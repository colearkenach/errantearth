export class ErrantEarthItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["errantearth", "sheet", "item"],
      template: "systems/errantearth/templates/item/item-sheet.html",
      width: 560,
      height: 540,
      submitOnChange: true,
      closeOnSubmit: false,
      submitOnClose: true,
      resizable: true
    });
  }

  async getData(options) {
    const ctx = await super.getData(options);
    ctx.config = CONFIG.EE ?? {};
    ctx.system = this.item.system;
    return ctx;
  }

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    return this.document.update(expanded);
  }
}
