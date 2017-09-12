const React = require('react');
const {Modal, Button, Table, Tab, Tip} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
const getErrorMessage = require('../../../../utils/error_message');
const Input = require('client/components/modal_common/subs/input/index');

class FlavorBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayKey: '0',
      checked: props.obj ? true : false,
      metaData: [],
      addMetaData: [],
      removeMetaData: [],
      errorMessage: ''
    };
    this.id = 0;

    this.mask = document.querySelector('.modal-mask');
    ['onCancel', 'onChangeName', 'renderFlavorInfo', 'renderMetaData', 'onSwitchTab', 'onAddUserToTable', 'onCreateFlavor'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }
  componentDidMount() {
    if (this.props.obj) {
      this.refs.btn.setState({
        disabled: false
      });
    }
  }
  onCheckbox(e) {
    this.setState({
      checked: !this.state.checked
    });
  }

  onChangeName() {
    let name = this.refs.name.state.value;
    let vcpu = this.refs.vcpu.state.value;
    let memoryGb = this.refs.memory_gb.state.value;
    let capacityGb = this.refs.capacity_gb.state.value;
    let regex = /^[a-zA-Z0-9_.]{1,}$/;
    if (regex.exec(name)) {
      this.refs.name.setState({
        error: false
      });
      if (name && vcpu && memoryGb && capacityGb) {
        this.refs.btn.setState({
          disabled: false
        });
      } else {
        this.refs.btn.setState({
          disabled: true
        });
      }
    } else {
      this.refs.name.setState({
        error: true
      });
      this.refs.btn.setState({
        disabled: true
      });
    }
  }
  onCreateFlavor() {
    this.refs.btn.setState({
      disabled: true
    });
    let callback = this.props.callback;
    let refs = this.refs;
    let flavorData = {
      flavor: {
        name: refs.name.state.value,
        ram: Number(refs.memory_gb.state.value) * 1024,
        vcpus: Number(refs.vcpu.state.value),
        disk: Number(refs.capacity_gb.state.value)
      }
    };
    let flavorMetaData = {
      'extra_specs': {}
    };
    refs.id.state.value && (flavorData.flavor.id = refs.id.state.value);
    refs.rx_factor.state.value && (flavorData.flavor.rxtx_factor = refs.rx_factor.state.value);
    refs.temporary_disk.state.value && (flavorData.flavor['OS-FLV-EXT-DATA:ephemeral'] = refs.temporary_disk.state.value);
    refs.swap_disk.state.value && (flavorData.flavor.swap = refs.swap_disk.state.value);
    for(let i in this.state.metaData) {
      flavorMetaData.extra_specs[this.state.metaData[i].key] = this.state.metaData[i].value.toString();
    }
    request.createFlavor(flavorData).then((res) => {
      if(res.flavor.id) {
        request.createExtraSpecs(res.flavor.id, flavorMetaData).then((_res) => {
          this.onCancel();
          callback && callback();
        }).catch((error) => {
          this.refs.btn.setState({
            disabled: false
          });
          this.setState({
            errorMessage: getErrorMessage(error)
          });
        });
      }
    }).catch((err) => {
      this.refs.btn.setState({
        disabled: false
      });
      this.setState({
        errorMessage: getErrorMessage(err)
      });
    });
  }

  onSwitchTab(e, status) {
    this.setState({
      displayKey: status.key,
      metaData: this.state.metaData
    });
  }

  onAddUserToTable() {
    let metaData = this.state.metaData;
    let addMetaData = this.state.addMetaData;
    let metaKey = this.refs.metaKey.value;
    let metaValue = this.refs.metaValue.value;
    let singleData = {}, id;
    if (metaKey) {
      id = this.id ++;
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

  renderFlavorInfo(key) {
    let obj = this.props.obj;
    let state = this.state;
    return <div className={'flavor-info' + (key === '0' ? '' : ' hide')}>
      <Input ref="name" value={obj ? obj.name : ''} __={__} label={__.name} onAction={this.onChangeName} required={true} tip_info="flavor_name_tip"/>
      <Input ref="vcpu" value={obj ? obj.vcpu : ''} label={__.vcpu} onAction={this.onChangeName} required={true}/>
      <Input ref="memory_gb" value={obj ? obj.memory_gb : ''} label={__.memory_gb} onAction={this.onChangeName} required={true}/>
      <Input ref="capacity_gb" value={obj ? obj.capacity_gb : ''} label={__.capacity_gb} onAction={this.onChangeName} required={true}/>
      <Input ref="id" value={obj ? obj.id : ''} label={__.id} onAction={this.onChangeName}/>
      <div className="checkbox-wrapper">
        <input ref="more" checked={state.checked} onChange={this.onCheckbox.bind(this)} type="checkbox" />&nbsp;{__.more}
      </div>
      <div className={state.checked ? '' : 'hide'}>
        <Input ref="temporary_disk" value={obj ? obj.temporary_disk : ''} label={__.temporary_disk} onAction={this.onChangeName} />
        <Input ref="swap_disk" value={obj ? obj.swap_disk : ''} label={__.swap_disk} onAction={this.onChangeName} />
        <Input ref="rx_factor" value={obj ? obj.rx_factor : ''} label={__.rx_factor} onAction={this.onChangeName} />
      </div>
    </div>;
  }

  renderMetaData(key) {
    let state = this.state;
    let columns = [{
      title: __.key,
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
        <input ref="metaKey" className="key-input" placeholder={__.key} type="text" />
        <input ref="metaValue" className="key-input" placeholder={__.value} type="text" />
        <Button value={__.add} type="create" onClick={this.onAddUserToTable} />
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
      name: '* ' + __.flavor + __.info,
      key: '0',
      default: state.displayKey === '0'
    }, {
      name: __.meta_data,
      key: '1',
      default: state.displayKey === '1'
    }];
    return (
      <Modal refs="modal" {...props} title={__.create + __.flavor} visible={state.visible}>
        <div className="modal-bd halo-com-modal-create-flavor">
          <div className="content-wrapper">
            <div className="select-tab">
              <Tab items={items} onClick={this.onSwitchTab} />
            </div>
            <div className="modal-content">
              {this.renderFlavorInfo(state.displayKey)}
              {this.renderMetaData(state.displayKey)}
            </div>
            <div className={'error-wrapper' + (state.errorMessage ? '' : ' hide')}>
              <Tip content={state.errorMessage} showIcon={true} type={'danger'} />
            </div>
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-flavor">
          <div className="right-side">
            <Button ref="btn" value={__.create} disabled={true} onClick={this.onCreateFlavor} type="create" />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = FlavorBase;
