require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Button = uskin.Button;
var MainTable = require('client/components/main_table/index');
var BasicProps = require('client/components/basic_props/index');
var RelatedSnapshot = require('client/components/related_snapshot/index');
var deleteModal = require('client/components/modal_delete/index');
var config = require('./config.json');
var __ = require('i18n/client/lang.json');
var moment = require('client/libs/moment');
var request = require('./request');
var Request = require('client/dashboard/cores/request');
var router = require('client/dashboard/cores/router');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.setTableColRender(config.table.column);
    this.state = {
      config: config
    };

    this.bindEventList = this.bindEventList.bind(this);
    this._eventList = {};
    this._stores = {
      checkedRow: []
    };
  }

  componentWillMount() {
    this.bindEventList();
    this.listInstance();
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

        Request.get({
          url: '/api/v1/' + HALO.user.projectId + '/volumes/' + item[0].id
        }).then((data) => {
          var basicPropsItem = this.getBasicProps(data.volume),
            relatedSnapshotItems = this.getRelatedSnapshotItems(data.volume.snapshots);

          callback(
            <div>
              <BasicProps title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []}/>
              <RelatedSnapshot
                title={__.snapshot}
                defaultUnfold={true}
                items={relatedSnapshotItems ? relatedSnapshotItems : []}>
                <Button value={__.create + __.snapshot}/>
              </RelatedSnapshot>
            </div>
          );
        }, (err) => {
          // console.log(err);
        });
        break;
      default:
        callback(null);
        break;
    }
  }

  getBasicProps(item) {
    var getAttachments = (_item) => {
      var servers = [];

      _item.attachments && _item.attachments.map((attch, index) => {
        if (index > 0) {
          servers.push(<span key={'comma' + index}> ,</span>);
        }
        servers.push(
          <span key={index}>
            <i className="glyphicon icon-instance" />
            <a data-type="router" href={'/project/instance/' + attch.server.id}>
              {attch.server.name}
            </a>
          </span>
        );
      });
      return servers;
    };

    var data = [{
      title: __.name,
      content: item.name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: item.size + ' GB'
    }, {
      title: __.type,
      content: item.volume_type
    }, {
      title: __.attach_to + __.instance,
      content: getAttachments(item)
    }, {
      title: __.shared,
      content: item.multiattach ? __.yes : __.no
    }, {
      title: __.attributes,
      content: item.metadata.readonly ? __.read_only : __.read_write
    }, {
      title: __.status,
      type: 'status',
      status: item.status,
      content: __[item.status.toLowerCase()]
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }];

    return data;
  }

  getRelatedSnapshotItems(items) {
    var data = [];
    items.forEach((item) => {
      data.push({
        title: moment(item.created_at).fromNow(),
        name:
          <span>
            <i className="glyphicon icon-snapshot" />
            <a data-type="router" href={'/project/snapshot/' + item.id}>{item.name}</a>
          </span>,
        size: item.size + 'GB',
        time: moment(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
        status: item.status,
        createIcon: 'volume'
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
    var that = this;

    this.loadingTable();
    request.listVolumes().then(function(data) {
      that.updateTableData(data.volumes ? data.volumes : []);
    }, function(err) {
      that.updateTableData([]);
      console.debug(err);
    });

  }

  setTableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'size':
          col.render = (rcol, ritem, rindex) => {
            return ritem.size + ' GB';
          };
          break;
        case 'attch_instance':
          col.render = (rcol, ritem, rindex) => {
            var servers = [];

            ritem.attachments && ritem.attachments.map((attch, index) => {
              if (index > 0) {
                servers.push(<span key={'comma' + index}> ,</span>);
              }
              servers.push(
                <span key={index}>
                  <i className="glyphicon icon-instance" />
                  <a data-type="router" href={'/project/instance/' + attch.server.id}>
                    {attch.server.name}
                  </a>
                </span>
              );
            });
            return servers;
          };
          break;
        case 'type':
          col.render = (rcol, ritem, rindex) => {
            return <span><i className="glyphicon icon-performance" />{ritem.volume_type}</span>;
          };
          break;
        case 'shared':
          col.render = (rcol, ritem, rindex) => {
            return ritem.multiattach ? __.shared : '-';
          };
          break;
        case 'attributes':
          col.render = (rcol, ritem, rindex) => {
            return ritem.metadata.readonly ? __.read_only : __.read_write;
          };
          break;
        default:
          break;
      }
    });
  }

  getTableLang(table) {
    table.column.map((col) => {
      if (col.title_key) {
        col.title = '';
        col.title_key.map((val) => {
          col.title += __[val];
        });
      }

      this.setTableColRender(col);
    });
  }

  clickTableCheckbox(e, status, clickedRow, arr) {
    //   console.log('tableOnClick: ', e, status, clickedRow, arr);
    this.updateBtns(status, clickedRow, arr);
  }

  clickBtns(e, key) {
    // console.log('clickBtns: key is', key);
    switch (key) {
      case 'create_instance':
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

  clickDropdownBtn(e, btn) {
    switch (btn.key) {
      case 'delete':
        deleteModal({
          action: 'delete',
          type: 'volume',
          onDelete: function(data, cb) {
            cb(true);
          }
        });
        break;
      default:
        break;
    }
  }

  changeSearchInput(str) {
    // console.log('search: text is', str);
  }

  updateBtns(status, clickedRow, arr) {
    var _conf = this.state.config,
      btns = _conf.btns,
      updateDropdownBtns = (items) => {
        var allBtns = [];
        items.forEach((element) => {
          allBtns = allBtns.concat(element.items);
        });

        allBtns.map((btn) => {
          switch (btn.key) {
            case 'delete':
              btn.disabled = (arr.length > 0) ? false : true;
              break;
            default:
              break;
          }
        });
      };

    btns.map((btn) => {
      switch (btn.key) {
        case 'create':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'attach_to_instance':
          btn.disabled = (arr.length === 1) ? false : true;
          break;
        case 'more':
          updateDropdownBtns(btn.dropdown.items);
          break;
        default:
          break;
      }
    });

    this._stores.checkedRow = arr;
    this.setState({
      config: _conf
    });
  }

  render() {

    return (
      <div className="halo-module-volume" style={this.props.style}>
        <MainTable ref="dashboard" moduleID="volume" config={this.state.config} eventList={this._eventList} />
      </div>
    );
  }

}

module.exports = Model;
