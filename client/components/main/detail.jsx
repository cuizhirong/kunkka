require('./style/index.less');

var React = require('react');
var {Tab} = require('client/uskin/index');
var router = require('client/dashboard/cores/router');

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: false
    };
  }

  componentWillMount() {}

  componentDidMount() {

  }

  componentWillReceiveProps() {

  }

  onClose() {
    var path = router.getPathList();
    router.pushState('/' + path.slice(0, 2).join('/'));
  }

  render() {
    var props = this.props,
      state = this.state;

    return (
      <div className={'halo-com-table-detail' + (state.visible ? ' visible' : '')}>
        <div className="detail-head">
          <div className="close" onClick={this.onClose.bind(this)}>
            <i className="glyphicon icon-close" />
          </div>
          <Tab ref="tab" items={props.tabs} type="sm" onClick={this.props.clickTabs} />
        </div>
      </div>
    );
  }
}

module.exports = Detail;
