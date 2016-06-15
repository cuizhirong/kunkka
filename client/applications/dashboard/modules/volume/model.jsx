require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var BasicProps = require('client/components/basic_props/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');

var deleteModal = require('client/components/modal_delete/index');
var createModal = require('./pop/create/index');
var attachInstance = require('./pop/attach_instance/index');
var createSnapshot = require('./pop/create_snapshot/index');
var detachInstance = require('./pop/detach_instance/index');
var setRead = require('./pop/set_read/index');
var setReadWrite = require('./pop/set_read_write/index');
var resizeVolume = require('./pop/resize/index');
var notify = require('../../utils/notify');

var config = require('./config.json');
var __ = require('locale/client/dashboard.lang.json');
var request = require('./request');
var router = require('client/utils/router');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var getStatusIcon = require('../../utils/status_icon');
var utils = require('../../utils/utils');

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
        if (data.resource_type === 'volume' || data.resource_type === 'snapshot' || data.resource_type === 'instance') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/volume');
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
        case 'attch_instance':
          column.render = (col, item, i) => {
            var server = item.server;
            if (server && server.status === 'SOFT_DELETED') {
              return <span><i className="glyphicon icon-instance"></i>{'(' + server.id.substr(0, 8) + ')'}</span>;
            } else if (server) {
              return (
                <span>
                  <i className="glyphicon icon-instance" />
                  <a data-type="router" href={'/dashboard/instance/' + server.id}>
                    {server.name}
                  </a>
                </span>
              );
            }
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            return item.volume_type ?
              <span>
                <i className="glyphicon icon-performance" />
                {utils.getVolumeType(item)}
              </span> : '';
          };
          break;
        case 'attributes':
          column.render = (col, item, i) => {
            return item.metadata.readonly === 'True' ? __.read_only : __.read_write;
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
    var that = this;
    switch (key) {
      case 'create':
        createModal();
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'volume',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteVolumes(rows).then((res) => {
              cb(true);
            });
          }
        });
        break;
      case 'create_snapshot':
        createSnapshot(rows[0]);
        break;
      case 'attach_to_instance':
        attachInstance(rows[0]);
        break;
      case 'dtch_instance':
        detachInstance(rows[0]);
        break;
      case 'set_rd_only':
        setRead(rows[0], null, function() {
          notify({
            resource_name: rows[0].name,
            stage: 'end',
            action: 'update',
            resource_type: 'volume'
          });
          that.refresh(null, true);
        });
        break;
      case 'set_rd_wrt':
        setReadWrite(rows[0], null, function() {
          notify({
            resource_name: rows[0].name,
            stage: 'end',
            action: 'update',
            resource_type: 'volume'
          });
          that.refresh(null, true);
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
      case 'extd_capacity':
        resizeVolume(rows[0]);
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
    var len = rows.length;

    for(let key in btns) {
      switch (key) {
        case 'create_snapshot':
          btns[key].disabled = (len === 1 && (rows[0].status === 'available' || rows[0].status === 'in-use')) ? false : true;
          break;
        case 'dtch_instance':
          btns[key].disabled = (len === 1 && rows[0].status === 'in-use') ? false : true;
          break;
        case 'attach_to_instance':
          btns[key].disabled = (len === 1 && rows[0].status === 'available') ? false : true;
          break;
        case 'extd_capacity':
          btns[key].disabled = (len === 1 && rows[0].status === 'available') ? false : true;
          break;
        case 'set_rd_only':
          btns[key].disabled = (len === 1 && rows[0].status === 'available' && rows[0].metadata.readonly !== 'True') ? false : true;
          break;
        case 'set_rd_wrt':
          btns[key].disabled = (len === 1 && rows[0].status === 'available' && rows[0].metadata.readonly === 'True') ? false : true;
          break;
        case 'delete':
          var hasAttach = rows.some((item) => {
            return item.server ? true : false;
          });
          btns[key].disabled = (len > 0) && !hasAttach ? false : true;
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
          var basicPropsItem = this.getBasicProps(rows[0]),
            relatedSnapshotItems = this.getRelatedSnapshotItems(rows[0].snapshots);
          contents[tabKey] = (
            <div>
              <BasicProps title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem ? basicPropsItem : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}/>
              <RelatedSnapshot
                title={__.snapshot}
                defaultUnfold={true}
                tabKey={'description'}
                noItemAlert={__.no_related + __.snapshot}
                items={relatedSnapshotItems ? relatedSnapshotItems : []}
                rawItem={rows[0]}
                btnConfig={{
                  value: __.create + __.snapshot,
                  actionType: 'create_related_snapshot',
                  disabled: (rows[0].status === 'available' || rows[0].status === 'in-use') ? false : true
                }}
                onAction={this.onDetailAction.bind(this)}
                actionType={{
                  create: 'create_related_volume',
                  delete: 'delete_related_snapshot'
                }} />
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

  getBasicProps(item) {
    var getAttachments = (_item) => {
      var server = _item.server;
      if (server && server.status === 'SOFT_DELETED') {
        return <span><i className="glyphicon icon-instance"></i>{'(' + server.id.substr(0, 8) + ')'}</span>;
      } else if (server) {
        return (
          <span>
            <i className="glyphicon icon-instance" />
            <a data-type="router" href={'/dashboard/instance/' + server.id}>
              {server.name}
            </a>
          </span>
        );
      }
    };

    var data = [{
      title: __.name,
      type: 'editable',
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: item.size + ' GB'
    }, {
      title: __.type,
      content: utils.getVolumeType(item)
    }, {
      title: __.attach_to + __.instance,
      content: item.attachments.length > 0 ? getAttachments(item) : '-'
    }, {
      title: __.attributes,
      content: item.metadata.readonly === 'False' ? __.read_write : __.read_only
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }];

    return data;
  }

  getRelatedSnapshotItems(items) {
    var data = [];
    items.forEach((item) => {
      data.push({
        title: item.created_at,
        name:
          <span>
            <i className="glyphicon icon-snapshot" />
            <a data-type="router" href={'/dashboard/snapshot/' + item.id}>{item.name}</a>
          </span>,
        size: item.size + 'GB',
        time: item.created_at,
        status: getStatusIcon(item.status),
        createIcon: 'volume',
        childItem: item
      });
    });

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
        request.editVolumeName(rawItem, newName).then((res) => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'create_related_volume':
        createModal(data.childItem);
        break;
      case 'create_related_snapshot':
        createSnapshot(data.rawItem);
        break;
      case 'delete_related_snapshot':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'snapshot',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteSnapshot(data.childItem);
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
      <div className="halo-module-volume" style={this.props.style}>
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
