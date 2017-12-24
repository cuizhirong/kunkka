require('./style/index.less');

let React = require('react');
let Tab = require('client/components/modal_common/subs/tab/index');

class VolumeType extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value || '',
      data: props.data
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      data: nextProps.data
    });
  }

  onAction(field, state) {
    this.setState({
      value: state.value
    }, () => {
      this.props.onAction(field, this.state);
    });
  }

  render() {
    let props = this.props;

    return (<div className="halo-pop-volume-types">
    { this.state.data ? <Tab ref="volumeTypes" {...props} onAction={this.onAction.bind(this)}/> : null }
    </div>);
  }
}

function typePop(config) {
  return <VolumeType ref="volume_type" {...config} />;
}

module.exports = typePop;
