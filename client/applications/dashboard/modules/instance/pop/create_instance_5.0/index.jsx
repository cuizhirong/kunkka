require('./style/index.less');

const React = require('react');
const ReactDOM = require('react-dom');
const Base = require('./base');

const router = require('client/utils/router');

function modal(obj, parent, callback) {

  let container = null;

  (function() {
    let doc = document,
      root = doc.getElementById('main');

    if (!root) {
      root = doc.createElement('div');
      root.id = 'main';

      doc.body.appendChild(root);
    }
    container = doc.createElement('div');
    root.appendChild(container);
  })();

  function destory() {
    ReactDOM.unmountComponentAtNode(container);
    if (container.parentNode) container.parentNode.removeChild(container);
    router.removeListener('changeState', destory);
  }

  function onAfterClose() {
    destory();
  }

  router.on('changeState', destory);

  let _props = {
    onAfterClose: onAfterClose,
    parent: parent,
    obj: obj,
    callback: callback
  };

  return ReactDOM.render(<Base {..._props}/>, container);
}

module.exports = modal;
