const React = require('react');
const ReactDOM = require('react-dom');
const constant = require('./constant');

const __ = require('locale/client/dashboard.lang.json');
const {InputNumber, Tooltip} = require('client/uskin/index');

class VolumeTip extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: 'yes',
      deleteVolume: 'yes',
      deviceName: 'vda',
      deviceSize: props.deviceSize
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      deviceSize: nextProps.deviceSize
    });
  }

  onOverItem(content, contentHeight, e) {
    let ct = e.currentTarget;

    if (content && contentHeight) {
      let style = {
        top: ct.getBoundingClientRect().top + contentHeight + 'px',
        left: ct.getBoundingClientRect().left - 10 + 'px'
      };

      ReactDOM.render(<div className="tip-wrapper" style={style}>
        <Tooltip content={content} width={200} shape="bottom-left"/>
      </div>, this.props.tooltipHolder);
    }
  }

  onMouseLeaveItem() {
    if(this.props.tooltipHolder.childNodes.length > 0) {
      ReactDOM.unmountComponentAtNode(this.props.tooltipHolder);
    }
  }

  onChangeSwitch(key, eleKey) {
    this.setState({
      [eleKey]: key
    });
  }

  renderSwitch(props, state, key) {
    return (
      <div className="switch" >
        {
          constant.switchData.map(ele =>
            <p key={ele.key}
              className={ele.key === state[key] ? 'switch-inner checked' : 'switch-inner'}
              onClick={ele.key === state[key] ? null : this.onChangeSwitch.bind(this, ele.key, key)}>
              {ele.value}
            </p>
          )
        }
      </div>
    );
  }

  onChangeName(e) {
    this.setState({
      deviceName: e.target.value
    });
  }

  onChangeNumber(value) {
    this.setState({
      deviceSize: value
    });
  }

  render() {
    let props = this.props,
      {state} = props;

    let checked = this.state.checked === 'yes',
      className = 'row row-tab row-tab-single row-tab-tooltip',
      doc = document.getElementById(state.imageType);

    let volumeTip = ['bootableVolume', 'volumeSnapshot'];

    className += checked ? '' : ' hide';
    let tipClassName = volumeTip.indexOf(state.imageType) !== -1 ? 'hide' : '';

    let inputStyle = {
      width: '166px',
      height: '14px',
      padding: '6px 12px'
    };

    let tipData = [{
      key: 'device_name',
      value: __.device_name,
      content: <input style={inputStyle} onChange={this.onChangeName.bind(this)} value={this.state.deviceName} placeholder={__.pls_enter + __.device_name} />
    }, {
      key: 'volume_size',
      value: __.volume_size,
      content: <InputNumber onChange={this.onChangeNumber.bind(this)} disabled={state.disabledNumber} min={1} value={this.state.deviceSize} width={84}/>
    }, {
      key: 'delete_volume_tip',
      value: __.delete_volume_tip,
      content: this.renderSwitch(props, this.state, 'deleteVolume')
    }];

    if (doc) {
      doc.style.height = checked && volumeTip.indexOf(state.imageType) === -1 ? '210px' : '300px';
    }

    return (
      <div>
        <div className={tipClassName}>
          <div className="row row-tab row-tab-single row-tab-volumes" id="volumeTip" style={{color: '#6C777A'}}>
            <div className="modal-label-volume">
              {__.create_new_volume}
              <i className="glyphicon icon-help" onMouseOver={this.onOverItem.bind(this, __.create_new_volume_tip, 80)} onMouseLeave={this.onMouseLeaveItem.bind(this)}></i>
            </div>
            {this.renderSwitch(props, this.state, 'checked')}
          </div>
          <div className={className} key="tips">
            <div className="modal-data-volume">
              <div className="modal-tooltip tooltip-bottom-left">
                {
                  tipData.map(ele =>
                    <div className="tip-wrapper" key={ele.key}>
                      <div style={{marginRight: '12px'}}>{ele.value}</div>
                      {ele.content}
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>
        <div className={volumeTip.indexOf(state.imageType) !== -1 ? '' : 'hide'}>
          <div className="row row-tab row-tab-single row-tab-tooltip" key="tips">
            <div className="modal-data-volume">
              <div className="tip-wrapper" style={{marginTop: '12px'}}>
                <div style={{marginRight: '12px'}}>{__.delete_volume_tip}</div>
                {this.renderSwitch(props, this.state, 'deleteVolume')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = VolumeTip;
