require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var {Button} = require('client/uskin/index');

var SecurityDetail = require('client/components/security_detail/index');

var deleteModal = require('client/components/modal_delete/index');
var createSecurityGroup = require('./pop/create_security_group/index');
var modifySecurityGroup = require('./pop/modify_security_group/index');

var config = require('./config.json');
var request = require('./request');
var router = require('client/dashboard/cores/router');
var __ = require('i18n/client/lang.json');
var msgEvent = require('client/dashboard/cores/msg_event');

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
    msgEvent.on('dataChange', (data) => {
      if (data.resource_type === 'router') {
        this.refresh(null, false);
        if (data.action === 'delete'
          && data.stage === 'end'
          && data.resource_id === router.getPathList()[2]) {
          router.replaceState('/project/router');
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none') {
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
        createSecurityGroup(function() {
          that.refresh(null, true);
        });
        break;
      case 'delete':
        deleteModal({
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
        modifySecurityGroup(rows[0], function(_data) {
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
          var items = this.getSecurityDetailData(rows[0]);

          contents[tabKey] = (
            <SecurityDetail
              title={__.security_group + __.rules}
              defaultUnfold={true}
              itemKeys={itemKeys}
              defaultKey="ingress"
              items={items}
              rawItem={rows[0]}>
              <Button value={__.add_ + __.security_group + __.rules} onClick={this.onDetailAction.bind(this, 'description', 'create_rule', {
                rawItem: rows[0]
              })}/>
            </SecurityDetail>
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

  getSecurityDetailData(item) {
    var allRulesData = [],
      ingressRulesData = [],
      egressRulesData = [];
    var getPortRange = function(_ele) {
      if(_ele.port_range_min) {
        if(_ele.port_range_min === _ele.port_range_max) {
          return _ele.port_range_min;
        } else {
          return _ele.port_range_min + '-' + _ele.port_range_max;
        }
      } else {
        return '-';
      }};

    item.security_group_rules.forEach((ele) => {
      allRulesData.push({
        id: ele.id,
        direction: ele.direction,
        protocol: ele.protocol ? ele.protocol.toUpperCase() : ele.ethertype,
        port_range: getPortRange(ele),
        fix_name: '-',
        source_type: ele.remote_ip_prefix ? ele.remote_ip_prefix : '',
        target: ele.remote_ip_prefix ? ele.remote_ip_prefix : '',
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
            title: __.fix_name,
            key: 'fix_name',
            dataIndex: 'fix_name'
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
            title: __.fix_name,
            key: 'fix_name',
            dataIndex: 'fix_name'
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

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
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
    switch(actionType) {
      case 'create_rule':
        // console.log(actionType, data);
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
          params={this.props.params} />
      </div>
    );
  }
}

module.exports = Model;
