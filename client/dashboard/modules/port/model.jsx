require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var BasicProps = require('client/components/basic_props/index');

var deleteModal = require('client/components/modal_delete/index');

var __ = require('i18n/client/lang.json');
var config = require('./config.json');
var request = require('./request');
var router = require('client/dashboard/cores/router');
var createPort = require('./pop/create_port/index');
var associateInstance = require('./pop/associate_instance/index');
var detachInstance = require('./pop/detach_instance/index');
var modify = require('./pop/modify_security_group/index');

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
    this.tableColRender(this.state.config.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none') {
      this.getTableData(false);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'subnet':
          column.render = (col, item, i) => {
            return item.subnet.id ?
              <div><i className="glyphicon icon-subnet"></i><a data-type="router" href={'/project/subnet/' + item.subnet.id}>{item.subnet.name}</a></div> : '';
          };
          break;
        case 'related_instance':
          column.render = (col, item, i) => {
            return item.server ?
              <div><i className="glyphicon icon-instance"></i><a data-type="router" href={'/project/instance/' + item.server.id}>{item.server.name}</a></div> : '';
          };
          break;
        case 'restrict':
          column.render = (col, item, i) => {
            return item.port_security_enabled ?
              <span className="label-active">已开启</span> : <span className="label-down">未开启</span>;
          };
          break;
        case 'ip_adrs':
          column.render = (col, item, i) => {
            return <span>{
              item.fixed_ips.map((_item, _i) =>
                <span key={_i}>{(_i > 0 ? ', ' : '') + _item.ip_address}</span>
              )
            }</span>;
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item.floatingip.id ?
              <div>
                <i className="glyphicon icon-floating-ip" />
                <a data-type="router" href={'/project/floating-ip/' + item.floatingip.id}>
                  {item.floatingip.floating_ip_address}
                </a>
              </div> : '';
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate) {
    request.getList((res) => {
      var table = this.state.config.table;
      table.data = res;
      table.loading = false;

      table.data.map((item, i) => {
        item.name = item.name ? item.name : '(' + item.id.substring(0, 8) + ')';
      });

      this.setState({
        config: config
      });

      var detail = this.refs.dashboard.refs.detail;
      if (detail.state.loading) {
        detail.setState({
          loading: false
        });
      }
    }, forceUpdate);
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

    switch (key) {
      case 'delete':
        deleteModal({
          action: 'delete',
          type:'port',
          data: rows,
          onDelete: function(_data, cb) {
            cb(true);
          }
        });
        break;
      case 'create':
        createPort(data, function() {});
        break;
      case 'associate_instance':
        associateInstance({
          name: rows[0].name
        }, function() {});
        break;
      case 'detach_instance':
        detachInstance({
          name: rows[0].name,
          instance: '123'
        }, function() {});
        break;
      case 'modify':
        modify({
          name: rows[0].name
        }, function() {});
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true
        }, true);
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
    for(let key in btns) {
      switch (key) {
        case 'assc_instance':
          btns[key].disabled = (rows.length === 1 && !rows[0].server) ? false : true;
          break;
        case 'detach_instance':
          btns[key].disabled = (rows.length === 1 && rows[0].server) ? false : true;
          break;
        case 'modify':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'enable':
          btns[key].disabled = (rows.length === 1 && !rows[0].port_security_enabled) ? false : true;
          break;
        case 'disable':
          btns[key].disabled = (rows.length === 1 && rows[0].port_security_enabled) ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (rows.length >= 1) ? false : true;
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
    var syncUpdate = true;

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
          var basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title = {__.basic + __.properties}
                defaultUnfold = {true}
                items = {basicPropsItem}/>
            </div>
          );
        }
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents
      });
    }
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name ? item.name : '(' + item.id.substring(0, 8) + ')'
    }, {
      title: 'ID',
      content: item.device_id
    }, {
      title: __.associate_gl + __.instance,
      content: item.instance ?
        <div><i className="glyphicon icon-instance"></i><a data-type="router" href={'/project/instance/' + item.instance.id}>{item.instance.name}</a></div> : ''
    }, {
      title: 'IP' + __.address,
      content:
        <div>{
          item.fixed_ips.map((ritem, i) =>
            <span key={i}>{ritem.ip_address}</span>)
        }</div>
    }, {
      title: 'MAC' + __.address,
      content: item.mac_address
    }, {
      title: __.subnet,
      content: item.subnet.id ?
        <div><i className="glyphicon icon-subnet"></i><a data-type="router" href={'/project/subnet/' + item.subnet.id}>{item.subnet.name}</a></div> : ''
    }, {
      title: __.floating_ip,
      content: item.floatingip.id ?
        <div><i className="glyphicon icon-floating-ip"></i><a data-type="router" href={'/project/floatingips/' + item.floatingip.id}>{item.floatingip.name}</a></div> : ''
    }, {
      title: __.security + __.group,
      content:
        <div>{
          item.security_groups.map((ritem, i) =>
            <div key={i}><i className="glyphicon icon-security-group"></i><a data-type="router" href={'/project/security-group/' + ritem.id}>{ritem.name}</a></div>)
        }</div>
    }, {
      title: __.security + __.restrict,
      content: item.port_security_enabled ?
        <span className="label-active">已开启</span> : <span className="label-down">未开启</span>
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }];

    return items;
  }

  refresh(data) {
    var path = router.getPathList();
    if (!path[2]) {
      if (data && data.tableLoading) {
        this.loadingTable();
      }
      this.refs.dashboard.clearState();
    } else {
      if (data && data.detailLoading) {
        this.refs.dashboard.refs.detail.loading();
      }
    }

    this.getTableData();
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  render() {
    return (
      <div className="halo-module-port" style={this.props.style}>
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
