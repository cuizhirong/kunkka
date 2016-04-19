require('./style/index.less');

var React = require('react');
var {InputSearch, Tab, Table} = require('client/uskin/index');
var ButtonList = require('./button_list');
var FilterSearch = require('./filter_search');
var Detail = require('./detail');
var __ = require('locale/client/admin.lang.json');
var converter = require('./converter');
var moment = require('client/libs/moment');
var router = require('client/utils/router');

class Main extends React.Component {
  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.stores = {
      rows: []
    };
  }

  componentWillMount() {
    var config = this.props.config;
    config.table.column.forEach((col) => {
      if (col.filter) {
        col.filterAll = ['all'];
      }
      if (col.sort) {
        col.sortBy = function(item1, item2) {
          var key = col.dataIndex,
            a = item1[key] ? item1[key] : '(' + item1.id + ')',
            b = item2[key] ? item2[key] : '(' + item2.id + ')';

          return a.localeCompare(b);
        };
      }
    });

    converter.convertLang(__, config);
    this.tableColRender(config.table.column);
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.type) {
        case 'captain':
          column.render = (col, item, i) => {
            var formatData = column.formatter && column.formatter(col, item, i);
            if (!formatData) {
              formatData = (item[col.dataIndex] ? item[col.dataIndex] : '(' + item.id.substr(0, 8) + ')');
            }
            return (
              <a className="captain" onClick={this.onClickCaptain.bind(this, item)}>
                {formatData}
              </a>
            );
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return this.props.getStatusIcon(item[col.dataIndex]);
          };
          break;
        case 'time':
          column.render = (col, item, i) => {
            return moment(item[col.dataIndex]).fromNow();
          };
          break;
        default:
          break;
      }
    });
  }

  onAction(field, actionType, data) {
    if (!data) {
      data = {};
    }
    data.rows = this.stores.rows;
    var func = this.props.onAction;
    func && func(field, actionType, this.refs, data);
  }

  componentDidMount() {
    this.props.onInitialize(this.props.params);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.visible) {
      this.clearState();
    } else {
      if (nextProps.config.table.data.length > 0) {
        if (this.props.params[1] === nextProps.params[1]) {
          this.onChangeParams(nextProps.params);
        }
      }
    }

    this.updateRows(nextProps.config.table.data);
  }

  shouldComponentUpdate(nextProps) {
    if (!this.props.visible && !nextProps.visible) {
      return false;
    }
    return true;
  }

  updateRows(data) {
    //update main store rows
    var newRows = [];

    this.stores.rows.forEach((item) => {
      var existed = data.filter((d) => d.id === item.id)[0];

      if (existed) {
        newRows.push(existed);
      }
    });

    this.stores.rows = newRows;

    //update table checkedKey
    var checkedKey = {};
    newRows.forEach((item) => {
      checkedKey[item.id] = true;
    });

    if (this.refs.table) {
      this.refs.table.setState({
        checkedKey: checkedKey
      });
    }

    //update btn status
    this.onAction('table', 'check', {
      status: false,
      checkedRow: this.stores.rows
    });
  }

  onChangeParams(params) {
    if (params.length === 3) {
      var row = this.props.config.table.data.filter((data) => '' + data.id === params[2])[0];
      /* no row data means invalid path list */
      if (!row) {
        router.replaceState('/' + params.slice(0, 2).join('/'));
        return;
      }

      this.stores.rows = [row];

      if (this.refs.detail && !this.refs.detail.state.visible) {
        this.refs.detail.setState({
          visible: true
        });
      }

      if (this.refs.table) {
        this.refs.table.setState({
          checkedKey: {
            [params[2]]: true
          }
        });
      }

      this.refs.detail.setState({
        contents: {}
      }, () => {
        this.onClickDetailTabs();
      });
    } else {
      this.stores.rows = [];

      if (this.refs.detail && this.refs.detail.state.visible) {
        this.refs.detail.setState({
          visible: false
        });
      }

      if (this.refs.table) {
        this.refs.table.setState({
          checkedKey: {}
        });
      }
    }

    this.onAction('table', 'check', {
      status: params[2] ? true : false,
      checkedRow: params[2] ? this.stores.rows[0] : null
    });

  }

  onClickCaptain(item, e) {
    e.preventDefault();

    var shouldClose = this.refs.detail.state.visible
      && (this.stores.rows.length === 1)
      && (this.stores.rows[0].id === item.id);

    var path = router.getPathList();
    if (shouldClose) {
      router.pushState('/' + path[0] + '/' + path[1]);
    } else {
      router.pushState('/' + path[0] + '/' + path[1] + '/' + item.id);
    }
  }

  clickTabs(e, item) {
    var path = router.getPathList();
    router.pushState('/' + path[0] + '/' + item.key);
  }

  onConfirmFilter(data) {
    this.closeDeatail();
    this.onAction('filter', 'search', data);
  }

  changeSearchInput(str, status) {
    if (status) {
      this.closeDeatail();
      this.onAction('search', 'click', {
        text: str
      });
    }
  }

  checkboxListener(e, status, clickedRow, arr) {
    var path = this.props.params;
    if (arr.length <= 0) {
      router.pushState('/admin/' + path[1]);
    } else if (arr.length <= 1) {
      if (path[2] === arr[0].id) {
        router.replaceState('/admin/' + path[1] + '/' + arr[0].id, null, null, true);
      } else {
        router.pushState('/admin/' + path[1] + '/' + arr[0].id);
      }
    } else {
      // this.refs.detail.updateContent(this.stores.rows);
    }

  }

  onChangeTableCheckbox(e, status, clickedRow, rows) {
    this.stores.rows = rows;

    if (this.refs.detail && this.refs.detail.state.visible) {
      this.checkboxListener(e, status, clickedRow, rows);
    }

    if (!this.refs.detail || (!this.refs.detail.state.visible || (this.refs.detail.state.visible && rows.length > 1))) {
      if (this.refs.detail && this.refs.detail.state.visible) {
        this.onClickDetailTabs();
      }
      this.onAction('table', 'check', {
        status: status,
        clickedRow: clickedRow
      });
    }
  }

  onClickDetailTabs(tab) {
    this.onAction('detail', tab ? tab.key : this.refs.detail.findDefaultTab().key, {});
  }

  clearState() {
    this.stores.rows = [];
    this.onAction('table', 'check', {
      status: false,
      clickedRow: []
    });

    this.closeDeatail();
    this.clearSearchState();
    this.clearFilterState();
    this.clearTableState();
  }

  closeDeatail() {
    if (this.refs.detail) {
      this.refs.detail.setState({
        visible: false
      });
    }
  }

  clearSearchState() {
    if (this.refs.search) {
      this.refs.search.clearState();
    }
  }

  clearFilterState() {
    if (this.refs.filter_search) {
      this.refs.filter_search.clearState();
    }
  }

  clearTableState() {
    if (this.refs.table) {
      this.refs.table.clearState();
    }
  }

  onNextPage(url, direction) {
    var data = {};
    data.url = url;
    data.direction = direction;
    this.onAction('table', 'pagination', data);
  }

  render() {
    var _config = this.props.config,
      tabs = _config.tabs,
      title = _config.tabs.filter((tab) => tab.default)[0].name,
      btns = _config.btns,
      search = _config.search,
      filter = _config.filter,
      table = _config.table,
      detail = _config.table.detail;

    var pagination = table.pagination,
      nextUrl, prevUrl;
    if (!pagination) {
      pagination = {};
    } else if (!table.loading) {
      nextUrl = pagination.nextUrl;
      prevUrl = pagination.prevUrl;
    }

    return (
      <div className="admin-com-main">
        {tabs ?
          <div className="submenu-tabs">
            <Tab items={tabs} onClick={this.clickTabs.bind(this)} />
          </div>
          : null
        }
        <div className="operation-list">
          <ButtonList
            ref="btnList"
            btns={btns}
            onAction={this.onAction.bind(this)} />
          {search ?
            <InputSearch
              ref="search"
              type="light"
              width={search.width}
              placeholder={search.placeholder}
              onChange={this.changeSearchInput.bind(this)} />
            : null
          }
          {filter ?
            <FilterSearch
              ref="filter_search"
              items={filter}
              onConfirm={this.onConfirmFilter.bind(this)} />
            : null
          }
        </div>
        <div className="table-box">
          {!table.loading && !table.data.length ?
            <div className="table-with-no-data">
              <Table
                column={table.column}
                data={[]}
                checkbox={table.checkbox} />
              <p>
                {__.there_is_no + title + __.full_stop}
              </p>
            </div>
          : <Table
              ref="table"
              column={table.column}
              data={table.data}
              dataKey={table.dataKey}
              loading={table.loading}
              checkbox={table.checkbox}
              checkboxOnChange={this.onChangeTableCheckbox.bind(this)}
              hover={table.hover}
              striped={this.striped} />
          }
          {!table.loading ?
            <div className="pagination">
              <div className={'prev ' + (prevUrl ? '' : 'disabled')}
                onClick={prevUrl ? this.onNextPage.bind(this, prevUrl, 'prev') : null}>
                <i className="glyphicon icon-arrow-left" />
              </div>
              <div className={'next ' + (nextUrl ? '' : 'disabled')}
                onClick={nextUrl ? this.onNextPage.bind(this, nextUrl, 'next') : null}>
                <i className="glyphicon icon-arrow-right" />
              </div>
            </div>
            : null
          }
          {detail ?
            <Detail
              ref="detail"
              tabs={detail.tabs}
              rows={this.stores.rows}
              onClickTabs={this.onClickDetailTabs.bind(this)} />
            : null
          }
        </div>
      </div>
    );
  }
}

module.exports = Main;
