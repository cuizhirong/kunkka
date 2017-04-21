var React = require('react');
var {Modal, Button, Table, Tab, Tip} = require('client/uskin/index');
var __ = require('locale/client/admin.lang.json');
var request = require('../../request');
var getErrorMessage = require('../../../../utils/error_message');
var Input = require('client/components/modal_common/subs/input/index');
var Select = require('client/components/modal_common/subs/select/index');

class ImageBase extends React.Component {

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

    this.mask = document.querySelector('.modal-mask');

    ['onCancel', 'onCreateImage', 'onSwitchTab', 'renderImageInfo', 'renderMetaData', 'onChangeName', 'onAddUserToTable'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    if (this.props.obj) {
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
    let refs = this.refs, data = [];
    if (this.props.obj) {
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
      if (this.props.obj.description) {
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

      request.updateImage(this.props.obj.id, data).then(_res => {
        this.onCancel();
        callback && callback();
      }).catch(_err => {
        this.setState({
          errorMessage: getErrorMessage(_err)
        });
      });
    } else {
      data = {
        name: refs.name.state.value,
        disk_format: refs.format.state.value,
        description: refs.describe.state.value,
        image_url: refs.url.state.value,
        source_type: 'url'
      };
      if (this.state.checked) {
        data.min_disk = parseInt(refs.min_disk.state.value, 10) || 0;
        data.min_ram = parseInt(refs.min_ram.state.value, 10) || 0;
        data.protected = refs.protected.state.value;
      }
      if (HALO.user.roles.indexOf('admin') > -1) {
        data.visibility = 'public';
      } else {
        data.visibility = 'private';
      }
      if (this.state.checked && refs.architecture.state.value !== __.no_architecture) {
        data.architecture = refs.architecture.state.value;
      }
      for(let i in this.state.metaData) {
        data[this.state.metaData[i].key] = this.state.metaData[i].value;
      }
      request.createImage(data).then(res => {
        this.onCancel();
        callback && callback();
      }).catch(err => {
        this.setState({
          errorMessage: getErrorMessage(err)
        });
      });
    }
  }

  onSwitchTab(e, status) {
    var obj = this.props.obj;
    if (status.key === '1') {
      var _attrs = [
        'architecture', 'container_format', 'disk_format', 'created_at',
        'owner', 'size', 'id', 'status', 'updated_at', 'checksum',
        'visibility', 'name', 'is_public', 'protected', 'min_disk',
        'min_ram', 'file', 'locations', 'schema', 'tags', 'virtual_size',
        'kernel_id', 'ramdisk_id', 'image_url', 'direct_url', 'self'
      ];

      let singleData;
      if (this.state.metaData.length === 0) {
        this.state.metaData = [];

        for(let key in obj) {
          if (_attrs.indexOf(key) === -1) {
            singleData = {
              key: key,
              value: obj[key],
              op: <i onClick={this.removeUserData.bind(this, key)} className="glyphicon icon-remove remove-user-from-project"></i>
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
    if (this.props.obj) {
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

    let singleData = {
      key: metaKey,
      value: metaValue,
      op: <i onClick={this.removeUserData.bind(this, metaKey)} className="glyphicon icon-remove remove-user-from-project"></i>
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

  removeUserData(key) {
    let metaData = this.state.metaData,
      removeMetaData = this.state.removeMetaData;
    metaData.forEach((data, index) => {
      if (data.key === key) {
        removeMetaData.push(key);
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
    var obj = this.props.obj;
    var formatData = [{
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
    var architectureData = [{
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
    var state = this.state;
    return <div className={'image-info' + (key === '0' ? '' : ' hide')}>
      <Input ref="name" value={obj ? obj.name : ''} label={__.name} onAction={this.onChangeName} required={true} />
      <Input ref="describe" value={obj ? obj.description : ''} label={__.describe} onAction={this.onChangeName} />
      <Input ref="url" disabled={obj ? true : false} value={obj ? obj.image_url : ''} label={__.url} onAction={this.onChangeName} required={true} />
      <Select ref="format" disabled={obj ? true : false} onAction={this.onChangeFormat.bind(this)} label={__.format} data={formatData} value={obj ? obj.disk_format : formatData[0].id} />
      <div className="checkbox-wrapper">
        <input ref="more" checked={state.checked} onChange={this.onCheckbox.bind(this)} type="checkbox" />&nbsp;{__.more}
      </div>
      <div className={state.checked ? '' : 'hide'}>
        <Select ref="architecture" disabled={obj ? true : false} onAction={this.onChangeFormat.bind(this)} label={__.architecture} data={architectureData} value={obj ? obj.architecture : architectureData[0].id} />
        <Input ref="min_disk" value={obj ? obj.min_disk.toString() : ''} label={__.min_disk} onAction={this.onChangeName} />
        <Input ref="min_ram" value={obj ? obj.min_ram.toString() : ''} label={__.min_ram} onAction={this.onChangeName} />
        <Select ref="protected" onAction={this.onChangeFormat.bind(this)} label={__.protected} data={protectedData} value={obj ? obj.protected.toString() : protectedData[0].id} />
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
        <Table column={columns} dataKey={'key'} data={state.metaData} striped={true} hover={true} />
      </div>
    </div>;
  }

  render() {
    var props = this.props,
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
      <Modal refs="modal" {...props} title={props.obj ? __.edit + __.image : __.create + __.image} visible={state.visible}>
        <div className="modal-bd halo-com-modal-create-image">
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
        <div className="modal-ft halo-com-modal-create-image">
          <div className="right-side">
            <Button ref="btn" value={props.obj ? __.edit : __.create} disabled={true} onClick={this.onCreateImage} type="create" />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ImageBase;
