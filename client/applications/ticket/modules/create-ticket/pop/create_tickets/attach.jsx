require('./style/index.less');

var React = require('react');
var __ = require('locale/client/ticket.lang.json');

class Attach extends React.Component {
  constructor(props) {
    super(props);
  }

  uploadFileFromBrowse() {
    console.log(this.refs.myfile.files[0]);
  }

  render() {

    var className = 'halo-pop-attach modal-row';
    if (this.props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (this.props.hide) {
      className += ' hide';
    }

    return (
      <div className={className}>
        <div className="attach-label">
          <input ref="myfile" id="myfile" type="file" onChange={this.uploadFileFromBrowse.bind(this)}/>
        </div>
        <div className="attach-info">
          <div className="format">{__.info_format}</div>
          <div className="info">{__.info}</div>
        </div>
      </div>
    );
  }
}

function popAttach(config) {
  return <Attach {...config} />;
}

module.exports = popAttach;
