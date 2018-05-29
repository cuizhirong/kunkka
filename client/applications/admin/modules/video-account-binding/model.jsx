require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

const config = require('./config.json');

const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');

const createModal = require('./pop/create/index');
const deleteModal = require('./pop/delete/index');


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

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.onInitialize();
    }
  }

  onInitialize() {
    this.loadingTable();
    this.getList();
  }

  getList() {
    this.clearState();
    let table = this.state.config.table;

    request.getList().then((res) => {
      table.data = res || [];
      this.updateTableData(table, res._url);
    }).catch((err) => {
      table.data = [];
      this.updateTableData(table, String(err.responseURL));
    });
  }

  //rerender: update table data
  updateTableData(table, currentUrl, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      callback && callback();
    });
  }


  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'search':
        this.onClickSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    const that = this;
    const { rows } = data;

    switch (key) {
      case 'create':
        createModal(null, () => {
          that.refresh({
            refreshList: true,
            loadingTable: true
          });
        });
        break;
      case 'update':
        if(rows.length === 1) {
          createModal(rows[0], () => {
            that.refresh({
              refreshList: true,
              loadingTable: true
            });
          });
        }
        break;
      case 'delete':
        if(rows.length === 1) {
          deleteModal(rows[0], () => {
            that.refresh({
              refreshList: true,
              loadingTable: true
            });
          });
        }
        break;
      case 'refresh':
        that.refresh({
          refreshList: true,
          loadingTable: true
        });
        break;
      default:
        break;
    }
  }


  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();

      if(data.text) {
        request.getList().then(res => {
          let list = res || [];
          let newList = list.filter((item) => {
            return item.username === data.text.trim() || item.username.includes(data.text.trim());
          });
          let newConfig = this.state.config;
          newConfig.table.data = newList;
          newConfig.table.loading = false;

          this.setState({
            config: newConfig
          });
        });
      } else {
        this.onInitialize();
      }
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
    let singleRow = rows.length === 1;

    for(let key in btns) {
      switch (key) {
        case 'update':
        case 'delete':
          btns[key].disabled = !singleRow;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.refreshList) {
      if (data.loadingTable) {
        this.loadingTable();
      }

      this.getList();
    }
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  clearState() {
    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  render() {
    return (
      <div className="halo-module-video-account-binding" style={this.props.style}>
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
