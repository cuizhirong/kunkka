require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var SecurityDetail = require('client/components/security_detail/index');

var deleteModal = require('client/components/modal_delete/index');
var createSecurityGroup = require('./pop/create_security_group/index');
var modifySecurityGroup = require('./pop/modify_security_group/index');
var createRule = require('./pop/create_rule/index');

var config = require('./config.json');
var request = require('./request');
var router = require('client/utils/router');
var __ = require('locale/client/dashboard.lang.json');

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
    if (this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.getTableData(false);
    }
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList(forceUpdate).then((res) => {
      var table = this.state.config.table;
      table.data = res;
      table.loading = false;

      var detail = this.refs.dashboard.refs.detail;
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
    var rows = data.rows;
    var that = this;
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
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    var noDefault = true;
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
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    var isAvailableView = (_rows) => {
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
          var itemKeys = ['ingress', 'egress'];
          var items = this.getSecurityDetailData(rows[0], this);

          contents[tabKey] = (
            <SecurityDetail
              __={__}
              title={__.security_group + __.rules}
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
      default:
        break;
    }

    detail.setState({
      contents: contents
    });
  }

  getSecurityDetailData(item, that) {
    var allRulesData = [],
      ingressRulesData = [],
      egressRulesData = [];

    var getPortRange = function(_ele) {
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

    var getICMPTypeCode = function(_ele) {
      if (_ele.protocol === 'icmp') {
        var min = _ele.port_range_min === null ? '' : _ele.port_range_min;
        var max = _ele.port_range_max === null ? '' : _ele.port_range_max;
        return min + '/' + max;
      } else {
        return '-';
      }
    };

    var getSourceType = function(_ele) {
      if(_ele.remote_ip_prefix) {
        return _ele.remote_ip_prefix;
      } else if (_ele.remote_group_id) {
        var data = that.state.config.table.data;
        var source = data.filter((d) => d.id === _ele.remote_group_id)[0];

        return (
          <span>
            <i className="glyphicon icon-security-group" />
            <a data-type="router" href={'/dashboard/security-group/' + source.id}>{source.name}</a>
          </span>
        );
      }
    };

    item.security_group_rules.forEach((ele) => {
      var sourceOrTarget = getSourceType(ele);

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

    var data = {
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
      var path = router.getPathList();
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
    var _config = this.state.config;
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
    var {tab, rawItem} = data;

    var that = this;
    switch(actionType) {
      case 'create_rule':
        var securityGroups = this.state.config.table.data;
        createRule(rawItem, tab, securityGroups, function() {
          that.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'delete_ingress':
        request.deleteRules(data).then((res) => {
          this.refresh({
            detailRefresh: true
          }, true);
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
