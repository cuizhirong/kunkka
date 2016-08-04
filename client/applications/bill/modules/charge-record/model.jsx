require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/bill.lang.json');
var {Pagination} = require('client/uskin/index');

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
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    var current = 1;
    var limit = this.state.config.table.limit;
    this.getList(current, limit);
  }

  getList(current, limit) {
    if (current < 1) {
      current = 1;
    }

    var _config = this.state.config,
      table = _config.table;
    request.getList((current - 1) * limit, limit).then((res) => {
      table.data = res.charges;
      this.updateTableData(table, current, res.total_count, limit);
    });
  }

  updateTableData(table, current, totalNum, limit) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    if (totalNum > 0) {
      var total = Math.ceil(totalNum / limit);
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
    var limit = this.state.config.table.limit;
    this.getList(page, limit);
  }

  onClickBtnList(key, refs, data) {
    switch (key) {
      case 'refresh':
        var current = 1;
        var limit = this.state.config.table.limit;
        this.getList(current, limit);
        break;
      default:
        break;
    }
  }

  onClickPagination(page, e) {
    this.onAction('pagination', 'jump', this.refs, page);
  }

  render() {
    var _config = this.state.config,
      table = _config.table,
      pagi = table.pagination;
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
