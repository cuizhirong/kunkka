require('./style/index.less');

const React = require('react');
const Main = require('client/components/main/index');

const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');
const request = require('./request');

const moment = require('client/libs/moment');

class Model extends React.Component {

  constructor(props) {
    super(props);

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

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'operation_time':
          column.render = (col, item, i) => {
            let uniformTime = item.generated.split('.')[0] + 'Z';
            return moment(uniformTime).fromNow();
          };
          break;
        default:
          break;
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.getTableData(true);
    }
  }

  onInitialize(params) {
    this.getTableData(true);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getEvents().then((res) => {
      let table = this.state.config.table;

      table.data = res;
      table.loading = false;

      this.setState({
        config: config
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    switch (key) {
      case 'refresh':
        this.refresh({
          tableLoading: true
        }, true);
        break;
      default:
        break;
    }
  }

  refresh(data, forceUpdate) {
    if (data && data.tableLoading) {
      this.loadingTable();
    }

    this.getTableData(forceUpdate);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  render() {
    return (
      <div className="halo-module-action-log" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          config={this.state.config}
          params={this.props.params}
          onAction={this.onAction}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;
