require('./style/index.less');

var React = require('react');
var {Button, DropdownButton, InputSearch, Tab, Table} = require('client/uskin/index');
var Detail = require('client/components/main/detail');
var __ = require('i18n/client/lang.json');
var converter = require('client/components/main_table/converter');
var getStatusIcon = require('client/dashboard/utils/status_icon');
var moment = require('client/libs/moment');
var router = require('client/dashboard/cores/router');

class Main extends React.Component {
  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.stores = {
      rows: []
    };


  }

  componentWillMount() {
    this.onInitialize();
  }

  onInitialize() {
    var config = this.props.config;

    converter.convertLang(__, config);
    this.setTableColRender(config.table.column);
  }

  setTableColRender(columns) {
    columns.map((column) => {
      switch (column.type) {
        case 'captain':
          var output = column.render ? column.render() : undefined;

          column.render = (col, item, i) => {
            return (
              <a className="captain" onClick={this.clickCaptain.bind(this, item)}>
                {output ? output : item[col.dataIndex]}
              </a>
            );
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return getStatusIcon(item[col.dataIndex]);
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

  onAction(field, actionType, data) {
    this.props.onAction(field, actionType, this.refs, data);
  }

  componentDidMount() {
    // this.onChangeParams(this.props.params);
    this.props.onInitialize(this.props.params);
  }

  componentWillReceiveProps(nextProps) {
    console.log('received: ', nextProps.params);
    // if (this.props.params !== nextProps.params) {
    //   this.onChangeParams(nextProps.params);
    // }

    this.onChangeParams(nextProps.params);
  }

  onChangeParams(params) {
    if (params.length === 3) {
      if (this.refs.detail && !this.refs.detail.state.visible) {
        this.refs.detail.setState({
          visible: true
        });
      }

      if (this.refs.table) {
        this.refs.table.setState({
          checkedKey: {
            [params[2]]: true
          }
        });
      }
    }
  }

  // // 这个直接渲染即可，不能做任何逻辑，否则会调用第二次
  // onChangeParams(pathList) {
  //   if (pathList[2]) {
  //     var row = this.props.config.table.data.filter((data) => data.id === pathList[2])[0];
  //     /* no row data means invalid path list */
  //     if (!row) {
  //       router.replaceState('/' + pathList.slice(0, 2).join('/'));
  //       return;
  //     }

  //     this.stores = {
  //       rows: [row]
  //     };

  //     if (this.refs.detail && !this.refs.detail.state.visible) {
  //       this.refs.detail.setState({
  //         visible: true
  //       });
  //     }
  //     this.refs.table.setState({
  //       checkedKey: {
  //         [pathList[2]]: true
  //       }
  //     });
  //   } else {
  //     this.stores = {
  //       rows: []
  //     };

  //     if (this.refs.detail && this.refs.detail.state.visible) {
  //       this.refs.detail.setState({
  //         visible: false
  //       });
  //     }
  //     this.refs.table.setState({
  //       checkedKey: {}
  //     });
  //   }

  //   this.onAction('table', 'check', {
  //     status: pathList[2] ? true : false,
  //     checkedRow: pathList[2] ? this.stores.rows[0] : null,
  //     rows: this.stores.rows
  //   });
  // }

  searchInTable(text) {
    if (this.refs.table) {
      var search = this.props.config.search;

      if (search && search.column) {
        var filterCol = search.column;
        this.refs.table.setState({
          filterCol: filterCol,
          filterBy: function(item, _column) {
            return _column.some((col) => {
              if (filterCol[col.key] && item[col.dataIndex]) {
                var td = item[col.dataIndex].toLowerCase();
                return td.indexOf(text.toLowerCase()) > -1 ? true : false;
              }
            });
          }
        });
      }
    }
  }

  clickCaptain(item, e) {
    e.preventDefault();

    var shouldClose = this.refs.detail.state.visible
      && (this.stores.rows.length === 1)
      && (this.stores.rows[0].id === item.id);

    var path = router.getPathList();
    if (shouldClose) {
      router.pushState('/project/' + path[1]);
    } else {
      router.pushState('/project/' + path[1] + '/' + item.id);
    }
  }

  clickTabs(e, item) {
    var path = router.getPathList();
    router.pushState('/' + path[0] + '/' + item.key);
  }

  onClickDropdownBtn(e, item) {
    this.onAction('btnList', 'click', {
      key: item.key
    });
  }

  onClickBtnList(e, key) {
    this.onAction('btnList', 'click', {
      key: key
    });
  }

  changeSearchInput(str) {
    this.searchInTable(str);

    this.onAction('serachInput', 'search', {
      text: str
    });
  }

  checkboxListener(e, status, clickedRow, arr) {
    this.stores = {
      rows: arr
    };

    var path = this.props.params;
    if (arr.length <= 0) {
      router.pushState('/project/' + path[1]);
    } else if (arr.length <= 1) {
      if (this.refs.detail.state.visible) {
        if (path[2] === arr[0].id) {
          router.replaceState('/project/' + path[1] + '/' + arr[0].id, null, null, true);
        } else {
          router.pushState('/project/' + path[1] + '/' + arr[0].id);
        }
      }
    } else {
      // this.refs.detail.updateContent(this.stores.rows);
    }
  }

  changeCheckboxOnTable(e, status, clickedRow, rows) {
    this.checkboxListener(e, status, clickedRow, rows);

    this.onAction('table', 'check', {
      status: status,
      clickedRow: clickedRow,
      rows: rows
    });
  }

  render() {
    var _config = this.props.config,
      tabs = _config.tabs,
      btns = _config.btns,
      search = _config.search,
      table = _config.table,
      title = _config.tabs.filter((tab) => tab.default)[0].name,
      detail = _config.table.detail;

    return (
      <div className="halo-com-main">
        {tabs ?
          <div className="submenu-tabs">
            <Tab items={tabs} onClick={this.clickTabs.bind(this)} />
          </div>
          : null
        }
        <div className="operation-list">
          {btns.map((btn, index) =>
            btn.dropdown ?
              <DropdownButton
                key={index}
                disabled={btn.dropdown.disabled}
                buttonData={btn}
                dropdownItems={btn.dropdown.items}
                dropdownOnClick={this.onClickDropdownBtn.bind(this)} />
            : <Button
                key={index}
                value={btn.value}
                btnKey={btn.key}
                type={btn.type}
                disabled={btn.disabled}
                iconClass={btn.icon}
                initial={true}
                onClick={this.onClickBtnList.bind(this)} />
          )}
          {search ?
            <InputSearch
              ref="search"
              type="light"
              width={search.width}
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
                {__.there_is_no + title + __.comma + __.click}
                <a onClick={null}>{__.here}</a>
                {__.to_create + __.full_stop}
              </p>
            </div>
          : <Table
              ref="table"
              column={table.column}
              data={table.data}
              dataKey={table.dataKey}
              loading={table.loading}
              checkbox={table.checkbox}
              checkboxOnChange={this.changeCheckboxOnTable.bind(this)}
              hover={table.hover}
              striped={this.striped} />
          }
          {detail ?
            <Detail
              ref="detail"
              tabs={detail.tabs}
              clickTabs={null} />
            : null
          }
        </div>
      </div>
    );
  }
}

module.exports = Main;
