const React = require('react');

class Info extends React.Component {

  constructor(props) {
    super(props);

    this.__ = props.__;
  }

  render() {
    return (
      <div className="modal-row info-row" key="agree" >
        { this.__.agree_application_info_part1 }&nbsp;
        <span className="account-name" style={{ 'fontWeight': 'bolder' }}>
          { this.props.accountName }&nbsp;
        </span>
        { this.__.agree_application_info_part2 }
      </div>
    );
  }
}

function popInfo(props) {
  return <Info refs="agree" {...props} />;
}

module.exports = popInfo;
