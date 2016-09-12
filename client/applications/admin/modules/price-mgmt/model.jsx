require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');
var BasicProps = require('client/components/basic_props/index');
var modifyPricePop = require('./pop/modify/index');
var deleteModal = require('client/components/modal_delete/index');
var Table = require('client/uskin/index').Table;
var __ = require('locale/client/admin.lang.json');
var config = require('./config.json');
var moment = require('client/libs/moment');
var request = require('./request');

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
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'base_price':
          column.render = (col, item, i) => {
            var basePrice = item.unit_price.price.base_price;
            return basePrice;
          };
          break;
        case 'price':
          column.render = (col, item, i) => {
            var price = item.unit_price.price;
            if(price.segmented) {
              return (
                <div className="halo-module-price-mgmt-price">
                  {item.unit_price.price.segmented[0].price}
                  <span>{' (' + price.segmented.length + ')'}</span>
                </div>
              );
            }
            return '';
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            var type = item.unit_price.price.type;
            if(type === 'segmented') {
              return __.gradient_charge;
            } else {
              return '';
            }
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
    var table = this.state.config.table;
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

  getList() {
    this.clearState();
    var table = this.state.config.table;
    request.getList().then((res) => {
      var newTable = this.processTableData(table, res);
      this.updateTableData(newTable, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  //rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      var detail = this.refs.dashboard.refs.detail,
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
      var table = this.state.config.table;
      table.data = res.products;
      table.loading = false;

      var detail = this.refs.dashboard.refs.detail;
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
    var dashboard = this.refs.dashboard;
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
    var len = rows.length;

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
    var {rows} = data,
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
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    switch (tabKey) {
      case 'description':
        if (rows.length === 1) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);

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
    var type = item.unit_price.price.type;
    var tableConfig = {
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
      var range = '>  ' + childItem.count,
        price = childItem.price,
        data = {
          range: range,
          price: price
        };
      tableConfig.data.push(data);
    });

    var price = <Table
        __={__}
        column={tableConfig.column}
        data={tableConfig.data}
      />;
    var items = [{
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
