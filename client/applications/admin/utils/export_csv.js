function exportCSV(url) {
  var linkNode = document.createElement('a');
  linkNode.href = url;
  linkNode.click();
  linkNode = null;
}

module.exports = exportCSV;
