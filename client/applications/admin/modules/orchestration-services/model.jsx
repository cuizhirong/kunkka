require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');


const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/admin.lang.json');
const getStatusIcon = require('../../utils/status_icon');

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
  }

  componentWillMount() {
    const columns = this.state.config.table.column;
    this.tableColRender(columns);
    this.tableColFilter(columns);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize();
    }
  }

  tableColRender(columns) {
    columns.forEach(column => {
      if(column.key === 'status') {
        column.render = (col, item, i) => {
          const status = item.status;
          return status[0].toUpperCase() + status.slice(1);
        };
      }
    });
  }

  tableColFilter(columns) {
    columns.forEach(column => {
      if(column.filter) {
        const filters = column.filter;
        filters.forEach((filter) => {
          filter.filterBy = (item, col) => {
            return item[column.key] === filter.key;
          };
        });
      }
    });
  }

  // get table data
  getList() {
    const table = this.state.config.table;

    request.getList().then((res) => {
      this.sortList(res);

      table.data = res.services;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }


  sortList(res) {
    res.services.sort(function(first, second) {
      return first.hostname.localeCompare(second.hostname);
    });
  }

  //rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    const newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;
    this.setState({
      config: newConfig
    }, () => {
      callback && callback();
    });
  }

  //refresh: according to the given data rules
  refresh(data) {
    if (!data) {
      data = {};
    }

    if (data.refreshList) {
      if(data.loadingTable) {
        this.loadingTable();
      }
      this.getList();
    }
  }

  loadingTable() {
    const _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  onInitialize() {
    this.getList();
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'filter':
        this.onFilterSearchClick(actionType, data);
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
          loadingTable: true
        });
        break;
      default:
        break;
    }
  }

  onFilterSearchClick(action, data) {
    if(action === 'search') {
      this.loadingTable();

      const hostnameGroup = data.hostname,
        engineIdGroup = data.engine_id,
        topicGroup = data.topic;

      if(hostnameGroup) {
        this.getFilteredList(hostnameGroup);
      } else if(engineIdGroup) {
        this.getFilteredList(engineIdGroup);
      } else if(topicGroup) {
        this.getFilteredList(topicGroup);
      } else {
        const r = {
          refreshList: true,
          loadingTable: true
        };
        this.refresh(r);
      }
    }
  }

  getFilteredList(group) {
    const table = this.state.config.table;

    request.getList().then((res) => {
      this.sortList(res);
      table.data = res.services.filter((service) => {
        let has = true;
        for(let field in group) {
          if(!service[field] || !service[field].includes(group[field])) {
            has = false;
          }
        }
        return has;
      });

      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }

  render() {
    return (
      <div className="halo-module-orchestration-services" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }
}

module.exports = Model;
