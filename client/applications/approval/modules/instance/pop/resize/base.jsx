const React = require('react');
const {Modal, Button, Tip} = require('client/uskin/index');
const applyResizeDesc = require('../apply_resize_desc/index');
const __ = require('locale/client/approval.lang.json');
const unitConverter = require('client/utils/unit_converter');
const request = require('../../request');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      visible: true,
      disabled: false,
      showError: false,
      error: '',
      _flavors: [],
      flavor: null,
      _cpus: [],
      cpu: null,
      _rams: [],
      ram: null,
      _disks: [],
      disk: null
    };

    ['setFlavor', 'onConfirm', 'onCancel',
    'onChangeCpu', 'onChangeRam', 'onChangeDisk'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    request.getFlavors().then(this.setFlavor);
  }

  sortByNumber(a, b) {
    return a - b;
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

  setFlavor(_flavors) {
    let obj = this.props.obj;
    let objImage = obj.image;

    let expectedSize = 0;
    if (objImage.expected_size) {
      expectedSize = Number(objImage.expected_size);
    } else if (objImage.min_disk) {
      expectedSize = objImage.min_disk;
    }
    let flavors = _flavors.filter((ele) => ele.disk >= expectedSize);

    let objFlavor = obj.flavor;
    let cpuOpt = this.findCpu(flavors, objFlavor.vcpus);
    let ramOpt = this.findRam(flavors, objFlavor.vcpus, objFlavor.ram);
    let diskOpt = this.findDisk(flavors, objFlavor.vcpus, objFlavor.ram, objFlavor.disk);
    let flavor = this.findFlavor(flavors, objFlavor.vcpus, objFlavor.ram, objFlavor.disk);

    this.setState({
      _flavors: flavors,
      flavor: flavor,
      _cpus: cpuOpt.cpus,
      cpu: cpuOpt.cpu,
      _rams: ramOpt.rams,
      ram: ramOpt.ram,
      _disks: diskOpt.disks,
      disk: diskOpt.disk,
      disabled: true
    });
  }

  isSameFlavor(flavor) {
    let f = this.props.obj.flavor;
    return f.vcpus === flavor.vcpus && f.ram === flavor.ram && f.disk === flavor.disk;
  }

  onChangeCpu(cpu) {
    let flavors = this.state._flavors;
    let ramOpt = this.findRam(flavors, cpu);
    let diskOpt = this.findDisk(flavors, cpu, ramOpt.ram);
    let flavor = this.findFlavor(flavors, cpu, ramOpt.ram, diskOpt.disk);

    this.setState({
      cpu: cpu,
      _rams: ramOpt.rams,
      ram: ramOpt.ram,
      _disks: diskOpt.disks,
      disk: diskOpt.disk,
      flavor: flavor,
      disabled: this.isSameFlavor(flavor)
    });
  }

  onChangeRam(ram) {
    let flavors = this.state._flavors;
    let cpu = this.state.cpu;
    let diskOpt = this.findDisk(flavors, cpu, ram);
    let flavor = this.findFlavor(flavors, cpu, ram, diskOpt.disk);

    this.setState({
      ram: ram,
      _disks: diskOpt.disks,
      disk: diskOpt.disk,
      flavor: flavor,
      disabled: this.isSameFlavor(flavor)
    });
  }

  onChangeDisk(disk) {
    let flavors = this.state._flavors;
    let cpu = this.state.cpu;
    let ram = this.state.ram;
    let flavor = this.findFlavor(flavors, cpu, ram, disk);

    this.setState({
      disk: disk,
      flavor: flavor,
      disabled: this.isSameFlavor(flavor)
    });
  }

  onConfirm() {
    let state = this.state,
      props = this.props;

    if (state.flavor) {
      let data = {
        _type: 'Instance',
        id: props.obj.id,
        flavor: state.flavor.id
      };

      applyResizeDesc(data);
      this.setState({
        visible: false
      });

      this.setState({
        disabled: true
      });
    }
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  render() {
    let props = this.props,
      state = this.state;

    let title = __.apply_ + __.resize;

    let data = [{
      key: 'cpu',
      title: __.cpu + __.type,
      data: state._cpus,
      selected: state.cpu,
      render: (val) => {
        return val + ' vCPU';
      },
      onChange: this.onChangeCpu
    }, {
      key: 'ram',
      title: __.memory + __.size,
      data: state._rams,
      selected: state.ram,
      render: (val) => {
        let res = unitConverter(Number(val), 'MB');
        return res.num + ' ' + res.unit;
      },
      onChange: this.onChangeRam
    }, {
      key: 'disk',
      title: __.volume + __.size,
      data: state._disks,
      selected: state.disk,
      render: (val) => {
        return val + ' GB';
      },
      onChange: this.onChangeDisk
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

    let price = '0.0000';
    let monthlyPrice = price;

    let enableCharge = HALO.settings.enable_charge;
    if (enableCharge && flavor) {
      let type = flavor.name;
      if (HALO.prices) {
        price = HALO.prices.compute[type] ? HALO.prices.compute[type] : 0;
        monthlyPrice = (Number(price) * 24 * 30).toFixed(4);
      }
    }

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible} width={726}>
        <div className="modal-bd halo-com-modal-common halo-com-modal-resize-instance">
          <div className="name-row">
            <div className="modal-label">
              {__.instance}
            </div>
            <div>
              <i className="glyphicon icon-instance"></i>
              {props.obj.name || ('(' + props.obj.id.substr(0, 8) + ')')}
            </div>
          </div>
          <div className="row row-dropdown">
            <div className="modal-label">
              {__.flavor}
            </div>
            <div className="modal-data">
              <div className="dropdown-overview" onClick={this.unfoldFlavorOptions}>
                {flavorDetail}
              </div>
            </div>
          </div>
          <div className="row row-dropdown">
            <div className="modal-label" />
            <div className="modal-data">
              <div ref="drop_flavor" className="dropdown-box">
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
              </div>
            </div>
          </div>
          <div className="row row-tip">
            <div className="modal-label" />
            <Tip content={__.resize_instance} type="warning" showIcon={true} width={512} />
          </div>
          {
            enableCharge ?
              <div className="modal-row charge-row">
                <div className="modal-label" />
                <div className="modal-data">
                  <div className="account-box">
                    <div className="account-md">
                      <strong>{__.account.replace('{0}', price)}</strong> / <span>{__.hour}</span>
                    </div>
                    <div className="account-md account-gray">
                      {'( ' + __.account.replace('{0}', monthlyPrice) + ' / ' + __.month + ' )'}
                    </div>
                  </div>
                </div>
              </div>
            : false
          }
          <div className={'row row-tip' + (state.showError ? '' : ' hide')}>
            <div className="modal-label" />
            <Tip content={state.error} type="danger" showIcon={true} width={512} />
          </div>
        </div>
        <div className="modal-ft">
          <Button value={__.apply_} disabled={state.disabled} onClick={this.onConfirm} />
          <Button value={__.cancel} type="cancel" onClick={this.onCancel} />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
