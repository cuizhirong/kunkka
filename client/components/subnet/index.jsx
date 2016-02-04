require('./style/index.less');

var React = require('react');
var __ = require('i18n/client/lang.json');

class Subnet extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      toggle: this.props.defaultUnfold
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  render() {

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'down' : 'up')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="subnet">
            {this.props.children}
            <div className="subnet-infor">
              <div className="infor-head">
                <div className="title">{__.subnet + __.name}</div>
                <div className="cidr">{__.cidr}</div>
                <div className="router">{__.related + __.router}</div>
                <div className="create">{__.operation}</div>
              </div>
              {this.props.items.map((item, i) =>
                <div className="subnet-item" key={i}>
                  <div className="title">{item.title}</div>
                  <div className="cidr">{item.cidr}</div>
                  <div className="router">{item.router}</div>
                  <div className="create">{item.create}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = Subnet;
