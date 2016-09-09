require('./style/index.less');

var React = require('react');
var __ = require('locale/client/approval.lang.json');
var unitConverter = require('client/utils/unit_converter');

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

  getFieldName(item, k) {
    switch(k) {
      case '_type':
        return __.type;
      case 'key_name':
        return __.keypair;
      case 'volume_type':
        return __.volume + __.type;
      case 'admin_pass':
        return __.password;
      case 'port_range_max':
        return __.max_port;
      case 'port_range_min':
        return __.min_port;
      case 'remote_ip_prefix':
        let isIngress = item.direction === 'ingress';
        return isIngress ? __.source_type : __.target;
      case 'size':
        return item._type === 'Floatingip' ? __.bandwidth : __.size;
      default:
        return __[k] ? __[k] : k;
    }
  }

  getFieldContent(item, field) {
    var data = this.props.data;
    var getResource = function(f) {
      var resource = {};
      if(f === 'security_group') {
        f = 'securitygroup';
      }

      data[f].some(ele => {
        if(ele.id === item[field]) {
          resource = ele;
          return true;
        }
        return false;
      });

      return resource;
    };

    switch(field) {
      case 'image':
        let image = getResource(field);
        return image ? <span>
          <i className={'glyphicon icon-image-default ' + image.image_label.toLowerCase()} />
          <a data-type="router" href={'/approval/' + field + '/' + item[field]}>{image.name}</a>
        </span> : <span>{item[field]}</span>;
      case 'flavor':
        let flavor = getResource(field),
          ram = unitConverter(flavor.ram, 'MB');
        return flavor ? <span>
            {flavor.vcpus + 'CPU / ' + ram.num + ram.unit + ' / ' + flavor.disk + 'GB'}
          </span> : <span>{item[field]}</span>;
      case 'security_group':
        let sg = getResource(field);
        return sg ? <span>
            <a data-type="router" href={'/approval/security-group/' + item[field]}>{sg.name}</a>
          </span> : <span>{item[field]}</span>;
      case 'size':
        if(item._type === 'Floatingip') {
          let bw = Number(item[field]) / 1024;
          return <span>{bw + ' Mbps'}</span>;
        } else {
          return <span>{item[field] + ' GB'}</span>;
        }
        break;
      case 'direction':
        let key = item[field];
        return <span>{__[key]}</span>;
      default:
        return <span>{item[field]}</span>;
    }
  }

  render() {
    var applyDetail = this.props.items,
      createDetail = applyDetail.create,
      bindDetail = applyDetail.bind,
      resizeDetail = applyDetail.resize;

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
                        'size', 'volume_type', 'direction', 'port_range_max', 'port_range_min',
                        'protocol', 'remote_ip_prefix', 'security_group'].map((k, j) => {
                          return (c[k] ? <div className="info-box" key={'create' + i + j}>
                            {this.getFieldName(c, k) + ': '}{this.getFieldContent(c, k)}
                          </div> : null);
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
                        {__[f.toLowerCase()] + ': '}<span>{b[f]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div> : ''}
            {resizeDetail ? <div className="resize-list">
              <div className="apply-type">{__.change}</div>
              <div className="apply-items">
                {resizeDetail.map((resize, p) =>
                  <div className="item-info" key={'resize' + p}>
                    {['_type', 'id', 'flavor', 'size'].map((j, q) => {
                      return (resize[j] ? <div className="info-box" key={'resize' + p + q}>
                        {this.getFieldName(resize, j) + ': '}{this.getFieldContent(resize, j)}
                      </div> : null);
                    })}
                  </div>
                )}
              </div>
            </div> : ''}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = ApplyDetail;
