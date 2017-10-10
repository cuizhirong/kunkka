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

    let {imageType, price, flavor, number, keypairName} = this.props;

    function getData(ele) {
      if (ele && ele.constructor === Object) {
        let obj;
        if (ele.vcpus) {
          obj = ele.name + ' ( ' + ele.vcpus + ' vCPU / '
            + unitConverter(ele.ram, 'MB').num + ' '
            + unitConverter(ele.ram, 'MB').unit
            + ' / ' + ele.disk + ' GB )';
        } else {
          obj = ele.name || '(' + ele.id.slice(0, 8) + ')';
        }
        return obj;
      } else if (ele && ele.constructor === Array) {
        return ele.map(e => e.name || '(' + e.id.slice(0, 8) + ')').join(', ');
      } else {
        switch(ele) {
          case 'psw':
            return 'password';
          case 'keypair':
            return 'keypair / ' + keypairName;
          default:
            return ele;
        }
      }
    }

    let numPrice = price;
    let monthlyPrice = price;

    let enableCharge = HALO.settings.enable_charge;

    if (enableCharge && flavor) {
      let type = flavor.name;
      if (HALO.prices) {
        price = HALO.prices['instance:' + type] ? HALO.prices['instance:' + type].unit_price.price.segmented[0].price : HALO.prices[type].unit_price.price.segmented[0].price;
        numPrice = (Number(price) * number).toFixed(4);
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
                        <td className={ele.key}>{this.props[imageType] && getData(this.props[ele.key])}</td>
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
