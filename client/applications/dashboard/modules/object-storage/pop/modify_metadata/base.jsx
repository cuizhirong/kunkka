const React = require('react');
const __ = require('locale/client/dashboard.lang.json');
const {Modal, Button} = require('client/uskin/index');
const request = require('../../request');
const Metadata = require('../../../../components/metadata/index');
const getErrorMessage = require('../../../../utils/error_message');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    let namespaces = [{
      'name': 'Cache-Control',
      'properties': []
    }, {
      'name': 'Content-Disposition',
      'properties': [{'selectValue': 'attachment'}]
    }, {
      'name': 'Content-Encoding',
      'properties': []
    }, {
      'name': 'Content-Language',
      'properties': []
    }, {
      'name': 'Content-Type',
      'properties': [
        {'selectValue': 'application/msword'},
        {'selectValue': 'application/pdf'},
        {'selectValue': 'application/vnd.android.package-archive'},
        {'selectValue': 'application/x-compressed'},
        {'selectValue': 'application/x-gzip'},
        {'selectValue': 'application/zip'},
        {'selectValue': 'audio/mpeg'},
        {'selectValue': 'binary/octet-stream'},
        {'selectValue': 'image/bmp'},
        {'selectValue': 'image/gif'},
        {'selectValue': 'image/jpeg'},
        {'selectValue': 'image/png'},
        {'selectValue': 'image/svg+xml'},
        {'selectValue': 'image/tiff'},
        {'selectValue': 'text/plain'},
        {'selectValue': 'text/rtf'}
      ]
    }, {
      'name': 'Website-Redirect-Location',
      'properties': []
    }, {
      'name': 'Expires',
      'properties': []
    }];

    this.state = {
      visible: true,
      namespaces: namespaces,
      btnEnable: false,
      error: '',
      showError: false,
      objHeaders: {},
      metaData: [],
      addMetaData: [],
      removeMetaData: []
    };

    ['onCancel', 'onCreateMetaData', 'getMetaData', 'changebtnDisabled', 'removeUserData'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    let singleData = {}, id;
    let addMetaData = this.state.addMetaData;
    let metaData = this.state.metaData;
    request.objectMetaDetas({
      name: this.props.obj.name
    }, this.props.breadcrumb).then((res) => {
      for(let key in res) {
        let metaKey = key.substr('x-object-meta-'.length, key.length);
        id = metaKey + Math.random();
        singleData = {
          key: metaKey,
          id: id,
          value: res[key],
          op: <i onClick={this.removeUserData.bind(this, id)} className="glyphicon icon-remove remove-user-from-project"></i>
        };
        let metaValue = res[key];
        metaData.push(singleData);
        addMetaData.push({metaKey, metaValue});
      }
      this.setState({
        metaData: metaData,
        addMetaData: addMetaData
      });
    });
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

  onCreateMetaData() {
    let metaArr = [];
    let params = {};
    let breadcrumb = this.props.breadcrumb;
    let that = this;
    this.state.metaData.forEach(item => {
      let metaKeys = 'X-Object-Meta-' + item.key;
      params[metaKeys] = item.value;
      metaArr.push(metaKeys);
    });

    request.putObjMetaData(params, breadcrumb, this.props.obj, metaArr).then((res) => {
      this.setState({
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

  getMetaData(addMetaData, metaData, removeUserData) {
    this.setState({
      addMetaData: addMetaData,
      metaData: metaData,
      removeUserData: removeUserData
    });
  }

  changebtnDisabled(disabled) {
    if(disabled === true) {
      this.setState({
        btnEnable: true
      });
    } else {
      this.setState({
        btnEnable: false
      });
    }
  }

  render() {
    let props = this.props,
      state = this.state;
    return (
      <Modal ref="modal" {...props} visible={state.visible}>
        <div className="object-storage-description">
          <div className="modal-hd">
          <h6 className="title">{__.modify + __.metadata}</h6>
          <span className="glyphicon icon-close" onClick={this.onCancel}></span>
        </div>
        <div className="modal-bd">
          <Metadata ref="metadata" obj={this.props.obj} __={__} namespaces={this.state.namespaces}
              getMetaData={this.getMetaData} changebtnDisabled={this.changebtnDisabled} metaData={this.state.metaData}/>
        </div>
        <div className="modal-ft">
          <Button ref="btn" value={__.create} disabled={state.btnEnable} onClick={this.onCreateMetaData} type="create" />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
