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
      detailChildren: {}
    };

    this.clickDetailTabs = this.clickDetailTabs.bind(this);
    this.closeCaptain = this.closeCaptain.bind(this);
  }

  clickDetailTabs(e, tab) {
    var shouldUpdate = tab.default && Object.keys(this.state.detailChildren).length === 0 || !tab.default;
    if (shouldUpdate) {
      this.changeDefaultDetailTabs(this.props.tabs, tab.key);
      this.updateContent(tab, this.props.itemData);
    }
  }

  updateContent(tab, data) {
    var onClickTabs = this.props.onClickTabs;

    onClickTabs(tab, data, (content, updatingObj) => {
      var details = this.state.detailChildren;
      details[tab.key] = content;
      this.setState({
        detailChildren: details
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
  }

  closeCaptain() {
    var path = router.getPathList();
    router.pushState('/project/' + path[1]);
  }

  render() {
    return (
      <div className={'halo-com-table-detail' + (this.state.detailVisible ? ' visible' : '')}>
        <div className="detail-head">
          <div className="close" onClick={this.closeCaptain}>
            <i className="glyphicon icon-close" />
          </div>
          <Tab items={this.props.tabs} type="sm" onClick={this.clickDetailTabs} />
        </div>
        {this.state.detailVisible ?
          this.props.tabs.map((tab) =>
            this.state.detailChildren[tab.key] ?
              <div key={tab.key}
                className="detail-content"
                data-filed={tab.key}
                style={{display: tab.default ? 'block' : 'none'}}>
                {this.state.detailChildren[tab.key] ? this.state.detailChildren[tab.key] : null}
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
