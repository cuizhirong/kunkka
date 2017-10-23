require('./style/index.less');

//react components
const React = require('react');
const Main = require('client/components/main/index');

//detail components
const BasicProps = require('client/components/basic_props/index');
const deleteModal = require('client/components/modal_delete/index');

const uploadFile = require('./pop/upload/index');

const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('./request');
const router = require('client/utils/router');
const getStatusIcon = require('../../utils/status_icon');
const getTime = require('client/utils/time_unification');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

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
    let columns = this.state.config.table.column;
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
      this.loadingTable();
      this.getTableData(false);
    }
  }

  tableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.initContainer().then(_res => {
      request.getList(forceUpdate).then((res) => {
        let _config = this.state.config;

        let table = _config.table;
        table.data = res || [];
        table.loading = false;

        let detail = this.refs.dashboard.refs.detail;
        if (detail && detail.state.loading) {
          detail.setState({
            loading: false
          });
        }

        this.setState({
          config: _config
        }, () => {
          if (detail && detailRefresh) {
            detail.refresh();
          }
        });
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch(actionType) {
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
    let length = rows.length;

    for(let key in btns) {
      switch(key) {
        case 'delete':
          btns[key].disabled = length >= 1 ? false : true;
          break;
        case 'download':
          btns[key].disabled = length === 1 ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows, that = this;
    switch (key) {
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'file',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteFiles(rows).then((res) => {
              cb(true);
              that.refresh({
                tableLoading: true,
                detailRefresh: true
              }, true);
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'download':
        request.downloadItem(rows[0]);
        break;
      case 'upload':
        uploadFile(null, null, () => {
          that.refresh({
            tableLoading: true,
            detailRefresh: true
          }, true);
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

  onClickDetailTabs(tabKey, refs, data) {
    let {
      rows
    } = data;
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

    switch (tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
        }
        break;
      default:
        break;
    }

    detail.setState({
      contents: contents,
      loading: false
    });
  }

  getBasicPropsItems(item) {
    let items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.hash,
      content: item.hash
    }, {
      title: __.bytes,
      content: item.bytes
    }, {
      title: __.content_type,
      content: item.content_type
    }, {
      title: __.last_modified,
      content: getTime(item.last_modified, true)
    }];

    return items;
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

    this.getTableData(true);
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
      <div className="halo-module-template" style={this.props.style}>
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
