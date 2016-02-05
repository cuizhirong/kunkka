require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Button = uskin.Button;
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var RelatedSources = require('client/components/related_sources/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');
var VncConsole = require('client/components/vnc_console/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var view = require('client/dashboard/cores/view');
// var storage = require('client/dashboard/cores/storage');
var events = require('./events');
var request = require('client/dashboard/cores/request');
var router = require('client/dashboard/cores/router');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    this.bindEventList = this.bindEventList.bind(this);
    this.clearTableState = this.clearTableState.bind(this);
    this._eventList = {};
  }

  componentWillMount() {
    this.bindEventList();
    this.setTableColRender(config.table.column);
    this.listInstance();

    view.on('instance', (actionType, data) => {
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
    // console.log('module', item[0]);

    switch (tab.key) {
      case 'description':
        if (item.length > 1) {
          callback(
            <div className="no-data-desc">
              <p>{__.view_is_unavailable}</p>
            </div>
          );
          break;
        }

        var basicPropsItem = this.getBasicPropsItems(item[0]),
          relatedSourcesItem = this.getRelatedSourcesItems(item[0]),
          relatedSnapshotItems = this.getRelatedSnapshotItems(item[0]);
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
              items={relatedSnapshotItems ? relatedSnapshotItems : []}>
              <Button value={__.create + __.snapshot}/>
            </RelatedSnapshot>
          </div>
        );
        break;
      case 'console_output':
        callback(<div>This is 2. Console Output</div>);
        break;
      case 'vnc_console':
        if (item.length > 1) {
          callback(
            <div className="no-data-desc">
              <p>{__.view_is_unavailable}</p>
            </div>
          );
        }
        request.post({
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
      case 'topology':
        callback(<div>This is 4. topology</div>);
        break;
      case 'monitor':
        callback(<div>This is 5. Monitor</div>);
        break;
      default:
        callback(null);
        break;
    }
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.floating_ip,
      content: item.floatingip ? item.floatingip.floating_ip_address : ''
    }, {
      title: __.image,
      content: <a href="/project/image">{item.image.name}</a>
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

  getRelatedSourcesItems(item) {
    var items = {
      keypair: {
        title: __.keypair,
        content: item.keypair ?
          <div className="content-item">
            <i className="glyphicon icon-keypair"/>
            <a>{item.keypair.name}</a>
            <i className="glyphicon icon-delete delete" />
          </div> : <div className="content-no-data">
            {__.no_associate + __.keypair}
          </div>
      },
      attch_volume: {
        title: __.volume,
        content: item.volume.length ?
          <div className="content-item">
            <i className="glyphicon icon-volume"/>
            <div style={{display: 'inline-block'}}>
              {item.volume.map((vol, i) =>
                <a key={i}>
                  {vol.name + ' ( ' + vol.volume_type + ' | ' + vol.size + 'GB )'
                    + (i < item.volume.length - 1 ? ', ' : '')
                  }
                </a>
              )}
            </div>
            <i className="glyphicon icon-delete delete" />
          </div> : <div className="content-no-data">
            {__.no_associate + __.volume}
          </div>
      },
      networks: {
        title: __.networks,
        content: <div className="content-network">
            <div className="network-header">
              <span>{__.virtual_interface}</span>
              <span>{__.subnet}</span>
              <span>{__.security + __.group}</span>
              <span>{__.floating_ip}</span>
            </div>
            <div className="network-content">
              <span>{'-'}</span>
              <span>{'-'}</span>
              <span>{'-'}</span>
              <span>{'-'}</span>
              <i className="glyphicon icon-delete"></i>
            </div>
          </div>
      }
    };

    return items;
  }

  getRelatedSnapshotItems(item) {
    //this is fake data, please fix it later
    var relatedSnapshot = [{
      title: 'a month ago',
      name: 'name',
      size: 'size',
      time: 'created at',
      status: 'status',
      create: <i className="glyphicon icon-instance create" />
    }, {
      title: 'a month ago',
      name: 'name',
      size: 'size',
      time: 'created at',
      status: 'status',
      create: <i className="glyphicon icon-instance create" />
    }, {
      title: 'a month ago',
      name: 'name',
      size: 'size',
      time: 'created at',
      status: 'status',
      create: <i className="glyphicon icon-instance create" />
    }];

    return relatedSnapshot;
  }

  updateTableData(data) {
    var _conf = this.state.config;
    _conf.table.data = data;

    this.setState({
      config: _conf
    }, () => {
      var path = router.getPathList();
      if (path.length > 2 && data && data.length > 0) {
        // console.log('初始化instance时选择row' + path[2]);
        router.replaceState('/' + path.join('/'), null, null, true);
      }
    });
  }

  loadingTable() {
    this.updateTableData(null);
  }

  listInstance() {
    this.loadingTable();
    events.emit('instance', 'getItems');
  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'image':
          col.render = (rcol, ritem, rindex) => {
            var listener = (_item, _col, _index, e) => {
              e.preventDefault();
              router.pushState('/project/image/' + _item.image.id);
            };
            return ritem.image ?
              <a style={{cursor: 'pointer'}} onClick={listener.bind(null, ritem, rcol, rindex)}>{ritem.image.name}</a> : '';
          };
          break;
        case 'ip_address':
          col.render = (rcol, ritem, rindex) => {
            var str = '';
            if (ritem.addresses.private) {
              for (let item of ritem.addresses.private) {
                if (item.version === 4 && item['OS-EXT-IPS:type'] === 'fixed') {
                  str = item.addr;
                  break;
                }
              }
            }
            return str;
          };
          break;
        case 'floating_ip':
          col.render = (rcol, ritem, rindex) => {
            return ritem.floatingip ? ritem.floatingip.floating_ip_address : '';
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
