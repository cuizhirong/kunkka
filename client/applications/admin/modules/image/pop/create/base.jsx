const React = require('react');
const {Modal, Button, Table, Tab, Tip} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
const getErrorMessage = require('../../../../utils/error_message');
const ImageInfo = require('./image_info');

class ImageBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayKey: '0',
      checked: props.obj.item ? true : false,
      metaData: [],
      addMetaData: [],
      btnEnable: true,
      item: props.obj.item,
      errorMessage: '',
      removeMetaData: []
    };

    this.id = 0;

    this.mask = document.querySelector('.modal-mask');

    ['onCancel', 'onCreateImage', 'onSwitchTab', 'renderMetaData',
    'onChangeName', 'onAddUserToTable'].forEach((func) => {
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
    let refs = this.refs, data = {}, that = this;
    let imageInfo = refs.image_info.refs;
    if (this.props.obj.item) {
      data = [{
        op: 'replace',
        path: '/name',
        value: imageInfo.name.state.value
      }, {
        op: 'replace',
        path: '/min_disk',
        value: parseInt(imageInfo.min_disk.state.value, 10)
      }, {
        op: 'replace',
        path: '/min_ram',
        value: parseInt(imageInfo.min_ram.state.value, 10)
      }, {
        op: 'replace',
        path: '/protected',
        value: imageInfo.protected.state.value === 'true'
      }];
      if (this.props.obj.item.description) {
        data.push({
          op: 'replace',
          path: '/description',
          value: imageInfo.describe.state.value
        });
      } else {
        data.push({
          op: 'add',
          path: '/description',
          value: imageInfo.describe.state.value
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
      if (imageInfo.type.state.value === 'url') {
        let imageData = {
          type: 'import',
          input: {
            import_from: imageInfo.url.state.value,
            import_from_format: imageInfo.format.state.value,
            image_properties: {
              name: imageInfo.name.state.value,
              disk_format: imageInfo.format.state.value,
              container_format: 'bare'
            }
          }
        };

        if (imageInfo.describe.state.value) {
          imageData.input.image_properties.description = imageInfo.describe.state.value;
        }
        imageData.input.image_properties.visibility = this.changeType(this.props.obj.type);
        if (imageInfo.more.state.checked) {
          imageData.input.image_properties.min_disk = parseInt(imageInfo.min_disk.state.value, 10) || 0;
          imageData.input.image_properties.min_ram = parseInt(imageInfo.min_ram.state.value, 10) || 0;
          imageData.input.image_properties.protected = imageInfo.protected.state.value.toString() === 'true';
        }

        if (imageInfo.more.state.checked && imageInfo.architecture.state.value !== 'no') {
          imageData.input.image_properties.architecture = imageInfo.architecture.state.value;
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
      } else {
        let imageData = {
          name: imageInfo.name.state.value,
          container_format: 'bare',
          disk_format: imageInfo.format.state.value,
          visibility: this.changeType(this.props.obj.type)
        };
        if (imageInfo.describe.state.value) {
          imageData.description = imageInfo.describe.state.value;
        }

        if (imageInfo.more.state.checked) {
          imageData.min_disk = parseInt(imageInfo.min_disk.state.value, 10) || 0;
          imageData.min_ram = parseInt(imageInfo.min_ram.state.value, 10) || 0;
          imageData.protected = imageInfo.protected.state.value.toString() === 'true';
        }

        if (imageInfo.more.state.checked && imageInfo.architecture.state.value !== 'no') {
          imageData.architecture = imageInfo.architecture.state.value;
        }

        let file = refs.image_info.state.fileValue;

        request.createImage(imageData).then(res => {

          let ot;//
          let oloaded;
          //上传文件方法
          let xhr = new XMLHttpRequest();
          let url = '/proxy-glance/v2/images/' + res.id + '/file';
          let form = new FormData(); // FormData 对象
          form.append('mf', file); // 文件对象
          xhr.open('PUT', url, true);
          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
          xhr.onload = function uploadComplete(evt) {
            that.onCancel();
            callback && callback();
          };
          xhr.onerror = function uploadFailed(evt) {
            that.setState({
              errorMessage: getErrorMessage(evt)
            });
          };
          xhr.upload.onprogress = function progressFunction(evt) {
            let uploadProgress = document.getElementById('uploadProgress');
            let progressBar = document.getElementById('progressBar');
            let percentageDiv = document.getElementById('percentage');
            uploadProgress.style.display = 'flex';

            if (evt.lengthComputable) {
              progressBar.max = evt.total;
              progressBar.value = evt.loaded;
              percentageDiv.innerHTML = Math.round(evt.loaded / evt.total * 100) + '%';
            }

            let time = document.getElementById('time');
            let nt = new Date().getTime();
            let pertime = (nt - ot) / 1000;
            ot = new Date().getTime() - 1;

            let perload = evt.loaded - oloaded;
            oloaded = evt.loaded;

            //上传速度计算
            let speed = perload / pertime;
            let bspeed = speed;
            let units = 'b/s';//单位名称
            if(speed / 1024 > 1){
              speed = speed / 1024;
              units = 'k/s';
            }
            if(speed / 1024 > 1){
              speed = speed / 1024;
              units = 'M/s';
            }
            speed = speed.toFixed(1);

            let resttime = ((evt.total - evt.loaded) / bspeed).toFixed(1);
            time.innerHTML = __.speed + speed + units + __.resttime + resttime + 's';
            if (bspeed === 0) {
              time.innerHTML = __.upload_canael;
            }
          };
          xhr.upload.onloadstart = function(){
            ot = new Date().getTime();
            oloaded = 0;
          };
          xhr.send(form);
        });
      }
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

  onChangeName(name, url, type) {
    if (this.state.item) {
      if (name) {
        this.setState({
          btnEnable: false
        });
      } else {
        this.setState({
          btnEnable: true
        });
      }
    } else {
      let matchString = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
      let status = type === 'url' ? url && matchString.test(url) : url;
      if (name && status) {
        this.setState({
          btnEnable: false
        });
      } else {
        this.setState({
          btnEnable: true
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

  changeType(type) {
    switch(type) {
      case 'public':
        return 'public';
      case 'shared-image':
        return 'private';
      default:
        return '';
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

  renderMetaData(key) {
    let state = this.state;
    let columns = [{
      title: __.key_value,
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
        <div className="modal-bd halo-com-modal-create-image">
          <div className="content-wrapper">
            <div className="select-tab">
              <Tab items={items} onClick={this.onSwitchTab} />
            </div>
            <div className="modal-content">
              <ImageInfo ref="image_info" displayKey={state.displayKey} type={props.obj.type} item={state.item} changeType={this.changeType.bind(this)} onChangeName={this.onChangeName}/>
              {this.renderMetaData(state.displayKey)}
            </div>
            <div className={'error-wrapper' + (state.errorMessage ? '' : ' hide')}>
              <Tip content={state.errorMessage} showIcon={true} type={'danger'} />
            </div>
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-image">
          <div className="right-side">
            <Button ref="btn" value={props.obj.item ? __.edit : __.create} disabled={state.btnEnable} onClick={this.onCreateImage} type="create" />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ImageBase;
