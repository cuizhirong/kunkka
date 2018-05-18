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
    let regions = HALO.region_list,
      clusters = HALO.kunkka_remotes;

    return clusters.map((item, index) => {
      let selectRegion = regions.filter(region => region.id === item.region_id)[0];
      return (
        <li key={index} onClick={this.onClick.bind(null, item.region_id)}><a>{
          selectRegion ? selectRegion.name : item.region_id
        }</a></li>
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
