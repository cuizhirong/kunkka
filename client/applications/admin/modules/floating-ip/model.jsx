require('./style/index.less');

var React = require('react');
var Main = require('../../components/main/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');

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

  tableColRender(columns) {
    columns.map((column) => {
      switch(column.key) {
        case 'ip':
          break;
        default:
          break;
      }
    });
  }

  initializeFilter(filters, res) {
    var setOption = function(key, data) {
      filters.forEach((filter) => {
        filter.items.forEach((item) => {
          if(item.key === key) {
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
  }

  onInitialize(params) {
    var _config = this.state.config,
      filter = _config.filter,
      table = _config.table;

    if(params[2]) {
      request.getFloatingIPByIDInitialize(params[2]).then((res) => {
        this.initializeFilter(filter, res[1]);
        table.data = [res[0].floatingip];
        this.updateTableData(table, res[0]._url);
      });
    } else {
      var pageLimit = _config.table.limit;
      request.getListInitialize(pageLimit).then((res) => {
        this.initializeFilter(filter, res[1]);
        var newTable = this.processTableData(table, res[0]);
        this.updateTableData(newTable, res[0]._url);
      });
    }
  }

  processTableData(table, res) {
  }

  onAction(field, actionType, refs, data) {
    switch(field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(actionType, refs, data) {

    switch(actionType) {
      case 'dissociate':
        console.log('dissociate');
        break;
      case 'allocation':
        console.log('allocation');
        break;
      case 'refresh':
        var params = this.props.params,
          refreshData = {};

        if(params[2]) {
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
      default:
        break;
    }
  }

  getNextListData() {

  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  clearState() {
    this.refs.dashboard.refs.detail.loading();
  }

  loadingDetail() {
    this.stores = {
      urls: []
    };

    this.refs.dashboard.clearState();
  }

  refresh(data, params) {
    if(!data) {
      data = {};
    }
    if(!params) {
      params = this.props.params;
    }
    if(params.initialList) {
      if(data.loadingTable) {
        this.loadingTable();
      }
      if(data.clearState) {
        this.clearState();
      }

      this.getInitialListData();
    } else if(data.refreshList) {
      if(params[2]) {
        if(data.loadingDetail) {
          this.loadingDetail();
        }
      } else {
        if(data.loadingTable) {
          this.loadingTable();
        }
      }

      var history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);

    }
  }
  render() {
    return (
      <div className="halo-module-floating-ip" style={this.props.style}>
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
