require('./style/index.less');

const React = require('react');
const {Table} = require('client/uskin/index');
const __ = require('locale/client/admin.lang.json');

class ViewRouters extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let table = this.props.tableConfig;

    return (
      <div className="halo-module-view-routers" style={this.props.style}>
        <div className="detail-content">
          {
            table.data.length > 0 ?
              <Table refs="table" mini={true} {...table} />
            : <div className="table-with-no-data">
                <Table refs="table" mini={true} column={table.column} data={[]} />
                <p>
                  {__.no_routers}
                </p>
              </div>
          }
        </div>
      </div>
    );
  }

}

module.exports = ViewRouters;
