require('./style/index.less');

var React = require('react');
var moment = require('client/libs/moment');
var getTime = require('client/utils/time_unification');
var Attach = require('../../modules/ticket/pop/create_ticket/attach');
var Adapter = require('client/components/modal_common/subs/adapter');
var __ = require('locale/client/ticket.lang.json');
var resources = '/static/assets/ticket/ticket_icon_2x.png';

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      replies: [],
      files: []
    };

    moment.locale(HALO.configs.lang);

    ['submitReply', 'onCancel'].forEach((m) => {
      this[m] = this[m].bind(this);
    });
  }

  componentWillMount() {
    this.setState({
      loading: this.props.url ? true : false,
      replies: this.props.rawItem.replies,
      files: this.props.rawItem.attachments
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      replies: nextProps.rawItem.replies,
      files: nextProps.rawItem.attachments
    });
  }

  onAction(actionType, data) {
    this.props.onAction && this.props.onAction('reply', actionType, data);
  }

  submitReply() {
    this.props.submitReply && this.props.submitReply(this);
    this.onAction('_detail');
  }

  onCancel() {
    this.props.onCancel && this.props.onCancel();
  }

  getContent(content) {
    var strBef, strAft;
    if (content.length > 12) {
      strBef = content.substring(0, 7);
      strAft = content.substring(content.length - 5, content.length);
      return strBef + '...' + strAft;
    } else {
      return content;
    }
  }

  render() {
    var item = this.props.rawItem,
      state = this.state,
      replies = state.replies,
      files = state.files,
      id = HALO.user.userId,
      role = HALO.user.roles[0].toLowerCase();

    var sortTime = function(name) {
      return function(o, p) {
        var a, b;
        if (typeof o === 'object' && typeof p === 'object' && o && p) {
          a = Date.parse(o[name]);
          b = Date.parse(p[name]);
          if (a === b) {
            return 0;
          }

          if (typeof a === typeof b) {
            return a < b ? -1 : 1;
          }
        }
      };
    };

    replies.sort(sortTime('createdAt'));

    return (
      <div className="halo-com-detail">
        <div className="detail-question">
          <div className="content-question">
            <div className="question-left">
              <div className="question-title">{item.title}</div>
              <div className="question-content">{__.ticket + __.type + ' : ' + __[item.type]}</div>
              <div className="question-content">{item.description}</div>
            </div>
            <div className="question-right">
              {replies.length === 0 ?
              '@' + __.no_reply
              : '#' + replies[replies.length - 1].owner.substring(0, 4)
                + ' @' + getTime(replies[replies.length - 1].updatedAt) + ' - ' + __.replied}</div>
          </div>
          <div className="question-attach">
            {files && files.map((file, index) => {
              var style = {
                background: 'url(' + file.url + ') no-repeat',
                backgroundSize: 'cover',
                width: '110px',
                height: '80px'
              };
              return (
                <div key={index} className="file_url" onClick={this.downloadFile}>
                  <a href={file.url} target="_blank">
                    <div style={style}></div>
                    <div>{this.getContent(file.url.substring(file.url.lastIndexOf('/') + 1))}</div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
        <div className="detail-reply">
          <div>
            {replies.map((reply, index) => {
              var classNameReply = 'reply',
                classNameMsg = 'msg';

              if(reply.owner === id) {
                classNameReply += ' reply-right';
                classNameMsg += ' msg-right';
              }
              if (reply.role && reply.role !== 'member') {
                classNameReply += ' admin';
              }
              return (
                <div key={index} className="reply-msg">
                  <div className={classNameReply}>
                    <img src={resources} />
                    <div className="reply-name">{reply.username}</div>
                  </div>
                  <div className={classNameMsg}>
                    <div className="reply-content">{reply.content}</div>
                    <div className="reply-update">{getTime(reply.updatedAt, null, 'HH:mm')}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {((item.status === 'proceeding' || item.status === 'pending') && HALO.user.userId === item.owner) || (item.status === 'proceeding' && (role === 'owner' || role === 'admin')) ?
            <div className="reply-text">
              {__.reply}
              <textarea ref="reply"/>
              <div className="reply-attach">
                <Adapter ref="upload" renderer={Attach}/>
              </div>
              <div className="detail-bottom">
                <button className="btn btn-submit" onClick={this.submitReply}>{__.submit}</button>
                <button className="btn btn-cancel" onClick={this.onCancel}>{__.cancel}</button>
              </div>
            </div>
          : ''}
        </div>
      </div>
    );
  }
}

module.exports = Detail;
