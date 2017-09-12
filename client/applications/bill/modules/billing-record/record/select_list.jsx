require('./style/index.less');

const React = require('react');
const {Button} = require('client/uskin/index');

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      project: {},
      regions: [],
      region: {},
      statuses: [],
      status: {}
    };

    ['onChangeProject', 'onChangeRegion', 'onChangeStatus', 'onConfirm', 'onReset', 'onAction'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onChangeProject(e) {
    let value = e.target.value;
    let project = this.state.projects.find((ele) => ele.id === value);

    this.setState({
      project: project
    });
  }

  onChangeRegion(e) {
    let value = e.target.value;
    let region = this.state.regions.find((ele) => ele.id === value);

    this.setState({
      region: region
    });
  }

  onChangeStatus(e) {
    let value = e.target.value;
    let status = this.state.statuses.find((ele) => ele.id === value);

    this.setState({
      status: status
    });
  }

  onConfirm() {
    let state = this.state;
    let data = {
      project_id: state.project.id === 'all' ? null : state.project.id,
      region_id: state.region.id === 'all' ? null : state.region.id,
      status: state.status.id === 'all' ? null : state.status.id
    };

    this.onAction('search', data);
  }

  onReset() {
    let state = this.state;
    let project = state.projects[0];
    let region = state.regions[0];
    let status = state.statuses[0];

    this.setState({
      project: project,
      region: region,
      status: status
    });

    let data = {
      project: null,
      region: null
    };
    this.onAction('reset', data);
  }

  onAction(btnKey, data) {
    let func = this.props.onAction;
    func && func('select_list', btnKey, data);
  }

  renderProjects(projects, project) {
    return (
      <select value={project.id} onChange={this.onChangeProject}>
        {
          projects.map((ele) =>
            <option key={ele.id} value={ele.id}>{ele.name}</option>
          )
        }
      </select>
    );
  }

  renderRegion(regions, region) {
    return (
      <select value={region.id} onChange={this.onChangeRegion}>
        {
          regions.map((ele) =>
            <option key={ele.id} value={ele.id}>{ele.name}</option>
          )
        }
      </select>
    );
  }

  renderStatus(statuses, status) {
    return (
      <select value={status.id} onChange={this.onChangeStatus}>
        {
          statuses.map((ele) =>
            <option key={ele.id} value={ele.id}>{ele.name}</option>
          )
        }
      </select>
    );
  }

  render() {
    let __ = this.props.__;
    let state = this.state;

    return (
      <div className="select-list">
        {this.renderProjects(state.projects, state.project)}
        {this.renderRegion(state.regions, state.region)}
        {this.renderStatus(state.statuses, state.status)}
        <Button value={__.search} onClick={this.onConfirm} />
        <Button value={__.reset} onClick={this.onReset} />
      </div>
    );
  }
}

module.exports = Detail;
