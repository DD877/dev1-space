sap.ui.define([
	"sap/ui/base/Object"
], function (Object) {
	"use strict";

	var Service = Object.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.HTTPService", {
		constructor: function () {},
		/* eslint-disable */
		http: function (sUrl) {

			// create a service object
			var oCore = {

				// Method that performs the ajax request
				ajax: function (oMethod, sUrl, oHeaders, oArgs, sMimetype) {

					// Creating a oPromise
					var oPromise = new Promise(function (resolve, reject) {

						// Instantiates the XMLHttpRequest
						var oClient = new XMLHttpRequest();
						var sUri = sUrl;
						if (oArgs && oMethod === 'GET') {
							sUri += '?';
							var argcount = 0;
							for (var key in oArgs) {
								if (oArgs.hasOwnProperty(key)) {
									if (argcount++) {
										sUri += '&';
									}
									sUri += encodeURIComponent(key) + '=' + encodeURIComponent(oArgs[key]);
								}
							}
						}

						oClient.open(oMethod, sUri, true);

						if (oArgs && (oMethod === 'POST' || oMethod === 'PUT')) {
							var oData = oArgs;
						}
						for (var keyh in oHeaders) {
							if (oHeaders.hasOwnProperty(keyh)) {
								oClient.setRequestHeader(keyh, oHeaders[keyh]);
							}
						}
						if (oData) {
							oClient.send(oData instanceof FormData ? oData : JSON.stringify(oData));
						} else {
							oClient.send();
						}
						oClient.onload = function () {
							if (this.status == 200 || this.status == 201) {
								// Performs the function "resolve" when this.status is equal to 200
								try {
									resolve(JSON.parse(this.response));
								} catch (ex) {
									resolve(this.response);
								}
							} else {
								// Performs the function "reject" when this.status is different than 200
								reject(this);
							}
						};
						oClient.onerror = function () {
							reject(this);
						};
					});

					// Return the oPromise
					return oPromise;
				}
			};

			// Adapter pattern
			return {
				'get': function (oHeaders, oArgs) {
					return oCore.ajax('GET', sUrl, oHeaders, oArgs);
				},
				'post': function (oHeaders, oArgs) {
					return oCore.ajax('POST', sUrl, oHeaders, oArgs);
				},
				'put': function (oHeaders, oArgs) {
					return oCore.ajax('PUT', sUrl, oHeaders, oArgs);
				},
				'delete': function (oHeaders, oArgs) {
					return oCore.ajax('DELETE', sUrl, oHeaders, oArgs);
				}
			};
		}
	});
	return Service;
});