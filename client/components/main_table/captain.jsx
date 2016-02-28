/**
 * @module: captain of main_table
 */
require('./style/index.less');

var React = require('react');
var router = require('client/dashboard/cores/router');
var event = require('./event');

var uskin = require('client/uskin/index');
var Tab = uskin.Tab;

class Captain extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      loading: false,
      force: false,
      tabs: this.props.tabs,
      key: undefined,
      contents: {}
    };

    this.data;
    this.changeDefaultKey = this.changeDefaultKey.bind(this);
    this.selectedTab = this.selectedTab.bind(this);
    this.loading = this.loading.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
    this.updateContent = this.updateContent.bind(this);
  }

  componentDidMount() {
    this.tabNode = this.refs.tab;
  }

  shouldComponentUpdate() {
    return true;
  }

  clickTabs(e, tab) {
    if (tab.key !== this.selectedTab().key) {
      this.changeDefaultKey(tab);
      if (this.shouldLoading()) {
        this.loading();
      }
      this.updateContent(this.data);
    }
  }

  changeDefaultKey(tab) {
    event.emit('changeTab', tab);

    var tabs = this.state.tabs;
    tabs.forEach((t) => {
      t.default = (t.key === tab.key) ? true : false;
    });

    this.setState({
      tabs: tabs
    });
  }

  selectedTab() {
    return this.state.tabs.filter((t) => t.default)[0];
  }

  close() {
    var path = router.getPathList();
    router.pushState('/project/' + path[1]);
  }

  /*
  **  public api
  */
  /* loading animation */
  loading() {
    this.setState({
      loading: true
    });
  }

  /* (simulate) check whether content has been already in storage */
  shouldLoading() {
    var tab = this.selectedTab(),
      key = router.getPathList()[2];

    var contents = this.state.contents;
    if (contents[key] && contents[key][tab.key]) {
      return false;
    } else {
      return true;
    }
  }

  /* force update */
  forceUpdate() {
    this.setState({
      force: true
    });

    this.updateContent(this.data);
  }

  /* (simulate) if the content is in storage, update content without any request, vice versa */
  updateContent(data) {
    var contents = this.state.contents,
      key = router.getPathList()[2],
      tab = this.selectedTab();

    if (contents[key] && contents[key][tab.key] && !this.state.force) {
      this.setState({
        key: key
      });
    } else {
      this.data = data;
      var clickTabs = this.props.clickTabs;

      clickTabs && clickTabs(tab, data, (content) => {
        if (!contents[key]) {
          contents[key] = {};
        }
        contents[key][tab.key] = content;

        this.setState({
          key: key,
          contents: contents,
          loading: false,
          force: false
        });
      });
    }
  }

  render() {
    var state = this.state,
      key = state.key;

    return (
      <div className={'halo-com-table-detail' + (state.visible ? ' visible' : '')}>
        <div className="detail-head">
          <div className="close" onClick={this.close}>
            <i className="glyphicon icon-close" />
          </div>
          <Tab ref="tab" items={state.tabs} type="sm" onClick={this.clickTabs.bind(this)} />
        </div>
        {state.loading ?
          <div className="detail-loading">
            <i className="glyphicon icon-loading" />
          </div>
        : null
        }
        {this.props.tabs.map((tab, i) =>
          state.contents[key] && state.contents[key][tab.key] ?
            <div key={tab.key + '_' + key}
              className="detail-content"
              data-filed={tab.key}
              style={{display: tab.key === this.selectedTab().key ? 'block' : 'none'}}>
              {state.contents[key][tab.key]}
            </div>
          : null
          )
        }
      </div>
    );
  }

}

module.exports = Captain;
