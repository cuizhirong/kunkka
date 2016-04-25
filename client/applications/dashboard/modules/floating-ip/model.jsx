require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var BasicProps = require('client/components/basic_props/index');

var deleteModal = require('client/components/modal_delete/index');
var applyModal = require('./pop/apply_ip/index');
var associateInstance = require('./pop/associate_instance/index');
var dissociateRelated = require('./pop/dissociate_related/index');

var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('./request');
var router = require('client/utils/router');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var getStatusIcon = require('../../utils/status_icon');

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

    msgEvent.on('dataChange', (data) => {
      if (this.props.style.display !== 'none') {
        if (data.resource_type === 'floatingip' || data.resource_type === 'instance') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/floating-ip');
          }
        }
      }
    });
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

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'assc_resource': //router.name or server
          column.render = (col, item, i) => {
            if (item.association && item.association.type === 'server') {
              var server = item.association.device;
              return (
                <span>
                  <i className="glyphicon icon-instance" />
                  <a data-type="router" href={'/dashboard/instance/' + server.id}>
                    {server.name}
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
    rows.forEach((row) => {
      row.name = row.floating_ip_address;
    });

    var that = this;
    switch (key) {
      case 'delete':
        deleteModal({
          __: __,
          action: 'release',
          type: 'floating_ip',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteFloatingIps(rows).then((res) => {
              cb(true);
              that.refresh({}, true);
            });
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
      case 'create':
        applyModal();
        break;
      case 'dissociate':
        dissociateRelated(rows[0]);
        break;
      case 'assc_to_instance':
        associateInstance(rows[0]);
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
        case 'dissociate':
          btns[key].disabled = (rows.length === 1 && rows[0].association.type) ? false : true;
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

    detail.setState({
      contents: contents
    });
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
      content: (item.association && item.association.type === 'server') ?
        <span>
          <i className="glyphicon icon-instance" />
          <a data-type="router" href={'/dashboard/instance/' + item.association.device.id}>
            {item.association.device.name}
          </a>
        </span> : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }];

    return items;
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
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;
