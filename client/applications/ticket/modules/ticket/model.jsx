require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');

//var BasicProps = require('client/components/basic_props/index');
var Detail = require('client/applications/ticket/components/detail/index');

var createTicket = require('./pop/create_ticket/index');
var config = require('./config.json');
var request = require('./request');
var moment = require('client/libs/moment');
var __ = require('locale/client/ticket.lang.json');
var router = require('client/utils/router');
var getTime = require('client/utils/time_unification');

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
    var column = this.state.config.table.column;
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
    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  //request: get single data by ID
  getSingle(id) {
    var table = this.state.config.table;
    request.getSingle(id).then((res) => {
      table.data = [res];
      this.updateTableData(table, res._url, true, () => {
        var pathList = router.getPathList();
        router.replaceState('/ticket/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      this.setPagination(table, res);
      this.updateTableData(table);
    });
  }

  //request: get list
  getList() {
    var table = this.state.config.table,
      pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.tickets;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    });
  }

  getNextList(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.state.config.table;
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
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);

      var detail = this.refs.ticket.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

  setPagination(table, res) {
    var pagination = {},
      next = res.next ? res.next : null;

    if (next) {
      pagination.nextUrl = res._url.split('&')[0] + '&page=' + next;
    }

    var history = this.stores.urls;

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

      var history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    var _config = this.state.config;
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

    var ticket = this.refs.ticket;
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
    var sole = rows.length === 1 ? rows[0] : null;
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
        var url,
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
    var {rows} = data;
    var _data = {
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
        _data.status = 'close';
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
    var pathList = router.getPathList();
    router.pushState('/' + pathList.slice(0, 2).join('/'));
  }

  submitReply(that) {
    var _data = {
      content: that.refs.reply.value.trim()
    };

    var data = {
      attachments: that.refs.upload.refs.child.state.attachments
    };
    var id = that.props.rawItem.id;
    request.addFile(id, data).then((res) => {
      that.setState({
        files: that.state.files.concat(res)
      });
      if (_data.content !== '' && _data.content !== 'undefined') {
        request.createReply(id, _data).then((_res) => {
          that.refs.reply.value = '';
          that.setState({
            replies: that.state.replies.concat(_res)
          });
        });
      }
    });
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    rows[0].replies.map((reply) => {
      reply.updatedAt = getTime(reply.updatedAt);
    });

    var by = function(name) {
      return function(o, p) {
        var a, b;
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

    rows[0].replies.sort(by('updatedAt'));

    switch (tabKey) {
      case 'description':
        if (rows.length === 1) {
          contents[tabKey] = (
              <Detail
                rawItem={rows[0]}
                onCancel={this.onCancel}
                submitReply={this.submitReply}
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
        />
      </div>
    );
  }
}

module.exports = Model;
