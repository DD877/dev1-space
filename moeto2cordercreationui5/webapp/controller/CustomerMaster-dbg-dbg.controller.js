sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/Token",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet"
], function (BaseController, JSONModel, formatter, Filter, Sorter, Token, FilterOperator, MessageBox, Spreadsheet) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.CustomerMaster", {

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
			var sAssMat = sap.ui.getCore().byId("ID_ASS_MAT");
			sAssMat.setEnabled(false);
		},
		formatShipTo: function (shipTo) {
			if (shipTo === 'L') {
				return "LEAN";
			} else {
				return "TEMPO";
			}
		},

		handleChangeShipto: function () {
			var sCustNo = sap.ui.getCore().byId("idShiptoCustinput").getValue();
			var sShiptoNo = sap.ui.getCore().byId("idShiptoAinput").getValue();

			var sShiptoNoval = sap.ui.getCore().byId("idShiptoAinput");
			if (sShiptoNoval.getValue() === "") {
				sShiptoNoval.setValueState("Error");
			} else {
				sShiptoNoval.setValueState("None");
			}

			//
			var sUSystem = sap.ui.getCore().byId("idShiptoSystAinput").getValue();
			var sSysId;
			/*if (sUSystem === "LEAN") {
				sSysId = "DLACLNT100";
			} else {
				sSysId = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "LEAN") {

					sSysId = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "TEMPO") {

					sSysId = aSystemData[i].Yylow;

				}

			}

			var sFData = "/ycustomervalidationSet(IvCustomer='" + sCustNo + "',IvShipParty='" + sShiptoNo + "',IvSyssid='" + sSysId + "')";
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				success: function (oData1, oResponse1) {
					var oModel_Customer = new JSONModel();
					oModel_Customer.setData(oData1);
					sap.ui.getCore().byId("idShiptoDescAinput").setValue(oData1.ShipToPartyDesc);
					sap.ui.getCore().byId("idShiptoCityAinput").setValue(oData1.ShipToCity);
					sap.ui.getCore().byId("idShiptoPoAinput").setValue(oData1.ShipToPostcode);
					sap.ui.getCore().byId("idShiptoRegAinput").setValue(oData1.ShipToRegion);
				}.bind(this),
				error: function (oError) {

				}.bind(this)
			});
		},

		handleChangeFtrade: function () {
			var sCustNo = sap.ui.getCore().byId("idFtradeCustinput").getValue();
			var sShiptoNo = sap.ui.getCore().byId("idFtradeAinput").getValue();
			//
			var sUSystem = sap.ui.getCore().byId("idFtradeSystAinput").getValue();
			var sSysId;
			var sShiptoNoval = sap.ui.getCore().byId("idFtradeAinput");
			if (sShiptoNoval.getValue() === "") {
				sShiptoNoval.setValueState("Error");
			} else {
				sShiptoNoval.setValueState("None");
			}

			/*if (sUSystem === "LEAN") {
				sSysId = "DLACLNT100";
			} else {
				sSysId = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "LEAN") {

					sSysId = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "TEMPO") {

					sSysId = aSystemData[i].Yylow;

				}

			}

			var sFData = "/ycustomervalidationSet(IvCustomer='" + sCustNo + "',IvShipParty='" + sShiptoNo.toUpperCase() + "',IvSyssid='" +
				sSysId + "')";
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				success: function (oData1, oResponse1) {
					var oModel_Customer = new JSONModel();
					oModel_Customer.setData(oData1);
					sap.ui.getCore().byId("idFtradeADescinput").setValue(oData1.ShipToPartyDesc);
					sap.ui.getCore().byId("idFtCityAinput").setValue(oData1.ShipToCity);
					sap.ui.getCore().byId("idFtPcAinput").setValue(oData1.ShipToPostcode);
					sap.ui.getCore().byId("idFtRegAinput").setValue(oData1.ShipToRegion);
				}.bind(this),
				error: function (oError) {

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
			this.getRouter().getRoute("CustomerMaster").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();
			this._getSystem();
			this.fNotification = [];
			var oJsonaPostOnEvent = new JSONModel();

			this._oViewPropertiesCust = new JSONModel({
				custNo: "",
				customerid: "C001",
				bsystem: "",
				CustomerName: "",
				city: "",
				Street: "",
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

			this._oViewPropertiesMat = new JSONModel({
				matDesc: "",
				matNo: ""
			});
			this.getView().setModel(this._oViewPropertiesMat, "viewPropertiesMat");

			this._oViewPropertiesSO = new JSONModel({
				salesArea: "",
				salesId: "",
				Distrchn: "",
				Division: ""
			});
			this.getView().setModel(this._oViewPropertiesSO, "viewPropertiesSO");

			this._oViewPropertiesCMatA = new JSONModel({
				matNo: "",
				custNo: "",
				itmCat: "",
				matDec: "",
				bsystem: ""
			});
			this.getView().setModel(this._oViewPropertiesCMatA, "viewPropertiesCMatA");
			this.getItemCategoryData();

		},

		fnSelectSystem: function (oEvent) {

			var sSystemKey = sap.ui.getCore().byId("idUominput1w").getSelectedKey();
			var oJsonModel = this.getView().getModel("customerTest");
			var oviewProperties = this.getView().getModel("viewPropertiesCust");
			var sCustNoId = sap.ui.getCore().byId("idMaterialinput1w");
			if (sCustNoId.getValue() === "") {
				sCustNoId.setValueState("Error");
			} else {
				sCustNoId.setValueState("None");
			}

			var oFilter = new Filter({
				filters: [
					new Filter("IvCustomer", "EQ", '210100139'),
					new Filter("IvShipParty", "EQ", '210100139'),
					new Filter("IvSyssid", "EQ", 'DLACLNT100')
				],
				and: true
			});
			var sCustNo = sap.ui.getCore().byId("idMaterialinput1w").getValue();

			this._getDeliveryBlock(sap.ui.getCore().byId("idUominput1w").getSelectedKey());

			var sUSystem = sap.ui.getCore().byId("idUominput1w").getSelectedKey();
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
			
			if(sCustNo ===""){
				return;
			}

			var sFData = "/ycustomervalidationSet(IvCustomer='" + sCustNo + "',IvShipParty='" + sCustNo + "',IvSyssid='" + sSysId + "')";
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				success: function (oData1, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					if (oData1.Retmsg === '') {
						var oModel_Customer = new JSONModel();
						oModel_Customer.setData(oData1);
						sap.ui.getCore().byId("idQuantityinputE1w").setValue(oData1.CustmCity);
						sap.ui.getCore().byId("idQuantityinput1w").setValue(oData1.CustmName);
						sap.ui.getCore().byId("idCustStreet").setValue(oData1.CustmStreet);
						sap.ui.getCore().byId("idQuantityinputE21w").setValue(oData1.CustmRegion);
						sap.ui.getCore().byId("idQuantityinputE31w").setValue(oData1.PostalCode);
					} else {
						this.fnClearAllValue();
						MessageBox.show(
							oData1.Retmsg, {
								icon: MessageBox.Icon.ERROR,
								title: "Error",
								onClose: this.onAssignClose,
								actions: [MessageBox.Action.CLOSE],
								styleClass: "sapUiSizeCompact myMessageBox"
							}
						);

					}

				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					this.fnClearAllValue();
					MessageBox.show(
						"Please enter correct customer number", {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

				}.bind(this)
			});

		},

		fnClearAllValue: function () {
			var oviewProperties = this.getView().getModel("viewPropertiesCust");
			oviewProperties.setProperty("/bsystem", "");
			oviewProperties.setProperty("/CustomerName", "");
			oviewProperties.setProperty("/city", "");
			oviewProperties.setProperty("/Street", "");
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
			this._oCMiDialog.close();
			if (this._oCMiDialog) {
				this._oCMiDialog = this._oCMiDialog.destroy();
			}
		},

		onAddCMPress: function () {
			this.fnClearAllValue();
			if (!this._oCMiDialog) {
				this._oCMiDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.customerMaster", this);
				this.getView().addDependent(this._oCMiDialog);
			}
			this._oCMiDialog.open();

		},
		onAssignMaterial: function (oEvent) {
			var oSource;
			if (oEvent.getId() === "press") {
				oSource = oEvent.getSource();
				this.oSourceMat = oSource;
			} else {
				oSource = oEvent;
			}
			this.oGetRowValue = new JSONModel(JSON.parse(JSON.stringify(oSource._getBindingContext().getObject())));
			this._getAssignMaterial(function () {
				if (!this._oMatAssgnDialog) {

					this._oMatAssgnDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.materialAssignment", this); //this.byId('ins1').setModel(this.jModel);
					this.getView().addDependent(this._oMatAssgnDialog);
				}
				this._oMatAssgnDialog.open();

			}.bind(this));

		},

		_getAssignMaterial: function (callback) {
			var pr = this.getView().getModel("viewPropertiesCust");
			pr.setProperty("/custNo", this.oGetRowValue.getData().ZCUSTMR_NUM);
			pr.setProperty("/bsystem", this.oGetRowValue.getData().ZSYSTEM);

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerMatAssignDetails";

			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", this.oGetRowValue.getData().ZCUSTMR_NUM)],
				success: function (oResp) {
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					if (callback) {
						callback();
					}
					this._oMatAssgnDialog.setModel(oJsonModel, "materialAssignment");

				}.bind(this),
				error: function (err) {}
			});
		},

		onMatAssignClose: function () {
			this._oMatAssgnDialog.close();
			if (this._oMatAssgnDialog) {
				this._oMatAssgnDialog = this._oMatAssgnDialog.destroy();
			}
		},

		onAssignMatPress: function (oEvent) {

			var that = this;
			var viewPropertiesMat = this.getView().getModel("viewPropertiesMat");

			viewPropertiesMat.setProperty("/matNo", "");
			var viewProperties = this.getView().getModel("viewPropertiesSO");
			viewProperties.setProperty("/salesId", "");
			viewProperties.setProperty("/Distrchn", "");
			viewProperties.setProperty("/Division", "");

			var sCustNoA = this.getView().getModel("viewPropertiesCust").getProperty("/custNo");
			var sSystem = "";
			var sUSystem = this.getView().getModel("viewPropertiesCust").getProperty("/bsystem");
			/*if (this.getView().getModel("viewPropertiesCust").getProperty("/bsystem") === "L") {
				sSystem = "DLACLNT100";
			} else {
				sSystem = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "L") {

					sSystem = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "T") {

					sSystem = aSystemData[i].Yylow;

				}

			}
			
			var sPathM = "/MaterialDetails",
				sFilterM = new Filter("ZSYSTEM", "EQ", sUSystem);
			var oModelMat = new JSONModel();
			var oModel = this.getOwnerComponent().getModel();
			oModel.read(sPathM, {
				filters: [sFilterM],
				success: function (oResp) {
					oModelMat.setData(oResp.results);
					that.getView().setModel(oModelMat, "oModelmat1");
				},
				error: function (err) {
				}
			});
			

			var sFData = "/ysaleAreaInputSet(IvCustomer='" + sCustNoA + "',IvSyssid='" + sSystem + "')";
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				urlParameters: {
					"$expand": "NavsalesArea"
				},
				success: function (oData1, oResponse1) {
					var oModel_SalesOff = new JSONModel();
					oModel_SalesOff.setData(oData1.NavsalesArea.results);
					that.getView().setModel(oModel_SalesOff, "SalesOfficeMA");
					
					if (!that._oAssMatDialog) {
						that._oAssMatDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignMaterial", that);
						that.getView().addDependent(that._oAssMatDialog);
					}
					this._oAssMatDialog.open();
				}.bind(this),
				error: function (oError) {}.bind(this)
			});

		},

		/************************* Sales Office MA ****************************/

		// Sales Office F4 help functionality

		onSalesRequestMA: function (oEvent) {
			var oView;
			this._material = oEvent.getSource();
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.SalesOffcF4HelpMA) {
				this.SalesOffcF4HelpMA = sap.ui.xmlfragment(this.getView().getId(),
					"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.SalesOffcF4HelpMA",
					this);
				oView.addDependent(this.SalesOffcF4HelpMA);

			}
			this.SalesOffcF4HelpMA.open();
		},
		/**
		 * This event is fired on search values in Sale Arae 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleSalesOffcSearchMA: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilterKey = new Filter("Salesorg", "Contains", sValue.toUpperCase());
			var oBinding = oEvent.getSource().getBinding("items");
			var aFilter = new Filter({
				filters: [oFilterKey],
				and: false
			});
			oBinding.filter([aFilter]);
		},

		/**
		 * This event is fired on close of Value help for Article field 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onPressSalesOffcValueListMAClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewPropertiesSO");
			var that = this;
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("SalesOfficeMA").getObject();
				viewProperties.setProperty("/salesId", object.Salesorg);
				viewProperties.setProperty("/Distrchn", object.Distrchn);
				viewProperties.setProperty("/Division", object.Division);

			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/************************ Sales Office MA ENd *************************/

		onAssignMatClose: function () {
			this._oAssMatDialog.close();
			if (this._oAssMatDialog) {
				this._oAssMatDialog = this._oAssMatDialog.destroy();
			}
		},

		onAssignShiptoPress: function (oEvent) {
			if (!this._oAssShiptoDialog) {
				this._oAssShiptoDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignShipto", this);
				this.getView().addDependent(this._oAssShiptoDialog);
			}
			this._oAssShiptoDialog.open();
		},

		onAssignShiptoClose: function (oEvent) {

			this._oAssShiptoDialog.close();
			sap.ui.getCore().byId("idShiptoAinput").setValue("");
			sap.ui.getCore().byId("idShiptoDescAinput").setValue("");
			sap.ui.getCore().byId("idShiptoCityAinput").setValue("");
			sap.ui.getCore().byId("idShiptoRegAinput").setValue("");
			sap.ui.getCore().byId("idShiptoPoAinput").setValue("");
			if (this._oAssShiptoDialog) {
				this._oAssShiptoDialog = this._oAssShiptoDialog.destroy();
			}

		},

		onShipClose: function () {
			this._oShipDialog.close();
			if (this._oShipDialog) {
				this._oShipDialog = this._oShipDialog.destroy();
			}
		},

		onShipPress: function (oEvent) {
			var oSource;
			if (oEvent.getId() === "press") {
				oSource = oEvent.getSource();
				this.oSourceMat = oSource;
			} else {
				oSource = oEvent;
			}
			this.oGetPerticulterRowValue = new JSONModel(JSON.parse(JSON.stringify(oSource._getBindingContext().getObject())));
			this.test(function () {
				if (!this._oShipDialog) {
					this._oShipDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.shipto", this);
					this.getView().addDependent(this._oShipDialog);
				}
				this._oShipDialog.open();
			}.bind(this));
		},
		test: function (callback) {
			var pr = this.getView().getModel("viewPropertiesCust");
			pr.setProperty("/custNo", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM);
			pr.setProperty("/bsystem", this.oGetPerticulterRowValue.getData().ZSYSTEM);
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerShipToPartyAssignDetails";
			oModel.read(sPath, {
				filters: [new Filter("ZCUSTMR_NUM", "EQ", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM)],
				success: function (oResp) {
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					if (callback) {
						callback();
					}
					this._oShipDialog.setModel(oJsonModel, "shiptoAssignment");

				}.bind(this),
				error: function (err) {}
			});
		},

		onFtradePress: function (oEvent) {

			var oSource;

			if (oEvent.getId() === "press") {
				oSource = oEvent.getSource();
				this.oSourceMat = oSource;
			} else {
				oSource = oEvent;
			}

			this.oGetPerticulterRowValue = new JSONModel(JSON.parse(JSON.stringify(oSource._getBindingContext().getObject())));

			this._getFtrade(function () {
				if (!this._oFtradeDialog) {
					this._oFtradeDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.fTrade", this);
					this.getView().addDependent(this._oFtradeDialog);
				}

				this._oFtradeDialog.open();
			}.bind(this));

		},

		_getFtrade: function (callback) {
			var pr = this.getView().getModel("viewPropertiesCust");
			pr.setProperty("/custNo", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM);
			pr.setProperty("/bsystem", this.oGetPerticulterRowValue.getData().ZSYSTEM);

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerFTradeAssignDetails";

			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM)],
				success: function (oResp) {
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					if (callback) {
						callback();
					}
					this._oFtradeDialog.setModel(oJsonModel, "ftradeAssignment");

				}.bind(this),
				error: function (err) {}
			});
		},

		onBlockPress: function (oEvent) {

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
			pr.setProperty("/bsystem", oGetPerticulterRowValue.getData().ZSYSTEM);

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerDeliveryBlock";

			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", oGetPerticulterRowValue.getData().ZCUSTMR_NUM)],
				success: function (oResp) {
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					if (!this._oblockDialog) {
						this._oblockDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.Blocks", this);
						this.getView().addDependent(this._oblockDialog);
					}
					this._oblockDialog.setModel(oJsonModel, "blockAssignment");
					this._oblockDialog.open();

				}.bind(this),
				error: function (err) {}
			});

		},

		onAssignBlockPress: function () {
			if (!this._oAssBlockDialog) {
				this._oAssBlockDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignBlock", this);
				this.getView().addDependent(this._oAssBlockDialog);
			}
			this._oAssBlockDialog.open();
		},

		onAssignBlockClose: function () {
			this._oAssBlockDialog.close();
			if (this._oAssBlockDialog) {
				this._oAssBlockDialog = this._oAssBlockDialog.destroy();
			}
		},

		onAssignFtradePress: function () {

			if (!this._oAssFtradeDialog) {
				this._oAssFtradeDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignFtrade", this);
				this.getView().addDependent(this._oAssFtradeDialog);
			}
			this._oAssFtradeDialog.open();
		},

		onAssignFtradeClose: function () {
			this._oAssFtradeDialog.close();
			if (this._oAssFtradeDialog) {
				this._oAssFtradeDialog = this._oAssFtradeDialog.destroy();
			}
		},

		onSaveBlockmaster: function (evt) {
			var that = this;
			var sCustNo = this._oViewPropertiesCust.getProperty("/custNo"),
				sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custDeliveryBlock.xsjs";
			var payload = {
				ZCUST_NUM: sCustNo,
				ZDEL_BLOCK_ID: sap.ui.getCore().byId("idBlockinput").getSelectedItem().getKey(),
				ZLANGUAGE: "EN",
				ZDEL_BLOCK_DESC: sap.ui.getCore().byId("idBlockinput").getSelectedItem().getText()
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
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						oError.responseJSON.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});

		},
		_onUpdateBlockAssign: function (oEvent) {
			var oDModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("blockAssignment").getObject())));
			var aData = oDModel.getData();

			var payload = {
				"ZCUST_NUM": aData.ZCUST_NUM,
				"ZDEL_BLOCK_ID": aData.ZDEL_BLOCK_ID
			};
			var that = this;
			sap.ui.core.BusyIndicator.show();
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custDeliveryBlock.xsjs";
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
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						oError.responseJSON.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});
		},

		onSaveFtrademaster: function (evt) {
			var that = this;
			var sCustNo = this._oViewPropertiesCust.getProperty("/custNo"),
				sFtrade = sap.ui.getCore().byId("idFtradeAinput").getValue(),
				sFtradeDesc = sap.ui.getCore().byId("idFtradeADescinput").getValue(),
				sFtradeCity = sap.ui.getCore().byId("idFtCityAinput").getValue(),
				sFtradeReg = sap.ui.getCore().byId("idFtRegAinput").getValue(),
				sFtradePo = sap.ui.getCore().byId("idFtPcAinput").getValue(),
				sFtradeSys = sap.ui.getCore().byId("idFtradeSystAinput").getValue();
			if (sFtradeSys === "LEAN") {
				sFtradeSys = "L";
			} else {
				sFtradeSys = "T";
			}
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custForeignTrade.xsjs";
			var payload = {
				ZCUST_NUM: sCustNo,
				ZFTRADE: sFtrade.toUpperCase(),
				ZFTRADE_DESC: sFtradeDesc,
				ZCITY: sFtradeCity,
				ZREGION: sFtradeReg,
				ZPOSTAL_CODE: sFtradePo,
				ZDEL_FLAG: "",
				ZSYSTEM: sFtradeSys
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
						"FTrade " + sFtradeDesc + " is assigned to the customer successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					that._getFtrade();
					that.onAssignFtradeClose();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						oError.responseJSON.message, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});

		},

		_onUpdateFtradeAssign: function (oEvent) {
			var oDModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("ftradeAssignment").getObject())));
			var aData = oDModel.getData();

			var payload = {
				"ZCUST_NUM": aData.ZCUST_NUM,
				"ZFTRADE": aData.ZFTRADE
			};
			var that = this,
				sMsg;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custForeignTrade.xsjs";

			if (aData.ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for FTrade " + aData.ZFTRADE;
			} else {
				sMsg = "Confirm to delete Material " + aData.ZFTRADE;
			}

			MessageBox.confirm(sMsg, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {
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
										actions: [MessageBox.Action.CLOSE],
										styleClass: "sapUiSizeCompact myMessageBox"
									}
								);
								that._getFtrade();
							},
							error: function (oError) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.show(
									oError.responseJSON.message, {
										icon: MessageBox.Icon.ERROR,
										title: "Error",
										actions: [MessageBox.Action.CLOSE],
										styleClass: "sapUiSizeCompact myMessageBox"
									}
								);
								that._getFtrade();
							}
						});
					}
				}
			});

		},

		onFtradeClose: function () {
			this._oFtradeDialog.close();
			if (this._oFtradeDialog) {
				this._oFtradeDialog = this._oFtradeDialog.destroy();
			}
		},

		onCEditClose: function () {
			this._oupdateCustDialog.close();
			if (this._oupdateCustDialog) {
				this._oupdateCustDialog = this._oupdateCustDialog.destroy();
			}
		},

		onCEditPress: function (oEvent) {

			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			this._getDeliveryBlockUpdate(oModel.getData().ZSYSTEM);
			if (!this._oupdateCustDialog) {

				this._oupdateCustDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.customerMasterEdit", this);
				this._oupdateCustDialog.setModel(oModel, "editCustomer");
				this.getView().addDependent(this._oupdateCustDialog);
			}
			this._oupdateCustDialog.open();
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

		onEditCust: function (oEvent) {
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this;
			var oModel = this._oupdateCustDialog.getModel("editCustomer");
			var oMpdel = this.getOwnerComponent().getModel();
			var sCumId = oModel.getData().ZCUSTMR_NUM;

			var selBlockId = sap.ui.getCore().byId("selBlockId");
			var payload = {
				ZCUSTMR_NUM: sCumId,
				ZSYSTEM: oModel.getData().ZSYSTEM,
				ZNAME_1: oModel.getData().ZNAME_1,
				ZCITY: oModel.getData().ZCITY,
				ZREGION: oModel.getData().ZREGION,
				ZSTREET: oModel.getData().ZSTREET,
				ZCENTRL_DEL_FLAG: '',
				ZPOSTAL_CODE: oModel.getData().ZPOSTAL_CODE,
				ZDEL_BLOCK_ID: selBlockId.getSelectedKey()
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "PUT",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					//MessageBox.show(response);
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"Customer " + sCumId + " updated successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					//
					oMpdel.refresh();
					that.onCEditClose();

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

		onSaveCustomermaster: function (oEvent) {
			var bVali = this._handleValidation();
			if (!bVali) {
				return;
			}

			var oMpdel = this.getOwnerComponent().getModel(),
				sCustNo = sap.ui.getCore().byId("idMaterialinput1w").getValue();
			var payload = {
				ZCUSTMR_NUM: sap.ui.getCore().byId("idMaterialinput1w").getValue(), //.getSelected() ? "X" : "",
				ZSYSTEM: sap.ui.getCore().byId("idUominput1w").getSelectedKey(),
				ZNAME_1: sap.ui.getCore().byId("idQuantityinput1w").getValue(),
				ZCITY: sap.ui.getCore().byId("idQuantityinputE1w").getValue(),
				ZREGION: sap.ui.getCore().byId("idQuantityinputE21w").getValue(),
				ZSTREET: sap.ui.getCore().byId("idCustStreet").getValue(),
				ZCENTRL_DEL_FLAG: "",
				ZPOSTAL_CODE: sap.ui.getCore().byId("idQuantityinputE31w").getValue(),
				ZDEL_BLOCK_ID: sap.ui.getCore().byId("selDeliveryBlock").getSelectedKey()
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
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
						"Customer " + sCustNo + " created successfully", {
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

			this._oCMiDialog.close();
			if (this._oCMiDialog) {
				this._oCMiDialog = this._oCMiDialog.destroy();
			}

		},

		onDeleteCustPress: function (oEvent) {
			var oMpdel = this.getOwnerComponent().getModel();

			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			var sCumId = oModel.getData().ZCUSTMR_NUM;
			var payload = {
				ZCUSTMR_NUM: sCumId,
				ZSYSTEM: oModel.getData().ZSYSTEM
			};
			var that = this,
				sMsg = "";
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
			//sap.ui.core.BusyIndicator.show();

			if (oModel.getData().ZCENTRL_DEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for Customer " + sCumId;
			} else {
				sMsg = "Confirm to delete Customer " + sCumId;
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
			var that = this;
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "DELETE",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					//MessageBox.show(response);
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
					oMpdel.refresh();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var oViewModel = that.getView().getModel("viewPropertiesCust");
					oViewModel.setProperty("/custErrorMessage", oError.responseJSON.message);
					var oErrorJson = new sap.ui.model.json.JSONModel();
					if (oError.responseJSON.UserID[0]) {
						oErrorJson.setData(oError.responseJSON.UserID);
					} else if (oError.responseJSON.ForeignTrade[0]) {
						oErrorJson.setData(oError.responseJSON.ForeignTrade);
					} else if (oError.responseJSON.ShipToParty[0]) {
						oErrorJson.setData(oError.responseJSON.ShipToParty);
					} else {
						oErrorJson.setData(oError.responseJSON.MatNum);
					}

					if (!that.CustErrorMessageDialog) {
						that.CustErrorMessageDialog = sap.ui.xmlfragment(
							"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.CustomerErrorMessage", that);
						that.getView().addDependent(that.CustErrorMessageDialog);
						that.CustErrorMessageDialog.setModel(oErrorJson, "aCustErrorJson");
					}
					oMpdel.refresh();
					that.CustErrorMessageDialog.open();

				}
			});
		},

		onDeleteMaterialAssign: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("materialAssignment").getObject())));
			var oMpdel = this.getOwnerComponent().getModel();
			var sCumId = oModel.getData().ZCUST_NUM;
			var that = this,
				sMsg = "";
			var payload = {
				"ZCUST_NUM": sCumId, //.getSelected() ? "X" : "",
				"ZDEL_FLAG": ""
			};

			var sUrl = "/HANAXS/com/merckgroup/moet//services/xsjs/CustomerMatAssignDetails.xsjs";
			sap.ui.core.BusyIndicator.show();

			if (oModel.getData().ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for Material Assigned " + sCumId;
			} else {
				sMsg = "Confirm to delete Material Assigned " + sCumId;
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

		onSaveMatAssign: function (evt) {
			var that = this;

			var sCustNo = this._oViewPropertiesCust.getProperty("/custNo"),
				sMatNo = sap.ui.getCore().byId("idMaterialinput").getValue(),
				sSalesArea = sap.ui.getCore().byId("idSalesAreaLinput").getValue(),
				sDivision = sap.ui.getCore().byId("idDivisionlLinput").getValue(),
				sDChannel = sap.ui.getCore().byId("idDistributionChnlLinput").getValue();
			var sSystem = "";
			if (this.getView().getModel("viewPropertiesCust").getProperty("/bsystem") === "L") {
				sSystem = "L";
			} else {
				sSystem = "T";
			}
			if (sSalesArea === "") {
				MessageBox.show(
					"Please Select a Sales Organization", {
						icon: MessageBox.Icon.ERROR,
						title: "ERROR",
						onClose: this.onAssignClose,
						actions: [MessageBox.Action.CLOSE],
						styleClass: "sapUiSizeCompact myMessageBox"
					}
				);
				return;
			} else {

			}
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";
			sap.ui.core.BusyIndicator.show();
			var payload = {
				ZCUST_NUM: sCustNo, //.getSelected() ? "X" : "",
				ZMAT_NUM: sMatNo,
				ZSYSTEM: sSystem,
				ZSALES_ORG: sSalesArea,
				ZDISTR_CHNL: sDChannel,
				ZDIVISION: sDivision,
				ZCURR: sap.ui.getCore().byId("idSelectCurr").getSelectedKey(),
				ZDEL_FLAG: "",
				CRUD_TYPE: "C"
			};
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"Material " + sMatNo + " is assigned to the customer successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that._getAssignMaterial();
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

		onSaveShiptomaster: function (evt) {

			var that = this;
			var bVali = this._handleValidationSaveShipto();
			if (!bVali) {
				return;
			}

			var sCustNo = this._oViewPropertiesCust.getProperty("/custNo"),
				sShipto = sap.ui.getCore().byId("idShiptoAinput").getValue(),
				sShiptoDesc = sap.ui.getCore().byId("idShiptoDescAinput").getValue(),
				sShiptoCity = sap.ui.getCore().byId("idShiptoCityAinput").getValue(),
				sShiptoReg = sap.ui.getCore().byId("idShiptoRegAinput").getValue(),
				sShiptoPo = sap.ui.getCore().byId("idShiptoPoAinput").getValue(),
				idShiptoSytA = sap.ui.getCore().byId("idShiptoSystAinput").getValue();
			if (idShiptoSytA === "LEAN") {
				idShiptoSytA = "L";
			} else {
				idShiptoSytA = "T";
			}
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custShiptoPartyAssign.xsjs";
			sap.ui.core.BusyIndicator.show();
			var payload = {
				ZCUSTMR_NUM: sCustNo,
				ZSHIP_TO_PARTY: sShipto,
				ZSHIP_TO_PARTY_DESC: sShiptoDesc,
				ZCITY: sShiptoCity,
				ZREGION: sShiptoReg,
				ZPOSTAL_CODE: sShiptoPo,
				ZDEL_FLAG: "",
				ZSYSTEM: idShiptoSytA
			};
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"Ship to " + sShipto + " is assigned to the customer successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that.test();
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
			this._oAssShiptoDialog.close();
			if (this._oAssShiptoDialog) {
				this._oAssShiptoDialog = this._oAssShiptoDialog.destroy();
			}
		},

		_onUpdateShipAssign: function (oEvent) {
			var oDModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("shiptoAssignment").getObject())));
			var aData = oDModel.getData();

			var that = this,
				sMsg = "";

			var payload = {
				"ZCUSTMR_NUM": aData.ZCUSTMR_NUM,
				"ZSHIP_TO_PARTY": aData.ZSHIP_TO_PARTY
			};
			//var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custShiptoPartyAssign.xsjs";

			if (aData.ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for assigned Ship to party " + aData.ZSHIP_TO_PARTY;
			} else {
				sMsg = "Confirm to delete assigned Ship to party " + aData.ZSHIP_TO_PARTY;
			}

			MessageBox.confirm(sMsg, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {
						//var oMpdel = this.getOwnerComponent().getModel();
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
								that.test();
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
								that.test();
							}
						});

					}
				}
			});

		},

		onUpdateMatAssignment: function (oEvent) {
			var that = this;
			var oModelUpdate = this._oUpdateCustMastDialog.getModel("updateMatAssign");
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";
			var payload = {
				ZCUST_NUM: oModelUpdate.getData().ZCUST_NUM, //.getSelected() ? "X" : "",
				ZMAT_NUM: oModelUpdate.getData().ZMAT_NUM,
				ZSYSTEM: oModelUpdate.getData().ZSYSTEM,
				ZSALES_ORG: oModelUpdate.getData().ZSALES_ORG,
				ZDISTR_CHNL: oModelUpdate.getData().ZDISTR_CHNL,
				ZDIVISION: oModelUpdate.getData().ZDIVISION,
				ZCURR: sap.ui.getCore().byId("idESelectCurr").getSelectedKey(),
				ZDEL_FLAG: "",
				CRUD_TYPE: "U"
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
						"Material " + oModelUpdate.getData().ZMAT_NUM + " assignment to the customer " + oModelUpdate.getData().ZCUST_NUM +
						" is successfully updated", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that._getAssignMaterial();
					that._onUpdateMatAssignClose();

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
		_onUpdateMatAssign: function (oEvent) {
			var oModel = new JSONModel(oEvent.getSource().getBindingContext("materialAssignment").getObject());
			if (!this._oUpdateCustMastDialog) {
				this._oUpdateCustMastDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.updateCustomerMaster",
					this);
				this._oUpdateCustMastDialog.setModel(oModel, "updateMatAssign");
				this.getView().addDependent(this._oUpdateCustMastDialog);
			}
			this._oUpdateCustMastDialog.open();
		},

		_onUpdateMatAssignClose: function (oEvent) {
			this._oUpdateCustMastDialog.close();
			if (this._oUpdateCustMastDialog) {
				this._oUpdateCustMastDialog = this._oUpdateCustMastDialog.destroy();
			}
		},

		_onDeleteMatAssign: function (oEvent) {

			var oDModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("materialAssignment").getObject())));
			var aData = oDModel.getData();

			var payload = {
				"ZCUST_NUM": aData.ZCUST_NUM,
				"ZMAT_NUM": aData.ZMAT_NUM

			};
			var that = this,
				sMsg = "";
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";

			if (aData.ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for assigned Materail " + aData.ZMAT_NUM;
			} else {
				sMsg = "Confirm to delete assigned Materail" + aData.ZMAT_NUM;
			}

			MessageBox.confirm(sMsg, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {

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
								//	oMpdel.refresh();
								that._getAssignMaterial();
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
								that._getAssignMaterial();
							}
						});

					}
				}
			});

		},
		onArticleValueHelpRequest: function (oEvent) {
			var oView;
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.oMaterialNoF) {
				this.oMaterialNoF = sap.ui.xmlfragment(oView.getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.MaterialNumber",
					this);
				oView.addDependent(this.oMaterialNoF);

			}
			this.oMaterialNoF.open();
		},
		/**
		 * This event is fired on search values in Article field 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleArticleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");

			var aFilter = new Filter({
				filters: [
					new Filter("Z_MATRL_NUM", "Contains", sValue.toUpperCase()),
					new Filter("ZMATRL_DESC", "Contains", sValue.toUpperCase())
				],
				and: false
			});
			var oBinding = oEvent.getSource().getBinding("items");

			oBinding.filter([aFilter]);
		},

		/**
		 * This event is fired on close of Value help for Article field 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onPressArticleValueListClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewPropertiesMat");
			var that = this;

			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext('oModelmat1').getObject();
				viewProperties.setProperty("/matNo", object.Z_MATRL_NUM);
				var oModel = this.getOwnerComponent().getModel(),
					Z_MATRL_NUM = object.Z_MATRL_NUM,
					sPath = "/MaterialDetails";
				var sAssMat = sap.ui.getCore().byId("ID_ASS_MAT");

				sap.ui.core.BusyIndicator.show();
				oModel.read(sPath, {
					filters: [new Filter("Z_MATRL_NUM", "EQ", Z_MATRL_NUM)],
					success: function (oResp) {
						sap.ui.core.BusyIndicator.hide();
						viewProperties.setProperty("/matDesc", oResp.results[0].ZMATRL_DESC);
						viewProperties.setProperty("/matNo", oResp.results[0].Z_MATRL_NUM);
						sAssMat.setEnabled(true);
						var oViewPropertiesC = that.getView().getModel("viewPropertiesCust");
						var sCustNo = oViewPropertiesC.getData().custNo;
						var sSystemG = "";
						var sUSystem = oViewPropertiesC.getData().bsystem;

						/*if (oViewPropertiesC.getData().bsystem === "L") {
							sSystemG = "DLACLNT100";
						} else {
							sSystemG = "C01CLNT100";
						}*/

						var aSystemData = that.getView().getModel("jsonSystemData").getData();

						for (var i = 0; i < aSystemData.length; i++) {

							if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "L") {

								sSystemG = aSystemData[i].Yylow;

							} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "T") {

								sSystemG = aSystemData[i].Yylow;

							}

						}

						var sFData = "/ysaleAreaInputSet(IvCustomer='" + sCustNo + "',IvSyssid='" + sSystemG + "')";
						that.getOwnerComponent().getModel('MOETSRV').read(sFData, {
							urlParameters: {
								"$expand": "NavsalesArea"
							},
							success: function (oData1, oResponse1) {
								var oModel_SalesOff = new JSONModel();
								oModel_SalesOff.setData(oData1.NavsalesArea.results);
								that.getView().setModel(oModel_SalesOff, "SalesOfficeM");

							},
							error: function (oError) {

							}
						});

					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		onACMItemPress: function (oEvent) {
			var oSource;
			if (oEvent.getId() === "press") {
				oSource = oEvent.getSource();
				this.oSourceMat = oSource;
			} else {
				oSource = oEvent;
			}
			this.oGetRowValueItemCat = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("materialAssignment").getObject())));

			this._getonACMItemCat(function () {
				if (!this._oACMItemDialog) {
					this._oACMItemDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.custMatItemCategory", this);
					this.getView().addDependent(this._oACMItemDialog);
				}
				this._oACMItemDialog.open();
			}.bind(this));

		},

		_getonACMItemCat: function (callback) {
			var pr = this.getView().getModel("viewPropertiesCMatA");
			pr.setProperty("/matNo", this.oGetRowValueItemCat.getData().ZMAT_NUM);
			pr.setProperty("/custNo", this.oGetRowValueItemCat.getData().ZCUST_NUM);
			pr.setProperty("/matDec", this.oGetRowValueItemCat.getData().ZMATRL_DESC);
			pr.setProperty("/bsystem", this.oGetRowValueItemCat.getData().ZSYSTEM);

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustMatItemCategoryAssign";

			oModel.read(sPath, {
				filters: [new Filter("ZMAT_NUM", "EQ", this.oGetRowValueItemCat.getData().ZMAT_NUM),
					new Filter("ZCUST_NUM", "EQ", this.oGetRowValueItemCat.getData().ZCUST_NUM)
				],
				success: function (oResp) {
					oJsonModel.setData(oResp.results);
					this._getItemCategory();
					oJsonModel.setSizeLimit(oResp.results.length);
					if (callback) {
						callback();
					}
					this._oACMItemDialog.setModel(oJsonModel, "cmatItemAssignment");
				}.bind(this),
				error: function (err) {}
			});
		},

		onACMItemClose: function () {
			this._oACMItemDialog.close();
			if (this._oACMItemDialog) {
				this._oACMItemDialog = this._oACMItemDialog.destroy();
			}
		},

		_getItemCategory: function () {
			var oViewPropertiesModle = this.getView().getModel("viewPropertiesCMatA");
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/ItemCategory";
			oModel.read(sPath, {
				filters: [new Filter("ZSYSTEM", "EQ", oViewPropertiesModle.getProperty("/bsystem"))],
				success: function (oResp) {
					oJsonModel.setData(oResp.results);
					this.getView().setModel(oJsonModel, "ItemCat");

				}.bind(this),
				error: function (err) {}
			});
		},

		onAssignCMItemCategoryPress: function (oEvent) {

			var aItemCat = this.getView().getModel("ItemCat").getData();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			if (!this._oAssCMItCateDialog) {
				this._oAssCMItCateDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignCMItemCategory", this);
				oJsonModel.setData(aItemCat);
				this._oAssCMItCateDialog.setModel(oJsonModel, "ItemCategory");
				this.getView().addDependent(this._oAssCMItCateDialog);
			}
			this._oAssCMItCateDialog.open();
		},

		onAssignCMItemCategoryClose: function (oEvent) {
			this._oAssCMItCateDialog.close();
			if (this._oAssCMItCateDialog) {
				this._oAssCMItCateDialog = this._oAssCMItCateDialog.destroy();
			}
		},

		onSaveCMItemToMaterial: function (evt) {
			var that = this;

			var sMatNo = this._oViewPropertiesCMatA.getData().matNo,
				sItmCat = sap.ui.getCore().byId("idCustICAIinput").getSelectedKey(),
				sSystem = this._oViewPropertiesCMatA.getData().bsystem, //("/bsystem"),
				sCustNo = this._oViewPropertiesCMatA.getData().custNo, //("/custNo"),
				sItmCatK = "";
			if (sItmCat) {
				sItmCatK = sItmCat;
			} else {
				sItmCatK = "";
			}

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatItemCategory.xsjs";
			var payload = {
				ZCUST_NUM: sCustNo,
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
						"Item Category " + sItmCat + " is assigned to the customer successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that.onAssignCMItemCategoryClose();
					that._getonACMItemCat();
					that._oACMItemDialog.getModel("cmatItemAssignment").refresh();
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
					that.onAssignCMItemCategoryClose();
					that._oACMItemDialog.getModel("cmatItemAssignment").refresh();
				}
			});

		},

		onDeleteCMItemAssign: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("cmatItemAssignment").getObject())));
			var oMpdel = this.getOwnerComponent().getModel();
			var sCumId = oModel.getData().ZCUST_NUM;

			var that = this,
				sMsg = "";
			var payload = {
				"ZCUST_NUM": oModel.getData().ZCUST_NUM, //.getSelected() ? "X" : "",
				"ZMAT_NUM": oModel.getData().ZMAT_NUM,
				"ZITM_CATEGORY": oModel.getData().ZITM_CATEGORY
			};

			var sUrl = "/HANAXS/com/merckgroup/moet//services/xsjs/custMatItemCategory.xsjs";

			if (oModel.getData().ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for Assigned Item Category " + oModel.getData().ZITM_CATEGORY;
			} else {
				sMsg = "Confirm to delete assigned Item Category " + oModel.getData().ZITM_CATEGORY;
			}

			MessageBox.confirm(sMsg, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {

						$.ajax({
							url: sUrl,
							type: "DELETE",
							data: JSON.stringify(payload),
							dataType: "json",
							contentType: "application/json",
							success: function (data, response) {

								MessageBox.show(
									data.message, {
										icon: MessageBox.Icon.SUCCESS,
										title: "SUCCESS",
										onClose: this.onAssignClose,
										actions: [MessageBox.Action.CLOSE],
										styleClass: "sapUiSizeCompact myMessageBox"
									}
								);
								that._getonACMItemCat();
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
								that._getonACMItemCat();
							}
						});
						that._getonACMItemCat();
					}
				}
			});

		},

		_getDeliveryBlock: function (SystemId) {
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/DeliveryBlockDetails";
			oModel.read(sPath, {
				filters: [new Filter("ZSYSTEM", "EQ", SystemId)],
				success: function (oResp) {

					var objDelivery = {
						ZDELIVERY_BLOCK_ID: "",
						ZLANGUAGE: "",
						ZDELIVERY_BLOCK_DESC: "",
						ZSYSTEM: "",
					};
					oResp.results.push(objDelivery);
					oJsonModel.setData(oResp.results);

					this._oCMiDialog.setModel(oJsonModel, "DeliveryBlock");

				}.bind(this),
				error: function (err) {}
			});
		},

		_getDeliveryBlockUpdate: function (SystemId) {
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/DeliveryBlockDetails";
			oModel.read(sPath, {
				filters: [new Filter("ZSYSTEM", "EQ", SystemId)],
				success: function (oResp) {
					var objDelivery = {
						ZDELIVERY_BLOCK_ID: "",
						ZLANGUAGE: "",
						ZDELIVERY_BLOCK_DESC: "",
						ZSYSTEM: "",
					};
					oResp.results.push(objDelivery);
					oJsonModel.setData(oResp.results);
					this._oupdateCustDialog.setModel(oJsonModel, "DeliveryBlock");

				}.bind(this),
				error: function (err) {}
			});
		},

		onCloseCustErrorMessage: function () {
			this.CustErrorMessageDialog.close();
			if (this.CustErrorMessageDialog) {
				this.CustErrorMessageDialog = this.CustErrorMessageDialog.destroy();
			}
		},

		_onEditFTrade: function (oEvent) {
			var oObject = oEvent.getSource().getBindingContext("ftradeAssignment").getObject();
			var oModel = new JSONModel();
			if (!this.editAssignFtrade) {
				this.editAssignFtrade = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.editAssignFtrade", this);

				oModel.setData(oObject);
				this.editAssignFtrade.setModel(oModel, "editAssignFtrade");
				this.getView().addDependent(this.editAssignFtrade);

			}
			this.editAssignFtrade.open();
		},

		onEditFtradeClose: function () {
			this.editAssignFtrade.close();
			if (this.editAssignFtrade) {
				this.editAssignFtrade = this.editAssignFtrade.destroy();
			}
		},
		onUpdateFtrademaster: function (oEvent) {

			var oDModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("ftradeAssignment").getObject())));
			var aData = oDModel.getData();

			var oMpdel = this.getOwnerComponent().getModel();
			var that = this;
			var that = this,
				sDelFlag;
			if (oEvent.getParameter("state") === true) {
				sDelFlag = "X";
			} else {
				sDelFlag = "";
			}
			var payload = {
				ZCUST_NUM: aData.ZCUST_NUM,
				ZFTRADE: aData.ZFTRADE.toUpperCase(),
				ZFTRADE_DESC: aData.ZFTRADE_DESC,
				ZCITY: aData.ZCITY,
				ZREGION: aData.ZREGION,
				ZPOSTAL_CODE: aData.ZPOSTAL_CODE,
				ZDEL_FLAG: sDelFlag,
				ZSYSTEM: aData.ZSYSTEM
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custForeignTrade.xsjs";
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
						"For FTrade " + aData.ZFTRADE_DESC + ", deletion flag revoked", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					that._getFtrade();
					that.onEditFtradeClose();

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

		onUpdateShipto: function (oEvent) {
			var oObject = oEvent.getSource().getBindingContext("shiptoAssignment").getObject();
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this,
				sDelFlag;
			if (oEvent.getParameter("state") === true) {
				sDelFlag = "X";
			} else {
				sDelFlag = "";
			}
			var payload = {
				ZCUSTMR_NUM: oObject.ZCUSTMR_NUM,
				ZSHIP_TO_PARTY: oObject.ZSHIP_TO_PARTY,
				ZSHIP_TO_PARTY_DESC: oObject.ZSHIP_TO_PARTY_DESC,
				ZCITY: oObject.ZCITY,
				ZREGION: oObject.ZREGION,
				ZPOSTAL_CODE: oObject.ZPOSTAL_CODE,
				ZDEL_FLAG: sDelFlag,
				ZSYSTEM: oObject.ZSYSTEM
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custShiptoPartyAssign.xsjs";
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
						"Ship to " + oObject.ZSHIP_TO_PARTY_DESC + " deletion flag revoked", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					that.test();

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

		onUpdateMaterial: function (oEvent) {
			var oObject = oEvent.getSource().getBindingContext("materialAssignment").getObject();
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this,
				sDelFlag;
			if (oEvent.getParameter("state") === true) {
				sDelFlag = "X";
			} else {
				sDelFlag = "";
			}
			var payload = {
				ZCUST_NUM: oObject.ZCUST_NUM, //.getSelected() ? "X" : "",
				ZMAT_NUM: oObject.ZMAT_NUM,
				ZSYSTEM: oObject.ZSYSTEM,
				ZSALES_ORG: oObject.ZSALES_ORG,
				ZDISTR_CHNL: oObject.ZDISTR_CHNL,
				ZDIVISION: oObject.ZDIVISION,
				ZCURR: oObject.ZCURR,
				ZDEL_FLAG: sDelFlag,
				CRUD_TYPE: "U"
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";
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
						"For Material " + oObject.ZMAT_NUM + ", deletion flag revoked", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					that._getAssignMaterial();
					//that.onEditFtradeClose();

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
		onUpdateMaterialItemCat: function (oEvent) {
			var oObject = oEvent.getSource().getBindingContext("cmatItemAssignment").getObject();
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this,
				sDelFlag;
			if (oEvent.getParameter("state") === true) {
				sDelFlag = "X";
			} else {
				sDelFlag = "";
			}
			var payload = {
				ZCUST_NUM: oObject.ZCUST_NUM, //.getSelected() ? "X" : "",
				ZMAT_NUM: oObject.ZMAT_NUM,
				ZITM_CATEGORY: oObject.ZITM_CATEGORY,
				ZSYSTEM: oObject.ZSYSTEM,
				ZDEL_FLAG: sDelFlag
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatItemCategory.xsjs";
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
						"For Item Category " + oObject.ZITM_CATEGORY + ", deletion flag revoked", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					that._getonACMItemCat();
					that._oACMItemDialog.getModel("cmatItemAssignment").refresh();

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

		onUpdateCustomer: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));
			//var sCumId = oModel.getData().ZCUSTMR_NUM;
			var oMpdel = this.getOwnerComponent().getModel();
			var that = this,
				sDelFlag;
			if (oEvent.getParameter("state") === true) {
				sDelFlag = "X";
			} else {
				sDelFlag = "";
			}

			var payload = {
				ZCUSTMR_NUM: oModel.getData().ZCUSTMR_NUM, //.getSelected() ? "X" : "",
				ZSYSTEM: oModel.getData().ZSYSTEM,
				ZNAME_1: oModel.getData().ZNAME_1,
				ZCITY: oModel.getData().ZCITY,
				ZREGION: oModel.getData().ZREGION,
				ZSTREET: oModel.getData().ZSTREET,
				ZCENTRL_DEL_FLAG: sDelFlag,
				ZPOSTAL_CODE: oModel.getData().ZPOSTAL_CODE,
				ZDEL_BLOCK_ID: oModel.getData().ZDEL_BLOCK_ID
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
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
						"For Customer " + oModel.getData().ZCUSTMR_NUM + ", deletion flag revoked", {
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

		_handleValidation: function () {
			var oView = this.getView();
			var oViewModel = this.getView().getModel("jsonViewMod");
			var aInputs = [
				sap.ui.getCore().byId("idMaterialinput1w"),
				//              sap.ui.getCore().byId("idUominput1w"),
				sap.ui.getCore().byId("idQuantityinput1w")
				//              sap.ui.getCore().byId("idQuantityinput1w"),
				//              sap.ui.getCore().byId("idQuantityinputE1w")
				//              sap.ui.getCore().byId("idQuantityinputE21w"),
				//              sap.ui.getCore().byId("idQuantityinputE31w")
			];

			return this._handleValidation1(aInputs);
		},

		_handleValidation1: function (aInputs) {
			var bValidationError = false;

			// check that inputs are not empty
			// this does not happen during data binding as this is only triggered by changes
			jQuery.each(aInputs, function (i, oInput) {
				if (oInput.getValue()) {
					oInput.setValueState("None");
					bValidationError = true;
				} else {
					oInput.setValueState("Error");
					//           bValidationError = false;

				}
			});
			jQuery.each(aInputs, function (i, oInput) {
				if (oInput.getValueState() === "Error") {
					bValidationError = false;
				}
			});

			if (!bValidationError) {
				sap.m.MessageBox.alert("Please fill all required fields");
			}
			return bValidationError;
		},

		_handleValidationSaveShipto: function () {
			var oView = this.getView();
			var oViewModel = this.getView().getModel("jsonViewMod");
			var aInputs = [

				sap.ui.getCore().byId("idShiptoAinput"),
				sap.ui.getCore().byId("idShiptoDescAinput")
				//              sap.ui.getCore().byId("idQuantityinputE1w")
				//              sap.ui.getCore().byId("idQuantityinputE21w"),
				//              sap.ui.getCore().byId("idQuantityinputE31w")
			];
			return this._handleValidation1(aInputs);
		},
		onExportAllData: function () {

			var oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerDetails",
				aCustomno = [];
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				urlParameters: {
					"$select": "ZCUSTMR_NUM"
				},

				filters: this.oDownLoadFilters,
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oResp.results.forEach(function (item) {
						aCustomno.push(new Filter("ZCUSTMR_NUM", "EQ", item.ZCUSTMR_NUM));
					});
					this._downloadCustomerAllData(aCustomno);
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		_downloadCustomerAllData: function (aCustomno) {
			var sPath = "/CustomerAllDetails";
			var that = this,
				test, oColumn;
			var oModel = this.getOwnerComponent().getModel();
			oModel.read(sPath, {
				filters: aCustomno,
				success: function (oData) {
					//var oTable = that.getView().byId("table");
					//	var oColumn = oTable.getColumns();
					var result = oData.results;
					var aExportColumns = [];
					result.forEach(function (item) {
						item.ZSYSTEM = (item.ZSYSTEM === "L") ? "LEAN" : "TEMPO";
						//item.ZITM_CATEGORY = that.ItemCategoryConversion(item.ZITM_CATEGORY);
						item.ZITM_CATEGORY = item.ZITM_CATEGORY + "-" + that.ItemCategoryConversion(item.ZITM_CATEGORY);

					});
					var oMetadata = that.getOwnerComponent().getModel().getServiceMetadata();
					//	test =oMetadata.dataServices.schema[0].entityType.find(o => o.name === 'CustomerAllDetailsType'),
					for (var z = 0; z < oMetadata.dataServices.schema[0].entityType.length; z++) {
						if (oMetadata.dataServices.schema[0].entityType[z].name === "CustomerAllDetailsType") {
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

					var sFileName = "Customer Details" + " " + sTimeStamp;
					var mSettings = {
						workbook: {
							columns: aExportColumns,
							context: {
								sheetName: "Customer Details"
							}
						},
						fileName: sFileName + ".xlsx",
						dataSource: result
					};
					var oSpreadsheet = new Spreadsheet(mSettings);
					oSpreadsheet.build();
				},
				error: function (oError) {

				}
			});
		}

	});
});