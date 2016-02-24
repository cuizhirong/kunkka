require('../../style/index.less');
require('./style/index.less');

var React = require('react');
var EditContent = require('./edit_content');
var Request = require('client/dashboard/cores/request');
var moment = require('client/libs/moment');
var getStatusIcon = require('client/dashboard/utils/status_icon');

class BasicProps extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      toggle: false,
      data: this.props.items ? this.props.items : []
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

  componentDidMount() {
    /* if there is url props, update data by itself */
    var url = this.props.url;
    url && Request.get({
      url: this.props.url
    }).then((res) => {
      var data = this.props.getItems(res);
      this.setState({
        loading: false,
        data: data
      });
    }, (err) => {
      this.setState({
        loading: false,
        data: []
      });
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  getItemContent(item) {
    switch(item.type) {
      case 'editable':
        return <EditContent item={item} />;
      case 'status':
        return getStatusIcon(item.status);
      case 'time':
        return moment(item.content).format('YYYY-MM-DD hh:mm:ss');
      default:
        return item.content;
    }
  }

  render() {
    var items = this.state.data,
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
                      <td>{this.getItemContent(item)}</td>
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
