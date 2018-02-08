require('./style/index.less');

const React = require('react');
const request = require('./request');
const config = require('./config.json');
const Main = require('client/components/main_paged/index');
const DetailMinitable = require('client/components/detail_minitable/index');
const popExport = require('./pop/export/index');
const moment = require('client/libs/moment');
const __ = require('locale/client/bill.lang.json');
const converter = require('../../utils/converter');
const getIcons = require('../../utils/resource_icons');
const {Button, Tab} = require('client/uskin/index');

const formater = 'YYYY-MM-DD HH:mm:ss';

class Model extends React.Component {
  constructor(props) {
    super(props);
    // moment.locale(HALO.configs.lang);

    this.state = {
      config: config,
      upLoading: true,
      total: {},
      resources: [],
      current: '',
      searchType: 'name'
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    converter.convertLang(__, this.state.config);
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
      this.onInitialize();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'resource':
          column.formatter = (col, item, i) => {
            return item.display_name;
          };
          break;
        case 'resource_id':
          column.render = (col, item, i) => {
            return item.id;
          };
          break;
        case 'amount':
          column.render = (col, item, i) => {
            return <span className="orange">{item.total_price}</span>;
          };
          break;
        case 'started_at':
          column.render = (col, item, i) => {
            return moment(item.started_at).format(formater);
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.getResourceList();
  }

  getResourceList(projectId) {
    this.loadingResourceList();
    request.getResourceList(projectId).then(res => {
      const resources = res.filter(r => r.type !== 'generic');
      this.setState({
        upLoading: false,
        total: res.find(r => r.type === 'generic'),
        resources: resources,
        current: resources[0].type
      }, () => {
        this.getList(this.state.current, projectId);
      });
    });
  }

  getList(type, projectId) {
    this.loadingTable();
    let _config = this.state.config,
      table = _config.table;
    request.getList(type, projectId).then((res) => {
      table.data = res.orders;
      this.updateTableData(table);
    }).catch(res => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  updateTableData(table) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    });
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  loadingResourceList() {
    this.setState({
      upLoading: true
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        const {rows} = data;
        request.getBillDetail(rows[0].metrics['total.cost']).then(res => {
          this.onClickDetailTabs(actionType, refs, data, res);
        });
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
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

  onClickDetailTabs(tabKey, refs, data, billDetail) {
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;

    switch(tabKey) {
      case 'bill_detail':
        if (rows.length === 1) {
          let billItems = this.getBillItems(billDetail);
          contents[tabKey] = (
            <DetailMinitable
              __={__}
              title={__.bill_detail}
              defaultUnfold={true}
              tableConfig={billItems ? billItems : []} />
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

  getBillItems(billDetail) {
    let tableContent = [];
    billDetail.forEach((ele, index) => {
      let dataObj = {
        started_at: moment(ele[0]).format(formater),
        ended_at: moment(ele[0]).add(1, 'days').format(formater),
        amount: ele[2]
      };
      tableContent.push(dataObj);
    });
    let tableConfig = {
      column: [{
        title: __.started_at,
        key: 'started_at',
        dataIndex: 'started_at'
      }, {
        title: __.ended_at,
        key: 'ended_at',
        dataIndex: 'ended_at'
      }, {
        title: __.amount,
        key: 'amount',
        dataIndex: 'amount'
      }],
      data: tableContent,
      dataKey: 'started_at',
      hover: true
    };

    return tableConfig;
  }

  changeResource(type) {
    this.setState({
      current: type
    }, () => {
      this.getList(this.state.current);
    });
  }

  onSwitch(e) {
    this.setState({
      searchType: e.target.value
    });
  }

  onQuery() {
    const state = this.state;
    const value = this.refs.searchText.value;
    if(state.searchType === 'name') {
      request.getProjectByName(value).then(res => {
        if(res.projects.length > 0) {
          this.getResourceList(res.projects[0].id);
        } else {
          this.getResourceList(value);
        }
      });
    } else {
      this.getResourceList(value);
    }
  }

  onExport() {
    popExport();
  }

  render() {
    const tabs = [{
      name: __['global-billing-record'],
      key: 'global-billing-record',
      default: true
    }];
    const state = this.state;
    return (
      <div className="halo-module-global-billing-record" style={this.props.style}>
        <div className="tab-wrapper">
          <Tab items={tabs} />
        </div>
        <div className="btnlist">
          <div className="select">
            <select value={state.searchType} onChange={this.onSwitch.bind(this)}>
              <option key="name" value="name">{__.search_by_name}</option>
              <option key="id" value="id">{__.search_by_id}</option>
            </select>
            <input ref="searchText" type="text"/>
          </div>
          <Button value={__.query} btnKey="normal" disabled={state.upLoading} onClick={this.onQuery.bind(this)} />
          <Button iconClass="download" onClick={this.onExport.bind(this)} btnKey="normal" value={__.export} initial={true} />
        </div>
        {
          !state.upLoading ? <div className="resource-list">
            <div className="left">
              <div className="title">{__.all_types}</div>
              <div className="price">¥{state.total.total_price}</div>
            </div>
            <div className="right">
              {
                state.resources.map((resource, i) => {
                  return <div key={i} className="resource-wrapper">
                    <div className={'resource' + (state.current === resource.type ? ' select' : '')} onClick={this.changeResource.bind(this, resource.type)}>
                      <div className="title">
                        <i className={`glyphicon ${getIcons(resource.type)}`}></i>
                        {__[resource.type]}
                      </div>
                      <div className="price">
                        ¥{resource.total_price}
                      </div>
                    </div>
                  </div>;
                })
              }
            </div>
          </div> : <div className="loading-wrapper"><i className="glyphicon icon-loading"></i></div>
        }
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params} />
      </div>
    );
  }
}

module.exports = Model;
