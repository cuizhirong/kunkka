const utils = require('../../utils');
const request = require('../../request');

function getInstanceResource(instance) {

  let item = [{
    name: utils.getMetricName('cpu_util'),
    metricType: 'cpu_util',
    key: 'cpu_util',
    resourceType: 'instance',
    resource: instance
  }, {
    name: utils.getMetricName('memory.usage'),
    metricType: 'memory.usage',
    key: 'memory.usage',
    resourceType: 'instance',
    resource: instance
  }, {
    name: utils.getMetricName('disk.read.bytes.rate'),
    metricType: 'disk.read.bytes.rate',
    key: 'disk.read.bytes.rate',
    resourceType: 'instance',
    resource: instance
  }, {
    name: utils.getMetricName('disk.write.bytes.rate'),
    metricType: 'disk.write.bytes.rate',
    key: 'disk.write.bytes.rate',
    resourceType: 'instance',
    resource: instance
  }];

  const addresses = instance.addresses;
  for (let key in addresses) {
    addresses[key].filter((addr) => addr['OS-EXT-IPS:type'] === 'fixed').forEach((port) => {

      item.push({
        name: port.addr + ' ' + utils.getMetricName('network.incoming.bytes.rate'),
        metricType: 'network.incoming.bytes.rate',
        key: port.addr + 'network.incoming.bytes.rate',
        resourceType: 'instance_network_interface',
        resource: port.port
      });
      item.push({
        name: port.addr + ' ' + utils.getMetricName('network.outgoing.bytes.rate'),
        metricType: 'network.outgoing.bytes.rate',
        key: port.addr + 'network.outgoing.bytes.rate',
        resourceType: 'instance_network_interface',
        resource: port.port
      });
    });
  }

  return item;
}

function getVolumeResource(volume) {
  let item = [{
    name: utils.getMetricName('disk.device.read.bytes.rate'),
    metricType: 'disk.device.read.bytes.rate',
    key: 'disk.device.read.bytes.rate',
    resourceType: 'volume',
    resource: volume
  }, {
    name: utils.getMetricName('disk.device.write.bytes.rate'),
    metricType: 'disk.device.write.bytes.rate',
    key: 'disk.device.write.bytes.rate',
    resourceType: 'volume',
    resource: volume
  }, {
    name: utils.getMetricName('disk.device.read.requests.rate'),
    metricType: 'disk.device.read.requests.rate',
    key: 'disk.device.read.requests.rate',
    resourceType: 'volume',
    resource: volume
  }, {
    name: utils.getMetricName('disk.device.write.requests.rate'),
    metricType: 'disk.device.write.requests.rate',
    key: 'disk.device.write.requests.rate',
    resourceType: 'volume',
    resource: volume
  }];

  return item;
}

function findResourceByInstanceId(insId) {
  return request.getInstance().then((data) => {
    let ins = data.instance.find((ele) => ele.id === insId);

    return ins;
  });
}

function findResourceByVolumeId(volId) {
  return request.getVolume().then((data) => {
    let vol = data.volume.find((ele) => ele.id === volId);

    return vol;
  });
}

function findPortByPortMeasureId(portMeasureId) {

  return request.getOriginalMeasureId(portMeasureId).then((resource) => {
    let portId = resource.original_resource_id.slice(-11);

    return request.getInstance().then((data) => {
      let port;

      data.instance.some((instance) => {

        const addresses = instance.addresses;
        for (let key in addresses) {
          addresses[key].filter((addr) => addr['OS-EXT-IPS:type'] === 'fixed').some((addrItem) => {
            if (addrItem.port.id.substr(0, 11) === portId) {
              port = addrItem.port;
              return true;
            }
            return false;
          });
        }

        return port;

      });

      return port;

    });

  });
}

let resources = {

  getInitialList: function(data) {

    let items = [];

    data.instance.forEach((ele) => {
      items.push({
        id: ele.id,
        title: ele.name ? ele.name : '(' + ele.id.substr(0, 8) + ')',
        type: 'instance',
        resource: ele,
        items: getInstanceResource(ele)
      });
    });

    data.volume.filter((ele) => ele.attachments.length === 1).forEach((ele) => {
      items.push({
        id: ele.id,
        title: ele.name ? ele.name : '(' + ele.id.substr(0, 8) + ')',
        type: 'volume',
        resource: ele,
        items: getVolumeResource(ele)
      });
    });

    return items;

  },

  getInstanceList: function(instance) {
    let items = [{
      id: instance.id,
      title: instance.name ? instance.name : '(' + instance.id.substr(0, 8) + ')',
      type: 'instance',
      resource: instance,
      items: getInstanceResource(instance),
      unfold: true
    }];

    return items;
  },

  getVolumeList: function(volume) {
    let items = [{
      id: volume.id,
      title: volume.name ? volume.name : '(' + volume.id.substr(0, 8) + ')',
      type: 'volume',
      resource: volume,
      items: getVolumeResource(volume),
      unfold: true
    }];

    return items;
  },

  getOriginalResource: function(alarm) {
    let rule = alarm.gnocchi_resources_threshold_rule;

    switch(rule.resource_type) {
      case 'instance':
        return findResourceByInstanceId(rule.resource_id);
      case 'instance_network_interface':
        return findPortByPortMeasureId(rule.resource_id);
      case 'volume':
        return findResourceByVolumeId(rule.resource_id);
      default:
        break;
    }
  }

};

module.exports = resources;
