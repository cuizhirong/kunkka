const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');
const unitConverter = require('client/utils/unit_converter');

class ModalBase extends React.Component {
  constructor(props) {
    super(props);

    let catalogueTypes = [{
      value: __.current_catalogue,
      key: 'current'
    }, {
      value: __.assign_catalogue,
      key: 'assign'
    }];

    this.state = {
      disabled: true,
      visible: true,
      catalogueTypes: catalogueTypes,
      catalogueType: catalogueTypes[0].key,
      files: [],
      catalogueAddress: '',
      currentFile: props.obj && props.obj.name,
      uploadData: {}
    };

    ['onConfirm', 'renderTabs', 'onCancel'].forEach(f => {
      this[f] = this[f].bind(this);
    });
  }

  componentWillMount() {
    document.addEventListener('dragover', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, false);
    document.addEventListener('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();
    }, false);
  }

  componentWillUpdate(nextProps, nextState) {
    if(this.props.obj !== null) {
      let showAddBtn = nextState.files.length < 1;
      let btnAdd = document.getElementsByClassName('add-btn')[0];
      btnAdd.style.display = showAddBtn ? 'block' : 'none';
    } else {
      let showAddBtn = nextState.files.length < 5;
      let btnAdd = document.getElementsByClassName('add-btn')[0];
      btnAdd.style.display = showAddBtn ? 'block' : 'none';
    }
  }

  componentDidMount() {
    let that = this,
      files = this.state.files;
    let dragBox = document.getElementsByClassName('drag-box')[0];
    dragBox.addEventListener('dragover', function(e) {
      e.stopPropagation();
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }, false);

    dragBox.addEventListener('drop', function(e) {
      e.stopPropagation();
      e.preventDefault();

      let newFiles = e.dataTransfer.files;

      for(let i = 0; i < newFiles.length; i++) {
        let f = newFiles[i];
        f.id = f.name + Date.now();
        if(files.length < 1) {
          files.push(f);
        }
      }

      that.setState({
        files: files,
        disabled: files.length > 0 ? false : true
      });
    }, false);
  }

  onClickAdd() {
    let inputFile = document.getElementById('file-select');
    inputFile.click();
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }
  onClickRemove(item) {
    let files = this.state.files;
    let newFiles = files.filter(ele => {
      if(ele.id === item.id) {
        return false;
      }
      return true;
    });

    this.setState({
      files: newFiles,
      disabled: newFiles.length > 0 ? false : true
    });
  }

  fileUpload() {
    let files = this.state.files;
    let newFiles = this.refs.fileselect.files;
    for(let i = 0; i < newFiles.length; i++) {
      let f = newFiles[i];
      f.id = f.name + Date.now();
      f.bytes = f.size;
      files.push(f);
    }

    this.setState({
      files: files,
      disabled: files.length > 0 ? false : true
    });
  }

  onChangeCatalogueType(key, e) {
    this.setState({
      catalogueType: key
    });
  }

  renderTabs(props, state) {
    let Types = (
      <div className={'object-row row-tab row-tab-single' + (props.obj !== null ? ' hide' : '') } key="types">
        <div className="object-modal-label">
          {__.file_catalogue}
        </div>
        <div className="object-modal-data">
          {
            state.catalogueTypes.map((ele) =>
              <a key={ele.key}
                className={ele.key === state.catalogueType ? 'selected' : ''}
                onClick={ele.key === state.catalogueType ? null : this.onChangeCatalogueType.bind(this, ele.key)}>
                {ele.value}
              </a>
            )
          }
        </div>
      </div>
    );

    let ret = [];
    ret.push(Types);
    return ret;
  }

  getAddress(e) {
    this.setState({
      catalogueAddress: e.target.value
    });
  }

  onConfirm() {
    let props = this.props,
      breadcrumb = props.breadcrumb;
    let state = this.state;
    let reader = new FileReader();
    let transmitData = [],
      that = this;
    breadcrumb = props.breadcrumb.join('/');
    this.setState({
      disabled: true
    });
    if(this.props.obj) {
      let obj = this.props.obj;
      state.files.forEach((f) => {
        reader.readAsArrayBuffer(f);
        transmitData.push({
          Bucket: breadcrumb,
          bytes: f.bytes,
          Name: f.name,
          file: this.result
        });
      });

      reader.onload = function() {
        let xhr = new XMLHttpRequest();
        let url = '/proxy-swift/' + breadcrumb + '/' + obj.name + '?replace=1';
        xhr.open('PUT', url, true);
        xhr.onreadystatechange = function () {
          that.setState({
            visible: false
          });
        };
        xhr.onerror = function(error) {
        };
        xhr.send(reader.result);
        if (xhr.status === 201){
          props.callback && props.callback();
        }
      };
    } else {
      if(state.catalogueType === 'current') {
        state.files.forEach((f) => {
          reader.readAsArrayBuffer(f);
          transmitData.push({
            Bucket: breadcrumb,
            bytes: f.bytes,
            Name: f.name,
            file: this.result
          });
        });
      } else {
        state.files.forEach((f) => {
          reader.readAsArrayBuffer(f);
          transmitData.push({
            Bucket: state.catalogueAddress,
            bytes: f.bytes,
            Name: f.name,
            file: this.result
          });
        });
      }
      reader.onload = function() {
        let xhr = new XMLHttpRequest();
        let url;
        transmitData.forEach(item => {
          url = '/proxy-swift/' + item.Bucket + '/' + item.Name;
        });

        xhr.open('PUT', url, true);
        xhr.onreadystatechange = function () {
          if(xhr.status === 201){
            props.callback && props.callback();
          }
          that.setState({
            visible: false
          });
        };
        xhr.send(reader.result);
      };
    }
  }

  render() {
    let props = this.props,
      state = this.state;
    let breadcrumb = props.breadcrumb.join('/');
    let selectName = __.add_file;
    let src = '/static/assets/dashboard/icon-storage.png';

    if(props.obj !== null) {
      src = '/static/assets/dashboard/icon-floder.png';
      selectName = __.reupload;
    }
    return (
       <Modal ref="modal" {...props} title={props.obj !== null ? __.edit + __.file : __.upload_file} visible={state.visible} width={540}>
        <div className="modal-bd halo-com-modal-upload-file" style={props.obj !== null ? {height: '280px'} : {height: '400px'}}>
          {this.renderTabs(props, state)}
          <div className={'catalogue-type' + (props.obj !== null ? ' hide' : '') }><p>{__.catalogue_address}</p>
            <div className={state.catalogueType === 'current' ? '' : 'hide'}>{breadcrumb}</div>
            <input ref="catalogueType" className={state.catalogueType === 'current' ? 'hide' : ''} type="text" onChange={this.getAddress.bind(this)}/>
          </div>
          <div className={'file-name' + (props.obj !== null ? '' : ' hide') }><p>{__.file_name}<span>{state.currentFile}</span></p></div>
          <p className="select-file">{__.select_file}</p>
          <div className="drag-box">
            <img src={src}/>
            <p className="tip-dragbox">{__.tip_dragbox}</p>
            <div className="add-btn" onClick={this.onClickAdd}>
              <span>{selectName}</span>
              <input ref="fileselect" type="file" multiple id="file-select" onChange={this.fileUpload.bind(this)}/>
            </div>
          </div>
          <ul>
            {state.files.length > 0 ? state.files.map(f => {
              let size = unitConverter(f.size);
              let uploadFile = f.name.length > 20 ? f.name.slice(0, 20) + '...' : f.name;
              return (
                <li key={f.id} className="file-item">
                  <i className="glyphicon icon-file" style={{color: '#cacdd0'}}/>
                  <span>{uploadFile + ' (' + size.num + ' ' + size.unit + ')'}</span>
                  <i className="glyphicon icon-remove" onClick={this.onClickRemove.bind(this, f)}/>
                </li>
              );
            }) : null}
          </ul>
          <div className={'tip obj-tip-warning' + (props.obj !== null ? ' hide' : '') }>
            <div className="obj-tip-icon">
              <strong>
                <i className="glyphicon icon-status-warning" />
              </strong>
            </div>
            <div className="obj-tip-content" style={{width: 320 + 'px'}}>
              {__.upload_tip}
            </div>
          </div>
        </div>
        <div className="modal-ft halo-com-modal-upload-file">
          <Button value={props.obj !== null ? __.edit : __.upload} disabled={state.disabled} type="create" onClick={this.onConfirm} />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
