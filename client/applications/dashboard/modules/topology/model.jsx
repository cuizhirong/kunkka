require('./style/index.less');

const React = require('react');
const Topology = require('client/components/topology/index');
const download = require('client/components/topology/utils/download');
const Button = require('client/uskin/index').Button;
const __ = require('locale/client/dashboard.lang.json');

const request = require('./request');
const msgEvent = require('client/applications/dashboard/cores/msg_event');
const FILENAME = 'topology.png';
const nullHref = 'javascript: void(0)'; // eslint-disable-line

let t = null;

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      href: nullHref
    };
  }

  componentDidMount() {
    request.getList().then((data) => {
      t = new Topology(this.refs.c, data);
      t.render(() => {
        this.setState({
          loading: false
        }, () => {
          this.initHref();
        });
      });
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
              this.initHref();
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
        this.initHref();
      });
    }
  }

  refresh() {
    this.setState({
      loading: true,
      href: nullHref
    }, () => {
      request.getList(true).then((data) => {
        this.setState({
          loading: false
        }, () => {
          t.reRender(data);
          this.initHref();
        });
      });
    });
  }

  initHref() {
    const canvas = document.getElementById('tp');
    download(canvas.toDataURL('image/png')).then((href) => {
      this.setState({
        href: href
      });
    }).catch(e => {
      this.setState({
        href: e
      });
    });
  }

  render() {
    let state = this.state;
    return (
      <div className="halo-module-topology" style={this.props.style}>
        <div className="wrapper">
          <a className={'download ' + (state.loading ? 'disabled' : '')}
            /* if has a filename, will download even if the href is javascript: void(0) */
            download={state.loading ? null : FILENAME}
            href={state.href}
          >
            <i className="glyphicon icon-download"></i>{__.click_to_download}
          </a>
          <Button initial={true} onClick={this.refresh.bind(this)} disabled={state.loading} iconClass="refresh" />
        </div>
        <div ref="c" className="c" id="c">
          <div className={'loading-wrapper ' + (state.loading ? '' : 'hide')}>
            <div className="loading glyphicon icon-loading"></div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Model;
