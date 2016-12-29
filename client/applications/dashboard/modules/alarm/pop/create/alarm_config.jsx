var React = require('react');
var Chart = require('echarts');
var __ = require('locale/client/dashboard.lang.json');
var utils = require('../../utils');
var contant = require('./constant');
var helper = require('./helper');

let lineChart;

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

  getDotsNumber(granularity, prev) {
    switch (granularity) {
      case contant.GRANULARITY_HOUR:
        return 36;
      case contant.GRANULARITY_DAY:
        return 96;
      case contant.GRANULARITY_WEEK:
        return 168;
      case contant.GRANULARITY_MONTH:
        let date = new Date(prev.getFullYear(), prev.getMonth(), 0);
        return 4 * date.getDate();
      default:
        return 0;
    }
  }

  getNextPeriodDate(prev, granularity) {
    switch (granularity) {
      case contant.GRANULARITY_HOUR:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 5);
      case contant.GRANULARITY_DAY:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours(), prev.getMinutes() - 15);
      case contant.GRANULARITY_WEEK:
        return new Date(prev.getFullYear(), prev.getMonth(), prev.getDate(), prev.getHours() - 1);
      case contant.GRANULARITY_MONTH:
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
        type: 'log'
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
                  <option value="60">1 min</option>
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
            <div id="alarm_config_chart" className="chart-box" />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Modal;
