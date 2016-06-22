require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var {Table, Button, DropdownButton} = uskin;
var __ = require('locale/client/dashboard.lang.json');

class ResourceList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false,
      rows: []
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

  checkboxOnChange(boolean, row, rows) {
    this.setState({
      rows: rows
    });
    this.props.checkboxOnChange && this.props.checkboxOnChange(rows);
  }

  onAction(tabKey, actionType, rawItem, e, btn) {
    var data = {};
    data.rawItem = rawItem;
    data.rows = this.state.rows;
    if(actionType === 'add_resource') {
      this.props.onAction && this.props.onAction(tabKey, actionType, data);
    } else {
      this.props.onAction && this.props.onAction(tabKey, actionType, data, btn.key);
    }
  }

  render() {
    var tableConfig = this.props.tableConfig,
      btnConfig = this.props.btnConfig;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-resource-list">
            <Button value={__.add_ + __.resource} onClick={this.onAction.bind(this, 'description', 'add_resource', this.props.rawItem)}/>
            <DropdownButton buttonData={btnConfig.btn} dropdownItems={btnConfig.items} dropdownOnClick={this.onAction.bind(this, 'description', 'resource_ops', this.props.rawItem)}/>
            <div className="table-info">
              <Table
                refs="list"
                mini={true}
                column={tableConfig.column}
                data={tableConfig.data}
                dataKey={tableConfig.dataKey}
                checkbox={tableConfig.checkbox}
                checkboxOnChange={this.checkboxOnChange.bind(this)}
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

module.exports = ResourceList;
