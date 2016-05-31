require('./style/index.less');

//react components
var React = require('react');
var RSVP = require('rsvp');
var Main = require('../../components/main/index');
var {Button} = require('client/uskin/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var deleteModal = require('client/components/modal_delete/index');
var createUserGroup = require('./pop/create/index');
var addRole = require('./pop/add_role/index');
var addUser = require('./pop/add_user/index');
var removeRole = require('./pop/remove_role/index');
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
        case 'domain':
          column.render = (col, item, i) => {
            return <a key={item.domain_id} data-type="router" href={'/admin/domain/' + item.domain_id}>{item.domain_id}</a>;
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getSingle(id) {
    this.clearState();

    var table = this.state.config.table;
    request.getGroupByID(id).then((res) => {
      if (res.group) {
        table.data = [res.group];
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url, true, () => {
        var pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getList() {
    this.clearState();

    var table = this.state.config.table;
    request.getList(table.limit).then((res) => {
      table.data = res.groups;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url, refreshDetail) {
    var table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.groups) {
        table.data = res.groups;
      } else if (res.group) {
        table.data = [res.group];
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

  getInitialListData() {
    this.getList();
  }

  searchByKey(key, data) {
    var deferredList = [];
    data.dataList = [];

    deferredList.push(request.getGroupByID(key).then(res => {
      if(data.dataList.length > 0 && res.group) {
        data.dataList.forEach(item => {
          if(item.id !== res.group.id) {
            data.dataList.push(res.group);
          }
        });
      } else if(res.group) {
        data.dataList.push(res.group);
      }
    }));
    deferredList.push(request.getGroups().then(res => {
      var matchData = [];
      if(res.groups) {
        res.groups.forEach(obj => {
          var reg = new RegExp(key, 'i');
          if(reg.test(obj.name)) {
            matchData.push(obj);
          }
        });
      }
      if(data.dataList.length > 0) {
        data.dataList.forEach(item => {
          matchData.forEach(ele => {
            if(item.id !== ele.id) {
              data.dataList.push(ele);
            }
          });
        });
      } else {
        data.dataList.push(...matchData);
      }
    }));

    return RSVP.all(deferredList);
  }

  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      var table = this.state.config.table;

      if (data.text) {
        this.searchByKey(data.text, data).then(res => {
          table.data = data.dataList;
          table.pagination = {};
          this.updateTableData(table, res._url);
        });
      } else {
        this.getList();
        table.pagination = {};
      }
    }
  }

  updateTableData(table, currentUrl, refreshDetail, callback) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      if (currentUrl) {
        this.stores.urls.push(currentUrl.split('/v3/')[1]);

        var detail = this.refs.dashboard.refs.detail,
          params = this.props.params;
        if (detail && refreshDetail && params.length > 2) {
          detail.refresh();
        }

        callback && callback();
      }
    });
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
        createUserGroup(null, null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'modify_group':
        createUserGroup(rows[0], null, function(_data) {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'user-group',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteItem(rows).then((res) => {
              cb(true);
              that.refresh({
                refreshList: true
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

    for(let key in btns) {
      switch (key) {
        case 'modify_group':
          btns[key].disabled = !singleRow;
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
          request.getUsers(rows[0].id).then((res) => {
            var userConfig = this.getUserConfig(rows[0], res.users);
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
        }
        break;
      case 'role':
        if (rows.length === 1) {
          syncUpdate = false;
          request.getRoleAssignments(rows[0]).then((assignments) => {
            request.getGroupRoles(assignments).then((res) => {
              var domainRoleConfig = this.getDomainRoleConfig(rows[0], res.domainRoles);
              var projectRoleConfig = this.getProjectRoleConfig(rows[0], res.projectRoles);
              contents[tabKey] = (
                <div>
                  <DetailMinitable
                    __={__}
                    title={__.domain + __.role}
                    defaultUnfold={true}
                    tableConfig={domainRoleConfig ? domainRoleConfig : []}>
                    <Button value={__.add + __.role} onClick={this.onDetailAction.bind(this, 'description', 'add_domain_role', {
                      rawItem: rows[0]
                    })}/>
                  </DetailMinitable>
                  <DetailMinitable
                    __={__}
                    title={__.project + __.role}
                    defaultUnfold={true}
                    tableConfig={projectRoleConfig ? projectRoleConfig : []}>
                    <Button value={__.add + __.role} onClick={this.onDetailAction.bind(this, 'description', 'add_project_role', {
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

  getUserConfig(item, users) {
    var dataContent = [];
    users.forEach((element, index) => {
      var dataObj = {
        id: element.id,
        name: <a data-type="router" href={'/admin/user/' + element.id}>{element.name || '(' + element.id.substring(0, 8) + ')'}</a>,
        email: element.email,
        status: element.enabled ? __.activated : __.inactive,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_user', {
          rawItem: item,
          childItem: element
        })} />
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

  getDomainRoleConfig(item, dRoles) {
    var dataContent = [];
    var getRoles = function(element) {
      var roles = [];
      element.forEach((r, index) => {
        if (index > 0) {
          roles.push(', ');
        }
        roles.push(<a data-type="router" key={r.id} href={'/admin/role/' + r.id}>{r.name}</a>);
      });
      return roles;
    };
    for (var key in dRoles) {
      var element = dRoles[key];
      var dataObj = {
        id: key,
        name: <a data-type="router" href={'/admin/domain/' + key}>{'(' + key.substring(0, 8) + ')'}</a>,
        role: <div>{getRoles(element)}</div>,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_domain_role', {
          rawItem: item,
          childItem: element,
          domain_id: key
        })} />
      };
      dataContent.push(dataObj);
    }

    var tableConfig = {
      column: [{
        title: __.domain,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.role,
        key: 'role',
        dataIndex: 'role'
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

  getProjectRoleConfig(item, pRoles) {
    var dataContent = [];
    var getRoles = function(element) {
      var roles = [];
      element.forEach((r, index) => {
        if (index > 0) {
          roles.push(', ');
        }
        roles.push(<a data-type="router" key={r.id} href={'/admin/role/' + r.id}>{r.name}</a>);
      });
      return roles;
    };
    for (var key in pRoles) {
      var element = pRoles[key];
      var dataObj = {
        id: key,
        name: <a data-type="router" href={'/admin/project/' + key}>{'(' + key.substring(0, 8) + ')'}</a>,
        role: <div>{getRoles(element)}</div>,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_project_role', {
          rawItem: item,
          childItem: element,
          project_id: key
        })} />
      };
      dataContent.push(dataObj);
    }

    var tableConfig = {
      column: [{
        title: __.project,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.role,
        key: 'role',
        dataIndex: 'role'
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

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.describe,
      content: item.description
    }, {
      title: __.domain,
      content: item.domain_id
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
        var {rawItem, newName} = data;
        request.editGroup(rawItem.id, {
          name: newName
        }).then((res) => {
          this.refresh({
            loadingDetail: true,
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'add_domain_role':
        addRole('domain', data.rawItem, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'add_project_role':
        addRole('project', data.rawItem, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'rmv_domain_role':
        removeRole('domain', data, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'rmv_project_role':
        removeRole('project', data, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'add_user':
        addUser(data.rawItem, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'rmv_user':
        removeUser(data, null, function() {
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
      <div className="halo-module-user-group" style={this.props.style}>
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
