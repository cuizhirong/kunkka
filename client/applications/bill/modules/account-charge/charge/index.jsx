require('./style/index.less');

var React = require('react');
var {Button} = require('client/uskin/index');

var moment = require('client/libs/moment');
var ChargeTable = require('./charge_table');


class Main extends React.Component {
  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      isHide: true
    };

    ['onAction', ['accountCharge']].forEach((m) => {
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
    var func = this.props.onAction;
    func && func(field, actionType, this.refs, data);
  }

  accountCharge() {
    var value = this.refs.chargeTable.refs.input.state.value;
    var patrn = /^([1-9]\d*|0)(\.\d*[1-9])?$/;
    if (patrn.exec(value)) {
      if (!this.state.isHide) {
        this.setState({
          isHide: true
        });
      }
      this.onAction('charge', 'recharge');
    } else {
      this.setState({
        isHide: false
      });
    }
  }

  render() {
    var __ = this.props.__;
    var className = 'tip-danger hide';
    if (!this.state.isHide) {
      className += 'tip-danger';
    }

    return (
      <div className="charge-record-main">
        <div className={className}>
          {__.tip_info}
        </div>
        <div className="balance">
          <span>{__.account_balance + ': '}</span>
          {
            HALO.configs.lang === 'zh-CN' ?
              <span>{this.props.balance + __.cny}</span>
            : <span>{__.cny + this.props.balance}</span>
          }
        </div>
        <div className="table-box">
          <ChargeTable ref="chargeTable" __={__} onAction={this.onAction}/>
        </div>
        <div className="s">
          <Button value={__.recharge} onClick={this.accountCharge}/>
          <div id="button" />
        </div>
      </div>
    );
  }
}

module.exports = Main;
