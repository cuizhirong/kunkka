require('./style/index.less');

var React = require('react');

class RelatedSnapshot extends React.Component {

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
          <div className="related-snapshot">
            {this.props.children}
            <div className="timeline">
              {this.props.items.map((item, i) =>
                <div className="per-line" key={i}>
                  <div className="title">{item.title}</div>
                  <div className="time-spot-box">
                    <div className="time-spot" />
                    <div className="time-line" />
                  </div>
                  <div className="content">
                    <div className="name">{item.name}</div>
                    <div className="size">{item.size}</div>
                    <div className="time">{item.time}</div>
                    <div className="status">{item.status}</div>
                    <div className="icon-set">{item.create}<i className="glyphicon icon-delete delete"/></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = RelatedSnapshot;
