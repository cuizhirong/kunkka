require('./style/index.less');

const React = require('react');
const {Button, Tab, Calendar} = require('client/uskin/index');
/**
 * echart parts list
 * https://github.com/ecomfe/echarts/blob/master/index/part.js
 *
 * wrong: const Echarts = require('echarts');
 * right: see below
 */
const Chart = require('echarts/lib/echarts');
require('echarts/lib/chart/line');
require('echarts/lib/chart/pie');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/title');

const moment = require('moment');

const request = require('./request');
const __ = require('locale/client/bill.lang.json');
const CountUp = require('../../utils/countUp.js');
const chartOption = require('../../utils/chart_option.js');
const getIcons = require('./get_icons');
const COLOR_LIST = require('../../utils/color_list.js');
let pieChart, lineChart, holderChart;
let monthData, dayData;
let appPie = {
  currentIndex: -1
};
// 用于判断是否所有数据都加载完成
let loadingIndex = 0;

class Model extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      services: [],
      sum: 0,
      currentLine: 'month',
      loadingLineChart: true,
      loadingPieChart: true,
      startTime: null,
      endTime: null,
      hoverIndex: -1,
      loading: true,
      balance: '...',
      price_per_hour: '...',
      remaining_day: '...'
    };

    ['onInitialize', 'onSwitchProject', 'onSwitchRegion',
      'onChangeStartTime', 'onChangeEndTime', 'onQuery',
      'refresh', 'checkLoading'].forEach((m) => {
        this[m] = this[m].bind(this);
      });
  }

  componentWillMount() {
    let that = this;
    // update charts data
    setInterval(() => {
      that.onInitialize();
    }, 60 * 60 * 1000);
  }

  componentDidMount() {
    pieChart = Chart.init(document.getElementById('pie-chart'));
    lineChart = Chart.init(document.getElementById('line-chart'));
    holderChart = Chart.init(document.getElementById('loading-holder'));
    this.loadingChart(pieChart);
    this.loadingChart(holderChart);
    try {
      window.onresize = () => {
        lineChart.resize();
      };
    } catch(e) {
      return;
    }
    // 为了解决ie下无法自动初始化宽度的bug，手动调用resize。
    lineChart.resize();
    this.onInitialize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  // componentWillReceiveProps(nextProps) {
  //   if(nextProps.style.display !== 'none' && this.props.style.display === 'none') {
  //   }
  // }

  onInitialize() {
    this.getBalance();
    this.getList();
    this.getTrend('month');
  }

  // 数字动效
  countingNumber(ele, number) {
    new CountUp(ele, 0, number, 2, 1).start();
  }

  loadingChart(chart) {
    chart.clear();
    chart.showLoading('default', {
      text: __.loading,
      color: '#00afc8',
      textColor: '#252f3d',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0
    });
  }

  upDatePieChart() {
    pieChart.hideLoading();
    chartOption.pieNormalOption.series[0].data = this.state.services;
    pieChart.setOption(chartOption.pieNormalOption);
  }

  upDateLineChart(xAxis, data) {
    lineChart.hideLoading();
    chartOption.lineChartOption.xAxis.data = xAxis;
    chartOption.lineChartOption.series = [{
      name: __.sum,
      type: 'line',
      smooth: true,
      data: data
    }];
    lineChart.setOption(chartOption.lineChartOption);
  }

  checkLoading() {
    loadingIndex++;
    if(loadingIndex >= 3) {
      loadingIndex = 0;
      this.setState({
        loading: false
      });
    }
  }

  getBalance() {
    request.getBalance().then(res => {
      this.checkLoading();
      let newState = {
        balance: res.balance,
        price_per_hour: res.price_per_hour
      };
      if(res.remaining_day === -1) {
        newState.remaining_day = '充足';
      } else if(res.remaining_day === -2) {
        newState.remaining_day = '欠费';
      } else {
        newState.remaining_day = res.remaining_day + __.day;
      }
      this.setState(newState);
    });
  }

  // 因为api较慢，所以先获取到所有的services，然后加载所有的service，加载一个显示一个
  getList(startTime, endTime) {
    if(startTime && endTime) {
      this.loadingChart(pieChart);
      this.loadingChart(holderChart);
    }
    let num = 0,
      totalLength = 0,
      sum = 0;
    request.getServices().then((res) => {
      totalLength = res.services.length;
      res.services.map(s => s.value = '...');
      this.setState({
        services: res.services
      }, () => {
        holderChart.hideLoading();
        res.services.forEach((r, i) => {
          request.getPriceByService(r.name, startTime, endTime).then((result) => {
            let services = this.state.services;
            // current sum
            let _sum = result.length > 0 ? result.reduce((prev, cur) => +(prev) + +cur[2], 0) : 0;
            num += 1;
            // calculate total sum
            sum += _sum;
            services[i].value = _sum.toFixed(2);
            this.setState({
              services: services
            }, () => {
              this.countingNumber('counting_' + i, this.state.services[i].value);
            });
            if(num === totalLength) {
              this.setState({
                sum: sum.toFixed(2)
              }, () => {
                this.setState({
                  loadingPieChart: false
                });
                this.countingNumber('sum-number', this.state.sum);
                this.upDatePieChart();
                this.checkLoading();
              });
            }
          });
        });
      });
    });
  }

  // 获取按天和按月显示的数据并且展示
  getTrend(time) {
    if(monthData && time === 'month') {
      this.upDateLineChart(monthData.xAxis, monthData.data);
    } else if(dayData && time === 'day') {
      this.upDateLineChart(dayData.xAxis, dayData.data);
    } else {
      this.loadingChart(lineChart);
      this.setState({
        loadingLineChart: true
      });
      request.getTrend().then((res) => {
        let chartMonthData = this.processMonthData(res[0]);
        let chartDayData = this.processDayData(res[1]);
        if(time === 'month') {
          this.upDateLineChart(chartMonthData.xAxis, chartMonthData.data);
        } else {
          this.upDateLineChart(chartDayData.xAxis, chartDayData.data);
        }
        this.setState({
          loadingLineChart: false
        });
        this.checkLoading();
      });
    }
  }

  // 处理按月显示的数据
  // 如果数据不够12个，向前推，没有数据的月份补0
  processMonthData(res) {
    let resLength = res.length;
    let xAxisHolder = [];
    let dataHolder = [];
    let xAxis = [];
    let data = [];
    res.forEach((r) => {
      xAxis.push(r[0].slice(0, 10));
      data.push(+r[2].toFixed(2));
    });
    if(resLength < 12) {
      for(let i = 0; i < 12 - resLength; i++) {
        xAxisHolder[i] = moment(resLength === 0 ? new Date() : res[0][0]).subtract(12 - resLength - i, 'months').format().slice(0, 10);
        dataHolder[i] = 0;
      }
      xAxis = xAxisHolder.concat(xAxis);
      data = dataHolder.concat(data);
    }
    monthData = {
      xAxis: xAxis,
      data: data
    };
    return monthData;
  }

  // 处理按天显示的数据
  // 如果数据不够30个，向前推，没有数据的天数补0
  processDayData(res) {
    let resLength = res.length;
    let xAxisHolder = [];
    let dataHolder = [];
    let xAxis = [];
    let data = [];
    res.forEach((r) => {
      xAxis.push(r[0].slice(0, 10));
      data.push(+r[2].toFixed(2));
    });
    if(resLength < 31) {
      for(let i = 0; i < 31 - resLength; i++) {
        xAxisHolder[i] = moment(resLength === 0 ? new Date() : res[0][0]).subtract(30 - resLength - i, 'days').format().slice(0, 10);
        dataHolder[i] = 0;
      }
      xAxis = xAxisHolder.concat(xAxis);
      data = dataHolder.concat(data);
    }
    dayData = {
      xAxis: xAxis,
      data: data
    };
    return dayData;
  }

  // hover状态下图表dispatch相应事件
  onHoverItem(i) {
    if(i === appPie.currentIndex || this.state.loadingPieChart) {
      return;
    }
    this.setState({
      hoverIndex: i
    });
    // cancel prev highlight
    pieChart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0,
      dataIndex: appPie.currentIndex
    });
    appPie.currentIndex = i;
    // highlight
    pieChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: appPie.currentIndex
    });
    // show tooltip
    pieChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 0,
      dataIndex: appPie.currentIndex
    });
  }

  // 从hover状态离开后图表dispatch相应事件
  onMoveOutItem() {
    if(this.state.loadingPieChart) {
      return;
    }
    this.setState({
      hoverIndex: -1
    });
    pieChart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0,
      dataIndex: appPie.currentIndex
    });
    pieChart.dispatchAction({
      type: 'hideTip',
      seriesIndex: 0,
      dataIndex: appPie.currentIndex
    });
    appPie.currentIndex = -1;
  }

  // 切换按月／按天展示
  onSwitchLineChart(time) {
    if(this.state.loadingLineChart) {
      return;
    }
    this.setState({
      currentLine: time
    });
    this.getTrend(time);
  }

  // 切换region
  onSwitchRegion(e) {
    request.switchRegion(e.target.value).then(() => {
      window.location.reload();
    });
  }

  // 切换项目
  onSwitchProject(e) {
    request.switchProject(e.target.value).then(() => {
      window.location.reload();
    });
  }

  // 日历组件（开始事件）响应事件
  onChangeStartTime(time) {
    let date = new Date(time.year + '-' + time.month + '-' + time.date);
    this.setState({
      startTime: date
    });
  }

  // 日历组件（结束事件）响应事件
  onChangeEndTime(time) {
    let date = new Date(time.year + '-' + time.month + '-' + time.date);
    this.setState({
      endTime: date
    });
  }

  // 查询按钮响应事件
  onQuery() {
    let state = this.state;
    if(state.loadingPieChart || !state.startTime || !state.endTime) {
      return;
    }
    this.getList(state.startTime, state.endTime);
  }

  // 刷新
  refresh() {
    this.loadingChart(pieChart);
    this.loadingChart(lineChart);
    monthData = undefined;
    dayData = undefined;
    this.setState({
      balance: '...',
      price_per_hour: '...',
      remaining_day: '...'
    }, () => {
      this.onInitialize();
    });
  }

  render() {
    let tabs = [{
      name: __['bill-overview'],
      key: 'bill-overview',
      default: true
    }];

    let state = this.state;
    let regions = HALO.region_list;
    let projects = HALO.user.projects;
    let iconStyle = state.hoverIndex < 0 ? {} : {
      color: COLOR_LIST[state.hoverIndex]
    };
    return (
      <div className="halo-module-bill-overview" style={this.props.style}>
        <div className="tab-wrapper">
          <Tab items={tabs} />
        </div>
        <div className="balance-wrapper">
          <span className="wrapper"><span className="name">{__.account_balance}: </span><span className="value">{state.balance} 元</span></span>
          <span className="wrapper"><span className="name">{__.price_per_hour}: </span><span className="value">{state.price_per_hour} 元</span></span>
          <span className="wrapper"><span className="name">{__.remaining_day}: </span><span className="value">{state.remaining_day}</span></span>
        </div>
        <div className="header">
          <select value={HALO.current_region} onChange={this.onSwitchRegion}>
            {
              regions.map((region) => {
                return <option key={region.id} value={region.id}>{region.name}</option>;
              })
            }
          </select>
          <select value={HALO.user.projectId} onChange={this.onSwitchProject}>
            {
              projects.map((project) => {
                return <option key={project.id} value={project.id}>{project.name}</option>;
              })
            }
          </select>
          <div className="calendar-wrapper">
            <span>{__.from}</span><Calendar onChange={this.onChangeStartTime} width={'102px'} hasScreen={true} unfold={false} placeholder={__.start_time} />
            <span>{__.to}</span><Calendar onChange={this.onChangeEndTime} width={'102px'} hasScreen={true} unfold={false} placeholder={__.end_time} />
            <Button value={__.query} btnKey="normal" disabled={state.loading} onClick={this.onQuery} />
            <Button iconClass="refresh" btnKey="normal" disabled={state.loading} initial={true} onClick={this.refresh} />
          </div>
        </div>
        <div className="center">
          <div className="sum-wrapper">
            <div id="pie-chart"></div>
            <div className="center-text">
              <div className="number">¥<span id="sum-number"></span></div>
              <div className="text">{__.total_amount}</div>
            </div>
          </div>
          <div className="resources-wrapper">
          <div id="loading-holder"></div>
          {
            state.services.map((p, i) => {
              return <div key={i} className="item-wrapper">
                <div className="item" onMouseOver={this.onHoverItem.bind(this, i)} onMouseLeave={this.onMoveOutItem.bind(this)} >
                  <div className="child-wrapper">
                    <div className="title">
                      <i style={(i === state.hoverIndex) ? iconStyle : {}} className={'glyphicon icon-' + getIcons(p.name)}></i>{__[p.name]}
                    </div>
                    <div className="value">¥<span id={'counting_' + i}>...</span></div>
                  </div>
                </div>
              </div>;
            })
          }
          </div>
        </div>
        <div className="footer">
          <div className="content">
            <div id="line-chart"></div>
            <div className="btn-wrapper">
              <div className={'left' + (state.currentLine === 'month' ? ' select' : '')} onClick={this.onSwitchLineChart.bind(this, 'month')}>{__.by_month}</div>
              <div className={'right' + (state.currentLine === 'day' ? ' select' : '')} onClick={this.onSwitchLineChart.bind(this, 'day')}>{__.by_day}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Model;
