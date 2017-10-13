const React = require('react');
const { Tip } = require('client/uskin/index');
const __ = require('locale/client/dashboard.lang.json');

let countId = 0;

class Modal extends React.Component {

  constructor(props) {
    super(props);

    ['addAlarm', 'removeAlarm', 'createNotification'].forEach((func) => {
      this[func] = this[func].bind(this);
    });
  }

  componentDidMount() {
    let lists = this.props.state.notificationLists;
    if (lists.length > 0) {
      countId = lists.length;
    }
  }

  findIndexById(array, id) {
    let index = -1;

    array.some((ele, i) => {
      if (ele.id === id) {
        index = i;
        return true;
      }
      return false;
    });

    return index;
  }

  addAlarm(e) {
    countId++;

    let lists = this.props.state.notificationLists;
    lists.push({
      id: countId,
      status: 'alarm',
      notification: 'none'
    });

    this.props.onChangeState('notificationLists', lists);
  }

  removeAlarm(id, e) {
    let lists = this.props.state.notificationLists;
    let index = this.findIndexById(lists, id);

    if (index > -1) {
      lists.splice(index, 1);
      this.props.onChangeState('notificationLists', lists);
    }
  }

  createNotification(id, e) {
    let func = this.props.createNotification;
    func && func(id, e);
  }

  onChangeStatus(id, e) {
    let lists = this.props.state.notificationLists;
    let index = this.findIndexById(lists, id);
    let status = e.target.value;

    if (index > -1) {
      lists[index].status = status;
      this.props.onChangeState('notificationLists', lists);
    }
  }

  onChangeNotification(id, e) {
    let lists = this.props.state.notificationLists;
    let index = this.findIndexById(lists, id);
    let notification = e.target.value;

    if (index > -1) {
      lists[index].notification = notification;
      this.props.onChangeState('notificationLists', lists);
    }
  }

  render() {
    const state = this.props.state;

    return (
      <div className="page set-notification">
        <div className="notification-box">
          <ul className="notification-list" style={state.hideError ? null : {maxHeight: 185}}>
            {state.notificationLists.map((ele) =>
              <li key={ele.id}>
                <span>{__.when_alarm_status_is}</span>
                <select value={ele.status} onChange={this.onChangeStatus.bind(this, ele.id)}>
                  <option value="alarm">{__.alarm}</option>
                  <option value="ok">{__.alarm_ok}</option>
                  <option value="insufficient_data">{__.data_insufficient}</option>
                </select>
                <span>{__.alarm_notify}</span>
                <select value={ele.notification} onChange={this.onChangeNotification.bind(this, ele.id)}>
                  <option value="none">{__.please_select}</option>
                  {
                    state.notifications.map((e, index) =>
                      <option value={e.name} key={e.name + index}>{e.name}</option>
                    )
                  }
                </select>
                <span className="create-notification create" onClick={this.createNotification.bind(this, ele.id)}>{__.create_notification}</span>
                <i className="glyphicon icon-remove" onClick={this.removeAlarm.bind(this, ele.id)} />
              </li>
            )}
          </ul>
        </div>
        <div className="add-notification">
          <span onClick={this.addAlarm}>
            <i className="glyphicon icon-create" />
            {__.add_notification}
          </span>
        </div>
        <div className={'error-tip-box' + (state.hideError ? ' hide' : '')}>
          <Tip content={state.errorMsg} type="danger" showIcon={true} width={805} />
        </div>
      </div>
    );
  }
}

module.exports = Modal;
