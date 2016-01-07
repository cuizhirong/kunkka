var React = require('react');
var request = require('./cores/request');
var MainTable = require('client/components/main_table/index');
var NavBar = require('client/components/navbar/index');
var SideMenu = require('client/components/side_menu/index');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: []
    };

    this.listInstance = this.listInstance.bind(this);
  }

  componentDidMount() {
    this.listInstance();
  }

  listInstance() {
    var that = this;

    request.get({
      url: '/v1/' + HALO.user.projectId + '/servers/detail'
    }).then(function(data) {
      that.setState({
        data: data.servers
      });
    }, function(err) {
      console.debug(err);
    });

  }

  render() {
    var columns = [{
      title: 'Name',
      dataIndex: 'name'
    }, {
      title: 'ID',
      dataIndex: 'id'
    }, {
      title: 'STATUS',
      dataIndex: 'status'
    }, {
      title: 'USER ID',
      dataIndex: 'user_id'
    }];

    return (
      <div id="wrapper">
        <div id="navbar">
          <NavBar />
        </div>
        <div id="main-wrapper">
          <SideMenu />
          <div id="main">
            <MainTable column={columns} data={this.state.data} dataKey="id" />
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
