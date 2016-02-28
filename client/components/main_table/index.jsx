require('./style/index.less');

var React = require('react');
var Captain = require('./captain');

var uskin = require('client/uskin/index');
var Button = uskin.Button;
var DropdownButton = uskin.DropdownButton;
var InputSearch = uskin.InputSearch;
var Tab = uskin.Tab;
var Table = uskin.Table;

var __ = require('i18n/client/lang.json');
var converter = require('./converter');
var getStatusIcon = require('client/dashboard/utils/status_icon');
var moment = require('client/libs/moment');
var router = require('client/dashboard/cores/router');

class MainTable extends React.Component {

  constructor(props) {
    super(props);

    this.stores = {
      rows: []
    };
    this.eventList = this.props.eventList;
    this.onChangeState = this.onChangeState.bind(this);
  }

  componentWillMount() {
    var config = this.props.config;

    this.setFilterDefaultName(config.table);
    converter.convertLang(__, config);

    this.renderTableColumn(config.table.column);

    router.on('changeState', this.onChangeState);
  }

  componentDidMount() {
    if (this.refs.captain) {
      this.captainNode = this.refs.captain;
    }

    if (this.refs.table) {
      this.tableNode = this.refs.table;
    }
  }

  /* initialize  */
  setFilterDefaultName(table) {
    table.column.forEach((col) => {
      if (col.filter) {
        col.filterAll = ['all'];
      }
    });
  }

  renderTableColumn(column, item, index) {
    column.map((col) => {
      switch (col.type) {
        case 'captain':
          !col.render && (col.render = (_col, _item, i) => {
            return (
              <a className="captain" onClick={this.clickCaptain.bind(this, _col, _item, i)}>
                {_item[_col.dataIndex]}
              </a>
            );
          });
          break;
        case 'status':
          !col.render && (col.render = (_col, _item, i) => {
            return getStatusIcon(_item[_col.dataIndex]);
          });
          break;
        case 'time':
          !col.render && (col.render = (_col, _item, i) => {
            return moment(_item[_col.dataIndex]).fromNow();
          });
          break;
        default:
          break;
      }
    });
  }

  /* handle on router */
  onChangeState(pathList) {
    if (pathList[1] !== this.props.moduleID) {
      return;
    }

    if (pathList[2]) {
      var row = this.props.config.table.data.filter((data) => data.id === pathList[2])[0];
      /* no row data means invalid path list */
      if (!row) {
        router.replaceState('/' + pathList.slice(0, 2).join('/'));
        return;
      }

      this.stores = {
        rows: [row]
      };

      if (this.captainNode && !this.captainNode.state.visible) {
        this.changeCaptainState('visible', true);
      }
      this.changeTableState('checkedKey', {
        [pathList[2]]: true
      });

      if (this.captainNode.shouldLoading()) {
        this.captainNode.loading();
      }
      this.captainNode.updateContent(this.stores.rows);
    } else {
      this.stores = {
        rows: []
      };

      if (this.captainNode && this.captainNode.state.visible) {
        this.changeCaptainState('visible', false);
      }
      this.changeTableState('checkedKey', {});
    }


    /* should btns change? ask the module */
    var func = this.eventList.clickTableCheckbox;
    func && func(
      null,
      pathList[2] ? true : false,
      pathList[2] ? this.stores.rows[0] : null,
      this.stores.rows
    );
  }

  /* change states of element */
  changeCaptainState(state, value) {
    if (this.captainNode) {
      this.captainNode.setState({
        [state]: value
      });
    }
  }

  changeTableState(state, value) {
    if (this.tableNode) {
      this.tableNode.setState({
        [state]: value
      });
    }
  }

  /* main table func */
  clickCaptain(col, item, i, e) {
    e.preventDefault();

    var shouldClose = this.captainNode.state.visible
      && (this.stores.rows.length === 1)
      && (this.stores.rows[0].id === item.id);

    var path = router.getPathList();
    if (shouldClose) {
      router.pushState('/project/' + path[1]);
    } else {
      router.pushState('/project/' + path[1] + '/' + item.id);
    }
  }

  checkboxListener(e, status, clickedRow, arr) {
    this.stores = {
      rows: arr
    };

    var path = router.getPathList();
    if (arr.length <= 0) {
      router.pushState('/project/' + path[1]);
    } else if (arr.length <= 1) {
      if (this.captainNode.state.visible) {
        if (path[2] === arr[0].id) {
          router.replaceState('/project/' + path[1] + '/' + arr[0].id, null, null, true);
        } else {
          router.pushState('/project/' + path[1] + '/' + arr[0].id);
        }
      }
    } else {
      this.captainNode.updateContent(this.stores.rows);
    }
  }

  searchInTable(text) {
    if (this.tableNode) {
      var search = this.props.config.search;

      if (search && search.column) {
        var filterCol = search.column;
        this.tableNode.setState({
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

  /* public api */
  /*clearState() {
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
  }*/

  refresh() {
    var func = this.eventList.refresh;
    func && func();
  }

  /* clicked from elements */
  clickTabs(e, item) {
    var func = this.eventList.clickTabs;
    func && func(e, item);
  }

  clickDropdownBtn(e, item) {
    var func = this.eventList.clickDropdownBtn;
    func && func(e, item);
  }

  clickBtns(e, key) {
    var func = this.eventList.clickBtns;
    func && func(e, key);
  }

  changeSearchInput(str) {
    this.searchInTable(str);

    var func = this.eventList.changeSearchInput;
    func && func(str);
  }

  changeCheckboxOnTable(e, status, clickedRow, arr) {
    this.checkboxListener(e, status, clickedRow, arr);

    var func = this.eventList.clickTableCheckbox;
    func && func(e, status, clickedRow, arr);
  }

  clickCaptainTabs(tab, item, callback) {
    var func = this.eventList.clickDetailTabs;
    func && func(tab, item, callback);
  }

  render() {
    var props = this.props,
      config = props.config,
      tabs = config.tabs,
      btns = config.btns,
      search = config.search,
      table = config.table,
      title = config.tabs.filter((tab) => tab.default)[0].name,
      detail = table.detail;

    /* loading */
    if (table.data === null) {
      table.data = [];
      table.loading = true;
    } else {
      table.loading = false;
    }

    return (
      <div className="halo-com-main-table">
        {tabs ?
          <div className="submenu-tabs">
            <Tab items={tabs} onClick={this.clickTabs.bind(this)} />
          </div>
          : null
        }
        <div className="operation-list">
          {btns.map((btn, index) =>
            btn.dropdown ?
              <DropdownButton
                key={index}
                disabled={btn.dropdown.disabled}
                buttonData={btn}
                dropdownItems={btn.dropdown.items}
                dropdownOnClick={this.clickDropdownBtn.bind(this)} />
            : <Button
                key={index}
                value={btn.value}
                btnKey={btn.key}
                onClick={this.clickBtns.bind(this)}
                type={btn.type}
                disabled={btn.disabled}
                iconClass={btn.icon}
                initial={true} />
          )}
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
                <a onClick={this.clickBtns.bind(this, this, 'create')}>{__.here}</a>
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
              checkboxOnChange={this.changeCheckboxOnTable.bind(this)}
              hover={table.hover}
              striped={this.striped} />
          }
          {detail ?
            <Captain
              ref="captain"
              tabs={detail.tabs}
              clickTabs={this.clickCaptainTabs.bind(this)} />
            : null
          }
        </div>
      </div>
    );
  }

}

module.exports = MainTable;
