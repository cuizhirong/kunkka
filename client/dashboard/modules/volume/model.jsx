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
      title: 'Name2',
      dataIndex: 'name'
    }, {
      title: 'I2D',
      dataIndex: 'id'
    }, {
      title: 'ST2ATUS',
      dataIndex: 'status'
    }, {
      title: 'USE2R ID',
      dataIndex: 'user_id'
    }];

    return (
      <div className="halo-modules-volume" style={this.props.style}>
        <MainTable title="Volumes" column={columns} data={this.state.data} dataKey="id" />
      </div>
    );
  }

}

module.exports = Model;
