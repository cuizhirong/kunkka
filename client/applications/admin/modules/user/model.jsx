require('./style/index.less');

//react components
var React = require('react');
var Main = require('../../components/main/index');
var {Button} = require('client/uskin/index');

//detail components
var BasicProps = require('client/components/basic_props/index');
var deleteModal = require('client/components/modal_delete/index');
var DetailMinitable = require('client/components/detail_minitable/index');
var createUser = require('./pop/create/index');
var activateUser = require('./pop/activate/index');
var deactivateUser = require('./pop/deactivate/index');
var addRole = require('./pop/add_role/index');
var removeRole = require('./pop/remove_role/index');
var modifyProject = require('./pop/modify_project/index');
var resetPassword = require('./pop/reset_password/index');

var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var __ = require('locale/client/admin.lang.json');
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
    var _config = this.state.config,
      table = _config.table;

    if (params[2]) {
      request.getUserByIDInitialize(params[2]).then((res) => {
        table.data = [res[0].user];
        this.updateTableData(table, res[0]._url);
      });
    } else {
      var pageLimit = this.state.config.table.limit;
      request.getListInitialize(pageLimit).then((res) => {
        var newTable = this.processTableData(table, res[0]);
        this.updateTableData(newTable, res[0]._url);
      });
    }
  }

//request: get single data(pathList[2] is server_id)
  getSingleData(userID) {
    request.getServerByID(userID).then((res) => {
      var table = this.state.config.table;
      table.data = [res.user];
      this.updateTableData(table, res._url);
    });
  }

//request: get list data(according to page limit)
  getInitialListData() {
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
      this.updateTableData(table, res._url);
    });
  }

//request: search request
  onClickSearch(actionType, refs, data) {
    if (actionType === 'click') {
      this.loadingTable();
      request.getUserByID(data.text).then((res) => {
        var table = this.state.config.table;
        table.data = [res.user];
        this.updateTableData(table, res._url);
      });
    }
  }

//rerender: update table data
  updateTableData(table, currentUrl, refreshDetail) {
    var newConfig = this.state.config;
    newConfig.table = table;
    newConfig.table.loading = false;

    this.setState({
      config: newConfig
    }, () => {
      this.stores.urls.push(currentUrl.split('/v3/')[1]);

      var detail = this.refs.dashboard.refs.detail,
        params = this.props.params;
      if (detail && refreshDetail && params.length > 2) {
        detail.refresh();
      }
    });
  }

//change table data structure: to record url history
  processTableData(table, res) {
    if (res.users) {
      table.data = res.users;
    } else if (res.user) {
      table.data = [res.user];
    }

    var pagination = {},
      next = res.links ? res.links.next : null;

    if (next) {
      pagination.nextUrl = next.href.split('/v3/')[1];
    }

    var history = this.stores.urls;

    if (history.length > 0) {
      pagination.prevUrl = history[history.length - 1];
    }
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

  clearState() {
    this.stores = {
      urls: []
    };
    this.refs.dashboard.clearState();
  }

//*********************************************//
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

        if (data.direction === 'next') {
          url = data.url;
        } else {
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
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
        var params = this.props.params,
          refreshData = {};

        if (params[2]) {
          refreshData.refreshList = true;
          refreshData.refreshDetail = true;
          refreshData.loadingTable = true;
          refreshData.loadingDetail = true;
        } else {
          refreshData.initialList = true;
          refreshData.loadingTable = true;
          refreshData.clearState = true;
        }

        this.refresh(refreshData, params);
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
          syncUpdate = false;
          request.getRelatedResource(rows[0].id).then((res) => {
            var basicPropsItem = this.getBasicPropsItems(rows[0], res[0].groups, res[1].projects);
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

            detail.setState({
              contents: contents,
              loading: false
            });
          });
        }
        break;
      case 'role':
        if (isAvailableView(rows)) {
          syncUpdate = false;
          request.getRoleAssignments(rows[0]).then((assignments) => {
            request.getUserRoles(assignments).then((res) => {
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

  getBasicPropsItems(item, originGroups, originProjects) {
    var groups = [],
      projects = [];
    if (originGroups && originGroups.length > 0) {
      originGroups.forEach((group, index) => {
        if (index > 0) {
          groups.push(', ');
        }
        groups.push(<a key={group.id} data-type="router" href={'/admin/user-group/' + group.id}>{group.name}</a>);
      });
    }
    if (originProjects && originProjects.length > 0) {
      originProjects.forEach((project, index) => {
        if (index > 0) {
          projects.push(', ');
        }
        projects.push(<a key={project.id} data-type="router" href={'/admin/project/' + project.id}>{project.name}</a>);
      });
    }

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
      title: __.email,
      content: item.email
    }, {
      title: __.status,
      content: item.enabled ? __.activated : __.inactive
    }, {
      title: __['user-group'],
      content: groups.length > 0 ? <span>{groups}</span> : '-'
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
    var that = this;
    switch(actionType) {
      case 'edit_name':
        var {rawItem, newName} = data;
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
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
        />
      </div>
    );
  }
}

module.exports = Model;
