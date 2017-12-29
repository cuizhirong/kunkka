function formatPrice(data) {
  let prices = {};
  prices.compute = {};
  prices.volume = {};
  prices.other = {};
  data.forEach(d => {
    if(d.resource_type === 'compute') {
      prices.compute[d.name] = d.cost;
    } else if(d.resource_type === 'volume.volume'){
      prices.volume[d.name] = d.cost;
    } else {
      prices.other[d.resource_type] = prices.other[d.resource_type] ?
        prices.other[d.resource_type].concat([d.cost]) :
        [d.cost];
    }
  });

  return prices;
}

module.exports = formatPrice;
