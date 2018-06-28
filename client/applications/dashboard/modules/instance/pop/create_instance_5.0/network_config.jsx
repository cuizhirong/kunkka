const React = require('react');
const ReactDOM = require('react-dom');

const getStatusIcon = require('../../../../utils/status_icon');

let networkTip;

class NetworkConfig extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedKey: 'network',
      networkUnfold: false,
      networkIds: [],
      selectedNetworks: [],
      portIds: [],
      selectedPorts: []
    };

    try {
      networkTip = document.createElement('div');
      networkTip.id = 'network_tip_holder';
      document.body.appendChild(networkTip);
    } catch (error) {
      return;
    }

    ['foldNetworkOptions', 'unfoldNetworkOptions', 'onSelectNetwork'].forEach(m => this[m] = this[m].bind(this));
  }

  onClickTab(key) {
    this.setState({
      selectedKey: key
    });
  }

  onMouseOverItem(item, isPort, e) {
    let ct = e.currentTarget;

    let style = {
      top: ct.getBoundingClientRect().top + 'px',
      left: ct.getBoundingClientRect().left + ct.clientWidth + 'px',
      zIndex: 999,
      background: '#FFFFFF',
      boxShadow: '0 0 8px 2px rgba(234,234,234,0.50)',
      borderRadius: '2px',
      padding: '20px'
    };

    let data = [];
    if (!isPort) item.subnets.forEach(sub => sub.name ? data.push(sub.name) : data.push('(' + sub.id.substring(0, 8) + ')'));
    else item.fixed_ips.forEach(ip => data.push(item.ip_address));


    ReactDOM.render(<div className="tip-wrapper" style={style}>
      <div className="wrapper">
        <div className="tip-label">{__.name + ': '}</div>
        <div className="tip-content">{item.name}</div>
      </div>
      <div className="wrapper">
        <div className="tip-label">{__.id + ': '}</div>
        <div className="tip-content">{item.id}</div>
      </div>
      <div className="wrapper">
        <div className="tip-label">{(isPort ? __.address_ip : __.subnet) + ': '}</div>
        <div className="tip-content">{data.join(', ')}</div>
      </div>
      <div className="wrapper">
        <div className="tip-label">{__.security + __.restrict + ': '}</div>
        <div className="tip-content">{item.port_security_enabled ? __.on : __.off}</div>
      </div>
      <div className="wrapper">
        <div className="tip-label">{__.status + ': '}</div>
        <div className="tip-content">{getStatusIcon(item.status)}</div>
      </div>
    </div>, networkTip);
  }

  onMouseLeaveItem() {
    if(networkTip.childNodes.length > 0) {
      ReactDOM.unmountComponentAtNode(networkTip);
    }
  }

  unfoldNetworkOptions(e) {
    this.setState({
      networkUnfold: true
    });

    document.addEventListener('mouseup', this.foldNetworkOptions, false);
    this.refs.drop_network.addEventListener('mouseup', this.preventFoldNetworkOptions, false);
  }

  preventFoldNetworkOptions(e) {
    e.stopPropagation();
  }

  foldNetworkOptions(e) {
    this.setState({
      networkUnfold: false
    });

    document.removeEventListener('mouseup', this.foldNetworkOptions, false);
    this.refs.drop_network.removeEventListener('mouseup', this.preventFoldNetworkOptions, false);
  }

  onSelectNetwork(network) {
    let ids = this.state.networkIds,
      networks = this.state.selectedNetworks,
      index = this.state.networkIds.indexOf(network.id);

    if (index === -1) {
      ids.push(network.id);
      networks.push(network);
    } else {
      ids.splice(index, 1);
      networks.splice(index, 1);
    }

    this.setState({
      networkIds: ids,
      selectedNetworks: networks
    }, this.props.onChange && this.props.onChange(networks, 'network'));
  }

  renderNetwork(props, state) {
    const selects = this.state.selectedNetworks;
    let hasSelects = selects && selects.length > 0;
    return <div className="network">
      <div className="network-dropdown-overview" onClick={this.unfoldNetworkOptions}>
        {hasSelects ?
          selects.map(ele => <div key={ele.id} className="overview-data" onClick={this.onSelectNetwork.bind(this, ele)}>
            <span>{ele.name}</span>
            <i className="glyphicon icon-close"/>
          </div>)
        : <div className="no-selected">{__.no_selected_nt}</div>}
      </div>
      <div ref="drop_network" className={state.networkUnfold ? 'dropdown' : 'hide'}>
        {props.networks.length > 0 ? props.networks.map(net => <div key={net.id}
          className="network-dropdown"
          onClick={this.onSelectNetwork.bind(this, net)}
          onMouseOver={this.onMouseOverItem.bind(this, net, false)}
          onMouseLeave={this.onMouseLeaveItem.bind(this)}>
          <div className="checkbox">
            <input value={net.id}
              type="checkbox"
              onChange={() => {}}
              checked={state.networkIds.indexOf(net.id) !== -1} />
          </div>
          <span>{net.name}</span>
        </div>) : <div className="no-data">{__.no_resources.replace('{0}', __.data)}</div>}
      </div>
    </div>;
  }

  onSelectPort(port) {
    let ids = this.state.portIds,
      ports = this.state.selectedPorts,
      index = this.state.portIds.indexOf(port.id);

    if (index === -1) {
      ids.push(port.id);
      ports.push(port);
    } else {
      ids.splice(index, 1);
      ports.splice(index, 1);
    }

    this.setState({
      portIds: ids,
      selectedPorts: ports
    }, this.props.onChange && this.props.onChange(ports, 'port'));
  }

  renderPort(props, state) {
    const selects = this.state.selectedPorts;
    let hasSelects = selects && selects.length > 0;

    return <div className="port">
      <div className="network-dropdown-overview" onClick={this.unfoldNetworkOptions}>
        {hasSelects ?
          selects.map(ele => <div key={ele.id} className="overview-data" onClick={this.onSelectPort.bind(this, ele)}>
            <span>{ele.name}</span>
            <i className="glyphicon icon-close"/>
          </div>)
        : <div className="no-selected">{__.no_selected_pt}</div>}
      </div>
      <div ref="drop_network" className={state.networkUnfold ? 'dropdown' : 'hide'}>
        {props.ports.length > 0 ? props.ports.map(port => <div key={port.id}
          className="network-dropdown"
          onClick={this.onSelectPort.bind(this, port)}
          onMouseOver={this.onMouseOverItem.bind(this, port, true)}
          onMouseLeave={this.onMouseLeaveItem.bind(this)}>
          <div className="checkbox">
            <input value={port.id}
              type="checkbox"
              onChange={() => {}}
              checked={state.portIds.indexOf(port.id) !== -1} />
          </div>
          <span>{port.name}</span>
        </div>) : <div className="no-data">{__.no_resources.replace('{0}', __.data)}</div>}
      </div>
    </div>;
  }

  render() {
    let state = this.state,
      props = this.props;

    let networkClass = state.selectedKey === 'network' ? 'tab-item selected' : 'tab-item',
      portClass = state.selectedKey === 'port' ? 'tab-item selected' : 'tab-item',
      networkFunc = state.selectedKey === 'network' ? null : this.onClickTab.bind(this, 'network'),
      portFunc = state.selectedKey === 'port' ? null : this.onClickTab.bind(this, 'port');

    return <div className="network-config">
      <div className="tab">
        <div className={networkClass}
          onClick={networkFunc}>{__.network}</div>
        <div className={portClass}
          onClick={portFunc}>{__.port}</div>
      </div>
      {state.selectedKey === 'network' ? this.renderNetwork(props.prevState, state) : this.renderPort(props.prevState, state)}
    </div>;
  }
}

module.exports = NetworkConfig;
