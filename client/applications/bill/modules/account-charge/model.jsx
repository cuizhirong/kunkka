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
          var _data = {
            amount: value,
            currency: 'CAD'
          };
          var urlText = '';
          waiting(null, (res) => {
            this.setState({
              balance: res.balance
            });
          });
          request.payment(payment, _data).then((res) => {
            if (payment === 'alipay') {
              urlText = res.url;
            } else if (payment === 'paypal') {
              urlText = res.links[1].href;
            }
            var insertText = "<div style='display: none'><a href='" + urlText + "' target='_blank' id='link'>text</a></div>";
            document.getElementById('button').innerHTML = insertText;
            document.getElementById('link').click();
          });
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
