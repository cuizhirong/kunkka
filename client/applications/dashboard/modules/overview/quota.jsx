require('./style/index.less');

const React = require('react');
const {Button} = require('client/uskin/index');
const getQuotaItems = require('client/utils/get_quota_items');

const unitConverter = require('client/utils/unit_converter');

class ResourceQuota extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      quota: []
    };
  }

  componentWillMount() {
    this.setState({
      quota: this.initQuota()
    });
  }

  initQuota() {
    return getQuotaItems([], __);
  }

  componentWillReceiveProps(nextProps) {
    let quota;
    this.setState({
      quota: this.initQuota()
    }, () => {
      quota = this.state.quota;
      nextProps.types.forEach((item) => {
        quota[2].items.push({
          title: (__[item] ? __[item] : item) + __.volume,
          key: 'volumes_' + item
        });
        quota[2].items.push({
          title: (__[item] ? __[item] : item) + __.volume + __.gigabyte + __.unit_gb,
          key: 'gigabytes_' + item
        });
        quota[2].items.push({
          title: (__[item] ? __[item] : item) + __.snapshot,
          key: 'snapshots_' + item
        });
      });

      this.setState({
        quota: quota
      });
    });
  }

  onBtnClick() {
    this.props.onBtnClick();
  }

  render() {
    let overview = this.props.overview,
      quota = this.state.quota;

    let applyBtnConfig = {
      value: __.apply_quota,
      key: 'apply',
      icon: 'create',
      type: 'create',
      onClick: this.onBtnClick.bind(this)
    };

    return (
      <div className="resource-quota">
        <div className="title">
          <div>{__.resource + __.quota}</div>
          {this.props.hideBtn ? null : <Button {...applyBtnConfig} />}
        </div>
        <div className="content">
          {quota.map((ele, index) =>
            <div key={index}>
              <h3>{ele.title}</h3>
              <ul className="quota-list clearfix">
                {ele.items.map((item, i) => {
                  let used, total, inUse, inUseClassName;

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
