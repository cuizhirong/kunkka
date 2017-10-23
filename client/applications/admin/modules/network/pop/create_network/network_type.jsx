const React = require('react');
const __ = require('locale/client/admin.lang.json');

class RadioButton extends React.Component {
  constructor(props) {
    super(props);
  }
  handleChange(event){
    this.props.onSelectedValueChanged && this.props.onSelectedValueChanged(event.target.value);
  }
  render(){
    return (
      <label htmlFor={this.props.id}>
        <input type="radio"
          name={this.props.name}
          value={this.props.value}
          checked={this.props.checked}
          onChange={this.handleChange.bind(this)}/>
          <span>{this.props.text}</span>
      </label>
    );
  }
}

class RadioButtonList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hideVlan: !HALO.configs.neutron_network_vlanranges || HALO.configs.neutron_network_vlanranges.length === 0 || HALO.configs.neutron_network_vlanranges === '',
      selectedValue: 'vxlan'
    };
    ['onSelectedValueChanged', 'renderRadionButtons'].forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  componentDidUpdate() {
    this.props.onAction && this.props.onAction(this.props.field, this.state, this.refs);
  }

  onSelectedValueChanged(value){
    this.setState({selectedValue: value});
  }
  renderRadionButtons(){
    let that = this;
    let itemlist = [{
      value: 'vxlan',
      name: 'network_type',
      text: 'vxlan',
      checked: 'true'
    }, {
      value: 'vlan',
      name: 'network_type',
      text: 'vlan',
      checked: 'false',
      hideVlan: that.state.hideVlan
    }, {
      value: 'flat',
      name: 'network_type',
      text: 'flat',
      checked: 'false'
    }];
    return (
      <div>
        <span className="net_type">
          {this.props.required && <strong>*</strong>}
          {__.network_type}
        </span>
        <span className="net_info">
        {
          itemlist.map((item, index) => {
            if (item.value === 'vlan' && item.hideVlan) {
              return false;
            } else {
              return (<RadioButton
              key={index}
              name={item.name}
              value={item.value}
              text = {item.text}
              checked={that.state.selectedValue === (item.value || item)}
              onSelectedValueChanged={that.onSelectedValueChanged}/>);
            }
          })
        }
        </span>
      </div>
    );
  }
  render(){
    return (<div className="radioButtonList">{this.renderRadionButtons()}</div>);
  }
}

function popRadioList(config) {
  return <RadioButtonList ref="enable_type" {...config} />;
}

module.exports = popRadioList;
