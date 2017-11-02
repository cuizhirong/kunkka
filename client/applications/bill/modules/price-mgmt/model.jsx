require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const BasicProps = require('client/components/basic_props/index');
const modifyPricePop = require('./pop/modify/index');
const deleteModal = require('client/components/modal_delete/index');
const __ = require('locale/client/bill.lang.json');
const config = require('./config.json');
const router = require('client/utils/router');
const request = require('./request');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config,
      ready: false
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
      this.getList();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      column.formatter = (col, item, i) => {
        return item.name ? item.name : '(' + item.mapping_id.substr(0, 8) + ')';
      };
      switch (column.key) {
        case 'service':
          column.render = (col, item, i) => {
            return item.resource_type;
          };
          break;
        case 'price':
          column.render = (col, item, i) => {
            return <span className="orange">{item.cost}</span>;
          };
          break;
        case 'region':
          column.render = (col, item, i) => {
            return HALO.current_region;
          };
          break;
        default:
          break;
      }
    });
  }

  //initialize table data
  onInitialize() {
    this.getList();
  }

  getList(refreshDetail) {
    !refreshDetail && this.clearState();
    let table = this.state.config.table;
    request.getList().then((res) => {
      this.setState({
        ready: true
      });
      table.data = res;
      this.updateTableData(table, refreshDetail);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, refreshDetail);
    });
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
    this.getList(data.refreshDetail);
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
        this.onClickDetailTabs(actionType, refs, data);
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
    let items = [{
      title: __.name,
      content: item.name || '(' + item.mapping_id.substring(0, 8) + ')'
    }, {
      title: __.price,
      content: item.cost
    }, {
      title: __.mapping_id,
      type: 'copy',
      content: item.mapping_id
    }, {
      title: __.service,
      content: item.resource_type
    }, {
      title: __.region,
      content: HALO.current_region
    }];

    return items;
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      if(data.text) {
        this.getSingleByMappingId(data.text);
      } else {
        this.getList();
      }
    }
  }

  getSingleByMappingId(mappingId) {
    if(HALO.stash.mappings.find(m => m.mapping_id === mappingId)) {
      router.replaceState('/bill/price-mgmt/' + mappingId, null, null, false);
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
        if(this.state.ready) {
          modifyPricePop(null, null, function() {
            that.refresh({
              refreshList: true,
              refreshDetail: true
            });
          });
        }
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
