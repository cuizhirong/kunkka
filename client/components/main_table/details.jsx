/**
 * @module: the detail part of main_table
 */
require('./style/index.less');

var React = require('react');
var router = require('client/dashboard/cores/router');

var uskin = require('client/uskin/index');
var Tab = uskin.Tab;

class Detail extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      detailVisible: false,
      tabs: this.props.tabs,
      contentsLoading: false,
      contents: {}
    };

    this.clickDetailTabs = this.clickDetailTabs.bind(this);
    this.closeCaptain = this.closeCaptain.bind(this);
    this.changeDefaultDetailTabs = this.changeDefaultDetailTabs.bind(this);
    this.shouldLoading = this.shouldLoading.bind(this);
  }

  clickDetailTabs(e, tab) {
    var shouldUpdate = tab.default && Object.keys(this.state.contents).length === 0 || !tab.default;
    if (shouldUpdate) {
      this.changeDefaultDetailTabs(this.props.tabs, tab.key);
      if (!this.state.contents[tab.key]) {
        this.updateContent(tab, this.props.itemData);
      }
    }
  }

  shouldLoading(status) {
    this.setState({
      contentsLoading: status
    });
  }

  updateContent(tab, data) {
    this.shouldLoading(true);
    var onClickTabs = this.props.onClickTabs;

    onClickTabs && onClickTabs(tab, data, (content, updatingObj) => {
      var details = this.state.contents;
      details[tab.key] = content;
      this.setState({
        contents: details,
        contentsLoading: false
      });
    });
  }

  changeDefaultDetailTabs(tabs, selectedKey) {
    tabs.forEach((tab) => {
      if (tab.default) {
        tab.default = false;
      }
      if (tab.key === selectedKey) {
        tab.default = true;
      }
    });
    this.setState({
      tabs: tabs
    });
  }

  closeCaptain() {
    var path = router.getPathList();
    router.pushState('/project/' + path[1]);
  }

  render() {
    var state = this.state;

    return (
      <div className={'halo-com-table-detail' + (state.detailVisible ? ' visible' : '')}>
        <div className="detail-head">
          <div className="close" onClick={this.closeCaptain}>
            <i className="glyphicon icon-close" />
          </div>
          <Tab items={state.tabs} type="sm" onClick={this.clickDetailTabs} />
        </div>
        {state.contentsLoading ?
          <div className="detail-loading">
            <i className="glyphicon icon-loading" />
          </div>
          : null
        }
        {!state.contentsLoading && state.detailVisible ?
          this.props.tabs.map((tab) =>
            state.contents[tab.key] ?
              <div key={tab.key}
                className="detail-content"
                data-filed={tab.key}
                style={{display: tab.default ? 'block' : 'none'}}>
                {state.contents[tab.key] ? state.contents[tab.key] : null}
              </div>
            : null
          )
          : null
        }
      </div>
    );
  }

}

module.exports = Detail;
