require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

const __ = require('locale/client/admin.lang.json');
const config = require('./config.json');
const moment = require('client/libs/moment');
const request = require('./request');
const modifyConfig = require('./pop/modify/index');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: []
    };
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
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'value':
          column.render = (col, item, i) => {
            return item.value.toString();
          };
          break;
        default:
          break;
      }
    });
  }

  //initialize table data
  onInitialize(params) {
    let _config = this.state.config,
      table = _config.table;

    request.getList().then((res) => {
      let newTable = this.processTableData(table, res);
      this.updateTableData(newTable, res._url);
    });
  }

  //rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      if (currentUrl) {
        this.stores.urls.push(currentUrl);

        let detail = this.refs.dashboard.refs.detail,
          params = this.props.params;
        if (detail && refreshDetail && params.length > 2) {
          detail.refresh();
        }

        callback && callback();
      }
    });
  }

  processTableData(table, res) {
    if (res.setting) {
      table.data = res.setting;
    }

    return table;
  }

  //refresh: according to the given data rules
  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.initialList) {
      if (data.loadingTable) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.clearState();
      }

      this.getInitialListData();
    } else if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }
    }

    this.onInitialize();
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls = [];
  }

  clearState() {
    this.clearUrls();

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
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

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();

      if(data.text) {
        request.getList().then(res => {
          let settings = res.setting;
          let newSettings = settings.filter((setting) => {
            return setting.name === data.text || setting.name.includes(data.text);
          });
          let newConfig = this.state.config;
          newConfig.table.data = newSettings;
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
    let len = rows.length;

    for(let key in btns) {
      switch (key) {
        case 'modify':
          btns[key].disabled = (len === 1) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickBtnList(key, refs, data) {
    let {rows} = data,
      that = this;

    switch(key) {
      case 'modify':
        modifyConfig(rows[0], null, function() {
          that.refresh({
            refreshList: true
          });
        });
        break;
      case 'refresh':
        this.refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-config-mgmt" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }

}

module.exports = Model;
