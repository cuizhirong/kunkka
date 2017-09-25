const React = require('react');
const {Modal, Button, InputNumber, Tip} = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');
const request = require('../../request');
const ShortTip = require('client/components/modal_common/subs/short_tip');
const getErrorMessage = require('client/applications/dashboard/utils/error_message');

class CreateModalBase extends React.Component {
  constructor(props) {
    super(props);
    this.title = props.obj && props.obj.type === 'preview' ? __.preview + __.stack : __.create + __.stack;

    let templateResource = [{
      name: __.file,
      id: 'file'
    }, {
      name: 'URL',
      id: 'url'
    }, {
      name: __.template,
      id: 'template'
    }, {
      name: __.direct_input,
      id: 'direct_input'
    }];

    let environmentSource = [{
      name: __.direct_input,
      id: 'direct_input'
    }];

    this.state = {
      name: '',
      visible: true,
      refresh: false,
      visibleAdmin: false,
      page: 1,
      url: '',
      directInput: '',
      type: 'file',
      value: '',
      fileName: '',
      template: '',
      timeout: '60',
      nextPage: false,
      errorMsg: '',
      hideError: true,
      pagingAni: false,
      adminValue: '',
      validateData: {},
      templateValue: '',
      templateData: [],
      customData: [],
      hideCreateError: true,
      createErrorMsg: '',
      templateResource: templateResource,
      environmentSource: environmentSource
    };

    ['onPaging', 'onChangeTemplate', 'onChangeUrl', 'onChangeData',
    'onChangeValue', 'onChangeFileName', 'onConfirm', 'templateType',
    'onChangeTemplateValue', 'showAdminPass', 'onChangeMeta', 'onChangeName',
    'onChangeTimeout', 'onClose', 'onChangeAdmin', 'validate'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentWillMount() {
    request.getContainer().then(res => {
      let data = [];
      res.forEach((d, index) => {
        data.push({
          id: d.name,
          name: d.name
        });
      });
      this.setState({
        templateData: data
      });
    }).catch(error => {
      if (error.status === 404) {
        request.initContainer().then(res => {
          this.setState({
            templateData: []
          });
        });
      }
    });
  }

  onClose() {
    this.setState({
      visible: false
    });
  }

  onChangeName(e) {
    this.setState({
      name: e.target.value
    });
  }

  onChangeMeta(value, e) {
    this[value] = e.target.value;
    this.setState({
      refresh: true
    });
  }

  onChangeTimeout(value) {
    this.setState({
      timeout: value
    });
  }

  onChangeAdmin(e) {
    this.setState({
      adminValue: e.target.value
    });
  }

  onChangeTemplate(e) {
    this.state.templateResource.some((ele) => {
      if (ele.id === e.target.value) {
        this.setState({
          type: e.target.value,
          templateValue: ''
        });
        if (ele.id === 'template' && this.state.templateData[0]) {
          this.setState({
            templateValue: this.state.templateData[0].id
          });
        }
        return true;
      }
      return false;
    });
  }

  onChangeUrl(e) {
    this.setState({
      url: e.target.value
    });
  }

  onChangeData(e) {
    this.setState({
      directInput: e.target.value
    });
  }

  onChangeValue(e) {
    this.setState({
      value: e.target.value
    });
  }

  onChangeFileName(e) {
    this.setState({
      fileName: e.target.value
    });
  }

  onChangeTemplateValue(e) {
    this.setState({
      templateValue: e.target.value
    });
  }

  validate(file, page) {
    let props = this.props, data = {}, labels = [],
      that = this;
    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function() {
      data.template = this.result;
      that.setState({
        nextPage: true,
        template: this.result
      });
      request.validate(data).then(res => {
        if (props.obj && props.obj.type === 'preview') {
          let url = HALO.configs.swift_url + '/' + HALO.user.projectId + '_template' + '/' + file.name;
          let xhr = new XMLHttpRequest();

          xhr.open('PUT', url, true);
          xhr.onreadystatechange = function () {
            that.setState({
              page: page,
              pagingAni: true,
              nextPage: false,
              validateData: res
            });
          };
          xhr.send(reader.result);
        } else {
          let customConstraint = [];
          for(let i in res.Parameters) {
            that[res.Parameters[i].Label] = res.Parameters[i].Default;
            if (res.Parameters[i].CustomConstraint) {
              labels.push(res.Parameters[i].Label);
              customConstraint.push(res.Parameters[i].CustomConstraint.split('.')[1]);
            }
          }
          let i = 0;
          request.getResourceData(customConstraint).then(_data => {
            for(let key in _data) {
              if (_data[key][0]) {
                that[labels[i]] = _data[key][0].id || _data[key][0].name;
              }
              i ++;
            }
            let url = '/proxy-swift/v1/' + HALO.configs.adminProjectId + '/' + HALO.user.projectId + '_template' + '/' + file.name;
            let xhr = new XMLHttpRequest();

            xhr.open('PUT', url, true);
            xhr.onreadystatechange = function () {
              that.setState({
                page: page,
                pagingAni: true,
                nextPage: false,
                customData: _data,
                validateData: res
              });
            };
            xhr.send(reader.result);
          });
        }
      }).catch(error => {
        that.setState({
          nextPage: false,
          hideError: false,
          errorMsg: getErrorMessage(error)
        });
      });
    };
  }

  onPaging(page) {
    let state = this.state, props = this.props, data = {}, labels = [];
    if (page === 2) {
      if (state.type === 'file') {
        let file = this.refs.file.files[0];
        this.validate(file, page);
      } else {
        switch(state.type) {
          case 'url':
            data.template_url = state.url;
            break;
          case 'template':
            data.template_url = HALO.configs.swift_url + '/v1/' + HALO.configs.adminProjectId + '/' + HALO.user.projectId + '_template' + '/' + state.templateValue;
            break;
          case 'direct_input':
            data.template = state.directInput;
            break;
          default:
            break;
        }

        this.setState({
          nextPage: true
        });
        request.validate(data).then(res => {
          if (props.obj && props.obj.type === 'preview') {
            this.setState({
              page: page,
              pagingAni: true,
              nextPage: false,
              validateData: res
            });
          } else {
            let customConstraint = [];
            for(let i in res.Parameters) {
              this[res.Parameters[i].Label] = res.Parameters[i].Default;
              if (res.Parameters[i].CustomConstraint) {
                labels.push(res.Parameters[i].Label);
                customConstraint.push(res.Parameters[i].CustomConstraint.split('.')[1]);
              }
            }
            let i = 0;
            request.getResourceData(customConstraint).then(_data => {
              for(let key in _data) {
                if (_data[key][0]) {
                  this[labels[i]] = _data[key][0].id || _data[key][0].name;
                }
                i ++;
              }
              this.setState({
                page: page,
                pagingAni: true,
                nextPage: false,
                customData: _data,
                validateData: res
              });
            });
          }
        }).catch(error => {
          this.setState({
            nextPage: false,
            hideError: false,
            errorMsg: getErrorMessage(error)
          });
        });
      }
    } else {
      this.setState({
        page: page,
        nextPage: false,
        pagingAni: true
      });
    }
  }

  showAdminPass(key) {
    this.setState({
      visibleAdmin: !this.state.visibleAdmin
    });
  }

  onConfirm() {
    let props = this.props, state = this.state,
      validateData = state.validateData,
      callback = this.props.callback,
      that = this,
      data = {};
    this.setState({
      nextPage: true
    });
    data.stack_name = state.name;
    data.timeout_mins = parseInt(state.timeout, 10);
    if (state.directInput) {
      data.template = state.directInput;
    } else if (state.url) {
      data.template_url = state.url;
    } else if (state.templateValue) {
      data.template_url = HALO.configs.swift_url + '/v1/' + HALO.configs.adminProjectId + '/' + HALO.user.projectId + '_template' + '/' + state.templateValue;
    } else {
      data.template = state.template;
    }
    if (state.value) {
      data.environment = state.value;
    }
    data.disable_rollback = !(document.getElementsByName('checkbox1')[0].checked);
    if (props.obj && props.obj.type === 'preview') {
      request.previewStack(data).then(res => {
        this.setState({
          page: 3,
          pagingAni: true,
          previewData: res
        });
      }).catch(err => {
        this.setState({
          hideCreateError: false,
          nextPage: false,
          createErrorMsg: getErrorMessage(err)
        });
      });
    } else {
      let param = validateData.Parameters;
      data.parameters = {};
      for(let i in param) {
        data.parameters[i] = this[param[i].Label];
      }
      request.createStack(data).then(res => {
        that.onClose();
        callback && callback();
      }).catch(err => {
        this.setState({
          hideCreateError: false,
          nextPage: false,
          createErrorMsg: getErrorMessage(err)
        });
      });
    }
  }

  renderTemplateResource(props, state) {
    return (
      <div className="row row-select">
        <div className="modal-label">
          <strong>*</strong>{__.template_resource}
        </div>
        <div className="modal-data">
          <select value={state.templateResource.id} onChange={this.onChangeTemplate}>
            {
              state.templateResource.map(ele =>
                <option key={ele.id} value={ele.id}>
                  {ele.name}
                </option>
              )
            }
          </select>
        </div>
      </div>
    );
  }

  templateType(state) {
    switch(state.type) {
      case 'file':
        return (
          <div className="row row-textarea">
            <div className="modal-label">
              {__.template_file}
            </div>
            <div className="modal-data">
              <input name="file" ref="file" key="template_data" accept=".yaml" type="file" onChange={this.onChangeFileName} />
            </div>
          </div>
        );
      case 'url':
        return (
          <div className="row row-input">
            <div className="modal-label">
              {__.template_url}
            </div>
            <div className="modal-data">
              <input key="template_url" value={state.url} onChange={this.onChangeUrl}/>
            </div>
          </div>
        );
      case 'direct_input':
        return (
          <div className="row row-textarea">
            <div className="modal-label">
              {__.template_data}
            </div>
            <div className="modal-data">
              <textarea key="template_data" value={state.directInput} onChange={this.onChangeData} />
            </div>
          </div>
        );
      default:
        return (
          <div className="row row-select">
            <div className="modal-label">
              {__.template}
            </div>
            <div className="modal-data">
              { state.templateData.length > 0 ?
                <select value={state.templateValue} onChange={this.onChangeTemplateValue}>
                  {
                    state.templateData.map(ele =>
                      <option key={ele.id} value={ele.id}>
                        {ele.name}
                      </option>
                    )
                  }
                </select> : <span>{__.no_template}</span>
              }
            </div>
          </div>
        );
    }
  }

  renderResource(props, state) {
    return (
      <div className="row-resource">
        {this.templateType(state)}
      </div>
    );
  }

  renderEnvironment(props, state) {
    return (
      <div className="row-resource">
        <div className="row row-select">
          <div className="modal-label">
            {__.environment_source}
          </div>
          <div className="modal-data">
            <select value={state.environmentSource.id} onChange={this.onChangeTemplate}>
              {
                state.environmentSource.map(ele =>
                  <option key={ele.id} value={ele.id}>
                    {ele.name}
                  </option>
                )
              }
            </select>
          </div>
        </div>
        <div className="row row-textarea">
          <div className="modal-label">
            {__.environment_data}
          </div>
          <div className="modal-data">
            <textarea key="environment_data" value={state.value} onChange={this.onChangeValue} />
          </div>
        </div>
        <div className={'error-tip-box' + (state.hideError ? ' hide' : '')}>
          <Tip content={state.errorMsg} type="danger" showIcon={true} width={470} />
        </div>
      </div>
    );
  }

  renderName(props, state) {
    return (
      <div className="row-resource">
        <div className="row row-input">
          <div className="modal-label">
            <strong>*</strong>{__.name}
          </div>
          <div className="modal-data">
            <input key="name" value={state.name} onChange={this.onChangeName}/>
          </div>
        </div>
        <div className="row row-input">
          <div className="modal-label">
            <strong>*</strong>{__.create + __.time_out}
          </div>
          <div className="modal-data">
            <InputNumber key="time" width={358} value={60} onChange={this.onChangeTimeout}/>
            <ShortTip label={__.unit_timeout} />
          </div>
        </div>
        <div className="row row-input">
          <div className="modal-label">
            <input type="checkbox" name="checkbox1" value="checkbox"/>
          </div>
          <div className="modal-data">
            <div className="label">{__.failed + __.rollback}</div>
          </div>
        </div>
      </div>
    );
  }

  renderMeta(props, state) {
    let param = state.validateData.Parameters,
      paramData = [],
      customConstraint = '';
    for(let i in param) {
      if (param[i].CustomConstraint) {
        customConstraint = param[i].CustomConstraint.split('.')[1];
        paramData.push(<div key={i} className="row row-input">
          <div className="modal-label">
            <span style={{display: !param[i].Default ? 'inline-block' : 'none'}}><strong>*</strong></span>{param[i].Label}
          </div>
          <div className="modal-data">
            <select value={state.customData[customConstraint].id || state.customData[customConstraint].name} onChange={this.onChangeMeta.bind(this, param[i].Label)}>
            {
              state.customData[customConstraint].map(ele =>
                <option key={ele.id || ele.name} value={ele.id || ele.name}>
                  {ele.name}
                </option>
              )
            }
            </select>
            <ShortTip label={param[i].ConstraintDescription} />
          </div>
        </div>);
      } else {
        paramData.push(<div key={i} className="row row-input">
          <div className="modal-label">
            <span style={{display: !param[i].Default ? 'inline-block' : 'none'}}><strong>*</strong></span>{param[i].Label}
          </div>
          <div className="modal-data">
            {
              param[i].Type === 'Number' ?
                <InputNumber key={i} width={344} max={param[i].MaxValue} min={param[i].MinValue} value={this[param[i].Label]} onChange={this.onChangeMeta.bind(this, param[i].Label)}/>
                : <input type="text" value={this[param[i].Label]} key={i} onChange={this.onChangeMeta.bind(this, param[i].Label)}/>
            }
            <ShortTip label={param[i].ConstraintDescription} />
          </div>
        </div>);
      }
    }
    return (
      <div className="row-resource">
        <div className="row row-input">
          <div className="modal-label">
            <strong>*</strong>{__.admin_pass}
          </div>
          <div className="modal-data">
             <input value={state.adminValue} type={state.visibleAdmin ? 'text' : 'password'} key="adminPass" onChange={this.onChangeAdmin}/>
             <i className="glyphicon icon-eye eye" onClick={this.showAdminPass}/>
          </div>
        </div>
        {paramData}
      </div>
    );
  }

  renderPreviewData(props, state) {
    let preview = state.previewData ? state.previewData.stack : {},
      baseProps = [], str = '',
      parameters = [], links = [],
      resources = [], outputs = [];
    for(let key in preview) {
      if (key === 'links') {
        preview[key].forEach((ele, index) => {
          links.push(
            <div key={index} className="row row-input">
              <div className="modal-label">
                {ele.rel}
              </div>
              <div className="modal-data">
                <span>{ele.href}</span>
              </div>
            </div>
          );
        });
      } else if (key === 'parameters') {
        for(let i in preview[key]) {
          parameters.push(
            <div key={i} className="row row-input">
              <div className="modal-label">
                {i}
              </div>
              <div className="modal-data">
                <span>{preview[key][i]}</span>
              </div>
            </div>
          );
        }
      } else if (key === 'resources') {
        if(preview[key].length !== 0) {
          preview[key].forEach((ele, index) => {
            for(let i in ele) {
              resources.push(
                <div key={i + index} className="row row-input">
                  <div className="modal-label">
                    {i}
                  </div>
                  <div className="modal-data">
                    <span>{JSON.stringify(ele[i])}</span>
                  </div>
                </div>
              );
            }
          });
        }
      } else if (key === 'outputs') {
        if(preview[key].length !== 0) {
          preview[key].forEach((ele, index) => {
            for(let i in ele) {
              outputs.push(
                <div key={i + index} className="row row-input">
                  <div className="modal-label">
                    {i}
                  </div>
                  <div className="modal-data">
                    <span>{JSON.stringify(ele[i])}</span>
                  </div>
                </div>
              );
            }
          });
        }
      } else {
        if (key === 'disable_rollback') {
          str = preview[key] ? 'True' : 'False';
        } else if (!preview[key]) {
          str = 'None';
        } else if (preview[key].constructor === Array && preview[key].length === 0) {
          str = '[]';
        } else {
          str = preview[key].toString();
        }
        baseProps.push(
          <div key={key} className="row row-input">
            <div className="modal-label">
              {key}
            </div>
            <div className="modal-data">
              <span>{str}</span>
            </div>
          </div>
        );
      }
    }
    return (
      <div>
        {baseProps}
        <div>
          <div className="param">{__.parameters}</div>
          <div>{parameters}</div>
        </div>
        <div>
          <div className="param">{__.links}</div>
          <div>{links}</div>
        </div>
        <div>
          <div className="param">{__.resource}</div>
          <div>{resources}</div>
        </div>
        <div>
          <div className="param">{__.output}</div>
          <div>{outputs}</div>
        </div>
      </div>
    );
  }

  renderError(props, state) {
    return (<div className={'error-tip-box' + (state.hideCreateError ? ' hide' : '')}>
      <Tip content={state.createErrorMsg} type="danger" showIcon={true} width={470} />
    </div>);
  }

  renderBtn(props, state, page) {
    if (page === 1) {
      let enable = state.type === 'url' && state.url || state.type === 'direct_input'
        && state.directInput || state.type === 'template' && state.templateValue
        || state.type === 'file' && state.fileName;
      return (
        <div className="right-side">
          <Button value={__.next} disabled={!enable || state.nextPage} type="create" onClick={this.onPaging.bind(this, 2)} />
        </div>
      );
    } else if (page === 2) {
      let enableConfirm;
      if (props.obj && props.obj.type === 'preview') {
        enableConfirm = state.name && state.timeout;
      } else {
        enableConfirm = state.name && state.timeout && state.adminValue;
      }
      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, 1)} />
          </div>
          <div className="right-side">
            <Button value={props.obj && props.obj.type === 'preview' ? __.preview : __.create} disabled={!enableConfirm || state.nextPage} type="create" onClick={this.onConfirm} />
          </div>
        </div>
      );
    } else if (page === 3){
      return (
        <div className="right-side">
          <Button value={__.cancel} type="cancel" onClick={this.onClose} />
        </div>
      );
    }
  }

  render() {
    let props = this.props,
      state = this.state,
      page = state.page,
      slideClass = '';
    if (state.pagingAni) {
      if (page === 1) {
        slideClass = ' move-out';
      } else if (page === 2) {
        slideClass = ' move-in';
      } else if (page === 3) {
        slideClass = ' move-to-three';
      }
    } else {
      slideClass = page === 1 ? '' : ' second-page';
    }

    return (
      <Modal ref="modal" {...props} title={this.title} visible={state.visible} width={540}>
        <div className="modal-bd halo-com-modal-create-stack">
          <div className={'page' + slideClass}>
            {this.renderTemplateResource(props, state)}
            {this.renderResource(props, state)}
            {this.renderEnvironment(props, state)}
          </div>
          <div className={'page' + slideClass}>
            {this.renderName(props, state)}
            {props.obj && props.obj.type === 'preview' ? '' : this.renderMeta(props, state)}
            {this.renderError(props, state)}
          </div>
          <div className={'page' + slideClass}>
            {this.renderPreviewData(props, state)}
          </div>
        </div>
        <div className="modal-ft halo-com-modal-create-stack">
          {this.renderBtn(props, state, page)}
        </div>
      </Modal>
    );
  }
}

module.exports = CreateModalBase;
