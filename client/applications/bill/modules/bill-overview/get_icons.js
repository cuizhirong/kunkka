function getIcons(name) {
  switch(name) {
    case 'compute':
      return 'instance';
    case 'network.router':
      return 'router';
    case 'network.floating':
      return 'floating-ip';
    case 'lbaas.listener':
      return 'listener';
    case 'lbaas.loadbalancer':
      return 'lb';
    case 'volume.volume':
      return 'volume';
    case 'volume.snapshot':
      return 'snapshot';
    case 'ratelimit.fip':
      return 'bw-in';
    case 'ratelimit.gw':
      return 'bw-out';
    default:
      return name;
  }
}

module.exports = getIcons;
