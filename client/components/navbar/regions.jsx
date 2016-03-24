var React = require('react');

var fetch = require('client/dashboard/cores/fetch');

class Regions extends React.Component{
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
    fetch.put({
      url: '/auth/switch_region',
      data: {
        'current_region': id
      }
    }).then((res) => {
      window.location.reload();
    });
  }

  renderRegion() {
    var regions = HALO.region_list;

    return regions.map((item, index) => {
      return (
        <li key={index} onClick={this.onClick.bind(null, item.id)}><a>{item.name}</a></li>
      );
    });
  }

  render() {
    return (
      <ul className="region-dropdown">
        { this.state.initialize ? this.renderRegion() : null}
      </ul>
    );
  }
}

module.exports = Regions;
