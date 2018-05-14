function getQuotaItems(volumeTypes, __) {
  let quota = [{
    title: __.compute,
    items: [{
      title: __.instance,
      key: 'instances'
    }, {
      title: __.keypair,
      key: 'key_pairs'
    }, {
      title: __.cpu,
      key: 'cores'
    }, {
      title: __.ram + __.unit_gb,
      key: 'ram'
    }]
  }, {
    title: __.network,
    items: [{
      title: __.network,
      key: 'network'
    }, {
      title: __.subnet,
      key: 'subnet'
    }, {
      title: __['floating-ip'],
      key: 'floatingip'
    }, {
      title: __.loadbalancer,
      key: 'loadbalancer'
    }, {
      title: __.listener,
      key: 'listener'
    }, {
      title: __.resource_pool,
      key: 'pool'
    }, {
      title: __.port,
      key: 'port'
    }, {
      title: __.router,
      key: 'router'
    }, {
      title: __.security_group,
      key: 'security_group'
    }]
  }, {
    title: __.storage,
    items: [{
      title: __.all_volumes,
      key: 'volumes'
    }, {
      title: __.all_gigabytes,
      key: 'gigabytes'
    }, {
      title: __.all_snapshots,
      key: 'snapshots'
    }]
  }];

  volumeTypes.forEach((item) => {
    quota[2].items.push({
      title: (__[item] !== undefined ? __[item] : item) + __.volume,
      key: 'volumes_' + item
    });
    quota[2].items.push({
      title: (__[item] !== undefined ? __[item] : item) + __.volume + __.gigabyte + __.unit_gb,
      key: 'gigabytes_' + item
    });
    quota[2].items.push({
      title: (__[item] !== undefined ? __[item] : item) + __.snapshot,
      key: 'snapshots_' + item
    });
  });

  return quota;
}

module.exports = getQuotaItems;
