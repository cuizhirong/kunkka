require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const {Button} = require('client/uskin/index');
const BasicProps = require('client/components/basic_props/index');
const DetailMinitable = require('client/components/detail_minitable/index');

const deleteModal = require('client/components/modal_delete/index');
const createUser = require('./pop/create/index');
const activateUser = require('./pop/activate/index');
const deactivateUser = require('./pop/deactivate/index');
const addRole = require('./pop/add_role/index');
const removeRole = require('./pop/remove_role/index');
const modifyProject = require('./pop/modify_project/index');
const resetPassword = require('./pop/reset_password/index');
const joinGroup = require('./pop/join_group/index');
const leaveGroup = require('./pop/leave_group/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/admin.lang.json');
const getStatusIcon = require('../../utils/status_icon');
// let router = require('client/utils/router');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config,
      domains: []
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });

    this.stores = {
      urls: []
    };
  }

  componentWillMount() {
    let that = this;
    this.tableColRender(this.state.config.table.column);
    request.getDomains().then((res) => {
      that.setState({
        domains: res
      });
    });
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
        case 'project':
          column.render = (col, item, i) => {
            let projectId = item.default_project_id;
            return projectId ?
              <a data-type="router" key={projectId} href={'/admin/project/' + projectId}>{'(' + projectId.substring(0, 8) + ')'}</a> : '';
          };
          break;
        default:
          break;
      }
    });
  }

  onInitialize(params) {
    this.clearState();

    if (params[2]) {
      this.getSingle(params[2]);
    } else {
      this.getList();
    }
  }

  getSingle(id) {
    this.clearState();

    let table = this.state.config.table;
    let filter = this.state.config.filter;
    request.getUserByID(id).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }
      this.setPagination(table, res);
      this.initializeFilter(filter);
      this.updateTableData(table, res._url/*, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      }*/);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, res._url);
    });
  }

  getList() {
    this.clearState();

    let table = this.state.config.table;
    let filter = this.state.config.filter;
    request.getList(table.limit).then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
      this.initializeFilter(filter);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, res._url);
    });
  }

  getFilterList(data) {
    this.clearState();

    let table = this.state.config.table;
    request.getFilteredList(data, table.limit).then((res) => {
      table.data = res.list;
      this.setPagination(table, res);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url, refreshDetail) {
    let table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }
      this.setPagination(table, res);
      this.updateTableData(table, res._url/*, refreshDetail*/);
    }).catch((res) => {
      table.data = [];
      table.pagination = null;
      this.updateTableData(table, res._url);
    });
  }

  getInitialListData() {
    this.getList();
  }

  initializeFilter(filters) {
    let enableLdap = HALO.settings.enable_ldap;
    config.filter[1].items[1].default = enableLdap ? 'Defalut' : __.all + __.domain;
    let domains = [];
    this.state.domains.forEach((item) => {
      domains.push({
        id: item.id,
        name: item.name
      });
    });
    filters[1].items[1].data = domains;
  }

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      let userID = data.user,
        allTenant = data.all_tenant;

      if (userID) {
        this.getSingle(userID.id);
      } else if (allTenant) {
        this.getFilterList(allTenant);
      } else {
        this.getList();
      }
    }
  }

  updateTableData(table, currentUrl/*, refreshDetail, callback*/) {
    let newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      if (currentUrl) {
        this.stores.urls.push(currentUrl);

        let detail = this.refs.dashboard.refs.detail,
          params = this.props.params;
        if (detail && /*refreshDetail &&*/ params.length > 2) {
          detail.refresh();
        }
        // callback && callback();
      }
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

    let dashboard = this.refs.dashboard;
    if (dashboard) {
      dashboard.clearState();
    }
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
    let {rows} = data;

    let that = this;
    switch(key) {
      case 'create':
        createUser(null, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'activate_user':
        activateUser(rows[0], null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'deactivate_user':
        deactivateUser(rows[0], null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'modify_project':
        modifyProject(rows[0], null, function() {
          /*that.refresh({
            refreshList: true,
            refreshDetail: true
          });*/
        });
        break;
      case 'reset_password':
        resetPassword(rows[0], null, function() {
          /*that.refresh({
            refreshList: true,
            refreshDetail: true
          });*/
        });
        break;
      case 'modify_user':
        createUser(rows[0], null, function() {
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
          type: 'user',
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
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let singleRow = rows.length === 1;
    let status = singleRow ? rows[0].enabled : null;

    for(let key in btns) {
      switch (key) {
        case 'modify_project':
        case 'reset_password':
        case 'modify_user':
          btns[key].disabled = !singleRow;
          break;
        case 'activate_user':
          btns[key].disabled = !singleRow || status;
          break;
        case 'deactivate_user':
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
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          syncUpdate = false;
          request.getRelatedResource(rows[0].id).then((res) => {
            request.getDomainByID(rows[0].domain_id).then((_res) => {
              let DomainName = _res.domain.name;
              let basicPropsItem = this.getBasicPropsItems(rows[0], res[1].projects, DomainName);
              let groupConfig = this.getGroupConfig(rows[0], res[0].groups);
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
                  <DetailMinitable
                    __={__}
                    title={__['user-group']}
                    defaultUnfold={true}
                    tableConfig={groupConfig ? groupConfig : []}>
                    <Button value={__.join + __['user-group']} onClick={this.onDetailAction.bind(this, 'description', 'join_group', {
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
      case 'role':
        if (rows.length === 1) {
          syncUpdate = false;
          request.getRoleAssignments(rows[0]).then((assignments) => {
            request.getUserRoles(assignments).then((res) => {
              let domainRoleConfig = this.getDomainRoleConfig(rows[0], res.domainRoles);
              let projectRoleConfig = this.getProjectRoleConfig(rows[0], res.projectRoles);
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

  getDomainRoleConfig(item, dRoles) {
    let dataContent = [];
    let getRoles = function(element) {
      let roles = [];
      element.forEach((r, index) => {
        if (index > 0) {
          roles.push(', ');
        }
        roles.push(<a data-type="router" key={r.id} href={'/admin/role'}>{r.name}</a>);
      });
      return roles;
    };
    for (let key in dRoles) {
      let element = dRoles[key];
      let dataObj = {
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

    let tableConfig = {
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
    let dataContent = [];
    let getRoles = function(element) {
      let roles = [];
      element.forEach((r, index) => {
        if (index > 0) {
          roles.push(', ');
        }
        roles.push(<a data-type="router" key={r.id} href={'/admin/role'}>{r.name}</a>);
      });
      return roles;
    };
    for (let key in pRoles) {
      let element = pRoles[key];
      let dataObj = {
        id: element.id,
        name: <a data-type="router" href={'/admin/project/' + element.id}>{key}</a>,
        role: <div>{getRoles(element.roles)}</div>,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_project_role', {
          rawItem: item,
          childItem: element.roles,
          project_id: element.id
        })} />
      };
      dataContent.push(dataObj);
    }

    let tableConfig = {
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

  getGroupConfig(item, groups) {
    let dataContent = [];
    groups.forEach((element, index) => {
      let dataObj = {
        id: element.id,
        name: <a data-type="router" href={'/admin/user-group/' + element.id}>{element.name}</a>,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'leave_group', {
          rawItem: item,
          childItem: element
        })} />
      };
      dataContent.push(dataObj);
    });

    let tableConfig = {
      column: [{
        title: __['user-group'] + __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.id,
        key: 'id',
        dataIndex: 'id'
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

  getBasicPropsItems(item, originProjects, originDomain) {
    let projects = [];
    if (originProjects && originProjects.length > 0) {
      originProjects.forEach((project, index) => {
        if (index > 0) {
          projects.push(', ');
        }
        projects.push(<a key={project.id} data-type="router" href={'/admin/project/' + project.id}>{project.name}</a>);
      });
    }

    let items = [{
      title: __.name,
      content: item.name,
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.domain,
      content: <a data-type="router" key={item.domain_id} href={'/admin/domain/' + item.domain_id}>{originDomain}</a>
    }, {
      title: __.describe,
      content: item.description
    }, {
      title: __.email,
      content: item.email
    }, {
      title: __.status,
      content: item.enabled ? __.activated : __.inactive
    }, {
      title: __.project,
      content: projects.length > 0 ? <span>{projects}</span> : '-'
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
    let that = this;
    switch(actionType) {
      case 'edit_name':
        let {rawItem, newName} = data;
        request.editUser(rawItem.id, {
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
      case 'add_project_role':
        addRole('project', data.rawItem, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'join_group':
        joinGroup(data.rawItem, null, function() {
          that.refresh({
            refreshList: true,
            refreshDetail: true
          });
        });
        break;
      case 'leave_group':
        leaveGroup(data, null, function() {
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
      <div className="halo-module-user" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          __={__}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }
}

module.exports = Model;
