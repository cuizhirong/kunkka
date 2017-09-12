require('./style/index.less');

const React = require('react');
const Table = require('client/uskin/index').Table;
const Button = require('client/uskin/index').Button;
const EditContent = require('../editable/edit_content.jsx');
const __ = require('locale/client/bill.lang.json');

class StageInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };

    this.onAction = this.onAction.bind(this);
  }

  isExist(arr, val) {
    return arr.some(function(arrVal) {
      return +val === arrVal.count;
    });
  }

  onChange(e) {
    //number check and whether value exist in data
    let regex = /^[0-9.]{1,}$/;
    this.setState({
      rangeClass: (regex.exec(this.refs.range.value) && !this.isExist(this.state.data, this.refs.range.value)) ? '' : 'error',
      valueClass: regex.exec(this.refs.price.value) ? '' : 'error'
    });
  }

  componentWillMount() {
    let data = [],
      value = this.props.value.sort((a, b) => {
        return a.count - b.count;
      });

    value.forEach((price) => {
      let o = {
        count: price.count,
        price: price.price
      };
      data.push(o);
    });
    this.setState({
      data: data,
      rangeClass: '',
      valueClass: ''
    });
  }

  componentWillUpdate() {
    this.props.onChange && this.props.onChange(this.state.data);
  }

  onConfirm(eventType, data) {
    switch(eventType) {
      case 'addlist':
        if(this.refs.range.value !== '' && this.refs.price.value !== '' && this.state.rangeClass !== 'error') {
          let price = {
            count: data.length === 0 ? 0 : +this.refs.range.value,
            price: this.refs.price.value
          };
          data.push(price);
          this.setState({
            data: data
          });
          this.clearInput();
        } else {
          this.setState({
            rangeClass: this.refs.range.value !== '' && !this.isExist(this.state.data, this.refs.range.value) ? '' : 'error',
            valueClass: this.refs.price.value !== '' ? '' : 'error'
          });
        }
        break;
      default:
        break;
    }
  }

  clearInput() {
    this.refs.range.value = '';
    this.refs.price.value = '';
  }

  colTableRender(columns) {
    columns.forEach((column) => {
      switch(column.key) {
        case 'range':
          column.render = (col, item, i) => {
            return (
              i === 0 ? '0' : <EditContent
                item={{content: item.count, index: i, actionType: col.key, isDelete: false}}
                onAction={this.onAction}
              />
            );
          };
          break;
        case 'price':
          column.render = (col, item, i) => {
            return (
              <EditContent
                item={{content: item.price, index: i, actionType: col.key, isDelete: true}}
                deleteItem={'delete'}
                onAction={this.onAction}
              />
            );
          };
          break;
        default:
          break;
      }
    });
  }

  onAction(actionType, data) {
    let _data = this.state.data;
    switch(actionType) {
      case 'range':
        if(data.newValue !== '') {
          _data[data.item.index].count = data.newValue;
          this.setState({
            data: _data
          });
        }
        break;
      case 'price':
        if(data.newValue !== '') {
          _data[data.item.index].price = data.newValue;
          this.setState({
            data: _data
          });
        }
        break;
      case 'delete':
        _data.splice(data.index, 1);
        this.setState({
          data: _data
        });
        break;
      default:
        break;
    }
  }

  render() {
    let columns = [{
      title: __.range,
      key: 'range',
      dataIndex: 'range'
    }, {
      title: __.price,
      key: 'price',
      dataIndex: 'price'
    }];

    this.colTableRender(columns);

    return (
      <div className="halo-pop-com-stageinput">
        <div className="stageinput-label">
          {this.props.required && <strong>*</strong>}
          {__[this.props.field]}
        </div>
        <div className="stageinput-content">
          <div className="price-table">
            <Table
              __={__}
              dataKey="count"
              column={columns}
              data={this.state.data}
            />
            <div className={'no-price-data ' + (this.state.data.length === 0 ? '' : 'price-hide')}>{__.no_price}</div>
          </div>
          <div className="input-wrapper">
            <input className={this.state.rangeClass} ref="range" placeholder={__.range} onChange={this.onChange.bind(this)} />
            <input className={this.state.valueClass} ref="price" placeholder={__.price} onChange={this.onChange.bind(this)} />
            <Button value={__.add} btnKey="create" type="create" onClick={this.onConfirm.bind(this, 'addlist', this.state.data)} />
          </div>
        </div>
      </div>
    );
  }
}

function popStageInput(config) {
  return <StageInput {...config} />;
}

module.exports = popStageInput;
