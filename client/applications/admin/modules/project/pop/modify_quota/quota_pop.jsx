require('./style/index.less');

var React = require('react');
var __ = require('locale/client/admin.lang.json');
var unitConverter = require('client/utils/unit_converter');
var request = require('../../request');

class QuotaPop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      quota: [],
      value: '',
      itemName: this.props.overview,
      overview: {}
    };
  }

  componentWillMount() {
    var quota = [{
      title: __.compute,
      items: [{
        title: __.instance,
        key: 'instances',
        link: 'instance'
      }, {
        title: __.keypair,
        key: 'key_pairs',
        link: 'keypair'
      }, {
        title: __.cpu,
        key: 'cores'
      }, {
        title: __.ram + __.unit_gb,
        key: 'ram'
      }]
    }, {
      title: __.network,
      items: [{
        title: __.network,
        key: 'network',
        link: 'network'
      }, {
        title: __.subnet,
        key: 'subnet',
        link: 'subnet'
      }, {
        title: __['floating-ip'],
        key: 'floatingip',
        link: 'floating-ip'
      }, {
        title: __.port,
        key: 'port',
        link: 'port'
      }, {
        title: __.router,
        key: 'router',
        link: 'router'
      }, {
        title: __.security_group,
        key: 'security_group',
        link: 'security-group'
      }]
    }, {
      title: __.storage,
      items: [{
        title: __.ssd + __.volume,
        key: 'volumes_ssd',
        link: 'volume'
      }, {
        title: __.sata + __.volume,
        key: 'volumes_sata',
        link: 'volume'
      }, {
        title: __.ssd + __.volume + __.gigabyte + __.unit_gb,
        key: 'gigabytes_ssd',
        link: 'volume'
      }, {
        title: __.sata + __.volume + __.gigabyte + __.unit_gb,
        key: 'gigabytes_sata',
        link: 'volume'
      }, {
        title: __.ssd + __.snapshot,
        key: 'snapshots_ssd',
        link: 'snapshot'
      }, {
        title: __.sata + __.snapshot,
        key: 'snapshots_sata',
        link: 'snapshot'
      }]
    }];

    this.setState({
      quota: quota
    });
  }

  componentDidMount() {
    request.getQuotas(this.props.rawItem.id).then((res) => {
      this.setState({
        overview: res.overview_usage
      });
    });
  }

  onChange(key, e) {
    var total = this.state.overview[key].total;
    var newNumber = Number(e.target.value);
    if (!e.target.value) {
      this.state.itemName[key].total = total;
    } else {
      if (key === 'ram') {
        if (newNumber > 0) {
          newNumber *= 1024;
        }
      }
      this.state.itemName[key].total = Number(total) + newNumber;
    }
    this.setState({
      value: e.target.value,
      itemName: this.state.itemName
    });
  }

  render() {
    var quota = this.state.quota,
      overview = this.state.overview;

    return (
      <div className="halo-com-modal-modify-quota">
        <div className="content">
          {quota.map((ele, index) =>
            <div key={index}>
              <h3>{ele.title}</h3>
              <ul className="quota-list">
                {ele.items.map((item, i) => {
                  var used, total, inUse, inUseClassName;

                  if (overview[item.key]) {
                    if (overview[item.key].total > -1) {
                      total = overview[item.key].total;
                    } else {
                      total = __.infinity;
                    }
                    used = overview[item.key].used;
                    inUse = used / total * 100;

                    if (isNaN(inUse)) {
                      inUse = 0;
                    }
                    if (inUse > 100) {
                      inUse = 100;
                    }
                  } else {
                    total = 0;
                    used = 0;
                    inUse = 0;
                  }

                  if (item.key === 'ram' && overview[item.key]) {
                    if (typeof total === 'number') {
                      let _all = unitConverter(total, 'MB');
                      total = _all.num + _all.unit[0];
                    }
                    let _used = unitConverter(used, 'MB');
                    used = _used.num + _used.unit[0];
                  }

                  if (inUse >= 80) {
                    inUseClassName = 'in-shortage';
                  } else if (inUse >= 50) {
                    inUseClassName = 'in-general';
                  }

                  return (
                    <li key={i}>
                      <div>
                        <div className="description">
                          <div>{item.title}</div>
                          <div>{used + ' / ' + total}</div>
                        </div>
                        <div className="stripe">
                          <div className={inUseClassName} style={{width: inUse + '%'}}/>
                        </div>
                      </div>
                      <div><input onChange={this.onChange.bind(this, item.key)} placeholder={__.quantity}/></div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
}

function popQuota(config) {
  return <QuotaPop refs="quota" {...config} />;
}

module.exports = popQuota;
