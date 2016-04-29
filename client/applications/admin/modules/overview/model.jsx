require('./style/index.less');
var Chart = require('client/libs/charts/index');
var __ = require('locale/client/admin.lang.json');
var {Tab} = require('client/uskin/index');

var React = require('react');

var infoColor = '#42b9e5',
  info700Color = '#097fab',
  warningColor = '#f2994b',
  dangerColor = '#ff5a67',
  basicGrey = '#f2f3f4',
  fontDark = '#939ba3';

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      utilizationPeriod: '3h',
      incrementPeriod: '3h',
      physicalLoading: true,
      oversaleLoading: true,
      utilizationLoading: true,
      incrementLoading: true,
      physicalSizeType: 'physical'
    };
  }

  componentDidMount() {
    this.initializeCharts();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.setState({
        physicalLoading: true,
        oversaleLoading: true,
        utilizationLoading: true,
        incrementLoading: true
      });
      this.initializeCharts();
    }
  }

  initializeCharts() {
    this.showPhysicalChart();
    this.showOversaleChart();
    this.showUtilizationChart();
    this.showIncrementChart();
  }

  getChartColor(rate) {
    if (rate <= 0.6) {
      return infoColor;
    } else if (rate <= 0.8) {
      return warningColor;
    } else {
      return dangerColor;
    }
  }

  showPhysicalChart() {
    var that = this;
    setTimeout(function() {
      var res = {
        assigned_size: 70,
        physical_size: 100,
        storage_node: 24,
        storage_disk: 72,
        available_size: 10
      };
      that.setState({
        physicalLoading: false,
        storage_node: res.storage_node,
        storage_disk: res.storage_disk,
        available_size: res.available_size,
        physical_size: res.physical_size,
        assigned_size: res.assigned_size
      });
      var rate = res.assigned_size / res.physical_size;
      var seriesColor = infoColor;
      if (rate > 0.6 && rate <= 0.8) {
        seriesColor = warningColor;
      } else if (rate > 0.8) {
        seriesColor = dangerColor;
      }

      if (!that.physicalChart) {
        that.physicalChart = new Chart.PieChart(document.getElementById('physical-disk-chart'));
      }
      that.physicalChart.setOption({
        lineWidth: 10,
        bgColor: basicGrey,
        series: [{
          color: seriesColor,
          data: rate
        }],
        text: {
          color: fontDark,
          fontSize: '30px'
        },
        period: 600
      });
    }, 1000);
  }

  showOversaleChart() {
    var that = this;
    setTimeout(function() {
      var res = {
        soldSize: 100,
        usedSize: 10
      };
      that.setState({
        oversaleLoading: false,
        soldSize: res.soldSize,
        usedSize: res.usedSize
      });
      if (!that.oversaleChart) {
        that.oversaleChart = new Chart.BarChart(document.getElementById('oversale-chart'));
      }
      that.oversaleChart.setOption({
        unit: 'TB',
        title: __.size + '／TB',
        xAxis: {
          tickWidth: 50,
          barWidth: 30
        },
        yAxis: {
          color: basicGrey,
          tickPeriod: 10,
          tickColor: fontDark
        },
        series: [{
          color: info700Color,
          data: res.soldSize
        }, {
          color: infoColor,
          data: res.usedSize
        }],
        period: 600,
        easing: 'easeOutCubic'
      });
    }, 1000);
  }

  showUtilizationChart(period) {
    var that = this;
    setTimeout(function() {
      that.setState({
        utilizationLoading: false
      });
      if (!that.utilizationChart) {
        that.utilizationChart = new Chart.LineChart(document.getElementById('utilization-rate-chart'));
      }
      that.utilizationChart.setOption({
        unit: 'TB',
        title: '单位(%), 时间间隔900s',
        xAxis: {
          color: '#f2f3f4',
          data: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15']
        },
        yAxis: {
          color: '#f2f3f4',
          tickPeriod: 10,
          tickColor: '#939ba3'
        },
        series: [{
          color: '#1797c6',
          data: [31, 9, 41, 21, 26, 49, 23, 25, 30, 32],
          opacity: 0.05
        }, {
          color: '#42b9e5',
          data: [9, 40, 18, 10, 32, 47, 8, 14, 21, 16],
          opacity: 0.05
        }, {
          color: '#ff5a67',
          data: [42, 5, 26, 22, 17, 38, 18, 12, 3, 16],
          opacity: 0.05
        }],
        alert: {
          data: 70,
          lineWidth: 1,
          color: '#000'
        },
        period: 600,
        easing: 'easeOutCubic'
      });
    }, 1000);
  }

  showIncrementChart(period) {
    var that = this;
    setTimeout(function() {
      that.setState({
        incrementLoading: false
      });
      if (!that.incrementChart) {
        that.incrementChart = new Chart.LineChart(document.getElementById('increment-chart'));
      }
      that.incrementChart.setOption({
        unit: 'TB',
        title: '单位(%), 时间间隔900s',
        xAxis: {
          color: '#f2f3f4',
          data: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15']
        },
        yAxis: {
          color: '#f2f3f4',
          tickPeriod: 10,
          tickColor: '#939ba3'
        },
        series: [{
          color: '#1797c6',
          data: [31, 9, 41, 21, 26, 49, 23, 25, 30, 32],
          opacity: 0.05
        }, {
          color: '#42b9e5',
          data: [9, 40, 18, 10, 32, 47, 8, 14, 21, 16],
          opacity: 0.05
        }, {
          color: '#ff5a67',
          data: [42, 5, 26, 22, 17, 38, 18, 12, 3, 16],
          opacity: 0.05
        }],
        alert: {
          data: 70,
          lineWidth: 1,
          color: '#000'
        },
        period: 600,
        easing: 'easeOutCubic'
      });
    }, 1000);
  }

  refreshPhysicalChart() {
    this.setState({
      physicalLoading: true
    });
    this.showPhysicalChart();
  }

  refreshOversaleChart() {
    this.setState({
      oversaleLoading: true
    });
    this.showOversaleChart();
  }

  refreshUtilizationChart(period) {
    this.setState({
      utilizationLoading: true
    });
    this.showUtilizationChart(period);
  }

  refreshIncrementChart(period) {
    this.setState({
      incrementLoading: true
    });
    this.showIncrementChart(period);
  }

  onChart3PeriodChange(value) {
    this.setState({
      utilizationPeriod: value
    });
    this.refreshUtilizationChart(value);
  }

  onChart4PeriodChange(value) {
    this.setState({
      incrementPeriod: value
    });
    this.refreshIncrementChart(value);
  }

  changePhysicalSizeType(type) {
    this.setState({
      physicalSizeType: type
    });
  }

  render() {
    var state = this.state;

    var isNakedPhysicalSize = state.physicalSizeType === 'physical';

    var tabs = [{
      name: __.storage_service + ' - ' + __.overview,
      key: 'overview',
      default: true
    }];
    return (
      <div className="halo-module-overview-storage" style={this.props.style}>
        <div className="overview">
          <div className="submenu-tabs">
            <Tab items={tabs} />
          </div>
          <div className="chart-container">
            <div className="horizon">
              <div className="block">
                <div className="header">
                  <span className="title">{__.disk_used}</span>
                  <i className="glyphicon icon-refresh" onClick={this.refreshPhysicalChart.bind(this)}></i>
                </div>
                <div className={!state.physicalLoading ? 'body' : 'body hide'}>
                  <div className="tab-label">
                    <label className={isNakedPhysicalSize ? 'info' : ''} onClick={this.changePhysicalSizeType.bind(this, 'physical')}>{__.physical_volume} </label>|
                    <label className={isNakedPhysicalSize ? '' : 'info'} onClick={this.changePhysicalSizeType.bind(this, 'user')}> {__.user_volume}</label>
                  </div>
                  <div className="pie-chart-container">
                    <div className="pie-chart-info">
                      <p>{__.physical_size}<label>{isNakedPhysicalSize ? state.physical_size : (state.physical_size / 3).toFixed(2)}TB</label></p>
                      <p><i className="dot warning"></i>{__.assigned_size}<label className="warning">{isNakedPhysicalSize ? state.assigned_size : (state.assigned_size / 3).toFixed(2)}</label>TB</p>
                      <p><i className="dot"></i>{__.available_size} {isNakedPhysicalSize ? state.available_size : (state.available_size / 3).toFixed(2)}TB</p>
                    </div>
                    <div className="physical-disk-chart" id="physical-disk-chart"></div>
                  </div>
                  <div className="physical-disk-info">
                    <p>{__.user_size_tip}</p>
                    <p>{__.storage_node + ':'}<label className="info">{state.storage_node}</label></p>
                    <p>{__.storage_disk + ':'}<label className="info">{state.storage_disk}</label></p>
                  </div>
                </div>
                {state.physicalLoading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
              </div>
              <div className="block">
                <div className="header">
                  <span className="title">{__.oversale}</span>
                  <i className="glyphicon icon-refresh" onClick={this.refreshOversaleChart.bind(this)}></i>
                </div>
                <div className={!state.oversaleLoading ? 'body' : 'body hide'}>
                  <div className="bar-chart-container">
                    <div className="oversale-chart" id="oversale-chart"></div>
                    <div className="bar-chart-info">
                      <p className="bar1"><i className="dot"></i>{__.used_size}<label className="info">{state.usedSize}</label>TB</p>
                      <p className="bar2"><i className="dot"></i>{__.sold_size}<label className="info">{state.soldSize}</label>TB</p>
                      <div className="oversale-info">
                        <p>{__.oversale + ':'}</p>
                        <p className="ratio">
                          <span>{state.soldSize}</span>TB : <span>{state.usedSize}</span>TB =
                          <label className="info">{(state.soldSize / state.usedSize).toFixed(1)}</label>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {state.oversaleLoading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
              </div>
            </div>
            <div className="horizon">
              <div className="block">
                <div className="header">
                  <span className="title">{__.utilization_rate}</span>
                  <i className="glyphicon icon-refresh" onClick={this.refreshUtilizationChart.bind(this)}></i>
                </div>
                <div className="body">
                  <div className="time-tab">
                    {
                      ['1m', '1w', '1d', '3h'].map((p) => {
                        return <span key={p} className={state.utilizationPeriod === p ? 'selected' : ''} onClick={this.onChart3PeriodChange.bind(this, p)}>{__[p]}</span>;
                      })
                    }
                  </div>
                  <div className={!state.utilizationLoading ? 'utilization-rate-chart' : 'utilization-rate-chart hide'} id="utilization-rate-chart"></div>
                  {state.utilizationLoading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
                </div>
              </div>
              <div className="block">
                <div className="header">
                  <span className="title">{__.increment}</span>
                  <i className="glyphicon icon-refresh" onClick={this.refreshIncrementChart.bind(this)}></i>
                </div>
                <div className="body">
                  <div className="time-tab">
                    {
                      ['1m', '1w', '1d', '3h'].map((p) => {
                        return <span key={p} className={state.incrementPeriod === p ? 'selected' : ''} onClick={this.onChart4PeriodChange.bind(this, p)}>{__[p]}</span>;
                      })
                    }
                  </div>
                  <div className={!state.incrementLoading ? 'increment-chart' : 'increment-chart hide'} id="increment-chart"></div>
                  {state.incrementLoading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
