module.exports = {
  toRGB: function(value, opacity) {
    var r = parseInt(value.slice(1, 3), 16),
      g = parseInt(value.slice(3, 5), 16),
      b = parseInt(value.slice(5), 16);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  }
};
