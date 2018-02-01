require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const getTime = require('client/utils/time_unification');

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
      this.onInitialize();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'id':
          column.render = (col, item, i) => {
            return item.resource.id;
          };
          break;
        case 'resource_type':
          column.render = (col, item, i) => {
            return item.resource.type;
          };
          break;
        case 'cost':
          column.render = (col, item, i) => {
            return <span className="price">{item.cost}</span>;
          };
          break;
        case 'create_time':
          column.render = (col, item, i) => {
            return getTime(item.resource.started_at);
          };
          break;
        default:
          break;
      }
    });
  }

  //initialize table data
  onInitialize() {
    this.loadingTable();
    this.getList(this.offset);
  }

  getList(offset) {
    let table = this.state.config.table;
    let pageLimit = localStorage.getItem('page_limit');
    request.getList(offset, pageLimit).then((res) => {
      table.data = res.data;
      this.setPagination(table, res);
      this.updateTableData(table);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table);
    });
  }

  //rerender: update table data
  updateTableData(table, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    });
  }

  refresh() {
    this.clearState();
    this.clearOffset();
    this.loadingTable();
    this.getList(this.offset);
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

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'search':
        this.onClickSearch(actionType, refs, data);
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

  onClickBtnList(key, refs, data) {
    switch(key) {
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


  setPagination(table, res) {
    const pageLimit = localStorage.getItem('page_limit');
    let pagination = {};
    pagination.nextUrl = res.total > (this.offset + +pageLimit) ? (this.offset + +pageLimit) : null;
    if(res.total <= pageLimit) {
      pagination.nextUrl = null;
    }
    if (this.offset > 0) {
      pagination.prevUrl = true;
    }
    table.pagination = pagination;

    return table;
  }

  onClickTable(actionType, refs, data) {
    const pageLimit = localStorage.getItem('page_limit');
    switch (actionType) {
      case 'pagination':
        if (data.direction === 'prev'){
          this.offset -= +pageLimit;
        } else if (data.direction === 'next') {
          this.offset = data.url;
        } else {
          this.clearOffset();
          this.clearState();
        }

        this.loadingTable();
        this.getList(this.offset);
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-record" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
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
