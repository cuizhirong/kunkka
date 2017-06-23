require('../../style/index.less');
require('./style/index.less');

var React = require('react');
var uskin = require('client/uskin/index');
var Table = uskin.Table;
const copy = require('clipboard-plus');

class RelatedSources extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false
    };

    this.toggle = this.toggle.bind(this);
  }

  componentWillMount() {
    this.setState({
      toggle: this.props.defaultUnfold
    });
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  createAction(key) {
    this.onAction('create_' + key);
  }

  deleteAction(key, childItem) {
    this.onAction('delete_' + key, {
      childItem: childItem
    });
  }

  onClick(id) {
    copy(id);
  }

  onAction(actionType, data) {
    var props = this.props,
      tabKey = props.tabKey,
      rawItem = props.rawItem;

    var newData = data;
    if (!newData) {
      newData = {};
    }
    newData.rawItem = rawItem;

    this.props.onAction && this.props.onAction(tabKey, actionType, newData);
  }

  getContent(item, i) {
    var __ = this.props.__;
    switch(item.type) {
      case 'mini-table':
        var columns = item.content.column;
        if (!columns.some((column) => column.key === 'delete')) {
          columns.push({
            title: null,
            key: 'delete',
            dataIndex: 'deleteIcon',
            width: 36
          });

          item.content.data.forEach((data) => {
            data.deleteIcon = <i onClick={this.deleteAction.bind(this, item.key, data.childItem)} className="glyphicon icon-delete delete" />;
          });
        }

        return (
          <div key={i}>
            <div className="related-sources-title">
              <div>{item.title}</div>
              {!item.actionDisabled ?
                <a><i className="glyphicon icon-create create-action" onClick={this.createAction.bind(this, item.key)} /></a>
                : null
              }
            </div>
            {item.content.data.length > 0 ?
              <div className="related-sources-content">
                <Table
                  column={item.content.column}
                  data={item.content.data}
                  dataKey={item.content.dataKey}
                  hover={true}
                  mini={true}/>
              </div>
            : <div className="content-no-data">
                {__.no_associate + item.title}
              </div>
            }
          </div>
        );
      case 'list':
        return (
          <div key={i}>
            <div className="related-sources-title">
              <div>{item.title}</div>
            </div>
            <div className="related-sources-content">
              {item.content.length > 0 ?
                item.content.map((ele, index) =>
                  <div key={index} className="content-item-list">
                    <span className="item-key">{ele.key}</span>
                    <span className="item-data">
                      {ele.data}
                      {ele.type && ele.type.toLowerCase() === 'id' ? <i title="click to copy id!" className="glyphicon icon-copy copyid" onClick={this.onClick.bind(this, String(ele.data))} /> : ''}
                    </span>
                  </div>
                )
              : <div className="content-no-data">
                  {__.no_associate + item.title}
                </div>
              }
            </div>
          </div>
        );
      default:
        return (
          <div key={i}>
            <div className="related-sources-title">
              <div>{item.title}</div>
              {!item.actionDisabled ?
                <a><i className="glyphicon icon-create create-action" onClick={this.createAction.bind(this, item.key)}/></a>
                : null
              }
            </div>
            <div className="related-sources-content">
              {item.content.length > 0 ?
                item.content.map((ele, index) =>
                  <div key={index} className="content-item">
                    <i className={'glyphicon icon-' + item.icon} />
                    <span>{ele.data}</span>
                    {!item.actionDisabled ?
                      <i onClick={this.deleteAction.bind(this, item.key, ele.childItem)} className="glyphicon icon-delete delete" />
                      : null
                    }
                  </div>
                )
              : <div className="content-no-data">
                  {__.no_associate + item.title}
                </div>
              }
            </div>
          </div>
        );
    }
  }

  render() {
    var items = this.props.items;

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (this.state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-related-sources">
            {items.map((item, i) => this.getContent(item, i))}
          </div>
        </div>
      </div>
    );
  }

}

module.exports = RelatedSources;
