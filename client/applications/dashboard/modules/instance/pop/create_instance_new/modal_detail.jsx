const React = require('react');
const __ = require('locale/client/dashboard.lang.json');
const constant = require('./constant');
const unitConverter = require('client/utils/unit_converter');

class DetailModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShow: false
    };
  }

  onChangeShow() {
    let func = this.props.onAction;
    func && func();

    this.setState({
      isShow: !this.state.isShow
    });
  }

  render() {
    let className = 'modal-detail';
    className += this.state.isShow ? '' : ' hide';

    let {imageType, price, flavor, keypairName} = this.props;
    let state = this.state;

    function getData(props, key) {
      let ele = props[key];

      switch(key) {
        case 'image':
          return props[imageType].name || '(' + props[imageType].id.slice(0, 8) + ')';
        case 'flavor':
          return ele.name + ' ( ' + ele.vcpus + ' vCPU / '
            + unitConverter(ele.ram, 'MB').num + ' '
            + unitConverter(ele.ram, 'MB').unit
            + ' / ' + ele.disk + ' GB )';
        case 'network':
          return <div>
            <div>{ele.length > 0 && __.network + '(' + ele.map(e => e.name || '(' + e.id.slice(0, 8) + ')').join(', ') + ')'}</div>
            <div>{props.port.length > 0 && __.port + '(' + props.port.map(p => p.name || '(' + p.id.slice(0, 8) + ')').join(', ') + ')'}</div>
          </div>;
        case 'securityGroup':
          return ele.map(e => e.name || '(' + e.id.slice(0, 8) + ')').join(', ');
        case 'credential':
          return ele === 'psw' ? 'password' : 'keypair / ' + keypairName;
        default:
          return ele;
      }
    }

    let numPrice = price;
    let monthlyPrice = price;

    let enableCharge = HALO.settings.enable_charge;

    if (enableCharge && flavor) {
      let type = flavor.name;
      if (HALO.prices) {
        price = HALO.prices.compute[type] ? HALO.prices.compute[type] : 0;
        numPrice = (Number(price) * state.number).toFixed(4);
        monthlyPrice = (Number(numPrice) * 24 * 30).toFixed(4);
      }
    }

    return (
      <div className={className} key="detail-label">
        <div className="detail-label" onClick={this.onChangeShow.bind(this)}>
          <i className="glyphicon icon-arrow-left"/>
        </div>
        <div className="detail-data">
          <div className="detail-hd"></div>
          <div className="detail-bd">
            <h6>{__.config_details}</h6>
            <div className="detail-bd-table">
              <table>
                <tbody>
                  {
                    constant.tableColume.map(ele =>
                      <tr key={ele.key}>
                        <td>{ele.value}</td>
                        <td className={ele.key}>{this.props[imageType] && getData(this.props, ele.key)}</td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
            </div>
          </div>
          {
            enableCharge ?
              <div className="detail-ft">
                <div>{__.total}<p>¥ {numPrice}</p> / {__.hour}</div>
                <div><p>¥ {monthlyPrice}</p> / {__.month}</div>
              </div>
            : false
          }
        </div>
      </div>
    );
  }
}

module.exports = DetailModal;
