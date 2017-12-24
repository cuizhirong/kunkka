const React = require('react');
const {Modal} = require('client/uskin/index');
const moment = require('client/libs/moment');
const __ = require('locale/client/dashboard.lang.json');
const unitConverter = require('client/utils/unit_converter');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true
    };
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  render() {
    let props = this.props,
      state = this.state;
    let uniformTime = props.modify_time && props.modify_time.split('.')[0] + 'Z';
    let opertionTime = moment(uniformTime).fromNow();
    let v = props.bytes && unitConverter(props.bytes);
    return (
      <Modal refs="modal" {...props} visible={state.visible}>
        <div className="object-storage-description">
          <div className="modal-hd">
          <h6 className="title">{__.obj_detail}</h6>
          <span className="glyphicon icon-close" onClick={this.onCancel.bind(this)}></span>
        </div>
        <div className="modal-bd">
          <p>{__.name}<span>{props.name}</span></p>
          <p>{__.type}<span>{props.intype}</span></p>
          <p>{__.update_time}<span>{opertionTime}</span></p>
          <p>{__.size}<span>{v.num + v.unit}</span></p>
        </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
