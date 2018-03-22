require('./style/index.less');

const React = require('react');
const request = require('./request');
const __ = require('locale/client/dashboard.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      redirectUrl: '',
      errorMsg: ''
    };
  }

  componentDidMount() {
    this.redirect();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return;
    } else {
      this.redirect();
    }
  }

  redirect() {
    request.getRedirectUrl().then((res) => {
      if(res.hasAccount) {
        window.location.replace(res.redirectUrl);
        this.setState({
          redirectUrl: res.redirectUrl,
          hasError: false,
          errorMsg: ''
        });
      } else {
        this.setState({
          hasError: true,
          errorMsg: __.user_did_not_have_cloud_account
        });
      }
    }).catch((err) => {
      this.setState({
        hasError: true,
        errorMsg: __.system_error
      });
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  render() {
    const { hasError, errorMsg, redirectUrl } = this.state;
    const content = hasError
      ? (<div className="error">
          <i className="glyphicon icon-status-warning"></i>
          {errorMsg}
        </div>)
      : (<div className="info">
          {__.link_did_not_redirect}
          <a target="_blank" href={redirectUrl}>{__['cloud-video']}</a>
        </div>);

    return (
      <div className="halo-module-cloud-video" style={this.props.style}>
        {content}
      </div>
    );
  }

}

module.exports = Model;
