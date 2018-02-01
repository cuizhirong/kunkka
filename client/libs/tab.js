/**
 * @PengJiyuan
 *
 * filter field tabs in config.json by module_config.
 */

module.exports = (configs) => {
  let shows = [];
  // server render init (can not get var HALO)
  if (!HALO.configs.init) {
    const cur = HALO.application.current_application;
    const moduleConfig = JSON.parse(HALO.settings.module_config)[cur];
    Object.keys(moduleConfig).forEach(m => {
      if(moduleConfig[m].show) {
        shows.push(m);
      }
    });
    configs.tabs = configs.tabs ? configs.tabs.filter(t => ~shows.indexOf(t.key)) : configs.tabs;
  }
  return configs;
};
