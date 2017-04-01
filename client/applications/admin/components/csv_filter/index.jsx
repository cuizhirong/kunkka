require('./style/index.less');

var React = require('react');
var __ = require('locale/client/admin.lang.json');
var Calendar = require('client/uskin/index').Calendar;

class Filter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedKey: [],
      data: props.fields,
      value: {
        fields: [],
        startTime: '',
        endTime: ''
      },
      checkedAll: false
    };

    ['onChangeStartTime', 'onChangeEndTime', 'onCheckAll'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

  }

  componentWillMount() {
    this.initCheckAll();
  }

  componentWillUpdate() {
    this.props.onChange && this.props.onChange(this.state.value);
  }

  onChangeStartTime(time) {
    let date = new Date(time.year + '-' + time.month + '-' + time.date);
    let st = date.getTime();
    let value = this.state.value;
    value.startTime = st;
    this.setState({
      value: value
    }, () => {
      this.setFields(this.state.checkedKey);
    });
  }

  onChangeEndTime(time) {
    let date = new Date(time.year + '-' + time.month + '-' + time.date);
    let et = date.getTime() + 24 * 60 * 60 * 1000;
    let value = this.state.value;
    value.endTime = et;
    this.setState({
      value: value
    }, () => {
      this.setFields(this.state.checkedKey);
    });
  }

  setFields(keys) {
    let fields = [];
    let state = this.state;
    let value = this.state.value;
    keys.forEach((i) => {
      fields.push(state.data[i].name);
    });
    value.fields = fields;
    this.setState({
      value: value
    });
  }

  onCheck(key, e) {
    let checkedKey = this.state.checkedKey,
      i = checkedKey.indexOf(key),
      allKeysCount = this.state.data.length;

    i > -1 ? checkedKey.splice(i, 1) : checkedKey.push(key);

    this.setState({
      checkedAll: checkedKey.length === allKeysCount ? true : false,
      checkedKey: checkedKey
    }, () => {
      this.setFields(this.state.checkedKey);
    });
  }

  initCheckAll() {
    let checkedKey = [],
      allKeysCount = this.state.data.length;
    for(let i = 0; i < allKeysCount; i++) {
      checkedKey.push(i);
    }
    this.setState({
      checkedAll: true,
      checkedKey: checkedKey
    }, () => {
      this.setFields(this.state.checkedKey);
    });
  }

  onCheckAll(e) {
    let checked = e.target.checked,
      checkedKey = [],
      allKeysCount = this.state.data.length;
    if(checked) {
      for(let i = 0; i < allKeysCount; i++) {
        checkedKey.push(i);
      }
    }
    this.setState({
      checkedAll: !this.state.checkedAll,
      checkedKey: checkedKey
    }, () => {
      this.setFields(this.state.checkedKey);
    });
  }

  render() {
    let props = this.props,
      state = this.state;

    return (
      <div className="halo-pop-com-filter">
        <div className="title"><strong>*</strong>{__.select_field_to_export}</div>
        <div className="select-all">
          <input checked={state.checkedAll} type="checkbox" onChange={this.onCheckAll} />&nbsp;全选
        </div>
        <div className="select-field">
        {
          props.fields.length > 0 ? props.fields.map((f, i) => {
            return <div key={i} title={f.label} className="checkbox-wrapper"><input onChange={this.onCheck.bind(this, i)} type="checkbox" checked={state.checkedKey.indexOf(i) > -1} /><div>&nbsp;{f.label}</div></div>;
          }) : null
        }
        </div>
        <div className="hr"></div>
        {
          props.noCalendar ? null : <div className="select-filter">
            <div className="title">请根据条件进行过滤</div>
            <div className="filter">
              <div className="label">起始时间</div>
              <div className="content">
                <Calendar onChange={this.onChangeStartTime} hasScreen={true} unfold={false} placeholder={__.please_select_time} />
              </div>
            </div>
            <div className="filter">
              <div className="label">结束时间</div>
              <div className="content">
                <Calendar onChange={this.onChangeEndTime} hasScreen={true} unfold={false} placeholder={__.please_select_time} />
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
}

function popFilter(config) {
  return <Filter {...config} />;
}

module.exports = popFilter;
