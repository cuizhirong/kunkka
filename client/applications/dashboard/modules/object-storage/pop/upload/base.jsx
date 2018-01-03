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
      uploadData: {},
      showError: false,
      nameConflict: __.name_conflict
    };

    ['onConfirm', 'renderTabs', 'onCancel', 'requestData', 'closePop'].forEach(f => {
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
        if(files.length < 5) {
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
    let newFiles = [];
    files.filter(ele => {
      if(ele.id === item.id) {
        return false;
      }
      newFiles.push(ele);
      return true;
    });

    this.setState({
      files: newFiles,
      disabled: newFiles.length > 0 ? false : true
    });

    if(newFiles.length > 5) {
      this.setState({
        disabled: true
      });
    }
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

    if(this.state.files.length > 5) {
      this.setState({
        disabled: true
      });
    } else {
      this.setState({
        files: files,
        disabled: files.length > 0 ? false : true
      });
    }
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
      breadcrumb = props.breadcrumb,
      state = this.state;
    breadcrumb = props.breadcrumb.join('/');
    let obj = this.props.obj;
    if(this.props.obj) {
      this.requestData('/proxy-swift/' + breadcrumb + '/' + obj.name + '?replace=1', this.state.files[0]).then(() => {
        this.closePop();
      });
    } else {
      let urlfolder = state.catalogueType === 'current' ? breadcrumb : state.catalogueAddress;
      let that = this;
      let files = that.state.files;

      Promise.all(files.map((file, index) => that.requestData('/proxy-swift/' + urlfolder + '/' + file.name, file))).then(() => {
        that.closePop();
      }).catch((err) => {
        that.setState({
          showError: true,
          nameConflict: JSON.parse(err.responseText).message,
          visible: true
        });
      });
    }
  }

  closePop() {
    this.props.callback && this.props.callback();
    this.setState({
      visible: false
    });
  }

  requestData(url, file) {
    let that = this;
    let ot;
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      let oloaded;
      xhr.open('PUT', url, true);
      that.setState({
        disabled: true
      });
      xhr.upload.onprogress = function progressFunction(evt) {
        let uploadProgress = document.getElementById('uploadProgress' + file.id);
        let progressBar = document.getElementById('progressBar' + file.id);
        let percentageDiv = document.getElementById('percentage' + file.id);
        uploadProgress.style.display = 'flex';
        uploadProgress.style['margin-bottom'] = '8px';
        if (evt.lengthComputable) {
          progressBar.max = evt.total;
          progressBar.value = evt.loaded;
          percentageDiv.innerHTML = Math.round(evt.loaded / evt.total * 100) + '%';
        }
        let time = document.getElementById('time' + file.id);
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
          units = 'kb/s';
        }
        if(speed / 1024 > 1){
          speed = speed / 1024;
          units = 'Mb/s';
        }
        speed = speed.toFixed(1);
        let resttime = ((evt.total - evt.loaded) / bspeed).toFixed(1);
        time.innerHTML = __.speed + speed + units + __.resttime + resttime + 's';
        if (bspeed === 0) {
          time.innerHTML = __.upload_canael;
        }
      };
      xhr.onload = function uploadComplete(evt) {
        if(xhr.readyState === 4 && xhr.status === 201 && that.state.files.length < 6) {
          resolve(xhr.responseText);
        } else {
          reject(xhr);
        }
      };
      xhr.send(file);
    });
  }

  render() {
    let props = this.props,
      state = this.state;
    let breadcrumb = props.breadcrumb.join('/');
    let selectName = __.add_file;
    let src = '/static/assets/dashboard/icon-storage.png';
    if(props.obj !== null) {
      src = '/static/assets/dashboard/icon-folder.png';
      selectName = __.reupload;
    }
    return (
       <Modal ref="modal" {...props} title={props.obj !== null ? __.edit + __.file : __.upload_file} visible={state.visible} width={540}>
        <div className="modal-bd halo-com-modal-upload-file" style={props.obj !== null ? {height: '300px'} : {height: '400px'}}>
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
                  <div className="file-item-li">
                    <i className="glyphicon icon-file" style={{color: '#cacdd0'}}/>
                    <span>{uploadFile + ' (' + size.num + ' ' + size.unit + ')'}</span>
                    <i className="glyphicon icon-remove" onClick={this.onClickRemove.bind(this, f)}/>
                  </div>
                  <div id={'uploadProgress' + f.id} style={{display: 'none'}} className="modal-row input-row label-row">
                    <div style={{width: '15%'}}>{__.upload_progress}</div>
                    <div style={{width: '100%'}}>
                      <progress id={'progressBar' + f.id} value="0" max="100" style={{width: '100%'}}></progress>
                      <span id={'percentage' + f.id}></span><span id={'time' + f.id}></span>
                    </div>
                  </div>
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
              {__.number_tip}
            </div>
          </div>
          {state.showError ? <div className="tip obj-tip-error">
            <div className="obj-tip-icon">
              <strong>
                <i className="glyphicon icon-status-warning" />
              </strong>
            </div>
            <div className="obj-tip-content" style={{width: 320 + 'px'}}>
              {this.state.nameConflict}
            </div>
          </div> : null}
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
