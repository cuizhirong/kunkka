require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var BasicProps = require('client/components/basic_props/index');

var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');
var router = require('client/dashboard/cores/router');
var deleteModal = require('client/components/modal_delete/index');
var applyModal = require('./pop/apply_ip/index');
var associateInstance = require('./pop/associate_instance/index');
var associateRouter = require('./pop/associate_router/index');
var dissociateRelated = require('./pop/dissociate_related/index');

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
        case 'assc_resource': //router.name or server
          column.render = (col, item, i) => {
            if (item.association.type === 'router') {
              return (
                <span>
                  <i className="glyphicon icon-router" />
                  <a data-type="router" href={'/project/router/' + item.association.device.id}>
                    {item.association.device.name}
                  </a>
                </span>
              );
            } else if (item.association.type === 'server') {
              return (
                <span>
                  <i className="glyphicon icon-instance" />
                  <a data-type="router" href={'/project/instance/' + item.association.device.id}>
                    {item.association.device.name}
                  </a>
                </span>
              );
            }
            return '';
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
      table.data = res.floatingips;
      table.loading = false;

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
    rows.forEach((row) => {
      row.name = row.floating_ip_address;
    });

    switch (key) {
      case 'delete':
        deleteModal({
          action: 'delete',
          type: 'floating_ip',
          data: rows,
          onDelete: function(_data, cb) {
            cb(true);
          }
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true
        }, true);
        break;
      case 'create':
        applyModal(function(){});
        break;
      case 'dssc':
        dissociateRelated({
          floating_ip: data.rows[0].name,
          instance: 'instance 1'
        }, function() {});
        break;
      case 'assc_to_instance':
        associateInstance({
          name: data.rows[0].name
        }, function() {
        });
        break;
      case 'assc_to_router':
        associateRouter({
          name: data.rows[0].name
        }, function() {
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
    var shouldAssociate = (rows.length === 1) && !(rows[0].association.type);
    for(let key in btns) {
      switch (key) {
        case 'assc_to_instance':
          btns[key].disabled = shouldAssociate ? false : true;
          break;
        case 'assc_to_router':
          btns[key].disabled = shouldAssociate ? false : true;
          break;
        case 'dssc':
          btns[key].disabled = shouldAssociate ? false : true;
          break;
        case 'chg_bandwidth':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (rows.length > 0) ? false : true;
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
                title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []} />
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
      title: __.id,
      content: item.id
    }, {
      title: __.ip + __.address,
      content: item.floating_ip_address
    }, {
      title: __.associate_gl + __.resource,
      content: item.association.type === 'router' ?
        <span>
          <i className="glyphicon icon-router" />
          <a data-type="router" href={'/project/router/' + item.association.device.id}>
            {item.association.device.name}
          </a>
        </span> : ''
    }, {
      title: __.bandwidth,
      content: ''
    }, {
      title: __.carrier,
      content: ''
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
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
      <div className="halo-module-floating-ip" style={this.props.style}>
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
