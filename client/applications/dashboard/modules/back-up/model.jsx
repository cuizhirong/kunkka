require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');

const BasicProps = require('client/components/basic_props/index');
const deleteModal = require('client/components/modal_delete/index');
const restoreModal = require('./pop/restore/index');

const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('./request');
const router = require('client/utils/router');
const msgEvent = require('client/applications/dashboard/cores/msg_event');
const getStatusIcon = require('../../utils/status_icon');

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
        if (data.resource_type === 'volume' || data.resource_type === 'snapshot') {
          this.refresh({
            detailRefresh: true
          }, false);

          if (data.action === 'delete'
            && data.stage === 'end'
            && data.resource_id === router.getPathList()[2]) {
            router.replaceState('/dashboard/back-up');
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

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'size':
          column.render = (col, item, i) => {
            return item.size + ' GB';
          };
          break;
        case 'resource':
          column.render = (col, item, i) => {
            if (item.snapshots.length === 0 && item.snapshot_id !== null) {
              return (
                 <span><i className="glyphicon icon-snapshot" />{'(' + item.snapshot_id.slice(0, 8) + ')'}</span>
              );
            } else if (item.snapshots.length === 0 && item.snapshot_id === null && item.volumes.length === 0) {
              return (
                 <span><i className="glyphicon icon-volume" />{'(' + item.volume_id.slice(0, 8) + ')'}</span>
              );
            } else if (item.snapshots.length > 0) {
              return (
                <span>
                  <i className="glyphicon icon-snapshot" />
                  <a data-type="router" href={'/dashboard/snapshot/' + item.snapshots[0].id}>{item.snapshots[0].name || '(' + item.snapshots[0].id.slice(0, 8) + ')'}</a>
                </span>
              );
            } else if (item.volumes.length > 0) {
              return (
                <span>
                  <i className="glyphicon icon-volume" />
                  <a data-type="router" href={'/dashboard/volume/' + item.volume_id}>{item.volumes[0].name || '(' + item.volumes[0].id.slice(0, 8) + ')'}</a>
                </span>
              );
            }
          };
          break;
        default:
          break;
      }
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
    switch (key) {
      case 'restart':
        let restoreData = {
          restore : {
            backup_id : rows[0].id,
            volumn_id: rows[0].volume_id,
            name: rows[0].name
          }
        };
        restoreModal({
          __: __,
          action: 'restart',
          type: 'back-up',
          data: rows,
          onRestore: function(_data, cb) {
            request.restoreBackup(rows[0], restoreData).then((res) => {
              cb(true);
            });
          }
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'back-up',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteBackup(rows).then((res) => {
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
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let single, singleStatus;
    if (rows.length === 1) {
      single = rows[0];
      singleStatus = single.status;
    }

    btns.restart.disabled = !(rows.length === 1 && (singleStatus === 'available' || singleStatus === 'in-use'));
    btns.delete.disabled = !(rows.length >= 1);

    return btns;
  }

  getBasicProps(item) {

    let getResource = (_item) => {
      if (_item.snapshots.length === 0 && item.snapshot_id !== null) {
        return (
           <span><i className="glyphicon icon-snapshot" />{'(' + _item.snapshot_id.slice(0, 8) + ')'}</span>
        );
      } else if (_item.snapshots.length === 0 && _item.snapshot_id === null && _item.volumes.length === 0) {
        return (
           <span><i className="glyphicon icon-volume" />{'(' + _item.volume_id.slice(0, 8) + ')'}</span>
        );
      } else if (_item.snapshots.length > 0) {
        return (
          <span>
            <i className="glyphicon icon-snapshot" />
            <a data-type="router" href={'/dashboard/snapshot/' + _item.snapshots[0].id}>{_item.snapshots[0].name || '(' + _item.snapshots[0].id.slice(0, 8) + ')'}</a>
          </span>
        );
      } else if (_item.volumes.length > 0) {
        return (
          <span>
            <i className="glyphicon icon-volume" />
            <a data-type="router" href={'/dashboard/volume/' + _item.volume_id}>{_item.volumes[0].name || '(' + _item.volumes[0].id.slice(0, 8) + ')'}</a>
          </span>
        );
      }
    };

    let data = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.resource,
      content: item.size + ' GB'
    }, {
      title: __.size,
      content: getResource(item)
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.container,
      content: item.container
    }, {
      title: __.availability_zone,
      content: item.availability_zone
    }, {
      title: __.description,
      content: item.description
    }, {
      title: __.incremental,
      content: item.is_incremental ? __.yes : __.no
    }, {
      title: __.force,
      content: item.has_dependent_backups ? __.yes : __.no
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }, {
      title: __.update + __.time,
      type: 'time',
      content: item.updated_at
    }];
    return data;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

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
          let basicPropsItem = this.getBasicProps(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem ? basicPropsItem : []}
                rawItem={rows[0]} />
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

  forceRefresh() {
    this.refresh({
      tableLoading: true,
      detailLoading: true,
      detailRefresh: true
    }, true);
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

  render() {
    return (
      <div className="halo-module-back-up" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          onClickDetailTabs={this.onClickDetailTabs.bind(this)}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }
}
module.exports = Model;
