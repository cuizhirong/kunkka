require('./style/index.less');
//var Chart = require('client/libs/charts/index');
var Echarts = require('echarts');
var React = require('react');
var {Tab} = require('client/uskin/index');

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
      title: []
    };
    this.lineChart;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      granularity: nextProps.granularity,
      item: nextProps.item,
      tabItems: nextProps.tabItems,
      resourceType: nextProps.resourceType,
      metricType: nextProps.metricType
    });
  }

  componentDidUpdate() {
    this.renderLineChart(this.state.data, this.state.granularity);
  }

  getChartData(data, i) {
    var _data = [];
    data.forEach((d) => {
      if (i === 0 || i === 1) {
        _data.push(d[2].toFixed(2) * 100);
      } else {
        _data.push(d[2].toFixed(2));
      }
    });
    return _data;
  }

  getXaxis(data) {
    var xAxis = [];
    data.forEach((d) => {
      let date = new Date(d[0]);
      xAxis.push(this.getDateStr(date));
    });
    return xAxis;
  }

  getTitle(resourceType, metricType) {
    if (resourceType === 'instance') {
      switch(metricType) {
        case 'cpu_util':
          return this.props.__.cpu_util;
        case 'memory.usage':
          return this.props.__.memory_utils;
        case 'disk.read.bytes.rate':
          return this.props.__.disk_read;
        case 'disk.write.bytes.rate':
          return this.props.__.disk_write;
        default:
          return 'B/s';
      }
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
    var title = this.state.metricType.map(type => {
      return this.getTitle(this.state.resourceType, type);
    });
    var unit = this.state.metricType.map(u => {
      return this.getUnit(this.state.resourceType, u);
    });
    data ? data.forEach((d, i) => {
      var myChart = Echarts.init(document.getElementById('line-chart' + i));
      let chartData = this.getChartData(d, i);
      let xAxis = this.getXaxis(d);
      let subText = this.props.__.unit + '(' + unit[i] + '), ' + this.props.__.interval + granularity + 's';

      var option = {
        title: {
          text: title[i],
          subtext: subText
        },
        tooltip: {
          trigger: 'axis'
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
          }
        },
        xAxis:  {
          type: 'category',
          boundaryGap: false,
          data: xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'line',
          smooth: true,
          data: chartData
        }],
        animation: false,
        color: ['#00afc8']
      };

      myChart.setOption(option);
    }) : '';
  }

  clickTabs(e, tabItem) {
    this.props.clickTabs && this.props.clickTabs(e, tabItem, this.state.item);
  }

  render() {
    var __ = this.props.__,
      tabItems = this.state.tabItems;
    return (
      <div className="halo-com-line-chart">
        {
          this.state.data ?
            <div>
              <div className="tabs_sm">
                {this.props.children}
                <Tab items={tabItems} type="sm" onClick={this.clickTabs.bind(this)}/>
              </div>
              {this.state.data.map((_d, i) => {
                return (
                  <div id={'line-chart' + i} key={i} className="chart">
                    <div className="legendWp" id="legendWp">
                      <span className="circle"></span>
                      <label>{this.state.item.name}</label>
                      {
                        _d.length === 0 ? <label className="no-data">{__.no_monitor_data}</label> : ''
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          : <div className="detail-loading">
              <i className="glyphicon icon-loading" />
            </div>
        }
      </div>
    );
  }
}

module.exports = ChartLine;
