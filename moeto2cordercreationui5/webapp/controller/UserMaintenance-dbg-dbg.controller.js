sap.ui.define([
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/Token",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/export/Spreadsheet"
], function (BaseController, JSONModel, formatter, Filter, Sorter, Token, FilterOperator, MessageBox, MessageToast, Spreadsheet) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.UserMaintenance", {

		custFormatter: formatter,

		closeCreateDialog: function () {
			if (this._new) {
				this._new.close();
				this._new = this._new.destroy(true);
			}
		},

		onInit: function () {

			this.getRouter().getRoute("UserMaintenance").attachPatternMatched(this._onRouteMatched, this);
			this._loadODataUtils();

			this.fNotification = [];

			this.getUserRoleDataUpdate();
			this.getUserCustomer();

			this._oViewProperties = new JSONModel({
				username: "",
				emailId: "",
				userid: "",
				cusId: ""
			});
			this.getView().setModel(this._oViewProperties, "viewProperties");

			var that = this;
			var oInput1 = sap.ui.getCore().byId("idUominput123");
		},
		
		fnClearAllValue: function () {
			var oviewProperties = this.getView().getModel("viewProperties");
			oviewProperties.setProperty("/username", "");
			oviewProperties.setProperty("/emailId", "");
			oviewProperties.setProperty("/userid", "");
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
				for (i = aColumns.length; i >= 0; i--) {
					oTable.autoResizeColumn(i);
				}
			});
		},

		onBeforeRebindTable: function (oSource) {
			this.oDownLoadFilters = oSource.getParameter("bindingParams").filters;
		},

		handleValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(this.getView().getId(),
					"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.ShiptoF4Help",
					this);
				this.getView().addDependent(this._valueHelpDialog);
				this._openValueHelpDialog(sInputValue);
				this._valueHelpDialog.setModel(this.products, "products1");
			} else {
				this._openValueHelpDialog(sInputValue);
			}

		},

		_openValueHelpDialog: function (sInputValue) {
			this._valueHelpDialog.open(sInputValue);
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"shiptoDesc",
				FilterOperator.Contains,
				sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function (evt) {
			var aSelectedItems = evt.getParameter("selectedItems"),
				oMultiInput = sap.ui.getCore().byId("multiInput");

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		},

		onDeletePress: function (oEvent) {
			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext().getObject())));

			var sUid = oModel.oData.ZUSR_ID;
			var sUrole = oModel.oData.ZUSR_ROLE;
			var that = this,
				sMsg = "";
			var payload = {
				"ZUSR_ID": sUid,
				"OLDROLE": sUrole
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/user.xsjs";
			sMsg = "Confirm to add deletion flag for User " + oModel.getData().ZUSR_ID;
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

		/*	deleteFunction: function (sUrl, payload) {
				var that = this;
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
						that._getAssignCustomer();
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
						that._getAssignCustomer();
					}
				});
			},*/

		deleteFunction: function (sUrl, payload) {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();
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
					oModel.refresh();
					that._getAssignCustomer();
					//that._getAssignCustomer();
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
					oModel.refresh();
					that._getAssignCustomer();
					//that._getAssignCustomer();
				}
			});
		},

		onEditCustAssignPress: function (oEvent) {

			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("userCustomer1").getObject())));

			if (!this._oECADialog) {
				this._oECADialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.editCustAssign", this);
				this.getView().addDependent(this._oECADialog);
			}
			this._oECADialog.setModel(oModel, "EditCustAssign");
			this._oECADialog.open();

		},

		onEditCustAssignClose: function () {
			this._oECADialog.close();
			if (this._oECADialog) {
				this._oECADialog = this._oECADialog.destroy();
			}
		},

		onEditPress: function (oEvent) {

			var oModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource().getBindingContext().getObject())));

			var getuserType = this.getView().getModel("userType");

			if (!this._oNEDialog) {
				this._oNEDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.editUser", this);
				this.getView().addDependent(this._oNEDialog);
			}
			this._oNEDialog.open();
			
			if(oModel.getData().ZUSR_ROLE ==="CUST"){
				sap.ui.getCore().byId("ID_SEL_USER_TYPE").setVisible(false);
				sap.ui.getCore().byId("ID_SEL_USER_TYPE_TXT").setVisible(true);
				
				sap.ui.getCore().byId("idUom1or").setVisible(true);
				sap.ui.getCore().byId("idUom1").setVisible(false);
				
			}else{
				sap.ui.getCore().byId("ID_SEL_USER_TYPE").setVisible(true);
				sap.ui.getCore().byId("ID_SEL_USER_TYPE_TXT").setVisible(false);
				
				sap.ui.getCore().byId("idUom1or").setVisible(false);
				sap.ui.getCore().byId("idUom1").setVisible(true);
			}

			this._oNEDialog.setModel(getuserType, "userType1");
			
			this.oldRole = oModel.getData().ZUSR_ROLE;         
				
			this._oNEDialog.setModel(oModel, "EditUser");
		
			this._oNEDialog.setModel(oModel, "EditUser1");
		},
		
		handleRoleChange: function () {
			//this
		},

		onEditEClose: function () {
			this._oNEDialog.close();
			if (this._oNEDialog) {
				this._oNEDialog = this._oNEDialog.destroy();
			}
		},

		onAssignPress: function (oEvent) {
			//this.fnClearAllValue();
			if (!this._oAssignDialog) {
				this._oAssignDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.userMain", this);
				this.getView().addDependent(this._oAssignDialog);
			}
			this._oAssignDialog.open();
		},

		onAssignClose: function () {
			this._oAssignDialog.close();
			if (this._oAssignDialog) {
				this._oAssignDialog = this._oAssignDialog.destroy();
			}
		},

		onSelect: function (oEvent) {
			var utpe = sap.ui.getCore().byId("utpe").getSelectedKey();
			if (utpe !== "I") {
				sap.ui.getCore().byId("idQuantityinputE91u").setEnabled(true);
				sap.ui.getCore().byId("idQuantityinput91u").setEnabled(true);

				sap.ui.getCore().byId("idMaterial1u").setVisible(false);
				sap.ui.getCore().byId("idUominput123").setVisible(false);

				sap.ui.getCore().byId("idUom1u").setVisible(false);
				sap.ui.getCore().byId("idUominput1u").setVisible(false);

				sap.ui.getCore().byId("idQuantityinput91u").setEnabled(true);
			} else {
				sap.ui.getCore().byId("idQuantityinputE91u").setEnabled(false);
				sap.ui.getCore().byId("idQuantityinputE91u").setValue("");

				sap.ui.getCore().byId("idQuantityinput91u").setEnabled(false);
				sap.ui.getCore().byId("idQuantityinput91u").setValue("");

				sap.ui.getCore().byId("idMaterial1u").setVisible(true);
				sap.ui.getCore().byId("idUominput123").setVisible(true);

				sap.ui.getCore().byId("idUom1u").setVisible(true);
				sap.ui.getCore().byId("idUominput1u").setVisible(true);

				sap.ui.getCore().byId("idQuantity19u").setVisible(true);
				sap.ui.getCore().byId("idQuantityinput91u").setVisible(true);
			}

		},
		handleChangeemail: function (oEvent) {
			var utpe = sap.ui.getCore().byId("idQuantityinputE91u").getValue();
			if (utpe === "test@email.com") {
				MessageBox.error(
					"This Email Already Exists", {
						styleClass: "sapUiSizeCompact"
					}
				);
			} else {
				MessageBox.confirm(
					"User creation In Process.", {
						styleClass: "sapUiSizeCompact"
					}
				);
			}
		},

		onAssignCustPress: function (oEvent) {
			var viewProperties = this.getView().getModel("viewProperties");
			viewProperties.setProperty("/cusId", "");

			if (!this._ACUDialog) {

				this._ACUDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.assignCustomer", this);
				this.getView().addDependent(this._ACUDialog);
				this._getCustomerDetails("L");
				//_getCustomerDetails

			}
			this._ACUDialog.open();

		},

		onValidate: function () {
			var sAssMat = sap.ui.getCore().byId("idassignSave");
			var sCustNo = sap.ui.getCore().byId("idUominput1234").getValue();

			var sUSystem = sap.ui.getCore().byId("uSystem").getSelectedKey();
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

			var sFData = "/ycustomervalidationSet(IvCustomer='" + sCustNo + "',IvShipParty='" + sCustNo + "',IvSyssid='" + sSysId + "')";
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {

				success: function (oData1, oResponse1) {
					sAssMat.setEnabled(true);

				}.bind(this),
				error: function (oError) {
					sAssMat.setEnabled(false);
					MessageBox.show(
						'Customer is Not Validated, Enter Correct Customer Number', {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}.bind(this)
			});

		},

		onAssignCustClose: function () {
			this._ACUDialog.close();
			if (this._ACUDialog) {
				this._ACUDialog = this._ACUDialog.destroy();
			}
		},

		onAddCMClose: function () {
			this._oCMiDialog.close();
			if (this._oCMiDialog) {
				this._oCMiDialog = this._oCMiDialog.destroy();
			}
		},

		onCusAssignClose: function () {
			this._oCUADialog.close();
			if (this._oCUADialog) {
				this._oCUADialog = this._oCUADialog.destroy();
			}
		},
		onCusAssignClose1: function () {
			this._oCUADialog.close();
			if (this._oCUADialog) {
				this._oCUADialog = this._oCUADialog.destroy();
			}
		},

		onArticleValueHelpRequest: function (oEvent) {
			var oView;
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.oArticleNo) {
				this.oArticleNo = sap.ui.xmlfragment(oView.getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.ArticleNumber", this);
				oView.addDependent(this.oArticleNo);
			}
			this.oArticleNo.open();
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
					new Filter("ZCUSTMR_NUM", "Contains", sValue.toUpperCase()),
					new Filter("ZNAME_1", "Contains", sValue.toUpperCase())
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
			var viewProperties = this.getView().getModel("viewProperties");

			if (aContexts && aContexts.length) {

				var object = oSelectedItem.getBindingContext("CustomerDetails1").getObject();
				viewProperties.setProperty("/cusId", object.ZCUSTMR_NUM);

				var oModel = this.getOwnerComponent().getModel(),
					ZCUSTMR_NUM = object.ZCUSTMR_NUM,
					sPath = "/CustomerDetails";
				sap.ui.core.BusyIndicator.show();
				oModel.read(sPath, {
					filters: [new Filter("ZCUSTMR_NUM", "EQ", ZCUSTMR_NUM)],
					success: function (oResp) {
						sap.ui.core.BusyIndicator.hide();

						viewProperties.setProperty("/username", oResp.results[0].FULL_NAME);
						viewProperties.setProperty("/emailId", oResp.results[0].MAIL);

						sap.ui.getCore().byId("idassignSave").setEnabled(true);
					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
					}
				});

			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/*	onSelectSystem: function (sSystem) {
				var oJsonModel = new sap.ui.model.json.JSONModel();
				var oModel = this.getOwnerComponent().getModel(),
					sSystem = sap.ui.getCore().byId("uSystem").getSelectedKey(),
					sPath = "/CustomerDetails",
					that = this,
					sSysId;
				if (sSystem === "L") {
					sSysId = "L";
				} else {
					sSysId = "T";
				}
				var ocusId = sap.ui.getCore().byId("idUominput1234");
				sap.ui.core.BusyIndicator.show();
				oModel.read(sPath, {
					filters: [new Filter("ZSYSTEM", "EQ", sSysId)],
					success: function (oResp) {

						sap.ui.core.BusyIndicator.hide();
						oJsonModel.setData(oResp.results);
						that.getView().setModel(oJsonModel, "CustomerDetails1");
						ocusId.setEnabled(true);
					},
					error: function (err) {
						ocusId.setEnabled(false);
						sap.ui.core.BusyIndicator.hide();
					}
				});
			},*/

		onSelectSystem: function () {
			var sSystem = sap.ui.getCore().byId("uSystem").getSelectedKey();
			this._getCustomerDetails(sSystem);
		},

		_getCustomerDetails: function (sSystem) {
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerDetails",
				that = this,
				sSysId;
			if (sSystem === "L") {
				sSysId = "L";
			} else {
				sSysId = "T";
			}
			var ocusId = sap.ui.getCore().byId("idUominput1234");
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZSYSTEM", "EQ", sSysId)],
				success: function (oResp) {

					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					that.getView().setModel(oJsonModel, "CustomerDetails1");
					ocusId.setEnabled(true);
				},
				error: function (err) {
					ocusId.setEnabled(false);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		custFragDestroy: function () {
			this._oCUADialog.close();
			if (this._oCUADialog) {
				this._oCUADialog = this._oCUADialog.destroy();
			}
		},

		onCusAssign: function (oEvent) {
			var getuserCustomer = this.getView().getModel("userCustomer");
			var that = this;
			var oSource;

			if (oEvent.getId() === "press") {
				oSource = oEvent.getSource();
				this.oSourceCust = oSource;
			} else {
				oSource = oEvent;
			}

			this.oGetRowValueCut = new JSONModel(JSON.parse(JSON.stringify(oSource._getBindingContext().getObject())));
			this._getAssignCustomer(function () {
				if (!this._oCUADialog) {
					this._oCUADialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.customerAssignment", this);
					this.getView().addDependent(this._oCUADialog);
				}
				this._oCUADialog.open();
			}.bind(this));

		},

		_getAssignCustomer: function (callback) {
			var sUid = this.oGetRowValueCut.oData.ZUSR_ID,
				that = this;
			var pr = this.getView().getModel("viewProperties");
			pr.setProperty("/userid", this.oGetRowValueCut.oData.ZUSR_ID);
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/UserDetails('" + sUid + "')/UserCustDetails";
			var getuserCustomer1;
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					if (callback) {
						callback();
					}
					that.getView().setModel(oJsonModel, "userCustomer12");
					this._oCUADialog.setModel(oJsonModel, "userCustomer1");
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		/*********** USER ROLE ************/

		getUserRoleData: function () {
			var that = this,
				oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/UserRole";
			sap.ui.core.BusyIndicator.show();

			oModel.read(sPath, {

				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					that.getView().setModel(oJsonModel, "uroleData1");

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		/******** USER ROLE ************/

		/************ EMPLOYEEE ************/

		getEmployeeDetailsData: function () {
			var that = this,
				oJsonModel = new sap.ui.model.json.JSONModel(),
				// oUrlParams = oEvent.getParameter("arguments"),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/EmployeeDetails";
			sap.ui.core.BusyIndicator.show();

			oModel.read(sPath, {

				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					that.getView().setModel(oJsonModel, "empData");

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		onAddCMPress: function () {
			this.fnClearAllValue();

			if (!this._oCMiDialog) {
				this._oCMiDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.userMain", this);
				this.getView().addDependent(this._oCMiDialog);
			}
			this._oCMiDialog.open();

		},
		onChangeEmp: function (oEvent) {
			var that = this,
				oSource = oEvent.getSource(),
				oModel = this.getOwnerComponent().getModel(),
				sInputValue = oSource.getValue(),
				viewProperties = this.getView().getModel("viewProperties"),

				sPath = "/EmployeeDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("USERID", "EQ", sInputValue)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					viewProperties.setProperty("/username", oResp.results[0].FULL_NAME);
					viewProperties.setProperty("/userid", oResp.results[0].USERID);
					viewProperties.setProperty("/emailId", oResp.results[0].MAIL);

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		onCancelPress: function () {
			var viewProperties = this.getView().getModel("viewProperties");
			this._oCMiDialog.close();
			if (this._oCMiDialog) {
				this._oCMiDialog = this._oCMiDialog.destroy();
			}
			viewProperties.setProperty("/username", "");
			viewProperties.setProperty("/userid", "");
			viewProperties.setProperty("/emailId", "");
		},

		_onCancelAssgnCust: function () {
			this._ACUDialog.close();
			if (this._ACUDialog) {
				this._ACUDialog = this._ACUDialog.destroy();
			}
		},

		onSaveAssignCustomer: function (oEvent) {
			var sUid = sap.ui.getCore().byId("idUominput11").getValue(),
				sUSystem = sap.ui.getCore().byId("uSystem").getSelectedKey(),
				sCNumber = sap.ui.getCore().byId("idUominput1234").getValue(), //sap.ui.getCore().byId("multiInput").getTokens(), //.getValue(),

				sComment = sap.ui.getCore().byId("idQuantit3rycom").getValue(), //sap.ui.getCore().byId("idQuantit3rycom").getValue(),
				sString = "",
				aCno = "",
				sSystem = "",
				aCfno = sCNumber;

			if (sUSystem === "L") {
				sSystem = "L";
			} else {
				sSystem = "T";
			}
			var payload = [{
				ZUSR_ID: sUid, //.getSelected() ? "X" : "",
				ZCUST_NUM: aCfno,
				ZSYSTEM: sSystem,
				ZCOMMENTS: sComment,
				ZCUST_STATUS: "ACTV"
			}];
			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/userCustAssign.xsjs";
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
						"Customer " + aCfno + " is assigned to user successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that._getAssignCustomer();
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
					//
				}
			});

			this._ACUDialog.close();
			if (this._ACUDialog) {
				this._ACUDialog = this._ACUDialog.destroy();
			}

		},

		/************* EMPLOYEE *************/

		onSave: function (oEvent) {
			var oEvt = oEvent;
			var oMpdel = this.getOwnerComponent().getModel();
			var vuid = sap.ui.getCore().byId("idUominput123").getValue();
			var vuname = sap.ui.getCore().byId("idQuantityinput91u").getValue();
			var vutype = "I";
			var vuemail = sap.ui.getCore().byId("idQuantityinputE91u").getValue();
			var vustatus = "ACTV";

			var vUType = sap.ui.getCore().byId("utpe").getSelectedKey();

			if (vUType !== "I") {
				vutype = "E";
			}

			if (!vuid) {
				vuid = "";
			}

			if (sap.ui.getCore().byId("idUominput1u").getSelectedItem()) {
				var vurole = sap.ui.getCore().byId("idUominput1u").getSelectedItem().getProperty("key");
			} else {
				vurole = "CUST";
			}
			var payload = {
				ZUSR_ID: vuid, //.getSelected() ? "X" : "",
				ZUSR_NAME: vuname,
				ZUSR_TYP: vutype,
				ZUSR_ROLE: vurole,
				ZUSR_EMAILADD: vuemail,
				ZUSR_STATUS: vustatus,
				OLDROLE: ""
			};
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/user.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					oMpdel.refresh();
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						"User " + vuname + " created successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					oMpdel.refresh();
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

		getUserRoleDataUpdate: function () {
			var that = this,
				oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/UserRolesParam(P_USR_TYP='I')/Results";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {

				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);

					that.getView().setModel(oJsonModel, "userType");

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		getUserCustomer: function () {
			var that = this,
				oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/UserDetails('KSURAVAR')/UserCustDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					that.getView().setModel(oJsonModel, "userCustomer");
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		fStatus: function (status) {
			if (status === "Active") {
				return 'ACTV';
			} else if (status === "Blocked") {
				return 'BLKD';
			} else {
				return 'FFDL';
			}
		},

		_onDeleteCustAssign: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var oDModel = new JSONModel(JSON.parse(JSON.stringify(oEvent.getSource()._getBindingContext("userCustomer1").getObject())));
			var aData = oDModel.getData();
			var payload = {
				"ZUSR_ID": aData.ZUSR_ID,
				"ZCUST_NUM": aData.ZCUST_NUM,
				"ZSYSTEM": aData.ZSYSTEM

			};
			var that = this,
				sMsg = "";
			//sap.ui.core.BusyIndicator.show();
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/userCustAssign.xsjs";
			sMsg = "Confirm to add deletion flag for assigned customer " + aData.ZCUST_NUM;
			/*if (oModel.getData().ZDEL_FLAG === "") {
				sMsg = "Confirm to add deletion flag for User " + oModel.getData().ZUSR_ID;
			} else {
				sMsg = "Confirm to delete User " + oModel.getData().ZUSR_ID;
			}*/

			MessageBox.confirm(sMsg, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {
						that.deleteFunction(sUrl, payload);
						//that._getAssignCustomer();
					}
				}
			});
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
						that._getAssignCustomer();

					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						that._getAssignCustomer();
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
				});*/
		},

		_onUpdateCustAssign: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var oDModel = this._oECADialog.getModel("EditCustAssign");
			var aData = oDModel.getData();
			var sComment = sap.ui.getCore().byId("ID_TEXTAREA_COMMENT").getValue();
			var sStatus = sap.ui.getCore().byId("ID_SEL_STATUS").getProperty("selectedKey");
			var payload = {
				"ZUSR_ID": aData.ZUSR_ID,
				"ZCUST_NUM": aData.ZCUST_NUM,
				"ZCOMMENTS": sComment,
				"ZCUST_STATUS": sStatus
			};
			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/userCustAssign.xsjs";
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
						"User Assignment " + aData.ZUSR_ID + " updated successfully", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					that._getAssignCustomer();

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
					that._getAssignCustomer();
				}
			});
			this._oECADialog.close();
			if (this._oECADialog) {
				this._oECADialog = this._oECADialog.destroy();
			}

		},

		_onUpdateUser: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var sUid = sap.ui.getCore().byId("ID_INPUT_USER_ID").getValue();
			var sUName = sap.ui.getCore().byId("ID_INPUT_USER_NAME").getValue();
			var sEmialID = sap.ui.getCore().byId("ID_INPUT_USER_EMIAL_ID").getValue();

			//var sOldRole = sap.ui.getCore().byId("ID_INPUT_OLDROLE").getValue();
			var oEditModel = this._oNEDialog.getModel("EditUser1");
			var sOldRole = this.oldRole; //oEditModel.getData().ZUSR_ROLE;
			var sUserType;
			if (sap.ui.getCore().byId("ID_SEL_USER_TYPE").getSelectedItem()) {

				sUserType = sap.ui.getCore().byId("ID_SEL_USER_TYPE").getSelectedItem().getProperty('key');
			} else {
				sUserType = "CUST";
			}

			var sStatus = sap.ui.getCore().byId("ID_SEL_STATUS").getSelectedItem().getProperty('key');

			var payload = {
				"ZUSR_ID": sUid, //.getSelected() ? "X" : "",

				"ZUSR_ROLE": sUserType,
				"ZUSR_STATUS": sStatus,
				OLDROLE: sOldRole
			};

			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/user.xsjs";
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
						"User " + sUName + " updated successfully", {
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

					oModel.refresh();
				}
			});
			this._oNEDialog.close();
			if (this._oNEDialog) {
				this._oNEDialog = this._oNEDialog.destroy();
			}

		},

		onCustomerValueHelpRequest: function (oEvent) {
			var oView;
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.Customer) {
				this.Customer = sap.ui.xmlfragment(oView.getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.CustomerF4Help", this);
				oView.addDependent(this.Customer);

			}

			this.Customer.open();
		},
		/**
		 * This event is fired on search values in Article field
		 * @param {sap.ui.base.Event} oEvent
		 * @public
		 */
		handleCustomerSearch: function (oEvent) {

			var sValue = oEvent.getParameter("value");
			var aFilter = new Filter({
				filters: [
					new Filter("USERID", "Contains", sValue.toUpperCase()),
					new Filter("FULL_NAME", "Contains", sValue.toUpperCase())
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

		onPressCustomerValueListClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");

			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext().getObject();
				viewProperties.setProperty("/cusId", object.USERID);

				var oModel = this.getOwnerComponent().getModel(),
					USERID = object.USERID,
					sPath = "/EmployeeDetails";
				sap.ui.core.BusyIndicator.show();
				oModel.read(sPath, {
					filters: [new Filter("USERID", "EQ", USERID)],
					success: function (oResp) {
						sap.ui.core.BusyIndicator.hide();
						viewProperties.setProperty("/username", oResp.results[0].FULL_NAME);
						viewProperties.setProperty("/userid", oResp.results[0].USERID);
						viewProperties.setProperty("/emailId", oResp.results[0].MAIL);

					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
					}
				});

			}
			oEvent.getSource().getBinding("items").filter([]);
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

		onExportAllData: function () {

			var oModel = this.getOwnerComponent().getModel(),
				sPath = "/UserDetails",
				aUserno = [];
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				urlParameters: {
					"$select": "ZUSR_ID"
				},

				filters: this.oDownLoadFilters,
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oResp.results.forEach(function (item) {
						aUserno.push(new Filter("ZUSR_ID", "EQ", item.ZUSR_ID));
					});
					this._downloadCustomerAllData(aUserno);
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		_downloadCustomerAllData: function (aCustomno) {
			var sPath = "/UserCustAssignDetails";
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
						//	item.ZITM_CATEGORY = that.ItemCategoryConversion(item.ZITM_CATEGORY);

					});
					var oMetadata = that.getOwnerComponent().getModel().getServiceMetadata();
					//	test =oMetadata.dataServices.schema[0].entityType.find(o => o.name === 'CustomerAllDetailsType'),
					for (var z = 0; z < oMetadata.dataServices.schema[0].entityType.length; z++) {
						if (oMetadata.dataServices.schema[0].entityType[z].name === "UserCustAssignDetailsType") {
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
					var sFileName = "User Details" + " " + sTimeStamp;
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