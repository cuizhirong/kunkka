require('./style/index.less');
var React = require('react');

class GroupSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      checkedKey: []
    };

  }

  // componentDidUpdate() {
  //   this.props.onAction && this.props.onAction(this.state);
  // }

  onChangeCheckbox(id) {
    let checkedKey = this.state.checkedKey;
    let i = checkedKey.indexOf(id);

    i > -1 ? checkedKey.splice(i, 1) : checkedKey.push(id);

    this.setState({
      checkedKey: checkedKey
    });
  }

  getHolder() {
    let checkedKey = this.state.checkedKey;
    let holder = '';
    let data = this.state.data;
    data.forEach((item) => {
      if(checkedKey.indexOf(item.id) > -1) {
        holder += (holder === '' ? '' : ', ') + item.name;
      }
    });
    return holder;
  }

  render() {
    var props = this.props,
      state = this.state,
      defaultValue = props.defaultValue;

    return (
      <div className={'halo-admin-com-group-select'}>
        <div className="group-select-wrapper" title={this.getHolder()}>
          {
            this.getHolder() === '' ? defaultValue : this.getHolder()
          }
        </div>
        <div className="group-select-content">
        {
          state.data.map((r) => {
            return <div key={r.id} className="item-wrapper" title={r.name} >
              <input type="checkbox" checked={state.checkedKey.indexOf(r.id) > -1 ? true : false} onChange={this.onChangeCheckbox.bind(this, r.id)} />
              <p>{r.name}</p>
            </div>;
          })
        }
        </div>
      </div>
    );
  }
}

module.exports = GroupSelect;
