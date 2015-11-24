var React = require('react');
var Header = require('./header.jsx');

var Login = React.createClass({
    render: function() {
        return (
            <head>
                <meta charSet={'utf-8'} />
                <meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
                <title>{this.props.title}</title>
                <link rel="shortcut icon" href="https://dn-ustack.qbox.me/favicon.ico" type="image/x-icon"/>
                {
                    this.props.style.map(function(style) {
                        return <link rel="stylesheet" href={style} />
                    })
                }
            </head>
        )
    }
});

module.exports = Login;