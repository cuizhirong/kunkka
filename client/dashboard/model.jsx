var React = require('react');
var request = require('./cores/request');
var Table = require('client/uskin/index').Table;

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
        <div id="navbar"></div>
        <div id="main-wrapper">
          <div id="menu"></div>
          <div id="main">
            <Table column={columns} data={this.state.data} dataKey="id"/>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
