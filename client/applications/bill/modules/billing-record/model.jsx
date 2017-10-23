require('./style/index.less');

const React = require('react');
const Record = require('./record/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const getStatusIcon = require('../../utils/status_icon');
const router = require('client/utils/router');

const __ = require('locale/client/bill.lang.json');

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

  componentWillReceiveProps(nextProps) {
    let path = router.getPathList();
    if(nextProps.style.display === 'flex' && this.props.style.display === 'none') {
      if(path[2]) {
        this.onInitialize();
      }
    }
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
        case 'resource_type':
          column.render = (col, item, i) => {
            return (<span className="type">
              <i className={'glyphicon icon-' + item.type}/>
              {__[item.type]}
            </span>);
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.getFilters();
  }

  getFilters(cb) {
    let path = router.getPathList();
    let projects = Object.assign([], HALO.user.projects);
    projects.unshift({
      id: 'all',
      name: __.all + __.project
    });

    let regions = Object.assign([], HALO.region_list);
    regions.unshift({
      id: 'all',
      name: __.all + __.region
    });

    let status = [{
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

    let selectList = this.refs.record.refs.select_list;
    selectList.setState({
      projects: projects,
      regions: regions,
      region: regions[0],
      statuses: status,
      status: status[0]
    }, () => {
      let current = 1;
      let limit = this.state.config.table.limit;
      if(path[2]) {
        let project = {
          id: path[2]
        };
        selectList.setState({
          project: project
        }, () => {
          this.getSales(current, limit);
        });
      } else {
        this.getSales(current, limit);
      }
    });
  }

  setTable(data, current, totalNum, limit) {
    let state = this.state;
    let newConfig = state.config;

    let table = newConfig.table;
    table.data = data;
    table.loading = false;

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

  getSales(current, limit) {
    if (current < 1) {
      current = 1;
    }
    let state = this.refs.record.refs.select_list.state;
    let data = {};
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

        let current = 1;
        let limit = this.state.config.table.limit;
        router.replaceState('/bill/billing-record', null, null, true);
        this.getSales(current, limit);
        break;
      default:
        break;
    }
  }

  setDetailTable(data, current, totalNum, limit) {
    let detail = this.refs.record.refs.detail;

    let content = detail.state.content;
    content.table.data = data;

    let pagination = null;
    let total = Math.ceil(totalNum / limit);
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

  getBillsByOrder(item, current, limit) {
    if (current < 1) {
      current = 1;
    }

    request.getBillsByOrder(item.order_id, (current - 1) * limit, limit).then((res) => {
      res.bills.forEach((bill) => {
        bill.type = item.type;
      });
      this.setDetailTable(res.bills, current, res.total_count, limit);
    });
  }

  openDetail(refs, item) {
    let limit = this.state.config.table.detail.table.limit;
    let current = 1;

    this.getBillsByOrder(item, current, limit);
  }

  onNextDetailPage(refs, data) {
    let limit = this.state.config.table.detail.table.limit;

    this.getBillsByOrder(data.item, data.page, limit);
  }

  onNextPage(refs, page) {
    let limit = this.state.config.table.limit;
    router.replaceState('/bill/billing-record', null, null, true);
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
