require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');
const ViewRouters = require('./detail/view_routers');
const router = require('client/utils/router');

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
      this.onInitialize(nextProps.params);
    }
  }

  componentWillUpdate(nextProps, nextState) {

  }

  tableColRender(columns) {
    columns.forEach(column => {
      switch (column.key) {
        case 'status':
          column.render = (col, item, i) => {
            return __[item.status];
          };
          break;
        default:
          break;
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

  onInitialize(params) {
    if (params[2] ) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getSingle(id) {
    const table = this.state.config.table;
    request.getSingle(id).then((res) => {
      this.normalizeRes(res);

      table.data = res.agents;
      this.updateTableData(table, res._url, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }

  // get table data
  getList(refreshDetail) {
    const table = this.state.config.table;

    request.getList().then((res) => {
      this.normalizeRes(res);
      this.sortList(res);
      table.data = res.agents;
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }

  // change alive and admin_state_up field to status and state field
  normalizeRes(res) {
    res.agents.forEach((agent, i) => {
      agent.index = i;
      if(agent.alive) {
        agent.status = 'active';
      } else {
        agent.status = 'down';
      }

      if(agent.admin_state_up) {
        agent.state = 'Up';
      } else {
        agent.state = 'Down';
      }
    });
  }

  sortList(res) {
    res.agents.sort(function(first, second) {
      return first.agent_type.localeCompare(second.agent_type);
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
      let detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
      callback && callback();
    });
  }

  //refresh: according to the given data rules
  refresh(data, params) {
    if (!data) {
      data = {};
    }

    if (!params) {
      params = this.props.params;
    }

    if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
        this.getSingle(params[2]);
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
        this.getList(data.refreshDetail);
      }
    }
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  loadingTable() {
    const _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'filter':
        this.onFilterSearchClick(actionType, refs, data);
        break;
      // view router feature temporarily disabled
      // case 'detail':
      //   this.onDetailTabClick(actionType, refs, data);
      //   break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    switch(key) {
      case 'refresh':
        this.refresh({
          refreshList: true,
          loadingTable: true,
          refreshDetail: true,
          loadingDetail: true
        });
        break;
      default:
        break;
    }
  }

  onFilterSearchClick(action, refs, data) {
    if(action === 'search') {
      const agentTypeGroup = data.agent_type,
        agentNameGroup = data.agent_name,
        hostGroup = data.host;

      if(agentTypeGroup) {
        this.getFilteredList(agentTypeGroup);
      } else if(agentNameGroup) {
        this.getFilteredList(agentNameGroup);
      } else if(hostGroup) {
        this.getFilteredList(hostGroup);
      } else {
        const r = {
          refreshList: true,
          loadingTable: true
        };
        this.refresh(r);
      }
    }
  }

  onDetailTabClick(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
        }
        break;
      case 'routers':
        if(rows.length === 1) {
          let routersConfig = this.getRoutersConfig();
          if(rows[0].configurations && rows[0].configurations.routers) {
            syncUpdate = false;
            request.getNormalizedRouters().then(routers => {
              routersConfig.data = routers;
              contents[tabKey] = (
                <ViewRouters
                  tableConfig={routersConfig}
                  />
              );

              detail.setState({
                contents: contents,
                loading: false
              });
            });
          } else {
            // some agents do not have routers, show nothing
            routersConfig.loading = false;
            routersConfig.data = [];

            contents[tabKey] = (
              <ViewRouters
                tableConfig={routersConfig}
                />
            );

            detail.setState({
              contents: contents,
              loading: false
            });
          }
        }
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    } else {
      detail.setState({
        loading: true
      });
    }
  }

  getFilteredList(group) {
    const table = this.state.config.table;

    request.getList().then((res) => {

      this.normalizeRes(res);
      this.sortList(res);
      table.data = res.agents.filter((agent) => {
        let has = true;
        for(let field in group) {
          if(!agent[field] || !agent[field].includes(group[field])) {
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

  getBasicPropsItems(data) {
    let items = [{
      title: __.type,
      content: data.agent_type
    }, {
      title: __.name,
      content: data.binary
    }, {
      title: __.hosts,
      content: data.host
    }, {
      title: __.status,
      content: getStatusIcon(data.status)
    }, {
      title: __.admin_state,
      content: data.state
    }, {
      title: __.zone,
      content: data.availability_zone
    }];

    return items;
  }

  getRoutersConfig() {
    const table = {};
    table.dataKey = 'id';
    table.hover = true;
    table.striped = true;

    let columns = [{
      title: __.name,
      key: 'name',
      dataIndex: 'name'
    }, {
      title: __.status,
      key: 'status',
      render: function(col, item) {
        return getStatusIcon(item.status);
      }
    }, {
      title: __.external_network,
      key: 'network_name',
      dataIndex: 'network_name'
    }, {
      title: __.admin_state,
      key: 'admin_state_up',
      render: function(col, item) {
        return item.admin_state_up ? 'Up' : 'Down';
      }
    }, {
      title: __.project,
      key: 'project_name',
      dataIndex: 'project_name'
    }];

    table.column = columns;
    return table;
  }

  render() {
    return (
      <div className="halo-module-network-agents" style={this.props.style}>
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
