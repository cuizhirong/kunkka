const React = require('react');
const Chart = require('echarts');
const __ = require('locale/client/dashboard.lang.json');
const utils = require('../../utils');
const contant = require('./constant');
const helper = require('./helper');

let lineChart;
const hour = Number(HALO.configs.telemerty.hour),
  day = Number(HALO.configs.telemerty.day),
  week = Number(HALO.configs.telemerty.week),
  month = Number(HALO.configs.telemerty.month),
  year = Number(HALO.configs.telemerty.year);

class Modal extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    lineChart = Chart.init(document.getElementById('alarm_config_chart'));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.state.loadingChart) {
      this.loadingChart();
    }
  }

  updateGraph(data, granularity, threshold) {
    this.updateChartData(data, granularity, threshold);
  }

  updateChartData(data, granularity, threshold) {
    const state = this.props.state;
    let unit = helper.getMetricUnit(state.resourceType, state.metricType);
    let title = __.unit + '(' + unit + '), ' + __.alarm_interval + granularity + 's';
    let measures = [];
    let xAxis = [];
    function fixMeasure(num) {
      return Math.round(num * 100) / 100;
    }

    data.forEach((ele) => {
      measures.push(fixMeasure(ele[2]));
      let date = new Date(ele[0]);
      xAxis.push(helper.getDateStr(date, granularity));
    });

    let prev;
    if (data.length > 0) {
      prev = new Date(data[0][0]);
    } else {
      prev = new Date();
    }

    const DOTS_TIME = this.getTime(granularity);
    const DOTS_NUM = this.getDotsNumber(granularity, prev);

    if (data.length < DOTS_NUM) {
      let length = DOTS_NUM - data.length;

      while (length > 0 && DOTS_TIME < prev.getTime()) {
        prev = this.getNextPeriodDate(prev, granularity);
        xAxis.unshift(helper.getDateStr(prev, granularity));
        measures.unshift(0);
        length--;
      }
    }

    let thresholds = [];
    for (let i = 0; i < measures.length; i++) {
      thresholds[i] = threshold;
    }

    this.updateChart({ unit, title, xAxis, measures, thresholds, name: utils.getMetricName(state.metricType) });
  }

  getTime(granularity) {
    let now = new Date();
    let date;
    switch(granularity) {
      case contant.GRANULARITY_HOUR:
        date = now.getTime() - 3 * 3600 * 1000;
        break;
      case contant.GRANULARITY_DAY:
        date = now.getTime() - 24 * 3600 * 1000;
        break;
      case contant.GRANULARITY_WEEK:
        date = now.getTime() - 7 * 24 * 3600 * 1000;
        break;
      case contant.GRANULARITY_MONTH:
        date = now.getTime() - 30 * 24 * 3600 * 1000;
        break;
      case contant.GRANULARITY_YEAR:
        date = now.getTime() - 365 * 24 * 3600 * 1000;
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

  updateChart({ unit, title, xAxis, measures, thresholds, name }) {
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
        right: '10%',
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
        data: measures
      }, {
        name: __.threshold,
        type:'line',
        data: thresholds
      }],
      animation: false,
      color: ['#00afc8', '#e05c69']
    });
  }

  onChange(field, e) {
    let value = e.target.value;
    if (field === 'threshold' && isNaN(value)) {
      return;
    }

    const onChangeState = this.props.onChangeState;
    onChangeState(field, value);
  }

  render() {
    const state = this.props.state;
    let { metricType } = state;
    let unit = helper.getMetricUnit(state.resourceType, state.metricType);

    return (
      <div className="page alarm-config">
        <div className="alarm-threshold">
          <div className="alarm-config-title">
            {__.alarm_threshold}
          </div>
          <div className="alarm-config-content">
            <div className="row">
              <div className="modal-label">
                <strong>* </strong>
                {__.name}
              </div>
              <div className="modal-data modal-data-long">
                <input value={state.name} onChange={this.onChange.bind(this, 'name')} />
              </div>
            </div>
            <div className="row">
              <div className="modal-label">
                {__.desc}
              </div>
              <div className="modal-data modal-data-long">
                <input value={state.descrition} onChange={this.onChange.bind(this, 'descrition')} />
              </div>
            </div>
            <div className="row">
              <div className="modal-label">
                <strong>* </strong>
                {utils.getMetricName(metricType)}
              </div>
              <div className="modal-data modal-data-utilization">
                <select value={state.comparisonOperator} onChange={this.onChange.bind(this, 'comparisonOperator')}>
                  <option value="gt">{'>'}</option>
                  <option value="lt">{'<'}</option>
                </select>
                <input value={state.threshold} onChange={this.onChange.bind(this, 'threshold')} />
                <span>{unit}</span>
              </div>
            </div>
            <div className="row">
              <div className="modal-label">
                {__.periods}
              </div>
              <div className="modal-data">
                <select value={state.granularity} onChange={this.onChange.bind(this, 'granularity')}>
                  {/*<option value="60">1 min</option>*/}
                  <option value="300">5 min</option>
                  <option value="900">15 min</option>
                  <option value="1800">30 min</option>
                  <option value="6000">1 h</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="modal-label">
                <strong>* </strong>
                {__.for}
              </div>
              <div className="modal-data modal-data-for">
                <input value={state.evaluationPeriods} onChange={this.onChange.bind(this, 'evaluationPeriods')} />
                <span>{__.consecutive_period}</span>
              </div>
            </div>
            <div className="row">
              <div className="modal-label">
                {__.statistics}
              </div>
              <div className="modal-data">
                <select value={state.aggregationMethod} onChange={this.onChange.bind(this, 'aggregationMethod')}>
                  <option value="max">maximum</option>
                  <option value="min">minimum</option>
                  <option value="mean">average</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="alarm-preview">
          <div className="alarm-config-title">
            {__.alarm_preview}
          </div>
          <div className="alarm-config-content">
            {/*<div id="alarm_config_chart_no_data" className="no-data-msg" />*/}
            <div id="alarm_config_chart" />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Modal;
