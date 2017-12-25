require('./style/index.less');
const React = require('react');
const {Button, Table, Tooltip} = require('client/uskin/index');
const Select = require('./components/select');
const InputText = require('./components/input_text');
const InputNumber = require('./components/input_number');
const MultiSelect = require('./components/multi_select');
const Checkbox = require('./components/checkbox');
const clone = require('client/utils/deep_clone');

class Metadata extends React.Component {

  constructor(props) {
    super(props);

    this.__ = props.__;

    this.obj = clone(this.props.obj);

    const allData = this.getAllMetadata(this.obj.metadataCatalog);

    this.state = {
      resourceType: this.props.resource_type,
      imageData: this.obj.item,
      catalog: this.obj.metadataCatalog,
      allMetadata: allData.allMetadata,
      existedMetadata: [],
      allKeys: allData.allKeys,
      customedProp: '',
      unavailableMetaKey: this.props.nonMetaProps,
      keyRepeat: false,
      description: {
        content: this.__.unselected_desc
      }
    };
  }


  /**
   * sava a copy of the catalog and normalize the data for use
   * @param {array} catalog namespace array
   */
  getAllMetadata(catalog) {
    const metadataList = [];
    const allKeys = {};  // save all property keys for search

    catalog.forEach((namespace, index) => {
      const propArr = [];
      // let prefix = '';
      // let hasPrefix = namespace.resource_type_associations.some((resourceType) => {
      //   if (resourceType.name === this.props.resource_type && resourceType.prefix) {
      //     prefix = resourceType.prefix;
      //     return true;
      //   }
      //   return false;
      // });

      if(namespace.objects) {
        namespace.objects.forEach((object, idx) => {
          const objPropArr = [];
          object.show = true;
          object.expandProps = false;
          object.originIdx = idx;

          // convert the properties object to an array
          for(let i in object.properties) {
            const property = object.properties[i];
            property.propKey = i;
            property.uniqueKey = namespace.namespace + i;
            property.show = true;
            property.originIdx = objPropArr.length;
            allKeys[i] = Object.assign({}, clone(property), { objectIdx: idx},
              { nsIdx: index });
            objPropArr.push(property);
          }
          object.propArr = objPropArr;
        });
      }

      if(namespace.properties) {
        for(let i in namespace.properties) {
          const property = namespace.properties[i];
          property.propKey = i;
          property.uniqueKey = namespace.namespace + i;
          property.show = true;
          property.originIdx = propArr.length;
          allKeys[i] = Object.assign({}, clone(property), { nsIdx: index });
          propArr.push(property);
        }
      }

      metadataList.push({
        originIdx: index,
        namespace: namespace.namespace,
        displayName: namespace.display_name || '',
        description: namespace.description || '',
        // hasPrefix: hasPrefix,
        // prefix: prefix,
        expandPropsOrObjs: false,
        show: true
      });

      if(namespace.properties) {
        metadataList[index].properties = namespace.properties;
        metadataList[index].propArr = propArr;
      }

      if(namespace.objects) {
        metadataList[index].objects = namespace.objects;
      }
    });

    return {
      allMetadata: metadataList,
      allKeys: allKeys
    };
  }

  componentWillMount() {
    if(this.state.imageData !== undefined) {
      this.initExistedMetadata();
    }
  }

  // if operation type is edit, filling existedMetadat array
  initExistedMetadata() {
    const state = this.state;
    const imageData = state.imageData;
    const unavailableMetaKey = state.unavailableMetaKey;
    const existed = state.existedMetadata;
    const allKeys = state.allKeys;
    const allMetadata = state.allMetadata;

    for(let i in imageData) {
      if(unavailableMetaKey.indexOf(i) === -1) {
        let prop;

        // property is customed
        if(allKeys[i] === undefined) {
          prop = {
            propKey: i,
            customed: true,
            uniqueKey: 'customed ' + i
          };
          allKeys[i] = prop;
        } else {
          prop = allKeys[i];
        }

        const copy = clone(prop);
        copy.propValue = imageData[i];
        existed.push(copy);

        if (prop.objectIdx !== undefined) {
          allMetadata[prop.nsIdx].objects[prop.objectIdx].propArr[prop.originIdx].show = false;
        } else if(prop.originIdx !== undefined){
          allMetadata[prop.nsIdx].propArr[prop.originIdx].show = false;
        }
      }
    }

    existed.sort((a, b) => {
      return a.propKey.localeCompare(b.propKey);
    });

    this.setState({
      existedMeta: existed,
      allKeys: allKeys,
      allMetadata: allMetadata
    });
  }

  // filter out items that have been added to the right
  getAvailMeta(allMeta) {
    let availMeta = clone(allMeta);

    availMeta = availMeta.filter((ns) => {
      if(ns.show) {
        if(ns.propArr) {
          ns.propArr = ns.propArr.filter((prop) => {
            return prop.show;
          });
        }

        if(ns.objects) {
          ns.objects = ns.objects.filter((obj) => {
            if(obj.show) {
              obj.propArr = obj.propArr.filter((prop) => {
                return prop.show;
              });
              return obj.propArr.length !== 0;
            } else {
              return false;
            }
          });
        }

        if(ns.propArr !== undefined && ns.objects === undefined) {
          return ns.propArr.length !== 0;
        } else if(ns.propArr === undefined && ns.objects !== undefined) {
          return ns.objects.length !== 0;
        } else {
          return ns.propArr.length !== 0 || ns.objects.length !== 0;
        }
      } else {
        return false;
      }

    });

    return availMeta;
  }

  // filter search function
  onFilterAvail(evt) {
    const value = evt.target.value.trim();
    const state = this.state;
    const namespaces = state.allMetadata;
    const existed = state.existedMetadata;
    const allKeys = state.allKeys;
    const lastProps = [];

    for (let i in allKeys) {
      const bingo = i.search(value) !== -1;
      bingo ? lastProps.push(allKeys[i]) : null;
    }

    // hide all ns, objects, props
    namespaces.forEach((ns, idx) => {
      ns.show = false;

      if(ns.objects) {
        ns.objects.forEach((obj) => {
          obj.show = false;
          obj.propArr.forEach((prop) => {
            prop.show = false;
          });
        });
      }

      if(ns.propArr) {
        ns.propArr.forEach((prop) => {
          prop.show = false;
        });
      }
    });

    // show matched ns, objects, props
    lastProps.forEach((prop) => {
      if(!prop.customed) {
        const nsIdx = prop.nsIdx;
        const objectIdx = prop.objectIdx;
        const originIdx = prop.originIdx;

        namespaces[nsIdx].show = true;

        if(objectIdx !== undefined) {
          namespaces[nsIdx].objects[objectIdx].show = true;
          namespaces[nsIdx].objects[objectIdx].propArr[originIdx].show = true;
        } else {
          namespaces[nsIdx].propArr[originIdx].show = true;
        }
      }
    });

    // filter existed props
    existed.forEach((prop) => {
      if(!prop.customed) {
        const nsIdx = prop.nsIdx;
        const objectIdx = prop.objectIdx;
        const originIdx = prop.originIdx;

        if(objectIdx !== undefined) {
          namespaces[nsIdx].objects[objectIdx].propArr[originIdx].show = false;
        } else {
          namespaces[nsIdx].propArr[originIdx].show = false;
        }
      }
    });

    this.setState({
      allMetadata: namespaces
    });
  }

  onModifyCustomed(evt) {
    let value = evt.target.value;
    const repeat = this.checkRepeat(value);

    this.setState({
      customedProp: value,
      keyRepeat: repeat
    });
  }

  checkRepeat(val) {
    return this.state.allKeys[val] !== undefined || this.state.unavailableMetaKey.indexOf(val) !== -1;
  }

  /**
   * toggle namespace's properties or objects display style
   * @param nsIdx namespace's index
   */
  onNamespaceClick(nsIdx, evt) {
    const description = this.state.description;
    const allMetadata = this.state.allMetadata;
    const namespace = allMetadata[nsIdx];
    namespace.expandPropsOrObjs = !namespace.expandPropsOrObjs;

    if(namespace.objects !== undefined) {
      namespace.objects.forEach((object) => {
        object.expandProps = false;
      });
    }

    this.setState({
      allMetadata: allMetadata,
      description: this.updateDescription(namespace.displayName, undefined, namespace.description, description)
    });
  }

  /**
   * toggle object's properties' display style
   * @param nsIdx namespace's index
   * @param objectIdx object's index
   */
  onObjectClick(nsIdx, objectIdx, evt) {
    evt.stopPropagation();
    const description = this.state.description;
    const allMetadata = this.state.allMetadata;
    const object = allMetadata[nsIdx].objects[objectIdx];
    const expandProps = object.expandProps;

    object.expandProps = !expandProps;

    this.setState({
      allMetadata: allMetadata,
      description: this.updateDescription(object.name, undefined, object.description, description)
    });
  }

  onPropertyClick(prop, evt) {
    evt.stopPropagation();
    const description = this.state.description;
    this.setState({
      description: this.updateDescription(prop.title, prop.propKey, prop.description, description)
    });
  }

  onCustomClick(evt) {
    evt.stopPropagation();
    const description = this.state.description;
    this.setState({
      description: this.updateDescription(undefined, undefined, this.__.unselected_desc, description)
    });
  }

  updateDescription(mainTitle, subtitle, content, description) {
    description.mainTitle = mainTitle;
    description.subtitle = subtitle;
    description.content = content;
    return description;
  }

  showDescription(prop) {
    const description = this.state.description;
    let main, sub, content;

    if(!prop.customed) {
      main = prop.title;
      sub = prop.propKey;
      content = prop.description;
    } else {
      content = this.__.unselected_desc;
    }

    this.setState({
      description: this.updateDescription(main, sub, content, description)
    });
  }

  onAddCustomed(evt) {
    let value = this.state.customedProp.trim();
    const existedMeta = this.state.existedMetadata;
    const allKeys = this.state.allKeys;
    existedMeta.push({
      propKey: value,
      uniqueKey: 'customed ' + value,
      customed: true
    });

    allKeys[value] = {
      value: '',
      propKey: value
    };

    this.setState({
      existedMetadata: existedMeta,
      customedProp: '',
      allKeys: allKeys
    });
  }

  /**
   * add whole namespace to right
   * @param ns namespace
   * @param evt
   * @param nsIdx namespace index
   */
  onAddNamespace(ns, evt, nsIdx) {
    evt.stopPropagation();

    const state = this.state;
    const existedMeta = state.existedMetadata;
    const allMeta = state.allMetadata;
    const description = state.description;

    let newState = {
      existed: existedMeta,
      all: allMeta
    };

    if(ns.propArr !== undefined) {
      ns.propArr.forEach((prop) => {
        newState = this.addProperty(prop, prop.originIdx, undefined, nsIdx, newState.existed, newState.all);
      });
    }

    if(ns.objects !== undefined) {
      ns.objects.forEach((obj) => {
        newState.all[nsIdx].objects[obj.originIdx].show = false;
        obj.propArr.forEach((prop) => {
          newState = this.addProperty(prop, prop.originIdx, obj.originIdx, nsIdx, newState.existed, newState.all);
        });
      });
    }

    newState.all[nsIdx].show = false;

    this.setState({
      existedMetadata: newState.existed,
      allMetadata: newState.all,
      description: this.updateDescription(ns.displayName, undefined, ns.description, description)
    });
  }

  onAddObject(object, nsIdx, evt, objectIdx) {
    evt.stopPropagation();

    const state = this.state;
    const existedMeta = state.existedMetadata;
    const allMeta = state.allMetadata;
    const description = state.description;
    let newState = {
      existed: existedMeta,
      all: allMeta
    };

    object.propArr.forEach((prop) => {
      newState = this.addProperty(prop, prop.originIdx, objectIdx, nsIdx, newState.existed, newState.all);
    });

    newState.all[nsIdx].objects[objectIdx].show = false;

    this.setState({
      existedMetadata: newState.existed,
      allMetadata: newState.all,
      description: this.updateDescription(object.name, undefined, object.description,
       description)
    });
  }

  /**
   * add a property to right
   * @param property
   * @param nsIdx the namespace's index of property
   * @param objectIdx the object's index of property
   * @param evt event
   * @param propIndex property's index
   */
  onAddProperty(property, nsIdx, objectIdx, evt, propIndex) {
    evt.stopPropagation();

    const state = this.state;
    const existedMeta = state.existedMetadata;
    const allMeta = state.allMetadata;
    const description = state.description;
    const newState = this.addProperty(property, propIndex, objectIdx, nsIdx, existedMeta, allMeta);

    this.setState({
      existedMetadata: newState.existed,
      allMetadata: newState.all,
      description: this.updateDescription(property.title, property.propKey, property.description, description)
    });
  }

  /**
   * add propery operation
   * @param existed state.existedMetadata for saving property
   * @param all state.allMetadata for updating property's visibility
   * @return newState's existedMeta and allMeta for setState function
   */
  addProperty(property, propIndex, objectIdx, nsIdx, existed, all) {
    const existedMeta = existed;
    const allMeta = all;
    // 保存副本
    const prop = clone(property);

    if(objectIdx !== undefined) {
      prop.objectIdx = objectIdx;
      allMeta[nsIdx].objects[objectIdx].propArr[propIndex].show = false;
    } else {
      allMeta[nsIdx].propArr[propIndex].show = false;
    }

    prop.nsIdx = nsIdx;
    existedMeta.push(prop);

    return {
      existed: existedMeta,
      all: allMeta
    };
  }

  onRemoveMetadata(property, evt, btnKey) {
    evt.stopPropagation();
    const state = this.state;
    const existedMeta = state.existedMetadata;
    const allMeta = state.allMetadata;
    const allKeys = state.allKeys;

    if(property.customed) {
      existedMeta.splice(btnKey, 1);
      delete allKeys[property.propKey];
    } else {
      const objectIdx = property.objectIdx;
      const nsIdx = property.nsIdx;
      const propIdx = property.originIdx;

      existedMeta.splice(btnKey, 1);

      if (objectIdx !== undefined) {
        allMeta[nsIdx].objects[objectIdx].propArr[propIdx].show = true;
        allMeta[nsIdx].objects[objectIdx].show = true;
      } else {
        allMeta[nsIdx].propArr[propIdx].show = true;
      }
      allMeta[nsIdx].show = true;
    }

    this.props.onModifyMetadata(property.propKey, undefined, true);

    this.setState({
      existedMetadata: existedMeta,
      allMetadata: allMeta,
      allKeys: allKeys
    }, () => {
      const repeat = this.checkRepeat(this.state.customedProp);
      this.setState({
        keyRepeat: repeat
      });
    });
  }

  onPropValueChange(propKey, value) {
    this.props.onModifyMetadata(propKey, String(value), false);
  }

  renderObjects(objects, expand, nsIdx) {
    return objects.map((object) => {
      // add object btn config
      const btnConfig = {
        value: '+',
        type: 'create',
        btnKey: String(object.originIdx),
        initial: true,
        size: 'xs',
        onClick: this.onAddObject.bind(this, object, nsIdx)
      };
      const expandProps = object.expandProps;

      return (
        <dl className={expand ? 'show-prop' : 'hide-prop'} key={object.originIdx}>
          <dt className="object-title" key={object.originIdx}
            onClick= {this.onObjectClick.bind(this, nsIdx, object.originIdx) }>
            <i className={ 'glyphicon icon-arrow-' + (expandProps ? 'down' : 'right') }></i>
            <span>{object.name}</span>
            <Button {...btnConfig} />
          </dt>
          {this.renderProperties(object.propArr, expandProps, nsIdx, object.originIdx)}
        </dl>
      );
    });
  }

  renderProperties(properties, expand, nsIdx, objectIdx) {
    return properties.map((property) => {
      // add property btn config
      const btnConfig = {
        value: '+',
        type: 'create',
        btnKey: String(property.originIdx),
        initial: true,
        size: 'xs',
        onClick: this.onAddProperty.bind(this, property, nsIdx, objectIdx)
      };

      return (
        <dd key={property.propKey} className={expand ? 'show-prop' : 'hide-prop'} onClick={this.onPropertyClick.bind(this, property)}>
          {property.title}
          <Button {...btnConfig} />
        </dd>
      );
    });
  }

  renderAvailTable(data) {
    const table = {};
    table.dataKey = 'namespace';
    table.loading = false;
    table.striped = true;
    table.column = [{
      title: (
        <div>
          <span>{this.__.available_metadata}</span>
          <input type="text" placeholder={this.__.filter} onChange={this.onFilterAvail.bind(this)} />
        </div>
      ),
      key: 'namespace'
    }];

    table.column[0].render = (col, item, index) => {
      // add namespace btn config
      const btnConfig = {
        value: '+',
        type: 'create',
        btnKey: String(item.originIdx),
        initial: true,
        size: 'xs',
        onClick: this.onAddNamespace.bind(this, item)
      };

      const expand = item.expandPropsOrObjs;

      let renderContent;

      if(index === 0) {
        renderContent = item.renderContent;
      } else {
        renderContent = (
          <dl className="namespace-block">
            <dt className="namespace-title" onClick={this.onNamespaceClick.bind(this, item.originIdx)}>
              <i className={ 'glyphicon icon-arrow-' + (expand ? 'down' : 'right') }></i>
              <span>{item.displayName}</span>
              <Button {...btnConfig} />
            </dt>
            {item.properties ? this.renderProperties(item.propArr, expand, item.originIdx, undefined) : null}
            {item.objects ? this.renderObjects(item.objects, expand, item.originIdx) : null}
          </dl>
        );
      }

      return renderContent;
    };

    // unshift customed metadata input
    const keyRepeat = this.state.keyRepeat;
    const customedBtnCfg = {
      value: '+',
      type: 'create',
      btnKey: 'customed',
      initial: true,
      size: 'xs',
      disabled: keyRepeat || !this.state.customedProp,
      onClick: this.onAddCustomed.bind(this)
    };

    data.unshift({
      namespace: 'customed',
      renderContent: (
        <div className="customed" onClick={this.onCustomClick.bind(this)}>
          <span>{this.__.custom}</span>
          <input type="text" value={this.state.customedProp} onChange={this.onModifyCustomed.bind(this)} className={keyRepeat ? 'key-repeat' : ''} />
          { keyRepeat ? <Tooltip hide={false} type="error" shape="bottom" content={this.__.duplicate_keys} /> : null }
          <Button {...customedBtnCfg} />
        </div>
      )
    });
    table.data = data;
    return <Table {...table} />;
  }

  renderExistedTable(data) {
    const table = {};
    table.dataKey = 'uniqueKey';
    table.loading = false;
    table.striped = true;
    table.column = [{
      title: this.__.existed_metadata,
      key: 'metadata'
    }];

    table.column[0].render = (col, item, index) => {
      // remove btn config
      const btnConfig = {
        value: '-',
        type: 'delete',
        btnKey: String(index),
        initial: true,
        size: 'xs',
        onClick: this.onRemoveMetadata.bind(this, item)
      };

      item.onPropValueChange = this.onPropValueChange.bind(this);
      item.showDescription = this.showDescription.bind(this, item);
      let renderContent;

      if(item.enum) {
        renderContent = <Select {...item} btnConfig={btnConfig} />;
      } else if(item.type === 'integer') {
        renderContent = <InputNumber {...item} btnConfig={btnConfig} />;
      } else if(item.type === 'array') {
        renderContent = <MultiSelect {...item} btnConfig={btnConfig} />;
      } else if(item.type === 'boolean') {
        renderContent = <Checkbox {...item} btnConfig={btnConfig} />;
      } else {
        renderContent = <InputText {...item} btnConfig={btnConfig} />;
      }

      return renderContent;
    };

    table.data = data;
    return <Table {...table} />;
  }

  render() {
    const visibility = this.props.displayKey === '1' ? 'show' : 'hide';

    return (
      <div className={'modal-metadata metadata-' + visibility} key="metadata">
        <div className="info">{this.__.metadata_info}</div>
        <div className="data-section">
          <div className="available-meta">
            {this.renderAvailTable(this.getAvailMeta(this.state.allMetadata))}
          </div>
          <div className="existed-meta">
            {this.renderExistedTable(this.state.existedMetadata)}
          </div>
        </div>
        <div className="metadata-info">
          <div className="title">
            <span className="main-title">
              {this.state.description.mainTitle}
            </span>
            <span className="subtitle">
              {this.state.description.subtitle ? '(' + this.state.description.subtitle + ')' : null}
              </span>
          </div>
          <div className="desc-content">{this.state.description.content}</div>
        </div>
      </div>
    );
  }
}

module.exports = Metadata;
