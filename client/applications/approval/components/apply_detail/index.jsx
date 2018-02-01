require('./style/index.less');

const React = require('react');
const __ = require('locale/client/approval.lang.json');
const unitConverter = require('client/utils/unit_converter');
const getOsCommonName = require('client/utils/get_os_common_name');

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

  fieldRender(item, k) {
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
      case 'metadata':
        return __.apply_usage;
      default:
        return __[k] ? __[k] : k;
    }
  }

  contentRender(item, field) {
    switch(field) {
      case 'image':
        let image = this.getResByID(item, field);
        let style = null;
        let imgURL = HALO.settings.default_image_url;
        if (imgURL) {
          style = {
            background: `url("${imgURL}") 0 0 no-repeat`,
            backgroundSize: '20px 20px'
          };
        }
        let label = getOsCommonName(image);
        return image.id ? <span>
          <i className={'glyphicon icon-image-default ' + label} style={style}/>
          <span>{image.name}</span>
        </span> : <span>{item[field]}</span>;
      case 'flavor':
        let flavor = this.getResByID(item, field),
          ram = unitConverter(flavor.ram, 'MB');
        return flavor.id ? <span>
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
        let lis = this.getResByID(item, field);
        return lis.id ? <span>
          <span className="space-link">
            {lis.name || '(' + lis.id.slice(0, 8) + ')'}
          </span>
        </span> : <span>{item[field]}</span>;
      case 'id':
        return this.id2Name(item, field, true);
      case 'security_group':
      case 'vip_subnet':
      case 'loadbalancer':
      case 'pool':
      case 'network':
      case 'floating_network':
      case 'Network':
      case 'volume_id':
        return this.id2Name(item, field);
      case 'lb_algorithm':
      case 'direction':
        let key = item[field].toLowerCase();
        return __[key];
      case 'enable_dhcp':
      case 'port_security_enabled':
        return item[field] ? __.on : __.off;
      case 'metadata':
        return item[field].usage;
      default:
        if(typeof item[field] === 'object') {
          return '-';
        }
        return item[field];
    }
  }

  getResByID(item, field, itemKey) { //find resource data by id
    let id = item[field];
    let data = this.props.data;
    let res = {};
    if(!itemKey) {itemKey = field;}

    data[itemKey].some(ele => {
      if(ele.id === id) {
        res = ele;
        return true;
      }
      return false;
    });

    return res;
  }

  id2Name(item, field, idTypeMatch) {
    let breakKeyArray = field.split('_'),
      needDash = breakKeyArray.length > 1;
    let resourceName = needDash ? breakKeyArray.join('') : field;
    let iconKey = needDash ? breakKeyArray.join('-') : field;
    switch(field) {
      case 'vip_subnet':
        resourceName = 'subnet';
        iconKey = 'subnet';
        break;
      case 'loadbalancer':
        iconKey = 'lb';
        break;
      case 'pool':
        iconKey = '';
        break;
      case 'floating_network':
      case 'Network':
        resourceName = 'network';
        iconKey = 'network';
        break;
      case 'volume_id':
        resourceName = 'volume';
        iconKey = 'volume';
        break;
      default:
        break;
    }

    if(idTypeMatch) {
      switch(item._type) {
        case 'Floatingip':
          let fip = this.getResByID(item, field, 'floatingip');
          return fip.id ? <span>
            <i className="glyphicon icon-floating-ip" />
            <span className="space-link">
              {fip.floating_ip_address || '(' + fip.id.slice(0, 8) + ')'}
            </span>
          </span> : <span>{item[field]}</span>;
        case 'Volume':
          let volume = this.getResByID(item, field, 'volume');
          return volume.id ? <span>
            <i className="glyphicon icon-volume" />
            <span className="space-link">
              {volume.name || '(' + item[field].slice(0, 8) + ')'}
            </span>
          </span> : <span>{item[field]}</span>;
        case 'Instance':
          let instance = this.getResByID(item, field, 'instance');
          return instance.id ? <span>
            <i className="glyphicon icon-instance" />
            <span className="space-link">
              {instance.name || '(' + item[field].slice(0, 8) + ')'}
            </span>
          </span> : <span>{item[field]}</span>;
        default:
          return null;
      }
    } else {
      let resource = this.getResByID(item, field, resourceName);
      return resource.id ? <span>
        {iconKey ? <i className={'glyphicon icon-' + iconKey} /> : null}
        <span className="space-link">
          {resource.name || '(' + resource.id.slice(0, 8) + ')'}
        </span>
      </span> : <span>{item[field]}</span>;
    }
  }

  render() {
    let applyDetail = this.props.items,
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
                {createDetail.map((create, i) =>
                  <div className="item-info" key={'create' + i}>
                    {Object.keys(create).map((k, j) => {
                      let showDetail = create[k] && k !== 'user_data' && k !== 'user_data_format';
                      return (showDetail ? <div className="info-box" key={'create' + i + j}>
                        {this.fieldRender(create, k) + ': '}
                        {this.contentRender(create, k)}
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
                  {bindDetail.map((bind, m) => {
                    return Object.keys(bind).map((f, n) =>
                      <div className="info-box" key={'bind' + m + n}>
                        {__[f.toLowerCase()] + ': '}
                        {this.contentRender(bind, f)}
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
                        {this.fieldRender(resize, j) + ': '}
                        {this.contentRender(resize, j)}
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
