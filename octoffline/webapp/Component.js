/*$.sap.declare("glb.gtmh.oct.Component");

sap.ui.core.UIComponent.extend("glb.gtmh.oct.Component", {*/
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	'sap/m/MessageBox',
	"sap/ui/model/json/JSONModel",
	"glb/gtmh/oct/util/Utility"
], function(UIComponent, Device, MessageBox, JSONModel, Utility) {
	"use strict";

	return UIComponent.extend("glb.gtmh.oct.Component", {
	metadata: {
		name: "Ocean_Container_Tracker_v1",
		version: "1.0",
		library: "glb.gtmh.oct",
		autoDestroy: false,
		initOnBeforeRender: true,
		includes: ["css/custom.css", "css/controls.css", "util/d3tip.js"],
		dependencies: {
			libs: ["sap.ui.ux3", "sap.ui.commons", "sap.viz", "sap.ca.ui",
				"sap.ui.table", "sap.ui.layout"
			],
			components: []
		},
		rootView: "glb.gtmh.oct.view.App",
		aggregations: {
			rootControl: {
				type: "sap.ui.core.Control",
				multiple: false,
				visibility: "hidden"
			}
		},
		config: {
			resourceBundle: "i18n/i18n.properties",
			serviceConfig: {
				name: "localData",
				serviceUrl: "model/products.json",
				local: true
			},
			filterValModel: {
				name: "filterVals",
				serviceUrl: "model/filterVals.json"
			},
			usrMktModel: {
				name: "PGTPT_USER_MARKET_SRV",
				serviceUrl: "/sap/opu/odata/GLB/PGTPT_USER_MARKET_SRV/",
				local: false
			},
			GTPT_SRV: {
				name: "1GTPT_OCT_SRV",
				serviceUrl: "/sap/opu/odata/GLB/1GTPT_OCT_SRV/",
				local: true
			},
			GTPT_SRV_PERF: {
				name: "1GTPT_OCT_APP_SRV",
				serviceUrl: "/sap/opu/odata/GLB/1GTPT_OCT_APP_SRV/",
				local: true
			},
			GTPT_CHAT: {
				name: "1GTPT_CHAT_SRV",
				serviceUrl: "/sap/opu/odata/GLB/1GTPT_CHAT_SRV/",
				local: true
			},
			mailModel: {
				name: "PGTPT_EMAIL_SRV",
				serviceUrl: "/sap/opu/odata/GLB/PGTPT_EMAIL_SRV/",
				local: true
			},
			updateModel: {
				name: "RGTPT_PO_UPDAT_SRV",
				serviceUrl: "/sap/opu/odata/GLB/RGTPT_PO_UPDAT_SRV/",
				local: true
			},

			updatePriorityModel: {
				name: "1GTPT_EH_PARAM_UPDATE_SRV",
				serviceUrl: "/sap/opu/odata/GLB/1GTPT_EH_PARAM_UPDATE_SRV",
				local: true

			},

			updateDeliveryDateTMModel: {
				name: "1GTPT_EH_PARAM_UPDATE_SRV",
				serviceUrl: "/sap/opu/odata/GLB/1GTPT_EH_PARAM_UPDATE_SRV",
				local: true

			},

			batchModel: {
				name: "RGTPT_BATCH_SRV",
				serviceUrl: "/sap/opu/odata/GLB/RGTPT_BATCH_SRV/",
				local: true
			},

			updateContainerModel: {
				name: "1GTPT_EH_PARAM_UPDATE_SRV",
				serviceUrl: "/sap/opu/odata/GLB/1GTPT_EH_PARAM_UPDATE_SRV/",
				local: true

			}
		},

		routing: {
			config: {
				viewType: "XML",
				viewPath: "glb.gtmh.oct.view",
				// targetControl: 'MainApp',
				targetAggregation: "pages",
				clearTarget: false,
				transition:"show"
			},

			routes: [{
				pattern: "",
				name: "Root",
				view: "Root",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "#",
				name: "RootNav",
				view: "Root",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "Dashboard/{direction}/{type}/{fromDate}/{toDate}/{companyCode}",
				name: "DashboardP",
				view: "Root",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "PlanningAdvisor",
				view: "RouteDetail",
				name: "PlanningAdvisor",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "PlanningAdvisor/{direction}/{type}/{fromDate}/{toDate}/{companyCode}",
				view: "RouteDetail",
				name: "PlanningAdvisorP",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "ContainerDetail/{direction}/{type}/{fromDate}/{toDate}/{companyCode}/guid/{guid}",
				view: "ContainerDtl",
				name: "ContainerDetailP",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "DistributionCenterLoad",
				view: "DistCenterLoad",
				name: "DistributionCenterLoad",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "DistributionCenterLoad/{direction}/{type}/{fromDate}/{toDate}/{companyCode}",
				view: "DistCenterLoad",
				name: "DistributionCenterLoadP",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				pattern: "Error",
				view: "Error",
				name: "Error",
				targetControl: 'MainApp',
				targetAggregation: "pages"
			}, {
				name: "catchallRoot",
				view: "NotFound",
				targetAggregation: "pages",
				targetControl: "MainApp",
				subroutes: [{
					pattern: ":all*:",
					name: "catchallDetail",
					view: "NotFound",
					transition: "show"
				}]
			}]
		}
	},

	init: function() {
		$.sap.log.setLevel($.sap.log.Level.INFO);
		$.sap.require("sap.ui.core.routing.History");
		$.sap.require("sap.m.routing.RouteMatchedHandler");
		var sValue = $.sap.getUriParameters().get("target");
		if (sValue !== null && typeof sValue !== 'undefined') {
			var url = window.location.href;
			var parts = url.split("?");
			window.location.href = parts[0] + "#" + sValue;
		}
		this.setAppProperties();
		this.setParamModel();
		this.setFilterModel();
		this._dateSelectionDialog=null;
		this.oFilterLoadFinishedDef=$.Deferred();
		var mConfig = this.getMetadata().getConfig();

		//For GA Tagging
		var appVer = this.getMetadata().getVersion();
		//for dedicated tracker
		/*ga('set', 'anonymizeIp', 'true');
		ga('set', 'dimension1', 'preprod');
		ga('set', 'dimension2', appVer);*/

		//for GSC tracker
		/*ga('bsscTracker.set', 'anonymizeIp', 'true');
		ga('bsscTracker.set', 'dimension1', 'Ingenius');
		ga('bsscTracker.set', 'dimension2', 'OCT');
		ga('bsscTracker.set', 'dimension3', appVer);
		ga('bsscTracker.set', 'dimension4', 'preprod');*/

		var sfilterValModelUrl = mConfig.filterValModel.serviceUrl;
		var sUsrMktModelUrl = mConfig.usrMktModel.serviceUrl;
		var sOctSrvUrl = mConfig.GTPT_SRV_PERF.serviceUrl;
		// Always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var oRootPath = $.sap.getModulePath("glb.gtmh.oct");

		// Set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")
		});
		this.setModel(i18nModel, "i18n");
		// Set i18n model for en-US
		var i18nEnModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl: [oRootPath, mConfig.resourceBundle].join("/"),
			bundleLocale: "en-US"
		});
		this.setModel(i18nEnModel, "i18nEn");
		this.oBundle = this.getModel("i18n").getResourceBundle();
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		var bI = sap.ui.controller("glb.gtmh.oct.controller.BaseController");
        // var bI=BaseController;
		$.sap.require("sap.m.MessageBox");
		var filterValModel = new sap.ui.model.json.JSONModel(sfilterValModelUrl);
		filterValModel.attachRequestCompleted(function(oEvent) {
			this.setModel(filterValModel, "filterValModel");
			bI.BUSY_DIALOG.setText(this.oBundle.getText("fetchUsrDtl"));
			bI.busyIndicatorShow();
			// var oUser = sap.ui2.shell.getUser();
			// oUser.load({}, $.proxy(function() {

					bI.BUSY_DIALOG.setText("");
					bI.busyIndicatorHide();
					var userID = "DIBDEO";//oUser.getId();
					var usrModel = new sap.ui.model.json.JSONModel();
					usrModel.setData({
						UserId: userID,
						FirstName: "Dibya",//oUser.getFirstName(),
						LastName: "Deo"//oUser.getLastName()
					});
					this.setModel(usrModel, "usrModel");
					var localModel = new sap.ui.model.json.JSONModel();
					var usrMktModel = new sap.ui.model.json.JSONModel();
					usrMktModel.setData({});
					localModel.setSizeLimit(99999);
					bI.BUSY_DIALOG.setText(this.oBundle.getText("fetchUsrMkt"));
					bI.busyIndicatorShow();

					this.oCompCodeLoadFinishedDef = $.Deferred();
					this.oUsrLoadFinishedDef = $.Deferred();
					this.oUsrMktLoadFinishedDef = $.Deferred();
					var oUsrMktModel = new sap.ui.model.odata.ODataModel(sUsrMktModelUrl, true);
					oUsrMktModel.oHeaders = {
						"DataServiceVersion": "2.0",
						"MaxDataServiceVersion": "2.0"
					};
					var oCompCodeModel = new sap.ui.model.odata.ODataModel(sOctSrvUrl, true);
					oCompCodeModel.oHeaders = {
						"DataServiceVersion": "2.0",
						"MaxDataServiceVersion": "2.0"
					};
					oCompCodeModel.read("/UserCompanySet?$filter=UserId eq '" + userID + "'", null, null, false,
						$.proxy(function(oData) {
							if (oData.results.length > 0) {
								var companyCodes = [];
								for (var i = 0; i < oData.results.length; i++) {
									if (Utility.hasValue(oData.results[i].CompanyCode)) {
										companyCodes.push(oData.results[i].CompanyCode);
									}
								}
								usrMktModel.setProperty("/CompanyCodes", companyCodes);
							}
							this.oCompCodeLoadFinishedDef.resolve();
						}, this),
						$.proxy(function(oData) {
							usrMktModel.setProperty("/CompanyCodes", []);
							this.oCompCodeLoadFinishedDef.reject();
						}, this)
					);
					oUsrMktModel.read("/UserMarketSet('" + userID + "')", null, null, false, $.proxy(function(oData) {

						bI.BUSY_DIALOG.setText("");
						bI.busyIndicatorHide();
						usrMktModel.setProperty("/CompCode", oData.CompCode.split(","));
						usrMktModel.setProperty("/Market", oData.Market);
						usrMktModel.setProperty("/UserId", oData.UserId);
						usrMktModel.setProperty("/Page", oData.Page);
						usrMktModel.setProperty("/PortalURL", oData.PortalURL);
						usrMktModel.setProperty("/SysAliasAPO", oData.SysAliAPO);
						usrMktModel.setProperty("/SupportMktInd", oData.SupportMktInd);
						this.oUsrMktLoadFinishedDef.resolve();
					}, this), $.proxy(function(oData) {
						bI.BUSY_DIALOG.setText("");
						bI.busyIndicatorHide();
						this.oUsrMktLoadFinishedDef.reject();
						this.oOverlayDef=$.Deferred();
						this.getEventBus().publish("all", "showOverlay", {
							src: "Component"
						});
						this.displayError(oData.response.body, this.oBundle.getText("errNoData"));
					}, this));

					//New
					$.when(this.oCompCodeLoadFinishedDef, this.oUsrMktLoadFinishedDef).then($.proxy(function() {

							var compCode = null;
							if (usrMktModel.getProperty("/SupportMktInd") === "X") {
								compCode = usrMktModel.getProperty("/CompCode");

							} else {
								compCode = usrMktModel.getProperty("/CompanyCodes");
							}
							if (compCode.length > 0 && Utility.hasValue(compCode[0])) {
								this.createMarketListModel(compCode, true);
								usrMktModel.setProperty("/showCompCodes", true);
								// ga('set', 'dimension3', compCode[0]);
								
							} else {
								this.createMarketListModel(usrMktModel.getProperty("/Market"), false);
								compCode = [usrMktModel.getProperty("/Market")];
								usrMktModel.setProperty("/showCompCodes", false);
								// ga('set', 'dimension3', usrMktModel.getProperty("/Market"));
							}
							usrMktModel.setProperty("/actualCompCodes", compCode);
							this.setModel(usrMktModel, "usrMktModel");
							//this.createMarketListModel(oData.Market);
							this.createStickyParameters();
							this.oUsrLoadFinishedDef.resolve();
							// ga('set', 'dimension4', "Inbound");
							var router = this.getRouter();
							this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
							router.initialize();
							this.oOverlayDef=$.Deferred();
							this.getEventBus().publish("all", "showOverlay", {
								src: "Component"
							});
						}, this),
						$.proxy(function() {
							if (this.oCompCodeLoadFinishedDef.state() === "rejected" && this.oUsrMktLoadFinishedDef.state() === "resolved") {
								var compCode = null;
								if (usrMktModel.getProperty("/SupportMktInd") === "X") {
									compCode = usrMktModel.getProperty("/CompCode");

								} else {
									compCode = usrMktModel.getProperty("/CompanyCodes");
								}
								if (compCode.length > 0 && Utility.hasValue(compCode[0])) {
									this.createMarketListModel(compCode, true);
									usrMktModel.setProperty("/showCompCodes", true);
									// ga('set', 'dimension3', compCode[0]);
								} else {
									this.createMarketListModel(usrMktModel.getProperty("/Market"), false);
									compCode = [usrMktModel.getProperty("/Market")];
									usrMktModel.setProperty("/showCompCodes", false);
									// ga('set', 'dimension3', usrMktModel.getProperty("/Market"));
								}
								usrMktModel.setProperty("/actualCompCodes", compCode);
								this.setModel(usrMktModel, "usrMktModel");
								//this.createMarketListModel(oData.Market);
								this.createStickyParameters();
								this.oUsrLoadFinishedDef.resolve();
								// ga('set', 'dimension4', "Inbound");
								var router = this.getRouter();
								this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
								router.initialize();
								this.oOverlayDef=$.Deferred();
    							this.getEventBus().publish("all", "showOverlay", {
    								src: "Component"
    							});
								// this.getEventBus().publish("root", "loadData", {
								// 	src: "Component"
								// });
							}
						}, this)
					);

				// }, this),
				/*$.proxy(function(oData) {
					bI.BUSY_DIALOG.setText("");
					bI.busyIndicatorHide();
					this.oUsrLoadFinishedDef.reject();
					this.oOverlayDef=$.Deferred();
					this.getEventBus().publish("all", "showOverlay", {
						src: "Component"
					});
					this.displayError(oData.response.body, this.oBundle.getText("err"));
				}, this));*/

		}, this);

		// Set device model
		var oDeviceModel = new sap.ui.model.json.JSONModel({
			isTouch: sap.ui.Device.support.touch,
			isNoTouch: !sap.ui.Device.support.touch,
			isPhone: sap.ui.Device.system.phone,
			isNoPhone: !sap.ui.Device.system.phone,
			listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
			listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
		});
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");
	},
	displayError: function(body, title) {
		$.sap.require("sap.m.MessageBox");
		var error = "";
		try {
			var xmlDoc = $.parseXML(body);
			var $xml = $(xmlDoc);
			var $errMsg = $xml.find("message");
			error = $errMsg.text();
		} catch (err) {
			error = JSON.parse(body).error.message.value;
		}

		sap.m.MessageBox.alert(error, {
			styleClass: "sapUiSizeCompact",
			icon: sap.m.MessageBox.Icon.ERROR,
			title: title,
			onClose:$.proxy(function(){this.getOwnerComponent().oOverlayDef.resolve();},this)
		});
	},
	destroy: function() {
		if (this.routeHandler) {
			this.routeHandler.destroy();
		}
		sap.ui.core.UIComponent.destroy.apply(this, arguments);
	},
	getEventBus: function() {
		return sap.ui.getCore().getEventBus();
	},
	createMarketListModel: function(usrMkt, showCompCodes) {
		var marketListModel = new sap.ui.model.json.JSONModel();
		var oMktModel = new sap.ui.model.json.JSONModel();
		var list = [],
			defaultCC = null;
		if (showCompCodes) {
			defaultCC = usrMkt[0];
			for (var i = 0; i < usrMkt.length; i++) {
				list.push({
					"name": "Other Company \u279c " + usrMkt[i],
					"direction": "Inbound",
					"key": "Inbound-" + usrMkt[i]
				});
				list.push({
					"name": usrMkt[i] + " \u279c Other Company",
					"direction": "Outbound",
					"key": "Outbound-" + usrMkt[i]
				});
			}
			marketListModel.setData({
				CountryCollection: list
			});
		} else {
			if ($.isArray(usrMkt)) {
				defaultCC = usrMkt[0];
			} else {
				defaultCC = usrMkt;
			}
			marketListModel.setData({
				CountryCollection: [{
					"name": "Other market \u279c " + defaultCC,
					"direction": "Inbound",
					"key": "Inbound-" + defaultCC
				}, {
					"name": defaultCC + " \u279c Other Market",
					"direction": "Outbound",
					"key": "Outbound-" + defaultCC
				}]
			});
		}

		this.setModel(marketListModel, "marketListModel");

		oMktModel.setData({
			direction: "Inbound",
			mkt: defaultCC,
			key: "Inbound-" + defaultCC
		});
		this.setModel(oMktModel, "oMktModel");
	},
	createStickyParameters: function() {
		var userId = this.getModel("usrMktModel").getProperty("/UserId");
		var fromDateCookie = userId + '-fromDate';
		var toDateCookie = userId + '-toDate';
		var directionCookie = userId + '-direction';
		var companyCodeCookie = userId + '-companyCode';
		var typeCookie = userId + '-type';
		var mindt = new Date();
		var maxdt = new Date();
		maxdt.setDate(maxdt.getDate() + 21);
		try {
			maxdt = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern: "yyyyMMdd",
					UTC: true
				}).format(maxdt);
			mindt = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern: "yyyyMMdd",
					UTC: true
				}).format(mindt);
		} catch (err) {
			$.sap.log.error(this.oBundle.getText("errDateFormat"));
		}
		var oMktModel = this.getModel("usrMktModel");
		if (oMktModel.getProperty("/showCompCodes") === true) {
			if (!$.cookie(companyCodeCookie)) {
				$.cookie(companyCodeCookie, oMktModel.getProperty("/actualCompCodes")[0], {
					expires: 3650
				});
			} else {
				var currCC = $.cookie(companyCodeCookie);
				if ($.inArray(currCC, oMktModel.getProperty("/actualCompCodes")) === -1) {
					$.cookie(companyCodeCookie, oMktModel.getProperty("/actualCompCodes")[0], {
						expires: 3650
					});
					this.getModel("oMktModel").setProperty("/mkt", oMktModel.getProperty("/actualCompCodes")[0]);
				} else {
					this.getModel("oMktModel").setProperty("/mkt", currCC);
				}
			}
		}
		if (!$.cookie(fromDateCookie) || !$.cookie(toDateCookie) || !$.cookie(directionCookie) || !$.cookie(typeCookie)) {
			$.cookie(fromDateCookie, mindt, {
				expires: 3650
			});
			$.cookie(toDateCookie, maxdt, {
				expires: 3650
			});
			$.cookie(directionCookie, this.getModel("oMktModel").getProperty("/direction"), {
				expires: 3650
			});
			$.cookie(typeCookie, this.getModel("oMktModel").getProperty("/direction") === "Inbound" ? "Departure" : "Arrival", {
				expires: 3650
			});
		} else {
			var isRA = false,
				isRD = true;
			if ($.cookie(typeCookie) === "Arrival") {
				isRD = false;
				isRA = true;
			}
			var oDateRangeModel = new sap.ui.model.json.JSONModel();
			oDateRangeModel.setData({
				max: $.cookie(toDateCookie),
				min: $.cookie(fromDateCookie),
				rA: isRA,
				rD: isRD
			});
			this.setModel(oDateRangeModel,
				"dateRangeModel");
			this.getModel("oMktModel").setProperty("/direction", $.cookie(directionCookie));
			this.getModel("oMktModel").setProperty("/key", this.getModel("oMktModel").getProperty("/direction") + "-" +
				this.getModel("oMktModel").getProperty("/mkt"));
		}
		this.updateAppProperties();
	},
	updateAppProperties: function() {
		var userId = this.getModel("usrMktModel").getProperty("/UserId");
		var fromDateCookie = userId + '-fromDate';
		var toDateCookie = userId + '-toDate';
		var directionCookie = userId + '-direction';
		var companyCodeCookie = userId + '-companyCode';
		var typeCookie = userId + '-type';
		var fromDate=$.cookie(fromDateCookie);
		var toDate=$.cookie(toDateCookie);
		var direction = $.cookie(directionCookie);
		var type = $.cookie(typeCookie);
		var oAppModel = this.getModel("appProperties");
		oAppModel.setProperty("/fD", fromDate);
		oAppModel.setProperty("/tD",toDate);
		oAppModel.setProperty("/direction", direction);
		oAppModel.setProperty("/type", type);
		oAppModel.setProperty("/isRA", type === "Arrival" ? true : false);
		oAppModel.setProperty("/isRD", type === "Departure" ? true : false);
		oAppModel.setProperty("/dateRangeText",type==="Arrival"?
		this.oBundle.getText("arrText",[Utility.dateConvert(fromDate,"yyyyMMdd",false,true),Utility.dateConvert(toDate,"yyyyMMdd",false,true)])
		:this.oBundle.getText("depText",[Utility.dateConvert(fromDate,"yyyyMMdd",false,true),Utility.dateConvert(toDate,"yyyyMMdd",false,true)]));
		oAppModel.setProperty("/mktOrCC", $.cookie(companyCodeCookie));

	},
	setAppProperties: function() {
		var mindt = new Date();
		var maxdt = new Date();
		maxdt.setDate(maxdt.getDate() + 21);
		maxdt = sap.ui.core.format.DateFormat
			.getDateInstance({
				pattern: "yyyyMMdd",
				UTC: true
			}).format(maxdt);
		mindt = sap.ui.core.format.DateFormat
			.getDateInstance({
				pattern: "yyyyMMdd",
				UTC: true
			}).format(mindt);
		var appProperties = new sap.ui.model.json.JSONModel();
		appProperties.setData({
			defaultFD: mindt,
			defaultTD: maxdt,
			defaultDirection: "Inbound",
			defaultType: "Arrival",
			defaultIsRA: true,
			defaultIsRD: false,
			oldFD: null,
			oldTD: null,
			oldDirection: null,
			oldType: null,
			oldIsRA: null,
			oldIsRD: null,
			oldMktOrCC: null,
			fD: null,
			tD: null,
			direction: null,
			type: null,
			isRA: null,
			isRD: null,
			mktOrCC: null,
			isCustomHashChange:false,
			isDashboardLoaded:false,
			isPALoaded:false,
			isDCLLoaded:false,
			isDCLBusy:false,
			isDashboardBusy:false,
			isPABusy:false
		});
		this.setModel(appProperties, "appProperties");
	},
	setParamModel:function(){
		var oAppModel=this.getModel("appProperties");
		var paramModel = new sap.ui.model.json.JSONModel();
        paramModel.setData({
          direction: oAppModel.getProperty("/defaultDirection"),
          type: oAppModel.getProperty("/defaultType"),
          fromDate: oAppModel.getProperty("/defaultFD"),
          toDate: oAppModel.getProperty("/defaultTD"),
          companyCode:oAppModel.getProperty("/defaultMktOrCC")
        });
        this.setModel(paramModel,"paramModel");
	},
	setFilterModel:function(){
	    var oModel=new sap.ui.model.json.JSONModel();
			oModel.setData({
			  destFilter: [],
    	      catFilter: [],
    	      categoryFilter:[],
    	      polFilter: [],
    	      poaFilter: [],
    	      prdFilter: [],
    	      productFilter:[],
    	      allFilters: new sap.ui.model.Filter({
    	        aFilters: []
    	      }),
    	      alignFilter: [],
    	      priorityFilter: [],
    	      countryFilter: [],
    	      /*destFilterUC: [],
    	      catFilterUC: [],
    	      categoryFilterUC:[],
    	      polFilterUC: [],
    	      poaFilterUC: [],
    	      prdFilterUC: [],
    	      productFilterUC:[],
    	      allFiltersUC: new sap.ui.model.Filter({
    	        aFilters: []
    	      }),
    	      alignFilterUC: [],
    	      priorityFilterUC: [],
    	      countryFilterUC: [],*/
    	      nullFilterFlag:false,
    	      oSearchLoadFinishedDeferred:$.Deferred()
			});
			this.setModel(oModel,"filterModel");
	}
});
});