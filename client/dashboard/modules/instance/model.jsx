require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Button = uskin.Button;
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var RelatedSources = require('client/components/related_sources/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');
var ConsoleOutput = require('client/components/console_output/index');
var VncConsole = require('client/components/vnc_console/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var moment = require('client/libs/moment');
var stores = require('./stores');
// var storage = require('client/dashboard/cores/storage');
var actions = require('./actions');
var Request = require('client/dashboard/cores/request');
var router = require('client/dashboard/cores/router');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    moment.locale(HALO.configs.lang);
    this.bindEventList = this.bindEventList.bind(this);
    this.clearTableState = this.clearTableState.bind(this);
    this._eventList = {};
  }

  componentWillMount() {
    this.bindEventList();
    this.setTableColRender(config.table.column);
    this.listInstance();

    stores.on('change', (actionType, data) => {
      // console.log('storage changed:', storage.data('instance'));
      // console.log('storage mix:', storage.mix(['instance', 'subnet']));
      switch (actionType) {
        case 'getItems':
          this.updateTableData(data);
          break;
        default:
          break;
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  bindEventList() {
    this._eventList = {
      clickBtns: this.clickBtns.bind(this),
      updateBtns: this.updateBtns.bind(this),
      clickDropdownBtn: this.clickDropdownBtn,
      changeSearchInput: this.changeSearchInput,
      clickTableCheckbox: this.clickTableCheckbox.bind(this),
      clickDetailTabs: this.clickDetailTabs.bind(this)
    };
  }

  clickDetailTabs(tab, item, callback) {
    var isAvailableView = (_item) => {
      if (_item.length > 1) {
        callback(
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch (tab.key) {
      case 'description':
        if (!isAvailableView(item)) {
          break;
        }

        Request.get({
          url: '/api/v1/' + HALO.user.projectId + '/servers/' + item[0].id
        }).then((data) => {
          var basicPropsItem = this.getBasicPropsItems(data.server),
            relatedSourcesItem = this.getRelatedSourcesItems(data.server),
            relatedSnapshotItems = this.getRelatedSnapshotItems(data.server.instance_snapshot);

          callback(
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []} />
              <RelatedSources
                title={__.related + __.sources}
                defaultUnfold={true}
                items={relatedSourcesItem} />
              <RelatedSnapshot
                title={__.related_image}
                defaultUnfold={true}
                items={relatedSnapshotItems ? relatedSnapshotItems : []}
                noItemAlert={__.no_related + __.instance + __.snapshot}>
                <Button value={__.create + __.snapshot}/>
              </RelatedSnapshot>
            </div>
          );
        });
        break;
      case 'console_output':
        if (!isAvailableView(item)) {
          break;
        }

        var updateConsoleInterval;
        var updateConsole = () => {
          Request.post({
            url: '/api/v1/' + HALO.user.projectId + '/servers/' + item[0].id + '/action/output'
          }).then((res) => {
            let outputData = res.output.split('\n');
            callback(<ConsoleOutput data={outputData} data-id={item[0].id} />, {
              tabKey: 'console_output',
              interval: updateConsoleInterval
            });
          });
        };

        updateConsole();
        updateConsoleInterval = setInterval(updateConsole, 1000);

        //!!fix the following if you can control update interval
        clearInterval(updateConsoleInterval);
        break;
      case 'vnc_console':
        if (!isAvailableView(item)) {
          break;
        }
        Request.post({
          url: '/api/v1/' + HALO.user.projectId + '/servers/' + item[0].id + '/action/vnc'
        }).then((res) => {
          callback(
            <VncConsole
              src={res.console.url}
              data-id={item[0].id} />
          );
        }, () => {
          callback(<div />);
        });
        break;
      default:
        callback(null);
        break;
    }

  }

  getBasicPropsItems(item) {
    var routerListener = (module, id, e) => {
      e.preventDefault();
      router.pushState('/project/' + module + '/' + id);
    };

    var items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.floating_ip,
      content: item.floating_ip ?
        <span>
          <i className="glyphicon icon-floating-ip" />
          <a onClick={routerListener.bind(null, 'floating-ip', item.floating_ip.id)}>
            {item.floating_ip.floating_ip_address}
          </a>
        </span>
      : null
    }, {
      title: __.image,
      content:
        <a onClick={routerListener.bind(null, 'image', item.image.id)}>
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
    var routerListener = (module, id, e) => {
      e.preventDefault();
      router.pushState('/project/' + module + '/' + id);
    };

    for(let key in items.addresses) {
      for(let item of items.addresses[key]) {
        if(item['OS-EXT-IPS:type'] === 'fixed') {
          let securityGroups = [];
          for(let i in item.security_groups) {
            if (i > 0) {
              securityGroups.push(<span key={'dot' + i}>{', '}</span>);
            }
            securityGroups.push(<a key={i} onClick={routerListener.bind(null, 'security-group', item.security_groups[i].id)}>{item.security_groups[i].name}</a>);
          }

          networks.push({
            virtual_interface:
              <a onClick={routerListener.bind(null, 'virtual-interface', item.port.fixed_ips[0].subnet_id)}>
                {item.addr}
              </a>,
            subnet: <a onClick={routerListener.bind(null, 'subnet', item.subnet.id)}>{item.subnet.name}</a>,
            security_group: securityGroups,
            floating_ip: '-'
          });
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
        data: networks
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
        titleLink: '/project/image/' + item.id,
        name: item.name,
        size: item.size / 1024 + 'MB',
        time: moment(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
        status: item.status,
        createIcon: 'instance'
      });
    });

    return data;
  }

  updateTableData(data) {
    var path = router.getPathList();
    var _conf = this.state.config;
    _conf.table.data = data;

    this.setState({
      config: _conf
    }, () => {
      if (path.length > 2 && data && data.length > 0) {
        router.replaceState(router.getPathName(), null, null, true);
      }
    });
  }

  loadingTable() {
    this.updateTableData(null);
  }

  listInstance() {
    this.loadingTable();
    actions.emit('instance', 'getItems');
  }

  setTableColRender(column) {
    var routerListener = (module, id, e) => {
      e.preventDefault();
      router.pushState('/project/' + module + '/' + id);
    };

    column.map((col) => {
      switch (col.key) {
        case 'image':
          col.render = (rcol, ritem, rindex) => {
            return ritem.image ?
              <a data-type="router" href={'/project/image/' + ritem.image.id}>{ritem.image.name}</a> : '';
          };
          break;
        case 'ip_address':
          col.render = (rcol, ritem, rindex) => {
            var str = '';
            if (ritem.addresses.private) {
              ritem.addresses.private.forEach((item, i) => {
                if (item.version === 4 && item['OS-EXT-IPS:type'] === 'fixed') {
                  str += (i > 0) ? ', ' + item.addr : item.addr;
                }
              });
            }
            return str;
          };
          break;
        case 'floating_ip':
          col.render = (rcol, ritem, rindex) => {
            return ritem.floating_ip ?
              <span>
                <i className="glyphicon icon-floating-ip" />
                <a onClick={routerListener.bind(null, 'floating-ip', ritem.floating_ip.id)}>
                  {ritem.floating_ip.floating_ip_address}
                </a>
              </span>
              : '';
          };
          break;
        case 'instance_type':
          col.render = (rcol, ritem, rindex) => {
            return ritem.flavor ? ritem.flavor.name : '';
          };
          break;
        default:
          break;
      }
    });
  }

  clickTableCheckbox(e, status, clickedRow, arr) {
    // console.log('tableOnClick: ', e, status, clickedRow, arr);
    this.updateBtns(status, clickedRow, arr);
  }

  clearTableState() {
    this.refs.dashboard.clearTableState();
  }

  clickBtns(e, key) {
    switch (key) {
      case 'create':
        // console.log('create!');
        break;
      case 'refresh':
        this.refresh();
        break;
      default:
        break;
    }
  }

  refresh() {
    this.listInstance();
    this.refs.dashboard.clearState();
  }

  clickDropdownBtn(e, status) {
    // console.log('clickDropdownBtn: status is', status);
  }

  changeSearchInput(str) {
    // console.log('search:', str);
  }

  updateBtns(status, clickedRow, arr) {
    var _conf = this.state.config,
      btns = _conf.btns;

    btns.map((btn) => {
      switch (btn.key) {
        case 'vnc_console':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'power_off':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        default:
          break;
      }
    });

    this.setState({
      config: _conf
    });
  }

  render() {
    return (
      <div className="halo-module-instance" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="instance" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }

}

module.exports = Model;
