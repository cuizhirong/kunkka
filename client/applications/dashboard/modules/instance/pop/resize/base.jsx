const React = require('react');
const {Modal, Button, Tip} = require('client/uskin/index');

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

    ['setFlavor', 'onConfirm', 'onCancel'].forEach((func) => {
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

  findFlavor(flavors, flavorId) {
    return flavors.filter((ele) => ele.id === flavorId)[0];
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

    let objFlavor = obj.flavor.name ? obj.flavor : flavors[0];

    let cpuOpt = this.findCpu(flavors, objFlavor.vcpus);
    let ramOpt = this.findRam(flavors, objFlavor.vcpus, objFlavor.ram);
    let diskOpt = this.findDisk(flavors, objFlavor.vcpus, objFlavor.ram, objFlavor.disk);
    let flavor = this.findFlavor(flavors, objFlavor.id);

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
    let f = this.state.flavor;
    return f.id === flavor.id;
  }

  onConfirm() {
    if(this.state.disabled) {
      return;
    }
    let state = this.state;

    if (state.flavor) {
      let data = {
        resize: {
          flavorRef: state.flavor.id
        }
      };
      request.resizeInstance(this.props.obj.id, data).then(() => {
        this.setState({
          visible: false
        });
      }).catch((error) => {
        let reg = new RegExp('"message":"(.*)","');
        let tip = reg.exec(error.response)[1];

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

  onTable(key, e) {
    this.state._flavors.some(flavor => {
      if (flavor.id === key && this.state.flavor.id !== key) {
        this.setState({
          flavor: flavor,
          disabled: this.state.flavor.id === flavor.id
        });
        return true;
      }
      return false;
    });
  }

  render() {
    let props = this.props,
      state = this.state;

    let title = __.resize;

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

    let flavorData = [];
    let flavors = state._flavors;

    flavors.forEach(fl => {
      flavorData.push({
        id: fl.id,
        name: fl.name,
        vcpu: fl.vcpus,
        ram: fl.ram,
        disk: fl.disk
      });
    });

    let sortFg = (a, b) => {
      if (a.vcpu !== b.vcpu) {
        return a.vcpu - b.vcpu;
      } else if (a.ram !== b.ram) {
        return a.ram - b.ram;
      } else if (a.disk !== b.disk) {
        return a.disk - b.disk;
      } else {
        return a.name > b.name;
      }
    };

    flavorData.sort(sortFg);

    flavorData.forEach(d => {
      d.ram = unitConverter(d.ram, 'MB').num + unitConverter(d.ram, 'MB').unit;
      d.disk = d.disk + 'GB';
    });

    let column = [{
      title: __.name,
      dataIndex: 'name',
      key: 'name'
    }, {
      title: __.cpu,
      dataIndex: 'vcpu',
      key: 'vcpu'
    }, {
      title: __.memory,
      dataIndex: 'ram',
      key: 'ram'
    }, {
      title: __.disk,
      dataIndex: 'disk',
      key: 'disk'
    }];

    let key = '', checked = false;

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible} width={726} onCancel={this.onCancel} onConfirm={this.onConfirm}>
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
              <div ref="drop_flavor" id="flavor" className={'dropdown-box flavor'}>
                <div className="dropdown-item">
                  <div className="dropdown-item-data">
                    <div className="table-header">
                      <div className="checkbox">
                        <input type="checkbox"/>
                      </div>
                      {
                        column.map((col, index) => {
                          return (
                            <div key={col.key}>
                              <span className="title">
                                {col.title}
                              </span>
                            </div>
                          );
                        })
                      }
                    </div>
                    {
                      flavorData.map((item, index) => {
                        key = item.id;
                        checked = flavor.id === key;

                        return (
                          <div key={key} className={'table-body' + (checked ? ' selected' : '')} onClick={this.onTable.bind(this, key)}>
                            <div className="checkbox">
                              <input value={key}
                                type="checkbox"
                                onChange={() => {}}
                                checked={checked} />
                            </div>
                            {
                              column.map((col, colIndex) => {
                                return (
                                  <div key={col.key}>
                                    {item[col.dataIndex]}
                                  </div>
                                );
                              })
                            }
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
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
          <Button value={__.change} disabled={state.disabled} onClick={this.onConfirm} />
          <Button value={__.cancel} type="cancel" onClick={this.onCancel} />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
