var React = require('react');
var {Modal, Button, Tip, InputNumber, Tooltip} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');
var createNetwork = require('client/applications/dashboard/modules/network/pop/create_network/index');
var createKeypair = require('client/applications/dashboard/modules/keypair/pop/create_keypair/index');
var request = require('../../request');

var copyObj = function(obj) {
  var newobj = obj.constructor === Array ? [] : {};
  if (typeof obj !== 'object') {
    return newobj;
  } else {
    newobj = JSON.parse(JSON.stringify(obj));
  }
  return newobj;
};

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: false,
      flavorData: {},
      vcpus: [],
      flavors: [],
      selectedFlavor: '',
      selectedCPU: '',
      imageList: [],
      snapshotList: [],
      networkData: [],
      selectedNetwork: '',
      securityGroupData: [],
      keypairData: [],
      selectedKeypair: '',
      imageType: 'distribution',
      selectedImage: '',
      prevPage: null,
      currentPage: 'page1',
      next: false,
      prev: false,
      credentialType: 'keypair',
      instanceNum: 1,
      userName: '',
      password: '',
      instanceName: '',
      portSecurityEnable: true
    };

    this.onConfirm = this.onConfirm.bind(this);
    this.initialize = this.initialize.bind(this);
    this.onNext = this.onNext.bind(this);
    this.onPrev = this.onPrev.bind(this);
    this.renderNetworkData = this.renderNetworkData.bind(this);
    this.renderKeypairData = this.renderKeypairData.bind(this);
    this.onSelectCredential = this.onSelectCredential.bind(this);
    this.onNumChange = this.onNumChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onCreateNetwork = this.onCreateNetwork.bind(this);
    this.onCreateKeypair = this.onCreateKeypair.bind(this);
    this.onFlavorChange = this.onFlavorChange.bind(this);
    this.onCpuChange = this.onCpuChange.bind(this);
    this.onRamChange = this.onRamChange.bind(this);
    this.onNetworkChange = this.onNetworkChange.bind(this);
    this.onKeypairChange = this.onKeypairChange.bind(this);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onImageTypeChange = this.onImageTypeChange.bind(this);
    this.onImageChange = this.onImageChange.bind(this);
    this.onSelectSecurity = this.onSelectSecurity.bind(this);
    this.onPasswordFocus = this.onPasswordFocus.bind(this);
    this.onPasswordBlur = this.onPasswordBlur.bind(this);
  }

  componentWillMount() {
    request.getData().then(this.initialize);
  }

  onConfirm() {
    var state = this.state;

    if (state.disabled) {
      return;
    }
    var enableCreate = state.instanceName && state.selectedFlavor && state.selectedImage && state.selectedNetwork;
    if (enableCreate) {
      if (state.credentialType === 'keypair') {
        enableCreate = !!state.selectedKeypair;
      } else {
        enableCreate = !!state.password;
      }
    }
    if (enableCreate) {
      var serverObj = {
        name: state.instanceName,
        imageRef: state.selectedImage.id,
        flavorRef: state.selectedFlavor.id,
        networks: [{
          uuid: state.selectedNetwork
        }],
        min_count: state.instanceNum,
        max_count: state.instanceNum
      };

      if (state.credentialType === 'keypair') {
        serverObj.key_name = state.selectedKeypair;
      } else {
        serverObj.adminPass = state.password;
      }

      if (state.portSecurityEnable) {
        var securityGroups = [];
        state.securityGroupData.forEach((item) => {
          if (item.selected) {
            securityGroups.push({
              name: item.name
            });
          }
        });
        if (securityGroups.length > 0) {
          serverObj.security_groups = securityGroups;
        }
      }

      request.createInstance(serverObj).then((res) => {
        this.props.callback && this.props.callback(res.server);
        this.setState({
          visible: false
        });
      }).catch(() => {
        this.setState({
          disabled: false
        });
      });

      this.setState({
        disabled: true
      });
    }
  }

  initialize(res) {
    function sortNumber(a, b) {
      return a - b;
    }

    function sortRam(a, b) {
      return a.ram - b.ram;
    }

    var resFlavors = copyObj(res.flavor),
      resImages = copyObj(res.image),
      resNetworks = copyObj(res.network),
      resKeypair = copyObj(res.keypair);

    var flavorData = {},
      vcpus = [],
      flavors = [];
    resFlavors.forEach((flavor) => {
      var hasCPU = vcpus.some((item) => {
        if (item === flavor.vcpus) {
          return true;
        }
        return false;
      });
      if (!hasCPU) {
        vcpus.push(flavor.vcpus);
      }
    });
    vcpus.sort(sortNumber);

    var flavorArray = [];
    vcpus.forEach((cpu) => {
      flavorData[cpu] = [];
      flavorArray = [];
      resFlavors.forEach((flavor) => {
        if (flavor.vcpus === cpu) {
          var f = {
            id: flavor.id,
            name: flavor.name,
            vcpus: cpu,
            ram: flavor.ram
          };
          flavorArray.push(f);
        }
      });
      flavorArray.sort(sortRam);
      flavors = flavors.concat(flavorArray);
      flavorData[cpu] = flavorData[cpu].concat(flavorArray);
    });

    var images = [],
      snapshots = [],
      selectedImage,
      imageType = 'distribution';
    resImages.forEach((item) => {
      if (item.image_type === 'snapshot') {
        snapshots.push(item);
      } else {
        images.push(item);
      }
    });
    if (this.props.obj) {
      selectedImage = this.props.obj;
      imageType = this.props.obj.image_type;
    } else {
      selectedImage = images[0];
    }

    var resSecurityGroups = [],
      defaultSecurity;
    copyObj(res.securitygroup).forEach((item) => {
      if (item.name === 'default') {
        defaultSecurity = item;
        defaultSecurity.selected = true;
      } else {
        resSecurityGroups.push(item);
      }
    });
    resSecurityGroups.unshift(defaultSecurity);

    this.setState({
      flavorData: flavorData,
      flavors: flavors,
      vcpus: vcpus,
      selectedFlavor: flavorData[vcpus[0]][0],
      selectedCPU: vcpus[0],
      imageList: images,
      snapshotList: snapshots,
      selectedImage: selectedImage,
      imageType: imageType,
      userName: JSON.parse(selectedImage.image_meta).os_username,
      credentialType: selectedImage.image_label === 'Windows' ? 'password' : 'keypair',
      networkData: resNetworks,
      selectedNetwork: resNetworks.length > 0 ? resNetworks[0].id : '',
      securityGroupData: resSecurityGroups,
      keypairData: resKeypair,
      selectedKeypair: resKeypair.length > 0 ? resKeypair[0].name : '',
      portSecurityEnable: resNetworks.length > 0 ? resNetworks[0].port_security_enabled : true
    });
  }

  onNext() {
    this.setState({
      next: true,
      prev: false,
      prevPage: 'page1',
      currentPage: 'page2'
    });
  }

  onPrev() {
    this.setState({
      next: false,
      prev: true,
      prevPage: 'page2',
      currentPage: 'page1'
    });
  }

  onCreateNetwork() {
    var that = this;
    createNetwork(this.refs.modal, (res) => {
      that.setState({
        networkData: [res],
        selectedNetwork: res.id,
        portSecurityEnable: res.port_security_enable
      });
    });
    this.setState({
      prevPage: null
    });
  }

  onCreateKeypair() {
    var that = this;
    createKeypair(this.refs.modal, (res) => {
      that.setState({
        keypairData: [res],
        selectedKeypair: res.name
      });
    });
    this.setState({
      prevPage: null
    });
  }

  renderNetworkData() {
    var state = this.state;
    if (state.networkData && state.networkData.length > 0) {
      return (
        <select value={state.selectedNetwork} onChange={this.onNetworkChange}>
            {
              state.networkData.map(function(item) {
                return <option key={item.id} value={item.id}>{item.name || '(' + item.id.substr(0, 8) + ')'}</option>;
              })
            }
          </select>
      );
    } else {
      return (
        <span className={'empty-text-label'}>
          {__.no_network}
          <a onClick={this.onCreateNetwork}>
            {
              ['create', 'network'].map(function(m) {
                return __[m];
              }).join('')
            }
          </a>
        </span>
      );
    }
  }

  renderKeypairData() {
    var state = this.state;
    if (state.keypairData && state.keypairData.length > 0) {
      return (
        <select value={state.selectedKeypair} onChange={this.onKeypairChange}>
          {
            state.keypairData.map(function(v) {
              return <option key={v.name} value={v.name}>{v.name}</option>;
            })
          }
        </select>
      );
    } else {
      return (
        <span className={'empty-text-label'}>
          {__.no_keypair}
          <a onClick={this.onCreateKeypair}>
            {
              ['create', 'keypair'].map(function(m) {
                return __[m];
              }).join('')
            }
          </a>
        </span>
      );
    }
  }

  onNetworkChange(e) {
    var selectedNetworkId = e.target.value;
    this.state.networkData.some((network) => {
      if (network.id === selectedNetworkId) {
        this.setState({
          selectedNetwork: selectedNetworkId,
          portSecurityEnable: network.port_security_enabled
        });
        return true;
      }
      return false;
    });
  }

  onKeypairChange(e) {
    this.setState({
      selectedKeypair: e.target.value
    });
  }

  onSelectCredential(type) {
    if (type === this.state.credentialType) {
      return;
    }
    this.setState({
      credentialType: type
    });
  }

  onNumChange(status) {
    if (status > 0) {
      this.setState({
        instanceNum: status
      });
    }
  }

  onNameChange(e) {
    this.setState({
      instanceName: e.target.value
    });
  }

  onImageTypeChange(type) {
    var state = this.state;
    if (type === state.imageType) {
      return;
    }
    var selectedItem = state.imageList[0];
    if (type === 'snapshot' && state.snapshotList.length > 0) {
      selectedItem = state.snapshotList[0];
    }
    this.setState({
      imageType: type,
      selectedImage: selectedItem
    });
  }

  onImageChange(image) {
    if (this.state.selectedImage.id === image.id) {
      return;
    }
    this.setState({
      selectedImage: image,
      userName: JSON.parse(image.image_meta).os_username,
      credentialType: image.image_label === 'Windows' ? 'password' : 'keypair'
    });
  }

  onSelectSecurity(id) {
    var securityGroupData = this.state.securityGroupData;
    securityGroupData.some((item) => {
      if (item.id === id) {
        item.selected = !item.selected;
        return true;
      }
      return false;
    });
    this.setState({
      securityGroupData: securityGroupData
    });
  }

  onFlavorChange(e) {
    var state = this.state;
    state.flavors.some((flavor) => {
      if (flavor.id === e.target.value) {
        this.setState({
          selectedFlavor: flavor,
          selectedCPU: flavor.vcpus
        });
        return true;
      }
      return false;
    });
  }

  onCpuChange(cpu) {
    if (cpu === this.state.selectedCPU) {
      return;
    }
    this.setState({
      selectedFlavor: this.state.flavorData[cpu][0],
      selectedCPU: cpu
    });
  }

  onRamChange(ram) {
    var state = this.state;
    if (ram === state.selectedFlavor.ram) {
      return;
    }
    var flavor;
    state.selectedCPU && state.flavorData[state.selectedCPU].some((item) => {
      if (item.ram === ram) {
        flavor = item;
        return true;
      }
      return false;
    });
    this.setState({
      selectedFlavor: flavor
    });
  }

  onPasswordChange(e) {
    var pwd = e.target.value;
    var pwdError = this.state.credentialType === 'password' && (pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd));
    if (this.state.pwdError && !pwdError) {
      this.setState({
        pwdError: false,
        password: pwd
      });
    } else {
      this.setState({
        password: pwd
      });
    }
  }

  onPasswordFocus(e) {
    this.setState({
      showPwdTip: true
    });
  }

  onPasswordBlur(e) {
    var pwd = e.target.value;
    var pwdError = this.state.credentialType === 'password' && (pwd.length < 8 || pwd.length > 20 || !/^[a-zA-Z0-9]/.test(pwd) || !/[a-z]+/.test(pwd) || !/[A-Z]+/.test(pwd) || !/[0-9]+/.test(pwd));
    this.setState({
      pwdError: pwdError,
      showPwdTip: pwdError
    });
  }

  render() {
    var props = this.props,
      state = this.state;

    var title = ['create', 'instance'].map(function(m) {
      return __[m];
    }).join('');

    var moveAction = '';
    if (state.next && state.prevPage === 'page1') {
      moveAction = ' move-in';
    } else if (state.prev && state.prevPage === 'page2') {
      moveAction = ' move-out';
    } if (!state.prevPage && state.currentPage === 'page2') {
      moveAction = ' second-page';
    }

    var enableCreate = state.instanceName && state.selectedFlavor && state.selectedImage && state.selectedNetwork;
    if (enableCreate) {
      if (state.credentialType === 'keypair') {
        enableCreate = !!state.selectedKeypair;
      } else {
        enableCreate = !!state.password;
      }
    }

    var btns = <Button value={__.next} disabled={!state.instanceName} type="create" onClick={this.onNext} />;
    if (state.prevPage === 'page1' || state.currentPage === 'page2') {
      btns = (
        <div>
          <div style={{float: 'left', display: 'inline-block'}}>
            <Button value={__.prev} type="cancel" onClick={this.onPrev} />
          </div>
          <Button value={__.create} disabled={state.disabled || !enableCreate} type="create" onClick={this.onConfirm} />
        </div>
      );
    }

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible} width={726}>
        <div className="modal-bd halo-com-modal-create-instance">
          <div className={'page' + moveAction}>
            <div className="name-input-row">
              <div className="modal-label">
                <strong>*</strong>{__.name}
              </div>
              <div>
                <input className={this.state.error ? 'error' : ''} type="text" onChange={this.onNameChange} value={state.value} />
              </div>
            </div>
            <div className="select-row">
              <div className="modal-label">
                {__.flavor}
              </div>
              <div>
                <select value={state.selectedFlavor.id} onChange={this.onFlavorChange}>
                  {
                    state.flavors.map((v) => {
                      return <option key={v.id} value={v.id}>{v.name}</option>;
                    })
                  }
                </select>
              </div>
            </div>
            <div className="flavor-cpu-row">
              {
                state.vcpus.map((value) => {
                  return <a key={value} className={value === state.selectedCPU ? 'selected' : ''} onClick={this.onCpuChange.bind(this, value)}>{value + ' vcpu'}</a>;
                })
              }
            </div>
            <div className="flavor-ram-row">
              {
                state.selectedCPU && state.flavorData[state.selectedCPU].map((v) => {
                  return <a key={v.id} className={v.ram === state.selectedFlavor.ram ? 'selected' : ''} onClick={this.onRamChange.bind(this, v.ram)}>{(v.ram / 1024 > 1) ? (v.ram / 1024 + 'G') : (v.ram + 'M')}</a>;
                })
              }
            </div>
            <div className="tab-row">
              <div className="modal-label">
                {__.image}
              </div>
              <div>
                <a className={state.imageType === 'distribution' ? 'selected' : ''} onClick={this.onImageTypeChange.bind(this, 'distribution')}>{__.system_image}</a>
                <a className={state.imageType === 'snapshot' ? 'selected' : ''} onClick={this.onImageTypeChange.bind(this, 'snapshot')}>{__.instance_snapshot}</a>
              </div>
            </div>
            <div className={'image-list-row' + (state.imageType === 'distribution' ? '' : ' hide')}>
              {
                state.imageList.map((item, index) => {
                  return <a key={item.id} className={state.selectedImage.id === item.id ? 'selected' : ''} onClick={this.onImageChange.bind(this, item)}><i className={'icon-image-default ' + (item.image_label && item.image_label.toLowerCase())}></i>{item.name}</a>;
                })
              }
            </div>
            <div className={'image-list-row' + (state.imageType === 'distribution' ? ' hide' : '')}>
              {
                state.snapshotList.map((item, index) => {
                  return <a key={item.id} className={state.selectedImage.id === item.id ? 'selected' : ''} onClick={this.onImageChange.bind(this, item)}><i className={'icon-image-default ' + (item.image_label && item.image_label.toLowerCase())}></i>{item.name}</a>;
                })
              }
            </div>
          </div>
          <div className={'page' + moveAction}>
            <div className="select-row">
              <div className="modal-label">
                {__.network}
              </div>
              <div>
                {this.renderNetworkData()}
              </div>
            </div>
            <div className={'security-group-row' + (state.portSecurityEnable ? '' : ' hide')}>
              <div className="modal-label">
                <span>{__.security_group}</span>
              </div>
              <div className="group-list">
                {
                  state.securityGroupData.map((item, index) => {
                    return <a key={index} className={item.selected ? 'selected' : ''} onClick={this.onSelectSecurity.bind(this, item.id)}>{item.name}</a>;
                  })
                }
              </div>
            </div>
            <div className="tab-row">
              <div className="modal-label">
                {__.credentials}
              </div>
              <div>
                <a className={(state.credentialType === 'keypair' ? 'selected' : '') + (state.selectedImage && state.selectedImage.image_label === 'Windows' ? ' hide' : '')} onClick={this.onSelectCredential.bind(this, 'keypair')}>{__.keypair}</a>
                <a className={state.credentialType === 'keypair' ? '' : 'selected'} onClick={this.onSelectCredential.bind(this, 'password')}>{__.password}</a>
              </div>
            </div>
            <div className="credential-row">
              <div className={'user-name' + (state.credentialType === 'keypair' ? ' hide' : '')}>
                <label>{__.user_name}</label>
                <input type="text" value={state.userName} disabled={true} onChange={function(){}} />
              </div>
              <div className={'keypair' + (state.credentialType === 'keypair' ? '' : ' hide')}>
                <label>{__.keypair}</label>
                {this.renderKeypairData()}
              </div>
              <div className={'password' + (state.credentialType === 'keypair' ? ' hide' : '')}>
                <label>{__.password}</label>
                <input className={state.pwdError ? ' error' : ''} value={state.password} onChange={this.onPasswordChange} onFocus={this.onPasswordFocus} onBlur={this.onPasswordBlur} type="password" />
              </div>
              <Tooltip content={__.pwd_tip} width={228} shape="top-left" type={state.pwdError ? 'error' : ''} hide={!state.showPwdTip} />
              <div className="credential-tip">
                <Tip type="warning" content={__.instance_credential_tip} showIcon={true} />
              </div>
            </div>
            <div className="num-row">
              <div className="modal-label">
                {__.number}
              </div>
              <div className="num-controller">
                <InputNumber onChange={this.onNumChange} min={1} value={state.instanceNum} width={265}/>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-ft">
          {btns}
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
