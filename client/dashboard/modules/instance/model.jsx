require('./style/index.less');

//react components
var React = require('react');
var Main = require('client/components/main/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var RelatedSources = require('client/components/related_sources/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');
var ConsoleOutput = require('client/components/console_output/index');
var VncConsole = require('client/components/vnc_console/index');

//pop modals
var deleteModal = require('client/components/modal_delete/index');
var createInstance = require('./pop/create_instance/index');
var shutdownInstance = require('./pop/shutdown/index');
var associateFip = require('./pop/associate_fip/index');
var attachVolume = require('./pop/attach_volume/index');
var joinNetwork = require('./pop/join_network/index');
var instSnapshot = require('./pop/inst_snapshot/index');
var dissociateFIP = require('./pop/dissociate_fip/index');
var changeSecurityGrp = require('./pop/change_security_grp/index');
var detachVolume = require('./pop/detach_volume/index');
var detachNetwork = require('./pop/detach_network/index');

var request = require('./request');
var Request = require('client/dashboard/cores/request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('i18n/client/lang.json');
var router = require('client/dashboard/cores/router');
var msgEvent = require('client/dashboard/cores/msg_event');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    this.tableColRender(this.state.config.table.column);

    msgEvent.on('dataChange', (data) => {
      if (data.resource_type === 'instance') {
        this.refresh(null, false);
        if (data.action === 'delete'
          && data.stage === 'end'
          && data.resource_id === router.getPathList()[2]) {
          router.replaceState('/project/instance');
        }
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none') {
      this.getTableData(false);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'image':
          column.render = (col, item, i) => {
            var label = item.image_label && item.image_label.toLowerCase();
            return item.image ?
              <span>
                <i className={'icon-image-default ' + label}/>
                <a data-type="router" href={'/project/image/' + item.image.id}>{' ' + item.image.name}</a>
              </span>
              : '';
          };
          break;
        case 'ip_address':
          column.render = (col, item, i) => {
            var arr = [];
            if (item.addresses.private) {
              item.addresses.private.forEach((_item, index) => {
                if (_item.version === 4 && _item['OS-EXT-IPS:type'] === 'fixed') {
                  if (_item.port) {
                    index && arr.push(', ');
                    arr.push(<a key={'port' + index} data-type="router" href={'/project/port/' + _item.port.id}>{_item.addr}</a>);
                  }
                }
              });
            }
            return arr;
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item.floating_ip ?
              <span>
                <i className="glyphicon icon-floating-ip" />
                <a data-type="router" href={'/project/floating-ip/' + item.floating_ip.id}>
                  {item.floating_ip.floating_ip_address}
                </a>
              </span> : '';
          };
          break;
        case 'instance_type':
          column.render = (col, item, i) => {
            return item.flavor ? item.flavor.vcpus + 'CPU / ' + item.flavor.ram / 1024 + 'GB' : '';
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    // 初始化时，如果params长度为2，就不管
    // 如果初始化时，params长度为3就render detail
    this.getTableData(false);
  }

  getTableData(forceUpdate, detailRefresh) {
    request.getList((res) => {
      var table = this.state.config.table;
      table.data = res;
      table.loading = false;

      var detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    }, forceUpdate);
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      default:
        break;
    }
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      default:
        break;
    }
  }

  onClickBtnList(key, refs, data) {
    var {rows} = data;
    switch(key) {
      case 'create':
        createInstance({name: 'abc'}, function() {});
        break;
      case 'vnc_console':
        break;
      case 'power_on':
        break;
      case 'power_off':
        shutdownInstance({
          name: rows[0].name
        }, function(_data, cb) {
          request.poweroff(rows[0]).then((res) => {
            cb(true);
          });
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
        break;
      case 'reboot':
        break;
      case 'instance_snapshot':
        instSnapshot({
          name: 'abc'
        }, function() {});
        break;
      case 'resize':
        break;
      case 'assc_floating_ip':
        associateFip({
          name: 'abc'
        }, function() {});
        break;
      case 'dssc_floating_ip':
        dissociateFIP({
          name: 'abc'
        }, function() {});
        break;
      case 'join_ntw':
        joinNetwork({
          name: 'abc'
        }, function() {});
        break;
      case 'chg_security_grp':
        changeSecurityGrp({
          name: 'abc'
        }, function() {});
        break;
      case 'add_volume':
        attachVolume({
          name: 'abc'
        }, function() {});
        break;
      case 'rmv_volume':
        detachVolume({
          name: 'abc'
        }, function() {});
        break;
      case 'terminate':
        deleteModal({
          action: 'terminate',
          type: 'instance',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItem(rows[0]).then((res) => {
              cb(true);
            });
          }
        });
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });

  }

  btnListRender(rows, btns) {
    var allActive = true;
    rows.forEach((ele, i) => {
      var thisState = ele.status.toLowerCase() === 'active' ? true : false;
      allActive = allActive && thisState;
    });

    var status;
    if (rows.length > 0) {
      status = rows[0].status.toLowerCase();
    }

    for(let key in btns) {
      switch (key) {
        case 'vnc_console':
        case 'power_off':
        case 'chg_security_grp':
        case 'add_volume':
          btns[key].disabled = (rows.length === 1 && status === 'active') ? false : true;
          break;
        case 'power_on':
          btns[key].disabled = (rows.length === 1 && status === 'shutoff') ? false : true;
          break;
        case 'reboot':
          btns[key].disabled = (rows.length > 0 && allActive) ? false : true;
          break;
        case 'instance_snapshot':
        case 'resize':
        case 'join_ntw':
          btns[key].disabled = (rows.length === 1 && (status === 'active' || status === 'shutoff')) ? false : true;
          break;
        case 'assc_floating_ip':
          btns[key].disabled = (rows.length === 1 && status === 'active' && !rows[0].floating_ip) ? false : true;
          break;
        case 'dssc_floating_ip':
          btns[key].disabled = (rows.length === 1 && rows[0].floating_ip) ? false : true;
          break;
        case 'rmv_volume':
          btns[key].disabled = (rows.length === 1 && rows[0].volume.length !== 0) ? false : true;
          break;
        case 'terminate':
          btns[key].disabled = (rows.length > 0) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;
    var syncUpdate = true;

    var isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch(tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);
          var relatedSourcesItem = this.getRelatedSourcesItems(rows[0]);
          var relatedSnapshotItems = this.getRelatedSnapshotItems(rows[0].instance_snapshot);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
              <RelatedSources
                title={__.related + __.sources}
                tabKey={'description'}
                defaultUnfold={true}
                items={relatedSourcesItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)} />
              <RelatedSnapshot
                title={__.related_image}
                btnConfig={{
                  value: __.create + __.snapshot,
                  actionType: 'create_related_snapshot'
                }}
                defaultUnfold={true}
                tabKey={'description'}
                items={relatedSnapshotItems ? relatedSnapshotItems : []}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                actionType={{
                  create: 'create_related_instance',
                  delete: 'delete_related_snapshot'
                }}
                noItemAlert={__.no_related + __.instance + __.snapshot} />
            </div>
          );
        }
        break;
      case 'console_output':
        if (isAvailableView(rows)) {
          var serverId = rows[0].id;
          contents[tabKey] = (
            <ConsoleOutput
              refresh={true}
              url={'/api/v1/' + HALO.user.projectId + '/servers/' + serverId + '/action/output'}
              moduleID="instance"
              tabKey="console_output"
              data-id={serverId} />
          );
        }
        break;
      case 'vnc_console':
        if (isAvailableView(rows)) {
          syncUpdate = false;
          Request.post({
            url: '/api/v1/' + HALO.user.projectId + '/servers/' + rows[0].id + '/action/vnc'
          }).then((res) => {
            contents[tabKey] = (
              <VncConsole
                src={res.console.url}
                data-id={rows[0].id} />
            );

            detail.setState({
              contents: contents
            });
          }, () => {
            contents[tabKey] = (<div />);
          });
        }
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    }
  }

  getBasicPropsItems(item) {
    var label = item.image.image_label && item.image.image_label.toLowerCase();
    var items = [{
      title: __.name,
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.floating_ip,
      content: item.floating_ip ?
        <span>
          <i className="glyphicon icon-floating-ip" />
          <a data-type="router" href={'/project/floating-ip/' + item.floating_ip.id}>
            {item.floating_ip.floating_ip_address}
          </a>
        </span>
      : '-'
    }, {
      title: __.image,
      content:
        <span>
          <i className={'icon-image-default ' + label}/>
          <a data-type="router" href={'/project/image/' + item.image.id}>
            {' ' + item.image.name}
          </a>
        </span>
    }, {
      title: __.instance_type,
      content: item.flavor ? item.flavor.vcpus + ' CPU / ' + item.flavor.ram / 1024 + ' GB' : '-'
    }, {
      title: __.keypair,
      content: item.keypair ?
        <span>
          <i className="glyphicon icon-keypair" />
          <a data-type="router" href="/project/keypair">{item.keypair.name}</a>
        </span>
        : '-'
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created
    }];

    return items;
  }

  getRelatedSourcesItems(items) {
    var attchVolumes = [];
    items.volume.forEach((volume, i) => {
      attchVolumes.push({
        key: volume.name,
        data:
          <a data-type="router" href={'/project/volume/' + volume.id}>
            {volume.name + ' ( ' + volume.volume_type + ' | ' + volume.size + 'GB )'}
          </a>,
        childItem: volume
      });
    });

    var networks = [];
    var count = 0;
    for(let key in items.addresses) {
      let floatingIp;
      for(let item of items.addresses[key]) {
        if(item['OS-EXT-IPS:type'] === 'floating') {
          floatingIp = {};
          floatingIp.addr = item.addr;
          floatingIp.id = items.floating_ip.id;
        }
      }

      for(let item of items.addresses[key]) {
        if(item['OS-EXT-IPS:type'] === 'fixed') {
          let securityGroups = [];
          for(let i in item.security_groups) {
            if (i > 0) {
              securityGroups.push(<span key={'dot' + i}>{', '}</span>);
            }
            securityGroups.push(
              <a key={i} data-type="router" href={'/project/security-group/' + item.security_groups[i].id}>
                {item.security_groups[i].name}
              </a>
            );
          }

          networks.push({
            port:
              <a data-type="router" href={'/project/port/' + item.port.fixed_ips[0].subnet_id}>
                {item.addr}
              </a>,
            subnet: <a data-type="router" href={'/project/subnet/' + item.subnet.id}>{item.subnet.name}</a>,
            security_group: securityGroups,
            floating_ip: floatingIp ?
              <a data-type="router" href={'/project/floating-ip/' + floatingIp.id}>{floatingIp.addr}</a>
              : '-',
            __renderKey: count,
            childItem: item
          });
          count++;
        }
      }
    }

    var data = [{
      title: __.volume,
      key: 'volume',
      content: attchVolumes,
      icon: 'volume'
    }, {
      title: __.networks,
      key: 'network',
      type: 'mini-table',
      content: {
        column: [{
          title: __.port,
          key: 'port',
          dataIndex: 'port'
        }, {
          title: __.subnet,
          key: 'subnet',
          dataIndex: 'subnet'
        }, {
          title: __.security + __.group,
          key: 'security_group',
          dataIndex: 'security_group'
        }, {
          title: __.floating_ip,
          key: 'floating_ip',
          dataIndex: 'floating_ip'
        }],
        data: networks,
        dataKey: '__renderKey'
      }
    }];

    return data;
  }

  getRelatedSnapshotItems(items) {
    var data = [];
    items.forEach((item) => {
      data.push({
        title: moment(item.created_at).fromNow(),
        name: <a data-type="router" href={'/project/image/' + item.id}>{item.name}</a>,
        size: item.size / 1024 + 'MB',
        time: moment(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
        status: item.status,
        createIcon: 'instance',
        childItem: item
      });
    });

    return data;
  }

  refresh(data, forceUpdate) {
    if (data) {
      var path = router.getPathList();
      if (path[2]) {
        if (data.detailLoading) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    this.getTableData(forceUpdate, data ? data.detailRefresh : false);
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
        request.editServerName(rawItem, newName).then((res) => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'create_volume':
        request.getVolumeList((res) => {
          data.volume = res;
          attachVolume(data, function() {});
        });
        break;
      case 'delete_volume':
        detachVolume(data.rawItem, function() {});
        break;
      case 'create_network':
        request.getSubnetList((res) => {
          data.subnet = res;
          request.getPortList((ports) => {
            data.port = ports;
            joinNetwork(data, function() {});
          });
        });
        break;
      case 'delete_network':
        detachNetwork(data, function() {});
        break;
      case 'create_related_snapshot':
        instSnapshot(data.rawItem, function() {});
        break;
      case 'create_related_instance':
        break;
      case 'delete_related_snapshot':
        deleteModal({
          action: 'terminate',
          type: 'inst_snapshot',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            cb(true);
          }
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-instance" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }
}

module.exports = Model;
