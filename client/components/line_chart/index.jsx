require('./style/index.less');
//let Chart = require('client/libs/charts/index');
const Echarts = require('echarts');
const React = require('react');
const {Tab} = require('client/uskin/index');

class ChartLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      granularity: props.granularity,
      item: props.item,
      tabItems: props.tabItems ? props.tabItems : [],
      start: props.start,
      className: props.className || 'line-chart' + parseInt(Math.random() * 100, 10),
      charts: []
    };
  }

  componentDidMount() {
    this.getChartInstance();
  }

  getChartInstance() {
    let that = this;
    let myCharts = [], myChart;

    this.state.data.forEach((ds, i) => {
      let chart = document.getElementById(this.state.className + i);
      myCharts[i] && myCharts[i].dispose();
      myChart = Echarts.init(chart);
      myCharts.push(myChart);
    });

    this.setState({
      charts: myCharts
    }, () => {
      this.state.data ? this.renderLineChart(this.state.data, this.state.granularity) : '';
      try {
        window.onresize = function() {
          that.state.data ? that.renderLineChart(that.state.data, that.state.granularity) : '';
        };
      } catch (e) {
        return;
      }
    });
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
  }

  componentDidUpdate() {
    this.renderLineChart(this.state.data, this.state.granularity);
  }

  loadingChart(obj) {
    obj.data.forEach((ds, i) => {
      let myChart = this.state.charts[i];

      let subText = this.props.__.unit + '(' + ds.unit + '), ' + this.props.__.interval + this.state.granularity + 's';
      myChart.showLoading('default', {
        text: this.props.__.loading,
        color: '#00afc8',
        textColor: '#252f3d',
        maskColor: 'rgba(255, 255, 255, 0.8)',
        zlevel: 0
      });
      let option = this.chart(ds.title, subText, [], ds.yAxisData, true, ds.color);

      myChart.setOption(option);
    });
  }

  renderLineChart(data, granularity) {
    if (data.length !== 0) {
      data.forEach((datas, i) => {
        this.renderChart(datas.yAxisData, datas.xAxis, this.state.className + i, datas.unit, granularity, datas.title, i, datas.color);
      });
    }
  }

  renderChart(data, xAxis, ele, unit, granularity, title, i, color) {
    let charts = document.getElementById(ele);
    charts.childNodes.forEach((child, index) => {
      if (child.className === 'legendWp') {
        charts.removeChild(child);
      }
    });
    if (data && data.length === 0) {
      let legendWp = document.createElement('div');
      let label = document.createElement('label');
      label.className = 'no-data';
      label.innerHTML = this.props.__.no_monitor_data;
      legendWp.appendChild(label);
      legendWp.className = 'legendWp';
      charts.appendChild(legendWp);
    }
    let myChart = this.state.charts[i];
    let subTexty = this.props.__.unit + '(' + unit + '), ' + this.props.__.interval + granularity + 's';
    let option = this.chart(title, subTexty, xAxis, data, false, color);
    myChart.hideLoading();
    myChart.setOption(option);
  }

  chart(title, subTexty, xAxis, chartData, receiveProps, colors) {
    let option = {
      title: {
        text: title,
        subtext: subTexty,
        textStyle: {
          fontSize: 14,
          color: '#252F3D'
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
            color: ['#999999']
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: ['#999999']
          }
        }
      },
      series: [{
        name: '总量',
        type: 'line',
        data: chartData
      }],
      animation: false,
      color: [colors],
      textStyle: {
        fontFamily: 'MicrosoftYaHei'
      },
      backgroundColor: ['#ffffff']
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


  chartZoom(e){
    let ev = e || window.event, page,
      target = ev.target || ev.srcElement;
    if (target.nodeName.toLocaleLowerCase() === 'canvas') {
      page = parseInt(target.parentNode.parentNode.id.split(this.state.className)[1], 10);
    }

    this.props.clickParent && this.props.clickParent(page + 1);
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
          <div id="parent" style={this.props.style} onClick={this.chartZoom.bind(this)}>
            {chartData.map((charts, i) => {
              return (
                <div id={this.state.className + i} key={i} className="chart">
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
