/**
 * @PengJiyuan
 *
 * filter field tabs in config.json by module_config.
 */
// const moduleConfig = JSON.parse(HALO.settings.module_config)[HALO.application.current_application];

module.exports = (configs) => {
  // let tabs = configs.tabs;
  // if(moduleConfig[tabs[0].key]) {}
  return configs;
};
