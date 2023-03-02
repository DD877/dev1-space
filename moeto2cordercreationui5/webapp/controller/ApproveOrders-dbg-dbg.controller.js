sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, Sorter, MessageBox) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.ApproveOrders", {

		custFormatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the object controller is instantiated.
		 * @public
		 */
		onInit: function () {
			this.getRouter().getRoute("ApproveOrders").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();
			this.getApproveOrderPropertySet();
			this.getItemCategoryData();
			this._getSystem();
			var visbleModel = new JSONModel({
				"visible": true

			});
			this.getView().setModel(visbleModel, "jsonVisible");
			

		},
		_onRouteMatched: function (oEvent) {
			var oSmartTable = this.getView().byId("smartTableApprove");
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

		/**
		 * This event is fired on Colunm resizeing
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onDataReceived: function () {
			var oTable = this.getView().byId("smartTableApprove").getTable(),
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
			var oBinding = oSource.getParameter("bindingParams");
			oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'SNOA'));
			var oJsonVisible = this.getView().getModel("jsonVisible");
			
			
			if (this.getOwnerComponent().sUserRole === "CUST") {
				oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId));
				oJsonVisible.setProperty("/visible", false);
				//{jsonVisible>/visible}
			}
			
			
			if (!oBinding.sorter.length) {
				oBinding.sorter.push(new sap.ui.model.Sorter("ZINTR_ORDNUM", true));
				oBinding.sorter.push(new sap.ui.model.Sorter("ZCHANGED_ON", true));
			}
			
		},

		/**
		 *  This event is fired creating data Instance with out time
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		// formatDate1: function (iValue) {
		// 	var value1;
		// 	if (!iValue) {
		// 		return null;
		// 	} else {
		// 		var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
		// 			pattern: "yyyy-MM-dd",
		// 			UTC: false
		// 		});
		// 		value1 = oDateFormat.format(iValue);
		// 		var dateVal = value1;
		// 		return dateVal;
		// 	}
		// },
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
		 *  This event is fired close schedule line fragment
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		/*soLineClose: function () {
			this._oASSO1LDialog.close();
			if (this._oASSO1LDialog) {
				this._oASSO1LDialog = this._oASSO1LDialog.destroy();
			}
		},*/
		
		/**
		 *  This event is fired close schedule line fragment
		 * @param {sap.ui.base.Event} oEvent 
		 * @private_oSSOLADialog
		 */

		soLineClose: function () {
			this._oSSOLADialog.close();
			if (this._oSSOLADialog) {
				this._oSSOLADialog = this._oSSOLADialog.destroy();
			}
		},
		/**
		 *  This event is fired get schedule line information
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		soLineShow: function (oEvent) {

			var oData = this._oCM1iDialog.getModel("OrderData1").getData();
			var oData1 = this._oCM1iDialog.getModel("OrderDataF").getData();
			var oData2 = this._oCM1iDialog.getModel("OrderData12");
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
				oModel.ZALT_UOM + "',Sysid='" + sSidd + "',ReqDate=" + kl + ",ReqQty=" + oModel.ZTRGT_QTY + ")";
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {

				success: function (oData12, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					var oModel_Customer = new JSONModel();
					oModel_Customer.setData(oData12);
					if (!this._oSSOLADialog) {

						this._oSSOLADialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.orderSimulateAprSOLine", this);
						this.getView().addDependent(this._oSSOLADialog);
						this._oSSOLADialog.setModel(oModel_Customer, "ssoLineJson");
						this._oSSOLADialog.setModel(ssoLine, "ssoLineJson1");

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

					this._oSSOLADialog.open();
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

		

	

		onAddCM1Press: function (oEvent) {
			var oDataObject;
			if (oEvent.getParameter("row")) {
				oDataObject = oEvent.getParameter("row").getBindingContext().getObject();
			} else if (oEvent.getParameter("rowContext")) {
				oDataObject = oEvent.getParameter("rowContext").getObject();
			} else if (oEvent.getSource().getBindingContext()) {
				oDataObject = oEvent.getSource().getBindingContext().getObject();
			}
			this.getApproveOrderData(oDataObject);

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

			var sDocId, sFileName, oItem,
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