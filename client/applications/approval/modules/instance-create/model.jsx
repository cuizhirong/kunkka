require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var {Tab, Button, Tooltip, InputNumber, Slider} = uskin;

var createNetworkPop = require('client/applications/approval/modules/network/pop/create_network/index');
var createKeypairPop = require('client/applications/approval/modules/keypair/pop/create_keypair/index');
var createApplication = require('./pop/create_application/index');

var __ = require('locale/client/approval.lang.json');
var request = require('./request');
var unitConverter = require('client/utils/unit_converter');

var showCredentials = HALO.settings.enable_apply_instance_credential;
var nameRequired = HALO.settings.enable_apply_instance_name;

class Model extends React.Component {
  constructor(props) {
    super(props);

    var imageTypes = [{
      value: __.system_image,
      key: 'image'
    }, {
      value: __.instance_snapshot,
      key: 'snapshot'
    }];

    var credentials = [{
      key: 'keypair',
      value: __.keypair
    }, {
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
      number: 1,
      checked: false,
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
      volumeEventType: '',
      btnDisabled: true
    };

    ['initialize', 'initializeVolume', 'onChangeName',
    'unfoldFlavorOptions', 'foldFlavorOptions', 'onChangeNetwork',
    'unfoldSecurity', 'foldSecurity', 'onChangeSecurityGroup',
    'onChangeKeypair', 'pwdVisibleControl', 'onChangePwd',
    'onFocusPwd', 'onBlurPwd', 'onChangeNumber', 'onChangeCheckbox',
    'createNetwork', 'createKeypair', 'onSliderChange',
    'onChangeVolumeName', 'onVolumeCapacityChange'].forEach(func => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    request.getData().then(this.initialize);
    request.getOverview().then(this.initializeVolume);
  }

  initialize(res) {
    var selectDefault = (arr) => {
      return arr.length > 0 ? arr[0] : null;
    };

    var images = [];
    var snapshots = [];
    res.image.forEach((ele) => {
      var type = ele.image_type;
      if (type === 'distribution') {
        images.push(ele);
      } else if (type === 'snapshot') {
        snapshots.push(ele);
      }
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
    var selectedImage = selectDefault(images);
    var username = '';
    if (selectedImage) {
      let meta = JSON.parse(selectedImage.image_meta);
      username = meta.os_username;
    }

    var flavors = res.flavor;
    this._flavors = flavors;

    var image = selectDefault(images);
    var snapshot = selectDefault(snapshots);
    var currentImage = image;
    var imageType = 'image';
    var obj = this.props.obj;
    if (typeof obj !== 'undefined') {
      currentImage = obj;
      if (obj.visibility === 'public') {
        image = obj;
      } else if (obj.visibility === 'private') {
        snapshot = obj;
        imageType = 'snapshot';
      }
    }
    this.setFlavor(currentImage, 'all');
    var hideKeypair = currentImage ? currentImage.image_label.toLowerCase() === 'windows' : false;
    var credential = hideKeypair ? 'psw' : 'keypair';

    var networks = res.network.filter((ele) => {
      return !ele['router:external'] && ele.subnets.length > 0 ? true : false;
    });

    var sg = res.securitygroup;

    var keypairs = res.keypair;
    var selectedKeypair = selectDefault(keypairs);
    var hasAdminPass = (credential === 'keypair' && selectedKeypair && selectedKeypair.name) || (credential === 'psw' && this.state.pwd);

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
      keypairs: keypairs,
      keypairName: selectedKeypair ? selectedKeypair.name : null,
      username: username,
      hideKeypair: hideKeypair,
      credential: credential,
      btnDisabled: nameRequired ? true : !hasAdminPass
    });
  }

  checkBeforeApply(m) {
    let state = this.state;
    let hasServerName = nameRequired ? !!state.name : true;
    let hasAdminPass = (state.credential === 'keypair' && state.keypairName) || (state.credential === 'psw' && state.pwd);
    let credentialPass = showCredentials ? hasAdminPass : true;
    let hasVolumeName = (state.checked && state.volumeName) || !state.checked;
    let hasImage = (state.imageType === 'image' && state.image) || (state.imageType === 'snapshot' && state.snapshot);

    let checkObj = {};
    checkObj.serverName = !!(credentialPass && hasVolumeName && hasImage);
    checkObj.credentials = !!(hasServerName && hasVolumeName && hasImage);
    checkObj.volumeName = !!(hasServerName && credentialPass && hasImage);
    checkObj.image = !!(hasServerName && hasVolumeName && credentialPass);


    return m ? checkObj[m] : checkObj;
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
    var name = e.target.value;

    this.setState({
      name: name
    });

    var checkBlanks = this.checkBeforeApply('serverName');
    if(checkBlanks) {
      if(name) {
        this.setState({
          btnDisabled: false
        });
      } else {
        this.setState({
          btnDisabled: true
        });
      }
    }
  }

  renderImages(props, state) {
    var Types = (
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

    var imageSelected = state.imageType === 'image';
    var Images = (
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
            <a key={ele.id} className={state.image.id === ele.id ? 'selected' : ''}
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
    var Snapshots = (
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
            <a key={ele.id} className={state.snapshot.id === ele.id ? 'selected' : ''}
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

    var ret = [];
    ret.push(Types);
    ret.push(Images);
    ret.push(Snapshots);

    return ret;
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
      if (objImage.visibility === 'public') {//image
        expectedSize = Number(objImage.expected_size);
      } else {//snapshot
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

  onChangeImageType(key, e) {
    var state = this.state;
    var image = state.images.length > 0 ? state.images[0] : null;
    var snapshot = state.snapshots.length > 0 ? state.snapshots[0] : null;

    var username = '';
    var obj = (key === 'snapshot') ? snapshot : image;
    if (obj) {
      let meta = JSON.parse(image.image_meta);
      username = meta.os_username;
    }

    var objImage;
    if (key === 'image') {
      objImage = image;
    } else if (key === 'snapshot') {
      objImage = snapshot;
    }

    var hideKeypair = false;
    if (objImage) {
      hideKeypair = objImage.image_label.toLowerCase() === 'windows';
    }
    this.setFlavor(objImage, 'all');

    var checkBlanks = this.checkBeforeApply('image');
    var hasImage = (key === 'image' && image) || (key === 'snapshot' && snapshot);

    this.setState({
      imageType: key,
      image: image,
      snapshot: snapshot,
      username: username,
      hideKeypair: hideKeypair,
      credential: hideKeypair ? 'psw' : 'keypair',
      pwdError: true,
      pwd: '',
      pwdVisible: false,
      btnDisabled: checkBlanks ? (!hasImage) : true
    });
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
    var state = this.state;
    if (state.imageType === 'image') {
      return state.image;
    } else if (state.imageType === 'snapshot') {
      return state.snapshot;
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
    var selected = state.network;
    return (
      <div className="row row-select">
        <div className="row-label">
          {__.network}
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

  createNetwork() {
    createNetworkPop(this.refs.modal, (network) => {
      this.setState({
        networks: [network],
        network: network
      });
    });
  }

  renderSecurityGroup(props, state) {
    var selects = state.securityGroup;
    var hasSelects = Object.keys(selects).length > 0 ? true : false;
    var selectObj = state.securityGroups.filter((ele) => selects[ele.id]);
    var detail = selectObj.map((ele) => ele.name).join(', ');

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

    var keypair = state.keypairName;
    var Keypairs = (
      <div className={'row row-select credential-sub' + (isKeypair ? '' : ' hide')} key="keypairs">
        <div className="row-label">
          {__.keypair}
        </div>
        <div className="row-data">
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
        <div className="row-data">
          <label>{__.user_name}</label>
          <input type="text" value={state.username} disabled={true} onChange={function(){}} />
          <label>{__.password}</label>
          <div className="psw-tip-box">
            {
              state.showPwdTip ?
                <Tooltip content={__.pwd_tip} width={214} shape="top-left" type={'error'} hide={!state.pwdError} />
              : null
            }
            <i className={'glyphicon icon-eye' + (state.pwdVisible ? ' selected' : '')}
              onClick={this.pwdVisibleControl}/>
            <input type={state.pwdVisible ? 'text' : 'password'}
              className={state.pwdError ? 'error' : null}
              value={state.pwd}
              onChange={this.onChangePwd}
              onFocus={this.onFocusPwd}
              onBlur={this.onBlurPwd} />
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

    return showCredentials ? ret : null;
  }

  onChangeCredential(key, e) {
    let state = this.state;
    this.setState({
      credential: key,
      pwdError: true,
      pwd: '',
      pwdVisible: false
    });

    let checkBlanks = this.checkBeforeApply('credentials');
    if(checkBlanks && key === 'keypair') {
      if(state.keypairName) {
        this.setState({
          btnDisabled: false
        });
      } else {
        this.setState({
          btnDisabled: true
        });
      }
    } else if (checkBlanks && key === 'psw') {
      if(state.psw) {
        this.setState({
          btnDisabled: false
        });
      } else {
        this.setState({
          btnDisabled: true
        });
      }
    }
  }

  onChangeKeypair(e) {
    let name = e.target.value;

    this.setState({
      keypairName: name
    });

    let checkBlanks = this.checkBeforeApply('credentials');
    if(checkBlanks) {
      this.setState({
        btnDisabled: false
      });
    }
  }

  createKeypair() {
    createKeypairPop(this.refs.modal, (keypair) => {
      this.setState({
        keypairs: [keypair],
        keypairName: keypair.name
      });
    });
  }

  pwdVisibleControl(e) {
    var visible = this.state.pwdVisible;
    this.setState({
      pwdVisible: !visible
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
      pwd: pwd
    });

    var checkBlanks = this.checkBeforeApply('credentials');
    if(checkBlanks) {
      if(pwdError) {
        this.setState({
          btnDisabled: true
        });
      } else {
        this.setState({
          btnDisabled: false
        });
      }
    }
  }

  onFocusPwd(e) {
    var isError = this.checkPsw(this.state.pwd);

    this.setState({
      showPwdTip: isError
    });
  }

  onBlurPwd(e) {
    this.setState({
      showPwdTip: false
    });
  }

  renderCreateNum(props, state) {
    return (
      <div className="row row-select">
        <div className="row-label">
          {__.number}
        </div>
        <div className="row-data">
          <InputNumber onChange={this.onChangeNumber} min={1} value={state.number} width={120}/>
        </div>
      </div>
    );
  }

  onChangeNumber(number) {
    this.setState({
      number: number
    });
  }

  onChangeCheckbox() {
    let state = this.state;
    let hasName = nameRequired ? state.name : true;
    let hasAdminPass = (state.credential === 'keypair' && state.keypairName) || (state.credential === 'psw' && state.pwd);
    if(hasAdminPass && hasName) {
      if(this.state.checked) {
        this.setState({
          btnDisabled: false
        });
      } else {
        if(!this.state.volumeName) {
          this.setState({
            btnDisabled: true
          });
        }
      }
    }

    this.setState({
      checked: !this.state.checked
    });
  }

  initializeVolume(overview) {
    var state = this.state;

    //get all volume types
    let types = overview.volume_types;
    this.setState({
      volumeTypes: types
    });
    //select the first volume type
    if(types.length > 0) {
      this.setState({
        volumeType: types[0]
      });
    }

    //capacity of all types
    var allCapacity = overview.overview_usage.gigabytes;

    //capacity set by front-end
    var defaultTotal = 1000;
    var singleMax = 1000;

    types.forEach(t => {
      //capacity of current type
      state.typeCapacity[t] = overview.overview_usage['gigabytes_' + t];
      var capacity = overview.overview_usage['gigabytes_' + t];

      var min = 1, max, total, used;

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

    var selected = state.typeCapacity[overview.volume_types[0]],
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

  renderVolume(props, state) {
    return (
      <div className="create-volume-config">
        <div className="row row-input">
          <div className="row-label">
            <strong>*</strong>{__.volume + __.name}
          </div>
          <div className="row-data">
            <input type="text" onChange={this.onChangeVolumeName} value={state.volumeName} />
          </div>
        </div>
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
    var checkBlanks = this.checkBeforeApply('volumeName');

    this.setState({
      volumeName: name
    });

    if(checkBlanks && name) {
      this.setState({
        btnDisabled: false
      });
    } else {
      this.setState({
        btnDisabled: true
      });
    }
  }

  onClickVolumeType(value) {
    this.setState({
      volumeType: value
    });
  }

  onSliderChange(e, value) {
    this.setState({
      volumeEventType: e.type,
      sliderValue: value,
      sliderInputValue: value,
      sliderInputError: false
    });
  }

  onVolumeCapacityChange(e) {
    var state = this.state,
      min = state.min,
      max = state.max;

    var val = e.target.value;
    var floatVal = parseFloat(val);

    if (floatVal >= min && floatVal <= max) {
      this.setState({
        volumeEventType: 'change',
        sliderValue: floatVal,
        sliderInputValue: floatVal,
        sliderInputError: false
      });
    } else {
      this.setState({
        volumeEventType: 'change',
        sliderInputValue: val,
        sliderInputError: true
      });
    }
  }

  onApply() {
    var data = {};
    var state = this.state;

    //data is the final config json file for heat creating
    data.detail = {};
    var createDetail = data.detail;

    //data consists of array create and array bind
    createDetail.create = [];
    createDetail.bind = [];
    var configCreate = createDetail.create,
      configBind = createDetail.bind;

    //convey basic data to create one or several instance
    var createItem = {
      _type: 'Instance',
      _identity: 'ins',
      name: state.name,
      image: (state.imageType === 'image') ? state.image.id : state.snapshot.id,
      flavor: state.flavor.id,
      _number: state.number
    };

    if(showCredentials) {
      if(state.credential === 'keypair') {
        createItem.key_name = state.keypairName;
      } else {
        createItem.admin_pass = state.pwd;
      }
    }
    configCreate.push(createItem);

    var bindNetwork = {
      Instance: createItem._identity,
      Network: state.network.id
    };
    configBind.push(bindNetwork);

    Object.keys(state.securityGroup).forEach(s => {
      var bindSGrp = {
        Instance: createItem._identity,
        Security_group: s
      };
      configBind.push(bindSGrp);
    });

    if(state.number === 1 && state.checked) {
      var createVolume = {
        _type: 'Volume',
        _identity: 'vol',
        name: state.volumeName,
        volume_type: state.volumeType,
        size: state.sliderValue
      };
      configCreate.push(createVolume);

      var bindVolume = {
        Instance: createItem._identity,
        Volume: createVolume._identity
      };
      configBind.push(bindVolume);
    }

    createApplication(data);
  }

  onRefresh() {
    var imageTypes = [{
      value: __.system_image,
      key: 'image'
    }, {
      value: __.instance_snapshot,
      key: 'snapshot'
    }];

    var credentials = [{
      key: 'keypair',
      value: __.keypair
    }, {
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
      number: 1,
      checked: false,
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
      volumeEventType: ''
    });

    request.getData().then(this.initialize);
    request.getOverview().then(this.initializeVolume);
  }

  render() {
    var props = this.props;
    var state = this.state;

    var tab = [{name: __['instance-create'], key: 'instance-create'}];

    return (
      <div className="halo-module-instance-create" style={this.props.style}>
        <div className="halo-instance-create">
          <div className="submenu-tabs">
            <Tab items={tab} />
          </div>
          <div className="operation-list">
            <Button value={__.create + __.application} type="create" disabled={state.btnDisabled} onClick={this.onApply.bind(this)} />
            <Button initial={true} iconClass="glyphicon icon-refresh" onClick={this.onRefresh.bind(this)} />
          </div>
          <div className="create-config-page">
            {this.renderName(props, state)}
            {this.renderImages(props, state)}
            {this.renderFlavors(props, state)}
            {this.renderNetworks(props, state)}
            {this.renderSecurityGroup(props, state)}
            {this.renderCredentials(props, state)}
            {this.renderCreateNum(props, state)}
            {state.number === 1 ? <div className="row-checkbox">
              <input type="checkbox" onChange={this.onChangeCheckbox} checked={this.state.checked} />
              <label onClick={this.onChangeCheckbox}>{__.checkbox_tip_attach_volume}</label>
            </div> : ''}
            {(state.number === 1 && state.checked) ? this.renderVolume(props, state) : ''}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Model;
