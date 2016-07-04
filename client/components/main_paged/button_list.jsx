require('./style/index.less');

var React = require('react');
var {Button, DropdownButton} = require('client/uskin/index');

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      btns: {}
    };
  }

  componentWillMount() {
    this.formateBtns(this.props.btns);
  }

  // componentWillReceiveProps(nextProps) {
  //   this.formateBtns(nextProps.btns);
  // }

  formateBtns(btns) {
    var formatedBtns = {};
    btns.forEach((btn) => {
      if (btn.dropdown) {
        btn.dropdown.items.forEach((item) => {
          item.items.forEach((_item) => {
            _item.type = 'dropdown';
            formatedBtns[_item.key] = _item;
          });
        });
      } else {
        formatedBtns[btn.key] = btn;
      }
    });

    this.setState({
      btns: formatedBtns
    });
  }

  onClickDropdownBtn(e, item) {
    this.props.onAction('btnList', 'click', {
      key: item.key
    });
  }

  onClickBtnList(e, key) {
    this.props.onAction('btnList', 'click', {
      key: key
    });
  }

  render() {
    var btns = this.props.btns;

    return (
      <div className="btn-list">
        {btns.map((btn, index) =>
          btn.dropdown ?
            <DropdownButton
              key={index}
              disabled={btn.disabled}
              buttonData={btn}
              dropdownItems={btn.dropdown.items}
              dropdownOnClick={this.onClickDropdownBtn.bind(this)} />
          : <Button
              key={btn.key}
              value={btn.value}
              btnKey={btn.key}
              type={btn.type}
              disabled={btn.disabled}
              iconClass={btn.icon}
              initial={true}
              onClick={this.onClickBtnList.bind(this)} />
        )}
      </div>
    );
  }
}

module.exports = Detail;
