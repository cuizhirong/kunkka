const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');
const request = require('../../request');
const timeUtils = require('../../../../utils/utils');
const LineChart = require('client/components/line_chart/index');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      contents: {},
      page: props.obj.item.page || 1,
      key: props.obj.item.chartDetail.key || 300,
      data: props.obj.item.chartDetail.data,
      pagingAni: false,
      step: true
    };
  }

  componentWillMount() {
    let moveTo1, moveTo2, rule;

    let ss = document.styleSheets;
    let addRule = true;

    for (let i = 0; i < ss.length; ++i) {
      for (let x = 0; x < ss[i].cssRules.length; ++x) {
        rule = ss[i].cssRules[x];
        if (rule.name && rule.name.indexOf('volDetail') !== -1 && rule.type === CSSRule.KEYFRAMES_RULE) {
          addRule = false;
        }
      }
    }

    if (addRule) {
      this.state.data.forEach((d, index) => {
        if (index !== 0) {
          moveTo1 = '@keyframes volDetail' + index + (index + 1) + '{0% {left: ' + (-740 * (index - 1)) + 'px;}\n' +
          '100%{left: ' + (-740 * index) + 'px;}}';
          moveTo2 = '@keyframes volDetail' + (index + 1) + index + '{0% {left: ' + (-740 * index) + 'px;}\n' +
          '100%{left: ' + (-740 * (index - 1)) + 'px;}}';
          ss[0].insertRule(moveTo1);
          ss[0].insertRule(moveTo2);
        }
      });
    }
    this.renderChart();
  }

  onRight(page, data, step) {
    this.setState({
      page: page,
      pagingAni: true,
      step: step
    }, () => {
      this.renderChart(data);
    });
  }

  renderChart(rows, refresh) {
    let tabKey = 'monitor';
    let rawItem = rows || this.props.obj.item.chartDetail;
    let that = this,
      page = this.state.page;

    let updateDetailMonitor = function(newContents, loading) {
      that.setState({
        contents: newContents,
        loading: loading
      });
    };

    let time = rawItem.time;

    let contents = this.state.contents;

    let telemerty = HALO.configs.telemerty,
      hour = telemerty.hour,
      day = telemerty.day,
      week = telemerty.week,
      month = telemerty.month,
      year = telemerty.year;

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
        top: '-30px',
        animationDuration: '.3s',
        animationFillMode: 'both'
      };

      if (this.state.pagingAni) {
        if (this.state.step) {
          style.animationName = 'volDetail' + (page + 1) + page;
        } else {
          style.animationName = 'volDetail' + (page - 1) + page;
        }
      } else {
        style.left = -740 * (page - 1) + 'px';
      }

      contents[tabKey] = (
        <div style={{width: '780px'}}>
          <div className={page === 1 ? 'left hidden' : 'left'}
            onClick={this.onRight.bind(this, page - 1, {
              data: arr,
              item: rawItem.item,
              granularity:granularity,
              time: time
            }, true)}>
            <i className="glyphicon icon-arrow-left" />
          </div>
          <div className={page === rawItem.data.length ? 'right hidden' : 'right'}
            onClick={this.onRight.bind(this, page + 1, {
              data: arr,
              item: rawItem.item,
              granularity: granularity,
              time: time
            }, false)}>
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
      let metricType = ['disk.device.read.bytes.rate', 'disk.device.write.bytes.rate', 'disk.device.read.requests.rate', 'disk.device.write.requests.rate'];
      let device = rawItem.item.attachments[0].device.split('/'), ids = [],
        resourceId = rawItem.item.attachments[0].server_id + '-' + device[device.length - 1];
      request.getNetworkResourceId(resourceId, granularity).then(res => {
        metricType.forEach(type => {
          res[0] && ids.push(res[0].metrics[type]);
        });
        if (res.length !== 0) {
          request.getMeasures(ids, granularity, timeUtils.getTime(time)).then((_r) => {
            let arr = _r.map((r, index) => ({
              title: timeUtils.getMetricName(metricType[index]),
              color: timeUtils.getColor(metricType[index]),
              unit: timeUtils.getUnit('volume', metricType[index], r),
              yAxisData: timeUtils.getChartData(r, granularity, timeUtils.getTime(time), metricType[index], 'volume'),
              xAxis: timeUtils.getChartData(r, granularity, timeUtils.getTime(time), metricType[index])
            }));
            updateContents(arr);
          });
        } else {
          updateContents([{}]);
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
        <div className="modal-bd halo-com-modal-alarm-detail">
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
