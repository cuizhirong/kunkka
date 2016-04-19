var React = require('react');
var {Modal, Button} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

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
      instanceName: ''
    };

    this.onConfirm = this.onConfirm.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.getFlavors = this.getFlavors.bind(this);
    this.onFlavorChange = this.onFlavorChange.bind(this);
    this.onCpuChange = this.onCpuChange.bind(this);
    this.onRamChange = this.onRamChange.bind(this);
    this.onCancel = this.onCancel.bind(this);

    this.getFlavors();
  }

  onConfirm() {
    var state = this.state;

    if (state.selectedFlavor) {
      var data = {
        resize: {
          flavorRef: state.selectedFlavor.id
        }
      };
      request.resizeInstance(this.props.obj.id, data).then(() => {
        this.setState({
          visible: false
        });
      });

      this.setState({
        disabled: true
      });
    }
  }

  getFlavors() {
    function sortNumber(a, b) {
      return a - b;
    }
    function sortRam(a, b) {
      return a.ram - b.ram;
    }

    var obj = this.props.obj;
    request.getFlavors().then((res) => {
      var flavorData = {},
        vcpus = [],
        flavors = [];
      res.forEach((flavor) => {
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
        res.forEach((flavor) => {
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

      var selectedFlavor = {
        id: obj.flavor.id,
        name: obj.flavor.name,
        vcpus: obj.flavor.vcpus,
        ram: obj.flavor.ram
      };
      this.setState({
        flavorData: flavorData,
        flavors: flavors,
        vcpus: vcpus,
        selectedFlavor: selectedFlavor,
        selectedCPU: selectedFlavor.vcpus
      });
    });
  }

  onNameChange(e) {
    this.setState({
      instanceName: e.target.value
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

  onCancel() {
    this.setState({
      visible: false
    });
  }

  render() {
    var props = this.props,
      state = this.state;

    var title = __.resize;

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
                return <a key={value} className={value === state.selectedCPU ? 'selected' : ''} onClick={this.onCpuChange.bind(this, value)}>{value + ' vCPU'}</a>;
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
