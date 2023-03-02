sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter"
], function (BaseController, JSONModel, formatter, Filter, Sorter) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.AuditTrail", {

		custFormatter: formatter,

		handlePressOpenMenu: function (oEvent) {
			var oButton = oEvent.getSource();

			if (!this._menu) {
				this._menu = sap.ui.xmlfragment(this.getView().getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.MenuItem",
					this);
				this.getView().addDependent(this._menu);
			}

			var eDock = sap.ui.core.Popup.Dock;
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

		},

		handlePressOpenNewOrderPage: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("NewOrder");
		},

		handlePressOpenNewOrder: function (oEvent) {
			var oButton = oEvent.getSource();

			if (!this._new) {
				this._new = sap.ui.xmlfragment(this.getView().getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.NewOrder",
					this);
				this.getView().addDependent(this._new);
			}
			//return this._menu;

			var eDock = sap.ui.core.Popup.Dock;
			this._new.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

		},

		closeCreateDialog: function () {
			if (this._new) {
				this._new.close();
				this._new = this._new.destroy(true);
			}
		},

		onInit: function () {
			this.getRouter().getRoute("AuditTrail").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();
			this.fNotification = [];
		},

		_onRouteMatched: function (oEvent) {
			this.getVisiblePlaceOrder();
			var that = this;
			setInterval(function () {
				that.userLogin();
			}, 300000);
		},

		onDataReceived: function () {
			var oTable = this.getView().byId("STUserMaintenance").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onBeforeRebindTable: function (oSource) {

		},

		onDataMater: function () {
			var oTable = this.getView().byId("STMatMaitainLog").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},
		onDataReceivedCM: function () {
			var oTable = this.getView().byId("STCustMainten").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onDataReceivedUC: function () {
			var oTable = this.getView().byId("STSFBUserCustMaitain").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onDataReceivedCMAT: function () {
			var oTable = this.getView().byId("STSFBCustMatMaitain").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onDataReceivedCSHIP: function () {
			var oTable = this.getView().byId("STCustShipToMaitain").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onDataReceivedCFT: function () {
			var oTable = this.getView().byId("STCustFTradeMaitain").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onDataReceivedMATI: function () {
			var oTable = this.getView().byId("STMatItemCategory").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onDataReceivedOH: function () {
			var oTable = this.getView().byId("STOrderHeader").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onDataReceivedOI: function () {
			var oTable = this.getView().byId("STOrderItem").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		/*onSectionCahnges: function (oEvent) {
			var id = this.getView().byId("ObjectPageLayout");
			if (oEvent.getParameter("section").getTitle() === "Customer Maintenance") {
				this.onDataReceivedCM();
			}
			if (oEvent.getParameter("section").getTitle() === "Material Maintenance") {
				this.onDataMater();
			}
			if (oEvent.getParameter("section").getTitle() === "User Maintenance") {
				this.onDataReceived();
			}
			if (oEvent.getParameter("section").getTitle() === "User Customer Assignment") {
				this.onDataReceivedUC();
			}
			if (oEvent.getParameter("section").getTitle() === "Customer Material Assignment") {
				this.onDataReceivedCMAT();
			}
			
			if (oEvent.getParameter("section").getTitle() === "Customer Ship To Party Assignment") {
				this.onDataReceivedCSHIP();
			}
			if (oEvent.getParameter("section").getTitle() === "Customer FTRADE Assignment") {
				this.onDataReceivedCFT();
			}
			if (oEvent.getParameter("section").getTitle() === "Material Item Category Assignment") {
				this.onDataReceivedMATI();
			}
			if (oEvent.getParameter("section").getTitle() === "Order Header Details") {
				this.onDataReceivedOH();
			}
			if (oEvent.getParameter("section").getTitle() === "Order Item Details") {
				this.onDataReceivedOI();
			}

		}*/

		onSectionCahnges: function (oEvent) {
			var id = this.getView().byId("ObjectPageLayout");
			if (oEvent.getParameter("section").getTitle() === "User Maintenance") {
				this.getView().byId("SFBUserMaintenance").fireSearch(true);
				this.onDataReceived();
			}
			if (oEvent.getParameter("section").getTitle() === "Customer Maintenance") {
				this.getView().byId("SFBCustMaintenA").fireSearch(true);
				this.onDataReceivedCM();
			}
			if (oEvent.getParameter("section").getTitle() === "Material Maintenance") {

				this.getView().byId("SFBMatMaitainLog").fireSearch(true);
				this.onDataMater();
			}

			if (oEvent.getParameter("section").getTitle() === "User Customer Assignment") {
				this.getView().byId("SFBUserCustMaitain").fireSearch(true);
				this.onDataReceivedUC();
			}
			if (oEvent.getParameter("section").getTitle() === "Customer Material Assignment") {
				this.getView().byId("SFBCustMatMaitain").fireSearch(true);
				this.onDataReceivedCMAT();
			}

			if (oEvent.getParameter("section").getTitle() === "Customer Ship To Party Assignment") {
				this.getView().byId("SFBCustShipToMaitain").fireSearch(true);
				this.onDataReceivedCSHIP();
			}
			if (oEvent.getParameter("section").getTitle() === "Customer FTRADE Assignment") {
				this.getView().byId("SFBCustFTradeMaitain").fireSearch(true);
				this.onDataReceivedCFT();
			}
			if (oEvent.getParameter("section").getTitle() === "Material Item Category Assignment") {
				this.getView().byId("SFBMatItemCategory").fireSearch(true);
				this.onDataReceivedMATI();
			}
			if (oEvent.getParameter("section").getTitle() === "Order Header Details") {
				this.getView().byId("SFBOrderHeader").fireSearch(true);
				this.onDataReceivedOH();
			}
			if (oEvent.getParameter("section").getTitle() === "Order Item Details") {
				this.getView().byId("SFBOrderItem").fireSearch(true);
				this.onDataReceivedOI();
			}

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