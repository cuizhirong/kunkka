const React = require('react');
const {Button} = require('client/uskin/index');
const DetailMinitable = require('client/components/detail_minitable/index');
const addUserGrp = require('../pop/add_user_grp/index');
const rmUserGrp = require('../pop/rm_user_grp/index');

class UserGroup extends React.Component {
  constructor(props) {
    super(props);
  }

  getTableConfig(item, groups) {
    let props = this.props,
      __ = props.__;

    groups.forEach((grp, index) => {
      grp.showName = <a data-type="router" href={'/admin/user-group/' + grp.id}>{grp.name}</a>;
      grp.operation = <i className="glyphicon icon-delete" onClick={this.onClickDelete.bind(this, 'rm_grp', index)} />;

      let showRoles = [];
      grp.roles.forEach((r, i) => {
        if(i > 0) {
          showRoles.push(', ');
        }
        showRoles.push(<a data-type="router" key={r.id} href={'/admin/role'}>{r.name}</a>);
      });

      grp.showRoles = showRoles;
    });

    let tableConfig = {
      column: [{
        title: __.user_grp_name,
        key: 'name',
        dataIndex: 'showName'
      }, {
        title: __.id,
        key: 'id',
        dataIndex: 'id'
      }, {
        title: __.domain,
        key: 'domain',
        dataIndex: 'domain_id'
      }, {
        title: __.role,
        key: 'role',
        dataIndex: 'showRoles'
      }, {
        title: __.description,
        key: 'description',
        dataIndex: 'description'
      }, {
        title: __.operation,
        key: 'operation',
        dataIndex: 'operation'
      }],
      data: groups,
      dataKey: 'id',
      hover: true
    };

    return tableConfig;
  }

  onClickAdd() {
    addUserGrp(this.props.rawItem, null, this.props.refresh);
  }

  onClickDelete(key, index) {
    let obj = {
      project: this.props.rawItem,
      user_group: this.props.groups[index]
    };
    rmUserGrp(obj, null, this.props.refresh);
  }

  render() {
    let props = this.props,
      __ = props.__;

    let tableConfig = this.getTableConfig(props.rawItem, props.groups);

    return (
      <div>
        <DetailMinitable
          __={__}
          title={__['user-group']}
          defaultUnfold={true}
          tableConfig={tableConfig}>
          <Button value={__.add_user_grp} onClick={this.onClickAdd.bind(this, 'add_user_grp')} />
        </DetailMinitable>
      </div>
    );
  }

}

module.exports = UserGroup;
