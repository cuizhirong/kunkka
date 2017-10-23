require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');
const deleteModal = require('client/components/modal_delete/index');
const manageHostsPop = require('./pop/manage_hosts/index');
const updateMetadataPop = require('./pop/update_metadata/index');
const createPop = require('./pop/create/index');
const {Table} = require('client/uskin/index');
const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/admin.lang.json');
const router = require('client/utils/router');
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
      this.onInitialize(nextProps.params);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'availability-zones':
          column.render = (col, item, i) => {
            return item.availability_zone;
          };
          break;
        case 'host':
          column.render = (col, item, i) => {
            let hosts = [];
            item.hosts.forEach((_host, _i) => {
              let id = item.hosts_list.find(h => h.hypervisor_hostname === _host) ? item.hosts_list.find(h => h.hypervisor_hostname === _host).id : null;
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
            return item.hosts.length ? hosts : '';
          };
          break;
        case 'metadata':
          column.render = (col, item, i) => {
            let v = '';
            Object.keys(item.metadata).forEach((m, _i) => {
              v += _i ? ', ' : '';
              v += m;
              v += ' = ';
              v += item.metadata[m];
            });
            return v;
          };
          break;
        default:
          break;
      }
    });
  }

//initialize table data
  onInitialize(params) {
    if (params && params[2]) {
      this.getAggregateById(params[2]);
    } else {
      this.getAggregatesList();
    }
  }

//request: get Hypervisor By Id
  getAggregateById(id) {
    this.clearState();

    let table = this.state.config.table;
    request.getAggregateById(id).then((res) => {
      let newTable = this.processTableData(table, res);
      this.updateTableData(newTable, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table);
    });
  }

//request: get Hypervisor List
  getAggregatesList(refreshDetail) {
    this.clearState();
    let _config = this.state.config,
      table = _config.table;
    request.getAggregatesList().then((res) => {
      let newTable = this.processTableData(table, res);
      this.updateTableData(newTable, refreshDetail);
    });
  }

  processTableData(table, res) {
    if (res.aggregates) {
      table.data = res.aggregates;
    } else if(res.aggregate) {
      table.data = [res.aggregate];
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

  getInitialListData(refreshDetail) {
    let table = this.state.config.table;
    request.getAggregatesList().then((res) => {
      let newTable = this.processTableData(table, res);
      this.updateTableData(newTable, refreshDetail);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table);
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
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }
    }
    this.getInitialListData(data.refreshDetail);
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
      case 'search':
        this.onClickSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();

      if(data.text) {
        request.getAggregatesList().then(res => {
          let aggregates = res.aggregates;
          let newAggregates = aggregates.filter((aggregate) => {
            return aggregate.name === data.text || aggregate.name.includes(data.text);
          });
          let newConfig = this.state.config;
          newConfig.table.data = newAggregates;
          newConfig.table.loading = false;

          this.setState({
            config: newConfig
          });
        });
      } else {
        this.onInitialize();
      }
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    let {rows} = data;
    let that = this;
    let refresh = function() {
      that.refresh({
        refreshList: true,
        refreshDetail: true,
        loadingTable: true,
        loadingDetail: true
      });
    };
    switch(key) {
      case 'create-host-aggregates':
        createPop(null, null, refresh);
        break;
      case 'modify-host-aggregates':
        createPop(rows[0], null, refresh);
        break;
      case 'manage_hosts':
        manageHostsPop(rows[0], null, refresh);
        break;
      case 'update_metadata':
        updateMetadataPop(rows[0], null, refresh);
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'host-aggregates',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItems(rows).then((res) => {
              cb(true);
              that.refresh({
                refreshList: true,
                refreshDetail: true,
                loadingTable: true,
                loadingDetail: true
              });
            });
          }
        });
        break;
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

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let sole = rows.length === 1 ? rows[0] : null;

    for(let key in btns) {
      switch (key) {
        case 'create-host-aggregates':
          btns[key].disabled = false;
          break;
        case 'modify-host-aggregates':
          btns[key].disabled = sole ? false : true;
          break;
        case 'manage_hosts':
          btns[key].disabled = sole ? false : true;
          break;
        case 'update_metadata':
          btns[key].disabled = sole ? false : true;
          break;
        case 'delete':
          btns[key].disabled = rows.length > 0 ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
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
    item.hosts.forEach((_host, _i) => {
      let id = item.hosts_list.find(h => h.hypervisor_hostname === _host) ? item.hosts_list.find(h => h.hypervisor_hostname === _host).id : null;
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

    let tableConfig = {
      dataKey: 'key',
      column: [{
        title: 'Key',
        key: 'key',
        dataIndex: 'key',
        width: 200
      }, {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
        width: 200
      }],
      data: []
    };
    Object.keys(item.metadata).forEach((mt, i) => {
      let key = mt,
        value = item.metadata[mt],
        data = {
          key: key,
          value: value
        };
      tableConfig.data.push(data);
    });

    let metadata = <Table
        __={__}
        dataKey={tableConfig.dataKey}
        column={tableConfig.column}
        data={tableConfig.data}
      />;

    let items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __['availability-zones'],
      content: item.availability_zone
    }, {
      title: __.host,
      content: item.hosts.length ? hosts : '-'
    }, {
      title: __.metadata,
      content: metadata
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
      <div className="halo-module-host-aggregates" style={this.props.style}>
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
