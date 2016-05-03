require('./style/index.less');

//react components
var React = require('react');
var Main = require('../../components/main/index');
var {Button} = require('client/uskin/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var deleteModal = require('client/components/modal_delete/index');
var createProject = require('./pop/create/index');
var activateProject = require('./pop/activate/index');
var deactivateProject = require('./pop/deactivate/index');
var addUser = require('./pop/add_user/index');
var removeUser = require('./pop/remove_user/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
var getStatusIcon = require('../../utils/status_icon');
var router = require('client/utils/router');

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

    this.stores = {
      urls: []
    };
  }

  componentWillMount() {
    this.tableColRender(this.state.config.table.column);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.style.display === 'none' && this.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.onInitialize(nextProps.params);
    } else if(this.props.style.display !== 'none' && nextProps.style.display === 'none') {
      this.clearState();
    }
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        case 'status':
          column.render = (col, item, i) => {
            return item.enabled ?
              <span className="label-active">{__.activated}</span> : <span className="label-down">{__.inactive}</span>;
          };
          break;
        default:
          break;
      }
    });
  }

//initialize table data
  onInitialize(params) {
    this.clearState();

    var _config = this.state.config,
      table = _config.table;

    if (params[2]) {
      request.getProjectByIDInitialize(params[2]).then((res) => {
        var newTable = this.processTableData(table, res[0]);
        this.updateTableData(newTable, res[0]._url, true, () => {
          var pathList = router.getPathList();
          router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
        });
      });
    } else {
      var pageLimit = table.limit;
      request.getListInitialize(pageLimit).then((res) => {
        var newTable = this.processTableData(table, res[0]);
        this.updateTableData(newTable, res[0]._url);
      });
    }
  }

//request: get single data(pathList[2] is server_id)
  getSingleData(projectID) {
    this.clearState();

    request.getProjectByID(projectID).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    }).catch(e => {
      if(e.status === 404) {
        var table = this.state.config.table;
        table.data = [];
        this.updateTableData(table);
      }
    });
  }

//request: get list data(according to page limit)
  getInitialListData() {
    this.clearState();

    var pageLimit = this.state.config.table.limit;
    request.getList(pageLimit).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url);
    });
  }

//request: jump to next page according to the given url
  getNextListData(url, refreshDetail) {
    request.getNextList(url).then((res) => {
      var table = this.processTableData(this.state.config.table, res);
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

//request: search request
  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      this.getSingleData(data.text);
    }
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      if (currentUrl) {
        this.stores.urls.push(currentUrl);

        var detail = this.refs.dashboard.refs.detail,
          params = this.props.params;
        if (detail && refreshDetail && params.length > 2) {
          detail.refresh();
        }
        callback && callback();
      }
    });
  }

//change table data structure: to record url history
  processTableData(table, res) {
    if (res.projects) {
      table.data = res.projects;
    } else if (res.project) {
      table.data = [res.project];
    }

    var pagination = {};

    res.projects_links && res.projects_links.forEach((link) => {
      if (link.rel === 'prev') {
        pagination.prevUrl = link.href;
      } else if (link.rel === 'next') {
        pagination.nextUrl = link.href;
      }
    });
    table.pagination = pagination;

    return table;
  }

//refresh: according to the given data rules
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
        }
      } else {
        if (data.loadingTable) {
          this.loadingTable();
        }
      }

      var history = this.stores.urls,
        url = history.pop();

      this.getNextListData(url, data.refreshDetail);
    }
  }

  loadingTable() {
    var _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  loadingDetail() {
    this.refs.dashboard.refs.detail.loading();
  }

  clearUrls() {
    this.stores.urls = [];
  }

  clearState() {
    this.clearUrls();

    var dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
        break;
      case 'search':
        this.onClickSearch(actionType, refs, data);
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
      case 'pagination':
        var url,
          history = this.stores.urls;

        if (data.direction === 'prev'){
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

  onClickBtnList(key, refs, data) {
    var {rows} = data;

    var that = this;
    switch(key) {
      case 'create':
        createProject(null, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'modify_project':
        createProject(rows[0], null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'activate_project':
        activateProject(rows[0], null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'deactivate_project':
        deactivateProject(rows[0], null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'modify_quota':
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'project',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItem(rows).then((res) => {
              cb(true);
              that.refresh({
                refreshList: true,
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

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    var singleRow = rows.length === 1;
    var status = singleRow ? rows[0].enabled : null;

    for(let key in btns) {
      switch (key) {
        case 'modify_project':
        case 'modify_quota':
          btns[key].disabled = !singleRow;
          break;
        case 'activate_project':
          btns[key].disabled = !singleRow || status;
          break;
        case 'deactivate_project':
          btns[key].disabled = !singleRow || !status;
          break;
        case 'delete':
          btns[key].disabled = !(rows.length > 0);
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

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          var basicPropsItem = this.getBasicPropsItems(rows[0]);
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
            </div>
          );
        }
        break;
      case 'user':
        if (rows.length === 1) {
          syncUpdate = false;
          request.getUserIds(rows[0].id).then((roles) => {
            var userIds = [],
              assignments = {};
            roles.forEach((role) => {
              if (!assignments[role.user.id]) {
                assignments[role.user.id] = [];
                userIds.push(role.user.id);
              }
              assignments[role.user.id].push(role.role.id);
            });
            request.getUsers(userIds, assignments).then((res) => {
              var userConfig = this.getUserTableConfig(rows[0], res);
              contents[tabKey] = (
                <div>
                  <DetailMinitable
                    __={__}
                    title={__.user}
                    defaultUnfold={true}
                    tableConfig={userConfig ? userConfig : []}>
                    <Button value={__.add + __.user} onClick={this.onDetailAction.bind(this, 'description', 'add_user', {
                      rawItem: rows[0]
                    })}/>
                  </DetailMinitable>
                </div>
              );

              detail.setState({
                contents: contents,
                loading: false
              });
            });
          });
        }
        break;
      case 'quota':
        if (rows.length === 1) {
          syncUpdate = false;
          request.getQuotas(rows[0].id).then((res) => {
            var quotaItems = this.getQuotaItems(rows[0], res.quota);
            contents[tabKey] = (
              <div>
                <BasicProps
                  title={__.quota}
                  defaultUnfold={true}
                  tabKey={'description'}
                  items={quotaItems}
                  rawItem={rows[0]}
                  onAction={this.onDetailAction.bind(this)}
                  dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
              </div>
            );
            detail.setState({
              contents: contents,
              loading: false
            });
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
    } else {
      detail.setState({
        loading: true
      });
    }
  }

  getUserTableConfig(item, users) {
    var dataContent = [];
    var role;
    users.forEach((element, index) => {
      role = [];
      element.role.forEach((r, i) => {
        if (i > 0) {
          role.push(', ');
        }
        role.push(<a data-type="router" key={r.id} href={'/admin/role'}>{r.name}</a>);
      });
      var dataObj = {
        id: element.id,
        name: <a data-type="router" href={'/admin/user/' + element.id}>{element.name}</a>,
        email: element.email,
        status: element.enabled ? __.activated : __.inactive,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_user', {
          rawItem: item,
          childItem: element
        })} />,
        role: <div>{role}</div>
      };
      dataContent.push(dataObj);
    });

    var tableConfig = {
      column: [{
        title: __.user + __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.id,
        key: 'id',
        dataIndex: 'id'
      }, {
        title: __.email,
        key: 'email',
        dataIndex: 'email'
      }, {
        title: __.role,
        key: 'role',
        dataIndex: 'role'
      }, {
        title: __.status,
        key: 'status',
        dataIndex: 'status'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true
    };

    return tableConfig;
  }

  getQuotaItems(item, quotas) {
    var items = [{
      title: __.instance,
      content: quotas.instances.total,
      type: 'editable',
      field: 'instances'
    }, {
      title: __.ram + '(GB)',
      content: quotas.ram.total / 1024,
      type: 'editable',
      field: 'ram'
    }, {
      title: __.cpu,
      content: quotas.cores.total,
      type: 'editable',
      field: 'cores'
    }, {
      title: __.volume + __.size + '(GB)',
      content: quotas.gigabytes.total,
      type: 'editable',
      field: 'gigabytes'
    }, {
      title: __.snapshot,
      content: quotas.snapshots.total,
      type: 'editable',
      field: 'snapshots'
    }, {
      title: __.floatingip,
      content: quotas.floatingip.total,
      type: 'editable',
      field: 'floatingip'
    }, {
      title: __.network,
      content: quotas.network.total,
      type: 'editable',
      field: 'network'
    }, {
      title: __.subnet,
      content: quotas.subnet.total,
      type: 'editable',
      field: 'subnet'
    }, {
      title: __.router,
      content: quotas.router.total,
      type: 'editable',
      field: 'router'
    }, {
      title: __.security_group,
      content: quotas.security_group.total,
      type: 'editable',
      field: 'security_group'
    }, {
      title: __.keypair,
      content: quotas.key_pairs.total,
      type: 'editable',
      field: 'key_pairs'
    }];

    return items;
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.domain,
      content: <a data-type="router" key={item.domain_id} href={'/admin/domain/' + item.domain_id}>{item.domain_id}</a>
    }, {
      title: __.describe,
      content: item.description
    }, {
      title: __.status,
      content: item.enabled ? __.activated : __.inactive
    }];

    return items;
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
    var that = this;
    switch(actionType) {
      case 'edit_name':
        var {item, rawItem, newName} = data;
        var quotaType = item.field;
        if (quotaType) {
          if (quotaType === 'ram') {
            newName *= 1024;
          }
          request.modifyQuota(quotaType, rawItem.id, newName).then((res) => {
            this.refresh({
              loadingDetail: true,
              refreshList: true,
              refreshDetail: true
            });
          });
        } else {
          request.editProject(rawItem.id, {
            name: newName
          }).then((res) => {
            this.refresh({
              loadingDetail: true,
              refreshList: true,
              refreshDetail: true
            });
          });
        }
        break;
      case 'add_user':
        addUser(data.rawItem, null, function() {
          that.refresh({
            loadingDetail: true,
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'rmv_user':
        removeUser({
          project: data.rawItem,
          user: data.childItem
        }, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <div className="halo-module-project" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }
}

module.exports = Model;
