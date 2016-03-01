require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Table = uskin.Table;
var __ = require('i18n/client/lang.json');

class DetailMinitable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      toggle: this.props.defaultUnfold
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  render() {
    var tableConfig = this.props.tableConfig;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'down' : 'up')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-detail-minitable">
            {this.props.children}
            <div className="table-info">
              <Table
                mini={true}
                column={tableConfig.column}
                data={tableConfig.data}
                dataKey={tableConfig.dataKey}
                hover={tableConfig.hover} />
              {(this.props.tableConfig.data.length === 0) &&
                <div className="no-data-info">{__.there_is_no + this.props.title}</div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = DetailMinitable;
