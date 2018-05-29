const React = require('react');
const {Modal, Button, Tab, Table} = require('client/uskin/index');
const request = require('../../request');

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
      disabled: true,
      visible: true,
      accessTypes: accessTypes,
      accessType: accessTypes[0].key,
      nameValue: '',
      error: '',
      showError: false,
      metaData: [],
      addMetaData: [],
      removeMetaData: []
    };

    ['onConfirm', 'onCancel', 'renderBucketInfo', 'renderMetaData', 'onSwitchTab', 'onAddUserToTable', 'onChangeName'].forEach(f => {
      this[f] = this[f].bind(this);
    });
  }

  onSwitchTab(e, status) {
    this.setState({
      displayKey: status.key,
      metaData: this.state.metaData
    });
  }

  onChangeAccessTypes(key, e) {
    this.setState({
      accessType: key
    });
  }
  onChangeName(e) {
    this.setState({
      nameValue: e.target.value
    });
    let rep = /^([^/]{3,})$/;
    if(!rep.test(e.target.value) && e.target.value !== '') {
      this.setState({
        disabled: true
      });
    } else {
      this.setState({
        disabled: false
      });
    }
  }

  onAddUserToTable() {
    let metaData = this.state.metaData;
    let addMetaData = this.state.addMetaData;
    let metaKey = this.refs.metaKey.value;
    let metaValue = this.refs.metaValue.value;
    let singleData = {}, id;
    if (metaKey) {
      id = metaKey + Math.random();
      singleData = {
        key: metaKey,
        id: id,
        value: metaValue,
        op: <i onClick={this.removeUserData.bind(this, id)} className="glyphicon icon-remove remove-user-from-project"></i>
      };
      addMetaData.push({metaKey, metaValue});
      metaData.push(singleData);
      this.setState({
        metaData: metaData,
        addMetaData: addMetaData
      }, () => {
        this.refs.metaKey.value = '';
        this.refs.metaValue.value = '';
      });
    }
  }

  removeUserData(id) {
    let metaData = this.state.metaData;
    metaData.forEach((data, index) => {
      if (data.id === id) {
        metaData.splice(index, 1);
      }
    });
    this.setState({
      metaData: metaData
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onConfirm() {
    if(this.state.disabled) {
      return;
    }
    let params = {};
    let that = this;
    request.listBuckets().then(buckets => {
      let bucketExist = buckets.some(b => {
        return (b.name === this.state.nameValue);
      });

      if(bucketExist) {
        this.setState({
          showError: true
        });
        this.setState({
          disabled: true
        });
      } else {
        if (this.state.accessType === 'public') {
          params = {
            Bucket: this.state.nameValue,
            type: 'public'
          };
        } else {
          params = {
            Bucket: this.state.nameValue,
            type: 'private'
          };
        }
        let metaArr = [];
        this.state.addMetaData.forEach(item => {
          let metaKeys = 'X-Container-Meta-' + item.metaKey;
          params[metaKeys] = item.metaValue;
          metaArr.push(metaKeys);
        });

        request.createBucket(params, metaArr).then((res) => {
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
      }
    });
    this.setState({
      disabled: true
    });
  }

  renderBucketInfo(key) {
    let state = this.state;
    let rep = /^([^/]{3,})$/;
    let className = 'input-name';
    if(!rep.test(this.state.nameValue) && this.state.nameValue !== '') {
      className += ' error';
    } else {
      className = className;
    }
    return (<div className={'bucket-info' + (key === '0' ? '' : ' hide')}>
      <div className="file-name">
        <p><strong>* </strong>{__.container_name}</p>
        <input className={className} ref="name" type="text" value={state.nameValue} onChange={this.onChangeName}/>
        <div className="name-error">{__.name_error}</div>
      </div>
      <div ref="type" className="object-row row-tab row-tab-single" key="types">
        <div className="object-modal-label">
          {__.container_access}
        </div>
        <div className="object-modal-data">
          {
            state.accessTypes.map((ele) =>
              <a key={ele.key}
                className={ele.key === state.accessType ? 'selected' : ''}
                onClick={ele.key === state.accessType ? null : this.onChangeAccessTypes.bind(this, ele.key)}>
                {ele.value}
              </a>
            )
          }
        </div>
      </div>
      <div className="intro-tip">{__.container_intro}</div>
      <div className="tip obj-tip-warning">
        <div className="obj-tip-icon">
          <strong>
            <i className="glyphicon icon-status-warning" />
          </strong>
        </div>
        <div className="obj-tip-content" style={{width: 370 + 'px'}}>
          {__.container_tip}
        </div>
      </div>
    </div>);
  }

  renderMetaData(key) {
    let state = this.state;
    let columns = [{
      title: __.keys,
      key: 'key',
      dataIndex: 'key'
    }, {
      title: __.value,
      key: 'value',
      dataIndex: 'value'
    }, {
      title: __.operation,
      key: 'op',
      dataIndex: 'op'
    }];

    return <div className={'meta-data' + (key === '1' ? '' : ' hide')}>
      <div className="meta-header">
        <input ref="metaKey" className="key-input" placeholder={__.keys} type="text" />
        <input ref="metaValue" className="key-input" placeholder={__.value} type="text" />
        <Button value={__.added} type="create" onClick={this.onAddUserToTable} />
      </div>
      <div className="meta-content">
        <Table column={columns} dataKey={'id'} data={state.metaData} striped={true} hover={true} />
      </div>
    </div>;
  }

  render() {
    let props = this.props,
      state = this.state;
    let items = [{
      name: '* ' + __.container + __.info,
      key: '0',
      default: state.displayKey === '0'
    }, {
      name: __.meta_data,
      key: '1',
      default: state.displayKey === '1'
    }];
    return (
       <Modal ref="modal" {...props} title={__.create_bucket} visible={state.visible} width={540} onCancel={this.onCancel} onConfirm={this.onConfirm}>
        <div className="modal-bd halo-com-modal-create-bucket">
          <div className="select-tab">
            <Tab items={items} onClick={this.onSwitchTab} />
          </div>
          <div className="modal-content">
            {this.renderBucketInfo(state.displayKey)}
            {this.renderMetaData(state.displayKey)}
            {state.showError ? <div className="tip obj-tip-error">
              <div className="obj-tip-icon">
                <strong>
                  <i className="glyphicon icon-status-warning" />
                </strong>
              </div>
              <div className="obj-tip-content" style={{width: 370 + 'px'}}>
                {__.name_conflict}
              </div>
            </div> : null}
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-bucket">
          <Button ref="btn" value={__.create} disabled={state.disabled} type="create" onClick={this.onConfirm} />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
