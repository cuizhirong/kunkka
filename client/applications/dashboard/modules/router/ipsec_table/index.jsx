require('./style/index.less');

var React = require('react');
var {Button, Table, Switch} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');

class IpsecTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      _data: props.tableConfig.data,
      dataContents: props.tableConfig.dataContents
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      toggle: this.props.defaultUnfold
    });
  }

  toggle() {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      _data: nextProps.tableConfig.data,
      dataContents: nextProps.tableConfig.dataContents
    });
  }

  onChange(adminData) {
    var data = {
      id: adminData.id,
      isOpen: !adminData.admin_state_up
    };
    this.props.onAction && this.props.onAction('ipsec', 'check', data);
  }

  onDetailAction(id, index, action) {
    let _data = {
      rawItem: this.state._data[index],
      id: id
    };
    this.props.onAction && this.props.onAction('ipsec', action, _data);
  }

  render() {
    var state = this.state,
      tableConfig = this.props.tableConfig;
    return (
      <div className="halo-com-ipsec-table">
        <div className="toggle">
          <div className="toggle-title" onClick={this.toggle}>
            {this.props.title}
            <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
          </div>
          <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
            {this.props.children}
            {state._data && state._data.map((data, index) => {
              return (
                <div key={'table' + index}>
                  <div className="table-title">
                    <div className="title">
                      <div>{__.tunnel + ': ' + data.name}</div>
                      <Switch labelOn="ON" labelOff="OFF" checked={data.admin_state_up} onChange={this.onChange.bind(this, data)}/>
                    </div>
                    <div className="list">
                      <Button value={__.edit} onClick={this.onDetailAction.bind(this, data.id, index, 'editIpsec')}/>
                      <Button type="delete" value={__.delete} onClick={this.onDetailAction.bind(this, data.id, index, 'deleteIpsec')}/>
                    </div>
                  </div>
                  <div className="table-info">
                    <div>{__.protocol + ': ' + __.ipsec}</div>
                    <div>{__.tunnel_type + ': ' + __.layer_three}</div>
                    <div>{__.remote_ip + ': ' + data.peer_address}</div>
                    <div>{__.key + ': ' + data.psk}</div>
                    <div>{__.vpn_service + ': ' + data.vpnservice[0].name}</div>
                  </div>
                  <div>
                    <Table
                      column={tableConfig.columns[0]}
                      data={data.ikepolicy}
                      dataKey={tableConfig.dataKey}
                      hover={tableConfig.hover} />
                    <Table
                      column={tableConfig.columns[1]}
                      data={data.ipsecpolicy}
                      dataKey={tableConfig.dataKey}
                      hover={tableConfig.hover} />
                    <Table
                      column={tableConfig.columns[2]}
                      data={state.dataContents[index]}
                      dataKey={tableConfig.dataKey}
                      hover={tableConfig.hover} />
                  </div>
                </div>);
            })}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = IpsecTable;
