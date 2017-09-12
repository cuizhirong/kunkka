require('./style/index.less');

const React = require('react');
const Main = require('client/components/main_paged/index');
const {Button} = require('client/uskin/index');
const BasicProps = require('client/components/basic_props/index');
const DetailMinitable = require('client/components/detail_minitable/index');

const deleteModal = require('client/components/modal_delete/index');
const createUserGroup = require('./pop/create/index');
const addRole = require('./pop/add_role/index');
const addUser = require('./pop/add_user/index');
const removeRole = require('./pop/remove_role/index');
const removeUser = require('./pop/remove_user/index');

const request = require('./request');
const config = require('./config.json');
const moment = require('client/libs/moment');
const __ = require('locale/client/admin.lang.json');
const getStatusIcon = require('../../utils/status_icon');
const router = require('client/utils/router');

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

    let table = this.state.config.table;
    let filter = this.state.config.filter;
    request.getGroupByID(id).then((res) => {
      if (res.list) {
        table.data = res.list;
      } else {
        table.data = [];
      }
      this.initializeFilter(filter);
      this.updateTableData(table, res._url, true, () => {
        let pathList = router.getPathList();
        router.replaceState('/admin/' + pathList.slice(1).join('/'), null, null, true);
      });
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getList() {
    this.clearState();

    let table = this.state.config.table;
    let filter = this.state.config.filter;
    request.getList(table.limit).then((res) => {
      table.data = res.list;
      this.initializeFilter(filter);
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
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

  getFilterList(data) {
    this.clearState();

    let table = this.state.config.table;
    request.getFilteredList(data, table.limit).then((res) => {
      table.data = res.list;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
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
      this.updateTableData(table, res._url, refreshDetail);
    });
  }

  getInitialListData() {
    this.getList();
  }

  // searchByKey(key, data) {
  //   let deferredList = [];
  //   data.dataList = [];

  //   deferredList.push(request.getGroupByID(key).then(res => {
  //     if(data.dataList.length > 0 && res.group) {
  //       data.dataList.forEach(item => {
  //         if(item.id !== res.group.id) {
  //           data.dataList.push(res.group);
  //         }
  //       });
  //     } else if(res.group) {
  //       data.dataList.push(res.group);
  //     }
  //   }));
  //   deferredList.push(request.getGroups().then(res => {
  //     let matchData = [];
  //     if(res.groups) {
  //       res.groups.forEach(obj => {
  //         let reg = new RegExp(key, 'i');
  //         if(reg.test(obj.name)) {
  //           matchData.push(obj);
  //         }
  //       });
  //     }
  //     if(data.dataList.length > 0) {
  //       data.dataList.forEach(item => {
  //         matchData.forEach(ele => {
  //           if(item.id !== ele.id) {
  //             data.dataList.push(ele);
  //           }
  //         });
  //       });
  //     } else {
  //       data.dataList.push(...matchData);
  //     }
  //   }));

  //   return RSVP.all(deferredList);
  // }

  onFilterSearch(actionType, refs, data) {
    if (actionType === 'search') {
      this.loadingTable();

      let usergroupID = data.user_group,
        allTenant = data.all_tenant;

      if (usergroupID) {
        this.getSingle(usergroupID.id);
      } else if (allTenant) {
        this.getFilterList(allTenant);
      } else {
        this.getList();
      }
    }
  }

  // onClickSearch(actionType, refs, data) {
  //   if (actionType === 'click') {
  //     this.loadingTable();
  //     let table = this.state.config.table;

  //     if (data.text) {
  //       this.searchByKey(data.text, data).then(res => {
  //         table.data = data.dataList;
  //         table.pagination = {};
  //         this.updateTableData(table, res._url);
  //       });
  //     } else {
  //       this.getList();
  //       table.pagination = {};
  //     }
  //   }
  // }

  updateTableData(table, currentUrl, refreshDetail, callback) {
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
    let {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    let singleRow = rows.length === 1;

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
    let {rows} = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
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
            let userConfig = this.getUserConfig(rows[0], res.users);
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

  getUserConfig(item, users) {
    let dataContent = [];
    users.forEach((element, index) => {
      let dataObj = {
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

    let tableConfig = {
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
    let dataContent = [];
    let getRoles = function(element) {
      let roles = [];
      element.forEach((r, index) => {
        if (index > 0) {
          roles.push(', ');
        }
        roles.push(<a data-type="router" key={r.id} href={'/admin/role/' + r.id}>{r.name}</a>);
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
        roles.push(<a data-type="router" key={r.id} href={'/admin/role/' + r.id}>{r.name}</a>);
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

  getBasicPropsItems(item) {
    let items = [{
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
      type: 'copy',
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
    let that = this;
    switch(actionType) {
      case 'edit_name':
        let {rawItem, newName} = data;
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
