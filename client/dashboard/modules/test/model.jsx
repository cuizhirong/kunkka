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
    this.tableColRender(this.state.config.table.column);
  }

  tableColRender(columns) {
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
              </span> : '';
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

  onInitialize(params) {
    // 初始化时，如果params长度为2，就不管
    // 如果初始化时，params长度为3就render detail
    request.getList((res) => {
      var table = this.state.config.table;
      table.data = res.servers;
      table.loading = false;

      this.setState({
        config: config
      });
    });
  }


  onAction(field, actionType, refs, data) {

    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs) {
    console.log('button key: ', key);
  }

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });

  }

  btnListRender(rows, btns) {
    for(let key in btns) {
      switch (key) {
        case 'vnc_console':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'active') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'power_on':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'shutoff') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'power_off':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'active') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'reboot':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'active') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'instance_snapshot':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'resize':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    // this.onAction();
  }

  render() {
    return (
      <div className="halo-module-test" style={this.props.style}>
        <Main
          ref="dashboard"
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }

}

module.exports = Model;
