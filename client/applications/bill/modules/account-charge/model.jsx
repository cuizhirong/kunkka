require('./style/index.less');

var React = require('react');
var request = require('./request');
var moment = require('client/libs/moment');
var waiting = require('./pop/waiting/index');
var __ = require('locale/client/bill.lang.json');

var Charge = require('./charge/index');

class Model extends React.Component {

  constructor(props) {
    super();

    moment.locale(HALO.configs.lang);

    this.state = {
      balance: ''
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentDidMount() {
    this.onInitialize();
  }

  onInitialize() {
    var userId = HALO.user.userId;

    request.getList(userId).then((res) => {
      this.setState({
        balance: res.balance
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'charge':
        if (actionType === 'recharge') {
          var value = refs.chargeTable.refs.input.state.value;
          var payments = document.getElementsByName('payment');
          var payment = '';
          for(var index in payments) {
            if(payments[index].checked) {
              payment = payments[index].value;
              break;
            }
          }
          waiting(null, (res) => {
            this.setState({
              balance: res.balance
            });
          });
          var url = '/api/pay/' + payment + '?amount=' + value;
          window.open(url, '_blank', 'width=780, height=436, left=0, top=0, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no').blur();
        }
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-charge" style={this.props.style}>
        <Charge
          ref="charge"
          visible={this.props.style}
          balance={this.state.balance}
          __={__}
          onAction={this.onAction} />
      </div>
    );
  }
}

module.exports = Model;
