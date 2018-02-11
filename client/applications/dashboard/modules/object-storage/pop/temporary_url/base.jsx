const React = require('react');
const {Modal, Button, Calendar} = require('client/uskin/index');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const JSSHA = require('jssha');
const temporaryUrlTip = require('../temporary_url_tip/index');

class ModalBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: true,
      visabled: true,
      startTime: null,
      day: 0,
      hour: 0,
      total: 0,
      showKey: false,
      currentHour: '',
      showError: false,
      errorTip: '',
      requestExpire: 0
    };
    this.timeHours = [
      {'value': '00:00'},
      {'value': '01:00'},
      {'value': '02:00'},
      {'value': '03:00'},
      {'value': '04:00'},
      {'value': '05:00'},
      {'value': '06:00'},
      {'value': '07:00'},
      {'value': '08:00'},
      {'value': '09:00'},
      {'value': '10:00'},
      {'value': '11:00'},
      {'value': '12:00'},
      {'value': '13:00'},
      {'value': '14:00'},
      {'value': '15:00'},
      {'value': '16:00'},
      {'value': '17:00'},
      {'value': '18:00'},
      {'value': '19:00'},
      {'value': '20:00'},
      {'value': '21:00'},
      {'value': '22:00'},
      {'value': '23:00'},
      {'value': '24:00'}
    ];

    ['onCancel', 'onConfirm', 'onChangeStartTime', 'onkeyDropdown', 'onSelectHour', 'secretUrl', 'onChangeHour'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  onChangeStartTime(time) {
    let date = new Date(`${time.year}-${time.month}-${time.date} 00:00:00`);
    this.setState({
      startTime: date
    }, () => {
      let start = new Date();
      let nowTime = start.getTime();
      let expireTimes = this.state.startTime;
      let setExpireTimes = expireTimes.getTime();
      let total = (setExpireTimes - nowTime) / 1000;
      let day = Math.floor(total / (24 * 60 * 60));
      let hour = Math.floor(total % (24 * 60 * 60) / (60 * 60));
      let requestExpire = setExpireTimes / 1000;
      this.setState({
        disabled: false,
        requestExpire: requestExpire,
        day: day,
        hour: hour
      });
      if(requestExpire * 1000 < nowTime) {
        this.setState({
          disabled: true
        });
      }
    });
  }

  onChangeHour(e) {
    this.setState({
      currentHour: e.target.value
    });
  }

  onSelectHour(e) {
    let hour, resultHour, resultExpireTime;
    this.setState({
      currentHour: e.target.value,
      showKey: false
    }, () => {
      let expireTimes = this.state.startTime;
      let date = new Date();
      let nowhour = date.getHours() + 1;
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      let currentDate = date.getTime();
      let setExpireTimes = expireTimes ? expireTimes.getTime() : currentDate;
      let expireHours = this.state.currentHour;
      let zreo = expireHours.indexOf('00');
      if(zreo === 0) {
        resultExpireTime = setExpireTimes;
      } else {
        hour = expireHours.charAt(0) === '0' ? expireHours.substring(1, 2) : expireHours.substring(0, 2);
        resultHour = hour * 60 * 60 * 1000;
        resultExpireTime = resultHour + setExpireTimes;
      }
      let requestExpire = parseInt(resultExpireTime / 1000, 10);
      if (expireTimes) {
        let nowTime = Date.now();
        let hourTotal = (resultExpireTime - nowTime) / 1000;
        let residueDay = Math.floor(hourTotal / (24 * 60 * 60));
        let residueHour = Math.floor(hourTotal % (24 * 60 * 60) / (60 * 60));
        this.setState({
          disabled: false,
          requestExpire: requestExpire,
          day: residueDay,
          hour: residueHour
        });
      } else {
        let residueHour = hour - nowhour;
        this.setState({
          disabled: false,
          requestExpire: requestExpire,
          hour: residueHour || 0
        });
      }
      let now = Date.now();
      if(resultExpireTime < now) {
        this.setState({
          disabled: true
        });
      }
    });
  }

  onConfirm() {
    let randomKey = Math.random().toString(36).substr(2);
    let sliceKey = randomKey.slice(0, 4);
    let secretKey;
    request.accountHeaders().then((res) => {
      if(res === null) {
        request.sendKey(this.props.obj, this.props.breadcrumb, sliceKey).then(() => {
          request.accountHeaders(this.props.obj, this.props.breadcrumb).then(headerkey => {
            secretKey = headerkey;
            this.secretUrl(secretKey);
          });
        });
      } else {
        secretKey = res;
        this.secretUrl(secretKey);
      }
    });
  }

  secretUrl(secretKey) {
    let temporaryUrl;
    let expire = this.state.day * 24 * 60 * 60 + this.state.hour * 60 * 60;
    let assessTime = parseInt(Date.now() / 1000, 10) + expire;
    let path = '/v1/' + this.props.breadcrumb + '/' + this.props.obj.name;
    let shaObj = new JSSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(secretKey, 'TEXT');
    shaObj.update('GET\n' + assessTime + '\n' + path);
    let hmac = shaObj.getHMAC('HEX');
    temporaryUrl = window.location.protocol + '//' + window.location.hostname + ':' + HALO.configs.swift_port + '/swift/v1/' + this.props.breadcrumb + '/' + this.props.obj.name + '?temp_url_sig=' + hmac + '&temp_url_expires=' + assessTime;
    temporaryUrlTip(this.props.obj, this.props.breadcrumb, temporaryUrl, () => {
      this.setState({
        visible: false
      });
      this.props.callback && this.props.callback();
    });
    return temporaryUrl;
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onkeyDropdown() {
    this.setState({
      showKey: !this.state.showKey
    });
    const dropdownBox = this.refs.expirebtn;
    const position = dropdownBox.getBoundingClientRect();
    const scrollTop = position.top + 32 + window.pageYOffset;
    const scrollLeft = position.left + window.pageXOffset;
    this.style = {
      position: 'absolute',
      top: scrollTop,
      left: scrollLeft,
      zIndex: 999
    };
  }

  render() {
    let state = this.state,
      props = this.props;
    if(state.day.toString().charAt(0) === '-') {
      state.day = 0;
    }
    if(state.hour.toString().charAt(0) === '-') {
      state.hour = 0;
    }
    return (
      <div>
        <Modal ref="modal" {...props} title={__.create + __.temporary_url} visible={state.visible} width={500}>
          <div className="modal-bd halo-com-modal-templory-url">
            <div className="calendar-wrapper">
              <div className="date"><span>{__.date}</span>
                <Calendar onChange={this.onChangeStartTime} hasScreen={true} unfold={false} placeholder={__.choose_date} />
              </div>
              <div className="hours"><span>{__.hour}</span>
                <div className="expire-dropdown-btn" ref="expirebtn" onClick={this.onkeyDropdown}>
                  <input type="text" placeholder={__.choose_hour} value={state.currentHour}/>
                  <i className="glyphicon icon-arrow-down"></i>
                </div>
              </div>
            </div>
            <div className="translate-date">
              <span className="can-save">{__.canapply + __.time}</span>
              <span className="dynamic-time">{state.day + __.day + state.hour + __.times}</span>
            </div>
            {state.showError ? <div className="tip obj-tip-error">
              <div className="obj-tip-icon">
                <strong>
                  <i className="glyphicon icon-status-warning" />
                </strong>
              </div>
              <div className="obj-tip-content" style={{width: 370 + 'px'}}>
                {state.errorTip}
              </div>
            </div> : null}
          </div>
          <div className="modal-ft halo-com-modal-templory-url">
            <Button ref="btn" value={__.create} disabled={state.disabled} onClick={this.onConfirm} />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </Modal>
        <div className="defined-dropdown" ref="container" style={this.style}>
          {this.state.showKey ? this.timeHours.map((element, index) => <input className="dropdown-item"
            key={index}
            type = "text"
            value={element.value}
            onChange={this.onChangeHour}
            onClick={this.onSelectHour}/>) : null}
        </div>
      </div>
    );
  }
}

module.exports = ModalBase;
