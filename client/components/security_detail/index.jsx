require('../../style/index.less');
require('./style/index.less');

var React = require('react');
var {Button, ButtonGroup, Table, Tip} = require('client/uskin/index');

class BasicProps extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedKey: this.props.defaultKey,
      toggle: this.props.defaultUnfold
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle(e) {
    this.setState({
      toggle: !this.state.toggle
    });
  }

  onClickBtn(value) {
    this.setState({
      selectedKey: value
    });
    var sgImage = document.querySelector('.sg-image');
    switch(value) {
      case 'ingress':
        sgImage.classList.remove('sg-image-egress');
        sgImage.classList.add('sg-image-ingress');
        break;
      case 'egress':
        sgImage.classList.remove('sg-image-ingress');
        sgImage.classList.add('sg-image-egress');
        break;
      default:
        break;
    }
  }

  render() {
    var state = this.state,
      selectedKey = state.selectedKey,
      props = this.props,
      itemKeys = props.itemKeys,
      items = props.items,
      selectedItem = items[selectedKey];

    return (
      <div className="toggle">
        <div className="toggle-title" onClick={this.toggle}>
          {this.props.title}
          <i className={'glyphicon icon-arrow-' + (state.toggle ? 'up' : 'down')} />
        </div>
        <div className={'toggle-content' + (state.toggle ? ' unfold' : ' fold')}>
          <div className="halo-com-security-detail">
            <div className="sg-image sg-image-ingress">
              <span className="arrow-up"></span>
              <span className="arrow-left"></span>
              <span className="arrow-right"></span>
              <span className="arrow-circle"></span>
            </div>
            <div className="sg-data">
              <Tip title={selectedItem.tip.title} content={selectedItem.tip.content} type="info"/>
              <ButtonGroup>
                {itemKeys.map((keyName) =>
                  <Button
                    tag="div"
                    key={keyName}
                    value={items[keyName].value}
                    type="status"
                    initial={true}
                    selected={selectedKey === keyName}
                    onClick={this.onClickBtn.bind(this, keyName)}/>
                )}
              </ButtonGroup>
              <div className="create-btn">
                {this.props.children}
              </div>
              <Table
                mini={true}
                column={selectedItem.table.column}
                data={selectedItem.table.data}
                dataKey={'id'}
                hover={true}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

}

module.exports = BasicProps;
