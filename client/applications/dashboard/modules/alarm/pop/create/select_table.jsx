var React = require('react');
var {InputSearch} = require('client/uskin/index');
var Item = require('./select_table_item');
var __ = require('locale/client/dashboard.lang.json');

class SelectTable extends React.Component {

  constructor(props) {
    super(props);

    ['onClick', 'onChangeSearch'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onClick(item, e) {
    this.props.onClick(item, e);
  }

  onChangeSearch(text, isClicked) {
    this.props.onChangeSearch(text, isClicked);
  }

  render() {
    const props = this.props;
    const search = props.state.searchResource.toLowerCase();

    let items = props.items;
    if (search) {
      items = items.filter((ele) => ele.title.toLowerCase().includes(search));
    }

    return (
      <div className="select-table">
        <div>
          <InputSearch type="light"
            placeholder={__.pls_select_resource}
            onChange={this.onChangeSearch}
            width={260} />
        </div>
        <div className="select-table-content">
          {
            props.state.loadingList ?
              <div className="loading-box">
                <i className="glyphicon icon-loading" />
              </div>
            : items.map((ele) =>
                <Item key={ele.id} unfold={ele.unfold} item={ele} state={props.state} onClick={this.onClick} />
              )
          }
        </div>
      </div>
    );
  }
}

module.exports = SelectTable;
