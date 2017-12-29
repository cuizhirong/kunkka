const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {
  if (obj) {
    config.title = ['modify', 'user'];
    config.fields[0].value = obj.name;
    config.fields[4].value = obj.email;
    config.fields[5].value = obj.description;
    config.fields[3].disabled = true;
    config.fields[1].hide = true;
    config.fields[2].hide = true;
    config.fields[6].hide = true;
    config.btn.value = 'modify';
    config.btn.type = 'update';
    config.btn.disabled = false;
  } else {
    config.title = ['create', 'user'];
    config.fields[1].hide = false;
    config.fields[2].hide = false;
    config.fields[3].disabled = false;
    config.fields[0].value = '';
    config.fields[1].value = '';
    config.fields[2].value = '';
    config.fields[4].value = '';
    config.fields[5].value = '';
    config.fields[6].hide = false;
    config.btn.value = 'create';
    config.btn.type = 'create';
    config.btn.disabled = true;
  }

  let props = {
    __: __,
    width: 550,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      let domain;
      request.getDomains().then((domains) => {
        if (obj) {
          domain = domains.find((ele) => ele.id === obj.domain_id);
        } else {
          let defaultDomainName = HALO.configs.domain.toLowerCase();
          domain = domains.find((ele) => ele.name.toLowerCase() === defaultDomainName);
        }
        refs.domain.setState({
          data: domains,
          value: domain.id,
          hide: false
        });
      });

      request.getRoles().then((res) => {
        refs.role.setState({
          data: res,
          value: res[0].id
        });
      });
    },
    onConfirm: function(refs, cb) {
      request.getDomains().then((domains) => {
        let username = refs.name.state.value;
        let data = {
          name: username,
          description: refs.describe.state.value,
          email: refs.email.state.value,
          domain_id: refs.domain.state.value
        };
        if (obj) {
          request.editUser(obj.id, data).then((res) => {
            callback && callback(res.user);
            cb(true);
          }).catch((error) => {
            cb(false, getErrorMessage(error));
          });
        } else {
          const passwd = refs.password.state.value;
          const cfmPasswd = refs.confirm_password.state.value;

          if(passwd !== cfmPasswd || !/^\w{8,20}$/.test(passwd) || !/\d+/.test(passwd) || !/[a-z]+/.test(passwd) || !/[A-Z]+/.test(passwd)) {
            cb(false, __.passwd_not_meet_requirement);
            return;
          }

          data.password = passwd;
          let hasPrj = refs.crt_user_project.state.checked;
          data.is_create_project = hasPrj;

          if (hasPrj) {
            let prjName = refs.project_name.state.value;
            prjName = prjName !== '' ? prjName : username + '_project';
            data.project_name = prjName;
            data.role = refs.role.state.value;
          }

          request.createUser(data).then((res) => {
            if(res.project) {
              request.linkProject(res.project.id);
            }
            callback && callback(res.user);
            cb(true);
          }).catch((prjError) => {
            let response = JSON.parse(prjError.response);

            let msg;
            if (response.error) {
              msg = response.error;
            } else if (response.response) {
              let text = JSON.parse(response.response.text);
              msg = text.error.message;
            } else {
              msg = 'There is an error occured';
            }

            cb(false, msg);
          });
        }
      });
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'password':
          let pwd = refs.password.state.value;
          refs.password.setState({
            error: pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd)
          });
          let _name = refs.name.state.value;
          if(obj) {
            refs.btn.setState({
              disabled: !_name
            });
          } else {
            let _rePsw = refs.confirm_password.state.value;
            let _valid = _name && pwd && (pwd === _rePsw);
            refs.btn.setState({
              disabled: !_valid
            });
          }
          break;
        case 'name':
        case 'confirm_password':
          let name = refs.name.state.value;
          if(obj) {
            refs.btn.setState({
              disabled: !name
            });
          } else {
            let psw = refs.password.state.value;
            let rePsw = refs.confirm_password.state.value;
            let valid = name && psw && (psw === rePsw);
            refs.btn.setState({
              disabled: !valid
            });
          }
          break;
        case 'crt_user_project':
          let checked = status.checked;
          let username = refs.name.state.value;
          let prjName = refs.project_name.state.value;
          refs.project_name.setState({
            hide: !checked,
            value: checked ? username + '_project' : prjName
          });
          refs.role.setState({
            hide: !checked
          });
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
