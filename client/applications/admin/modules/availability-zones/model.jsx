require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');
const BasicProps = require('client/components/basic_props/index');
const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/admin.lang.json');
const router = require('client/utils/router');

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
      this.loadingTable();
      this.onInitialize();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'host':
          column.render = (col, item, i) => {
            let hosts = [];
            Object.keys(item.hosts).forEach((_host, _i) => {
              let id = item.host_list.find(h => h.hypervisor_hostname === _host) ? item.host_list.find(h => h.hypervisor_hostname === _host).id : null;
              if(id) {
                _i && hosts.push(', ');
                hosts.push(
                  <span key={id}>
                    <i className="glyphicon icon-host"></i>
                    <a data-type="router" href={'/dashboard/host/' + id}>
                      {_host || '(' + id + ')'}
                    </a>
                  </span>);
              } else {
                hosts.push(
                  <span key={_host}>
                    <i className="glyphicon icon-host"></i>
                    {_host}
                  </span>
                );
              }
            });
            return Object.keys(item.hosts).length ? hosts : '';
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return item.zoneState.available ? <span className="active"><i className="glyphicon icon-active"></i>{__.activate}</span> : <span><i className="glyphicon icon-disable"></i>{__.disable}</span>;
          };
          break;
        default:
          break;
      }
    });
  }

//initialize table data
  onInitialize() {
    this.getZonesList();
  }

//request: get Hypervisor List
  getZonesList(refreshDetail) {
    this.clearState();
    let _config = this.state.config,
      table = _config.table,
      params = this.props.params;
    request.getAvailabilityZone().then((res) => {
      let newTable = this.processTableData(table, res);
      if(params && params[2]) {
        this.updateTableData(newTable, true, () => {
          let pathList = router.getPathList();
          router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
        });
      } else {
        this.updateTableData(newTable, refreshDetail);
      }
    });
  }

  processTableData(table, res) {
    if (res.availabilityZoneInfo) {
      table.data = res.availabilityZoneInfo;
    } else {
      table.data = [];
    }

    return table;
  }

//rerender: update table data
  updateTableData(table, refreshDetail, callback) {
    let newConfig = this.state.config;
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

    if (data.initialList) {
      if (data.loadingTable) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.clearState();
      }
    } else if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }
    }
    this.getZonesList(data.refreshDetail);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearState() {
    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
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

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

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
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
        }
        break;
      default:
        break;
    }
    detail.setState({
      contents: contents,
      loading: false
    });
  }

  getBasicPropsItems(item) {
    let hosts = [];
    Object.keys(item.hosts).forEach((_host, _i) => {
      let id = item.host_list.find(h => h.hypervisor_hostname === _host) ? item.host_list.find(h => h.hypervisor_hostname === _host).id : null;
      if(id) {
        _i && hosts.push(', ');
        hosts.push(
          <span key={id}>
            <i className="glyphicon icon-host"></i>
            <a data-type="router" href={'/dashboard/host/' + id}>
              {_host || '(' + id + ')'}
            </a>
          </span>);
      } else {
        hosts.push(
          <span key={_host}>
            <i className="glyphicon icon-host"></i>
            {_host}
          </span>
        );
      }
    });

    let items = [{
      title: __.name,
      content: item.zoneName
    }, {
      title: __.host,
      content: Object.keys(item.hosts).length ? hosts : '-'
    }, {
      title: __.status,
      content: item.zoneState.available ? <span className="active"><i className="glyphicon icon-active"></i>{__.activate}</span> : <span><i className="glyphicon icon-disable"></i>{__.disable}</span>
    }];

    return items;
  }

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-availability-zones" style={this.props.style}>
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
