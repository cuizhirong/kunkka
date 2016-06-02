require('./style/index.less');

var React = require('react');
var Topology = require('../../components/topology/index');

var request = require('./request');
var msgEvent = require('client/applications/dashboard/cores/msg_event');

var t = null;

class Model extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    request.getList().then((data) => {
      t = new Topology(this.refs.c, data);
      t.render();
    });

    msgEvent.on('dataChange', (data) => {
      if (this.props.style.display !== 'none') {
        switch (data.resource_type) {
          case 'instance':
          case 'nwtwork':
          case 'subnet':
          case 'router':
          case 'floatingip':
            request.getList().then((_data) => {
              t.reRender(_data);
            });
            break;
          default:
            break;
        }
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none') {
      request.getList().then((data) => {
        t.reRender(data);
      });
    }
  }

  render() {
    return (
      <div className="halo-module-topology" style={this.props.style}>
        <div ref="c" className="c">
          <div className="loading glyphicon icon-loading"></div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
