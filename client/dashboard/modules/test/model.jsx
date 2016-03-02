require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var request = require('./request');
var config = require('./config.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

  }

  componentWillMount() {
    this.onInitialize();
  }

  onInitialize() {
    this.setTableColRender(this.state.config.table.column);
    this.updateData();
  }

  onAction(obj) {
    var {comType, actionType, refs, data} = obj;
    switch(comType) {
      case 'btns':
        this.clickBtns(data, refs);
        break;
      case 'table':
        this.clickTable(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  clickTable(actionType, refs, data) {
    switch(actionType) {
      case 'check':
        this.clickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  componentDidMount() {

  }

  updateData() {
    request.listInstances((res) => {
      var table = this.state.config.table;
      table.data = res.servers;
      table.loading = false;

      this.setState({
        config: config
      });
    });
  }

  setTableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'image':
          column.render = (col, item, i) => {
            return item.image ?
              <a data-type="router" href={'/project/image/' + item.image.id}>{item.image.name}</a> : '';
          };
          break;
        case 'ip_address':
          column.render = (col, item, i) => {
            var str = '';
            if (item.addresses.private) {
              item.addresses.private.forEach((_item, index) => {
                if (_item.version === 4 && _item['OS-EXT-IPS:type'] === 'fixed') {
                  str += (index > 0) ? ', ' + _item.addr : _item.addr;
                }
              });
            }
            return str;
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item.floating_ip ?
              <span>
                <i className="glyphicon icon-floating-ip" />
                <a data-type="router" href={'/project/floating-ip/' + item.floating_ip.id}>
                  {item.floating_ip.floating_ip_address}
                </a>
              </span>
              : '';
          };
          break;
        case 'instance_type':
          column.render = (col, item, i) => {
            return item.flavor ? item.flavor.name : '';
          };
          break;
        default:
          break;
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  clickBtns(data, refs) {
    switch (data.key) {
      default:
        break;
    }
  }

  clickTableCheckbox(refs, data) {
    var {rows} = data;
    var _config = this.state.config;

    _config.btns.map((btn) => {
      switch (btn.key) {
        case 'vnc_console':
          btn.disabled = (rows.length === 1) ? false : true;
          break;
        case 'power_off':
          btn.disabled = (rows.length === 1) ? false : true;
          break;
        default:
          break;
      }
    });

    this.setState({
      config: _config
    });

  }

  render() {
    return (
      <div className="halo-module-test" style={this.props.style}>
        <Main ref="dashboard" onAction={this.onAction} config={this.state.config} params={this.props.params} />
      </div>
    );
  }

}

module.exports = Model;
