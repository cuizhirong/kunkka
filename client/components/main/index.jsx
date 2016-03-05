require('./style/index.less');

var React = require('react');
var {InputSearch, Tab, Table} = require('client/uskin/index');
var ButtonList = require('./button_list');
var Detail = require('./detail');
var __ = require('i18n/client/lang.json');
var converter = require('client/components/main_table/converter');
var getStatusIcon = require('client/dashboard/utils/status_icon');
var moment = require('client/libs/moment');
var router = require('client/dashboard/cores/router');

class Main extends React.Component {
  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.stores = {
      rows: []
    };

  }

  componentWillMount() {
    this.onInitialize();
  }

  onInitialize() {
    var config = this.props.config;

    converter.convertLang(__, config);
    this.setTableColRender(config.table.column);
  }

  setTableColRender(columns) {
    columns.map((column) => {
      switch (column.type) {
        case 'captain':
          var output = column.render ? column.render() : undefined;

          column.render = (col, item, i) => {
            return (
              <a className="captain" onClick={this.onClickCaptain.bind(this, item)}>
                {output ? output : item[col.dataIndex]}
              </a>
            );
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return getStatusIcon(item[col.dataIndex]);
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
    this.onChangeParams(nextProps.params);
  }

  onChangeParams(params) {
    if (params.length === 3) {
      var row = this.props.config.table.data.filter((data) => data.id === params[2])[0];
      /* no row data means invalid path list */
      if (!row) {
        router.replaceState('/' + params.slice(0, 2).join('/'));
        return;
      }

      this.stores = {
        rows: [row]
      };

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
      this.stores = {
        rows: []
      };

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

  searchInTable(text) {
    if (this.refs.table) {
      var search = this.props.config.search;

      if (search && search.column) {
        var filterCol = search.column;
        this.refs.table.setState({
          filterCol: filterCol,
          filterBy: function(item, _column) {
            return _column.some((col) => {
              if (filterCol[col.key] && item[col.dataIndex]) {
                var td = item[col.dataIndex].toLowerCase();
                return td.indexOf(text.toLowerCase()) > -1 ? true : false;
              }
            });
          }
        });
      }
    }
  }

  onClickCaptain(item, e) {
    e.preventDefault();

    var shouldClose = this.refs.detail.state.visible
      && (this.stores.rows.length === 1)
      && (this.stores.rows[0].id === item.id);

    var path = router.getPathList();
    if (shouldClose) {
      router.pushState('/project/' + path[1]);
    } else {
      router.pushState('/project/' + path[1] + '/' + item.id);
    }
  }

  clickTabs(e, item) {
    var path = router.getPathList();
    router.pushState('/' + path[0] + '/' + item.key);
  }

  changeSearchInput(str) {
    this.searchInTable(str);

    this.onAction('serachInput', 'search', {
      text: str
    });
  }

  checkboxListener(e, status, clickedRow, arr) {
    var path = this.props.params;
    if (arr.length <= 0) {
      router.pushState('/project/' + path[1]);
    } else if (arr.length <= 1) {
      if (path[2] === arr[0].id) {
        router.replaceState('/project/' + path[1] + '/' + arr[0].id, null, null, true);
      } else {
        router.pushState('/project/' + path[1] + '/' + arr[0].id);
      }
    } else {
      // this.refs.detail.updateContent(this.stores.rows);
    }

  }

  onChangeTableCheckbox(e, status, clickedRow, rows) {
    this.stores = {
      rows: rows
    };

    if (this.refs.detail.state.visible) {
      this.checkboxListener(e, status, clickedRow, rows);
    }

    if (!this.refs.detail.state.visible || (this.refs.detail.state.visible && rows.length > 1)) {
      if (this.refs.detail.state.visible) {
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
    this.clearSearchState();
    this.clearTableState();
  }

  clearSearchState() {
    if (this.refs.search) {
      this.refs.search.clearState();
      this.searchInTable('');
    }
  }

  clearTableState() {
    if (this.tableNode) {
      this.tableNode.clearState();
    }
  }

  render() {
    var _config = this.props.config,
      tabs = _config.tabs,
      btns = _config.btns,
      search = _config.search,
      table = _config.table,
      title = _config.tabs.filter((tab) => tab.default)[0].name,
      detail = _config.table.detail;

    return (
      <div className="halo-com-main">
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
              onChange={this.changeSearchInput.bind(this)} />
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
                {__.there_is_no + title + __.comma + __.click}
                <a onClick={null}>{__.here}</a>
                {__.to_create + __.full_stop}
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
          {detail ?
            <Detail
              ref="detail"
              tabs={detail.tabs}
              onClickTabs={this.onClickDetailTabs.bind(this)} />
            : null
          }
        </div>
      </div>
    );
  }
}

module.exports = Main;
