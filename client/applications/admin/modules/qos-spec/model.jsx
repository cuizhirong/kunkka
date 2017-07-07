var React = require('react');
var Main = require('client/components/main_paged/model');
var BasicProps = require('client/components/basic_props/index');
var deleteModal = require('client/components/modal_delete/index');

var createQosSpec = require('./pop/create');
var editConsumer = require('./pop/edit_consumer');
var editSpecs = require('./pop/edit_specs');

var config = require('./config.json');
var __ = require('locale/client/admin.lang.json');
var request = require('./request');
var getStatusIcon = require('../../utils/status_icon');

class Model extends Main {

  constructor(props) {
    super(props);

    this.state = {
      config: config
    };

    this.lang = __;
    this.getStatusIcon = getStatusIcon;
  }

  tableColRender() {
    let columns = this.state.config.table.column;

    columns.map((column) => {
      switch (column.key) {
        case 'is_public':
          column.render = (col, item, i) => {
            return item.is_public ? __.true : __.false;
          };
          break;
        default:
          break;
      }
    });
  }

  getList() {
    this.clearState();

    var table = this.state.config.table;
    request.getList().then((res) => {
      table.data = res.qos_specs;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getSingle(id) {
    this.clearState();

    var table = this.state.config.table;
    request.getSingle(id).then((res) => {
      table.data = [res.qos_specs];
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url) {
    var table = this.state.config.table;
    request.getNextList(url).then((res) => {
      if (Array.isArray(res.qos_specs)) {
        table.data = res.qos_specs;
      } else if (res.qos_specs && res.qos_specs.id) {
        table.data = [res.qos_specs];
      } else {
        table.data = [];
      }
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;

    switch (key) {
      case 'create':
        createQosSpec(null, null, () => {
          this.defaultRefresh();
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'qos-spec',
          data: rows,
          onDelete: function(_data, cb) {
            let ids = rows.map((ele) => ele.id);

            request.deleteQosSpecs(ids).then((res) => {
              that.defaultRefresh();
              cb(true);
            });
          }
        });
        break;
      case 'edit_consumer':
        editConsumer(rows[0], null, () => {
          this.defaultRefresh();
        });
        break;
      case 'edit_specs':
        editSpecs(rows[0], null, () => {
          this.defaultRefresh();
        });
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(refs, data) {
    var {rows} = data,
      btnList = refs.btnList,
      btns = btnList.state.btns;

    btnList.setState({
      btns: this.btnListRender(rows, btns)
    });
  }

  btnListRender(rows, btns) {
    var len = rows.length;

    btns.delete.disabled = !(len > 0);
    btns.edit_consumer.disabled = !(len === 1);
    btns.edit_specs.disabled = !(len === 1);

    return btns;
  }

  onClickTable(actionType, refs, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(refs, data);
        break;
      case 'pagination':
        var url,
          history = this.stores.urls;

        if (data.direction === 'prev'){
          history.pop();
          if (history.length > 0) {
            url = history.pop();
          }
        } else if (data.direction === 'next') {
          url = data.url;
        } else {//default
          url = this.stores.urls[0];
          this.clearState();
        }

        this.loadingTable();
        this.getNextListData(url);
        break;
      default:
        break;
    }
  }

  onClickDetailTabs(tabKey, refs, data, server) {
    var {rows} = data;
    var detail = refs.detail;
    var contents = detail.state.contents;

    switch(tabKey) {
      case 'description':
        if (rows.length === 1) {
          var basicPropsItem = this.getBasicPropsItems(rows[0], server);

          contents[tabKey] = (
            <div>
              <BasicProps
                title={__.basic + __.properties}
                defaultUnfold={true}
                tabKey={'description'}
                items={basicPropsItem}
                rawItem={rows[0]}
                onAction={this.onDetailAction.bind(this)}
                dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
            </div>
          );
          detail.setState({
            contents: contents,
            loading: false
          });
        }
        break;
      default:
        break;
    }
  }

  getBasicPropsItems(item, server) {
    let specs = Object.keys(item.specs);

    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substr(0, 8) + ')'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.consumer,
      content: item.consumer
    }, {
      title: __.specs,
      content: (
        <div>
          {
            specs.length > 0 ?
              specs.map((key) =>
                <div key={key}>{key + ' = ' + item.specs[key]}</div>
              )
            : '-'
          }
        </div>
      )
    }];

    return items;
  }

  onDetailAction(tabKey, actionType, data) {
    switch(tabKey) {
      case 'description':
        this.onDescriptionAction(actionType, data);
        break;
      default:
        break;
    }
  }

  onDescriptionAction(actionType, data) {
    switch(actionType) {
      default:
        break;
    }
  }

}

module.exports = Model;
