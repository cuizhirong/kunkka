var React = require('react');
var {Modal, Button, Tip} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');
var unitConverter = require('client/utils/unit_converter');
var request = require('../../request');

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

  setFlavor(_flavors) {
    var obj = this.props.obj;
    var objImage = obj.image;
    var expectedSize = Number(objImage.expected_size);
    var flavors = _flavors.filter((ele) => ele.disk >= expectedSize);

    var objFlavor = obj.flavor;
    var cpuOpt = this.findCpu(flavors, objFlavor.vcpus);
    var ramOpt = this.findRam(flavors, objFlavor.vcpus, objFlavor.ram);
    var diskOpt = this.findDisk(flavors, objFlavor.vcpus, objFlavor.ram, objFlavor.disk);
    var flavor = this.findFlavor(flavors, objFlavor.vcpus, objFlavor.ram, objFlavor.disk);

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
    var f = this.props.obj.flavor;
    return f.vcpus === flavor.vcpus && f.ram === flavor.ram && f.disk === flavor.disk;
  }

  onChangeCpu(cpu) {
    var flavors = this.state._flavors;
    var ramOpt = this.findRam(flavors, cpu);
    var diskOpt = this.findDisk(flavors, cpu, ramOpt.ram);
    var flavor = this.findFlavor(flavors, cpu, ramOpt.ram, diskOpt.disk);

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
    var flavors = this.state._flavors;
    var cpu = this.state.cpu;
    var diskOpt = this.findDisk(flavors, cpu, ram);
    var flavor = this.findFlavor(flavors, cpu, ram, diskOpt.disk);

    this.setState({
      ram: ram,
      _disks: diskOpt.disks,
      disk: diskOpt.disk,
      flavor: flavor,
      disabled: this.isSameFlavor(flavor)
    });
  }

  onChangeDisk(disk) {
    var flavors = this.state._flavors;
    var cpu = this.state.cpu;
    var ram = this.state.ram;
    var flavor = this.findFlavor(flavors, cpu, ram, disk);

    this.setState({
      disk: disk,
      flavor: flavor,
      disabled: this.isSameFlavor(flavor)
    });
  }

  onConfirm() {
    var state = this.state;

    if (state.flavor) {
      var data = {
        resize: {
          flavorRef: state.flavor.id
        }
      };
      request.resizeInstance(this.props.obj.id, data).then(() => {
        this.setState({
          visible: false
        });
      }).catch((error) => {
        var reg = new RegExp('"message":"(.*)","');
        var tip = reg.exec(error.response)[1];

        this.setState({
          disabled: false,
          showError: true,
          error: tip
        });
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
    var props = this.props,
      state = this.state;

    var title = __.resize;

    var data = [{
      key: 'cpu',
      title: __.pls_select + __.cpu + __.type,
      data: state._cpus,
      selected: state.cpu,
      render: (val) => {
        return val + ' vCPU';
      },
      onChange: this.onChangeCpu
    }, {
      key: 'ram',
      title: __.pls_select + __.memory + __.size,
      data: state._rams,
      selected: state.ram,
      render: (val) => {
        var res = unitConverter(Number(val), 'MB');
        return res.num + ' ' + res.unit;
      },
      onChange: this.onChangeRam
    }, {
      key: 'disk',
      title: __.pls_select + __.volume + __.size,
      data: state._disks,
      selected: state.disk,
      render: (val) => {
        return val + ' GB';
      },
      onChange: this.onChangeDisk
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
      <Modal ref="modal" {...props} title={title} visible={state.visible} width={726}>
        <div className="modal-bd halo-com-modal-resize-instance">
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
          <div className={'row row-tip' + (state.showError ? '' : ' hide')}>
            <div className="modal-label" />
            <Tip content={state.error} type="danger" showIcon={true} width={512} />
          </div>
        </div>
        <div className="modal-ft">
          <Button value={__.change} disabled={state.disabled} onClick={this.onConfirm} />
          <Button value={__.cancel} type="cancel" onClick={this.onCancel} />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
