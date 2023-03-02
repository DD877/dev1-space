sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	'sap/m/TextArea',
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	'sap/ui/layout/HorizontalLayout',
	'sap/ui/layout/VerticalLayout',
	"../services/RepoService"
], function (Button, Dialog, Label, MessageToast, Text, TextArea, BaseController, JSONModel, formatter, Filter, Sorter, MessageBox,
	HorizontalLayout,
	VerticalLayout, RepoService) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.Orders", {
		custFormatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the object controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("Orders").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();
			this.getPropertySet();
			this._getSystem();
			
			this.fNotification = [];

			
			this.getItemCategoryData();
			this.userLogin();

		},
		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */

		_onRouteMatched: function (oEvent) {
			var oSmartTable = this.getView().byId("smartTableOrd");
			var oViewProperites = this.getView().getModel("viewProperties");
			var sUserId = oViewProperites.getData().LoginID;
			var sUserROle = this.getOwnerComponent().sUserRole;
			var path1;

			if (sUserROle === "RSNO") {
				path1 = "/SNOOrders";
				oSmartTable.setTableBindingPath(path1);
			}
			oSmartTable.rebindTable();
			this.onDataReceived();
			this.getVisiblePlaceOrder();
			var that = this;
			setInterval(function () {
				that.userLogin();
			}, 300000);
		},

		onBeforeRebindTable: function (oSource) {
			var oBinding = oSource.getParameter("bindingParams");

			oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'DRFT'));
			oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'SNOR'));
			if (this.getOwnerComponent().sUserRole === "CUST") {
				oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId));
			}
			//oBinding.sorter.push(new sap.ui.model.Sorter("ZINTR_ORDNUM", true));
			if (!oBinding.sorter.length) {
				oBinding.sorter.push(new sap.ui.model.Sorter("ZCHANGED_ON", true));
				oBinding.sorter.push(new sap.ui.model.Sorter("ZINTR_ORDNUM", true));
			}
		},

		onBeforeRendering: function () {

		},

		/**
		 *  This event is fired add row in the table
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

	

		onEditPress: function (oEvent) {

			var oDataObject;
			if (oEvent.getParameter("row")) {
				oDataObject = oEvent.getParameter("row").getBindingContext().getObject();
			} else if (oEvent.getParameter("rowContext")) {
				oDataObject = oEvent.getParameter("rowContext").getObject();
			} else if (oEvent.getSource().getBindingContext()) {
				oDataObject = oEvent.getSource().getBindingContext().getObject();
			}
			
			this.getEditOrderData(oDataObject);
		

		},


		/**
		 * This event is fired get material information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getMaterialValue: function (resp) {

			var oModel = this.getOwnerComponent().getModel();
			var orderModel = this.getView().getModel("OrderData12");

			var sPath1 = "/MaterialDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath1, {
				filters: [new Filter("Z_MATRL_NUM", "EQ", resp)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					orderModel.setProperty("/ZMATRL_DESC", oResp.results[0].ZMATRL_DESC);

					orderModel.setProperty("/ZTRGT_QTYUOM", oResp.results[0].ZBASE_UNIT_MEASURE);
					orderModel.setProperty("/ZALT_UOM", oResp.results[0].ZBASE_UNIT_MEASURE);
					orderModel.setProperty("/ZMIN_QTY", oResp.results[0].ZMIN_ORDER_QUAN);
					orderModel.setProperty("/ZGRP_DEVLPR", oResp.results[0].ZGRP_DEVLPR);

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		
		

	
	

	
	
		/**
		 * This event is fired on Colunm resizeing
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onDataReceived: function () {
			var oTable = this.getView().byId("smartTableOrd").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		

		/************* UPLOAD  ************************/

	
	

	

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