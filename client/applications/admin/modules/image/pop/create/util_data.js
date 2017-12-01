const __ = require('locale/client/admin.lang.json');

const untilData = {

  getFormatData: function() {

    let formatData = [{
      name: __.aki,
      key: 'aki',
      id: 'aki'
    }, {
      name: __.ami,
      key: 'ami',
      id: 'ami'
    }, {
      name: __.ari,
      key: 'ari',
      id: 'ari'
    }, {
      name: __.docker,
      key: 'docker',
      id: 'docker'
    }, {
      name: __.iso,
      key: 'iso',
      id: 'iso'
    }, {
      name: __.ova,
      key: 'ova',
      id: '5'
    }, {
      name: __.qcow2,
      key: 'qcow2',
      id: 'qcow2'
    }, {
      name: __.raw,
      key: 'raw',
      id: 'raw'
    }, {
      name: __.vdi,
      key: 'vdi',
      id: 'vdi'
    }, {
      name: __.vhd,
      key: 'vhd',
      id: 'vhd'
    }, {
      name: __.vmdk,
      key: 'vmdk',
      id: 'vmdk'
    }];

    return formatData;
  },

  getArchitectureData: function() {

    let architectureData = [{
      name: __.no_architecture,
      id: 'no'
    }, {
      name: 'i386 for a 32-bit',
      id: 'i386'
    }, {
      name: 'x86_64 for a 64-bit',
      id: 'x86_64'
    }];

    return architectureData;
  },

  getVisibility: function() {
    let visibilityData = [{
      name: __.public,
      id: 'public'
    }, {
      name: __.private,
      id: 'private'
    }];

    return visibilityData;
  },

  getResourceType: function() {

    let resourceType = [{
      name: __.url,
      id: 'url'
    }, {
      name: __.file,
      id: 'file'
    }];

    return resourceType;
  }

};

module.exports = untilData;
