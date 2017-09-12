const storage = require('client/applications/dashboard/cores/storage');
const fetch = require('client/applications/dashboard/cores/fetch');
const RSVP = require('rsvp');

module.exports = {
  getList: function(forced) {
    return storage.getList(['templatelist'], forced).then(function(data) {
      data.templatelist.forEach(ele => {
        ele.last_modified = ele.last_modified.split('.')[0] + 'Z';
      });
      return data.templatelist;
    });
  },
  deleteFiles: function(items) {
    let deferredList = [];
    items.forEach((item) => {
      deferredList.push(fetch.delete({
        url: '/proxy-swift/v1/AUTH_' + HALO.configs.adminProjectId + '/' + HALO.user.projectId + '_template' + '/' + item.name
      }));
    });
    return RSVP.all(deferredList);
  },
  downloadItem: function(item) {
    let url = '/proxy-swift/v1/AUTH_' + HALO.configs.adminProjectId + '/' + HALO.user.projectId + '_template' + '/' + item.name;
    function addLink() {
      let linkNode = document.createElement('a');
      if (linkNode.download !== undefined) {
        linkNode.download = item.name;
      }
      linkNode.href = url;
      linkNode.click();
      return 1;
    }
    return new Promise((resolve, reject) => {
      resolve(addLink());
    });
  },
  initContainer: function() {
    return fetch.put({
      url: '/proxy-swift/init-container'
    });
  }
};
