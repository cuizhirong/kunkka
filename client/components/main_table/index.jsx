require('./style/index.less');

var React = require('react');
var Table = require('client/uskin/index').Table;

class MainTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var props = this.props;

    return (
      <Table column={props.column} data={props.data} dataKey={props.dataKey} />
    );
  }

}

module.exports = MainTable;
