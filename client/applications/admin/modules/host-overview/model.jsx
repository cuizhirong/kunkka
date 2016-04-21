require('./style/index.less');

var React = require('react');
var {Tab} = require('client/uskin/index');
var Chart = require('client/libs/charts/index');

var request = require('./request');
var __ = require('locale/client/admin.lang.json');
var router = require('client/utils/router');
var unitConverter = require('client/utils/unit_converter');
var getCommonFactor = require('client/applications/admin/utils/common_factor');

var tabs = [{
  name: __.host,
  key: 'host'
}, {
  name: __['host-overview'],
  key: 'host-overview',
  default: true
}];

var infoColor = '#42b9e5',
  info700Color = '#097fab',
  warningColor = '#f2994b',
  dangerColor = '#ff5a67',
  basicGrey = '#f2f3f4',
  basicBlack = '#252f3d',
  fontDark = '#939ba3',
  fontDarker = '#626b7e';

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: {},
      loading: true
    };
  }

  componentDidMount() {
    this.getOverview();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loading();
      this.getOverview();
    }
  }

  loading() {
    this.setState({
      loading: true
    });
  }

  getOverview() {
    request.getOverview().then((res) => {
      var data = res.hypervisor_statistics;

      this.setState({
        data: data,
        loading: false
      }, () => {
        this.displayDisk(data);
        this.displayCPU(data);
        this.displayMemory(data);
      });
    });
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

  getChartClass(rate) {
    if (rate <= 0.6) {
      return 'info';
    } else if (rate <= 0.8) {
      return 'warning';
    } else {
      return 'danger';
    }
  }

  displayDisk(data) {
    var diskChart = new Chart.PieChart(document.getElementById('chart-disk-usage'));

    var rate = data.local_gb_used / data.free_disk_gb,
      rateColor = this.getChartColor(rate);

    diskChart.setOption({
      lineWidth: 8,
      bgColor: basicGrey,
      series: [{
        color: rateColor,
        data: rate
      }],
      text: {
        color: rateColor,
        fontSize: '22px'
      },
      period: 600
    });
  }

  displayCPU(data) {
    var cpuChart = new Chart.BarChart(document.getElementById('chart-cpu-usage'));

    cpuChart.setOption({
      unit: '',
      title: '',
      xAxis: {
        tickWidth: 50,
        barWidth: 30
      },
      yAxis: {
        color: basicGrey,
        tickPeriod: 1,
        tickColor: fontDark
      },
      series: [{
        color: info700Color,
        data: data.vcpus_used
      }, {
        color: infoColor,
        data: data.vcpus
      }],
      period: 600,
      easing: 'easeOutCubic'
    });
  }

  displayMemory(data) {
    var memoryChart = new Chart.GaugeChart(document.getElementById('chart-memory-usage'));

    var rate = data.memory_mb_used / data.memory_mb,
      rateColor = this.getChartColor(rate);
    memoryChart.setOption({
      lineWidth: 0.4,
      bgColor: basicGrey,
      tickColor: fontDarker,
      series: [{
        color: rateColor,
        data: rate
      }],
      pointer: {
        radius: 10,
        color: basicBlack
      },
      period: 600,
      easing: 'easeOutCubic'
    });
  }

  clickTabs(e, item) {
    var path = router.getPathList();
    router.pushState('/' + path[0] + '/' + item.key);
  }

  render() {
    var state = this.state,
      data = state.data,
      loading = state.loading;

    var disk = {
      sum: unitConverter(data.local_gb, 'GB'),
      used: unitConverter(data.local_gb_used, 'GB'),
      free: unitConverter(data.free_disk_gb, 'GB'),
      rateClass: this.getChartClass(data.local_gb_used / data.local_gb)
    };
    var cpu = {
      sum: data.vcpus,
      used: data.vcpus_used,
      common: getCommonFactor(data.vcpus, data.vcpus_used)
    };
    var memory = {
      sum: unitConverter(data.memory_mb, 'MB'),
      used: unitConverter(data.memory_mb_used, 'MB'),
      rate: Math.round((data.memory_mb_used / data.memory_mb) * 100),
      rateClass: this.getChartClass(data.memory_mb_used / data.memory_mb)
    };

    return (
      <div className="halo-module-host-overview" style={this.props.style}>
        <div className="submenu-tabs">
          <Tab items={tabs} onClick={this.clickTabs.bind(this)} />
        </div>
        <div className="charts">
          <div className="col col-6">
            <div className="block block-host">
              <div className="title">{__.host}</div>
              <div className="content">
                {loading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
                <ul className={loading ? 'hidden' : null}>
                  <li>
                    <div className="number">{data.count}</div>
                    <div className="desc">{__.host + __.amount}</div>
                  </li>
                  <li>
                    <div className="number">{data.running_vms}</div>
                    <div className="desc">{__.instance + __.amount}</div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="block block-disk">
              <div className="title">{__.disk + __.usage}</div>
              <div className="content">
                {loading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
                <div className={'chart-disk-usage' + (loading ? ' hidden' : '')} id="chart-disk-usage" />
                <div className={'description' + (loading ? ' hidden' : '')}>
                  <div className="total">
                    <strong>{disk.sum.num + disk.sum.unit}</strong>
                    <span>{__.host + __.all_capacity}</span>
                  </div>
                  <div className="allocate-box">
                    <div className={'allocate allocate-' + disk.rateClass}>
                      {__.allocated + __.disk}
                      <span>{disk.used.num}</span>{disk.used.unit}
                    </div>
                    <div className="allocate allocate-free">
                      {__.unallocated + __.disk}
                      <span>{disk.free.num}</span>{disk.free.unit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col col-6">
            <div className="block block-cpu">
              <div className="title">{__.vcpu}</div>
              <div className="content">
                {loading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
                <div className={'chart-cpu-usage' + (loading ? ' hidden' : '')} id="chart-cpu-usage" />
                <div className={'description' + (loading ? ' hidden' : '')}>
                  <div className="allocate-box">
                    <div className="allocate allocate-info-700">
                      {__.vcpu_used}<span>{cpu.used}</span>
                    </div>
                    <div className="allocate allocate-info">
                      {__.vcpu + __.amount}<span>{cpu.sum}</span>
                    </div>
                  </div>
                  <div className="reuse-rate">
                    {__.reuse + __.rate}
                    <span>{cpu.sum / cpu.common + ' : ' + cpu.used / cpu.common}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="block block-memory">
              <div className="title">{__.memory}</div>
              <div className="content">
                {loading ? <div className="loading-data"><i className="glyphicon icon-loading"></i></div> : null}
                <div className={'chart-memory-usage' + (loading ? ' hidden' : '')} id="chart-memory-usage" />
                <div className={'description' + (loading ? ' hidden' : '')}>
                  <div className="allocate-box">
                    <div className={'allocate allocate-' + memory.rateClass}>
                      {__.allocated + __.memory}
                      <span>{memory.used.num}</span>{memory.used.unit}
                    </div>
                    <div className="allocate allocate-free">
                      {__.memory + __.capacity}
                      <span>{memory.sum.num}</span>{memory.sum.unit}
                    </div>
                  </div>
                  <div className="reuse-rate">
                    {__.usage}<span>{memory.rate + '%'}</span>
                  </div>
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
