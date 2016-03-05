require('./style/index.less');

var React = require('react');
var Main = require('client/components/main/index');
var {Button} = require('client/uskin/index');
var request = require('./request');
var Request = require('client/dashboard/cores/request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('i18n/client/lang.json');
var router = require('client/dashboard/cores/router');

var BasicProps = require('client/components/basic_props/index');
var RelatedSources = require('client/components/related_sources/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');

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
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'image':
          column.render = (col, item, i) => {
            return item.image ?
              <a data-type="router" href={'/project/image/' + item.image.id}>{item.image.name}</a> : '';
          };
          break;
        case 'ip_address':
          column.render = (col, item, i) => {
            var str = '';
            if (item.addresses.private) {
              item.addresses.private.forEach((_item, index) => {
                if (_item.version === 4 && _item['OS-EXT-IPS:type'] === 'fixed') {
                  str += (index > 0) ? ', ' + _item.addr : _item.addr;
                }
              });
            }
            return str;
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
            return item.flavor ? item.flavor.name : '';
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
    this.getTableData();
  }

  getTableData() {
    request.getList((res) => {
      var table = this.state.config.table;
      table.data = res.servers;
      table.loading = false;

      this.setState({
        config: config
      });

      var detail = this.refs.dashboard.refs.detail;
      if (detail.state.loading) {
        detail.setState({
          loading: false
        });
      }
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
    switch(key) {
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true
        });
        break;
      case 'terminate':
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
    for(let key in btns) {
      switch (key) {
        case 'vnc_console':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'active') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'power_on':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'shutoff') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'power_off':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'active') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'reboot':
          if (rows.length === 1 && rows[0].status.toLowerCase() === 'active') {
            btns[key].disabled = false;
          } else {
            btns[key].disabled = true;
          }
          break;
        case 'instance_snapshot':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'resize':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'terminate':
          btns[key].disabled = (rows.length === 1) ? false : true;
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
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
              <RelatedSources
                title={__.related + __.sources}
                tabKey={'console_output'}
                defaultUnfold={true}
                items={relatedSourcesItem} />
              <RelatedSnapshot
                title={__.related_image}
                defaultUnfold={true}
                tabKey={'vnc_console'}
                items={relatedSnapshotItems ? relatedSnapshotItems : []}
                noItemAlert={__.no_related + __.instance + __.snapshot}>
                <Button value={__.create + __.snapshot}/>
              </RelatedSnapshot>
            </div>
          );
        }
        break;
      case 'console_output':
        if (isAvailableView(rows)) {
          contents[tabKey] = (
            <div>
            </div>
          );
        }
        break;
      case 'vnc_console':
        if (isAvailableView(rows)) {
          contents[tabKey] = (
            <div>
            </div>
          );
        }
        break;
      default:
        break;
    }

    detail.setState({
      contents: contents
    });
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name,
      type: 'editable',
      request: {
        url: '/proxy/nova/v2.1/' + HALO.user.projectId + '/servers/' + item.id,
        body: 'server',
        modifyData: 'name'
      }
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
      : null
    }, {
      title: __.image,
      content:
        <a data-type="router" href={'/project/image/' + item.image.id}>
          {item.image.name}
        </a>
    }, {
      title: __.instance_type,
      content: item.flavor ? item.flavor.name : ''
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
    var keypairs = [];
    if(items.keypair) {
      keypairs.push({
        key: items.keypair.name,
        data: items.keypair.name,
        link: '/project/keypair'
      });
    }

    var attchVolumes = [];
    items.volume.forEach((volume, i) => {
      attchVolumes.push({
        key: volume.name,
        data: volume.name + ' ( ' + volume.volume_type + ' | ' + volume.size + 'GB )',
        link: '/project/volume/' + volume.id
      });
    });

    var networks = [];
    var count = 0;
    for(let key in items.addresses) {
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
            virtual_interface:
              <a data-type="router" href={'/project/virtual-interface/' + item.port.fixed_ips[0].subnet_id}>
                {item.addr}
              </a>,
            subnet: <a data-type="router" href={'/project/subnet/' + item.subnet.id}>{item.subnet.name}</a>,
            security_group: securityGroups,
            floating_ip: '-',
            __renderKey: count
          });
          count++;
        }
      }
    }

    var data = [{
      title: __.keypair,
      content: keypairs,
      icon: 'keypair',
      deleteAction: (delItem) => {
        // console.log(delItem);
      }
    }, {
      title: __.volume,
      content: attchVolumes,
      icon: 'volume',
      deleteAction: (delItem) => {
        // console.log(delItem);
      }
    }, {
      title: __.networks,
      type: 'mini-table',
      content: {
        column: [{
          title: __.virtual_interface,
          key: 'virtual_interface',
          dataIndex: 'virtual_interface'
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
      },
      deleteAction: (delItem) => {
        // console.log(delItem);
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
        createIcon: 'instance'
      });
    });

    return data;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    // this.onAction();
  }

  refresh(data) {
    var path = router.getPathList();
    if (!path[2]) {
      if (data && data.tableLoading) {
        this.loadingTable();
      }
      this.refs.dashboard.clearState();
    } else {
      if (data && data.detailLoading) {
        this.refs.dashboard.refs.detail.loading();
      }
    }

    this.getTableData();
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
        var {item, newName} = data;

        var r = item.request;
        var _data = {};
        _data[r.body] = {};
        _data[r.body][r.modifyData] = newName;

        Request.put({
          url: r.url,
          data: _data
        }).then((res) => {
          this.refresh();
        }, (err) => {
          // console.log('err', err);
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-test" style={this.props.style}>
        <Main
          ref="dashboard"
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          onClickDetailTabs={this.onClickDetailTabs.bind(this)}
          config={this.state.config}
          params={this.props.params}
        />
      </div>
    );
  }

}

module.exports = Model;
