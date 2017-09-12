require('./style/index.less');
//let Chart = require('client/libs/charts/index');
const Echarts = require('echarts');
const React = require('react');
const {Tab} = require('client/uskin/index');
let count = 0;

class ChartLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      granularity: props.granularity,
      item: props.item,
      tabItems: props.tabItems ? props.tabItems : [],
      start: props.start
    };
    count ++;
  }

  componentDidMount() {
    let that = this;
    this.state.data ? this.renderLineChart(this.state.data, this.state.granularity) : '';
    try {
      window.onresize = function() {
        that.state.data ? that.renderLineChart(that.state.data, that.state.granularity) : '';
      };
    } catch (e) {
      return;
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.data.length === 0) {
      return false;
    }

    return true;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      granularity: nextProps.granularity,
      item: nextProps.item,
      tabItems: nextProps.tabItems,
      start: nextProps.start
    });

    if (nextProps.data.length === 0) {
      let obj = {
        data: this.props.data
      };
      this.loadingChart(obj);
    }
    count ++;
  }

  componentDidUpdate() {
    this.renderLineChart(this.state.data, this.state.granularity);
  }

  loadingChart(obj) {
    obj.data.forEach((ds, i) => {
      let chart = document.getElementById('line-chart' + i + count);
      let myChart = Echarts.init(chart);
      let subText = this.props.__.unit + '(' + ds.unit + '), ' + this.props.__.interval + this.state.granularity + 's';
      myChart.showLoading('default', {
        text: this.props.__.loading,
        color: '#00afc8',
        textColor: '#252f3d',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0
      });
      let option = this.chart(ds.title, subText, [], ds.yAxisData, true);

      myChart.setOption(option);
    });
  }

  renderLineChart(data, granularity) {
    if (data.length !== 0) {
      data.forEach((datas, i) => {
        this.renderChart(datas.yAxisData, datas.xAxis, 'line-chart' + i + count, datas.unit, granularity, datas.title);
      });
    }
  }

  renderChart(data, xAxis, ele, unit, granularity, title, i) {
    if (data && data.length !== 0) {
      let chart = document.getElementById(ele);
      let myChart = Echarts.init(chart);
      let subText = this.props.__.unit + '(' + unit + '), ' + this.props.__.interval + granularity + 's';
      let option = this.chart(title, subText, xAxis, data, false);
      myChart.hideLoading();
      myChart.setOption(option);
    } else {
      let charts = document.getElementById(ele);
      while(charts.hasChildNodes()) {
        charts.removeChild(charts.firstChild);
      }
      let legendWp = document.createElement('div');
      let label = document.createElement('label');
      label.className = 'no-data';
      label.innerHTML = this.props.__.no_monitor_data;
      legendWp.appendChild(label);
      legendWp.className = 'legendWp';
      charts.appendChild(legendWp);
    }
  }

  chart(title, subText, xAxis, chartData, receiveProps) {
    let option = {
      title: {
        text: title,
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
    let tabItems = this.state.tabItems,
      chartData = this.state.data;

    return (
      <div className="halo-com-line-chart">
        <div>
          <div className="tabs_sm">
            {this.props.children}
            <Tab items={tabItems} type="sm" onClick={this.clickTabs.bind(this)}/>
          </div>
          <div>
            {chartData.map((charts, i) => {
              return (
                <div id={'line-chart' + i + count} key={i} className="chart">
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
