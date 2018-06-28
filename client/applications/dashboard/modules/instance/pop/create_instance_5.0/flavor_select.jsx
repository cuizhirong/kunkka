const React = require('react');

const unitConverter = require('client/utils/unit_converter');

class Flavor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedType: 'all', //配置类型(通用型, 计算型等)
      vcpu: 'all', //vcpu筛选项
      memory: 'all', //memory筛选项
      flavor: '' //选中的配置项
    };
  }

  componentDidMount() {
    document.getElementById('flavor-table').onmousewheel = function (e) {
      e = e || window.event;
      this.scrollTop += e.wheelDelta > 0 ? -6 : 6;

      if (this.scrollTop === 0 || this.scrollTop === (this.scrollHeight - 200 - 42)) {
        return true;
      }

      return false;
    };

    document.onmousewheel = function (e) {
      return true;
    };
  }

  //vcpu, memory筛选项
  onChangeType(key, e) {
    this.setState({
      [key]: e.target.value
    });
  }

  //改变table中的选中项
  onTable(item) {
    this.setState({
      flavor: item
    }, this.props.onChange && this.props.onChange(item, 'flavor'));
  }

  //根据vcpu, memory显示筛选结果
  getFlavors(flavors) {
    if (this.state.vcpu === 'all' && this.state.memory === 'all') {
      return flavors;
    } else if (this.state.vcpu === 'all' && this.state.memory !== 'all') {
      return flavors.filter(f => f.ram.toString() === this.state.memory );
    } else if (this.state.vcpu !== 'all' && this.state.memory === 'all') {
      return flavors.filter(f => f.vcpus.toString() === this.state.vcpu );
    } else {
      return flavors.filter(f => f.ram.toString() === this.state.memory ).filter(i => i.vcpus.toString() === this.state.vcpu );
    }
  }

  //渲染table表及其数据
  renderTable(props, state) {
    const column = [{
      title: __.name,
      dataIndex: 'name',
      key: 'name'
    }, {
      title: __.cpu,
      dataIndex: 'vcpus',
      key: 'vcpu'
    }, {
      title: __.memory,
      dataIndex: 'ram',
      key: 'ram'
    }];

    if (state.selectedType === 'all') {
      column.push({
        title: __.type,
        dataIndex: 'type',
        key: 'type'
      });
    }

    let flavor = state.flavor,
      prevState = props.prevState,
      value = '',
      type = '',
      flavors = [];

    switch(state.selectedType) {
      case 'all':
        flavors = this.getFlavors(prevState.flavors);
        break;
      case 'general':
        flavors = this.getFlavors(prevState.generalFlavors);
        break;
      case 'compute':
        flavors = this.getFlavors(prevState.computeFlavors);
        break;
      case 'memory':
        flavors = this.getFlavors(prevState.memoryFlavors);
        break;
      default:
        flavors = this.getFlavors(prevState.otherFlaovrs);
    }

    return <div className="flavor-table" id="flavor-table">
      <div className="table-header">
        <div className="checkbox">
          <input type="checkbox"/>
        </div>
        {
          column.map((col, index) => {
            return (
              <div key={col.key}>
                <span className="title">
                  {col.title}
                </span>
              </div>
            );
          })
        }
      </div>
      {
        flavors && (flavors.length > 0 ? flavors.map((item, index) => {
          let key = item.id;
          let checked = flavor.id === key;

          return (
            <div key={key} className={'table-body' + (checked ? ' selected' : '')} onClick={this.onTable.bind(this, item)}>
              <div className="checkbox">
                <input value={key}
                  type="checkbox"
                  onChange={() => {}}
                  checked={checked} />
              </div>
              {
                column.map((col, colIndex) => {
                  switch(col.key) {
                    case 'vcpu':
                      value = item[col.dataIndex] + ' vCPU';
                      break;
                    case 'ram':
                      value = unitConverter(item[col.dataIndex], 'MB').num + ' ' + unitConverter(item[col.dataIndex], 'MB').unit;
                      break;
                    case 'type':
                      switch(item.name.substr(0, 1)) {
                        case 'g':
                          value = __.general_type;
                          break;
                        case 'c':
                          value = __.compute_type;
                          break;
                        case 'm':
                          value = __.memory_type;
                          break;
                        default:
                          value = __.other_type;
                      }
                      break;
                    default:
                      value = item[col.dataIndex];
                      break;
                  }

                  return (
                    <div key={col.key}>
                      {value}
                    </div>
                  );
                })
              }
            </div>
          );
        }) : <div className="no-data">{__.no_resources.replace('{0}', type) + __.data}</div>)
      }
    </div>;
  }

  //设置选中哪个类型
  onClickTypeTab(type) {
    this.setState({
      selectedType: type
    });
  }

  //渲染Tab
  renderTab(props, state) {
    let allClass = state.selectedType === 'all' ? 'tab-item selected' : 'tab-item',
      generalClass = state.selectedType === 'general' ? 'tab-item selected' : 'tab-item',
      computeClass = state.selectedType === 'compute' ? 'tab-item selected' : 'tab-item',
      memoryClass = state.selectedType === 'memory' ? 'tab-item selected' : 'tab-item',
      othersClass = state.selectedType === 'other' ? 'tab-item selected' : 'tab-item',
      allFunc = state.selectedType === 'all' ? null : this.onClickTypeTab.bind(this, 'all'),
      generalFunc = state.selectedType === 'general' ? null : this.onClickTypeTab.bind(this, 'general'),
      computeFunc = state.selectedType === 'compute' ? null : this.onClickTypeTab.bind(this, 'compute'),
      memoryFunc = state.selectedType === 'memory' ? null : this.onClickTypeTab.bind(this, 'memory'),
      othersFunc = state.selectedType === 'other' ? null : this.onClickTypeTab.bind(this, 'other');

    return <div className="flavor-tab">
      <div className="tab-mini">
        <div className={allClass}
          onClick={allFunc}>{__.all}</div>
        <div className={generalClass}
          onClick={generalFunc}>{__.general_type}</div>
        <div className={computeClass}
          onClick={computeFunc}>{__.compute_type}</div>
        <div className={memoryClass}
          onClick={memoryFunc}>{__.memory_type}</div>
        <div className={othersClass}
          onClick={othersFunc}>{__.other_type}</div>
      </div>
    </div>;
  }

  render() {
    const prevState = this.props.prevState;

    let vcpus = prevState.vcpus.map(vcpu => ({
      id: vcpu,
      name: vcpu + ' vCPU'
    }));

    let memory = prevState.memory.map(m => ({
      id: m,
      name: unitConverter(m, 'MB').num + ' ' + unitConverter(m, 'MB').unit
    }));

    vcpus.unshift({
      id: 'all',
      name: __.all
    });

    memory.unshift({
      id: 'all',
      name: __.all
    });

    return <div className="flavor">
      <div className="flavor-search">
        <span className="search-label">{'v CPU'}</span>
        <select onChange={this.onChangeType.bind(this, 'vcpu')}>
          {
            vcpus && vcpus.map(function(v) {
              return <option key={v.id} value={v.id}>{v.name || '(' + v.id.substr(0, 8) + ')'}</option>;
            })
          }
        </select>
        <span className="search-label">{__.memory}</span>
        <select onChange={this.onChangeType.bind(this, 'memory')}>
          {
            memory && memory.map(function(v) {
              return <option key={v.id} value={v.id}>{v.name || '(' + v.id.substr(0, 8) + ')'}</option>;
            })
          }
        </select>
      </div>
      <div className="flavor-content">
        {this.renderTab(this.props, this.state)}
        {this.renderTable(this.props, this.state)}
      </div>
    </div>;
  }
}

module.exports = Flavor;
