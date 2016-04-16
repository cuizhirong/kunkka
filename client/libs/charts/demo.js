var Chart = require('./index');

var c = new Chart.PieChart(document.getElementById('container'));

c.setOption({
  lineWidth: 10,
  bgColor: '#f2f3f4',
  series: [{
    color: '#ff5a67',
    value: 0.8
  }],
  text: {
    color: '#ff5a67',
    fontSize: '30px'
  },
  period: 500
});

var c2 = new Chart.PieChart(document.getElementById('container2'));

c2.setOption({
  lineWidth: 10,
  bgColor: '#f2f3f4',
  series: [{
    color: '#42b9e5',
    value: 0.4
  }],
  text: {
    color: '#42b9e5',
    fontSize: '30px'
  },
  period: 500,
  easing: 'easeInOutQuart'
});

var c3 = new Chart.PieChart(document.getElementById('container3'));

c3.setOption({
  lineWidth: 10,
  bgColor: '#f2f3f4',
  series: [{
    color: '#42b9e5',
    value: 0.4
  }],
  text: {
    color: '#42b9e5',
    fontSize: '30px'
  },
  period: 500
});
