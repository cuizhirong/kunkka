const __ = require('locale/client/dashboard.lang.json');
let constant = {
  imageTypes: [{
    value: __.system_image,
    key: 'images'
  }, {
    value: __.instance_snapshot,
    key: 'snapshot'
  }, {
    value: __.volume,
    key: 'bootableVolume'
  }, {
    value: __.volume + __.snapshot,
    key: 'volumeSnapshot'
  }],

  credentials: [{
    key: 'keypair',
    value: __.keypair
  }, {
    key: 'psw',
    value: __.password
  }],

  switchData: [{
    value: __.yes,
    key: 'yes'
  }, {
    value: __.no,
    key: 'no'
  }],

  switchVolumeData: [{
    value: __.yes,
    key: 'y'
  }, {
    value: __.no,
    key: 'n'
  }],

  stepData: [{
    value: __.image_selection,
    key: 'image_selection'
  }, {
    value: __.flavor_selection,
    key: 'flavor_selection'
  }, {
    value: __.network_config,
    key: 'network_config'
  }, {
    value: __.basic_properties,
    key: 'basic_properties'
  }, {
    value: __.more_settings,
    key: 'more_setting'
  }],

  tableColume: [{
    value: __.instance_name,
    key: 'name'
  }, {
    value: __.image,
    key: 'image'
  }, {
    value: __.flavor,
    key: 'flavor'
  }, {
    value: __.network_config,
    key: 'network'
  }, {
    value: __.security_group,
    key: 'securityGroup'
  }, {
    value: __.credentials,
    key: 'credential'
  }, {
    value: __.number,
    key: 'number'
  }],

  networkColume: [{
    value: __.id,
    key: 'id'
  }, {
    value: __.select_physical_network,
    key: 'physical_network'
  }, {
    value: __.network + __.type,
    key: 'network_type'
  }, {
    value: __.vlan_id,
    key: 'vlan_id'
  }, {
    value: __.status,
    key: 'status'
  }, {
    value: __.shared,
    key: 'shared'
  }],

  portColume: [{
    value: __.id,
    key: 'id'
  }, {
    value: __.ip_address,
    key: 'ip_address'
  }, {
    value: 'Mac ' + __.address,
    key: 'mac_address'
  }, {
    value: __.subnet,
    key: 'subnet'
  }, {
    value: __.floatingip,
    key: 'floatingip'
  }, {
    value: __.status,
    key: 'status'
  }]
};

module.exports = constant;
