require('./style/index.less');

var React = require('react');

var __ = require('locale/client/dashboard.lang.json');
var unitConverter = require('client/utils/unit_converter');

class ResourceQuota extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      quota: []
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
        title: __['security-group'],
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

  render() {
    var quota = this.state.quota,
      overview = this.props.overview;

    return (
      <div className="resource-quota">
        <div className="title">{__.resource + __.quota}</div>
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
                      <div className="description">
                        <div>{item.title}</div>
                        <div>{used + ' / ' + total}</div>
                      </div>
                      <div className="stripe">
                        <div className={inUseClassName} style={{width: inUse + '%'}}/>
                      </div>
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

module.exports = ResourceQuota;
