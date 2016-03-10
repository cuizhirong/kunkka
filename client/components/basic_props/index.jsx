require('../../style/index.less');
require('./style/index.less');

var React = require('react');
var EditContent = require('./edit_content');
var moment = require('client/libs/moment');
var getStatusIcon = require('client/dashboard/utils/status_icon');

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

  onAction(actionType, data) {
    this.props.onAction && this.props.onAction(this.props.tabKey, actionType, data);
  }

  getItemContent(item, rawItem) {
    switch(item.type) {
      case 'editable':
        return <EditContent item={item} rawItem={rawItem} onAction={this.onAction.bind(this)} />;
      case 'status':
        return getStatusIcon(item.status);
      case 'time':
        return moment(item.content).format('YYYY-MM-DD hh:mm:ss');
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
          <i className={'glyphicon icon-arrow-' + (state.toggle ? 'down' : 'up')} />
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
