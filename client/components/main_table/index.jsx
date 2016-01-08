require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Table = uskin.Table;
var Button = uskin.Button;

class MainTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var props = this.props;

    function listener() {}

    return (
      <div className="halo-main-table">
        <div className="header">
          <h3>{props.title}</h3>
        </div>
        <div className="operation-list">
          <Button value="Initial" initial={true} onClick={listener} iconClass="glyphicon icon-region"/>
          <Button value="Initial" type="create" initial={true} onClick={listener} iconClass="glyphicon icon-create"/>
          <Button value="Initial" type="delete" initial={true} onClick={listener} iconClass="glyphicon icon-more"/>
          <Button value="Initial" type="cancel" initial={true} onClick={listener} iconClass="glyphicon icon-edit"/>
          <Button value="Initial" type="cancel" initial={true} disabled={true} onClick={listener} iconClass="glyphicon icon-disable"/>
        </div>
        <Table column={props.column} data={props.data} dataKey={props.dataKey} />
      </div>
    );
  }

}

module.exports = MainTable;
