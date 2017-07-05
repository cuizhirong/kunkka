var React = require('react');
var __ = require('locale/client/dashboard.lang.json');

var DetailMinitable = require('client/components/detail_minitable/index');
var BasicProps = require('client/components/basic_props/index');
var {Button} = require('client/uskin/index');
var request = require('../request');
var t, time, resend;

var getErrorMessage = require('client/applications/dashboard/utils/error_message');

class DetailIndex extends React.Component {

  constructor(props) {
    super(props);
    this.wait = 60;
  }

  componentWillReceiveProps(nextProps) {
    resend && resend.classList.remove('hide');
    time && time.classList.add('hide');
    clearTimeout(t);
    this.wait = 60;
  }

  getBasicPropsItems(item) {
    var items = [{
      title: __.name,
      content: item.name
    }, {
      title: __.description,
      content: item.description
    }, {
      title: __.total_count,
      content: item.total_count
    }, {
      title: __.verified_count,
      content: <span style={{color: '#00afc8'}}>{item.verified_count}</span>
    }];

    return items;
  }

  times(i, sub) {
    this.countDown(i, this.wait);
    request.resendVerify(sub).then(() => {
    }).catch(error => {
      getErrorMessage(error);
    });
  }

  countDown(i, wait) {
    time = document.getElementById('time_detail' + i);
    resend = document.getElementById('resend_detail' + i);
    resend && resend.classList.add('hide');
    time && time.classList.remove('hide');
    wait--;
    if (time) {
      time.innerHTML = __.verifying + '(' + wait + 's)';
    }
    t = setTimeout(this.countDown.bind(this, i, wait), 1000);
    if ( wait <= 0 ){
      resend && resend.classList.remove('hide');
      time && time.classList.add('hide');
      clearTimeout(t);
    }
  }

  getDetailTableConfig(item) {
    var dataContent = [];
    item.subscriptions.forEach((element, index) => {
      var dataObj = {
        id: index + 1,
        category: 'Email',
        endpoint: element.subscriber.substr(7),
        status: <div>
            <span id={'time_detail' + index} className="time">{this.times.bind(this, index)}</span>
            <span id="status" style={{display: 'flex'}}>{element.confirmed ? <span style={{color: '#1eb9a5', flex: '1'}}>{__.verified}</span> : <span style={{flex: '1'}}>{__.unverified}</span>}
            {element.confirmed ? '' : <span id={'resend_detail' + index} className={element.confirmed ? 'hide' : 'resend'} title={__.resend}><i className="glyphicon icon-notification msg" onClick={this.times.bind(this, index, element)} /></span>}</span>
            <span id="timer" className="hide">{__.verifying}</span>
          </div>,
        operation: <i className="glyphicon icon-delete" onClick={this.onDetailAction.bind(this, 'description', 'rmv_endpoint', {
          rawItem: item,
          childItem: element
        })} />
      };
      dataContent.push(dataObj);
    });

    var tableConfig = {
      column: [{
        title: __.category,
        key: 'category',
        dataIndex: 'category'
      }, {
        title: __.endpoint,
        key: 'endpoint',
        dataIndex: 'endpoint'
      }, {
        title: __.status,
        key: 'status',
        dataIndex: 'status'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      data: dataContent,
      dataKey: 'id',
      hover: true
    };

    return tableConfig;
  }

  onDetailAction(tabKey, actionType, data) {
    this.props.onDetailAction && this.props.onDetailAction(tabKey, actionType, data);
  }

  render() {
    var basicPropsItem = this.getBasicPropsItems(this.props.rows),
      endpointConfig = this.getDetailTableConfig(this.props.rows);

    return (
      <div>
        <BasicProps
          title={__.basic + __.properties}
          defaultUnfold={true}
          tabKey={'description'}
          items={basicPropsItem}
          rawItem={this.props.rows}
          onAction={this.onDetailAction.bind(this)}
          dashboard={this.refs.dashboard ? this.refs.dashboard : null} />
        <DetailMinitable
          __={__}
          title={__.endpoint + __.list}
          defaultUnfold={true}
          tableConfig={endpointConfig ? endpointConfig : []}>
          <Button value={__.add_ + __.endpoint} onClick={this.onDetailAction.bind(this, 'description', 'add_endpoint', {
            rawItem: this.props.rows
          })}/>
        </DetailMinitable>
      </div>
    );
  }
}

module.exports = DetailIndex;
