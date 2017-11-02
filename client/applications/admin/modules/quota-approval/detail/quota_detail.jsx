require('./style/index.less');

const React = require('react');
const __ = require('locale/client/admin.lang.json');
const unitConverter = require('client/utils/unit_converter');

class QuotaDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      quota: [],
      value: '',
      originQuota: this.props.originQuota,
      addedQuota: this.props.addedQuota
    };
  }

  componentWillMount() {
    let types = ['ssd', 'sata'];
    let quota = [{
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
        title: __.loadbalancer,
        key: 'loadbalancer',
        link: 'loadbalancer'
      }, {
        title: __.listener,
        key: 'listener',
        link: 'listener'
      }, {
        title: __.pool,
        key: 'pool',
        link: 'pool'
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
        title: __.all_volumes,
        key: 'volumes',
        link: 'volumes'
      }, {
        title: __.all_gigabytes,
        key: 'gigabytes',
        link: 'gigabytes'
      }]
    }];

    types.forEach((item) => {
      quota[2].items.push({
        title: __[item] + __.volume,
        key: 'volumes_' + item,
        link: 'volume'
      });
      quota[2].items.push({
        title: __[item] + __.volume + __.gigabyte + __.unit_gb,
        key: 'gigabytes_' + item,
        link: 'volume'
      });
      quota[2].items.push({
        title: __[item] + __.snapshot,
        key: 'snapshots_' + item,
        link: 'snapshot'
      });
    });

    this.setState({
      quota: quota
    });
  }

  render() {
    let quota = this.state.quota,
      originQuota = this.state.originQuota,
      addedQuota = this.state.addedQuota;

    return (
      <div className="halo-com-quota-detail">
        <div className="content">
          {quota.map((ele, index) =>
            <div key={index}>
              <h3>{ele.title}</h3>
              <ul className="quota-list clearfix">
              {ele.items.map((item, i) => {
                let used, total, inUse, inUseClassName, appliedAmount;

                if(addedQuota[item.key] === -1) {
                  appliedAmount = __.infinity;
                } else {
                  appliedAmount = addedQuota[item.key];
                }

                if (originQuota[item.key]) {
                  if (originQuota[item.key].total > -1) {
                    total = originQuota[item.key].total;
                  } else {
                    total = __.infinity;
                  }
                  used = originQuota[item.key].used;
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

                if (item.key === 'ram' && originQuota[item.key]) {
                  if (typeof total === 'number') {
                    let _all = unitConverter(total, 'MB');
                    total = _all.num + _all.unit[0];
                    let _apply = unitConverter(appliedAmount, 'MB');
                    appliedAmount = _apply.num + _apply.unit[0];
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
                    <div className="applied-amount">{__.quota_of_application}： {appliedAmount}</div>
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

module.exports = QuotaDetail;
