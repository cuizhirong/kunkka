require('./style/index.less');

const React = require('react');
const ButtonList = require('client/components/main/button_list');
const {InputSearch, Modal, Breadcrumb, Table} = require('client/uskin/index');
const copylink = require('clipboard-plus');

//pops
const deleteModal = require('client/components/modal_delete/index');
const createBucket = require('./pop/create_bucket/index');
const modifyBucket = require('./pop/modify_bucket/index');
const createFolder = require('./pop/create_folder/index');
const uploadObj = require('./pop/upload/index');
const objDesc = require('./pop/obj_desc/index.jsx');
const DropdownButton = require('./pop/dropdown_button/index.jsx');
const Button = require('./pop/delete_button/index.jsx');
const deleteFolder = require('./pop/delete_folder/index');

const config = require('./config.json');
const bucketConfig = require('./bucket_config.json');
const objConfig = require('./obj_config.json');
const btnConfig = require('./btn_config.json');

const __ = require('locale/client/dashboard.lang.json');
const getStatusIcon = require('../../utils/status_icon');
const moment = require('client/libs/moment');
const converter = require('client/components/main/converter');
const request = require('./request');
const unitConverter = require('client/utils/unit_converter');

class Model extends React.Component {

  constructor(props) {
    super(props);
    moment.locale(HALO.configs.lang);

    let accessTypes = [{
      value: __.private,
      key: 'private'
    }, {
      value: __.public,
      key: 'public'
    }];

    this.state = {
      config: config,
      bucketConfig: bucketConfig,
      breadcrumb: [],
      clipboard: null,
      tree: {},
      dataContent: [],
      detailRows: [],
      conDetail: {},
      data: [],
      checkedKey: {},
      sortCol: undefined,
      sortDirection: undefined,
      filterColKey: {},
      filterBy: undefined,
      objectCount: '',
      containerCount: '',
      bytesUsed: '',
      accessTypes: accessTypes,
      accessType: accessTypes[0].key
    };

    this.stores = {
      rows: []
    };

    ['onInitialize', 'onAction', 'sortByName', 'onClickBucket', 'onClickBreadcrumb', 'getDifficon', 'getDiffColor', 'copyArr', 'updateBuckets'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.style.display !== 'none' && this.props.style.display === 'none') {
      this.loadingTable();
      this.clearState();
      this.setState({
        config: JSON.parse(JSON.stringify(bucketConfig)),
        breadcrumb: []
      }, () => {
        this.onInitialize();
        this.tableColRender(this.state.config.table.column);
      });
      // nextProps.config && this.updateRows(nextProps.config.table.data);
    }
  }

  componentWillMount() {
    this.onInitialize();
    converter.convertLang(__, config);
    converter.convertLang(__, objConfig);
    converter.convertLang(__, bucketConfig);
    converter.convertLang(__, btnConfig);
    this.tableColRender(this.state.config.table.column);
    this.formateBtns(objConfig.btns);
  }

  getDiffColor(color) {
    switch(color) {
      case '.doc':
      case '.xls':
      case '.txt':
      case '.ppt':
      case '.xlsx':
      case '.pptx':
        return '#98CE7A';
      case '.jpg':
      case '.png':
      case '.pdf':
      case '.tiff':
      case '.swf':
        return '#EFB16A';
      case '.flv':
      case '.rmvb':
      case '.mp4':
      case '.mvb':
        return '#0F9AE5';
      case '.vma':
      case '.mp3':
        return '#6390EC';
      case '.rar':
      case '.exe':
      case '.zip':
        return '#8787E5';
      default:
        return '#E3E4E5';
    }
  }

  getDifficon(name) {
    switch(name) {
      case 'Folder':
        return 'folder';
      case '.jpg':
        return 'jpg';
      case '.mp3':
        return 'mp3';
      case '.mp4':
        return 'mp4';
      case '.png':
        return 'png';
      case '.doc':
        return 'doc';
      case '.docx':
        return 'docx';
      case '.exe':
        return 'exe';
      case '.fils':
        return 'fils';
      case '.flv':
        return 'flv';
      case '.mvb':
        return 'mvb';
      case '.pdf':
        return 'pdf';
      case '.ppt':
        return 'ppt';
      case '.pptx':
        return 'pptx';
      case '.rar':
        return 'rar';
      case '.rmvb':
        return 'rmvb';
      case '.tiff':
        return 'tiff';
      case '.txt':
        return 'txt';
      case '.wma':
        return 'wma';
      case '.xls':
        return 'xls';
      case '.xlsx':
        return 'xls';
      case '.zip':
        return 'zip';
      default:
        return 'file';
    }
  }

  onClickDropdownBtn(item, ele) {
    switch(ele.key) {
      case 'attribute':
        objDesc(item);
        break;
      case 'delete_folder':
        let deleteBread = this.state.breadcrumb.join('/');
        deleteBread = deleteBread + '/';
        let that = this;
        deleteModal({
          __: __,
          action: 'delete',
          type: 'file',
          data: [item],
          onDelete: function(_data, cb) {
            request.deleteBucket({
              Bucket: deleteBread.concat(item.name)
            }).then(() => {
              that.updatecontainer(that.state.breadcrumb);
              cb(true);
              that.refresh({
                detailRefresh: true,
                tableLoading: true,
                clearState: true
              });
            });
          }
        });
        break;
      case 'edit':
        uploadObj(item, null, this.state.breadcrumb, () => {
          this.updatecontainer(this.state.breadcrumb);
          this.refresh({
            detailRefresh: true,
            tableLoading: true,
            clearState: true
          });
        });
        break;
      default:
        break;
    }
  }

  mainButtonClick(item, ele) {
    request.downloadItem({name: item.name}, this.state.breadcrumb);
  }

  onClickDeleteButton(item, ele) {
    let keyName, deletei;
    let arr1 = [];
    let that = this;
    let superbread = this.state.breadcrumb.slice(1);
    keyName = superbread.length > 0 ? superbread.join('/') + '/' + item.name + '/' : item.name + '/';
    let rawItem = this.state.rawItem,
      items = JSON.parse(JSON.stringify(rawItem));

    items.forEach(_item => {
      if (_item.name.indexOf(keyName) === 0) {
        arr1.push(_item);
      }
    });
    deletei = arr1.map(i => {
      return this.state.breadcrumb[0] + '/' + i.name;
    }).join('\n');
    deleteFolder(arr1, deletei, null, () => {
      that.updatecontainer(this.state.breadcrumb);
      this.refresh({
        detailRefresh: true,
        clearState: true,
        tableLoading: true
      }, true);
    });
  }

  sortByName() {
    let dataKey = config.table.dataKey;
    config.table.column.forEach((col) => {
      if (col.filter) {
        col.filterAll = ['all'];
      }
      if (col.sort) {
        col.sortBy = function(item1, item2) {
          let key = col.dataIndex,
            a = item1[key] ? item1[key] : '(' + item1[dataKey] + ')',
            b = item2[key] ? item2[key] : '(' + item2[dataKey] + ')';

          return a.localeCompare(b);
        };
      }
    });
  }

  tableColRender(columns) {
    let definedbtns = btnConfig.btns;
    let deletebtn = btnConfig.btn;
    this.sortByName();

    let renderName = function(col, item, i) {
      switch(item.type) {
        case 'bucket':
          return <a onClick={this.updatePage.bind(this, 'clickBucket', item)}>{item.name}</a>;
        case 'object':
          let index = item.name.lastIndexOf('.');
          let className = 'glyphicon icon-';
          item.intype = item.name.slice(index, item.name.length);
          className = className + this.getDifficon(item.intype);
          let diffColor = this.getDiffColor(item.intype);
          return (<div><i className={className} style={{color: diffColor, 'fontSize': 18 + 'px'}}/>{item.name}</div>);
        case 'folder':
          return (<div>
            <i className="glyphicon icon-folder" style={{color: '#FEC161', 'fontSize': 20 + 'px'}}/>
            <a onClick={this.updatePage.bind(this, 'clickFolder', item)}>{item.name}</a>
          </div>);
        default:
          break;
      }
    };

    columns.map((column) => {
      switch (column.key) {
        case 'name':
          column.render = renderName.bind(this);
          break;
        case 'count':
          column.render = (col, item, i) => {
            return item.count ? item.count : '-';
          };
          break;
        case 'resource_size':
          column.render = (col, item, i) => {
            if(item.bytes) {
              let s = unitConverter(item.bytes);
              if(item.type === 'folder') {
                return '-';
              }
              return s.num === 0 ? '-' : s.num + ' ' + s.unit;
            } else {
              return '-';
            }
          };
          break;
        case 'type':
          column.render = (col, item, i) => {
            let dot = item.name.lastIndexOf('.');
            return item.type === 'folder' ? 'folder' : item.name.slice(dot, item.name.length);
          };
          break;
        case 'update_time':
          column.render = (col, item, i) => {
            let uniformTime = item.modify_time && item.modify_time.split('.')[0] + 'Z';
            let opertionTime = moment(uniformTime).fromNow();
            return item.modify_time ? opertionTime : '-';
          };
          break;
        case 'operation':
          column.render = (col, item, i) => {
            return (item.type === 'folder' ? <div className="delete-folder-btn">
            {deletebtn.map((btn, index) =>
              <Button
                key={index}
                value={btn.value}
                onClick={this.onClickDeleteButton.bind(this, item)} />
            )}
          </div> :
            <div className="defined-btn-list">
              {definedbtns.map((btn, index) =>
                <DropdownButton
                  key={index}
                  disabled={btn.disabled}
                  buttonData={btn}
                  dropdownItems={btn.dropdown.items}
                  mainButtonClick={this.mainButtonClick.bind(this, item)}
                  dropdownOnClick={this.onClickDropdownBtn.bind(this, item)} />
              )}
            </div>
            );
          };
          break;
        case 'link':
          column.render = (col, item, i) => {
            let linkHref, jointLink;
            item.type === 'folder' ? jointLink = this.state.breadcrumb.join('/') + '/' + item.name + '/' : jointLink = this.state.breadcrumb.join('/') + '/' + item.name;
            linkHref = window.location.protocol + '//' + window.location.hostname + ':' + HALO.configs.swift_port + '/' + jointLink;
            return (item.headerType === '.r:*' ? <div className="storage-link" onClick={this.oncopylink.bind(this, linkHref)}>{__.copy + __.link}
            </div> : '-'
            );
          };
          break;
        default:
          break;
      }
    });
  }

  oncopylink(linkHref) {
    copylink(linkHref);
  }

  onInitialize() {
    this.getTableData(true, true);
  }

  updatecontainer(breadcrumb) {
    request.listBuckets().then(res => {
      res.forEach(item => {
        if(item.name === breadcrumb[0]) {
          this.setState({
            conDetail: item
          });
        }
      });
    });
  }

  getTableData(detailRefresh) {
    let state = this.state,
      table = state.config.table;

    switch(this.state.config.breadcrumb.length) {
      case 1:
        request.listBuckets().then(res => {
          let newRes = [];
          let additionObject, additionBytes, addObjectArr = [], addBytesArr = [];
          res.forEach(item => {
            if(item.name.indexOf('_template') === -1 && item.name.indexOf('_ticket') === -1) {
              newRes.push(item);
            }
          });

          newRes.forEach((add) => {
            addObjectArr.push(add.count);
            addBytesArr.push(add.bytes);
            additionObject = addObjectArr.reduce((x, y) => {
              return x + y;
            }, 0);
            additionBytes = addBytesArr.reduce((x, y) => {
              return x + y;
            }, 0);
          });

          this.setState({
            objectCount: additionObject || 0,
            containerCount: newRes.length || 0,
            bytesUsed: additionBytes || 0
          });

          table.data = newRes;
          state.config.btns[0].disabled = false;
          state.config.btns[3].disabled = false;
          table.loading = false;
          this.setState({
            config: this.state.config
          });
        });
        break;
      case 2:
        this.onClickBucket();
        break;
      default:
        request.listBucketObjects({
          Bucket: this.state.config.breadcrumb[1].name
        }).then(res => {
          this.setState({
            rawItem: res
          }, () => {
            this.onClickFolder();
          });
        });
        break;
    }
  }

  onAction(field, actionType, data, refs, isUpdateDetail) {
    if (!data) {
      data = {};
    }
    data.rows = this.stores.rows;
    switch (field) {
      case 'btnList':
        this.onClickBtnList(data.key, data, this.state);
        break;
      case 'table':
        this.onClickTable(actionType, data);
        break;
      case 'detail':
        this.onClickDetailTabs(actionType, data, refs, isUpdateDetail);
        break;
      case 'breadcrumb':
        this.onClickBreadcrumb(data);
        break;
      default:
        break;
    }
  }

  updateRows(data) {
    let newRows = [];
    let key = this.state.config.table.dataKey;

    this.stores.rows.forEach((item) => {
      let existed = data.filter((d) => d[key] === item[key])[0];

      if (existed) {
        newRows.push(existed);
      }
    });

    this.stores.rows = newRows;

    let checkedKey = {};
    newRows.forEach((item) => {
      checkedKey[item[key]] = true;
    });

    let table = this.refs.table;
    if (table) {
      table.check(checkedKey);
    }

    this.onAction('table', 'check', {
      status: false,
      checkedRow: this.stores.rows
    });
  }

  onClickBreadcrumb(item) {
    this.clearState();
    switch(item.type) {
      case 'all':
        this.state.config.breadcrumb = this.state.config.breadcrumb.slice(0, 1);
        this.state.config.btns = bucketConfig.btns;
        this.state.config.table = bucketConfig.table;
        this.tableColRender(config.table.column);
        this.setState({
          breadcrumb: []
        });
        this.refresh({
          tableLoading: true
        });
        break;
      case 'bucket':
        this.state.config.breadcrumb = this.state.config.breadcrumb.slice(0, 1);
        this.setState({
          breadcrumb: []
        }, () => {
          this.onClickBucket(item);
          request.listBuckets().then(res => {
            res.forEach(i => {
              if(i.name === item.name) {
                this.setState({
                  conDetail: i
                });
              }
            });
          });
        });
        break;
      case 'folder':
        let len = this.state.config.breadcrumb.indexOf(item);
        let newB = this.state.config.breadcrumb.slice(1, len);
        let arrB = [];
        newB.forEach(i => {
          arrB.push(i.name);
        });

        this.setState({
          breadcrumb: arrB
        }, () => {
          this.onClickFolder(item, arrB);
        });
        break;
      default:
        break;
    }
  }

  updatePage(actionType, item) {
    switch(actionType) {
      case 'clickBucket':
        this.onClickBucket(item);
        break;
      case 'clickFolder':
        this.onClickFolder(item);
        break;
      default:
        break;
    }
  }

  copyArr(copyb) {
    let res = [];
    for (let i = 0; i < copyb.length; i++) {
      res.push(copyb[i]);
    }
    return res;
  }

  updateBuckets() {
    request.listBucketObjects({
      Bucket: this.state.config.breadcrumb[1].name
    }).then(rawItem => {
      let res = JSON.parse(JSON.stringify(rawItem));
      let tree = [];
      res.forEach(_item => {
        if (_item.name.split('/')[1] || _item.name.split('/')[1] === '') {
          _item.type = 'folder';
          _item.name = _item.name.split('/')[0];
          _item.headerType = _item.headerType;
        }
        tree.push(_item);
      });
      let hash = {}, arr = [];
      arr = tree.reduce((i, next, index) => {
        hash[next.name] ? '' : hash[next.name] = true && i.push(next);
        return i;
      }, []);

      let dataContent = [];
      for(let key in arr) {
        let dataObj = {
          name: arr[key].name,
          type: arr[key].type,
          bytes: arr[key].bytes ? arr[key].bytes : '',
          modify_time: arr[key].last_modified ? arr[key].last_modified : '',
          headerType: arr[key].headerType ? arr[key].headerType : ''
        };
        dataContent.push(dataObj);
      }

      this.setState({
        rawItem: rawItem,
        dataContent: dataContent
      });

      let table = this.state.config.table;
      table.data = dataContent;
      table.loading = false;
      this.tableColRender(this.state.config.table.column);
      this.setState({
        config: this.state.config,
        tree: tree
      });
    });
  }

  onClickBucket(item) {
    this.state.config.btns = objConfig.btns;
    this.state.config.table = objConfig.table;
    if(item) {
      let a = this.state.breadcrumb;
      let buname = item.name;
      a.push(buname);
      this.setState({
        breadcrumb: a,
        conDetail: item
      });
      this.state.config.breadcrumb.push({
        name: item.Name ? item.Name : item.name,
        key: item.name,
        bytes: item.bytes,
        count: item.count,
        type: item.type ? item.type : ''
      });
    }
    this.loadingTable();
    this.updateBuckets();
  }

  onClickFolder(item, newBreadcrumb) {
    this.tableColRender(this.state.config.table.column);
    let rawItem = this.state.rawItem,
      items = JSON.parse(JSON.stringify(rawItem)),
      arr1 = [],
      keyName,
      b = this.state.breadcrumb,
      copyb = this.state.config.breadcrumb,
      bc = this.copyArr(copyb);
    let breadc = bc.slice(2);

    if (!item) {
      let fourl = '';
      breadc.forEach(i => {
        fourl += i.name + '/';
        keyName = fourl.slice(0, fourl.length);
      });
    } else {
      let foname = item && item.name;
      b.push(foname);
      this.state.config.breadcrumb.push({
        name: foname,
        key: foname,
        bytes: item.bytes ? item.bytes : '',
        modify_time: item.modify_time,
        type: item.type ? item.type : 'folder',
        headerType: item.headerType
      });

      if(newBreadcrumb) {
        keyName = newBreadcrumb.join('/');
        this.state.config.breadcrumb = this.state.config.breadcrumb.slice(0, this.state.breadcrumb.length + 1);
      }
      keyName = b.slice(1, b.length).join('/') + '/';
    }
    items.forEach(_item => {
      if (_item.name.indexOf(keyName) === 0) {
        if (_item.name.slice(keyName.length, _item.name.length)) {
          if (_item.name.slice(keyName.length, _item.name.length).split('/').length > 1) {
            _item.type = 'folder';
          }
          _item.name = _item.name.slice(keyName.length, _item.name.length).split('/')[0];
          arr1.push(_item);
        }
      }
    });
    let hash = {}, arr = [];
    arr = arr1.reduce((i, next) => {
      hash[next.name] ? '' : hash[next.name] = true && i.push(next);
      return i;
    }, []);
    let dataContent = [];
    for(let key in arr) {
      let dataObj = {
        name: arr[key].name,
        type: arr[key].type || 'folder',
        bytes: arr[key].bytes ? arr[key].bytes : '',
        modify_time: arr[key].last_modified ? arr[key].last_modified : '',
        headerType: arr[key].headerType
      };
      dataContent.push(dataObj);
    }

    let table = this.state.config.table;
    table.data = dataContent;
    table.loading = false;

    this.setState({
      config: this.state.config,
      breadcrumb: b
    });
  }

  onClickBtnList(key, data, state) {
    let rows = data.rows,
      that = this,
      breadcrumb = state.breadcrumb;

    switch (key) {
      case 'crt_bucket':
        createBucket(null, null, () => {
          that.refresh({
            detailRefresh: true,
            clearState: true,
            tableLoading: true
          }, true);
        });
        break;
      case 'modify_bucket':
        modifyBucket(rows[0], null, () => {
          that.refresh({
            detailRefresh: true,
            clearState: true,
            tableLoading: true
          }, true);
        });
        break;
      case 'crt_folder':
        createFolder(null, null, breadcrumb, () => {
          this.updatecontainer(breadcrumb);
          that.refresh({
            detailRefresh: true,
            clearState: true,
            tableLoading: true
          }, true);
        });
        break;
      case 'upload':
        uploadObj(null, null, breadcrumb, () => {
          this.updatecontainer(breadcrumb);
          that.clearState();
          that.refresh({
            detailRefresh: true,
            clearState: true,
            tableLoading: true
          });
        });
        break;
      case 'download':
        request.downloadItem(rows[0], breadcrumb);
        break;
      case 'edit':
        uploadObj(rows[0], null, breadcrumb, () => {
          this.updatecontainer(breadcrumb);
          that.refresh({
            detailRefresh: true,
            clearState: true,
            tableLoading: true
          }, true);
        });
        break;
      case 'delete_bucket':
        request.listBucketObjects({
          Bucket: rows[0].name
        }).then(res => {
          if(res.length === 0) {
            deleteModal({
              __: __,
              action: 'delete',
              type: 'bucket',
              data: rows,
              onDelete: function(_data, cb) {
                request.deleteBucket({
                  Bucket: rows[0].name
                }).then(() => {
                  that.updatecontainer(breadcrumb);
                  cb(true);
                  that.refresh({
                    detailRefresh: true,
                    clearState: true,
                    tableLoading: true
                  });
                });
              }
            });
          } else {
            let props = {
              title: __.tip,
              content: __.tip_delete_warning.replace('{0}', __.bucket),
              okText: __.confirm
            };
            Modal.warning(props);
          }
        });
        break;
      case 'delete_folder':
        let deleteBread = breadcrumb.join('/');
        deleteBread = deleteBread + '/';
        let keyName, deletei;
        let rawItem = this.state.rawItem,
          items = JSON.parse(JSON.stringify(rawItem));
        let arr1 = [];
        if(rows[0].type === 'folder') {
          let superbread = this.state.breadcrumb.slice(1);
          keyName = superbread.length > 0 ? superbread.join('/') + '/' + rows[0].name + '/' : rows[0].name + '/';
          items.forEach(_item => {
            if (_item.name.indexOf(keyName) === 0) {
              arr1.push(_item);
            }
          });
          deletei = arr1.map(i => {
            return this.state.breadcrumb[0] + '/' + i.name;
          }).join('\n');
          deleteFolder(arr1, deletei, null, () => {
            that.updatecontainer(breadcrumb);
            that.refresh({
              detailRefresh: true,
              clearState: true,
              tableLoading: true
            }, true);
          });
        } else {
          deleteModal({
            __: __,
            action: 'delete',
            type: 'file',
            data: rows,
            onDelete: function(_data, cb) {
              request.deleteBucket({
                Bucket: deleteBread.concat(rows[0].name)
              }).then(() => {
                that.updatecontainer(breadcrumb);
                cb(true);
                that.refresh({
                  detailRefresh: true,
                  clearState: true,
                  tableLoading: true
                });
              });
            }
          });
        }
        break;
      case 'attribute':
        objDesc(rows[0]);
        break;
      case 'refresh':
        this.refresh({
          tableLoading: true,
          clearState: true
        }, true);
        break;
      default:
        break;
    }
  }

  btnListRender(rows, btns) {
    let state = this.state;
    for (let key in btns) {
      switch (key) {
        case 'delete_bucket':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'modify_bucket':
          btns[key].disabled = (rows.length === 1) ? false : true;
          break;
        case 'empty_bucket':
          btns[key].disabled = (rows.length === state.config.table.data.length) ? false : true;
          break;
        case 'more':
          btns[key].dropdown && btns[key].dropdown.items[0].items.forEach(i => {
            switch(i.key) {
              case 'download':
                i.disabled = (rows.length === 1 && rows[0].bytes > 0 && rows[0].type !== 'folder') ? false : true;
                break;
              case 'edit':
                i.disabled = (rows.length === 1 && rows[0].type !== 'folder') ? false : true;
                break;
              case 'attribute':
                i.disabled = (rows.length === 1 && rows[0].type !== 'folder') ? false : true;
                break;
              case 'delete_folder':
                i.disabled = (rows.length === 1) ? false : true;
                break;
              default:
                break;
            }
          });
          break;
        default:
          break;
      }
    }
    return btns;
  }

  onClickTable(actionType, data) {
    switch (actionType) {
      case 'check':
        this.onClickTableCheckbox(data);
        break;
      default:
        break;
    }
  }

  onClickTableCheckbox(data) {
    let {rows} = data,
      btnList = this.refs.btnList,
      btns = this.state.config.btns;
    let objbtns = {};
    btns.forEach(item => {
      objbtns[item.key] = item;
    });

    btnList.setState({
      btns: this.btnListRender(rows, objbtns)
    });
  }

  onChangeTableCheckbox(status, clickedRow, rows) {
    this.stores = {
      rows: rows
    };
    this.onAction('table', 'check', {
      status: status,
      clickedRow: clickedRow
    });
  }

  refresh(data, forceUpdate) {
    if (data) {
      if (data.tableLoading) {
        this.loadingTable();
      }
      if (data.clearState) {
        this.clearState();
      }
    }

    this.getTableData(forceUpdate, data ? data.detailRefresh : false);
  }

  loadingTable() {
    let _config = this.state.config;
    _config.table.loading = true;

    this.setState({
      config: _config
    });
  }
  // search
  changeSearchInput(str) {
    this.searchInTable(str);

    this.onAction('searchInput', 'search', {
      text: str
    });
  }

  searchInTable(text) {
    let table = this.refs.table;

    if (table) {
      let search = this.state.config.search,
        filterCol = search.column;
      if (search && search.column) {
        if (text) {

          //arguments: filter columns, filter function
          table.filter(filterCol, function(item, column) {
            let ret = column.some((col) => {
              if (filterCol[col.key] && item[col.dataIndex]) {
                let td = item[col.dataIndex].toLowerCase();
                return td.indexOf(text.toLowerCase()) > -1 ? true : false;
              }
            });

            return ret;
          });
        } else {
          table.filter(filterCol, undefined);
        }
      }
    }
  }

  clearState() {
    this.stores.rows = [];
    this.onAction('table', 'check', {
      status: false,
      clickedRow: []
    });
    if (this.refs.search) {
      this.refs.search.state.value = '';
      this.searchInTable(undefined);
    }
    if (this.refs.table) {
      this.refs.table.setState({
        data: this.state.config.table.data,
        checkedKey: {},
        sortCol: undefined,
        sortDirection: undefined,
        filterColKey: {},
        filterBy: undefined
      });
    }
  }

  formateBtns(btns) {
    let formatedBtns = {};

    let traverseChildren = (item, arr = []) => {
      let newArr = arr;
      if (item.children) {
        item.children.forEach((child) => {
          child.items.forEach((ele) => {
            arr = traverseChildren(ele, []);
            newArr.push(ele);
          });
        });
      }
      return newArr;
    };

    btns.forEach((btn) => {
      if (btn.dropdown) {
        btn.dropdown.items.forEach((item) => {
          item.items.forEach((_item) => {
            _item.type = 'dropdown';
            formatedBtns[_item.key] = _item;
            traverseChildren(_item).forEach((ele) => {
              formatedBtns[ele.key] = ele;
            });
          });
        });
      } else {
        formatedBtns[btn.key] = btn;
      }
    });

    this.setState({
      btns: formatedBtns
    });
  }

  render() {
    let state = this.state,
      _config = this.state.config,
      table = _config.table,
      btns = _config.btns,
      search = _config.search;
    let classString = 'container-detail';
    if(this.state.config.btns[0].key === 'upload') {
      classString = classString + ' visible';
    }
    let alarmClass = 'alarm-list';
    if(this.state.config.btns[0].key === 'crt_bucket') {
      alarmClass = alarmClass + ' visible';
    }
    let v = state.conDetail.bytes && unitConverter(state.conDetail.bytes);
    let alarmBytes = state.bytesUsed && unitConverter(state.bytesUsed);
    return (
     <div className="halo-module-object-storage" style={this.props.style}>
        <div className="breadcrumb-list">
          <Breadcrumb items={_config.breadcrumb} onClick={this.onClickBreadcrumb}/>
        </div>
        <div ref="container" className={classString}>
          <p className="container-detail-list">
          {v ? __.count + ': ' + state.conDetail.count + '     /     ' + __.size + ': ' + v.num + v.unit :
            __.count + ': ' + state.conDetail.count
          }
          </p>
        </div>
        <div ref="alarm" className={alarmClass}>
          <div className="per">
            <div className="per-head">
            {__.number_container}
            </div>
            <div className="per-content">
              <span className="change-data">{this.state.containerCount}</span>
              <span className="data-unit">{__.number}</span>
            </div>
          </div>
          <div className="per">
            <div className="per-head">
            {__.number_object}
            </div>
            <div className="per-content">
              <span className="change-data">{this.state.objectCount}</span>
              <span className="data-unit">{__.number}</span>
            </div>
          </div>
          <div className="per">
            <div className="per-head">
            {__.capacity_container}
            </div>
            <div className="per-content">
              <span className="change-data">{alarmBytes && alarmBytes.num}</span>
              <span className="data-unit">{alarmBytes ? alarmBytes.unit : 'B'}</span>
            </div>
          </div>
        </div>
        <div className="operation-list">
          <ButtonList
            ref="btnList"
            btns={btns}
            onAction={this.onAction.bind(this)} />
          {search ?
            <InputSearch
              ref="search"
              type="light"
              width={search.width}
              placeholder={search.placeholder}
              onChange={this.changeSearchInput.bind(this)} />
            : null
          }
        </div>
        <div className="table-box">
          {!table.loading && !table.data.length ?
            <div className="table-with-no-data">
              <Table
                column={table.column}
                data={[]}
                checkbox={table.checkbox} />
              <p>
                {__.there_is_no + __.object_storage + __.data + __.full_stop}
              </p>
            </div>
          : <Table
              ref="table"
              column={table.column}
              data={table.data}
              dataKey={table.dataKey}
              loading={table.loading}
              checkbox={table.checkbox}
              checkboxOnChange={this.onChangeTableCheckbox.bind(this)}
              hover={table.hover}
              getStatusIcon={getStatusIcon}
              onAction={this.onAction.bind(this)}
              striped={this.striped} />
          }
        </div>
      </div>
    );
  }
}

module.exports = Model;
