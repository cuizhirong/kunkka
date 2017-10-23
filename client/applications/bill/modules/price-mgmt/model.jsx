require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');
const modifyPricePop = require('./pop/modify/index');
const deleteModal = require('client/components/modal_delete/index');
const Table = require('client/uskin/index').Table;
const __ = require('locale/client/bill.lang.json');
const config = require('./config.json');
const moment = require('client/libs/moment');
const request = require('./request');

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
        case 'base_price':
          column.render = (col, item, i) => {
            let basePrice = item.unit_price.price.base_price;
            return <span className="orange">{basePrice}</span>;
          };
          break;
        case 'price':
          column.render = (col, item, i) => {
            let price = item.unit_price.price;
            if(price.segmented) {
              return (
                <div className="halo-module-price-mgmt-price">
                  <span className="orange">{item.unit_price.price.segmented[0].price}</span>
                  <span>{' (' + price.segmented.length + ')'}</span>
                </div>
              );
            }
            return '';
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            let type = item.unit_price.price.type;
            if(type === 'segmented') {
              return __.gradient_charge;
            } else {
              return '';
            }
          };
          break;
        case 'region':
          column.render = (col, item, i) => {
            let regions = HALO.region_list;
            let regionName = regions.find((n) => n.id === item.region_id) ? regions.find((n) => n.id === item.region_id).name : item.region_id;
            return regionName;
          };
          break;
        default:
          break;
      }
    });
  }

  //initialize table data
  onInitialize(params) {
    this.getTableData();
  }

  getInitializeListData() {
    this.getTableData();
  }

  getSingle(id) {
    let table = this.state.config.table;
    request.getPriceById(id).then((res) => {
      if (res) {
        table.data = [res];
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getSingleByName(name) {
    let table = this.state.config.table;
    request.getPriceByName(name).then((res) => {
      if (res) {
        table.data = res;
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getList() {
    this.clearState();
    let table = this.state.config.table;
    request.getList().then((res) => {
      let newTable = this.processTableData(table, res);
      this.updateTableData(newTable, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
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
      let detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

  processTableData(table, res) {
    if (res.products) {
      table.data = res.products;
    }
    return table;
  }

  getTableData(detailRefresh) {
    request.getList().then((res) => {
      let table = this.state.config.table;
      table.data = res.products;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
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

      this.getInitializeListData();
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
    this.getTableData(data.refreshDetail);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

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
        this.loadingDetail();
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
        this.getSingleByName(data.text);
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
    let len = rows.length;

    for(let key in btns) {
      switch (key) {
        case 'modify':
          btns[key].disabled = (len === 1) ? false : true;
          break;
        case 'delete':
          btns[key].disabled = (len >= 1) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickBtnList(key, refs, data) {
    let {rows} = data,
      that = this;

    switch(key) {
      case 'create':
        modifyPricePop(null, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'modify':
        modifyPricePop(rows[0], null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'price',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItem(rows).then((res) => {
              cb(true);
              that.refresh({
                refreshList: true,
                loadingTable: true
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

  onClickDetailTabs(tabKey, refs, data) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    switch (tabKey) {
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
      default:
        break;
    }
    detail.setState({
      contents: contents,
      loading: false
    });
  }

  getBasicPropsItems(item) {
    let type = item.unit_price.price.type;
    let tableConfig = {
      datakey: item.id,
      column: [{
        title: __.range,
        key: 'range',
        dataIndex: 'range',
        width: 100
      }, {
        title: __.price + ' (' + __.unit + ')',
        dataIndex: 'price',
        key: 'price',
        width: 100,
        render: function(col, colItem, index) {
          return <div style={{color: '#f78913'}}>{colItem.price}</div>;
        }
      }],
      data: []
    };
    item.unit_price.price.segmented.forEach((childItem, i) => {
      let range = '>  ' + childItem.count,
        price = childItem.price,
        data = {
          range: range,
          price: price
        };
      tableConfig.data.push(data);
    });

    let price = <Table
        __={__}
        dataKey={tableConfig.dataKey}
        column={tableConfig.column}
        data={tableConfig.data}
      />;
    let items = [{
      title: __.name,
      content: item.name || '(' + item.id.substring(0, 8) + ')'
    }, {
      title: __.service,
      content: item.service
    }, {
      title: __.price,
      content: price
    }, {
      title: __.type,
      content: (type === 'segmented') ? __.gradient_charge : '-'
    }, {
      title: __.region,
      content: HALO.region_list.find((n) => n.id === item.region_id) ? HALO.region_list.find((n) => n.id === item.region_id).name : item.region_id
    }, {
      title: __.description,
      content: item.description ? item.description : '-'
    }, {
      title: __.created + __.time,
      type: 'time',
      content: item.created_at
    }];

    return items;
  }

  render() {
    return (
      <div className="halo-module-price-mgmt" style={this.props.style}>
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
