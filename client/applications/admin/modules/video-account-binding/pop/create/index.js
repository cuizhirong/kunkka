const commonModal = require('client/components/modal_common/index');
const renderer = require('./user_field');
const config = require('./config.json');
const request = require('../../request');
const __ = require('locale/client/admin.lang.json');
const getErrorMessage = require('client/applications/admin/utils/error_message');

function checkUserInKeystone(field, value, users) {
  let inKeystone;
  let currUser = users.find((user) => {
    return user[field] === value;
  });

  if(currUser !== undefined) {
    inKeystone = true;
  } else {
    inKeystone = false;
  }

  return inKeystone;
}

function getUserId(userName, users) {
  const user = users.find((u) => {
    return u.name === userName;
  });
  return user.id;
}

function getUserName(userId, users) {
  const user = users.find((u) => {
    return u.id === userId;
  });
  return user.name;
}


function pop(obj, callback) {
  const operationType = obj ? 'update' : 'create';
  let initialUsername = ''; // 如果是修改操作需要设置一下输入框的初始值
  let allUsers = [];

  if(operationType === 'create') {
    config.title[0] = 'create';
  } else {
    config.title[0] = 'modify';
    initialUsername = obj.username;
  }

  let props = {
    __: __,
    config: config,
    onInitialize: function(refs) {
      request.getUsers().then((res) => {
        allUsers = res.users;
      });

      if(operationType === 'update') {
        refs.video_account_id.setState({
          value: obj.account_id
        });
      }

      refs.user_field.setState({
        renderer: renderer,
        rendererData: {
          field: 'name',
          value: initialUsername,
          error: false,
          onValueChange: (data, value) => {
            const rendererData = Object.assign({}, data, { value: value });
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
      const selectedField = refs.user_field.state.rendererData.field;
      const userFieldValue = refs.user_field.state.rendererData.value.trim();
      const accountId = refs.video_account_id.state.value.trim();

      // empty check
      if(!userFieldValue) {
        refs.user_field.setState({
          rendererData: Object.assign({}, refs.user_field.state.rendererData, { error: true })
        });
        cb(false, __.cc_video_account_binding_error_msg.replace(/\{0\}/, __['user_' + selectedField]));
      } else if(!accountId) {
        refs.video_account_id.setState({
          error: true
        });
        cb(false, __.cc_video_account_binding_error_msg.replace(/\{0\}/, __.video_account_id));
        return;
      } else {
        refs.user_field.setState({
          rendererData: Object.assign({}, refs.user_field.state.rendererData, { error: false })
        });
        refs.video_account_id.setState({
          error: false
        });
      }


      // user in keystone check
      const userInKeystone = checkUserInKeystone(selectedField, userFieldValue, allUsers);
      let userId, username;

      if(!userInKeystone) {
        cb(false, __.user_field_input_error_msg.replace(/\{0\}/, __['user_' + selectedField]));
        return;
      }

      if(selectedField === 'id') {
        userId = userFieldValue;
        username = getUserName(userFieldValue, allUsers);
      } else {
        userId = getUserId(userFieldValue, allUsers);
        username = userFieldValue;
      }

      const data = {
        username: username,
        user_id: userId,
        account_id: refs.video_account_id.state.value
      };

      refs.btn.setState({
        disabled: true
      });

      const reqFnName = operationType === 'create' ? 'createAccountBinding' : 'updateAccountBinding';
      const mapId = operationType === 'create' ? null : obj.id;

      request[reqFnName](data, mapId).then((res)=>{
        callback && callback();
        cb(true);
      }).catch((err) => {
        cb(false, getErrorMessage(err));
      }).finally(() => {
        refs.btn.setState({
          disabled: false
        });
      });
    },
    onAction: function(field, status, refs) {
      const userFieldValue = refs.user_field.state.rendererData.value.trim();
      const accountId = refs.video_account_id.state.value.trim();
      let hasEmptyField = true;

      if(userFieldValue && accountId) {
        hasEmptyField = false;
      }

      switch(field) {
        case 'user_field':
        case 'video_account_id':
          refs.btn.setState({
            disabled: hasEmptyField
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
