require('../../style/index.less');
require('./style/index.less');

var React = require('react');

class RelatedSources extends React.Component {

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
    var items = this.props.items;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'down' : 'up')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="related-sources">
            {items.keypair ?
              <div>
                <div className="related-sources-title">
                  <div>{items.keypair.title}</div>
                  <a><i className="glyphicon icon-create"/></a>
                </div>
                <div className="related-sources-content">
                  {items.keypair.content}
                </div>
              </div>
            : null}
            {items.attch_volume ?
              <div>
                <div className="related-sources-title">
                  <div>{items.attch_volume.title}</div>
                  <a><i className="glyphicon icon-create"/></a>
                </div>
                <div className="related-sources-content">
                  {items.attch_volume.content}
                </div>
              </div>
            : null}
            {items.networks ?
              <div>
                <div className="related-sources-title">
                  <div>{items.networks.title}</div>
                  <a><i className="glyphicon icon-create"/></a>
                </div>
                <div className="related-sources-content">
                  {items.networks.content}
                </div>
              </div>
            : null}
          </div>
        </div>
      </div>
    );
  }

}

module.exports = RelatedSources;
