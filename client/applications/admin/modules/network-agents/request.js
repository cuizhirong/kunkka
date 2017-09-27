const fetch = require('../../cores/fetch');
const RSVP = require('rsvp');
const Promise = RSVP.Promise;

function getFieldStr(fieldsArr) {
  let fieldStr = '';
  fieldsArr.forEach((field, i) => {
    if(i === 0) {
      fieldStr += 'fields=' + field;
    } else {
      fieldStr += '&fields=' + field;
    }
  });
  return fieldStr;
}

function normalizeRouters(resList) {
  const routers = resList[0].routers;
  const projects = resList[1].list;
  const networks = resList[2].networks;

  const projIdList = [];
  const projNameList = [];
  const netIdList = [];
  const netNameList = [];

  routers.forEach((router) => {
    let pId = router.project_id;
    let nId = router.external_gateway_info ? router.external_gateway_info.network_id : undefined;

    projIdList.push(pId);
    projNameList.push(undefined);

    netIdList.push(nId);
    netNameList.push(undefined);
  });

  projects.forEach((project) => {
    let index = projIdList.indexOf(project.id);

    if(index !== -1) {
      projIdList.forEach((pId, i) => {
        if(pId === project.id) {
          projNameList[i] = project.name;
        }
      });
    }
  });

  networks.forEach((network) => {
    let index = netIdList.indexOf(network.id);

    if(index !== -1) {
      netIdList.forEach((nId, i) => {
        if(nId === network.id) {
          netNameList[i] = network.name;
        }
      });
    }
  });

  routers.forEach((router, index) => {
    router.project_name = projNameList[index] ? projNameList[index] : '';
    router.network_name = netNameList[index] ? netNameList[index] : '-';
  });

  return routers;
}

module.exports = {
  getList: function() {
    let url = '/proxy/neutron/v2.0/agents';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getSingle: function(id) {
    let url = '/proxy/neutron/v2.0/agents?id=' + id;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNormalizedRouters: function() {
    const promises = [this.getRouters(),
                      this.getProjects(),
                      this.getNetworks()];

    return Promise.all(promises).then(resList => {
      return normalizeRouters(resList);
    });
  },
  getRouters: function() {
    const fieldsArr = ['id',
                       'name',
                       'admin_state_up',
                       'status',
                       'project_id',
                       'external_gateway_info'];
    const query = getFieldStr(fieldsArr);
    let url = '/proxy/neutron/v2.0/routers?' + query;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getProjects: function() {
    let url = '/proxy-search/keystone/v3/projects';
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  },
  getNetworks: function() {
    const fieldsArr = ['id', 'name'];
    const query = getFieldStr(fieldsArr);
    let url = '/proxy/neutron/v2.0/networks?' + query;
    return fetch.get({
      url: url
    }).then((res) => {
      res._url = url;
      return res;
    });
  }
};
