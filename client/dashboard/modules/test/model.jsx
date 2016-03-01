require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
// var request = require('./request');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');

var {Tab} = require('client/uskin/index');


class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

  }

  onInitialize() {

  }

  componentWillMount() {
    console.log(this.props.params);
    this.onInitialize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps() {
  }

  render() {
    var tabs = [{
      name: __.test,
      default: true,
      disabled: true,
      key: 'hello'
    }];
    return (
      <div className="halo-module-test" style={this.props.style}>
        <Main ref="dashboard" moduleID="test" config={this.state.config}>
          <div className="submenu-tabs">
            <Tab items={tabs}/>
          </div>
        </Main>
      </div>
    );
  }

}

module.exports = Model;
