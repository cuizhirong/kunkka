require('./style/index.less');

const React = require('react');
const Topology = require('../../components/topology/index');

const request = require('./request');
const msgEvent = require('client/applications/dashboard/cores/msg_event');

let t = null;

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
