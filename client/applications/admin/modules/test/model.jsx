require('./style/index.less');

//react components
var React = require('react');
var Main = require('../../components/main/index');

//detail components
var BasicProps = require('client/components/basic_props/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('i18n/client/admin.lang.json');

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
    } else if(this.props.style.display !== 'none' && nextProps.style.display === 'none') {
      this.clearState();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'image':
          column.render = (col, item, i) => {
            // var label = item.image.image_label && item.image.image_label.toLowerCase();
            // return item.image ?
            //   <span>
            //     <i className={'icon-image-default ' + label}/>
            //     <a data-type="router" href={'/project/image/' + item.image.id}>{' ' + item.image.name}</a>
            //   </span>
            //   : '';
            if (i) {
              return (
                <a data-type="router" href={'/admin/test/0e011323-db09-4152-984d-7be99d7334a2'}>
                  跳转到Test rename2
                </a>
              );
            } else {
              return (
                <a data-type="router" href={'/admin/test/a1f7e718-8748-4cee-b9ba-2a7f88ec5bce'}>
                  跳转到Test ee
                </a>
              );
            }
          };
          break;
        case 'ip_address':
          column.render = (col, item, i) => {
            var arr = [];
            if (item.addresses.private) {
              item.addresses.private.forEach((_item, index) => {
                if (_item.version === 4 && _item['OS-EXT-IPS:type'] === 'fixed') {
                  if (_item.port) {
                    index && arr.push(', ');
                    arr.push(<a key={'port' + index} data-type="router" href={'/project/port/' + _item.port.id}>{_item.addr}</a>);
                  }
                }
              });
            }
            return arr;
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item.floating_ip ?
              <span>
                <i className="glyphicon icon-floating-ip" />
                <a data-type="router" href={'/project/floating-ip/' + item.floating_ip.id}>
                  {item.floating_ip.floating_ip_address}
                </a>
              </span> : '';
          };
          break;
        case 'instance_type':
          column.render = (col, item, i) => {
            return item.flavor ? item.flavor.vcpus + 'CPU / ' + item.flavor.ram / 1024 + 'GB' : '';
          };
          break;
        default:
          break;
      }
    });
  }

//**************************************************//
  initializeFilter(filters, res) {
    var setOption = function(key, data) {
      filters.forEach((filter) => {
        filter.items.forEach((item) => {
          if (item.key === key) {
            item.data = data;
          }
        });
      });
    };

    var imageTypes = [];
    res.imageType.images.forEach((image) => {
      imageTypes.push({
        id: image.id,
        name: image.name
      });
    });
    setOption('image', imageTypes);

    var flavorTypes = [];
    res.flavorType.flavors.forEach((flavor) => {
      flavorTypes.push({
        id: flavor.id,
        name: flavor.name
      });
    });
    setOption('flavor', flavorTypes);

    var statusTypes = [{
      id: 'active',
      name: __.active
    }, {
      id: 'error',
      name: __.error
    }];
    setOption('status', statusTypes);
  }

//initialize table data
  onInitialize(params) {
    var _config = this.state.config,
      table = _config.table;

    if (params[2]) {
      request.getServerByIDInitialize(params[2]).then((res) => {
        table.data = [res[0].server];
        this.updateTableData(table, res[0]._url);
      });
    } else {
      var pageLimit = this.state.config.table.limit;
      request.getListInitialize(pageLimit).then((res) => {
        var newTable = this.processTableData(table, res[0]);
        this.updateTableData(newTable, res[0]._url);
      });
    }
  }

//request: get single data(pathList[2] is server_id)
  getSingleData(serverID) {
    request.getServerByID(serverID).then((res) => {
      var table = this.state.config.table;
      table.data = [res.server];
      this.updateTableData(table, res._url);
    });
  }

//request: get list data(according to page limit)
  getInitialListData() {
    var pageLimit = this.state.config.table.limit;
    request.getList(pageLimit).then((res) => {

      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

//request: jump to next page according to the given url
  getNextListData(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

//request: filter request
  // onFilterSearch(actionType, refs, data) {
  //   if (actionType === 'search') {
  //     this.loadingTable();

  //     var serverID = data.server_id,
  //       allTenant = data.all_tenant;

  //     if (serverID) {
  //       request.getServerByID(serverID.host).then((res) => {
  //         var table = this.state.table;
  //         table.data = [res.server];
  //         this.updateTableData(table, res._url);
  //       });
  //     } else if (allTenant){
  //       request.filterFromAll(allTenant).then((res) => {
  //         var table = this.state.table;
  //         table.data = res.servers;
  //         this.updateTableData(table, res._url);
  //       });
  //     }
  //   }
  // }

//request: search request
  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      request.getServerByID(data.text).then((res) => {
        var table = this.state.config.table;
        table.data = [res.server];
        this.updateTableData(table, res._url);
      });
    }
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2.1/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

//change table data structure: to record url history
  processTableData(table, res) {
    if (res.server) {
      table.data = [res.server];
    } else if (res.servers) {
      table.data = res.servers;
    }

    var pagination = {},
      next = res.servers_links ? res.servers_links[0] : null;

    if (next && next.rel === 'next') {
      pagination.nextUrl = next.href.split('/v2.1/')[1];
    }

    var history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
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

      this.getInitialListData();
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

      var history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearState() {
    this.stores = {
      urls: []
    };
    this.refs.dashboard.clearState();
  }

//*********************************************//
  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'search':
        this.onClickSearch(actionType, refs, data);
        break;
      // case 'filter':
      //   this.onFilterSearch(actionType, refs, data);
      //   break;
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

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        var url,
          history = this.stores.urls;

        if (data.direction === 'next') {
          url = data.url;
        } else {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var {rows} = data;

    switch(key) {
      case 'power_on':
        request.poweron(rows[0]).then(function(res) {});
        break;
      case 'refresh':
        var params = this.props.params,
          refreshData = {};

        if (params[2]) {
          refreshData.refreshList = true;
          refreshData.refreshDetail = true;
          refreshData.loadingTable = true;
          refreshData.loadingDetail = true;
        } else {
          refreshData.initialList = true;
          refreshData.loadingTable = true;
          refreshData.clearState = true;
        }

        this.refresh(refreshData, params);
        break;
      case 'reboot':
        request.reboot(rows[0]).then(function(res) {});
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    var allActive = true;
    rows.forEach((ele, i) => {
      var thisState = ele.status.toLowerCase() === 'active' ? true : false;
      allActive = allActive && thisState;
    });

    var status;
    if (rows.length > 0) {
      status = rows[0].status.toLowerCase();
    }

    for(let key in btns) {
      switch (key) {
        case 'vnc_console':
        case 'power_off':
        case 'chg_security_grp':
        case 'add_volume':
          btns[key].disabled = (rows.length === 1 && status === 'active') ? false : true;
          break;
        case 'power_on':
          btns[key].disabled = (rows.length === 1 && status === 'shutoff') ? false : true;
          break;
        case 'reboot':
          btns[key].disabled = (rows.length > 0 && allActive) ? false : true;
          break;
        case 'instance_snapshot':
        case 'resize':
        case 'join_ntw':
          btns[key].disabled = (rows.length === 1 && (status === 'active' || status === 'shutoff')) ? false : true;
          break;
        case 'assc_floating_ip':
          btns[key].disabled = (rows.length === 1 && status === 'active' && !rows[0].floating_ip) ? false : true;
          break;
        case 'dssc_floating_ip':
          btns[key].disabled = (rows.length === 1 && rows[0].floating_ip) ? false : true;
          break;
        case 'rmv_volume':
          // btns[key].disabled = (rows.length === 1 && rows[0].volume.length !== 0) ? false : true;
          break;
        case 'terminate':
          btns[key].disabled = (rows.length > 0) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;
    var syncUpdate = true;

    var isAvailableView = (_rows) => {
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
          syncUpdate = false;
          detail.loading();

          setTimeout(() => {
            var basicPropsItem = this.getBasicPropsItems(rows[0]);

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

            detail.setState({
              contents: contents,
              loading: false
            });
          }, 1000);
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
    }
  }

  getBasicPropsItems(item) {
    var label = item.image.image_label && item.image.image_label.toLowerCase();
    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.floating_ip,
      content: item.floating_ip ?
        <span>
          <i className="glyphicon icon-floating-ip" />
          <a data-type="router" href={'/project/floating-ip/' + item.floating_ip.id}>
            {item.floating_ip.floating_ip_address}
          </a>
        </span>
      : '-'
    }, {
      title: __.image,
      content:
        <span>
          <i className={'icon-image-default ' + label}/>
          <a data-type="router" href={'/project/image/' + item.image.id}>
            {' ' + item.image.name}
          </a>
        </span>
    }, {
      title: __.instance_type,
      content: item.flavor ? item.flavor.vcpus + ' CPU / ' + item.flavor.ram / 1024 + ' GB' : '-'
    }, {
      title: __.keypair,
      content: item.keypair ?
        <span>
          <i className="glyphicon icon-keypair" />
          <a data-type="router" href="/project/keypair">{item.keypair.name}</a>
        </span>
        : '-'
    }, {
      title: __.status,
      type: 'status',
      status: item.status
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created
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
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editServerName(rawItem, newName).then((res) => {
          this.refresh({
            loadingDetail: true,
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-test" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }
}

module.exports = Model;
