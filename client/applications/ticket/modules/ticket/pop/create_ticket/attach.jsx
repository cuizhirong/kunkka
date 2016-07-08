require('./style/index.less');

var React = require('react');
var __ = require('locale/client/ticket.lang.json');
var request = require('../../request');

class Attach extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      attachments: [],
      fileNames: [],
      uploadError: []
    };
  }

  uploadFileFromBrowse() {
    var file = this.refs.myfile.files[0];

    this.uploadFile(file);
  }

  uploadFile(file) {
    request.postFile(file).then((res) => {
      this.setState({
        attachments: this.state.attachments.concat(res.attachment_url),
        fileNames: this.state.fileNames.concat(file.name),
        uploadError: this.state.uploadError.concat(false)
      });
    }).catch((res) => {
      this.setState({
        fileNames: this.state.fileNames.concat('error'),
        uploadError: this.state.uploadError.concat(true)
      });
    });
  }

  deleteAttach(index) {
    this.state.attachments.splice(index, index + 1);
    this.state.fileNames.splice(index, index + 1);
    this.forceUpdate();
  }

  render() {
    var className = 'halo-pop-attach';
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
          <div className="attach-file">
            { this.state.fileNames.length ?
              this.state.fileNames.map((fileName, index) => {
                return (
                  <div key={index} className="attach">
                      <i className={this.state.uploadError[index] ? 'glyphicon icon-status-warning error' : 'glyphicon icon-log'} />{this.state.uploadError[index] ? __.upload_error : fileName}
                      <i className="glyphicon icon-delete" onClick={this.deleteAttach.bind(this, index)}/>
                  </div>);
              })
            : '' }
          </div>
        </div>
        <div className="attach-info">
          <div className="btn-browse">
            <a><i className="glyphicon icon-upload" />
              <div className="upload_file">{__.upload_files}</div>
              <input ref="myfile" name="attachment" className="myfile" type="file" onChange={this.uploadFileFromBrowse.bind(this)} />
            </a>
          </div>
          <div className="format">{__.info_format}</div>
          <div className="info">{__.info}</div>
        </div>
      </div>
    );
  }
}

function popAttach(config) {
  return <Attach ref="child" {...config} />;
}

module.exports = popAttach;
