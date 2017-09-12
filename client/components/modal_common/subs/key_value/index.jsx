const React = require('react');
const {Button} = require('uskin');

class KeyValue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hide: !!props.hide,
      disabled: false,
      data: props.data || []
    };

    this.onChange = this.onChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onChange(e) {
    this.props.onAction(this.props.field, this.state);
  }

  onRemove(index, e) {
    let data = this.state.data;
    data.splice(index, 1);

    this.setState({
      data: data
    });

  }

  render() {
    let props = this.props;
    let state = this.state;
    let {__, inputs} = props;
    let that = this;

    let className = 'modal-row input-row label-row key-value';

    if (this.state.hide) {
      className += ' hide';
    }

    let getFixedWidth = (width) => ({
      width,
      maxWidth: width,
      minWidth: width
    });

    return (
      <div className={className}>
        <div>
          {props.label}
        </div>
        <div>
          {
            state.data.map((ele, index) => (
              <div key={ele.key} className="input-data">
                <div className="item">
                  {ele.key}
                </div>
                <div className="item">
                  {ele.value}
                </div>
                <div className="item">
                  <i className="glyphicon icon-remove remove-operation" onClick={that.onRemove.bind(that, index)} />
                </div>
              </div>
            ))
          }
          <div className="input-area">
            {
              inputs.map((ele) => (
                <div key={ele.key} style={ele.width && getFixedWidth(ele.width)}>
                  {ele.content}
                </div>
              ))
            }
            <Button value={__.add} disabled={state.disabled} type="create" onClick={this.onChange} />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = KeyValue;
