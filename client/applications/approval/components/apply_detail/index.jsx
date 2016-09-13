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
      case '_number':
        return __.number;
      case 'key_name':
        return __.keypair;
      case 'volume_type':
        return __.volume + __.type;
      case 'volume_id':
        return __.volume;
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
      case 'vip_subnet':
        return __.subnet;
      case 'lb_algorithm':
        return __.load_algorithm;
      case 'pool':
        return __.resource_pool;
      case 'security_groups':
        return __.security_group;
      case 'port_security_enabled':
        return __.security + __.restrict;
      case 'fixed_ips':
        return __.address_ip;
      case 'external_gateway_info':
        return __.ext_gatway + __.network;
      case 'floating_network':
        return __.external_network;
      case 'ip_version':
        return 'IP' + __.version;
      case 'network_id':
        return __.network;
      default:
        return __[k] ? __[k] : k;
    }
  }

  getResource(item, field, f) {
    var data = this.props.data;
    var resource = {};
    f = f ? f : field;

    data[f].some(ele => {
      if(ele.id === item[field]) {
        resource = ele;
        return true;
      }
      return false;
    });

    return resource;
  }

  getIdContent(item, field) {
    switch(item._type) {
      case 'Floatingip':
        let fip = this.getResource(item, field, 'floatingip');
        return fip ? <span>
          <i className="glyphicon icon-floating-ip" />
          <a className="space-link" data-type="router" href={'/approval/floating-ip/' + item[field]}>
            {fip.floating_ip_address || '(' + fip.id.slice(0, 8) + ')'}
          </a>
        </span> : <span>{item[field]}</span>;
      case 'Volume':
        let volume = this.getResource(item, field, 'volume');
        return volume ? <span>
          <i className="glyphicon icon-volume" />
          <a className="space-link" data-type="router" href={'/approval/volume/' + item[field]}>
            {volume.name || '(' + item[field].slice(0, 8) + ')'}
          </a>
        </span> : <span>{item[field]}</span>;
      case 'Instance':
        let instance = this.getResource(item, field, 'instance');
        return instance ? <span>
          <i className="glyphicon icon-instance" />
          <a className="space-link" data-type="router" href={'/approval/instance/' + item[field]}>
            {instance.name || '(' + item[field].slice(0, 8) + ')'}
          </a>
        </span> : <span>{item[field]}</span>;
      default:
        return null;
    }
  }

  getRegularContent(item, field) {
    let partialKeys = field.split('_'),
      needDash = partialKeys.length > 1;
    let resourceName = needDash ? partialKeys.join('') : field;
    let linkKey = needDash ? partialKeys.join('-') : field;
    let iconKey = linkKey;
    switch(field) {
      case 'vip_subnet':
        resourceName = 'subnet';
        linkKey = 'subnet';
        iconKey = 'subnet';
        break;
      case 'loadbalancer':
        iconKey = 'lb';
        break;
      case 'pool':
        linkKey = 'resource-pool';
        iconKey = '';
        break;
      case 'floating_network':
      case 'Network':
        resourceName = 'network';
        linkKey = 'network';
        iconKey = 'network';
        break;
      case 'volume_id':
        resourceName = 'volume';
        linkKey = 'volume';
        iconKey = 'volume';
        break;
      default:
        break;
    }

    let resource = this.getResource(item, field, resourceName);
    return resource.id ? <span>
      {iconKey ? <i className={'glyphicon icon-' + iconKey} /> : null}
      <a className="space-link" data-type="router" href={'/approval/' + linkKey + '/' + item[field]}>
        {resource.name || '(' + resource.id.slice(0, 8) + ')'}
      </a>
    </span> : <span>{item[field]}</span>;
  }

  getFieldContent(item, field) {
    if(typeof item[field] === 'object') {
      return '-';
    }

    switch(field) {
      case 'image':
        let image = this.getResource(item, field);
        return image ? <span>
          <i className={'glyphicon icon-image-default ' + image.image_label.toLowerCase()} />
          <a data-type="router" href={'/approval/' + field + '/' + item[field]}>{image.name}</a>
        </span> : <span>{item[field]}</span>;
      case 'flavor':
        let flavor = this.getResource(item, field),
          ram = unitConverter(flavor.ram, 'MB');
        return flavor ? <span>
            {flavor.vcpus + 'CPU / ' + ram.num + ram.unit + ' / ' + flavor.disk + 'GB'}
          </span> : <span>{item[field]}</span>;
      case 'size':
        if(item._type === 'Floatingip') {
          let bw = Number(item[field]) / 1024;
          return <span>{bw + ' Mbps'}</span>;
        } else {
          return <span>{item[field] + ' GB'}</span>;
        }
        break;
      case 'listener':
        let lis = this.getResource(item, field);
        return lis ? <span>
          <a className="space-link" data-type="router" href={'/approval/loadbalancer/' + lis.loadbalancers[0].id}>
            {lis.name || '(' + lis.id.slice(0, 8) + ')'}
          </a>
        </span> : <span>{item[field]}</span>;
      case 'id':
        return this.getIdContent(item, field);
      case 'security_group':
      case 'vip_subnet':
      case 'loadbalancer':
      case 'pool':
      case 'network':
      case 'floating_network':
      case 'Network':
      case 'volume_id':
        return this.getRegularContent(item, field);
      case 'lb_algorithm':
      case 'direction':
        let key = item[field].toLowerCase();
        return <span>{__[key]}</span>;
      case 'enable_dhcp':
      case 'port_security_enabled':
        return item[field] ? __.on : __.off;
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
                    {Object.keys(c).map((k, j) => {
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
                        {__[f.toLowerCase()] + ': '}<span>{this.getFieldContent(b, f)}</span>
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
                    {Object.keys(resize).map((j, q) => {
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
