/**
 * 下载文件
 * 兼容火狐
 * @return: Promise
 */
const Promise = require('rsvp').Promise;

function download(url) {
  try {
    let linkNode = document.createElement('a');
    linkNode.href = url;
    // 解决firefox不支持a.click()的问题。
    document.body.appendChild(linkNode);
    linkNode.click();
    document.body.removeChild(linkNode);

    return 'download success!';
  } catch(e) {
    return '';
  }
}

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    resolve(download(url));
  });
};
