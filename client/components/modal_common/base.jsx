const React = require('react');
const {Modal, Button} = require('client/uskin/index');
const UskinTip = require('client/uskin/index').Tip;

const Input = require('./subs/input/index');
const InputPassword = require('./subs/input_pwd/index');
const Text = require('./subs/text/index');
const Tip = require('./subs/tip/index');
const Checkbox = require('./subs/checkbox/index');
const IconLabel = require('./subs/icon_label/index');
const TextArea = require('./subs/textarea/index');
const Select = require('./subs/select/index');
const SelectGroup = require('./subs/select_group/index');
const SelectSingle = require('./subs/select_single/index');
const Tab = require('./subs/tab/index');
const GroupSelect = require('./subs/group_select/index');
const RadioInput = require('./subs/radio_input/index');
const Slider = require('./subs/slider/index');
const Progress = require('./subs/progress/index');
const ShortTip = require('./subs/short_tip/index');
const DisplayBox = require('./subs/display_box/index');
const DataList = require('./subs/data_list/index');
const Charge = require('./subs/charge/index');
const Adapter = require('./subs/adapter/index');
const KeyValueTable = require('./subs/key_value_table/index');
const KeyValue = require('./subs/key_value/index');

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
    let props = this.props;

    return props.config.fields.map((m) => {
      m.label = this.__[m.field];
      m.__ = this.__;

      let subComs = {
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
        'adapter': Adapter,
        'key_value_table': KeyValueTable,
        'key_value': KeyValue
      };

      let Sub = subComs[m.type];

      return Sub ? <Sub key={m.field} ref={m.field} {...m} onAction={this.onAction} /> : null;
    });
  }

  componentDidMount() {
    this.props.onInitialize && this.props.onInitialize(this.refs);
  }

  onConfirm() {
    let isEmpty = false;
    let refs = this.refs;
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
    this.props.onConfirm && this.props.onConfirm(refs, (success, errorMessage, scrollToErrorMsg) => {
      if (success) {
        this.setState({
          visible: false
        });

        if(this.props.destroyPrevious) {
          let root = document.getElementById('modal-container');
          root.firstChild.classList.add('hide');
        }
      } else {
        if (errorMessage) {
          this.setState({
            errorMessage: errorMessage
          }, () => {
            if(scrollToErrorMsg) {
              this.refs['modal-bd'].scrollTop = this.refs['modal-bd'].scrollHeight;
            }
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
    this.props.onCancel && this.props.onCancel(this.refs);
  }

  render() {
    let props = this.props,
      state = this.state,
      btn = props.config.btn,
      __ = this.__;

    let title = props.config.title.map(function(m) {
      return __[m];
    }).join('');

    return (
      <Modal ref="modal" {...props} title={title} visible={state.visible}>
        <div className="modal-bd halo-com-modal-common" ref="modal-bd">
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
