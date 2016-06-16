require('./style/index.less');

var React = require('react');
var {Button} = require('client/uskin/index');

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
    var value = e.target.value;
    var project = this.state.projects.find((ele) => ele.id === value);

    this.setState({
      project: project
    });
  }

  onChangeRegion(e) {
    var value = e.target.value;
    var region = this.state.regions.find((ele) => ele.id === value);

    this.setState({
      region: region
    });
  }

  onChangeStatus(e) {
    var value = e.target.value;
    var status = this.state.statuses.find((ele) => ele.id === value);

    this.setState({
      status: status
    });
  }

  onConfirm() {
    var state = this.state;
    var data = {
      project_id: state.project.id === 'all' ? null : state.project.id,
      region_id: state.region.id === 'all' ? null : state.region.id,
      status: state.status.id === 'all' ? null : state.status.id
    };

    this.onAction('search', data);
  }

  onReset() {
    var state = this.state;
    var project = state.projects[0];
    var region = state.regions[0];
    var status = state.statuses[0];

    this.setState({
      project: project,
      region: region,
      status: status
    });

    var data = {
      project: null,
      region: null
    };
    this.onAction('reset', data);
  }

  onAction(btnKey, data) {
    var func = this.props.onAction;
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
    var __ = this.props.__;
    var state = this.state;

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
