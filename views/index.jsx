var React = require('react');
var Header = require('./header.jsx');

var Login = React.createClass({
    render: function() {
        var metadata = [{
            "icon": "overview",
            "label": "Overview",
            "selected": true
        }, {
            "icon": "instance",
            "label": "Server"
        }]
        return (
            <html>
                <Header title={this.props.title} style={['/static/uskin/uskin.min.css', '/static/style.css']} />
                <body>
                    <section className="main">
                        <ul className="menu">
                            {
                                metadata.map(function(obj) {
                                    return (
                                        <li>
                                            <a href="javascript:;" className={obj.selected?'selected':''}>
                                                <i className={'glyphicon icon-' + obj.icon}></i>
                                                <span>{obj.label}</span>
                                            </a>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <div id="content"></div>
                    </section>
                    <script src="/static/main-main.min.js"></script>
                </body>
            </html>
        )
    }
});

module.exports = Login;