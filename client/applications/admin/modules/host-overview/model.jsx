require('./style/index.less');

const React = require('react');
const {Tab} = require('client/uskin/index');

const request = require('./request');

const router = require('client/utils/router');
const unitConverter = require('client/utils/unit_converter');

const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/pie');

const tabs = [{
  name: __['host-overview'],
  key: 'host-overview',
  default: true
}];

const canvasWidth = 110;
const canvasHeight = 110;

const commonPieOption = {
  type: 'pie',
  hoverAnimation: false,
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
    },
    emphasis: {
      show: false
    }
  }
};
const totalColor = {
  type: 'linear',
  x: 1,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [{
    offset: 0, color: '#19d3d2'
  }, {
    offset: 1, color: '#09c2df'
  }]
};
const usedColor = {
  type: 'linear',
  x: 1,
  y: 0,
  x2: 0,
  y2: 1,
  colorStops: [{
    offset: 0, color: '#16E9CA'
  }, {
    offset: 1, color: '#0CCBAF'
  }]
};

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      host: 0,
      vms: 0,
      cpu: {
        total: 0,
        used: 0,
        ratio: 0,
        isReused: false
      },
      memory: {
        total: 0,
        used: 0,
        ratio: 0,
        isReused: false
      },
      disks: [{
        // 默认给一个占位的
        name: 'default',
        total: 0,
        used: 0,
        avail: 0,
        utilization: 0
      }],
      verticalNumberOfDisks: 1,
      horizontalNumberOfDisks: 1
    };

    this.canvasElem = {
      cpuTotal: null,
      cpuUsed: null,
      memoryTotal: null,
      memoryUsed: null,
      disks: []
    };

    this.chart = {
      cpuTotal: null,
      cpuUsed: null,
      memoryTotal: null,
      memoryUsed: null,
      disks: []
    };
  }

  componentDidMount() {
    this.initCharts();
    this.getData();
  }

  initCharts() {
    for(let elem in this.canvasElem) {
      if(elem === 'disks') {
        this.initDiskCharts();
      } else {
        this.chart[elem] = echarts.init(this.canvasElem[elem]);
      }
    }
  }

  initDiskCharts() {
    this.state.disks.forEach((disk, index) => {
      this.chart.disks[index] = echarts.init(this.canvasElem.disks[index]);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.getData();
    }
  }

  getData() {
    this.getOverview();
    this.getDiskUsage();
  }

  getOverview() {
    request.getOverview().then((res) => {
      const data = res.hypervisor_statistics;
      const cpu = {
        total: data.vcpus,
        used: data.vcpus_used,
        ratio: (data.vcpus_used / data.vcpus) > 1 ? (data.vcpus_used / data.vcpus).toFixed(1) : (data.vcpus_used / data.vcpus).toFixed(2),
        isReused: (data.vcpus_used > data.vcpus) ? true : false
      };
      const memory = {
        total: data.memory_mb,
        used: data.memory_mb_used,
        ratio: (data.memory_mb_used / data.memory_mb) > 1 ? (data.memory_mb_used / data.memory_mb).toFixed(1) : (data.memory_mb_used / data.memory_mb).toFixed(2),
        isReused: (data.memory_mb_used > data.memory_mb) ? true : false
      };

      this.setState({
        host: data.count,
        vms: data.running_vms,
        cpu: cpu,
        memory: memory
      }, () => {
        this.setCPUAndMemoryChartsOption();
      });
    });
  }

  getDiskUsage() {
    request.getDiskUsage().then(res => {
      const disks = res.stats.map(diskStat => {
        return {
          name: diskStat.name,
          total: diskStat.kb,
          used: diskStat.kb_used,
          avail: diskStat.kb_avail,
          utilization: Math.round(diskStat.utilization)
        };
      });

      const numberOfDisks = res.stats.length;
      let verticalNumberOfDisks, horizontalNumberOfDisks;

      switch (numberOfDisks) {
        case 1:
          horizontalNumberOfDisks = 1;
          verticalNumberOfDisks = 1;
          break;
        case 2:
          horizontalNumberOfDisks = 1;
          verticalNumberOfDisks = 2;
          break;
        case 3:
          horizontalNumberOfDisks = 1;
          verticalNumberOfDisks = 3;
          break;
        case 4:
          horizontalNumberOfDisks = 2;
          verticalNumberOfDisks = 2;
          break;
        default:
          // 极端情况溢出
          horizontalNumberOfDisks = 1;
          verticalNumberOfDisks = 2;
          break;
      }

      this.setState({
        disks: disks,
        horizontalNumberOfDisks: horizontalNumberOfDisks,
        verticalNumberOfDisks: verticalNumberOfDisks
      }, () => {
        this.initDiskCharts();
        this.setDiskChartOption(this.state.disks, this.chart.disks);
      });
    });
  }

  setCPUAndMemoryChartsOption() {
    const cpu = this.state.cpu;
    const memory = this.state.memory;

    // 不兼容16倍以上的复用比例
    if(cpu.isReused && cpu.ratio <= 16) {
      this.setMultiPieOption(cpu, this.chart.cpuTotal, this.chart.cpuUsed);
    } else {
      this.setSinglePieOption(cpu, this.chart.cpuTotal, this.chart.cpuUsed);
    }

    if(memory.isReused && memory.ratio <= 16) {
      this.setMultiPieOption(memory, this.chart.memoryTotal, this.chart.memoryUsed);
    } else {
      this.setSinglePieOption(memory, this.chart.memoryTotal, this.chart.memoryUsed);
    }
  }

  setSinglePieOption(data, totalChart, usedChart) {
    const totalOption = {
      series: [
        Object.assign({}, commonPieOption,
          {
            center: [canvasWidth / 2, canvasHeight / 2],
            radius: 33,
            data: [1],
            itemStyle: {
              normal: {
                color: totalColor
              }
            }
          }
        )
      ]
    };

    const usedOption = {
      series: [
        Object.assign({}, commonPieOption,
          {
            center: [canvasWidth / 2, canvasHeight / 2],
            radius: 33,
            data: [{
              name: 'used',
              value: data.used,
              itemStyle: {
                normal: {
                  color: usedColor
                }
              }
            }, {
              name: 'unused',
              value: data.total - data.used,
              itemStyle: {
                normal: {
                  color: '#eaeaea'
                },
                emphasis: {
                  color: '#eaeaea'
                }
              }
            }]
          }
        )
      ]
    };

    totalChart.setOption(totalOption);
    usedChart.setOption(usedOption);
  }

  setMultiPieOption(data, totalChart, usedChart) {
    const count = Math.ceil(data.used / data.total);

    const { radius, centers } = this.getPiesData(canvasWidth, canvasWidth,
      count);

    const totalOption = {
      series: [
        Object.assign({}, commonPieOption, {
          center: [canvasWidth / 2, canvasHeight / 2],
          radius: radius,
          data: [1],
          itemStyle: {
            normal: {
              color: totalColor
            }
          }
        })]
    };

    const series = centers.map(pie => {
      return Object.assign({}, commonPieOption, {
        center: [pie.x, pie.y],
        radius: radius,
        data: [1],
        itemStyle: {
          normal: {
            color: usedColor
          }
        }
      });
    });

    if(data.used / data.total !== count) {
      // 不是整的倍数
      const lastPie = centers.pop();
      series.pop();
      series.push(
        Object.assign({}, commonPieOption, {
          center: [lastPie.x, lastPie.y],
          radius: radius,
          data: [{
            name: 'used',
            value: (data.used % data.total) / data.total,
            itemStyle: {
              normal: {
                color: usedColor
              }
            }
          }, {
            name: 'unused',
            value: 1 - (data.used % data.total) / data.total,
            itemStyle: {
              normal: {
                color: '#eaeaea'
              },
              emphasis: {
                color: '#eaeaea'
              }
            }
          }]
        })
      );
    }

    const usedOption = {
      series: series
    };

    totalChart.setOption(totalOption);
    usedChart.setOption(usedOption);
  }

  getPiesData(w, h, count) {

    let gapX, gapY, radius,
      centers = [];
    let circlesOfOneLine;

    // 注意下面的算法如果在 w 或 h 非相等时可能需要调整
    if(count === 2) {
      // 2*1
      gapX = 20;
      gapY = 0;
      radius = (canvasWidth - gapX) / 2 / 2;
      circlesOfOneLine = 2;
    } else if(count === 3 || count === 4) {
      // 2*2
      gapX = 20;
      gapY = 20;
      radius = (canvasWidth - gapX) / 2 / 2;
      circlesOfOneLine = 2;
    } else if(count === 5 || count === 6) {
      // 2*3
      gapY = 10;
      radius = (h - 2 * gapY) / 3 / 2;
      gapX = w - radius * 4;
      circlesOfOneLine = 2;
    } else if(count >= 7 && count <= 9) {
      // 3*3
      gapX = 10;
      gapY = 10;
      radius = (w - 2 * gapX) / 3 / 2;
      circlesOfOneLine = 3;
    } else if(count >= 10 && count <= 12){
      // 4*3
      gapX = 6;
      radius = (w - 3 * gapX) / 4 / 2;
      gapY = (h - radius * 6) / 2;
      circlesOfOneLine = 4;
    } else {
      // 4*4
      gapX = 6;
      gapY = 6;
      radius = (w - 3 * gapX) / 4 / 2;
      circlesOfOneLine = 4;
    }

    for(let i = 0; i < count; i++) {
      const remainder = i % circlesOfOneLine;
      let level;
      if(i < circlesOfOneLine) {
        level = 0;
      } else if(i < 2 * circlesOfOneLine) {
        level = 1;
      } else if(i < 3 * circlesOfOneLine){
        level = 2;
      } else {
        level = 3;
      }

      let y;
      if(count <= 2) {
        y = h / 2;
      } else {
        y = radius + level * (gapY + 2 * radius);
      }

      centers.push({
        x: radius + remainder * (gapX + 2 * radius),
        y: y
      });
    }

    return {
      radius: radius,
      centers: centers
    };
  }

  setDiskChartOption(data, charts) {
    const count = data.length;
    let radius;

    if(count === 1) {
      radius = [81, 95];
    } else if(count === 2) {
      radius = [55, 65];
    } else if(count === 3 || count === 4) {
      radius = [41, 50];
    } else {
      radius = [55, 65];
    }

    charts.forEach((chart, index) => {
      const option = Object.assign({}, commonPieOption, {
        center: [radius[1], radius[1]],
        radius: radius,
        data: [{
          name: 'used',
          value: data[index].used,
          itemStyle: {
            normal: {
              color: totalColor
            }
          }
        }, {
          name: 'used',
          value: data[index].avail,
          itemStyle: {
            normal: {
              color: '#eaeaea'
            },
            emphasis: {
              color: '#eaeaea'
            }
          }
        }]
      });

      chart.setOption({
        series: option
      });
    });
  }

  clickTabs(e, item) {
    let path = router.getPathList();
    router.pushState('/' + path[0] + '/' + item.key);
  }

  render() {
    const state = this.state;
    const disks = state.disks;

    const topItems = [{
      name: __.host + __.amount,
      value: state.host
    }, {
      name: __.instance + __.amount,
      value: state.vms
    }, {
      name: __.vcpu + __.amount,
      value: state.cpu.total
    }, {
      name: __.memory + __.amount + '(GB)',
      value: Math.floor(state.memory.total / 1024)
    }];

    let diskWrpperClassName = '';
    if(state.horizontalNumberOfDisks === 1) {
      diskWrpperClassName += 'one-col';
    } else {
      diskWrpperClassName += 'two-col';
    }

    if(state.verticalNumberOfDisks === 1) {
      diskWrpperClassName += ' one-row';
    } else if(state.verticalNumberOfDisks === 2){
      diskWrpperClassName += ' two-row';
    } else {
      diskWrpperClassName += ' three-row';
    }

    return (
      <div className="halo-module-new-host-overview" style={this.props.style}>
        <div className="submenu-tabs">
          <Tab items={tabs} onClick={this.clickTabs.bind(this)} />
        </div>
        <div className="host-overview-info-wrapper">
          <div className="host-overview-total-detail-wrapper">
            <ul>
              {
                topItems.map(item => {
                  return (
                    <li className="host-overview-total-detail" key={item.name}>
                      <div className="overview-item-name">
                        { item.name }
                      </div>
                      <div className="overview-item-value">
                        { item.value }
                      </div>
                    </li>
                  );
                })
              }
            </ul>
          </div>

          <div className="host-overview-usage-detail-wrapper">
            <div className="left">

              <div className="cpu-usage-detail-wrapper">
                <div className="title">
                  { __.vcpu }
                </div>
                <div className="content">
                  <div className="ratio-wrapper">
                    <div className="ratio">
                      { __.reuse + __.rate }
                    </div>
                    <div className="ratio-chart-wrapper">
                      <div className="total-chart">
                        <div className="chart"
                          ref={(dom) => { this.canvasElem.cpuTotal = dom; }}
                          style={{ width: canvasWidth, height: canvasHeight }}>
                        </div>
                        <div className="item-name">
                          { __.vcpu + __.amount }
                        </div>
                      </div>
                      <div className="colon">
                        {
                          '1:' + state.cpu.ratio
                        }
                      </div>
                      <div className="used-chart">
                        <div className="chart"
                          ref={(dom) => { this.canvasElem.cpuUsed = dom; }}
                          style={{ width: canvasWidth, height: canvasHeight }}>
                        </div>
                        <div className="item-name">
                          { __.vcpu_used }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="count-wrapper">
                    <div className="total-wrapper">
                      <div className="total">
                        <div>{__.vcpu + __.amount}</div>
                        <div>
                          <div>
                            { state.cpu.total }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="used-wrapper">
                      <div className="used">
                        <div>{__.vcpu_used}</div>
                        <div>
                          <div>
                            { state.cpu.used }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="memory-usage-detail-wrapper">
                <div className="title">
                  { __.memory }
                </div>
                <div className="content">
                  <div className="ratio-wrapper">
                    <div className="ratio">
                      { __.reuse + __.rate }
                    </div>
                    <div className="ratio-chart-wrapper">
                      <div className="total-chart">
                        <div className="chart"
                          ref={(dom) => { this.canvasElem.memoryTotal = dom; }}
                          style={{ width: canvasWidth, height: canvasHeight }}>
                        </div>
                        <div className="item-name">
                          { __.memory + __.amount }
                        </div>
                      </div>
                      <div className="colon">
                        {
                          '1:' + state.memory.ratio
                        }
                      </div>
                      <div className="used-chart">
                        <div className="chart"
                          ref={(dom) => { this.canvasElem.memoryUsed = dom; }}
                          style={{ width: canvasWidth, height: canvasHeight }}>
                        </div>
                        <div className="item-name">
                          { __.memory_used }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="count-wrapper">
                    <div className="total-wrapper">
                      <div className="total">
                        <div>{__.memory + __.amount}</div>
                        <div>
                          <div>
                            {
                              Math.floor(state.memory.total / 1024)
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="used-wrapper">
                      <div className="used">
                        <div>{ __.memory_used }</div>
                        <div>
                          <div>
                            {
                              Math.floor(state.memory.used / 1024)
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="right">
              <div className={'disk-usage-detail-wrapper ' + diskWrpperClassName}>
                <div className="title">{ __.disk + __.usage_rate }</div>
                <ul>
                  {
                    disks.map((disk, index) => {
                      const totalObj = unitConverter(disk.total, 'KB');
                      const usedObj = unitConverter(disk.used, 'KB');
                      const availObj = unitConverter(disk.avail, 'KB');

                      return (
                        <li key={disk.name}>
                          <div className="total">
                            <div>
                              {
                                disk.name + ' ' + __.storage_pool_total_capacity
                              }
                            </div>
                            <div>{ totalObj.num + totalObj.unit }</div>
                          </div>

                          <div className="utilization-chart-wrapper">
                            <div className="chart" ref={(dom) => { this.canvasElem.disks[index] = dom; }}></div>
                            <div className="utilization">
                              <div>{ disk.utilization + '%' }</div>
                              <div>{ __.usage_rate }</div>
                            </div>
                          </div>

                          <div className="count-wrapper">
                            <div className="used-wrapper">
                              <div className="rect"></div>
                              <div className="name">
                                {__.used_capacity}
                              </div>
                              <div className="value">
                                { usedObj.num + usedObj.unit }
                              </div>
                            </div>
                            <div className="unused-wrapper">
                              <div className="rect"></div>
                              <div className="name">
                                {__.unused_capacity}
                              </div>
                              <div className="value">
                                { availObj.num + availObj.unit }
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
