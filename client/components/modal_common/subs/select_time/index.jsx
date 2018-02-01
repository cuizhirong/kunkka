/**
 *  用法：
 *
 *  {
 *    type: 'select_time',
 *    range: false, // true - 起止时间 ， false - 单个时间
 *    value: {start: '2016-01-15', end: '2018-02-01'}, // 如果是起止时间，value为object，反之为字符串.
 *    field: 'range_time', // 唯一标识
 *    hide: true //是否隐藏
 *  }
 */

const React = require('react');
const {Calendar} = require('uskin');

class SelectTime extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      range: props.range,
      hide: props.hide
    };

    ['onChangeStartTime', 'onChangeEndTime', 'onChangeTime'].forEach(func => {
      this[func] = this[func].bind(this);
    });
    this.time = (new Date()).getTime();
  }

  componentWilMount() {
    const props = this.props;
    if(!props.value) {
      this.setState({
        value: props.range ? {} : ''
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let now = (new Date()).getTime();
    if (nextState.value === null && (now - this.time < 50)) {
      return false;
    } else {
      return true;
    }
  }

  componentDidUpdate() {
    this.time = (new Date()).getTime();
    this.props.onAction(this.props.field, this.state);
  }

  onChangeStartTime(time) {
    let value = this.state.value;
    if(!value) {
      value = {};
    }
    value.start = `${time.year}-${time.month}-${time.date}`;
    this.setState({
      value: value
    });
  }

  onChangeEndTime(time) {
    let value = this.state.value;
    if(!value) {
      value = {};
    }
    value.end = `${time.year}-${time.month}-${time.date}`;
    this.setState({
      value: value
    });
  }

  onChangeTime(time) {
    this.setState({
      value: `${time.year}-${time.month}-${time.date}`
    });
  }

  renderTimes() {
    const props = this.props;
    const __ = props.__;
    return props.range ? <div>
      <Calendar
        key={1}
        width={'150px'}
        onChange={this.onChangeStartTime}
        selectData={props.value.start || ''}
        hasScreen={true}
        unfold={false}
        placeholder={__.please_select_time} />
      <div className="division">{__.to}</div>
      <Calendar
        key={2}
        width={'150px'}
        onChange={this.onChangeEndTime}
        selectData={props.value.end || ''}
        hasScreen={true}
        unfold={false}
        placeholder={__.please_select_time} />
    </div> : <div>
      <Calendar
        width={'100%'}
        onChange={this.onChangeTime}
        selectData={props.value || ''}
        hasScreen={true}
        unfold={false}
        placeholder={__.please_select_time} />
    </div>;
  }

  render() {
    let props = this.props,
      state = this.state;
    let className = 'modal-row select-time-row';
    if (props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (state.hide) {
      className += ' hide';
    }

    return (
      <div className={className}>
        <div>
          {
            props.required && <strong>*</strong>
          }
          {props.label}
        </div>
        {this.renderTimes()}
      </div>
    );
  }
}

SelectTime.defaultProps = {
  range: false,
  value: '',
  disabled: false,
  hide: false
};

module.exports = SelectTime;
