/**
 * @PengJiyuan
 *
 * filter config data by module_config
 */

module.exports = (configs) => {
  /**
   * if link in routers is disable, disable the key too.
   */
  const linked = (name, mc) => {
    return configs.routers.some(r => {
      if(name === r.key && mc[r.link] === false) {
        return true;
      }
      return false;
    });
  };
  if (!HALO.configs.init) {
    const moduleConfig = JSON.parse(HALO.settings.module_config)[HALO.application.current_application];

    configs.modules.forEach((m) => {
      let positions = [];
      m.items.forEach((n, i) => {
        let hide = Object.keys(moduleConfig).some(s => n === s && moduleConfig[s] === false);
        if(hide || linked(n, moduleConfig)) {
          positions.push(i);
        }
      });
      positions.reverse().forEach(p => {
        m.items.splice(p, 1);
      });
    });
  }
  return configs;
};
