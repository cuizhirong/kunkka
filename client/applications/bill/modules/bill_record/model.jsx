require('./style/index.less');

var React = require('react');
var Record = require('./record/index');

// var request = require('./request');
var config = require('./config.json');
var moment = require('client/libs/moment');
var getStatusIcon = require('../../utils/status_icon');

var __ = require('locale/client/bill.lang.json');

class Model extends React.Component {

  constructor(props) {
    super(props);

    moment.locale(HALO.configs.lang);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction', 'tableColRender'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentDidMount() {
    this.onInitialize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && nextState.props.style.display === 'none') {
      return false;
    }
    return true;
  }

  tableColRender(columns) {
    columns.map((column) => {
      switch (column.key) {
        default:
          break;
      }
    });
  }

  onInitialize() {
    this.getProjectRegion();
    this.getTableData();
  }

  getProjectRegion() {
    //fake data
    var projects = [{
      id: '1',
      name: 'pro1'
    }, {
      id: '2',
      name: 'pro2'
    }];

    projects.unshift({
      id: 'all_project',
      name: __.all + __.project
    });

    var regions = HALO.region_list;

    regions.unshift({
      id: 'all_region',
      name: __.all + __.region
    });

    var selectList = this.refs.record.refs.select_list;
    selectList.setState({
      _projects: projects,
      project: projects[0],
      _regions: regions,
      region: regions[0]
    });
  }

  getTableData() {
    //fake data
    var data = [{
      resource_name: 'name1',
      id: '1',
      resource_id: 'id1',
      status: 'deleted',
      total_price: '10.111',
      unit_price: '11.111',
      region: 'region1',
      created_at: '2016-06-06T02:26:41Z'
    }, {
      resource_name: 'name2',
      id: '2',
      resource_id: 'id2',
      status: 'deleted',
      total_price: '20.222',
      unit_price: '22.222',
      region: 'region2',
      created_at: '2016-06-06T02:26:41Z'
    }, {
      resource_name: 'name3',
      id: '3',
      resource_id: 'id3',
      status: 'deleted',
      total_price: '30.333',
      unit_price: '33.333',
      region: 'region3',
      created_at: '2016-06-06T02:26:41Z'
    }, {
      resource_name: 'name4',
      id: '4',
      resource_id: 'id4',
      status: 'deleted',
      total_price: '40.444',
      unit_price: '44.444',
      region: 'region1',
      created_at: '2016-06-06T02:26:41Z'
    }];

    var newConfig = this.state.config;
    var table = newConfig.table;
    table.data = data;
    table.loading = false;
    table.pagination = {
      current: 1,
      total: 7
    };

    this.setState({
      config: newConfig
    });

    // var table = this.refs.record.refs.table;
    // table.setState({
      // data: data,
      // loading: false
    // });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'select_list':
        this.onClickSelectList(actionType, refs, data);
        break;
      case 'detail':
        if (actionType === 'open') {
          this.openDetail(refs, data.data);
        } else {
          this.onNextDetailPage(refs, data);
        }
        break;
      case 'pagination':
        this.onNextPage(refs, data);
        break;
      default:
        break;
    }
  }

  onClickSelectList(key, refs, data) {
    switch (key) {
      case 'search':
        console.log('search', data);
        break;
      case 'reset':
        console.log('reset', data);
        break;
      default:
        break;
    }
  }

  openDetail(refs, item) {
    console.log('click captain', item);
    var content = refs.detail.state.content;

    if (item.id === '1') {
      content.table.data = [{
        id: '1',
        end_time: '2016-03-31T23:03:56Z',
        remarks: 'Hourly Billing',
        resource_id: '2ff15905-670e-46a9-86e0-c57d01c4a651',
        start_time: '2016-03-31T22:03:56Z',
        total_price: '11111',
        unit: 'hour',
        unit_price: '11111'
      }, {
        id: '2',
        end_time: '2016-03-31T23:03:56Z',
        remarks: 'Hourly Billing',
        resource_id: '2ff15905-670e-46a9-86e0-c57d01c4a651',
        start_time: '2016-03-31T22:03:56Z',
        total_price: '11111',
        unit: 'hour',
        unit_price: '11111'
      }];
      content.pagination = {
        current: 1,
        total: 4
      };
    } else if (item.id === '2') {
      content.table.data = [{
        id: '1',
        end_time: '2016-03-31T23:03:56Z',
        remarks: 'Hourly Billing',
        resource_id: '2ff15905-670e-46a9-86e0-c57d01c4a651',
        start_time: '2016-03-31T22:03:56Z',
        total_price: '22222',
        unit: 'hour',
        unit_price: '22222'
      }, {
        id: '2',
        end_time: '2016-03-31T23:03:56Z',
        remarks: 'Hourly Billing',
        resource_id: '2ff15905-670e-46a9-86e0-c57d01c4a651',
        start_time: '2016-03-31T22:03:56Z',
        total_price: '22222',
        unit: 'hour',
        unit_price: '22222'
      }];
      content.pagination = null;
    }

    refs.detail.setState({
      content: content
    });
  }

  onNextDetailPage(refs, data) {
    console.log('on next detail page', data.page, data.item);
  }

  onNextPage(refs, page) {
    console.log('on Next Page', page);
  }

  render() {
    return (
      <div className="halo-module-record" style={this.props.style}>
        <Record
          ref="record"
          config={this.state.config}
          visible={this.props.style}
          onAction={this.onAction}
          getStatusIcon={getStatusIcon} />
      </div>
    );
  }
}

module.exports = Model;
