/**
 * @PengJiyuan
 *
 * filter config data by module_config
 */

module.exports = (configs) => {

  const filterMenu = (modules) => {
    modules.forEach((m) => {
      m.items = m.items.filter((i) => {
        let b = configs.routers.some((n) => {
          if (n.key === i) {
            return true;
          }
          return false;
        });
        let h = configs.default_hide_modules ? configs.default_hide_modules.some((hide) => {
          if (hide === i) {
            return true;
          }
          return false;
        }) : null;
        return !b && !h;
      });
    });
    return modules;
  };

  // server render init (can not get var HALO)
  if (!HALO.configs.init) {
    const moduleConfig = JSON.parse(HALO.settings.module_config)[HALO.application.current_application];
    configs.default_hide_modules = configs.default_hide_modules || [];
    Object.keys(moduleConfig).forEach(m => {
      if(!moduleConfig[m] && !~configs.default_hide_modules.indexOf(m)) {
        configs.default_hide_modules.push(m);
      }
    });
  }

  configs.modules = filterMenu(configs.modules);

  // check if defalut_module is hidden
  configs.default_module = ~configs.default_hide_modules.indexOf(configs.default_module) ?
    configs.modules.filter(m => m.items && m.items.length > 0)[0].items[0] : configs.default_module;


  return configs;
};
