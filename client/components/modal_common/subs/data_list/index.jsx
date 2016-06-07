var React = require('react');

class DataList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: this.props.data ? this.props.data : [],
      hide: false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.hide === nextState.hide) {
      return false;
    }
    return true;
  }

  componentDidUpdate() {
    this.props.onAction(this.props.field, this.state);
  }

  render() {
    var state = this.state;

    return (
      <div className={'modal-row data-list-row' + (state.hide ? ' hide' : '')}>
        {state.data}
      </div>
    );
  }
}

module.exports = DataList;
