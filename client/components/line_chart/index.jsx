require('./style/index.less');
var Chart = require('client/libs/charts/index');
var React = require('react');
var {Tab} = require('client/uskin/index');

class ChartLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
      granularity: props.granularity,
      item: props.item,
      chartTime: props.chartTime || [],
      tabItems: props.tabItems ? props.tabItems : [],
      unit: props.unit || []
    };
    this.lineChart;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      granularity: nextProps.granularity,
      item: nextProps.item,
      chartTime: nextProps.chartTime || [],
      tabItems: nextProps.tabItems,
      unit: nextProps.unit || []
    });
  }

  componentDidUpdate() {
    this.renderLineChart(this.state.data, this.state.granularity);
  }

  renderLineChart(data, granularity, period) {
    data ? data.forEach((d, i) => {
      var ele = document.getElementById('line-chart' + i),
        eleChild = ele.getElementsByTagName('canvas');
      if (eleChild.length !== 0) {
        ele.removeChild(eleChild[0]);
        ele.removeChild(eleChild[0]);
      }

      var lineChart = new Chart.LineChart(document.getElementById('line-chart' + i));
      let unit = this.state.unit[i] || 'b';
      let title = this.props.__.unit + '(' + unit + '), ' + this.props.__.interval + granularity + 's';
      lineChart.setOption({
        unit: unit,
        title: title,
        num: i,
        xAxis: {
          color: '#f2f3f4',
          data: this.state.chartTime[i] || []
        },
        yAxis: {
          color: '#f2f3f4',
          tickPeriod: unit === '%' ? 10 : 1000,
          tickMarginLeft: 30,
          tickColor: '#939ba3'
        },
        series: [{
          color: '#1797c6',
          data: d,
          opacity: 0.05,
          type: 'sharp' // sharp, curve, curve by default
        }],
        period: 100,
        easing: 'easeOutCubic'
      });
    }) : '';
  }

  clickTabs(e, tabItem) {
    this.props.clickTabs && this.props.clickTabs(e, tabItem, this.state.item);
  }

  render() {
    var __ = this.props.__,
      tabItems = this.state.tabItems;
    return (
      <div className="halo-com-line-chart">
        {
          this.state.data ?
            <div>
              <div className="tabs_sm">
                {this.props.children}
                <Tab items={tabItems} type="sm" onClick={this.clickTabs.bind(this)}/>
              </div>
              {this.state.data.map((_d, i) => {
                return (
                  <div id={'line-chart' + i} key={i} className="chart">
                    <div className="chart-title">
                      {__[this.props.title[i]]}
                    </div>
                    <div className="legendWp" id="legendWp">
                      <span className="circle"></span>
                      <label>{this.state.item.name}</label>
                      {
                        _d.length === 0 ? <label className="no-data">{__.no_monitor_data}</label> : ''
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          : <div className="detail-loading">
              <i className="glyphicon icon-loading" />
            </div>
        }
      </div>
    );
  }
}

module.exports = ChartLine;
