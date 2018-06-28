const React = require('react');

const Slider = require('client/components/modal_common/subs/slider/index');
const { InputNumber } = require('client/uskin/index');

class StorageSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showDataDisk: false,
      dataDisks: [],
      systemDisk: {
        type: 'ssd',
        cap: 0
      }
    };

    this.onShowDataDisk = this.onShowDataDisk.bind(this);
  }

  //系统盘设置类型
  /*onChangeSystemDisk(e) {
    this.state.systemDisk.type = e.target.value;
    this.setState({
      systemDisk: this.state.systemDisk
    }, this.props.onChange && this.props.onChange(this.state.systemDisk, 'systemDisk'));
  }*/

  //系统盘设置容量
  onChangeSilder(field, state) {
    this.state.systemDisk.cap = state.value;
    this.setState({
      systemDisk: this.state.systemDisk
    }, this.props.onChange && this.props.onChange(this.state.systemDisk, 'systemDisk'));
  }

  //是否显示数据盘信息
  onShowDataDisk() {
    this.setState({
      showDataDisk: !this.state.showDataDisk
    });
  }

  //回调函数
  onFunc() {
    this.props.onChange && this.props.onChange(this.state.dataDisks, 'dataDisks');
  }

  //修改某个数据盘的数量
  onChangeNum(index, value) {
    this.state.dataDisks[index].number = value;
    this.setState({
      dataDisks: this.state.dataDisks
    }, this.onFunc());
  }

  //添加数据盘
  onAddDisk() {
    this.state.dataDisks.push({
      type: 'ssd',
      cap: 0,
      number:1
    });

    this.setState({
      dataDisks: this.state.dataDisks
    }, this.onFunc());
  }

  //删除某个数据盘
  onDeleteDisk(index) {
    this.state.dataDisks.splice(index, 1);
    this.setState({
      dataDisks: this.state.dataDisks
    }, this.onFunc());
  }

  //修改某个数据盘的类型(ssd, sata)
  /*onChangeDataDisk(index, e) {
    this.state.dataDisks[index].type = e.target.value;
    this.setState({
      dataDisks: this.state.dataDisks
    }, this.onFunc());
  }*/

  //修改某个数据盘的容量
  onChangeDataDiskSilder(index, field, state) {
    this.state.dataDisks[index].cap = state.value;
    this.setState({
      dataDisks: this.state.dataDisks
    }, this.onFunc());
  }

  render() {
    let dataDisks = this.state.dataDisks;

    return <div className="storage">
      <div className="system-disk">
        <span>{__.system_disk}</span>
        <div className="disk-content">
          <div className="modal-bd halo-com-modal-common">
            <Slider value={this.state.systemDisk.cap} min={0} max={100} unit={'GB'} onAction={this.onChangeSilder.bind(this)}/>
          </div>
        </div>
      </div>
      <div className="data-disk">
        <span>{__.data_disk}</span>
        { this.state.showDataDisk ?
          <i className="glyphicon icon-arrow-down" onClick={this.onShowDataDisk}/>
          : <i className="glyphicon icon-arrow-up" onClick={this.onShowDataDisk}/>}
        {
          this.state.showDataDisk ?
            dataDisks.map((d, index) => <div key={index}>
              <div className="disk-delete">
                <div></div>
                <span className="data-disk-index">{index + 1}</span>
                <span onClick={this.onDeleteDisk.bind(this, index)}>{'x'}</span>
              </div>
              <div className="disk-content ">
                <div className="modal-bd halo-com-modal-common">
                  <Slider value={d.cap} min={0} max={100} unit={'GB'} onAction={this.onChangeDataDiskSilder.bind(this, index)}/>
                </div>
                <div className="mini-input">
                  <InputNumber type="mini" value={d.number} min={1} max={100} onChange={this.onChangeNum.bind(this, index)}/>
                </div>
              </div>
            </div>) : null
        }
        { this.state.showDataDisk ?
          <div className="add-data-disk" onClick={this.onAddDisk.bind(this)}>
            <span className="icon">{'+'}</span>
            <span className="add-btn">{__.add_data + __.data_disk}</span>
          </div> : <div className="fold-data-disk">
            {dataDisks.map((disk, i) =>
              ' ( ' + disk.cap + ' GB, '
              + __.number + ': ' + disk.number + ' )'
              + (i === dataDisks.length - 1 ? '' : ', '))}
          </div>
        }
      </div>
    </div>;
  }
}

module.exports = StorageSelect;
