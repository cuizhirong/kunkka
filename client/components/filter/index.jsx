require('./style/index.less');
const React = require('react');

class FilterModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value ? props.value : '',
      data: props.data,
      visible: false
    };

    this.renderData = this.renderData.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onClickFilter = this.onClickFilter.bind(this);
  }

  onClick(ele) {
    this.props.onFilter && this.props.onFilter(ele);
    this.setState({
      value: ele.name,
      visible: !this.state.visible
    });
  }

  onClickFilter(v) {
    this.setState({
      visible: !this.state.visible
    });
  }

  renderData() {
    let props = this.props,
      state = this.state,
      __ = props.__,
      filterClassName = 'filter-rows';

    if (!state.visible) {
      filterClassName += ' hide';
    }

    if (state.data && state.data.length > 0) {
      return (
        <div className={filterClassName} value={state.value}>
          {
            state.data.map((v) => {
              return (
                <div className={state.value === v.name ? 'select-row checked' : 'select-row'}
                  key={v.id} value={v.id}
                  onClick={this.onClick.bind(null, v)}>
                  {__[v.name] || '(' + v.id.substr(0, 8) + ')'}
                  {state.value === v.name ? <i className="glyphicon icon-correct"/> : null}
                </div>
              );
            })
          }
        </div>
      );
    }
  }

  render() {
    let className = 'halo-com-filter-modal',
      __ = this.props.__;

    return (
      <div className={className}>
        <div className="label-row" onClick={this.onClickFilter}>
          {__[this.state.value]}
          <i className="glyphicon icon-arrow-down" />
        </div>
        {this.renderData()}
      </div>
    );
  }
}

module.exports = FilterModal;
