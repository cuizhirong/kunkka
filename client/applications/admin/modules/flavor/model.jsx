require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');

const createFlavor = require('./pop/create/index');
const modifyMetadata = require('./pop/modify/index');
const deleteModal = require('client/components/modal_delete/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/admin.lang.json');
const unitConverter = require('client/utils/unit_converter');
const router = require('client/utils/router');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction', 'tableColRender'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: [],
      imageTypes: [],
      flavorTypes: [],
      hostTypes: []
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
        case 'memory':
          column.render = (col, item, i) => {
            let ram = unitConverter(item.ram, 'MB');
            return ram.num + ' ' + ram.unit;
          };
          break;
        case 'capacity':
          column.render = (col, item, i) => {
            let disk = unitConverter(item.disk, 'GB');
            return disk.num + ' ' + disk.unit;
          };
          break;
        case 'enable':
          column.render = (col, item, i) => {
            return item['OS-FLV-DISABLED:disabled'] ? __.disable : __.enable;
          };
          break;
        default:
          break;
      }
    });
  }

//initialize table data
  onInitialize(params) {
    if (params) {
      if (params[2]) {
        this.getFlavorById(params[2]);
      } else {
        this.getInitialListData();
      }
    } else {
      this.getInitialListData();
    }
  }

  getList() {
    this.clearState();

    let table = this.state.config.table;
    request.getList().then((res) => {
      table.data = res.flavors;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getFlavorById(id) {
    this.clearState();

    let table = this.state.config.table;
    request.getFlavorById(id).then((res) => {
      table.data = [res.flavor];
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getInitialListData() {
    this.getList();
  }
//request: jump to next page according to the given url
  getNextListData(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.flavor) {
        table.data = [res.flavor];
      } else if (res.flavors) {
        table.data = res.flavors;
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url, refreshDetail);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, String(res.responseURL));
    });
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();

      if(data.text) {
        request.getList().then(res => {
          let flavors = res.flavors;
          let newFlavors = flavors.filter((flavor) => {
            return flavor.name === data.text || flavor.name.includes(data.text);
          });
          let newConfig = this.state.config;
          newConfig.table.data = newFlavors;
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

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v2.1/')[1]);

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
    let path = router.getPathList();
    if (data) {
      if (path[2]) {
        if (data.loadingDetail) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    let history = this.stores.urls,
      url = history.pop();
    this.getNextListData(url, true);
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
    this.stores.urls = [];

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      this.refs.dashboard.clearState();
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
        request.getExtraSpecs(data.rows[0].id).then(res => {
          this.onClickDetailTabs(actionType, refs, data, res);
        });
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
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev') {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else { //default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    let {rows} = data;

    let refresh = () => {
      this.refresh({
        refreshList: true,
        refreshDetail: true
      });
    };

    switch(key) {
      case 'create':
        createFlavor(null, null, (res) => {
          refresh();
        });
        break;
      case 'edit':
        request.getExtraSpecs(rows[0].id).then((res) => {
          let obj = {
            'id': rows[0].id,
            'res': res
          };
          modifyMetadata(obj, null, (_res) => {
            refresh();
          });
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'flavor',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItem(rows[0].id).then((res) => {
              cb(true);
              refresh();
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

    for(let key in btns) {
      switch (key) {
        case 'edit':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        case 'delete':
          btns[key].disabled = rows.length === 1 ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data, extraSpecs) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          let basicPropsItem = this.getBasicPropsItems(rows[0], extraSpecs);

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

  getBasicPropsItems(item, data) {
    let memory = unitConverter(item.ram, 'MB');
    let disk = unitConverter(item.disk, 'GB');

    let items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.vcpu,
      content: item.vcpus
    }, {
      title: __.memory,
      content: memory.num + ' ' + memory.unit
    }, {
      title: __.capacity,
      content: disk.num + ' ' + disk.unit
    }, {
      title: __.enable,
      content: __[item['OS-FLV-DISABLED:disabled']] ? __.disable : __.enable
    }, {
      title: __.temporary_disk_unit,
      content: item.temporary ? item.temporary + ' ' + memory.unit : '-'
    }, {
      title: __.swap_disk_unit,
      content: item.swap ? item.swap + ' ' + disk.unit : '-'
    }, {
      title: __.rx_factor,
      content: item.rxtx_factor
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
      <div className="halo-module-flavor" style={this.props.style}>
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
