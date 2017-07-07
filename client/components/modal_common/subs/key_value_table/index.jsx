var React = require('react');
var {Button, Table} = require('uskin');

class InputPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hide: !!props.hide,
      visible: !!props.visible,
      error: false,
      disabled: false
    };

    this.onChange = this.onChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  toggleVisibility() {
    this.setState({
      visible: !this.state.visible
    });
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  onChange(e) {
    this.props.onAction(this.props.field, this.state);
  }

  onRemove(item, e) {
    const table = this.refs.table;
    let data = table.state.data;
    let key = this.props.table.dataKey || 'id';

    let index = data.findIndex((ele) => ele[key] === item[key]);
    if (index > -1) {
      data.splice(index, 1);
    }

    table.setState({
      data: data
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    for (var index in this.state) {
      if (this.state[index] !== nextState[index]) {
        return true;
      }
    }

    return false;
  }

  render() {
    var props = this.props;
    var state = this.state;
    var {__, inputs, table} = props;

    var className = 'modal-row key-value-table';
    if (this.state.hide) {
      className += ' hide';
    }

    var getFixedWidth = (width) => ({
      width,
      maxWidth: width,
      minWidth: width
    });

    const that = this;
    if (props.hasOperation) {
      table.column.push({
        title: __.operation,
        key: 'operation',
        width: '80px',
        render: function(col, item, index) {
          return (
            <i className="glyphicon icon-remove remove-operation" onClick={that.onRemove.bind(that, item)} />
          );
        }
      });
    }

    return (
      <div className={className}>
        <div className="input-area">
          {
            inputs.map((ele) => (
              <div key={ele.key} style={ele.width && getFixedWidth(ele.width)}>
                {ele.content}
              </div>
            ))
          }
          <Button value={__.add} disabled={state.disabled} type="create" onClick={this.onChange} />
        </div>
        <div className="table-content">
          <Table ref="table" striped={true} hover={true} dataKey={table.dataKey || 'id'} {...table} data={table.data || []} />
        </div>
      </div>
    );
  }
}

module.exports = InputPassword;
