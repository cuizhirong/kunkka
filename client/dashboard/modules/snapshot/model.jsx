require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var BasicProps = require('client/components/basic_props/index');

var deleteModal = require('client/components/modal_delete/index');

var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var request = require('./request');
var router = require('client/dashboard/cores/router');

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
        case 'size':
          column.render = (col, item, i) => {
            return item.size + ' GB';
          };
          break;
        case 'volume':
          column.render = (col, item, i) => {
            return (
              <span>
                <i className="glyphicon icon-volume" />
                <a data-type="router" href={'/project/volume/' + item.volume.id}>
                  {item.volume.name}
                </a>
              </span>
            );
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
      table.data = res.snapshots;
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
    }, true);
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
        break;
      case 'crt_img':
        break;
      case 'del_snapshot':
        deleteModal({
          action: 'delete',
          type: 'snapshot',
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
    var data = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.volume,
      content: item.volume_id ?
        <span>
          <i className="glyphicon icon-volume" />
          <a data-type="router" href={'/project/volume/' + item.volume.id}>{item.volume.name}</a>
        </span>
        : null
    }, {
      title: __.type,
      content: ''
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created
    }];

    return data;
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
      <div className="halo-module-snapshot" style={this.props.style}>
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
