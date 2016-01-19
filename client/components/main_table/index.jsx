require('./style/index.less');

var React = require('react');
var moment = require('client/libs/moment');
console.log(moment);

var uskin = require('client/uskin/index');
var Table = uskin.Table;
var Button = uskin.Button;
var DropdownButton = uskin.DropdownButton;
var InputSearch = uskin.InputSearch;

class MainTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    var config = this.props.config,
      search = config.search,
      table = config.table;

    return (
      <div className="halo-main-table">
        <div className="header">
          <h3>{config.title}</h3>
        </div>
        <div className="operation-list">
          {config.btns.map((btn, index) =>
            !btn.dropdown ?
            <Button key={index}
              value={btn.value}
              btnKey={btn.btnKey}
              onClick={config.btnsOnClick}
              type={btn.type}
              disabled={btn.disabled}
              iconClass={btn.iconClass}
              initial={true} />
           : <DropdownButton key={index}
              disabled={btn.dropdown.disabled}
              buttonData={btn}
              dropdownItems={btn.dropdown.items}
              dropdownOnClick={config.dropdownBtnOnClick} />
          )}
          {config.search ? <InputSearch type={search.type} width={search.width} onClick={config.searchOnClick}/>
            : null
          }
        </div>
        <Table column={table.column}
          data={table.data}
          dataKey={table.dataKey}
          checkbox={table.checkbox}
          checkboxOnChange={config.tableCheckboxOnClick}
          hover={table.hover}
          striped={this.striped} />
      </div>
    );
  }

}

module.exports = MainTable;
