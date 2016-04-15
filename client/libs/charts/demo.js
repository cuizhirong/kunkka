var Chart = require('./index');

var c = new Chart(document.getElementById('container'), {
  width: 150,
  height: 150,
  lineWidth: 10,
  bgColor: '#f2f3f4',
  values: [{
    color: '#ff5a67',
    value: 0.8
  }],
  text: {
    color: '#ff5a67',
    fontSize: '30px'
  },
  period: 500
});

c.init();
