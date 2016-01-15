require('./style/index.less');

var React = require('react');
var request = require('client/dashboard/cores/request');

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
    return (
      <div className="halo-modules-volume" style={this.props.style}>
      </div>
    );
  }

}

module.exports = Model;
