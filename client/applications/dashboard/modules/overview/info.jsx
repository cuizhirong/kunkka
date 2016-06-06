require('./style/index.less');

var React = require('react');

var __ = require('locale/client/dashboard.lang.json');

class ResourceInfo extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    var info = [{
      title: __.instance,
      key: 'instances',
      link: 'instance'
    }, {
      title: __.volume,
      key: 'volumes',
      link: 'volume'
    }, {
      title: __.router,
      key: 'router',
      link: 'router'
    }, {
      title: __['floating-ip'],
      key: 'floatingip',
      link: 'floating-ip'
    }, {
      title: __.snapshot,
      key: 'snapshots',
      link: 'snapshot'
    }];

    this.setState({
      info: info
    });
  }

  renderContent(info, overview) {
    var halfLength = Math.floor(info.length / 2);

    if (!overview) {
      overview = {};
    }

    var leftSide = [],
      rightSide = [];

    function renderItem(item, index) {
      return (
        <div className="item" key={index}>
          <div>{item.title}</div>
          <div>{overview[item.key] ? overview[item.key].used : 0}</div>
        </div>
      );
    }

    for(let i = 0; i < halfLength; i++) {
      leftSide.push(renderItem(info[i], i));
      rightSide.push(renderItem(info[i + halfLength], i + halfLength));
    }

    if (info.length % 2 > 0) {
      let lastKey = info.length - 1;
      leftSide.push(renderItem(info[lastKey], lastKey));
    }

    return (
      <div className="content">
        <div>{leftSide}</div>
        <div>{rightSide}</div>
      </div>
    );
  }

  render() {
    var info = this.state.info,
      overview = this.props.overview;

    return (
      <div className="resource-info">
        <div className="title">{__.resource + __.information}</div>
        {this.renderContent(info, overview)}
      </div>
    );
  }

}

module.exports = ResourceInfo;
