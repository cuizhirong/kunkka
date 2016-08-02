require('./style/index.less');

var React = require('react');
var Slider = require('client/uskin/index').Slider;
var __ = require('locale/client/dashboard.lang.json');

class ComSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventType: null
    };
  }

  onChange(e, value) {
    this.setState({
      eventType: e.type
    });
    this.props.onChange && this.props.onChange(value);
  }

  render() {
    var className = 'halo-pop-com-slider modal-row';
    if (this.props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (this.props.hide) {
      className += ' hide';
    }

    return (
      <div className="halo-pop-com-slider modal-row">
        <div className="slider-label">
          {this.props.required && <strong>*</strong>}
          {__[this.props.field]}
        </div>
        <div className="slider-content">
          <Slider
            min={10000}
            max={HALO.settings.listener_max_connection}
            step={10000}
            value={this.props.value}
            onChange={this.onChange.bind(this)} />
          <div className="value-range">{10000 + '~' + HALO.settings.listener_max_connection + ' / ' + __.current + ':' + this.props.value}</div>
        </div>
      </div>
    );
  }
}

function popSlider(config) {
  return <ComSlider ref="slider" {...config} />;
}

module.exports = popSlider;
