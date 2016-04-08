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
    if (config.tabs) {
      config.tabs.forEach((item) => {
        item.name = this.getLangValue(lang, item.name);
      });
    }
    if (config.btns) {
      config.btns.forEach((btn) => {
        if (btn.value) {
          btn.value = this.getLangValue(lang, btn.value);
          if (btn.dropdown) {
            btn.dropdown.items.forEach((item) => {
              item.items.forEach((subitem) => {
                subitem.title = this.getLangValue(lang, subitem.title);
              });
            });
          }
        }
      });
    }
    if (config.search) {
      if (config.search.placeholder) {
        config.search.placeholder = this.getLangValue(lang, config.search.placeholder);
      }
    }
    if (config.filter) {
      config.filter.forEach((elements) => {
        elements.items.forEach((ele) => {
          if (ele.type === 'input') {
            if (ele.placeholder) {
              ele.placeholder = this.getLangValue(lang, ele.placeholder);
            }
          } else if (ele.type === 'select') {
            if (ele.default) {
              ele.default = this.getLangValue(lang, ele.default);
            }
          }
        });
      });
    }
    if (config.table) {
      config.table.column.forEach((col) => {
        col.title = this.getLangValue(lang, col.title);
        if (col.filterAll) {
          col.filterAll = this.getLangValue(lang, col.filterAll);
        }
        if (col.filter) {
          col.filter.forEach((filter) => {
            filter.name = this.getLangValue(lang, filter.name);
          });
        }
      });
    }
    if (config.table.detail) {
      config.table.detail.tabs.forEach((tab) => {
        tab.name = this.getLangValue(lang, tab.name);
      });
    }
  }
};
