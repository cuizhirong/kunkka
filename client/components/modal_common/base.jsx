var React = require('react');
var {Modal, Button} = require('client/uskin/index');
var __ = require('i18n/client/lang.json');

var Input = require('./subs/input/index');
var Text = require('./subs/text/index');
var Tip = require('./subs/tip/index');
var Checkbox = require('./subs/checkbox/index');
var IconLabel = require('./subs/icon_label/index');
var TextArea = require('./subs/textarea/index');
var Select = require('./subs/select/index');
var SelectGroup = require('./subs/select_group/index');
var Tab = require('./subs/tab/index');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: this.props.config.btn.disabled
    };

    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onAction = this.onAction.bind(this);
    // this.onPop = this.onPop.bind(this);
  }

  onAction(field, state) {
    this.props.onAction(field, state, this.refs);
  }

  initialize() {
    var props = this.props;
    return props.config.fields.map((m) => {
      m.label = __[m.field];

      switch(m.type) {
        case 'text':
          return <Text key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'input':
          return <Input key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'error':
        case 'warning':
        case 'info':
          return <Tip key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'checkbox':
          return <Checkbox key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'icon_label':
          return <IconLabel key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'textarea':
          return <TextArea key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'select':
          return <Select key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'select_group':
          return <SelectGroup key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        case 'tab':
          return <Tab key={m.field} ref={m.field} {...m} onAction={this.onAction} />;
        default:
          return null;
      }
    });
  }

  componentDidMount() {
    this.props.onInitialize && this.props.onInitialize(this.refs);
  }

  onConfirm() {
    this.setState({
      disabled: true
    });
    this.props.onConfirm && this.props.onConfirm(this.refs, (success) => {
      if (success) {
        this.setState({
          visible: false
        });
      } else {
        this.setState({
          disabled: false
        });
      }

    });
  }

  // onPop() {
  //   deleteModal({
  //     title: '删除通用弹窗测试',
  //     content: '测试，这是内容区域',
  //     deleteText: '删除',
  //     cancelText: '取消',
  //     onDelete: function(data, cb) {
  //       console.log('触发删除事件:', data);
  //       setTimeout(function() {
  //         cb(true);
  //       }, 1000);
  //     },
  //     parent: this.refs.modal
  //   });
  // }

  onCancel() {
    this.setState({
      visible: false
    });
    this.props.onCancel && this.props.onCancel();
  }

  render() {
    var props = this.props,
      state = this.state,
      btn = props.config.btn;

    var title = props.config.title.map(function(m) {
      return __[m];
    }).join('');

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible}>
        <div className="modal-bd halo-com-modal-common">
          {this.initialize()}
        </div>
        <div className="modal-ft">
          <Button ref="btn" value={__[btn.value]} disabled={state.disabled} type={btn.type} onClick={this.onConfirm}/>
          <Button value={__.cancel} btnKey="cancel" type="cancel" onClick={this.onCancel}/>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
