require('./style/index.less');

const React = require('react');
const { Tab, Button, Tooltip } = require('client/uskin/index');
const request = require('./request');
const __ = require('locale/client/admin.lang.json');
const router = require('client/utils/router');

class GlobalQuota extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      summaryError: false,
      summaryErrorMsg: '',
      computeFolded: false,
      storageFolded: false,
      networkFolded: false,
      current: {
        computeResourceQuota: {
          cores: 0,
          instances: 0,
          key_pairs: 0,
          ram: 0
        },
        networkResourceQuota: {
          network: 0,
          subnet: 0,
          floatingip: 0,
          loadbalancer: 0,
          listener: 0,
          resource_pool: 0,
          port: 0,
          router: 0,
          security_group: 0
        },
        storageResourceQuota: {
          // 注：初始 state 中的存储配额只有3个总量字段，而后续加载数据
          // 后可能会添加额外的各个类型硬盘的字段，所以前后数据的字段数量可能会不一致
          volumes: 0,
          gigabytes: 0,
          snapshots: 0
        }
      },
      new: {
        cores: {
          value: '',
          error: false,
          resource: 'compute'
        },
        instances: {
          value: '',
          error: false,
          resource: 'compute'
        },
        key_pairs: {
          value: '',
          error: false,
          resource: 'compute'
        },
        ram: {
          value: '',
          error: false,
          resource: 'compute'
        },
        volumes: {
          value: '',
          error: false,
          resource: 'storage'
        },
        gigabytes: {
          value: '',
          error: false,
          resource: 'storage'
        },
        snapshots: {
          value: '',
          error: false,
          resource: 'storage'
        }
      }
    };

    ['onClickTabs', 'onSave', 'onRefresh', 'onChange'].forEach(handler => {
      this[handler] = this[handler].bind(this);
    });
  }

  componentDidMount() {
    this.getCurrentQuota();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.onRefresh();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  getCurrentQuota() {
    request.getCurrentQuotaSetting().then(res => {
      this.setState({
        current: {
          computeResourceQuota: {
            instances: res.compute.instances,
            cores: res.compute.cores,
            key_pairs: res.compute.key_pairs,
            ram: res.compute.ram
          },
          networkResourceQuota: {
            network: res.network.network,
            subnet: res.network.subnet,
            floatingip: res.network.floatingip,
            loadbalancer: res.network.loadbalancer,
            listener: res.network.listener,
            resource_pool: res.network.pool,
            port: res.network.port,
            router: res.network.router,
            security_group: res.network.security_group
          },
          storageResourceQuota: res.storage
        }
      }, () => {
        this.updateNewQuotaItems();
        this.setState({
          loading: false
        });
      });

    });
  }

  // 在页面获取完最新的配额信息后，需要对应调整可以提交的配额的项目
  updateNewQuotaItems() {
    const currentQuota = this.state.current;
    const computeQuota = currentQuota.computeResourceQuota;
    const storageQuota = currentQuota.storageResourceQuota;
    const volumesTypes = this.getVolumeTypes(storageQuota);
    const newQuotaItems = {};

    for(let item in computeQuota) {
      newQuotaItems[item] = {
        value: '',
        error: false,
        resource: 'compute'
      };
    }

    ['volumes', 'gigabytes', 'snapshots'].forEach(item => {
      newQuotaItems[item] = {
        value: '',
        error: false,
        resource: 'storage'
      };
      volumesTypes.forEach(it => {
        newQuotaItems[item + '_' + it] = {
          value: '',
          error: false,
          resource: 'storage'
        };
      });
    });

    this.setState({
      new: newQuotaItems
    });
  }

  getVolumeTypes(quota) {
    const types = [];

    for(let item in quota) {
      if(item.indexOf('volumes_') !== -1) {
        types.push(item.slice(8));
      }
    }

    return types;
  }

  onClickTabs(e, item) {
    let path = router.getPathList();
    router.pushState('/' + path[0] + '/' + item.key);
  }

  onToggle(resourceKey) {
    const newState = {};
    newState[resourceKey + 'Folded'] = !this.state[resourceKey + 'Folded'];
    this.setState(newState);
  }

  onRefresh() {
    this.loadingPage();
    this.getCurrentQuota();
  }

  loadingPage() {
    this.setState({
      loading: true,
      summaryError: false
    });
  }


  onChange(evt) {
    const obj = {};
    const value = evt.target.value;
    const resource = this.state.new[evt.target.name].resource;
    let error;

    if(value === '') {
      error = false;
    } else {
      const numberTypeValue = Number(value);
      if(resource === 'storage') {
        if(isNaN(numberTypeValue) || (numberTypeValue < 0 && numberTypeValue !== -1)) {
          error = true;
        } else {
          error = false;
        }
      } else {
        if(Math.round(value) !== numberTypeValue || (numberTypeValue < 0 && numberTypeValue !== -1)) {
          error = true;
        } else {
          error = false;
        }
      }
    }

    obj[evt.target.name] = {
      value: value,
      error: error,
      resource: resource
    };

    this.setState({
      new: Object.assign({}, this.state.new, obj)
    });
  }

  onSave() {
    if(!this.validateAllQuotaSetting()) {
      return;
    }

    const normalizedQuotaObject = this.getNormalizedQuotaObject();

    this.loadingPage();
    request.updateQuotaSetting(normalizedQuotaObject).then(() => {
      this.getCurrentQuota();
    });
  }

  validateAllQuotaSetting() {
    const newQuota = this.state.new;
    for(let item in newQuota) {
      if(newQuota[item].error) {
        return false;
      }
    }

    // 验证存储部分的配额是否会超过总和
    if(!this.validateStorageSummary()) {
      return false;
    }

    return true;
  }

  validateStorageSummary() {
    const currentQuota = this.state.current;
    const volumeTypes = this.getVolumeTypes(currentQuota.storageResourceQuota);
    const valid = {
      volumes: true,
      gigabytes: true,
      snapshots: true
    };
    const volumes = this.getQuotaByQuotaItemName('volumes');
    const gigabytes = this.getQuotaByQuotaItemName('gigabytes');
    const snapshots = this.getQuotaByQuotaItemName('snapshots');

    const allTypesVolumesQuotaArray = [],
      allTypesGigabytesQuotaArray = [],
      allTypesSnapshotsQuotaArray = [];
    let volumesSum, gigabytesSum, snapshotsSum;

    volumeTypes.forEach(type => {
      allTypesVolumesQuotaArray.push(this.getQuotaByQuotaItemName('volumes_' + type));
      allTypesGigabytesQuotaArray.push(this.getQuotaByQuotaItemName('gigabytes_' + type));
      allTypesSnapshotsQuotaArray.push(this.getQuotaByQuotaItemName('snapshots_' + type));
    });

    volumesSum = allTypesVolumesQuotaArray.reduce((x, y) => {
      return x + y;
    }, 0);
    gigabytesSum = allTypesGigabytesQuotaArray.reduce((x, y) => {
      return x + y;
    }, 0);
    snapshotsSum = allTypesSnapshotsQuotaArray.reduce((x, y) => {
      return x + y;
    }, 0);

    if(volumes === -1) {
      valid.volumes = true;
    } else {
      if(allTypesVolumesQuotaArray.indexOf(-1) !== -1 || volumes < volumesSum) {
        valid.volumes = false;
      } else {
        valid.volumes = true;
      }
    }

    if(gigabytes === -1) {
      valid.gigabytes = true;
    } else {
      if(allTypesGigabytesQuotaArray.indexOf(-1) !== -1 || gigabytes < gigabytesSum) {
        valid.gigabytes = false;
      } else {
        valid.gigabytes = true;
      }
    }

    if(snapshots === -1) {
      valid.snapshots = true;
    } else {
      if(allTypesSnapshotsQuotaArray.indexOf(-1) !== -1 || snapshots < snapshotsSum) {
        valid.snapshots = false;
      } else {
        valid.snapshots = true;
      }
    }

    for(let item in valid) {
      if(valid[item] === false) {

        this.setState({
          summaryError: true,
          summaryErrorMsg: __[item + '_should_not_less_than_type_summary']
        }, () => {
          this.summaryMsgElem.scrollIntoView(true);
        });

        return false;
      }
    }

    return true;
  }

  getQuotaByQuotaItemName(quotaName) {
    const currentQuota = this.state.current;
    const newQuota = this.state.newQuota;
    let quotaValue;

    if(newQuota[quotaName].value.trim() === '') {
      quotaValue = currentQuota.storageResourceQuota[quotaName];
    } else {
      quotaValue = Number(newQuota[quotaName].value);
    }

    return quotaValue;
  }

  getNormalizedQuotaObject() {
    const normalizedQuotaObject = {
      compute: {},
      storage: {}
    };
    const newQuota = this.state.new;

    for(let item in newQuota) {
      let value = newQuota[item].value;
      if(value.trim() !== '') {
        switch (newQuota[item].resource) {
          case 'compute':
            normalizedQuotaObject.compute[item] = Math.round(value);
            break;
          case 'storage':
            normalizedQuotaObject.storage[item] = Number(value);
            break;
          default:
            break;
        }
      }
    }

    // ram 提交值应该是以 MB 为单位
    if('ram' in normalizedQuotaObject.compute) {
      normalizedQuotaObject.compute.ram = normalizedQuotaObject.compute.ram * 1024;
    }

    return normalizedQuotaObject;
  }

  getComputeResourceQuotaList() {
    const currentQuota = this.state.current.computeResourceQuota;
    const newQuota = this.state.new;

    return (
      <ul className={'item-list' + (this.state.computeFolded ?
      ' folded' : '')}>
        {
          ['instances', 'cores', 'key_pairs', 'ram'].map(item => {
            const error = newQuota[item].error;
            const value = newQuota[item].value;
            let current;

            if(item === 'ram' && currentQuota[item] !== -1) {
              current = Math.round(currentQuota[item] / 1024);
            } else if(currentQuota[item] !== -1) {
              current = currentQuota[item];
            } else {
              current = __.infinity;
            }

            return (
              <li key={item}>
                <div className="quota-item-name">
                  {__[item] + (item === 'ram' ? '(GB)' : '')}
                </div>
                <div className="quota-current-value">
                  {
                    __.current_quota + ': ' + current
                  }
                </div>
                <div className="quota-new-value">
                  <Tooltip content={__['only_positive_integers_and_-1']} hide={!error} type="error" shape="top"/>
                  <input type="text" name={item} value={value}
                  onChange={this.onChange} className={error ? 'error' : ''} />
                </div>
              </li>
            );
          })
        }
      </ul>
    );
  }

  getNetworkResourceQuotaList() {
    const currentQuota = this.state.current.networkResourceQuota;

    return (
      <ul className={'item-list' + (this.state.networkFolded ?
      ' folded' : '')}>
        {
          ['network', 'subnet', 'floatingip', 'loadbalancer', 'listener',
          'resource_pool', 'port', 'router', 'security_group'].map(item => {
            const current = currentQuota[item] !== -1 ? currentQuota[item] : __.infinity;
            return (
              <li key={item}>
                <div className="quota-item-name">
                  {__[item]}
                </div>
                <div className="quota-current-value">
                  {
                    __.current_quota + ': ' + current
                  }
                </div>
              </li>
            );
          })
        }
      </ul>
    );
  }

  getStorageResourceQuotaList() {
    const currentQuota = this.state.current.storageResourceQuota;
    const newQuota = this.state.new;

    const volumeTypes = this.getVolumeTypes(newQuota);

    const items = [
      {
        name: __.all_volumes,
        key: 'volumes'
      },
      {
        name: __.all_gigabytes + '(GB)',
        key: 'gigabytes'
      },
      {
        name: __.all_snapshots,
        key: 'snapshots'
      }
    ];

    volumeTypes.forEach(type => {
      items.push(
        {
          name: (__[type] ? __[type] : type) + ' ' + __.volumes,
          key: 'volumes_' + type
        },
        {
          name: (__[type] ? __[type] : type) + ' ' + __.gigabytes,
          key: 'gigabytes_' + type
        },
        {
          name: (__[type] ? __[type] : type) + ' ' + __.snapshots,
          key: 'snapshots_' + type
        }
      );
    });

    return (
      <ul className={'item-list' + (this.state.storageFolded ?
      ' folded' : '')}>
        {
          items.map(item => {
            const current = currentQuota[item.key] !== -1 ? currentQuota[item.key] : __.infinity;
            const error = newQuota[item.key].error;
            const value = newQuota[item.key].value;

            return (
              <li key={item.key}>
                <div className="quota-item-name">{item.name}</div>
                <div className="quota-current-value">
                  {
                    __.current_quota + ': ' + current
                  }
                </div>
                <div className="quota-new-value">
                  <Tooltip content={__['only_positive_numbers_and_-1']} hide={!error} type="error" shape="top"/>
                  <input type="text" name={item.key} value={value}
                  onChange={this.onChange} className={error ? 'error' : ''} />
                </div>
              </li>
            );
          })
        }
      </ul>
    );
  }

  render() {
    const tabs = [
      {
        name: __.services,
        key: 'system-information'
      },
      {
        name: __['compute-services'],
        key: 'compute-services'
      },
      {
        name: __['block-storage-services'],
        key: 'block-storage-services'
      },
      {
        name: __['network-agents'],
        key: 'network-agents'
      },
      {
        name: __['orchestration-services'],
        key: 'orchestration-services'
      },
      {
        name: __['global-quota'],
        key: 'global-quota',
        default: true
      }
    ];

    const state = this.state;

    return (
      <div className="halo-module-global-quota" style={this.props.style}>
        <div className="subment-tabs">
          <Tab items={tabs} onClick={this.onClickTabs} />
        </div>
        <div className="operation-list">
          <Button value={__.save} key="save" iconClass="edit" initial={true}
          onClick={this.onSave} disabled={state.loading}/>
          <Button key="refresh" iconClass="refresh" initial={true}
          onClick={this.onRefresh} disabled={state.loading}/>
        </div>


        <div className="global-quota-wrapper">
          <div className={'loading-wrapper' + (state.loading ? '' : ' hide')}>
            <div className="loading-content">
              <i className="glyphicon icon-loading" />
            </div>
          </div>

          <div className={'summary-invalid-tip-wrapper' + (state.summaryError ? '' : ' hide')} ref={(dom) => { this.summaryMsgElem = dom; }}>
            <Tooltip content={state.summaryErrorMsg} type="error" />
          </div>

          <div className={'quota-detail-wrapper' + (state.loading ? ' hide' : '')}>
            <div className="title">
              {__.compute}
              <i className={'glyphicon icon-arrow-' + (state.computeFolded ?
              'up' : 'down')} onClick={this.onToggle.bind(this, 'compute')}></i>
            </div>
            {this.getComputeResourceQuotaList()}
          </div>
          <div className={'quota-detail-wrapper' + (state.loading ? ' hide' : '')}>
            <div className="title">
              {__.storage}
              <i className={'glyphicon icon-arrow-' + (state.storageFolded ?
              'up' : 'down')} onClick={this.onToggle.bind(this, 'storage')}></i>
            </div>
            {this.getStorageResourceQuotaList()}
          </div>
          <div className={'quota-detail-wrapper network-resource-quota' + (state.loading ? ' hide' : '')}>
            <div className="title">
              {__.network}
              <i className={'glyphicon icon-arrow-' + (state.networkFolded ?
              'up' : 'down')} onClick={this.onToggle.bind(this, 'network')}></i>
            </div>
            {this.getNetworkResourceQuotaList()}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = GlobalQuota;
