var React = require('react');
var {Modal, Button} = require('client/uskin/index');
var UskinTip = require('client/uskin/index').Tip;

var Input = require('./subs/input/index');
var InputPassword = require('./subs/input_pwd/index');
var Text = require('./subs/text/index');
var Tip = require('./subs/tip/index');
var Checkbox = require('./subs/checkbox/index');
var IconLabel = require('./subs/icon_label/index');
var TextArea = require('./subs/textarea/index');
var Select = require('./subs/select/index');
var SelectGroup = require('./subs/select_group/index');
var SelectSingle = require('./subs/select_single/index');
var Tab = require('./subs/tab/index');
var GroupSelect = require('./subs/group_select/index');
var RadioInput = require('./subs/radio_input/index');
var Slider = require('./subs/slider/index');
var Progress = require('./subs/progress/index');
var ShortTip = require('./subs/short_tip/index');
var DisplayBox = require('./subs/display_box/index');
var DataList = require('./subs/data_list/index');
var Charge = require('./subs/charge/index');
var Adapter = require('./subs/adapter/index');

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.__ = props.__;

    this.state = {
      disabled: this.props.config.btn.disabled
    };

    ['onConfirm', 'onCancel', 'onAction'].forEach(m => {
      this[m] = this[m].bind(this);
    });
    // this.onPop = this.onPop.bind(this);
  }

  onAction(field, state) {
    this.props.onAction(field, state, this.refs);
  }

  initialize() {
    var props = this.props;

    return props.config.fields.map((m) => {
      m.label = this.__[m.field];
      m.__ = this.__;

      var subComs = {
        'text': Text,
        'tab': Tab,
        'input': Input,
        'input_pwd': InputPassword,
        'textarea': TextArea,
        'tip': Tip,
        'checkbox': Checkbox,
        'icon_label': IconLabel,
        'select': Select,
        'select_group': SelectGroup,
        'select_single': SelectSingle,
        'group_select': GroupSelect,
        'radio_input': RadioInput,
        'slider': Slider,
        'progress': Progress,
        'short_tip': ShortTip,
        'display_box': DisplayBox,
        'data_list': DataList,
        'charge': Charge,
        'adapter': Adapter
      };

      var Sub = subComs[m.type];

      return Sub ? <Sub key={m.field} ref={m.field} {...m} onAction={this.onAction} /> : null;
    });
  }

  componentDidMount() {
    this.props.onInitialize && this.props.onInitialize(this.refs);
  }

  onConfirm() {
    var isEmpty = false;
    var refs = this.refs;
    this.props.config.fields.forEach((m) => {
      if (m.required && (m.type === 'input' || m.type === 'textarea') && !refs[m.field].state.value && !refs[m.field].state.hide) {
        refs[m.field].setState({
          error: true
        });
        isEmpty = true;
      }
    });
    if (isEmpty) {
      return;
    }

    this.refs.btn.setState({
      disabled: true
    });
    this.props.onConfirm && this.props.onConfirm(refs, (success, errorMessage) => {
      if (success) {
        this.setState({
          visible: false
        });

        if(this.props.destroyPrevious) {
          var root = document.getElementById('modal-container');
          root.firstChild.classList.add('hide');
        }
      } else {
        if (errorMessage) {
          this.setState({
            errorMessage: errorMessage
          });
          this.refs.btn.setState({
            disabled: false
          });
        } else {
          this.refs.btn.setState({
            disabled: false
          });
        }
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
      btn = props.config.btn,
      __ = this.__;

    var title = props.config.title.map(function(m) {
      return __[m];
    }).join('');

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible}>
        <div className="modal-bd halo-com-modal-common">
          {this.initialize()}
          <div className={state.errorMessage ? 'modal-row tip-row' : 'modal-row tip-row hide'}>
            <UskinTip type="danger" content={state.errorMessage} showIcon={true} width={466} />
          </div>
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
