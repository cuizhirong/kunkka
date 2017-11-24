require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');

const SecurityDetail = require('client/components/security_detail/index');

const deleteModal = require('client/components/modal_delete/index');
const createSecurityGroup = require('./pop/create_security_group/index');
const modifySecurityGroup = require('./pop/modify_security_group/index');
const RelatedInstance = require('../image/detail/related_instance');
const createRule = require('./pop/create_rule/index');

const config = require('./config.json');
const request = require('./request');
const router = require('client/utils/router');
const __ = require('locale/client/dashboard.lang.json');

const getStatusIcon = require('../../utils/status_icon');
const getTime = require('client/utils/time_unification');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      if (this.state.config.table.loading) {
        this.loadingTable();
      } else {
        this.getTableData(false);
      }
    }
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      let table = this.state.config.table;
      table.data = res;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    switch (key) {
      case 'create':
        createSecurityGroup(null, function() {
          that.refresh(null, true);
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'security_group',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteSecurityGroup(rows).then(() => {
              if (router.getPathList()[2]) {
                router.replaceState('/dashboard/security-group');
              }
              that.refresh(null, true);
            });
            cb(true);
          }
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
        break;
      case 'modify':
        modifySecurityGroup(rows[0], null, function(_data) {
          that.refresh(null, true);
        });
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let noDefault = true;
    rows.forEach((ele) => {
      noDefault = noDefault && (ele.name === 'default' ? false : true);
    });
    for(let key in btns) {
      switch (key) {
        case 'modify':
          btns[key].disabled = (rows.length === 1 && noDefault) ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (rows.length > 0 && noDefault) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    let syncUpdate = true;

    let isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          let itemKeys = ['ingress', 'egress'];
          let items = this.getSecurityDetailData(rows[0], this);

          contents[tabKey] = (
            <SecurityDetail
              title={__.security_group + __.rules}
              btnValue={__.add_ + __.security_group + __.rules}
              defaultUnfold={true}
              itemKeys={itemKeys}
              defaultKey="ingress"
              tabKey="description"
              items={items}
              rawItem={rows[0]}
              onClick={this.onDetailAction.bind(this)} />
          );
        }
        break;
      case 'instance':
        let insData = [], that = this, limit = 20, current = data.current || 1;
        request.getInstances().then(instances => {
          instances.forEach(instance => {
            instance.security_groups && instance.security_groups.forEach(sg => {
              if (sg.name === rows[0].name) {
                insData.push(instance);
              }
            });
          });

          let pagination = {
            current: current,
            total: Math.ceil(insData.length / limit),
            total_num: insData.length
          };

          let instanceConfig = this.getRelatedInstance(insData.slice((current - 1) * limit, current * limit), pagination);

          contents[tabKey] = (
            <RelatedInstance
              tableConfig={instanceConfig}
              onDetailAction={(actionType, _refs, _data) => {
                that.onClickDetailTabs('instance', refs, {
                  rows: rows,
                  current: _data.page
                });
              }}/>
          );

          detail.setState({
            contents: contents,
            loading: false
          });
        });
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    } else {
      detail.setState({
        loading: true
      });
    }
  }

  getRelatedInstance(item, pagination) {
    let dataContent = [];
    for (let key in item) {
      let element = item[key];
      let dataObj = {
        name: <a data-type="router" href={'/dashboard/instance/' + element.id}>{element.name}</a>,
        id: element.id + key,
        status: getStatusIcon(element.status),
        created: getTime(element.created, false)
      };
      dataContent.push(dataObj);
    }

    let tableConfig = {
      column: [{
        title: __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.id,
        key: 'id',
        dataIndex: 'id'
      }, {
        title: __.status,
        key: 'status',
        dataIndex: 'status'
      }, {
        title: __.create + __.time,
        key: 'created',
        dataIndex: 'created'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true,
      pagination: pagination
    };

    return tableConfig;
  }

  getSecurityDetailData(item, that) {
    let allRulesData = [],
      ingressRulesData = [],
      egressRulesData = [];

    let getPortRange = function(_ele) {
      if(_ele.protocol === null) {
        return __.all_ports;
      } else if(_ele.protocol === 'tcp' || _ele.protocol === 'udp') {
        if(_ele.port_range_min === _ele.port_range_max) {
          return _ele.port_range_min;
        } else {
          return _ele.port_range_min + ' - ' + _ele.port_range_max;
        }
      } else {
        return '-';
      }
    };

    let getICMPTypeCode = function(_ele) {
      if (_ele.protocol === 'icmp') {
        let min = _ele.port_range_min === null ? '' : _ele.port_range_min;
        let max = _ele.port_range_max === null ? '' : _ele.port_range_max;
        return min + '/' + max;
      } else {
        return '-';
      }
    };

    let getSourceType = function(_ele) {
      if(_ele.remote_ip_prefix) {
        return _ele.remote_ip_prefix;
      } else if (_ele.remote_group_id) {
        let data = that.state.config.table.data;
        let source = data.filter((d) => d.id === _ele.remote_group_id)[0];

        return (
          <span>
            <i className="glyphicon icon-security-group" />
            <a data-type="router" href={'/dashboard/security-group/' + source.id}>{source.name}</a>
          </span>
        );
      }
    };

    item.security_group_rules.forEach((ele) => {
      let sourceOrTarget = getSourceType(ele);

      allRulesData.push({
        id: ele.id,
        direction: ele.direction,
        protocol: ele.protocol ? ele.protocol.toUpperCase() : __.all_protocols,
        port_range: getPortRange(ele),
        icmp_type_code: getICMPTypeCode(ele),
        source_type: sourceOrTarget,
        target: sourceOrTarget,
        action:
          <i className="glyphicon icon-delete delete-action"
              onClick={this.onDetailAction.bind(this, 'description', 'delete_ingress', ele)} />
      });
    });
    allRulesData.forEach((rule) => {
      if(rule.direction === 'ingress') {
        ingressRulesData.push(rule);
      } else {
        egressRulesData.push(rule);
      }
    });

    let data = {
      ingress: {
        value: __.ingress,
        tip: {
          title: __.ingress + __.security_group + __.rules,
          content: __.ingress_tip
        },
        table: {
          column: [{
            title: __.protocol,
            key: 'protocol',
            dataIndex: 'protocol'
          }, {
            title: __.port + __.range,
            key: 'port_range',
            dataIndex: 'port_range'
          }, {
            title: __.icmp_type_code,
            key: 'icmp_type_code',
            dataIndex: 'icmp_type_code'
          }, {
            title: __.source_type,
            key: 'source_type',
            dataIndex: 'source_type'
          }, {
            title: __.operation,
            key: 'action',
            dataIndex: 'action'
          }],
          data: ingressRulesData,
          dataKey: 'id'
        }
      },
      egress: {
        value: __.egress,
        tip:  {
          title: __.egress + __.security_group + __.rules,
          content: __.egress_tip
        },
        table: {
          column: [{
            title: __.protocol,
            key: 'protocol',
            dataIndex: 'protocol'
          }, {
            title: __.port + __.range,
            key: 'port_range',
            dataIndex: 'port_range'
          }, {
            title: __.icmp_type_code,
            key: 'icmp_type_code',
            dataIndex: 'icmp_type_code'
          }, {
            title: __.target,
            key: 'target',
            dataIndex: 'target'
          }, {
            title: __.operation,
            key: 'action',
            dataIndex: 'action'
          }],
          data: egressRulesData,
          dataKey: 'id'
        }
      }
    };

    return data;
  }

  refresh(data, forceUpdate) {
    if (data) {
      let path = router.getPathList();
      if (path[2]) {
        if (data.detailLoading) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    this.getTableData(forceUpdate, data ? data.detailRefresh : false);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    let {tab, rawItem} = data;

    let that = this;
    switch(actionType) {
      case 'create_rule':
        let securityGroups = this.state.config.table.data;
        createRule(rawItem, tab, securityGroups, function() {
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'delete_ingress':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'rules',
          data: [data],
          onDelete: function(_data, cb) {
            request.deleteRules(data).then(() => {
              that.refresh({
                detailRefresh: true
              }, true);
            });
            cb(true);
          }
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-security-group" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs.bind(this)}
          config={this.state.config}
          params={this.props.params}
          __={__} />
      </div>
    );
  }
}

module.exports = Model;
