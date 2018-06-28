const React = require('react');
const ReactDOM = require('react-dom');

const {Tooltip} = require('client/uskin/index');

let tooltipHolder;

const types = ['CentOS', 'Red Hat', 'Ubuntu', 'Windows', 'Fedora', 'OpenSUSE',
  'SLES', 'Debian', 'Arch', 'FreeBSD', 'Gentoo', 'CoreOS', 'TFCloud'];

class ImageSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedKey: 'image', //系统镜像还是主机快照
      selectedBitKey: 'sixFour', //64位还是32位
      selectedSixFourBitType: '', //镜像64Bit类型CentOS等
      selectedThreeTwoBitType: '', //镜像32Bit类型CentOS等
      selectedSixFourImage: {}, //选中的64位镜像,
      selectedThreeTwoImage: {}, //选中的32位镜像
      sixFourAvialImage: {}, //可用的64位镜像
      threeTwoAvialImage: {}, //可用的32位镜像
      availSnapshot: {}, //可用的主机快照
      selectedSnapshot: {}
    };

    try {
      tooltipHolder = document.createElement('div');
      tooltipHolder.id = 'tooltip_holder';
      document.body.appendChild(tooltipHolder);
    } catch(e) {
      return;
    }
  }

  componentWillReceiveProps(nextProps) {
    let sixFourImages = [],
      threeTwoImages = [];

    //将镜像根据64bit或者32bit分类
    nextProps.prevState.images.forEach(image => {
      if (image.architecture) {
        if (image.architecture === 'x86_64') sixFourImages.push(image);
        else if (image.architecture === 'i386') threeTwoImages.push(image);
      } else {
        sixFourImages.push(image);
      }
    });

    this.setState({
      sixFourAvialImage: this.getAvialImage(sixFourImages),
      threeTwoAvialImage: this.getAvialImage(threeTwoImages),
      availSnapshot: nextProps.prevState.snapshots
    });
  }

  //镜像按照类别分类(CentOS, Window等)
  getAvialImage(images) {
    let avialImage = {};
    const typeList = types.map(type => type.toLocaleLowerCase());
    images.forEach(image => {
      if (image.os_distro && typeList.indexOf(image.os_distro) !== -1) {
        if (!avialImage[image.os_distro]) avialImage[image.os_distro] = [];
        avialImage[image.os_distro].push(image);
      } else {
        if (!avialImage.TFCloud) avialImage.TFCloud = [];
        avialImage.TFCloud.push(image);
      }
    });

    return avialImage;
  }

  componentDidUpdate() {
    let bitEles = document.querySelectorAll('.bit');

    // 镜像hover的时候出现可以选择的版本
    bitEles.forEach(ele => {
      ele.onmouseenter = function() {
        ele.lastChild.className = 'bit-detail';
      };

      ele.onmouseleave = function() {
        ele.lastChild.className = 'hide';
      };
    });
  }

  // 镜像选择切换系统镜像, 主机快照
  onClickTab(key) {
    this.setState({
      selectedKey: key
    }, this.props.onChange && this.props.onChange(key, 'imageType'));
  }

  // 切换64Bit, 32Bit
  onClickBitTab(key) {
    this.setState({
      selectedBitKey: key
    }, () => {
      let func = this.props.onChange;
      if (key === 'sixFour') func && func(this.state.selectedSixFourImage, 'image');
      else func && func(this.state.selectedThreeTwoImage, 'image');
    });
  }

  // 切换选中的镜像
  onBitClick(type, item, e) {
    let bitType = 'selectedSixFourBitType',
      selectedImage = 'selectedSixFourImage';

    if (this.state.selectedBitKey === 'threeTwo') {
      bitType = 'selectedThreeTwoBitType';
      selectedImage = 'selectedThreeTwoImage';
    }
    this.setState({
      [bitType]: type,
      [selectedImage]: item
    }, this.props.onChange && this.props.onChange(item, 'image'));

    //选中某个镜像时镜像列表收起
    if (e.target.parentNode.className === 'bit-detail') e.target.parentNode.className = 'hide';
  }

  onMouseOverItem(name, e) {
    let ct = e.currentTarget;
    if(ct.scrollWidth > ct.clientWidth && name) {
      let style = {
        top: ct.getBoundingClientRect().top - 8 + 'px',
        left: ct.getBoundingClientRect().left - 72 + 'px',
        textAlign: 'center'
      };
      ReactDOM.render(<div className="tip-wrapper" style={style}>
        <Tooltip content={name} width={210} shape="top"/>
      </div>, tooltipHolder);
    }
  }

  onMouseLeaveItem() {
    if(tooltipHolder.childNodes.length > 0) {
      ReactDOM.unmountComponentAtNode(tooltipHolder);
    }
  }

  renderBit(props, state) {
    let typeLists = state.sixFourAvialImage,
      selectedBitType = state.selectedSixFourBitType,
      selectedImage = state.selectedSixFourImage;

    let sixFourClass = state.selectedBitKey === 'sixFour' ? 'tab-item selected' : 'tab-item',
      threeTwoClass = state.selectedBitKey === 'threeTwo' ? 'tab-item selected' : 'tab-item',
      sixFourFunc = state.selectedBitKey === 'sixFour' ? null : this.onClickBitTab.bind(this, 'sixFour'),
      threeTwoFunc = state.selectedBitKey === 'threeTwo' ? null : this.onClickBitTab.bind(this, 'threeTwo');

    if (state.selectedBitKey === 'threeTwo') {
      typeLists = state.threeTwoAvialImage;
      selectedBitType = state.selectedThreeTwoBitType;
      selectedImage = state.selectedThreeTwoImage;
    }

    return <div>
      <div className="tab-mini">
        <div className={sixFourClass}
          onClick={sixFourFunc}>{'64 bit OS'}</div>
        <div className={threeTwoClass}
          onClick={threeTwoFunc}>{'32 bit OS'}</div>
      </div>
      <div className="bit-all">
        {typeLists && Object.keys(typeLists).map(type => {
          let selected = selectedBitType === type,
            icon = 'glyphicon icon-' + type.replace(/\s/g, '').toLowerCase(),
            titleClassName = selected ? 'bit-title selected' : 'bit-title',
            typeClassName = selected ? 'bit-type selected' : 'bit-type',
            correctClassName = selected ? 'bit-correct' : 'hide',
            versionClassName = selected ? 'bit-version selected' : 'bit-version',
            iconClassName = icon,
            selectedVision = '';

          let listLength = typeLists[type].length;

          if (selected) iconClassName = icon + ' selected';
          else iconClassName = icon;

          if (listLength === 1) {
            selectedVision = typeLists[type][0].name;
          } else if (selected) {
            selectedVision = selectedImage.name;
          } else {
            selectedVision = __.select_version;
          }

          return <div key={type} className="bit">
            <div className={titleClassName} onClick={listLength > 1 ? null : this.onBitClick.bind(this, type, typeLists[type][0])}>
              <div><i className={iconClassName}></i></div>
              <div className="bit-content">
                <p className={typeClassName}>
                  {type === 'TFCloud' ? __.others : types.filter(t => t.toLocaleLowerCase() === type)[0]}
                </p>
                <p className={versionClassName}
                  onMouseOver={this.onMouseOverItem.bind(this, selectedVision)}
                  onMouseLeave={this.onMouseLeaveItem.bind(this)}>
                  {selectedVision}
                </p>
              </div>
              <div className={correctClassName}>
                <i className="glyphicon icon-correct"></i>
              </div>
            </div>
            <div className="hide">
              {listLength > 1 && typeLists[type].map(item =>
                <div key={item.id} className="detail" onClick={this.onBitClick.bind(this, type, item)}>
                  {item.name || '(' + item.id.substring(0, 8) + ')'}
                  {selectedImage && selectedImage.id === item.id && <i className="glyphicon icon-correct"></i>}
                </div>)}
            </div>
            </div>;})}
      </div>
    </div>;
  }

  onSnapshotClick(snapshot) {
    this.setState({
      selectedSnapshot: snapshot
    }, this.props.onChange && this.props.onChange(snapshot, 'snapshot'));
  }

  renderSnapshot(props, state) {
    let availSnapshot = state.availSnapshot;

    return <div className="bit-all snapshot">
      {availSnapshot && availSnapshot.map(snapshot => {
        let selected = state.selectedSnapshot && state.selectedSnapshot.id === snapshot.id,
          icon = 'glyphicon icon-' + (snapshot.os_distro ? snapshot.os_distro.replace(/\s/g, '').toLowerCase() : 'tfcloud'),
          titleClassName = selected ? 'bit-title selected' : 'bit-title',
          typeClassName = selected ? 'bit-type selected' : 'bit-type',
          correctClassName = selected ? 'bit-correct' : 'hide',
          versionClassName = selected ? 'bit-version selected' : 'bit-version',
          iconClassName = icon;

        if (selected) iconClassName = icon + ' selected';
        else iconClassName = icon;

        return <div key={snapshot.id} className="bit-snapshot">
          <div className={titleClassName} onClick={this.onSnapshotClick.bind(this, snapshot)}>
            <div><i className={iconClassName}></i></div>
            <div className="bit-content">
              <p className={typeClassName}>
                {snapshot.os_distro ? types.filter(t => t.toLocaleLowerCase() === snapshot.os_distro)[0] : __.others}
              </p>
              <p className={versionClassName}
                onMouseOver={this.onMouseOverItem.bind(this, snapshot.name)}
                onMouseLeave={this.onMouseLeaveItem.bind(this)}>
                {snapshot.name}
              </p>
            </div>
            <div className={correctClassName}>
              <i className="glyphicon icon-correct"></i>
            </div>
          </div>
        </div>;})}
    </div>;
  }

  render() {
    const state = this.state,
      props = this.props;

    //x86_64 i386

    //images.forEach(image => console.log(image.os_version + 'os_distro: ' + image.os_distro));

    let imageClass = state.selectedKey === 'image' ? 'tab-item selected' : 'tab-item',
      snapshotClass = state.selectedKey === 'snapshot' ? 'tab-item selected' : 'tab-item',
      imageFunc = state.selectedKey === 'image' ? null : this.onClickTab.bind(this, 'image'),
      snapshotFunc = state.selectedKey === 'snapshot' ? null : this.onClickTab.bind(this, 'snapshot');

    return <div className="image-select">
      <div className="tab">
        <div className={imageClass}
          onClick={imageFunc}>{__.system_image}</div>
        <div className={snapshotClass}
          onClick={snapshotFunc}>{__.inst_snapshot}</div>
      </div>
      {state.selectedKey === 'image' ?
        this.renderBit(props, state) :
        this.renderSnapshot(props, state)}
    </div>;
  }
}

module.exports = ImageSelect;
