require('./style/index.less');
const React = require('react');
const {Button, Table} = require('client/uskin/index');

const clone = require('client/utils/deep_clone');
const __ = require('locale/client/dashboard.lang.json');

class Metadata extends React.Component {

  constructor(props) {
    super(props);
    this.obj = clone(this.props.obj);
    this.state = {
      metaData: this.props.metaData,
      addMetaData: [],
      removeMetaData: [],
      allMetadata: this.props.namespaces,
      showKey: false,
      showValue: false,
      currentValueArr: [],
      currentKeyValue: '',
      currentValue: '',
      valueSelect: false,
      showUniqueError: false
    };
    ['onAddUserToTable', 'removeUserData', 'onkeyDropdown', 'onSelectKey', 'onvalueDropdown', 'onSelectValue', 'inputValue', 'inputdefinedkey'].forEach(f => {
      this[f] = this[f].bind(this);
    });
  }

  onAddUserToTable() {
    let metaData = this.state.metaData;
    let addMetaData = this.state.addMetaData;
    let metaKey = this.state.currentKeyValue;
    let metaValue = this.state.currentValue;
    let singleData = {}, id;
    if(metaKey === 'content-type' || metaKey === 'cache-control' || metaKey === 'content-encoding' || metaKey === 'expires' || metaKey === 'content-disposition' ) {
      metaData.forEach(item => {
        if (item.key === metaKey) {
          item.value = metaValue;
        }
      });
      this.setState({
        metaData: metaData
      });
    } else {
      metaData.forEach(item => {
        if (item.key === metaKey) {
          metaKey = '';
          this.setState({
            showUniqueError: true
          }, ()=> {
            this.props.changebtnDisabled(this.state.showUniqueError);
          });
        }
      });
      if (metaKey !== '') {
        id = metaKey + Math.random();
        singleData = {
          key: metaKey,
          id: id,
          value: metaValue,
          op: <i onClick={this.removeUserData.bind(this, id)} className="glyphicon icon-remove remove-user-from-project"></i>
        };
        metaData.push(singleData);
        addMetaData.push({metaKey, metaValue});
        this.setState({
          metaData: metaData,
          addMetaData: addMetaData,
          currentKeyValue: '',
          currentValue: ''
        });
      }
    }
    this.props.getMetaData(this.state.addMetaData, this.state.metaData, this.state.removeUserData);
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

  onkeyDropdown() {
    this.setState({
      showKey: !this.state.showKey,
      showUniqueError: false
    }, ()=> {
      this.props.changebtnDisabled(this.state.showUniqueError);
    });
  }

  onvalueDropdown() {
    this.setState({
      showValue: !this.state.showValue
    });
  }

  onSelectKey(e) {
    if(this.state.currentValue !== '') {
      this.setState({
        currentValue: ''
      });
    }
    this.setState({
      currentKeyValue: e.target.value,
      showKey: false
    }, ()=> {
      this.state.allMetadata.forEach((element, index) => {
        if(element.name === this.state.currentKeyValue) {
          this.setState({
            currentValueArr: element.properties
          });
          if(!element.properties.length > 0) {
            this.setState({
              valueSelect: false
            });
          }
        }
      });
    });
    this.state.allMetadata.forEach(item => {
      if(item.properties.length > 0) {
        this.setState({
          valueSelect: true
        });
      }
    });
  }

  inputValue(e) {
    this.setState({
      currentValue: e.target.value
    });
  }

  onSelectValue(e) {
    this.setState({
      currentValue: e.target.value,
      showValue: false
    });
  }

  inputdefinedkey(e) {
    this.setState({
      currentKeyValue: e.target.value,
      showKey: false
    });
  }

  renderMetaData() {
    let state = this.state;
    let props = this.props;
    let columns = [{
      title: __.keys,
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

    const items = this.state.allMetadata;

    let dropdownStyle = props.dropdownStyle ?
      Object.assign({}, props.dropdownStyle) : {};

    return (<div className="meta-data">
      <div className="meta-header">
        <div className="dropdown-btn" onClick={this.onkeyDropdown}>
          <input type="text" placeholder={__.keys} value={state.currentKeyValue} onChange={this.inputdefinedkey}/>
          <i className="glyphicon icon-arrow-down"></i>
          <div className="defined-dropdown" style={dropdownStyle} ref="container">
            {state.showKey ? items.map((element, index) => <input className="dropdown-item"
              key={index}
              type = "text"
              readOnly = {true}
              value={element.name}
              onClick={this.onSelectKey}/>) : null}
          </div>
        </div>
        <div ref="metaValue" className="dropdown-btn">
          {state.valueSelect ? <div>
            <input type="text" className="value-select" placeholder={__.value} value={state.currentValue} onChange={this.inputValue} />
            <i className="glyphicon icon-arrow-down" onClick={this.onvalueDropdown}></i>
            <div className="metadata-dropdown" style={dropdownStyle}>
              {state.showValue ? this.state.currentValueArr.map((ele, i) => <input className="dropdown-item" key={i} type = "text" onClick={this.onSelectValue} value={ele.selectValue} />) : null}
            </div>
          </div> :
          <input className="value-input" type="text" placeholder={__.value} value={state.currentValue} onChange={this.inputValue}/>
          }
        </div>
        <Button value={__.added} type="create" onClick={this.onAddUserToTable} />
      </div>
      <div className="meta-content">
        <Table column={columns} dataKey={'id'} data={state.metaData} striped={true} hover={true} />
      </div>
      {state.showUniqueError ? <div className="tip obj-tip-error">
        <div className="obj-tip-icon">
          <strong>
            <i className="glyphicon icon-status-warning" />
          </strong>
        </div>
        <div className="obj-tip-content" style={{width: 370 + 'px'}}>
          {__.showUniqueError.replace('{0}', state.currentKeyValue)}
        </div>
      </div> : null}
    </div>);
  }

  render() {
    return (
      <div className="modal-metadata metadata-show" key="metadata">
        {this.renderMetaData()}
      </div>
    );
  }
}

module.exports = Metadata;
