require('./style/index.less');

var React = require('react');
var {Button, DropdownButton, InputSearch, Tab, Table} = require('client/uskin/index');
var Main = require('client/components/main/index');
var Detail = require('client/components/main/detail');
var request = require('./request');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var converter = require('client/components/main_table/converter');
var getStatusIcon = require('client/dashboard/utils/status_icon');
var moment = require('client/libs/moment');
var router = require('client/dashboard/cores/router');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    this.onChangeState = this.onChangeState.bind(this);
  }

  onInitialize() {
    moment.locale(HALO.configs.lang);
    router.on('changeState', this.onChangeState);

    converter.convertLang(__, config);
    this.setTableColRender(this.state.config.table.column);
    this.tableLoading();
    this.updateData();
  }

  onChangeState(pathList) {
    var moduleID = this.refs.dashboard.props.moduleID,
      shouldVisible = pathList[1] === moduleID && pathList.length > 2 ? true : false;

    this.refs.detail.setState({
      visible: shouldVisible
    });
  }

  tableLoading() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  updateData() {
    request.listInstances().then((res) => {
      var table = this.state.config.table;
      table.data = res.images;
      table.loading = false;

      this.setState({
        config: config
      }, () => {
        var path = router.getPathList(),
          data = this.state.config.table.data;

        if (path.length > 2 && data && data.length > 0) {
          router.replaceState(router.getPathName(), null, null, true);
        }
      });
    });
  }

  setTableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'name':
          column.render = (col, item, i) => {
            return (
              <a className="captain" data-type="router" href={'/project/test/' + item.id}>
                {item.name}
              </a>
            );
          };
          break;
        case 'size':
          column.render = (col, item, i) => {
            return Math.round(item.size / 1024) + ' MB';
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            return item.image_type === 'snapshot' ? __.snapshot : __.image;
          };
          break;
        case 'status':
          column.render = (col, item, i) => {
            return getStatusIcon(item.status);
          };
          break;
        case 'created':
          column.render = (col, item, i) => {
            return moment(item.created_at).fromNow();
          };
          break;
        default:
          break;
      }
    });
  }

  componentWillMount() {
    console.log(this.props.params);
    this.onInitialize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps() {
  }

  openDetail() {
    this.refs.detail.setState({
      visible: true
    });
  }

  render() {
    var _config = this.state.config,
      tabs = _config.tabs,
      btns = _config.btns,
      search = _config.search,
      table = _config.table,
      title = _config.tabs.filter((tab) => tab.default)[0].name,
      detail = _config.table.detail;

    return (
      <div className="halo-module-test" style={this.props.style}>
        <Main ref="dashboard" moduleID="test" config={this.state.config}>
          {tabs ?
            <div className="submenu-tabs">
              <Tab items={tabs} onClick={null} />
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
                  dropdownOnClick={null} />
              : <Button
                  key={index}
                  value={btn.value}
                  btnKey={btn.key}
                  type={btn.type}
                  disabled={btn.disabled}
                  iconClass={btn.icon}
                  initial={true}
                  onClick={null} />
            )}
            {search ?
              <InputSearch
                ref="search"
                type="light"
                width={search.width}
                onChange={null} />
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
                checkboxOnChange={null}
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
        </Main>
      </div>
    );
  }

}

module.exports = Model;
