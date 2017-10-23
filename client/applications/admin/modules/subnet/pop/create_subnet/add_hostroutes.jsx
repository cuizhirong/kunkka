require('./style/index.less');

let React = require('react');
let {Button} = require('client/uskin/index');
let __ = require('locale/client/admin.lang.json');

class AddHostRoutes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showsubs: JSON.parse(JSON.stringify(props.objHostRoutes)) || [],
      opsubs: [],
      renderValue: '',
      rendernexThop: ''
    };

    ['renderInput', 'onInputNextChange', 'onInputChange', 'onAddSubscriber', 'deleteSub'].forEach(m => {
      this[m] = this[m].bind(this);
    });
  }

  renderInput() {
    return (
      <div>
        <input id="input" ref="input" value={this.state.renderValue} placeholder={__.cidr} onChange={this.onInputChange}/>
        <input id="inputNext" ref="inputNext" value={this.state.rendernexThop} placeholder={__.descend} onChange={this.onInputNextChange}/>
      </div>
    );
  }

  onInputChange(e) {
    this.setState({
      renderValue: e.target.value
    });
  }

  onInputNextChange(e){
    this.setState({
      rendernexThop: e.target.value
    });
  }

  onAddSubscriber() {
    let hostValue = this.state.renderValue,
      nexThop = this.state.rendernexThop,
      testDest = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\/(\d|1\d|2\d|3[0-2])$/,
      testNesthop = /^(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))$/;
    if(!testDest.test(hostValue)) {
      document.getElementById('input').classList.add('error');
    } else if (!testNesthop.test(nexThop)) {
      document.getElementById('inputNext').classList.add('error');
    } else {
      document.getElementById('input').classList.remove('error');
      document.getElementById('inputNext').classList.remove('error');
      let data = {
        destination: hostValue,
        nexthop: nexThop
      };
      this.setState({
        showsubs: this.state.showsubs.concat(data),
        opsubs: this.state.opsubs.concat(Object.assign(data, {op: 'add'}))
      }, ()=> {
        this.setState({
          renderValue: '',
          rendernexThop: ''
        });
      });
    }
  }

  deleteSub(i) {
    let v = this.state.showsubs[i];
    this.state.showsubs.splice(i, 1);
    this.setState({
      showsubs: this.state.showsubs.filter(o => o !== v),
      opsubs: this.state.opsubs.concat(Object.assign(v, {op: 'delete'}))
    });
  }

  render() {
    let className = 'halo-pop-com-host-routes modal-row long-label-row';
    if (this.props.is_long_label) {
      className += ' label-row long-label-row';
    } else {
      className += ' label-row';
    }
    if (this.props.hide) {
      className += ' hide';
    }

    return (
      <div className={className}>
        <div>
          {__.host_routes}
        </div>
        <div className="host">
          {
            this.state.showsubs && this.state.showsubs.map((m, i) => {
              return (
                <div className="host-list" key={i}>
                  <span className="host-info">{m.destination}</span>
                  <span className="nexthop-info">{m.nexthop}</span>
                  <span className="delete">
                    <i className="glyphicon icon-delete msg" onClick={this.deleteSub.bind(this, i)}/>
                  </span>
                </div>);
            })
          }
          <div className="host-content">
            {this.renderInput()}
            <Button value={__.addto} onClick={this.onAddSubscriber} />
          </div>
        </div>
      </div>
    );
  }
}

function popHostroutes(config) {
  return <AddHostRoutes ref="hostroutes" {...config} />;
}

module.exports = popHostroutes;
