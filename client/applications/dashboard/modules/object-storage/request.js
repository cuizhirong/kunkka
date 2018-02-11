const fetch = require('client/applications/dashboard/cores/fetch');
const download = require('client/utils/download');

module.exports = {
  listBuckets: function() {
    return fetch.get({
      url: '/proxy-swift/?format=json',
      needHeader: true
    }).then(function(data) {
      data.body.forEach(b => {
        b.type = 'bucket';
        b.id = b.name;
      });
      return data.body;
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
      url: '/proxy-swift/' + params.Bucket + '?format=json',
      needHeader: true
    }).then(function(data) {
      let len, name;
      data.body.forEach(obj => {
        obj.id = obj.hash + Math.random();
        name = obj.name.split('/');
        len = name.length;
        obj.headerType = data.that.getResponseHeader('x-container-read');
        if (name[len - 1]) {
          obj.type = 'object';
        } else {
          obj.type = 'folder';
        }
      });
      return data.body;
    });
  },

  containerHeaders: function(item) {
    let resultArr = [], obj = {}, resultkey, resultvalue, resultkeyArr = [], resultvalueArr = [], metadataobj = {}, arr = [];
    return fetch.head({
      url: '/proxy-swift/' + item.name + '?format=json',
      needHeader: true
    }).then(function(data) {
      let headersmetaArr = data.that.getAllResponseHeaders().split('\n');
      headersmetaArr.forEach(res => {
        if(res.indexOf('x-container-meta') !== -1) {
          resultArr = res.split(':');
          resultkey = resultArr[0];
          resultkeyArr.push(resultkey);
          obj.metahead = resultkeyArr;
          resultvalue = (resultArr[1]).trim();
          resultvalueArr.push(resultvalue);
          obj.metavalue = resultvalueArr;
          arr.push(metadataobj[resultkey] = resultvalue);

        }
      });
      return metadataobj;
    });
  },

  containerPermissionHeaders: function(item) {
    return fetch.head({
      url: '/proxy-swift/' + item.name + '?format=json',
      needHeader: true
    }).then(function(data) {
      let permissionobj = {
        'x-container-read': data.that.getResponseHeader('x-container-read'),
        'x-container-write': data.that.getResponseHeader('x-container-write')
      };
      return permissionobj;
    });
  },

  objectMetaDetas: function(item, breadcrumb) {
    let resultArr, resultkey, resultkeyArr = [], resultvalue, resultvalueArr = [], metadataobj = {}, arr = [];
    return fetch.head({
      url: '/proxy-swift/' + breadcrumb + '/' + item.name,
      needHeader: true
    }).then(function(obj) {
      let headersmetaArr = obj.headers.split('\n');
      headersmetaArr.map(res => {
        if(res.indexOf('x-object-meta') !== -1) {
          resultArr = res.split(':');
          resultkey = resultArr[0];
          resultkeyArr.push(resultkey);
          obj.metahead = resultkeyArr;
          resultvalue = (resultArr[1]).trim();
          resultvalueArr.push(resultvalue);
          obj.metavalue = resultvalueArr;
          arr.push(metadataobj[resultkey] = resultvalue);
        } else {
          resultArr = res.split(':');
          resultkey = resultArr[0];
          resultvalue = resultArr[1];
          arr.push(metadataobj[resultkey] = resultvalue);
        }
      });
      return metadataobj;
    });
  },

  downloadItem: function(item, breadcrumb) {
    let bread = breadcrumb.join('/');
    let url = '/proxy-swift/' + bread + '/' + item.name;
    return download(url, 'image', item.name);
  },

  pasteObject: function(item, bread, url, copyName) {
    return fetch.copy({
      url: '/proxy-swift/' + url,
      headers: {
        'Destination': bread + '/' + encodeURI(copyName)
      }
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

  createBucket: function(params, metaArr) {
    let headervalue;
    let obj = {};
    if(params.type === 'public') {
      headervalue = '.r:*';
    } else {
      headervalue = HALO.user.projectId + ':*';
    }

    obj = {
      url: '/proxy-swift/' + params.Bucket,
      headers: {
        'X-Container-Read': headervalue,
        'X-Container-Write': headervalue
      }
    };
    metaArr.forEach(item => {
      obj.headers[item] = params[item];
    });

    return fetch.put(obj);
  },
  modifyBucket: function(params, metaArr) {
    let obj = {};
    obj = {
      url: '/proxy-swift/' + params.Bucket + '?format=json',
      headers: {}
    };

    metaArr.forEach(item => {
      obj.headers[item] = params[item];
    });
    return fetch.post(obj);
  },

  aclBuckets: function(bucket, metaArr) {
    let readheader = [];
    let writeheader = [];
    metaArr.forEach(item => {
      let acl = item.projectIdKey;
      if(item.resValue === '1') {
        readheader.push(acl);
        writeheader.push(acl);
      } else if(item.resValue === '2') {
        readheader.push(acl);
      } else if(item.resValue === '3') {
        writeheader.push(acl);
      } else if(item.resValue === 'read.r:*') {
        readheader.push('.r:*');
      } else if(item.resValue === 'write.r:*') {
        writeheader.push('.r:*');
      }
    });
    return fetch.post({
      url: '/proxy-swift/' + bucket,
      headers: {
        'X-Container-Read': readheader.join(','),
        'X-Container-Write': writeheader.join(',')
      }
    });
  },

  putObjMetaData: function(params, breadcrumb, file, metaArr) {
    let obj = {
      url: '/proxy-swift/' + breadcrumb + '/' + file.name,
      headers: {}
    };
    metaArr.forEach(item => {
      obj.headers[item] = params[item];
    });
    return fetch.post(obj);
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
  },

  expiresTime: function(file, breadcrumb, time) {
    let obj = {
      url: '/proxy-swift/' + breadcrumb + '/' + file.name,
      headers: {
        'X-Delete-At': time
      },
      contentType: 'application/x-www-form-urlencoded'
    };
    return fetch.post(obj);
  },

  sendKey: function(obj, breadcrumb, data) {
    return fetch.post({
      url: '/proxy-swift/',
      headers: {
        'x-account-meta-temp-url-key': data
      }
    });
  },
  accountHeaders: function() {
    return fetch.head({
      url: '/proxy-swift/',
      needHeader: true
    }).then((data) => {
      let secretKey = data.that.getResponseHeader('x-account-meta-temp-url-key');
      return secretKey;
    });
  },
  objectexpireTime: function(item, breadcrumb) {
    return fetch.head({
      url: '/proxy-swift/' + breadcrumb + '/' + item.name,
      needHeader: true
    }).then((data)=> {
      let deleteTime = data.that.getResponseHeader('x-delete-at');
      return deleteTime;
    });
  }
};
