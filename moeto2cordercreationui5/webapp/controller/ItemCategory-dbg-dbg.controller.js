sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/Token",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, Sorter, Token, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.ItemCategory", {

		custFormatter: formatter,

		onInit: function () {
			this.getRouter().getRoute("ItemCategory").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();

			this.fNotification = [];

			this._oViewPropertiesMatA = new JSONModel({
				matNo: "",
				itmCat: "",
				matDec: "",
				bsystem: ""
			});
			this.getView().setModel(this._oViewPropertiesMatA, "viewPropertiesMatA");

		},

		_onRouteMatched: function (oEvent) {
			this.onDataReceived();
			this.getVisiblePlaceOrder();
			var that = this;
			setInterval(function () {
				that.userLogin();
			}, 300000);

		},

	

		onDataReceived: function () {
			var oTable = this._smartTable.getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i > 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		

		onBeforeRebindTable: function (oSource) {

		},

		onAddItmCatClose: function () {
			this._oItmCatDialog.close();
			if (this._oItmCatDialog) {
				this._oItmCatDialog = this._oItmCatDialog.destroy();
			}
		},

		onAddItmCatPress: function () {
			
			if (!this._oItmCatDialog) {
			
				this._oItmCatDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.addItemCategory", this);
				this.getView().addDependent(this._oItmCatDialog);
				
			}
			this._oItmCatDialog.open();

		},



		onDeleteItmPress: function (oEvent) {
			var oMpdel = this.getOwnerComponent().getModel();

			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));

			var that = this,
				sMsg = "";
			var sMatId = oModel.getData().ZITM_CATEGORY;
			var payload = {
				"ZITM_CATEGORY": oModel.getData().ZITM_CATEGORY,
				"ZSYSTEM": oModel.getData().ZSYSTEM
			};
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
			if (oModel.getData().ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for Item Category " + oModel.getData().ZITM_CATEGORY;
			} else {
				sMsg = "Confirm to delete Item Category " + oModel.getData().ZITM_CATEGORY;
			}

			MessageBox.confirm(sMsg, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {
						that.deleteFunction(sUrl, payload);
					}
				}
			});

		},

		deleteFunction: function (sUrl, payload) {
			var oMpdel = this.getOwnerComponent().getModel();
			$.ajax({
				url: sUrl,
				type: "DELETE",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					//MessageBox.show(response);
					MessageBox.show(
						data.message, {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					oMpdel.refresh();
				},
				error: function (oError) {
					MessageBox.show(
						oError.responseJSON.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});
		},

		onUpdateItmPress: function (oEvent) {
			
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			if (!this._oupdateItmCatDialog) {

				this._oupdateItmCatDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.itemCatEdit", this);
				this._oupdateItmCatDialog.setModel(oModel, "editItmCat");
				//	this._oEditDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.customerMasterEdit", this);
				this.getView().addDependent(this._oupdateItmCatDialog);
			}
			this._oupdateItmCatDialog.open();
		},

		onUpdateItmClose: function (oEvent) {
			this._oupdateItmCatDialog.close();
			if (this._oupdateItmCatDialog) {
				this._oupdateItmCatDialog = this._oupdateItmCatDialog.destroy();
			}
			this._oupdateItmCatDialog.getModel("editItmCat").refresh();
		},

		onUpdateItmSavePress: function (oEvent) {
			var oMpdel = this.getOwnerComponent().getModel();
			var sItemCat = sap.ui.getCore().byId("idEItemCat").getValue();
			
			var payload = {
				ZITM_CATEGORY: sap.ui.getCore().byId("idEItemCat").getValue(),
				ZSYSTEM: sap.ui.getCore().byId("idEItemCatSys").getSelectedKey(),
				ZITM_CATEGORY_DESC: sap.ui.getCore().byId("idEItemCatDec").getValue(),
				ZDEL_FLAG: sap.ui.getCore().byId("idDeletionFlag").getState() === true ? 'X' : ''
			};
			
		//	var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					//MessageBox.show(response);
					MessageBox.show(
						"Item Category " + sItemCat + " updated successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					oMpdel.refresh();
				},
				error: function (oError) {
					MessageBox.show(
						oError.responseJSON.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});
			this.onUpdateItmClose();
		},





		onSaveItemMaster: function (evt) {
			var that = this;
			//
			var oMpdel = this.getOwnerComponent().getModel();
			var sItemCat = sap.ui.getCore().byId("idItemCat").getValue();

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
			var payload = {
				ZITM_CATEGORY: sap.ui.getCore().byId("idItemCat").getValue(),
				ZSYSTEM: sap.ui.getCore().byId("idItemCatSys").getSelectedKey(),
				ZITM_CATEGORY_DESC: sap.ui.getCore().byId("idItemCatDec").getValue(),
				ZDEL_FLAG: ""
			};
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					MessageBox.show(
						"Item Category " + sItemCat + " created successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					oMpdel.refresh();
				},
				error: function (oError) {
					MessageBox.show(
						oError.responseJSON.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});
			this.onAddItmCatClose();

		},
		
		onUpdateItem: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			//var sCumId = oModel.getData().ZCUSTMR_NUM;
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this,sDelFlag;
			if(oEvent.getParameter("state") === true){
                sDelFlag = "X";
            }else{
                sDelFlag = "";
            }
            
			var payload = {
				ZITM_CATEGORY: oModel.getData().ZITM_CATEGORY,
				ZSYSTEM: oModel.getData().ZSYSTEM,
				ZITM_CATEGORY_DESC: oModel.getData().ZITM_CATEGORY_DESC,
				ZDEL_FLAG: sDelFlag
				/*ZCUSTMR_NUM: oModel.getData().ZCUSTMR_NUM, //.getSelected() ? "X" : "",
				ZSYSTEM: oModel.getData().ZSYSTEM,
				ZNAME_1: oModel.getData().ZNAME_1,
				ZCITY: oModel.getData().ZCITY,
				ZREGION: oModel.getData().ZREGION,
				ZCENTRL_DEL_FLAG: sDelFlag,
				ZPOSTAL_CODE: oModel.getData().ZPOSTAL_CODE,
				ZDEL_BLOCK_ID: oModel.getData().ZDEL_BLOCK_ID*/
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"For Item Category " + oModel.getData().ZITM_CATEGORY + ", deletion flag revoked", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					oMpdel.refresh();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();

					MessageBox.show(
						oError.responseJSON.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

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