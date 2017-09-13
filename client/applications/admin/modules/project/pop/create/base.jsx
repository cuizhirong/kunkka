const React = require('react');
const {Modal, Button, Tab, Table, Tip} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
// let getErrorMessage = require('../../../../utils/error_message');
const Input = require('client/components/modal_common/subs/input/index');
const Textarea = require('client/components/modal_common/subs/textarea/index');
const GroupSelect = require('../../../../components/group_select/index');
const Select = require('client/components/modal_common/subs/select/index');

const TITLE = __.create + __.project;

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      displayKey: '0',
      inputType: 'name',
      userGroups: {},
      roles: {},
      userData: [],
      userGroupData: [],
      userErrorMessage: '',
      userGroupErrorMessage: '',
      createProjectErrorMessage: '',
      disabledCreate: true,
      ready: false,
      isCommiting: false
    };

    this.mask = document.querySelector('.modal-mask');

    ['onSwitchTab', 'onCancel', 'onSwitchInputType', 'onChangeName', 'onAddUserToTable', 'onAddUserGroupToTable', 'onCreateProject'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    request.getUserGroupsAndRoles().then((res) => {
      this.setState({
        ready: true,
        userGroups: res[0],
        roles: res[1].roles
      });
    }).catch((err) => {
      this.onCancel();
    });
  }

  onSwitchTab(e, status) {
    this.setState({
      displayKey: status.key
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onSwitchInputType(e) {
    let type = e.target.value;
    this.setState({
      inputType: type
    });
  }

  onChangeName() {
    this.setState({
      disabledCreate: !this.refs.name.state.value
    });
  }

  onChangeTextArea() {
    return null;
  }

  onChangeDomain() {
    return null;
  }

  renderProjectInfo(key) {
    let domains = this.state.userGroups.domains;
    return <div className={'project-info' + (key === '0' ? '' : ' hide')}>
      <Input ref="name" onAction={this.onChangeName} label={__.name} required={true} />
      <Select ref="domain" onAction={this.onChangeDomain.bind(this)} label={__.domain} data={domains} value={domains[0].id} />
      <Textarea ref="describe" onAction={this.onChangeTextArea.bind(this)} label={__.describe} />
      <div className="checkbox-wrapper">
        <input ref="activate" defaultChecked={true} type="checkbox" />&nbsp;{__.activate}
      </div>
    </div>;
  }

  clearUserErrorMessage() {
    this.setState({
      userErrorMessage: ''
    });
  }

  onAddUserToTable() {
    let state = this.state;
    let userData = state.userData;
    let data = state.roles;
    let refs = this.refs;
    let type = refs.userType.value;
    let name = refs.userInput.value;
    let roleKeys = refs.userRole.state.checkedKey;
    let roleText = '';
    let roleIDs = [];
    data.forEach((r) => {
      if(roleKeys.indexOf(r.id) > -1) {
        roleText += (roleText === '' ? '' : ', ') + r.name;
        roleIDs.push(r.id);
      }
    });

    let idChecked = false;
    let id = '';
    request.queryUserId({
      type: type,
      value: name
    }).then((res) => {
      if(type === 'name') {
        if(res.users.length > 0 && res.users[0].name === name) {
          idChecked = true;
          id = res.users[0].id;
        } else {
          this.setState({
            userErrorMessage: __.user_name_not_exist
          });
          return;
        }
      } else if (type === 'id') {
        if(res.user && res.user.id === name) {
          idChecked = true;
          id = res.user.id;
        } else {
          this.setState({
            userErrorMessage: __.user_id_not_exist
          });
          return;
        }
      }

      if(userData.findIndex((u) => u.id === id) > -1) {
        this.setState({
          userErrorMessage: __.user_already_exist
        });
        return;
      } else {
        this.clearUserErrorMessage();
      }

      let singleData = {
        id: id,
        type: type,
        userid: name,
        role: roleText,
        roleIDs: roleIDs,
        op: <i onClick={this.removeUserData.bind(this, id)} className="glyphicon icon-remove remove-user-from-project"></i>
      };
      let enable = name && roleKeys.length > 0 && idChecked;
      if(enable) {
        userData.push(singleData);
        this.setState({
          userData: userData
        }, () => {
          this.resetUserData();
          this.clearUserErrorMessage();
        });
      }
    });
  }

  removeUserData(id) {
    let data = this.state.userData;
    let index = data.findIndex((d) => d.id === id);
    data.splice(index, 1);
    this.setState({
      userData: data
    });
  }

  resetUserData() {
    this.refs.userInput.value = '';
    this.refs.userRole.setState({
      checkedKey: []
    });
  }

  renderUser(key) {
    let state = this.state;
    let types = [{
      name: 'name',
      id: 'name',
      disabled: false
    }, {
      name: 'id',
      id: 'id',
      disabled: false
    }];

    let columns = [{
      title: __.type,
      key: 'type',
      width: 50,
      dataIndex: 'type'
    }, {
      title: __.name_or_userid,
      key: 'userid',
      width: 200,
      dataIndex: 'userid'
    }, {
      title: __.role,
      key: 'role',
      width: 160,
      dataIndex: 'role'
    }, {
      title: __.operation,
      key: 'op',
      dataIndex: 'op'
    }];
    let allRoles = state.roles;

    return <div className={'user-wrapper' + (key === '1' ? '' : ' hide')}>
      <div className="user-header">
        <select ref="userType" className="user-type" onChange={this.onSwitchInputType} >
          {
            types.map(function(v) {
              return <option key={v.id} disabled={v.disabled} value={v.id}>{v.name || '(' + v.id.substr(0, 8) + ')'}</option>;
            })
          }
        </select>
        <input ref="userInput" className="user-input" placeholder={__['input_placeholder_' + state.inputType]} type="text" />
        <div className="user-role">
          <GroupSelect ref="userRole" defaultValue={__.please_select_role} data={allRoles} />
        </div>
        <Button value={__.add} type="create" onClick={this.onAddUserToTable} />
      </div>
      <div className="user-content">
        <Table column={columns} dataKey={'id'} data={state.userData} striped={true} hover={true} />
      </div>
      <div className={'tip-wrapper' + (state.userErrorMessage ? '' : ' hide')}>
        <Tip content={state.userErrorMessage} showIcon={true} type="danger" />
      </div>
    </div>;
  }

  clearUserGroupErrorMessage() {
    this.setState({
      userGroupErrorMessage: ''
    });
  }

  onAddUserGroupToTable() {
    let state = this.state;
    let userGroupData = state.userGroupData;
    let groups = state.userGroups.groups;
    let data = state.roles;
    let refs = this.refs;
    let userGroupId = refs.userGroupType.value;
    let name = groups.find((r) => r.id === userGroupId).name;
    let roleKeys = refs.userGroupRole.state.checkedKey;
    let roleText = '';
    let roleIDs = [];
    data.forEach((r) => {
      if(roleKeys.indexOf(r.id) > -1) {
        roleText += (roleText === '' ? '' : ', ') + r.name;
        roleIDs.push(r.id);
      }
    });
    if(userGroupData.findIndex((u) => u.id === userGroupId) > -1) {
      this.setState({
        userGroupErrorMessage: __.user_group_already_exist
      });
      return;
    } else {
      this.clearUserGroupErrorMessage();
    }
    let singleData = {
      id: userGroupId,
      user_group_name: name,
      role: roleText,
      roleIDs: roleIDs,
      op: <i onClick={this.removeUserGroupData.bind(this, userGroupId)} className="glyphicon icon-remove remove-user-from-project"></i>
    };
    let enable = name && roleKeys.length > 0;
    if(enable) {
      userGroupData.push(singleData);
    }
    this.setState({
      userGroupData: userGroupData
    }, () => {
      this.resetUserGroupData();
      this.clearUserGroupErrorMessage();
    });
  }

  removeUserGroupData(id) {
    let data = this.state.userGroupData;
    let index = data.findIndex((d) => d.id === id);
    data.splice(index, 1);
    this.setState({
      userGroupData: data
    });
  }

  resetUserGroupData() {
    this.refs.userGroupRole.setState({
      checkedKey: []
    });
  }

  renderUserGroup(key) {
    let state = this.state;
    let allGroups = state.userGroups.groups;
    let allRoles = state.roles;

    let columns = [{
      title: __.user_group_name,
      key: 'user_group_name',
      width: 160,
      dataIndex: 'user_group_name'
    }, {
      title: __.role,
      key: 'role',
      width: 220,
      dataIndex: 'role'
    }, {
      title: __.operation,
      key: 'op',
      dataIndex: 'op'
    }];

    return <div className={'user-group-wrapper' + (key === '2' ? '' : ' hide')}>
      <div className="user-group-header">
        <select ref="userGroupType" className="user-group-items" >
          {
            allGroups.map(function(v) {
              return <option key={v.id} value={v.id}>{v.name || '(' + v.id.substr(0, 8) + ')'}</option>;
            })
          }
        </select>
        <div className="user-group-role">
          <GroupSelect ref="userGroupRole" defaultValue={__.please_select_role} data={allRoles} />
        </div>
        <Button value={__.add} type="create" onClick={this.onAddUserGroupToTable} />
      </div>
      <div className="user-group-content">
        <Table column={columns} dataKey={'id'} data={state.userGroupData} striped={true} hover={true} />
      </div>
      <div className={'tip-wrapper' + (state.userGroupErrorMessage ? '' : ' hide')}>
        <Tip content={state.userGroupErrorMessage} showIcon={true} type="danger" />
      </div>
    </div>;
  }

  onCreateProject() {
    this.setState({
      isCommiting: true
    });
    let callback = this.props.callback;
    let refs = this.refs;
    let data = {
      name: refs.name.state.value,
      description: refs.describe.state.value,
      enabled: refs.activate.checked
    };
    let userData = this.state.userData;
    let userGroupData = this.state.userGroupData;

    data.domain_id = refs.domain.state.value;

    request.createProject(data).then((res) => {
      if(userData.length > 0 || userGroupData.length > 0) {
        request.addUserAndUserGroup(res.project.id, userData, userGroupData).then((r) => {
          this.onCancel();
          callback && callback();
        }).catch((err) => {
          this.setState({
            isCommiting: false,
            createProjectErrorMessage: __.create_project_success_but_user_fail
          });
        });
      } else {
        this.onCancel();
        callback && callback();
      }
      request.linkProject(res.project.id);
    }).catch((error) => {
      this.setState({
        isCommiting: false,
        createProjectErrorMessage: __.create_project_fail
      });
    });
  }

  render() {
    let props = this.props;
    let state = this.state;
    let items = [{
      name: '* ' + __.project_info,
      key: '0',
      default: state.displayKey === '0'
    }, {
      name: __.user,
      key: '1',
      default: state.displayKey === '1'
    }, {
      name: __['user-group'],
      key: '2',
      default: state.displayKey === '2'
    }];

    return (
      <Modal ref="modal" {...props} title={TITLE} visible={state.visible}>
        <div className="modal-bd halo-com-modal-create-project">
          {
            state.ready ? <div className="content-wrapper">
              <div className="select-tab">
                <Tab items={items} onClick={this.onSwitchTab} />
              </div>
              <div className="modal-content">
                {this.renderProjectInfo(state.displayKey)}
                {this.renderUser(state.displayKey)}
                {this.renderUserGroup(state.displayKey)}
              </div>
              <div className={'project-error-wrapper' + (state.createProjectErrorMessage ? '' : ' hide')}>
                <Tip content={state.createProjectErrorMessage} showIcon={true} type={'danger'} />
              </div>
            </div> : <div className="loading-data"><i className="glyphicon icon-loading"></i></div>
          }
        </div>
        <div className="modal-ft halo-com-modal-create-project">
          <div>
            <div className="right-side">
              <Button value={__.create} onClick={this.onCreateProject} disabled={state.disabledCreate || state.isCommiting} type="create" />
              <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
