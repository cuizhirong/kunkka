require('./style/index.less');
//var Chart = require('client/libs/charts/index');
var Echarts = require('echarts');
var React = require('react');
var {Tab} = require('client/uskin/index');
var utils = require('./utils');
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
      portMetricType: props.portMetricType,
      metricType: props.metricType,
      title: [],
      loading: props.loading,
      portData: props.portData,
      start: props.start
    };
    count ++;
  }

  componentDidMount() {
    var that = this;
    this.state.data ? this.renderLineChart(this.state.data, this.state.granularity) : '';
    this.state.portData ? this.renderPortChart(this.state.portData, this.state.granularity) : '';
    try {
      window.onresize = function() {
        that.state.data ? that.renderLineChart(that.state.data, that.state.granularity) : '';
        that.state.portData ? that.renderPortChart(that.state.portData, that.state.granularity) : '';
      };
    } catch (e) {
      return;
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      granularity: nextProps.granularity,
      item: nextProps.item,
      tabItems: nextProps.tabItems,
      resourceType: nextProps.resourceType,
      portMetricType: nextProps.portMetricType,
      metricType: nextProps.metricType,
      loading: nextProps.loading,
      portData: nextProps.portData,
      start: nextProps.start
    });
    let title = this.state.metricType ? this.state.metricType.map(type => {
      return utils.getTitle(this.state.resourceType, type, this.props.__);
    }) : '';
    let unit = this.state.metricType ? this.state.metricType.map(u => {
      return utils.getUnit(this.state.resourceType, u);
    }) : 'B/s';
    let obj = {
      title: title,
      unit: unit,
      data: this.props.data,
      type: 'obj',
      ele: 'line-chart' + count
    };
    if (nextProps.data.length === 0) {
      this.loadingChart(obj);
      this.props.portData ? this.props.portData.forEach((d, i) => {
        [d.incoming, d.outgoing].forEach((m, index) => {
          let portTitle = utils.getTitle(this.state.resourceType, this.state.portMetricType[index], this.props.__);
          let portUnit = utils.getUnit(this.state.resourceType, this.state.portMetricType[index]);
          obj = {
            title: portTitle,
            unit: portUnit,
            data: this.props.portData,
            type: 'port',
            ele: 'port' + index
          };
          this.loadingChart(obj);
        });
      }) : '';
    }
    count ++;
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data.length === 0) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.renderLineChart(this.state.data, this.state.granularity);
    this.renderPortChart(this.state.portData, this.state.granularity);
  }

  loadingChart(obj) {
    obj.data ? obj.data.forEach((d, i) => {
      let chart = document.getElementById(obj.ele + i);
      let myChart = Echarts.init(chart);
      let _unit = obj.type === 'port' ? obj.unit : obj.unit[i];
      let subText = this.props.__.unit + '(' + _unit + '), ' + this.props.__.interval + this.state.granularity + 's';
      myChart.showLoading('default', {
        text: this.props.__.loading,
        color: '#00afc8',
        textColor: '#252f3d',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0
      });
      let option = this.chart(obj.title, subText, [], obj.data, true, obj.type === 'port' ? '' : i + 1);

      myChart.setOption(option);
    }) : '';
  }

  getChartData(data, granularity, resourceType) {
    var _data = [];
    if (resourceType && (resourceType === 'instance' || resourceType === 'volume')) {
      data.forEach((d) => {
        _data.push(d[2].toFixed(2));
      });
    } else {
      data.forEach((d) => {
        let date = new Date(d[0]);
        _data.push(utils.getDateStr(date));
      });
    }
    let prev;
    if (data.length > 0) {
      prev = new Date(data[0][0]);
    } else {
      prev = new Date();
    }

    let _prev = new Date(prev.toISOString().substr(0, 16)).getTime(),
      start = new Date(this.state.start).getTime();

    while (start < _prev) {
      let unData = resourceType ? 0 : utils.getDateStr(prev, granularity);
      prev = utils.getNextPeriodDate(prev, granularity);
      _data.unshift(unData);
      _prev = new Date(prev.toISOString().substr(0, 16)).getTime();
    }
    return _data;
  }

  renderLineChart(data, granularity) {
    var title = this.state.metricType ? this.state.metricType.map(type => {
      return utils.getTitle(this.state.resourceType, type, this.props.__);
    }) : '';
    var unit = this.state.metricType ? this.state.metricType.map(u => {
      return utils.getUnit(this.state.resourceType, u);
    }) : 'B/s';
    data ? data.forEach((d, i) => {
      this.renderChart(d, 'line-chart' + count + i, unit, granularity, title, i + 1);
    }) : '';
  }

  renderPortChart(data, granularity) {
    data ? data.forEach((d, i) => {
      [d.incoming, d.outgoing].forEach((m, index) => {
        let title = utils.getTitle(this.state.resourceType, this.state.portMetricType[index], this.props.__);
        let unit = utils.getUnit(this.state.resourceType, this.state.portMetricType[index]);
        this.renderChart(m, 'port' + index + i, unit, granularity, title);
      });
    }) : '';
  }

  renderChart(data, ele, unit, granularity, title, i) {
    let _unit = i ? unit[i - 1] : unit;
    if (data.length !== 0) {
      let chart = document.getElementById(ele);
      let myChart = Echarts.init(chart);
      let chartData = this.getChartData(data, granularity, this.state.resourceType);
      let xAxis = this.getChartData(data, granularity);
      let subText = this.props.__.unit + '(' + _unit + '), ' + this.props.__.interval + granularity + 's';

      let option = this.chart(title, subText, xAxis, chartData, false, i);
      myChart.hideLoading();
      myChart.setOption(option);
    } else {
      var charts = document.getElementById(ele);
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
  }

  chart(title, subText, xAxis, chartData, receiveProps, i) {
    let _title = i ? title[i - 1] : title;
    var option = {
      title: {
        text: _title,
        subtext: subText
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

    option.tooltip = receiveProps ? {} : {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#939ba3',
          width: 2
        }
      }
    };

    return option;
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
          <div>
            {this.state.data && this.state.data.length !== 0 ? this.state.data.map((_d, i) => {
              return (
                <div id={'line-chart' + count + i} key={i} className="chart">
                </div>
              );
            }) : this.state.metricType && this.state.metricType.map((_d, i) => {
              return (
                <div id={'line-chart' + count + i} key={i} className="chart">
                  <label className="no-monitor-data">{this.props.__.no_monitor_data}</label>
                </div>
              );
            })}
            {this.state.portData && this.state.portData.length !== 0 ? this.state.portData.map((_d, i) => {
              return (
                <div key={i}>
                  <div className="port-name">{this.props.__.port + ': ' + this.state.portData[i].name}</div>
                  <div id={'port0' + i} key={'0' + i} className="chart"></div>
                  <div id={'port1' + i} key={'1' + i} className="chart"></div>
                </div>
              );
            }) : this.state.portMetricType && this.state.portMetricType.map((_d, i) => {
              return (
                <div key={i}>
                  <div className="port-name">{this.props.__.port + ': ' + this.state.portData[i].name}</div>
                  <div id={'port0' + i} key={'0' + i} className="chart"><label className="no-monitor-data">{this.props.__.no_monitor_data}</label></div>
                  <div id={'port1' + i} key={'1' + i} className="chart"><label className="no-monitor-data">{this.props.__.no_monitor_data}</label></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = ChartLine;
