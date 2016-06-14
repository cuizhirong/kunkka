require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

//detail component
var BasicProps = require('client/components/basic_props/index');

//pop modals
var createPool = require('./pop/create_pool/');
var deleteModal = require('client/components/modal_delete/index');

var config = require('./config.json');
var router = require('client/utils/router');
var __ = require('locale/client/dashboard.lang.json');
var request = require('./request');
var getStatusIcon = require('../../utils/status_icon');
var notify = require('client/applications/dashboard/utils/notify');

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
    var columns = this.state.config.table.column;
    this.tableColRender(columns);
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

  tableColRender(column) {
    column.map(col => {
      switch (col.key) {
        case 'name':
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
    request.getList(forceUpdate).then(res => {
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
    var {rows} = data,
      that = this;

    switch(key) {
      case 'create_pool':
        createPool();
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'resource_pool',
          data: rows,
          onDelete: function(_data, cb) {
            request.deletePools(rows).then(res => {
              that.refresh(null, true);
              cb(true);
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
        case 'delete':
          btns[key].disabled = rows.length > 0 ? false : true;
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
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
        }
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    }
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.slice(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.protocol,
      content: item.protocol
    }, {
      title: __.load_algorithm,
      content: item.lb_algorithm
    }, {
      title: __.desc,
      content: item.description
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

  onDetailAction(tabKey, actionType, data) {
    switch (tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch (actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editPoolName(rawItem, newName).then((res) => {
          notify({
            resource_type: 'resource_pool',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
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
      <div className="halo-module-image" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }
}

module.exports = Model;
