const React = require('react');
const {Modal, Button, Table} = require('client/uskin/index');
const request = require('../../request');

const getErrorMessage = require('../../../../utils/error_message');

class ModalBase extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      disabled: true,
      visible: true,
      nameValue: '',
      error: '',
      showError: false,
      metaData: [],
      addMetaData: [],
      removeMetaData: []
    };

    ['onConfirm', 'onCancel', 'onAddUserToTable', 'renderModifyMetaData'].forEach(f => {
      this[f] = this[f].bind(this);
    });
  }

  componentWillMount() {
    let singleData = {}, id;
    let addMetaData = this.state.addMetaData;
    let metaData = this.state.metaData;
    request.containerHeaders({
      name: this.props.obj.name
    }).then((item) => {
      for(let key in item) {
        let metaKey = key.substr('x-container-meta-'.length, key.length);
        id = metaKey + Math.random();
        singleData = {
          key: metaKey,
          id: id,
          value: item[key],
          op: <i onClick={this.removeUserData.bind(this, metaKey)} className="glyphicon icon-remove remove-user-from-project"></i>
        };

        let metaValue = item[key];
        metaData.push(singleData);
        addMetaData.push({metaKey, metaValue});
      }
      this.setState({
        metaData: metaData,
        addMetaData: addMetaData
      });
    });
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
        op: <i onClick={this.removeUserData.bind(this, metaKey)} className="glyphicon icon-remove remove-user-from-project"></i>
      };
      addMetaData.push({metaKey, metaValue});
      metaData.push(singleData);
      this.setState({
        disabled: false
      });
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
    let addMetaData = this.state.addMetaData;
    let removeMetaData = this.state.removeMetaData;
    metaData.forEach((data, index) => {
      if (data.key === id) {
        metaData.splice(index, 1);
        removeMetaData.push(data.key);
      }
    });
    addMetaData.forEach((item, index) => {
      if(item.metaKey === id) {
        addMetaData.splice(index, 1);
      }
    });

    this.setState({
      metaData: metaData,
      addMetaData: addMetaData,
      removeMetaData: removeMetaData
    });
    this.setState({
      disabled: false
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
    let that = this;
    let metaArr = [];
    let deleteMetaArr = [];
    let params = {
      Bucket: this.props.obj.name
    };
    this.state.metaData.forEach(item => {
      let metaKeys = 'X-Container-Meta-' + item.key;
      params[metaKeys] = item.value;
      metaArr.push(metaKeys);
    });

    this.state.removeMetaData.forEach(i => {
      let deleteMetaKeys = 'X-Remove-Container-Meta-' + i;
      params[deleteMetaKeys] = i.value;
      deleteMetaArr.push(deleteMetaKeys);
    });

    request.modifyBucket(params, deleteMetaArr).then((res) => {
      request.modifyBucket(params, metaArr).then((_res) => {
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
    });
    this.setState({
      disabled: true
    });
  }

  renderModifyMetaData(key) {
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

    return <div className="meta-data">
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
    return (
       <Modal
        ref="modal"
        {...props}
        title={__.modify + __.meta_data}
        visible={state.visible}
        width={540}
        onCancel={this.onCancel}
        onConfirm={this.onConfirm}>
        <div className="modal-bd halo-com-modal-modify-bucket">
          <div className="modal-content">
            {this.renderModifyMetaData(state.displayKey)}
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-bucket">
          <Button ref="btn" value={__.modify} disabled={state.disabled} onClick={this.onConfirm} />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
