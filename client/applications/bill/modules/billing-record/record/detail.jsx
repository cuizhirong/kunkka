require('./style/index.less');

var React = require('react');
var {Tab, Table, Pagination} = require('client/uskin/index');

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      loading: false,
      tabs: this.props.tabs,
      content: this.props.content
    };

    ['onClickPagination', 'close'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.visible && !nextState.visible) {
      return false;
    }

    return true;
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
          <Table
            ref="table"
            mini={true}
            column={table.column}
            data={table.data}
            dataKey={table.dataKey}
            loading={table.loading}
            hover={table.hover} />
          <div className="pagination-box">
            {
              pagi ?
                <Pagination current={pagi.current} total={pagi.total} onClick={this.onClickPagination} />
              : null
            }
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;
