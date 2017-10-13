const React = require('react');
const fetch = require('client/libs/fetch');

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
    if (id === HALO.current_region) {
      return;
    }

    fetch.put({
      url: '/auth/switch_region',
      data: {
        'region': id
      }
    }).then((res) => {
      window.location.reload();
    });
  }

  renderRegion() {
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
        { this.state.initialize ? this.renderRegion() : null}
      </ul>
    );
  }
}

module.exports = Regions;
