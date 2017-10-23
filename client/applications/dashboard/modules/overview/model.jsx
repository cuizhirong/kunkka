require('./style/index.less');

const React = require('react');
const {Tab} = require('client/uskin/index');
const ResourceInfo = require('./info');
const ResourceQuota = require('./quota');

const request = require('./request');
const __ = require('locale/client/dashboard.lang.json');

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
    let projectID = HALO.user.projectId,
      projects = HALO.user.projects;

    let ret = projects.filter((project) => project.id === projectID);

    return ret[0] ? ret[0].name : '';
  }

  render() {
    let overviewTab = [{
      name: __.overview,
      key: 'overview',
      default: true
    }];

    let overview = this.state.overview;
    let types = this.state.types;

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
