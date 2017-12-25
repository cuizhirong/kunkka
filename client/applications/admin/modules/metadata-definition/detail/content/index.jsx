require('./style/index.less');

const React = require('react');

function Content(props) {
  const ns = props.namespace;
  return (
    <div className="namespace-content">
      <pre>{ JSON.stringify(ns, null, 2) }</pre>
    </div>
  );
}

module.exports = Content;
