/**
 * @func: convert obj value into specific language
 */
module.exports = {
  getLangValue(lang, obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
      let strs = '';
      obj.forEach((str) => {
        strs += lang[str];
      });

      return strs;
    } else {
      return obj;
    }
  },

  getSubItem(lang, children) {
    children.forEach((child) => {
      child.items.forEach((childItem) => {
        childItem.title = this.getLangValue(lang, childItem.title);
        if (childItem.children) {
          this.getSubItem(lang, childItem.children);
        }
      });
    });
  },

  convertLang(lang, config) {
    if (config.tabs) {
      config.tabs.forEach((item) => {
        item.name = this.getLangValue(lang, item.name);
      });
    }
    if (config.search && config.search.placeholder) {
      config.search.placeholder = this.getLangValue(lang, config.search.placeholder);
    }
    if (config.btns) {
      config.btns.forEach((btn) => {
        if (btn.value) {
          btn.value = this.getLangValue(lang, btn.value);
          if (btn.dropdown) {
            btn.dropdown.items.forEach((item) => {
              item.items.forEach((subitem) => {
                subitem.title = this.getLangValue(lang, subitem.title);
                if (subitem.children) {
                  this.getSubItem(lang, subitem.children);
                }
              });
            });
          }
        }
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

    if (config.btn) {
      config.btn.forEach((b) => {
        if (b.value) {
          b.value = this.getLangValue(lang, b.value);
        }
      });
    }
  }
};
