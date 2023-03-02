sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/Sorter",
	"sap/m/Token",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, Spreadsheet, Sorter, Token, FilterOperator, MessageBox) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.MaterialMaster", {

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

		handleChange: function () {
			var sMatNo = sap.ui.getCore().byId("idMaterialnumber").getValue();

			var sUSystem = sap.ui.getCore().byId("idMatMasSysI").getSelectedKey();
			var sSysId;
			/*if (sUSystem === "L") {
				sSysId = "DLACLNT100";
			} else {
				sSysId = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "L") {

					sSysId = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "T") {

					sSysId = aSystemData[i].Yylow;

				}

			}

			var sFData = "/ymaterialvalidationSet(IvMaterial='" + sMatNo + "',IvSyssid='" + sSysId + "')";
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				urlParameters: {
					"$expand": "Navmaterialvalidation"
				},
				success: function (oData1, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					var oModel_Customer = new JSONModel();
					oModel_Customer.setData(oData1);
					sap.ui.getCore().byId("idMaterialDec").setValue(oData1.Navmaterialvalidation.MatnrDesc);
					sap.ui.getCore().byId("idBaseUnitMeasure").setValue(oData1.Navmaterialvalidation.BaseUnitMeas);
					//sap.ui.getCore().byId("idMinOrderQty").setValue(oData1.Navmaterialvalidation.MinOrdrQty);
				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						'Select Correct System', {
							icon: MessageBox.Icon.ERROR,
							title: "ERROR",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}.bind(this)
			});
		},

		onValidate: function () {
			var sAssMat = sap.ui.getCore().byId("ID_ASS_MAT");
			sAssMat.setEnabled(true);
			MessageBox.show(
				'Materials are Validated', {
					icon: MessageBox.Icon.SUCCESS,
					title: "SUCCESS",
					onClose: this.onAssignClose,
					actions: [MessageBox.Action.CLOSE],
					styleClass: "sapUiSizeCompact myMessageBox"
				}
			);
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
			this.getRouter().getRoute("MaterialMaster").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();
			this._getSystem();

			this.fNotification = [];

			this._oViewPropertiesCust = new JSONModel({
				custNo: "",
				customerid: "C001",
				bsystem: "",
				CustomerName: "",
				city: "",
				State: "",
				Region: "",
				pocode: "",
				ShipTo: "",
				SalesOrganization: "",
				DistributionChannel: "",
				Division: "",
				SalesGroup: "",
				SalesOffice: "",
				Currency: ""
			});
			this.getView().setModel(this._oViewPropertiesCust, "viewPropertiesCust");

			this._oViewPropertiesMatA = new JSONModel({
				matNo: "",
				itmCat: "",
				matDec: "",
				bsystem: ""
			});
			this.getView().setModel(this._oViewPropertiesMatA, "viewPropertiesMatA");
			this.getItemCategoryData();
		},

		fnSelectSystem: function (oEvent) {
			var sSystemKey = sap.ui.getCore().byId("idUominput1w").getSelectedKey();
			var oJsonModel = this.getView().getModel("customerTest");
			var oviewProperties = this.getView().getModel("viewPropertiesCust");
			for (var i = 0; i < oJsonModel.getData().length; i++) {
				if (oJsonModel.getData()[i].bsystem === sSystemKey) {
					oviewProperties.setProperty("/bsystem", oJsonModel.getData()[i].bsystem);
					oviewProperties.setProperty("/CustomerName", oJsonModel.getData()[i].CustomerName);
					oviewProperties.setProperty("/city", oJsonModel.getData()[i].city);
					oviewProperties.setProperty("/State", oJsonModel.getData()[i].State);
					oviewProperties.setProperty("/Region", oJsonModel.getData()[i].Region);
					oviewProperties.setProperty("/pocode", oJsonModel.getData()[i].pocode);
					oviewProperties.setProperty("/ShipTo", oJsonModel.getData()[i].ShipTo);
					oviewProperties.setProperty("/SalesOrganization", oJsonModel.getData()[i].SalesOrganization);
					oviewProperties.setProperty("/DistributionChannel", oJsonModel.getData()[i].DistributionChannel);

					oviewProperties.setProperty("/Division", oJsonModel.getData()[i].Division);
					oviewProperties.setProperty("/SalesGroup", oJsonModel.getData()[i].SalesGroup);
					oviewProperties.setProperty("/SalesOffice", oJsonModel.getData()[i].SalesOffice);
					oviewProperties.setProperty("/Currency", oJsonModel.getData()[i].Currency);

				}
			}

		},

		fnClearAllValue: function () {
			var oviewProperties = this.getView().getModel("viewPropertiesCust");

			oviewProperties.setProperty("/bsystem", "");
			oviewProperties.setProperty("/CustomerName", "");
			oviewProperties.setProperty("/city", "");
			oviewProperties.setProperty("/State", "");
			oviewProperties.setProperty("/Region", "");
			oviewProperties.setProperty("/pocode", "");
			oviewProperties.setProperty("/ShipTo", "");
			oviewProperties.setProperty("/SalesOrganization", "");
			oviewProperties.setProperty("/DistributionChannel", "");

			oviewProperties.setProperty("/Division", "");
			oviewProperties.setProperty("/SalesGroup", "");
			oviewProperties.setProperty("/SalesOffice", "");
			oviewProperties.setProperty("/Currency", "");

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
			var oTable = this.getView().byId("smartTable").getTable(),
				i = 0,
				aColumns = oTable.getColumns();
			jQuery.sap.delayedCall(100, this, function () {
				for (i = aColumns.length; i > 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onBeforeRebindTable: function (oSource) {
			this.oDownLoadFilters = oSource.getParameter("bindingParams").filters;
		},
		onAddCMClose: function () {
			this._oMMiDialog.close();
			if (this._oMMiDialog) {
				this._oMMiDialog = this._oMMiDialog.destroy();
			}
		},

		onAddCMPress: function () {
			this.fnClearAllValue();
			if (!this._oMMiDialog) {

				this._oMMiDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.materialMaster", this);
				this.getView().addDependent(this._oMMiDialog);

			}
			this._oMMiDialog.open();

		},
		onAssignMaterial: function (oEvent) {

			var oSource;
			if (oEvent.getId() === "press") {
				oSource = oEvent.getSource();
				this.oSourceMat = oSource;
			} else {
				oSource = oEvent;
			}
			var oGetPerticulterRowValue = new JSONModel(JSON.parse(JSON.stringify(oSource._getBindingContext().getObject())));
			var pr = this.getView().getModel("viewPropertiesCust");
			pr.setProperty("/custNo", oGetPerticulterRowValue.getData().ZCUSTMR_NUM);

			var oJsonModel = new sap.ui.model.json.JSONModel(),

				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerMatAssignDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", oGetPerticulterRowValue.getData().ZCUSTMR_NUM)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);

					if (!this._oMatAssgnDialog) {

						this._oMatAssgnDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.materialAssignment", this); //this.byId('ins1').setModel(this.jModel);
					}
					this._oMatAssgnDialog.setModel(oJsonModel, "materialAssignment");
					this._oMatAssgnDialog.open();

				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onMatAssignClose: function () {
			this._oMatAssgnDialog.close();
			if (this._oMatAssgnDialog) {
				this._oMatAssgnDialog = this._oMatAssgnDialog.destroy();
			}
		},

		onAssignMatPress: function (oEvent) {

			if (!this._oAssMatDialog) {

				this._oAssMatDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignMaterial", this);
				this.getView().addDependent(this._oAssMatDialog);

			}
			this._oAssMatDialog.open();
		},

		onAssignMatClose: function () {
			this._oAssMatDialog.close();
			if (this._oAssMatDialog) {
				this._oAssMatDialog = this._oAssMatDialog.destroy();
			}
		},

		onShipClose: function () {
			this._oShipDialog.close();
			if (this._oShipDialog) {
				this._oShipDialog = this._oShipDialog.destroy();
			}
		},

		onShipPress: function () {

			if (!this._oShipDialog) {

				this._oShipDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.shipto", this);
				this.getView().addDependent(this._oShipDialog);

			}
			this._oShipDialog.open();
		},

		onEditClose: function () {
			this._oupdateMatDialog.close();
			if (this._oupdateMatDialog) {
				this._oupdateMatDialog = this._oupdateMatDialog.destroy();
			}
		},

		onEditPress: function (oEvent) {

			var oMpdel = this.getOwnerComponent().getModel();

			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			if (!this._oupdateMatDialog) {

				this._oupdateMatDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.editMaterial", this);
				this._oupdateMatDialog.setModel(oModel, "matEdit");

				this.getView().addDependent(this._oupdateMatDialog);
			}
			this._oupdateMatDialog.open();
		},

		handleValueHelp1: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			if (!this._valueHelpDialog1) {
				this._valueHelpDialog1 = sap.ui.xmlfragment(this.getView().getId(),
					"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.MaterialF4Help",
					this);
				this.getView().addDependent(this._valueHelpDialog1);
				this._openValueHelpDialog1(sInputValue);
				this._valueHelpDialog1.setModel(this.products1, "products2");
			} else {
				this._openValueHelpDialog1(sInputValue);
			}

		},

		_openValueHelpDialog1: function (sInputValue) {
			this._valueHelpDialog1.open(sInputValue);
		},

		_handleValueHelpSearch1: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"matDesc",
				FilterOperator.Contains,
				sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose1: function (evt) {
			var aSelectedItems = evt.getParameter("selectedItems"),
				oMultiInput = sap.ui.getCore().byId("multiInput1");

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		},

		onSaveMaterialmaster: function (oEvent) {

			if (!sap.ui.getCore().byId("idGroupDeveloper").getSelectedKey()) {
				MessageBox.show(
					"Please select a Group Developer", {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						onClose: this.onAssignClose,
						actions: [MessageBox.Action.CLOSE],
						styleClass: "sapUiSizeCompact myMessageBox"
					}
				);
				return;
			}
			var oMpdel = this.getOwnerComponent().getModel();

			var sSystemId = "";
			if (sap.ui.getCore().byId("idMatMasSysI").getSelectedKey() === "L") {
				sSystemId = "L";
			} else {
				sSystemId = "T";
			}
			var payload = {
				Z_MATRL_NUM: sap.ui.getCore().byId("idMaterialnumber").getValue(), //.getSelected() ? "X" : "",
				ZSYSTEM: sSystemId,
				ZMATRL_DESC: sap.ui.getCore().byId("idMaterialDec").getValue(),
				ZBASE_UNIT_MEASURE: sap.ui.getCore().byId("idBaseUnitMeasure").getValue(),
				ZMIN_ORDER_QUAN: "0",
				ZGRP_DEVLPR: sap.ui.getCore().byId("idGroupDeveloper").getSelectedKey(),
				ZFROZEN_PERIOD : sap.ui.getCore().byId("idFrozenPeriod").getValue(),
				ZDEL_FLAG: ""
			};

			var sMatNo = sap.ui.getCore().byId("idMaterialnumber").getValue();
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					//oMpdel.refresh();
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"Material " + sMatNo + " created successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					oMpdel.refresh();
					this._oMMiDialog.close();
					if (this._oMMiDialog) {
						this._oMMiDialog = this._oMMiDialog.destroy();
					}
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

			this._oMMiDialog.close();
			if (this._oMMiDialog) {
				this._oMMiDialog = this._oMMiDialog.destroy();
			}

		},
		onSaveEMaterialmaster: function (oEvent) {

			if (!sap.ui.getCore().byId("idEGroupDeveloper").getSelectedKey()) {
				MessageBox.show(
					"Please select a Group Developer", {
						icon: MessageBox.Icon.ERROR,
						title: "Error",
						onClose: this.onAssignClose,
						actions: [MessageBox.Action.CLOSE],
						styleClass: "sapUiSizeCompact myMessageBox"
					}
				);
				return;
			}
			var oMpdel = this.getOwnerComponent().getModel();

			var sSystemId = "";
			if (sap.ui.getCore().byId("idMatMasSysIE").getSelectedKey() === "L") {
				sSystemId = "L";
			} else {
				sSystemId = "T";
			}
			var sMatNo = sap.ui.getCore().byId("idEMaterialnumber").getValue();
			var payload = {
				Z_MATRL_NUM: sap.ui.getCore().byId("idEMaterialnumber").getValue(), //.getSelected() ? "X" : "",
				ZSYSTEM: sSystemId,
				ZMATRL_DESC: sap.ui.getCore().byId("idEMaterialDec").getValue(),
				ZBASE_UNIT_MEASURE: sap.ui.getCore().byId("idEBaseUnitMeasure").getValue(),
				ZMIN_ORDER_QUAN: "0",
				ZGRP_DEVLPR: sap.ui.getCore().byId("idEGroupDeveloper").getSelectedKey(),
				ZFROZEN_PERIOD : sap.ui.getCore().byId("idEFrozenPeriod").getValue(),
				ZDEL_FLAG: sap.ui.getCore().byId("idDelEditMat").getState() === true ? 'X' : '',
				REVOKE_FLAG: sap.ui.getCore().byId("idDelEditMat").getState() === true ? '' : 'X',
			};
			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "PUT",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {

					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"Material " + sMatNo + " updated successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					oMpdel.refresh();
					that.onEditClose();
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

			this._oMMiDialog.close();
			if (this._oMMiDialog) {
				this._oMMiDialog = this._oMMiDialog.destroy();
			}

		},

		onDeleteMatPress: function (oEvent) {

			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));

			var sMatId = oModel.getData().Z_MATRL_NUM;
			var payload = {
				Z_MATRL_NUM: sMatId,
				ZSYSTEM : oModel.getData().ZSYSTEM
			};
			var that = this,
				sMsg = "";

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
			if (oModel.getData().ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for Material " + sMatId;
			} else {
				sMsg = "Confirm to delete Material " + sMatId;
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
			var oModel = this.getOwnerComponent().getModel();
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "DELETE",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();

					MessageBox.show(
						data.message, {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					oModel.refresh();
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

		onDeleteMaterialAssign: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("matItemAssignment").getObject())));
			var oMpdel = this.getOwnerComponent().getModel();

			var that = this,
				sMsg = "";
			var payload = {
				"ZMAT_NUM": oModel.getData().ZMAT_NUM,
				"ZITM_CATEGORY": oModel.getData().ZITM_CATEGORY,
				"ZSYSTEM": oModel.getData().ZSYSTEM
			};

			if (oModel.getData().ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for Item Category " + oModel.getData().ZITM_CATEGORY;
			} else {
				sMsg = "Confirm to delete Item Category " + oModel.getData().ZITM_CATEGORY;
			}

			var sUrl = "/HANAXS/com/merckgroup/moet//services/xsjs/matItemCategoryAssign.xsjs";
			MessageBox.confirm(sMsg, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {
						//that.deleteFunction(sUrl, payload);

						//	var oMpdel = this.getOwnerComponent().getModel();
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
								//oMpdel.refresh();
								that._getAssignItemCategory();
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
								that._getAssignItemCategory();
							}
						});

					}
				}
			});
			//_getAssignItemCategory
			//sap.ui.core.BusyIndicator.show();
			/*	$.ajax({
				url: sUrl,
				type: "DELETE",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					
					MessageBox.show(
						data.message, {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that._getAssignItemCategory();
				},
				error: function (oError) {
					that._getAssignItemCategory();
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
*/
		},

		onSaveMatAssign: function (evt) {
			var that = this;

			var sCustNo = this._oViewPropertiesCust.getProperty("/custNo"),
				sMatNo = sap.ui.getCore().byId("idMaterialinput").getValue(),
				sSystem = "X";
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/createCustMatAssign.xsjs";
			var payload = {
				ZCUST_NUM: sCustNo,
				ZMAT_NUM: sMatNo,
				ZSYSTEM: sSystem
			};
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
						data.message, {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that.onAssignMaterial(that.oSourceMat);

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

			this._oAssMatDialog.close();
			if (this._oAssMatDialog) {
				this._oAssMatDialog = this._oAssMatDialog.destroy();
			}
		},

		_onUpdateMatAssign: function (oEvent) {

			var oDModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("materialAssignment").getObject())));
			var aData = oDModel.getData();

			var payload = {
				"ZCUST_NUM": aData.ZCUST_NUM,
				"ZMAT_NUM": aData.ZMAT_NUM
			};
			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/createCustMatAssign.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "PUT",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {

					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						data.message, {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					that.onAssignMaterial(that.oSourceMat);

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
			this._oupdateMetAssDialog.close();
			if (this._oupdateMetAssDialog) {
				this._oupdateMetAssDialog = this._oupdateMetAssDialog.destroy();
			}

		},

		/************* Asssign Item Category ********************/

		onAItemClose: function () {
			this._oAItemDialog.close();
			if (this._oAItemDialog) {
				this._oAItemDialog = this._oAItemDialog.destroy();
			}
		},

		onAItemPress: function (oEvent) {

			var oSource;

			if (oEvent.getId() === "press") {
				oSource = oEvent.getSource();
				this.oSourceMat = oSource;
			} else {
				oSource = oEvent;
			}

			this.oGetPerticulterRowValue = new JSONModel(JSON.parse(JSON.stringify(oSource._getBindingContext().getObject())));
			this._getAssignItemCategory(function () {
				if (!this._oAItemDialog) {
					this._oAItemDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.itemCategory", this);
					this.getView().addDependent(this._oAItemDialog);
				}

				this._oAItemDialog.open();
			}.bind(this));

		},

		_getAssignItemCategory: function (callback) {

			var pr = this.getView().getModel("viewPropertiesMatA");
			//	
			pr.setProperty("/matNo", this.oGetPerticulterRowValue.getData().Z_MATRL_NUM);
			pr.setProperty("/matDec", this.oGetPerticulterRowValue.getData().ZMATRL_DESC);
			pr.setProperty("/bsystem", this.oGetPerticulterRowValue.getData().ZSYSTEM);

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/MatItemCategoryAssign";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZMAT_NUM", "EQ", this.oGetPerticulterRowValue.getData().Z_MATRL_NUM),new Filter("ZSYSTEM", "EQ", this.oGetPerticulterRowValue.getData().ZSYSTEM)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					this._getItemCategory();
					if (callback) {
						callback();
					}
					this._oAItemDialog.setModel(oJsonModel, "matItemAssignment");
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		onAssignItemCategoryPress: function (oEvent) {
			var aItemCat = this.getView().getModel("ItemCat").getData();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			if (!this._oAssItCateDialog) {
				this._oAssItCateDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignItemCategory", this);
				oJsonModel.setData(aItemCat);
				this._oAssItCateDialog.setModel(oJsonModel, "ItemCategory");
				this.getView().addDependent(this._oAssItCateDialog);
			}
			this._oAssItCateDialog.open();
		},

		onAssignItemCategoryClose: function (oEvent) {
			this._oAssItCateDialog.close();
			if (this._oAssItCateDialog) {
				this._oAssItCateDialog = this._oAssItCateDialog.destroy();
			}
		},

		onSaveItemToMaterial: function (evt) {
			var that = this;

			var sMatNo = this._oViewPropertiesMatA.getProperty("/matNo"),
				sItmCat = sap.ui.getCore().byId("idMaterialIAIinput").getSelectedKey(),
				sSystem = this._oViewPropertiesMatA.getProperty("/bsystem"),
				sItmCatK = "";
			if (sItmCat) {
				sItmCatK = sItmCat;
			} else {
				sItmCatK = "";
			}

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/matItemCategoryAssign.xsjs";
			var payload = {
				ZMAT_NUM: sMatNo,
				ZITM_CATEGORY: sItmCatK,
				ZSYSTEM: sSystem,
				ZDEL_FLAG: ""
			};
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
						"Item Category " + sItmCat + " created successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that._getAssignItemCategory();
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
			this._oAssItCateDialog.close();
			if (this._oAssItCateDialog) {
				this._oAssItCateDialog = this._oAssItCateDialog.destroy();
			}
		},

		_getItemCategory: function () {
			var oViewPropertiesModle = this.getView().getModel("viewPropertiesMatA");
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/ItemCategory";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZSYSTEM", "EQ", oViewPropertiesModle.getProperty("/bsystem"))],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					this.getView().setModel(oJsonModel, "ItemCat");
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		onExportPress: function () {
			var oExportConfiguration = {
				dataSource: {
					type: "OData",
					dataUrl: "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/MaterialAllDetails",
					serviceUrl: "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/",
					count: 17491,
					useBatch: true,
					headers: {},
					sizeLimit: 500
				}
			};
			var oSpreadsheet = new Spreadsheet(oExportConfiguration);

			/* Starts the export and returns a Promise */
			var oExportPromise = oSpreadsheet.build();

			oExportPromise.then(function () {
				// Here you can perform additional steps after the export has finished
			});
		},
		createColumns: function () {
			return [{
				label: "Matrial Number",
				property: "ZMAT_NUM"
			}, {
				label: "Matrial Discreption",
				property: "disc"
			}, ];
		},

		onUpdateMaterial: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			//var sCumId = oModel.getData().ZCUSTMR_NUM;
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this,
				sDelFlag,
				sRevFlag;
			if (oEvent.getParameter("state") === true) {
				sDelFlag = "X";
				sRevFlag = "";
			} else {
				sDelFlag = "";
				sRevFlag = "X";
			}

			var payload = {
				Z_MATRL_NUM: oModel.getData().Z_MATRL_NUM,
				ZSYSTEM: oModel.getData().ZSYSTEM,
				ZMATRL_DESC: oModel.getData().ZMATRL_DESC,
				ZBASE_UNIT_MEASURE: oModel.getData().ZBASE_UNIT_MEASURE,
				ZMIN_ORDER_QUAN: "0",
				ZGRP_DEVLPR: oModel.getData().ZGRP_DEVLPR,
				ZFROZEN_PERIOD : oModel.getData().ZFROZEN_PERIOD,
				ZDEL_FLAG: sDelFlag,
				REVOKE_FLAG: sRevFlag
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "PUT",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"For Material " + oModel.getData().Z_MATRL_NUM + ", deletion flag revoked", {
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

		onUpdateMaterialItem: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("matItemAssignment").getObject())));
			//var sCumId = oModel.getData().ZCUSTMR_NUM;
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this,
				sDelFlag,
				sRevFlag;
			if (oEvent.getParameter("state") === true) {
				sDelFlag = "X";
				sRevFlag = "";
			} else {
				sDelFlag = "";
				sRevFlag ="X";
			}

			var payload = {
				ZMAT_NUM: oModel.getData().ZMAT_NUM,
				ZITM_CATEGORY: oModel.getData().ZITM_CATEGORY,
				ZSYSTEM: oModel.getData().ZSYSTEM,
				ZDEL_FLAG: sDelFlag,
				REVOKE_FLAG: sRevFlag
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/matItemCategoryAssign.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "PUT",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"For Assigned Item Category " + oModel.getData().ZITM_CATEGORY + ", deletion flag revoked", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that._getAssignItemCategory();
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

		onItemCategoryChange: function () {
			var oViewPropertiesModle = this.getView().getModel("viewPropertiesMatA");
			var sItmCat = sap.ui.getCore().byId("idMaterialIAIinput").getSelectedKey();
			if (sItmCat) {
				sap.ui.getCore().byId("btnAssginCat").setEnabled(true);
			} else {
				sap.ui.getCore().byId("btnAssginCat").setEnabled(false);
			}
		},

		onExportAllData: function () {

			var oModel = this.getOwnerComponent().getModel(),
				sPath = "/MaterialDetails",
				aMartialno = [];
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				urlParameters: {
					"$select": "Z_MATRL_NUM"
				},

				filters: this.oDownLoadFilters,
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oResp.results.forEach(function (item) {
						aMartialno.push(new Filter("Z_MATRL_NUM", "EQ", item.Z_MATRL_NUM));
					});
					this._downloadMaterialAllData(aMartialno);
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		_downloadMaterialAllData: function (aMartialno) {
			var sPath = "/MaterialAllDetails";
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read(sPath, {
				filters: aMartialno,
				success: function (oData) {
					//var oTable = that.getView().byId("table");
					//	var oColumn = oTable.getColumns();
					var result = oData.results,
						test, oColumn;
					var aExportColumns = [];
					// for(var k=0;k<result.length;k++){
					// 	 	result[k].ZSYSTEM = (result[k].ZSYSTEM === "L") ? "LEAN" : "TEMPO";
					//  	result[k].ZITM_CATEGORY = this.custFormatter.focSmplVal(result[k].ZITM_CATEGORY,that);
					// }
					result.forEach(function (item) {
						item.ZSYSTEM = (item.ZSYSTEM === "L") ? "LEAN" : "TEMPO";
						//	item.ZITM_CATEGORY = that.custFormatter.focSmplVal(item.ZITM_CATEGORY).bind(that);
						//	item.ZITM_CATEGORY = that.ItemCategoryConversion(item.ZITM_CATEGORY);
						item.ZITM_CATEGORY = item.ZITM_CATEGORY + "-" + that.ItemCategoryConversion(item.ZITM_CATEGORY);

					});
					var oMetadata = that.getOwnerComponent().getModel().getServiceMetadata();
					//	test =oMetadata.dataServices.schema[0].entityType.find(o => o.name === 'MaterialAllDetailsType'),

					for (var z = 0; z < oMetadata.dataServices.schema[0].entityType.length; z++) {
						if (oMetadata.dataServices.schema[0].entityType[z].name === "MaterialAllDetailsType") {
							test = oMetadata.dataServices.schema[0].entityType[z];
							break;
						}
					}
					oColumn = test.property;

					oColumn.forEach(function (item) {
						if (item.type === "Edm.DateTime") {
							var obj1 = {
								label: item.extensions[0].value,
								property: item.name,
								type: sap.ui.export.EdmType.Date
							};
							aExportColumns.push(obj1);
						} else {
							var obj = {
								label: item.extensions[0].value,
								property: item.name,

							};
							aExportColumns.push(obj);
						}

					});
					var oDate = new Date();
					var sTimeStamp = oDate.toLocaleString();
					// var Time = oDate.getHours() + "" + oDate.getMinutes() + ""  + oDate.getSeconds();
					var sFileName = "Item Category" + " " + sTimeStamp;
					var mSettings = {
						workbook: {
							columns: aExportColumns,
							context: {
								sheetName: "Item Category"
							}
						},
						fileName: sFileName + ".xlsx",
						dataSource: result
					};
					var oSpreadsheet = new Spreadsheet(mSettings);
					oSpreadsheet.build();
				}.bind(this),
				error: function (oError) {

				}
			});
		},

	});
});