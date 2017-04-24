var React = require('react');
var ReactDOM = require('react-dom');
var {Modal, Button, Tip, InputNumber, Tooltip} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');
var createNetworkPop = require('client/applications/dashboard/modules/network/pop/create_network/index');
var createKeypairPop = require('client/applications/dashboard/modules/keypair/pop/create_keypair/index');
var request = require('../../request');
var unitConverter = require('client/utils/unit_converter');
var priceConverter = require('../../../../utils/price');
var getErrorMessage = require('../../../../utils/error_message');

const TITLE = __.create + __.instance;

var tooltipHolder;

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    var imageTypes = [{
      value: __.system_image,
      key: 'image'
    }, {
      value: __.instance_snapshot,
      key: 'snapshot'
    }, {
      value: __.volume,
      key: 'bootableVolume'
    }];

    var credentials = [{
      key: 'keypair',
      value: __.keypair
    }, {
      key: 'psw',
      value: __.password
    }];

    this.state = {
      visible: true,
      ready: false,
      disabled: false,
      page: 1,
      pagingAni: false,
      name: '',
      imageTypes: imageTypes,
      imageType: imageTypes[0].key,
      images: [],
      image: null,
      snapshots: [],
      snapshot: null,
      bootableVolumes: [],
      bootableVolume: null,
      flavorUnfold: false,
      flavors: [],
      flavor: null,
      cpus: [],
      cpu: null,
      memories: [],
      memory: null,
      volumes: [],
      volume: null,
      networks: [],
      network: null,
      hideKeypair: false,
      securityGroups: [],
      securityGroup: {},
      sgUnfold: false,
      credentials: credentials,
      credential: credentials[0].key,
      keypairs: [],
      keypairName: '',
      username: '',
      pwd: '',
      pwdVisible: false,
      pwdError: true,
      showPwdTip: false,
      confirmPwd: '',
      confirmPwdVisible: false,
      confirmPwdError: false,
      price: '0.0000',
      number: 1,
      disabledNumber: false,
      error: '',
      showError: false
    };

    ['initialize', 'onPaging', 'onChangeName',
    'unfoldFlavorOptions', 'foldFlavorOptions', 'onChangeNetwork',
    'unfoldSecurity', 'foldSecurity', 'onChangeSecurityGroup',
    'onChangeKeypair', 'onChangeNumber', 'pwdVisibleControl',
    'onChangePwd', 'onFocusPwd', 'onBlurPwd',
    'confirmPwdVisibleControl', 'onChangeConfirmPwd',
    'createNetwork', 'createKeypair', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
    try {
      tooltipHolder = document.createElement('div');
      tooltipHolder.id = 'tooltip_holder';
      document.body.appendChild(tooltipHolder);
    } catch(e) {
      return;
    }
  }

  componentWillMount() {
    request.getData().then(this.initialize);

    if (HALO.settings.enable_charge && !HALO.prices) {
      request.getPrices().then((res) => {
        HALO.prices = priceConverter(res);
      }).catch((error) => {});
    }
  }

  initialize(res) {
    var selectDefault = (arr) => {
      return arr.length > 0 ? arr[0] : null;
    };

    var images = [];
    var snapshots = [];
    var bootableVolumes = [];

    //sort image and snapshot
    res.image.forEach((ele) => {
      let type = ele.image_type;
      if (type === 'distribution') {
        images.push(ele);
      } else if (type === 'snapshot') {
        snapshots.push(ele);
      }
    });

    bootableVolumes = res.volume.filter(ele => {
      if(ele.bootable && ele.bootable === 'true' && !ele.attachments[0]) {
        return true;
      }
      return false;
    });

    var imageSort = (a, b) => {
      var aLabel = Number(a.image_label_order);
      var bLabel = Number(b.image_label_order);
      if (aLabel === bLabel) {
        var aName = Number(a.image_name_order);
        var bName = Number(b.image_name_order);
        return aName - bName;
      } else {
        return aLabel - bLabel;
      }
    };
    images.sort(imageSort);
    snapshots.sort(imageSort);
    bootableVolumes.sort(bootableVolumes);

    var selectedImage = selectDefault(images);
    var username = 'root';
    if (selectedImage.image_meta) {
      let meta = JSON.parse(selectedImage.image_meta);
      username = meta.os_username;
    }

    var flavors = res.flavor;
    this._flavors = flavors;

    var image = selectDefault(images);
    var snapshot = selectDefault(snapshots);
    var bootableVolume = selectDefault(bootableVolumes);
    var currentImage = image;
    var imageType = 'image';
    var obj = this.props.obj;
    if (typeof obj !== 'undefined') {
      currentImage = obj;
      if (obj.image_type === 'distribution') {//image type
        image = obj;
      } else if (obj.image_type === 'snapshot') {
        if(obj.image_type === 'snapshot') {
          snapshot = obj;
          imageType = 'snapshot';
        }
      }
    }
    this.setFlavor(currentImage, 'all');
    var hideKeypair = currentImage && currentImage.image_label ? currentImage.image_label.toLowerCase() === 'windows' : false;
    var credential = hideKeypair ? 'psw' : 'keypair';

    var networks = res.network.filter((ele) => {
      return !ele['router:external'] && ele.subnets.length > 0 ? true : false;
    });

    var sg = res.securitygroup;

    var keypairs = res.keypair;
    var selectedKeypair = selectDefault(keypairs);

    this.setState({
      ready: true,
      imageType: imageType,
      images: images,
      image: image,
      snapshots: snapshots,
      snapshot: snapshot,
      bootableVolumes: bootableVolumes,
      bootableVolume: bootableVolume,
      flavors: flavors,
      networks: networks,
      network: selectDefault(networks),
      securityGroups: sg,
      securityGroup: {},
      keypairs: keypairs,
      keypairName: selectedKeypair ? selectedKeypair.name : null,
      username: username,
      hideKeypair: hideKeypair,
      credential: credential
    });

  }

  findCpu(flavors, cpu) {
    var cpuKeys = {};
    flavors.forEach((ele) => {
      cpuKeys[ele.vcpus] = true;
    });
    var cpus = (Object.keys(cpuKeys)).map((ele) => Number(ele)).sort(this.sortByNumber);
    if (typeof cpu === 'undefined') {
      cpu = cpus[0];
    }
    return {
      cpus: cpus,
      cpu: cpu
    };
  }

  findRam(flavors, cpu, ram) {
    var rawRams = flavors.filter((ele) => ele.vcpus === cpu);
    var ramKeys = {};
    rawRams.forEach((ele) => {
      ramKeys[ele.ram] = true;
    });
    var rams = (Object.keys(ramKeys)).map((ele) => Number(ele)).sort(this.sortByNumber);
    if (typeof ram === 'undefined') {
      ram = rams[0];
    }

    return {
      rams: rams,
      ram: ram
    };
  }

  findDisk(flavors, cpu, ram, disk) {
    var rawDisks = flavors.filter((ele) => ele.vcpus === cpu && ele.ram === ram);
    var diskKeys = {};
    rawDisks.forEach((ele) => {
      diskKeys[ele.disk] = true;
    });
    var disks = (Object.keys(diskKeys)).map((ele) => Number(ele)).sort(this.sortByNumber);
    if (typeof disk === 'undefined') {
      disk = disks[0];
    }

    return {
      disks: disks,
      disk: disk
    };
  }

  findFlavor(flavors, cpu, ram, disk) {
    return flavors.filter((ele) => ele.vcpus === cpu && ele.ram === ram && ele.disk === disk)[0];
  }

  sortByNumber(a, b) {
    return a - b;
  }

  onPaging(page, e) {
    this.setState({
      page: page,
      pagingAni: true
    });
  }

  onChangeName(e) {
    var name = e.target.value;

    this.setState({
      name: name
    });
  }

  onChangeImageType(key, e) {
    var state = this.state;
    var image = state.images.length > 0 ? state.images[0] : null;
    var snapshot = state.snapshots.length > 0 ? state.snapshots[0] : null;
    var bootableVolume = state.bootableVolumes.length > 0 ? state.bootableVolumes[0] : null;

    var username = '';
    var objImage = null;
    switch(key) {
      case 'image':
        objImage = image;
        break;
      case 'snapshot':
        objImage = snapshot;
        break;
      case 'bootableVolume':
        objImage = bootableVolume ? bootableVolume.volume_image_metadata : null;
        this.setState({number: 1});
        break;
      default:
        break;
    }
    if (objImage) {
      let meta = JSON.parse(objImage.image_meta);
      username = meta.os_username;
    }

    var hideKeypair = false;
    if (objImage && objImage.image_label) {
      hideKeypair = objImage.image_label.toLowerCase() === 'windows';
    }
    this.setFlavor(objImage, 'all');

    this.setState({
      imageType: key,
      image: image,
      snapshot: snapshot,
      bootableVolume: bootableVolume,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false,
      disabledNumber: key === 'bootableVolume'
    });
  }

  setFlavor(objImage, type, value) {
    var state = this.state;
    var cpus = state.cpus;
    var cpu = type === 'cpu' ? value : state.cpu;
    var rams = state.memories;
    var ram = type === 'ram' ? value : state.memory;
    var disks = state.volumes;
    var disk = type === 'disk' ? value : state.volume;

    if (objImage) {
      let flavor;
      let expectedSize;
      if (objImage.image_type === 'distribution') {//image and bootableVolume type
        expectedSize = Number(objImage.expected_size);
      } else if (objImage.image_type === 'snapshot') {
        expectedSize = Number(objImage.min_disk);
      }
      let flavors = this._flavors.filter((ele) => ele.disk >= expectedSize);

      var inArray = function(item, arr) {
        return arr.some((ele) => ele === item);
      };

      if (inArray(type, ['all'])) {
        var cpuOpt = this.findCpu(flavors);
        cpus = cpuOpt.cpus;
        cpu = cpuOpt.cpu;
      }
      if (inArray(type, ['all', 'cpu'])) {
        var ramOpt = this.findRam(flavors, cpu);
        rams = ramOpt.rams;
        ram = ramOpt.ram;
      }
      if (inArray(type, ['all', 'cpu', 'ram'])) {
        var diskOpt = this.findDisk(flavors, cpu, ram);
        disks = diskOpt.disks;
        disk = diskOpt.disk;
      }
      if (inArray(type, ['all', 'cpu', 'ram', 'disk'])) {
        flavor = this.findFlavor(flavors, cpu, ram, disk);
      }

      this.setState({
        flavor: flavor,
        cpus: cpus,
        cpu: cpu,
        memories: rams,
        memory: ram,
        volumes: disks,
        volume: disk
      });
    }
  }

  onChangeImage(item, e) {
    var username = '';
    var meta = JSON.parse(item.image_meta);
    username = meta.os_username;

    var label = item.image_label.toLowerCase();
    var hideKeypair = label === 'windows';

    this.setFlavor(item, 'all');
    this.setState({
      image: item,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false
    });
  }

  onChangeSnapshot(item, e) {
    var username = '';
    var meta = JSON.parse(item.image_meta);
    username = meta.os_username;

    var label = item.image_label.toLowerCase();
    var hideKeypair = label === 'windows';

    this.setFlavor(item, 'all');
    this.setState({
      snapshot: item,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false
    });
  }

  onChangeBootableVolume(item, e) {
    var imageData = item.volume_image_metadata;
    var username = '';
    if(imageData.image_meta) {
      var meta = JSON.parse(imageData.image_meta);
      username = meta.os_username;
    }

    var hideKeypair = false;
    if(imageData.image_label) {
      var label = imageData.image_label.toLowerCase();
      hideKeypair = label === 'windows';
    }

    this.setFlavor(imageData, 'all');
    this.setState({
      bootableVolume: item,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false
    });
  }

  unfoldFlavorOptions(e) {
    this.setState({
      flavorUnfold: true
    });

    document.addEventListener('mouseup', this.foldFlavorOptions, false);
    this.refs.drop_flavor.addEventListener('mouseup', this.preventFoldFlavorOptions, false);
  }

  preventFoldFlavorOptions(e) {
    e.stopPropagation();
  }

  foldFlavorOptions(e) {
    this.setState({
      flavorUnfold: false
    });

    document.removeEventListener('mouseup', this.foldFlavorOptions, false);
    this.refs.drop_flavor.removeEventListener('mouseup', this.preventFoldFlavorOptions, false);
  }

  onChangeNetwork(e) {
    var subnets = this.state.networks;
    var selected = e.target.value;

    var item;
    subnets.some((ele) => {
      if (ele.id === selected) {
        item = ele;
        return true;
      }
      return false;
    });

    this.setState({
      network: item
    });
  }

  unfoldSecurity(e) {
    this.setState({
      sgUnfold: true
    });

    document.addEventListener('mouseup', this.foldSecurity, false);
    this.refs.drop_security.addEventListener('mouseup', this.preventFoldSecurity, false);
  }

  preventFoldSecurity(e) {
    e.stopPropagation();
  }

  foldSecurity(e) {
    this.setState({
      sgUnfold: false
    });

    document.removeEventListener('mouseup', this.foldSecurity, false);
    this.refs.drop_security.removeEventListener('mouseup', this.preventFoldSecurity, false);
  }

  onChangeCredential(key, e) {
    this.setState({
      credential: key,
      pwdError: true,
      pwd: '',
      pwdVisible: false
    });
  }

  onChangeKeypair(e) {
    var name = e.target.value;

    this.setState({
      keypairName: name
    });
  }

  checkPsw(pwd) {
    return (pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd));
  }

  onChangePwd(e) {
    let pwd = e.target.value;
    let pwdError = this.checkPsw(pwd);

    this.setState({
      pwdError: pwdError,
      showPwdTip: true,
      pwd: pwd,
      confirmPwdError: (this.state.confirmPwd !== pwd) || pwdError
    });
  }

  onFocusPwd(e) {
    let isError = this.checkPsw(this.state.pwd);

    this.setState({
      showPwdTip: isError
    });
  }

  onBlurPwd(e) {
    this.setState({
      showPwdTip: false
    });
  }

  onChangeConfirmPwd(e) {
    let pwd = e.target.value;
    let pwdError = !(pwd === this.state.pwd);

    this.setState({
      confirmPwdError: pwdError,
      confirmPwd: pwd
    });
  }

  onChangeNumber(number) {
    this.setState({
      number: number
    });
  }

  createNetwork() {
    createNetworkPop(this.refs.modal, (network) => {
      this.setState({
        networks: [network],
        network: network
      });
    });

    this.stopSliding();
  }

  createKeypair() {
    createKeypairPop(this.refs.modal, (keypair) => {
      this.setState({
        keypairs: [keypair],
        keypairName: keypair.name
      });
    });

    this.stopSliding();
  }

  stopSliding() {
    this.setState({
      pagingAni: false
    });
  }

  findDefaultFlavor(flavors, cpu, ram, disk) {
    var defaultFlavor;
    flavors.some((ele) => {
      if (ele.vcpus === cpu && ele.ram === ram && ele.disk === disk) {
        defaultFlavor = ele;
        return true;
      }
      return false;
    });

    return defaultFlavor;
  }

  findSelectedImage() {
    var state = this.state;
    switch(state.imageType) {
      case 'image':
        return state.image;
      case 'snapshot':
        return state.snapshot;
      case 'bootableVolume':
        return state.bootableVolume.volume_image_metadata;
      default:
        return null;
    }
  }

  onChangeCpu(cpu, e) {
    var img = this.findSelectedImage();
    this.setFlavor(img, 'cpu', cpu);
  }

  onChangeMemory(ram, e) {
    var img = this.findSelectedImage();
    this.setFlavor(img, 'ram', ram);
  }

  onChangeVolume(disk, e) {
    var img = this.findSelectedImage();
    this.setFlavor(img, 'disk', disk);
  }

  onChangeSecurityGroup(sg, e) {
    var state = this.state;
    var selects = state.securityGroup;

    if (selects[sg.id]) {
      delete selects[sg.id];
    } else {
      selects[sg.id] = true;
    }

    this.setState({
      securityGroup: selects
    });

    e.stopPropagation();
  }

  onConfirm() {
    var state = this.state;
    if (state.disabled) {
      return;
    }

    var enable = state.name && state.flavor && state.network && state.number,
      enableImage = false;
    var selectedImage;
    if (state.imageType === 'image') {
      enable = enable && state.image;
      enableImage = enable;
      selectedImage = state.image;
    } else if (state.imageType === 'snapshot') {
      enable = enable && state.snapshot;
      enableImage = enable;
      selectedImage = state.snapshot;
    } else {
      enable = enable && state.bootableVolume;
      selectedImage = state.bootableVolume;
    }
    if (state.credential === 'keypair') {
      enable = enable && state.keypairName;
    } else {
      enable = enable && !state.pwdError;
    }

    if (enable) {
      var data = {};
      if(enableImage) {
        data = {
          name: state.name.trim(),
          imageRef: selectedImage.id,
          flavorRef: state.flavor.id,
          networks: [{
            uuid: state.network.id
          }],
          min_count: state.number,
          max_count: state.number
        };
      } else {
        var bootVolume = state.bootableVolume;
        data = {
          name: state.name.trim(),
          block_device_mapping_v2: [{
            destination_type: 'volume',
            boot_index: 0,
            uuid: bootVolume.id,
            source_type: 'volume',
            volume_size: bootVolume.size,
            delete_on_termination: false
          }],
          flavorRef: state.flavor.id,
          networks: [{
            uuid: state.network.id
          }],
          min_count: state.number,
          max_count: state.number
        };
      }

      if (state.number > 1) {
        data.return_reservation_id = true;
      }

      if (state.credential === 'keypair') {
        data.key_name = state.keypairName;
      } else {
        if(selectedImage.image_label === 'Windows') {
          data.metadata = {
            admin_pass: state.pwd
          };
        } else {
          //store pwd for linux
          var userData = '#cloud-config\ndisable_root: False\npassword: {0}\nchpasswd:\n list: |\n   root:{0}\n expire: False\nssh_pwauth: True';
          userData = userData.replace(/\{0\}/g, state.pwd);
          data.user_data = window.btoa(userData);
        }
        data.adminPass = state.pwd;
      }

      var selectedSg = state.securityGroup;
      var securitygroups = state.securityGroups;
      var sg = [];
      securitygroups.forEach((ele) => {
        if (selectedSg[ele.id]) {
          sg.push({
            name: ele.name
          });
        }
      });
      if (sg.length > 0) {
        data.security_groups = sg;
      }

      request.createInstance(data).then((res) => {
        this.props.callback && this.props.callback(res.server);
        this.setState({
          visible: false
        });
      }).catch((error) => {
        var errorTip = getErrorMessage(error);

        this.setState({
          disabled: false,
          showError: true,
          error: errorTip
        });
      });

      this.setState({
        disabled: true
      });
    }
  }

  renderName(props, state) {
    return (
      <div className="row row-input">
        <div className="modal-label">
          <strong>* </strong>{__.name}
        </div>
        <div className="modal-data">
          <input type="text" onChange={this.onChangeName} value={state.name} />
        </div>
      </div>
    );
  }

  onMouseOverItem(content, e) {
    let ct = e.currentTarget;
    if(ct.scrollWidth > ct.clientWidth && content) {
      let style = {
        top: ct.getBoundingClientRect().top + 'px',
        left: ct.getBoundingClientRect().left + 'px'
      };
      ReactDOM.render(<div className="tip-wrapper" style={style}>
        <Tooltip content={content} width={ct.offsetWidth} shape="top"/>
      </div>, tooltipHolder);
    }
  }

  onMouseLeaveItem() {
    if(tooltipHolder.childNodes.length > 0) {
      ReactDOM.unmountComponentAtNode(tooltipHolder);
    }
  }

  renderImages(props, state) {
    var Types = (
      <div className="row row-tab row-tab-single" key="types">
        <div className="modal-label">
          {__.image}
        </div>
        <div className="modal-data">
          {
            state.imageTypes.map((ele) =>
              <a key={ele.key}
                className={ele.key === state.imageType ? 'selected' : ''}
                onClick={ele.key === state.imageType ? null : this.onChangeImageType.bind(this, ele.key)}>
                {ele.value}
              </a>
            )
          }
        </div>
      </div>
    );

    var selectedKey = state.imageType;
    var style = null;

    var imgURL = HALO.settings.default_image_url;
    if (imgURL) {
      style = {
        background: `url("${imgURL}") 0 0 no-repeat`,
        backgroundSize: '20px 20px'
      };
    }
    var Images = (
      <div className={'row row-tab row-tab-single row-tab-images' + (selectedKey === 'image' ? '' : ' hide')} key="images">
        {
          !state.ready ?
            <div className="alert-tip">
              {__.loading}
            </div>
          : null
        }
        {
          state.images.map((ele) =>
            <a onMouseOver={this.onMouseOverItem.bind(this, ele.name)} onMouseLeave={this.onMouseLeaveItem.bind(this)} key={ele.id} className={state.image.id === ele.id ? 'selected' : ''}
              onClick={state.image.id === ele.id ? null : this.onChangeImage.bind(this, ele)}>
              <i className={'icon-image-default ' + (ele.image_label && ele.image_label.toLowerCase())} style={style}></i>
                {ele.name}
            </a>
          )
        }
        {
          state.ready && !state.image ?
            <div className="alert-tip">
              {__.there_is_no + __.image}
            </div>
          : null
        }
      </div>
    );
    var Snapshots = (
      <div className={'row row-tab row-tab-single row-tab-images' + (selectedKey === 'snapshot' ? '' : ' hide')} key="snapshots">
        {
          !state.ready ?
            <div className="alert-tip">
              {__.loading}
            </div>
          : null
        }
        {
          state.snapshots.map((ele) =>
            <a onMouseOver={this.onMouseOverItem.bind(this, ele.name)} onMouseLeave={this.onMouseLeaveItem.bind(this)} key={ele.id} className={state.snapshot.id === ele.id ? 'selected' : ''}
              onClick={state.snapshot.id === ele.id ? null : this.onChangeSnapshot.bind(this, ele)}>
              <i className={'icon-image-default ' + (ele.image_label && ele.image_label.toLowerCase())}></i>
                {ele.name}
            </a>
          )
        }
        {
          state.ready && !state.snapshot ?
            <div className="alert-tip">
              {__.there_is_no + __.snapshot}
            </div>
          : null
        }
      </div>
    );
    var BootableVolumes = (
      <div className={'row row-tab row-tab-single row-tab-images' + (selectedKey === 'bootableVolume' ? '' : ' hide')} key="bootableVolumes">
        {
          !state.ready ?
            <div className="alert-tip">
              {__.loading}
            </div>
          : null
        }
        {
          state.bootableVolumes.map((ele) =>
            <a onMouseOver={this.onMouseOverItem.bind(this, ele.name)} onMouseLeave={this.onMouseLeaveItem.bind(this)} key={ele.id} className={state.bootableVolume.id === ele.id ? 'selected' : ''}
              onClick={state.bootableVolume.id === ele.id ? null : this.onChangeBootableVolume.bind(this, ele)}>
              <i className="glyphicon icon-volume" style={{'marginRight': '6px'}}></i>
                {ele.name ? ele.name : ( '(' + ele.id.substr(0, 8) + ')' )}
            </a>
          )
        }
        {
          state.ready && !state.bootableVolume ?
            <div className="alert-tip">
              {__.there_is_no + __.bootable}
            </div>
          : null
        }
      </div>
    );

    var ret = [];
    ret.push(Types);
    ret.push(Images);
    ret.push(Snapshots);
    ret.push(BootableVolumes);

    return ret;
  }

  renderFlavors(props, state) {
    var data = [{
      key: 'cpu',
      title: __.cpu + __.type,
      data: state.cpus,
      render: (val) => {
        return val + ' vCPU';
      },
      selected: state.cpu,
      onChange: this.onChangeCpu
    }, {
      key: 'memory',
      title: __.memory + __.size,
      data: state.memories,
      render: (val) => {
        var res = unitConverter(Number(val), 'MB');
        return res.num + ' ' + res.unit;
      },
      selected: state.memory,
      onChange: this.onChangeMemory
    }, {
      key: 'volume',
      title: __.system_disk + __.size,
      data: state.volumes,
      selected: state.volume,
      render: (val) => {
        return val + ' GB';
      },
      onChange: this.onChangeVolume
    }];

    var flavor = state.flavor;
    var flavorDetail;
    if (flavor) {
      let ram = unitConverter(flavor.ram, 'MB');
      flavorDetail = flavor.name + ' ( ' +
        flavor.vcpus + ' vCPU / ' +
        ram.num + ' ' + ram.unit + ' / ' +
        flavor.disk + ' GB )';
    } else {
      flavorDetail = '';
    }

    return (
      <div className="row row-dropdown">
        <div className="modal-label">
          {__.flavor}
        </div>
        <div className="modal-data">
          <div className="dropdown-overview" onClick={this.unfoldFlavorOptions}>
            {flavorDetail}
            <div className="triangle" />
          </div>
          <div ref="drop_flavor" className={'dropdown-box' + (state.flavorUnfold ? '' : ' hide')}>
            {
              data.map((ele) =>
                <div className="dropdown-item" key={ele.key}>
                  <div className="dropdown-item-title">{ele.title}</div>
                  <div className="dropdown-item-data">
                    <ul>
                      {
                        ele.data.map((value) =>
                          <li key={value} className={ele.selected === value ? 'selected' : null}
                            onClick={ele.selected === value ? null : (ele.onChange).bind(this, value)}>
                            {ele.render(value)}
                          </li>
                        )
                      }
                    </ul>
                  </div>
                </div>
              )
            }
            <div className="dropdown-collapse">
              <Button value={__.fold_up} onClick={this.foldFlavorOptions}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderNetworks(props, state) {
    var selected = state.network;
    return (
      <div className="row row-select">
        <div className="modal-label">
          {__.network}
        </div>
        <div className="modal-data">
          {
            selected ?
              <select value={selected.id} onChange={this.onChangeNetwork}>
                {
                  state.networks.map((ele) =>
                    <option key={ele.id} value={ele.id}>
                      {ele.name ? ele.name : '(' + ele.id.substr(0, 8) + ')'}
                    </option>
                  )
                }
              </select>
            : <div className="empty-text-label" onClick={this.createNetwork}>
                {__.no_network + ' '}
                <a>{__.create + __.network}</a>
              </div>
          }
        </div>
      </div>
    );
  }

  renderSecurityGroup(props, state) {
    var selects = state.securityGroup;
    var hasSelects = Object.keys(selects).length > 0 ? true : false;
    var selectObj = state.securityGroups.filter((ele) => selects[ele.id]);
    var detail = selectObj.map((ele) => ele.name).join(', ');

    return (
      <div className="row row-dropdown row-security-group">
        <div className="modal-label">
          {__.security_group}
        </div>
        <div className="modal-data">
          <div className={'dropdown-overview' + (hasSelects ? '' : ' no-data')} onClick={this.unfoldSecurity}>
            {hasSelects ? detail : __.no_selected_sg}
            <div className="triangle" />
          </div>
          <div ref="drop_security" className={'dropdown-box' + (state.sgUnfold ? '' : ' hide')}>
            <div className="dropdown-item">
              <div className="dropdown-item-title">{__.security_group}</div>
              <div className="dropdown-item-data">
                <ul>
                  {
                    state.securityGroups.map((ele) => {
                      var selected = selects[ele.id];
                      return (
                        <li key={ele.id}
                          className={selected ? 'selected' : null}
                          onClick={this.onChangeSecurityGroup.bind(this, ele)}>
                          {ele.name}
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            </div>
            <div className="dropdown-collapse">
              <Button value={__.fold_up} onClick={this.foldSecurity}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  pwdVisibleControl(e) {
    let visible = this.state.pwdVisible;
    this.setState({
      pwdVisible: !visible
    });
  }

  confirmPwdVisibleControl(e) {
    let visible = this.state.confirmPwdVisible;
    this.setState({
      confirmPwdVisible: !visible
    });
  }

  renderCredentials(props, state) {
    var selected = state.credential;
    var isKeypair = selected === 'keypair';

    var credentials = state.credentials;
    var hideKeypair = state.hideKeypair;

    if (hideKeypair) {
      credentials = [credentials[1]];
    }

    var Types = (
      <div className="row row-tab row-tab-credential" key="types">
        <div className="modal-label">
          {__.credentials}
        </div>
        <div className="modal-data">
          {
            credentials.map((ele) =>
              <a key={ele.key}
                className={ele.key === selected ? 'selected' : ''}
                onClick={ele.key === selected ? null : this.onChangeCredential.bind(this, ele.key)}>
                {ele.value}
              </a>
            )
          }
        </div>
      </div>
    );

    var keypair = state.keypairName;
    var Keypairs = (
      <div className={'row row-select credential-sub' + (isKeypair ? '' : ' hide')} key="keypairs">
        <div className="modal-label">
          {__.keypair}
        </div>
        <div className="modal-data">
          {
            state.keypairName ?
              <select value={keypair} onChange={this.onChangeKeypair}>
                {
                  state.keypairs.map((ele) =>
                    <option key={ele.name} value={ele.name}>{ele.name}</option>
                  )
                }
              </select>
            : <div className="empty-text-label" onClick={this.createKeypair}>
                {__.no_keypair + ' '}
                <a>{__.create + __.keypair}</a>
              </div>
          }
        </div>
      </div>
    );

    var Psw = (
      <div className={'row row-select credential-sub' + (isKeypair ? ' hide' : '')} key="psw">
        <div className="modal-data">
          <div className="input-user">
            <label>{__.user_name}</label>
            <input type="text" value={state.username} disabled={true} onChange={function(){}} />
          </div>
          <div className="input-psw">
            <label>{__.password}</label>
            <div className="psw-tip-box">
              {
                state.page === 2 && state.showPwdTip ?
                  <Tooltip content={__.pwd_tip} width={214} shape="top-left" type={'error'} hide={!state.pwdError} />
                : null
              }
              <i className={'glyphicon icon-eye icon-eye-first' + (state.pwdVisible ? ' selected' : '')}
                onClick={this.pwdVisibleControl}/>
              <input type={state.pwdVisible ? 'text' : 'password'}
                className={state.pwdError ? 'error' : null}
                value={state.pwd}
                onChange={this.onChangePwd}
                onFocus={this.onFocusPwd}
                onBlur={this.onBlurPwd}
                placeholder={__.pwd_placeholder} />
              <i className={'glyphicon icon-eye' + (state.confirmPwdVisible ? ' selected' : '')}
                onClick={this.confirmPwdVisibleControl}/>
              <input type={state.confirmPwdVisible ? 'text' : 'password'}
                className={state.confirmPwdError ? 'error' : null}
                value={state.confirmPwd}
                onChange={this.onChangeConfirmPwd}
                placeholder={__.confirm_pwd_placeholder} />
            </div>
          </div>
        </div>
      </div>
    );

    var CrdTips = (
      <div className="credential-tips" key="tips">
        <i className="glyphicon icon-status-warning" />
        {__.instance_credential_tip}
      </div>
    );

    var ret = [];
    ret.push(Types);
    ret.push(Keypairs);
    ret.push(Psw);
    ret.push(CrdTips);

    return ret;
  }

  renderCreateNum(props, state) {
    var price = state.price;
    var numPrice = price;
    var monthlyPrice = price;

    var enableCharge = HALO.settings.enable_charge;
    if (enableCharge && state.flavor) {
      let type = state.flavor.name;
      if (HALO.prices) {
        price = HALO.prices['instance:' + type] ? HALO.prices['instance:' + type].unit_price.price.segmented[0].price : HALO.prices[type].unit_price.price.segmented[0].price;
        numPrice = (Number(price) * state.number).toFixed(4);
        monthlyPrice = (Number(numPrice) * 24 * 30).toFixed(4);
      }
    }

    return (
      <div className="row row-select">
        <div className="modal-label">
          {__.number}
        </div>
        <div className="modal-data">
          <InputNumber onChange={this.onChangeNumber} disabled={state.disabledNumber} min={1} value={state.number} width={120}/>
          {
            enableCharge ?
              <div className="account-box">
                <span className="account-sm">
                  x <strong>{__.account.replace('{0}', +price)}</strong> / <span>{__.hour}</span> =
                </span>
                <span className="account-md">
                  x <strong>{__.account.replace('{0}', +numPrice)}</strong> / <span>{__.hour}</span>
                </span>
                <span className="account-md account-gray">
                  {'( ' + __.account.replace('{0}', +monthlyPrice) + ' / ' + __.month + ' )'}
                </span>
              </div>
            : false
          }
        </div>
      </div>
    );
  }

  renderErrorTip(props, state) {
    return (
      <div className={'row row-tip' + (state.showError ? '' : ' hide')}>
        <Tip content={state.error} type="danger" showIcon={true} width={652} />
      </div>
    );
  }

  renderBtn(props, state, page) {
    if (page === 1) {
      var hasImage = false;
      if (state.imageType === 'image') {
        hasImage = state.image;
      } else if (state.imageType === 'snapshot') {
        hasImage = state.snapshot;
      } else {
        hasImage = state.bootableVolume;
      }

      let enable = state.name.trim() && state.ready && hasImage;

      return (
        <div className="right-side">
          <Button value={__.next} disabled={!enable} type="create" onClick={this.onPaging.bind(this, 2)} />
        </div>
      );
    } else {
      let enable = state.flavor && state.network && state.number;
      if (state.credential === 'keypair') {
        enable = enable && state.keypairName;
      } else {
        enable = enable && !state.pwdError && !state.confirmPwdError;
      }

      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, 1)} />
          </div>
          <div className="right-side">
            <Button value={__.create} disabled={state.disabled || !enable} type="create" onClick={this.onConfirm} />
          </div>
        </div>
      );
    }
  }

  render() {
    var props = this.props;
    var state = this.state;

    var page = state.page;
    var slideClass = '';
    if (state.pagingAni) {
      slideClass = page === 1 ? ' move-out' : ' move-in';
    } else {
      slideClass = page === 1 ? '' : ' second-page';
    }

    return (
      <Modal ref="modal" {...props} title={TITLE} visible={state.visible} width={726}>
        <div className="modal-bd halo-com-modal-create-instance">
          <div className={'page' + slideClass}>
            {this.renderName(props, state)}
            {this.renderImages(props, state)}
          </div>
          <div className={'page' + slideClass}>
            {this.renderFlavors(props, state)}
            {this.renderNetworks(props, state)}
            {this.renderSecurityGroup(props, state)}
            {this.renderCredentials(props, state)}
            {this.renderCreateNum(props, state)}
            {this.renderErrorTip(props, state)}
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-instance">
          {this.renderBtn(props, state, page)}
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
