function formatPrice(data) {
  let prices = {};
  for (let i = 0; i < data.length; i++) {
    let key = data[i].name;
    data[i].unit_price = data[i].unit_price;
    prices[key] = data[i];
  }

  return prices;
}

module.exports = formatPrice;
