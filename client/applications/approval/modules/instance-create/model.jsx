require('./style/index.less');

const React = require('react');
const ReactDOM = require('react-dom');
const uskin = require('client/uskin/index');
const {Tab, Button, Tooltip, Slider} = uskin;

const createNetworkPop = require('client/applications/approval/modules/network/pop/create_network/index');
const createApplication = require('./pop/create_application/index');

const __ = require('locale/client/approval.lang.json');
const request = require('./request');
const unitConverter = require('client/utils/unit_converter');
const getOsCommonName = require('client/utils/get_os_common_name');

const halo = HALO.settings;
const showCredentials = halo.enable_apply_instance_credential;
const nameRequired = halo.enable_apply_instance_name;
const volumeTypesSetting = halo.appliable_volume_types ? JSON.parse(halo.appliable_volume_types) : null;

let tooltipHolder;

class Model extends React.Component {
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
      name: '',
      ready: false,
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
      fipChecked: true,
      fipSliderValue: 1,
      fipSliderInputValue: 1,
      fipSliderInputError: false,
      fipDisabled: true,
      bandwidthMin: 1,
      bandwidthMax: 30,
      volumeChecked: false,
      volumeName: '',
      volumeTypes: [],
      volumeType: '',
      typeCapacity: [],
      min: 1,
      max: 1,
      sliderDisabled: false,
      sliderValue: 1,
      unit: 'GB',
      sliderInputError: false,
      sliderInputValue: 1,
      btnDisabled: false
    };

    ['initialize', 'initializeVolume', 'onChangeName',
    'unfoldFlavorOptions', 'foldFlavorOptions', 'onChangeNetwork',
    'unfoldSecurity', 'foldSecurity', 'onChangeSecurityGroup',
    'pwdVisibleControl', 'onChangePwd',
    'onFocusPwd', 'onBlurPwd',
    'confirmPwdVisibleControl', 'onChangeConfirmPwd',
    'createNetwork', 'onSliderChange',
    'onChangeVolumeName', 'onVolumeCapacityChange'].forEach(func => {
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
    request.getOverview().then(this.initializeVolume);
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
      let visibility = ele.visibility;
      let ownerMatch = visibility === 'private' ? ele.owner === HALO.user.projectId : true;

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
    let username = this.getImageAdminUserName(selectedImage);

    let flavors = res.flavor;
    this._flavors = flavors;

    let image = selectDefault(images);
    let snapshot = selectDefault(snapshots);
    let currentImage = image;
    let imageType = 'image';

    this.setFlavor(currentImage, 'all');
    // let hideKeypair = currentImage ? currentImage.image_label.toLowerCase() === 'windows' : false;
    let credential = 'psw';

    let networks = res.network.filter((ele) => {
      return !ele['router:external'] && ele.subnets.length > 0 ? true : false;
    });

    //check whether subnets in the network associated router and able to associate floaitng-ip
    let network = selectDefault(networks);
    let hasRouter = network ? network.subnets.some(sub => (sub.router && sub.router.external_gateway_info)) : false;

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
      network: network,
      securityGroups: sg,
      securityGroup: {},
      username: username,
      credential: credential,
      fipDisabled: !hasRouter
    });
  }

  // 根据当前所选镜像，提取出默认的admin 用户名
  getImageAdminUserName(image) {
    let username = 'root';
    if (image) {
      if (image.os_admin_user) {
        username = image.os_admin_user;
      } else if (image.image_meta) {
        try {
          username = JSON.parse(image.image_meta).os_username || 'root';
        } catch (e) {
          username = 'root';
        }
      }
    }

    return username;
  }

  renderName(props, state) {
    return nameRequired ? (
      <div className="row row-input">
        <div className="row-label">
          <strong>* </strong>{__.name}
        </div>
        <div className="row-data">
          <input type="text" onChange={this.onChangeName} value={state.name} />
        </div>
      </div>
    ) : null;
  }

  onChangeName(e) {
    let name = e.target.value;

    this.setState({
      name: name
    });
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
        <div className="row-label">
          {__.image}
        </div>
        <div className="row-data">
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
          state.images.map((ele) => {
            return (
              <a onMouseOver={this.onMouseOverItem.bind(this, ele.name)} onMouseLeave={this.onMouseLeaveItem.bind(this)} key={ele.id} className={state.image.id === ele.id ? 'selected' : ''}
              onClick={state.image.id === ele.id ? null : this.onChangeImage.bind(this, ele)}>
              <i className={'icon-image-default ' + getOsCommonName(ele)}></i>
                {ele.name}
            </a>
            );
          })
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
          state.snapshots.map((ele) => {
            return (
              <a onMouseOver={this.onMouseOverItem.bind(this, ele.name)} onMouseLeave={this.onMouseLeaveItem.bind(this)} key={ele.id} className={state.snapshot.id === ele.id ? 'selected' : ''}
              onClick={state.snapshot.id === ele.id ? null : this.onChangeSnapshot.bind(this, ele)}>
              <i className={'icon-image-default ' + getOsCommonName(ele)}></i>
                {ele.name}
            </a>
            );
          })
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

  onChangeImageType(key, e) {
    let state = this.state;
    let image = state.images.length > 0 ? state.images[0] : null;
    let snapshot = state.snapshots.length > 0 ? state.snapshots[0] : null;

    let objImage;
    if (key === 'image') {
      objImage = image;
    } else if (key === 'snapshot') {
      objImage = snapshot;
    }

    let username = this.getImageAdminUserName(objImage);
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

  onChangeImage(item, e) {
    let username = this.getImageAdminUserName(item);
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
    let username = this.getImageAdminUserName(item);

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
        <div className="row-label">
          {__.flavor}
        </div>
        <div className="row-data">
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

  renderNetworks(props, state) {
    let selected = state.network;
    return (
      <div className="row row-select">
        <div className="row-label">
          <strong>* </strong>{__.network}
        </div>
        <div className="row-data">
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

  onChangeNetwork(e) {
    let nets = this.state.networks;
    let selected = e.target.value;

    let item;
    nets.some((ele) => {
      if (ele.id === selected) {
        item = ele;
        return true;
      }
      return false;
    });

    //check whether subnet in the network has router and able to associate floating-ip
    let hasRouter = item.subnets.some(sub => (sub.router && sub.router.external_gateway_info));

    this.setState({
      network: item,
      fipDisabled: !hasRouter
    });
  }

  createNetwork() {
    createNetworkPop(this.refs.modal, (network) => {
      this.setState({
        networks: [network],
        network: network
      });
    });
  }

  renderSecurityGroup(props, state) {
    let selects = state.securityGroup;
    let hasSelects = Object.keys(selects).length > 0 ? true : false;
    let selectObj = state.securityGroups.filter((ele) => selects[ele.id]);
    let detail = selectObj.map((ele) => ele.name).join(', ');

    return (
      <div className="row row-dropdown row-security-group">
        <div className="row-label">
          {__.security_group}
        </div>
        <div className="row-data">
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

  renderCredentials(props, state) {
    let selected = state.credential;

    let credentials = state.credentials;

    let Types = (
      <div className="row row-tab row-tab-credential" key="types">
        <div className="row-label">
          <strong>* </strong>{__.credentials}
        </div>
        <div className="row-data">
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
        <div className="row-data">
          <div className="input-user">
            <label>{__.user_name}</label>
            <input type="text" value={state.username} disabled={true} onChange={function(){}} />
          </div>
          <div className="input-psw">
            <label>{__.password}</label>
            <div className="psw-tip-box">
              {
                state.showPwdTip ?
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
                placeholder={__.pwd_placeholder}
                width={100} />
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

  onChangeCredential(key, e) {
    this.setState({
      credential: key,
      pwdError: true,
      pwd: '',
      pwdVisible: false
    });
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

  onChangeCheckbox(key) {
    let state = this.state;
    switch(key) {
      case 'volume':
        this.setState({
          volumeChecked: !state.volumeChecked
        });
        break;
      case 'fip':
        this.setState({
          fipChecked: !state.fipChecked
        });
        break;
      default:
        break;
    }
  }

  initializeVolume(overview) {
    let state = this.state;

    //get all volume types
    let types = [];
    if(volumeTypesSetting) {
      overview.volume_types.forEach(t => {
        volumeTypesSetting.forEach(type => {
          if(type === t) {types.push(t);}
        });
      });
    } else {
      types = overview.volume_types;
    }

    this.setState({
      volumeTypes: types
    });

    //if has avaliable types select type and set price
    if(types.length > 0) {
      this.setState({
        volumeType: types[0]
      });

      //capacity of all types
      let allCapacity = overview.overview_usage.gigabytes;

      //capacity set by front-end
      let defaultTotal = 1000;
      let singleMax = 1000;

      types.forEach(t => {
        //capacity of current type
        state.typeCapacity[t] = overview.overview_usage['gigabytes_' + t];
        let capacity = overview.overview_usage['gigabytes_' + t];

        let min = 1, max, total, used;

        if(capacity.total < 0) {
          if(allCapacity.total < 0) {
            total = defaultTotal;
          } else {
            total = allCapacity.total;
          }
          used = allCapacity.used;
        } else {
          total = capacity.total;
          used = allCapacity.used;
        }

        max = total - used;
        if(max > singleMax) {
          max = singleMax;
        }
        if(max <= 0) {
          max = 0;
          min = 0;
        }

        state.typeCapacity[t].max = max;
        state.typeCapacity[t].min = min;
      });

      let selected = state.typeCapacity[overview.volume_types[0]],
        selectedMax = selected.max,
        selectedMin = selected.min,
        lackOfSize = selectedMin > selectedMax;

      this.setState({
        min: selectedMin,
        max: selectedMax,
        sliderValue: selectedMin,
        sliderInputValue: selectedMin,
        sliderDisabled: lackOfSize || selectedMax <= 0
      });
    }
  }

  renderVolume(props, state) {
    return (
      <div className="create-volume-config">
        {nameRequired ? <div className="row row-input">
          <div className="row-label">
            <strong>*</strong>{__.volume + __.name}
          </div>
          <div className="row-data">
            <input type="text" onChange={this.onChangeVolumeName} value={state.volumeName} />
          </div>
        </div> : null}
        <div className="row row-tab">
          <div className="row-label">{__.type}</div>
          <div className="row-data">
            {
              state.volumeTypes.map((value, index) => {
                return (
                  <a key={value}
                    title={value}
                    className={value === state.volumeType ? 'selected' : ''}
                    onClick={this.onClickVolumeType.bind(this, value)}>
                    {__[value] || value}
                  </a>
                );
              })
            }
          </div>
        </div>
        <div className="row row-slider">
          <div className="row-label">{__.size}</div>
          <div className="row-data">
            <div className="slidearea">
              <Slider min={state.min} max={state.max} disabled={state.sliderDisabled} value={state.sliderValue} onChange={this.onSliderChange} />
              <div className="range">{state.min + '-' + state.max + state.unit}</div>
            </div>
            <div className="inputarea">
              <input type="text" className={state.sliderInputError ? 'error' : ''} value={state.sliderInputValue}
                onChange={this.onVolumeCapacityChange}
                disabled={state.sliderDisabled} />
              <label className="unit">{state.unit}</label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  onChangeVolumeName(e) {
    let name = e.target.value;

    this.setState({
      volumeName: name
    });
  }

  onClickVolumeType(value) {
    this.setState({
      volumeType: value
    });
  }

  onSliderChange(e, value) {
    this.setState({
      sliderValue: value,
      sliderInputValue: value,
      sliderInputError: false
    });
  }

  onVolumeCapacityChange(e) {
    let state = this.state,
      min = state.min,
      max = state.max;

    let val = e.target.value;
    let floatVal = parseFloat(val);

    if (floatVal >= min && floatVal <= max) {
      this.setState({
        sliderValue: floatVal,
        sliderInputValue: floatVal,
        sliderInputError: false
      });
    } else {
      this.setState({
        sliderInputValue: val,
        sliderInputError: true
      });
    }
  }

  onApply() {
    let data = {};
    let state = this.state;

    //data is the final config json file for heat creating
    data.detail = {};
    let createDetail = data.detail;

    //data consists of array create and array bind
    createDetail.create = [];
    createDetail.bind = [];
    let configCreate = createDetail.create,
      configBind = createDetail.bind;

    //convey basic data to create one or several instance
    let createItem = {
      _type: 'Instance',
      _identity: 'ins',
      name: state.name,
      image: (state.imageType === 'image') ? state.image.id : state.snapshot.id,
      flavor: state.flavor.id,
      metadata: {
        owner: HALO.user.username
      }
    };

    if(showCredentials) {
      if(getOsCommonName(state.image) === 'windows') {
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

    if(state.volumeChecked) {
      let createVolume = {
        _type: 'Volume',
        _identity: 'vol',
        volume_type: state.volumeType,
        size: state.sliderValue,
        metadata: {
          owner: HALO.user.username
        }
      };
      if(nameRequired) {
        createVolume.name = state.volumeName;
      }
      configCreate.push(createVolume);

      let bindVolume = {
        Instance: createItem._identity,
        Volume: createVolume._identity
      };
      configBind.push(bindVolume);
    }

    if(state.fipChecked && !state.fipDisabled) {
      let createFip = {
        _type: 'Floatingip',
        _identity: 'fip'
      };

      let subnet;
      state.network.subnets.some(sub => {
        if(sub.router && sub.router.external_gateway_info) {
          subnet = sub;
          return true;
        }
        return false;
      });
      createFip.floating_network = subnet.router.external_gateway_info.network_id;
      configCreate.push(createFip);

      let bindFip = {
        Instance: createItem._identity,
        Floatingip: createFip._identity
      };
      configBind.push(bindFip);
    }

    createApplication(data, null, (res) => {
      window.location.pathname = '/approval/apply/' + res.id;
    });
  }

  onRefresh() {
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

    this.setState({
      name: '',
      ready: false,
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
      fipChecked: true,
      fipSliderValue: 1,
      fipSliderInputValue: 1,
      fipSliderInputError: false,
      fipDisabled: true,
      bandwidthMin: 1,
      bandwidthMax: 30,
      volumeChecked: false,
      volumeName: '',
      volumeTypes: [],
      volumeType: '',
      typeCapacity: [],
      min: 1,
      max: 1,
      sliderDisabled: false,
      sliderValue: 1,
      unit: 'GB',
      sliderInputError: false,
      sliderInputValue: 1,
      btnDisabled: false
    });

    request.getData().then(this.initialize);
    request.getOverview().then(this.initializeVolume);
  }

  render() {
    let props = this.props;
    let state = this.state;

    let tab = [{name: __['instance-create'], key: 'instance-create'}];

    let hasServerName = nameRequired ? !!state.name : true;
    let hasAdminPass = (state.credential === 'psw' && state.pwd && !state.pwdError && !state.confirmPwdError);
    let credentialPass = showCredentials ? hasAdminPass : true;
    let hasVolumeName = state.volumeChecked ? (!nameRequired || state.volumeName) : true;
    let hasImage = (state.imageType === 'image' && state.image) || (state.imageType === 'snapshot' && state.snapshot);
    let hasFip = !state.fipChecked ? state.network : true;
    let hasNetwork = !state.network ? !!state.network : true;
    let enable = hasServerName && hasNetwork && hasAdminPass && credentialPass && hasVolumeName && hasImage && hasFip;

    return (
      <div className="halo-module-instance-create" style={this.props.style}>
        <div className="halo-instance-create">
          <div className="submenu-tabs">
            <Tab items={tab} />
          </div>
          <div className="operation-list">
            <Button value={__.create + __.application} type="create" disabled={state.btnDisabled || !enable} onClick={this.onApply.bind(this)} />
            <Button initial={true} iconClass="glyphicon icon-refresh" onClick={this.onRefresh.bind(this)} />
          </div>
          <div className="create-config-page">
            {this.renderName(props, state)}
            {this.renderImages(props, state)}
            {this.renderFlavors(props, state)}
            {this.renderNetworks(props, state)}
            {this.renderSecurityGroup(props, state)}
            {this.renderCredentials(props, state)}
            {(!state.fipDisabled) ? <div className="row-checkbox">
              <input type="checkbox" onChange={this.onChangeCheckbox.bind(this, 'fip')} checked={this.state.fipChecked} />
              <label onClick={this.onChangeCheckbox.bind(this, 'fip')}>{__.checkbox_tip_attach_fip}</label>
            </div> : ''}
            {state.volumeTypes.length > 0 ? <div className="row-checkbox">
              <input type="checkbox" onChange={this.onChangeCheckbox.bind(this, 'volume')} checked={this.state.volumeChecked} />
              <label onClick={this.onChangeCheckbox.bind(this, 'volume')}>{__.checkbox_tip_attach_volume}</label>
            </div> : ''}
            {(state.volumeChecked) ? this.renderVolume(props, state) : ''}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Model;
