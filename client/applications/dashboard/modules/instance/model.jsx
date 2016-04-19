require('./style/index.less');

//react components
var React = require('react');
var Main = require('client/components/main/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var RelatedSources = require('client/components/related_sources/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');
var ConsoleOutput = require('../../components/console_output/index');
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
var resizeInstance = require('./pop/resize/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/dashboard.lang.json');
var router = require('client/utils/router');
var msgEvent = require('client/applications/dashboard/cores/msg_event');
var notify = require('client/applications/dashboard/utils/notify');
var getStatusIcon = require('../../utils/status_icon');

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
      if (this.props.style.display !== 'none') {
        switch (data.resource_type) {
          case 'instance':
          case 'volume':
          case 'floatingip':
          case 'port':
          case 'image':
            this.refresh({
              detailRefresh: true
            }, false);

            if (data.action.indexOf('delete') > -1 && data.stage === 'end' && data.resource_id === router.getPathList()[2]) {
              router.replaceState('/dashboard/instance');
            }
            break;
          default:
            break;
        }
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.getTableData(false);
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'image':
          column.render = (col, item, i) => {
            var label = item.image.image_label && item.image.image_label.toLowerCase();
            return item.image ?
              <span>
                <i className={'icon-image-default ' + label}/>
                <a data-type="router" href={'/dashboard/image/' + item.image.id}>{' ' + item.image.name}</a>
              </span> : '';
          };
          break;
        case 'ip_address':
          column.render = (col, item, i) => {
            var arr = [],
              count = 0;
            for (var n in item.addresses) {
              for (var addr of item.addresses[n]) {
                if (addr.version === 4 && addr['OS-EXT-IPS:type'] === 'fixed') {
                  if (addr.port) {
                    if (count !== 0) {
                      arr.push(', ');
                    }
                    arr.push(<a key={addr.port.id} data-type = "router" href={'/dashboard/port/' + addr.port.id}>{addr.addr}</a>);
                    count++;
                  }
                }
              }
            }
            return <div>{arr}</div>;
          };
          break;
        case 'floating_ip':
          column.render = (col, item, i) => {
            return item.floating_ip ?
              <span>
                <i className="glyphicon icon-floating-ip" />
                <a data-type="router" href={'/dashboard/floating-ip/' + item.floating_ip.id}>
                  {item.floating_ip.floating_ip_address}
                </a>
              </span> : '';
          };
          break;
        case 'flavor':
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
    request.getList(forceUpdate).then((res) => {
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
    });
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
    var {rows} = data,
      that = this;

    switch (key) {
      case 'create':
        createInstance();
        break;
      case 'vnc_console':
        request.getVncConsole(rows[0]).then((res) => {
          var url = res.console.url;
          window.open(url, '_blank', 'width=780, height=436, left=0, top=0, resizable=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no').blur();
        });
        break;
      case 'power_on':
        request.poweron(rows[0]).then(function(res) {});
        break;
      case 'power_off':
        shutdownInstance(rows[0]);
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
        request.reboot(rows[0]).then(function(res) {});
        break;
      case 'instance_snapshot':
        instSnapshot(rows[0]);
        break;
      case 'resize':
        resizeInstance(rows[0]);
        break;
      case 'assc_floating_ip':
        associateFip(rows[0]);
        break;
      case 'dssc_floating_ip':
        dissociateFIP(rows[0]);
        break;
      case 'join_ntw':
        joinNetwork(rows[0], null, function() {
          that.refresh({
            detailRefresh: true
          }, true);
          notify({
            action: 'associate',
            resource_id: rows[0].id,
            resource_type: 'port',
            stage: 'end'
          });
        });
        break;
      case 'chg_security_grp':
        changeSecurityGrp(rows[0], null, () => {
          that.refresh(null, true);
          notify({
            resource_type: 'security_group',
            stage: 'end',
            action: 'modify',
            resource_id: rows[0].id
          });
        });
        break;
      case 'add_volume':
        request.getVolumeList(!HALO.volume_types).then((res) => {
          if (!HALO.volume_types) {
            HALO.volume_types = [];
            res[1].volume_types.forEach((type) => {
              HALO.volume_types.push(type.name);
            });
          }
          attachVolume({
            rawItem: rows[0],
            volumes: res[0].volume,
            types: HALO.volume_types
          }, null, function() {});
        });
        break;
      case 'rmv_volume':
        detachVolume({
          rawItem: rows[0]
        }, false);
        break;
      case 'terminate':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'instance',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItem(rows).then((res) => {
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

    for (let key in btns) {
      switch (key) {
        case 'vnc_console':
        case 'power_off':
        case 'chg_security_grp':
          btns[key].disabled = (rows.length === 1 && status === 'active') ? false : true;
          break;
        case 'power_on':
          btns[key].disabled = (rows.length === 1 && status === 'shutoff') ? false : true;
          break;
        case 'reboot':
          btns[key].disabled = (rows.length === 1 && status === 'active') ? false : true;
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
        case 'add_volume':
          btns[key].disabled = (rows.length === 1) ? false : true;
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
    var {
      rows
    } = data;
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

    switch (tabKey) {
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
                onAction={this.onDetailAction.bind(this)}
                __={__} />
              <RelatedSnapshot
                title={__.related_image}
                btnConfig={{
                  value: __.create + __.snapshot,
                  type: 'create',
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
          request.getVncConsole(rows[0]).then((res) => {
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
      content: item.name || '(' + item.id.substring(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.floating_ip,
      content: item.floating_ip ?
        <span>
          <i className="glyphicon icon-floating-ip" />
          <a data-type="router" href={'/dashboard/floating-ip/' + item.floating_ip.id}>
            {item.floating_ip.floating_ip_address}
          </a>
        </span> : '-'
    }, {
      title: __.image,
      content: <span>
          <i className={'icon-image-default ' + label}/>
          <a data-type="router" href={'/dashboard/image/' + item.image.id}>
            {' ' + item.image.name}
          </a>
        </span>
    }, {
      title: __.flavor,
      content: item.flavor ? item.flavor.vcpus + 'CPU / ' + item.flavor.ram / 1024 + 'GB' : '-'
    }, {
      title: __.keypair,
      content: item.keypair ?
        <span>
          <i className="glyphicon icon-keypair" />
          <a data-type="router" href="/dashboard/keypair">{item.keypair.name}</a>
        </span> : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
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
        data: <a data-type="router" href={'/dashboard/volume/' + volume.id}>
            {volume.name + ' ( ' + volume.volume_type + ' | ' + volume.size + 'GB )'}
          </a>,
        childItem: volume
      });
    });

    var networks = [];
    var count = 0;
    for (let key in items.addresses) {
      let floatingIp;
      for (let item of items.addresses[key]) {
        if (item['OS-EXT-IPS:type'] === 'floating') {
          floatingIp = {};
          floatingIp.addr = item.addr;
          floatingIp.id = items.floating_ip.id;
        }
      }

      for (let item of items.addresses[key]) {
        if (item['OS-EXT-IPS:type'] === 'fixed' && item.port) {
          let securityGroups = [];
          for (let i in item.security_groups) {
            if (i > 0) {
              securityGroups.push(<span key={'dot' + i}>{', '}</span>);
            }
            securityGroups.push(
              <a key={i} data-type="router" href={'/dashboard/security-group/' + item.security_groups[i].id}>
                {item.security_groups[i].name}
              </a>
            );
          }

          networks.push({
            port: <a data-type="router" href={'/dashboard/port/' + item.port.id}>
                {item.addr}
              </a>,
            subnet: <a data-type="router" href={'/dashboard/subnet/' + item.subnet.id}>{item.subnet.name || '(' + item.subnet.id.substring(0, 8) + ')'}</a>,
            security_group: securityGroups,
            floating_ip: floatingIp ?
              <a data-type="router" href={'/dashboard/floating-ip/' + floatingIp.id}>{floatingIp.addr}</a> : '-',
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
        name: <a data-type="router" href={'/dashboard/image/' + item.id}>{item.name}</a>,
        size: item.size / 1024 + 'MB',
        time: moment(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
        status: getStatusIcon(item.status),
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
    switch (tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    var that = this;
    switch (actionType) {
      case 'edit_name':
        var {
          rawItem, newName
        } = data;
        request.editServerName(rawItem, newName).then((res) => {
          notify({
            resource_type: 'instance',
            stage: 'end',
            action: 'modify',
            resource_id: rawItem.id
          });
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'create_volume':
        request.getVolumeList().then((res) => {
          attachVolume({
            rawItem: data.rawItem,
            volumes: res[0].volume,
            types: res[1].volume_types
          });
        });
        break;
      case 'delete_volume':
        detachVolume(data, true);
        break;
      case 'create_network':
        joinNetwork(data.rawItem, null, function() {
          that.refresh({
            detailRefresh: true
          }, true);
          notify({
            action: 'associate',
            resource_id: data.rawItem.id,
            resource_type: 'port',
            stage: 'end'
          });
        });
        break;
      case 'delete_network':
        detachNetwork(data, null, function() {
          that.refresh({
            detailRefresh: true
          }, true);
          notify({
            resource_name: data.childItem.addr,
            stage: 'end',
            action: 'delete_interface',
            resource_type: 'port',
            resource_id: data.rawItem.id
          });
        });
        break;
      case 'create_related_instance':
        break;
      case 'create_related_snapshot':
        instSnapshot(data.rawItem);
        break;
      case 'delete_related_snapshot':
        deleteModal({
          __: __,
          action: 'terminate',
          type: 'inst_snapshot',
          data: [data.childItem],
          onDelete: function(_data, cb) {
            request.deleteSnapshot(data.childItem).then(() => {
              that.refresh({
                detailRefresh: true
              }, true);
            });
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
          getStatusIcon={getStatusIcon}
          __={__}
        />
      </div>
    );
  }
}

module.exports = Model;
