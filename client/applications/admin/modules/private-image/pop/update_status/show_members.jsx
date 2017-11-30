require('./style/index.less');

let React = require('react');
let request = require('../../request');
let {Table} = require('client/uskin/index');
let __ = require('locale/client/admin.lang.json');

class ShowMembers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true
    };
    ['onAction'].forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    request.getShared().then(_members => {
      request.getImageDetail(_members).then(images => {
        let members = _members.map((member, index) => ({
          id: member.image_id,
          member_id: member.member_id,
          name: images[index].name,
          owner: images[index].owner,
          status: member.status,
          operation: (<div className="operation">
            <span className="pending"
              style={{display: member.status === 'pending' ? 'none' : 'inline-block'}}
              onClick={this.onAction.bind(this, index, 'pending')}>{__.pending}</span>
            <span className="accept"
              style={{display: member.status === 'accepted' ? 'none' : 'inline-block'}}
              onClick={this.onAction.bind(this, index, 'accepted')}>{__.accept}</span>
            <span className="reject"
              style={{display: member.status === 'rejected' ? 'none' : 'inline-block'}}
              onClick={this.onAction.bind(this, index, 'rejected')}>{__.reject}</span>
          </div>)
        }));
        this.setState({
          data: members,
          loading: false
        });
      });
    });
  }

  onAction(index, action) {
    let that = this, callback = this.props.callback,
      data = {
        status: action
      };
    this.setState({
      loading: true
    });
    request.updateMember(this.state.data[index], data).then(res => {
      that.state.data[index].status = action;
      that.state.data[index].operation = (<div className="operation">
        <span className="pending"
          style={{display: action === 'pending' ? 'none' : 'inline-block'}}
          onClick={this.onAction.bind(this, index, 'pending')}>{__.pending}</span>
        <span className="accept"
          style={{display: action === 'accepted' ? 'none' : 'inline-block'}}
          onClick={this.onAction.bind(this, index, 'accepted')}>{__.accept}</span>
        <span className="reject"
          style={{display: action === 'rejected' ? 'none' : 'inline-block'}}
          onClick={this.onAction.bind(this, index, 'rejected')}>{__.reject}</span>
      </div>);
      callback && callback();
      this.setState({
        loading: false,
        data: that.state.data
      });
    });
  }

  render() {
    let loading = this.state.loading,
      data = this.state.data;
    let column = [{
      title: __.name,
      dataIndex: 'name',
      key: 'name'
    }, {
      title: __.owner,
      dataIndex: 'owner',
      key: 'owner'
    }, {
      title: __.status,
      dataIndex: 'status',
      key: 'status'
    }, {
      title: __.operation,
      dataIndex: 'operation',
      key: 'operation'
    }];
    return (
      <div className="halo-module-show-members">
        {loading ? <div className="loading glyphicon icon-loading"></div> : null}
        {data.length !== 0 && !loading ? <Table mini={true} dataKey="id" refs="table" column={column} data={data} /> : null}
        {data.length === 0 && !loading ? <div>{__.no_members}</div> : null}
      </div>
    );
  }
}

function popShow(config) {
  return <ShowMembers ref="showMembers" {...config} />;
}

module.exports = popShow;
