require('./style/index.less');

var React = require('react');

var uskin = require('client/uskin/index');
var Tab = uskin.Tab;

var Toggle = require('./toggle');
var BasicProps = require('./basic_props');

class TableDetail extends React.Component {

  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
    this.closeDetail = this.closeDetail.bind(this);
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

  onClick(e, item) {
    this.props.tabsOnClick && this.props.tabsOnClick(item);
  }

  closeDetail() {
    this.setState({
      detailVisible: false
    });
  }

  render() {
    return (
      <div className={'halo-com-table-detail' + (this.state.detailVisible ? ' visible' : '')}>
        <div className="tabs-head">
          <div className="close" onClick={this.closeDetail}>
            <i className="glyphicon icon-close" />
          </div>
          <Tab items={this.props.tabs} type="sm" onClick={this.onClick} />
        </div>
        <div className="tabs-content">
          <Toggle title="Basic Properties" defaultUnfold={true}>
            <BasicProps />
          </Toggle>
        </div>
      </div>
    );
  }

}

module.exports = TableDetail;
