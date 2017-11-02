/**
 * @PengJiyuan
 *
 * check if url path is valid
 */

const getMenuKeys = configs => {
  let menuKeys = [];
  let hideModules = configs.default_hide_modules;

  configs.modules.forEach((ele) => {
    ele.items.forEach((item) => {
      menuKeys.push(item);
    });
  });

  configs.routers.forEach(r => {
    if(!~hideModules.indexOf(r.link) && !~hideModules.indexOf(r.key)) {
      menuKeys.push(r.key);
    }
  });

  return menuKeys;
};

const isValidPath = (pathList, configs) => {
  let isValid = true;

  if (pathList.length > 1) {
    isValid = getMenuKeys(configs).some(ele => ele === pathList[1]);
  }

  return isValid;
};

module.exports = isValidPath;
