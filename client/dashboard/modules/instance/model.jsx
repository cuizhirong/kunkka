require('./style/index.less');

var React = require('react');
var request = require('client/dashboard/cores/request');
var MainTable = require('client/components/main_table/index');
var config = require('./config.json');
var lang = require('i18n/client/lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      btns: config.btns,
      search: config.search,
      table: config.table
    };

    this.listInstance = this.listInstance.bind(this);
    this.btnsOnClick = this.btnsOnClick.bind(this);
    this.tableCheckboxOnClick = this.tableCheckboxOnClick.bind(this);
  }

  componentDidMount() {
    this.listInstance();
  }

  listInstance() {
    var that = this;

    request.get({
      url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
    }).then(function(data) {
      that.setState({
        data: data.servers ? data.servers : []
      });
    }, function(err) {
      console.debug(err);
    });

  }

  getLangValue(btns, table) {
    this.getBtnLang(btns);
    this.getTableLang(table);
  }

  getBtnLang(btns) {
    btns.map((btn) => {
      btn.value = lang[btn.value_key];
    });
  }

  getTableLang(table) {

  }

  btnsOnClick(e, key) {
    console.log('btnsOnClick: key is', key);
    switch(key) {
    case 'create_instance':
      break;
    case 'refresh':
      break;
    default:
      break;
    }
  }

  dropdownBtnOnClick(e, status) {
    console.log('dropdownBtnOnClick: status is', status);
  }

  searchOnClick(str) {
    console.log('searchOnClick: text is', str);
  }

  tableCheckboxOnClick(e, status, clickedRow, arr) {
  //   console.log('tableOnClick: ', e, status, clickedRow, arr);
    this.controlCreateInstance(status, clickedRow, arr);
  }

  controlCreateInstance(status, clickedRow, arr) {
    if (clickedRow) {
      this.state.btns.filter((btn) => {
        return btn.btnKey === 'create_instance';
      }).forEach((btn) => {
        btn.disabled = (arr.length === 1) ? false : true;
      });

      this.setState({
        btns: this.state.btns
      });
    }
  }

  render() {
    var btns = this.state.btns,
      search = this.state.search,
      table = this.state.table;

    table.data = this.state.data;
    this.getLangValue(btns, table);

    var MainTableConfig = {
      title: 'Instances',
      btns: btns,
      btnsOnClick: this.btnsOnClick,
      dropdownBtnOnClick: this.dropdownBtnOnClick,
      search: search,
      searchOnClick: this.searchOnClick,
      table: table,
      tableCheckboxOnClick: this.tableCheckboxOnClick
    };

    return (
      <div className="halo-modules-instance" style={this.props.style}>
        <MainTable config={MainTableConfig}/>
      </div>
    );
  }

}

module.exports = Model;
