require('./style/index.less');

var React = require('react');
var request = require('client/dashboard/cores/request');
var MainTable = require('client/components/main_table/index');

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
      url: '/api/v1/' + HALO.user.projectId + '/servers/detail'
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
      <div className="halo-modules-instance" style={this.props.style}>
        <MainTable title="Instances" column={columns} data={this.state.data} dataKey="id" />
      </div>
    );
  }

}

module.exports = Model;
