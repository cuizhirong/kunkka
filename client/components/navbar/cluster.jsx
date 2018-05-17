const React = require('react');

class Cluster extends React.Component{
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
    if (id === HALO.current_region) {
      return;
    }

    let clusterUrl = HALO.kunkka_remotes.filter(remote => remote.region_id === id)[0].url;

    window.location.href = clusterUrl;
  }

  renderCluster() {
    let regions = HALO.region_list;

    return regions.map((item, index) => {
      return (
        <li key={index} onClick={this.onClick.bind(null, item.id)}><a>{item.name}</a></li>
      );
    });
  }

  render() {
    return (
      <ul>
        { this.state.initialize ? this.renderCluster() : null}
      </ul>
    );
  }
}

module.exports = Cluster;
