require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');

const modifyDomain = require('./pop/modify_domain/index');
//let deactivateDomain = require('./pop/deactivate/index');
const activateDomain = require('./pop/activate/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/admin.lang.json');
const getStatusIcon = require('../../utils/status_icon');
const router = require('client/utils/router');

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
        case 'status':
          column.render = (col, item, i) => {
            return item.enabled ?
              <span className="label-active">{__.activated}</span> : <span className="label-down">{__.inactive}</span>;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getInitialListData() {
    this.getList();
  }

  getSingle(id) {
    this.clearState();

    let table = this.state.config.table;
    request.getDomainByID(id).then((res) => {
      if (res.domain) {
        table.data = [res.domain];
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      table.pagination = {};
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getList() {
    this.clearState();

    let table = this.state.config.table;
    request.getList(table.limit).then((res) => {
      table.data = res.domains;
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.domains) {
        table.data = res.domains;
      } else if (res.domain) {
        table.data = [res.domain];
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      table.pagination = {};
      this.updateTableData(table, String(res.responseURL));
    });
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();

      if (data.text) {
        this.getSingle(data.text);
      } else {
        this.getList();
      }
    }
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      if (currentUrl) {
        this.stores.urls.push(currentUrl.split('/v3/')[1]);

        let detail = this.refs.dashboard.refs.detail,
          params = this.props.params;
        if (detail && refreshDetail && params.length > 2) {
          detail.refresh();
        }

        callback && callback();
      }
    });
  }

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

      let history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
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
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
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
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev'){
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {//default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    let {rows} = data;

    let that = this;
    switch(key) {
      case 'modify_domain':
        modifyDomain(rows[0], null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'activate_domain':
        activateDomain(rows[0], null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'deactivate_domain':
        /*deactivateDomain(rows[0], null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });*/
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
    let status = singleRow ? rows[0].enabled : null;

    for(let key in btns) {
      switch (key) {
        case 'modify_domain':
          btns[key].disabled = !singleRow;
          break;
        case 'activate_domain':
          btns[key].disabled = !singleRow || status;
          break;
        case 'deactivate_domain':
          //btns[key].disabled = !singleRow || !status;
          btns[key].disabled = true;
          break;
        default:
          break;
      }
    }

    return btns;
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
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
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

    detail.setState({
      contents: contents,
      loading: false
    });
  }

  getBasicPropsItems(item) {
    let items = [{
      title: __.name,
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.describe,
      content: item.description
    }, {
      title: __.status,
      content: item.enabled ? __.activated : __.inactive
    }];

    return items;
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
        let {rawItem, newName} = data;
        request.editDomain(rawItem.id, {
          name: newName
        }).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-domain" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }
}

module.exports = Model;
