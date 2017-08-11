let React = require('react');
let {Modal, Button, Table, Tab, Tip} = require('client/uskin/index');
let __ = require('locale/client/dashboard.lang.json');
let request = require('../../request');
let getErrorMessage = require('../../../../utils/error_message');
let Input = require('client/components/modal_common/subs/input/index');
let Select = require('client/components/modal_common/subs/select/index');

class ImageBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      displayKey: '0',
      checked: props.obj.item ? true : false,
      metaData: [],
      addMetaData: [],
      removeMetaData: [],
      errorMessage: ''
    };

    this.id = 0;

    this.mask = document.querySelector('.modal-mask');

    ['onCancel', 'onCreateImage', 'onSwitchTab', 'renderImageInfo',
    'renderMetaData', 'onChangeName', 'onAddUserToTable', 'changeType'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    if (this.props.obj.item) {
      this.refs.btn.setState({
        disabled: false
      });
    }
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onCreateImage() {
    this.refs.btn.setState({
      disabled: true
    });
    let callback = this.props.callback;
    let refs = this.refs, data = {};
    if (this.props.obj.item) {
      data = [{
        op: 'replace',
        path: '/name',
        value: refs.name.state.value
      }, {
        op: 'replace',
        path: '/min_disk',
        value: parseInt(refs.min_disk.state.value, 10)
      }, {
        op: 'replace',
        path: '/min_ram',
        value: parseInt(refs.min_ram.state.value, 10)
      }, {
        op: 'replace',
        path: '/protected',
        value: refs.protected.state.value === 'true'
      }];
      if (this.props.obj.item.description) {
        data.push({
          op: 'replace',
          path: '/description',
          value: refs.describe.state.value
        });
      } else {
        data.push({
          op: 'add',
          path: '/description',
          value: refs.describe.state.value
        });
      }
      this.state.addMetaData.forEach(addData => {
        data.push({
          op: 'add',
          path: '/' + addData.metaKey,
          value: addData.metaValue
        });
      });

      this.state.removeMetaData.forEach(removeData => {
        data.push({
          op: 'remove',
          path: '/' + removeData
        });
      });

      request.updateImage(this.props.obj.item.id, data).then(_res => {
        this.onCancel();
        callback && callback();
      }).catch(_err => {
        this.setState({
          errorMessage: getErrorMessage(_err)
        });
      });
    } else {
      let imageData = {
        type: 'import',
        input: {
          import_from: refs.url.state.value,
          import_from_format: refs.format.state.value,
          image_properties: {
            name: refs.name.state.value,
            disk_format: refs.format.state.value,
            container_format: 'bare'
          }
        }
      };
      if (refs.describe.state.value) {
        imageData.input.image_properties.description = refs.describe.state.value;
      }
      imageData.input.image_properties.visibility = this.changeType(this.props.obj.type);
      if (this.state.checked) {
        imageData.input.image_properties.min_disk = parseInt(refs.min_disk.state.value, 10) || 0;
        imageData.input.image_properties.min_ram = parseInt(refs.min_ram.state.value, 10) || 0;
        imageData.input.image_properties.protected = refs.protected.state.value === 'true';
      }
      if (this.state.checked && refs.architecture.state.value !== 'no') {
        imageData.input.image_properties.architecture = refs.architecture.state.value;
      }
      for(let i in this.state.metaData) {
        imageData.input.image_properties[this.state.metaData[i].key] = this.state.metaData[i].value;
      }
      request.createTask(imageData).then(_res => {
        this.onCancel();
        callback && callback();
      }).catch(err => {
        this.refs.btn.setState({
          disabled: false
        });
        this.setState({
          errorMessage: getErrorMessage(err)
        });
      });
    }
  }

  onSwitchTab(e, status) {
    let obj = this.props.obj.item;
    if (status.key === '1') {
      let _attrs = [
        'architecture', 'container_format', 'disk_format', 'created_at',
        'owner', 'size', 'id', 'status', 'updated_at', 'checksum',
        'visibility', 'name', 'is_public', 'protected', 'min_disk',
        'min_ram', 'file', 'locations', 'schema', 'tags', 'virtual_size',
        'kernel_id', 'ramdisk_id', 'direct_url', 'self', 'description'
      ];

      let singleData, id;
      if (this.state.metaData.length === 0 && this.state.removeMetaData.length === 0) {
        this.state.metaData = [];

        for(let key in obj) {
          if (_attrs.indexOf(key) === -1) {
            id = this.id ++;
            singleData = {
              key: key,
              id: id,
              value: obj[key],
              op: <i onClick={this.removeUserData.bind(this, id)} className="glyphicon icon-remove remove-user-from-project"></i>
            };
            this.state.metaData.push(singleData);
          }
        }
      }
    }
    this.setState({
      displayKey: status.key,
      metaData: this.state.metaData
    });
  }

  onChangeName() {
    let name = this.refs.name.state.value;
    let url = this.refs.url.state.value;
    if (this.props.obj.item) {
      if (name) {
        this.refs.btn.setState({
          disabled: false
        });
      } else {
        this.refs.btn.setState({
          disabled: true
        });
      }
    } else {
      if (name && url) {
        this.refs.btn.setState({
          disabled: false
        });
      } else {
        this.refs.btn.setState({
          disabled: true
        });
      }
    }
  }

  onChangeFormat() {}

  onAddUserToTable() {
    let metaData = this.state.metaData;
    let addMetaData = this.state.addMetaData;
    let metaKey = this.refs.metaKey.value;
    let metaValue = this.refs.metaValue.value;
    let singleData, id;
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
    let metaData = this.state.metaData,
      removeMetaData = this.state.removeMetaData;
    metaData.forEach((data, index) => {
      if (data.id === id) {
        removeMetaData.push(data.key);
        metaData.splice(index, 1);
      }
    });
    this.setState({
      metaData: metaData,
      removeMetaData: removeMetaData
    });
  }

  onCheckbox(e) {
    this.setState({
      checked: !this.state.checked
    });
  }

  renderImageInfo(key) {
    let obj = this.props.obj,
      state = this.state;
    let formatData = [{
      name: __.aki,
      key: 'aki',
      id: 'aki'
    }, {
      name: __.ami,
      key: 'ami',
      id: 'ami'
    }, {
      name: __.ari,
      key: 'ari',
      id: 'ari'
    }, {
      name: __.docker,
      key: 'docker',
      id: 'docker'
    }, {
      name: __.iso,
      key: 'iso',
      id: 'iso'
    }, {
      name: __.ova,
      key: 'ova',
      id: '5'
    }, {
      name: __.qcow2,
      key: 'qcow2',
      id: 'qcow2'
    }, {
      name: __.raw,
      key: 'raw',
      id: 'raw'
    }, {
      name: __.vdi,
      key: 'vdi',
      id: 'vdi'
    }, {
      name: __.vhd,
      key: 'vhd',
      id: 'vhd'
    }, {
      name: __.vmdk,
      key: 'vmdk',
      id: 'vmdk'
    }];
    let architectureData = [{
      name: __.no_architecture,
      id: 'no'
    }, {
      name: 'i386 for a 32-bit',
      id: 'i386'
    }, {
      name: 'x86_64 for a 64-bit',
      id: 'x86_64'
    }];
    let protectedData = [{
      name: __.yes,
      id: true
    }, {
      name: __.no,
      id: false
    }];
    return <div className={'image-info' + (key === '0' ? '' : ' hide')}>
      <Input ref="name" value={obj.item ? obj.item.name : ''} label={__.name} onAction={this.onChangeName} required={true} />
      <Input ref="describe" value={obj.item ? obj.item.description : ''} label={__.description} onAction={this.onChangeName} />
      <Input ref="url" disabled={obj.item ? true : false} value={obj.item ? obj.item.direct_url : ''} label={__.url} onAction={this.onChangeName} required={true} />
      <Select ref="format" disabled={obj.item ? true : false} onAction={this.onChangeFormat.bind(this)} label={__.format} data={formatData} value={obj.item ? obj.item.disk_format : formatData[0].id} />
      <div className="modal-row label-row">
        <div>{__.visibility}</div>&nbsp;{__[this.changeType(obj.type)]}
      </div>
      <div className="checkbox-wrapper">
        <input ref="more" checked={state.checked} onChange={this.onCheckbox.bind(this)} type="checkbox" />&nbsp;{__.more}
      </div>
      <div className={state.checked ? '' : 'hide'}>
        <Select ref="architecture" disabled={obj.item ? true : false} onAction={this.onChangeFormat.bind(this)} label={__.architecture} data={architectureData} value={obj.item ? obj.item.architecture : architectureData[0].id} />
        <Input ref="min_disk" value={obj.item ? obj.item.min_disk.toString() : ''} label={__.min_disk} onAction={this.onChangeName} />
        <Input ref="min_ram" value={obj.item ? obj.item.min_ram.toString() : ''} label={__.min_ram} onAction={this.onChangeName} />
        <Select ref="protected" onAction={this.onChangeFormat.bind(this)} label={__.protected} data={protectedData} value={obj.item ? obj.item.protected.toString() : protectedData[0].id} />
      </div>
    </div>;
  }

  changeType(type) {
    switch(type) {
      case 'image':
        return 'public';
      case 'private-image':
        return 'private';
      default:
        return '';
    }
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
        <input ref="metaKey" className="key-input" placeholder={__.key_value} type="text" />
        <input ref="metaValue" className="key-input" placeholder={__.value} type="text" />
        <Button value={__.add_data} type="create" onClick={this.onAddUserToTable} />
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
      name: '* ' + __.image + __.info,
      key: '0',
      default: state.displayKey === '0'
    }, {
      name: __.meta_data,
      key: '1',
      default: state.displayKey === '1'
    }];
    return (
      <Modal refs="modal" {...props} title={props.obj.item ? __.edit + __.image : __.create + __.image} visible={state.visible}>
        <div className="modal-bd halo-com-modal-image">
          <div className="content-wrapper">
            <div className="select-tab">
              <Tab items={items} onClick={this.onSwitchTab} />
            </div>
            <div className="modal-content">
              {this.renderImageInfo(state.displayKey)}
              {this.renderMetaData(state.displayKey)}
            </div>
            <div className={'error-wrapper' + (state.errorMessage ? '' : ' hide')}>
              <Tip content={state.errorMessage} showIcon={true} type={'danger'} />
            </div>
          </div>
        </div>
        <div className="modal-ft halo-com-modal-image">
          <div className="right-side">
            <Button ref="btn" value={props.obj.item ? __.edit : __.create} disabled={true} onClick={this.onCreateImage} type="create" />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ImageBase;
