const React = require('react');
const { Button, InputNumber, Tip } = require('client/uskin/index');

const Input = require('client/components/modal_common/subs/input/index');
const ImageSelect = require('./image_select');
const FlavorSelect = require('./flavor_select');
const StorageSelect = require('./storage_select');
const NetworkConfig = require('./network_config');
const KeyPairSelect = require('./keyPair_select');

const unitConverter = require('client/utils/unit_converter');
const getOsCommonName = require('client/utils/get_os_common_name');
const getErrorMessage = require('../../../../utils/error_message');

const request = require('../../request');

const details = ['name', 'image', 'flavor', 'system_disk', 'data_disk', 'network', 'port', 'security_group', 'keypair'];

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      images: [],
      image: {},
      snapshots: [],
      snapshot: {},
      imageType: 'image',
      flavors: [],
      flavor: {},
      generalFlavors: [],
      computeFlavors: [],
      memoryFlavors: [],
      otherFlaovrs: [],
      vcpus: [],
      memory: [],
      networks: [],
      network: [],
      ports: [],
      port: [],
      securityGroups: [],
      securityGroup: [],
      keypairs: [],
      keypair: '',
      username: '',
      password: '',
      credentialType: 'keypair',
      number: 1,
      name: '',
      securitygroupFold: true,
      pwd: '',
      pwdError: true,
      systemDisk: {
        type: 'ssd',
        cap: 0
      },
      dataDisks: [],
      disabled: false,
      showError: false,
      error: ''
    };

    ['initialize', 'onChangeNum', 'onChangeName', 'unfoldSecurityGroupOptions', 'securityGroupUnfold'].forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    request.getData().then(this.initialize);
  }

  // 初始化各项数据
  initialize(res) {

    //处理镜像和快照数据
    let images = [];
    let snapshots = [];

    //sort image and snapshot
    res.image.forEach((ele) => {
      let type = ele.image_type;
      if (ele.status === 'active') {
        if (type !== 'snapshot') {
          if (ele.status !== 'deactivated') images.push(ele);
        } else {
          snapshots.push(ele);
        }
      }
    });

    let imageSort = (a, b) => {
      if (a.image_label_order) {
        a.image_label_order = 9999;
      }
      if (b.image_label_order) {
        b.image_label_order = 9999;
      }

      let aLabel = Number(a.image_label_order);
      let bLabel = Number(b.image_label_order);
      if (aLabel === bLabel) {
        if (a.image_name_order) {
          a.image_name_order = 9999;
        }
        if (b.image_name_order) {
          b.image_name_order = 9999;
        }
        let aName = Number(a.image_name_order);
        let bName = Number(b.image_name_order);
        return aName - bName;
      } else {
        return aLabel - bLabel;
      }
    };
    images.sort(imageSort);
    snapshots.sort(imageSort);

    // 处理配置可用配置数据
    let generalFlavors = [],
      computeFlavors = [],
      memoryFlavors = [],
      otherFlaovrs = [],
      vcpus = [],
      memory = [];

    res.flavor.forEach(f => {
      switch(f.name.substr(0, 1)) {
        case 'g':
          generalFlavors.push(f);
          break;
        case 'c':
          computeFlavors.push(f);
          break;
        case 'm':
          memoryFlavors.push(f);
          break;
        default:
          otherFlaovrs.push(f);
      }
      if (vcpus.indexOf(f.vcpus) === -1) vcpus.push(f.vcpus);
      if (memory.indexOf(f.ram) === -1) memory.push(f.ram);
    });

    function sortNum(a, b) { return a > b; }

    //处理可用的network
    let networks = res.network.filter((ele) => {
      return !ele['router:external'] && ele.subnets.length > 0 ? true : false;
    });

    //处理可用的port
    let ports = res.port.filter(ele => {
      return !ele.device_owner ? true : false;
    });

    let sg = res.securitygroup,
      keypairs = res.keypair,
      keypair = keypairs.length > 0 ? keypairs[0].name : '';

    this.setState({
      images: images,
      snapshots: snapshots,
      flavors: res.flavor,
      generalFlavors: generalFlavors,
      computeFlavors: computeFlavors,
      memoryFlavors: memoryFlavors,
      otherFlaovrs: otherFlaovrs,
      vcpus: vcpus.sort(sortNum),
      memory: memory.sort(sortNum),
      networks: networks,
      ports: ports,
      securityGroups: sg,
      keypairs: keypairs,
      keypair: keypair
    });
  }

  onClick() {
    this.props.onAfterClose && this.props.onAfterClose();
  }

  step(index, label, required) {
    return <div className="instance-step">
      <div className="step">{index}</div>
      <div className="label">{__[label]}</div>
      {required && <strong>*</strong>}
    </div>;
  }

  onChangeName(field, state) {
    this.setState({
      name: state.value
    });
  }

  onChangeSecurityGroups(name, isDelete) {
    let securityGroup = this.state.securityGroup,
      index = securityGroup.indexOf(name);
    if (index === -1) securityGroup.push(name);
    else securityGroup.splice(index, 1);

    this.setState({
      securityGroup: securityGroup
    });
  }

  unfoldSecurityGroupOptions(e) {
    this.setState({
      securitygroupFold: false
    });

    document.addEventListener('mouseup', this.securityGroupUnfold, false);
    this.refs.drop_securitygroup.addEventListener('mouseup', this.preventFoldSecurityGroupOptions, false);
  }

  preventFoldSecurityGroupOptions(e) {
    e.stopPropagation();
  }

  securityGroupUnfold(e) {
    this.setState({
      securitygroupFold: true
    });

    document.removeEventListener('mouseup', this.securityGroupUnfold, false);
    this.refs.drop_securitygroup.removeEventListener('mouseup', this.preventFoldSecurityGroupOptions, false);
  }

  renderSecurityGroups(state) {
    const selects = this.state.securityGroup;
    let hasSelects = selects && selects.length > 0;

    return <div className="security-group">
      <div className="group">
        <div className="network-dropdown-overview" onClick={this.unfoldSecurityGroupOptions}>
          {hasSelects ?
            selects.map(ele => <div key={ele} className="overview-data" onClick={this.onChangeSecurityGroups.bind(this, ele)}>
              <span>{ele}</span>
              <i className="glyphicon icon-close"/>
            </div>)
          : <div className="no-selected">{__.no_selected_sg}</div>}
        </div>
        <div ref="drop_securitygroup" className={state.securitygroupFold ? 'hide' : 'dropdown'}>
          {state.securityGroups.length > 0 ? state.securityGroups.map((group, index) => <div key={index}
            className="network-dropdown"
            onClick={this.onChangeSecurityGroups.bind(this, group.name)}>
            <div className="checkbox">
              <input value={group.name}
                type="checkbox"
                onChange={() => {}}
                checked={state.securityGroup.indexOf(group.name) !== -1} />
            </div>
            <span>{group.name}</span>
          </div>) : <div className="no-data">{__.no_resources.replace('{0}', __.data)}</div>}
        </div>
      </div>
    </div>;
  }

  //修改云主机数量
  onChangeNum(num) {
    this.setState({
      number: num
    });
  }

  onChange(value, key) {
    this.setState({
      [key]: value
    });
  }

  //底部的btn
  renderButton(state) {
    let price = 0.000;
    let numPrice = price;

    let flavorState = this.state.flavor;

    let enableCharge = HALO.settings.enable_charge;
    if (enableCharge && flavorState) {
      let type = flavorState.name;
      if (HALO.prices) {
        price = HALO.prices.compute[type] ? HALO.prices.compute[type] : 0;
        numPrice = (Number(price) * state.number).toFixed(4);
      }
    }

    let selectedImage = state.image;
    if (state.imageType === 'snapshot') {
      selectedImage = state.snapshot;
    }

    let enable = state.name.trim() && state.flavor.id && state.network.length > 0 && selectedImage.id;

    if(getOsCommonName(state.image) === 'windows') {
      enable = enable && !state.pwdError && !state.confirmPwdError;
    } else {
      if (state.credentialType === 'keypair') {
        enable = enable && state.keypair;
      } else {
        enable = enable && !state.pwdError && !state.confirmPwdError;
      }
    }

    return <div className="create-instance-bottom">
      <Button value={__.back} onClick={this.onClick.bind(this)} />
      <div className="bottom-right">
        <div className={HALO.settings.enable_charge ? 'charge' : 'charge hide-charge'}>
          <span>{__.unit_price + ' : '}</span>
          <span className="charge-unit">{__.account.replace('{0}', +price)}</span>
          <span>{'/' + __.hour}</span>
          <span>{__.flavor + __.total}</span>
          <span className="charge-total">{__.account.replace('{0}', +numPrice)}</span>
          <span>{'/' + __.hour}</span>
        </div>
        <div className="num">
          <label>{__.number}</label>
          <InputNumber type="mini" value={state.number} min={1} max={100} onChange={this.onChangeNum}/>
        </div>
        <Button disabled={state.disabled || !enable} value={__.create + __.instance} onClick={this.onConfirm.bind(this)} />
      </div>
    </div>;
  }

  renderError(state) {
    return <div className={state.showError ? 'error-tip' : ' hide'}><Tip content={state.error} type="danger" showIcon={true} hide={!state.showError}/></div>;
  }

  onConfirm() {
    //需要项：name, image, snapshot, flavor, system disk, data disk, network, port, security group, keypair, password, number
    //已有项：name, image, snapshot, flavor, network, port, security group, keypair, password, number
    //在加项：system disk, data disk

    this.setState({
      disabled: true
    });

    let state = this.state,
      selectedImage = state.image;

    if (state.imageType === 'snapshot') {
      selectedImage = state.snapshot;
    }

    let data = {
      name: state.name.trim(),
      flavorRef: state.flavor.id,
      networks: [],
      min_count: state.number,
      max_count: state.number,
      block_device_mapping_v2: [{
        boot_index: '0',
        uuid: selectedImage.id,
        source_type: 'image',
        destination_type: 'volume',
        volume_size: state.systemDisk.cap
      }]
    };

    state.network.forEach(net => data.networks.push({
      uuid: net.id
    }));
    state.port.forEach(ele => {
      data.networks.push({
        port: ele.id
      });
    });

    data.security_groups = state.securityGroup.map(ele => ({name: ele}));

    if(getOsCommonName(selectedImage) === 'windows') {
      data.metadata = {
        admin_pass: state.pwd
      };
      data.adminPass = state.pwd;
    } else {
      if (state.credentialType === 'keypair') {
        data.key_name = state.keypair;
      } else {
        let userData = '#cloud-config\ndisable_root: False\npassword: {0}\nchpasswd:\n list: |\n   root:{0}\n expire: False\nssh_pwauth: True';
        userData = userData.replace(/\{0\}/g, state.pwd);
        data.user_data = window.btoa(userData);
        data.adminPass = state.pwd;
      }
    }

    let num = 0;

    state.dataDisks.forEach((disk, index) => {
      for(let i = 1; i <= disk.number; i ++) {
        data.block_device_mapping_v2.push({
          boot_index: (num + i).toString(),
          uuid: selectedImage.id,
          source_type: 'image',
          destination_type: 'volume',
          volume_size: disk.cap
        });
      }
      num += parseInt(disk.number, 10);
    });

    request.createInstance(data).then((res) => {
      this.onClick();
    }).catch((error) => {
      let errorTip = getErrorMessage(error);

      this.setState({
        disabled: false,
        showError: true,
        error: errorTip
      });
    });
  }

  //获取右侧配置详情的数据
  getDetailData(type) {
    let state = this.state;
    switch(type) {
      case 'name':
      case 'keypair':
        return {
          label: __[type],
          content: state[type]
        };
      case 'image':
      case 'snapshot':
        return {
          label: __[type],
          content: state[type].name
        };
      case 'flavor':
        let flavorRam = unitConverter(state.flavor.ram, 'MB');
        return {
          label: __.flavor,
          content: state.flavor.name !== void 0 && state.flavor.name +
            ' ( ' + state.flavor.vcpus + ' vCPU, ' + flavorRam.num + flavorRam.unit + ' ) '
        };
      case 'system_disk':
        return {
          label: __[type],
          content: state.systemDisk.cap + ' GB'
        };
      case 'data_disk':
        let dataDisks = state.dataDisks;
        return {
          label: __[type],
          content: dataDisks.map((disk, i) =>
            ' ( ' + disk.cap + ' GB, ' +
            __.number + ': ' + disk.number + ' )' +
            (i === dataDisks.length - 1 ? '' : ', '))
        };
      case 'network':
      case 'port':
        return {
          label: __[type],
          content: state[type].map(t => t.name || '(' + t.substr(0, 8) + ')').join(' , ')
        };
      case 'security_group':
        return {
          label: __.security_group,
          content: state.securityGroup.join(' , ')
        };
      default:
        break;
    }
  }

  render() {
    let state = this.state;

    let imageIndex = details.indexOf('image'),
      snapshotIndex = details.indexOf('snapshot');

    if (state.imageType === 'image') {
      if (snapshotIndex !== -1) details.splice(snapshotIndex, 1);
      if (imageIndex === -1) details.splice(1, 0, 'image');
    }
    if (state.imageType === 'snapshot') {
      if (imageIndex !== -1) details.splice(imageIndex, 1);
      if (snapshotIndex === -1) details.splice(1, 0, 'snapshot');
    }

    let keypairIndex = details.indexOf('keypair');

    if (state.credentialType === 'keypair') {
      if (keypairIndex === -1) {
        details.push('keypair');
      }

      if (getOsCommonName(state.image) === 'windows') details.splice(keypairIndex, 1);
    } else {
      if (keypairIndex !== -1) {
        details.splice(keypairIndex, 1);
      }
    }

    return (
      <div className="halo-create-instance">
        <div className="instance-title">{__.instance + '>' + __.create + __.instance}</div>
        <div>
          <div className="instance-content">
            <div className="create-instance-left">
              {this.step(1, 'name', true)}
              <div className="instance-name"><Input onAction={this.onChangeName}/></div>
              {this.step(2, 'image_selection')}
              <ImageSelect prevState={state} onChange={this.onChange.bind(this)}/>
              {this.step(3, 'flavor_selection')}
              <FlavorSelect prevState={state} onChange={this.onChange.bind(this)}/>
              {this.step(4, 'storage')}
              <StorageSelect prevState={state} onChange={this.onChange.bind(this)}/>
              {this.step(5, 'network_config')}
              <NetworkConfig prevState={state} onChange={this.onChange.bind(this)}/>
              {this.step(6, 'security_group')}
              {this.renderSecurityGroups(state)}
              {this.step(7, 'password')}
              <KeyPairSelect prevState={state} onChange={this.onChange.bind(this)}/>
            </div>
            <div className="create-instance-right">
              <div className="right-title">
                {__.config_details}
              </div>
              <div className="right-content">
                { details.map(d => {
                  let data = this.getDetailData(d);
                  return <div key={d}>
                    <div className="label">{data.label}</div>
                    <div className="content">{data.content}</div>
                  </div>;
                })}
              </div>
            </div>
          </div>
          {this.renderError(state)}
          {this.renderButton(state)}
        </div>
      </div>
    );
  }
}

module.exports = ModalBase;
