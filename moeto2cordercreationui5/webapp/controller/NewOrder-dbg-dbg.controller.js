sap.ui.define([
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Label',
	'sap/m/MessageToast',
	'sap/m/Text',
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	'sap/ui/layout/HorizontalLayout',
	'sap/ui/layout/VerticalLayout',
	"../services/RepoService"
], function (Button, Dialog, Label, MessageToast, Text, BaseController, JSONModel, formatter, Filter, Sorter, MessageBox,
	HorizontalLayout,
	VerticalLayout, RepoService) {
	"use strict";

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.NewOrder", {

		custFormatter: formatter,

		handlePressOpenMenu: function (oEvent) {
			var oButton = oEvent.getSource();

			if (!this._menu) {
				this._menu = sap.ui.xmlfragment(this.getView().getId(), "com.OMT.fragments.MenuItem",
					this);
				this.getView().addDependent(this._menu);
			}

			var eDock = sap.ui.core.Popup.Dock;
			this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

		},

		handlePressOpenNewOrderPage: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("NewOrderPage");
		},

		handlePressOpenNewOrder: function (oEvent) {
			var oButton = oEvent.getSource();

			if (!this._new) {
				this._new = sap.ui.xmlfragment(this.getView().getId(), "com.OMT.fragments.NewOrder",
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
			//this.getRouter().getRoute("NewOrder").attachPatternMatched(this._onRouteMatched, this);
			this._getSystem();

			this._oViewProperties = new JSONModel({
				username: "",
				emailId: "",
				userid: "",
				LoginID: "",
				cusId: "",
				cusName: "",
				salesId: "",
				Distrchn: "",
				Division: "",
				DelvBlockId: "",
				ShipToId: "",
				ShipToName: "",
				ShipToAddr: "",
				Discount: "",
				IVHDRNETVAL: "",
				herderCurr: "",
				selectCurr: "",
				CustomerPOnumber: "",
				CustomerPODate: null,
				metrialNo: "",
				matrialDesc: "",
				ZMATRL_DESC: "",
				system: "",
				plant: "",
				HDRNETVAL: "",
				tenderFalg: false,
				ZTOTAL_AMT: "",
				ZFTRADE: "",
				ZFTRADE_DESC: "",
				ZDELIVERY_BLOCK_DESC: "",
				ZDEL_BLOCK_ID: "",
				sUserRole: true,
				DocID: ""
			});
			this.getView().setModel(this._oViewProperties, "viewProperties");
			this.fNotification = [];

			this.minDate = new Date();
			this.maxDate = new Date();

			this._data = {
				Products: [

					{
						"ZINTR_ORDNUM": "",
						"ZSYSTEM": "",
						"ZINTR_ITEMNUM": "",
						"ZMIN_ORDER_QUAN": "",
						"ZMAT_NUM": "",
						"ZTRGT_QTY": "",
						"ZPALLET_QTY": "",
						"ZTRGT_QTYUOM": "",
						"ZALT_UOM": "",
						"ZREQ_DLVRYDAT": "",
						"ZFOC_SMPL": "",
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": "",
						"currency": "",
						"UNITPC": "",
						"matrialDesc": "",
						"ZMATRL_DESC": "",
						"NetQty": "",
						"ZMIN_QTY": "",
						"ZCOST": "",
						"ZGRP_DEVLPR": "",
						"ZFROZEN_PERIOD": "",
						"ZMAX_DATE": this.maxDate,
						"ZMIN_DATE": this.minDate,
						"ZPAL_QUAN": "",
						"ZFOC_ITMC_FLAG": "",
						"ZSCHD_TYPE": "",
						"ItemCategorySug": []
					}
				]
			};

			this.jModel = new sap.ui.model.json.JSONModel();
			this.jModel.setData(this._data);

			this.getView().setModel(this.jModel, "orderItemModel");
			this.getItemCategoryData();
			//	this.getRouter().getRoute("NewOrder").attachPatternMatched(this._onRouteMatched, this);

			this.getOwnerComponent().getRouter().getRoute("NewOrder").attachPatternMatched(this._onRouteMatched, this);
			this.userLogin();
		},
		/**
		 * This event is fired on get user information 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		userLogin: function () {

			var loginJsonModel = new JSONModel(),
				that = this;
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel = this.getOwnerComponent().getModel(),
				sPath1 = "/SessionUser";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath1, {
				success: function (oResp) {

					sap.ui.core.BusyIndicator.hide();
					that.userId = viewProperties.setProperty("/LoginID", oResp.results[0].ZUSR_ID);
					that.getOwnerComponent().sUserId = oResp.results[0].ZUSR_ID;
					that.getOwnerComponent().sUserRole = oResp.results[0].ZUSR_ROLE;
					viewProperties.setProperty("/sUserRole", oResp.results[0].ZUSR_ROLE);
					that._getCustomerData();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		onBeforeRendering: function () {
			this.byId('tblorder').setModel(this.jModel);
		},

		filterE: function () {
			this.getView().byId("table").filter(status, "approved");
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */

		_onRouteMatched: function (oEvent) {
			this.getVisiblePlaceOrder();
			//	this.onDataReceived();
			var that = this;
			/*setTimeout(function () {
				that.userLogin();
			}, 100);*/
			setInterval(function () {
				that.userLogin();
			}, 300000);
			
			//jQuery.sap.intervalCall(100, that.userLogin, that);

		},

		/**
		 * This event is fired on Colunm resizeing
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

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

		onRowItemSelection: function (oEvent) {
			var oDataObject;
			if (oEvent.getParameter("row")) {
				oDataObject = oEvent.getParameter("row").getBindingContext().getObject();
			} else if (oEvent.getParameter("rowContext")) {
				oDataObject = oEvent.getParameter("rowContext").getObject();
			} else if (oEvent.getSource().getBindingContext()) {
				oDataObject = oEvent.getSource().getBindingContext().getObject();
			}
			if (oDataObject) {
				if (this.fNotification) {
					this.fNotification.forEach(function (item) {
						clearInterval(item);
					});
					this.fNotification = [];
				}

				this.getRouter().navTo("sodetail", {
					salesorder: oDataObject.ZsoNo,
					soAppSystem: oDataObject.AoSystem
				});
			}
		},

		onBeforeRebindTable: function (oSource) {

		},

		/**
		 * This event is fired on submit order to hana database we are passing required fields
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onSimulateSubmit: function () {

			var sOrderVal = "";
			var that = this;

			var oTable = sap.ui.getCore().byId("ID_OPEN_ORDER12");
			
			sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(false);
			//
			var oMod = this._oSiDialog.getModel("salesorderData");
			var oModViewProperty = this.getView().getModel("viewProperties");
			var sSysteml;
			if (oModViewProperty.getData().system === "LEAN") {
				sSysteml = "L";
			} else {
				sSysteml = "T";
			}
			var TrustpaymatterSet = [];

			var aItems = oMod.getData().TrustpaymatterSet;
			var i = 1;
			var sDis, sMin;
			if (aItems.length > 0) {
				aItems.forEach(function (item) {
					if (item.ZDISCNT) {
						sDis = item.ZDISCNT;
					} else {
						sDis = "0";
					}

					if (item.ZMIN_QTY) {
						sMin = item.ZMIN_QTY;
					} else {
						sMin = "0";
					}
					TrustpaymatterSet.push({

						"ZINTR_ORDNUM": "",
						"ZSYSTEM": sSysteml,
						"ZINTR_ITEMNUM": i.toString(),
						"ZMAT_NUM": item.ZMAT_NUM,
						"ZTRGT_QTY": item.ZTRGT_QTY,
						"ZTRGT_QTYUOM": item.UNITPC,
						"ZALT_UOM": item.UNITPC,
						"ZREQ_DLVRYDAT": that.formatDate1(item.ZREQ_DLVRYDAT),
						"ZMIN_QTY": sMin,
						"ZFOC_SMPL": item.ZFOC_SMPL,
						"ZORD_NUM": "",
						"ZITEM_NUM": item.ZITEM_NUM,
						"ZDISCNT": sDis,
						"ZCOST": item.NetQty,
						"ZGRP_DEVLPR": item.ZGRP_DEVLPR,
						"ZFROZEN_PERIOD": item.ZFROZEN_PERIOD,
						"ZPAL_QUAN": item.ZPAL_QUAN,
						"ZFOC_ITMC_FLAG": item.ZFOC_ITMC_FLAG,
						"ZSCHD_TYPE": item.ZSCHD_TYPE
					});
					i = i + 1;
				});
			}
			var sDisH;
			if (oMod.getData().Discount) {
				sDisH = oMod.getData().Discount;
			} else {
				sDisH = "0";
			}
			if (!oModViewProperty.getData().DocID) {
				oModViewProperty.setProperty("/DocID", "");
			}
			var payload = {
				"ZORDER_HEADER": [{
					"ZINTR_ORDNUM": "",
					"ZSYSTEM": sSysteml,
					"ZORD_REF": "X",
					"ZCUST_NUM": oModViewProperty.getData().cusId,
					"ZSHIP_PRTY": oModViewProperty.getData().ShipToId,
					"ZPO_TYP": "X",
					"ZDISCNT": sDisH,
					"ZCUST_PONUM": oMod.getData().CustomerPOnumber,
					"ZCUST_PODAT": oModViewProperty.getData().CustomerPODate,
					"ZDOC_ID": oModViewProperty.getProperty("/DocID"),
					"ZORD_STATUS": "SNOA",
					"ZORD_NUM": "",
					"ZAPPROVAL_STATUS": "",
					"ZLEAD_TIME": "",
					"ZMIN_ORDER_QUAN": "",
					"ZORDER_FORECAST": "",
					"ZFIT_CONTRACT_COND": "",
					"ZREQ_DELV_DAT": this.formatDate1(new Date()),
					"ZTEDER_FLAG": oMod.getData().tenderFlag,
					"ZSALES_AREA": oMod.getData().salesId,
					"ZTOTAL_AMT": oModViewProperty.getData().ZTOTAL_AMT,
					"ZFTRADE": oModViewProperty.getData().ZFTRADE,
					"ZFTRADE_DESC": oModViewProperty.getData().ZFTRADE_DESC,
					"ZCURR": oModViewProperty.getData().herderCurr,
					"ZHCURR": oModViewProperty.getData().selectCurr,
					"ZDISTR_CHNL": oModViewProperty.getData().Distrchn,
					"ZDIVISION": oModViewProperty.getData().Division,
					"ZDEL_BLOCK_ID": oModViewProperty.getData().ZDEL_BLOCK_ID,
					"ZORD_APPROVAL_STATUS": "",
					"ZCOMMENTS": "",
					"ZCREATED_BY": this.getOwnerComponent().sUserId,
					"ZCHANGED_BY": ""

				}],
				"ZORDER_ITEM": TrustpaymatterSet
			};

			sap.ui.core.BusyIndicator.show();
			//var sIntOrdno = oMod1.getData().ZINTR_ORDNUM;
			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
					that.getOwnerComponent().getModel().refresh();
					var sMsg = data.message + " The Internal Order Number is " + data.orderID;
					//that.onCusAssign(that.oSourceCust);
					if (that.getOwnerComponent().sUserRole === "RSNO") {
						that.onAddCM1Press(data.orderID);
					} else {
						MessageBox.show(
							sMsg, {
								icon: MessageBox.Icon.SUCCESS,
								title: "SUCCESS",
								onClose: this.onAssignClose,
								actions: [MessageBox.Action.CLOSE],
								styleClass: "sapUiSizeCompact myMessageBox"
							}
						);

					}
					that.onSimulateClose();
					that._onClearOrder();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
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

		/**
		 * This event is fired on before you submit order we are simulate
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onSimulatePress: function () {
			var sOrderVal = "",
				tenderFlag,
				that = this;

			var bVali = this._handleValidation();
			if (!bVali) {
				return;
			}

			var a = this.getView().byId("utpeas");
			var b = this.getView().byId("f4hCustomer");
			var c = this.getView().byId("f4hShipto");
			var d = this.getView().byId("iddiscount");
			var e = this.getView().byId("idcpono");
			var f = this.getView().byId("idcpodate");
			var g = this.getView().byId("idsystem");
			var h = this.getView().byId("idPlant");
			if (a.getSelectedKey() === "N") {
				sOrderVal = "neworder";
			} else {
				sOrderVal = "oldOrder";
			}

			var oModViewProperty = this.getView().getModel("viewProperties");
			var tenderFlagId = this.getView().byId("idTenderFlag");
			if (oModViewProperty.getProperty("/tenderFalg") === true) {
				tenderFlag = "X";
			} else {
				tenderFlag = "";
			}
			var oTable = this.getView().byId("tblorder");
			var TrustpaymatterSet = [];
			var aItems = oTable.getItems();
			var i = 1;
			var sSmpl;

			var oModViewProperty = this.getView().getModel("viewProperties");
			var data = {
				order: sOrderVal,
				cusId: b.getValue(),
				ShipToId: c.getValue(),
				Discount: d.getValue(),
				CustomerPOnumber: e.getValue(),
				CustomerPODate: f.getDateValue(),
				system: g.getValue(),
				ShipToAddr: oModViewProperty.getData().ShipToAddr,
				tenderFlag: tenderFlag,
				salesId: oModViewProperty.getData().salesId,
				ZFTRADE: oModViewProperty.getData().ZFTRADE, // ---- add this fileds
				ZFTRADE_DESC: oModViewProperty.getData().ZFTRADE_DESC // ---- add this fileds
			};

			var jsonData = new JSONModel();

			var cusData = sap.ui.getCore().byId("f4hCustomer") || this.getView().byId("f4hCustomer");
			var sSyst;
			var sUSystem = data.system;
			/*if (data.system === "LEAN") {
				sSyst = "DLACLNT100";
			} else {
				sSyst = "C01CLNT100";
			}*/
			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var ii = 0; ii < aSystemData.length; ii++) {

				if (aSystemData[ii].Yydesc === "LEAN" && sUSystem === "LEAN") {

					sSyst = aSystemData[ii].Yylow;

				} else if (aSystemData[ii].Yydesc === "TEMPO" && sUSystem === "TEMPO") {

					sSyst = aSystemData[ii].Yylow;

				}

			}

			var TrustpaymatterSet1 = [];
			var NavsosimulateschedulineSet = [];
			var aItems1 = oTable.getItems();
			var i1 = 10;
			var sSmpl1;
			var sItemDisc;
			var sFrozenPeriod;
			if (aItems1.length > 0) {
				aItems1.forEach(function (item1) {
					if (item1.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD === null) {
						sFrozenPeriod = "0";
					} else {
						sFrozenPeriod = item1.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD;
					}

					if (item1.getBindingContext("orderItemModel").getObject().ZFOC_ITMC_FLAG !== "X") {
						if (item1.getBindingContext("orderItemModel").getObject().ZFOC_SMPL === "YYAN") {
							sSmpl1 = "";
						} else if (item1.getBindingContext("orderItemModel").getObject().ZFOC_SMPL) {
							sSmpl1 = item1.getBindingContext("orderItemModel").getObject().ZFOC_SMPL;
						} else {
							sSmpl1 = "";
						}

						if (item1.getBindingContext("orderItemModel").getObject().ZDISCNT) {
							sItemDisc = item1.getBindingContext("orderItemModel").getObject().ZDISCNT;
						} else {
							sItemDisc = "0";
						}
						NavsosimulateschedulineSet.push({
							ItmNumber: i1.toString(),
							SchedLine: "0001",
							ReqQty: item1.getBindingContext("orderItemModel").getObject().ZTRGT_QTY.toString(),
							SchedType: ""
						});

						TrustpaymatterSet1.push({
							ItemCateg: sSmpl1,
							ItmNumber: i1.toString(),
							Matnr: item1.getBindingContext("orderItemModel").getObject().ZMAT_NUM,
							Plant: "",
							TargQty: item1.getBindingContext("orderItemModel").getObject().ZTRGT_QTY.toString(),
							DocType: "YOR",
							ZMIN_ORD_QTY: item1.getBindingContext("orderItemModel").getObject().ZMIN_QTY,
							ZPAL_QUAN: item1.getBindingContext("orderItemModel").getObject().ZPAL_QUAN,
							ZTRGT_QTYUOM: item1.getBindingContext("orderItemModel").getObject().ZALT_UOM,
							ZALT_UOM: item1.getBindingContext("orderItemModel").getObject().ZALT_UOM,
							ZREQ_DLVRYDAT: that.formatDateT1Format(item1.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT), //"2021-02-28T00:00:00",//item1.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT,//"2021-02-28T00:00:00",
							ZFOC_SMPL: sSmpl1,
							ZDISCNT: item1.getBindingContext("orderItemModel").getObject().ZDISCNT,
							UNITPC: item1.getBindingContext("orderItemModel").getObject().UNITPC,
							NetQty: "0",
							ZGRP_DEVLPR: item1.getBindingContext("orderItemModel").getObject().ZGRP_DEVLPR,
							ZFROZEN_PERIOD: sFrozenPeriod, //item1.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD,
							CondValue: sItemDisc,
						});
						i1 = i1 + 10;
					}
				});
			}
			var sHdrCond;
			if (oModViewProperty.getData().Discount) {
				sHdrCond = oModViewProperty.getData().Discount;
			} else {
				sHdrCond = "0";
			}

			var payload = {
				IvCustomer: oModViewProperty.getData().cusId,
				IvShipParty: oModViewProperty.getData().ShipToId,
				IvReqDateH: oModViewProperty.getData().CustomerPODate + "T00:00:00",
				IvDistchanl: oModViewProperty.getData().Distrchn,
				IvDivision: oModViewProperty.getData().Division,
				IvSalesorg: oModViewProperty.getData().salesId,
				IvSyssid: sSyst,
				IvCurrency: oModViewProperty.getData().selectCurr,
				IvHdrCondVal: sHdrCond,
				Navsosimulate: TrustpaymatterSet1,
				Navsosimulatescheduline: NavsosimulateschedulineSet,
				NavsosimulateReturn: [],
				NavsosimulateNetval: [],
				Navsosimulateschedlout: []
			};
			var msgT, msgTit, that = this;
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').create("/ysalesordersimulationInputSet", payload, {
				method: "POST",
				success: function (data1, response) {
					sap.ui.core.BusyIndicator.hide();
					if (data1 && data1.NavsosimulateReturn && data1.NavsosimulateReturn.results && data1.NavsosimulateReturn.results.length) {
						if (data1.NavsosimulateReturn["results"][0].Type === "E") {
							MessageBox.show(
								data1.NavsosimulateReturn["results"][0].Message, {
									icon: MessageBox.Icon.ERROR,
									title: "Error",
									actions: [MessageBox.Action.CLOSE],
									styleClass: "sapUiSizeCompact myMessageBox"
								}
							);
							return;
						}
					}

					var aRItems = data1.NavsosimulateNetval.results;
					if (aRItems.length > 0) {
						aRItems.forEach(function (item) {

							TrustpaymatterSet.push({
								"ZINTR_ORDNUM": "",
								"ZSYSTEM": g.getValue(),
								"ZINTR_ITEMNUM": i.toString(),
								"ZMAT_NUM": item.Matnr,
								"ZMATRL_DESC": item.ZMATRL_DESC,
								"ZTRGT_QTY": item.NetQty,
								"ZTRGT_QTYUOM": item.ZALT_UOM,
								"ZALT_UOM": item.ZALT_UOM,
								"ZREQ_DLVRYDAT": item.ZREQ_DLVRYDAT,
								"ZMIN_QTY": item.ZMIN_ORD_QTY,
								"ZFOC_SMPL": item.ItemCat,
								"ZORD_NUM": "",
								"ZITEM_NUM": "",
								"ZDISCNT": item.ZDISCNT,
								"UNITPC": item.ZALT_UOM,
								"NetQty": "",
								"ZGRP_DEVLPR": item.ZGRP_DEVLPR,
								"ZFROZEN_PERIOD": item.ZFROZEN_PERIOD,
								"ZSCHD_TYPE": item.SchedType,
								"ZPAL_QUAN": item.ZPAL_QUAN,
								"ZFOC_ITMC_FLAG": item.FreeCharge_Ind

							});
							i = i + 1;
						});
					}
					data.TrustpaymatterSet = TrustpaymatterSet;
					if (data1 && data1.NavsosimulateNetval && data1.NavsosimulateNetval.results && data1.NavsosimulateNetval.results.length) {
						data.HDRNETVAL = data1.IVHDRNETVAL;
						oModViewProperty.setProperty("/ZTOTAL_AMT", data.HDRNETVAL);

						for (var k = 0; k < data.TrustpaymatterSet.length; k++) {
							//data.TrustpaymatterSet[k].NetQty = data1.NavsosimulateNetval.results[k].ItemNetval;
							data.TrustpaymatterSet[k].NetQty = data1.NavsosimulateNetval.results[k].ItemNetval;
							data.TrustpaymatterSet[k].currency = data1.NavsosimulateNetval.results[k].Currency;
							data.herderCurr = data.TrustpaymatterSet[k].currency;
						}
						oModViewProperty.setProperty("/herderCurr", data.herderCurr);
					}

					jsonData.setData(data);

					if (!that._oSiDialog) {
						sap.ui.core.BusyIndicator.hide();

						that._oSiDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.orderSimulate", that);
						that.getView().addDependent(that._oSiDialog);

						that._oSiDialog.setModel(jsonData, "salesorderData");

					}
					that._oSiDialog.open();

					if (data1.NavsosimulateReturn.results.length > 0) {
						if (data1.NavsosimulateReturn.results[0].Type === "E") {

							msgTit = "ERROR";
							sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(false);
						} else {
							sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
							msgTit = "SUCCESS";
						}
					} else {
						sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
						msgTit = "SUCCESS";
					}
					MessageBox.show(
						data1.NavsosimulateReturn.results[0].Message, {
							icon: MessageBox.Icon.ERROR,
							title: msgTit,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						oError.message + " " + oError.responseText, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
					//JSON.parse(oError.responseText).error.message.value
					//MessageBox.show(JSON.parse(oError.responseText).error.message.value);

				}
			});

			if (!cusData.getValue()) {
				MessageBox.error(
					"Please fill all mandatory Details", {
						styleClass: "sapUiSizeCompact"
					}
				);
			} else {

			}
		},

		/**
		 *  This event is fired close schedule line fragment
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		soLineClose: function () {
			this._oSSOLDialog.close();
			if (this._oSSOLDialog) {
				this._oSSOLDialog = this._oSSOLDialog.destroy();
			}
		},

		/**
		 *  This event is fired close order simulate fragment
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		onSimulateClose: function () {
			this._oSiDialog.close();
			this._oSiDialog.getModel("salesorderData").refresh();
			if (this._oSiDialog) {
				this._oSiDialog = this._oSiDialog.destroy();
			}
		},

		/**
		 *  This event is fired get schedule line information
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		soLineShow: function (oEvent) {
			var ta = "20000.02";

			var oModel = oEvent.getSource()._getBindingContext("salesorderData").getObject();

			var oData = this._oSiDialog.getModel("salesorderData").getData();
			var ssoLine = this._oViewProperties = new JSONModel();
			ssoLine.setData(oData);

			var oModViewProperty = this.getView().getModel("viewProperties");

			var sSidd;
			var sUSystem = oData.system;
			/*if (oData.system === "LEAN") {
				sSidd = "DLACLNT100";
			} else {
				sSidd = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var ii = 0; ii < aSystemData.length; ii++) {

				if (aSystemData[ii].Yydesc === "LEAN" && sUSystem === "LEAN") {

					sSidd = aSystemData[ii].Yylow;

				} else if (aSystemData[ii].Yydesc === "TEMPO" && sUSystem === "TEMPO") {

					sSidd = aSystemData[ii].Yylow;

				}

			}

			var kl = "datetime%27" + this.formatDateT1(oModel.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";

			var sUnit;
			if (oModel.UNITPC) {
				sUnit = oModel.UNITPC;
			} else {
				sUnit = "PC";
			}

			var sFData = "/ysoschedulelinesSet(distchnl='" + oModViewProperty.getData().Distrchn + "',division='" + oModViewProperty.getData().Division +
				"',salesorg='" + oModViewProperty.getData().salesId + "',customer='" + oModViewProperty.getData().cusId + "',Material='" + oModel.ZMAT_NUM +
				"',Unit='" + sUnit + "',Sysid='" + sSidd + "',ReqDate=" + kl + ",ReqQty=" + parseInt(oModel.ZTRGT_QTY) + ")";
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				success: function (oData12, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					var oModel_Customer = new JSONModel();
					oModel_Customer.setData(oData12);
					if (!this._oSSOLDialog) {
						this._oSSOLDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.orderSimulateSOLine", this);
						this.getView().addDependent(this._oSSOLDialog);
						this._oSSOLDialog.setModel(oModel_Customer, "ssoLineJson");
						this._oSSOLDialog.setModel(ssoLine, "ssoLineJson1");
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
					this._oSSOLDialog.open();
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
		 *  This event is fired add row in the table
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		addRow: function (oArg) {
			this.minDate = new Date();
			this.maxDate = new Date();
			this._data.Products.push({
				"ZSYSTEM": "",
				"ZINTR_ITEMNUM": "",
				"ZMAT_NUM": "",
				"ZTRGT_QTY": "",
				"ZTRGT_QTYUOM": "",
				"ZALT_UOM": "",
				"ZREQ_DLVRYDAT": "",
				"ZFOC_SMPL": "",
				"ZORD_NUM": "",
				"ZITEM_NUM": "",
				"ZDISCNT": "",
				"ZPAL_QUAN": "",
				"ZFOC_ITMC_FLAG": "",
				"ZMAX_DATE": this.maxDate,
				"ZMIN_DATE": this.minDate

			});
			this.jModel.refresh(); //which will add the new record

		},
		/**
		 *  This event is fired delete row in front end level
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		deleteRow: function (oArg) {
			var deleteRecord = oArg.getSource().getBindingContext("orderItemModel").getObject();
			for (var i = 0; i < this._data.Products.length; i++) {
				if (this._data.Products[i] == deleteRecord) {
					//    pop this._data.Products[i]
					this._data.Products.splice(i, 1); //removing 1 record from i th index.
					this.jModel.refresh();
					break; //quit the loop
				}
			}
		},

		/**
		 *  This event is fired When switching new and old order clearing data
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		_onClearOrder: function () {

			var viewModel = this.getView().getModel("viewProperties");
			viewModel.setProperty("/cusId", "");
			viewModel.setProperty("/cusName", "");
			viewModel.setProperty("/ZINTR_ORDNUM", "");
			viewModel.setProperty("/ShipToId", "");
			viewModel.setProperty("/ShipToName", "");
			viewModel.setProperty("/Discount", "");
			viewModel.setProperty("/system", "");
			viewModel.setProperty("/CustomerPOnumber", "");
			viewModel.setProperty("/ShipToName", "");
			viewModel.setProperty("/CustomerPODate", "");
			viewModel.setProperty("/salesId", "");
			viewModel.setProperty("/ShipToAddr", "");
			viewModel.setProperty("/tenderFalg", false);
			viewModel.setProperty("/selectCurr", "");
			viewModel.setProperty("/ZFTRADE", "");
			viewModel.setProperty("/ZFTRADE_DESC", "");
			viewModel.setProperty("/pdfFile", "");

			this.getView().byId("idNewSelectCurr").setSelectedKey("");
			this.getView().byId("idNewSelectCurr").setValue("");
			this.clearRowItem();

		},

		clearRowItem: function () {
			this._data = {
				Products: [

					{
						"ZINTR_ORDNUM": "",
						"ZSYSTEM": "",
						"ZINTR_ITEMNUM": "",
						"ZMIN_ORDER_QUAN": "",
						"ZMAT_NUM": "",
						"ZTRGT_QTY": "",
						"ZTRGT_QTYUOM": "",
						"ZALT_UOM": "",
						"ZREQ_DLVRYDAT": "",
						"ZFOC_SMPL": "",
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": "",
						"currency": "",
						"UNITPC": "",
						"matrialDesc": "",
						"ZMATRL_DESC": "",
						"NetQty": "",
						"ZMIN_QTY": "",
						"ZCOST": "",
						"ZGRP_DEVLPR": "",
						"ZFROZEN_PERIOD": "",
						"ZMAX_DATE": null,
						"ZMIN_DATE": null,
						"selectCurr": "",
						"ZPAL_QUAN": "",
						"ZFOC_ITMC_FLAG": "",
						"ItemCategorySug": []

					}
				]
			};

			this.jModel = new sap.ui.model.json.JSONModel();
			this.jModel.setData(this._data);

			this.getView().setModel(this.jModel, "orderItemModel");
		},

		/**
		 *  This event is fired When data is setting in perticuler row
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		handleDate: function (evt) {
			var source = evt.getSource(),
				path = source.getBindingPath("value"),
				value = new Date((source.getValue()).replace( /(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3")),
				oDateFormatter = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy",
					strictParsing: true
				}),
			sPath = source.getBindingContext("orderItemModel").sPath;
			var mxDate = this.getView().getModel("orderItemModel").getProperty(sPath + "/ZMAX_DATE");
			//value.setDate(value.getDate() + 1);
			////value = new Date((source.getValue()).replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
			this.dateFormat(value);
			this.dateFormat(mxDate);
			if (value !== null) {
				value.setHours(0, 0, 0, 0);
			}
			//value.setHours(0,0,0,0);

			var validDate = oDateFormatter.parse(this.getView().getModel("orderItemModel").getProperty(sPath + "/ZMAX_DATE"))
			if (validDate !== null) {
				mxDate.setHours(0, 0, 0, 0);
			}
			if (value < mxDate) {
				MessageBox.show(
					"Please verify lead-time for requested delivery date not respecting frozen period", {
						icon: MessageBox.Icon.WARNING,
						title: "WARNING",
						onClose: this.onAssignClose,
						actions: [MessageBox.Action.CLOSE],
						styleClass: "sapUiSizeCompact myMessageBox"
					}
				);
			}

			this.getView().getModel("orderItemModel").setProperty(sPath + "/" + path, value);
			this.handleonValueInput(evt);

		},

		handleonValueInput: function (evt) {
			var oSrc = evt.getSource();

			if (oSrc.getValue().length > 0) {
				oSrc.setValueState("None");
			} else {
				oSrc.setValueState("Error");
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
		 *  This event is fired creating data Instance with time
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		formatDateT1: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "yyyy-MM-dd",
					UTC: true
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},
		/**
		 *  This event is fired creating data Instance with time
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		formatDateT1Format: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "yyyy-MM-dd",
					UTC: false
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1 + "T00:00:00";
				return dateVal;
			}
		},

		/**
		 *  This event is fired save data to hana data base
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		_onSaveOrder: function () {
			var bVali = this._handleValidation();
			if (!bVali) {
				return;
			}
			var viewProperties = this.getView().getModel("viewProperties");
			var cusData = this.getView().byId("f4hCustomer"),
				//matData = this.getView().byId("idMaterialinput"),
				quanData = this.getView().byId("f4hShipto"),
				dateData = this.getView().byId("iddiscount");

			this.getView().byId("save").setEnabled(false);

			/*if (!cusData.getValue() || !quanData.getValue()) {
				MessageBox.error(
					"Please fill all mandatory Details", {
						styleClass: "sapUiSizeCompact"
					}
				);
			} else {*/
			
			var that=this;

			var sOrderVal = "";
			var a = this.getView().byId("utpeas");
			var b = this.getView().byId("f4hCustomer");
			var c = this.getView().byId("f4hShipto");
			var d = this.getView().byId("iddiscount");
			var e = this.getView().byId("idcpono");
			var f = this.getView().byId("idcpodate");

			var dtCUST_PODAT = this.formatDate1(f.getDateValue());
			var g = this.getView().byId("idsystem"),
				sSytemVal = '',
				tenderval;
			if (g.getValue() === "TEMPO") {
				sSytemVal = "T";
			} else {
				sSytemVal = "L";
			}

			if (a.getSelectedKey() === "N") {
				sOrderVal = "neworder";
			} else {
				sOrderVal = "oldOrder";
			}

			var tenderId = this.getView().byId("idTenderFlag");
			if (viewProperties.getProperty("/tenderFalg") === true) {
				tenderval = "X";
			} else {
				tenderval = "";
			}

			var oTable = this.getView().byId("tblorder");
			var TrustpaymatterSet = [];
			var aItems = oTable.getItems();
			var i = 1;
			var sDis, sMin;
			if (aItems.length > 0) {
				aItems.forEach(function (item) {
					if (item.getBindingContext("orderItemModel").getObject().ZDISCNT) {
						sDis = item.getBindingContext("orderItemModel").getObject().ZDISCNT;
					} else {
						sDis = "0";
					}

					if (item.getBindingContext("orderItemModel").getObject().ZMIN_QTY) {
						sMin = item.getBindingContext("orderItemModel").getObject().ZMIN_QTY;
					} else {
						sMin = "0";
					}
					TrustpaymatterSet.push({

						"ZINTR_ORDNUM": "",
						"ZSYSTEM": sSytemVal,
						"ZINTR_ITEMNUM": i.toString(),
						"ZMAT_NUM": item.getBindingContext("orderItemModel").getObject().ZMAT_NUM,
						"ZTRGT_QTY": item.getBindingContext("orderItemModel").getObject().ZTRGT_QTY,
						"ZTRGT_QTYUOM": item.getBindingContext("orderItemModel").getObject().ZALT_UOM,
						"ZALT_UOM": item.getBindingContext("orderItemModel").getObject().ZALT_UOM,
						"ZREQ_DLVRYDAT": that.formatDate1(item.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT),
						"ZMIN_QTY": sMin,
						"ZFOC_SMPL": item.getBindingContext("orderItemModel").getObject().ZFOC_SMPL,
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": sDis,
						"ZCOST": "",
						"ZGRP_DEVLPR": item.getBindingContext("orderItemModel").getObject().ZGRP_DEVLPR,
						"ZFROZEN_PERIOD": item.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD,
						"ZPAL_QUAN": item.getBindingContext("orderItemModel").getObject().ZPAL_QUAN,
						"ZFOC_ITMC_FLAG": "",
						"ZSCHD_TYPE": ""
					});
					i = i + 1;
				});
			}

			var sDisH;
			if (d.getValue()) {
				sDisH = d.getValue();
			} else {
				sDisH = "0";
			}
			if (!viewProperties.getData().DocID) {
				viewProperties.setProperty("/DocID", "");
			}
			var payload = {
				"ZORDER_HEADER": [{
					"ZINTR_ORDNUM": "",
					"ZSYSTEM": sSytemVal,
					"ZORD_REF": "X",
					"ZCUST_NUM": viewProperties.getProperty("/cusId"),
					"ZSHIP_PRTY": viewProperties.getProperty("/ShipToId"),
					"ZPO_TYP": "X",
					"ZDISCNT": sDisH,
					"ZCUST_PONUM": e.getValue(),
					"ZCUST_PODAT": dtCUST_PODAT,
					"ZDOC_ID": viewProperties.getProperty("/DocID"),
					"ZORD_STATUS": "DRFT",
					"ZORD_NUM": "",
					"ZAPPROVAL_STATUS": "",
					"ZLEAD_TIME": "",
					"ZMIN_ORDER_QUAN": "",
					"ZORDER_FORECAST": "",
					"ZFIT_CONTRACT_COND": "",
					"ZREQ_DELV_DAT": this.formatDate1(new Date()),
					"ZTEDER_FLAG": tenderval,
					"ZSALES_AREA": viewProperties.getProperty("/salesId"),
					"ZTOTAL_AMT": "",
					"ZFTRADE": viewProperties.getData().ZFTRADE,
					"ZFTRADE_DESC": viewProperties.getData().ZFTRADE_DESC,
					"ZCURR": "",
					"ZHCURR": viewProperties.getData().selectCurr,
					"ZDISTR_CHNL": viewProperties.getData().Distrchn,
					"ZDIVISION": viewProperties.getData().Division,
					"ZDEL_BLOCK_ID": viewProperties.getData().ZDEL_BLOCK_ID,
					"ZORD_APPROVAL_STATUS": "",
					"ZCOMMENTS": "",
					"ZCREATED_BY": this.getOwnerComponent().sUserId,
					"ZCHANGED_BY": ""

				}],
				"ZORDER_ITEM": TrustpaymatterSet
			};

			var jsonData = new JSONModel();
			jsonData.setData(payload);

			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "POST",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					//oMpdel.refresh();
					that.getOwnerComponent().getModel().refresh();
					sap.ui.core.BusyIndicator.hide();
					that._onClearOrder();
					that.getView().byId("save").setEnabled(true);
					var sMsg = data.message + " The Internal Order Number is " + data.orderID;
					MessageBox.show(
						sMsg, {
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
					that.getView().byId("save").setEnabled(true);
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

		onCusAssignClose: function () {
			this._oCUADialog.close();
			if (this._oCUADialog) {
				this._oCUADialog = this._oCUADialog.destroy();
			}
		},

		/**
		 * Function to open the Customer Number Dialog.
		 * @public
		 */
		onArticleValueHelpRequest: function (oEvent) {
			var oView;
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.oArticleNo) {
				this.oArticleNo = sap.ui.xmlfragment(oView.getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderArticleNumber",
					this);
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
					new Filter("ZCUST_NUM", "Contains", sValue.toUpperCase()),
					new Filter("ZCUSTOMER_NAME", "Contains", sValue.toUpperCase())
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
			if (oEvent.getId() === "cancel") {
				return;
			}
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");
			var sOrder = this.getView().byId("utpeas");

			this._data.Products = [{
				"ZINTR_ORDNUM": "",
				"ZSYSTEM": "",
				"ZINTR_ITEMNUM": "",
				"ZMAT_NUM": "",
				"ZTRGT_QTY": "",
				"ZTRGT_QTYUOM": "",
				"ZALT_UOM": "",
				"ZREQ_DLVRYDAT": "",
				"ZFOC_SMPL": "",
				"ZORD_NUM": "",
				"ZITEM_NUM": "",
				"ZDISCNT": "",
				"ZPAL_QUAN": "",
				"ZFOC_ITMC_FLAG": "",
				"ItemCategorySug": []

			}];
			this.jModel.refresh(); //which will add the new record
			var oCustId = this.getView().byId("f4hCustomer");
			viewProperties.setProperty("/salesId", "");
			viewProperties.setProperty("/ShipToId", "");
			viewProperties.setProperty("/ShipToName", "");
			viewProperties.setProperty("/ShipToAddr", "");
			viewProperties.setProperty("/DocID", "");
			viewProperties.setProperty("/FileName", "");
			viewProperties.setProperty("/pdfFile", "");

			var that = this;
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("custJson").getObject();
				viewProperties.setProperty("/cusId", object.ZCUST_NUM);
				viewProperties.setProperty("/cusName", object.ZCUSTOMER_NAME);

				if (sOrder.getSelectedKey() === "") {
					viewProperties.setProperty("/ZINTR_ORDNUM", "");
					this.getView().byId("oordref").setEnabled(true);
					that.getInternalOrderNumber(object.ZCUST_NUM);
					return;

				}

				if (object.ZSYSTEM === "L") {
					viewProperties.setProperty("/system", "LEAN");
				} else {

					viewProperties.setProperty("/system",
						"TEMPO");
				}

				if (oCustId.getValue() === "") {
					oCustId.setValueState("Error");

				} else {
					oCustId.setValueState("None");
				}
				that.showSalesOffice(object);
				that.showShiptoPartyValue(object);
				that.showFtradeValue(object);

				that.showDeliveryBlock(object);
				that._getCurrencyClear();
				that.getCurrency(object.ZCUST_NUM);

			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		/**
		 * This event is fired get customers, assgined to the perticuler user
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		_getCustomerData: function () {

			var custJosnModel = new JSONModel(),
				that = this;
			var oModel = this.getOwnerComponent().getModel(),
				viewProperties = this.getView().getModel("viewProperties"),
				appJson = this.getOwnerComponent().getModel("appJson"),
				sPath = "/UserCustAssignDetails",
				sFilter;
			if (that.getOwnerComponent().sUserRole === 'ADMIN') {
				sFilter = new Filter("ZCENTRL_DEL_FLAG", "EQ", "");
				sPath = "/CustomerDetails/?$select=ZCUSTMR_NUM,ZSYSTEM,ZCUST_NUM,ZCUSTOMER_NAME";
			} else {
				sFilter = new Filter({
				filters: [
					new Filter("ZUSR_ID", "EQ", viewProperties.getProperty("/LoginID")),
					new Filter("ZCUST_STATUS", "NE", "FFDL"),
					new Filter("ZCENTRL_DEL_FLAG", "NE", "X")
				],
				and: true
			});
				//new Filter("ZUSR_ID", "EQ", viewProperties.getProperty("/LoginID"));
			}
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [sFilter],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					custJosnModel.setData(oResp.results);
					that.getView().setModel(custJosnModel, "custJson");
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		/**
		 * This event is fired get DeliveryBlock based on customer
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		showDeliveryBlock: function () {
			var viewProperties = this.getView().getModel("viewProperties");

			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUSTMR_NUM", "EQ", viewProperties.getProperty("/cusId"))],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					if (oResp.results[0].ZDEL_BLOCK_ID === null) {
						oResp.results[0].ZDEL_BLOCK_ID = "";
					}
					if (oResp.results[0].ZDELIVERY_BLOCK_DESC === null) {
						oResp.results[0].ZDELIVERY_BLOCK_DESC = "";
					}
					viewProperties.setProperty("/ZDELIVERY_BLOCK_DESC", oResp.results[0].ZDELIVERY_BLOCK_DESC);
					viewProperties.setProperty("/ZDEL_BLOCK_ID", oResp.results[0].ZDEL_BLOCK_ID);
				},

				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		/**
		 * This event is fired get saleArea information
		 * @param ZCUST_NUM , systemId
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		showSalesOffice: function (oResp) {
			var that = this;
			var sSyssid;
			var oSalesOffcId = this.getView().byId("f4hSalesOffc");
			var viewProperties = this.getView().getModel("viewProperties");
			var sUSystem = oResp.ZSYSTEM;
			/*if (oResp.ZSYSTEM === "L") {
				sSyssid = "DLACLNT100";

			} else {

				sSyssid = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var ii = 0; ii < aSystemData.length; ii++) {

				if (aSystemData[ii].Yydesc === "LEAN" && sUSystem === "L") {

					sSyssid = aSystemData[ii].Yylow;

				} else if (aSystemData[ii].Yydesc === "TEMPO" && sUSystem === "T") {

					sSyssid = aSystemData[ii].Yylow;

				}

			}

			var sFData = "/ysaleAreaInputSet(IvCustomer='" + oResp.ZCUST_NUM + "',IvSyssid='" + sSyssid + "')";
			/*var sFData = "/ysalesAreacustomerInputSet(IvCustomer='" + oResp.ZCUST_NUM + "',IvSyssid='" + sSyssid +  "',IvSalesorg='" 
			+ oResp.ZSALES_AREA + "',IvDistchnl='" + oResp.ZDISTR_CHNL + "')";*/
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				urlParameters: {
					"$expand": "NavsalesArea"
				},
				success: function (oData1, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					if (oData1.NavsalesArea.results.length === 0) {
						oSalesOffcId.setEnabled(false);
						oSalesOffcId.setShowValueHelp(false);

						return;
					}
					if (oData1.NavsalesArea.results.length > 1) {
						oSalesOffcId.setEnabled(true);
						oSalesOffcId.setShowValueHelp(true);
						var oModel_SalesOff = new JSONModel();
						that.getView().byId("idNewSelectCurr").setEnabled(true);
						oModel_SalesOff.setData(oData1.NavsalesArea.results);
						that.getView().setModel(oModel_SalesOff, "SalesOffice");
					} else {
						oSalesOffcId.setShowValueHelp(false);
						oSalesOffcId.setEnabled(false);
						//	that.getView().byId("idNewSelectCurr").setEnabled(false);
						viewProperties.setProperty("/salesId", oData1.NavsalesArea.results[0].Salesorg);
						viewProperties.setProperty("/Distrchn", oData1.NavsalesArea.results[0].Distrchn);
						viewProperties.setProperty("/Division", oData1.NavsalesArea.results[0].Division);
						that.showMatrialValue(oData1.NavsalesArea.results[0]);
					}

				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					that.getView().byId("f4hSalesOffc").setEnabled(false);
				}.bind(this)
			});
		},
		/**
		 * Function to open the Shipto party Dialog.
		 * @public
		 */
		onShipToPartyValueHelpRequest: function (oEvent) {
			var oView;
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.F4HelpShipToParty) {
				this.F4HelpShipToParty = sap.ui.xmlfragment(oView.getId(),
					"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderF4HelpShipToParty", this);
				oView.addDependent(this.F4HelpShipToParty);

			}

			this.F4HelpShipToParty.open();
		},
		/**
		 * This event is fired on search values in Article field 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleShipToSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilter = new Filter({
				filters: [
					new Filter("ZSHIP_TO_PARTY", "Contains", sValue.toUpperCase()),
					new Filter("ZSHIP_TO_PARTY_DESC", "Contains", sValue.toUpperCase())
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
		onPressShipToPartyValueListClose: function (oEvent) {

			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");
			var oShiptoId = this.getView().byId("f4hShipto");
			viewProperties.setProperty("/ShipToAddr", "");
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("shipToPartyJson").getObject();
				viewProperties.setProperty("/ShipToId", object.ZSHIP_TO_PARTY);
				viewProperties.setProperty("/ShipToName", object.ZSHIP_TO_PARTY_DESC);

				var sCity, sPoCode;
				if (object.ZCITY === null) {
					sCity = "";
				} else {
					sCity = object.ZCITY;
				}

				if (object.ZPOSTAL_CODE === null) {
					sPoCode = "";
				} else {
					sPoCode = object.ZPOSTAL_CODE;
				}
				var sAddress = sCity + " " + sPoCode;
				viewProperties.setProperty("/ShipToAddr", sAddress);

				if (oShiptoId.getValue() === "") {
					oShiptoId.setValueState("Error");

				} else {
					oShiptoId.setValueState("None");
				}
			}
		},

		/**
		 * This event is fired get shiptoparty information based on customer
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		showShiptoPartyValue: function (oResp1) {

			var that = this;
			var oSalesOffcId = this.getView().byId("f4hShipto");
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_shiptoParty = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerShipToPartyAssignDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUSTMR_NUM", "EQ", viewProperties.getProperty("/cusId"))],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					if (oResp.results.length === 0) {
						oSalesOffcId.setEnabled(false);
						oSalesOffcId.setShowValueHelp(false);
						return;
					}
					if (oResp.results.length > 1) {
						oSalesOffcId.setEnabled(true);
						oSalesOffcId.setShowValueHelp(true);

						oModel_shiptoParty.setData(oResp.results);
						that.getView().setModel(oModel_shiptoParty, "shipToPartyJson");
					} else {
						oSalesOffcId.setShowValueHelp(false);
						oSalesOffcId.setEnabled(false);
						viewProperties.setProperty("/ShipToId", oResp.results[0].ZSHIP_TO_PARTY);
						viewProperties.setProperty("/ShipToName", oResp.results[0].ZSHIP_TO_PARTY_DESC);

						var sCity, sPoCode;
						if (oResp.results[0].ZCITY === null) {
							sCity = "";
						} else {
							sCity = oResp.results[0].ZCITY;
						}

						if (oResp.results[0].ZPOSTAL_CODE === null) {
							sPoCode = "";
						} else {
							sPoCode = oResp.results[0].ZPOSTAL_CODE;
						}
						var sAddress = sCity + " " + sPoCode;

						viewProperties.setProperty("/ShipToAddr", sAddress);
					}
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 * This event is fired get item Category information based on customer and material
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		getItemCategory1: function (custid, aResp) {
			var that = this;

			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_ICatJosn = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),
				// sPath1 = "/MatItemCategoryAssign",
				sPath = "/CustMatItemCategoryAssign";

			for (var i = 0; i < aResp.length; i++) {
				sap.ui.core.BusyIndicator.show();
				var sMatrialNo = aResp[i].ZMAT_NUM;
				//var custid = aResp[i].ZCUST_NUM;
				that._getItemCategoryCustomerMaster(oModel, custid, sMatrialNo, i);
				// oModel.read(sPath, {

				// filters: [new Filter("ZCUST_NUM", "EQ", custid), new Filter("ZMAT_NUM", "EQ", sMatrialNo)],
				// success: function (oResp1) {
				// sap.ui.core.BusyIndicator.hide();
				// if (oResp1.results.length > 0) {
				// that._getItemCategoryCustomerMaster(oModel, sMatrialNo);
				// } else {
				// that._getItemCategoryMatrialMaster(oModel, sMatrialNo)
				// }

				// },
				// error: function (err) {
				// sap.ui.core.BusyIndicator.hide();
				// }
				// });
			}
		},

		_getItemCategoryCustomerMaster: function (oModel, custid, sMatrialNo, ind) {
			var oModel_ICatJosn = new JSONModel();
			oModel.read("/CustMatItemCategoryAssign", {
				filters: [new Filter("ZCUST_NUM", "EQ", custid), new Filter("ZMAT_NUM", "EQ", sMatrialNo)],
				success: function (oRespI1) {
					//sap.ui.core.BusyIndicator.hide();
					if (oRespI1.results.length > 0) {
						// oModel_ICatJosn.setData(oResp1.results);
						this.getView().getModel("orderItemModel").setProperty("/Products/" + ind + "/ItemCategorySug", oRespI1.results);
						this.getView().getModel("orderItemModel").refresh();
					} else {
						this._getItemCategoryMatrialMaster(oModel, sMatrialNo, ind);
					}
				}.bind(this),
				error: function (err) {
					//	sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		_getItemCategoryMatrialMaster: function (oModel, sMatrialNo, ind) {
			var oModel_ICatJosn = new JSONModel();
			var viewProperties = this.getView().getModel("viewProperties");
			var sSystem;
			if (viewProperties.getData().system === "TEMPO") {
				sSystem = "T";
			} else {
				sSystem = "L";
			}
			oModel.read("/MatItemCategoryAssign", {
				filters: [new Filter("ZMAT_NUM", "EQ", sMatrialNo), new Filter("ZSYSTEM", "EQ", sSystem)],
				success: function (oRespI1) {
					sap.ui.core.BusyIndicator.hide();
					// oModel_ICatJosn.setData(oRespI1.results);
					if (oRespI1.results.length > 0) {
						// this.getView().setModel(oModel_ICatJosn, "ItemCatJson");
						// oModel_ICatJosn.refresh();
						this.getView().getModel("orderItemModel").setProperty("/Products/" + ind + "/ItemCategorySug", oRespI1.results);
						this.getView().getModel("orderItemModel").refresh();
					} else {
						// this.getView().setModel(oModel_ICatJosn, "ItemCatJson");
					}
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		/*	getItemCategory: function (custid, matId) {
				var that = this;
				//	var oSalesOffcId = this.getView().byId("f4hShipto");
				var viewProperties = this.getView().getModel("viewProperties");
				var oModel_ICatJosn = new JSONModel();
				var oModel = this.getOwnerComponent().getModel(),
					sPath1 = "/MatItemCategoryAssign",
					sPath = "/CustMatItemCategoryAssign";
				sap.ui.core.BusyIndicator.show();

				oModel.read(sPath, {

					filters: [new Filter("ZCUST_NUM", "EQ", custid), new Filter("ZMAT_NUM", "EQ", matId)],
					success: function (oResp1) {
						sap.ui.core.BusyIndicator.hide();
						if (oResp1.results.length > 0) {
							var objItemCat = {
								ZITM_CATEGORY: ""
							};
							oResp1.results.push(objItemCat);
							oModel_ICatJosn.setData(oResp1.results);
							
							that.getView().setModel(oModel_ICatJosn, "ItemCatJson");

							oModel_ICatJosn.refresh();
						} else {
							oModel.read(sPath1, {

								filters: [new Filter("ZMAT_NUM", "EQ", matId)],
								success: function (oRespI1) {
									sap.ui.core.BusyIndicator.hide();
									if (oRespI1.results.length > 0) {
										oModel_ICatJosn.setData(oRespI1.results);
										that.getView().setModel(oModel_ICatJosn, "ItemCatJson");

										oModel_ICatJosn.refresh();
									} else {

										that.getView().setModel(oModel_ICatJosn, "ItemCatJson");
									}
								},
								error: function (err) {
									sap.ui.core.BusyIndicator.hide();
								}
							});
						}

					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
					}
				});
			},*/
		/**
		 * This event is fired get Material information based on customer number , salesId and currency
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		showMatrialValue: function (oResp) {

			var that = this;

			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_matrialJosn = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerMatAssignDetails";
			sap.ui.core.BusyIndicator.show();
			var oFilter = [];

			var oSorter = [];
			oSorter = [new Sorter("ZMATRL_DESC", false)];

			if (viewProperties.getProperty("/selectCurr")) {
				oFilter = [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/cusId")), new Filter("ZSALES_ORG", "EQ", viewProperties.getProperty(
					"/salesId")), new Filter("ZCURR", "EQ", viewProperties.getProperty("/selectCurr")), new Filter("ZMAT_DEL_FLAG", "NE", "X")];
			} else {
				oFilter = [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/cusId")),
					new Filter("ZSALES_ORG", "EQ", viewProperties.getProperty("/salesId")), new Filter("ZCURR", "EQ", viewProperties.getProperty(
						"/selectCurr")), new Filter("ZMAT_DEL_FLAG", "NE", "X")
				];
			}
			oModel.read(sPath, {
				filters: oFilter,
				sorters: oSorter,
				success: function (oResp1) {
					sap.ui.core.BusyIndicator.hide();

					oModel_matrialJosn.setData(oResp1.results);
					that.getView().setModel(oModel_matrialJosn, "MaterialJson");
					//that.getItemCategory(viewProperties.getProperty("/cusId"), oResp1.results[0].ZMAT_NUM);
					//that.getItemCategory1(oResp1.results);
					oModel_matrialJosn.refresh();

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},
		/**
		 * Function to open the Component Material Dialog.
		 * @public
		 */
		onMaterialValueHelpRequest: function (oEvent) {
			var oView;
			this._material = oEvent.getSource();
			var sInputValue = oEvent.getSource().getValue();
			this.curentNewOrderItemRow = oEvent.getSource().getBindingContext("orderItemModel").getPath().split("/").pop();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.MaterialF4Help) {
				this.MaterialF4Help = sap.ui.xmlfragment(oView.getId(),
					"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderMaterialF4Help", this);
				oView.addDependent(this.MaterialF4Help);

			}

			this.MaterialF4Help.open();
		},
		/**
		 * This event is fired on search values in Article field 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleMaterialSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilter = new Filter({
				filters: [
					new Filter("ZMAT_NUM", "Contains", sValue.toUpperCase()),
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
		onPressMaterialValueListClose: function (oEvent) {
			var that = this;
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel = this.getOwnerComponent().getModel();
			var orderModel = this.getView().getModel("orderItemModel");
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("MaterialJson").getObject();
				var oCOntext = this._material.getBindingContext("orderItemModel");
				var sPath = oCOntext.getPath();
				if (object.ZMAT_NUM) {
					this._material.setValueState("None");
				} else {
					this._material.setValueState("Error");
				}
				orderModel.setProperty(sPath + "/ZMAT_NUM", object.ZMAT_NUM);
				var Z_MATRL_NUM = object.ZMAT_NUM,
					sPath1 = "/MaterialDetails";
				//this.getItemCategory(viewProperties.getProperty("/cusId"), object.ZMAT_NUM);
				this._getItemCategoryCustomerMaster(oModel, viewProperties.getProperty("/cusId"), object.ZMAT_NUM, this.curentNewOrderItemRow);
				this.maxDate = new Date();
				this.getPallet(viewProperties, object.ZMAT_NUM, sPath);
				sap.ui.core.BusyIndicator.show();
				oModel.read(sPath1, {
					filters: [new Filter("Z_MATRL_NUM", "EQ", Z_MATRL_NUM)],
					success: function (oResp) {
						//sap.ui.core.BusyIndicator.hide(); "ZFROZEN_PERIOD": item.ZFROZEN_PERIOD,
						if (oResp.results.length) {
							orderModel.setProperty(sPath + "/ZMATRL_DESC", oResp.results[0].ZMATRL_DESC);
							orderModel.setProperty(sPath + "/UNITPC", oResp.results[0].ZBASE_UNIT_MEASURE);
							orderModel.setProperty(sPath + "/ZALT_UOM", oResp.results[0].ZBASE_UNIT_MEASURE);
							orderModel.setProperty(sPath + "/ZMIN_QTY", oResp.results[0].ZMIN_ORDER_QUAN);
							orderModel.setProperty(sPath + "/ZGRP_DEVLPR", oResp.results[0].ZGRP_DEVLPR);
							orderModel.setProperty(sPath + "/ZFROZEN_PERIOD", oResp.results[0].ZFROZEN_PERIOD);
							that.maxDate.setMonth(that.maxDate.getMonth() + (parseInt(oResp.results[0]["ZFROZEN_PERIOD"]) + 1));
							that.maxDate.setDate(1);
							//that.maxDate.setDate(that.maxDate.getDate() + parseInt(oResp.results[0].ZFROZEN_PERIOD) * 30);
							orderModel.setProperty(sPath + "/ZMAX_DATE", that.maxDate);
						}

					},
					error: function (err) {
						//sap.ui.core.BusyIndicator.hide();
					}
				});
				oEvent.getSource().getBinding("items").filter([]);
			}

		},
		/**
		 * When material number select based that get pallet data 
		 * @param IvMaterial,IvMaterial,IvSalesorg,IvDisbchnl and IvDivision
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		getPallet: function (oModelView, matNum, sPath) {
			var sSyssid;
			var orderModel = this.getView().getModel("orderItemModel");
			var sUSystem = oModelView.getData().system;
			/*if (oModelView.getData().system === "LEAN") {
				sSyssid = "DLACLNT100";
			} else {
				sSyssid = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "LEAN") {

					sSyssid = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "TEMPO") {
					sSyssid = aSystemData[i].Yylow;
				}
			}
			this.getView().byId("simulate").setEnabled(false);
			this.getView().byId("save").setEnabled(false);
			var sFData = "/yminorderInputSet(IvMaterial='" + matNum + "',IvSyssid='" + sSyssid + "',IvCustomer='" + oModelView.getData().cusId +
				"',IvSalesorg='" + oModelView.getData().salesId + "',IvDisbchnl='" + oModelView.getData().Distrchn + "',IvDivision='" + oModelView
				.getData().Division + "')";
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				success: function (oData1, oResponse1) {
					this.getView().byId("simulate").setEnabled(true);
					this.getView().byId("save").setEnabled(true);
					orderModel.setProperty(sPath + "/ZPAL_QUAN", oData1.EvPalletQty);
					orderModel.setProperty(sPath + "/ZMIN_QTY", oData1.EvMinOrder);
					sap.ui.core.BusyIndicator.hide();
				}.bind(this),
				error: function (oError) {
					this.getView().byId("simulate").setEnabled(true);
					this.getView().byId("save").setEnabled(true);
					sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			});

		},

		/**
		 * Function to open the Component sale Area Dialog.
		 * @public
		 */

		onSalesRequest: function (oEvent) {
			var oView;
			this._material = oEvent.getSource();
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.SalesOffcF4Help) {
				this.SalesOffcF4Help = sap.ui.xmlfragment(this.getView().getId(),
					"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderSalesOffcF4Help",
					this);
				oView.addDependent(this.SalesOffcF4Help);
			}
			this.SalesOffcF4Help.open();
		},
		/**
		 * This event is fired on search values in Salesorg
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleSalesOffcSearch: function (oEvent) {
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
		 * This event is fired on close of Value help for Salesorg value
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onPressSalesOffcValueListClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");
			var oSalesOffId = this.getView().byId("f4hSalesOffc");
			var that = this;
			this._getCurrencyClear();
			this._onClreaTable();
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("SalesOffice").getObject();
				viewProperties.setProperty("/salesId", object.Salesorg);
				viewProperties.setProperty("/Distrchn", object.Distrchn);
				viewProperties.setProperty("/Division", object.Division);
				that.showMatrialValue(object);
				if (oSalesOffId.getValue() === "") {
					oSalesOffId.setValueState("Error");

				} else {
					oSalesOffId.setValueState("None");
				}

			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/**
		 * This event is fired when click save and simulate button we are makeing validation
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_handleValidation: function () {
			var oView = this.getView();
			var oViewModel = this.getView().getModel("jsonViewMod");
			var aInputs = [
				oView.byId("f4hCustomer"),
				oView.byId("f4hShipto"),
				oView.byId("idcpono"),
				oView.byId("idcpodate")

			];

			var bValidationError = false;

			// check that inputs are not empty
			// this does not happen during data binding as this is only triggered by changes
			jQuery.each(aInputs, function (i, oInput) {
				if (oInput.getValue()) {
					oInput.setValueState("None");
					bValidationError = true;
				} else {
					oInput.setValueState("Error");
					bValidationError = false;

				}
			});

			jQuery.each(aInputs, function (i, oInput) {
				if (oInput.getValueState() === "Error") {
					bValidationError = false;
				}
			});

			if (bValidationError === true) {
				bValidationError = this.handleAmountValid();
			}

			if (!bValidationError) {
				sap.m.MessageBox.alert("Please fill all required fields");
			}
			return bValidationError;
		},
		handleAmountValid: function () {
			var oTable = this.getView().byId("tblorder"),
				aItems = oTable.getItems(),
				bValidationError1 = false;

			jQuery.each(aItems, function (i, oItem) {
				var aCells = oItem.getCells();
				jQuery.each(aCells, function (index, oCell) {
					if (index === 0 || index === 4 || index === 5) {
						if (oCell.getValue().toString().length > 0) {
							bValidationError1 = true;
							oCell.setValueState("None");
						} else {
							oCell.setValueState("Error");
						}

					}

					if (index === 4) {
						var sVal = oCell.getValue();
						if (oCell.getValue().toString().length > 0 && sVal !== 0) {
							bValidationError1 = true;
							oCell.setValueState("None");
						} else {
							oCell.setValueState("Error");
						}

					}
				});
			});

			jQuery.each(aItems, function (i, oItem) {
				var aCells = oItem.getCells();
				jQuery.each(aCells, function (index, oCell) {
					if (index === 0 || index === 4 || index === 5) {
						if (oCell.getValueState() === "Error") {
							bValidationError1 = false;
						}
					}
				});
			});

			return bValidationError1;

		},
		/**
		 * This event is fired we are setting error
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onChangeDiscount: function (oEvent) {
			var oDisId = this.getView().byId("iddiscount");
			if (oDisId.getValue() === "") {
				oDisId.setValueState("Error");
			} else {
				oDisId.setValueState("None");
			}
		},
		/**
		 * This event is fired when you click copy button
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		copyRow: function () {
			var g = this.getView().byId("idsystem"),
				that = this,
				sSytemVal = '',
				tenderval;
			if (g.getValue() === "TEMPO") {
				sSytemVal = "T";
			} else {
				sSytemVal = "L";
			}
			var oTable = this.getView().byId("tblorder");

			if (!oTable.getSelectedItem()) {
				MessageBox.warning(
					"Select an Item Row to Copy", {
						styleClass: "sapUiSizeCompact"
					});
				return;
			}
			var TrustpaymatterSet = [];
			var aItems = oTable.getSelectedItems();
			var i = 1;
			var sSmpl;
			if (aItems.length > 0) {
				aItems.forEach(function (item) {
					if (item.getBindingContext("orderItemModel").getObject().ZFOC_SMPL) {
						sSmpl = item.getBindingContext("orderItemModel").getObject().ZFOC_SMPL;
					} else {
						sSmpl = "";
					}
					that._data.Products.push({
						"ZINTR_ORDNUM": "",
						"ZSYSTEM": g.getValue(),
						"ZINTR_ITEMNUM": i.toString(),
						"ZMAT_NUM": item.getBindingContext("orderItemModel").getObject().ZMAT_NUM,
						"ZMATRL_DESC": item.getBindingContext("orderItemModel").getObject().ZMATRL_DESC,
						"ZTRGT_QTY": item.getBindingContext("orderItemModel").getObject().ZTRGT_QTY,
						"ZTRGT_QTYUOM": item.getBindingContext("orderItemModel").getObject().ZALT_UOM,
						"ZALT_UOM": item.getBindingContext("orderItemModel").getObject().ZALT_UOM,
						"ZREQ_DLVRYDAT": item.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT,
						"ZMIN_QTY": item.getBindingContext("orderItemModel").getObject().ZMIN_QTY,
						"ZFOC_SMPL": sSmpl,
						"ZFROZEN_PERIOD": item.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD,
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": item.getBindingContext("orderItemModel").getObject().ZDISCNT,
						"UNITPC": item.getBindingContext("orderItemModel").getObject().ZALT_UOM,
						"NetQty": "",
						"ZMAX_DATE": item.getBindingContext("orderItemModel").getObject().ZMAX_DATE,
						"ZMIN_DATE": item.getBindingContext("orderItemModel").getObject().ZMIN_DATE,
						"ZGRP_DEVLPR": item.getBindingContext("orderItemModel").getObject().ZGRP_DEVLPR,
						"ZPAL_QUAN": item.getBindingContext("orderItemModel").getObject().ZPAL_QUAN,
						"ZFOC_ITMC_FLAG": "",
						"ItemCategorySug": item.getBindingContext("orderItemModel").getObject().ItemCategorySug,
						"ZSCHD_TYPE": item.getBindingContext("orderItemModel").getObject().ZSCHD_TYPE

					});
					i = i + 1;
				});
			}
			that.jModel.refresh();

		},
		/**
		 * This event is fired check customer po number already exists or not showing warning message
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleChangeCPONO: function (oEvent) {
			var oPONumberId = this.byId("idcpono");

			if (oPONumberId.getValue() === "") {
				oPONumberId.setValueState("Error");
			} else {
				oPONumberId.setValueState("None");
			}
			var viewModel = this.getView().getModel("viewProperties");
			var oModel = this.getOwnerComponent().getModel(),
				sPath = "/OrderHeaderDetails";
			sap.ui.core.BusyIndicator.show();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var that = this;
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUST_PONUM", "EQ", oPONumberId.getValue()), new Filter("ZORD_STATUS", "EQ", "ORCR")],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					if (oResp.results.length) {

						MessageBox.warning(
							"Customer PO number " + oResp.results[0].ZINTR_ORDNUM + " already exists", {
								styleClass: "sapUiSizeCompact"
							});
						return;

					} else {

					}

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 * This event is fired setting error and none for input
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		handleCustPoDate: function (oEvent) {
			var oCustPoID = this.getView().byId("idcpodate");
			if (oCustPoID.getValue() === "") {
				oCustPoID.setValueState("Error");
			} else {
				oCustPoID.setValueState("None");
			}
		},

		/**
		 * This event is fired setting error and none for input
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		handleTargetQty: function (evt) {
			var source = evt.getSource();
			if (source.getValue().length > 0) {
				source.setValueState("None");
			} else {
				source.setValueState("Error");
			}
		},

		/**
		 * This event is fired setting value of item cetagory
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onSelectFOC: function (evt) {
			var source = evt.getSource();

			var path = source.getBindingPath("selectedKey"),
				value = source.getSelectedKey(),

				sPath = source.getBindingContext("orderItemModel").sPath;
			this.getView().getModel("orderItemModel").setProperty(sPath + "/" + path, value);

		},

		/**
		 * This event is fired get date instance
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		dateFormat: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "dd-MM-yyyy",
					UTC: true
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},
		/**
		 * This event is fired removing preceding zeros
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		removePrecedingZero: function (value) {
			if (value) {
				if (isNaN(value)) {
					return value;
				} else {
					return Number(value).toString();
				}
			} else {
				return '';
			}
		},

		focSmpl: function (value) {
			if (value === "YTA1") {
				return 'Free of Charge Item';
			} else if (value === "YTS1") {
				return 'Sample FOC Item';
			} else {
				return 'Standard Order';
			}
		},

		/**
		 * This event is fired changing  new and old order we are clearing data
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onSelectOrder: function (oEvent) {
			var utpe = this.getView().byId("utpeas").getSelectedKey(); //this.getView().byId("utpeas").getSelectedButton().getText();
			var viewModel = this.getView().getModel("viewProperties");

			if (utpe === "") {
				this.getView().byId("oordrefl").setVisible(true);
				this.getView().byId("oordref").setVisible(true);
				this.getView().byId("oordref").setValue("");
				viewModel.setProperty("/pdfFile", "");
				this.getView().byId("oordref").setEnabled(false);

				viewModel.setProperty("/cusId", "");
				viewModel.setProperty("/cusName", "");
				viewModel.setProperty("/ShipToId", "");
				viewModel.setProperty("/ShipToName", "");
				viewModel.setProperty("/Discount", "");
				viewModel.setProperty("/system", "");
				viewModel.setProperty("/CustomerPOnumber", "");
				viewModel.setProperty("/ShipToName", "");
				viewModel.setProperty("/CustomerPODate", "");
				viewModel.setProperty("/salesId", "");
				viewModel.setProperty("/ShipToAddr", "");
				viewModel.setProperty("/tenderFalg", false);
				viewModel.setProperty("/ZFTRADE_DESC", "");
				//this.getView().byId("idFtrade").setValue("");
				this.clearRowItem();

			} else {
				this.getView().byId("oordrefl").setVisible(false);
				this.getView().byId("oordref").setVisible(false);
				this.getView().byId("oordref").setValue("");
				viewModel.setProperty("/ZINTR_ORDNUM", "");

				viewModel.setProperty("/cusId", "");
				viewModel.setProperty("/cusName", "");
				viewModel.setProperty("/ShipToId", "");
				viewModel.setProperty("/ShipToName", "");
				viewModel.setProperty("/Discount", "");
				viewModel.setProperty("/system", "");
				viewModel.setProperty("/CustomerPOnumber", "");
				viewModel.setProperty("/ShipToName", "");
				viewModel.setProperty("/CustomerPODate", "");
				viewModel.setProperty("/salesId", "");
				viewModel.setProperty("/ShipToAddr", "");
				viewModel.setProperty("/tenderFalg", false);
				viewModel.setProperty("/pdfFile", "");
				viewModel.setProperty("/ZFTRADE_DESC", "");

				this.clearRowItem();

			}
		},

		_PoFormatDate: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "dd-MM-yyyy",
					UTC: true
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},

		/**
		 * when we select old order internal number fatch all the data
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		handleChangeNo: function (oEvent) {

			var sOldOrderVal = this.byId("oordref").getValue();
			var viewModel = this.getView().getModel("viewProperties");

			var oModel = this.getOwnerComponent().getModel(),
				ZINTR_ORDNUM = sOldOrderVal,
				sPath = "/OrderHeaderDetails";
			sap.ui.core.BusyIndicator.show();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oFJsonModel = new sap.ui.model.json.JSONModel();
			var that = this;
			oModel.read(sPath, {
				filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM)],

				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					if (oResp.results.length) {
						oJsonModel.setData(oResp.results[0]);
						viewModel.setProperty("/ZINTR_ORDNUM", oResp.results[0].ZINTR_ORDNUM);
						viewModel.setProperty("/cusId", oResp.results[0].ZCUST_NUM);
						viewModel.setProperty("/cusName", oResp.results[0].ZCUSTOMER_NAME);
						viewModel.setProperty("/ShipToId", oResp.results[0].ZSHIP_PRTY);
						viewModel.setProperty("/ShipToName", oResp.results[0].ZSHIP_TO_PARTY_DESC);
						viewModel.setProperty("/Discount", oResp.results[0].ZDISCNT);
						viewModel.setProperty("/salesId", oResp.results[0].ZSALES_AREA);
						viewModel.setProperty("/ZFOC_SMPL", oResp.results[0].ZFOC_SMPL);
						viewModel.setProperty("/CustomerPOnumber", "");
						viewModel.setProperty("/CustomerPODate", "");

						if (oResp.results[0].ZSYSTEM === "L") {
							viewModel.setProperty("/system",
								"LEAN");
						} else {
							viewModel.setProperty("/system", "TEMPO");
						}
						viewModel.setProperty("/ZFTRADE_DESC", oResp.results[0].ZFTRADE_DESC);
						viewModel.setProperty("/ZFTRADE", oResp.results[0].ZFTRADE);
						viewModel.setProperty("/Distrchn", oResp.results[0].ZDISTR_CHNL);
						viewModel.setProperty("/Division", oResp.results[0].ZDIVISION);
						viewModel.setProperty("/ZDEL_BLOCK_ID", oResp.results[0].ZDEL_BLOCK_ID);
						that.getView().byId("idNewSelectCurr").setSelectedKey(oResp.results[0].ZHCURR);
						that.getView().byId("idNewSelectCurr").setValue(oResp.results[0].ZHCURR);
						that.getCurrency(oResp.results[0].ZCUST_NUM);

						if (oResp.results[0].ZTEDER_FLAG === "X") {
							viewModel.setProperty("/tenderFalg",
								true);
						} else {
							viewModel.setProperty("/tenderFalg", false);
						}

						that._getShipToValue(oResp.results[0], oResp.results[0].ZSHIP_PRTY);
						that._getSalesAreaValue(oResp.results[0], oResp.results[0].ZSALES_AREA);
						that._getShowFtradeValue(oResp.results[0], oResp.results[0].ZFTRADE);
						that.showDeliveryBlock(oResp.results[0]);
					} else {
						MessageBox.warning(
							"Order Number doesn't exists", {
								styleClass: "sapUiSizeCompact"
							});
						that._onClearOrder();
						return;

					}
					var oModel1 = that.getOwnerComponent().getModel(),
						ZINTR_ORDNUM1 = sOldOrderVal,
						sPath1 = "/OrderItemDetails";
					sap.ui.core.BusyIndicator.show();

					oModel1.read(sPath1, {
						filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM1)],
						success: function (oResp1) {
							sap.ui.core.BusyIndicator.hide();
							if (oResp1.results.length > 0) {
								for (var i = 0; i < oResp1.results.length; i++) {
									//	that._getMaterialValue(oResp1.results[i].ZMAT_NUM);
									that.minDate = new Date();
									that.maxDate = new Date();
									oResp1.results[i]["ItemCategorySug"] = [];
									//oResp1.results[i]["ZFROZEN_PERIOD"] = "2";
									that.maxDate.setMonth(that.maxDate.getMonth() + (parseInt(oResp1.results[i]["ZFROZEN_PERIOD"]) + 1));
									that.maxDate.setDate(1);
									//that.maxDate.setDate(that.maxDate.getDate() + (parseInt(oResp1.results[i]["ZFROZEN_PERIOD"]) * 30));

									oResp1.results[i]["ZMAX_DATE"] = that.maxDate;
								}
							}

							that._data = {
								"Products": oResp1.results
							};
							that.jModel.setData(that._data);
							that.getView().setModel(that.jModel, "orderItemModel");
							that.getItemCategory1(viewModel.getProperty("/cusId"), oResp1.results);

							that.getView().setModel(oJsonModel, "OrderData1");

							var data1 = {
								header: that.getView().getModel("OrderData1"),
								item: that.getView().getModel("OrderData12")
							};
							oFJsonModel.setData(data1);

						},
						error: function (err) {
							sap.ui.core.BusyIndicator.hide();
						}
					});

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 * This event is fired get Shipto information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getShipToValue: function (oResp, Shiptoparty) {
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerShipToPartyAssignDetails";

			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUSTMR_NUM", "EQ", oResp.ZCUST_NUM)],
				success: function (oResp1) {
					sap.ui.core.BusyIndicator.hide();

					if (oResp1.results.length === 0) {

						return;
					}
					if (oResp1.results.length) {
						for (var i = 0; i < oResp1.results.length; i++) {
							if (oResp1.results[i].ZSHIP_TO_PARTY === Shiptoparty) {
								var sCity, sPoCode;
								if (oResp1.results[i].ZCITY === "" || oResp1.results[i].ZCITY === null) {
									sCity = "";
								} else {
									sCity = oResp1.results[i].ZCITY;
								}

								if (oResp1.results[i].ZPOSTAL_CODE === null || oResp1.results[i].ZPOSTAL_CODE === null) {
									sPoCode = "";
								} else {
									sPoCode = oResp1.results[i].ZPOSTAL_CODE;
								}
								var sAddress = sCity + " " + sPoCode;

								viewProperties.setProperty("/ShipToAddr", sAddress);
							}
						}
					}

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 * This event is fired get sale area information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getSalesAreaValue: function (oResp, sSalesorg) {

			var that = this;
			var sSyssid;
			var viewProperties = this.getView().getModel("viewProperties");
			var sUSystem = oResp.ZSYSTEM;
			/*if (oResp.ZSYSTEM === "L") {
				sSyssid = "DLACLNT100";
			} else {
				sSyssid = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "L") {

					sSyssid = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "T") {

					sSyssid = aSystemData[i].Yylow;

				}

			}

			var sFData = "/ysaleAreaInputSet(IvCustomer='" + oResp.ZCUST_NUM + "',IvSyssid='" + sSyssid + "')";
			/*var sFData = "/ysalesAreacustomerInputSet(IvCustomer='" + oResp.ZCUST_NUM + "',IvSyssid='" + sSyssid +  "',IvSalesorg='" 
			+ oResp.ZSALES_AREA + "',IvDistchnl='" + oResp.ZDISTR_CHNL + "')";*/
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {

				urlParameters: {
					"$expand": "NavsalesArea"
				},
				success: function (oData1, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					if (oData1.NavsalesArea.results.length === 0) {

						return;
					}
					if (oData1.NavsalesArea.results.length) {
						for (var i = 0; i < oData1.NavsalesArea.results.length; i++) {
							if (oData1.NavsalesArea.results[i].Salesorg === sSalesorg) {
								viewProperties.setProperty("/salesId", oData1.NavsalesArea.results[i].Salesorg);
								viewProperties.setProperty("/Distrchn", oData1.NavsalesArea.results[i].Distrchn);
								viewProperties.setProperty("/Division", oData1.NavsalesArea.results[i].Division);
								that.showMatrialValue(oData1.NavsalesArea.results[i]);
							}
						}
					}

				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			});
		},

		/**
		 * This event is fired get material information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getMaterialValue: function (resp) {

			var oModel = this.getOwnerComponent().getModel();
			var orderModel = this.getView().getModel("OrderData12");
			var that = this;
			var sPath1 = "/MaterialDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath1, {
				filters: [new Filter("Z_MATRL_NUM", "EQ", resp)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					//ZFROZEN_PERIOD
					orderModel.setProperty("/ZMATRL_DESC", oResp.results[0].ZMATRL_DESC);
					orderModel.setProperty("/UNITPC", oResp.results[0].ZBASE_UNIT_MEASURE);
					orderModel.setProperty("/ZALT_UOM", oResp.results[0].ZBASE_UNIT_MEASURE);
					orderModel.setProperty("/ZMIN_ORDER_QUAN", oResp.results[0].ZMIN_ORDER_QUAN);
					orderModel.setProperty("/ZGRP_DEVLPR", oResp.results[0].ZGRP_DEVLPR);
					orderModel.setProperty("/ZFROZEN_PERIOD", oResp.results[0].ZFROZEN_PERIOD);
					that.maxDate.setMonth(that.maxDate.getMonth() + (parseInt(oResp.results[0]["ZFROZEN_PERIOD"]) + 1));
					that.maxDate.setDate(1);
					//that.maxDate.setDate(that.maxDate.getDate() + parseInt(oResp.results[0].ZFROZEN_PERIOD) * 30);
					orderModel.setProperty("/ZMAX_DATE", that.maxDate);

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		/************* FTRADE F4 SEARCH *****************************************************/
		onFtradeValueHelpRequest: function (oEvent) {
			var oView;
			var sInputValue = oEvent.getSource().getValue();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.F4HelpFtrade) {
				this.F4HelpFtrade = sap.ui.xmlfragment(oView.getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderF4HelpFtrade",
					this);
				oView.addDependent(this.F4HelpFtrade);

			}

			this.F4HelpFtrade.open();
		},
		/**
		 * This event is fired on search values in Article field 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handlefTradeSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilter = new Filter({
				filters: [
					new Filter("ZSHIP_TO_PARTY", "Contains", sValue.toUpperCase()),
					new Filter("ZNAME_1", "Contains", sValue.toUpperCase())
				],
				and: false
			});

			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([aFilter]);
		},

		/**
		 * This event is fired on close of Value help for fTrade
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onPressfTradeValueListClose: function (oEvent) {

			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");
			var oShiptoId = this.getView().byId("f4hFtrade");

			if (aContexts && aContexts.length) {

				var object = oSelectedItem.getBindingContext("fTradeJson").getObject();
				viewProperties.setProperty("/ZFTRADE", object.ZFTRADE);
				viewProperties.setProperty("/ZFTRADE_DESC", object.ZFTRADE_DESC);
				if (oShiptoId.getValue() === "") {
					oShiptoId.setValueState("Error");
				} else {
					oShiptoId.setValueState("None");
				}
			}

		},

		/**
		 * This event is fired get f trade value based on customer
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		showFtradeValue: function (oResp1) {

			var that = this;
			var oSalesOffcId = this.getView().byId("f4hFtrade");
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_shiptoParty = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerFTradeAssignDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/cusId"))],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					if (oResp.results.length === 0) {
						oSalesOffcId.setValue("");
						oSalesOffcId.setEnabled(false);
						oSalesOffcId.setShowValueHelp(false);
						return;
					}
					if (oResp.results.length > 1) {
						oSalesOffcId.setEnabled(true);
						oSalesOffcId.setShowValueHelp(true);

						oModel_shiptoParty.setData(oResp.results);
						that.getView().setModel(oModel_shiptoParty, "fTradeJson");
					} else {
						oSalesOffcId.setShowValueHelp(false);
						oSalesOffcId.setEnabled(false);

						viewProperties.setProperty("/ZFTRADE", oResp.results[0].ZFTRADE);
						viewProperties.setProperty("/ZFTRADE_DESC", oResp.results[0].ZFTRADE_DESC);

					}
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 * This event is fired on close of Value help for fTrade
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getShowFtradeValue: function (oResp1, sTradeval) {

			var that = this;

			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_ftrade = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerFTradeAssignDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/cusId"))],
				success: function (oResp1) {
					sap.ui.core.BusyIndicator.hide();

					if (oResp1.results.length === 0) {

						return;
					}
					if (oResp1.results.length) {

						for (var i = 0; i < oResp1.results.length; i++) {
							if (oResp1.results[i].ZFTRADE === sTradeval) {
								viewProperties.setProperty("/ZFTRADE", oResp1.results[0].ZFTRADE);
								viewProperties.setProperty("/ZFTRADE_DESC", oResp1.results[0].ZFTRADE_DESC);
							}
						}

						oModel_ftrade.setData(oResp1.results);
						that.getView().setModel(oModel_ftrade, "fTradeJson");
					}
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onAddCM1Press: function (ZINTR_ORDNUM) {
			var oDataObject;

			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/OrderHeaderDetails";
			sap.ui.core.BusyIndicator.show();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oFJsonModel = new sap.ui.model.json.JSONModel();
			var that = this;
			var res = {};
			oModel.read(sPath, {
				filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					oJsonModel.setData(oResp.results[0]);
					res = oResp.results;

					var oModel1 = that.getOwnerComponent().getModel(),

						sPath1 = "/OrderItemDetails";
					sap.ui.core.BusyIndicator.show();

					that._getShipToValue(oResp.results[0], oResp.results[0].ZSHIP_PRTY);

					var oJsonModel1 = new sap.ui.model.json.JSONModel();

					oModel1.read(sPath1, {
						filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM)],
						success: function (oResp1) {
							sap.ui.core.BusyIndicator.hide();

							oJsonModel1.setData(oResp1.results);
							that.getView().setModel(oJsonModel1, "OrderData12");

							that.getView().setModel(oJsonModel, "OrderData1");

							var data1 = {
								header: that.getView().getModel("OrderData1"),
								item: that.getView().getModel("OrderData12")
							};
							oFJsonModel.setData(data1);

							if (!that._oCM1iDialog) {

								that._oCM1iDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.orderApprove", that);
								that.getView().addDependent(that._oCM1iDialog);

								that._oCM1iDialog.setModel(oJsonModel, "OrderData1");
								that._oCM1iDialog.setModel(oFJsonModel, "OrderDataF");
							}
							that._oCM1iDialog.open();

						},
						error: function (err) {
							sap.ui.core.BusyIndicator.hide();
						}
					});

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onAddCM1Close: function () {
			this._oCM1iDialog.close();
			this._oCM1iDialog.getModel("OrderData1").refresh();
			this._oCM1iDialog.getModel("OrderDataF").refresh();
			if (this._oCM1iDialog) {
				this._oCM1iDialog = this._oCM1iDialog.destroy();
			}
		},

		/**
		 * This function called when we Tender flag
		 * The value will setting model
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onSelectTenderFlag: function (oEvent) {
			var viewProperties = this.getView().getModel("viewProperties");

			if (oEvent.getSource().getState() === true) {
				viewProperties.setProperty("/tenderFalg", true);
			} else {
				viewProperties.setProperty("/tenderFalg", false);
			}

		},
		/**
		 * This function called when we change currency 
		 * The value will setting model
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onCurrencyChange: function (oEvent) {
			var viewProperties = this.getView().getModel("viewProperties");
			this._onClreaTable();
			viewProperties.setProperty("/selectCurr", oEvent.getSource().getSelectedKey());
			this.showMatrialValue(oEvent.getSource().getSelectedKey());

		},
		/**
		 * This function called we can clear table row 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		_onClreaTable: function () {
			this._data = {
				Products: [

					{
						"ZINTR_ORDNUM": "",
						"ZSYSTEM": "",
						"ZINTR_ITEMNUM": "",
						"ZMIN_ORDER_QUAN": "",
						"ZMAT_NUM": "",
						"ZTRGT_QTY": "",
						"ZTRGT_QTYUOM": "",
						"ZALT_UOM": "",
						"ZREQ_DLVRYDAT": "",
						"ZFOC_SMPL": "",
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": "",
						"currency": "",
						"UNITPC": "",
						"matrialDesc": "",
						"ZMATRL_DESC": "",
						"ZMAX_DATE": null,
						"ZMIN_DATE": null,
						"NetQty": "",
						"ZMIN_QTY": "",
						"ZCOST": "",
						"ZGRP_DEVLPR": "",
						"ZFROZEN_PERIOD": "",
						//ZFROZEN_PERIOD
						"selectCurr": "",
						"ZPAL_QUAN": "",
						"ZFOC_ITMC_FLAG": "",
						"ItemCategorySug": []

					}
				]
			};

			this.jModel = new sap.ui.model.json.JSONModel();
			this.jModel.setData(this._data);

			this.getView().setModel(this.jModel, "orderItemModel");
		},

		/**
		 * This event is fired getting currency based on customer id
		 * @param P_CUST_NUM
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		getCurrency: function (customerId) {

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CurrencyParam(P_CUST_NUM='" + customerId + "')/Results";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {

				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					this.getView().setModel(oJsonModel, "currencyJson");
					if (oResp.results.length > 0) {
						this.getView().byId("idNewSelectCurr").setEnabled(true);
					} else {
						this.getView().byId("idNewSelectCurr").setEnabled(false);
					}

				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},
		/**
		 * This event is fired clearing and setting value
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getCurrencyClear: function () {
			var viewModel = this.getView().getModel("viewProperties");
			viewModel.setProperty("/selectCurr", "");

			this.getView().byId("idNewSelectCurr").setValue("");

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
			this.oAttachData = oEvent.getSource();
			if (!this.oAttachment) {
				this.oAttachment = sap.ui.xmlfragment("com.merckgroup.Brma_PL2P_RFileCret_UI5.fragments.Attachment", this);
				this.getView().addDependent(this.oAttachment);
			}
			var oData = this.oAttachData.getBindingContext().getObject(),
				sDocId, sFileName, sAttDocId, oItem,
				sComtype = this.oAttachData.getCustomData()[0].getKey(),
				sComSpec = this.oAttachData.getCustomData()[0].getValue(),
				oRFileModel = this.getView().getModel("RFileModel"),
				oLinks = oRFileModel.getProperty("/Links"),
				aTitle = oLinks.filter(function (t) {
					return t.Type == sComtype;
				}),
				sSpecTitle = this._oResource.getText("SPEC_DOCUMENT_DIALOG_TITLE", [aTitle[0].Desp, oData.NAME]);
			oRFileModel.setProperty("/SpecTitle", sSpecTitle);
			sAttDocId = oData[sComSpec];
			if (sAttDocId) {
				sDocId = sAttDocId.split("_BRM_")[0];
				sFileName = sAttDocId.split("_BRM_")[1];
			} else {
				oData[sComSpec] = "";
			}
			if (sDocId && sFileName) {
				oItem = {
					"Country": oData.COUNTRY,
					"ComponentType": sComtype,
					"documentId": sDocId,
					"fileName": sFileName,
					"url": "/BRMA_CMIS/brmacmis/download?docId=" + sDocId,
					"attributes": [{
						"title": this._oResource.getText("UPLOADED_BY"),
						"text": oData.CREATED_BY
					}, {
						"title": this._oResource.getText("UPLOADED_ON"),
						"text": oData.CREATED_ON
					}]
				};
				oRFileModel.setProperty("/attachments", [oItem]);
			} else {
				oRFileModel.setProperty("/attachments", []);
			}
			this.oAttachment.open();
			oRFileModel.setProperty("/AttachmentTitle", this.getAttachmentTitleText());
		},
		/**
		 * Function to set the Attachment Header Title with Total Counts.
		 * @public
		 */
		getAttachmentTitleText: function () {
			var oRFileModel = this.getView().getModel("RFileModel"),
				aItems = oRFileModel.getProperty("/attachments"),
				sUpload = this._oResource.getText("SPEC_DOCUMENT_UPLOAD_TITLE", [aItems.length]);
			if (aItems.length > 0) {
				oRFileModel.setProperty("/Local/showUpload", false);
			} else {
				oRFileModel.setProperty("/Local/showUpload", true);
			}
			return sUpload;
		},
		/**
		 * Event triggered on the completion of file upload
		 * call the repository service attach the file.
		 * @public
		 */
		onAttachmentChange: function (e) {

			var date = new Date();

			var oFile = e.getParameter("files")[0],
				that = this,

				fileName = date.getTime() + "T_S" + e.getParameter("newValue");
			var sFileName = e.getParameter("newValue");

			var viewProperties = this.getView().getModel("viewProperties");
			var oUploadAttachment = RepoService.uploadFile(oFile, fileName);
			sap.ui.core.BusyIndicator.show();
			oUploadAttachment.then(function (result) {
				sap.ui.core.BusyIndicator.hide();
				viewProperties.setProperty("/pdfFile", sFileName);
				var docId = result.docId + "_MOET_" + result.docName;
				viewProperties.setProperty("/DocID", docId);
			}).catch(function (oError) {
				sap.ui.core.BusyIndicator.hide();
				that._showErrorMessage(oError.responseText.replace("Errorr", "Error"));
			});
		},

		/**
		 * Function on the click of the delete button in Attachment Dialog.
		 * @param {object} [oEvent] parameter used to get Document Id to delete attachment.
		 * @public
		 */
		onFileDeleted: function (oEvent) {
			this._deleteItemById(oEvent.getParameter("documentId"));
		},

		_deleteItemById: function (oEvent) {
			var t = this.getView().getModel("RFileModel"),
				o = t.getProperty("/attachments"),
				that = this;
			return RepoService.deleteFile(o[0].fileName, oEvent).then(function (i) {
				var n = that.oAttachData.getBindingContext(),
					a = n.getPath(),
					l = that.oAttachData.getCustomData()[0].getValue();
				that.oAttachData.getModel().setProperty(a + "/" + l, "");
				jQuery.each(o, function (val) {
					if (o[val] && o[val].documentId === oEvent) {
						o.splice(val, 1);
					}
				});
				t.setProperty("/attachments", o);
				t.setProperty("/AttachmentTitle", that.getAttachmentTitleText());
			});
		},

		/***** F4 Old Order Ref ********/

		onInterOrderHelpRequest: function (oEvent) {
			var oView;
			if (!oView) {
				oView = this.getView();
			}
			if (!this.InterOrderDilg) {
				this.InterOrderDilg = sap.ui.xmlfragment(oView.getId(),
					"com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderF4InternalNumber", this);
				oView.addDependent(this.InterOrderDilg);

			}

			this.InterOrderDilg.open();
		},
		/**
		 * This event is fired on search values in Article field 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleInternalOrderNumberSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilter = new Filter({
				filters: [
					new Filter("ZINTR_ORDNUM", "EQ", sValue.toUpperCase()),
					new Filter("ZCUST_PONUM", "Contains", sValue.toUpperCase())
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
		handleInternalOrderNumber: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");

			var that = this;
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("InternalOrderJson").getObject();
				viewProperties.setProperty("/ZINTR_ORDNUM", object.ZINTR_ORDNUM);
				this.handleChangeNo();
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		getInternalOrderNumber: function (customerId) {

			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/OrderHeaderDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				urlParameters: {
					"$select": "ZINTR_ORDNUM,ZCUST_PONUM"
				},
				filters: [new Filter("ZCUST_NUM", "EQ", customerId)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					this.getView().setModel(oJsonModel, "InternalOrderJson");

				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onClearDoc: function () {
			var viewProperties = this.getView().getModel("viewProperties");
			viewProperties.setProperty("/pdfFile", "");
			viewProperties.setProperty("/DocID", "");

		}

	});
});