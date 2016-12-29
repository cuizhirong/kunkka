var React = require('react');
var {Button, ButtonGroup} = require('client/uskin/index');
var Chart = require('echarts');
var MultiDropdown = require('./dropdown');
var __ = require('locale/client/dashboard.lang.json');
var utils = require('../../utils');
var constant = require('./constant');
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
    lineChart = Chart.init(document.getElementById('select_metric_chart'));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.state.loadingChart) {
      this.loadingChart();
    }
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

  onClickDropdown(status, e) {
    let type = status.key;
    if (type === 'cpu_util' || type === 'disk.read.bytes.rate' ||
        type === 'disk.write.bytes.rate' || type === 'memory.usage') {
      this.unfoldDropdown(false);

      this.props.onChangeState('loadingChart', true);
      this.props.onChangeState('resource', status.resource);
      this.props.onChangeState('resourceType', status.resourceType);
      this.props.onChangeState('metricType', status.key);
    }
  }

  onClickPeriod(e, granularity) {
    this.props.onChangeState('loadingChart', true);
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

    let recentHour = __.recent_hours.replace('{0}', constant.RECENT_HOUR);
    let recentDay = __.recent_day.replace('{0}', constant.RECENT_DAY);
    let recentWeek = __.recent_week.replace('{0}', constant.RECENT_WEEK);
    let recentMonth = __.recent_month.replace('{0}', constant.RECENT_MONTH);

    let dropdownValue = '';
    if (state.resource) {
      dropdownValue = __[resourceType] + ' / ' + (resource.name ? resource.name : resource.id.substr(0, 8)) + ' / ' + utils.getMetricName(metricType);
    } else {
      dropdownValue = __.pls_select_resource_type;
    }

    return (
      <div className="page select-metric">
        <div className="select-box">
          <MultiDropdown ref="multidropdown" items={resources} disabled={resources.length === 0} onClick={this.onClickDropdown} value={dropdownValue} />
          <ButtonGroup>
            <Button btnKey={constant.GRANULARITY_HOUR} value={recentHour} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_HOUR} />
            <Button btnKey={constant.GRANULARITY_DAY} value={recentDay} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_DAY} />
            <Button btnKey={constant.GRANULARITY_WEEK} value={recentWeek} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_WEEK} />
            <Button btnKey={constant.GRANULARITY_MONTH} value={recentMonth} type="status" onClick={this.onClickPeriod} selected={granularity === constant.GRANULARITY_MONTH} />
          </ButtonGroup>
        </div>
        <div id="select_metric_chart" className="chart-box" />
      </div>
    );
  }
}

module.exports = Modal;
