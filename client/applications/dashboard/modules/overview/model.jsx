require('./style/index.less');

const React = require('react');
const {Tab, Button} = require('client/uskin/index');
const ResourceInfo = require('./info');
const ResourceQuota = require('./quota');
const modifyQuota = require('./pop/modify_quota/index');

const request = require('./request');
const __ = require('locale/client/dashboard.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      overview: {},
      types: [],
      hideBtn: true
    };
  }

  componentWillMount() {
    request.getOverview().then((res) => {
      this.setState({
        overview: res.overview_usage,
        types: res.volume_types,
        hideBtn: false
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

  onBtnClick() {
    const state = this.state;
    const addedQuota = {};

    for(let i in state.overview) {
      addedQuota[i] = undefined;
    }

    modifyQuota({
      overview: this.clone(state.overview),
      types: this.clone(state.types),
      targetQuota: this.clone(state.overview),
      addedQuota: addedQuota
    }, null, () => {});
  }

  clone(objectToBeCloned) {
    if (!(objectToBeCloned instanceof Object)) {
      return objectToBeCloned;
    }

    const Constructor = objectToBeCloned.constructor;
    let objectClone = new Constructor();
    for (let prop in objectToBeCloned) {
      objectClone[prop] = this.clone(objectToBeCloned[prop]);
    }

    return objectClone;
  }

  render() {
    let overviewTab = [{
      name: __.overview,
      key: 'overview',
      default: true
    }];

    let applyBtnConfig = {
      value: __.apply_quota,
      key: 'apply',
      icon: 'create',
      type: 'create',
      onClick: this.onBtnClick.bind(this)
    };

    let overview = this.state.overview;
    let types = this.state.types;

    return (
      <div className="halo-module-overview" style={this.props.style}>
        <div className="overview-header" >
          <Tab items={overviewTab} />
          { this.state.hideBtn ? null : <Button {...applyBtnConfig} />}
        </div>
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
