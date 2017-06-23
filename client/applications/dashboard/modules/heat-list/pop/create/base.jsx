var React = require('react');
var {Modal, Button} = require('client/uskin/index');
var __ = require('locale/client/dashboard.lang.json');
var request = require('../../request');

const TITLE = __.create + __.stack;

class CreateModalBase extends React.Component {
  constructor(props) {
    super(props);

    var templateResource = [{
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

    var environmentSource = [{
      name: __.direct_input,
      id: 'direct_input'
    }];

    this.state = {
      visible: true,
      page: 1,
      url: '',
      directInput: '',
      type: 'file',
      value: '',
      fileName: '',
      pagingAni: false,
      templateValue: '',
      templateData: [],
      templateResource: templateResource,
      environmentSource: environmentSource
    };

    ['onPaging', 'onChangeTemplate', 'onChangeUrl', 'onChangeData',
    'onChangeValue', 'onChangeFileName', 'onConfirm', 'templateType',
    'onChangeTemplateValue'].forEach((func) => {
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
        request.createContainer().then(res => {
          this.setState({
            templateData: []
          });
        });
      }
    });
  }

  onChangeTemplate(e) {
    this.state.templateResource.some((ele) => {
      if (ele.id === e.target.value) {
        this.setState({
          type: e.target.value,
          templateValue: ''
        });
        if (ele.id === 'template') {
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
  }

  onChangeTemplateValue(e) {
    this.setState({
      templateValue: e.target.value
    });
  }

  onPaging(page) {
    var state = this.state, data = {};
    if (page === 2) {
      switch(state.type) {
        case 'url':
          data.template_url = state.url;
          break;
        case 'template':
          data.template_url = HALO.configs.swift_url + '/v1/AUTH_' + HALO.user.projectId + '/' + HALO.user.projectId + '/' + state.templateValue;
          break;
        case 'file':
          data.template_url = '';
          break;
        case 'direct_input':
          data.template = state.directInput;
          break;
        default:
          break;
      }

      request.validate(data).then(res => {
        this.setState({
          page: page,
          pagingAni: true
        });
      }).catch(error => {
        console.log(error);
      });
    } else {
      this.setState({
        page: page,
        pagingAni: true
      });
    }
  }

  onConfirm() {
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
              <input ref="file" key="template_data" value={state.fileName} type="file" onChange={this.onChangeFileName} />
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
      </div>
    );
  }

  renderBtn(props, state, page) {
    if (page === 1) {
      let enable = state.type === 'url' && state.url || state.type === 'direct_input' && state.directInput || state.type === 'template' && state.templateValue;

      return (
        <div className="right-side">
          <Button value={__.next} disabled={!enable} type="create" onClick={this.onPaging.bind(this, 2)} />
        </div>
      );
    } else {
      return (
        <div>
          <div className="left-side">
            <Button value={__.prev} type="cancel" onClick={this.onPaging.bind(this, 1)} />
          </div>
          <div className="right-side">
            <Button value={__.create} disabled={true} type="create" onClick={this.onConfirm} />
          </div>
        </div>
      );
    }
  }

  render() {
    var props = this.props,
      state = this.state,
      page = state.page,
      slideClass = '';

    if (state.pagingAni) {
      slideClass = page === 1 ? ' move-out' : ' move-in';
    } else {
      slideClass = page === 1 ? '' : ' second-page';
    }
    return (
      <Modal ref="modal" {...props} title={TITLE} visible={state.visible} width={540}>
        <div className="modal-bd halo-com-modal-create-stack">
          <div className={'page' + slideClass}>
            {this.renderTemplateResource(props, state)}
            {this.renderResource(props, state)}
            {this.renderEnvironment(props, state)}
          </div>
          <div className={'page' + slideClass}>
            {this.renderTemplateResource(props, state)}
            {this.renderResource(props, state)}
            {this.renderEnvironment(props, state)}
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
