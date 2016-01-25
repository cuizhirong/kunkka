require('./style/index.less');

var React = require('react');

var TableDetail = require('../table_detail/index');

var lang = require('i18n/client/lang.json');
var converter = require('./converter');

var uskin = require('client/uskin/index');
var Table = uskin.Table;
var Tab = uskin.Tab;
var Button = uskin.Button;
var DropdownButton = uskin.DropdownButton;
var InputSearch = uskin.InputSearch;

var moment = require('client/libs/moment');

class MainTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      detailVisible: false
    };

    moment.locale(HALO.configs.lang);
    this.tableCheckboxOnClick = this.tableCheckboxOnClick.bind(this);
    this.controlCaptain = this.controlCaptain.bind(this);
    this.searchInTable = this.searchInTable.bind(this);
  }

  componentWillMount() {
    var config = this.props.config;
    this.setTableFilterAllName(config.table);
    converter.convertLang(lang, config);
    this.tableColRender(config.table.column);
  }

  setTableFilterAllName(table) {
    table.column.forEach((col) => {
      if (col.filter) {
        col.filterAll = ['all'];
      }
    });
  }

  searchInTable(text) {
    var search = this.props.config.search;

    if (search && search.table_column) {
      var filterCol = search.table_column;
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

  getStatusIcon(data) {
    switch (data) {
      case 'active':
        return <i className="glyphicon icon-status-active active" />;
      case 'in-use':
        return <i className="glyphicon icon-status-light active" />;
      case 'down':
        return <i className="glyphicon icon-status-light available" />;
      default:
        return undefined;
    }
  }

  controlCaptain(_item, _col, _index, e) {
    e.preventDefault();

    var detail = this.refs.detail,
      table = this.refs.table;

    var prevKey = Object.keys(table.state.checkedKey);
    var shouldClose = detail.state.detailVisible && (prevKey.length === 1) && (prevKey[0] === _item.id);

    if (shouldClose) {
      this.setState({
        detailVisible: false
      });
      table.setState({
        checkedKey: {}
      });
    } else {
      this.setState({
        detailVisible: true
      });
      table.setState({
        checkedKey: {
          [_item.id]: true
        }
      });
    }

    this.props.eventList.controlBtns(!shouldClose, _item, shouldClose ? [] : [_item]);
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
    if (this.props.eventList.tableCheckboxOnClick) {
      this.props.eventList.tableCheckboxOnClick(e, status, clickedRow, arr);
    }

    if(this.state.detailVisible) {
      this.setState({
        detailVisible: false
      });
    }
  }

  clearState() {
    this.clearTableState();
    this.setState({
      detailVisible: false
    });
  }

  clearTableState() {
    this.refs.table.clearState();
  }

  render() {
    var props = this.props,
      config = props.config,
      eventList = props.eventList,
      btns = config.btns,
      search = config.search,
      table = config.table;

    if (table.data === null) {
      table.loading = true;
      table.data = [];
    } else {
      table.loading = false;
    }

    return (
      <div className="halo-main-table">
        {config.title ?
          <div className="header">
            <h3>{config.title}</h3>
          </div>
          : null
        }
        {config.tabs ?
          <div className="submenu-tabs">
            <Tab
            items={config.tabs}
            onClick={eventList.tabOnClick} />
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
              onClick={eventList.btnsOnClick}
              type={btn.type}
              disabled={btn.disabled}
              iconClass={btn.icon}
              initial={true} />
           : <DropdownButton
              key={index}
              disabled={btn.dropdown.disabled}
              buttonData={btn}
              dropdownItems={btn.dropdown.items}
              dropdownOnClick={eventList.dropdownBtnOnClick} />
          )}
          {config.search ?
            <InputSearch
              type="light"
              width={search.width}
              onChange={this.searchInTable} />
            : null
          }
        </div>
        <Table
          ref="table"
          column={table.column}
          data={table.data}
          dataKey={table.dataKey}
          loading={table.loading}
          checkbox={table.checkbox}
          checkboxOnChange={this.tableCheckboxOnClick}
          hover={table.hover}
          striped={this.striped} />
        <TableDetail ref="detail" detailVisible={this.state.detailVisible} />
      </div>
    );
  }

}

module.exports = MainTable;
