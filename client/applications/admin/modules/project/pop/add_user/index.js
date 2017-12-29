const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const renderer = require('./user_field');
const getErrorMessage = require('../../../../utils/error_message');

function checkUserInDomains(type, data, users, domainId) {
  let inDomain;
  let currUser = users.find((user) => {
    return user[type] === data;
  });

  if(currUser !== undefined && currUser.domain_id === domainId) {
    inDomain = true;
  } else {
    inDomain = false;
  }

  return inDomain;
}

function getUserId(userName, users) {
  const user = users.find((u) => {
    return u.name === userName;
  });
  return user.id;
}

function pop(obj, parent, callback) {
  config.fields[0].text = obj.name;
  let currDomainUsers = [];

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
      request.getAllUsers().then((res) => {
        let users = res[0].users,
          roles = res[1].roles;
        currDomainUsers = users;

        if (users.length > 0 && roles.length > 0) {
          refs.role.setState({
            data: roles,
            hide: false
          });
        }
      });

      refs.user_field.setState({
        renderer: renderer,
        rendererData: {
          field: 'name',
          value: '',
          onValueChange: (data, value) => {
            const rendererData = Object.assign({}, data, { value: value});
            refs.user_field.setState({
              rendererData: rendererData
            });
          },
          onClickItem: (data, item, index) => {
            const listCfg = Object.assign({}, data.listCfg, {selectedIndex: index});
            const rendererData = Object.assign({}, data, {field: item.key, listCfg: listCfg});

            refs.user_field.setState({
              rendererData: rendererData
            });
          },
          listCfg: {
            required: true,
            selectedIndex: 0,
            items: [{
              key: 'name',
              title: __.user_name
            }, {
              key: 'id',
              title: __.user_id
            }]
          }
        }
      });
    },
    onConfirm: function(refs, cb) {
      let roles = [];
      const rendererData = refs.user_field.state.rendererData;
      const fieldType = rendererData.field;
      const fieldValue = rendererData.value.trim();
      const userInDomain = checkUserInDomains(fieldType, fieldValue, currDomainUsers, obj.domain_id);
      let userId;

      if(!userInDomain) {
        cb(false, __.user_is_not_in_domain);
        return;
      }

      if(fieldType === 'id') {
        userId = fieldValue;
      } else {
        userId = getUserId(fieldValue, currDomainUsers);
      }

      refs.role.state.data.forEach(function(ele) {
        if (ele.selected) {
          roles.push(ele.id);
        }
      });
      if(roles[0]) {
        request.addUser(obj.id, userId, roles).then(() => {
          callback && callback();
          cb(true);
        }).catch((error) => {
          cb(false, getErrorMessage(error));
        });
      }
    },
    onAction: function(field, status, refs) {
      switch(field) {
        case 'role':
          let hasRole = status.data.some(item => {
            if (item.selected) {
              return true;
            }
            return false;
          });
          if(refs.user_field.state.rendererData.value.trim()) {
            refs.btn.setState({
              disabled: !hasRole
            });
          }
          break;
        case 'user_field':
          if(refs.role.state.value) {
            refs.btn.setState({
              disabled: !refs.user_field.state.rendererData.value.trim()
            });
          }
          break;
        default:
          break;
      }
    }
  };

  commonModal(props);
}

module.exports = pop;
