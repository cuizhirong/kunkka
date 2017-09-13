const __ = require('locale/client/bill.lang.json');
const COLOR_LIST = ['#19B7CD', '#33BFD3', '#4CC7D8', '#66CFDE', '#7FD7E3', '#99DFE9', '#B2E7EE', '#CCEFF4', '#E5F7F9'];
let basePieOption = function(style) {
  let itemStyle = style || {
    emphasis: {
      shadowColor: '#626f7e',
      shadowBlur: 8
    }
  };
  let option = {
    color: COLOR_LIST,
    tooltip: {
      trigger: 'item',
      formatter: '{b}占比 {d}%',
      borderColor: '#00afc8',
      borderWidth: 1,
      textStyle: {
        color: '#252f3d'
      },
      backgroundColor: '#f5fdfe',
      confine: true
    },
    legend: {
      show: false
    },
    series: [
      {
        name:'none',
        type:'pie',
        radius: ['80%', '90%'],
        avoidLabelOverlap: false,
        hoverAnimation: true,
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        itemStyle: itemStyle,
        data:[]
      }
    ]
  };
  return option;
};

let pieNormalOption = basePieOption();

let chartOptions = {
  pieNormalOption: pieNormalOption,
  lineChartOption: {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis',
      formatter: `{b}<br>${__.sum}: ¥{c}`,
      borderColor: '#00afc8',
      borderWidth: 1,
      textStyle: {
        color: '#252f3d'
      },
      backgroundColor: '#f5fdfe'
    },
    legend: {
      show: false
    },
    grid: {
      left: '80px',
      right: '36px'
    },
    toolbox: {
      show: false
    },
    itemStyle: {
      normal: {
        color: '#19B7CD'
      }
    },
    lineStyle: {
      normal: {
        color: '#19B7CD'
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: []
  }
};

module.exports = chartOptions;
