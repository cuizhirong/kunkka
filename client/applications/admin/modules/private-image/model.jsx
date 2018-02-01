require('./style/index.less');

//react components
const React = require('react');
const Main = require('client/components/main_paged/index');

//detail components
const BasicProps = require('client/components/basic_props/index');

//pop modal
const deleteModal = require('client/components/modal_delete/index');
const RelatedInstance = require('../image/detail/related_instance');
const updateStatus = require('./pop/update_status/index');
const createImage = require('../image/pop/create/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const router = require('client/utils/router');
const getStatusIcon = require('../../utils/status_icon');
const unitConverter = require('client/utils/unit_converter');
const getTime = require('client/utils/time_unification');
const getOsCommonName = require('client/utils/get_os_common_name');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config,
      metadataCatalog: {},
      hasLoadedCatalog: false
    };

    this.stores = {
      urls: []
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    let columns = this.state.config.table.column;
    this.tableColRender(columns);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.getList();
    }
  }

  getMetadataCatalog() {
    request.getMetadata().then((res) => {
      this.setState({
        metadataCatalog: res,
        hasLoadedCatalog: true
      });
    });
  }

  tableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'name':
          col.formatter = (rcol, ritem, rindex) => {
            return this.getImageLabel(ritem);
          };
          break;
        case 'size':
          col.render = (rcol, ritem, rindex) => {
            let size = unitConverter(ritem.size);
            size.num = typeof size.num === 'number' ? size.num : 0;
            return size.num + ' ' + size.unit;
          };
          break;
        case 'type':
          col.render = (rcol, ritem, rindex) => {
            return __.image;
          };
          break;
        default:
          break;
      }
    });
  }

  getImageLabel(item) {
    let label = getOsCommonName(item);
    let style = null;

    let imgURL = HALO.settings.default_image_url;
    if (imgURL) {
      style = {
        background: `url("${imgURL}") 0 0 no-repeat`,
        backgroundSize: '20px 20px'
      };
    }
    return (
      <div>
        <i className={'icon-image-default ' + label} style={style}/>
        {item.name}
      </div>
    );
  }

  onInitialize(params) {
    this.loadingTable();
    if (params && params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getSingle(id) {
    this.clearState();

    let table = this.state.config.table;
    request.getSingle(id).then((res) => {
      table.data = res.list.filter(image => image.visibility === 'private');
      this.setPagination(table, res);
      this.updateTableData(table, res._url, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
      this.getMetadataCatalog();
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getList() {
    this.clearState();
    let pageLimit = localStorage.getItem('page_limit');
    let _config = this.state.config;
    let table = _config.table;

    request.getList(pageLimit).then((res) => {
      table.data = res.list;

      this.setPagination(table, res);
      this.updateTableData(table, res._url);
      this.getMetadataCatalog();
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  getNextList(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }

      this.setPagination(table, res);
      this.updateTableData(table, res._url, refreshDetail);
      this.getMetadataCatalog();
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, String(res.responseURL));
    });
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl);

      let detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }

      callback && callback();
    });
  }

  setPagination(table, res) {
    let pagination = {},
      next = res.links.next ? res.links.next : null;

    if (next) {
      pagination.nextUrl = next;
    }

    let history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
    table.pagination = pagination;

    return table;
  }

  getInitialListData() {
    this.getList();
  }

  getNextListData(url, refreshDetail) {
    this.getNextList(url, refreshDetail);
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'filter':
        this.onFilterSearch(actionType, refs, data);
        break;
      case 'table':
        this.onClickTable(actionType, refs, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, refs, data);
        break;
      case 'page_limit':
        this.onInitialize();
        break;
      default:
        break;
    }
  }

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      let idData = data.filter_id,
        nameData = data.filter_type;

      if (idData) {
        this.getSingle(idData.id);
      } else if (nameData){
        this.clearState();

        let pageLimit = localStorage.getItem('page_limit');
        request.filter(nameData, pageLimit).then((res) => {
          let table = this.state.config.table;
          table.data = res.list;
          this.setPagination(table, res);
          this.updateTableData(table, res._url);
          this.getMetadataCatalog();
        });
      } else {
        let r = {};
        r.initialList = true;
        r.loadingTable = true;
        r.clearState = true;

        this.refresh(r);
      }
    }
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    const currPjtId = HALO.user.projectId;

    switch (key) {
      case 'create_image':
        this.state.config.tabs.forEach(tab => tab.default && createImage({type: tab.key, metadataCatalog: that.state.metadataCatalog}, null, () => {
          this.refresh({
            refreshList: true,
            refreshDetail: true
          });
        }));
        break;
      case 'modify_image':
        this.state.config.tabs.forEach(tab => {
          tab.default &&
          createImage({item: rows[0], type: tab.key, metadataCatalog: that.state.metadataCatalog, pId: currPjtId}, null, () => {
            this.refresh({
              refreshList: true,
              refreshDetail: true
            });
          });
        });
        break;
      case 'update_status':
        updateStatus(null, null, () => {
          this.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'image',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteImage(rows[0].id).then((res) => {
              cb(true);
              that.refresh({
                refreshList: true,
                refreshDetail: true,
                loadingTable: true
              });
            });
          }
        });
        break;
      case 'refresh':
        this.refresh({
          refreshList: true,
          refreshDetail: true,
          loadingTable: true,
          loadingDetail: true
        });
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
      case 'pagination':
        let url,
          history = this.stores.urls;

        if (data.direction === 'prev') {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {//default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let hasLoadedCatalog = this.state.hasLoadedCatalog;

    for (let key in btns) {
      switch (key) {
        case 'create_image':
          btns[key].disabled = !hasLoadedCatalog;
          break;
        case 'modify_image':
          btns[key].disabled = (rows.length === 1 ? false : true) || !hasLoadedCatalog;
          break;
        case 'delete':
          btns[key].disabled = (rows.length === 1 && rows[0].owner === HALO.user.projectId && rows[0].visibility === 'private' && !rows[0].protected) ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {
      rows
    } = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    let isAvailableView = (_rows) => {
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
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []} />
            </div>
          );
        }
        break;
      case 'instance':
        let that = this, limit = 20, current = data.current || 1;
        syncUpdate = false;
        request.getInstances(rows[0].id).then(instances => {
          let pagination = {
            current: current,
            total: Math.ceil(instances.length / limit),
            total_num: instances.length
          };
          let instanceConfig = this.getInstanceConfig(instances.slice((current - 1) * limit, current * limit), pagination);
          contents[tabKey] = (
            <RelatedInstance
              tableConfig={instanceConfig}
              onDetailAction={(actionType, _refs, _data) => {
                that.onClickDetailTabs('instance', refs, {
                  rows: rows,
                  current: _data.page
                });
              }}/>
          );

          detail.setState({
            contents: contents,
            loading: false
          });
        });
        break;
      default:
        break;
    }

    if (syncUpdate) {
      detail.setState({
        contents: contents,
        loading: false
      });
    } else {
      detail.setState({
        loading: true
      });
    }
  }

  getInstanceConfig(item, pagination) {
    let dataContent = [];
    for (let key in item) {
      let element = item[key];
      let dataObj = {
        name: <a data-type="router" href={'/admin/instance/' + element.id}>{element.name}</a>,
        id: element.id,
        status: getStatusIcon(element.status),
        created: getTime(element.created, false)
      };
      dataContent.push(dataObj);
    }
    let tableConfig = {
      column: [{
        title: __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.id,
        key: 'id',
        dataIndex: 'id'
      }, {
        title: __.status,
        key: 'status',
        dataIndex: 'status'
      }, {
        title: __.create + __.time,
        key: 'created',
        dataIndex: 'created'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true,
      pagination: pagination
    };

    return tableConfig;
  }

  getBasicPropsItems(item) {
    let name = this.getImageLabel(item);
    let size = unitConverter(item.size);

    let items = [{
      title: __.name,
      content: name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: size.num + ' ' + size.unit
    }, {
      title: __.type,
      content: item.image_type === 'snapshot' ? __.instance_snapshot : __.image
    }, {
      title: __.checksum,
      content: item.checksum ? item.checksum : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }, {
      title: __.update + __.time,
      type: 'time',
      content: item.updated_at
    }];

    if (HALO.settings.enable_approval && item.visibility === 'private') {
      items.push({
        title: __.owner,
        content: item.meta_owner ? item.meta_owner : '-'
      });
    }

    return items;
  }

  refresh(data, params) {
    if (!data) {
      data = {};
    }
    if (!params) {
      params = this.props.params;
    }

    if (data.initialList) {
      if (data.loadingTable) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.clearState();
      }

      this.getInitialListData();
    } else if (data.refreshList) {
      if (params[2]) {
        if (data.loadingDetail) {
          this.loadingDetail();
          this.refs.dashboard.setRefreshBtnDisabled(true);
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }

      let history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;
    _config.table.data = [];


    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls.length = 0;
  }

  clearState() {
    this.clearUrls();

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  render() {
    return (
      <div className="halo-module-image" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;
