const fetch = require('client/applications/dashboard/cores/fetch');

module.exports = {
  listBuckets: function() {
    return fetch.get({
      url: '/proxy-swift/?format=json'
    }).then(function(data) {
      data.forEach(b => {
        b.type = 'bucket';
        b.id = b.name;
      });

      return data;
    });
  },
  listBucketObjects: function(params) {
    return this.listObjects(params).then(res => {
      let objs = res.filter(ele => {
        return true;
      });
      return objs;
    });
  },
  listObjects: function(params) {
    return fetch.get({
      url: '/proxy-swift/' + params.Bucket + '?format=json'
    }).then(function(res) {
      let len, name;
      res.forEach(obj => {
        obj.id = obj.hash + Math.random();
        name = obj.name.split('/');
        len = name.length;
        if (name[len - 1]) {
          obj.type = 'object';
        } else {
          obj.type = 'folder';
        }
      });
      return res;
    });
  },
  downloadItem: function(item, breadcrumb) {
    let bread = breadcrumb.join('/');
    let url = '/proxy-swift/' + bread + '/' + item.name;
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
  listFolderObjects: function(params, folder) {
    return this.listObjects(params).then(res => {
      res.forEach(ele => {
        ele.key = ele.id.slice(params.Prefix.length);
      });

      return res;
    });
  },
  createBucket: function(params) {
    let headervalue;
    if(params.type === 'public') {
      headervalue = '.r:*';
    } else if (params.type === 'private') {
      headervalue = HALO.user.projectId + ':*';
    }
    return fetch.put({
      url: '/proxy-swift/' + params.Bucket,
      headers: {
        'X-Container-Read': headervalue
      }
    });
  },
  deleteBucket: function(data) {
    return fetch.delete({
      url: '/proxy-swift/' + data.Bucket
    });
  },
  deleteFolder: function(data) {
    return fetch.post({
      dataType: '',
      url: '/proxy-swift?bulk-delete',
      data: data,
      processData: false,
      contentType: 'text/plain'
    });
  },
  createFolder: function(data) {
    return fetch.put({
      url: '/proxy-swift/' + data.Bucket + '/' + data.Name + '/'
    });
  }
};
