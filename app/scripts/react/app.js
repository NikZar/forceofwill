'use strict';

var React = require('react');

var page = {
	backgroundColor: "#ffa060",
	width: "100%",
	height: "100%"
};

var container = {
	display: "flex",
	flexDirection: "row",
	alignContent: "center",
	justifyContent: "center",
	height: "100%"
};

var image = {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
};

var img = {
	width: "300px",
	height: "280px"
};

var App = React.createClass({
  render() {
    return (
    	<div style={page}>
	      <div style={container}>
	      	<div style={image}>
	      		<img style={img} src="app/images/react-niko.png" />
	      	</div>
	      </div>
	    </div>
    );
  }
});

module.exports = App;