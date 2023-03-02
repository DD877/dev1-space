sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, Sorter, MessageBox) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.ProcessOrders", {

		custFormatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("ProcessOrders").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();
			this.getApproveOrderPropertySet();
			this._getSystem();

			this.getItemCategoryData();
		},

		_onRouteMatched: function (oEvent) {
			//var oSmartTable = oSource.getSource();
			var oSmartTable = this.getView().byId("smartTablePr");
			var oViewProperites = this.getView().getModel("viewProperties");
			var sUserId = oViewProperites.getData().LoginID;
			//	debugger;
			var sUserROle = this.getOwnerComponent().sUserRole;
			var path1;

			if (sUserROle === "RSNO") {
				path1 = "/SNOOrders";
				//SNOConfirmedOrdersParam(P_USERID='ARANJAN')/Results
				//	path1 = "/SNOConfirmedOrdersParam(P_USERID='" + this.getOwnerComponent().sUserId + "')/Results";
				oSmartTable.setTableBindingPath(path1);

				//oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId,false));
				//oBinding.filters.push(new Filter("ZUSR_ID", "EQ", this.getOwnerComponent().sUserId,false));
				//oBinding.filters.push(new Filter("ZCHANGED_BY", "EQ", this.getOwnerComponent().sUserId));
			}
			oSmartTable.rebindTable();

			this.onDataReceived();
			this.getVisiblePlaceOrder();
			var that = this;
			setInterval(function () {
				that.userLogin();
			}, 300000);
		},

		/**
		 * This event is fired on Colunm resizeing
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onDataReceived: function () {
			var oTable = this.getView().byId("smartTablePr").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onBeforeRendering: function () {
			//this.byId('ins').setModel(this.jModel);
			//
		},

		onBeforeRebindTable: function (oSource) {

			var oSmartTable = oSource.getSource();
			var path1;
			var oBinding = oSource.getParameter("bindingParams");
			var oViewProperites = this.getView().getModel("viewProperties");
			var sUserId = oViewProperites.getData().LoginID;
			var sUserROle = oViewProperites.getData().sUserRole;

			if (sUserROle === "RSNO") {
				//path1 = "/SNOConfirmedOrders";SNOConfirmedOrdersParam(P_USERID='ARANJAN')/Results
				//path1 = "/SNOConfirmedOrdersParam(P_USERID='" + sUserId + "')/Results";
				//oSmartTable.setTableBindingPath(path1);
				//oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId, false));
				//oBinding.filters.push(new Filter("ZUSR_ID", "EQ", this.getOwnerComponent().sUserId,false));
				//oBinding.filters.push(new Filter("ZCHANGED_BY", "EQ", this.getOwnerComponent().sUserId));
			}

			//var sUserId = this.getOwnerComponent().sUserId;
				oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'ORCR', true));

			if (sUserROle === "CUST") {
				oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId));
			}

			/*if (this.getOwnerComponent().sUserRole === "RSNO") {
				oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId,false));
				oBinding.filters.push(new Filter("ZCHANGED_BY", "EQ", this.getOwnerComponent().sUserId));
			}*/

			//oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", sUserId));"ZINTR_ORDNUM"

			var oSorter = new Sorter({

				path: "ZCHANGED_ON",
				descending: true,
				group: true

			});
			

			if (!oBinding.sorter.length) {
				oBinding.sorter.push(new sap.ui.model.Sorter("ZINTR_ORDNUM", true));
				oBinding.sorter.push(oSorter);
			}
		},

		/**
		 *  This event is fired close order simulate fragment
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		onSimulateClose: function () {
			this._oSiDialog.close();
			if (this._oSiDialog) {
				this._oSiDialog = this._oSiDialog.destroy();
			}
		},

		/**
		 *  This event is fired creating data Instance with out time
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		formatDate1: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "yyyy-MM-dd",
					UTC: false
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},
		/**
		 *  This event is fired close schedule line fragment
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		soLineClose: function () {
			this._oCSSOLADialog.close();
			if (this._oCSSOLADialog) {
				this._oCSSOLADialog = this._oCSSOLADialog.destroy();
			}
		},

		/**
		 *  This event is fired get schedule line information
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		soLineShow: function (oEvent) {

			var oData = this._ConfirmDialog.getModel("OrderData1").getData();
			var oData1 = this._ConfirmDialog.getModel("OrderDataF").getData();
			var oData2 = this._ConfirmDialog.getModel("OrderData12");
			var ssoLine = this._oViewProperties = new JSONModel();
			ssoLine.setData(oData);

			var oModel = oEvent.getSource().getBindingContext("OrderData12").getObject();;

			var oModViewProperty = this.getView().getModel("viewProperties1");

			var sSidd,
				sUSystem = oData.ZSYSTEM;
			/*if (oData.ZSYSTEM === "L") {
				sSidd = "DLACLNT100";
			} else {
				sSidd = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "L") {

					sSidd = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "T") {

					sSidd = aSystemData[i].Yylow;

				}

			}

			var kl = "datetime%27" + this.formatDate1(oModel.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";

			var sFData = "/ysoschedulelinesSet(distchnl='" + oData.ZDISTR_CHNL + "',division='" + oData.ZDIVISION +
				"',salesorg='" + oData.ZSALES_AREA + "',customer='" + oData.ZCUST_NUM + "',Material='" + oModel.ZMAT_NUM + "',Unit='" +
				"PC" + "',Sysid='" + sSidd + "',ReqDate=" + kl + ",ReqQty=" + oModel.ZTRGT_QTY + ")";
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {

				success: function (oData12, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					var oModel_Customer = new JSONModel();
					oModel_Customer.setData(oData12);
					if (!this._oCSSOLADialog) {

						this._oCSSOLADialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.orderSimulateAprSOLine", this);
						this.getView().addDependent(this._oCSSOLADialog);
						this._oCSSOLADialog.setModel(oModel_Customer, "ssoLineJson");
						this._oCSSOLADialog.setModel(ssoLine, "ssoLineJson1");

					}
					if (oData12.Retmsg) {
						MessageBox.show(
							oData12.Retmsg, {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								actions: [MessageBox.Action.CLOSE],
								styleClass: "sapUiSizeCompact myMessageBox"
							}
						);
					}

					this._oCSSOLADialog.open();
				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						oError.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}.bind(this)
			});
		},

		/**
		 * This event is fired get Shipto information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		// _getShipToValue: function (oResp, Shiptoparty) {
		// 	var viewProperties = this.getView().getModel("viewProperties1");
		// 	var oModel = this.getOwnerComponent().getModel(),

		// 		sPath = "/CustomerShipToPartyAssignDetails";
		// 	sap.ui.core.BusyIndicator.show();
		// 	sap.ui.core.BusyIndicator.show();
		// 	oModel.read(sPath, {
		// 		filters: [new Filter("ZCUSTMR_NUM", "EQ", oResp.ZCUST_NUM)],
		// 		success: function (oResp1) {
		// 			sap.ui.core.BusyIndicator.hide();

		// 			if (oResp1.results.length === 0) {

		// 				return;
		// 			}
		// 			if (oResp1.results.length) {
		// 				for (var i = 0; i < oResp1.results.length; i++) {
		// 					if (oResp1.results[i].ZSHIP_TO_PARTY === Shiptoparty) {
		// 						var sCity, sPoCode;
		// 						if (oResp1.results[i].ZCITY === "" || oResp1.results[i].ZCITY === null) {
		// 							sCity = "";
		// 						} else {
		// 							sCity = oResp1.results[i].ZCITY;
		// 						}

		// 						if (oResp1.results[i].ZPOSTAL_CODE === null || oResp1.results[i].ZPOSTAL_CODE === null) {
		// 							sPoCode = "";
		// 						} else {
		// 							sPoCode = oResp1.results[i].ZPOSTAL_CODE;
		// 						}
		// 						var sAddress = sCity + " " + sPoCode;

		// 						viewProperties.setProperty("/ShipToAddr", sAddress);
		// 					}
		// 				}
		// 			}

		// 		},
		// 		error: function (err) {
		// 			sap.ui.core.BusyIndicator.hide();
		// 		}
		// 	});

		// },

		/**
		 * This event is fired to get information of header and item level data
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onAddCM1Press: function (oEvent) {
			var oDataObject;
			if (oEvent.getParameter("row")) {
				oDataObject = oEvent.getParameter("row").getBindingContext().getObject();
			} else if (oEvent.getParameter("rowContext")) {
				oDataObject = oEvent.getParameter("rowContext").getObject();
			} else if (oEvent.getSource().getBindingContext()) {
				oDataObject = oEvent.getSource().getBindingContext().getObject();
			}

			this.getConfirmOrderData(oDataObject);

		},

		/**
		 * Function to open the dialog for the attachment screens.
		 * set the Document Title
		 * set the Document Id and File Name if exists
		 * bind it to a temporary model to show the document details.
		 * @param {object} [oEvent] parameter used to global variable for the Spec Doc Button.
		 * @public
		 */

		pressAddAttachment: function (oEvent) {
			var oModel = this.getView().getModel("viewProperties1");
			this.oAttachData = oEvent.getSource();

			var
				sDocId, sFileName, oItem,

				sAttDocId = oModel.getProperty("/ZDOC_ID");
			if (sAttDocId) {
				sDocId = sAttDocId.split("_MOET_")[0];
				sFileName = sAttDocId.split("_MOET_")[1];
			} else {
				oData[sComSpec] = "";
			}
			if (sDocId && sFileName) {
				sap.m.URLHelper.redirect("/CMIS/cmis/download?docId=" + sDocId, true);
			} else {
				//	oRFileModel.setProperty("/attachments", []);
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