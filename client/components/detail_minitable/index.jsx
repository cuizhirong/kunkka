require('./style/index.less');

const React = require('react');
const uskin = require('client/uskin/index');
const Table = uskin.Table;

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
    let tableConfig = this.props.tableConfig;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
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
                <div className="no-data-info">{this.props.__.there_is_no + this.props.title}</div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = DetailMinitable;
