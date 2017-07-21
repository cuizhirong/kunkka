var React = require('react');
var {Modal, Button, Tip} = require('client/uskin/index');
var __ = require('locale/client/admin.lang.json');
var request = require('../../request');
var getErrorMessage = require('../../../../utils/error_message');
var Item = require('./select_items.jsx');

var NumberItem = require('./subs/number.jsx');
var SelectItem = require('./subs/single-select.jsx');
var BooleanItem = require('./subs/boolean.jsx');
var StringItem = require('./subs/string.jsx');
var MultiSelect = require('./subs/multi-select.jsx');

const TITLE = __.update_metadata;

class ModalBase extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      tipContent: '',
      tipTitle: '',
      allProps: [],
      customValue: '',
      customDisabled: true,
      customError: false,
      error: false,
      isCommiting: true
    };

    this.mask = document.querySelector('.modal-mask');

    ['onUpdateMetadata', 'onCancel', 'changeCustom', 'onChangeDescription', 'onInOrDecrease', 'addCustomMetaData'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    const stringHolder = 'Customized';
    let props = [];
    let allProps = [];
    // customized item
    let o = {
      description: stringHolder,
      display_name: stringHolder,
      namespace: stringHolder,
      properties: {}
    };
    request.getAllMetaData().then((res) => {
      Object.keys(this.props.obj.metadata).forEach((m, i) => {
        res.forEach((r) => {
          Object.keys(r.properties).forEach((p) => {
            if(r.properties[p].metadata_name === m) {
              props.push(m);
              r.properties[p].select = true;
              r.properties[p].value = this.props.obj.metadata[m];
            }
            if(i === 0) {
              allProps.push(p);
            }
          });
        });
      });
      for (let m in this.props.obj.metadata) {
        if(!props.find(p => p === m)) {
          o.properties[m] = {
            description: m,
            metadata_name: m,
            title: m,
            type: 'string',
            value: this.props.obj.metadata[m],
            select: true
          };
          allProps.push(m);
        }
      }
      res.unshift(o);
      this.setState({
        ready: true,
        data: res,
        allProps: allProps,
        isCommiting: false
      });
    });
  }

  changeCustom(e) {
    let v = e.target.value;
    let allProps = this.state.allProps;
    let isValid = v && /\w+/.test(v) && !allProps.find(a => a === v.trim());
    this.setState({
      customValue: v,
      customDisabled: !isValid,
      customError: !isValid
    });
  }

  addCustomMetaData() {
    let data = this.state.data;
    let allProps = this.state.allProps;
    let key = this.state.customValue;
    if(this.state.customError) {
      return;
    }
    data[0].properties[key] = {
      description: key,
      metadata_name: key,
      select: true,
      title: key,
      type: 'string'
    };
    allProps.push(key);
    this.setState({
      allProps: allProps,
      data: data,
      customValue: '',
      customDisabled: true,
      customError: false
    });
  }

  onInOrDecrease(item, increase) {
    this.state.data.forEach((d) => {
      for (let p in d.properties) {
        let isValid = (item.prefix ? item.prefix : '') + p === item.metadata_name;
        if(isValid) {
          d.properties[p].select = increase ? true : false;
        }
      }
    });
    this.setState({
      data: this.state.data
    });
  }

  onChangeDescription(item) {
    this.setState({
      tipTitle: item.display_name ? item.display_name : item.title + (item.metadata_name ? ' (' + item.metadata_name + ') ' : ''),
      tipContent:  item.description
    });
  }

  onUpdateMetadata() {
    let allMetaData = [];
    let error;
    let finalData = [];
    let data = {
      set_metadata: {
        metadata: {}
      }
    };
    this.state.data.forEach((d) => {
      Object.keys(d.properties).forEach((p) => {
        if(d.properties[p].select) {
          allMetaData.push({
            key: d.properties[p].metadata_name,
            type: d.properties[p].type,
            value: this.refs[d.properties[p].metadata_name].state.value
          });
        }
        if(!d.properties[p].select && Object.keys(this.props.obj.metadata).find(m => m === d.properties[p].metadata_name)) {
          allMetaData.push({
            key: d.properties[p].metadata_name,
            type: 'delete',
            value: null
          });
        }
      });
    });
    error = allMetaData.some((a) => {
      if(a.type !== 'delete' && this.refs[a.key].state.error) {
        this.setState({
          isCommiting: false,
          error: true,
          tipContent: __.please_enter_correct
        });
      }
      return a.type !== 'delete' && this.refs[a.key].state.error;
    });
    if(error) {
      return;
    } else {
      this.setState({
        error: false,
        tipContent: __.tipContent,
        isCommiting: true
      });
    }
    finalData = allMetaData.filter((amd) => {
      return (amd.type === 'array' && amd.value.split('> ')[0] && amd.value.split('> ')[1]) || amd.type !== 'array';
    });
    finalData.forEach((f) => {
      data.set_metadata.metadata[f.key] = f.value ? String(f.value) : f.value;
    });
    request.updateMetaData(this.props.obj.id, data).then(() => {
      this.onCancel();
      this.props.callback && this.props.callback();
    }).catch((err) => {
      this.setState({
        isCommiting: false,
        error: true,
        tipContent: getErrorMessage(err)
      });
    });
  }

  renderContent() {
    let state = this.state;
    return <div className="row-wrapper">
      <div className="row">
        <div className="col-md-6">
          <div className="panel">
            <div className="panel-heading">{__.available_metadata}</div>
            <div className="panel-content">
              <ul className="items-wrapper">
                <li className="custom">
                  <input className={state.customError ? 'error' : ''} value={state.customValue} type="text" onChange={this.changeCustom} />
                  <Button value={__.custom} type="create" onClick={this.addCustomMetaData} disabled={state.customDisabled} />
                </li>
                {
                  state.data.map((d, i) => {
                    return <Item key={i} item={d} __={__} onChangeDescription={this.onChangeDescription} onAdd={this.onInOrDecrease} />;
                  })
                }
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="panel">
            <div className="panel-heading">{__.exist_metadata}</div>
            <div className="panel-content">
              <ul className="items-wrapper">
                {
                  state.data.map((d, i) => {
                    return Object.keys(d.properties).filter(dp => d.properties[dp].select).map((dp) => {
                      // component Number
                      if(d.properties[dp].type === 'number' || d.properties[dp].type === 'integer') {
                        let defalutValue = (function() {
                          if(d.properties[dp].value) {
                            return Number(d.properties[dp].value);
                          } else if(d.properties[dp].defalut) {
                            return Number(d.properties[dp].defalut);
                          }
                          return 0;
                        })();
                        return <NumberItem key={d.properties[dp].metadata_name} ref={d.properties[dp].metadata_name} onRemove={this.onInOrDecrease} value={defalutValue} data={d.properties[dp]} />;
                      } else if(d.properties[dp].enum && d.properties[dp].enum.length > 0 && d.properties[dp].operators && d.properties[dp].operators.length === 1) {
                        // component single select
                        return <SelectItem key={d.properties[dp].metadata_name} ref={d.properties[dp].metadata_name} onRemove={this.onInOrDecrease} data={d.properties[dp]} />;
                      } else if(d.properties[dp].type === 'boolean') {
                        // component boolean
                        return <BooleanItem key={d.properties[dp].metadata_name} ref={d.properties[dp].metadata_name} onRemove={this.onInOrDecrease} data={d.properties[dp]} />;
                      } else if(d.properties[dp].type === 'string' && !d.properties[dp].enum) {
                        // component string
                        return <StringItem key={d.properties[dp].metadata_name} ref={d.properties[dp].metadata_name} onRemove={this.onInOrDecrease} data={d.properties[dp]} />;
                      } else if(d.properties[dp].type === 'array') {
                        // component multi-select
                        return <MultiSelect key={d.properties[dp].metadata_name} ref={d.properties[dp].metadata_name} __={__} onRemove={this.onInOrDecrease} data={d.properties[dp]} />;
                      }
                    });
                  })
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="tip-wrapper">
        <Tip title={state.tipTitle} content={state.tipContent ? state.tipContent : __.metadata_tip_holder} type={state.error ? 'danger' : 'info'} />
      </div>
    </div>;
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  render() {
    var props = this.props;
    var state = this.state;

    return (
      <Modal ref="modal" {...props} title={TITLE} visible={state.visible} width={730}>
        <div className="modal-bd halo-com-modal-update-metadata">
          {
            state.ready ? <div className="content-wrapper">
              <div className="modal-content">
                <Tip content={__.metadata_tip} type="info" />
                {this.renderContent()}
              </div>
            </div> : <div className="loading-data"><i className="glyphicon icon-loading"></i></div>
          }
        </div>
        <div className="modal-ft halo-com-modal-update-metadata">
          <div>
            <div className="right-side">
              <Button value={__.update} onClick={this.onUpdateMetadata} disabled={state.isCommiting} />
              <Button value={__.cancel} onClick={this.onCancel} type="cancel" />
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

module.exports = ModalBase;
