require('./style/index.less');

const React = require('react');
const Input = require('client/components/modal_common/subs/input');
const RadioList = require('./radioList');
const resources = '/static/assets/bill/bank_logo.png';

class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectValue: HALO.settings.enable_alipay ? 'alipay' : 'paypal'
    };

    ['onAction', 'renderRadio', 'onSelectedValueChanged'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  shouldComponentUpdate(nextProps) {
    if (!this.props.visible && !nextProps.visible) {
      return false;
    }
    return true;
  }

  onAction(field, actionType, data) {
    let func = this.props.onAction;
    func && func(field, actionType, this.refs, data);
  }

  renderRadio() {
    let alipayClass = {
      background: 'url(' + resources + ') 0 0 no-repeat',
      backgroundPosition: -150
    };
    let paypalClass = {
      background: 'url(' + resources + ') 0 0 no-repeat',
      backgroundPosition: -480
    };
    let alipay = {
      id: 1,
      name: 'payment',
      value: 'alipay',
      styleClass: alipayClass
    };
    let paypal = {
      id: 2,
      name: 'payment',
      value: 'paypal',
      styleClass: paypalClass
    };
    let enableAlipay = HALO.settings.enable_alipay;
    let enablePaypal = HALO.settings.enable_paypal;
    let listItems = [];
    if (enableAlipay) {
      listItems.push(alipay);
    }
    if (enablePaypal) {
      listItems.push(paypal);
    }

    return listItems.map((item, index) => {
      return (
        <RadioList
          key={index}
          id={index}
          name={item.name}
          value={item.value}
          styleClass={item.styleClass}
          checked={this.state.selectValue === item.value}
          onSelectedValueChanged={this.onSelectedValueChanged} />
      );
    });
  }

  onSelectedValueChanged(e) {
    this.setState({
      selectValue: e.target.value
    });
    this.forceUpdate();
  }

  render() {
    let props = this.props;
    let __ = props.__;

    return (
      <div className="charge-table">
        <div className="charge-num">
          <div>{__.recharge_num + ': '}</div>
          <Input ref="input" input-type="text" value={10} onAction={this.onAction}/>
        </div>
        <div ref="payment" className="payment">
          <div className="p-l">{this.props.__.payment + ': '}</div>
          {this.renderRadio()}
        </div>
      </div>
    );
  }
}

module.exports = Main;
