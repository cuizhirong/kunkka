const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');
const request = require('../../request');
const timeUtils = require('../../../../utils/utils');
const utils = require('../../../alarm/utils');
const LineChart = require('client/components/line_chart/index');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      contents: {},
      page: props.obj.item.page || 1,
      key: props.obj.item.chartDetail.key || 300,
      data: props.obj.item.chartDetail.data
    };
  }

  componentWillMount() {
    this.renderChart();
  }

  onRight(page, data) {
    this.setState({
      page: page
    }, () => {
      this.renderChart(data);
    });
  }

  renderChart(rows, refresh) {
    let rawItem = rows || this.props.obj.item.chartDetail;

    let telemerty = HALO.configs.telemerty,
      hour = telemerty.hour,
      day = telemerty.day,
      week = telemerty.week,
      month = telemerty.month,
      year = telemerty.year;

    let that = this,
      tabKey = 'monitor',
      page = this.state.page,
      key = this.state.key;

    let updateDetailMonitor = function(newContents, loading) {
      that.setState({
        contents: newContents,
        loading: loading
      });
    };

    let time = rawItem.time;

    let contents = this.state.contents;
    let tabItems = [{
      name: __.three_hours,
      key: hour,
      value: hour,
      time: 'hour'
    }, {
      name: __.one_day,
      key: day,
      value: day,
      time: 'day'
    }, {
      name: __.one_week,
      key: week,
      value: week,
      time: 'week'
    }, {
      name: __.one_month,
      key: month,
      value: month,
      time: 'month'
    }, {
      name: __.one_year,
      key: year,
      value: year,
      time: 'year'
    }];

    let granularity = '';
    if (rawItem.granularity) {
      granularity = rawItem.granularity;
    } else {
      granularity = hour;
      contents[tabKey] = (<div/>);
      updateDetailMonitor(contents, true);
    }

    tabItems.some((ele) => ele.key === this.state.key ? (ele.default = true, true) : false);

    let updateContents = (arr) => {
      let style = {
        width: 750 * arr.length + 'px',
        position: 'relative',
        top: '-30px'
      };

      contents[tabKey] = (
        <div style={{width: '780px'}}>
          <div className={page === 1 ? 'left hidden' : 'left'}
            onClick={this.onRight.bind(this, page - 1, {
              data: arr,
              item: rawItem.item,
              granularity:granularity,
              time: time
            })}>
            <i className="glyphicon icon-arrow-left" />
          </div>
          <div className={page === rawItem.data.length ? 'right hidden' : 'right'}
            onClick={this.onRight.bind(this, page + 1, {
              data: arr,
              item: rawItem.item,
              granularity: granularity,
              time: time
            })}>
            <i className="glyphicon icon-arrow-right" />
          </div>
          <LineChart
            __={__}
            item={rawItem.item}
            data={arr}
            granularity={granularity}
            tabItems={tabItems}
            className={'detail'}
            style={style}
            start={timeUtils.getTime(time)}
            clickTabs={(e, tab, item) => {
              this.setState({
                key: tab.key
              }, () => {
                that.renderChart({
                  data: arr,
                  item: item,
                  granularity: tab.value,
                  time: tab.time
                }, true);
              });
            }} >
            <Button iconClass="refresh"
              onClick={this.renderChart.bind(this, {
                data: arr,
                item: rawItem.item,
                granularity: granularity,
                time: time
              }, true)}/>
          </LineChart>
        </div>
      );
      updateDetailMonitor(contents);
    };

    if (rawItem.granularity) {
      updateContents([]);
    }
    if (!refresh) {
      updateContents(rawItem.data);
    } else {
      let rule = rawItem.item.gnocchi_resources_threshold_rule, graphs;
      request.getResourceMeasures(rule.resource_id, rule.metric, granularity, timeUtils.getTime(time)).then((measures) => {
        if (rule._port_id && rule._port_exist) {
          request.getPortById(rule._port_id).then(port => {
            graphs = [measures].map((arr) => ({
              title: utils.getMetricName(rule.metric, port.port.fixed_ips[0].ip_address),
              color: utils.getColor(rule.metric),
              unit: utils.getUnit(rule.resource_type, rule.metric, arr),
              yAxisData: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric, rule.resource_type),
              xAxis: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric)
            }));
            updateContents(graphs);
          });
        } else {
          graphs = [measures].map((arr) => ({
            title: utils.getMetricName(rule.metric),
            color: utils.getColor(rule.metric),
            unit: utils.getUnit(rule.resource_type, rule.metric, arr),
            yAxisData: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric, rule.resource_type),
            xAxis: utils.getChartData(arr, key, timeUtils.getTime(time), rule.metric)
          }));
          updateContents(graphs);
        }
      }).catch(error => {
        updateContents([{}]);
      });
    }
  }

  render() {
    let props = this.props;
    let state = this.state;

    return (
      <Modal ref="modal" {...props} title={__.monitor_data} visible={state.visible} width={778}>
        <div className="modal-bd halo-com-modal-chart-zoom">
          <div className="modal-content">
            {Object.keys(state.contents).map((key) =>
              state.contents[key] ?
              <div key={key}
                className="detail-content"
                data-filed={key}
                style={{display: 'block'}}>
                {state.contents[key]}
              </div>
              : null
            )}
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
