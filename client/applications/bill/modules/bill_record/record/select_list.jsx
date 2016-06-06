require('./style/index.less');

var React = require('react');
var {Button} = require('client/uskin/index');

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      _projects: [],
      project: '',
      _regions: [],
      region: ''
    };

    ['onChangeProject', 'onChangeRegion', 'onConfirm', 'onReset', 'onAction'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  onChangeProject(e) {
    var value = e.target.value;
    var project = this.state._projects.find((ele) => ele.id === value);

    this.setState({
      project: project
    }, () => {
      this.onConfirm();
    });
  }

  onChangeRegion(e) {
    var value = e.target.value;
    var region = this.state._regions.find((ele) => ele.id === value);

    this.setState({
      region: region
    }, () => {
      this.onConfirm();
    });
  }

  onConfirm() {
    var state = this.state;
    var data = {
      project: state.project,
      region: state.region
    };

    this.onAction('search', data);
  }

  onReset() {
    var state = this.state;
    var project = state._projects[0];
    var region = state._regions[0];

    this.setState({
      project: project,
      region: region
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

  render() {
    var __ = this.props.__;
    var state = this.state;

    return (
      <div className="select-list">
        {this.renderProjects(state._projects, state.project)}
        {this.renderRegion(state._regions, state.region)}
        <Button value={__.search} onClick={this.onConfirm} />
        <Button value={__.reset} onClick={this.onReset} />
      </div>
    );
  }
}

module.exports = Detail;
