const Base = require('../volume/model');

const createModal = require('./pop/create/index');
const deleteModal = require('client/components/modal_delete/index');
const createSnapshot = require('../volume/pop/create_snapshot/index');
const attachInstance = require('../volume/pop/attach_instance/index');
const detachInstance = require('../volume/pop/detach_instance/index');
const setRead = require('../volume/pop/set_read/index');
const notify = require('../../utils/notify');
const setReadWrite = require('../volume/pop/set_read_write/index');
const resizeVolume = require('../volume/pop/resize/index');
const createTransfer = require('../volume/pop/create_transfer');
const acceptTransfer = require('../volume/pop/accept_transfer');

const request = require('../volume/request');
const config = require('./config.json');
const __ = require('locale/client/dashboard.lang.json');

class Model extends Base {
  constructor(props) {
    super(props);

    this.state = {
      config: config
    };
  }

  onClickBtnList(key, refs, data) {
    let rows = data.rows;
    let that = this;
    switch (key) {
      case 'create':
        createModal();
        break;
      case 'delete':
        deleteModal({
          __: __,
          action: 'delete',
          type: 'volume',
          data: rows,
          onDelete: function(_data, cb) {
            request.deleteVolumes(rows).then((res) => {
              cb(true);
            });
          }
        });
        break;
      case 'create_snapshot':
        createSnapshot(rows[0]);
        break;
      case 'attach_to_instance':
        attachInstance(rows[0]);
        break;
      case 'dtch_instance':
        detachInstance(rows[0]);
        break;
      case 'set_rd_only':
        setRead(rows[0], null, function() {
          notify({
            resource_name: rows[0].name,
            stage: 'end',
            action: 'update',
            resource_type: 'volume'
          });
          that.refresh(null, true);
        });
        break;
      case 'set_rd_wrt':
        setReadWrite(rows[0], null, function() {
          notify({
            resource_name: rows[0].name,
            stage: 'end',
            action: 'update',
            resource_type: 'volume'
          });
          that.refresh(null, true);
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
      case 'extd_capacity':
        resizeVolume(rows[0]);
        break;
      case 'create_transfer':
        createTransfer(rows[0], () => {
          this.forceRefresh();
        });
        break;
      case 'accept_transfer':
        acceptTransfer(rows[0], () => {
          this.forceRefresh();
        });
        break;
      default:
        break;
    }
  }

  btnListRender(rows, btns) {
    let len = rows.length;
    let isSingle = len === 1;
    let single, singleStatus;
    if (isSingle) {
      single = rows[0];
      singleStatus = single.status;
    }

    btns.attach_to_instance.disabled = !(isSingle && singleStatus === 'available' && !single.attachments[0]);
    btns.create_transfer.disabled = !(isSingle && singleStatus === 'available');
    btns.create_snapshot.disabled = !(isSingle && (singleStatus === 'available' || singleStatus === 'in-use'));
    btns.dtch_instance.disabled = !(isSingle && singleStatus === 'in-use');
    btns.extd_capacity.disabled = !(isSingle && singleStatus === 'available');
    btns.set_rd_only.disabled = !(isSingle && singleStatus === 'available' && single.metadata.readonly !== 'True');
    btns.set_rd_wrt.disabled = !(isSingle && singleStatus === 'available' && single.metadata.readonly === 'True');

    let hasAttach = rows.some((item) => item.server);
    btns.delete.disabled = !(len > 0 && !hasAttach);

    return btns;
  }
}

module.exports = Model;
