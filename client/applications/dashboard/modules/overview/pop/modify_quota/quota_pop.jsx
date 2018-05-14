require('./style/index.less');

const React = require('react');
const __ = require('locale/client/dashboard.lang.json');
const getQuotaItems = require('client/utils/get_quota_items');
const unitConverter = require('client/utils/unit_converter');

class QuotaPop extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      quota: [],
      value: '',
      overview: this.props.overview,
      targetQuota: this.props.targetQuota,
      addedQuota: this.props.addedQuota
    };
  }

  componentWillMount() {
    let types = this.props.types;

    this.setState({
      quota: getQuotaItems(types, __)
    });
  }

  onChange(key, e) {
    let overview = this.state.overview;
    let total = overview[key].total;
    let newNumber = Number(e.target.value);
    if (!isNaN(newNumber) && e.target.value.trim() !== '') {
      if (key === 'ram') {
        newNumber *= 1024;
      }

      if(total !== -1) {
        this.state.targetQuota[key].total = Number(total) + newNumber;
      }
      this.state.targetQuota[key].isChanged = true;
      this.state.addedQuota[key] = newNumber;
    } else {
      this.state.targetQuota[key].total = total;
      this.state.targetQuota[key].isChanged = false;
      this.state.addedQuota[key] = 0;
    }

    this.setState({
      value: e.target.value,
      addedQuota: this.state.addedQuota,
      targetQuota: this.state.targetQuota
    });
  }

  render() {
    let quota = this.state.quota,
      overview = this.state.overview;

    return (
      <div className="halo-com-modal-modify-quota">
        <div className="content">
          {quota.map((ele, index) =>
            <div key={index}>
              <h3>{ele.title}</h3>
              <ul className="quota-list">
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
