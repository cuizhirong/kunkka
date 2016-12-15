var React = require('react');
var {Button, ButtonGroup} = require('client/uskin/index');
var Chart = require('client/libs/charts/index');
var MultiDropdown = require('./dropdown');
var __ = require('locale/client/dashboard.lang.json');
var utils = require('../../utils');
var contant = require('./constant');
var helper = require('./helper');

let lineChart;

class Modal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      granularity: 300
    };

    ['onClickPeriod', 'onClickDropdown', 'unfoldDropdown'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    lineChart = new Chart.LineChart(document.getElementById('select_metric_chart'));
  }

  updateGraph(data, granularity) {
    this.updateChartData(data, granularity);
  }

  updateChartData(data, granularity) {
    const state = this.props.state;
    let unit = helper.getMetricUnit(state.resourceType, state.metricType);
    let title = __.unit + '(' + unit + '), ' + __.alarm_interval + granularity + 's';
    let yAxis = [];
    let xAxis = [];

    data.forEach((ele) => {
      yAxis.push(ele[1]);
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

    this.updateChart({ unit, title, xAxis, yAxis });
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

  updateChart({ unit, title, xAxis, yAxis }) {
    lineChart.setOption({
      unit: unit,
      title: title,
      xAxis: {
        color: '#f2f3f4',
        data: xAxis
      },
      yAxis: {
        color: '#f2f3f4',
        tickPeriod: 1000,
        tickColor: '#939ba3'
      },
      series: [{
        color: '#1797c6',
        data: yAxis,
        opacity: 0.05,
        type: 'sharp'
      }],
      period: 1600,
      easing: 'easeOutCubic'
    });
  }

  onClickDropdown(e, status) {
    let type = status.key;
    if (type === 'cpu_util' || type === 'disk.read.bytes.rate' ||
        type === 'disk.write.bytes.rate' || type === 'memory.usage') {
      this.unfoldDropdown(false);

      this.props.onChangeState('resource', status.resource);
      this.props.onChangeState('resourceType', status.resourceType);
      this.props.onChangeState('metricType', status.key);
    }
  }

  onClickPeriod(e, granularity) {
    this.props.onChangeState('measureGranularity', granularity);
  }

  unfoldDropdown(unfold) {
    this.refs.multidropdown.setState({
      unfold: unfold
    });
  }

  render() {
    const state = this.props.state;
    let granularity = state.measureGranularity;
    let { resource, resources, resourceType, metricType } = state;

    let recentHour = __.recent_hours.replace('{0}', contant.RECENT_HOUR);
    let recentDay = __.recent_day.replace('{0}', contant.RECENT_DAY);
    let recentWeek = __.recent_week.replace('{0}', contant.RECENT_WEEK);
    let recentMonth = __.recent_month.replace('{0}', contant.RECENT_MONTH);

    let dropdownValue = '';
    if (state.resource) {
      dropdownValue = __[resourceType] + ' / ' + (resource.name ? resource.name : resource.id.substr(0, 8)) + ' / ' + utils.getMetricName(metricType);
    } else {
      dropdownValue = __.pls_select_resource_type;
    }

    return (
      <div className="page select-metric">
        <div className="select-box">
          <MultiDropdown ref="multidropdown" items={resources} onClick={this.onClickDropdown} value={dropdownValue} />
          <ButtonGroup>
            <Button btnKey={contant.GRANULARITY_HOUR} value={recentHour} type="status" onClick={this.onClickPeriod} selected={granularity === contant.GRANULARITY_HOUR} />
            <Button btnKey={contant.GRANULARITY_DAY} value={recentDay} type="status" onClick={this.onClickPeriod} selected={granularity === contant.GRANULARITY_DAY} />
            <Button btnKey={contant.GRANULARITY_WEEK} value={recentWeek} type="status" onClick={this.onClickPeriod} selected={granularity === contant.GRANULARITY_WEEK} />
            <Button btnKey={contant.GRANULARITY_MONTH} value={recentMonth} type="status" onClick={this.onClickPeriod} selected={granularity === contant.GRANULARITY_MONTH} />
          </ButtonGroup>
        </div>
        <div id="select_metric_chart" className="chart-box" />
      </div>
    );
  }
}

module.exports = Modal;
