require('./style/index.less');

var React = require('react');
var {Pagination, Table} = require('client/uskin/index');
var SelectList = require('./select_list');
var Detail = require('./detail');
var __ = require('locale/client/bill.lang.json');
var converter = require('./converter');
var moment = require('client/libs/moment');

class Main extends React.Component {
  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.stores = {
      selected: null
    };

    ['onClickPagination', 'onAction', 'onDetailAction'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    var config = this.props.config;
    converter.convertLang(__, config);
    this.tableColRender(config.table.column);
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.type) {
        case 'captain':
          column.render = (col, item, i) => {
            var formatData = column.formatter && column.formatter(col, item, i);
            if (!formatData) {
              formatData = (item[col.dataIndex] ? item[col.dataIndex] : '(' + item.id.substr(0, 8) + ')');
            }
            return (
              <a className="captain" onClick={this.onClickCaptain.bind(this, item)}>
                {formatData}
              </a>
            );
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return this.props.getStatusIcon(item[col.dataIndex]);
          };
          break;
        case 'time':
          column.render = (col, item, i) => {
            return moment(item[col.dataIndex]).fromNow();
          };
          break;
        default:
          break;
      }
    });
  }

  shouldComponentUpdate(nextProps) {
    if (!this.props.visible && !nextProps.visible) {
      return false;
    }
    return true;
  }

  onClickCaptain(item, e) {
    var detail = this.refs.detail;
    var table = this.refs.table;
    var checked = table.state.checkedKey[item.id];

    if (checked) {
      table.setState({ checkedKey: {} });
      detail.close();
      this.stores.selected = null;
    } else {
      let checkedKey = {};
      checkedKey[item.id] = true;
      table.setState({
        checkedKey: checkedKey
      });

      detail.open();
      this.stores.selected = item;
      this.onAction('detail', 'open', { data: item });
    }
  }

  onClickPagination(page, e) {
    this.onAction('pagination', 'jump', page);
  }

  onDetailAction(type, data) {
    if (type === 'close') {
      let table = this.refs.table;
      table.setState({ checkedKey: {} });
    } else if (type === 'pagination') {
      if (data) {
        data.item = this.stores.selected;
      }
      this.onAction('detail', type, data);
    }
  }

  onAction(field, actionType, data) {
    var func = this.props.onAction;
    func && func(field, actionType, this.refs, data);
  }

  render() {
    var config = this.props.config,
      table = config.table,
      pagi = table.pagination,
      detail = config.table.detail,
      detailContent = {
        table: detail.table,
        pagination: null
      };

    return (
      <div className="bill-record-main">
        <SelectList
          ref="select_list"
          __={__}
          onAction={this.onAction} />
        <div className="table-box">
          {
            !table.loading && !table.data.length ?
              <div className="table-with-no-data">
                <Table
                  column={table.column}
                  data={[]}
                  checkbox={table.checkbox} />
                <p>
                  {__.there_is_no + __.bill_record + __.full_stop}
                </p>
              </div>
            : <Table
                ref="table"
                column={table.column}
                data={table.data}
                dataKey={table.dataKey}
                loading={table.loading}
                hover={table.hover} />
          }
          {
            !table.loading && pagi ?
              <div className="pagination-box">
                <Pagination onClick={this.onClickPagination} current={pagi.current} total={pagi.total}/>
              </div>
              : null
          }
          {
            detail ?
              <Detail
                ref="detail"
                tabs={detail.tabs}
                content={detailContent}
                onDetailAction={this.onDetailAction} />
              : null
          }
        </div>
      </div>
    );
  }
}

module.exports = Main;
