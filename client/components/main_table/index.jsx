require('./style/index.less');

var React = require('react');
var lang = require('i18n/client/lang.json');
var converter = require('./converter');
var moment = require('client/libs/moment');
var __ = require('i18n/client/lang.json');
var router = require('client/dashboard/cores/router');
var Details = require('./details');

var uskin = require('client/uskin/index');
var Button = uskin.Button;
var DropdownButton = uskin.DropdownButton;
var InputSearch = uskin.InputSearch;
var Tab = uskin.Tab;
var Table = uskin.Table;

class MainTable extends React.Component {

  constructor(props) {
    super(props);

    this.stores = {
      checkedRow: []
    };
    moment.locale(HALO.configs.lang);
    this.changeSearchInput = this.changeSearchInput.bind(this);
    this.tableCheckboxOnClick = this.tableCheckboxOnClick.bind(this);
    this.controlCaptain = this.controlCaptain.bind(this);
    this.onChangeState = this.onChangeState.bind(this);
  }

  componentWillMount() {
    var config = this.props.config;
    this.setTableFilterAllLang(config.table);
    converter.convertLang(lang, config);
    this.tableColRender(config.table.column);
    router.on('changeState', this.onChangeState);
  }

  onChangeState(pathList) {
    if (pathList[1] !== this.props.moduleID) {
      return;
    }
    var table = this.refs.table;
    var checkedRow = this.props.config.table.data.filter((data) => data.id === pathList[2])[0];

    //if the detail id is invalid, replace url to current module pathlist
    if (pathList[2] && !checkedRow) {
      router.replaceState('/' + pathList.slice(0, 2).join('/'), null, null, false);
      return;
    }

    //when detail ID is valid, open the detail module
    if (pathList[2]) {
      if (!this.refs.details.state.detailVisible) {
        this.refs.details.setState({
          detailVisible: true
        });
      }
      table && table.setState({
        checkedKey: {
          [pathList[2]]: true
        }
      });

      this.stores = {
        checkedRow: [checkedRow]
      };

      var selectedTab = this.props.config.table.detail.tabs.filter((tab) => tab.default)[0];
      this.refs.details.updateContent(selectedTab, this.stores.checkedRow);
    } else {
      this.refs.details.setState({
        detailVisible: false
      });
      table && table.setState({
        checkedKey: {}
      });
    }

    this.props.eventList.updateBtns(!!pathList[2], checkedRow, !pathList[2] ? [] : [checkedRow]);

  }

  clickTabs(e, item) {
    router.pushState('/project/' + item.key);
  }

  setTableFilterAllLang(table) {
    table.column.forEach((col) => {
      if (col.filter) {
        col.filterAll = ['all'];
      }
    });
  }

  changeSearchInput(text) {
    this.searchInTable(text);
    this.props.eventList.changeSearchInput && this.props.eventList.changeSearchInput(text);
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

  getStatusIcon(data) {
    switch (data) {
      case 'active':
        return <i className="glyphicon icon-status-active active" />;
      case 'available':
        return <i className="glyphicon icon-status-active active" />;
      case 'down':
        return <i className="glyphicon icon-status-light available" />;
      case 'in-use':
        return <i className="glyphicon icon-status-light active" />;
      default:
        return undefined;
    }
  }

  controlCaptain(_item, _col, _index, e) {
    e.preventDefault();

    var shouldClose = this.refs.details.state.detailVisible
      && (this.stores.checkedRow.length === 1)
      && (this.stores.checkedRow[0].id === _item.id);

    var path = router.getPathList();

    if (shouldClose) {
      router.pushState('/project/' + path[1]);
    } else {
      router.pushState('/project/' + path[1] + '/' + _item.id);
    }
  }

  tableColRender(column, item, index) {
    column.map((col) => {
      switch (col.type) {
        case 'captain':
          !col.render && (col.render = (rcol, ritem, rindex) => {
            return <a style={{cursor: 'pointer'}} onClick={this.controlCaptain.bind(null, ritem, rcol, rindex)}>
              {ritem[rcol.dataIndex]}</a>;
          });
          break;
        case 'status':
          !col.render && (col.render = (rcol, ritem, rindex) => {
            var data = ritem[rcol.dataIndex].toLowerCase();
            var icon = this.getStatusIcon(data);
            return icon ? <div>{icon}{lang[data]}</div> : lang[data];
          });
          break;
        case 'time':
          !col.render && (col.render = (rcol, ritem, rindex) => {
            return moment(ritem[rcol.dataIndex]).fromNow();
          });
          break;
        default:
          break;
      }
    });
  }

  tableCheckboxOnClick(e, status, clickedRow, arr) {
    var clickTableCheckbox = this.props.eventList.clickTableCheckbox;
    if (clickTableCheckbox) {
      clickTableCheckbox(e, status, clickedRow, arr);
    }

    this.stores = {
      checkedRow: arr
    };

    var path = router.getPathList();
    if (arr.length > 1) {
      var selectedTab = this.props.config.table.detail.tabs.filter((tab) => tab.default)[0];
      this.refs.details.updateContent(selectedTab, this.stores.checkedRow);
    } else if (arr.length > 0) {
      if (this.refs.details.state.detailVisible) {
        router.pushState('/project/' + path[1] + '/' + arr[0].id);
      }
    } else {
      router.pushState('/project/' + path[1]);
    }
  }

  clearState() {
    this.clearSearchState();
    this.clearTableState();
    this.setState({
      detailVisible: false
    });
  }

  clearSearchState() {
    if (this.refs.search) {
      this.refs.search.clearState();
      this.searchInTable('');
    }
  }

  clearTableState() {
    if (this.refs.table) {
      this.refs.table.clearState();
    }
  }

  render() {
    var props = this.props,
      config = props.config,
      eventList = props.eventList,
      btns = config.btns,
      search = config.search,
      table = config.table,
      title = config.tabs.filter((tab) => tab.default)[0].name;

    if (table.data === null) {
      table.loading = true;
      table.data = [];
    } else {
      table.loading = false;
    }

    return (
      <div className="halo-com-main-table">
        {config.tabs ?
          <div className="submenu-tabs">
            <Tab
            items={config.tabs}
            onClick={this.clickTabs} />
          </div>
          : null
        }
        <div className="operation-list">
          {btns.map((btn, index) =>
            !btn.dropdown ?
            <Button
              key={index}
              value={btn.value}
              btnKey={btn.key}
              onClick={eventList.clickBtns}
              type={btn.type}
              disabled={btn.disabled}
              iconClass={btn.icon}
              initial={true} />
           : <DropdownButton
              key={index}
              disabled={btn.dropdown.disabled}
              buttonData={btn}
              dropdownItems={btn.dropdown.items}
              dropdownOnClick={eventList.clickDropdownBtn} />
          )}
          {config.search ?
            <InputSearch
              ref="search"
              type="light"
              width={search.width}
              onChange={this.changeSearchInput} />
            : null
          }
        </div>
        <div className="table-box">
          {!table.loading && table.data.length === 0 ?
            <div className="table-with-no-data">
              <Table
                column={table.column}
                data={[]}
                checkbox={table.checkbox} />
              <div>
              </div>
                <p>
                  {__.there_is_no + title + __.comma + __.click}
                  <a onClick={eventList.clickBtns.bind(null, this, 'create')}>{__.here}</a>
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
            checkboxOnChange={this.tableCheckboxOnClick}
            hover={table.hover}
            striped={this.striped} />
          }
          {table.detail ?
            <Details
              ref="details"
              tabs={table.detail.tabs}
              itemData={this.stores.checkedRow}
              onClickTabs={eventList.clickDetailTabs} />
            : null
          }
        </div>
      </div>
    );
  }

}

module.exports = MainTable;
