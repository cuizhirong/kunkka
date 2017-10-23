const React = require('react');
const constant = require('./constant');

class TabStep extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {step} = this.props;

    return (
      <div className="tab-step">
        {
          constant.stepData.map(ele =>
            <div key={ele.key} className={step.indexOf(ele.key) !== -1 ? 'checked' : ''}>
              {ele.value}
            </div>
          )
        }
      </div>
    );
  }
}

module.exports = TabStep;
