require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const popExport = require('./pop/export/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/bill.lang.json');
const {Pagination} = require('client/uskin/index');

class Model extends React.Component {
  constructor(props) {
    super(props);
    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction', 'onClickPagination'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
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
        case 'charge-type':
          column.render = (col, item, i) => {
            return __[item.type] ? __[item.type] : item.type;
          };
          break;
        case 'channel':
          column.render = (col, item, i) => {
            return __[item.come_from] ? __[item.come_from] : item.come_from;
          };
          break;
        case 'target':
          column.render = (col, item, i) => {
            return item.target.user_name;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    let current = 1;
    let limit = this.state.config.table.limit;
    this.getList(current, limit);
  }

  getList(current, limit) {
    this.loadingTable();
    if(current < 1) {
      current = 1;
    }
    let _config = this.state.config,
      table = _config.table;
    request.getList((current - 1) * limit, limit).then((res) => {
      table.data = res.charges;
      this.updateTableData(table, current, res.total_count, limit);
    }).catch(res => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  updateTableData(table, current, totalNum, limit) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    if (totalNum > 0) {
      let total = Math.ceil(totalNum / limit);
      table.pagination = {
        current: current,
        total: total,
        total_num: totalNum
      };
    } else {
      table.pagination = null;
    }

    this.setState({
      config: newConfig
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'pagination':
        this.onNextPage(refs, data);
        break;
      default:
        break;
    }
  }

  onNextPage(refs, page) {
    let limit = this.state.config.table.limit;
    this.getList(page, limit);
  }

  onClickBtnList(key, refs, data) {
    switch (key) {
      case 'export':
        popExport();
        break;
      case 'refresh':
        let current = 1;
        let limit = this.state.config.table.limit;
        this.refs.dashboard.setRefreshBtnDisabled(true);
        this.loadingTable();
        this.getList(current, limit);
        break;
      default:
        break;
    }
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  onClickPagination(page, e) {
    this.onAction('pagination', 'jump', this.refs, page);
  }

  render() {
    let _config = this.state.config,
      table = _config.table,
      pagi = table.pagination;
    return (
      <div className="halo-module-global-charge-record" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params} />
        {
          !table.loading && pagi ?
            <div className="pagination-box">
              <span className="page-guide">{__.pages + ': ' + pagi.current + '/' + pagi.total + ' '
                + __.total + ': ' + pagi.total_num}</span>
              <Pagination onClick={this.onClickPagination} current={pagi.current} total={pagi.total}/>
            </div>
          : null
          }
      </div>
    );
  }
}

module.exports = Model;
