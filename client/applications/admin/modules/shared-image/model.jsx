require('./style/index.less');

//react components
const React = require('react');
const Main = require('client/components/main/index');

//detail components
const BasicProps = require('client/components/basic_props/index');

//pop modal
const RelatedInstance = require('../image/detail/related_instance');
const updateStatus = require('./pop/update_status/index');
const image = require('../image/pop/create/index');

const config = require('./config.json');
const __ = require('locale/client/admin.lang.json');
const request = require('./request');
const router = require('client/utils/router');
const getStatusIcon = require('../../utils/status_icon');
const unitConverter = require('client/utils/unit_converter');
const getTime = require('client/utils/time_unification');

class Model extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    ['onInitialize', 'onAction'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    let columns = this.state.config.table.column;
    this.tableColRender(columns);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.style.display === 'none' && !nextState.config.table.loading) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.getTableData(false);
    }
  }

  tableColRender(column) {
    column.map((col) => {
      switch (col.key) {
        case 'name':
          col.formatter = (rcol, ritem, rindex) => {
            return this.getImageLabel(ritem);
          };
          break;
        case 'size':
          col.render = (rcol, ritem, rindex) => {
            let size = unitConverter(ritem.size);
            size.num = typeof size.num === 'number' ? size.num : 0;
            return size.num + ' ' + size.unit;
          };
          break;
        case 'type':
          col.render = (rcol, ritem, rindex) => {
            return __.image;
          };
          break;
        default:
          break;
      }
    });
  }

  getImageLabel(item) {
    let label = item.image_label && item.image_label.toLowerCase();
    let style = null;

    let imgURL = HALO.settings.default_image_url;
    if (imgURL) {
      style = {
        background: `url("${imgURL}") 0 0 no-repeat`,
        backgroundSize: '20px 20px'
      };
    }
    return (
      <div>
        <i className={'icon-image-default ' + label} style={style}/>
        {item.name}
      </div>
    );
  }

  onInitialize(params) {
    this.getTableData(false);
  }

  getTableData(detailRefresh) {
    request.getList().then((res) => {
      let _config = this.state.config;
      let table = _config.table;
      let data = res.filter((ele) => {
        return ele.owner !== HALO.user.projectId;
      });
      table.data = data;
      table.loading = false;

      let detail = this.refs.dashboard.refs.detail;
      if (detail && detail.state.loading) {
        detail.setState({
          loading: false
        });
      }

      this.setState({
        config: _config
      }, () => {
        if (detail && detailRefresh) {
          detail.refresh();
        }
      });
    });
  }

  onAction(field, actionType, refs, data) {
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, refs, data);
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

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    switch (key) {
      case 'modify_image':
        this.state.config.tabs.forEach(tab => {
          tab.default &&
          image({item: rows[0], type: tab.key}, null, () => {
            this.refresh({
              tableLoading: true,
              detailRefresh: true
            }, true);
          });
        });
        break;
      case 'update_status':
        updateStatus(null, null, () => {
          this.refresh({
            detailRefresh: true
          }, true);
        });
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          detailLoading: true,
          clearState: true,
          detailRefresh: true
        }, true);
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
    for (let key in btns) {
      switch (key) {
        case 'modify_image':
          btns[key].disabled = (rows.length === 1 && rows[0].status === 'active') ? false : true;
          break;
        default:
          break;
      }
    }

    return btns;
  }

  onClickDetailTabs(tabKey, refs, data) {
    let {
      rows
    } = data;
    let detail = refs.detail;
    let contents = detail.state.contents;
    let syncUpdate = true;

    let isAvailableView = (_rows) => {
      if (_rows.length > 1) {
        contents[tabKey] = (
          <div className="no-data-desc">
            <p>{__.view_is_unavailable}</p>
          </div>
        );
        return false;
      } else {
        return true;
      }
    };

    switch (tabKey) {
      case 'description':
        if (isAvailableView(rows)) {
          let basicPropsItem = this.getBasicPropsItems(rows[0]);
          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                items={basicPropsItem ? basicPropsItem : []} />
            </div>
          );
        }
        break;
      case 'instance':
        let insData = [], that = this, limit = 20, current = data.current || 1;
        syncUpdate = false;
        request.getInstances().then(instances => {
          instances.forEach(instance => {
            if (instance.image.id === rows[0].id) {
              insData.push(instance);
            }
          });
          let pagination = {
            current: current,
            total: Math.ceil(insData.length / limit),
            total_num: insData.length
          };
          let instanceConfig = this.getInstanceConfig(insData.slice((current - 1) * limit, current * limit), pagination);
          contents[tabKey] = (
            <RelatedInstance
              tableConfig={instanceConfig}
              onDetailAction={(actionType, _refs, _data) => {
                that.onClickDetailTabs('instance', refs, {
                  rows: rows,
                  current: _data.page
                });
              }}/>
          );

          detail.setState({
            contents: contents,
            loading: false
          });
        });
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

  getInstanceConfig(item, pagination) {
    let dataContent = [];
    for (let key in item) {
      let element = item[key];
      let dataObj = {
        name: <a data-type="router" href={'/admin/instance/' + element.id}>{element.name}</a>,
        id: element.id,
        status: getStatusIcon(element.status),
        created: getTime(element.created, false)
      };
      dataContent.push(dataObj);
    }
    let tableConfig = {
      column: [{
        title: __.name,
        key: 'name',
        dataIndex: 'name'
      }, {
        title: __.id,
        key: 'id',
        dataIndex: 'id'
      }, {
        title: __.status,
        key: 'status',
        dataIndex: 'status'
      }, {
        title: __.create + __.time,
        key: 'created',
        dataIndex: 'created'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true,
      pagination: pagination
    };

    return tableConfig;
  }

  getBasicPropsItems(item) {
    let name = this.getImageLabel(item);
    let size = unitConverter(item.size);

    let items = [{
      title: __.name,
      content: name
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.size,
      content: size.num + ' ' + size.unit
    }, {
      title: __.type,
      content: item.image_type === 'snapshot' ? __.instance_snapshot : __.image
    }, {
      title: __.checksum,
      content: item.checksum ? item.checksum : '-'
    }, {
      title: __.status,
      content: getStatusIcon(item.status)
    }, {
      title: __.create + __.time,
      type: 'time',
      content: item.created_at
    }, {
      title: __.update + __.time,
      type: 'time',
      content: item.updated_at
    }];

    if (HALO.settings.enable_approval && item.visibility === 'private') {
      items.push({
        title: __.owner,
        content: item.meta_owner ? item.meta_owner : '-'
      });
    }

    return items;
  }

  refresh(data) {
    if (data) {
      let path = router.getPathList();
      if (path[2]) {
        if (data.detailLoading) {
          this.refs.dashboard.refs.detail.loading();
        }
      } else {
        if (data.tableLoading) {
          this.loadingTable();
        }
        if (data.clearState) {
          this.refs.dashboard.clearState();
        }
      }
    }

    this.getTableData(data ? data.detailRefresh : false);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }

  render() {
    return (
      <div className="halo-module-image" style={this.props.style}>
        <Main
          ref="dashboard"
          visible={this.props.style.display === 'none' ? false : true}
          onInitialize={this.onInitialize}
          onAction={this.onAction}
          config={this.state.config}
          params={this.props.params}
          getStatusIcon={getStatusIcon}
          __={__} />
      </div>
    );
  }

}

module.exports = Model;
