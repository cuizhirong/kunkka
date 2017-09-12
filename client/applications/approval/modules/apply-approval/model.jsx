require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');
const ApplyDetail = require('../../components/apply_detail/index');

const acceptApply = require('./pop/accept/index');
const refuseApply = require('./pop/refuse/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/approval.lang.json');
const getStatusIcon = require('../../utils/status_icon');

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
    if(nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    }
  }

  onInitialize(params) {
    this.getTableData(params[2]);
  }

  getTableData(detailRefresh) {
    let table = this.state.config.table;
    request.getList().then((res) => {
      table.data = res.Applies;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);

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
    }).catch((res) => {
      table.data = [];
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  getInitializeListData() {
    this.getList();
  }

  getSingle(id) {
    this.clearState();

    let table = this.state.config.table;
    request.getApplicationByID(id).then((res) => {
      if (res) {
        table.data = [res];
      } else {
        table.data = [];
      }
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  getList() {
    this.clearState();

    let table = this.state.config.table;
    request.getList(table.limit).then((res) => {
      table.data = res.Applies;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if(res.Applies) {
        table.data = res.Applies;
      } else if(res) {
        table.data = [res];
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  updateTableData(table, currentUrl, refreshDetail) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      currentUrl && this.stores.urls.push(currentUrl.split('/apply/')[1]);

      let detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if(detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

  setPagination(table, res) {
    let pagination = {},
      next = res.next ? res.next : null,
      limit = table.limit ? table.limit : 10;

    if(next) {
      let currUrl = res._url.split('/apply/')[1],
        urlHead = currUrl.split('page=')[0];

      pagination.nextUrl = urlHead + 'page=' + next;
    }

    let history = this.stores.urls;

    if(history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = res.count > limit ? pagination : {};
    return table;
  }

  tableColRender(columns) {
    columns.map(column => {
      switch(column.key) {
        case 'project_name':
          column.render = (col, item, i) => {
            return item.projectName ? item.projectName : '(' + item.projectId.slice(0, 8) + ')';
          };
          break;
        default:
          break;
      }
    });
  }

  refresh(data, params) {
    if(!data) {
      data = {};
    }
    if(!params) {
      params = this.props.params;
    }

    if(data.initialList) {
      if(data.loadingTable) {
        this.loadingTable();
      }
      if(data.clearState) {
        this.clearState();
      }

      this.getInitializeListData();
    } else if(data.refreshList) {
      if(params[2]) {
        if(data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if(data.loadingTable) {
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
    switch(field) {
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

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    switch(tabKey) {
      case 'description':
        if(rows.length === 1) {
          syncUpdate = false;
          request.getResourceInfo().then(res => {
            let basicPropsItem = this.getBasicPropsItems(rows[0]);

            contents[tabKey] = (
              <div>
                <BasicProps
                  title={__.basic + __.properties}
                  defaultUnfold={true}
                  tabKey={'description'}
                  rawItem={rows[0]}
                  items={basicPropsItem ? basicPropsItem : []}
                  onAction={this.onDetailAction.bind(this)} />
                <ApplyDetail
                  title={__.application + __.detail}
                  defaultUnfold={true}
                  items={rows[0].detail}
                  data={res} />
              </div>
            );
            detail.setState({
              contents: contents,
              loading: false
            });
          });
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
    } else {
      detail.setState({
        loading: true
      });
    }
  }

  getBasicPropsItems(item) {
    let items = [{
      title: __.id,
      content: item.id
    }, {
      title: __.apply_desc,
      content: item.description ? item.description : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.applicant,
      content: item.username
    }, {
      title: __.project + __.name,
      content: item.projectName ? item.projectName + ' / ' + item.projectId : '- / ' + item.projectId
    }, {
      title: __.create + __.time,
      content: item.createdAt,
      type: 'time'
    }];

    let approvals = item.approvals,
      len = approvals.length;
    if(item.status === 'refused' && len > 0) {
      items.push({
        title: __.refuse_explain,
        content: approvals[len - 1].explain
      });
    }

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
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch(actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev') {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else { //default
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
    let rows = data.rows;
    switch (key) {
      case 'accept':
        acceptApply(rows[0], null, () => {
          this.refresh({
            refreshList: true,
            loadingTable: true
          });
        });
        break;
      case 'refuse':
        refuseApply(rows[0], null, () => {
          this.refresh({
            refreshList: true,
            loadingTable: true
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

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    for(let key in btns) {
      switch (key) {
        case 'accept':
        case 'refuse':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  render() {
    return (
      <div className="halo-module-apply-approval" style={this.props.style}>
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
