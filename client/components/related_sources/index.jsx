require('../../style/index.less');
require('./style/index.less');

var React = require('react');
var __ = require('i18n/client/lang.json');
var uskin = require('client/uskin/index');
var Table = uskin.Table;
var router = require('client/dashboard/cores/router');

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

  getContent(item, i) {
    var routerListener = (link, e) => {
      e.preventDefault();
      router.pushState(link);
    };

    var deleteAction = (ele, e) => {
      item.deleteAction && item.deleteAction(ele);
    };

    switch(item.type) {
      case 'mini-table':
        item.content.column.push({
          title: null,
          key: 'delete',
          dataIndex: 'deleteIcon',
          width: 36
        });

        item.content.data.forEach((data) => {
          data.deleteIcon = <i onClick={deleteAction.bind(null, data)} className="glyphicon icon-delete delete" />;
        });

        return (
          <div key={i}>
            <div className="related-sources-title">
              <div>{item.title}</div>
              <a><i className="glyphicon icon-create"/></a>
            </div>
            {item.content.data.length > 0 ?
              <div className="related-sources-content">
                <Table
                  column={item.content.column}
                  data={item.content.data}
                  hover={true}
                  mini={true}/>
              </div>
            : <div className="content-no-data">
                {__.no_associate + item.title}
              </div>
            }
          </div>
        );
      default:
        return (
          <div key={i}>
            <div className="related-sources-title">
              <div>{item.title}</div>
              <a><i className="glyphicon icon-create"/></a>
            </div>
            <div className="related-sources-content">
              {item.content.length > 0 ?
                item.content.map((ele, index) =>
                  <div key={index} className="content-item">
                    <i className={'glyphicon icon-' + item.icon} />
                    {ele.link ?
                      <a onClick={routerListener.bind(null, ele.link)}>{ele.data}</a>
                    : <span>{ele.data}</span>}
                    <i onClick={deleteAction.bind(null, ele)} className="glyphicon icon-delete delete" />
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
          <i className={'glyphicon icon-arrow-' + (this.state.toggle ? 'down' : 'up')} />
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
