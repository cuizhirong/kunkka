const React = require('react');
const ReactDOM = require('react-dom');
const {Modal, Button, Tip, InputNumber, Tooltip} = require('client/uskin/index');
const __ = require('locale/client/approval.lang.json');
const createNetworkPop = require('client/applications/approval/modules/network/pop/create_network/index');
const request = require('../../request');
const unitConverter = require('client/utils/unit_converter');
const getErrorMessage = require('../../../../utils/error_message');
const utils = require('../../../../utils/utils');

const TITLE = __.apply_ + __.instance;
const halo = HALO.settings;
const showCredentials = halo.enable_apply_instance_credential;
const nameRequired = halo.enable_apply_instance_name;

let tooltipHolder;

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    let imageTypes = [{
      value: __.system_image,
      key: 'image'
    }, {
      value: __.instance_snapshot,
      key: 'snapshot'
    }];

    let credentials = [{
      key: 'psw',
      value: __.password
    }];

    this.state = {
      visible: true,
      ready: false,
      disabled: false,
      page: 1,
      pagingAni: false,
      fromTo: '01',
      name: '',
      imageTypes: imageTypes,
      imageType: imageTypes[0].key,
      images: [],
      image: null,
      snapshots: [],
      snapshot: null,
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
      usage: '',
      usageError: false,
      applyDescription: '',
      descriptionError: false,
      securityGroups: [],
      securityGroup: {},
      sgUnfold: false,
      credentials: credentials,
      credential: credentials[0].key,
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
      error: '',
      showError: false
    };

    ['initialize', 'onPaging', 'onChangeName',
    'unfoldFlavorOptions', 'foldFlavorOptions', 'onChangeNetwork',
    'unfoldSecurity', 'foldSecurity', 'onChangeSecurityGroup',
   'onChangeNumber', 'pwdVisibleControl',
    'onChangePwd', 'onFocusPwd', 'onBlurPwd',
    'confirmPwdVisibleControl', 'onChangeConfirmPwd',
    'createNetwork', 'onConfirm',
    'onChangeUsage', 'onChangeApplyDescription'].forEach((func) => {
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
  }

  initialize(res) {
    let selectDefault = (arr) => {
      return arr.length > 0 ? arr[0] : null;
    };

    let images = [];
    let snapshots = [];

    //sort image and snapshot
    res.image.forEach((ele) => {
      let type = ele.image_type;
      let ownerMatch = ele.visibility === 'private' ? ele.owner === HALO.user.projectId : true;
      if (ownerMatch) {
        if (type === 'snapshot') {
          snapshots.push(ele);
        } else {
          images.push(ele);
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
    let currentImage = image;
    let imageType = 'image';
    let obj = this.props.obj;
    if (typeof obj !== 'undefined') {
      currentImage = obj;
      let ownerMatch = obj.visibility === 'private' ? obj.owner === HALO.user.projectId : true;
      if (ownerMatch) {
        if (obj.image_type === 'snapshot') {
          snapshot = obj;
          imageType = 'snapshot';
        } else {
          image = obj;
        }
      }
    }
    this.setFlavor(currentImage, 'all');
    // let hideKeypair = currentImage ? currentImage.image_label.toLowerCase() === 'windows' : false;
    let credential = 'psw';

    let networks = res.network.filter((ele) => {
      return !ele['router:external'] && ele.subnets.length > 0 ? true : false;
    });

    let sg = res.securitygroup;

    this.setState({
      ready: true,
      imageType: imageType,
      images: images,
      image: image,
      snapshots: snapshots,
      snapshot: snapshot,
      flavors: flavors,
      networks: networks,
      network: selectDefault(networks),
      securityGroups: sg,
      securityGroup: {},
      username: username,
      credential: credential
    });

  }

  findCpu(flavors, cpu) {
    let cpuKeys = {};
    flavors.forEach((ele) => {
      cpuKeys[ele.vcpus] = true;
    });
    let cpus = (Object.keys(cpuKeys)).map((ele) => Number(ele)).sort(this.sortByNumber);
    if (typeof cpu === 'undefined') {
      cpu = cpus[0];
    }
    return {
      cpus: cpus,
      cpu: cpu
    };
  }

  findRam(flavors, cpu, ram) {
    let rawRams = flavors.filter((ele) => ele.vcpus === cpu);
    let ramKeys = {};
    rawRams.forEach((ele) => {
      ramKeys[ele.ram] = true;
    });
    let rams = (Object.keys(ramKeys)).map((ele) => Number(ele)).sort(this.sortByNumber);
    if (typeof ram === 'undefined') {
      ram = rams[0];
    }

    return {
      rams: rams,
      ram: ram
    };
  }

  findDisk(flavors, cpu, ram, disk) {
    let rawDisks = flavors.filter((ele) => ele.vcpus === cpu && ele.ram === ram);
    let diskKeys = {};
    rawDisks.forEach((ele) => {
      diskKeys[ele.disk] = true;
    });
    let disks = (Object.keys(diskKeys)).map((ele) => Number(ele)).sort(this.sortByNumber);
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

  onPaging(page, fromto, e) {
    this.setState({
      page: page,
      pagingAni: true,
      fromTo: fromto
    });
  }

  onChangeName(e) {
    let name = e.target.value;

    this.setState({
      name: name
    });
  }

  onChangeImageType(key, e) {
    let state = this.state;
    let image = state.images.length > 0 ? state.images[0] : null;
    let snapshot = state.snapshots.length > 0 ? state.snapshots[0] : null;

    let username = 'root';
    let obj = (key === 'snapshot') ? snapshot : image;
    if (obj && obj.image_meta) {
      let meta = JSON.parse(image.image_meta);
      username = meta.os_username;
    }

    let objImage;
    if (key === 'image') {
      objImage = image;
    } else if (key === 'snapshot') {
      objImage = snapshot;
    }

    this.setFlavor(objImage, 'all');

    this.setState({
      imageType: key,
      image: image,
      snapshot: snapshot,
      username: username,
      credential: 'psw',
      pwdError: true,
      pwd: '',
      pwdVisible: false
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
        let cpuOpt = this.findCpu(flavors);
        cpus = cpuOpt.cpus;
        cpu = cpuOpt.cpu;
      }
      if (inArray(type, ['all', 'cpu'])) {
        let ramOpt = this.findRam(flavors, cpu);
        rams = ramOpt.rams;
        ram = ramOpt.ram;
      }
      if (inArray(type, ['all', 'cpu', 'ram'])) {
        let diskOpt = this.findDisk(flavors, cpu, ram);
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
    let username = 'root';
    if (item.image_meta) {
      let meta = JSON.parse(item.image_meta);
      username = meta.os_username;
    }

    this.setFlavor(item, 'all');
    this.setState({
      image: item,
      username: username,
      credential: 'psw',
      pwdError: true,
      pwd: '',
      pwdVisible: false
    });
  }

  onChangeSnapshot(item, e) {
    let username = 'root';
    if (item.image_meta) {
      let meta = JSON.parse(item.image_meta);
      username = meta.os_username;
    }

    this.setFlavor(item, 'all');
    this.setState({
      snapshot: item,
      username: username,
      credential: 'psw',
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
    let subnets = this.state.networks;
    let selected = e.target.value;

    let item;
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
    if (state.imageType === 'image') {
      return state.image;
    } else if (state.imageType === 'snapshot') {
      return state.snapshot;
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

  onChangeSecurityGroup(sg, e) {
    let state = this.state;
    let selects = state.securityGroup;

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
    let state = this.state,
      data = {};

    data.detail = {};
    let createDetail = data.detail;

    createDetail.create = [];
    createDetail.bind = [];
    let configCreate = createDetail.create,
      configBind = createDetail.bind;

    if (state.disabled) {
      return;
    }

    let enable = (nameRequired ? state.name : true) && state.flavor && state.network && state.number && state.usage && state.applyDescription;
    if(showCredentials) {
      enable = enable && !state.pwdError;
    }

    if (enable) {
      let createItem = {
        _type: 'Instance',
        _identity: 'ins',
        name: state.name.trim(),
        image: (state.imageType === 'image') ? state.image.id : state.snapshot.id,
        flavor: state.flavor.id,
        _number: state.number,
        metadata: {
          owner: HALO.user.username,
          usage: state.usage
        }
      };
      if(showCredentials) {
        if(state.image.image_label === 'Windows') {
          createItem.metadata = {
            admin_pass: state.pwd
          };
        } else {
          //add user_data to store root pwd
          let userData = '#cloud-config\ndisable_root: False\npassword: {0}\nchpasswd:\n list: |\n   root:{0}\n expire: False\nssh_pwauth: True';
          userData = userData.replace(/\{0\}/g, state.pwd);
          createItem.user_data = userData;
          createItem.user_data_format = 'RAW';
        }
        createItem.admin_pass = state.pwd;
      }
      configCreate.push(createItem);

      let bindNetwork = {
        Instance: createItem._identity,
        Network: state.network.id
      };
      configBind.push(bindNetwork);

      Object.keys(state.securityGroup).forEach(s => {
        let bindSGrp = {
          Instance: createItem._identity,
          Security_group: s
        };
        configBind.push(bindSGrp);
      });

      data.description = state.applyDescription;


      request.createApplication(data).then((res) => {
        this.props.callback && this.props.callback();
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
    return nameRequired ? (
      <div className="row row-input">
        <div className="modal-label">
          <strong>* </strong>{__.name}
        </div>
        <div className="modal-data">
          <input type="text" onChange={this.onChangeName} value={state.name} />
        </div>
      </div>
    ) : null;
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

    let imageSelected = state.imageType === 'image';
    let Images = (
      <div className={'row row-tab row-tab-single row-tab-images' + (imageSelected ? '' : ' hide')} key="images">
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
              <i className={'icon-image-default ' + (ele.image_label && ele.image_label.toLowerCase())}></i>
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
      <div className={'row row-tab row-tab-single row-tab-images' + (imageSelected ? ' hide' : '')} key="snapshots">
        {
          !state.ready ?
            <div className="alert-tip">
              {__.loading}
            </div>
          : null
        }
        {
          state.snapshots.map((ele) =>
            <a onMouseOver={this.onMouseOverItem.bind(this, ele.name)} onMouseLeave={this.onMouseLeaveItem.bind(this)} className={state.snapshot.id === ele.id ? 'selected' : ''}
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

    let ret = [];
    ret.push(Types);
    ret.push(Images);
    ret.push(Snapshots);

    return ret;
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
    let selected = state.network;
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
    let selects = state.securityGroup;
    let hasSelects = Object.keys(selects).length > 0 ? true : false;
    let selectObj = state.securityGroups.filter((ele) => selects[ele.id]);
    let detail = selectObj.map((ele) => ele.name).join(', ');

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
                      let selected = selects[ele.id];
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
    let selected = state.credential;

    let credentials = state.credentials;

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

    let Psw = (
      <div className={'row row-select credential-sub'} key="psw">
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
        <i className="glyphicon icon-status-warning" />
        {__.instance_credential_tip}
      </div>
    );

    let ret = [];
    ret.push(Types);
    ret.push(Psw);
    ret.push(CrdTips);

    return showCredentials ? ret : null;
  }

  renderCreateNum(props, state) {
    let price = state.price;
    let numPrice = price;
    let monthlyPrice = price;

    let enableCharge = HALO.settings.enable_charge;
    if (enableCharge && state.flavor) {
      let type = state.flavor.name;
      if (HALO.prices) {
        price = HALO.prices.compute[type] ? HALO.prices.compute[type] : 0;
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
          <InputNumber onChange={this.onChangeNumber} min={1} value={state.number} width={120}/>
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
      let hasImage = false;
      if (state.imageType === 'image') {
        hasImage = state.image;
      } else {
        hasImage = state.snapshot;
      }

      let enable = (nameRequired ? state.name.trim() : true) && state.ready && hasImage;

      return (
        <div className="right-side">
          <Button value={__.next} disabled={!enable} type="create" onClick={this.onPaging.bind(this, 2, '12')} />
        </div>
      );
    } else if(page === 2) {
      let enable = state.flavor && state.network && state.number;
      if(showCredentials) {
        enable = enable && !state.pwdError && !state.confirmPwdError;
      }

      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, 1, '21')} />
          </div>
          <div className="right-side">
            <Button value={__.next} disabled={state.disabled || !enable} type="create" onClick={this.onPaging.bind(this, 3, '23')} />
          </div>
        </div>
      );
    } else {
      let enable = state.usage && !state.usageError && state.applyDescription && !state.descriptionError;
      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, 2, '32')} />
          </div>
          <div className="right-side">
            <Button value={__.create} disabled={!enable} type="create" onClick={this.onConfirm} />
          </div>
        </div>
      );
    }
  }

  renderUsage(props, state) {
    return (
      <div className="row row-input">
        <div className="modal-label">
          <strong>* </strong>{__.usage}
        </div>
        <div className="modal-data">
          <input type="text" className={state.usageError ? 'error' : ''} onChange={this.onChangeUsage} value={state.usage} />
          <div className="row-shorttip">{__.usage_tip}</div>
        </div>
      </div>
    );
  }

  onChangeUsage(e) {
    let usage = e.target.value,
      length = utils.getStringUTF8Length(usage);

    this.setState({
      usage: usage
    }, () => {
      this.setState({
        usageError: (length > 255 || length === 0) ? true : false
      });
    });
  }

  renderDescription(props, state) {
    return (
      <div className="row row-input">
        <div className="modal-label">
          <strong>* </strong>{__.apply_description}
        </div>
        <div className="modal-data">
          <textarea className={state.descriptionError ? 'error' : ''} onChange={this.onChangeApplyDescription} value={state.applyDescription} />
        </div>
      </div>
    );
  }

  onChangeApplyDescription(e) {
    let applyDescription = e.target.value;

    this.setState({
      applyDescription: applyDescription
    }, () => {
      this.setState({
        descriptionError: applyDescription ? false : true
      });
    });
  }

  render() {
    let props = this.props;
    let state = this.state;

    let page = state.page;
    let slideClass = '';

    if(state.pagingAni) {
      let fromto = state.fromTo;
      if(fromto === '12') {
        slideClass = ' first-move-to-second';
      } else if(fromto === '21') {
        slideClass = ' second-move-to-first';
      } else if(fromto === '23') {
        slideClass = ' second-move-to-third';
      } else if(fromto === '32') {
        slideClass = ' third-move-to-second';
      }
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
          </div>
          <div className={'page' + slideClass}>
            {this.renderUsage(props, state)}
            {this.renderDescription(props, state)}
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
