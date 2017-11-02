function getIcons(name) {
  switch(name) {
    case 'compute':
      return 'instance';
    case 'network.router':
      return 'router';
    case 'network.floating':
      return 'floating-ip';
    case 'lbass.listener':
      return 'listener';
    case 'lbass.loadbalancer':
      return 'lb';
    case 'volume.volume':
      return 'volume';
    case 'volume.snapshot':
      return 'snapshot';
    case 'rate.limit.fip':
      return 'bw-in';
    case 'rate.limit.gw':
      return 'bw-out';
    default:
      return name;
  }
}

module.exports = getIcons;
