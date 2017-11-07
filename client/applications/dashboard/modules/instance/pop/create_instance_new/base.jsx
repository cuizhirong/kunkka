const React = require('react');
const ReactDOM = require('react-dom');
const {Modal, Button, Tip, InputNumber, Tooltip} = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');
const createNetworkPop = require('client/applications/dashboard/modules/network/pop/create_network/index');
const createPortPop = require('client/applications/dashboard/modules/port/pop/create_port/index');
const createKeypairPop = require('client/applications/dashboard/modules/keypair/pop/create_keypair/index');
const request = require('../../request');
const unitConverter = require('client/utils/unit_converter');
const getErrorMessage = require('../../../../utils/error_message');
const initialState = require('./state');
const helper = require('./helper');
const constant = require('./constant');
const TabStep = require('./tab_step');
const getStatusIcon = require('../../../../utils/status_icon');
const VolumeTip = require('./volume_tip');
const DetailModal = require('./modal_detail');

const FLAVOR_ID = 'flavor-container';

const TITLE = __.create + __.instance;

let tooltipHolder;
let tooltipCreateVolume;

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = initialState.getInitialState(constant.imageTypes, constant.credentials);

    this.volumeTip;
    this.detailRef;

    ['initialize', 'onPaging', 'onChangeName',
    'unfoldSecurity', 'foldSecurity', 'createPort',
    'onChangeKeypair', 'onChangeNumber', 'pwdVisibleControl',
    'onChangePwd', 'onFocusPwd', 'onBlurPwd',
    'confirmPwdVisibleControl', 'onChangeConfirmPwd',
    'createNetwork', 'createKeypair', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
    try {
      tooltipHolder = document.createElement('div');
      tooltipHolder.id = 'tooltip_holder';
      tooltipCreateVolume = document.createElement('div');
      tooltipCreateVolume.id = 'tooltip_volume';
      document.body.appendChild(tooltipHolder);
      document.body.appendChild(tooltipCreateVolume);
    } catch(e) {
      return;
    }
  }

  componentWillMount() {
    request.getData().then(this.initialize);
  }

  initialize(res) {
    let selectDefault = (arr) => {
      return arr.length > 0 ? arr[0] : null;
    };

    let images = [];
    let snapshots = [];
    let bootableVolumes = [];
    let volumeSnapshots = [];

    //sort image and snapshot
    res.image.forEach((ele) => {
      let type = ele.image_type;
      if (type !== 'snapshot') {
        images.push(ele);
      } else {
        snapshots.push(ele);
      }
    });

    bootableVolumes = res.volume.filter(ele => {
      if(ele.bootable && ele.bootable === 'true' && !ele.attachments[0]) {
        return true;
      }
      return false;
    });

    volumeSnapshots = res.snapshot;

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
    bootableVolumes.sort();

    let selectedImage = selectDefault(images);
    let username = 'root';

    if (selectedImage.image_meta) {
      let meta = JSON.parse(selectedImage.image_meta);
      username = meta.os_username;
    }

    let flavors = res.flavor;
    this._flavors = flavors;

    let image = selectDefault(images);
    let snapshot = selectDefault(snapshots);
    let bootableVolume = selectDefault(bootableVolumes);
    let volumeSnapshot = selectDefault(volumeSnapshots);
    let currentImage = image;
    let imageType = 'image';
    let obj = this.props.obj;
    if (typeof obj !== 'undefined') {
      currentImage = obj;
      if (obj.image_type !== 'snapshot') {//image type
        image = obj;
      } else if (obj.image_type === 'snapshot') {
        snapshot = obj;
        imageType = 'snapshot';
      }
    }
    this.setFlavor(currentImage, 'all');
    let hideKeypair = currentImage && currentImage.image_label ? currentImage.image_label.toLowerCase() === 'windows' : false;
    let credential = hideKeypair ? 'psw' : 'keypair';

    let networks = res.network.filter((ele) => {
      return !ele['router:external'] && ele.subnets.length > 0 ? true : false;
    });

    let ports = res.port.filter(ele => {
      return !ele.device_owner ? true : false;
    });

    let sg = res.securitygroup;

    let keypairs = res.keypair;
    let selectedKeypair = selectDefault(keypairs);

    this.setState({
      ready: true,
      ports: ports,
      imageType: imageType,
      images: images,
      image: image,
      snapshots: snapshots,
      snapshot: snapshot,
      bootableVolumes: bootableVolumes,
      bootableVolume: bootableVolume,
      volumeSnapshots: volumeSnapshots,
      volumeSnapshot: volumeSnapshot,
      networks: networks,
      securityGroups: sg,
      keypairs: keypairs,
      keypairName: selectedKeypair ? selectedKeypair.name : null,
      username: username,
      hideKeypair: hideKeypair,
      credential: credential,
      deviceSize: image.min_disk || 1
    });

  }

  onPaging(page, fromto, e) {
    let {step, isDetail} = this.state,
      stepData = constant.stepData;

    if (step.length > page) {
      step.pop();
    } else if (step.length <= page) {
      step.push(stepData[page - 1].key);
    }

    if (page === 4) {
      this.detailRef && this.detailRef.setState({
        isShow: true
      });

      this.setState({
        isShowDetail: true
      });
    } else if (page !== 4 && !isDetail) {
      this.detailRef && this.detailRef.setState({
        isShow: false
      });

      this.setState({
        isShowDetail: false
      });
    }

    this.setState({
      page: page,
      pagingAni: true,
      step: step,
      fromTo: fromto
    });
  }

  onChangeName(e) {
    let name = e.target.value;

    this.setState({
      name: name
    });
  }

  onChangeDetail(e) {
    this.detailRef && this.detailRef.setState({
      isShow: true
    });

    this.setState({
      isShowDetail: true,
      isDetail: true
    });
  }

  onAction() {
    this.setState({
      isShowDetail: false
    });
  }

  onChangeImageType(key, e) {
    let state = this.state;
    let image = state.images.length > 0 ? state.images[0] : null;
    let snapshot = state.snapshots.length > 0 ? state.snapshots[0] : null;
    let bootableVolume = state.bootableVolumes.length > 0 ? state.bootableVolumes[0] : null;
    let volumeSnapshot = state.volumeSnapshots.length > 0 ? state.volumeSnapshots[0] : null;

    let username = 'root';
    let objImage = null,
      deviceSize = 1;
    switch(key) {
      case 'image':
        objImage = image;
        deviceSize = image.min_disk || 1;
        break;
      case 'snapshot':
        objImage = snapshot;
        deviceSize = snapshot.min_disk || 1;
        break;
      case 'bootableVolume':
        objImage = bootableVolume ? bootableVolume.volume_image_metadata : null;
        this.setState({number: 1});
        break;
      case 'volumeSnapshot':
        objImage = volumeSnapshot ? volumeSnapshot.volume.volume_image_metadata : null;
        break;
      default:
        break;
    }
    if (objImage && objImage.image_meta) {
      let meta = JSON.parse(objImage.image_meta);
      username = meta.os_username;
    }

    let hideKeypair = false;
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
      disabledNumber: key === 'bootableVolume',
      deviceSize: deviceSize
    });
  }

  setFlavor(objImage, type, value) {
    let state = this.state;
    let cpus = state.cpus;
    let cpu = type === 'cpu' ? value : state.cpu;
    let rams = state.memories;
    let ram = type === 'ram' ? value : state.memory;
    let disks = state.volumes;
    let disk = type === 'disk' ? value : state.volume;

    if (objImage) {
      let flavor;
      let expectedSize = 0;
      if (objImage.expected_size || objImage.min_disk) {
        if (objImage.expected_size) {
          expectedSize = Number(objImage.expected_size);
        }
        if (objImage.min_disk) {
          let minDisk = Number(objImage.min_disk);
          expectedSize = minDisk > expectedSize ? minDisk : expectedSize;
        }
      }

      let flavors = this._flavors.filter((ele) => ele.disk >= expectedSize);

      let inArray = function(item, arr) {
        return arr.some((ele) => ele === item);
      };

      if (inArray(type, ['all'])) {
        let cpuOpt = helper.findCpu(flavors);
        cpus = cpuOpt.cpus;
        cpu = cpuOpt.cpu;
      }

      if (inArray(type, ['all', 'cpu'])) {
        let ramOpt = helper.findRam(flavors, cpu);
        rams = ramOpt.rams;
        ram = ramOpt.ram;
      }
      if (inArray(type, ['all', 'cpu', 'ram'])) {
        let diskOpt = helper.findDisk(flavors, cpu, ram);
        disks = diskOpt.disks;
        disk = diskOpt.disk;
      }
      if (inArray(type, ['all', 'cpu', 'ram', 'disk'])) {
        flavor = helper.findFlavor(flavors, cpu, ram, disk);
      }

      this.setState({
        flavor: flavor,
        flavors: flavors,
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
    let username = 'root';
    if (item.image_meta) {
      let meta = JSON.parse(item.image_meta);
      username = meta.os_username;
    }

    let hideKeypair = false;
    if (item.image_label) {
      hideKeypair = item.image_label.toLowerCase() === 'windows';
    }

    this.setFlavor(item, 'all');
    this.setState({
      image: item,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false,
      deviceSize: item.min_disk || 1
    });
  }

  onChangeSnapshot(item, e) {
    let username = 'root';
    if (item.image_meta) {
      let meta = JSON.parse(item.image_meta);
      username = meta.os_username;
    }

    let hideKeypair = false;
    if (item.image_label) {
      hideKeypair = item.image_label.toLowerCase() === 'windows';
    }

    this.setFlavor(item, 'all');
    this.setState({
      snapshot: item,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false,
      deviceSize: item.min_disk || 1
    });
  }

  onChangeBootableVolume(item, e) {
    let imageData = item.volume_image_metadata;
    let username = '';
    if(imageData && imageData.image_meta) {
      let meta = JSON.parse(imageData.image_meta);
      username = meta.os_username;
    }

    let hideKeypair = false;
    if(imageData && imageData.image_label) {
      let label = imageData.image_label.toLowerCase();
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

  onChangeVolumeSnapshot(item, e) {
    let imageData = item.volume.volume_image_metadata;
    let username = 'root';
    if (imageData && imageData.image_meta) {
      let meta = JSON.parse(item.image_meta);
      username = meta.os_username;
    }

    let hideKeypair = false;
    if (imageData && imageData.image_label) {
      let label = imageData.image_label.toLowerCase();
      hideKeypair = label === 'windows';
    }

    this.setFlavor(imageData, 'all');

    this.setState({
      volumeSnapshot: item,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false
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
    let name = e.target.value;

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
        networks: [network]
      });
    });

    this.stopSliding();
  }

  createPort() {
    createPortPop(null, this.refs.modal, (port) => {
      this.setState({
        ports: [port.port]
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
    let defaultFlavor;
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
    let state = this.state;
    switch(state.imageType) {
      case 'image':
        return state.image;
      case 'snapshot':
        return state.snapshot;
      case 'bootableVolume':
        return state.bootableVolume.volume_image_metadata;
      case 'volumeSnapshot':
        return state.volumeSnapshot.volume.volume_image_metadata;
      default:
        return null;
    }
  }

  onChangeCpu(cpu, e) {
    let img = this.findSelectedImage();
    this.setFlavor(img, 'cpu', cpu);
  }

  onChangeMemory(ram, e) {
    let img = this.findSelectedImage();
    this.setFlavor(img, 'ram', ram);
  }

  onChangeVolume(disk, e) {
    let img = this.findSelectedImage();
    this.setFlavor(img, 'disk', disk);
  }

  onConfirm() {
    let state = this.state;
    let networks = [];
    if (state.disabled) {
      return;
    }

    let enable = state.name && state.flavor && state.network && state.number,
      enableImage = false, enableVolumeImage = false;
    let selectedImage, volumeTip = this.volumeTip.state;

    if (state.imageType === 'image') {
      enable = enable && state.image;
      enableImage = enable;
      selectedImage = state.image;
    } else if (state.imageType === 'snapshot') {
      enable = enable && state.snapshot;
      enableImage = enable;
      selectedImage = state.snapshot;
    } else if (state.imageType === 'bootableVolume'){
      enable = enable && state.bootableVolume;
      selectedImage = state.bootableVolume;
    } else {
      enableVolumeImage = true;
      selectedImage = state.volumeSnapshot;
    }

    if (state.credential === 'keypair') {
      enable = enable && state.keypairName;
    } else {
      enable = enable && !state.pwdError;
    }

    state.network.forEach(ele => {
      networks.push({
        uuid: ele.id
      });
    });

    state.port.forEach(ele => {
      networks.push({
        port: ele.id
      });
    });

    if (enable) {
      let data = {};
      if(enableImage) {
        data = {
          name: state.name.trim(),
          imageRef: selectedImage.id,
          flavorRef: state.flavor.id,
          networks: networks,
          min_count: state.number,
          max_count: state.number
        };
        if (volumeTip.checked === 'yes') {
          data.block_device_mapping_v2 = [{
            destination_type: 'volume',
            boot_index: 0,
            uuid: selectedImage.id,
            source_type: 'image',
            volume_size: volumeTip.deviceSize,
            device_name: volumeTip.deviceName,
            delete_on_termination: volumeTip.deleteVolume === 'yes'
          }];
          let dataVol = {};
          dataVol.size = Number(volumeTip.deviceSize);
          dataVol.imageRef = selectedImage.id;

          request.createVolume(dataVol);
        }
      } else if (enableVolumeImage) {
        let volumeSnapshot = state.volumeSnapshot;
        data = {
          name: state.name.trim(),
          block_device_mapping_v2: [{
            destination_type: 'volume',
            boot_index: 0,
            uuid: volumeSnapshot.id,
            source_type: 'snapshot',
            volume_size: volumeSnapshot.size,
            delete_on_termination: volumeTip.deleteVolume === 'yes'
          }],
          flavorRef: state.flavor.id,
          networks: networks,
          min_count: state.number,
          max_count: state.number
        };
      } else {
        let bootVolume = state.bootableVolume;
        data = {
          name: state.name.trim(),
          block_device_mapping_v2: [{
            destination_type: 'volume',
            boot_index: 0,
            uuid: bootVolume.id,
            source_type: 'volume',
            volume_size: bootVolume.size,
            delete_on_termination: volumeTip.deleteVolume === 'yes'
          }],
          flavorRef: state.flavor.id,
          networks: networks,
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
          let userData = '#cloud-config\ndisable_root: False\npassword: {0}\nchpasswd:\n list: |\n   root:{0}\n expire: False\nssh_pwauth: True';
          userData = userData.replace(/\{0\}/g, state.pwd);
          data.user_data = window.btoa(userData);
        }
        data.adminPass = state.pwd;
      }

      data.security_groups = state.securityGroup.map(ele => ({name: ele.name}));

      request.createInstance(data).then((res) => {
        this.props.callback && this.props.callback(res.server);
        this.setState({
          visible: false
        });
      }).catch((error) => {
        let errorTip = getErrorMessage(error);

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
    let Types = (
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

    let selectedKey = state.imageType;
    let style = null;

    let imgURL = HALO.settings.default_image_url;
    if (imgURL) {
      style = {
        background: `url("${imgURL}") 0 0 no-repeat`,
        backgroundSize: '20px 20px'
      };
    }

    let Images = (
      <div id="images" className={'row row-tab row-tab-single row-tab-images' + (selectedKey === 'image' ? '' : ' hide')} key="images">
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
    let Snapshots = (
      <div id="snapshot" className={'row row-tab row-tab-single row-tab-images' + (selectedKey === 'snapshot' ? '' : ' hide')} key="snapshots">
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
    let BootableVolumes = (
      <div id="bootableVolume" className={'row row-tab row-tab-single row-tab-images' + (selectedKey === 'bootableVolume' ? '' : ' hide')} key="bootableVolumes">
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

    let VolumeSnapshots = (
      <div id="volumeSnapshot" className={'row row-tab row-tab-single row-tab-images' + (selectedKey === 'volumeSnapshot' ? '' : ' hide')} key="volumeSnapshot">
        {
          !state.ready ?
            <div className="alert-tip">
              {__.loading}
            </div>
          : null
        }
        {
          state.volumeSnapshots.map(ele =>
            <a onMouseOver={this.onMouseOverItem.bind(this, ele.name)} onMouseLeave={this.onMouseLeaveItem.bind(this)} key={ele.id} className={state.volumeSnapshot.id === ele.id ? 'selected' : ''}
              onClick={state.volumeSnapshot.id === ele.id ? null : this.onChangeVolumeSnapshot.bind(this, ele)}>
              <i className="glyphicon icon-volume" style={{'marginRight': '6px'}}></i>
                {ele.name ? ele.name : ('(' + ele.id.substr(0, 8) + ')')}
            </a>
          )
        }
        {
          state.ready && !state.volumeSnapshot ?
            <div className="alert-tip">
              {__.there_is_no + __.volume + __.snapshot}
            </div>
          : null
        }
      </div>
    );

    let ret = [];
    ret.push(Types);
    ret.push(<VolumeTip
      key="volume_tip"
      deviceSize={this.state.deviceSize}
      state={this.state} {...props}
      tooltipHolder={tooltipHolder}
      ref={(ref) => this.volumeTip = ref}
      onChangeNumber={this.onChangeNumber}/>);
    ret.push(Images);
    ret.push(Snapshots);
    ret.push(BootableVolumes);
    ret.push(VolumeSnapshots);

    return ret;
  }

  onChangeFlavor(ele, e) {
    let flavors = this.state.flavors;

    let cpuOpt = helper.findCpu(flavors);
    let cpus = cpuOpt.cpus;

    let ramOpt = helper.findRam(flavors, ele.vcpus);
    let rams = ramOpt.rams;

    let diskOpt = helper.findDisk(flavors, ele.vcpus, ele.ram);
    let disks = diskOpt.disks;

    let flavor = helper.findFlavor(flavors, ele.vcpus, ele.ram, ele.disk);

    this.setState({
      cpus: cpus,
      cpu: ele.vcpus,
      memories: rams,
      memory: ele.ram,
      volumes: disks,
      volume: ele.disk,
      flavor: flavor
    });
  }

  onClickFlavor(e) {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    const prevFlavor = document.getElementById(FLAVOR_ID);
    if (prevFlavor) {
      this.destroyFlavor();
    }

    let compare = function (prop) {
      return function (obj1, obj2) {
        let val1 = obj1[prop];
        let val2 = obj2[prop];
        if (val1 < val2) {
          return -1;
        } else if (val1 > val2) {
          return 1;
        } else {
          return 0;
        }
      };
    };

    let root = e.target.parentNode;

    let flavor = this.state.flavor,
      flavors = this.state.flavors.sort(compare('name'));

    const flavorList = (
      <div className="flavor-list">
      {
        flavors.map(ele =>
          <a className="flavor-data" key={ele.id} onClick={this.onChangeFlavor.bind(this, ele)}>
            <span>{ele.name + ' ( ' + ele.vcpus + ' vCPU / '
              + unitConverter(ele.ram, 'MB').num + ' '
              + unitConverter(ele.ram, 'MB').unit
              + ' / ' + ele.disk + ' GB )'}</span>
            <div className="flavor-selected"><i className={ele.id === flavor.id ? 'glyphicon icon-active-yes' : 'hide'} /></div>
          </a>
        )
      }
      </div>
    );

    let container = document.createElement('div');
    container.id = FLAVOR_ID;

    root.appendChild(container);
    ReactDOM.render(flavorList, container);

    document.addEventListener('click', this.destroyFlavor, false);
  }

  destroyFlavor() {
    const flavorList = document.getElementById(FLAVOR_ID);
    if (flavorList) {
      let root = flavorList.parentNode;
      ReactDOM.unmountComponentAtNode(flavorList);
      root.removeChild(flavorList);
    }

    document.removeEventListener('click', this.destroyFlavor, false);
  }

  renderFlavors(props, state) {
    let data = [{
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
        let res = unitConverter(Number(val), 'MB');
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

    let flavor = state.flavor;
    let flavorDetail;

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
      <div key="flavor">
        <div className="row row-dropdown">
          <div className="modal-label">
            {__.flavor}
          </div>
          <div className="modal-data">
            <div className="dropdown-overview" onClick={this.onClickFlavor.bind(this)}>
              {flavorDetail}
              <div className="triangle" />
            </div>
          </div>
        </div>
        {
          data.map((ele) =>
            <div className="row row-dropdown" key={ele.key}>
              <div className="modal-label">
                {ele.title}
              </div>
              <div className="modal-data">
                <div className={'dropdown-item ' + ele.key}>
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
            </div>
          )
        }
      </div>
    );
  }

  onClickNetwork(ele, key, e) {
    this.state[key].push(ele);
    this.setState({
      [key]: this.state[key]
    });
  }

  onDelete(index, key, e) {
    this.state[key].splice(index, 1);

    this.setState({
      [key]: this.state[key]
    });
  }

  onOpenNetwork(ele, e) {
    e.stopPropagation();

    let height = e.target.parentNode.nextSibling.style.height;
    e.target.parentNode.nextSibling.style.height = !height || height === '0px' ? '190px' : '0';
  }

  getNetworkData(ele, key) {
    switch(key) {
      case 'physical_network':
        return ele['provider:physical_network'];
      case 'network_type':
        return ele['provider:network_type'];
      case 'vlan_id':
        return ele['provider:segmentation_id'];
      case 'status':
        return getStatusIcon(ele.status);
      case 'shared':
        return ele.shared ? __.yes : __.no;
      case 'ip_address':
        return ele.fixed_ips.map((ritem, i) =>
          ritem.ip_address + (i === ele.fixed_ips.length - 1 ? '' : ' / ')
        );
      case 'floatingip':
        return ele.floatingip && ele.floatingip.floating_ip_address || '-';
      case 'subnet':
        let subnets = [];
        ele.subnets && ele.subnets.map((_subnet, _i) => {
          if(_subnet.id) {
            _i && subnets.push(', ');
            subnets.push(_subnet.name || '(' + _subnet.id.substr(0, 8) + ')');
          }
        });
        return subnets;
      default:
        return ele[key];
    }
  }

  renderNetworks(props, state) {
    let selected = state.network;
    let hasSelects = selected.length > 0 ? true : false;

    let hasNetwork = state.networks.length > 0 ? true : false;

    let networkSelected = (
      <div className="row row-select" key="networkSelected">
        <div className="modal-label">
          {__.network}
        </div>
        <div className="modal-data">
          <div className="row-network-select">
            {
              hasSelects ?
                selected.map((ele, index) =>
                  <a key={index} className="row-network-data" onClick={this.onDelete.bind(this, index, 'network')}>
                    <span>{ele.name || '(' + ele.id.slice(0, 8) + ')'}</span>
                    <i className="glyphicon icon-delete"/>
                  </a>
                )
              : __.no_selected_nt
            }
          </div>
        </div>
      </div>
    );

    let networks = (
      <div className="row row-select" key="networks">
        {
          hasNetwork ?
            <div className="row-network">
              {
                state.networks.map(ele =>
                  <div key={ele.id} onClick={selected.some(select => ele.id === select.id) ? null : this.onClickNetwork.bind(this, ele, 'network')}>
                    <div className={selected.some(select => ele.id === select.id) ? 'row-data selected' : 'row-data'}>
                      {ele.name ? ele.name : '(' + ele.id.substr(0, 8) + ')'}
                      <i className="glyphicon icon-arrow-down" onClick={this.onOpenNetwork.bind(this, ele)}/>
                    </div>
                    <div className="row-table">
                      <table>
                        <tbody>
                          {
                            constant.networkColume.map(col =>
                              <tr key={col.key}>
                                <td>{col.value}</td>
                                <td>{this.getNetworkData(ele, col.key)}</td>
                              </tr>
                            )
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              }
            </div>
          : <div className="empty-text-label" onClick={this.createNetwork}>
              {__.no_network + ' '}
              <a>{__.create + __.network}</a>
            </div>
        }
      </div>
    );

    let ret = [];
    ret.push(networkSelected);
    ret.push(networks);

    return ret;
  }

  renderPorts(props, state) {
    let selected = state.port;
    let hasSelects = selected.length > 0 ? true : false;

    let hasPorts = state.ports.length > 0 ? true : false;

    let portSelected = (
      <div className="row row-select" key="port_selected">
        <div className="modal-label">
          {__.port}
        </div>
        <div className="modal-data">
          <div className="row-network-select">
            {
              hasSelects ?
                selected.map((ele, index) =>
                  <a key={index} className="row-network-data" onClick={this.onDelete.bind(this, index, 'port')}>
                    <span>{ele.name || '(' + ele.id.slice(0, 8) + ')'}</span>
                    <i className="glyphicon icon-delete"/>
                  </a>
                )
              : __.no_selected_pt
            }
          </div>
        </div>
      </div>
    );

    let ports = (
      <div className="row row-select" key="ports">
        {
          hasPorts ?
            <div className="row-network">
              {
                state.ports.map(ele =>
                  <div key={ele.id} onClick={selected.some(select => ele.id === select.id) ? null : this.onClickNetwork.bind(this, ele, 'port')}>
                    <div className={selected.some(select => ele.id === select.id) ? 'row-data selected' : 'row-data'}>
                      {ele.name ? ele.name : '(' + ele.id.substr(0, 8) + ')'}
                      <i className="glyphicon icon-arrow-down" onClick={this.onOpenNetwork.bind(this, ele)}/>
                    </div>
                    <div className="row-table">
                      <table>
                        <tbody>
                          {
                            constant.portColume.map(col =>
                              <tr key={col.key}>
                                <td>{col.value}</td>
                                <td>{this.getNetworkData(ele, col.key)}</td>
                              </tr>
                            )
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              }
            </div>
          : <div className="empty-text-label" onClick={this.createPort}>
              {__.no_avail_port + ' '}
              <a>{__.create + __.port}</a>
            </div>
        }
      </div>
    );

    let ret = [];
    ret.push(portSelected);
    ret.push(ports);

    return ret;
  }

  renderSecurityGroup(props, state) {
    let selects = state.securityGroup;
    let hasSelects = selects.length > 0 ? true : false;

    return (
      <div className="row row-dropdown row-security-group" key="security_group">
        <div className="modal-label">
          {__.security_group}
        </div>
        <div className="modal-data">
          <div className={'dropdown-overview' + (hasSelects ? '' : ' no-data')} onClick={this.unfoldSecurity}>
            {hasSelects ?
              selects.map(ele => <div key={ele.id} className="overflow-data" onClick={this.onDelete.bind(this, ele, 'securityGroup')}>
                <span>{ele.name}</span>
                <i className="glyphicon icon-delete"/>
              </div>)
            : __.no_selected_sg}
          </div>
          <div ref="drop_security" className={'dropdown-box' + (state.sgUnfold ? '' : ' hide')}>
            <div className="dropdown-item">
              <div className="dropdown-item-data">
                <ul>
                  {
                    state.securityGroups.map((ele) => {
                      return (
                        <li key={ele.id}
                          className={selects.some(select => ele.id === select.id) ? 'selected' : null}
                          onClick={selects.some(select => ele.id === select.id) ? null : this.onClickNetwork.bind(this, ele, 'securityGroup')}>
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
    let selected = state.credential;
    let isKeypair = selected === 'keypair';

    let credentials = state.credentials;
    let hideKeypair = state.hideKeypair;

    if (hideKeypair) {
      credentials = [credentials[1]];
    }

    let Types = (
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

    let keypair = state.keypairName;
    let Keypairs = (
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
            : <div className="empty-label" onClick={this.createKeypair}>
                {__.no_keypair + ' '}
                <a>{__.create + __.keypair}</a>
              </div>
          }
        </div>
      </div>
    );

    let Psw = (
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

    let CrdTips = (
      <div className="credential-tips" key="tips">
        <Tip content={__.instance_credential_tip} type="warning" showIcon={true} width={556} />
      </div>
    );

    let ret = [];
    ret.push(Types);
    ret.push(Keypairs);
    ret.push(Psw);
    ret.push(CrdTips);

    return ret;
  }

  renderCreateNum(props, state) {
    return (
      <div className="row row-select">
        <div className="modal-label">
          {__.number}
        </div>
        <div className="modal-data">
          <InputNumber onChange={this.onChangeNumber} disabled={state.disabledNumber} min={1} value={state.number} width={120}/>
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
      let hasImage = false;
      if (state.imageType === 'image') {
        hasImage = state.image;
      } else if (state.imageType === 'snapshot') {
        hasImage = state.snapshot;
      } else {
        hasImage = state.bootableVolume;
      }

      let enable = state.ready && hasImage;

      return (
        <div className="right-side">
          <Button value={__.next} disabled={!enable} type="create" onClick={this.onPaging.bind(this, 2, '12')} />
        </div>
      );
    } else if (page === 2) {
      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, page - 1, '21')} />
          </div>
          <div className="right-side">
            <Button value={__.next} disabled={false} type="create" onClick={this.onPaging.bind(this, page + 1, '23')} />
          </div>
        </div>
      );
    } else if (page === 3) {
      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, page - 1, '32')} />
          </div>
          <div className="right-side">
            <Button value={__.next} disabled={false} type="create" onClick={this.onPaging.bind(this, page + 1, '34')} />
          </div>
        </div>
      );
    } else if (page === 4) {
      let enable = state.flavor && (state.network.length >= 1 || state.port.length >= 1) && state.number;
      if (state.credential === 'keypair') {
        enable = enable && state.keypairName;
      } else {
        enable = enable && !state.pwdError && !state.confirmPwdError;
      }

      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, page - 1, '43')} />
          </div>
          <div className="right-side">
            <Button value={__.create} disabled={!state.name || state.disabled || !enable} type="create" onClick={this.onConfirm} />
          </div>
          <div className="middle-side">
            <Button value={__.more + __.setting} type="cancel" onClick={this.onPaging.bind(this, page + 1, '45')} />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, page - 1, '54')} />
          </div>
        </div>
      );
    }
  }

  render() {
    let props = this.props;
    let state = this.state;

    let page = state.page;
    let slideClass = '';

    let fromto = state.fromTo;
    if(fromto === '12') {
      slideClass = ' first-move-to-second';
    } else if(fromto === '21') {
      slideClass = ' second-move-to-first';
    } else if(fromto === '23') {
      slideClass = ' second-move-to-third';
    } else if(fromto === '32') {
      slideClass = ' third-move-to-second';
    } else if(fromto === '34') {
      slideClass = ' third-move-to-four';
    } else if(fromto === '43') {
      slideClass = ' four-move-to-third';
    } else if(fromto === '45') {
      slideClass = ' four-move-to-five';
    } else if(fromto === '54') {
      slideClass = ' five-move-to-four';
    }

    return (
      <div className="halo-modal-create-instance-new">
        <Modal ref="modal" {...props} title={TITLE} key="modal" visible={state.visible} width={state.isShowDetail ? 1046 : 726}>
          <div className="modal-bd halo-com-modal-create-instance">
            <TabStep step={state.step}/>
            <div className={'page' + slideClass}>
              {this.renderImages(props, state)}
            </div>
            <div>
              <DetailModal {...state} ref={(ref) => this.detailRef = ref} onAction={this.onAction.bind(this)}/>
            </div>
            <div className={'page' + slideClass}>
              {this.renderFlavors(props, state)}
            </div>
            <div className={'page' + slideClass}>
              {this.renderNetworks(props, state)}
            </div>
            <div className={'page error' + slideClass}>
              {this.renderName(props, state)}
              {this.renderSecurityGroup(props, state)}
              {this.renderCredentials(props, state)}
              {this.renderCreateNum(props, state)}
              {this.renderErrorTip(props, state)}
            </div>
            <div className={'page' + slideClass}>
              {this.renderPorts(props, state)}
            </div>
          </div>
          <div className="modal-ft halo-com-modal-create-instance">
            {this.renderBtn(props, state, page)}
          </div>
          <div className={this.state.isShowDetail ? 'detail-label hide' : 'detail-label'} onClick={this.onChangeDetail.bind(this)}>
            <i className="glyphicon icon-arrow-right"/>
          </div>
        </Modal>
      </div>
    );
  }
}

module.exports = ModalBase;
