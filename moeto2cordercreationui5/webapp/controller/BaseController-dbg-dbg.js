sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataUtils",
	"sap/base/security/encodeURL",
	"sap/base/assert",
	"sap/ui/model/FilterProcessor",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/CalendarType",
	"com/merckgroup/Moet_O2C_OrderCreation_UI5/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",

	"../services/RepoService"
], function (Controller, UIComponent, JSONModel, ODataUtils, encodeURL, assert,
	FilterProcessor, DateFormat, CalendarType, formatter, Filter, Sorter, MessageBox, RepoService
) {
	"use strict";

	return Controller.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.BaseController", {
		custFormatter: formatter,
		getPropertySet: function () {
			var UIStateModel = new JSONModel();
			var UIStateData = {
				visible: true
			};
			UIStateModel.setData(UIStateData);
			this.getView().setModel(UIStateModel, "UIState");
			this._oViewProperties = new JSONModel({
				"ZAPPROVAL_STATUS": "",
				"ZAPPROVAL_STATUS_1": "",
				"ZCHANGED_BY": "",
				"ZCHANGED_ON": null,
				"ZCOMMENTS": "",
				"ZCREATED_BY": "",
				"ZCREATED_ON": "",
				"ZCUSTOMER_NAME": "",
				"ZCUST_NUM": "",
				"ZCUST_PODAT": null,
				"ZCUST_PONUM": "",
				"ZDATE": "",
				"ZDISCNT": "",
				"ZDOC_ID": "",
				"ZINTR_ORDNUM": "",
				"ZORDER_STATUS_TEXT": "",
				"ZORD_NUM": "",
				"ZORD_REF": "",
				"ZORD_STATUS": "",
				"ZPO_TYP": "",
				"ZSHIP_PRTY": "",
				"ZSHIP_TO_PARTY_DESC": "",
				"ZSYSTEM": "",
				"ZTEDER_FLAG": false,
				"ZREQ_DELV_DAT": null,
				"ZSALES_AREA": "",
				"LoginID": "",
				"salesId": "",
				"Distrchn": "",
				"Division": "",
				"ShipToAddr": "",
				"herderCurr": "",
				"HDRNETVAL": "",
				"ZTOTAL_AMT": "",
				"ZFTRADE": "",
				"ZFTRADE_DESC": "",
				ZDELIVERY_BLOCK_DESC: "",
				ZDEL_BLOCK_ID: "",
				"ZHCURR": "",
				"sUserRole": true
			});
			this.getView().setModel(this._oViewProperties, "viewProperties");

			this.minDate = new Date();
			this.maxDate = new Date();

			this._data = {
				Products: [

					{
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
						"UNITPC": "",
						"matrialDesc": "",
						"ZMATRL_DESC": "",
						"ZMIN_ORDER_QUAN": "",
						"NetQty": "",
						"currency": "",
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
			this.jModel.setData(this._data, "OrderData12");
		},
		getApproveOrderPropertySet: function () {
			this._oViewProperties1 = new JSONModel({
				username: "",
				emailId: "",
				userid: "",
				LoginID: "",
				cusId: "",
				cusName: "",
				salesId: "",
				Distrchn: "",
				Division: "",
				ShipToId: "",
				ShipToName: "",
				ShipToAddr: "",
				Discount: "",
				IVHDRNETVAL: "",
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
				ZHCURR: "",
				comments: "",
				idlead: false,
				idmin: false,
				idchk: false,
				iddisc: false,
				idCommentsinput: "",
				ZDOC_ID: "",
				FileName: ""
			});
			this.getView().setModel(this._oViewProperties1, "viewProperties1");
		},
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		onSettingsPress: function () {

			if (!this._oSDialog) {
				//this._oViewProperties.setProperty("/busy", false);
				this._oSDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.settings", this);
				this.getView().addDependent(this._oSDialog);
			}
			this._oSDialog.open();
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		handlePressOpenNewOrderPage: function () {
			this.getRouter().navTo("NewOrder");
		},

		/**
		 * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {sap.ui.core.model.ResourceModel} oResourceModel The resource model
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
		getBundleTextByModel: function (sI18nKey, oResourceModel, aPlaceholderValues) {
			return oResourceModel.getResourceBundle().then(function (oBundle) {
				return oBundle.getText(sI18nKey, aPlaceholderValues);
			});
		},

		getItemCategoryData: function (callBack) {

			var oModel = this.getOwnerComponent().getModel(),
				sPath = "/ItemCategory";
			oModel.read(sPath, {
				success: function (oResp) {
					this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(oResp.results), "ItemCategoryData");
					if (callBack) {
						callBack();
					}
				}.bind(this),
				error: function (err) {}
			});

		},

		ItemCategoryConversion: function (value) {
			//	var that = this;
			var oModel = this.getOwnerComponent().getModel("ItemCategoryData");
			if (oModel) {
				var data = oModel.getData();
				for (var i = 0; i < data.length; i++) {
					if (data[i].ZITM_CATEGORY === value) {
						return data[i].ZITM_CATEGORY_DESC;
					}

				}
			}
			return "";
		},

		getVisiblePlaceOrder: function () {
			var newJson = new JSONModel();

			var a = {
				"placeVis": this.getView().getViewName() === "com.merckgroup.Moet_O2C_OrderCreation_UI5.view.Home" ? false : true
			};
			newJson.setData(a);
			this.getOwnerComponent().setModel(newJson, "VisiableJson");
			this.getOwnerComponent().getModel("VisiableJson").refresh();

		},

		_loadODataUtils: function () {
			var oDateTimeFormat,
				oDateTimeFormatMs,
				oDateTimeOffsetFormat,
				rDecimal = /^([-+]?)0*(\d+)(\.\d+|)$/,
				oTimeFormat,
				rTrailingDecimal = /\.$/,
				rTrailingZeroes = /0+$/;

			function setDateTimeFormatter() {
				// Lazy creation of format objects
				if (!oDateTimeFormat) {
					oDateTimeFormat = DateFormat.getDateInstance({
						pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss''",
						calendarType: CalendarType.Gregorian
					});
					oDateTimeFormatMs = DateFormat.getDateInstance({
						pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss.SSS''",
						calendarType: CalendarType.Gregorian
					});
					oDateTimeOffsetFormat = DateFormat.getDateInstance({
						pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss'Z'''",
						calendarType: CalendarType.Gregorian
					});
					oTimeFormat = DateFormat.getTimeInstance({
						pattern: "'time''PT'HH'H'mm'M'ss'S'''",
						calendarType: CalendarType.Gregorian
					});
				}
			};
			ODataUtils._createFilterSegment = function (sPath, oMetadata, oEntityType, sOperator, oValue1, oValue2, bCaseSensitive) {
				var oPropertyMetadata, sType;
				if (bCaseSensitive === undefined) {
					bCaseSensitive = true;
				}
				if (oEntityType) {
					oPropertyMetadata = oMetadata._getPropertyMetadata(oEntityType, sPath);
					sType = oPropertyMetadata && oPropertyMetadata.type;
					assert(oPropertyMetadata, "PropertyType for property " + sPath + " of EntityType " + oEntityType.name + " not found!");
				}

				if (sType) {
					oValue1 = this.formatValue(oValue1, sType, bCaseSensitive);
					oValue2 = (oValue2 !== null) ? this.formatValue(oValue2, sType, bCaseSensitive) : null;
				} else {
					assert(null, "Type for filter property could not be found in metadata!");
				}

				if (oValue1) {
					oValue1 = encodeURL(String(oValue1));
				}
				if (oValue2) {
					oValue2 = encodeURL(String(oValue2));
				}
				//KISHor Changed
				if (bCaseSensitive && sType === "Edm.String") {
					sPath = "toupper(" + sPath + ")";
				}

				// TODO embed 2nd value
				switch (sOperator) {
				case "EQ":
					if (sPath === "toupper(ZCURR)") {
						return sPath + "%20" + sOperator.toLowerCase() + "%20" + oValue1;
					}else if (sPath === "ZINTR_ORDNUM") {
						return "(" + sPath + "%20eq%20" + oValue1 + ")";
						//https://webidetesting2759582-aa4d355e1.dispatcher.hana.ondemand.com/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/OrderHeaderDetails?$filter=ZINTR_ORDNUM%20eq%20345
					} else {
						return "substringof(toupper(" + oValue1 + ")," + sPath + ")";
					}
					//return "substringof(toupper(" + oValue1 + ")," + sPath + ")";
					//return sPath + "%20" + sOperator.toLowerCase() + "%20" + oValue1;
				case "NE":
				case "GT":
				case "GE":
				case "LT":
				case "LE":
					return "(" + sPath + ")%20" + sOperator.toLowerCase() + "%20" + oValue1;
				case "BT":
					return "(" + sPath + "%20ge%20" + oValue1 + "%20and%20" + sPath + "%20le%20" + oValue2 + ")";
				case "NB":
					return "not%20(" + sPath + "%20ge%20" + oValue1 + "%20and%20" + sPath + "%20le%20" + oValue2 + ")";
				case "Contains":
					if (sPath === "ZINTR_ORDNUM") {
						return "(" + sPath + "%20eq%20" + oValue1 + ")";
					}else{
						return "substringof(toupper(" + oValue1 + ")," + sPath + ")";
					}
				case "NotContains":
					return "not%20substringof(" + oValue1 + "," + sPath + ")";
				case "StartsWith":
					return "startswith(" + sPath + ",toupper(" + oValue1 + "))";
				case "NotStartsWith":
					return "not%20startswith(" + sPath + "," + oValue1 + ")";
				case "EndsWith":
					return "endswith(" + sPath + "," + oValue1 + ")";
				case "NotEndsWith":
					return "not%20endswith(" + sPath + "," + oValue1 + ")";
				default:
					Log.error("ODataUtils :: Unknown filter operator " + sOperator);
					return "true";
				}
			};
			ODataUtils.formatValue = function (vValue, sType, bCaseSensitive) {
				var oDate, sValue;

				if (bCaseSensitive === undefined) {
					bCaseSensitive = true;
				}

				// null values should return the null literal
				if (vValue === null || vValue === undefined) {
					return "null";
				}
				setDateTimeFormatter();
				// Format according to the given type
				switch (sType) {
				case "Edm.String":
					// quote
					vValue = bCaseSensitive ? vValue : vValue.toUpperCase();
					sValue = "'" + String(vValue).replace(/'/g, "''") + "'";
					break;
				case "Edm.Time":
					if (typeof vValue === "object") {
						sValue = oTimeFormat.format(new Date(vValue.ms), true);
					} else {
						sValue = "time'" + vValue + "'";
					}
					break;
				case "Edm.DateTime":
					oDate = vValue instanceof Date ? vValue : new Date(vValue);
					if (oDate.getMilliseconds() > 0) {
						sValue = oDateTimeFormatMs.format(oDate, true);
					} else {
						sValue = oDateTimeFormat.format(oDate, true);
					}
					break;
				case "Edm.DateTimeOffset":
					oDate = vValue instanceof Date ? vValue : new Date(vValue);
					sValue = oDateTimeOffsetFormat.format(oDate, true);
					break;
				case "Edm.Guid":
					sValue = "guid'" + vValue + "'";
					break;
				case "Edm.Decimal":
					sValue = vValue + "m";
					break;
				case "Edm.Int64":
					sValue = vValue + "l";
					break;
				case "Edm.Double":
					sValue = vValue + "d";
					break;
				case "Edm.Float":
				case "Edm.Single":
					sValue = vValue + "f";
					break;
				case "Edm.Binary":
					sValue = "binary'" + vValue + "'";
					break;
				default:
					sValue = String(vValue);
					break;
				}
				return sValue;
			};
		},

		/* orders Controllers start*/
		getEditOrderData: function (oDataObject) {
			var viewModel = this.getView().getModel("viewProperties");

			var oModel = this.getOwnerComponent().getModel(),
				ZINTR_ORDNUM = oDataObject.ZINTR_ORDNUM,
				sPath = "/OrderHeaderDetails";
			sap.ui.core.BusyIndicator.show();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oFJsonModel = new sap.ui.model.json.JSONModel();
			var that = this;
			oModel.read(sPath, {
				filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM)],

				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					oJsonModel.setData(oResp.results[0]);
					viewModel.setProperty("/ZCREATED_BY", oResp.results[0].ZCREATED_BY);
					viewModel.setProperty("/ZINTR_ORDNUM", oResp.results[0].ZINTR_ORDNUM);
					viewModel.setProperty("/ZCUST_NUM", oResp.results[0].ZCUST_NUM);
					viewModel.setProperty("/ZCUSTOMER_NAME", oResp.results[0].ZCUSTOMER_NAME);
					viewModel.setProperty("/ZSHIP_PRTY", oResp.results[0].ZSHIP_PRTY);
					viewModel.setProperty("/ZDISCNT", oResp.results[0].ZDISCNT);
					viewModel.setProperty("/ZSYSTEM", oResp.results[0].ZSYSTEM);
					viewModel.setProperty("/ZCUST_PONUM", oResp.results[0].ZCUST_PONUM);
					viewModel.setProperty("/ZSHIP_TO_PARTY_DESC", oResp.results[0].ZSHIP_TO_PARTY_DESC);

					viewModel.setProperty("/ZCUST_PODAT", oResp.results[0].ZCUST_PODAT);
					viewModel.setProperty("/ZTEDER_FLAG", oResp.results[0].ZTEDER_FLAG);
					viewModel.setProperty("/ZSALES_AREA", oResp.results[0].ZSALES_AREA);
					viewModel.setProperty("/ZFTRADE", oResp.results[0].ZFTRADE);
					viewModel.setProperty("/ZFTRADE_DESC", oResp.results[0].ZFTRADE_DESC);
					viewModel.setProperty("/Distrchn", oResp.results[0].ZDISTR_CHNL);
					viewModel.setProperty("/Division", oResp.results[0].ZDIVISION);
					viewModel.setProperty("/ZDEL_BLOCK_ID", oResp.results[0].ZDEL_BLOCK_ID);
					viewModel.setProperty("/ZHCURR", oResp.results[0].ZHCURR);
					viewModel.setProperty("/ZDOC_ID", oResp.results[0].ZDOC_ID);
					var sDocId = viewModel.getProperty("/ZDOC_ID"),
						sFileName, sDocId1;
					var UIStateModel = that.getView().getModel("UIState");
					var UIStateData = UIStateModel.getData();
					if (sDocId) {
						sDocId1 = sDocId.split("_MOET_")[0];
						sFileName = sDocId.split("T_S")[1];
						viewModel.setProperty("/FileName", sFileName);
						UIStateData.visible = true;
						UIStateModel.setData(UIStateData);
					} else {
						UIStateData.visible = false;
						UIStateModel.setData(UIStateData);
					}
					that.getCurrency(oResp.results[0].ZCUST_NUM);

					if (oResp.results[0].ZTEDER_FLAG === "X") {
						viewModel.setProperty("/ZTEDER_FLAG",
							true);
					} else {
						viewModel.setProperty("/ZTEDER_FLAG", false);
					}

					that._getShipToValue(oResp.results[0], oResp.results[0].ZSHIP_PRTY);
					that._getSalesAreaValue(oResp.results[0], oResp.results[0].ZSALES_AREA);
					that._getShowFtradeValue(oResp.results[0], oResp.results[0].ZFTRADE);
					that.showDeliveryBlock(oResp.results[0]);
					var oModel1 = that.getOwnerComponent().getModel(),
						ZINTR_ORDNUM1 = oDataObject.ZINTR_ORDNUM,
						sPath1 = "/OrderItemDetails";
					sap.ui.core.BusyIndicator.show();
					var oJsonModel1 = new sap.ui.model.json.JSONModel();

					oModel1.read(sPath1, {
						filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM1)],
						success: function (oResp1) {
							sap.ui.core.BusyIndicator.hide();
							if (oResp1.results.length > 0) {
								for (var i = 0; i < oResp1.results.length; i++) {
									//	that._getMaterialValue(oResp1.results[i].ZMAT_NUM);
									oResp1.results[i]["ItemCategorySug"] = [];

									that.minDate = new Date();
									that.maxDate = new Date();

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
							that.getView().setModel(that.jModel, "OrderData12");
							that.getItemCategory1(viewModel.getProperty("/ZCUST_NUM"), oResp1.results);

							that.getView().setModel(oJsonModel, "OrderData1");

							var data1 = {
								header: that.getView().getModel("OrderData1"),
								item: that.getView().getModel("OrderData12")
							};
							oFJsonModel.setData(data1);

							that.onUpdateClose();
							that.onClearDoc();

							if (!that._editSalesorderDialog) {

								that._editSalesorderDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.editOrder", that);
								that.getView().addDependent(that._editSalesorderDialog);

								that._editSalesorderDialog.setModel(oJsonModel, "OrderData1");
								that._editSalesorderDialog.setModel(oFJsonModel, "OrderDataF");
							}
							that._editSalesorderDialog.open();

						},
						error: function (err) {
							sap.ui.core.BusyIndicator.hide();

						}
					});

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(
						JSON.parse(err.responseText).error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});
		},

		/**
		 * This event is fired get System Value
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getSystem: function () {
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_system = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),
				that = this,
				sPath = "/ysystemIdentificationSet";
			//sap.ui.core.BusyIndicator.show();
			sap.ui.core.BusyIndicator.show();

			this.getOwnerComponent().getModel('MOETSRV').read(sPath, {
				success: function (oData1, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					oModel_system.setData(oData1.results);
					that.getView().setModel(oModel_system, "jsonSystemData");
				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			});

			/*oModel.read(sPath, {
				success: function (oResp1) {
					sap.ui.core.BusyIndicator.hide();
					if (oResp1.results.length === 0) {
						return;
					}
					if (oResp1.results.length) {
						oModel_system.setData(oResp1.results);
						that.getView().setModel(oModel_system, "jsonSystemData");
					}
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});*/

		},

		/**
		 * This event is fired get Shipto information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getShipToValue: function (oResp, Shiptoparty) {
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_shiptoParty = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),
				that = this,
				sPath = "/CustomerShipToPartyAssignDetails";
			//sap.ui.core.BusyIndicator.show();
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

						oModel_shiptoParty.setData(oResp1.results);
						that.getView().setModel(oModel_shiptoParty, "shipToPartyJson");
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
								/*viewProperties.setProperty("/ZSALES_AREA", oData1.NavsalesArea.results[i].Salesorg);
								viewProperties.setProperty("/Distrchn", oData1.NavsalesArea.results[i].Distrchn);
								viewProperties.setProperty("/Division", oData1.NavsalesArea.results[i].Division);*/
								that.showMatrialValue(oData1.NavsalesArea.results[i]);
							}
						}

						var oModel_SalesOff = new JSONModel();
						oModel_SalesOff.setData(oData1.NavsalesArea.results);
						that.getView().setModel(oModel_SalesOff, "SalesOffice");
					}

				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			});
		},

		/**
		 * This event is fired on close of Value help for fTrade
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		/*_getShowFtradeValue: function (oResp1, sTradeval) {

			var that = this;

			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_Ftrade = new JSONModel();
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

						oModel_Ftrade.setData(oResp1.results);
						that.getView().setModel(oModel_Ftrade, "fTradeJson");
					}
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},*/

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
				filters: [new Filter("ZCUSTMR_NUM", "EQ", viewProperties.getProperty("/ZCUST_NUM"))],
				success: function (oResp) {

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
		 * This event is fired get Material information based on customer number , salesId and currency
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		showMatrialValue: function (oResp) {

			var that = this;
			var sSyssid;
			//	var oSalesOffcId = this.getView().byId("f4hShipto");
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_matrialJosn = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerMatAssignDetails";

			var oFilter = [];

			if (viewProperties.getProperty("/ZHCURR")) {
				oFilter = [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/ZCUST_NUM")), new Filter("ZSALES_ORG", "EQ", viewProperties.getProperty(
					"/ZSALES_AREA")), new Filter("ZCURR", "EQ", viewProperties.getProperty("/ZHCURR")), new Filter("ZMAT_DEL_FLAG", "NE", "X")];
			} else {
				oFilter = [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/ZCUST_NUM")),
					new Filter("ZSALES_ORG", "EQ", viewProperties.getProperty("/ZSALES_AREA")), new Filter("ZCURR", "EQ", viewProperties.getProperty(
						"/ZHCURR")), new Filter("ZMAT_DEL_FLAG", "NE", "X")
				];
			}

			sap.ui.core.BusyIndicator.show();

			oModel.read(sPath, {
				filters: oFilter,
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					oModel_matrialJosn.setData(oResp.results);
					that.getView().setModel(oModel_matrialJosn, "MaterialJson");
					//that.getItemCategory(viewProperties.getProperty("/ZCUST_NUM"), oResp.results[0].ZMAT_NUM);
					//that.getItemCategory1(oResp.results);
					oModel_matrialJosn.refresh();

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

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
				this.oArticleNo = sap.ui.xmlfragment(oView.getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderArticleNumber", this);
				oView.addDependent(this.oArticleNo);

			}

			this.oArticleNo.open();
		},
		/**
		 * This event is fired on search values in customer number and name field 
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
		 * This event is fired on close of Value help for Customer field 
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
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("custJson").getObject();
				if (viewProperties.getProperty("/ZSYSTEM") !== object.ZSYSTEM) {
					MessageBox.warning(
						"Please select same customer system", {
							styleClass: "sapUiSizeCompact"
						});
					return;
				}
			}
			viewProperties.setProperty("/enableCurrField", false);

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
				"ZGRP_DEVLPR": "",
				"ZPAL_QUAN": "",
				"ZFOC_ITMC_FLAG": "",
				"ItemCategorySug": []

			}];
			this.jModel.refresh(); //which will add the new record
			viewProperties.setProperty("/ZCUSTOMER_NAME", "");
			viewProperties.setProperty("/ZCUST_NUM", "");

			viewProperties.setProperty("/ZSALES_AREA", "");
			viewProperties.setProperty("/ZSHIP_PRTY", "");
			viewProperties.setProperty("/ZSHIP_TO_PARTY_DESC", "");
			viewProperties.setProperty("/ShipToAddr", "");
			viewProperties.setProperty("/pdfFile", "");
			viewProperties.setProperty("/ZDOC_ID", "");
			viewProperties.setProperty("/FileName", "");
			viewProperties.setProperty("/ZFTRADE", "");
			viewProperties.setProperty("/ZFTRADE_DESC", "");

			var that = this;
			if (aContexts && aContexts.length) {

				viewProperties.setProperty("/ZCUST_NUM", object.ZCUST_NUM);
				viewProperties.setProperty("/ZCUSTOMER_NAME", object.ZCUSTOMER_NAME);

				/*if (object.ZSYSTEM === "L") {
					viewProperties.setProperty("/system",
						"LEAN");
				} else {
					viewProperties.setProperty("/system", "TEMPO");
				}*/

				if (object.ZSYSTEM === "L") {
					viewProperties.setProperty("/ZSYSTEM",
						object.ZSYSTEM);
				} else {
					viewProperties.setProperty("/ZSYSTEM", object.ZSYSTEM);
				}
				that._getCurrencyClear();

				that.getCurrency(object.ZCUST_NUM);
				that.showSalesOffice(object);
				that.showShiptoPartyValue(object);
				that.showFtradeValue(object);
				that.showDeliveryBlock(object);

			}
			//	oEvent.getSource().getBinding("items").filter([]);
		},

		/**
		 * This event is fired clearing and setting value
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getCurrencyClear: function () {

			var viewProperties = this.getView().getModel("viewProperties");
			viewProperties.setProperty("/ZHCURR", "");

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

				}.bind(this),
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
			var oSalesOffcId = sap.ui.getCore().byId("f4hSalesOffc");
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
			//debugger;
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
						viewProperties.setProperty("/enableCurrField", false);
						return;
					}
					if (oData1.NavsalesArea.results.length > 1) {
						oSalesOffcId.setEnabled(true);
						oSalesOffcId.setShowValueHelp(true);
						var oModel_SalesOff = new JSONModel();
						oModel_SalesOff.setData(oData1.NavsalesArea.results);
						that.getView().setModel(oModel_SalesOff, "SalesOffice");
					} else {
						oSalesOffcId.setShowValueHelp(false);
						oSalesOffcId.setEnabled(false);
						sap.ui.getCore().byId("idNewSelectCurrEdit").setEnabled(true);
						viewProperties.setProperty("/ZSALES_AREA", oData1.NavsalesArea.results[0].Salesorg);
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
		 * This event is fired get shiptoparty information based on customer
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		showShiptoPartyValue: function (oResp) {

			var that = this;
			var sSyssid;
			var oshiptoId = sap.ui.getCore().byId("f4hShipto");
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_shiptoParty = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerShipToPartyAssignDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUSTMR_NUM", "EQ", viewProperties.getProperty("/ZCUST_NUM"))],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					if (oResp.results.length === 0) {
						oshiptoId.setEnabled(false);
						oshiptoId.setShowValueHelp(false);
						return;
					}
					if (oResp.results.length > 1) {
						oshiptoId.setEnabled(true);
						oshiptoId.setShowValueHelp(true);

						oModel_shiptoParty.setData(oResp.results);
						that.getView().setModel(oModel_shiptoParty, "shipToPartyJson");
					} else {
						oshiptoId.setShowValueHelp(false);
						oshiptoId.setEnabled(false);
						var sAddress = oResp.results[0].ZPOSTAL_CODE + " " + oResp.results[0].ZCITY;
						viewProperties.setProperty("/ZSHIP_PRTY", oResp.results[0].ZSHIP_TO_PARTY);
						viewProperties.setProperty("/ZSHIP_TO_PARTY_DESC", oResp.results[0].ZSHIP_TO_PARTY_DESC);

						viewProperties.setProperty("/ShipToAddr", sAddress);

					}

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 * This event is fired get f trade value based on customer
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		showFtradeValue: function (oResp1) {

			var that = this;
			var oSalesOffcId = sap.ui.getCore().byId("f4hFtrade");
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_Ftrade = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerFTradeAssignDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/ZCUST_NUM"))],
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

						oModel_Ftrade.setData(oResp.results);
						that.getView().setModel(oModel_Ftrade, "fTradeJson");
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
			if (oEvent.getId() === "cancel") {
				return;
			}
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");
			this._getCurrencyClear();
			var that = this;
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("SalesOffice").getObject();
				viewProperties.setProperty("/ZSALES_AREA", object.Salesorg);
				viewProperties.setProperty("/Distrchn", object.Distrchn);
				viewProperties.setProperty("/Division", object.Division);

				viewProperties.setProperty("/enableCurrField", true);

				that.showMatrialValue(object);
			}
			oEvent.getSource().getBinding("items").filter([]);
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
		 * This event is fired on search values shipto party and discription 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		handleShipToSearch: function (oEvent) {
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
		 * This event is fired on close of Value help for Shipto party
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onPressShipToPartyValueListClose: function (oEvent) {
			if (oEvent.getId() !== "cancel") {
				var aContexts = oEvent.getParameter("selectedContexts");
				var oSelectedItem = oEvent.getParameter("selectedItem");
				var viewProperties = this.getView().getModel("viewProperties");
				viewProperties.setProperty("/ShipToAddr", "");
				var that = this;
				if (aContexts && aContexts.length) {

					var object = oSelectedItem.getBindingContext("shipToPartyJson").getObject();
					viewProperties.setProperty("/ZSHIP_PRTY", object.ZSHIP_TO_PARTY);

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
				}
			}

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
		 * This event is fired on search values in Ftrade 
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
		 * This event is fired on close of Value help for Ftrade 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onPressfTradeValueListClose: function (oEvent) {
			if (oEvent.getId() === "cancel") {
				return;
			}
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
		 * Function to open the Component Material Dialog.
		 * @public
		 */

		onMaterialValueHelpRequest: function (oEvent) {
			var oView;
			this._material = oEvent.getSource();
			var sInputValue = oEvent.getSource().getValue();
			this.curentNewOrderItemRow = oEvent.getSource().getBindingContext("OrderData12").getPath().split("/").pop();
			if (!oView) {
				oView = this.getView();
			}
			if (!this.MaterialF4Help) {
				this.MaterialF4Help = sap.ui.xmlfragment(oView.getId(), "com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.OrderMaterialF4Help",
					this);
				oView.addDependent(this.MaterialF4Help);

			}

			this.MaterialF4Help.open();
		},
		/**
		 * This event is fired on search values in material number and discription 
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
		 * This event is fired on close of Value help for material number
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onPressMaterialValueListClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var viewProperties = this.getView().getModel("viewProperties");
			var oModel = this.getOwnerComponent().getModel();
			var orderModel = this.getView().getModel("OrderData12");
			if (aContexts && aContexts.length) {
				var object = oSelectedItem.getBindingContext("MaterialJson").getObject();
				var oCOntext = this._material.getBindingContext("OrderData12");
				var sPath = oCOntext.getPath();
				if (object.ZMAT_NUM) {
					this._material.setValueState("None");
				} else {
					this._material.setValueState("Error");
				}
				orderModel.setProperty(sPath + "/ZMAT_NUM", object.ZMAT_NUM);
				//this.getItemCategory(viewProperties.getProperty("/ZCUST_NUM"), object.ZMAT_NUM);
				this._getItemCategoryCustomerMaster(oModel, viewProperties.getProperty("/ZCUST_NUM"), object.ZMAT_NUM, this.curentNewOrderItemRow);
				this.getPallet(viewProperties, object.ZMAT_NUM, sPath);
				var Z_MATRL_NUM = object.ZMAT_NUM,
					sPath1 = "/MaterialDetails";
				var that = this;
				this.maxDate = new Date();
				sap.ui.core.BusyIndicator.show();
				oModel.read(sPath1, {
					filters: [new Filter("Z_MATRL_NUM", "EQ", Z_MATRL_NUM)],
					success: function (oResp) {
						sap.ui.core.BusyIndicator.hide();

						orderModel.setProperty(sPath + "/ZMATRL_DESC", oResp.results[0].ZMATRL_DESC);
						orderModel.setProperty(sPath + "/ZALT_UOM", oResp.results[0].ZBASE_UNIT_MEASURE);

						orderModel.setProperty(sPath + "/ZTRGT_QTYUOM", oResp.results[0].ZBASE_UNIT_MEASURE);
						orderModel.setProperty(sPath + "/ZMIN_QTY", oResp.results[0].ZMIN_ORDER_QUAN);
						orderModel.setProperty(sPath + "/ZGRP_DEVLPR", oResp.results[0].ZGRP_DEVLPR);
						orderModel.setProperty(sPath + "/ZFROZEN_PERIOD", oResp.results[0].ZFROZEN_PERIOD);

						that.maxDate.setMonth(that.maxDate.getMonth() + (parseInt(oResp.results[0].ZFROZEN_PERIOD) + 1));
						that.maxDate.setDate(1);
						//that.maxDate.setDate(that.maxDate.getDate() + parseInt(oResp.results[0].ZFROZEN_PERIOD) * 30);
						orderModel.setProperty(sPath + "/ZMAX_DATE", that.maxDate);

					},
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
					}
				});

			}
			oEvent.getSource().getBinding("items").filter([]);
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
						"ZSCHD_TYPE": "",
						"ItemCategorySug": []

					}
				]
			};

			this.jModel = new sap.ui.model.json.JSONModel();
			this.jModel.setData(this._data);

			this.getView().setModel(this.jModel, "OrderData12");
		},
		onClearDoc: function () {
			var viewProperties = this.getView().getModel("viewProperties");
			viewProperties.setProperty("/pdfFile", "");
			viewProperties.setProperty("/ZDOC_ID", "");

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

			oUploadAttachment.then(function (result) {
				sap.ui.core.BusyIndicator.hide();
				viewProperties.setProperty("/pdfFile", sFileName);
				var docId = result.docId + "_MOET_" + result.docName;

				viewProperties.setProperty("/ZDOC_ID", docId);

			}).catch(function (oError) {
				sap.ui.core.BusyIndicator.hide();
				that._showErrorMessage(oError.responseText.replace("Errorr", "Error"));
			});
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
		 * Function on the click of the delete button in Attachment Dialog.
		 * @param {object} [oEvent] parameter used to get Document Id to delete attachment.
		 * @public
		 */
		onFileDeleted: function (oEvent) {
			//var oModel = this.getView().getModel("viewProperties");

			MessageBox.confirm("Confirm to delete the attachment", {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {
						sap.ui.getCore().byId("idUploadFileLink").setText('');
						this.onClearDoc();
					}
				}
			});

			//	oModel.setData().FileName = "";
			//this._deleteItemById(oEvent.getParameter("documentId"));
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
		 * Function to open the dialog for the attachment screens.
		 * set the Document Title
		 * set the Document Id and File Name if exists
		 * bind it to a temporary model to show the document details.
		 * @param {object} [oEvent] parameter used to global variable for the Spec Doc Button.
		 * @public
		 */
		pressAddAttachment: function (oEvent) {
			var oModel = this.getView().getModel("viewProperties");
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

		/**
		 * When material number select based that get pallet data 
		 * @param IvMaterial,IvMaterial,IvSalesorg,IvDisbchnl and IvDivision
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		getPallet: function (oModelView, matNum, sPath) {
			var sSyssid;
			var orderModel = this.getView().getModel("OrderData12");
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

			var sFData = "/yminorderInputSet(IvMaterial='" + matNum + "',IvSyssid='" + sSyssid + "',IvCustomer='" + oModelView.getData().cusId +
				"',IvSalesorg='" + oModelView.getData().salesId + "',IvDisbchnl='" + oModelView.getData().Distrchn + "',IvDivision='" + oModelView
				.getData().Division + "')";
			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {
				success: function (oData1, oResponse1) {
					sap.ui.core.BusyIndicator.hide();

					orderModel.setProperty(sPath + "/ZPAL_QUAN", oData1.EvPalletQty);
					orderModel.setProperty(sPath + "/ZMIN_QTY", oData1.EvMinOrder);

				}.bind(this),
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
				}.bind(this)
			});

		},

		/**
		 * This function called when we change currency 
		 * The value will setting model
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		onCurrencyChange: function (oEvent) {
			var viewProperties = this.getView().getModel("viewProperties");
			viewProperties.setProperty("/ZHCURR", oEvent.getSource().getSelectedKey());
			this.showMatrialValue(oEvent.getSource().getSelectedKey());
			this.clearRowItem();
		},

		formatDateWithOutTime: function (iValue) {
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
		 * This event is fired when you click copy button
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		copyRow: function () {
			var g = sap.ui.getCore().byId("idsystem"),
				that = this,
				sSytemVal = '',
				tenderval;
			if (g.getValue() === "TEMPO") {
				sSytemVal = "T";
			} else {
				sSytemVal = "L";
			}
			var oTable = sap.ui.getCore().byId("tblupdateorder");

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
					if (item.getBindingContext("OrderData12").getObject().ZFOC_SMPL) {
						sSmpl = item.getBindingContext("OrderData12").getObject().ZFOC_SMPL;
					} else {
						sSmpl = "";
					}
					that._data.Products.push({

						"ZINTR_ORDNUM": item.getBindingContext("OrderData12").getObject().ZINTR_ORDNUM,
						"ZSYSTEM": sSytemVal,
						"ZINTR_ITEMNUM": i.toString(),
						"ZMAT_NUM": item.getBindingContext("OrderData12").getObject().ZMAT_NUM,
						"ZMATRL_DESC": item.getBindingContext("OrderData12").getObject().ZMATRL_DESC,
						"ZTRGT_QTY": item.getBindingContext("OrderData12").getObject().ZTRGT_QTY,
						"ZTRGT_QTYUOM": item.getBindingContext("OrderData12").getObject().ZTRGT_QTYUOM,
						"ZALT_UOM": item.getBindingContext("OrderData12").getObject().ZALT_UOM,
						//"ZREQ_DLVRYDAT": "2021-01-06",
						"ZREQ_DLVRYDAT": item.getBindingContext("OrderData12").getObject().ZREQ_DLVRYDAT,
						"ZMIN_QTY": item.getBindingContext("OrderData12").getObject().ZMIN_QTY,
						"ZFOC_SMPL": sSmpl,
						"ZFROZEN_PERIOD": item.getBindingContext("OrderData12").getObject().ZFROZEN_PERIOD,
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": item.getBindingContext("OrderData12").getObject().ZDISCNT,
						"NetQty": "",
						"currency": "",
						"ZMAX_DATE": item.getBindingContext("OrderData12").getObject().ZMAX_DATE,
						"ZMIN_DATE": item.getBindingContext("OrderData12").getObject().ZMIN_DATE,
						"ZGRP_DEVLPR": item.getBindingContext("OrderData12").getObject().ZGRP_DEVLPR,
						"ZPAL_QUAN": item.getBindingContext("OrderData12").getObject().ZPAL_QUAN,
						"ZFOC_ITMC_FLAG": item.getBindingContext("OrderData12").getObject().ZFOC_ITMC_FLAG,
						"ItemCategorySug": item.getBindingContext("OrderData12").getObject().ItemCategorySug,
						"ZSCHD_TYPE": item.getBindingContext("OrderData12").getObject().ZSCHD_TYPE

					});
					i = i + 1;
				});
			}
			that.jModel.refresh();

		},

		/**
		 * This event is fired get item Category information based on customer and material
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		/*getItemCategory: function (custid, matId) {
			var that = this;

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
						
						oModel_ICatJosn.setData(oResp1.results);
						that.getView().setModel(oModel_ICatJosn, "ItemCatJson");
						//that.getItemCategory(viewProperties.getProperty("/cusId"),oResp1.results);
						oModel_ICatJosn.refresh();
					} else {
						oModel.read(sPath1, {
							//filters: [new Filter("ZCUST_NUM", "EQ", viewProperties.getProperty("/cusId"))],
							filters: [new Filter("ZMAT_NUM", "EQ", matId)],
							success: function (oRespI1) {
								sap.ui.core.BusyIndicator.hide();
								if (oRespI1.results.length > 0) {
									oModel_ICatJosn.setData(oRespI1.results);
									that.getView().setModel(oModel_ICatJosn, "ItemCatJson");
									//that.getItemCategory(viewProperties.getProperty("/cusId"),oResp1.results);
									oModel_ICatJosn.refresh();
								} else {
									//that.getView().setModel([], "ItemCatJson");
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

			}
		},

		_getItemCategoryCustomerMaster: function (oModel, custid, sMatrialNo, ind) {
			var oModel_ICatJosn = new JSONModel();
			oModel.read("/CustMatItemCategoryAssign", {
				filters: [new Filter("ZCUST_NUM", "EQ", custid), new Filter("ZMAT_NUM", "EQ", sMatrialNo)],
				success: function (oRespI1) {
					sap.ui.core.BusyIndicator.hide();
					if (oRespI1.results.length > 0) {
						// oModel_ICatJosn.setData(oResp1.results);
						this.getView().getModel("OrderData12").setProperty("/Products/" + ind + "/ItemCategorySug", oRespI1.results);
						this.getView().getModel("OrderData12").refresh();
					} else {
						this._getItemCategoryMatrialMaster(oModel, sMatrialNo, ind);
					}
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
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
						this.getView().getModel("OrderData12").setProperty("/Products/" + ind + "/ItemCategorySug", oRespI1.results);
						this.getView().getModel("OrderData12").refresh();
					} else {
						// this.getView().setModel(oModel_ICatJosn, "ItemCatJson");
					}
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
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
				viewProperties.setProperty("/ZTEDER_FLAG", true);
			} else {
				viewProperties.setProperty("/ZTEDER_FLAG", false);
			}

		},

		/**
		 *  This event is fired delete row in front end level
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		deleteRow: function (oArg) {
			var deleteRecord = oArg.getSource().getBindingContext("OrderData12").getObject();
			for (var i = 0; i < this._data.Products.length; i++) {
				if (this._data.Products[i] == deleteRecord) {
					//	pop this._data.Products[i] 
					this._data.Products.splice(i, 1); //removing 1 record from i th index.
					this.jModel.refresh();
					break; //quit the loop
				}
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

		onUpdateClose: function () {
			/*if (this._editSalesorderDialog) {
				this._editSalesorderDialog = this._editSalesorderDialog.destroy(true);
				this._editSalesorderDialog.close();
			}*/
			//this._editSalesorderDialog.close();
			if (this._editSalesorderDialog) {
				this._editSalesorderDialog.close();
				this._editSalesorderDialog = this._editSalesorderDialog.destroy(true);
				//        this._editSalesorderDialog.close();
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
					UTC: true
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},

		formatDate2: function (iValue) {
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
		 * This event is fired on before you submit order we are simulate
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onSimulate: function () {
			var bVali = this._handleValidation();
			if (!bVali) {
				return;
			}

			var oMod1 = this.getView().getModel("viewProperties"),
				systemId = sap.ui.getCore().byId("idsystem"),
				that = this;
			var sOrderVal = "",
				sSystemVal = "";
			if (systemId.getValue() === "TEMPO") {
				sSystemVal = "T";
			} else {
				sSystemVal = "L";
			}

			var oTable = sap.ui.getCore().byId("tblupdateorder");
			var TrustpaymatterSet = [];
			var aItems = oTable.getItems();
			var i = 1,
				sSmpl;

			var oModViewProperty = this.getView().getModel("viewProperties");
			var data = {
				"ZORDER_HEADER": [{
					"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
					"ZSYSTEM": sSystemVal,
					"ZORD_REF": "X",
					"ZCUST_NUM": oMod1.getData().ZCUST_NUM,
					"ZCUSTOMER_NAME": oModViewProperty.getData().ZCUSTOMER_NAME,
					"ZSHIP_PRTY": oMod1.getData().ZSHIP_PRTY,
					"ZSHIP_TO_PARTY_DESC": oModViewProperty.getData().ZSHIP_TO_PARTY_DESC,
					"ZPO_TYP": "X",
					"ZDISCNT": oMod1.getData().ZDISCNT,
					"ZCUST_PONUM": oMod1.getData().ZCUST_PONUM,
					"ZCUST_PODAT": oMod1.getData().ZCUST_PODAT,
					"ZDOC_ID": oMod1.getData().ZDOC_ID,
					"ZORD_STATUS": "DRFT",
					"ZORD_NUM": "",
					"ZAPPROVAL_STATUS": "",
					"ZLEAD_TIME": "",
					"ZMIN_ORDER_QUAN": "",
					"ZORDER_FORECAST": "",
					"ZFIT_CONTRACT_COND": "",
					"ZTEDER_FLAG": oMod1.getData().ZTEDER_FLAG,
					"ZREQ_DELV_DAT": oMod1.getData().ZREQ_DELV_DAT,
					"ZSALES_AREA": oMod1.getData().ZSALES_AREA,
					"ZTOTAL_AMT": oMod1.getData().ZTOTAL_AMT,
					"ZFTRADE": oModViewProperty.getData().ZFTRADE,
					"ZFTRADE_DESC": oModViewProperty.getData().ZFTRADE_DESC,
					"ZCURR": "",
					"ZHCURR": oModViewProperty.getData().ZHCURR,
					"ZORD_APPROVAL_STATUS": "",
					"ZCOMMENTS": "",
					"ZCREATED_BY": oModViewProperty.getData().ZCREATED_BY,
					"ZCHANGED_BY": this.getOwnerComponent().sUserId,
					"ShipToAddr": oMod1.getData().ShipToAddr,
					"herderCurr": "",
					"HDRNETVAL": ""
				}]

			};

			var jsonData = new JSONModel();

			var cusData = sap.ui.getCore().byId("f4hCustomer") || this.getView().byId("f4hCustomer");
			var sSyst;
			var sUSystem = data.ZORDER_HEADER[0].ZSYSTEM;
			/*if (data.ZORDER_HEADER[0].ZSYSTEM === "L") {
				sSyst = "DLACLNT100";
			} else {
				sSyst = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "L") {

					sSyst = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "T") {

					sSyst = aSystemData[i].Yylow;

				}

			}

			var TrustpaymatterSet1 = [];
			var NavsosimulateschedulineSet = [];
			var aItems1 = oTable.getItems();
			var i1 = 10,
				sSmpl1;
			var sItemDisc;
			var sFrozenPeriod;
			if (aItems1.length > 0) {
				aItems1.forEach(function (item1) {

					if (item1.getBindingContext("OrderData12").getObject().ZFROZEN_PERIOD === null) {
						sFrozenPeriod = "0";
					} else {
						sFrozenPeriod = item1.getBindingContext("OrderData12").getObject().ZFROZEN_PERIOD
					}

					if (item1.getBindingContext("OrderData12").getObject().ZFOC_ITMC_FLAG !== "X") {
						if (item1.getBindingContext("OrderData12").getObject().ZFOC_SMPL === 'YYAN') {
							sSmpl1 = "";
						} else if (item1.getBindingContext("OrderData12").getObject().ZFOC_SMPL) {
							sSmpl1 = item1.getBindingContext("OrderData12").getObject().ZFOC_SMPL;
						} else {
							sSmpl1 = "";
						}
						if (item1.getBindingContext("OrderData12").getObject().ZDISCNT) {
							sItemDisc = item1.getBindingContext("OrderData12").getObject().ZDISCNT;
						} else {
							sItemDisc = "0";
						}
						NavsosimulateschedulineSet.push({
							ItmNumber: i1.toString(),
							SchedLine: "0001",
							ReqQty: item1.getBindingContext("OrderData12").getObject().ZTRGT_QTY.toString(),
							SchedType: ""
						});
						TrustpaymatterSet1.push({

							ItemCateg: sSmpl1,
							ItmNumber: i1.toString(),
							Matnr: item1.getBindingContext("OrderData12").getObject().ZMAT_NUM,
							Plant: "",
							TargQty: item1.getBindingContext("OrderData12").getObject().ZTRGT_QTY.toString(),
							DocType: "YOR",
							ZMIN_ORD_QTY: item1.getBindingContext("OrderData12").getObject().ZMIN_QTY,
							ZPAL_QUAN: item1.getBindingContext("OrderData12").getObject().ZPAL_QUAN,
							ZTRGT_QTYUOM: item1.getBindingContext("OrderData12").getObject().ZALT_UOM,
							ZALT_UOM: item1.getBindingContext("OrderData12").getObject().ZALT_UOM,
							ZREQ_DLVRYDAT: that.formatDateT1Format(item1.getBindingContext("OrderData12").getObject().ZREQ_DLVRYDAT), //"2021-02-28T00:00:00",//item1.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT,//"2021-02-28T00:00:00",
							ZFOC_SMPL: sSmpl1,
							ZDISCNT: item1.getBindingContext("OrderData12").getObject().ZDISCNT,
							UNITPC: item1.getBindingContext("OrderData12").getObject().ZALT_UOM,
							NetQty: "0",
							ZGRP_DEVLPR: item1.getBindingContext("OrderData12").getObject().ZGRP_DEVLPR,
							ZFROZEN_PERIOD: sFrozenPeriod,
							CondValue: sItemDisc,
						});
						i1 = i1 + 10;
					}
				});
			}
			//
			var sHdrCond;
			if (oModViewProperty.getData().ZDISCNT) {
				sHdrCond = oModViewProperty.getData().ZDISCNT;
			} else {
				sHdrCond = "0";
			}
			var payload = {
				IvCustomer: oModViewProperty.getData().ZCUST_NUM,
				IvShipParty: oModViewProperty.getData().ZSHIP_PRTY,
				IvReqDateH: that.formatDateT1Format(oModViewProperty.getData().ZCUST_PODAT),
				IvDistchanl: oModViewProperty.getData().Distrchn,
				IvDivision: oModViewProperty.getData().Division,
				IvSalesorg: oModViewProperty.getData().ZSALES_AREA,
				IvSyssid: sSyst,
				IvCurrency: oModViewProperty.getData().selectCurr,
				IvHdrCondVal: sHdrCond,
				Navsosimulate: TrustpaymatterSet1,
				Navsosimulatescheduline: NavsosimulateschedulineSet,
				NavsosimulateReturn: [],
				NavsosimulateNetval: []
			};
			payload.Navsosimulate[0].ItmNumber = "000010";

			var msgT, msgTit, that = this,
				herderCurr;
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

					if (data1 && data1.NavsosimulateNetval && data1.NavsosimulateNetval.results && data1.NavsosimulateNetval.results.length) {
						var aRItems = data1.NavsosimulateNetval.results;
						var j = 1;
						if (aRItems.length > 0) {
							aRItems.forEach(function (item) {

								TrustpaymatterSet.push({
									"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
									"ZSYSTEM": sSystemVal,
									"ZINTR_ITEMNUM": j.toString(),
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
								j = j + 1;
							});
						}
						data.ZORDER_ITEM = TrustpaymatterSet;

						data.ZORDER_HEADER[0].HDRNETVAL = data1.IVHDRNETVAL;
						for (var k = 0; k < data.ZORDER_ITEM.length; k++) {
							data.ZORDER_ITEM[k].NetQty = data1.NavsosimulateNetval.results[k].ItemNetval;
							data.ZORDER_ITEM[k].currency = data1.NavsosimulateNetval.results[k].Currency;
							data.ZORDER_HEADER[0].herderCurr = data.ZORDER_ITEM[k].currency;
						}

						oModViewProperty.setProperty("/herderCurr", data.ZORDER_HEADER[0].herderCurr);
						oModViewProperty.setProperty("/HDRNETVAL", data.ZORDER_HEADER[0].HDRNETVAL);
					}

					jsonData.setData(data);

					if (!that._UpdateSiDialog) {
						that._UpdateSiDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.updateOrderSimulate", that);
						that.getView().addDependent(that._UpdateSiDialog);

						that._UpdateSiDialog.setModel(jsonData, "salesorderData");

					}
					that._UpdateSiDialog.open();

					if (data1.NavsosimulateReturn.results.length > 0) {
						if (data1.NavsosimulateReturn.results[0].Type === "E") {

							msgTit = "ERROR";
							//	sap.ui.getCore().byId("upUpdatebtn").setVisible(false);
							//	sap.ui.getCore().byId("upSimbtn").setVisible(true);
						} else {
							//sap.ui.getCore().byId("upSimbtn").setVisible(false);
							//sap.ui.getCore().byId("upUpdatebtn").setVisible(true)
							//sap.ui.getCore().byId("upUpdatebtn").setEnabled(false);

							msgTit = "SUCCESS";
						}
					} else {
						//sap.ui.getCore().byId("upSimbtn").setVisible(false);
						//sap.ui.getCore().byId("upUpdatebtn").setVisible(true);
						//sap.ui.getCore().byId("upUpdatebtn").setEnabled(true);
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

				}
			});

			if (!cusData.getValue()) {
				MessageBox.error(
					"Please fill all mandatory Details", {
						styleClass: "sapUiSizeCompact"
					}
				);
			}

		},
		/**
		 *  This event is fired close order simulate fragment
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		onSimulateClose: function () {
			this._UpdateSiDialog.close();
			if (this._UpdateSiDialog) {
				this._UpdateSiDialog = this._UpdateSiDialog.destroy();
			}
		},

		onUpdateOrder: function () {
			var oMod1 = this.getView().getModel("viewProperties"),
				that = this,
				systemId = sap.ui.getCore().byId("idsystem");
			var sOrderVal = "",
				sSystemVal = "";
			if (systemId.getValue() === "TEMPO") {
				sSystemVal = "T";
			} else {
				sSystemVal = "L";
			}

			if (oMod1.getData().ZTEDER_FLAG === true) {
				oMod1.getData().ZTEDER_FLAG = "X";
			} else {
				oMod1.getData().ZTEDER_FLAG = "";
			}
			var oMod = this._UpdateSiDialog.getModel("salesorderData");
			var aItems = oMod.getData().ZORDER_ITEM;

			var oTable = sap.ui.getCore().byId("tblupdateorder");
			var TrustpaymatterSet = [];

			if (aItems.length > 0) {
				aItems.forEach(function (item) {
					if (item.ZMIN_QTY) {
						item.ZMIN_QTY = item.ZMIN_QTY;
					} else {
						item.ZMIN_QTY = "0";
					}

					if (item.ZDISCNT) {
						item.ZDISCNT = item.ZDISCNT;
					} else {
						item.ZDISCNT = "0";
					}
					TrustpaymatterSet.push({

						"ZINTR_ORDNUM": item.ZINTR_ORDNUM,
						"ZSYSTEM": sSystemVal,
						"ZINTR_ITEMNUM": item.ZINTR_ITEMNUM,
						"ZMAT_NUM": item.ZMAT_NUM,
						"ZTRGT_QTY": item.ZTRGT_QTY,
						"ZTRGT_QTYUOM": item.ZTRGT_QTYUOM,
						"ZALT_UOM": item.ZALT_UOM,

						"ZREQ_DLVRYDAT": that.formatDateWithOutTime(item.ZREQ_DLVRYDAT),
						"ZMIN_QTY": item.ZMIN_QTY,
						"ZFOC_SMPL": item.ZFOC_SMPL,
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": item.ZDISCNT,
						"ZCOST": item.NetQty,
						"ZGRP_DEVLPR": item.ZGRP_DEVLPR,
						"ZFROZEN_PERIOD": item.ZFROZEN_PERIOD,
						"ZPAL_QUAN": item.ZPAL_QUAN,
						"ZFOC_ITMC_FLAG": item.ZFOC_ITMC_FLAG,
						"ZSCHD_TYPE": item.ZSCHD_TYPE

					});
				});
			}

			var payload = {
				"ZORDER_HEADER": [{
					"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
					"ZSYSTEM": sSystemVal,
					"ZORD_REF": "X",
					"ZCUST_NUM": oMod1.getData().ZCUST_NUM,
					"ZSHIP_PRTY": oMod1.getData().ZSHIP_PRTY,
					"ZPO_TYP": "X",
					"ZDISCNT": oMod1.getData().ZDISCNT,
					"ZCUST_PONUM": oMod1.getData().ZCUST_PONUM,
					"ZCUST_PODAT": that.formatDate1(oMod1.getData().ZCUST_PODAT),
					"ZDOC_ID": oMod1.getData().ZDOC_ID,
					"ZORD_STATUS": "SNOA",
					"ZORD_NUM": "",
					"ZAPPROVAL_STATUS": "",
					"ZLEAD_TIME": "",
					"ZMIN_ORDER_QUAN": "",
					"ZORDER_FORECAST": "",
					"ZFIT_CONTRACT_COND": "",
					"ZTEDER_FLAG": oMod1.getData().ZTEDER_FLAG,
					"ZREQ_DELV_DAT": this.formatDate1(new Date()),
					"ZSALES_AREA": oMod1.getData().ZSALES_AREA,
					"ZTOTAL_AMT": oMod1.getData().HDRNETVAL,
					"ZFTRADE": oMod1.getData().ZFTRADE,
					"ZFTRADE_DESC": oMod1.getData().ZFTRADE_DESC,
					"ZCURR": oMod1.getData().herderCurr,
					"ZHCURR": oMod1.getData().ZHCURR,
					"ZDISTR_CHNL": oMod1.getData().Distrchn,
					"ZDIVISION": oMod1.getData().Division,
					"ZDEL_BLOCK_ID": oMod1.getData().ZDEL_BLOCK_ID,
					"ZORD_APPROVAL_STATUS": "",
					"ZCOMMENTS": "",
					"ZCREATED_BY": oMod1.getData().ZCREATED_BY,
					"ZCHANGED_BY": this.getOwnerComponent().sUserId
				}],
				"ZORDER_ITEM": TrustpaymatterSet
			};

			var jsonData = new JSONModel();
			jsonData.setData(payload);
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";

			var deletePayload = {
				"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM
			};
			sap.ui.core.BusyIndicator.show();
			$.ajax({
				url: sUrl,
				type: "DELETE",
				data: JSON.stringify(deletePayload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sap.ui.core.BusyIndicator.hide();
					$.ajax({
						url: sUrl,
						type: "POST",
						data: JSON.stringify(payload),
						dataType: "json",
						contentType: "application/json",
						success: function (data, response) {
							sap.ui.core.BusyIndicator.hide();

							$.ajax({
								url: "/HANAXS/com/merckgroup/moet/services/xsjs/splitOrder.xsjs",
								type: "DELETE",
								data: JSON.stringify(deletePayload),
								dataType: "json",
								contentType: "application/json",
								success: function (data, response) {

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

							MessageBox.show(
								"Order " + payload.ZORDER_HEADER[0].ZINTR_ORDNUM + " is Updated Successfully", {
									icon: MessageBox.Icon.SUCCESS,
									title: "SUCCESS",
									onClose: this.onAssignClose,
									actions: [MessageBox.Action.CLOSE],
									styleClass: "sapUiSizeCompact myMessageBox"
								}
							);

							that.getOwnerComponent().getModel().refresh();
							that.onSimulateClose();
							that.onUpdateClose();

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

		/**
		 *  This event is fired When data is setting in perticuler row
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		handleDate: function (evt) {
			var source = evt.getSource(),
				path = source.getBindingPath("value"),
				value = new Date((source.getValue()).replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3")),
				oDateFormatter = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy",
					strictParsing: true
				}),
				sPath = source.getBindingContext("OrderData12").sPath;
			var mxDate = this.getView().getModel("OrderData12").getProperty(sPath + "/ZMAX_DATE");
			//value.setDate(value.getDate() + 1);
			//this.dateFormat(value);
			//this.dateFormat(mxDate);
			if (value !== null) {
				value.setHours(0, 0, 0, 0);
			}
			//value.setHours(0,0,0,0);

			var validDate = oDateFormatter.parse(this.getView().getModel("OrderData12").getProperty(sPath + "/ZMAX_DATE"));
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

			this.getView().getModel("OrderData12").setProperty(sPath + "/" + path, value);
			this.handleonValueInput(evt);

		},

		onChangePODate: function (evt) {
			var viewProperties = this.getView().getModel("viewProperties");
			var oCustPoID = sap.ui.getCore().byId("idcpodate");
			if (oCustPoID.getValue() === "") {
				oCustPoID.setValueState("Error");
			} else {
				oCustPoID.setValueState("None");
			}
			var source = evt.getSource(),
				path = source.getBindingPath("value"),
				value = source.getDateValue();
			//value = this.custFormatter.dateFormat(value);

			viewProperties.setProperty("/ZCUST_PODAT", value);
		},

		handleonValueInput: function (evt) {
			var oSrc = evt.getSource();

			if (oSrc.getValue().length > 0) {
				oSrc.setValueState("None");
			} else {
				oSrc.setValueState("Error");
			}
		},

		addRow: function (oArg) {
			this.minDate = new Date();
			this.maxDate = new Date();
			this._data.Products.push({
				"ZINTR_ORDNUM": this.getView().getModel("OrderData1").getData().ZINTR_ORDNUM,
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
				"ZGRP_DEVLPR": "",
				"ZPAL_QUAN": "",
				"ZFOC_ITMC_FLAG": "",
				"ZMAX_DATE": this.maxDate,
				"ZMIN_DATE": this.minDate,
				"ItemCategorySug": [],
				"ZFROZEN_PERIOD": "",
				"ZSCHD_TYPE": ""

			});
			this.jModel.refresh(); //which will add the new record

		},

		soLineClose: function () {
			this._oSSOLAEDialog.close();
			if (this._oSSOLAEDialog) {
				this._oSSOLAEDialog = this._oSSOLAEDialog.destroy();
			}
		},

		/**
		 *  This event is fired get schedule line information
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */
		soLineShow: function (oEvent) {

			var oModel = oEvent.getSource()._getBindingContext("salesorderData").getObject();
			var oSalesModel = this._UpdateSiDialog.getModel("salesorderData").getData();

			var ssoLine = this._oViewProperties = new JSONModel();

			var oModViewProperty = this.getView().getModel("viewProperties");
			ssoLine.setData(oSalesModel);

			var sSidd;
			var sUSystem = oModel.ZSYSTEM;
			/*if (oModel.ZSYSTEM === "L") {
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

			if (oModel.ZALT_UOM) {
				oModel.ZALT_UOM = oModel.ZALT_UOM;
			} else {
				oModel.ZALT_UOM = "PC";
			}

			var kl = "datetime%27" + this.formatDateT1(oModel.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";

			var sFData = "/ysoschedulelinesSet(distchnl='" + oModViewProperty.getData().Distrchn + "',division='" + oModViewProperty.getData().Division +
				"',salesorg='" + oModViewProperty.getData().ZSALES_AREA + "',customer='" + oModViewProperty.getData().ZCUST_NUM + "',Material='" +
				oModel.ZMAT_NUM +
				"',Unit='" + oModel.ZALT_UOM + "',Sysid='" + sSidd + "',ReqDate=" + kl + ",ReqQty=" + parseInt(oModel.ZTRGT_QTY) + ")";

			sap.ui.core.BusyIndicator.show();
			this.getOwnerComponent().getModel('MOETSRV').read(sFData, {

				success: function (oData12, oResponse1) {
					sap.ui.core.BusyIndicator.hide();
					var oModel_Customer = new JSONModel();
					oModel_Customer.setData(oData12);
					if (!this._oSSOLAEDialog) {

						this._oSSOLAEDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.orderSimulateEditSOLine", this);
						this.getView().addDependent(this._oSSOLAEDialog);
						this._oSSOLAEDialog.setModel(oModel_Customer, "ssoLineJson");
						this._oSSOLAEDialog.setModel(ssoLine, "ssoLineJson1");

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
					//this._oSiDialog.close();
					this._oSSOLAEDialog.open();
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
		 * This event is fired on close of Value help for fTrade
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getShowFtradeValue: function (oResp1, sTradeval) {

			var that = this;

			var viewProperties = this.getView().getModel("viewProperties");
			var oModel_Ftrade = new JSONModel();
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

						oModel_Ftrade.setData(oResp1.results);
						that.getView().setModel(oModel_Ftrade, "fTradeJson");
					}
				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		/**
		 *  This event is fired save data to hana data base
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		_onSaveOrderInEdit: function () {
			var bVali = this._handleValidation();
			if (!bVali) {
				return;
			}

			var oMod1 = this.getView().getModel("viewProperties"),
				that = this,
				systemId = sap.ui.getCore().byId("idsystem");
			var sOrderVal = "",
				sSystemVal = "";
			if (systemId.getValue() === "TEMPO") {
				sSystemVal = "T";
			} else {
				sSystemVal = "L";
			}

			if (oMod1.getData().ZTEDER_FLAG === true) {
				oMod1.getData().ZTEDER_FLAG = "X";
			} else {
				oMod1.getData().ZTEDER_FLAG = "";
			}
			var i = 1;
			var oTable = sap.ui.getCore().byId("tblupdateorder");
			var TrustpaymatterSet = [];
			var aItems = this.getView().getModel("OrderData12").getData().Products;

			if (aItems.length > 0) {
				aItems.forEach(function (item) {
					if (item.ZFOC_ITMC_FLAG !== "X") {
						if (item.ZMIN_QTY) {
							item.ZMIN_QTY = item.ZMIN_QTY;
						} else {
							item.ZMIN_QTY = "0";
						}

						if (item.ZDISCNT) {
							item.ZDISCNT = item.ZDISCNT;
						} else {
							item.ZDISCNT = "0";
						}
						TrustpaymatterSet.push({

							"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
							"ZSYSTEM": sSystemVal,
							"ZINTR_ITEMNUM": i.toString(), //item.ZINTR_ITEMNUM,
							"ZMAT_NUM": item.ZMAT_NUM,
							"ZTRGT_QTY": item.ZTRGT_QTY,
							"ZTRGT_QTYUOM": item.ZTRGT_QTYUOM,
							"ZALT_UOM": item.ZALT_UOM,
							"ZREQ_DLVRYDAT": that.formatDate2(item.ZREQ_DLVRYDAT),
							"ZMIN_QTY": item.ZMIN_QTY,
							"ZFOC_SMPL": item.ZFOC_SMPL,
							"ZORD_NUM": "",
							"ZITEM_NUM": "",
							"ZDISCNT": item.ZDISCNT,
							"ZCOST": "",
							"ZGRP_DEVLPR": item.ZGRP_DEVLPR,
							"ZFROZEN_PERIOD": item.ZFROZEN_PERIOD,
							"ZPAL_QUAN": item.ZPAL_QUAN,
							"ZFOC_ITMC_FLAG": item.ZFOC_ITMC_FLAG,
							"ZSCHD_TYPE": item.ZSCHD_TYPE

						});

					}
					i = i + 1;
				});

			}

			var payload = {
				"ZORDER_HEADER": [{
					"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
					"ZSYSTEM": sSystemVal,
					"ZORD_REF": "X",
					"ZCUST_NUM": oMod1.getData().ZCUST_NUM,
					"ZSHIP_PRTY": oMod1.getData().ZSHIP_PRTY,
					"ZPO_TYP": "X",
					"ZDISCNT": oMod1.getData().ZDISCNT,
					"ZCUST_PONUM": oMod1.getData().ZCUST_PONUM,
					"ZCUST_PODAT": that.formatDate2(oMod1.getData().ZCUST_PODAT),
					"ZDOC_ID": oMod1.getData().ZDOC_ID,
					"ZORD_STATUS": "DRFT",
					"ZORD_NUM": "",
					"ZAPPROVAL_STATUS": "",
					"ZLEAD_TIME": "",
					"ZMIN_ORDER_QUAN": "",
					"ZORDER_FORECAST": "",
					"ZFIT_CONTRACT_COND": "",
					"ZTEDER_FLAG": oMod1.getData().ZTEDER_FLAG,
					"ZREQ_DELV_DAT": this.formatDate1(new Date()),
					"ZSALES_AREA": oMod1.getData().ZSALES_AREA,
					"ZTOTAL_AMT": oMod1.getData().HDRNETVAL,
					"ZFTRADE": oMod1.getData().ZFTRADE,
					"ZFTRADE_DESC": oMod1.getData().ZFTRADE_DESC,
					"ZCURR": oMod1.getData().herderCurr,
					"ZHCURR": oMod1.getData().ZHCURR,
					"ZDISTR_CHNL": oMod1.getData().Distrchn,
					"ZDIVISION": oMod1.getData().Division,
					"ZDEL_BLOCK_ID": oMod1.getData().ZDEL_BLOCK_ID,
					"ZORD_APPROVAL_STATUS": "",
					"ZCOMMENTS": "",
					"ZCREATED_BY": oMod1.getData().ZCREATED_BY,
					"ZCHANGED_BY": this.getOwnerComponent().sUserId
				}],
				"ZORDER_ITEM": TrustpaymatterSet
			};

			var jsonData = new JSONModel();
			jsonData.setData(payload);
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
			var deletePayload = {
				"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM
			};
			sap.ui.getCore().byId("btnEditSave").setEnabled(false);

			$.ajax({
				url: sUrl,
				type: "DELETE",
				data: JSON.stringify(deletePayload),
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {

					$.ajax({
						url: sUrl,
						type: "POST",
						data: JSON.stringify(payload),
						dataType: "json",
						contentType: "application/json",
						success: function (data, response) {
							sap.ui.core.BusyIndicator.hide();
							//oMpdel.refresh();
							sap.ui.getCore().byId("btnEditSave").setEnabled(true);
							var sMsg = data.message + " The Internal Order Number is " + oMod1.getData().ZINTR_ORDNUM;
							MessageBox.show(
								sMsg, {
									icon: MessageBox.Icon.SUCCESS,
									title: "SUCCESS",
									onClose: this.onAssignClose,
									actions: [MessageBox.Action.CLOSE],
									styleClass: "sapUiSizeCompact myMessageBox"
								}
							);
							//that.onCusAssign(that.oSourceCust);
							that.getOwnerComponent().getModel().refresh();
							that.onUpdateClose(); //_editSalesorderDialog.close();

						},
						error: function (oError) {
							sap.ui.core.BusyIndicator.hide();
							sap.ui.getCore().byId("btnEditSave").setEnabled(true);
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
				error: function (oError) {
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

		/**
		 * This event is fired check customer po number already exists or not showing warning message
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		handleChangeCPONO: function (oEvent) {
			var oPONumberId = sap.ui.getCore().byId("idcpono");
			var viewModel = this.getView().getModel("viewProperties");
			var oModel = this.getOwnerComponent().getModel(),
				sPath = "/OrderHeaderDetails";
			sap.ui.core.BusyIndicator.show();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var that = this;
			if (oPONumberId.getValue() === "") {
				oPONumberId.setValueState("Error");
			} else {
				oPONumberId.setValueState("None");
			}
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUST_PONUM", "EQ", oPONumberId.getValue()), new Filter("ZORD_STATUS", "EQ", "ORCR")],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					if (oResp.results.length) {

						MessageBox.warning(
							"This Customer PO Number Already exists", {
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

		onDeletePress: function (oEvent) {
			var that = this,
				oModel = this.getOwnerComponent().getModel();
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/orderDraft.xsjs";
			var oObject = oEvent.getSource().getBindingContext().getObject();
			var deletePayload = {
				"ZINTR_ORDNUM": oObject.ZINTR_ORDNUM,
				"ZSYSTEM": oObject.ZSYSTEM
			};
			MessageBox.confirm("Please Confirm to delete intrenal order number " + oObject.ZINTR_ORDNUM, {
				title: "Confirm", // default
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function (oAction) {
					if (oAction === "OK") {
						sap.ui.core.BusyIndicator.show();
						$.ajax({
							url: sUrl,
							type: "DELETE",
							data: JSON.stringify(deletePayload),
							dataType: "json",
							contentType: "application/json",
							success: function (data, response) {
								sap.ui.core.BusyIndicator.hide();
								MessageBox.show(
									data.message, {
										icon: MessageBox.Icon.SUCCESS,
										title: "SUCCESS",
										actions: [MessageBox.Action.CLOSE],
										emphasizedAction: MessageBox.Action.CLOSE,
										onClose: function (oAction) {
											if (oAction === "CLOSE") {
												oModel.refresh();
											}
										}

									});

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
					}
				}
			});

		},
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

			/*if (that.getOwnerComponent().sUserRole === 'ADMIN') {
				sFilter = "";
				sPath = "/CustomerDetails/?$select=ZCUSTMR_NUM,ZSYSTEM,ZCUST_NUM,ZCUSTOMER_NAME";
			} else {
				sFilter = new Filter("ZUSR_ID", "EQ", viewProperties.getProperty("/LoginID"));
			}*/
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

		/* orders Controllers end*/

		/* ApproveOrders Controllers Start*/
		getApproveOrderData: function (oDataObject) {

			var viewModel = this.getView().getModel("viewProperties1");

			var oModel = this.getOwnerComponent().getModel(),
				ZINTR_ORDNUM = oDataObject.ZINTR_ORDNUM,
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
					viewModel.setProperty("/ZCREATED_BY", oResp.results[0].ZCREATED_BY);
					viewModel.setProperty("/idlead", false);
					viewModel.setProperty("/idmin", false);
					viewModel.setProperty("/idchk", false);
					viewModel.setProperty("/iddisc", false);
					viewModel.setProperty("/idCommentsinput", "");
					viewModel.setProperty("/ZDOC_ID", "");
					viewModel.setProperty("/FileName", "");
					viewModel.setProperty("/ZDOC_ID", oResp.results[0].ZDOC_ID);
					var sDocId = viewModel.getProperty("/ZDOC_ID"),
						sFileName, sDocId1;
					if (sDocId) {
						sDocId1 = sDocId.split("_MOET_")[0];
						sFileName = sDocId.split("T_S")[1];
						viewModel.setProperty("/FileName", sFileName);
					}
					var oModel1 = that.getOwnerComponent().getModel(),
						ZINTR_ORDNUM1 = oDataObject.ZINTR_ORDNUM,
						sPath1 = "/OrderItemDetails";
					sap.ui.core.BusyIndicator.show();

					that._getShipToValueApprove(oResp.results[0], oResp.results[0].ZSHIP_PRTY);

					var oJsonModel1 = new sap.ui.model.json.JSONModel();

					oModel1.read(sPath1, {
						filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM1)],
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
								if (that.getOwnerComponent().sUserRole === 'CUST') {
									that._oCM1iDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.confirmedOrders", that);
								}else{
									that._oCM1iDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.orderApprove", that);
								}
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
		/**
		 *  This event is fired When switching new and old order clearing data
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		_onClearOrder: function () {
			var oView = sap.ui.getCore();
			var aInputs = [
				oView.byId("idlead"),
				oView.byId("idmin"),
				oView.byId("idchk"),
				oView.byId("iddisc")
			];

			jQuery.each(aInputs, function (i, oInput) {
				oInput.setState(false);
			});
			oView.byId("idCommentsinput").setValue("");

		},
		/**
		 *  This event is fired to approve the order, once approved, the data will be saved in both SAP and HANA
		 * @param {sap.ui.base.Event} oEvent 
		 * @private
		 */

		onAppr: function () {

			var sOrderVal = "";
			var oMpdel = this.getOwnerComponent().getModel();

			var ble = sap.ui.getCore().byId("idlead");
			var bmin = sap.ui.getCore().byId("idmin");
			var bchk = sap.ui.getCore().byId("idchk");
			var bdisc = sap.ui.getCore().byId("iddisc");
			var sComment = sap.ui.getCore().byId("idCommentsinput").getValue();
			var sbleStatus = "",
				sbminStatus = "",
				sbchkStatus = "",
				sbdiscStatus = "";

			if (ble.getState()) {
				sbleStatus = "X";
			}
			if (bmin.getState()) {
				sbminStatus = "X";
			}

			if (bchk.getState()) {
				sbchkStatus = "X";
			}

			if (bdisc.getState()) {
				sbdiscStatus = "X";
			}

			var oTable = sap.ui.getCore().byId("ID_OPEN_ORDER12");
			//
			var oMod2 = this.getView().getModel("OrderData12");
			//var oMod1 = this._oCM1iDialog.getModel("OrderData1");
			var oMod1 = this.getView().getModel("OrderData1");

			this._getSalesAreaValueApprove(oMod1.getData(), oMod1.getData().ZSALES_AREA);
			//return;

			var TrustpaymatterSet = [];
			var TrustpaymatterSetD = [];
			var Trust1 = [];
			var TrustShedu = [];
			var dReqDelDt = oMod2.getData()[0].ZREQ_DLVRYDAT;
			var dPurDt = oMod1.getData().ZCUST_PODAT;
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});
			var dReqdateFormatted = dateFormat.format(dReqDelDt);
			var dPurdateFormatted = dateFormat.format(dPurDt);
			//
			var aItems = oMod2.getData();
			var sFocSmpl;
			if (aItems.length > 0) {
				aItems.forEach(function (item) {
					var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "YYYY-MM-dd"
					});
					TrustpaymatterSet.push({
						"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
						"ZSYSTEM": oMod1.getData().ZSYSTEM,
						"ZINTR_ITEMNUM": item.ZINTR_ITEMNUM,
						"ZMAT_NUM": item.ZMAT_NUM,
						"ZTRGT_QTY": item.ZTRGT_QTY,
						"ZTRGT_QTYUOM": item.ZTRGT_QTYUOM,
						"ZALT_UOM": item.ZALT_UOM,
						"ZREQ_DLVRYDAT": dateFormat1.format(item.ZREQ_DLVRYDAT),
						"ZMIN_QTY": item.ZMIN_QTY,
						"ZFOC_SMPL": item.ZFOC_SMPL,
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": item.ZDISCNT,
						"ZCOST": item.ZCOST,
						"ZGRP_DEVLPR": item.ZGRP_DEVLPR,
						"ZFROZEN_PERIOD": item.ZFROZEN_PERIOD,
						"ZPAL_QUAN": item.ZPAL_QUAN,
						"ZFOC_ITMC_FLAG": item.ZFOC_ITMC_FLAG,
						"ZSCHD_TYPE": item.ZSCHD_TYPE
					});
				});
			}

			var payload = {
				"ZORDER_HEADER": [{
					"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
					"ZSYSTEM": oMod1.getData().ZSYSTEM,
					"ZORD_REF": "X",
					"ZCUST_NUM": oMod1.getData().ZCUST_NUM,
					"ZSHIP_PRTY": oMod1.getData().ZSHIP_PRTY,
					"ZPO_TYP": "X",
					"ZDISCNT": oMod1.getData().ZDISCNT,
					"ZCUST_PONUM": oMod1.getData().ZCUST_PONUM,
					"ZCUST_PODAT": this.formatDate1(oMod1.getData().ZCUST_PODAT),
					"ZDOC_ID": oMod1.getData().ZDOC_ID,
					"ZORD_STATUS": "ORCR",
					"ZORD_NUM": "",
					"ZAPPROVAL_STATUS": "Order Created",
					"ZLEAD_TIME": sbleStatus,
					"ZMIN_ORDER_QUAN": sbminStatus,
					"ZORDER_FORECAST": sbchkStatus,
					"ZFIT_CONTRACT_COND": sbdiscStatus,
					"ZREQ_DELV_DAT": dReqdateFormatted,
					"ZTEDER_FLAG": oMod1.getData().ZTEDER_FLAG,
					"ZSALES_AREA": oMod1.getData().ZSALES_AREA,
					"ZTOTAL_AMT": oMod1.getData().ZTOTAL_AMT,
					"ZFTRADE": oMod1.getData().ZFTRADE,
					"ZFTRADE_DESC": oMod1.getData().ZFTRADE_DESC,
					"ZCURR": oMod1.getData().ZCURR,
					"ZHCURR": oMod1.getData().ZHCURR,
					"ZDISTR_CHNL": oMod1.getData().ZDISTR_CHNL,
					"ZDIVISION": oMod1.getData().ZDIVISION,
					"ZDEL_BLOCK_ID": oMod1.getData().ZDEL_BLOCK_ID,
					"ZORD_APPROVAL_STATUS": "A",
					"ZCOMMENTS": sComment,
					"ZCREATED_BY": oMod1.getData().ZCREATED_BY,
					"ZCHANGED_BY": this.getOwnerComponent().sUserId
				}],
				"ZORDER_ITEM": TrustpaymatterSet
			};

			var aItems1 = oMod2.getData();
			if (aItems1.length > 0) {
				aItems1.forEach(function (item1) {

					if (item1.ZFOC_SMPL === "YYAN") {
						sFocSmpl = "";
					} else {
						sFocSmpl = item1.ZFOC_SMPL;
					}

					TrustpaymatterSetD.push({
						"ItmNumber": item1.ZINTR_ITEMNUM.toString(),
						"Matnr": item1.ZMAT_NUM,
						"TargQty": item1.ZTRGT_QTY,
						"ItmCateg": sFocSmpl,
						"GroupDev": item1.ZGRP_DEVLPR,
						"FreeCharge": item1.ZFOC_ITMC_FLAG
					});
				});
			}

			var aItems12 = oMod2.getData();

			if (aItems12.length > 0) {
				aItems12.forEach(function (item12) {
					Trust1.push({
						"ItmNumber": item12.ZINTR_ITEMNUM.toString(),
						"CondType": "",
						"CondValue": item12.ZDISCNT,
						"Currency": "",
						"GroupDev": item12.ZGRP_DEVLPR
					});
				});
			}

			var dIReqdateF;
			var dodataIreqdt;
			var aItemsSh = oMod2.getData();
			if (aItemsSh.length > 0) {
				aItemsSh.forEach(function (itemSh) {
					dIReqdateF = dateFormat.format(itemSh.ZREQ_DLVRYDAT);
					if (dIReqdateF) {
						dodataIreqdt = dIReqdateF + "T00:00:00";
					} else {
						dodataIreqdt = "2021-01-29" + "T00:00:00";
					}
					TrustShedu.push({
						"ItmNumber": itemSh.ZINTR_ITEMNUM.toString(),
						"SchedLine": itemSh.ZINTR_ITEMNUM.toString(),
						"ReqQty": itemSh.ZTRGT_QTY,
						"SchedType": itemSh.ZSCHD_TYPE,
						"FirstDate": dodataIreqdt,
						"GroupDev": itemSh.ZGRP_DEVLPR,
						"FreeCharge": itemSh.ZFOC_ITMC_FLAG
					});
				});
			}
			var ssystodata = "";
			var sUSystem = oMod1.getData().ZSYSTEM;
			/*if (oMod1.getData().ZSYSTEM === "L") {
				ssystodata = "DLACLNT100";
			} else {
				ssystodata = "C01CLNT100";
			}*/

			var aSystemData = this.getView().getModel("jsonSystemData").getData();

			for (var i = 0; i < aSystemData.length; i++) {

				if (aSystemData[i].Yydesc === "LEAN" && sUSystem === "L") {

					ssystodata = aSystemData[i].Yylow;

				} else if (aSystemData[i].Yydesc === "TEMPO" && sUSystem === "T") {

					ssystodata = aSystemData[i].Yylow;

				}

			}

			var dodatareqdt;
			var dodatapurdt;
			if (dReqdateFormatted) {
				dodatareqdt = dReqdateFormatted + "T00:00:00";
			} else {
				dodatareqdt = this.formatDate1(new Date()) + "T00:00:00";
			}
			if (dPurdateFormatted) {
				dodatapurdt = dPurdateFormatted + "T00:00:00";
			} else {
				dodatapurdt = "";
			}
			var oViewPr = this.getView().getModel("viewProperties1");
			var odatapayload = {
				"IvSoldParty": oMod1.getData().ZCUST_NUM,
				"IvDlvBlock": oMod1.getData().ZDEL_BLOCK_ID,
				"IvCondValue": oMod1.getData().ZDISCNT,
				"IvDistchanl": oMod1.getData().ZDISTR_CHNL,
				"IvTextLine": sComment,
				"IvTendFlag": oMod1.getData().ZTEDER_FLAG,
				"IvDivision": oMod1.getData().ZDIVISION,
				"IvOrdReason": "Y01",
				"IvSalesorg": oMod1.getData().ZSALES_AREA,
				"IvShipParty": oMod1.getData().ZSHIP_PRTY,
				"IvSyssid": ssystodata,
				"Ivdoctype": "YOR",
				"IvReqdt": dodatareqdt,
				"IvPurchdt": dodatapurdt,
				"IvPomethod": "WEB",
				"IvCustRef": oMod1.getData().ZCUST_PONUM,
				"Ftrade": oMod1.getData().ZFTRADE,
				"EvSono": "",
				"IvCurrency": oMod1.getData().ZCURR,
				"Navsocrtescheduleline": TrustShedu,
				"NavSoheaditem": TrustpaymatterSetD,
				"NavSocrtCondition": Trust1,
				"navSoinputreturn": [],
				"ysocrtgroupoutNav": []
			};

			var that = this;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";

			if (ble.getState() === true && bmin.getState() === true && bchk.getState() === true && bdisc.getState() === true) {
				sap.ui.core.BusyIndicator.show();
				that.getOwnerComponent().getModel('MOETSRV').create("/YSOCREATEinputSet", odatapayload, {
					method: "POST",
					success: function (data1, response) {
						//
						sap.ui.core.BusyIndicator.hide();
						var aSMsg = [];
						var sMsg;
						if (data1.EvSono !== "") {
							payload.ZORDER_HEADER[0].ZORD_NUM = data1.EvSono;
							data1.ysocrtgroupoutNav["results"].sort(function (a, b) {
								if (a.ItemNumber < b.ItemNumber) return -1;
								if (a.ItemNumber > b.ItemNumber) return 1;
								return 0;
							});
							for (var k = 0; k < data1.ysocrtgroupoutNav["results"].length; k++) {
								aSMsg[k] = data1.ysocrtgroupoutNav["results"][k].SoNumber;
								if (payload.ZORDER_ITEM[k].ZINTR_ITEMNUM.toString() === Number(data1.ysocrtgroupoutNav["results"][k].ItemNumber).toString()) {
									payload.ZORDER_ITEM[k].ZORD_NUM = data1.ysocrtgroupoutNav["results"][k].SoNumber;
									payload.ZORDER_ITEM[k].ZITEM_NUM = data1.ysocrtgroupoutNav["results"][k].ItemNumber;
								}
							}

							aSMsg = that.getUnique(aSMsg);

							that._onClearOrder();

							that.onAddCM1Close();
							sMsg = "Order Approved and Created. " + "Sales Document Number: " + aSMsg.toString();
							MessageBox.show(
								sMsg, {
									icon: MessageBox.Icon.SUCCESS,
									title: "SUCCESS",
									actions: [MessageBox.Action.CLOSE],
									styleClass: "sapUiSizeCompact myMessageBox"
								}
							);

							$.ajax({
								url: sUrl,
								type: "POST",
								data: JSON.stringify(payload),
								dataType: "json",
								contentType: "application/json",
								success: function (data, response) {
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

						} else {
							if (data1.navSoinputreturn["results"].length === 1) {
								sMsg = data1.navSoinputreturn["results"][0].Message;
								MessageBox.show(
									sMsg, {
										icon: MessageBox.Icon.ERROR,
										title: "ERROR",
										actions: [MessageBox.Action.CLOSE],
										styleClass: "sapUiSizeCompact myMessageBox"
									}
								);
							} else {

								var oErrorJson = new sap.ui.model.json.JSONModel();
								oErrorJson.setData(data1.navSoinputreturn.results);
								if (!that.ErrorMessageDialog) {

									that.ErrorMessageDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.ErrorMessage", that);
									that.getView().addDependent(that.ErrorMessageDialog);
									that.ErrorMessageDialog.setModel(oErrorJson, "oErrorJson");

								}

								that.ErrorMessageDialog.open();

							}
						}

					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.show("Error");
					}
				});

			} else {
				MessageBox.show(
					'Check all boxes, for the order to be approved', {
						icon: MessageBox.Icon.ERROR,
						title: "Approve Orders",
						styleClass: "sapUiSizeCompact",
						initialFocus: "Approve"
					}
				);
			}
		},
		onCloseErrorMessage: function () {
			this.ErrorMessageDialog.close();
		},

		/**
		 * This event is fired to calculate the number of charcters entered in the text area of comments 
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onCommentfun: function (oEvent) {
			var that = this;
			var regex = /^(?![0-9].*$).*/;
			var input = sap.ui.getCore().byId('idCommentsinput').getValue();
			if (!input.match(regex) || input.length >= 132) {
				sap.ui.getCore().byId('idCommentsinput').setValueState("Error");
			} else {
				sap.ui.getCore().byId('idCommentsinput').setValueState("None");
			}
			var oLength = "/132";
			var oCount = "" + oEvent.mParameters.newValue.length + "";
			var oTextcount = oCount.concat(oLength);
			var oText = sap.ui.getCore().byId("idText").setText(oTextcount);

		},

		/**
		 * This event is fired to show whether the order is unique or not
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		getUnique: function (array) {
			var uniqueArray = [];

			// Loop through array values
			for (var i = 0; i < array.length; i++) {
				if (uniqueArray.indexOf(array[i]) === -1) {
					uniqueArray.push(array[i]);
				}
			}
			return uniqueArray;
		},

		/**
		 * This event is fired to review/reject the order and send back the order to open order, with the status of SNOR
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		onReview: function () {
			var sOrderVal = "";
			var oModelTab = this.getOwnerComponent().getModel();

			var ble = sap.ui.getCore().byId("idlead");
			var bmin = sap.ui.getCore().byId("idmin");
			var bchk = sap.ui.getCore().byId("idchk");
			var bdisc = sap.ui.getCore().byId("iddisc");
			var sComment = sap.ui.getCore().byId("idCommentsinput").getValue();
			var sbleStatus = "",
				sbminStatus = "",
				sbchkStatus = "",
				sbdiscStatus = "";

			if (ble.getState()) {
				sbleStatus = "X";
			}
			if (bmin.getState()) {
				sbminStatus = "X";
			}

			if (bchk.getState()) {
				sbchkStatus = "X";
			}

			if (bdisc.getState()) {
				sbdiscStatus = "X";
			}

			var oTable = sap.ui.getCore().byId("ID_OPEN_ORDER12");
			//
			var oMod2 = this.getView().getModel("OrderData12");
			var oMod1 = this._oCM1iDialog.getModel("OrderData1");

			this._getSalesAreaValueApprove(oMod1.getData(), oMod1.getData().ZSALES_AREA);
			//return;

			var TrustpaymatterSet = [];
			var TrustpaymatterSetD = [];
			var Trust1 = [];
			var TrustShedu = [];
			var dReqDelDt = oMod2.getData()[0].ZREQ_DLVRYDAT;
			var dPurDt = oMod1.getData().ZCUST_PODAT;
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "YYYY-MM-dd"
			});
			var dReqdateFormatted = dateFormat.format(dReqDelDt);
			var dPurdateFormatted = dateFormat.format(dPurDt);
			//
			var aItems = oMod2.getData();
			if (aItems.length > 0) {
				aItems.forEach(function (item) {
					var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "YYYY-MM-dd"
					});
					TrustpaymatterSet.push({
						"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
						"ZSYSTEM": oMod1.getData().ZSYSTEM,
						"ZINTR_ITEMNUM": item.ZINTR_ITEMNUM,
						"ZMAT_NUM": item.ZMAT_NUM,
						"ZTRGT_QTY": item.ZTRGT_QTY,
						"ZTRGT_QTYUOM": item.ZTRGT_QTYUOM,
						"ZALT_UOM": item.ZALT_UOM,
						"ZREQ_DLVRYDAT": dateFormat1.format(item.ZREQ_DLVRYDAT),
						"ZMIN_QTY": item.ZMIN_QTY,
						"ZFOC_SMPL": item.ZFOC_SMPL,
						"ZORD_NUM": "",
						"ZITEM_NUM": "",
						"ZDISCNT": item.ZDISCNT,
						"ZCOST": item.ZCOST,
						"ZGRP_DEVLPR": item.ZGRP_DEVLPR,
						"ZFROZEN_PERIOD": item.ZFROZEN_PERIOD,
						"ZPAL_QUAN": item.ZPAL_QUAN,
						"ZFOC_ITMC_FLAG": item.ZFOC_ITMC_FLAG,
						"ZSCHD_TYPE": item.ZSCHD_TYPE
					});
				});
			}

			var payload = {
				"ZORDER_HEADER": [{
					"ZINTR_ORDNUM": oMod1.getData().ZINTR_ORDNUM,
					"ZSYSTEM": oMod1.getData().ZSYSTEM,
					"ZORD_REF": "X",
					"ZCUST_NUM": oMod1.getData().ZCUST_NUM,
					"ZSHIP_PRTY": oMod1.getData().ZSHIP_PRTY,
					"ZPO_TYP": "X",
					"ZDISCNT": oMod1.getData().ZDISCNT,
					"ZCUST_PONUM": oMod1.getData().ZCUST_PONUM,
					"ZCUST_PODAT": this.formatDate1(oMod1.getData().ZCUST_PODAT),
					"ZDOC_ID": oMod1.getData().ZDOC_ID,
					"ZORD_STATUS": "SNOR",
					"ZORD_NUM": "",
					"ZAPPROVAL_STATUS": "Order Created",
					"ZLEAD_TIME": sbleStatus,
					"ZMIN_ORDER_QUAN": sbminStatus,
					"ZORDER_FORECAST": sbchkStatus,
					"ZFIT_CONTRACT_COND": sbdiscStatus,
					"ZREQ_DELV_DAT": dReqdateFormatted,
					"ZTEDER_FLAG": oMod1.getData().ZTEDER_FLAG,
					"ZSALES_AREA": oMod1.getData().ZSALES_AREA,
					"ZTOTAL_AMT": oMod1.getData().ZTOTAL_AMT,
					"ZFTRADE": oMod1.getData().ZFTRADE,
					"ZFTRADE_DESC": oMod1.getData().ZFTRADE_DESC,
					"ZCURR": oMod1.getData().ZCURR,
					"ZHCURR": oMod1.getData().ZHCURR,
					"ZDISTR_CHNL": oMod1.getData().ZDISTR_CHNL,
					"ZDIVISION": oMod1.getData().ZDIVISION,
					"ZDEL_BLOCK_ID": oMod1.getData().ZDEL_BLOCK_ID,
					"ZORD_APPROVAL_STATUS": "A",
					"ZCOMMENTS": sComment,
					"ZCREATED_BY": oMod1.getData().ZCREATED_BY,
					"ZCHANGED_BY": this.getOwnerComponent().sUserId
				}],
				"ZORDER_ITEM": TrustpaymatterSet
			};

			var jsonData = new JSONModel();
			jsonData.setData(payload);
			sap.ui.core.BusyIndicator.show();
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
					MessageBox.show(
						"Order " + payload.ZORDER_HEADER[0].ZINTR_ORDNUM + " is Reviewed", {
							icon: MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							onClose: this.onAssignClose,
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);

					oModelTab.refresh();
					//that._oCM1iDialog.close();
					that.onAddCM1Close();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					that.onAddCM1Close();

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
		},

		/**
		 * This event is fired get sale area information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getSalesAreaValueApprove: function (oResp, sSalesorg) {

			var that = this;
			var sSyssid;
			var viewProperties = this.getView().getModel("viewProperties1");
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

			//debugger;
			var sFData = "/ysaleAreaInputSet(IvCustomer='" + oResp.ZCUST_NUM + "',IvSyssid='" + sSyssid + "')";
			/*	var sFData = "/ysalesAreacustomerInputSet(IvCustomer='" + oResp.ZCUST_NUM + "',IvSyssid='" + sSyssid +  "',IvSalesorg='" 
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
								/*viewProperties.setProperty("/salesId", oData1.NavsalesArea.results[i].Salesorg);
								viewProperties.setProperty("/Distrchn", oData1.NavsalesArea.results[i].Distrchn);
								viewProperties.setProperty("/Division", oData1.NavsalesArea.results[i].Division);*/

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
		 * This event is fired get Shipto information  
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */

		_getShipToValueApprove: function (oResp, Shiptoparty) {
			var viewProperties = this.getView().getModel("viewProperties1");
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerShipToPartyAssignDetails";
			sap.ui.core.BusyIndicator.show();
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

		onAddCM1Close: function () {
			this._oCM1iDialog.close();
			this._oCM1iDialog.getModel("OrderData1").refresh();
			this._oCM1iDialog.getModel("OrderDataF").refresh();
			if (this._oCM1iDialog) {
				this._oCM1iDialog = this._oCM1iDialog.destroy();
			}
		},
		/* ApproveOrders Controllers End*/

		/* Confirm Order Controllers Start*/
		/**
		 * This event is fired to get information of header and item level data
		 * @param {sap.ui.base.Event} oEvent 
		 * @public
		 */
		getConfirmOrderData: function (oDataObject) {

			var oModel = this.getOwnerComponent().getModel(),
				ZINTR_ORDNUM = oDataObject.ZINTR_ORDNUM,
				ZORD_NUM1 = oDataObject.ZORD_NUM,
				sPath = "/OrderHeaderDetails";
			sap.ui.core.BusyIndicator.show();
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oFJsonModel = new sap.ui.model.json.JSONModel();
			var viewModel = this.getView().getModel("viewProperties1");
			viewModel.setProperty("/ZDOC_ID", "");
			viewModel.setProperty("/FileName", "");

			var that = this;
			var res = {};
			oModel.read(sPath, {
				//filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM)],
				filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM), new Filter("ZORD_NUM", "EQ", ZORD_NUM1)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();

					oJsonModel.setData(oResp.results[0]);
					res = oResp.results;
					viewModel.setProperty("/ZDOC_ID", oResp.results[0].ZDOC_ID);
					var sDocId = viewModel.getProperty("/ZDOC_ID"),
						sFileName, sDocId1;
					if (sDocId) {
						sDocId1 = sDocId.split("_MOET_")[0];
						sFileName = sDocId.split("T_S")[1];
						viewModel.setProperty("/FileName", sFileName);
					}

					var oModel1 = that.getOwnerComponent().getModel(),
						ZINTR_ORDNUM1 = oDataObject.ZINTR_ORDNUM,
						//ZORD_NUM1 = oDataObject.ZORD_NUM,
						sPath1 = "/OrderItemDetails";
					sap.ui.core.BusyIndicator.show();

					that._getShipToValueApprove(oResp.results[0], oResp.results[0].ZSHIP_PRTY);

					var oJsonModel1 = new sap.ui.model.json.JSONModel();

					oModel1.read(sPath1, {
						filters: [new Filter("ZINTR_ORDNUM", "EQ", ZINTR_ORDNUM1), new Filter("ZORD_NUM", "EQ", ZORD_NUM1)],
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

							if (!that._ConfirmDialog) {

								that._ConfirmDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.confirmedOrders", that);
								that.getView().addDependent(that._ConfirmDialog);

								that._ConfirmDialog.setModel(oJsonModel, "OrderData1");
								that._ConfirmDialog.setModel(oFJsonModel, "OrderDataF");
							}
							that._ConfirmDialog.open();

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

			//

		},
		onConfirmDilogClose: function () {
			if (this._ConfirmDialog) {
			this._ConfirmDialog.close();
			this._ConfirmDialog.getModel("OrderData1").refresh();
			this._ConfirmDialog.getModel("OrderDataF").refresh();
			}
			if (this._ConfirmDialog) {
				this._ConfirmDialog = this._ConfirmDialog.destroy();
			}
			
			if (this._oCM1iDialog) {
			this._oCM1iDialog.close();
			this._oCM1iDialog.getModel("OrderData1").refresh();
			//this._oCM1iDialog.getModel("OrderDataF").refresh();
			}
			if (this._oCM1iDialog) {
				this._oCM1iDialog = this._oCM1iDialog.destroy();
			}
			
		},
		/* Confirm Order Controllers End*/

		_handleValidation: function () {
			var oView = this.getView();
			var oViewModel = this.getView().getModel("jsonViewMod");
			var aInputs = [
				sap.ui.getCore().byId("f4hCustomer"),
				//sap.ui.getCore().byId("f4hSalesOffc"),
				//        sap.ui.getCore().byId("f4hShipto"),
				//        sap.ui.getCore().byId("iddiscount"),
				sap.ui.getCore().byId("idcpono"),
				sap.ui.getCore().byId("idcpodate")
				//        sap.ui.getCore().byId("idAuthorisedBy")
				//        sap.ui.getCore().byId("idBranchCode"),
				//        sap.ui.getCore().byId("idRefDocNo")

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
			// if (bValidationError === true) {
			//         bValidationError = this.handledNoneError();
			// }
			if (!bValidationError) {
				sap.m.MessageBox.alert("Please fill all required fields");
			}
			return bValidationError;
		},
		handleAmountValid: function () {
			var oTable = sap.ui.getCore().byId("tblupdateorder"),
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

	});

});