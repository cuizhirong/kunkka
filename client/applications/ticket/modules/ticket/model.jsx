require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');

//let BasicProps = require('client/components/basic_props/index');
const Detail = require('client/applications/ticket/components/detail/index');

const createTicket = require('./pop/create_ticket/index');
const config = require('./config.json');
const request = require('./request');
const moment = require('client/libs/moment');
const __ = require('locale/client/ticket.lang.json');
const router = require('client/utils/router');
const getTime = require('client/utils/time_unification');
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
    let column = this.state.config.table.column;
    this.tableColRender(column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      if (this.state.config.table.loading) {
        this.loadingTable();
        this.onInitialize(nextProps.params);
      } else if (this.props.style.display !== 'none' && nextProps.style.display === 'none'){
        this.clearState();
      }
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'reply':
          column.render = (col, item, i) => {
            return <div className="replies">{item.replies.length}</div>;
          };
          break;
        default:
          break;
      }
    });
  }

  //initialize table data
  onInitialize(params) {
    this.getList();
  }

  //request: get list
  getList() {
    let table = this.state.config.table,
      pageLimit = table.limit;
    request.initContainer().then(_res => {
      request.getList(pageLimit).then((res) => {
        table.data = res.tickets;
        this.setPagination(table, res);
        this.updateTableData(table, res._url);
      });
    });
  }

  getNextList(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      let table = this.state.config.table;
      if (res.tickets) {
        table.data = res.tickets;
      } else if (res.id) {
        table.data = [res];
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);

      let detail = this.refs.ticket.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

  setPagination(table, res) {
    let pagination = {},
      next = res.next ? res.next : null;

    if (next) {
      pagination.nextUrl = res._url.split('&')[0] + '&page=' + next;
    }

    let history = this.stores.urls;

    if(history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  getInitialListData() {
    this.getList();
  }

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
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
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.ticket.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls.length = 0;
  }

  clearState() {
    this.clearUrls();

    let ticket = this.refs.ticket;
    if (ticket) {
      ticket.clearState();
    }
  }

  onAction(field, actionType, refs, data) {
    switch(field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      case 'reply':
        this.refresh({
          refreshList: true,
          refreshDetail: true
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
    let sole = rows.length === 1 ? rows[0] : null;
    for (let key in btns) {
      switch (key) {
        case 'open':
          btns[key].disabled = (sole && sole.status === 'closed') ? false : true;
          break;
        case 'close':
          btns[key].disabled = ((sole && sole.status === 'pending') || (sole && sole.status === 'proceeding')) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
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
        } else if (data.direction === 'next'){
          url = data.url;
        } else {
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
    let _data = {
      status: ''
    };
    switch(key) {
      case 'create':
        createTicket(null, null, () => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true
          });
        });
        break;
      case 'open':
        _data.status = 'pending';
        request.updateStatus(rows[0].id, _data).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true
          });
        });
        break;
      case 'close':
        _data.status = 'closed';
        request.updateStatus(rows[0].id, _data).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
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

  onCancel() {
    this.dashboard.refs.detail.setState({
      visible: false
    });
    let pathList = router.getPathList();
    router.pushState('/' + pathList.slice(0, 2).join('/'));
  }

  submitReply(that) {
    let _data = {
      content: that.refs.reply.value.trim()
    };

    let data = {
      attachments: that.refs.upload.refs.child.state.attachments
    };
    that.refs.upload.refs.child.setState({
      fileNames: [],
      uploadError: []
    });
    let id = that.props.rawItem.id;
    request.addFile(id, data).then((res) => {
      that.setState({
        files: that.state.files.concat(res)
      });
      that.refs.upload.refs.child.setState({
        attachments: []
      });
      if (_data.content) {
        request.createReply(id, _data).then((_res) => {
          that.refs.reply.value = '';
          that.setState({
            replies: that.state.replies.concat(_res)
          });
          that.forceUpdate();
        });
      }
    });
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    rows[0].replies.map((reply) => {
      reply.updatedAt = getTime(reply.updatedAt);
    });

    let sortTime = function(name) {
      return function(o, p) {
        let a, b;
        if (typeof o === 'object' && typeof p === 'object' && o && p) {
          a = Date.parse(o[name]);
          b = Date.parse(p[name]);
          if (a === b) {
            return 0;
          }

          if (typeof a === typeof b) {
            return a < b ? -1 : 1;
          }
        }
      };
    };

    rows[0].replies.sort(sortTime('updatedAt'));

    switch (tabKey) {
      case 'description':
        if (rows.length === 1) {
          contents[tabKey] = (
              <Detail
                rawItem={rows[0]}
                onCancel={this.onCancel}
                submitReply={this.submitReply}
                onAction={this.onAction}
                dashboard={this.refs.ticket ? this.refs.ticket : null} />
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

  render() {
    return (
      <div className="halo-module-create-tickets"
      style={this.props.style}>
        <Main
          ref="ticket"
          visible={this.props.style.display ===
          'none' ? false : true}
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
