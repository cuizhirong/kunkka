require('./style/index.less');

var React = require('react');
var {Button} = require('client/uskin/index');
var request = require('../../request');
var __ = require('locale/client/dashboard.lang.json');
var getErrorMessage = require('client/applications/dashboard/utils/error_message');
var SelectData = require('./select');
var t;

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

class AddEndpoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value ? props.value : '',
      renderValue: '',
      data: props.data ? copyObj(props.data) : [],
      phoneData: props.phoneData ? copyObj(props.phoneData) : [],
      msg: props.msg ? props.msg : [],
      subs: props.subs ? props.subs : [],
      uuid: props.uuid
    };

    this.wait = 60;

    ['onChange', 'renderData', 'renderInput', 'onConfirm', 'onInputChange', 'times', 'countDown', 'deleteSub'].forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    if (this.state.uuid) {
      request.getNotifyById(this.state.uuid).then(res => {
        this.setState({
          subs: res.subs
        });
      });
    }
  }

  componentDidUpdate() {
    this.props.onAction && this.props.onAction(this.props.field, this.state, this.refs);
  }

  onChange(e) {
    if (e.target.value === 'SMS') {
      document.getElementsByTagName('select')[1].classList.remove('hide');
      document.getElementById('input').classList.add('input-sms');
      document.getElementById('input').classList.remove('input-email');
    } else {
      document.getElementsByTagName('select')[1].classList.add('hide');
      document.getElementById('input').classList.remove('input-sms');
      document.getElementById('input').classList.add('input-email');
    }
    this.setState({
      value: e.target.value,
      renderValue: ''
    });
  }

  times(i, sub) {
    var that = this;
    request.resendVerify(sub.uuid).then(() => {
      that.countDown(i, this.wait);
    }).catch(error => {
      getErrorMessage(error);
    });
  }

  countDown(i, wait) {
    var time = document.getElementById('time' + i);
    var resend = document.getElementById('resend' + i);
    resend && resend.classList.add('hide');
    time && time.classList.remove('hide');
    wait--;
    if (time) {
      time.innerHTML = __.verifying + '(' + wait + 's)';
    }
    t = setTimeout(this.countDown.bind(this, i, wait), 1000);
    if ( wait <= 0 ){
      resend && resend.classList.remove('hide');
      time && time.classList.add('hide');
      clearTimeout(t);
    }
  }

  renderData() {
    var props = this.props,
      state = this.state;

    if (state.data && state.data.length > 0) {
      return (
        <div style={{float: 'left'}}>
          <select value={state.value} onChange={this.onChange}>
            {
              state.data.map(function(v) {
                return <option key={v.id} value={v.name}>{v.name || '(' + v.id.substr(0, 8) + ')'}</option>;
              })
            }
          </select>
          <SelectData ref="select" onPhoneChange={this.onPhoneChange} phoneValue={props.phoneValue} />
        </div>
      );
    }
  }

  onInputChange(e) {
    this.setState({
      renderValue: e.target.value
    });
  }

  renderInput() {
    return (
      <input id="input" ref="input" value={this.state.renderValue} onChange={this.onInputChange}/>
    );
  }

  onConfirm() {
    var mobile = this.state.renderValue, mflag;
    var regBox = {
      regEmail : /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
      regMobile : /^0?1[3|4|5|8][0-9]\d{8}$/
    };
    if (this.state.value === 'Email') {
      mflag = regBox.regEmail.test(mobile);
    } else {
      mflag = regBox.regMobile.test(mobile);
    }
    if (!mflag) {
      document.getElementById('input').classList.add('error');
    } else {
      document.getElementById('input').classList.remove('error');
      var data = {
        protocol: this.state.value.toLowerCase()
      };
      if (this.state.value.toLowerCase() === 'sms') {
        data.endpoint = this.refs.select.state.phoneValue + '-' + this.state.renderValue;
      } else {
        data.endpoint = this.state.renderValue;
      }

      request.addEndpoint(data).then((res) => {
        this.state.subs.push(res);
        this.state.msg.push(res);
        this.setState({
          subs: this.state.subs,
          msg: this.state.msg,
          renderValue: ''
        });
        this.countDown(this.state.subs.length - 1, this.wait);
      });
    }
  }


  deleteSub(i) {
    this.state.subs.splice(i, 1);
    this.setState({
      subs: this.state.subs
    });
  }

  render() {
    var className = 'halo-pop-com-endpoint modal-row';
    if (this.props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (this.props.hide) {
      className += ' hide';
    }
    clearTimeout(t);

    return (
      <div className={className}>
        <div>
          {this.props.required && <strong>*</strong>}
          {__[this.props.field]}
        </div>
        <div className="terminal">
          {
            this.state.subs && this.state.subs.map((m, i) => {
              return (
                <div className="terminal-list" key={m.uuid}>
                  <span className="protocol">{
                    m.protocol === 'email' ?
                    m.protocol.replace(/(\w)/, function(v){return v.toUpperCase();})
                    : m.protocol.toUpperCase()
                  }</span>
                  <span className="endpoint">{m.endpoint}</span>
                  <span style={{width: '90px'}}>
                    <span id={'time' + i} className="time">{this.times.bind(this, i)}</span>
                    <span className={m.verified ? 'verified' : 'hide'}>{m.verified ? __.verified : ''}</span>
                    <span id={'resend' + i} className={m.verified ? 'hide' : 'resend'} title={__.resend}>
                      <i className="glyphicon icon-notification msg" onClick={this.times.bind(this, i, m)}/>
                    </span>
                  </span>
                  <span className="delete">
                    <i className="glyphicon icon-delete msg" onClick={this.deleteSub.bind(this, i)}/>
                  </span>
                </div>);
            })
          }
          <div className="endpoint-content">
            {this.renderData()}
            {this.renderInput()}
            <Button value={__.send} onClick={this.onConfirm}/>
          </div>
        </div>
      </div>
    );
  }
}

function popEndpoint(config) {
  return <AddEndpoint refs="endpoint" {...config} />;
}

module.exports = popEndpoint;
