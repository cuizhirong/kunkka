require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const popExport = require('./pop/export/index');
const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/bill.lang.json');

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
    // pagination
    this.offset = 0;
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
      this.onInitialize(nextProps.params);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'total_cny':
          column.render = (col, item, i) => {
            return <span className="orange">{item.value}</span>;
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            return __[item.type] ? __[item.type] : item.type;
          };
          break;
        case 'come_from':
          column.render = (col, item, i) => {
            return __[item.come_from] ? __[item.come_from] : item.come_from;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.clearOffset();
    this.clearState();
    this.loadingTable();
    this.getList();
  }

  getList() {
    let _config = this.state.config,
      table = _config.table;
    request.getList(this.offset).then((res) => {
      table.data = res.charges;
      this.setPagination(table, res);
      this.updateTableData(table);
    }).catch(res => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  updateTableData(table) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'page_limit':
        this.onInitialize();
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    const pageLimit = localStorage.getItem('page_limit');
    switch (actionType) {
      case 'pagination':
        if (data.direction === 'prev'){
          this.offset -= Number(pageLimit);
        } else if (data.direction === 'next') {
          this.offset += Number(pageLimit);
        } else {//default
          this.offset = 0;
        }

        this.loadingTable();
        this.getList();
        break;
      default:
        break;
    }
  }

  setPagination(table, res) {
    let pageLimit = localStorage.getItem('page_limit');
    let pagination = {};

    pagination.nextUrl = res.total_count - this.offset > pageLimit ? 'yes' : null;

    pagination.prevUrl = this.offset > 0 ? 'yes' : null;

    table.pagination = pagination;

    return table;
  }

  onClickBtnList(key, refs, data) {
    switch (key) {
      case 'export':
        popExport();
        break;
      case 'refresh':
        this.refresh();
        break;
      default:
        break;
    }
  }

  refresh() {
    this.clearOffset();
    this.clearState();
    this.loadingTable();
    this.getList();
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  clearState() {
    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  clearOffset() {
    this.offset = 0;
  }

  render() {
    return (
      <div className="halo-module-charge" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params} />
      </div>
    );
  }
}

module.exports = Model;
