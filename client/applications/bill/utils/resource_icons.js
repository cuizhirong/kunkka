module.exports = function(type) {
  switch(type) {
    case 'compute':
      return 'icon-instance';
    case 'volume.volume':
      return 'icon-volume';
    case 'volume.snapshot':
      return 'icon-snapshot';
    case 'ratelimit.fip':
      return 'icon-floating-ip';
    case 'ratelimit.gw':
      return 'icon-router';
    case 'loadbalancer':
      return 'icon-lb';
    default:
      return `icon-${type}`;
  }
};
