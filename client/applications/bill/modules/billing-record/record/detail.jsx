require('./style/index.less');

var React = require('react');
var {Tab, Table, Pagination} = require('client/uskin/index');
var moment = require('client/libs/moment');
var __ = require('locale/client/bill.lang.json');


class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      loading: false,
      tabs: this.props.tabs,
      content: this.props.content
    };

    ['tableColRender', 'onClickPagination', 'close'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    this.tableColRender(this.props.content.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.visible && !nextState.visible) {
      return false;
    }

    return true;
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'price':
          column.render = (col, item, i) => {
            return <span className="price">{item.total_price}</span>;
          };
          break;
        case 'unit_price':
          column.render = (col, item, i) => {
            return <span className="unit-price">{item.unit_price}</span>;
          };
          break;
        case 'start_time':
          column.render = (col, item, i) => {
            return moment(item[col.dataIndex]).format('YYYY-MM-DD hh:mm:ss');
          };
          break;
        case 'end_time':
          column.render = (col, item, i) => {
            return moment(item[col.dataIndex]).format('YYYY-MM-DD hh:mm:ss');
          };
          break;
        case 'resource_type':
          column.render = (col, item, i) => {
            return (<span className="type">
              <i className={'glyphicon icon-' + item.type}/>
              {__[item[col.dataIndex]]}
            </span>);
          };
          break;
        default:
          break;
      }
    });
  }

  open() {
    this.setState({
      visible: true
    });
  }

  close() {
    this.setState({
      visible: false
    });

    this.onDetailAction('close');
  }

  onClickPagination(page, e) {
    this.onDetailAction('pagination', { page: page });
  }

  onDetailAction(type, data) {
    var func = this.props.onDetailAction;
    func && func(type, data);
  }

  render() {
    var state = this.state;
    var content = state.content;
    var table = content.table;
    var pagi = content.pagination;

    return (
      <div className={'bill-record-main-detail' + (state.visible ? ' visible' : '')}>
        <div className="detail-head">
          <div className="close" onClick={this.close}>
            <i className="glyphicon icon-close" />
          </div>
          <Tab ref="tab" items={state.tabs} type="sm" />
        </div>
        <div className="detail-content">
          {
            table.data.length > 0 ?
              <Table ref="table" mini={true} {...table}/>
            : <div className="table-with-no-data">
                <Table ref="table" mini={true} column={table.column} data={[]} />
                <p>
                  {__.no_bill_data}
                </p>
              </div>
          }
          {
            pagi ?
              <div className="pagination-box">
                <span className="page-guide">{__.pages + ': ' + pagi.current + '/' + pagi.total + ' '
                  + __.total + ': ' + pagi.total_num}</span>
                <Pagination current={pagi.current} total={pagi.total} onClick={this.onClickPagination} />
              </div>
            : null
          }
        </div>
      </div>
    );
  }
}

module.exports = Detail;
