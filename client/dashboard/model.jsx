var React = require('react');

var request = require('../libs/request');

var Table = require('uskin/index').Table;

var Model = React.createClass({

  getInitialState: function() {
    return {
      data: []
    };
  },

  componentWillMount: function() {
    this.listInstance();
  },

  listInstance: function() {
    var that = this;

    request.get({
      url: '/v1/' + HALO.user.projectId + '/servers/detail',
      dataType: 'json'
    }).then(function(data) {
      that.setState({
        data: data.servers
      });
    }, function(err) {
      console.debug(err);
    });

  },

  render: function() {

    var columns = [{
      title: 'Name',
      key: 'name',
      dataIndex: 'name'
    }, {
      title: 'ID',
      key: 'id',
      dataIndex: 'id'
    }, {
      title: 'STATUS',
      key: 'status',
      dataIndex: 'status'
    }, {
      title: 'USER ID',
      key: 'user_id',
      dataIndex: 'user_id'
    }];

    return (
      <div>instance list:
        <Table column={columns} data={this.state.data} />
      </div>
    );
  }
});

module.exports = Model;
