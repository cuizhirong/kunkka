require('./style/index.less');
const React = require('react');

function InstanceList (props) {
  const __ = props.__;
  return (
    <ul className="batch-migrate-list">
      {
        props.instances.map((instance) => {
          return (
            <li key={instance.id}>
              <div>
                <span>{ __.instance }</span>
                <i className="glyphicon icon-instance"></i>
                <span>{ instance.name }</span>
              </div>
              <div>
                <span>{ __.project_name }</span>
                <span>{ instance.project_name }</span>
              </div>
            </li>
          );
        })
      }
    </ul>
  );
}

module.exports = InstanceList;
