'use strict';
const qs = require('querystring');
const co = require('co');
const request = require('superagent');
const csv = require('json2csv');
const _ = require('lodash');

const getQueryString = require('helpers/getQueryString.js');
const csvElements = require('./csv.elements');
const drivers = require('drivers');
const extraRequests = {
  project: (session) => {
    return drivers.keystone.project.listProjectsAsync(
      session.user.token,
      session.endpoint.keystone[session.user.regionId]
    );
  },
  user: (session, domainId) => {
    return drivers.keystone.user.listUsersAsync(
      session.user.token,
      session.endpoint.keystone[session.user.regionId],
      domainId ? {domain_id: domainId} : {}
    );
  },
  flavor: (session) => {
    return drivers.nova.flavor.listFlavorsAsync(
      session.user.projectId,
      session.user.token,
      session.endpoint.nova[session.user.regionId]
    );
  },
  image: (session) => {
    return drivers.glance.image.listImagesAsync(
      session.user.token,
      session.endpoint.glance[session.user.regionId]
    );
  },
  volume: (session) => {
    return drivers.cinder.volume.listVolumesAsync(
      session.user.projectId,
      session.user.token,
      session.endpoint.cinder[session.user.regionId],
      {all_tenants: 1}
    );
  }
};
function listImageRecursive(query, marker, token, remote, images) {
  return co(function *() {
    query = query || {};
    marker ? query.marker = marker : delete query.marker;
    let result = (yield drivers.glance.image.listImagesAsync(token, remote, query)).body;
    images.push.apply(images, result.images);
    if (result.next) {
      yield listImageRecursive(query, qs.parse(result.next.split('?')[1]).marker, token, remote, images);
    }
  });
}

module.exports.fields = (req, res, next) => {
  let fields, path = req.path.slice(17);
  const __ = req.i18n.__.bind(req.i18n);
  csvElements.some(o => path === o.name && (fields = o.fields));
  if (!fields) {
    res.status(404).send({error: 'Not Found'});
  } else {
    res.send({
      fields: fields.map(f => {
        return typeof f.value === 'string'
          ? {label: __(f.label), name: f.value}
          : {label: __(f.label), name: f.name};
      })
    });
  }
};

/**
 * all_tenants=1
 * tenant_id=
 * start_time=
 * end_time=
 * user_id=
 * fields=name,size,value
 * filename
 */
const customFields = ['filename', 'fields', 'user_id', 'start_time', 'end_time', 'tenant_id'];
module.exports.data = (req, res, next) => {
  co(function *() {
    const __ = req.i18n.__.bind(req.i18n);
    const path = req.path.slice(10);
    const remote = req.session.endpoint;
    const region = req.session.user.regionId;
    const pathSplit = req.path.split('/');
    const service = pathSplit[3];
    const target = remote[service][region] + '/' + pathSplit.slice(4).join('/');
    const query = req.query;
    const domainId = query.domain_id;
    delete query.domain_id;
    const paramsToOpenStack = _.omit(query, customFields);
    let queryFields = query.fields;
    delete query.fields;
    const requests = {major: null};
    if (pathSplit[5] === 'images') {
      paramsToOpenStack.limit = 9999;
      requests.major = {body: {images: []}};
      yield listImageRecursive(paramsToOpenStack, '', req.session.user.token, remote[service][region], requests.major.body.images);
    } else {
      requests.major = request.get(target + getQueryString(paramsToOpenStack)).set('X-Auth-Token', req.session.user.token);
    }
    //custom fields
    queryFields = queryFields ? queryFields.split(',').filter(f => f) : [];
    //final fields
    const fields = [];

    let obj;
    csvElements.some(o => ((o.pathRegExp.test(path)) && (obj = o)));
    if (!obj) {
      return Promise.reject({status: 404, message: 'Not Found'});
    }
    if (queryFields.length) {
      obj.fields.forEach(field => {
        if (queryFields.indexOf(typeof field.value === 'string' ? field.value : field.name) > -1) {
          fields.push({
            label: __(field.label),
            value: field.value
          });
          if (field.extra) {
            field.extra.forEach(e => {
              fields.push({
                label: __(e.label),
                value: e.value
              });
              if (!requests[e.name]) {
                requests[e.name] = {
                  idKey: field.value,
                  data: extraRequests[e.name](req.session, domainId)
                };
              }
            });
          }
        }
      });
    } else {
      obj.fields.forEach(field => {
        fields.push({
          label: __(field.label),
          value: field.value
        });
        if (field.extra) {
          field.extra.forEach(e => {
            fields.push({
              label: __(e.label),
              value: e.value
            });
            if (!requests[e.name]) {
              requests[e.name] = {
                idKey: field.value,
                data: extraRequests[e.name](req.session, domainId)
              };
            }
          });
        }
      });
    }

    const results = yield requests,
      extraData = {},
      extraKeys = Object.keys(results).filter(key => key !== 'major' && (extraData[key] = {}));

    extraKeys.forEach(key => {
      results[key].data.body[key + 's'].forEach(d => {
        extraData[key][d.id] = d;
      });
    });

    let majorData = results.major.body[obj.dataName || obj.name];
    if (query.start_time || query.end_time || query.user_id || query.tenant_id) {
      let start = query.start_time ? new Date(parseInt(query.start_time, 10)).getTime() : -Infinity;
      let end = query.end_time ? new Date(parseInt(query.end_time, 10)).getTime() : Infinity;
      majorData = majorData.filter(d => {
        if (d.created_at || d.created) {
          let time = new Date(d.created_at || d.created).getTime();
          if (time < start || time > end) {
            return false;
          }
        }
        if(query.user_id && d.user_id && query.user_id !== d.user_id){
          return false;
        }
        if(query.tenant_id && d[obj.tenantKey] && query.tenant_id !== d[obj.tenantKey]){
          return false;
        }
        return true;
      });
    }
    if (extraKeys.length) {
      majorData.forEach(d => {
        if (extraData.project) {
          try {
            d.tenantName = extraData.project[d[results.project.idKey]].name;
          } catch (e) {
            d.tenantName = '';
          }
        }
        if (extraData.user) {
          try {
            d.userName = extraData.user[d.user_id].name;
          } catch (e) {
            d.userName = '';
          }
        }
        if (extraData.image) {
          try {
            d.imageName = extraData.image[d.image.id].name;
          } catch (e) {
            d.imageName = '';
          }
        }
        if (extraData.volume) {

          let volumes = d['os-extended-volumes:volumes_attached'] || [];
          let volumeNew = [];
          d.volumeCount = volumes.length;
          d.volumeSize = 0;
          volumes.forEach(v => {
            v = extraData.volume[v.id];
            volumeNew.push(v.name || v.id);
            d.volumeSize += v.size;
          });
          d.volumeSize += ' GB';
          d['os-extended-volumes:volumes_attached'] = volumeNew.join();
        }
        if (extraData.flavor && d.flavor && extraData.flavor[d.flavor.id]) {
          let flavor = extraData.flavor[d.flavor.id];
          d.flavorName = flavor.name;
          d.flavorCPU = flavor.vcpus;
          d.flavorRAM = (parseInt(flavor.ram, 10) / 1024).toFixed(2) + ' GB';
        }
      });
    }
    res.setHeader('Content-Description', 'File Transfer');
    res.setHeader('Content-Type', 'application/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=' + (query.filename || obj.name) + '.csv');
    res.setHeader('Expires', '0');
    res.setHeader('Cache-Control', 'must-revalidate');
    res.send(csv({data: majorData, fields}));
  }).catch(next);
};
