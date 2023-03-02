sap.ui.define([
	"../localService/mockserver",
	"../localService/mockserver1"
], function (mockserver, mockserver1) {
	"use strict";

	// initialize the mock server
	mockserver.init();
    mockserver1.init();

	// initialize the embedded component on the HTML page
	sap.ui.require(["sap/ui/core/ComponentSupport"]);
});