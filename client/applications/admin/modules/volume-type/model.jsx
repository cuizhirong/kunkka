require('./style/index.less');

var React = require('react');
var Main = require('client/components/main_paged/model');
var BasicProps = require('client/components/basic_props/index');
var deleteModal = require('client/components/modal_delete/index');
var {Button} = require('uskin');

var createEncryption = require('./pop/create_encryption');
var createType = require('./pop/create');
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
        case 'associate_qos_spec':
          column.render = (col, item, i) => {
            return (
              item._qos_specs ?
                <a data-type="router" href={'/admin/qos-spec/' + item._qos_specs.id}>
                  {item._qos_specs ? item._qos_specs.name : '(' + item._qos_specs.id.substr(0, 8) + ')'}
                </a>
              : null
            );
          };
          break;
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
      table.data = res.volume_types;
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getSingle(volumeTypeID) {
    this.clearState();

    var table = this.state.config.table;

    request.getSingle(volumeTypeID).then((res) => {
      table.data = [res.volume_type];
      this.updateTableData(table, res._url);
    }).catch((res) => {
      table.data = [];
      this.updateTableData(table, res._url);
    });
  }

  getNextListData(url) {
    var table = this.state.config.table;

    request.getNextList(url).then((res) => {
      if (res.volume_types) {
        table.data = res.volume_types;
      } else if (res.volume_type) {
        table.data = [res.volume_type];
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
        createType(null, null, (res) => {
          this.defaultRefresh();
        });
        break;
      case 'create_encryption':
        createEncryption({ volumeType: rows[0] }, null, (res) => {
          this.defaultRefresh();
        });
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'volume-type',
          data: rows,
          onDelete: function(_data, cb) {
            let ids = rows.map((ele) => ele.id);

            request.deleteTypes(ids).then((res) => {
              that.defaultRefresh();
              cb(true);
            });
          }
        });
        break;
      case 'edit_extra_specs':
        editSpecs(rows[0], null, (res) => {
          this.defaultRefresh();
        });
        break;
      case 'edit_type':
        createType(rows[0], null, (res) => {
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
    var isSingle = (len === 1);

    btns.create_encryption.disabled = !isSingle;
    btns.delete.disabled = !(len > 0);
    btns.edit_extra_specs.disabled = !isSingle;
    btns.edit_type.disabled = !isSingle;

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
        } else {
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

          detail.loading();

          const item = rows[0];

          request.getEncryption(item.id).then((encryption) => {
            contents[tabKey] = (
              <div className="halo-volume-type-detail-description">
                <BasicProps
                  title={__.basic + __.properties}
                  defaultUnfold={true}
                  tabKey={'description'}
                  items={this.getBasicPropsItems(item, server)}
                  rawItem={item}
                  onAction={this.onDetailAction.bind(this)}
                  dashboard={this.refs.dashboard} />
                {
                  encryption.encryption_id ?
                    <BasicProps
                      title={__.encryption + __.information}
                      defaultUnfold={true}
                      tabKey={'description'}
                      items={this.getEncryptionInfo(encryption)}
                      rawItem={item}
                      onAction={this.onDetailAction.bind(this)}
                      dashboard={this.refs.dashboard} />
                  : null
                }
                {
                  encryption.encryption_id ?
                    <div className="actions">
                      <Button value={__.edit + __.encryption} onClick={this.onDetailAction.bind(this, 'description', 'edit_encryption', {
                        encryption,
                        volumeType: item
                      })} />
                      <Button value={__.delete + __.encryption} type="delete" onClick={this.onDetailAction.bind(this, 'description', 'delete_encryption', {
                        encryption,
                        volumeType: item
                      })} />
                    </div>
                  : null
                }
              </div>
            );

            detail.setState({
              contents: contents,
              loading: false
            });
          });
        }
        break;
      default:
        break;
    }

  }

  getBasicPropsItems(item, server) {
    let specs = item.extra_specs;
    let specsKeys = Object.keys(specs);

    var items = [{
      title: __.name,
      content: item.name || '(' + item.id.substr(0, 8) + ')',
      type: 'editable'
    }, {
      title: __.id,
      content: item.id
    }, {
      title: __.is_public,
      content: item.is_public ? __.true : __.false
    }, {
      title: __.description,
      content: item.description || '-'
    }, {
      title: __.volume_type_extra_specs,
      content: (
        <div>
          { specsKeys.length > 0 ?
              specsKeys.map((key) => <div>{key + ' = ' + specs[key]}</div>)
            : '-'
          }
        </div>
      )
    }];

    return items;
  }

  getEncryptionInfo(item) {
    var items = [{
      title: __.encryption + __.id,
      content: item.encryption_id
    }, {
      title: __.provider,
      content: item.provider || '-'
    }, {
      title: __.control_location,
      content: item.control_location || '-'
    }, {
      title: __.cipher,
      content: item.cipher || '-'
    }, {
      title: __.key_size,
      content: item.key_size || '-'
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
    const that = this;
    let {encryption, volumeType} = data;

    switch(actionType) {
      case 'edit_encryption':
        createEncryption(data, null, () => {
          that.defaultRefresh();
        });
        break;
      case 'edit_name':
        // var {rawItem, newName} = data;
        // request.editVolumeName(rawItem, newName).then((res) => {
        //   this.refresh({
        //     refreshList: true,
        //     refreshDetail: true
        //   });
        // });
        break;
      case 'delete_encryption':
        let items = [Object.assign({}, encryption, {
          id: encryption.encryption_id
        })];

        deleteModal({
          __: __,
          action: 'delete',
          type: 'encryption',
          data: items,
          onDelete: function(_data, cb) {
            request.deleteEncryption(volumeType.id, encryption.encryption_id).then((res) => {
              that.defaultRefresh();
              cb(true);
            });
          }
        });
        break;
      default:
        break;
    }
  }

}

module.exports = Model;
