const Base = require('../global-billing-record/model');
const popExport = require('./pop/export/index');
const config = require('./config.json');

class Model extends Base {

  constructor(props) {
    super(props);

    this.state = {
      config: config,
      upLoading: true,
      total: {},
      resources: [],
      current: '',
      searchType: 'name',
      hasQuery: false,
      currentProjectId: HALO.user.projectId
    };
  }

  onExport() {
    popExport();
  }
}

module.exports = Model;
