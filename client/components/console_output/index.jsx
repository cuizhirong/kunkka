require('./style/index.less');

var React = require('react');
var Request = require('client/dashboard/cores/request');

class VncConsole extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: []
    };
    this.url = this.props.url;
    this.refresh;
    this.getConsoleData = this.getConsoleData.bind(this);
  }

  componentWillMount() {
    this.setState({
      loading: true
    });
    this.getConsoleData();
    this.refresh = setInterval(this.getConsoleData, 1000);
  }

  getConsoleData() {
    Request.post({
      url: this.url
    }).then((res) => {
      this.setState({
        loading: false,
        data: res.output.split('\n')
      });
    }, (err) => {
      //console.log(err);
    });
    this.stopRefreshing();
  }

  stopRefreshing() {
    clearInterval(this.refresh);
  }

  render() {
    var data = this.state.data;

    return (
      <div className="halo-com-console-output" data-id={this.props['data-id']}>
        {this.state.loading ?
          <div className="detail-loading">
            <i className="glyphicon icon-loading" />
          </div>
        : <div className="output">
            {data.map((item, i) =>
              <p key={i}>{item}</p>
            )}
          </div>
        }
      </div>
    );
  }

}

module.exports = VncConsole;
