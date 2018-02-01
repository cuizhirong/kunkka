const __ = require('locale/client/bill.lang.json');
const COLOR_LIST = require('./color_list');
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
      formatter: params => {
        return `${__[params.name]}占比 ${params.percent}%`;
      },
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
      show: true,
      text: __.recent_consumption_record,
      textStyle: {
        color: '#252F3D',
        fontSize: 12
      },
      left: '20px',
      subtext: __.subtext
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: false
    },
    grid: {
      left: '80px',
      right: '36px',
      bottom: '30px'
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
      data: [],
      axisLine: {
        lineStyle: {
          color: '#999999'
        }
      },
      // grid中的分割线
      splitLine: {
        show: true,
        lineStyle: {
          color: '#ECF0F2'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#999999'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#ECF0F2'
        }
      }
    },
    series: []
  }
};

module.exports = chartOptions;
