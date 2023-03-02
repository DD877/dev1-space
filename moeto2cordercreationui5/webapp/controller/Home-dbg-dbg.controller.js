sap.ui.define([
	'./BaseController',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	"sap/ui/model/Filter",
	'com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter',
	"sap/m/MessageBox",
	'sap/viz/ui5/controls/VizFrame'
], function (BaseController, JSONModel, Device, Filter, formatter, MessageBox, VizFrame) {
	"use strict";
	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.Home", {
		formatter: formatter,

		onInit: function () {

			this.getOwnerComponent().countFlag = false;
			this._getSystem();

			var homevisbleModel = new JSONModel({
				"visible": true

			});
			this.getView().setModel(homevisbleModel, "jsonHomeVisible");

			this.getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched, this);
			this.getPropertySet();
			this.getItemCategoryData();
			this.getApproveOrderPropertySet();
			this.userLogin();
			var oViewModel = new JSONModel({
				isPhone: Device.system.phone
			});
			this.setModel(oViewModel, "view");
			var countModel = new JSONModel({
				"Draft": "",
				"Approve": "",
				"Confirm": ""

			});
			this.getView().setModel(countModel, "jsonCount");

			Device.media.attachHandler(function (oDevice) {
				this.getModel("view").setProperty("/isPhone", oDevice.name === "Phone");
			}.bind(this));

			var oModel = this.getOwnerComponent().getModel();
			oModel.metadataLoaded().then(function () {
				this.userLoginHome();

			}.bind(this));

		},

		userLoginHome: function () {

			var that = this;

			var oModel = this.getOwnerComponent().getModel(),
				sPath1 = "/SessionUser";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath1, {
				success: function (oResp) {

					sap.ui.core.BusyIndicator.hide();
					var oJsonHomeVisible = that.getView().getModel("jsonHomeVisible");

					if (oResp.results[0].ZUSR_ROLE === "") {
						oJsonHomeVisible.setProperty("/visible", false); //{jsonVisible>/visible}
					}

					that.getOwnerComponent().sUserId = oResp.results[0].ZUSR_ID;
					that.getOwnerComponent().sUserRole = oResp.results[0].ZUSR_ROLE;
					that.GetValue();

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		_onRouteMatched: function (oEvent) {
			
			/*var oSmartTable = this.getView().byId("smartTableHome");
			var oViewProperites = this.getView().getModel("viewProperties");
			var sUserId = oViewProperites.getData().LoginID;
			var sUserROle = this.getOwnerComponent().sUserRole;
			var path1;

			if (sUserROle === "RSNO") {
				path1 = "/SNOOrders";
				oSmartTable.setTableBindingPath(path1);
			}
			oSmartTable.rebindTable();*/

			if (this.getOwnerComponent().countFlag === true) {
				this.GetValue();
			}
			this.getVisiblePlaceOrder();
			//setTimeout(this.DountChartdisplay(), 100);
			//this.DountChartdisplay();
			var that = this;
			setInterval(function () {
				that.userLogin();
			}, 300000);

		},

		onBeforeRebindTable: function (oSource) {
			var oBinding = oSource.getParameter("bindingParams");
			
			var oSmartTable = this.getView().byId("smartTableHome");
			var oViewProperites = this.getView().getModel("viewProperties");
			var sUserId = oViewProperites.getData().LoginID;
			var sUserROle = this.getOwnerComponent().sUserRole;
			var path1;

			if (sUserROle === "RSNO") {
				path1 = "/SNOOrders";
				oSmartTable.setTableBindingPath(path1);
			}

			/*oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'DRFT'));
			oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'SNOR'));*/
			if (this.getOwnerComponent().sUserRole === "CUST") {
				oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId));
				oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'DRFT'));
				oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'SNOR'));
			}
			
			if (this.getOwnerComponent().sUserRole === "RSNO") {
				oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'DRFT',true));
				oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'SNOR',true));
				oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'SNOA',true));
				oBinding.filters.push(new Filter("ZORD_STATUS", "EQ", 'ORCR',true));
				//oBinding.filters.push(new Filter("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId,true));
				//oBinding.filters.push(new Filter("ZCHANGED_BY", "EQ", this.getOwnerComponent().sUserId,false));
			}
			
			if (!oBinding.sorter.length) {
				oBinding.sorter.push(new sap.ui.model.Sorter("ZCHANGED_ON", true));
			}

		},

		/**
		 *  This event is fired get schedule line information
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		soLineShow: function (oEvent) {

			var oData = this.getView().getModel("OrderData1").getData(); //oEvent.getSource()._getPropertiesToPropagate().oModels.OrderData1.getData();

			var ssoLine = this._oViewProperties = new JSONModel();
			ssoLine.setData(oData);

			//var oModel = oEvent.getSource().getBindingContext("OrderData12").getObject() || oEvent.getSource().getBindingContext("salesorderData").getObject();
			var oModel = oEvent.getSource().getBindingContext("OrderData12") ? oEvent.getSource().getBindingContext("OrderData12").getObject() :
				oEvent.getSource().getBindingContext("salesorderData").getObject();

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
				"PC" + "',Sysid='" + sSidd + "',ReqDate=" + kl + ",ReqQty=" + parseInt(oModel.ZTRGT_QTY) + ")";
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

		soLineClose: function () {
			this._oCSSOLADialog.close();
			if (this._oCSSOLADialog) {
				this._oCSSOLADialog = this._oCSSOLADialog.destroy();
			}
		},

		GetValue: function () {
			var that = this;

			that.oModel = this.getOwnerComponent().getModel();
			var sUserId = this.getOwnerComponent().sUserId;
			var sUserRole = this.getOwnerComponent().sUserRole;
			var oJsonCount = this.getView().getModel("jsonCount");
			//var sPath = "/OrderStatusCount";
			//    var sPath = "/TechPlatzSet?$filter=ZUSR_ID eq  '" + sValue + "'and ZORD_STATUS eq  '" + sStatus + "'&$inlinecount=allpage
			var sPath = "/OrderStatusCountParam(P_USR_ID='" + sUserId + "',P_USER_ROLE='" + sUserRole + "')/Results";
			sap.ui.core.BusyIndicator.show();
			that.oModel.read(sPath, {
				//filters: [new Filter("ZUSR_ID", "EQ", sUserId)],

				success: function (oResp) {

					sap.ui.core.BusyIndicator.hide();
					that.getOwnerComponent().countFlag = true;
					var sDraft = oResp.results[0].DRFT + oResp.results[0].SNOR;
					oJsonCount.setProperty("/Draft", sDraft);
					oJsonCount.setProperty("/Approve", oResp.results[0].SNOA);
					oJsonCount.setProperty("/Confirm", oResp.results[0].ORCR);
					that.DountChartdisplay();
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		DountChartdisplay: function () {
			//this.GetValue();
			this.oVizFrame = new VizFrame({
				id: "idPostEventVizFrame",
				vizType: 'donut',
				width: '100%',
				height: '350px',

			});
			var aCounts = this.getView().getModel("jsonCount");
			var oJsonaPostOnEvent1 = new JSONModel();
			oJsonaPostOnEvent1.setData([{
				"events": "Open Orders",
				"tot_events": aCounts.getData().Draft
			}, {
				"events": "Approval Pending Orders",
				"tot_events": aCounts.getData().Approve
			}, {
				"events": "Confirmed Orders",
				"tot_events": aCounts.getData().Confirm
			}]);
			//debugger;
			if (oJsonaPostOnEvent1.getData()[0].tot_events === 0 && oJsonaPostOnEvent1.getData()[1].tot_events === 0 && oJsonaPostOnEvent1.getData()[
					2].tot_events === 0) {
				oJsonaPostOnEvent1.getData()[0].tot_events = 1;
			}
			//    this.getView().setModel(oJsonaPostOnEvent1, "oJsonaPostOnEvent1");
			this.oVizFrame.setModel(oJsonaPostOnEvent1, "oJsonaPostOnEvent1");

			this.getVisiblePlaceOrder();
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Color',
					value: "{oJsonaPostOnEvent1>events}"
				}],

				measures: [{
					name: 'Events',
					value: '{oJsonaPostOnEvent1>tot_events}'
				}],

				data: {
					path: "oJsonaPostOnEvent1>/"
				}
			});
			this.oVizFrame.setDataset(oDataset);

			this.oVizFrame.setVizProperties({
				title: {
					text: 'Sales Order Status',
					layout: {
						maxHeight: 0.05,
						height: 0.05
					},
					visible: 'false',
					style: {
						fontSize: 16
					}
				},
				valueAxis: {
					title: {
						visible: 'true'
					}
				},
				general: {
					groupData: 'true',
					layout: {
						isFixedPadding: 'true',
						padding: 1
					}
				},
				categoryAxis: {
					title: {
						visible: 'true'
					}
				},
				plotArea: {
					radius: 0.3,
					dataPointSize: {
						min: 10,
						max: 10
					},
					dataLabel: {
						visible: 'true',
						hideWhenOverlap: 'false',
						distance: '-1'
					},
					colorPalette: ['#FFC832', '#A5CD50', '#E61E50', '#EB3C96'],
					drawingEffect: 'glossy'
				},
				legendGroup: {
					layout: {
						position: 'right',
						alignment: 'center',
						width: '0.35'
					}
				}
			});

			var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "size",
					'type': "Measure",
					'values': ["Events"]
				}),
				feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "color",
					'type': "Dimension",
					'values': ["Color"]
				});
			this.oVizFrame.addFeed(feedSize);
			this.oVizFrame.addFeed(feedColor);
			this.getView().byId("vizFrameDonut").addItem(this.oVizFrame);
			this.oVizFrame.getModel("oJsonaPostOnEvent1").refresh();
		},

		pressAppr: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			if (this.getOwnerComponent().sUserRole === "CUST") {
				return;
			} else {
				oRouter.navTo("ApproveOrders");
			}
			//	oRouter.navTo("ApproveOrders");
		},
		pressTran: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("ProcessOrders");
		},

		pressTrack: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("OrderReport");
			/*if (this.getOwnerComponent().sUserRole === "CUST") {
				return;
			} else {
				
			}*/

		},

		press: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Orders");
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

		onPressApproveOrder: function (oEvent) {

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

		onPressConfirmHome: function (oEvent) {

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
	});
});