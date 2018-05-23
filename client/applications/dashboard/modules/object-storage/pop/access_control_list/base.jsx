const React = require('react');
const {Modal, Button, Tab, Table} = require('client/uskin/index');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

class ModalBase extends React.Component {
  constructor(props) {
    super(props);

    let accessTypes = [{
      value: __.private,
      key: 'private'
    }, {
      value: __.public,
      key: 'public'
    }];

    this.state = {
      displayKey: '0',
      disabled: false,
      visible: true,
      accessTypes: accessTypes,
      accessType: accessTypes[0].key,
      nameValue: '',
      error: '',
      showError: false,
      delayed: true,
      accountData: [],
      addAccountData: [],
      removeAccountData: [],
      readcheck: false
    };

    ['onConfirm', 'onCancel', 'onSwitchTab', 'onAddUserToTable', 'removeUserData'].forEach(f => {
      this[f] = this[f].bind(this);
    });
  }

  componentWillMount() {
    let id, reArr = [], wrArr = [], ccc = [], reArrtrim = [], wrArrtrim = [], addAccountData = [], accountData = [], projectIdKey, resValue;
    let xcontainerread = {};
    request.containerPermissionHeaders({
      name: this.props.obj.name
    }).then((res) => {
      reArr = res['x-container-read'] !== null ? res['x-container-read'].split(',') : [];
      wrArr = res['x-container-write'] !== null ? res['x-container-write'].split(',') : [];
      if(reArr.toString().indexOf('.r:*') > -1) {
        this.refs.everyoneRead.checked = true;
        reArr.splice(reArr.indexOf('.r:*'), 1);
      }

      if(wrArr.toString().indexOf('.r:*') > -1) {
        this.refs.everyoneWrite.checked = true;
        wrArr.splice(wrArr.indexOf('.r:*'), 1);
      }

      if(reArr !== [] || wrArr !== []) {
        wrArr.forEach(i => {
          i = i.trim();
          wrArrtrim.push(i);
        });
        reArr.forEach(ii => {
          ii = ii.trim();
          reArrtrim.push(ii);
        });

        let result = [];
        let wrString = wrArrtrim.toString();
        for(let i = 0; i < reArrtrim.length; i++) {
          reArrtrim[i] = reArrtrim[i].trim();
          if(wrString.indexOf(reArrtrim[i].toString()) > -1){
            ccc = reArrtrim.splice(i, 1);
            ccc = ccc.toString();
            result.push(ccc);
          }
        }
        for(let j = 0; j < result.length; j++) {
          result[j] = result[j].trim();
          if(wrArrtrim.indexOf(result[j].toString()) > -1){
            wrArrtrim.splice(j, 1);
          }
        }

        reArrtrim.forEach(itemr => {
          id = itemr + Math.random();
          xcontainerread = {
            project_id: itemr,
            id: id,
            op: <i onClick={this.removeUserData.bind(this, itemr)} className="glyphicon icon-remove remove-user-from-project"></i>,
            read: __.yes,
            write: __.no
          };
          resValue = '2';
          projectIdKey = itemr;
          addAccountData.push({projectIdKey, resValue});

          accountData.push(xcontainerread);
        });
        wrArrtrim.forEach(itemw => {
          id = itemw + Math.random();
          xcontainerread = {
            project_id: itemw,
            id: id,
            op: <i onClick={this.removeUserData.bind(this, itemw)} className="glyphicon icon-remove remove-user-from-project"></i>,
            read: __.no,
            write: __.yes
          };
          resValue = '3';
          projectIdKey = itemw;
          addAccountData.push({projectIdKey, resValue});
          accountData.push(xcontainerread);
        });
        result.forEach(item => {
          id = item + Math.random();
          xcontainerread = {
            project_id: item,
            id: id,
            op: <i onClick={this.removeUserData.bind(this, item)} className="glyphicon icon-remove remove-user-from-project"></i>,
            read: __.yes,
            write: __.yes
          };
          resValue = '1';
          projectIdKey = item;
          addAccountData.push({projectIdKey, resValue});
          accountData.push(xcontainerread);
        });
      }

      this.setState({
        accountData: accountData,
        addAccountData: addAccountData
      });
    });
  }

  onSwitchTab(e, status) {
    this.setState({
      displayKey: status.key,
      accountData: this.state.accountData
    });
  }

  onAddUserToTable() {
    let accountData = this.state.accountData;
    let addAccountData = this.state.addAccountData;
    let projectIdKey = this.refs.projectIdKey.value;
    let singleData = {}, id, resValue;
    if (projectIdKey) {
      id = projectIdKey + Math.random();
      singleData = {
        project_id: projectIdKey,
        id: id,
        op: <i onClick={this.removeUserData.bind(this, id)} className="glyphicon icon-remove remove-user-from-project"></i>
      };
      singleData.read = this.refs.readPermission.checked ? __.yes : __.no;
      singleData.write = this.refs.writePermission.checked ? __.yes : __.no;
      if(this.refs.readPermission.checked) {
        if(this.refs.writePermission.checked) {
          resValue = '1';
        } else {
          resValue = '2';
        }
      } else {
        if(this.refs.writePermission.checked) {
          resValue = '3';
        } else {
          resValue = '4';
        }
      }
      addAccountData.push({projectIdKey, resValue});
      accountData.push(singleData);
      this.setState({
        disabled: false
      });
      this.setState({
        accountData: accountData,
        addAccountData: addAccountData
      }, () => {
        this.refs.projectIdKey.value = '';
        this.refs.readPermission.value = '';
        this.refs.writePermission.value = '';
      });
    }
  }

  removeUserData(id) {
    let accountData = this.state.accountData;
    let addAccountData = this.state.addAccountData;
    accountData.forEach((data, index) => {
      if (data.project_id === id) {
        accountData.splice(index, 1);
      }
    });
    addAccountData.forEach((data, index) => {
      if (data.projectIdKey === id) {
        addAccountData.splice(index, 1);
      }
    });
    this.setState({
      accountData: accountData,
      addAccountData: addAccountData
    });
    this.setState({
      disabled: false
    });
  }

  onConfirm() {
    if(this.state.disabled) {
      return;
    }
    let that = this;
    let resValue, projectIdKey;
    if(this.refs.everyoneRead.checked) {
      projectIdKey = 'readeveryone';
      resValue = 'read.r:*';
      this.state.addAccountData.push({projectIdKey, resValue});
    }
    if(this.refs.everyoneWrite.checked) {
      projectIdKey = 'writeeveryone';
      resValue = 'write.r:*';
      this.state.addAccountData.push({projectIdKey, resValue});
    }
    request.aclBuckets(this.props.obj.name, this.state.addAccountData).then(() => {
      that.setState({
        visible: false
      });
      that.props.callback && that.props.callback();
    }).catch((err) => {
      let errorTip = getErrorMessage(err);
      this.setState({
        showError: true,
        error: errorTip
      });
    });
    this.setState({
      disabled: true
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  renderPublicAccess(key) {
    let props = this.props;
    return (<div className={'public-access' + (key === '0' ? '' : ' hide')}>
      <p className="everyone">{__.everybody}</p>
      <div className="everyone-read"><input ref="everyoneRead" type="checkbox" name="access" value={__.read_permission} /><span>{__.read_permission}</span><div className="glyphicon icon-help"><p>{__.everyone_read_permission_tip}<span className="rectangular"></span></p></div></div>
      <div className="everyone-write"><input ref="everyoneWrite" type="checkbox" name="access" value={__.write_permission} /><span>{__.write_permission}</span><div className="glyphicon icon-help"><p>{__.everyone_write_permission_tip}<span className="rectangular"></span></p></div></div>
      <div className={'tip obj-tip-warning' + (props.obj !== null ? '' : ' hide') }>
        <div className="obj-tip-icon">
          <strong>
            <i className="glyphicon icon-status-warning" />
          </strong>
        </div>
        <div className="obj-tip-content" style={{width: 320 + 'px'}}>
          {__.publicAccessTip}
        </div>
      </div>
    </div>);
  }

  renderAccountAccess(key) {
    let state = this.state;

    let columns = [{
      title: __.project_id,
      key: 'project_id',
      dataIndex: 'project_id'
    }, {
      title: __.read_permission,
      key: 'read',
      dataIndex: 'read'
    }, {
      title: __.write_permission,
      key: 'write',
      dataIndex: 'write'
    }, {
      title: __.operation,
      key: 'op',
      dataIndex: 'op'
    }];

    return (<div className={'other-account' + (key === '1' ? '' : ' hide')}>
      <div className="other-account-header">
        <input ref="projectIdKey" className="projectId-input" placeholder={__.project_id} type="text" />
        <div className="permission"><input ref="readPermission" name="account" type="checkbox" value={__.read_permission} /><span>{__.read_permission}</span><div className="glyphicon icon-help"><p>{__.read_permission_tip}<span className="rectangular"></span></p></div></div>
        <div className="permission"><input ref="writePermission" name="account" type="checkbox" value={__.write_permission} /><span>{__.write_permission}</span><div className="glyphicon icon-help"><p>{__.write_permission_tip}<span className="rectangular"></span></p></div></div>
        <Button value={__.added} type="create" onClick={this.onAddUserToTable} />
      </div>
      <div className="other-account-content">
        <Table column={columns} dataKey={'id'} data={state.accountData} striped={true} hover={true} />
      </div>
    </div>);
  }

  render() {
    let props = this.props,
      state = this.state;
    let items = [{
      name: __.public_access,
      key: '0',
      default: state.displayKey === '0'
    }, {
      name: __.other_accout_access,
      key: '1',
      default: state.displayKey === '1'
    }];
    return (
       <Modal
        ref="modal"
        {...props}
        title={__.access_control_list}
        visible={state.visible} width={540}
        onCancel={this.onCancel}
        onConfirm={this.onConfirm}>
        <div className="modal-bd halo-com-modal-access_control_list">
          <div className="select-tab">
            <Tab items={items} onClick={this.onSwitchTab} />
          </div>
          <div className="modal-content">
            {this.renderPublicAccess(state.displayKey)}
            {this.renderAccountAccess(state.displayKey)}
          </div>
        </div>
        <div className="modal-ft halo-com-modal-access_control_list">
          <Button ref="btn" value={__.save} disabled={state.disabled} onClick={this.onConfirm} />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
