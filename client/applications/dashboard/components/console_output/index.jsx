require('./style/index.less');

const React = require('react');
const fetch = require('client/applications/dashboard/cores/fetch');
const router = require('client/utils/router');
const mainEvent = require('client/components/main/event');

const {Button, InputSearch} = require('client/uskin/index');

class VncConsole extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: [],
      requestData: props.requestData
    };
    this.refresh;
    this.onChangeState = this.onChangeState.bind(this);
    this.onChangeTab = this.onChangeTab.bind(this);
    this.getData = this.getData.bind(this);
    this.loading = this.loading.bind(this);
    this.run = this.run.bind(this);
  }

  componentWillMount() {
    if (this.props.refresh) {
      this.loading();
      this.run();
    }

    router.on('changeState', this.onChangeState);
    mainEvent.on('changeTab', this.onChangeTab);
  }

  componentWillReceiveProps(nextProps) {
    this.stopRefreshing();
    this.loading();
    this.run();
  }

  componentWillUnmount() {
    this.stopRefreshing();

    router.removeListener('changeState', this.onChangeState);
    mainEvent.removeListener('changeTab', this.onChangeTab);
  }

  onChangeState(pathList) {
    if (!pathList[2] || (pathList[0] === 'project' && pathList[1] !== this.props.moduleID)) {
      this.stopRefreshing();
    }
  }

  onChangeTab(tab) {
    this.detailTabKey = tab.key;
    if (tab.key !== this.props.tabKey) {
      this.stopRefreshing();
    } else {
      this.loading();
      this.run();
    }
  }

  getData() {
    let props = this.props,
      state = this.state;

    fetch.post({
      url: props.url,
      data: state.requestData
    }).then((res) => {
      if (this.refresh) {
        this.setState({
          loading: false,
          data: res.output.split('\n')
        });
      }
    }, (err) => {
      this.setState({
        loading: false,
        data: []
      });
    });
  }

  loading() {
    this.setState({
      loading: true
    });
  }

  run() {
    this.getData();
    if (this.props.refresh) {
      this.refresh = window.setInterval(this.getData, 1500);
    }
  }

  changeSearchInput(str, isSubmitted) {
    let strNumber = Number(str);
    if (isNaN(strNumber)) {
      this.refs.search.setState({
        value: ''
      });
    }

    if (isSubmitted) {
      if (strNumber < 2) {
        this.refs.search.setState({
          value: 50
        });
      }

      let requestData = {
        'os-getConsoleOutput': {
          'length': strNumber < 2 ? 50 : strNumber
        }
      };
      this.setState({
        requestData: requestData
      }, this.getData);
    }
  }

  stopRefreshing() {
    window.clearInterval(this.refresh);
    this.refresh = undefined;
  }

  onShowAll() {
    let url = '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + this.props.serverId + '/action';
    window.open(url);
  }

  render() {
    let data = this.state.data;

    return (
      <div className="halo-com-console-output" data-id={this.props['data-id']}>
        {this.state.loading ?
          <div className="detail-loading">
            <i className="glyphicon icon-loading" />
          </div>
        : <div>
            <div className="log">
              <div className="log-left">{__.instance + __.log + __.output}</div>
              <div className="log-right">
                <span className="log-span">{__.log + __.length + ': '}</span>
                <InputSearch
                  ref="search"
                  type="light"
                  placeholder={__.length_tip}
                  onChange={this.changeSearchInput.bind(this)} />
                <Button value={__.show_all} onClick={this.onShowAll.bind(this)}/>
              </div>
            </div>
            <div className="output">
              {data.map((item, i) =>
                <p key={i}>{item}</p>
              )}
            </div>
          </div>
        }
      </div>
    );
  }

}

module.exports = VncConsole;
