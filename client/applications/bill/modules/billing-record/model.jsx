require('./style/index.less');

var React = require('react');
var Record = require('./record/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var getStatusIcon = require('../../utils/status_icon');

var __ = require('locale/client/bill.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction', 'tableColRender',
    'onNextPage', 'openDetail', 'onNextDetailPage'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    this.tableColRender(this.state.config.table.column);
  }

  componentDidMount() {
    this.onInitialize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && nextState.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'price':
          column.render = (col, item, i) => {
            return <span className="price">{item.total_price}</span>;
          };
          break;
        case 'unit_price':
          column.render = (col, item, i) => {
            return <span className="unit-price">{item.unit_price}</span>;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.getFilters();

    var current = 1;
    var limit = this.state.config.table.limit;
    this.getSales(current, limit);
  }

  getFilters() {
    var projects = Object.assign([], HALO.user.projects);
    projects.unshift({
      id: 'all',
      name: __.all + __.project
    });

    var regions = Object.assign([], HALO.region_list);
    regions.unshift({
      id: 'all',
      name: __.all + __.region
    });

    var status = [{
      id: 'all',
      name: __.all + __.status
    }, {
      id: 'running',
      name: __.running
    }, {
      id: 'stopped',
      name: __.stopped
    }, {
      id: 'deleted',
      name: __.deleted
    }, {
      id: 'changing',
      name: __.changing
    }, {
      id: 'error',
      name: __.error
    }];

    var selectList = this.refs.record.refs.select_list;
    selectList.setState({
      projects: projects,
      project: projects[0],
      regions: regions,
      region: regions[0],
      statuses: status,
      status: status[0]
    });
  }

  setTable(data, current, totalNum, limit) {
    var state = this.state;
    var newConfig = state.config;

    var table = newConfig.table;
    table.data = data;
    table.loading = false;

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

  getSales(current, limit) {
    if (current < 1) {
      current = 1;
    }

    var state = this.refs.record.refs.select_list.state;
    var data = {};
    if (state.project.id && state.project.id !== 'all') {
      data.project_id = state.project.id;
    }
    if (state.region.id && state.region.id !== 'all') {
      data.region_id = state.region.id;
    }
    if (state.status.id && state.status.id !== 'all') {
      data.status = state.status.id;
    }

    request.getSales((current - 1) * limit, limit, data).then((res) => {
      this.setTable(res.orders, current, res.total_count, limit);
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'select_list':
        this.onClickSelectList(actionType, refs, data);
        break;
      case 'detail':
        if (actionType === 'open') {
          this.openDetail(refs, data.data);
        } else if (actionType === 'pagination') {
          this.onNextDetailPage(refs, data);
        }
        break;
      case 'pagination':
        this.onNextPage(refs, data);
        break;
      default:
        break;
    }
  }

  onClickSelectList(key, refs, data) {
    switch (key) {
      case 'search':
      case 'reset':
        refs.detail.close();

        var current = 1;
        var limit = this.state.config.table.limit;
        this.getSales(current, limit);
        break;
      default:
        break;
    }
  }

  setDetailTable(data, current, totalNum, limit) {
    var detail = this.refs.record.refs.detail;

    var content = detail.state.content;
    content.table.data = data;

    var pagination = null;
    var total = Math.ceil(totalNum / limit);
    if (data.length > 0 && total > 1) {
      pagination = {
        current: current,
        total: total,
        total_num: totalNum
      };
    }
    content.pagination = pagination;

    detail.setState({
      visible: true,
      content: content
    });
  }

  getBillsByOrder(id, current, limit) {
    if (current < 1) {
      current = 1;
    }

    request.getBillsByOrder(id, (current - 1) * limit, limit).then((res) => {
      this.setDetailTable(res.bills, current, res.total_count, limit);
    });
  }

  openDetail(refs, item) {
    var limit = this.state.config.table.detail.table.limit;
    var current = 1;

    this.getBillsByOrder(item.order_id, current, limit);
  }

  onNextDetailPage(refs, data) {
    var limit = this.state.config.table.detail.table.limit;

    this.getBillsByOrder(data.item.order_id, data.page, limit);
  }

  onNextPage(refs, page) {
    var limit = this.state.config.table.limit;
    this.getSales(page, limit);
  }

  render() {
    return (
      <div className="halo-module-record" style={this.props.style}>
        <Record
          ref="record"
          config={this.state.config}
          visible={this.props.style}
          onAction={this.onAction}
          getStatusIcon={getStatusIcon} />
      </div>
    );
  }
}

module.exports = Model;
