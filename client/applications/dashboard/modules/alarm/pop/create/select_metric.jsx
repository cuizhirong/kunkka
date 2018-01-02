const React = require('react');
const {Button, ButtonGroup} = require('client/uskin/index');
const Chart = require('echarts');
const SelectTable = require('./select_table');
const __ = require('locale/client/dashboard.lang.json');
const utils = require('../../utils');
const constant = require('./constant');
const helper = require('./helper');

let lineChart;
let lineChartMsg;

const hour = Number(HALO.configs.telemerty.hour),
  day = Number(HALO.configs.telemerty.day),
  week = Number(HALO.configs.telemerty.week),
  month = Number(HALO.configs.telemerty.month),
  year = Number(HALO.configs.telemerty.year);

class Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      granularity: hour
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
      xAxis.push(helper.getDateStr(date, granularity));
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
        xAxis.unshift(helper.getDateStr(prev, granularity));
        yAxis.unshift(0);
        length--;
      }
    }

    this.updateChart({ unit, title, xAxis, yAxis, name: utils.getMetricName(state.metricType) });
  }

  getTime(granularity) {
    let now = new Date();
    let date;
    switch(granularity) {
      case constant.GRANULARITY_HOUR:
        date = now.getTime() - 3 * 3600 * 1000;
        break;
      case constant.GRANULARITY_DAY:
        date = now.getTime() - 24 * 3600 * 1000;
        break;
      case constant.GRANULARITY_WEEK:
        date = now.getTime() - 7 * 24 * 3600 * 1000;
        break;
      case constant.GRANULARITY_MONTH:
        date = now.getTime() - 30 * 24 * 3600 * 1000;
        break;
      default:
        date = now.getTime() - 3 * 3600 * 1000;
        break;
    }
    return date;
  }

  getDotsNumber(granularity, prev) {
    switch (Number(granularity)) {
      case hour:
        return (60 * 60 * 3) / hour;
      case day:
        return (60 * 60 * 24) / day;
      case week:
        return (60 * 60 * 24 * 7) / week;
      case month:
        return (60 * 60 * 24 * 30) / month;
      case year:
        return (60 * 60 * 24 * 365) / year;
      default:
        return 0;
    }
  }

  getNextPeriodDate(prev, granularity) {
    switch (Number(granularity)) {
      case hour:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 1);
      case day:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 5);
      case week:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 10);
      case month:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 1, prev.getMinutes());
      case year:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 3);
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
        left: '5%',
        right: '5%',
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
    this.props.onChangeState('granularityKey', Number(granularity));
  }

  onChangeSearch(text, isClicked) {
    let setState = this.props.onChangeState;

    setState('searchResource', text.trim());
  }

  render() {
    const state = this.props.state;
    let granularityKey = state.granularityKey;
    let {resources} = state;

    let recentHour = __.recent_hours.replace('{0}', constant.RECENT_HOUR);
    let recentDay = __.recent_day.replace('{0}', constant.RECENT_DAY);
    let recentWeek = __.recent_week.replace('{0}', constant.RECENT_WEEK);
    let recentMonth = __.recent_month.replace('{0}', constant.RECENT_MONTH);
    let recentYear = __.recent_year.replace('{0}', constant.RECENT_YEAR);

    return (
      <div className="page select-metric">
        <div className="select-box">
          <SelectTable state={state} items={resources} onClick={this.onClickResource} onChangeSearch={this.onChangeSearch} />
        </div>
        <div className="chart-box">
          <div className="granularity-box">
            <ButtonGroup>
              <Button btnKey={hour + ''} value={recentHour} type="status" onClick={this.onClickPeriod} selected={granularityKey === constant.GRANULARITY_HOUR} />
              <Button btnKey={day + ''} value={recentDay} type="status" onClick={this.onClickPeriod} selected={granularityKey === constant.GRANULARITY_DAY} />
              <Button btnKey={week + ''} value={recentWeek} type="status" onClick={this.onClickPeriod} selected={granularityKey === constant.GRANULARITY_WEEK} />
              <Button btnKey={month + ''} value={recentMonth} type="status" onClick={this.onClickPeriod} selected={granularityKey === constant.GRANULARITY_MONTH} />
              <Button btnKey={year + ''} value={recentYear} type="status" onClick={this.onClickPeriod} selected={granularityKey === constant.GRANULARITY_YEAR} />
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
