require('./style/index.less');

const React = require('react');
const {Button} = require('client/uskin/index');

const moment = require('client/libs/moment');
const ChargeTable = require('./charge_table');


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
    let func = this.props.onAction;
    func && func(field, actionType, this.refs, data);
  }

  accountCharge() {
    let value = this.refs.chargeTable.refs.input.state.value;
    let patrn = /^([1-9]\d*|0)(\.\d*[1-9])?$/;
    if (patrn.exec(value) && value >= HALO.settings.min_recharge_amount) {
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
    let __ = this.props.__;
    let className = 'tip-danger hide';
    if (!this.state.isHide) {
      className += 'tip-danger';
    }

    return (
      <div className="charge-record-main">
        <div className={className}>
          {__.tip_info.replace('{0}', HALO.settings.min_recharge_amount)}
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
