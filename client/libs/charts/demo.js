var Chart = require('./index');

var c = new Chart(document.getElementById('container'), {
  width: 300,
  height: 300,
  value: 0.5,
  period: 500
});

c.init();
