require('./style/index.less');

var React = require('react');
var {Button} = require('client/uskin/index');
var __ = require('locale/client/admin.lang.json');
var router = require('client/utils/router');

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expand: false
    };

    ['reset', 'confirm', 'foldFilter', 'unfoldFilter'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  unfoldFilter(e) {
    this.setState({
      expand: true
    });

    document.addEventListener('mouseup', this.foldFilter, false);
    this.refs.filter_box.addEventListener('mouseup', this.preventFold, false);
  }

  preventFold(e) {
    e.stopPropagation();
  }

  foldFilter(e) {
    this.setState({
      expand: false
    });

    document.removeEventListener('mouseup', this.foldFilter, false);
    this.refs.filter_box.removeEventListener('mouseup', this.preventFold, false);
  }

  reset(e) {
    var filters = this.props.items,
      refs = this.refs;

    filters.forEach((filter) => {
      filter.items.forEach((item) => {
        var itemKey = filter.group_key + '_' + item.key;
        if(item.type === 'select') {
          refs[itemKey].value = 'default';
        } else if(item.type === 'input') {
          refs[itemKey].value = '';
        }
      });
    });
  }

  clearState() {
    this.reset();
  }

  confirm(e) {
    var filters = this.props.items,
      refs = this.refs,
      fields = {};

    filters.forEach((filter) => {
      filter.items.forEach((item) => {
        var itemKey = filter.group_key + '_' + item.key;
        if ((item.type === 'select' && refs[itemKey].value !== 'default')
          || (item.type === 'input' && refs[itemKey].value !== '')) {

          if (!fields[filter.group_key]) {
            fields[filter.group_key] = {};
          }
          fields[filter.group_key][item.key] = refs[itemKey].value.trim();
        }
      });
    });

    this.props.onConfirm && this.props.onConfirm(fields);

    var pathList = router.getPathList();
    if (pathList.length > 2) {
      router.pushState('/' + pathList[0] + '/' + pathList[1]);
    }

    this.foldFilter(e);
  }

  renderFilters(filters) {
    var ret = [];

    filters.forEach((filter, index) => {
      if (index > 0) {
        ret.push(<div key={'division_' + index} className="division">{__.or}</div>);
      }

      var perGroup = [];
      filter.items.forEach((item) => {
        if(item.type === 'select') {
          perGroup.push(
            <select defaultValue={item.default} key={item.key} ref={filter.group_key + '_' + item.key}>
              <option key={item.default} value="default">{item.default}</option>
              {item.data && item.data.map((ele) =>
                <option key={ele.id} value={ele.id}>{ele.name}</option>
              )}
            </select>
          );
        } else if (item.type === 'input') {
          perGroup.push(<input key={item.key} ref={filter.group_key + '_' + item.key} placeholder={item.placeholder}/>);
        }
      });

      ret.push(
        <div key={filter.group_key} ref={filter.group_key}>
          {perGroup}
        </div>
      );
    });

    return ret;
  }

  render() {
    var props = this.props,
      expand = this.state.expand,
      filters = props.items;

    return (
      <div className={'filter-search' + (props.visible === false ? ' hidden' : '')}>
        {
          expand ?
            <Button iconClass="filter-collapse" initial={true} onClick={this.foldFilter}/>
          : <Button iconClass="filter-expand" disabled={props.btnDisabled} initial={true} onClick={this.unfoldFilter}/>
        }
        <div ref="filter_box" className={'search-expand ' + (expand ? 'visible' : '')}>
          {this.renderFilters(filters)}
          <div className="action">
            <Button value={__.reset} initial={true} type="cancel" onClick={this.reset} />
            <Button value={__.confirm} initial={true} onClick={this.confirm} />
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;
