//division algorithm, to get greatest common factor

module.exports = function getCommonFactor(m, n) {
  if (isNaN(m) || isNaN(n)) {
    return 1;
  } else {
    let u = m, v = n, t = v;
    while (v !== 0){
      t = u % v;
      u = v;
      v = t;
    }
    return u;
  }
};
