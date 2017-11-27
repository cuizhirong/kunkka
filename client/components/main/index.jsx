require('./style/index.less');

const React = require('react');
const {InputSearch, Tab, Table} = require('client/uskin/index');
const ButtonList = require('./button_list');
const Detail = require('./detail');
const converter = require('client/components/main/converter');
const moment = require('client/libs/moment');
const router = require('client/utils/router');
const getTime = require('client/utils/time_unification');
const tabFilter = require('client/libs/tab');

class Modal extends React.Component {
  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.stores = {
      rows: []
    };

    this.initialized = false;
  }

  componentWillMount() {
    let config = this.props.config;
    let dataKey = config.table.dataKey;

    config.table.column.forEach((col) => {
      if (col.filter) {
        col.filterAll = ['all'];
      }
      if (col.sort) {
        col.sortBy = function(item1, item2) {
          let key = col.dataIndex,
            a = item1[key] ? item1[key] : '(' + item1[dataKey] + ')',
            b = item2[key] ? item2[key] : '(' + item2[dataKey] + ')';

          return a.localeCompare(b);
        };
      }
    });
    converter.convertLang(this.props.__, config);
    this.tableColRender(config.table.column);
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.type) {
        case 'captain':
          column.render = (col, item, i) => {
            let formatData = column.formatter && column.formatter(col, item, i);
            if (!formatData) {
              let key = this.props.config.table.dataKey;
              formatData = (item[col.dataIndex] ? item[col.dataIndex] : '(' + item[key].substr(0, 8) + ')');
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
            return getTime(item[col.dataIndex], true);
          };
          break;
        default:
          break;
      }
    });
  }

  onAction(field, actionType, data) {
    if (!data) {
      data = {};
    }
    data.rows = this.stores.rows;
    let func = this.props.onAction;
    func && func(field, actionType, this.refs, data);
  }

  componentDidMount() {
    this.props.onInitialize(this.props.params);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.initialized) {
      //when first render the module, open the detail
      this.onChangeParams(nextProps.params);
    } else {
      if (nextProps.visible) {
        if (!this.props.visible) {
          //if module is from invisible to visible, clear all the state
          this.clearState();
        }
        if (this.props.params !== nextProps.params) {
          //if params(usally third params) are different, trigger this function
          this.onChangeParams(nextProps.params);
        }
      }
    }

    //update data in stores
    this.updateRows(nextProps.config.table.data);

    //after initialized module, set true
    this.initialized = true;
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.visible) {
      return true;
    }
    return false;
  }

  updateRows(data) {
    //update main store rows
    let newRows = [];
    let key = this.props.config.table.dataKey;

    this.stores.rows.forEach((item) => {
      let existed = data.filter((d) => d[key] === item[key])[0];

      if (existed) {
        newRows.push(existed);
      }
    });

    this.stores.rows = newRows;

    //update table checkedKey
    let checkedKey = {};
    newRows.forEach((item) => {
      checkedKey[item[key]] = true;
    });

    let table = this.refs.table;
    if (table) {
      table.check(checkedKey);
    }

    //update btn status
    this.onAction('table', 'check', {
      status: false,
      checkedRow: this.stores.rows
    });
  }

  onChangeParams(params) {
    let table = this.refs.table,
      detail = this.refs.detail;

    let key = this.props.config.table.dataKey;
    if (params.length === 3) {
      let row = this.props.config.table.data.filter((data) => data[key] === params[2])[0];
      /* no row data means invalid path list */
      if (!row) {
        router.replaceState('/' + params.slice(0, 2).join('/'));
        return;
      }

      this.stores = {
        rows: [row]
      };

      if (detail && !detail.state.visible) {
        detail.setState({
          visible: true
        });
      }

      if (table) {
        table.check({ [params[2]]: true });
      }

      detail.setState({
        contents: {}
      }, () => {
        this.onClickDetailTabs();
      });
    } else {
      this.stores = {
        rows: []
      };

      if (detail && detail.state.visible) {
        detail.setState({
          visible: false
        });
      }

      if (table) {
        table.check({});
      }
    }

    this.onAction('table', 'check', {
      status: params[2] ? true : false,
      checkedRow: params[2] ? this.stores.rows[0] : null
    });

  }

  searchInTable(text) {
    let table = this.refs.table;

    if (table) {
      let search = this.props.config.search,
        filterCol = search.column;

      if (search && search.column) {
        if (text) {
          //close detail when search start
          let params = this.props.params;
          if (params.length > 2) {
            router.pushState('/' + params.slice(0, 2).join('/'));
          }

          //arguments: filter columns, filter function
          table.filter(filterCol, function(item, column) {
            let ret = column.some((col) => {
              if (filterCol[col.key] && item[col.dataIndex]) {
                let td = item[col.dataIndex].toLowerCase();
                return td.indexOf(text.toLowerCase()) > -1 ? true : false;
              }
            });

            return ret;
          });
        } else {
          table.filter(filterCol, undefined);
        }
      }
    }
  }

  onClickCaptain(item, e) {
    e.preventDefault();

    let key = this.props.config.table.dataKey;
    let shouldClose = this.refs.detail.state.visible
      && (this.stores.rows.length === 1)
      && (this.stores.rows[0][key] === item[key]);

    let path = router.getPathList();
    if (shouldClose) {
      router.pushState('/' + path[0] + '/' + path[1]);
    } else {
      router.pushState('/' + path[0] + '/' + path[1] + '/' + item[key]);
    }
  }

  clickTabs(e, item) {
    let path = router.getPathList();
    router.pushState('/' + path[0] + '/' + item.key);
  }

  changeSearchInput(str) {
    this.searchInTable(str);

    this.onAction('searchInput', 'search', {
      text: str
    });
  }

  checkboxListener(status, clickedRow, arr) {
    let path = this.props.params;
    let key = this.props.config.table.dataKey;

    if (arr.length <= 0) {
      router.pushState('/' + path[0] + '/' + path[1]);
    } else if (arr.length <= 1) {
      if (path[2] === arr[0][key]) {
        router.replaceState('/' + path[0] + '/' + path[1] + '/' + arr[0][key], null, null, true);
      } else {
        router.pushState('/' + path[0] + '/' + path[1] + '/' + arr[0][key]);
      }
    } else {
      // this.refs.detail.updateContent(this.stores.rows);
    }

  }

  onChangeTableCheckbox(status, clickedRow, rows) {
    this.stores = {
      rows: rows
    };

    if (this.refs.detail && this.refs.detail.state.visible) {
      this.checkboxListener(status, clickedRow, rows);
    }

    if (!this.refs.detail || (!this.refs.detail.state.visible || (this.refs.detail.state.visible && rows.length > 1))) {
      if (this.refs.detail && this.refs.detail.state.visible) {
        this.onClickDetailTabs();
      }
      this.onAction('table', 'check', {
        status: status,
        clickedRow: clickedRow
      });
    }
  }

  onClickDetailTabs(tab) {
    this.onAction('detail', tab ? tab.key : this.refs.detail.findDefaultTab().key, {});
  }

  clearState() {
    this.stores.rows = [];
    this.onAction('table', 'check', {
      status: false,
      clickedRow: []
    });

    this.clearSearchState();
    this.clearTableState();
  }

  clearSearchState() {
    if (this.refs.search) {
      this.refs.search.clearState();
      this.searchInTable(undefined);
    }
  }

  clearTableState() {
    if (this.refs.table) {
      this.refs.table.clearState();
    }
  }

  render() {
    let _config = tabFilter(this.props.config),
      tabs = _config.tabs,
      title = _config.tabs.filter((tab) => tab.default)[0].name,
      btns = _config.btns,
      search = _config.search,
      table = _config.table,
      detail = _config.table.detail,
      __ = this.props.__;

    return (
      <div className="halo-com-main">
        {tabs ?
          <div className="submenu-tabs">
            <Tab items={tabs} onClick={this.clickTabs.bind(this)} />
          </div>
          : null
        }
        <div className="operation-list">
          <ButtonList
            ref="btnList"
            btns={btns}
            onAction={this.onAction.bind(this)} />
          {search ?
            <InputSearch
              ref="search"
              type="light"
              width={search.width}
              placeholder={search.placeholder}
              onChange={this.changeSearchInput.bind(this)} />
            : null
          }
        </div>
        <div className="table-box">
          {!table.loading && !table.data.length ?
            <div className="table-with-no-data">
              <Table
                column={table.column}
                data={[]}
                checkbox={table.checkbox} />
              <p>
                {__.there_is_no + title + __.full_stop}
              </p>
            </div>
          : <Table
              ref="table"
              column={table.column}
              data={table.data}
              dataKey={table.dataKey}
              loading={table.loading}
              checkbox={table.checkbox}
              checkboxOnChange={this.onChangeTableCheckbox.bind(this)}
              hover={table.hover}
              striped={this.striped} />
          }
          {detail ?
            <Detail
              ref="detail"
              tabs={detail.tabs}
              rows={this.stores.rows}
              onClickTabs={this.onClickDetailTabs.bind(this)} />
            : null
          }
        </div>
      </div>
    );
  }
}

module.exports = Modal;
