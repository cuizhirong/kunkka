var React = require('react');
var {Button, Modal, Step} = require('client/uskin/index');
var SelectMetric = require('./select_metric');
var AlarmConfig = require('./alarm_config');
var SetNotification = require('./set_notification');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');
var resourceList = require('./resources');
var initialState = require('./state');
var createNotification = require('../../../notification/pop/modal/index');
var getErrorMessage = require('../../../../utils/error_message');
var {getTime} = require('../../../../utils/utils');

let title;
let measureData = [];

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    switch(props.obj.type) {
      case 'alarm':
        this.state = initialState.getAlarmState(props.obj.item);
        title = __.modify + __.alarm;
        break;
      case 'create':
      case 'instance':
      case 'volume':
      default:
        this.state = initialState.getInitialState();
        title = __.create + __.alarm;
        break;
    }

    ['onPrevPage', 'onNextPage', 'onChangeState', 'createNotification', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    this.getResourceList();
    this.getNofications();

    this.InsPortMap = {};
  }

  getResourceList() {
    request.getResources().then((data) => {
      const obj = this.props.obj;
      let items = [];
      let update = (resources) => {
        this.setState({
          loadingList: false,
          resources: resources
        });
      };

      switch(obj.type) {
        case 'alarm':
          items = resourceList.getInitialList(data);
          resourceList.getOriginalResource(obj.item).then((resource) => {
            this.setState({
              loadingList: false,
              resources: items
            });
            if (resource) {
              this.setState({
                loadingChart: true
              });
              this.onChangeState('resource', resource);
            }
          });
          break;
        case 'create':
          items = resourceList.getInitialList(data);
          update(items);
          break;
        case 'instance':
          items = resourceList.getInstanceList(obj.item);
          update(items);
          break;
        case 'volume':
          items = resourceList.getVolumeList(obj.item);
          update(items);
          break;
        default:
          break;
      }

    });
  }

  getMeasureData(resourceId, metricType, measureGranularity) {
    let startTime;
    switch(measureGranularity) {
      case 300:
        startTime = getTime('hour');
        break;
      case 900:
        startTime = getTime('day');
        break;
      case 3600:
        startTime = getTime('week');
        break;
      case 21600:
        startTime = getTime('month');
        break;
      default:
        break;
    }

    request.getResourceMeasures(resourceId, metricType, measureGranularity, startTime).then((data) => {
      measureData = data;

      this.refs.select_metric.updateGraph(data, measureGranularity);
      this.refs.alarm_config.updateGraph(data, measureGranularity, this.state.threshold);
    }).catch((err) => {
      let noData = [];

      this.refs.select_metric.updateGraph(noData, measureGranularity);
      this.refs.alarm_config.updateGraph(noData, measureGranularity, this.state.threshold);
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
          if (st.resource && st.measureGranularity) {
            let resourceType = this.state.resourceType;

            if (resourceType === 'instance') {
              let resourceID = st.resource.id;

              this.getMeasureData(resourceID, st.metricType, st.measureGranularity);
            } if (resourceType === 'volume') {
              let attch = st.resource.attachments[0];
              let resourceID = attch && attch.server_id;

              this.getMeasureData(resourceID, st.metricType, st.measureGranularity);
            } else if (resourceType === 'instance_network_interface') {
              let resource = st.resource;
              let instanceId = resource.device_id;
              let portId = resource.id;
              let update = (ports) => {
                let portMeasure = this.findPortMeasures(ports, portId);
                if (portMeasure) {
                  this.getMeasureData(portMeasure.id, st.metricType, st.measureGranularity);

                  if (!resource._measureId) {
                    resource._measureId = portMeasure.id;
                    this.setState({
                      resource: resource
                    });
                  }
                }
              };

              const map = this.InsPortMap;
              if (map[instanceId]) {
                update(map[instanceId]);
              } else {
                request.getNetworkResources(instanceId).then((ports) => {
                  map[instanceId] = ports;
                  update(map[instanceId]);
                });
              }
            }
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

  findPortMeasures(ports, portId) {
    return ports.find((port) => port.name === ('tap' + portId.substr(0, 11)));
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

    const obj = this.props.obj;
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

    let data = {};
    if (obj.type === 'alarm') {
      data = obj.item;
    }
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
      resource_id: state.resourceType === 'instance_network_interface' ? state.resource._measureId : state.resource.id,
      resource_type: state.resourceType,
      threshold: state.threshold
    };

    switch(obj.type) {
      case 'create':
      case 'instance':
      case 'volume':
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
        break;
      case 'alarm':
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
        break;
      default:
        break;
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
          value: this.props.obj.type === 'alarm' ? __.modify : __.create,
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
          {state.page > 0 ? <Button {...left} disabled={state.page === 2 && state.disabled} /> : null}
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
