sap.ui.define([
	"sap/ui/core/UIComponent",
	"./model/models",
	"sap/ui/core/routing/History",
	"sap/ui/model/resource/ResourceModel"
], function(UIComponent, models, History) {
	"use strict";
	return UIComponent.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			
			/*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.attachRouteMatched(this.routeMatched, this);*/
			
			/*if(this.getRouter().oHashChanger.hash === ''){
				this.getView().byId("plord").setVisible(false);
			}else{
				this.getView().byId("plord").setVisible(true);
			}*/

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		myNavBack: function () {
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("masterSettings", {}, true);
			}
		},

		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch){
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});