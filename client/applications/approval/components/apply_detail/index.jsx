require('./style/index.less');

var React = require('react');
var __ = require('locale/client/approval.lang.json');

class ApplyDetail extends React.Component {
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

  getFieldName(k) {
    switch(k) {
      case '_type':
        return __.type;
      case 'key_name':
        return __.keypair;
      case 'volume_type':
        return __.volume + __.type;
      default:
        return __[k] ? __[k] : k;
    }
  }

  render() {
    var applyDetail = this.props.items,
      createDetail = applyDetail.create,
      bindDetail = applyDetail.bind;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-apply-detail">
            {createDetail ? <div className="create-list">
              <div className="apply-type">{__.create}</div>
              <div className="apply-items">
                {createDetail.map((c, i) =>
                  <div className="item-info" key={'create' + i}>
                    {['_type', '_identity', 'name', 'flavor', 'image', 'admin_pass', 'key_name',
                        'size', 'volume_type'].map((k, j) => {
                          return (c[k] ? <div className="info-box" key={'create' + i + j}>{this.getFieldName(k) + ': '}<span>{c[k]}</span></div> : '');
                        })}
                  </div>
                )}
              </div>
            </div> : ''}
            {bindDetail ? <div className="bind-list">
              <div className="apply-type">{__.bind}</div>
              <div className="apply-items">
                <div className="item-info">
                  {bindDetail.map((b, m) => {
                    return Object.keys(b).map((f, n) =>
                      <div className="info-box" key={'bind' + m + n}>
                        {__[f] + ': '}<span>{b[f]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div> : ''}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = ApplyDetail;
