require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const {Button} = require('client/uskin/index');

const BasicProps = require('client/components/basic_props/index');
const DetailMinitable = require('client/components/detail_minitable/index');

const deleteModal = require('client/components/modal_delete/index');
const createNetwork = require('./pop/create_network/index');
const createSubnet = require('../subnet/pop/create_subnet/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const getStatusIcon = require('../../utils/status_icon');
const getErrorMessage = require('client/applications/admin/utils/error_message');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: []
    };
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
        case 'subnet':
          column.render = (col, item, i) => {
            let subnetRender = [];
            item.subnets.map((_item, _i) => {
              if (typeof _item === 'object') {
                _i && subnetRender.push(', ');
                subnetRender.push(<i key={'icon' + _i} className="glyphicon icon-subnet" />);
                subnetRender.push(
                  <a key={'subnetName' + _i} data-type="router" href={'/admin/subnet/' + _item.id}>
                    {_item.name ? _item.name : '(' + _item.id.substr(0, 8) + ')'}
                  </a>
                );
              }
            });

            return item.subnets.length ? <div>{subnetRender.map((_item) => _item)}</div> : '';
          };
          break;
        case 'restrict':
          column.render = (col, item, i) => {
            return item.port_security_enabled ?
              <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    if(params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getInitialListData();
    }
  }

  getList() {
    this.clearState();
    let table = this.state.config.table,
      pageLimit = table.limit;

    request.getList(pageLimit).then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getSingle(id) {
    this.clearState();
    let table = this.state.config.table;
    request.getNetworkByID(id).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = {};
      this.updateTableData(table, res._url);
    });
  }

//request: get next list
  getNextList(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;
    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);

      let detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }


//set pagination
  setPagination(table, res) {
    let pagination = {},
      next = res.links && res.links.next ? res.links.next : null;
    if (next) {
      pagination.nextUrl = next;
    }

    let history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  getInitialListData() {
    this.getList();
  }

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
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

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;

    let refresh = () => {
      this.refresh({
        refreshList: true,
        loadingTable: true,
        refreshDetail: true
      });
    };

    switch (key) {
      case 'create':
        createNetwork(null, (res) => {
          refresh();
        });
        break;
      case 'crt_subnet':
        createSubnet((rows[0]), null, (res) => {
          refresh();
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'prv_network',
          data: rows,
          iconType: 'network',
          onDelete: function(_data, cb) {
            request.deleteNetworks(rows).then((res) => {
              cb(true);
              refresh();
            }).catch((error) => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      case 'refresh':
        that.refresh({
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

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      if (data.text) {
        this.getSingle(data.text);
      } else {
        this.getList();
      }
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev'){
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {//default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      case 'filtrate':
        delete data.rows;
        this.clearState();
        let table = this.state.config.table;
        request.getFilterList(data).then((res) => {
          table.data = res.network;
          this.setPagination(table, res);
          this.updateTableData(table, res._url);
        }).catch((res) => {
          table.data = [];
          table.pagination = null;
          this.updateTableData(table, String(res.responseURL));
        });
        this.loadingTable();
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
    let length = rows.length;

    for(let key in btns) {
      switch (key) {
        case 'crt_subnet':
          btns[key].disabled = (length === 1 && !rows[0].shared && !rows[0]['router:external']) ? false : true;
          break;
        case 'delete':
          let disableDelete = rows.some((row) => {
            return row.shared || row['router:external'];
          });
          btns[key].disabled = (length > 0 && !disableDelete) ? false : true;
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

    let isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]),
            subnetConfig = this.getDetailTableConfig(rows[0]);

          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem ? basicPropsItem : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)} />
              <DetailMinitable
                __={__}
                title={__.subnet}
                defaultUnfold={true}
                tableConfig={subnetConfig ? subnetConfig : []}>
                <Button value={__.create + __.subnet} disabled={rows[0].shared || rows[0]['router:external']} onClick={this.onDetailAction.bind(this, 'description', 'crt_subnet', {
                  rawItem: rows[0]
                })}/>
              </DetailMinitable>
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
    let that = this;
    switch(actionType) {
      case 'edit_name':
        let {rawItem, newName} = data;
        request.editNetworkName(rawItem, newName).then((res) => {
          this.refresh({
            refreshList: true,
            refreshDetail: true,
            loadingTable: true,
            loadingDetail: true
          });
        });
        break;
      case 'crt_subnet':
        createSubnet(data.rawItem);
        break;
      case 'rmv_subnet':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'subnet',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteSubnet(data.childItem).then(() => {
              that.refresh({
                refreshList: true,
                refreshDetail: true,
                loadingTable: true,
                loadingDetail: true
              });
              cb(true);
            }).catch(error => {
              cb(false, getErrorMessage(error));
            });
          }
        });
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item) {
    let networkType = item['provider:network_type'];
    let items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: (item.shared || item['router:external']) ? '' : 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.network_type,
      content: networkType
    }, {
      title: __.project_id,
      content: item.project_id
    }, {
      title: __.security + __.restrict,
      content: item.port_security_enabled ?
        <span className="label-active">{__.on}</span> : <span className="label-down">{__.off}</span>
    }, {
      title: __.external_network,
      content: item['router:external'] ? __.yes : __.no
    }, {
      title: __.share_network,
      content: item.shared ? __.yes : __.no
    }];

    items.push({
      title: networkType === 'vlan' ? __.vlan_id : (networkType === 'flat' ? __.physical_network : ''), // eslint-disable-line
      content: networkType === 'vlan' ? item['provider:segmentation_id'] : (networkType === 'flat' ? item['provider:physical_network'] : '') // eslint-disable-line
    });

    return items;
  }

  getDetailTableConfig(item) {
    let dataContent = [];
    item.subnets.forEach((element, index) => {
      let dataObj = {
        id: index + 1,
        name: <a data-type="router" href={'/admin/subnet/' + element.id}>{element.name || '(' + element.id.substring(0, 8) + ')'}</a>,
        cidr: element.cidr,
        router: element.router ?
          <span>
            <i className="glyphicon icon-router"/>
            <a data-type="router" href={'/admin/router/' + element.router.id}>{element.router.name || '(' + element.router.id.substr(0, 8) + ')'}</a>
          </span> : '',
        operation: (item.shared || item['router:external']) ? '-' : <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_subnet', {
          rawItem: item,
          childItem: element
        })} />
      };
      dataContent.push(dataObj);
    });

    let tableConfig = {
      column: [{
        title: __.subnet + __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.cidr,
        key: 'cidr',
        dataIndex: 'cidr'
      }, {
        title: __.related + __.router,
        key: 'router',
        dataIndex: 'router'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true
    };

    return tableConfig;
  }

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

      this.getInitialListData();
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

      let history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
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

  clearUrls() {
    this.stores.urls.length = 0;
  }

  clearState() {
    this.clearUrls();

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  render() {
    return (
      <div className="halo-module-network" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs.bind(this)}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;
