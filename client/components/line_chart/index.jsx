require('./style/index.less');
//var Chart = require('client/libs/charts/index');
var Echarts = require('echarts');
var React = require('react');
var {Tab} = require('client/uskin/index');
var constant = require('./constant');
let count = 0;

class ChartLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      granularity: props.granularity,
      item: props.item,
      tabItems: props.tabItems ? props.tabItems : [],
      resourceType: props.resourceType,
      metricType: props.metricType,
      title: [],
      loading: props.loading
    };
    count ++;
  }

  componentDidMount() {
    this.state.data ? this.renderLineChart(this.state.data, this.state.granularity) : '';
  }

  componentWillReceiveProps(nextProps) {
    count ++;
    this.setState({
      data: nextProps.data,
      granularity: nextProps.granularity,
      item: nextProps.item,
      tabItems: nextProps.tabItems,
      resourceType: nextProps.resourceType,
      metricType: nextProps.metricType,
      loading: nextProps.loading
    });
  }

  componentDidUpdate() {
    this.renderLineChart(this.state.data, this.state.granularity);
  }

  getChartData(resourceType, data, metric, granularity) {
    var _data = [];
    if (resourceType === 'instance') {
      data.forEach((d) => {
        _data.push(d[2].toFixed(2));
      });
    }
    let prev;
    if (data.length > 0) {
      prev = new Date(data[0][0]);
    } else {
      prev = new Date();
    }

    const DOTS_NUM = this.getDotsNumber(granularity, prev);

    if (data.length < DOTS_NUM) {
      let length = DOTS_NUM - data.length;

      while (length > 0) {
        prev = this.getNextPeriodDate(prev, granularity);
        _data.unshift(0);
        length--;
      }
    }
    return _data;
  }

  getXaxis(data, granularity) {
    var xAxis = [];
    data.forEach((d) => {
      let date = new Date(d[0]);
      xAxis.push(this.getDateStr(date));
    });

    let prev;
    if (data.length > 0) {
      prev = new Date(data[0][0]);
    } else {
      prev = new Date();
    }

    const DOTS_NUM = this.getDotsNumber(granularity, prev);

    if (data.length < DOTS_NUM) {
      let length = DOTS_NUM - data.length;
      while (length > 0) {
        prev = this.getNextPeriodDate(prev, granularity);
        xAxis.unshift(this.getDateStr(prev));
        length--;
      }
    }
    return xAxis;
  }

  getDotsNumber(granularity, prev) {
    switch (Number(granularity)) {
      case constant.GRANULARITY_HOUR:
        return 36;
      case constant.GRANULARITY_DAY:
        return 96;
      case constant.GRANULARITY_WEEK:
        return 168;
      case constant.GRANULARITY_MONTH:
        let date = new Date(prev.getFullYear(), prev.getMonth(), 0);
        return 4 * date.getDate();
      default:
        return 0;
    }
  }

  getNextPeriodDate(prev, granularity) {
    switch (Number(granularity)) {
      case constant.GRANULARITY_HOUR:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 5);
      case constant.GRANULARITY_DAY:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 15);
      case constant.GRANULARITY_WEEK:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 1);
      case constant.GRANULARITY_MONTH:
      default:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 6);
    }
  }

  getTitle(resourceType, metricType) {
    if (resourceType === 'instance') {
      if (metricType) {
        switch (metricType) {
          case 'disk.read.bytes.rate':
            return this.props.__.disk_read_rate;
          case 'disk.write.bytes.rate':
            return this.props.__.disk_write_rate;
          case 'cpu_util':
            return this.props.__.cpu_utilization;
          case 'memory.usage':
            return this.props.__.memory_usage;
          default:
            return metricType;
        }
      }
      return '';
    }
  }

  getUnit(resourceType, metricType) {
    if (resourceType === 'instance') {
      switch(metricType) {
        case 'cpu_util':
        case 'memory.usage':
          return '%';
        case 'disk.read.bytes.rate':
        case 'disk.write.bytes.rate':
        default:
          return 'B/s';
      }
    }
  }

  getDateStr(date) {
    function format(num) {
      return (num < 10 ? '0' : '') + num;
    }
    return format(date.getMonth() + 1) + '-' + format(date.getDate()) +
      ' ' + format(date.getHours()) + ':' + format(date.getMinutes());
  }

  renderLineChart(data, granularity, period) {
    var title = this.state.metricType ? this.state.metricType.map(type => {
      return this.getTitle(this.state.resourceType, type);
    }) : '';
    var unit = this.state.metricType ? this.state.metricType.map(u => {
      return this.getUnit(this.state.resourceType, u);
    }) : 'B/s';
    data ? data.forEach((d, i) => {
      if (d.length !== 0) {
        let chart = document.getElementById('line-chart' + i + count);
        let myChart = Echarts.init(chart);
        let chartData = this.getChartData(this.state.resourceType, d, this.state.metricType[i], granularity);
        let xAxis = this.getXaxis(d, granularity);
        let subText = this.props.__.unit + '(' + unit[i] + '), ' + this.props.__.interval + granularity + 's';

        var option = {
          title: {
            text: title[i],
            subtext: subText
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              lineStyle: {
                color: '#939ba3',
                width: 2
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis:  {
            type: 'category',
            boundaryGap: false,
            data: xAxis,
            axisLine: {
              lineStyle: {
                color: ['#939ba3']
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: ['#939ba3']
              }
            }
          },
          series: [{
            name: '总量',
            type: 'line',
            smooth: true,
            data: chartData
          }],
          animation: false,
          color: ['#f2994b'],
          textStyle: {
            fontFamily: 'Helvetica,arial'
          },
          backgroundColor: ['#f5fdfe']
        };

        myChart.setOption(option);
      } else {
        var charts = document.getElementById('line-chart' + i + count);
        while(charts.hasChildNodes()) {
          charts.removeChild(charts.firstChild);
        }
        var legendWp = document.createElement('div');
        var label = document.createElement('label');
        label.className = 'no-data';
        label.innerHTML = this.props.__.no_monitor_data;
        legendWp.appendChild(label);
        legendWp.className = 'legendWp';
        charts.appendChild(legendWp);
      }
    }) : '';
  }

  clickTabs(e, tabItem) {
    this.props.clickTabs && this.props.clickTabs(e, tabItem, this.state.item);
  }

  render() {
    var tabItems = this.state.tabItems;
    return (
      <div className="halo-com-line-chart">
        <div>
          <div className="tabs_sm">
            {this.props.children}
            <Tab items={tabItems} type="sm" onClick={this.clickTabs.bind(this)}/>
          </div>
          {
            !this.state.loading ?
              this.state.data && this.state.data.map((_d, i) => {
                return (
                  <div id={'line-chart' + i + count} key={i} className="chart">
                  </div>
                );
              })
            : <div className="detail-loading">
                <i className="glyphicon icon-loading" />
              </div>
          }
        </div>
      </div>
    );
  }
}

module.exports = ChartLine;
