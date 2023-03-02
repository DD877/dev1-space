sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter"
], function (BaseController, formatter, Filter) {
	"use strict";
	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.OrderReport", {

		custFormatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("OrderReport").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();

		},
		_onRouteMatched: function (oEvent) {
			this.onDataReceived();
			this.getVisiblePlaceOrder();
			var that = this;
			setInterval(function () {
				that.userLogin();
			}, 300000);
		},

		onBeforeRebindTable: function (oSource) {
			var oSmartTable = oSource.getSource();
			var oViewProperites =this.getView().getModel("viewProperties");
			var sUserId = oViewProperites.getData().LoginID;
			var sUserROle = oViewProperites.getData().sUserRole;
			var path1;
			//OTCHealthCareReportSNOParam(P_USERID='FHAQ')/Results
			//OrderTrackingParam(P_USERID='P14138')/Results
			if(sUserROle === "RSNO"){
				path1 = "/OTCHealthCareReportSNOParam(P_USERID='" + sUserId + "')/Results";
				oSmartTable.setTableBindingPath(path1);
			}
			if(sUserROle === "CUST"){
				path1 = "/OrderTrackingParam(P_USERID='" + sUserId + "')/Results";
				oSmartTable.setTableBindingPath(path1);
			}
			var oBinding = oSource.getParameter("bindingParams");

			if (!oBinding.sorter.length) {
				oBinding.sorter.push(new sap.ui.model.Sorter("CA_ZSO_CREATED_DATE", true));
			}
			/*
			oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'DRFT'));
			oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'SNOR'));
			if (this.getOwnerComponent().sUserRole === "CUST") {
				oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId));
			}*/
		},

		onBeforeRendering: function () {
			//this.byId('ins').setModel(this.jModel);
			//
		},

		/**
		 * This event is fired on Colunm resizeing
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onDataReceived: function () {
			var oTable = this.getView().byId("smartTable").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onAssignedFiltersChanged: function (e) {
			var z = e.getSource();
			for (var a in z._oFilterProvider._mTokenHandler) {
				var oParser = z._oFilterProvider._mTokenHandler[a];
				if (oParser && oParser.parser) {
					oParser.parser.setDefaultOperation("Contains");
				}
			}
		},
		onInitialized: function (e) {
			var z = e.getSource();
			for (var a in z._oFilterProvider._mTokenHandler) {
				var oParser = z._oFilterProvider._mTokenHandler[a];
				if (oParser && oParser.parser) {
					oParser.parser.setDefaultOperation("Contains");
				}
			}

		},

	});
});