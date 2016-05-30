var React = require('react');
var {Modal, Button, Tip, InputNumber, Tooltip} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');
var networkPop = require('client/applications/dashboard/modules/network/pop/create_network/index');
var keypairPop = require('client/applications/dashboard/modules/keypair/pop/create_keypair/index');
var request = require('../../request');
var unitConverter = require('client/utils/unit_converter');

const TITLE = __.create + __.instance;

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    var rImageTypes = [{
      value: __.system_image,
      key: 'image'
    }, {
      value: __.instance_snapshot,
      key: 'snapshot'
    }];

    var rCredentials = [{
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
      dName: '',
      rImageTypes: rImageTypes,
      dImageType: rImageTypes[0].key,
      rImages: [],
      dImage: null,
      rSnapshots: [],
      dSnapshot: null,
      flavorUnfold: false,
      rFlavors: [],
      dFlavor: null,
      rCpus: [],
      dCpu: null,
      rMemory: [],
      dMemory: null,
      rVolumes: [],
      dVolume: null,
      rNetworks: [],
      dNetwork: null,
      hideKeypair: false,
      rSecurityGroup: [],
      dSecurityGroup: {},
      sgUnfold: false,
      rCredentials: rCredentials,
      dCredential: rCredentials[0].key,
      rKeypairs: [],
      dKeypairName: null,
      dUserName: '',
      pswError: true,
      showPswTip: false,
      dPsw: '',
      dNumber: 1,
      showError: false,
      dError: ''
    };

    ['initialize', 'onPaging', 'onChangeName',
    'unfoldFlavorOptions', 'foldFlavorOptions', 'onChangeNetwork',
    'unfoldSecurity', 'foldSecurity', 'onChangeSecurityGroup',
    'onChangeKeypair', 'onChangeNumber',
    'onChangePsw', 'onFocusPsw', 'onBlurPsw',
    'createNetwork', 'createKeypair', 'onConfirm'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    request.getData().then(this.initialize);
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
    var userName = '';
    if (selectedImage) {
      let meta = JSON.parse(selectedImage.image_meta);
      userName = meta.os_username;
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
    var dCredential = hideKeypair ? 'psw' : 'keypair';

    var networks = res.network.filter((ele) => {
      return !ele['router:external'] && ele.subnets.length > 0 ? true : false;
    });

    var sg = res.securitygroup;

    var keypairs = res.keypair;
    var selectedKeypair = selectDefault(keypairs);

    this.setState({
      ready: true,
      dImageType: imageType,
      rImages: images,
      dImage: image,
      rSnapshots: snapshots,
      dSnapshot: snapshot,
      rFlavors: flavors,
      rNetworks: networks,
      dNetwork: selectDefault(networks),
      rSecurityGroup: sg,
      dSecurityGroup: {},
      rKeypairs: keypairs,
      dKeypairName: selectedKeypair ? selectedKeypair.name : null,
      dUserName: userName,
      hideKeypair: hideKeypair,
      dCredential: dCredential
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
      dName: name
    });
  }

  onChangeImageType(key, e) {
    var state = this.state;
    var image = state.rImages.length > 0 ? state.rImages[0] : null;
    var snapshot = state.rSnapshots.length > 0 ? state.rSnapshots[0] : null;

    var userName = '';
    var obj = (key === 'snapshot') ? snapshot : image;
    if (obj) {
      let meta = JSON.parse(image.image_meta);
      userName = meta.os_username;
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

    this.setState({
      dImageType: key,
      dImage: image,
      dSnapshot: snapshot,
      dUserName: userName,
      hideKeypair: hideKeypair,
      dCredential: hideKeypair ? 'psw' : 'keypair',
      pswError: true,
      dPsw: ''
    });
  }

  setFlavor(objImage, type, value) {
    var state = this.state;
    var cpus = state.rCpus;
    var cpu = type === 'cpu' ? value : state.dCpu;
    var rams = state.rMemory;
    var ram = type === 'ram' ? value : state.dMemory;
    var disks = state.rVolumes;
    var disk = type === 'disk' ? value : state.dVolume;

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
        dFlavor: flavor,
        rCpus: cpus,
        dCpu: cpu,
        rMemory: rams,
        dMemory: ram,
        rVolumes: disks,
        dVolume: disk
      });
    }
  }

  onChangeImage(item, e) {
    var userName = '';
    var meta = JSON.parse(item.image_meta);
    userName = meta.os_username;

    var label = item.image_label.toLowerCase();
    var hideKeypair = label === 'windows';

    this.setFlavor(item, 'all');
    this.setState({
      dImage: item,
      userName: userName,
      hideKeypair: hideKeypair,
      dCredential: hideKeypair ? 'psw' : 'keypair',
      pswError: true,
      dPsw: ''
    });
  }

  onChangeSnapshot(item, e) {
    var userName = '';
    var meta = JSON.parse(item.image_meta);
    userName = meta.os_username;

    var label = item.image_label.toLowerCase();
    var hideKeypair = label === 'windows';

    this.setFlavor(item, 'all');
    this.setState({
      dSnapshot: item,
      userName: userName,
      hideKeypair: hideKeypair,
      dCredential: hideKeypair ? 'psw' : 'keypair',
      pswError: true,
      dPsw: ''
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
    var subnets = this.state.rNetworks;
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
      dNetwork: item
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
      dCredential: key,
      pswError: true,
      dPsw: ''
    });
  }

  onChangeKeypair(e) {
    var name = e.target.value;

    this.setState({
      dKeypairName: name
    });
  }

  checkPsw(pwd) {
    return (pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd));
  }

  onChangePsw(e) {
    var pwd = e.target.value;
    var pswError = this.checkPsw(pwd);

    this.setState({
      pswError: pswError,
      showPswTip: true,
      dPsw: pwd
    });
  }

  onFocusPsw(e) {
    var pswError = this.checkPsw(this.state.dPsw);

    this.setState({
      showPswTip: pswError
    });
  }

  onBlurPsw(e) {
    this.setState({
      showPswTip: false
    });
  }

  onChangeNumber(number) {
    this.setState({
      dNumber: number
    });
  }

  createNetwork() {
    networkPop(this.refs.modal, (network) => {
      this.setState({
        rNetworks: [network],
        dNetwork: network
      });
    });

    this.stopSliding();
  }

  createKeypair() {
    keypairPop(this.refs.modal, (keypair) => {
      this.setState({
        rKeypairs: [keypair],
        dKeypairName: keypair.name
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
    if (state.dImageType === 'image') {
      return state.dImage;
    } else if (state.dImageType === 'snapshot') {
      return state.dSnapshot;
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
    var selects = state.dSecurityGroup;

    if (selects[sg.id]) {
      delete selects[sg.id];
    } else {
      selects[sg.id] = true;
    }

    this.setState({
      dSecurityGroup: selects
    });

    e.stopPropagation();
  }

  onConfirm() {
    var state = this.state;
    if (state.disabled) {
      return;
    }

    var enable = state.dName && state.dFlavor && state.dNetwork && state.dNumber;
    var selectedImage;
    if (state.dImageType === 'image') {
      enable = enable && state.dImage;
      selectedImage = state.dImage;
    } else {
      enable = enable && state.dSnapshot;
      selectedImage = state.dSnapshot;
    }
    if (state.dCredential === 'keypair') {
      enable = enable && state.dKeypairName;
    } else {
      enable = enable && !state.pswError;
    }

    if (enable) {
      var data = {
        name: state.dName.trim(),
        imageRef: selectedImage.id,
        flavorRef: state.dFlavor.id,
        networks: [{
          uuid: state.dNetwork.id
        }],
        min_count: state.dNumber,
        max_count: state.dNumber
      };

      if (state.dCredential === 'keypair') {
        data.key_name = state.dKeypairName;
      } else {
        data.adminPass = state.dPsw;
      }

      var selectedSg = state.dSecurityGroup;
      var securitygroups = state.rSecurityGroup;
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
        var reg = new RegExp('"message":"(.*)","');
        var tip = reg.exec(error.response)[1];

        this.setState({
          disabled: false,
          showError: true,
          dError: tip
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
          <input type="text" onChange={this.onChangeName} value={state.dName} />
        </div>
      </div>
    );
  }

  renderImages(props, state) {
    var Types = (
      <div className="row row-tab row-tab-single" key="types">
        <div className="modal-label">
          {__.image}
        </div>
        <div className="modal-data">
          {
            state.rImageTypes.map((ele) =>
              <a key={ele.key}
                className={ele.key === state.dImageType ? 'selected' : ''}
                onClick={ele.key === state.dImageType ? null : this.onChangeImageType.bind(this, ele.key)}>
                {ele.value}
              </a>
            )
          }
        </div>
      </div>
    );

    var imageSelected = state.dImageType === 'image';
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
          state.rImages.map((ele) =>
            <a key={ele.id} className={state.dImage.id === ele.id ? 'selected' : ''}
              onClick={state.dImage.id === ele.id ? null : this.onChangeImage.bind(this, ele)}>
              <i className={'icon-image-default ' + (ele.image_label && ele.image_label.toLowerCase())}></i>
                {ele.name}
            </a>
          )
        }
        {
          state.ready && !state.dImage ?
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
          state.rSnapshots.map((ele) =>
            <a key={ele.id} className={state.dSnapshot.id === ele.id ? 'selected' : ''}
              onClick={state.dSnapshot.id === ele.id ? null : this.onChangeSnapshot.bind(this, ele)}>
              <i className={'icon-image-default ' + (ele.image_label && ele.image_label.toLowerCase())}></i>
                {ele.name}
            </a>
          )
        }
        {
          state.ready && !state.dSnapshot ?
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

  renderFlavors(props, state) {
    var data = [{
      key: 'cpu',
      title: __.cpu + __.type,
      data: state.rCpus,
      render: (val) => {
        return val + ' vCPU';
      },
      selected: state.dCpu,
      onChange: this.onChangeCpu
    }, {
      key: 'memory',
      title: __.memory + __.size,
      data: state.rMemory,
      render: (val) => {
        var res = unitConverter(Number(val), 'MB');
        return res.num + ' ' + res.unit;
      },
      selected: state.dMemory,
      onChange: this.onChangeMemory
    }, {
      key: 'volume',
      title: __.volume + __.size,
      data: state.rVolumes,
      selected: state.dVolume,
      render: (val) => {
        return val + ' GB';
      },
      onChange: this.onChangeVolume
    }];

    var flavor = state.dFlavor;
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
    var selected = state.dNetwork;
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
                  state.rNetworks.map((ele) =>
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
    var selects = state.dSecurityGroup;
    var hasSelects = Object.keys(selects).length > 0 ? true : false;
    var selectObj = state.rSecurityGroup.filter((ele) => selects[ele.id]);
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
                    state.rSecurityGroup.map((ele) => {
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

  renderCredentials(props, state) {
    var selected = state.dCredential;
    var isKeypair = selected === 'keypair';

    var credentials = state.rCredentials;
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

    var keypair = state.dKeypairName;
    var Keypairs = (
      <div className={'row row-select credential-sub' + (isKeypair ? '' : ' hide')} key="keypairs">
        <div className="modal-label">
          {__.keypair}
        </div>
        <div className="modal-data">
          {
            state.dKeypairName ?
              <select value={keypair} onChange={this.onChangeKeypair}>
                {
                  state.rKeypairs.map((ele) =>
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
          <label>{__.user_name}</label>
          <input type="text" value={state.dUserName} disabled={true} onChange={function(){}} />
          <label>{__.password}</label>
          <input type="password"
            className={state.pswError ? ' error' : ''}
            value={state.dPsw}
            onChange={this.onChangePsw}
            onFocus={this.onFocusPsw}
            onBlur={this.onBlurPsw} />
          {
            state.page === 2 && state.showPswTip ?
              <Tooltip content={__.pwd_tip} width={214} shape="top-left" type={'error'} hide={!state.pswError} />
            : null
          }
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
    return (
      <div className="row row-select">
        <div className="modal-label">
          {__.number}
        </div>
        <div className="modal-data">
         <InputNumber onChange={this.onChangeNumber} min={1} value={state.dNumber} width={265}/>
        </div>
      </div>
    );
  }

  renderErrorTip(props, state) {
    return (
      <div className={'row row-tip' + (state.showError ? '' : ' hide')}>
        <Tip content={state.dError} type="danger" showIcon={true} width={652} />
      </div>
    );
  }

  renderBtn(props, state, page) {
    if (page === 1) {
      var hasImage = false;
      if (state.dImageType === 'image') {
        hasImage = state.dImage;
      } else {
        hasImage = state.dSnapshot;
      }

      let enable = state.dName.trim() && state.ready && hasImage;

      return (
        <div className="right-side">
          <Button value={__.next} disabled={!enable} type="create" onClick={this.onPaging.bind(this, 2)} />
        </div>
      );
    } else {
      let enable = state.dFlavor && state.dNetwork;
      if (state.dCredential === 'keypair') {
        enable = enable && state.dKeypairName;
      } else {
        enable = enable && !state.pswError;
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
