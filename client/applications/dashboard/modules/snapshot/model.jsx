require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var BasicProps = require('client/components/basic_props/index');

var deleteModal = require('client/components/modal_delete/index');
var createVolume = require('../volume/pop/create/index');

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
        if (data.resource_type === 'snapshot') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/snapshot');
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
        case 'size':
          column.render = (col, item, i) => {
            return item.size + ' GB';
          };
          break;
        case 'volume':
          column.render = (col, item, i) => {
            if(item.volume) {
              return (
                <span>
                  <i className="glyphicon icon-volume" />
                  <a data-type="router" href={'/dashboard/volume/' + item.volume.id}>
                    {item.volume.name ? item.volume.name : '(' + item.volume.id.substr(0, 8) + ')'}
                  </a>
                </span>
              );
            } else {
              return '-';
            }
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
    switch (key) {
      case 'create':
        createVolume(rows[0]);
        break;
      case 'crt_img':
        break;
      case 'del_snapshot':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'snapshot',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteSnapshots(rows).then((res) => {
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
        case 'create':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'del_snapshot':
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
                items={basicPropsItem ? basicPropsItem : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)} />
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
    var data = [{
      title: __.name,
      type: 'editable',
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.volume,
      content: item.volume ?
        <span>
          <i className="glyphicon icon-volume" />
          <a data-type="router" href={'/dashboard/volume/' + item.volume.id}>{item.volume.name}</a>
        </span>
        : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }];

    if (HALO.settings.enable_approval) {
      var metadata = item.metadata;
      data.push({
        title: __.owner,
        content: metadata.owner ? metadata.owner : '-'
      });
    }

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
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editSnapshotName(rawItem, newName).then((res) => {
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
      <div className="halo-module-snapshot" style={this.props.style}>
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
