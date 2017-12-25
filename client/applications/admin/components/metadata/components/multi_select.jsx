const React = require('react');
const {DropdownButton, Button} = require('client/uskin/index');

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);

    const items = props.items.enum.map((item) => {
      return {
        key: item,
        title: item
      };
    });

    items.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });

    const operators = props.operators.map((op) => {
      return {
        title: op,
        key: op
      };
    });

    let tempItems = [];
    let initItems = [];
    let initOper;
    let reg = /^<[a-zA-Z-]{1,}> /;

    if(props.propValue !== undefined) {
      initOper = reg.exec(props.propValue)[0].slice(0, -1);
      tempItems = props.propValue.slice(initOper.length + 1).split(',');
    } else if(props.default !== undefined) {
      initOper = reg.exec(props.default)[0].slice(0, -1);
      tempItems = props.default.slice(initOper.length + 1).split(',');
    } else {
      tempItems = [];
      initOper = operators[0].key;
    }

    items.forEach((item, index) => {
      item.index = index;
      if(tempItems.indexOf(item.key) !== -1) {
        item.show = false;
        initItems.push(item);
      } else {
        item.show = true;
      }
    });

    const itemsBtnCfg = {
      buttonData: {
        value: props.title
      },
      dropdownStyle: {
        minWidth: 100,
        width: 150
      },
      dropdownItems: [
        {
          key: this.props.propKey,
          items: this.filterItems(items)
        }
      ],
      dropdownOnClick: this.onClickItem.bind(this)
    };

    const operBtnCfg = {
      buttonData: {
        value: initOper
      },
      dropdownStyle: {
        minWidth: 100,
        width: 100
      },
      dropdownItems: [
        {
          key: 'operators',
          items: operators
        }
      ],
      dropdownOnClick: this.onClickOper.bind(this)
    };


    this.state = {
      selectedItems: initItems,
      allItems: items,
      operator: initOper,
      itemsCfg: itemsBtnCfg,
      operCfg: operBtnCfg
    };
  }

  componentDidMount() {
    const props = this.props;
    const state = this.state;
    const value = state.operator + ' ' + this.getCurrItemStr(state.selectedItems);
    props.onPropValueChange(props.propKey, value);
  }

  filterItems(allItems) {
    return allItems.filter((item) => {
      return item.show === true;
    });
  }

  getCurrItemStr(items) {
    let itemsStr = '';
    items.forEach((instr) => {
      itemsStr += instr.key + ',';
    });
    return itemsStr.slice(0, -1);
  }

  onClickOper(evt, item) {
    const operCfg = this.state.operCfg;
    operCfg.buttonData.value = item.title;

    const props = this.props;
    const value = item.key + ' ' + this.getCurrItemStr(this.state.selectedItems);
    props.onPropValueChange(props.propKey, value);

    this.setState({
      operCfg: operCfg,
      operator: item.key
    });
  }

  // 把 item 添加到 selectedItems 数组，修改 item 的show, 更新 dropdownItems
  onClickItem(evt, item) {
    const state = this.state;
    const allItems = state.allItems;
    const selectedItems = state.selectedItems;
    const itemsCfg = state.itemsCfg;

    allItems[item.index].show = false;
    selectedItems.push(allItems[item.index]);

    const props = this.props;
    const value = state.operator + ' ' + this.getCurrItemStr(selectedItems);
    props.onPropValueChange(props.propKey, value);

    itemsCfg.dropdownItems[0].items = this.filterItems(allItems);

    this.setState({
      selectedItems: selectedItems,
      itemsCfg: itemsCfg,
      allItems: allItems
    });
  }

  // 从 selectedItems 移除 item，修改其 show, 更新 dropdownItems
  onRemoveItem(item, evt) {
    evt.stopPropagation();
    const state = this.state;
    const selectedItems = state.selectedItems;
    const allItems = state.allItems;
    const itemsCfg = state.itemsCfg;

    const index = selectedItems.findIndex((itm) => {
      return itm.index === item.index;
    });

    selectedItems.splice(index, 1);
    allItems[item.index].show = true;
    itemsCfg.dropdownItems[0].items = this.filterItems(allItems);

    this.setState({
      selectedItems: selectedItems,
      allItems: allItems,
      itemsCfg: itemsCfg
    });
  }

  render() {
    return (
      <div className="multi-select" onClick={this.props.showDescription}>
        <div>
          <span className="meta-title" alt={this.props.propKey}>
            {this.props.propKey}
          </span>
          <DropdownButton {...this.state.itemsCfg} />
          <Button {...this.props.btnConfig} />
        </div>
        <div>
          <span>Operator:</span>
          <DropdownButton {...this.state.operCfg} />
        </div>
        <div className="selected">
          {
            this.state.selectedItems.map((item) => {
              return (
                <div className="selected-item" key={item.index}>
                  <span>{item.title}</span>
                  <i className="glyphicon icon-close" onClick={this.onRemoveItem.bind(this, item)}></i>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}

module.exports = MultiSelect;
