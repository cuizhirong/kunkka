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
      disabled: true,
      visible: true,
      accessTypes: accessTypes,
      accessType: accessTypes[0].key,
      nameValue: '',
      error: '',
      showError: false
    };

    ['onConfirm', 'onCancel'].forEach(f => {
      this[f] = this[f].bind(this);
    });
  }

  onChangeAccessTypes(key, e) {
    this.setState({
      accessType: key
    });
  }
  onChangeName(e) {
    this.setState({
      nameValue: e.target.value
    });
    let rep = /^([^/]{3,})$/;
    if(!rep.test(e.target.value) && e.target.value !== '') {
      this.refs.btn.setState({
        disabled: true
      });
    } else {
      this.refs.btn.setState({
        disabled: false
      });
    }
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
      let bucketExist = buckets.some(b => {
        return (b.name === this.state.nameValue);
      });

      if(bucketExist) {
        this.setState({
          showError: true
        });
        this.refs.btn.setState({
          disabled: true
        });
      } else {
        if (this.state.accessType === 'public') {
          params = {
            Bucket: this.state.nameValue,
            type: 'public'
          };
        } else {
          params = {
            Bucket: this.state.nameValue,
            type: 'private'
          };
        }
        request.createBucket(params).then((res) => {
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
      }
    });
    this.refs.btn.setState({
      disabled: true
    });
  }

  render() {
    let props = this.props,
      state = this.state;
    let rep = /^([^/]{3,})$/;
    let className = 'input-name';
    if(!rep.test(this.state.nameValue) && this.state.nameValue !== '') {
      className += ' error';
    } else {
      className = className;
    }
    return (
       <Modal ref="modal" {...props} title={__.create_bucket} visible={state.visible} width={540}>
        <div className="modal-bd halo-com-modal-create-bucket">
          <div className="file-name">
            <p><strong>* </strong>{__.container_name}</p>
            <input className={className} ref="name" type="text" value={state.nameValue} onChange={this.onChangeName.bind(this)}/>
            <div className="name-error">{__.name_error}</div>
          </div>
          <div ref="type" className="object-row row-tab row-tab-single" key="types">
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
          </div>
          <div className="intro-tip">{__.container_intro}</div>
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
          {state.showError ? <div className="tip obj-tip-error">
            <div className="obj-tip-icon">
              <strong>
                <i className="glyphicon icon-status-warning" />
              </strong>
            </div>
            <div className="obj-tip-content" style={{width: 370 + 'px'}}>
              {__.name_conflict}
            </div>
          </div> : null}
        </div>
        <div className="modal-ft halo-com-modal-create-bucket">
          <Button ref="btn" value={__.create} disabled={state.disabled} type="create" onClick={this.onConfirm} />
          <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
