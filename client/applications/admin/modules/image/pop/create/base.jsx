const React = require('react');
const {Modal, Button, Tab, Tip} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');
const request = require('../../request');
const getErrorMessage = require('../../../../utils/error_message');
const ImageInfo = require('./image_info');
const Metadata = require('../../../../components/metadata/index');

class ImageBase extends React.Component {

  constructor(props) {
    super(props);

    let nonMetaProps = [
      'architecture', 'container_format', 'disk_format', 'created_at',
      'owner', 'size', 'id', 'status', 'updated_at', 'checksum',
      'visibility', 'name', 'is_public', 'protected', 'min_disk',
      'min_ram', 'file', 'locations', 'schema', 'tags', 'virtual_size',
      'kernel_id', 'ramdisk_id', 'direct_url', 'self', 'description'
    ];

    let originalKeys;

    if (props.obj.item !== undefined) {
      originalKeys = this.getOriginalKeys(props.obj.item, nonMetaProps);
    } else {
      originalKeys = [];
    }

    this.state = {
      displayKey: '0',
      checked: props.obj.item ? true : false,
      metadata: {},
      btnEnable: true,
      item: props.obj.item,
      errorMessage: '',
      originalKeys: originalKeys,
      nonMetaProps: nonMetaProps,
      showMetaTab: this.showMetaTab()
    };

    this.mask = document.querySelector('.modal-mask');

    ['onCancel', 'onCreateImage', 'onSwitchTab', 'onChangeName'].forEach((func) => {
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

  getOriginalKeys(imageData, nonMetaProps) {
    const originalKeys = [];
    for(let i in imageData) {
      if(nonMetaProps.indexOf(i) === -1) {
        originalKeys.push(i);
      }
    }
    return originalKeys;
  }

  getMetadata() {
    const properties = this.state.metadata;
    const originalKeys = this.state.originalKeys;
    const metadata = [];

    originalKeys.forEach((key) => {
      if(properties[key] === undefined) {
        metadata.push({
          op: 'remove',
          path: '/' + key
        });
      }
    });

    for(let prop in properties) {
      if(originalKeys.indexOf(prop) !== -1) {
        metadata.push({
          op: 'replace',
          path: '/' + prop,
          value: properties[prop]
        });
      } else {
        metadata.push({
          op: 'add',
          path: '/' + prop,
          value: properties[prop]
        });
      }
    }

    return metadata;
  }

  onModifyMetadata(propKey, propValue, isRemoved) {
    const metadata = this.state.metadata;

    if(!isRemoved) {
      metadata[propKey] = propValue;
    } else {
      delete metadata[propKey];
    }

    this.setState(metadata);
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
    // 修改
    if (this.props.obj.item) {
      data = [{
        op: 'replace',
        path: '/name',
        value: imageInfo.name.state.value
      }, {
        op: 'replace',
        path: '/visibility',
        value: imageInfo.visibility.state.value
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
        value: imageInfo.protected.state.checked
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

      if(this.state.showMetaTab) {
        const metadata = this.getMetadata();

        data = data.concat(metadata);
      }

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
          imageData.input.image_properties.protected = imageInfo.protected.state.checked;
        }

        if (imageInfo.more.state.checked && imageInfo.architecture.state.value !== 'no') {
          imageData.input.image_properties.architecture = imageInfo.architecture.state.value;
        }

        for (let i in this.state.metadata) {
          imageData.input.image_properties[i] = this.state.metadata[i];
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
        // 新建文件类型
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
          imageData.protected = imageInfo.protected.state.checked;
        }

        if (imageInfo.more.state.checked && imageInfo.architecture.state.value !== 'no') {
          imageData.architecture = imageInfo.architecture.state.value;
        }

        for(let i in this.state.metadata) {
          imageData[i] = this.state.metadata[i];
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
    this.setState({
      displayKey: status.key
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

  onChangeProtected() {}

  changeType(type) {
    switch(type) {
      case 'public':
        return 'public';
      case 'private-image':
        return 'private';
      default:
        return '';
    }
  }

  showMetaTab() {
    const data = this.props.obj;
    if(data.item === undefined) {
      return true;
    } else {
      if(data.item.owner === data.pId) {
        return true;
      } else {
        return false;
      }
    }
  }

  render() {
    let props = this.props,
      state = this.state;
    let items = [{
      name: '* ' + __.image + __.info,
      key: '0',
      default: state.displayKey === '0'
    }];

    if (state.showMetaTab) {
      items.push({
        name: __.meta_data,
        key: '1',
        default: state.displayKey === '1'
      });
    }

    return (
      <Modal refs="modal" {...props} title={props.obj.item ? __.edit + __.image : __.create + __.image} visible={state.visible}>
        <div className="modal-bd halo-com-modal-create-image">
          <div className="content-wrapper">
            <div className="select-tab">
              <Tab items={items} onClick={this.onSwitchTab} />
            </div>
            <div className="modal-content">
              <ImageInfo ref="image_info" displayKey={state.displayKey} type={props.obj.type} item={state.item} changeType={this.changeType.bind(this)} onChangeName={this.onChangeName}/>

              {state.showMetaTab ? <Metadata ref="metadata" obj={this.props.obj} displayKey={state.displayKey} __={__} nonMetaProps={this.state.nonMetaProps}
              onModifyMetadata={this.onModifyMetadata.bind(this)} /> : null}
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
