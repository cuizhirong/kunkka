const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const unitConverter = require('client/utils/unit_converter');
const getErrorMessage = require('../../../../utils/error_message');

class ModalBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: true,
      visible: true,
      files: [],
      catalogueAddress: '',
      currentFile: props.obj && props.obj.name
    };

    ['onConfirm', 'onCancel'].forEach(f => {
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
    let showAddBtn = nextState.files.length < 5;
    let btnAdd = document.getElementsByClassName('add-btn')[0];
    btnAdd.style.display = showAddBtn ? 'block' : 'none';
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

  getAddress(e) {
    this.setState({
      catalogueAddress: e.target.value
    });
  }

  onConfirm() {
    let props = this.props,
      breadcrumb = props.breadcrumb;
    let state = this.state;
    breadcrumb = props.breadcrumb.join('/');
    this.setState({
      disabled: true
    });
    if(this.props.obj) {
      let obj = this.props.obj;
      obj.Bucket = breadcrumb + '/' + state.catalogueAddress;
      request.editObj(obj).then(res => {
        this.setState({
          visible: false
        });
      }).catch(err => {
        let errorTip = getErrorMessage(err);
        this.setState({
          showError: true,
          error: errorTip
        });
      });
    } else {
      let objs = [];
      if(state.catalogueType === 'current') {
        state.files.forEach((f) => {
          objs.push({
            Bucket: breadcrumb,
            bytes: f.bytes,
            Name: f.name,
            Body: f
          });
        });
      } else {
        state.files.forEach((f) => {
          objs.push({
            Bucket: breadcrumb + '/' + state.catalogueAddress,
            Name: f.name,
            bytes: f.bytes,
            Body: f
          });
        });
      }
      request.putObjects(objs).then(res => {
        this.setState({
          visible: false
        });
      }).catch(err => {
        let errorTip = getErrorMessage(err);
        this.setState({
          showError: true,
          error: errorTip
        });
      });
    }
  }

  render() {
    let props = this.props,
      state = this.state;

    return (
       <Modal ref="modal" {...props} title={ __.edit + __.file} visible={state.visible} width={540}>
        <div className="modal-bd halo-com-modal-upload-file">
          <div className="file-name"><p>{__.file_name}<span>{state.currentFile}</span></p></div>
          <p className="select-file">{__.select_file}</p>
          <div className="drag-box">
            <img src="/static/assets/dashboard/icon-floder.png"/>
            <p className="tip-dragbox">{__.tip_dragbox}</p>
            <div className="add-btn" onClick={this.onClickAdd}>
              <span>{__.reupload}</span>
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
        </div>
        <div className="modal-ft halo-com-modal-upload-file">
          <Button value={ __.edit} disabled={state.disabled} type="create" onClick={this.onConfirm} />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
