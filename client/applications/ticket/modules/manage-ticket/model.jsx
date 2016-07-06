require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/index');

var moment = require('client/libs/moment');
var __ = require('locale/client/ticket.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
    };

  }

  render() {
    return (
      <div className="halo-module-manage-tickets"
      style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display ===
          'none' ? false : true}
          __={__}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }
}

module.exports = Model;
