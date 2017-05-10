var React = require('react');
var request = require('client/libs/ajax');

class Projects extends React.Component{
  constructor(props) {
    super(props);

    this.state = {
      initialize: false
    };
  }

  updateState() {
    this.setState({
      initialize: true
    });
  }

  componentDidMount() {
    this.updateState();
  }

  onClick(id, e) {
    if (id === HALO.user.projectId) {
      return;
    }

    var errHandler = function(err) {
      if (err.status === 401) {
        window.location = '/auth/logout';
      }
      return new Promise(function(resolve, reject) {
        reject(err);
      });
    };

    var fetch = {};
    fetch.put = function(options) {
      var opt = Object.assign({
        dataType: 'json',
        contentType: 'application/json',
        headers: {
          REGION: HALO.current_region
        }
      }, options);
      return request.put(opt).catch(errHandler);
    };

    fetch.put({
      url: '/auth/switch_project',
      data: {
        'projectId': id
      }
    }).then((res) => {
      window.location.reload();
    });
  }

  renderProject() {
    var projects = HALO.user.projects;

    return projects.map((item, index) => {
      return (
        <li key={index} onClick={this.onClick.bind(null, item.id)}><a>{item.name}</a></li>
      );
    });
  }

  render() {
    return (
      <ul>
        { this.state.initialize ? this.renderProject() : null}
      </ul>
    );
  }
}

module.exports = Projects;
