var React = require('react');
var {Modal, Button, Table, Tip} = require('client/uskin/index');
var __ = require('locale/client/admin.lang.json');
var request = require('../../request');

var getErrorMessage = require('../../../../utils/error_message');

class ModifyMetaData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayKey: '0',
      checked: props.obj ? true : false,
      metaData: [],
      addMetaData: [],
      removeMetaData: [],
      updateMetaData: [],
      errorMessage: '',
      singleData: {}
    };
    this.id = 0;

    this.mask = document.querySelector('.modal-mask');
    ['onCancel', 'renderMetaData', 'onAddUserToTable', 'modifyMetadata'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }
  componentWillMount(){
    var obj = this.props.obj.res.extra_specs;
    var metaData = this.state.metaData;
    let singleData;
    for(let key in obj) {
      singleData = {
        key: key,
        value: obj[key],
        op: <i onClick={this.removeUserData.bind(this, key)} className="glyphicon icon-remove remove-user-from-project"></i>
      };
      metaData.push(singleData);
    }
  }
  componentDidMount() {
    if (this.props.obj) {
      this.refs.btn.setState({
        disabled: false
      });
    }
  }

  modifyMetadata(){
    let callback = this.props.callback;
    var flavorCreateMetaData = {
      'extra_specs': {}
    };

    for(let i in this.state.addMetaData) {
      flavorCreateMetaData.extra_specs[this.state.addMetaData[i].metaKey] = this.state.addMetaData[i].metaValue.toString();
    }
    this.refs.btn.setState({
      disabled: true
    });
    request.createAndUpdateAndDeleteSpect(this.props.obj.id, this.state.updateMetaData, this.state.removeMetaData, flavorCreateMetaData).then((_res) => {
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

  onAddUserToTable() {
    let metaData = this.state.metaData;
    let addMetaData = this.state.addMetaData;
    let metaKey = this.refs.metaKey.value;
    let metaValue = this.refs.metaValue.value;
    let singleData = {}, addData = true;
    let updateMetaData = this.state.updateMetaData;
    if (metaKey) {
      metaData.forEach((data, index) => {
        if(data.key === metaKey){
          data.value = metaValue;
          updateMetaData.push(data);
          addData = false;
        }
      });
      if (addData) {
        singleData = {
          key: metaKey,
          value: metaValue,
          op: <i onClick={this.removeUserData.bind(this, metaKey)} className="glyphicon icon-remove remove-user-from-project"></i>
        };
        addMetaData.push({metaKey, metaValue});

        metaData.push(singleData);

      }
      this.setState({
        metaData: metaData,
        addMetaData: addMetaData
      }, () => {
        this.refs.metaKey.value = '';
        this.refs.metaValue.value = '';
      });
    }
  }

  removeUserData(key) {
    let metaData = this.state.metaData,
      removeMetaData = this.state.removeMetaData,
      obj = this.props.obj.res.extra_specs,
      addMetaData = this.state.addMetaData;
    metaData.forEach((data, index) => {
      if (data.key === key) {
        metaData.splice(index, 1);
        for(let i in obj) {
          if (i === key) {
            removeMetaData.push(data.key);
          }
        }
      }
    });
    addMetaData.forEach((ele, i) => {
      if (ele.metaKey === key) {
        addMetaData.splice(i, 1);
      }
    });
    this.setState({
      metaData: metaData,
      addMetaData: addMetaData,
      removeMetaData: removeMetaData
    });
  }

  renderMetaData() {
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
    return <div className={'meta-data'}>
      <div className="meta-header">
        <input ref="metaKey" className="key-input" placeholder={__.key} type="text" />
        <input ref="metaValue" className="key-input" placeholder={__.value} type="text" />
        <Button value={__.add} type="create" onClick={this.onAddUserToTable} />
      </div>
      <div className="meta-content">
        <Table column={columns} dataKey={'key'} data={this.state.metaData} striped={true} hover={true} />
      </div>
    </div>;
  }

  render() {
    var props = this.props,
      state = this.state;
    return (
      <Modal refs="modal" {...props} title={__.edit + __.meta_data} visible={state.visible}>
        <div className="modal-bd halo-com-modal-modify-flavor">
          <div className="content-wrapper">
            <div className="modal-content">
              {this.renderMetaData()}
            </div>
            <div className={'error-wrapper' + (state.errorMessage ? '' : ' hide')}>
              <Tip content={state.errorMessage} showIcon={true} type={'danger'} />
            </div>
          </div>
        </div>
        <div className="modal-ft halo-com-modal-modify-flavor">
          <div className="right-side">
            <Button ref="btn" value={__.edit} disabled={true} onClick={this.modifyMetadata} type="create" />
            <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModifyMetaData;
