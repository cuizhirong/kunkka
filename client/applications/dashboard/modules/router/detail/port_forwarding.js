var React = require('react');
var __ = require('locale/client/dashboard.lang.json');

module.exports = {

  getTableConfig: function(router, portFrwds, that) {
    portFrwds = portFrwds.map((ele) => {
      ele.protocol = ele.protocol.toUpperCase();
      ele.operation = (
        <i className="glyphicon icon-delete"
          onClick={that.onDetailAction.bind(that, 'port_forwarding', 'delete', {
            router: router,
            portFrwd: ele
          })
        } />
      );

      return ele;
    });

    var config = {
      column: [{
        title: __.protocol,
        key: 'protocol',
        dataIndex: 'protocol'
      }, {
        title: __.source_port,
        key: 'source_port',
        dataIndex: 'outside_port'
      }, {
        title: __.target_ip,
        key: 'target_ip',
        dataIndex: 'inside_addr'
      }, {
        title: __.target_port,
        key: 'target_port',
        dataIndex: 'inside_port'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      dataKey: 'id',
      hover: true,
      data: portFrwds
    };

    return config;
  }

};
