require('./style/index.less');

var React = require('react');

class TableDetail extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <table className="basic-props">
        <tbody>
          <tr>
            <th>title</th>
            <td>data</td>
          </tr>
          <tr>
            <th>title2</th>
            <td><a>data2</a></td>
          </tr>
          <tr>
            <th>title3</th>
            <td>
              <p>data3.1</p>
              <p>data3.2</p>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

}

module.exports = TableDetail;
