function getIcons(name) {
  switch(name) {
    case 'compute':
      return 'instance';
    case 'network.router':
      return 'router';
    case 'network.floating':
      return 'floating-ip';
    case 'loadbalancer':
      return 'lb';
    case 'network.bw.in':
      return 'bw-in';
    case 'network.bw.out':
      return 'bw-out';
    default:
      return name;
  }
}

module.exports = getIcons;
