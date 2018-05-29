const commonModal = require('client/components/modal_common/index');
const config = require('./config.json');
const request = require('../../request');

// const getErrorMessage = require('../../../../utils/error_message');

function pop(obj, parent, callback) {

  let props = {
    __: __,
    parent: parent,
    config: config,
    onInitialize: function(refs) {
    },
    onConfirm: function(refs, cb) {
      const startTime = refs.range_time.state.value.start;
      const endTime = refs.range_time.state.value.end;
      let data = {
        format: refs.format.state.value
      };
      if(startTime && endTime) {
        data.startTime = startTime;
        data.endTime = endTime;
      }
      if(refs.all_projects.state.checkedField === 'all_projects') {
        data.type = 'all_projects';
      } else {
        data.type = 'specified_project';
        data.id = refs.specified_project.state.value;
      }
      request.export(data).then(res => {
        callback && callback();
        cb(true);
      });
    },
    onAction: function(field, state, refs) {
      let disabled = true;
      if(refs.all_projects.state.checkedField === 'all_projects'
          || (refs.specified_project.state.checkedField === 'specified_project'
            && refs.specified_project.state.value)) {
        disabled = false;
      }
      switch(field) {
        case 'all_projects':
          refs.specified_project.setState({
            checkedField: state.checkedField
          });
          break;
        case 'specified_project':
          refs.all_projects.setState({
            checkedField: state.checkedField
          });
          refs.specified_project.setState({
            error: !state.value
          });
          break;
        default:
          break;
      }
      refs.btn.setState({
        disabled: disabled
      });
    }
  };

  commonModal(props);
}

module.exports = pop;
