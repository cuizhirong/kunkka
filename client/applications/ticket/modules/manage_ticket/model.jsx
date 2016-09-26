require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');

var moment = require('client/libs/moment');
var __ = require('locale/client/ticket.lang.json');
var config = require('./config.json');
var router = require('client/utils/router');
var request = require('./request');
var Detail = require('client/applications/ticket/components/detail/index');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: this.setConfig(config)
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
    if (HALO.user.roles.includes('admin')) {
      this.state.config.btns.splice(2, 1);
    }
    this.initializeFilter(this.state.config.filter);
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
      } else {
        this.getList();
      }
    }
  }

  setConfig(_config) {
    var tabs = _config.tabs;
    tabs[0].default = true;
    tabs[1].default = false;
    tabs[2].default = false;
    return _config;
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'reply':
          column.render = (col, item, i) => {
            return <div className="replies">{item.replies.length}</div>;
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return __[item.status];
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.getList();
  }

  initializeFilter(filters, res) {
    var setOption = function(key, data) {
      filters.forEach((filter) => {
        filter.items.forEach((item) => {
          if (item.key === key) {
            item.data = data;
          }
        });
      });
    };

    var times = [{
      id: 'day',
      name: __.last_day
    }, {
      id: 'week',
      name: __.last_week
    }, {
      id: 'month',
      name: __.last_month
    }, {
      id: 'lastThreeMonth',
      name: __.last_three_month
    }];
    setOption('time', times);
  }

  getSingle(id) {
    var table = this.state.config.table,
      status = '',
      key = '';
    this.state.config.tabs.map(tab => {
      if (tab.default) {
        key = tab.key.split('_')[0];
        status = key === 'manage' ? 'pending' : key;
      }
    });
    request.getSingle(id, status).then((res) => {
      table.data = [res];
      this.updateTableData(table, res._url, true, () => {
        var pathList = router.getPathList();
        router.replaceState('/ticket/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table);
    });
  }

  getList() {
    this.stores.urls.length = 0;
    var table = this.state.config.table,
      pageLimit = table.limit;

    request.getList('pending', pageLimit).then((res) => {
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

  setPagination(table, res) {
    var pagination = {},
      next = res.next ? res.next : null;

    if (next) {
      pagination.nextUrl = res._url.split('page')[0] + '&page=' + next;
    }

    var history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.setConfig(this.state.config);
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

    if(data.initialList) {
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
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
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

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      var idData = data.filter_id,
        timeData = data.filter_type,
        start = '';
      if (idData) {
        this.getSingle(idData.id);
      } else if (timeData) {
        this.clearState();

        if (timeData.time) {
          let time = timeData.time;
          delete timeData.time;
          if (time === 'day' || time === 'week' || time === 'month') {
            start = moment().subtract(1, time);
          } else {
            start = moment().subtract(3, time);
          }
        }

        let pageLimit = this.state.config.table.limit;
        request.filter(start, pageLimit).then((res) => {
          var table = this.state.config.table;
          table.data = res.tickets;
          this.setPagination(table, res);
          this.updateTableData(table, res._url);
        });
      } else {
        var r = {};
        r.initialList = true;
        r.loadingTable = true;
        r.clearState = true;

        this.refresh(r);
      }
    }
  }

  onClickBtnList(key, refs, data) {
    var {rows} = data;
    var _data = {
      status: ''
    };
    switch(key) {
      case 'pending':
        _data.status = 'pending';
        request.updateStatus(rows[0].id, _data).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true

          });
        });
        break;
      case 'proceeding':
        _data.status = 'proceeding';
        request.updateStatus(rows[0].id, _data).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true

          });
        });
        break;
      case 'closed':
        _data.status = 'closed';
        request.updateStatus(rows[0].id, _data).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true

          });
        });
        break;
      case 'passed':
        request.passedToAdmin(rows[0].id).then((res) => {
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
        } else if (data.direction === 'next') {
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

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    var roleOwner = HALO.user.roles.includes('owner');
    var roleAdmin = HALO.user.roles.includes('admin');
    for (let key in btns) {
      switch(key) {
        case 'pending':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'proceeding':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'closed':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'passed':
          if (roleOwner && !roleAdmin) {
            btns[key].disabled = rows.length === 1 ? false : true;
          }
          break;
        default:
          break;
      }
    }
    return btns;
  }

  submitReply(that) {
    var _data = {
      content: that.refs.reply.value.trim()
    };
    that.refs.upload.refs.child.setState({
      fileNames: [],
      uploadError: []
    });

    var data = {
      attachments: that.refs.upload.refs.child.state.attachments
    };
    var id = that.props.rawItem.id;
    request.addFile(id, data).then((res) => {
      that.setState({
        files: that.state.files.concat(res)
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

  onCancel() {
    this.dashboard.refs.detail.setState({
      visible: false
    });
    var pathList = router.getPathList();
    router.pushState('/' + pathList.slice(0, 2).join('/'));
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    switch (tabKey) {
      case 'description':
        if (rows.length === 1) {
          contents[tabKey] = (
            <div>
              <Detail
                rawItem={rows[0]}
                submitReply={this.submitReply}
                onCancel={this.onCancel}
                onAction={this.onAction}
                dashboard={this.refs.ticket ? this.refs.ticket : null} />
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

  render() {
    return (
      <div className="halo-module-manage-tickets"
      style={this.props.style}>
        <Main
          ref="ticket"
          visible={this.props.style.display ===
          'none' ? false : true}
          __={__}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }
}

module.exports = Model;
