var React = require('react');
var {Button, ButtonGroup} = require('client/uskin/index');
var Chart = require('echarts');
var SelectTable = require('./select_table');
var __ = require('locale/client/dashboard.lang.json');
var utils = require('../../utils');
var constant = require('./constant');
var helper = require('./helper');

let lineChart;
let lineChartMsg;

class Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      granularity: 300
    };

    ['onClickPeriod', 'onClickResource', 'onChangeSearch'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    lineChart = Chart.init(document.getElementById('select_metric_chart'));
    lineChartMsg = document.getElementById('select_metric_chart_no_data');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.state.loadingChart) {
      this.hideChartMsg();
      this.loadingChart();
    }
  }

  updateGraph(data, granularity) {
    if (data.length > 0) {
      this.hideChartMsg();

      this.updateChartData(data, granularity);
    } else {
      this.showChartMsg();
      this.updateChartMsg(__.there_is_no + __.data);

      this.props.onChangeState('loadingChart', false);
      lineChart.hideLoading();
    }
  }

  showChartMsg() {
    if (lineChartMsg.classList.contains('hide')) {
      lineChartMsg.classList.remove('hide');
    }
  }

  hideChartMsg() {
    if (!lineChartMsg.classList.contains('hide')) {
      lineChartMsg.classList.add('hide');
    }
  }

  updateChartMsg(msg) {
    lineChartMsg.innerHTML = msg;
  }

  updateChartData(data, granularity) {
    const state = this.props.state;
    let unit = helper.getMetricUnit(state.resourceType, state.metricType);
    let title = __.unit + '(' + unit + '), ' + __.alarm_interval + granularity + 's';
    let yAxis = [];
    let xAxis = [];
    function fixMeasure(num) {
      return Math.round(num * 100) / 100;
    }

    data.forEach((ele) => {
      switch (state.metricType) {
        // case 'cpu_util':
          // yAxis.push(fixMeasure(ele[2] * 100));
          // break;
        default:
          yAxis.push(fixMeasure(ele[2]));
          break;
      }

      let date = new Date(ele[0]);
      xAxis.push(helper.getDateStr(date));
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
        xAxis.unshift(helper.getDateStr(prev));
        yAxis.unshift(0);
        length--;
      }
    }

    this.updateChart({ unit, title, xAxis, yAxis, name: utils.getMetricName(state.metricType) });
  }

  getDotsNumber(granularity, prev) {
    switch (granularity) {
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
    switch (granularity) {
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

  loadingChart() {
    lineChart.clear();
    lineChart.showLoading('default', {
      text: __.loading,
      color: '#00afc8',
      textColor: '#252f3d',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0
    });
  }

  updateChart({ unit, title, xAxis, yAxis, name }) {
    this.props.onChangeState('loadingChart', false);

    lineChart.hideLoading();
    lineChart.setOption({
      title: {
        text: title
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxis
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: name,
        type:'line',
        stack: '总量',
        data: yAxis
      }],
      animation: false,
      color: ['#00afc8']
    });
  }

  onClickResource(item, e) {
    let setState = this.props.onChangeState;

    setState('loadingChart', true);
    setState('resource', item.resource);
    setState('resourceType', item.resourceType);
    setState('metricType', item.metricType);
  }

  onClickPeriod(e, granularity) {
    if (this.props.state.resource) {
      this.props.onChangeState('loadingChart', true);
    }
    this.props.onChangeState('measureGranularity', Number(granularity));
  }

  onChangeSearch(text, isClicked) {
    let setState = this.props.onChangeState;

    setState('searchResource', text.trim());
  }

  render() {
    const state = this.props.state;
    let granularity = state.measureGranularity;
    let {resources} = state;

    let recentHour = __.recent_hours.replace('{0}', constant.RECENT_HOUR);
    let recentDay = __.recent_day.replace('{0}', constant.RECENT_DAY);
    let recentWeek = __.recent_week.replace('{0}', constant.RECENT_WEEK);
    let recentMonth = __.recent_month.replace('{0}', constant.RECENT_MONTH);

    return (
      <div className="page select-metric">
        <div className="select-box">
          <SelectTable state={state} items={resources} onClick={this.onClickResource} onChangeSearch={this.onChangeSearch} />
        </div>
        <div className="chart-box">
          <div className="granularity-box">
            <ButtonGroup>
              <Button btnKey={'' + constant.GRANULARITY_HOUR} value={recentHour} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_HOUR} />
              <Button btnKey={'' + constant.GRANULARITY_DAY} value={recentDay} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_DAY} />
              <Button btnKey={'' + constant.GRANULARITY_WEEK} value={recentWeek} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_WEEK} />
              <Button btnKey={'' + constant.GRANULARITY_MONTH} value={recentMonth} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_MONTH} />
            </ButtonGroup>
          </div>
          <div className="chart-content">
            <div id="select_metric_chart_no_data" className="no-data-msg" />
            <div id="select_metric_chart" />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Modal;
