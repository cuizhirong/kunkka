/**
 * 返回镜像操作系统的通用名字
 * 首先根据 os_distro 字段判断
 * 之后根据 image_label 判断
 */
function getOsCommonName(image) {
  let osCommonName = '';
  if(image) {
    if(image.os_distro) {
      osCommonName = image.os_distro.toLowerCase();
    } else if(image.image_label) {
      osCommonName = image.image_label.toLowerCase();
    }
  }
  return osCommonName;
}

module.exports = getOsCommonName;
