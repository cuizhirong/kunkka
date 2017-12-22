const React = require('react');
const DropdownList = require('../../../../components/dropdown_list/index');

class Project extends React.Component {
  constructor(props) {
    super(props);
  }

  onChange(evt) {
    const props = this.props;
    props.rendererData.onValueChange(props.rendererData, evt.target.value);
  }

  onClickItem(item, index) {
    const props = this.props;
    props.rendererData.onClickItem(props.rendererData, item, index);
  }

  render() {
    const data = this.props.rendererData;
    return (
      <div className="modal-row input-row label-row">
        <DropdownList {...data.listCfg} onClickItem={this.onClickItem.bind(this)} />
        <input type="text" onChange={this.onChange.bind(this)} value={data.value} />
      </div>
    );
  }
}


module.exports = function(state) {
  return <Project {...state} />;
};
