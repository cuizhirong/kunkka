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
    if (config.table) {
      config.table.column.forEach((col) => {
        col.title = this.getLangValue(lang, col.title);
      });
    }
    if (config.table.detail) {
      config.table.detail.tabs.forEach((tab) => {
        tab.name = this.getLangValue(lang, tab.name);
      });

      if(config.table.detail.table) {
        config.table.detail.table.column.forEach((col) => {
          col.title = this.getLangValue(lang, col.title);
        });
      }
    }
  }
};
