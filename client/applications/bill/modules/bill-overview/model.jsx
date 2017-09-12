require('./style/index.less');

const React = require('react');
const Tab = require('client/uskin/index').Tab;
const Table = require('client/uskin/index').Table;

const request = require('./request');
const moment = require('client/libs/moment');
const __ = require('locale/client/bill.lang.json');
const getTime = require('client/utils/time_unification');

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
        balance: parseFloat(data.balance),
        consumption: parseFloat(data.consumption),
        remaining_day: data.remaining_day,
        price_per_day: parseFloat(data.price_per_day),
        price_per_hour: (parseFloat(data.price_per_day) / 24),
        data: res[1]
      });
    });
  }

  render() {
    let tabs = [{
      name: __['bill-overview'],
      key: 'bill-overview',
      default: true
    }];
    let columm = [{
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
    function displayRemainingDay(data) {
      if(data === -1) {
        return __.full;
      } else if(data === -2) {
        return __.owed;
      } else {
        return data + __.day;
      }
    }
    this.tableColRender(columm);

    let state = this.state;
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
                    <div className={'content' + (state.balance >= 0 ? ' blue' : ' red')}>
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
                      {displayRemainingDay(state.remaining_day)}
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
                striped={false}
                />
                {
                  state.data && state.data.length === 0 ? <div className="no-data">
                    {__.noData}
                  </div> : null
                }
            </div>
          </div> : <div className="loading-data"><i className="glyphicon icon-loading"></i></div>
        }
      </div>
    );
  }
}

module.exports = Model;
