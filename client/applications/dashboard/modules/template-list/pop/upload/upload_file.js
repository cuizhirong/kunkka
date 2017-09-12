require('./style/index.less');

const React = require('react');
const __ = require('locale/client/dashboard.lang.json');

class UploadFile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };

    this.onChangeValue = this.onChangeValue.bind(this);
  }

  onChangeValue(e) {
    let file = this.refs.file.files[0];
    this.setState({
      value: file
    });
  }

  componentDidUpdate() {
    this.props.onAction && this.props.onAction(this.props.field, this.state, this.refs);
  }

  render() {
    return (
      <div className="halo-pop-com-upload">
        <div className="item-label"><strong>*</strong>{__.file}</div>
        <div className="item-data"><input ref="file" type="file" accept=".yaml" onChange={this.onChangeValue}/></div>
      </div>
    );
  }
}

function popEndpoint(config) {
  return <UploadFile ref="upload" {...config} />;
}

module.exports = popEndpoint;
