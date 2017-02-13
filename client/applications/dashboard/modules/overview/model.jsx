require('./style/index.less');

var React = require('react');
var {Tab} = require('client/uskin/index');
var ResourceInfo = require('./info');
var ResourceQuota = require('./quota');

var request = require('./request');
var __ = require('locale/client/dashboard.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      overview: {},
      types: []
    };
  }

  componentWillMount() {
    request.getOverview().then((res) => {
      this.setState({
        overview: res.overview_usage,
        types: res.volume_types
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  getProjectName() {
    var projectID = HALO.user.projectId,
      projects = HALO.user.projects;

    var ret = projects.filter((project) => project.id === projectID);

    return ret[0] ? ret[0].name : '';
  }

  render() {
    var overviewTab = [{
      name: __.overview,
      key: 'overview',
      default: true
    }];

    var overview = this.state.overview;
    var types = this.state.types;

    return (
      <div className="halo-module-overview" style={this.props.style}>
        <Tab items={overviewTab} />
        <div className="project-name">{this.getProjectName()}</div>
        <div className="project-resources">
          <div className="left-side">
            <ResourceInfo overview={overview} />
          </div>
          <div className="right-side">
            <ResourceQuota overview={overview} types={types} />
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
