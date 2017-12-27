require('./style/index.less');

const React = require('react');
const ResourceQuota = require('./quota');
const modifyQuota = require('./pop/modify_quota/index');
const { Modal } = require('client/uskin/index');
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
    }, null, () => {
      setTimeout(function() {
        Modal.info({
          title: __.message,
          content: __.apply_success,
          okText: __.confirm
        });
      }, 200);
    });
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

    let overview = this.state.overview;
    let types = this.state.types;

    return (
      <div className="halo-module-overview" style={this.props.style}>
        <div className="project-resources">
          <ResourceQuota overview={overview} types={types} hideBtn={this.state.hideBtn} onBtnClick={this.onBtnClick.bind(this)} />
        </div>
      </div>
    );
  }

}

module.exports = Model;
