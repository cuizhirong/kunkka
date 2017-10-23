const React = require('react');
const {Button} = require('client/uskin/index');

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.data.value ? props.data.value : '',
      data: props.data,
      all: [],
      operator: props.data.operators[0],
      unfold: true,
      error: false
    };

    ['onChange', 'toggle', 'onChangeSelect'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    let data = this.props.data;
    let all = [];
    let selected = [];
    let operator = this.state.operator;
    if(data.items && data.items.enum) {
      data.items.enum.forEach((die) => {
        all.push({
          value: die,
          select: false
        });
      });
      if(data.value) {
        operator = /^\<\w+\>/.exec(data.value)[0];
        selected = data.value.split('> ')[1].split(',');
        all.forEach((a) => {
          a.select = selected.includes(a.value);
        });
      }
      this.setState({
        all: all,
        operator: operator
      });
    }
  }

  toggle() {
    this.setState({
      unfold: !this.state.unfold
    });
  }

  onChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  remove(item) {
    this.props.onRemove && this.props.onRemove(item, false);
  }

  onAddOrRemoveItem(item, isAdd) {
    let state = this.state;
    let all = state.all;
    all.some((sa) => {
      if(sa.value === item.value) {
        sa.select = isAdd;
      }
      return sa.value === item.value;
    });
    this.setState({
      all: all
    }, () => {
      this.updateValue();
    });
  }

  onChangeSelect(e) {
    this.setState({
      operator: e.target.value
    }, () => {
      this.updateValue();
    });
  }

  updateValue() {
    let operator = this.state.operator;
    let all = this.state.all;
    let value = '';
    let selectString = (function() {
      let s = '';
      all.filter(a => a.select).forEach((a) => {
        s += (s ? ',' : '') + a.value;
      });
      return s;
    }());
    value = operator + ' ' + selectString;
    this.setState({
      value: value
    });
  }

  render() {
    let props = this.props;
    let state = this.state;
    let __ = props.__;

    return (
      <li className={'multi-select-item-wrapper' + (state.unfold ? '' : ' fold')}>
        <div className="header" onClick={this.toggle}>
          <div className="name" title={state.data.metadata_name}>
            <i className={'glyphicon icon-arrow-' + (state.unfold ? 'up' : 'down')}></i>
            {state.data.metadata_name}
          </div>
          <Button iconClass="delete" initial={true} type="delete" onClick={this.remove.bind(this, state.data)}/>
        </div>
        <div className="already-in">
          {
            state.all.filter(sa => sa.select).length > 0 ? state.all.filter(sa => sa.select).map((sa) => {
              return <div key={sa.value} title={sa.value}>{sa.value}<i className="glyphicon icon-delete" onClick={this.onAddOrRemoveItem.bind(this, sa, false)}></i></div>;
            }) : <div>{__.nodata}</div>
          }
        </div>
        <div className="holder">
          {
            state.all.filter(sa => !sa.select).map((sa) => {
              return <div key={sa.value} title={sa.value} onClick={this.onAddOrRemoveItem.bind(this, sa, true)}>{sa.value}</div>;
            })
          }
        </div>
        <div className="footer">
          <div className="operator">
            <div className="name">Operator</div>
            <select value={state.operator} onChange={this.onChangeSelect}>
              {
                state.data.operators.map(function(v) {
                  return <option key={v} value={v}>{v}</option>;
                })
              }
            </select>
          </div>
        </div>
      </li>
    );
  }
}

module.exports = MultiSelect;
