require('../../style/index.less');
require('./style/index.less');

var React = require('react');
var moment = require('client/libs/moment');
var getStatusIcon = require('client/dashboard/utils/status_icon');

class BasicProps extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false
    };

    moment.locale(HALO.configs.lang);
    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      toggle: this.props.defaultUnfold
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  getItemContent(item) {
    switch(item.type) {
      case 'status':
        return getStatusIcon(item.status);
      case 'time':
        return moment(item.content).format('YYYY-MM-DD hh:mm:ss');
      default:
        return item.content;
    }
  }

  render() {
    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'down' : 'up')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <table className="halo-com-basic-props">
            <tbody>
              {this.props.items.map((item, index) =>
                <tr key={index}>
                  <th>{item.title}</th>
                  <td>{this.getItemContent(item)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

}

module.exports = BasicProps;
