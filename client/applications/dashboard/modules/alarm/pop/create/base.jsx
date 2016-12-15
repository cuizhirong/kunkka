var React = require('react');
var {Button, Modal, Step} = require('client/uskin/index');
var SelectMetric = require('./select_metric');
var AlarmConfig = require('./alarm_config');
var SetNotification = require('./set_notification');
var __ = require('locale/client/dashboard.lang.json');
var utils = require('../../utils');
var request = require('../../request');
var initialState = require('./state');
var createNotification = require('../../../notification/pop/modal/index');
var getErrorMessage = require('../../../../utils/error_message');

let title;
let measureData = [];

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    if (props.obj) {
      this.state = initialState.getModifiedState(props.obj);
      title = __.modify + __.alarm;
    } else {
      this.state = initialState.getInitializedState();
      title = __.create + __.alarm;
    }

    ['onPrevPage', 'onNextPage', 'onChangeState', 'createNotification', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    this.getResourceList();
    this.getNofications();

    if (this.props.obj) {
      let resourceId = this.props.obj.gnocchi_resources_threshold_rule.resource_id;
      const state = this.state;
      this.getMeasureData(resourceId, state.metricType, state.measureGranularity);
    }
  }

  getResourceList() {
    request.getResources().then((data) => {
      // console.log('ins & volume list:', data);
      let items = [{
        items: [{
          title: __.instance,
          key: 'instance',
          children: []
        }]
      }];
          // {
          //   title: 'First',
          //   items: [{
          //     title: 'Associate - 1',
          //     key: 'ip-1',
          //     children: [{
          //       items: [{
          //         title: 'Sub Channel - 1',
          //         key: 'sub-1'
          //       }, {
          //         title: 'Sub Channel - 2',
          //         key: 'sub-2'
          //       }, {
          //         title: 'Sub Channel - 3',
          //         key: 'sub-3'
          //       }]
          //     }]
          //   }, {
          //     title: 'Associate - 2',
          //     key: '1'
          //   }]
          // }, {
          //   title: 'Second',
          //   items: [{
          //     title: 'Public IP - 1',
          //     key: 'ip-1'
          //   }, {
          //     title: 'Public IP - 2',
          //     key: '1'
          //   }]
          // }

      items[0].items[0].children = data.instance.map((ele) => {
        return {
          items: [{
            title: ele.name ? ele.name : ele.id.substr(0, 8),
            key: ele.id,
            children: [{
              items: [{
                title: utils.getMetricName('cpu_util'),
                key: 'cpu_util',
                resourceType: 'instance',
                resource: ele
              }, {
                title: utils.getMetricName('memory.usage'),
                key: 'memory.usage',
                resourceType: 'instance',
                resource: ele
              }, {
                title: utils.getMetricName('disk.read.bytes.rate'),
                key: 'disk.read.bytes.rate',
                resourceType: 'instance',
                resource: ele
              }, {
                title: utils.getMetricName('disk.write.bytes.rate'),
                key: 'disk.write.bytes.rate',
                resourceType: 'instance',
                resource: ele
              }]
            }]
          }]
        };
      });

      if (this.props.obj) {
        let alarm = this.props.obj;
        let resourceId = alarm.gnocchi_resources_threshold_rule.resource_id;

        let instance = data.instance.find((ele) => ele.id === resourceId);
        if (!instance) {
          instance = {
            id: resourceId,
            name: '(' + resourceId.slice(0, 8) + ')'
          };
        }

        this.setState({
          resource: instance
        });
      }

      this.setState({
        resources: items
      });
    });
  }

  getMeasureData(resourceId, metricType, measureGranularity) {
    request.getReousrceMeasures(resourceId, metricType, measureGranularity).then((data) => {
      measureData = data;

      this.refs.select_metric.updateGraph(data, measureGranularity);
      this.refs.alarm_config.updateGraph(data, measureGranularity, this.state.threshold);
    });
  }

  getNofications() {
    request.getNofitications().then((data) => {
      this.setState({
        notifications: data
      });
    });
  }

  onPrevPage(e) {
    this.onChangeState('page', this.state.page - 1);
  }

  onNextPage(e) {
    this.onChangeState('page', this.state.page + 1);
  }

  onChangeState(field, value) {
    let state = {};
    state[field] = value;

    this.setState(state, () => {
      let st = this.state;

      switch (field) {
        case 'measureGranularity':
        case 'resource':
          if (this.state.resource) {
            this.getMeasureData(st.resource.id, st.metricType, st.measureGranularity);
          }
          break;
        case 'threshold':
          this.refs.alarm_config.updateGraph(measureData, st.measureGranularity, st.threshold);
          break;
        default:
          break;
      }
    });
  }

  createNotification(id, e) {
    createNotification(null, this.refs.modal, (notif) => {
      let { notifications, notificationLists } = this.state;
      notif.id = notif.uuid;
      notifications.push(notif);

      notificationLists.some((ele) => {
        if (ele.id === id) {
          ele.notification = notif.id;
          return true;
        }
        return false;
      });

      this.setState({
        notifications: notifications
      });
    });
  }

  onConfirm(e) {
    this.setState({
      disabled: true
    });

    const state = this.state;
    const notifyList = state.notificationLists;
    let urlPrefix = HALO.configs.kiki_url + '/v1/topics/';
    let alarmActions = notifyList.filter((ele) =>
      ele.status === 'alarm' && ele.notification !== 'none'
    ).map((ele) =>
      urlPrefix + ele.notification + '/alarm'
    );
    let okActions = notifyList.filter((ele) =>
      ele.status === 'ok' && ele.notification !== 'none'
    ).map((ele) =>
      urlPrefix + ele.notification + '/alarm'
    );
    let insufficientDataActions = notifyList.filter((ele) =>
      ele.status === 'insufficient_data' && ele.notification !== 'none'
    ).map((ele) =>
      urlPrefix + ele.notification + '/alarm'
    );

    let data = this.props.obj ? this.props.obj : {};
    data.name = state.name;
    data.description = state.descrition;
    data.alarm_actions = alarmActions;
    data.ok_actions = okActions;
    data.insufficient_data_actions = insufficientDataActions;
    data.type = 'gnocchi_resources_threshold';
    data.gnocchi_resources_threshold_rule = {
      aggregation_method: state.aggregationMethod,
      comparison_operator: state.comparisonOperator,
      evaluation_periods: state.evaluationPeriods,
      granularity: state.granularity,
      metric: state.metricType,
      resource_id: state.resource.id,
      resource_type: state.resourceType,
      threshold: state.threshold
    };

    if (this.props.obj) {
      request.updateAlarm(data.alarm_id, data).then((res) => {
        this.setState({
          visible: false
        });

        let cb = this.props.callback;
        cb && cb(res);
      }).catch((err) => {
        this.setState({
          disabled: false,
          hideError: false,
          errorMsg: getErrorMessage(err)
        });
      });
    } else {
      request.createAlarm(data).then((res) => {
        this.setState({
          visible: false
        });

        let cb = this.props.callback;
        cb && cb(res);
      }).catch((err) => {
        this.setState({
          disabled: false,
          hideError: false,
          errorMsg: getErrorMessage(err)
        });
      });
    }

  }

  renderBtns(props, state) {
    let left = {
      value: __.prev,
      type: 'cancel',
      onClick: this.onPrevPage
    };
    let right = {
      value: __.next,
      type: 'create',
      onClick: this.onNextPage
    };

    let disabled = false;
    switch(state.page) {
      case 0:
        disabled = !this.state.resource;
        break;
      case 1:
        disabled = !this.state.name;
        break;
      case 2:
        right = {
          value: __.create,
          type: 'create',
          onClick: this.onConfirm
        };
        break;
      default:
        break;
    }
    disabled = disabled || state.disabled;

    return (
      <div>
        <div className="left-side">
          {state.page > 0 ? <Button {...left} /> : null}
        </div>
        <div className="right-side">
          <Button {...right} disabled={disabled} />
        </div>
      </div>
    );
  }

  render() {
    const props = this.props;
    const state = this.state;

    let steps = [{
      name: __.select_metric
    }, {
      name: __.set_alarm_policy
    }, {
      name: __.set_notification
    }];
    steps[state.page].default = true;

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible} width={880}>
        <div className="modal-bd halo-com-modal-create-alarm">
          <div className="step-box">
            <Step items={steps} consecutive={true} disabled={true} />
          </div>
          <div className={'slide-box page-' + (state.page)}>
            <SelectMetric ref="select_metric" state={state} onChangeState={this.onChangeState} />
            <AlarmConfig ref="alarm_config" state={state} onChangeState={this.onChangeState} />
            <SetNotification state={state} onChangeState={this.onChangeState} createNotification={this.createNotification} />
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-alarm">
          {this.renderBtns(props, state)}
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
