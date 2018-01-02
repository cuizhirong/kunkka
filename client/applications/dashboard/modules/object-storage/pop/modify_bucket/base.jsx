const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const request = require('../../request');
const __ = require('locale/client/dashboard.lang.json');
const getErrorMessage = require('../../../../utils/error_message');

class ModalBase extends React.Component {
  constructor(props) {
    super(props);

    let accessTypes = [{
      value: __.private,
      key: 'private'
    }, {
      value: __.public,
      key: 'public'
    }];

    this.state = {
      disabled: false,
      visible: true,
      accessTypes: accessTypes,
      accessType: accessTypes[0].key,
      nameValue: '',
      error: '',
      showError: false,
      delayed: true
    };

    ['onConfirm', 'onCancel'].forEach(f => {
      this[f] = this[f].bind(this);
    });
  }

  componentWillMount() {
    request.listBucketObjects({
      Bucket: this.props.obj.name
    }).then(rawItem => {
      rawItem[0] && rawItem[0].headerType === '.r:*' ? this.setState({
        accessType: 'public'
      }) : this.setState({
        accessType: 'private'
      });
      this.setState({
        delayed: false
      });
    });
  }

  onChangeAccessTypes(key, e) {
    this.setState({
      accessType: key
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onConfirm() {
    let params = {};
    let that = this;
    request.listBuckets().then(buckets => {
      if (this.state.accessType === 'public') {
        params = {
          Bucket: this.props.obj.name,
          type: 'public'
        };
      } else {
        params = {
          Bucket: this.props.obj.name,
          type: 'private'
        };
      }

      request.modifyBucket(params).then((res) => {
        that.setState({
          visible: false
        });
        that.props.callback && that.props.callback();
      }).catch((err) => {
        let errorTip = getErrorMessage(err);
        this.setState({
          showError: true,
          error: errorTip
        });
      });
    });
    this.refs.btn.setState({
      disabled: true
    });
  }

  render() {
    let props = this.props,
      state = this.state;

    return (
       <Modal ref="modal" {...props} title={__.edit + __.bucket} visible={state.visible} width={540}>
        <div className="modal-bd halo-com-modal-create-bucket">
          <div className="file-name">
            <p>{__.container_name}<span>{props.obj.name}</span></p>
          </div>
          {state.delayed ? null : <div ref="type" className="object-row row-tab row-tab-single" key="types">
            <div className="object-modal-label">
              {__.container_access}
            </div>
            <div className="object-modal-data">
              {
                state.accessTypes.map((ele) =>
                  <a key={ele.key}
                    className={ele.key === state.accessType ? 'selected' : ''}
                    onClick={ele.key === state.accessType ? null : this.onChangeAccessTypes.bind(this, ele.key)}>
                    {ele.value}
                  </a>
                )
              }
            </div>
          </div>}
          <div className="tip obj-tip-warning">
            <div className="obj-tip-icon">
              <strong>
                <i className="glyphicon icon-status-warning" />
              </strong>
            </div>
            <div className="obj-tip-content" style={{width: 370 + 'px'}}>
              {__.container_tip}
            </div>
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-bucket">
          <Button ref="btn" value={__.edit} disabled={state.disabled} onClick={this.onConfirm} />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
