var Chart = require('./index');

var c = new Chart.PieChart(document.getElementById('container'));

c.setOption({
  lineWidth: 10,
  bgColor: '#f2f3f4',
  series: [{
    color: '#ff5a67',
    data: 0.8
  }],
  text: {
    color: '#ff5a67',
    fontSize: '30px'
  },
  period: 600
});

setTimeout(function() {
  c.setOption({
    lineWidth: 10,
    bgColor: '#f2f3f4',
    series: [{
      color: '#ff5a67',
      data: 0.5
    }],
    text: {
      color: '#ff5a67',
      fontSize: '30px'
    },
    period: 600
  });
}, 3000);

var c2 = new Chart.PieChart(document.getElementById('container2'));

c2.setOption({
  lineWidth: 0.2,
  bgColor: '#f2f3f4',
  series: [{
    color: '#42b9e5',
    data: 0.4
  }],
  text: {
    color: '#42b9e5',
    fontSize: '30px'
  },
  period: 600,
  easing: 'easeInOutQuart'
});

var c3 = new Chart.PieChart(document.getElementById('container3'));

c3.setOption({
  lineWidth: 10,
  bgColor: '#f2f3f4',
  series: [{
    color: '#42b9e5',
    data: 0.4
  }],
  text: {
    color: '#42b9e5',
    fontSize: '30px'
  },
  period: 600
});

var c4 = new Chart.GaugeChart(document.getElementById('container4'));

c4.setOption({
  lineWidth: 0.4,
  bgColor: '#f2f3f4',
  tickColor: '#bbbfc5',
  series: [{
    color: '#42b9e5',
    data: 0.8
  }],
  pointer: {
    radius: 10,
    color: '#252f3d'
  },
  period: 600,
  easing: 'easeOutCubic'
});


setTimeout(function() {
  c4.setOption({
    lineWidth: 0.4,
    bgColor: '#f2f3f4',
    tickColor: '#bbbfc5',
    series: [{
      color: '#42b9e5',
      data: 0.3
    }],
    pointer: {
      radius: 10,
      color: '#252f3d'
    },
    period: 600,
    easing: 'easeOutCubic'
  });
}, 2000);


var c5 = new Chart.BarChart(document.getElementById('container5'));

c5.setOption({
  unit: 'TB',
  title: '容量／TB',
  xAxis: {
    tickWidth: 50,
    barWidth: 30
  },
  yAxis: {
    color: '#f2f3f4',
    tickPeriod: 15,
    tickColor: '#939ba3'
  },
  series: [{
    color: '#1797c6',
    data: 105
  }, {
    color: '#42b9e5',
    data: 25
  }, {
    color: '#42b9e5',
    data: 75
  }],
  period: 600,
  easing: 'easeOutCubic'
});

var c6 = new Chart.LineChart(document.getElementById('container6'));

c6.setOption({
  unit: 'TB',
  title: '单位(%), 时间间隔900s',
  xAxis: {
    color: '#f2f3f4',
    data: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15']
  },
  yAxis: {
    color: '#f2f3f4',
    tickPeriod: 10,
    tickColor: '#939ba3'
  },
  series: [{
    color: '#1797c6',
    data: [31, 9, 41, 21, 26, 49, 23, 25, 30, 32],
    opacity: 0.05
  }, {
    color: '#42b9e5',
    data: [9, 40, 18, 10, 32, 47, 8, 14, 21, 16],
    opacity: 0.05
  }, {
    color: '#ff5a67',
    data: [42, 5, 26, 22, 17, 38, 18, 12, 3, 16],
    opacity: 0.05,
    type: 'sharp' // sharp, curve, curve by default
  }],
  alert: {
    data: 70,
    lineWidth: 1,
    color: '#000'
  },
  period: 600,
  easing: 'easeOutCubic'
});

var c7 = new Chart.LineChart(document.getElementById('container7'));

c7.setOption({
  unit: 'TB',
  title: '单位(GB), 时间间隔300s',
  xAxis: {
    color: '#f2f3f4',
    data: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15']
  },
  yAxis: {
    color: '#f2f3f4',
    tickPeriod: 10,
    tickColor: '#939ba3',
    data: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15']
  },
  series: [{
    color: '#1797c6',
    data: [-2, -1, 22, 14, -11, 8, 22, -11, 13, 4],
    opacity: 0.05
  }, {
    color: '#42b9e5',
    data: [-17, -29, -27, -1, 28, -25, -8, 4, 4, 40],
    opacity: 0.05
  }, {
    color: '#ff5a67',
    data: [32, 15, -13, -21, -12, 47, -7, 24, -2, -27],
    opacity: 0.05
  }],
  period: 1600,
  easing: 'easeOutCubic'
});
