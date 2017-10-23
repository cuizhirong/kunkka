require('./style/index.less');

const React = require('react');
const request = require('../../request');
const {Button} = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');
const SelectData = require('./select');
let t;

const copyObj = function(obj) {
  let newobj = obj.constructor === Array ? [] : {};
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
      data: props.data ? copyObj(props.data) : [],
      phoneData: props.phoneData ? copyObj(props.phoneData) : [],
      subs: props.subs ? props.subs : [],
      opsubs: [],
      showsubs: [],
      renderValue: props.renderValue ? props.renderValue : '',
      name: props.name ? props.name : null,
      checked: false,
      subscriptions: [],
      deleteSubs: []
    };

    this.wait = 60;

    ['onChange', 'renderData', 'renderInput', 'onInputChange', 'times', 'countDown', 'deleteSub', 'onAddSubscriber'].forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    clearTimeout(t);
    if (this.state.name) {
      request.getSubscriptionsByName(this.state.name).then(res => {
        this.setState({
          subs: res.subscriptions,
          showsubs: res.subscriptions
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
    this.countDown(i, this.wait);
    let that = this;
    request.resendVerify(sub).then((res) => {
      this.state.subscriptions.push(res.subscription_id);
      that.setState({
        subscriptions: this.state.subscriptions
      });
    }).catch(error => {
      getErrorMessage(error);
    });
  }

  countDown(i, wait) {
    let time = document.getElementById('time' + i);
    let resend = document.getElementById('resend' + i);
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
    let props = this.props,
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

  // onConfirm() {
  //   let mobile = this.state.renderValue, mflag;
  //   let regBox = {
  //     regEmail : /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/,
  //     regMobile : /^0?1[3|4|5|8][0-9]\d{8}$/
  //   };
  //   if (this.state.value === 'Email') {
  //     mflag = regBox.regEmail.test(mobile);
  //   } else {
  //     mflag = regBox.regMobile.test(mobile);
  //   }
  //   if (!mflag) {
  //     document.getElementById('input').classList.add('error');
  //   } else {
  //     document.getElementById('input').classList.remove('error');
  //     let data = {
  //       protocol: this.state.value.toLowerCase()
  //     };
  //     if (this.state.value.toLowerCase() === 'sms') {
  //       data.endpoint = this.refs.select.state.phoneValue + '-' + this.state.renderValue;
  //     } else {
  //       data.endpoint = this.state.renderValue;
  //     }

  //     request.addEndpoint(data).then((res) => {
  //       this.state.subs.push(res);
  //       this.state.msg.push(res);
  //       this.setState({
  //         subs: this.state.subs,
  //         msg: this.state.msg,
  //         renderValue: ''
  //       });
  //       if (!res.verified) {
  //         this.countDown(this.state.subs.length - 1, this.wait);
  //       }
  //     });
  //   }
  // }
  onAddSubscriber() {
    let email = this.state.renderValue;
    let regEmail = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!regEmail.test(email) || this.state.showsubs.find(s => s.subscriber === `mailto:${email}`)) {
      document.getElementById('input').classList.add('error');
    } else {
      document.getElementById('input').classList.remove('error');
      let data = {
        type: 'Email',
        subscriber: 'mailto:' + this.state.renderValue,
        confirmed: false,
        id: 'id' + Math.random() * Math.random() * Math.pow(2, 36)
      };
      this.setState({
        showsubs: this.state.showsubs.concat(data),
        opsubs: this.state.opsubs.concat(Object.assign(data, {op: 'add'}))
      }, () => {
        this.setState({
          checked: !!this.state.showsubs.length,
          renderValue: ''
        });
      });
    }
  }

  deleteSub(i) {
    clearTimeout(t);
    let v = this.state.showsubs[i];
    request.deleteSubs('undefined', this.state.subscriptions.splice(i, 1));
    if(!/^id/.test(v.id)) {
      this.state.showsubs.splice(i, 1);
      this.setState({
        showsubs: this.state.showsubs,
        subscriptions: this.state.subscriptions,
        opsubs: this.state.opsubs.concat(Object.assign(v, {op: 'delete'}))
      }, () => {
        this.setState({
          checked: !!this.state.showsubs.length
        });
      });
    } else {
      this.state.showsubs.splice(i, 1);
      this.setState({
        showsubs: this.state.showsubs,
        subscriptions: this.state.subscriptions,
        opsubs: this.state.opsubs.filter(o => o.id !== v.id)
      }, () => {
        this.setState({
          checked: !!this.state.showsubs.length
        });
      });
    }
  }

  render() {
    let className = 'halo-pop-com-endpoint modal-row';
    if (this.props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (this.props.hide) {
      className += ' hide';
    }
    // clearTimeout(t);

    return (
      <div className={className}>
        <div>
          {this.props.required && <strong>*</strong>}
          {__[this.props.field]}
        </div>
        <div className="terminal">
          {
            this.state.showsubs && this.state.showsubs.map((m, i) => {
              return (
                <div className="terminal-list" key={m.id}>
                  <span className="protocol">{
                    // m.protocol === 'email' ?
                    // m.protocol.replace(/(\w)/, function(v){return v.toUpperCase();})
                    // : m.protocol.toUpperCase()
                    'Email'
                  }</span>
                  <span className="endpoint">{m.subscriber.substr(7)}</span>
                  <span style={{width: '90px'}}>
                    <span id={'time' + i} className="time"></span>
                    <span className={m.confirmed ? 'verified' : 'hide'}>{m.confirmed ? __.verified : ''}</span>
                    <span id={'resend' + i} className={m.confirmed ? 'hide' : 'resend'} title={__.resend}>
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
            <Button value={__.add_} onClick={this.onAddSubscriber}/>
          </div>
        </div>
      </div>
    );
  }
}

function popEndpoint(config) {
  return <AddEndpoint ref="endpoints" {...config} />;
}

module.exports = popEndpoint;
