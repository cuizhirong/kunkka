require('./style/index.less');

var React = require('react');
var Tab = require('client/uskin/index').Tab;
var Table = require('client/uskin/index').Table;

var request = require('./request');
var moment = require('client/libs/moment');
var __ = require('locale/client/bill.lang.json');
var getTime = require('client/utils/time_unification');

class Model extends React.Component {
  constructor(props) {
    super(props);
    moment.locale(HALO.configs.lang);

    this.state = {
      balance: '0.00',
      consumption: '0.00',
      remaining_day: '0',
      price_per_day: '0.00',
      price_per_hour: '0.00',
      data: [],
      ready: false
    };

    ['onInitialize'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    this.onInitialize();
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
        case 'project_name':
          column.render = (col, item, i) => {
            return <a data-type="router" href={'/bill/billing-record/' + item.project_id}>{item.project_name}</a>;
          };
          break;
        case 'project_consumption':
          column.render = (col, item, i) => {
            return <span className="orange">{item.project_consumption}</span>;
          };
          break;
        case 'user_consumption':
          column.render = (col, item, i) => {
            return <span className="orange">{item.user_consumption}</span>;
          };
          break;
        case 'created_at':
          column.render = (col, item, i) => {
            return getTime(item.created_at);
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.getList();
  }

  getList() {
    request.getOverview().then((res) => {
      let data = res[0].accounts[0];
      this.setState({
        ready: true,
        balance: parseInt(data.balance, 10).toFixed(2),
        consumption: parseInt(data.consumption, 10).toFixed(2),
        remaining_day: data.remaining_day,
        price_per_day: parseInt(data.price_per_day, 10).toFixed(2),
        price_per_hour: (parseInt(data.price_per_day, 10) / 24).toFixed(2),
        data: res[1]
      });
    });
  }

  render() {
    var tabs = [{
      name: __['bill-overview'],
      key: 'bill-overview',
      default: true
    }];
    var columm = [{
      title: __.project,
      dataIndex: 'project_name',
      key: 'project_name'
    }, {
      title: __.user_consumption,
      dataIndex: 'user_consumption',
      key: 'user_consumption'
    }, {
      title: __.project_consumption,
      dataIndex: 'project_consumption',
      key: 'project_consumption'
    }, {
      title: __.created_at,
      dataIndex: 'created_at',
      key: 'created_at'
    }];
    this.tableColRender(columm);

    var state = this.state;
    return (
      <div className="halo-module-bill-overview" style={this.props.style}>
        <Tab items={tabs} />
        {
          state.ready ? <div className="overview">
            <div className="overview-wrapper">
              <div className="overview-first">
                <div className="overview-item">
                  <div className="item">
                    <div className="title">{__.bill_balance}<a data-type="router" href="/bill/account-charge">充值</a></div>
                    <div className="content blue">
                      ¥&nbsp;{state.balance}
                    </div>
                  </div>
                </div>
                <div className="overview-item">
                  <div className="item">
                    <div className="title">{__.consumption}</div>
                    <div className="content orange">
                      ¥&nbsp;{state.consumption}
                    </div>
                  </div>
                </div>
                <div className="overview-item">
                  <div className="item">
                    <div className="title">{__.consumption_estimate}</div>
                    <div className="content green">
                      {state.remaining_day + ' ' + __.day}
                    </div>
                  </div>
                </div>
              </div>
              <div className="overview-second">
                <div className="overview-item">
                  <div className="item">
                    <div className="title">{__.consumption_each_day}</div>
                    <div className="content orange">
                      ¥&nbsp;{state.price_per_day}
                    </div>
                  </div>
                </div>
                <div className="overview-item">
                  <div className="item">
                    <div className="title">{__.consumption_each_hour}</div>
                    <div className="content orange">
                      ¥&nbsp;{state.price_per_hour}
                    </div>
                  </div>
                </div>
                <div className="overview-item">
                </div>
              </div>
            </div>
            <div className="table-wrapper">
              <Table
                ref="table"
                column={columm}
                data={state.data}
                dataKey={'project_id'}
                hover={true}
                striped={true}
                />
            </div>
          </div> : <div className="loading-data"><i className="glyphicon icon-loading"></i></div>
        }
      </div>
    );
  }
}

module.exports = Model;
