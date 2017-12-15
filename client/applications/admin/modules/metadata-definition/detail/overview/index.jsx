require('./style/index.less');

const React = require('react');
const getTime = require('client/utils/time_unification');

function Overview(props) {
  const __ = props.__;
  const ns = props.namespace;
  const baseInfo = [{
    title: __.display_name,
    key: 'display_name',
    content: ns.display_name || ''
  }, {
    title: __.namespace,
    key: 'namespace',
    content: ns.namespace
  }, {
    title: __.description,
    key: 'description',
    content: ns.description || ''
  }, {
    title: __.public,
    key: 'visibility',
    content: ns.visibility === 'public' ? __.yes : __.no
  }, {
    title: __.protected,
    key: 'protected',
    content: ns.protected ? __.yes : __.no
  }, {
    title: __.created_date,
    key: 'created',
    content: ns.created_at ? getTime(ns.created_at) : ''
  }, {
    title: __.updated_date,
    key: 'updated',
    content: ns.updated_at ? getTime(ns.updated_at) : ''
  }];

  const resourceTypeInfo = [];
  if(Array.isArray(ns.resource_type_associations)) {
    ns.resource_type_associations.forEach((resource, index) => {
      resourceTypeInfo.push({
        key: String(index),
        type: resource.name,
        prefix: resource.prefix !== undefined ? resource.prefix : __.none,
        target: resource.properties_target !== undefined ? resource.properties_target : __.none
      });
    });
  }

  return (
    <div className="overview-container">
      <ul className="overview">
        { baseInfo.map((info) => {
          return (
            <li className="info-row clearfix" key={info.key}>
              <div className="info-title">{info.title}</div>
              <div className="content">{info.content}</div>
            </li>
          );
        }) }
      </ul>
      <div className="associated-resource">
        <div className="title">{__.associcated_resource}</div>
        <ul className="resource-types">
          { resourceTypeInfo.map((resource) => {
            return (
              <li className="type-row clearfix" key={resource.key}>
                <div className="type-title">{resource.type}</div>
                <div>
                  <div className="resource-prefix">
                    { __.prefix + ': ' + resource.prefix }
                  </div>
                  <div className="prop-target">
                    { __.property_target + ': ' + resource.target }
                  </div>
                </div>
              </li>
            );
          }) }
        </ul>
      </div>
    </div>
  );
}

module.exports = Overview;
