require('./style/index.less');

var React = require('react');

// var uskin = require('client/uskin/index');
// var Tab = uskin.Tab;

class TableDetail extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setState({
      detailVisible: this.props.detailVisible
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      detailVisible: nextProps.detailVisible
    });
  }

  render() {
    return (
      <div className={'halo-com-table-detail' + (this.state.detailVisible ? ' visible' : '')}></div>
    );
  }

}

module.exports = TableDetail;
