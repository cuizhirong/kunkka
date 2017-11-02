require('./style/style.less');
const React = require('react');

class Info extends React.Component {

  constructor(props) {
    super(props);

    this.__ = props.__;
  }

  render() {
    return (
      <div className="modal-row info-row refuse-info-row" key="refuse">
        { this.__.refuse_quota_application_info_part1 }&nbsp;
        <span className="account-name" style={{ 'fontWeight': 'bolder' }}>
          { this.props.accountName }&nbsp;
        </span>
        { this.__.refuse_quota_application_info_part2 }
      </div>
    );
  }
}

function popInfo(props) {
  return <Info refs="refuse" {...props} />;
}

module.exports = popInfo;
