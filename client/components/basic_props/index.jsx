require('../../style/index.less');
require('./style/index.less');

var React = require('react');
var EditContent = require('./edit_content');
var moment = require('client/libs/moment');
var getTime = require('client/utils/time_unification');
const copy = require('clipboard-plus');

class BasicProps extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      toggle: false
    };

    moment.locale(HALO.configs.lang);
    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      loading: this.props.url ? true : false,
      toggle: this.props.defaultUnfold
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  onClick(id) {
    copy(id);
  }

  onAction(actionType, data) {
    this.props.onAction && this.props.onAction(this.props.tabKey, actionType, data);
  }

  getItemContent(item, rawItem) {
    var copyId;
    if(item.title.toLowerCase() === 'id') {
      copyId = String(item.content);
      return <div>{item.content}<i title="click to copy id!" className="glyphicon icon-copy copyid" onClick={this.onClick.bind(this, copyId)} /></div>;
    }
    switch(item.type) {
      case 'editable':
        return <EditContent item={item} rawItem={rawItem} onAction={this.onAction.bind(this)} />;
      case 'time':
        return getTime(item.content);
      case 'copy':
        copyId = String(item.content);
        return <div>{item.content}<i title="click to copy id!" className="glyphicon icon-copy copyid" onClick={this.onClick.bind(this, copyId)} /></div>;
      default:
        return item.content;
    }
  }

  render() {
    var items = this.props.items,
      rawItem = this.props.rawItem,
      state = this.state;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-basic-props">
            {state.loading ?
              <div className="content-loading">
                <i className="glyphicon icon-loading" />
              </div>
            : <table>
                <tbody>
                  {items.map((item, index) =>
                    <tr key={index}>
                      <th>{item.title}</th>
                      <td>{this.getItemContent(item, rawItem)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
    );
  }

}

module.exports = BasicProps;
