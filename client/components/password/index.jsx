require('./style/index.less');

var React = require('react');
var {Tab, Button} = require('client/uskin/index');
var InputPassword = require('client/components/modal_common/subs/input_pwd/index');
var converter = require('./converter');

var config = require('./config.json');
var ajax = require('client/libs/ajax');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config,
      toggle: true
    };

    ['toggle', 'onAction', 'modify', 'back'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    //In case of having 2 or more external network, show the floating_network of the floating ip.
    converter.convertLang(this.props.__, config);
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  onAction() {}

  componentWillReceiveProps(nextProps) {
    document.getElementsByClassName('pwd')[0].style.display = 'block';
    document.getElementById('main-wrapper').removeChild(document.getElementsByClassName('pwd')[1]);
  }

  back() {
    document.getElementById('main').style.display = 'block';
    document.getElementsByClassName('pwd')[0].style.display = 'none';

    var haloMenu = document.getElementsByClassName('halo-com-menu')[0];
    haloMenu.style.width = '';
    haloMenu.style.minWidth = '';
    haloMenu.style.maxWidth = '';
    haloMenu.style.overflowX = '';
  }

  modify() {
    var newPwd = this.refs.new_pwd.state.value,
      confirmPwd = this.refs.confirm_pwd.state.value;
    ['original_pwd', 'new_pwd', 'confirm_pwd'].forEach(m => {
      this.refs[m].setState({
        error: !this.refs[m].state.value
      });
    });
    if (newPwd !== confirmPwd) {
      this.refs.confirm_pwd.setState({
        error: true
      });
    } else {
      var data = {
        original_password: this.refs.original_pwd.state.value,
        password: newPwd
      };

      ajax.post({
        url: '/proxy/keystone/v3/users/' + HALO.user.userId + '/password',
        dataType: 'json',
        contentType: 'application/json',
        headers: {
          REGION: HALO.current_region
        },
        data: {
          user: data
        }
      }).then(res => {
        window.location = '/auth/logout';
      }).catch(error => {
        this.refs.original_pwd.setState({
          error: true
        });
        document.getElementsByClassName('pwd_fail')[0].classList.remove('hide');
      });
    }
  }

  render() {
    var _config = this.state.config,
      tabs = _config.tabs,
      inputs = _config.fields,
      __ = this.props.__,
      state = this.state;
    return (
      <div className="halo-module-password" style={this.props.style}>
        {tabs ?
          <div className="submenu-tabs">
            <Tab items={tabs}/>
            <div className="back">
              <Button value={__.back} onClick={this.back} />
            </div>
          </div>
          : null
        }
        <div className="toggle">
          <div className="toggle-title" onClick={this.toggle}>
            {__.modify_pwd}
            <i className={'glyphicon icon-arrow-' + (state.toggle ? 'up' : 'down')} />
          </div>
          <div className={'toggle-content' + (state.toggle ? ' unfold' : ' fold')}>
            <div className="modal-bd halo-com-modal-common">
              {
                inputs.map(m => {
                  return <InputPassword key={m.field} ref={m.field} label={__[m.field]} __={__} onAction={this.onAction}/>;
                })
              }
              <div className="row"><Button value={__.modify} onClick={this.modify}/></div>
              <div className="row pwd_fail hide">
                <i className="glyphicon icon-status-warning" />
                <span>{__.modify_fail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
