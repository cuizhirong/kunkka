/**
 * @func: convert obj value into specific language
 */
module.exports = {
  getLangValue(lang, obj) {
    var strs = '';
    obj.map((str) => {
      strs += lang[str];
    });

    return strs;
  },

  convertLang(lang, config) {
    config.title && (config.title = this.getLangValue(lang, config.title));
    config.btns && (config.btns.forEach((btn) => {
      btn.value && (btn.value = this.getLangValue(lang, btn.value));
      btn.dropdown && (btn.dropdown.items.forEach((item) => {
        item.items.forEach((subitem) => {
          subitem.title = this.getLangValue(lang, subitem.title);
        });
      }));
    }));
    config.table && (config.table.column.forEach((col) => {
      col.title = this.getLangValue(lang, col.title);
      col.filter && col.filter.forEach((filter) => {
        filter.name = this.getLangValue(lang, filter.name);
      });
    }));
  }
};
