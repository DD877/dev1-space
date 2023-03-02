sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"glb/gtmh/oct/util/Utility",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/core/routing/HashChanger",
	"glb/gtmh/oct/util/Formatter"
], function(Controller, UIComponent, Utility, Filter, JSONModel, DateFormat, MessageBox, History, HashChanger,formatter) {
	"use strict";

	return Controller.extend("glb.gtmh.oct.controller.BaseController", {
        formatter:formatter,
		_dateSelectionDialog: null,
		oldMin: null,
		oldMax: null,
		oldRA: null,
		oldRD: null,
		/*destFilter: [],
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
	      destFilterUC: [],
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
	      countryFilterUC: [],
	      nullFilterFlag:false,*/
		noComputation: false,
		initialAppLoad: true,
		BUSY_DIALOG: new sap.m.BusyDialog({
			text: "",
			customIcon: "./img/updating.gif",
			customIconDensityAware: false,
			customIconHeight: "32px",
			customIconRotationSpeed: 0,
			customIconWidth: "32px"
		}),
		APPID: 'OCT',
		DASHBOARD: "Dashboard",
		PA: "Planning Advisor",
		DCL: "Distribution Center Load",
		DETAIL: "Detail View",
		EvtCat: {
			FILTER: "Filter",
			PANE: "Pane",
			DATE: "Date",
			FLIP: "Flip",
			SET_CNUM: "Set Container Nbr",
			UPD_DDATE: "Update Delivery Date",
			GTNEXUS: "GTNexus",
			ALL_EVT: "All Events",
			P_FLAG: "Priority Flag",
			SKU: "SKU",
			PO: "PO",
			STO: "STO",
			ASN: "ASN",
			CHART_RANGE: "Chart Range",
			SEARCH: "Search",
			DASHBOARD: "Dashboard",
			USR_VOICE: "User Voice"
		},
		EvtAct: {
			USE: "Use",
			SEE_ALL: "See All",
			HIDE: "Hide",
			SHOW: "Show",
			CHANGE: "Change",
			CLICK: "Click",
			SEND: "Send",
			OPEN: "Open",
			UPD: "Update",
			DIS_RES: "Display Results",
			LOAD_MORE: "Load More",
			RATING: "Rating",
			FEEDBACK: "Feedback"
		},
		DELIMITER: '|',
		GTNEXUS_URL: "https://network.gtnexus.com/vismgr/container_move_view.jsp?&doQbe=true&date_type=2&dr_date_type_ref=13&isqsearch=true&containerNum=",
		dtDiff: null,
		oBundle: null,
		// oBundleEn: $.sap.resources({
		// 	url: "./i18n/i18n.properties",
		// 	locale: "en-US"
		// }),
		mE: null,
		mL: null,
		filterValModel: null,
		oLoadFinishedDef: null,
		oBatchLoadFinishedDef: null,
		oDetailLoadFinishedDef: null,
		oExcelLoadFinishedDef: null,
		// GM - 07/09/2015 - Text replacement
		constructor: function() {
			//this.setMouseEventType();
			// 			this.setFilterLoadDefObj();
			this.mE = "mouseenter";
			this.mL = "mouseleave";
			// 			this.nullFilterFlag=false;
			// 			this.resetFilters();
			this.oBundle = $.sap.resources({
				url: "./i18n/i18n.properties",
				locale: sap.ui.getCore().getConfiguration()
					.getLanguage()
			});
// 			this._dateSelectionDialog=null;
			this.BUSY_DIALOG.setTitle(this.oBundle.getText("busyloadingdialogtitle"));
		},
		/**
		 * On Init
		 * @returns {undefined}
		 */
		onInit: function() {
			this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
			this.oAppModel = this.getModel("appProperties");
			this.oParamModel = this.getModel("paramModel");
			this.oBundleEn = this.getModel("i18nEn").getResourceBundle();
			this.oDefaultODataParams = {
				json: true,
				headers: {
					"DataServiceVersion": "2.0",
					"MaxDataServiceVersion": "2.0"
				}
			};
			// $.when(this.getOwnerComponent().oUserLoadDef).always($.proxy(function(){
			this.getView().setModel(this.getModel("appProperties"), "appProperties");
			// },this));
		},
        handleIconTabBarSelect:function(oEvent){
          this.getView().byId("idIconTabBar").setSelectedKey("OT");
        },
		/**
		 * To hide the busy indicator
		 */
		busyIndicatorHide: function() {
			this.BUSY_DIALOG.close();
		},

		/**
		 * To show the busy indicator
		 */
		busyIndicatorShow: function() {
			this.BUSY_DIALOG.open();

		},
		getDateSelectionDialog:function(){
		  return this.getOwnerComponent()._dateSelectionDialog;  
		},
		setDateSelectionDialog:function(val){
		    this.getOwnerComponent()._dateSelectionDialog=val;
		},
		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			if (sName) {
				return this.getOwnerComponent().getModel(sName);
			} else {
				return this.getOwnerComponent().getModel();
			}
		},
		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			if ($.isEmptyObject(this._oResourceBundle)) {
				this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			}
			return this._oResourceBundle;
		},
		/**
		 *
		 * @param {type} key
		 * @returns {BaseController_L6.BaseControllerAnonym$1@pro;_oResourceBundle@call;getText}
		 */
		getTextFromBundle: function(key) {
			return this.getResourceBundle().getText(key);
		},
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return UIComponent.getRouterFor(this);
		},

		getEventBus: function() {
			return sap.ui.getCore().getEventBus();
		},
		/**
		 *
		 * @returns {undefined}
		 */
		onRouteMatched: function() {
			//abstract method, child will implement it.
		},
		/*getResourceBundle: function() {
			return this.oBundle;
		},
		getEventBus: function() {
			return this.getOwnerComponent().getEventBus();
		},

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},*/

		setFilterValModel: function(fvm) {
			this.filterValModel = fvm;
		},

		trackGAEvent: function(category, action, label) {
			// ga('send', 'event', category, action, label);
		},
		trackGAScreenEvent: function(path, title) {
		/*	ga('send', 'pageview', {
				'page': path,
				'title': title
			});*/
		},

		getFilterVal: function(filterSection) {
			var fv = this.getOwnerComponent().getModel(
				"filterValModel").getProperty(
				"/" + filterSection + "/0");
			return fv;
		},
		/**
		 * To detect browser and set mouse events
		 */
		setMouseEventType: function() {
			this.mE = "mouseenter";
			this.mL = "mouseleave";
		},
		//Change for GTNexus Button Url-14/09/2015
		openGTNexusUrl: function(cnum) {
			var url = this.GTNEXUS_URL + cnum;
			window.open(url, '_blank');
		},
		//
		displayError: function(body, title) {
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
				title: title
			});
		},
		setDefaultModels: function(fD, tD, direction, type, companyCode) {
			var userId = this.getOwnerComponent().getModel("usrMktModel").getProperty("/UserId");
			var fromDateCookie = userId + '-fromDate';
			var toDateCookie = userId + '-toDate';
			var directionCookie = userId + '-direction';
			var companyCodeCookie = userId + '-companyCode';
			var typeCookie = userId + '-type';
			var dtRangeText = null;
			var fromDate = null;
			var toDate = null;
			var rA = false;
			var rD = false;
			var fType = null;
			if (direction === null || typeof direction === 'undefined' || direction === "") {
				direction = $.cookie(directionCookie);
			}
			if (fD === null || typeof fD === 'undefined' || fD === "") {
				fD = $.cookie(fromDateCookie);
			}
			if (tD === null || typeof tD === 'undefined' || tD === "") {
				tD = $.cookie(toDateCookie);
			}
			if (!Utility.hasValue(companyCode)) {
				if ($.cookie(companyCodeCookie)) {
					companyCode = $.cookie(companyCodeCookie);
				} else {
					companyCode = this.getOwnerComponent().getModel("oMktModel").getProperty("/mkt");
				}
			}
			if (!Utility.hasValue(type)) {
				if ($.cookie(typeCookie)) {
					type = $.cookie(typeCookie);
				}
				// else {
				// 	type = this.getModel("appProperties").getProperty("/defaultType");
				// }
			}
			if (typeof direction === 'undefined') {
				direction = this.getModel("appProperties").getProperty("/defaultDirection");
				// mktCtx = "/CountryCollection/0/direction";
			} else {
				this.updateMktModel(direction, companyCode);
				this.getModel("appProperties").setProperty("/direction", direction);
				this.getModel("appProperties").setProperty("/mktOrCC", companyCode);
			}
			if (typeof this.getView().byId("marketList").getModel() === 'undefined') {
				this.getView().byId("marketList").setModel(this.getOwnerComponent().getModel("marketListModel"));
			}
			this.getView().byId("marketList").setSelectedKey(this.getOwnerComponent().getModel("oMktModel").getProperty("/key"));

			if (typeof type === 'undefined') {
				//Change for Arrival & Departure date - 11-04-2016
				if (direction === "Inbound") {
					type = "Arrival";
					this.getModel("appProperties").setProperty("/type", type);
					rD = false;
					rA = true;
					this.getModel("appProperties").setProperty("/isRA", rA);
					this.getModel("appProperties").setProperty("/isRD", rD);
				} else {
					type = "Departure";
					this.getModel("appProperties").setProperty("/type", type);
					rA = false;
					rD = true;
					this.getModel("appProperties").setProperty("/isRA", rA);
					this.getModel("appProperties").setProperty("/isRD", rD);
				}
				//End Change for Arrival & Departure date - 11-04-2016
			} else {
				if (type === "Arrival") {
					rA = true;
				} else if (type === "Departure") {
					rD = true;
				}
			}
			if (rA === true) {
				fType = this.getResourceBundle().getText("arrBet");
			} else {
				fType = this.getResourceBundle().getText("depBet");
			}
			if (typeof fD !== 'undefined' && typeof tD !== 'undefined') {
				fromDate = fD;
				toDate = tD;

			} else {
				// var mindt = new Date();
				// var maxdt = new Date();
				// maxdt.setDate(maxdt.getDate() + 21);
				// try {
				// 	maxdt = sap.ui.core.format.DateFormat
				// 		.getDateInstance({
				// 			pattern: "yyyyMMdd",
				// 			UTC: true
				// 		}).format(maxdt);
				// 	mindt = sap.ui.core.format.DateFormat
				// 		.getDateInstance({
				// 			pattern: "yyyyMMdd",
				// 			UTC: true
				// 		}).format(mindt);
				// } catch (err) {
				// 	$.sap.log.error(this.getResourceBundle()
				// 		.getText("errDateFormat"));
				// }
				fromDate = this.getModel("appProperties").getProperty("/defaultFD");
				toDate = this.getModel("appProperties").getProperty("/defaultTD");

			}
			if (typeof this.getOwnerComponent().getModel("LocalModel") === 'undefined') {
				this.oLoadFinishedDef = $.Deferred();
				var localModel = new sap.ui.model.json.JSONModel();
				localModel.setSizeLimit(99999);
				this.getOwnerComponent().setModel(localModel, "LocalModel");
				this.getModel("appProperties").setProperty("/fD", fromDate);
				this.getModel("appProperties").setProperty("/tD", toDate);
				var oDateRangeModel = new sap.ui.model.json.JSONModel();
				oDateRangeModel.setData({
					max: toDate,
					min: fromDate,
					rA: rA,
					rD: rD
				});
				this.getOwnerComponent().setModel(oDateRangeModel,
					"dateRangeModel");

				dtRangeText = Utility.dateConvert(fromDate, "yyyyMMdd") + " - " + Utility.dateConvert(toDate, "yyyyMMdd");
				this.getView().byId("dateRangeText").setText(
					dtRangeText);
				var strtext = {
					"arrivalbet": fType,
					"fromDate": fromDate,
					"toDate": toDate,
					"dtRangeText": dtRangeText
				};

				var jsonmodel = new sap.ui.model.json.JSONModel();
				jsonmodel.setData(strtext);
				this.getOwnerComponent().setModel(jsonmodel,
					"dtRangeTextmodel");
			}
			var view = this.getView();
			var viewName = view.getViewName().split(".").pop();
			if (viewName === "Root") {
				viewName = "Dashboard";
			} else if (viewName === "RouteDetail") {
				viewName = "PlanningAdvisor";
			} else if (viewName === "DistCenterLoad") {
				viewName = "DCL";
			}
			// this.setCustomHashChange(true);
			// this.initiateMainServiceCall(false,false,viewName);
			/*	this.getODataModel(fromDate, toDate);
				this.waitForDefaultLoad(function() {

					var model = this.getOwnerComponent().getModel("LocalModel");
					var calcModel = new sap.ui.model.json.JSONModel(model.oData);
					var oBindingforCalc = calcModel
						.bindList("/ProductCollection");
					if (oBindingforCalc.getLength() === 0) {
						sap.m.MessageBox.alert(this.getResourceBundle()
							.getText("noDataInDtRange"), {
								styleClass: "sapUiSizeCompact",
								icon: sap.m.MessageBox.Icon.ERROR,
								title: this.getResourceBundle().getText("errNoData")
							});
					} else {
						// For SORTING
						var oSorter = new sap.ui.model.Sorter("UDelDate");
						oBindingforCalc.sort(oSorter, true);
						var contexts = oBindingforCalc.getContexts(0, oBindingforCalc.getLength());
						var filterItems = [];
						for (var i = 0; i < oBindingforCalc.getLength(); i++) {
							var item = calcModel
								.getProperty(contexts[i].sPath);
							filterItems.push(item);
						}
						var filterPC = new sap.ui.model.json.JSONModel();
						filterPC.setData({
							"ProductCollection": filterItems
						});
						this.getOwnerComponent().setModel(filterPC,
							"filterPC");
						this.setSearchBoxModel(this.getOwnerComponent().getModel("filterPC"), "DP");
					}
				});

				this.initialAppLoad = false;*/

		},

		openCalender: function(oEvent) {
			var aViewName = this.getView().getViewName().split(".");
			aViewName.pop();
			var sViewPath = aViewName.join(".");
			if(this.getDateSelectionDialog()){
			    this.getDateSelectionDialog().destroy();
			}
// 			if (!this.getDateSelectionDialog()) {
				// this._dateSelectionDialog = sap.ui.xmlfragment(this
				// 	.getView().getId(), sViewPath + ".fragments.dateRangeSelection", this);
				// this.getView().addDependent(this._dateSelectionDialog);
				var val=sap.ui.xmlfragment(this.getView().getId(), sViewPath + ".fragments.dateRangeSelection", this);
				this.setDateSelectionDialog(val);
				//this.getView().addDependent(this.getDateSelectionDialog());
				

// 			}
			this.getDateSelectionDialog().open();
			this.getDateSelectionDialog().setModel(this.getModel("appProperties"));
			this.getDateSelectionDialog().setModel(this.getModel("i18n"),"i18n");
			this.getModel("appProperties").setProperty("/oldfD", this.getModel("appProperties").getProperty("/fD"));
			this.getModel("appProperties").setProperty("/oldtD", this.getModel("appProperties").getProperty("/tD"));
			this.getModel("appProperties").setProperty("/oldType", this.getModel("appProperties").getProperty("/type"));
			this.getModel("appProperties").setProperty("/oldIsRA", this.getModel("appProperties").getProperty("/isRA"));
			this.getModel("appProperties").setProperty("/oldIsRD", this.getModel("appProperties").getProperty("/isRD"));
			/*	var oldDateRangeModel = new sap.ui.model.json.JSONModel(
				this.getOwnerComponent().getModel(
					"dateRangeModel").oData);
			this.oldMin = oldDateRangeModel.getProperty("/min");
			this.oldMax = oldDateRangeModel.getProperty("/max");
			this.oldRA = oldDateRangeModel.getProperty("/rA");
			this.oldRD = oldDateRangeModel.getProperty("/rD");*/
		},

		onCloseDialog: function() {
			// var oModel = this.getOwnerComponent().getModel("dateRangeModel");
			this.getModel("appProperties").setProperty("/fD", this.getModel("appProperties").getProperty("/oldfD"));
			this.getModel("appProperties").setProperty("/tD", this.getModel("appProperties").getProperty("/oldtD"));
			this.getModel("appProperties").setProperty("/Type", this.getModel("appProperties").getProperty("/oldtype"));
			this.getModel("appProperties").setProperty("/IsRA", this.getModel("appProperties").getProperty("/oldisRA"));
			this.getModel("appProperties").setProperty("/IsRD", this.getModel("appProperties").getProperty("/oldisRD"));
			this.getDateSelectionDialog().close();
		},

		onChangeMarket: function(oEvent) {
			var data = this.getRouteForHash();
			var key = oEvent.getSource().getSelectedKey();
			var direction = key.split("-")[0];
			var companyCode = key.split("-")[1];
			var oDateModel = this.getModel("appProperties");
			if (direction === "Inbound") {
				// oDateModel.setProperty("/rA", false);
				// oDateModel.setProperty("/rD", true);
				this.getModel("appProperties").setProperty("/isRA", true);
				this.getModel("appProperties").setProperty("/isRD", false);
				this.getModel("appProperties").setProperty("/type", "Arrival");
			} else {
				// oDateModel.setProperty("/rA", true);
				// oDateModel.setProperty("/rD", false);
				this.getModel("appProperties").setProperty("/isRA", false);
				this.getModel("appProperties").setProperty("/isRD", true);
				this.getModel("appProperties").setProperty("/type", "Departure");
			}
			this.updateMktModel(direction, companyCode);
			this.getModel("appProperties").setProperty("/mktOrCC", companyCode);
			this.getModel("appProperties").setProperty("/direction", direction);
			this.isCustomDateChangeEvent = true;
			this.setCustomHashChange(false);
			this.setHash(data.route);
			// this.getView().getController().handleDateRangePress();
			// this.initiateMainServiceCall(true,data.viewName);
			this.isCustomDateChangeEvent = false;
		},

		showOnboardingTour: function(oEvent) {
			// create overlay
			var aViewName = this.getView().getViewName().split(
				".");
			aViewName.pop();
			var sViewPath = aViewName.join(".");
			if (!this._oPopoverOL) {
				this._oPopoverOL = sap.ui.xmlfragment(
					"myOverlay", sViewPath + ".fragments.onboardingScreen", this);
			}
			this.getView().addDependent(this._oPopoverOL);
			this._oPopoverOL.open();
		},
		showFeedbackOverlay: function() {
			// create overlay
			var aViewNameratingApp = this.getView()
				.getViewName().split(".");
			aViewNameratingApp.pop();
			var sViewPath = aViewNameratingApp.join(".");
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment(sViewPath + ".fragments.ratingApp", this);
			}
			this.getView().addDependent(this._oPopover);
			this._oPopover.open();
			if (!this.getOwnerComponent().getModel("ratingModel")) {
				var ratingModel = new sap.ui.model.json.JSONModel();
				ratingModel.setData({
					"ratingVal": 0,
					"btnRatingVis": false,
					"dispBeforeVis": true,
					"dispAfterVis": false,
					"ratingSkipVis": false,
					"dispAfterSendVis": false,
					"btnRatingCloseVis": false,
					"ratingText": "",
					"feedback": ""
				});
				this.getOwnerComponent().setModel(ratingModel, "ratingModel");
				this.getView().setModel(ratingModel, "ratingModel");
			}

		},

		showOverlay: function() {
			// For OVERLAY
			$.when(this.getOwnerComponent().oOverlayDef).then($.proxy(function(){
			    var cookieTimesAppLoadedKey = 'times-app-loaded';
    			var sViewPath = "";
    			if (!$.cookie(cookieTimesAppLoadedKey)) {
    				$.cookie(cookieTimesAppLoadedKey, 1, {
    					expires: this.maxExpires
    				});
    			} else {
    				$.cookie(cookieTimesAppLoadedKey, Number(Number($
    					.cookie(cookieTimesAppLoadedKey)) + 1), {
    					expires: this.maxExpires
    				});
    			}
    
    			if (!$.cookie('skip_intro')) {
    				// create overlay
    			/*	var aViewName = this.getView().getViewName().split(
    					".");
    				aViewName.pop();
    				sViewPath = aViewName.join(".");*/
    				sViewPath = this.getFragmentsPath();
    				if (!this._oPopoverOL) {
    					this._oPopoverOL = sap.ui.xmlfragment(
    						"myOverlay", sViewPath + ".fragments.onboardingScreen", this);
    					this.getView().addDependent(this._oPopoverOL);
    					this._oPopoverOL.open();
    				}
    			}
    			if ($.cookie('times-app-loaded') === "5") {
    				// create overlay
    			/*	var aViewNameratingApp = this.getView()
    					.getViewName().split(".");
    				aViewNameratingApp.pop();
    				sViewPath = aViewNameratingApp.join(".");*/
    				sViewPath = this.getFragmentsPath();
    				if (!this._oPopover) {
    					this._oPopover = sap.ui.xmlfragment(sViewPath + ".fragments.ratingApp", this);
    					this.getView().addDependent(this._oPopover);
    					this._oPopover.open();
    					if (!this.getOwnerComponent().getModel("ratingModel")) {
    						var ratingModel = new sap.ui.model.json.JSONModel();
    						ratingModel.setData({
    							"ratingVal": 0,
    							"btnRatingVis": false,
    							"dispBeforeVis": true,
    							"dispAfterVis": false,
    							"ratingSkipVis": false,
    							"dispAfterSendVis": false,
    							"btnRatingCloseVis": false,
    							"ratingText": "",
    							"feedback": ""
    						});
    						this.getOwnerComponent().setModel(ratingModel, "ratingModel");
    						this.getView().setModel(ratingModel, "ratingModel");
    					}
    				}
    			}
			},this));
			

			// End of for OVERLAY
		},

		onOverlayPageChange: function(oEvent) {},
		closeOnBoarding: function(oEvent) {
			$.cookie('skip_intro', true, {
				expires: this.maxExpires
			});
			if (this._oPopoverOL) {
				this._oPopoverOL.close();
				this.getView().removeDependent(this._oPopoverOL);
				this._oPopoverOL.destroy();
				this._oPopoverOL = null;

			}
		},
		closeOverlay: function(oEvent) {
			var view = this.getView();
			if (oEvent) {
				if (oEvent.getSource()) {
					var id = oEvent.getSource().getId();
					if (id === 'btnCancelratingApp') {
						var rating = view.getModel("ratingModel").getProperty("/ratingVal");
						var ratingText = this.getOwnerComponent().getModel(
							"LocalModel").getProperty(
							"/RatingAppLabel/" + rating + "/RatingText");
						var feedback = ratingText + this.DELIMITER;
						this.postFeedback(feedback);
					}
				}
			}
			if (this._oPopover) {
				this._oPopover.close();
				view.removeDependent(this._oPopover);
				this._oPopover.destroy();
				this._oPopover = null;

			}

		},
		setSearchBoxModel: function(oModel, page) {
			var cArr = oModel.getProperty("/ProductCollection");
			var searchBoxModel = new JSONModel();
			searchBoxModel.setSizeLimit(99999);
			var all = [];
			var sku = [];
			var cn = [];
			var po = [];
			var asn = [];
			var sto = [];
			var ldp = [];
			var i, j, k, l, m, n, o = 0;
			for (i in cArr) {
				cn.push(cArr[i].Container);
				po.push(cArr[i].PO);
				asn.push(cArr[i].ASN);
				sto.push(cArr[i].STO);
				ldp.push(cArr[i].CustPOID);
				for (j in cArr[i].ItemSet.results) {
					sku.push(cArr[i].ItemSet.results[j].SKU);
				}
			}
			cn = Utility.getUniqueElements(cn);
			po = Utility.getUniqueElements(po);
			asn = Utility.getUniqueElements(asn);
			sto = Utility.getUniqueElements(sto);
			sku = Utility.getUniqueElements(sku);
			ldp = Utility.getUniqueElements(ldp);
			for (j in cn) {
				all.push({
					item: "CN-" + cn[j]
				});
			}
			for (k in po) {
				all.push({
					item: "PO-" + po[k]
				});
			}

			for (l in sku) {
				all.push({
					item: "SKU-" + sku[l]
				});
			}
			for (m in asn) {
				all.push({
					item: "ASN-" + asn[m]
				});
			}
			for (n in sto) {
				all.push({
					item: "STO-" + sto[n]
				});
			}
			for (o in ldp) {
				all.push({
					item: "LDP-" + ldp[o]
				});
			}
			searchBoxModel.setData({
				ProductCollection: all
			});
			// 			if (page === "DP") {
			this.getOwnerComponent().setModel(searchBoxModel, "searchBoxModel");
			// 			} else if (page === "PA") {
			// 				this.getOwnerComponent().setModel(searchBoxModel,
			// 					"searchBoxModelPA");
			// 			}
			this.getView().byId("search").setModel(this.getModel("searchBoxModel"));
		},
		createQuickViewLogoContent: function(oController) {
			var view = oController.getView();

			var aViewNameratingApp = view.getViewName().split(".");
			aViewNameratingApp.pop();
			var sViewPath = aViewNameratingApp.join(".");
			if (!oController._oPopover) {
				oController._oPopover = sap.ui.xmlfragment(
					sViewPath + ".fragments.ratingApp",
					oController);
				oController.getView().addDependent(
					oController._oPopover);
			}
			oController._oPopover.open();
			var ratingModel = null;
			if (!this.getOwnerComponent().getModel("ratingModel")) {
				ratingModel = new sap.ui.model.json.JSONModel();
				ratingModel.setData({
					"ratingVal": 0,
					"btnRatingVis": true,
					"dispBeforeVis": true,
					"dispAfterVis": false,
					"ratingSkipVis": false,
					"dispAfterSendVis": false,
					"btnRatingCloseVis": false,
					"ratingText": "",
					"feedback": ""
				});
				this.getOwnerComponent().setModel(ratingModel, "ratingModel");
				this.getView().setModel(ratingModel, "ratingModel");
			} else {
				ratingModel = this.getOwnerComponent().getModel("ratingModel");
				ratingModel.setProperty("/btnRatingVis", true);
				ratingModel.setProperty("/dispBeforeVis", true);
				ratingModel.setProperty("/dispAfterVis", false);
				ratingModel.setProperty("/ratingSkipVis", false);
				ratingModel.setProperty("/dispAfterSendVis", false);
				ratingModel.setProperty("/btnRatingCloseVis", false);
			}
		},

		checkLiveChangeIngenius: function(oController, oEvent) {
			var ratingModel = this.getView().getModel("ratingModel");
			var ratingSelect = oEvent.getParameter("value");
			var calcModelRateApp = new sap.ui.model.json.JSONModel(
				oController.getOwnerComponent().getModel(
					"LocalModel").oData);
			calcModelRateApp.setSizeLimit(99999);
			if (ratingSelect) {
				ratingModel.setProperty("/ratingVal", ratingSelect);
				ratingModel.setProperty("/ratingText", calcModelRateApp
					.getProperty("/RatingAppLabel/" + ratingSelect + "/Desc"));

			}
		},

		checkLiveChange: function(oController, oControlEvent) {
			var ratingModel = this.getView().getModel("ratingModel");
			ratingModel.setProperty("/btnRatingVis", true);
			ratingModel.setProperty("/dispAfterSendVis", false);
			var ratingSelect = oControlEvent.getParameter("value");
			var calcModelRateApp = new sap.ui.model.json.JSONModel(
				oController.getOwnerComponent().getModel(
					"LocalModel").oData);
			calcModelRateApp.setSizeLimit(99999);
			if (ratingSelect) {
				if (sap.ui.getCore().byId("LblForText")) {
					ratingModel.setProperty("/ratingText", calcModelRateApp
						.getProperty("/RatingAppLabel/" + ratingSelect + "/Desc"));
				}
			}
		},
		checkChange: function(oController, oControlEvent) {
			var view = oController.getView();
			var ratingModel = this.getOwnerComponent().getModel("ratingModel");
			var id = oControlEvent.getSource().getId();
			if (id === view.byId("idRating").getId()) {
				this.createQuickViewLogoContent(oController);
			}
			var ratingSelect = oControlEvent.getParameter("value");
			ratingModel.setProperty("/btnRatingVis", true);
			ratingModel.setProperty("/dispAfterSend", false);
			ratingModel.setProperty("/btnRatingCloseVis", false);
			var calcModelRateApp = new sap.ui.model.json.JSONModel(
				oController.getOwnerComponent().getModel(
					"LocalModel").oData);
            calcModelRateApp.setSizeLimit(99999);
			if (ratingSelect) {
				if (sap.ui.getCore().byId("LblForText")) {
					ratingModel.setProperty("/ratingText", calcModelRateApp
						.getProperty("/RatingAppLabel/" + ratingSelect + "/Desc"));
				}

			}

		},

		checksendRatingApp: function(oControlEvent) {
			var ratingModel = this.getView().getModel("ratingModel");
			var rating = ratingModel.getProperty("/ratingVal");
			var evtLbl = this.getOwnerComponent().getModel(
				"LocalModel").getProperty(
				"/RatingAppLabel/" + rating + "/Stars");
			var ratingText = this.getOwnerComponent().getModel(
				"LocalModel").getProperty(
				"/RatingAppLabel/" + rating + "/RatingText");
			if (ratingModel.getProperty("/dispBeforeVis") === true) {
				// ga('set', 'dimension5', evtLbl);
				this.trackGAEvent(this.EvtCat.USR_VOICE,
					this.EvtAct.RATING, evtLbl);
				ratingModel.setProperty("/dispAfterVis", true);
				ratingModel.setProperty("/dispBeforeVis", false);
				ratingModel.setProperty("/ratingSkipVis", true);
				ratingModel.setProperty("/dispAfterSendVis", false);
				ratingModel.setProperty("/btnRatingClose", false);
			} else if (ratingModel.getProperty("/dispAfterVis") === true) {
				var fb = ratingModel.getProperty("/feedback");
				this.trackGAEvent(this.EvtCat.USR_VOICE,
					this.EvtAct.FEEDBACK, fb);
				var feedback = ratingText + this.DELIMITER + fb;
				this.postFeedback(feedback);
				ratingModel.setProperty("/dispAfterSendVis", true);
				ratingModel.setProperty("/dispAfterVis", false);
				ratingModel.setProperty("/ratingSkipVis", false);
				ratingModel.setProperty("/btnRatingVis", false);
				ratingModel.setProperty("/btnRatingCloseVis", true);
			}

		},
		getRowModel: function(allData, minDate, maxDate) {
			var dataModel = [];
			var weekModel = [];
			var todayModel = {};
			var dateModel = [];
			minDate = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern: 'yyyyMMdd',
					UTC: true
				}).parse(minDate);
			//For DCL date issue
			maxDate=sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern: 'yyyyMMdd',
					UTC: true
				}).parse(maxDate);
			var dn = minDate.getDay();
			var dnMax =  maxDate.getDay();
			if (dn === 0) {
				minDate.setDate(minDate.getDate() - 6);
			} else if (dn > 1) {
				minDate.setDate(minDate.getDate() - (dn - 1));
			}
			var minmm = (minDate.getMonth() + 1);
			var mindd = minDate.getDate();
			if (minmm < 10) {
				minmm = "0" + minmm;
			}
			if (mindd < 10) {
				mindd = "0" + mindd;
			}
			minDate = "" + minDate.getFullYear() + minmm + mindd;
			
			if (dnMax !== 0) {
				maxDate.setDate(maxDate.getDate() + (7-dnMax));
			} 
			var maxmm = (maxDate.getMonth() + 1);
			var maxdd = maxDate.getDate();
			if (maxmm < 10) {
				maxmm = "0" + maxmm;
			}
			if (maxdd < 10) {
				maxdd = "0" + maxdd;
			}
			maxDate = "" + maxDate.getFullYear() + maxmm + maxdd;
			
			
			var diff = Utility.getDateDiff(minDate, maxDate,
				"yyyyMMdd") + 1;

			var today = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern: 'yyyyMMdd',
					UTC: true
				}).format(new Date());
			var todayX = Utility.getDateDiff(minDate, today,
				"yyyyMMdd");
			todayModel = {
				todayX: todayX
			};

			for (var i = 0; i < allData.length; i++) {
				var container = null,
					priority = null,
					oc = null,
					dest = null,
					alignmentText = null,
					alignmentColor = null,
					actualDate = null,
					plannedDate = null,
					alignmentNum = null,
					po = null;
				var alignmentNumText = null,
					alignmentStatus = null;
				var rowData = allData[i];
				var pol = null;
				var poa = null;
				// for start and end cell
				var x = 0;
				var width = 0;
				var bColor = "";
				if (rowData.AlignStatus === "1") {
					x = Utility.getDateDiff(minDate, rowData.InitDelDate,
						"yyyyMMdd");
					width = Utility.getDateDiff(minDate,
						rowData.UDelDate, "yyyyMMdd") - x;
					bColor = "#fad4d4";
				} else if (rowData.AlignStatus === "0") {
					x = Utility.getDateDiff(minDate, rowData.InitDelDate,
						"yyyyMMdd");
					width = 0;
					bColor = "#28bc6e";
				} else if (rowData.AlignStatus === "-1") {
					x = Utility.getDateDiff(minDate,
						rowData.UDelDate, "yyyyMMdd");
					width = Utility.getDateDiff(minDate,
						rowData.InitDelDate, "yyyyMMdd") - x;
					bColor = "#b8d7e8";
				} else if (rowData.AlignStatus === "2") {
					x = Utility.getDateDiff(minDate,
						rowData.UDelDate, "yyyyMMdd");
					width = 0;
					bColor = "rgb(190,190,190)";
				} else if (rowData.AlignStatus === "3") {
					x = Utility.getDateDiff(minDate, rowData.InitDelDate,
						"yyyyMMdd");
					width = 0;
					bColor = "#28bc6e";
				}
				// end of start and end cell
				var dateDiff = null;
				if (rowData.AlignStatus === "3") {
					dateDiff = "";
					container = "";
				} else {
					dateDiff = Utility.getDateDiff(rowData.InitDelDate,
						rowData.UDelDate, "yyyyMMdd");
					container = rowData.Container;
				}

				priority = rowData.Priority;
				oc = rowData.OriginCountry;
				dest = rowData.DestinationDCDesc;
				alignmentStatus = Utility.getAlignmentStatus(dateDiff);
				alignmentText = Utility.getAlignmentText(dateDiff);
				alignmentColor = Utility.getAlignmentColor(alignmentStatus);
				alignmentNum = dateDiff;
				alignmentNumText = Utility.getAlignmentNumText(dateDiff);
				actualDate = Utility.getDateString(rowData.UDelDate,"yyyyMMdd",true);
				plannedDate = Utility.getDateString(rowData.InitDelDate,"yyyyMMdd",true);
				po = rowData.PO;
				pol = rowData.PortOfLoading;
				poa = rowData.PortOfDischarge;

				var date = sap.ui.core.format.DateFormat
					.getDateInstance({
						pattern: 'yyyyMMdd',
						UTC: true
					}).parse(minDate);
				var data = {
					'GUID': rowData.GUID,
					'AlignmentText': alignmentText,
					'AlignmentColor': alignmentColor,
					'AlignStatus': rowData.AlignStatus,
					'ActualDate': actualDate,
					'PlannedDate': plannedDate,
					'DateDiff': dateDiff,
					'Container': container,
					// 31Aug2016
					'GRInd': rowData.GRInd,
					'Priority': priority,
					'SKU': rowData.SKU,
					'CategoryDesc': rowData.CategoryDesc,
					'InitDelDate': plannedDate,
					'UDelDate': actualDate,
					'AlignmentNum': alignmentNumText,
					'PO': po,
					'STO': rowData.STO,
					'ASN': rowData.ASN,
					'CustPOID': rowData.CustPOID,
					'OriginCountry': oc,
					'DestinationDCDesc': dest,
					'x': x,
					'width': width,
					'color': bColor,
					'PortOfDischarge': poa,
					'PortOfLoading': pol
				};
				var wr = diff % 7;
				if (wr !== 0) {
					diff = diff + (7 - wr);
				}
				this.dtDiff = diff;
				if (i === 0) {
					for (var k = 0; k < diff; k++) {
						var dt = Utility.formatDate(date, null,
							'yyyyMMdd');
						date.setDate(date.getDate() + 1);
						dateModel.push(dt);
					}
				}
				dataModel.push(data);
			}

			return {
				data: dataModel,
				weekModel: weekModel,
				todayModel: todayModel,
				dateModel: dateModel
			};

		},

		getFilterParameters: function(query) {

			var filterParams = {};
			filterParams = this.getFilterParametersFor("", query);
			if (filterParams == null) {
				filterParams = this.getFilterParametersFor("LDP", query);
				if (filterParams == null) {
					filterParams = this.getFilterParametersFor("CN", query);
					if (filterParams == null) {
						filterParams = this.getFilterParametersFor("PO", query);
						if (filterParams == null) {
							filterParams = this.getFilterParametersFor("ASN", query);
							if (filterParams == null) {
								filterParams = this
									.getFilterParametersFor("SKU", query);
								if (filterParams == null) {
									filterParams = this.getFilterParametersFor("STO",
										query);
									if (filterParams == null) {
										var searchField = "";
										var op = sap.ui.model.FilterOperator.Contains;
										var searchEntry = "" + query.toUpperCase();
										filterParams = {
											'searchField': searchField,
											'filterOperator': op,
											'searchEntry': searchEntry
										};
										return filterParams;
									} else {
										return filterParams;
									}
								} else {
									return filterParams;
								}
							} else {
								return filterParams;
							}
						} else {
							return filterParams;
						}

					} else {
						return filterParams;
					}
				} else {
					return filterParams;
				}
			} else {
				return filterParams;
			}
		},
		getFilterParametersFor: function(searchFieldPrefix, query) {
			var op = null;
			var searchField = null;
			var searchEntry = null;
			var filterParams = {};
			var len = searchFieldPrefix.length;
			if (searchFieldPrefix === "CN") {
				searchField = "Container";
			} else if (searchFieldPrefix === "PO") {
				searchField = "PO";
			} else if (searchFieldPrefix === "ASN") {
				searchField = "ASN";
			} else if (searchFieldPrefix === "SKU") {
				searchField = "SKU";
			} else if (searchFieldPrefix === "STO") {
				searchField = "STO";
			} else if (searchFieldPrefix === "LDP") {
				searchField = "CustPOID";
			} else if (searchFieldPrefix === "") {
				searchField = "";
			}
			var idx = query.indexOf(searchFieldPrefix + "-");
			if (idx === -1) {
				idx = query.indexOf(searchFieldPrefix + "$=");
				if (idx === -1) {
					idx = query.indexOf(searchFieldPrefix + "*=");
					if (idx === -1) {
						idx = query.indexOf(searchFieldPrefix + "^=");
						if (idx === -1) {
							idx = query.indexOf(searchFieldPrefix + "=");
							if (idx === -1) {
								return null;
							} else if (idx === 0) {
								len += 1;
								op = sap.ui.model.FilterOperator.EQ;
								searchEntry = "" + query.substring(len);
								filterParams = {
									'searchField': searchField,
									'filterOperator': op,
									'searchEntry': searchEntry
								};
								return filterParams;
							} else {
								return null;

							}
						} else if (idx === 0) {
							len += 2;
							op = sap.ui.model.FilterOperator.StartsWith;
							searchEntry = "" + query.substring(len);
							filterParams = {
								'searchField': searchField,
								'filterOperator': op,
								'searchEntry': searchEntry
							};
							return filterParams;
						} else {
							return null;

						}
					} else if (idx === 0) {
						len += 2;
						op = sap.ui.model.FilterOperator.Contains;
						searchEntry = "" + query.substring(len);
						filterParams = {
							'searchField': searchField,
							'filterOperator': op,
							'searchEntry': searchEntry
						};
						return filterParams;
					} else {
						return null;

					}

				} else if (idx === 0) {
					len += 2;
					op = sap.ui.model.FilterOperator.EndsWith;
					searchEntry = "" + query.substring(len);
					filterParams = {
						'searchField': searchField,
						'filterOperator': op,
						'searchEntry': searchEntry
					};
					return filterParams;
				} else {
					return null;

				}
			} else if (idx === 0) {
				len += 1;
				op = sap.ui.model.FilterOperator.Contains;
				searchEntry = "" + query.substring(len);
				filterParams = {
					'searchField': searchField,
					'filterOperator': op,
					'searchEntry': searchEntry
				};
				return filterParams;
			} else {
				return null;

			}
		},

		hasFilter: function(oFilter, filterArr) {
			var pos = -1;
			for (var k = 0; k < filterArr.length; k++) {
				if (oFilter.sPath === filterArr[k].sPath && oFilter.oValue1 === filterArr[k].oValue1) {
					pos = k;
				}
			}
			return pos;
		},
		removeFromFilter: function(oFilter, filterArr) {
			var pos = this.hasFilter(oFilter, filterArr);
			if (pos >= 0) {
				filterArr.splice(pos, 1);
			}

		},
		addToFilter: function(oFilter, filterArr, oController) {
			// if (oController) {
			// if (this.getFilter("productFilter") === filterArr || this.getFilter("categoryFilter") === filterArr) {
			// 	filterArr.push(oFilter);
			// 	return;
			// }
			// }
			var pos = this.hasFilter(oFilter, filterArr);
			if (pos >= 0) {
				return;
			} else {
				filterArr.push(oFilter);
			}
		},

		getCBData: function(cbIds, view) {
			var cbStates = [];
			var cbData = {};
			var flagAllChecked = true;
			var flagAllUnchecked = true;
			for (var i = 0; i < cbIds.length; i++) {
				if (view.byId(cbIds[i])) {
					try {
						var cb = view.byId(cbIds[i]);
						var isChecked = cb.getSelected();
						if (isChecked === false) {
							flagAllChecked = false;
						} else {
							flagAllUnchecked = false;
						}
						cbStates.push({
							"cbId": cbIds[i],
							"isChecked": isChecked
						});

					} catch (e) {
						cbStates.push({
							"cbId": cbIds[i],
							"isChecked": null
						});
					}
				}
			}
			if (flagAllChecked === false) {
				cbData.isAllChecked = false;
			} else {
				cbData.isAllChecked = true;
			}
			if (flagAllUnchecked === false) {
				cbData.isAllUnchecked = false;
			} else {
				cbData.isAllUnchecked = true;
			}
			cbData.data = cbStates;
			return cbData;
		},

		getFilterStateFor: function(filterSection, view) {
			var cbArr = new Array();
			if (filterSection === "PA") {
				if (typeof(view.byId("paList")) === "undefined") {
					cbArr = ["PM_Early", "PM_OnTime", "PM_Late",
						"PM_Arrived", "PM_UI"
					];
				} else {
					var pa = view.byId("paList").getModel().oData.PACollection;
					for (var i = 0; i < pa.length; i++) {
						cbArr.push("pa_" + pa[i].id);
					}
				}

			} else if (filterSection === "PF") {

				if (typeof(view.byId("pfList")) === "undefined") {
					cbArr = ["PF_1", "PF_2", "PF_3"];
				} else {
					var pf = view.byId("pfList").getModel().oData.PFCollection;
					for (i = 0; i < pf.length; i++) {
						cbArr.push("pf_" + pf[i].id);
					}
				}
			}
			/*else if (filterSection === "AT") {
              var at = view.byId("atList").getModel().oData.ATCollection;
              for (i = 0; i < at.length; i++) {
                cbArr.push("at_" + at[i].id);
              }
            } */
			else if (filterSection === "OC") {
				var country = view.byId("originCountryList")
					.getModel().oData.CountryCollection;
				for (i = 0; i < country.length; i++) {
					cbArr.push("oc_" + country[i].id);
				}
			} else if (filterSection === "DDC") {
				var destDC = view.byId("destDCList").getModel().oData.DestinationCollection;
				for (i = 0; i < destDC.length; i++) {
					cbArr.push("dest_" + destDC[i].id);
				}
			} else if (filterSection === "PRD") {
				var prod = view.byId("productList").getModel().oData.ProdCollection;
				for (i = 0; i < prod.length; i++) {
					cbArr.push("prod_" + prod[i].id);
				}
			} else if (filterSection === "CAT") {
				var cat = view.byId("categoryList").getModel().oData.CategoryCollection;
				for (i = 0; i < cat.length; i++) {
					cbArr.push("cat_" + cat[i].id);
				}
			} else if (filterSection === "POL") {
				var pol = view.byId("polList").getModel().oData.POLCollection;
				for (i = 0; i < pol.length; i++) {
					cbArr.push("pol_" + pol[i].id);
				}
			} else if (filterSection === "POA") {
				var poa = view.byId("poaList").getModel().oData.POACollection;
				for (i = 0; i < poa.length; i++) {
					cbArr.push("poa_" + poa[i].id);
				}
			}

			// else if (filterSection === "CAT") {
			// var catDC =
			// view.byId("catList").getModel().oData.CategoryCollection;
			// for (var i = 0; i < catDC.length; i++) {
			// cbArr.push("cat_" + catDC[i].id);
			// }
			// }

			return this.getCBData(cbArr, view);

		},

		getTrackerEventDetails: function(evt) {
			var evtDetails = [];
			for (var i = 0; i < evt.length; i++) {
				var planned = evt[i].EventDate;
				var actual = evt[i].UTCReceiveDate;
				var dateDiff = null;
				//Added for odata Date
				var pDateParts = Utility.getDateParts(planned, true);
				var aDateParts = Utility.getDateParts(actual, true);
				//For Transit Leg Calculation
                var sValue = $.sap.getUriParameters().get("container");
    			if (Utility.hasValue(sValue)) {
    				if (sValue.toLowerCase() === "all") {
    				        if(i<4){
    				            var tl=evt[i].TransitLeg;
				                if(tl>0 && tl<4){
    				                dateDiff=this.getModel("currContainerModel").getProperty("/TransitTime"+i);
				                }
    				        }
    				        else{
    				            dateDiff=null;
    				        }
    				}
    			}
                //End for Transit Leg
                if(dateDiff===null){
    				if (pDateParts.date !== '') {
    					var res = Utility.formatDate(aDateParts.date, null,
    						"yyyyMMdd");
    					if (res === "" || res === this.getResourceBundle().getText("na")) {
    						evtDetails.push({
    							"text": "",
    							"style": "greyEvent"
    						});
    					} else {
    						dateDiff = Utility.getDateDiff(pDateParts.date, aDateParts.date,
    							"yyyyMMdd");
    					}
    				} else {
    					dateDiff = 0;
    				}
                }
				if (i === (evt.length - 1) && this.getView().getModel().getProperty("/GRInd").toUpperCase()==="X") {
					evtDetails.push({
						"text": this.getResourceBundle().getText("tick"),
						"style": "greyEvent"
					});
					return evtDetails;
				}
				if (dateDiff === 0) {
					evtDetails.push({
						"text": "",
						"style": "onTimeEvent"
					});
				} else if (dateDiff < 0) {
					evtDetails.push({
						"text": "" + dateDiff,
						"style": "earlyEvent"
					});
				} else if (dateDiff > 0) {
					evtDetails.push({
						"text": "+" + dateDiff,
						"style": "lateEvent"
					});
				}
			}
			return evtDetails;
		},

		getTrackerPathStyle: function(evt) {
			var pathDetails = {};

			for (var i = 0; i < evt.length; i++) {
				var actual = evt[i].UTCReceiveDate;
				if (actual === "" || typeof actual === "undefined" || actual === null) {
					pathDetails = {
						startDashME: i,
						startDashSE: 0
					};
					return pathDetails;
				} else {
					if (typeof(evt[i].subEvents) !== "undefined") {
						for (var j = 0; j < evt[i].subEvents.length; j++) {
							var act = evt[i].subEvents[j].UTCReceiveDate;
							if (act === "" || typeof act === "undefined" || act === null) {
								pathDetails = {
									startDashME: i,
									startDashSE: j
								};
								return pathDetails;
							}
						}
					}
				}
			}
			pathDetails = {
				startDashME: evt.length,
				startDashSE: 0
			};
			return pathDetails;
		},

		createFilter: function(field, prefix, ctx, model, list,
			evtHandler, view, oController, dataModel) {

			var all = [];
			var calcModel = null;
			if (dataModel) {
				calcModel = new JSONModel(dataModel.getProperty("/"));
			} else {
				calcModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
			}
			calcModel.setSizeLimit(99999);
			var oBinding = calcModel.bindList("/ProductCollection");
			var filter = [];
			var uField = [];

			if (field === this.getFilterVal("PA").field) {
				all = this.getPAFilters();
				for (var i = 0; i < all.length; i++) {
					filter.push(new sap.ui.model.Filter(field,
						"EQ", all[i].val));
				}
				for (var j = 0; j < all.length; j++) {
					oBinding.filter(filter[j]);
					uField.push({
						"Field": all[j].name,
						"Count": oBinding.getLength(),
						"CurrCount": oBinding.getLength(),
						"section": "PA",
						"id": all[j].name.replace(/\s/g, ""),
						"value": all[j].val
					});
				}
			} else if (field === this.getFilterVal("PF").field) {
				all = this.getPFFilters();
				for (i = 0; i < all.length; i++) {
					filter.push(new sap.ui.model.Filter(field,
						"EQ", all[i].val));
				}
				for (j = 0; j < all.length; j++) {
					oBinding.filter(filter[j]);
					uField.push({
						"Field": all[j].name,
						"Count": oBinding.getLength(),
						"CurrCount": oBinding.getLength(),
						"section": "PF",
						"id": all[j].name.replace(/\s/g, ""),
						"value": all[j].val
					});
				}
			} else if (field === this.getFilterVal("AT").field) {
				all = this.getATFilters();
				for (i = 0; i < all.length; i++) {
					filter.push(new sap.ui.model.Filter(field,
						"EQ", all[i].val));
				}
				for (j = 0; j < all.length; j++) {
					oBinding.filter(filter[j]);
					uField.push({
						"Field": all[j].name,
						"Count": oBinding.getLength(),
						"CurrCount": oBinding.getLength(),
						"section": "AT",
						"id": all[j].name.replace(/\s/g, ""),
						"value": all[j].val
					});
				}
			} else {
				var cArr = null;
				if (dataModel) {
					cArr = dataModel.oData.ProductCollection;
				} else {
					cArr = oController.getOwnerComponent()
						.getModel("filterPC").oData.ProductCollection;
				}
				if (field === this.getFilterVal("PRD").field || field === this.getFilterVal("CAT").field) {
					for (i = 0; i < cArr.length; i++) {
						if (field === this.getFilterVal("PRD").field) {
							for (j = 0; j < cArr[i].ItemSet.results.length; j++) {
								var item = cArr[i].ItemSet.results[j];
								/*if(isPrdAdjust){
    								var prodFilter=new Filter(field,sap.ui.model.FilterOperator.Contains,item[field]);
    								var catFilter=new Filter(this.getFilterVal("CAT").field,sap.ui.model.FilterOperator.Contains,item[this.getFilterVal("CAT").field]);
    								if(this.hasFilter(catFilter,this.getFilter("categoryFilter"))===-1){
    								    this.removeFromFilter(prodFilter,this.getFilter("productFilter"));
    								    this.addToFilter(prodFilter,this.getFilter("productFilterUC"));
    								    continue;
    								}
								}*/
								all
									.push({
										name: item.SKU + " " + item.Description,
										value: cArr[i].ItemSet.results[j][field]
									});
							}
						} else {
							for (j = 0; j < cArr[i].ItemSet.results.length; j++) {
								all.push({
									name: cArr[i].ItemSet.results[j][field],
									value: cArr[i].ItemSet.results[j][field]
								});
							}
						}

					}
				} else {
					//Added for POL and POD description
					var desc = "";
					if (field === this.getFilterVal("POL").field) {
						desc = this.getFilterVal("POL").desc;
						for (i = 0; i < cArr.length; i++) {
							all.push({
								name: cArr[i][field] + " " + cArr[i][desc],
								value: cArr[i][field]
							});
						}
					} else if (field === this.getFilterVal("POA").field) {
						desc = this.getFilterVal("POA").desc;
						for (i = 0; i < cArr.length; i++) {
							all.push({
								name: cArr[i][field] + " " + cArr[i][desc],
								value: cArr[i][field]
							});
						}
					} else {
						for (i = 0; i < cArr.length; i++) {
							all.push(cArr[i][field]);
						}
					}
				}
				all = Utility.getUniqueElements(all);
				if(field === this.getFilterVal("OC").field){
				    all.sort();
				}

				if (field === this.getFilterVal("PRD").field || field === this.getFilterVal("CAT").field) {
					var f = null;
					if (field === this.getFilterVal("PRD").field) {
						f = "PRD";
					} else {
						f = "CAT";
					}
					if (dataModel) {
						calcModel = new sap.ui.model.json.JSONModel(
							dataModel.oData);
					} else {
						calcModel = new sap.ui.model.json.JSONModel(
							oController.getOwnerComponent()
							.getModel("filterPC").oData);
					}
                    calcModel.setSizeLimit(99999);
					var oCalcBinding = calcModel
						.bindList("/ProductCollection");
					for (var m = 0; m < all.length; m++) {

						// var searchFilterProd = new sap.ui.model.Filter(field, "EQ", all[m].value);
						var searchFilterProd = new sap.ui.model.Filter(field, sap.ui.model.FilterOperator.Contains, all[m].value);
						var count = 0;
						count = oCalcBinding.filter(searchFilterProd).getLength();
						/*for (j = 0; j < oCalcBinding.getLength(); j++) {

								var prodBinding = calcModel
									.bindList("/ProductCollection/" + j + "/ItemSet/results");
								prodBinding.filter(searchFilterProd);

								if (prodBinding.getLength() > 0) {
									count++;

								}
							}*/

						uField.push({
							"Field": all[m].name,
							"Count": count,
							"CurrCount": count,
							"section": f,
							"id": m + all[m].value.replace(/[^\w]/g, ''),
							"value": all[m].value
						});

					}
				} else if (field === this.getFilterVal("POL").field || field === this.getFilterVal("POA").field) {
					var sec = null;
					if (field === this.getFilterVal("POL").field) {
						sec = "POL";
					} else {
						sec = "POA";
					}
					for (i = 0; i < all.length; i++) {
						filter.push(new sap.ui.model.Filter(field,
							"EQ", all[i].value));
					}
					for (j = 0; j < all.length; j++) {
						oBinding.filter(filter[j]);
						uField.push({
							"Field": all[j].name,
							"Count": oBinding.getLength(),
							"CurrCount": oBinding.getLength(),
							"section": sec,
							"id": j + all[j].value.replace(/[^\w]/g, ''),
							"value": all[j].value
						});
					}
				} else {
					var section = null;
					if (field === this.getFilterVal("OC").field) {
						section = "OC";
					} else if (field === this.getFilterVal("DDC").field) {
						section = "DDC";
					}
					for (i = 0; i < all.length; i++) {
						filter.push(new sap.ui.model.Filter(field,
							"EQ", all[i]));
					}
					for (j = 0; j < all.length; j++) {
						oBinding.filter(filter[j]);
						uField.push({
							"Field": all[j],
							"Count": oBinding.getLength(),
							"CurrCount": oBinding.getLength(),
							"section": section,
							"id": j + all[j].replace(/[^\w]/g, ''),
							"value": all[j]
						});
					}
				}

			}
			var oModel = new sap.ui.model.json.JSONModel();
			//Start of Change GDNK903907 - 10-May-2016
			oModel.setSizeLimit(99999);
			//End of Change GDNK903907 - 10-May-2016
			var data = "{\"" + ctx + "\":" + JSON.stringify(uField) + "}";
			var obj = JSON.parse(data.toString());
			oModel.setData(obj);
			oController.getOwnerComponent().setModel(oModel, model);
			var context = "/" + ctx;
			var fieldList = view.byId(list);
			this.list = list;
			fieldList
				.bindAggregation(
					"items",
					context,
					jQuery
					.proxy(
						function(sId, oContext) {
							var cb = new sap.m.CheckBox({
									id: view
										.createId(prefix + "_" + oContext
											.getProperty("id")),
									text: "{Field}",
									tooltip: "{Field}",
									select: [
										evtHandler,
										oController
									]
								})
								.addStyleClass(
									"routePgChkBox")
								.addStyleClass(
									"handPointer pointer cbLabel");

							/**/
							var btn = new
							sap.m.Button({
									id: view
										.createId(
											"_" + prefix + "_OnlyBtn_" + oContext
											.getProperty("id")),
									visible: false,
									text: "Only",
									press: [
										oController.handleOnlyBtnPress,
										oController
									]

								})
								.addStyleClass("navButton filterBtn onlyBtn"); /**/

							var lbl = new sap.m.Label({
									id: view
										.createId(prefix + "_" + oContext
											.getProperty("id") + "Count"),
									text: "{CurrCount}",
									visible: this.list === "productList" ? true : true
								})
								.addStyleClass("countLbl");

							var hBox = new sap.m.HBox(
									view
									.createId("rp_cb_hb_" + prefix + oContext
										.getProperty("id")), {
										items: [new sap.ui.layout.HorizontalLayout({
												content: [
													cb,
													lbl, btn // ,btn
												]
											})
											.addStyleClass("filterHdr filterWidth") // ,
											// new
											// sap.m.Label({
											// id:
											// view
											// .createId(prefix
											// + "_"
											// +
											// oContext
											// .getProperty("id")
											// +
											// "Count"),
											// text:
											// "{Count}"
											// })
											// .addStyleClass("countLbl")]
										]
									})
								.addStyleClass("firstFilterBoxWidthWithoutBtnDP");

							/**/
							hBox
								.attachBrowserEvent(
									this.mE,
									function(
										e) {
										btn
											.setVisible(true);
									});
							hBox
								.attachBrowserEvent(
									this.mL,
									function(
										e) {
										btn
											.setVisible(false);
									}); /**/
							return new sap.m.CustomListItem({
								content: [hBox]
							});
						}, oController));

			fieldList.setModel(oModel);
			if (model === "poaModelRoot" || model === "poaModelPA" || model === "poaModelDCL") {
				if (oController.oFilterLoadFinishedDeferred) {
					oController.oFilterLoadFinishedDeferred.resolve();
				}
				this.getFilterLoadDefObj().resolve();
			}

		},

		getPAFilters: function() {
			var filters = [{
				name: this.getResourceBundle().getText("late"),
				val: "1"
			}, {
				name: this.getResourceBundle().getText("early"),
				val: "-1"
			}, {
				name: this.getResourceBundle().getText("onTime"),
				val: "0"
			}, {
				name: this.getResourceBundle().getText("arrived"),
				val: "2"
			}, {
				name: this.getResourceBundle().getText("unidentified"),
				val: "3"
			}];
			return filters;
		},
		getPFFilters: function() {
			var filters = [{
				name: this.getResourceBundle().getText("outOfStock"),
				val: "1"
			}, {
				name: this.getResourceBundle().getText("lowStock"),
				val: "2"
			}, {
				name: this.getResourceBundle().getText("noFlag"),
				val: "3"
			}];
			return filters;
		},
		getATFilters: function() {
			var filters = [{
				name: this.getResourceBundle().getText("at_fa"),
				val: "1"
			}, {
				name: this.getResourceBundle().getText("at_est"),
				val: "0"
			}];
			return filters;
		},

		isAllUncheckedExcept: function(filterSection, view, source) {
			var isAllUncheckedPA = this.getFilterStateFor("PA",
				view).isAllUnchecked;
			var isAllUncheckedPF = this.getFilterStateFor("PF",
				view).isAllUnchecked;
			var isAllUncheckedOC = this.getFilterStateFor("OC",
				view).isAllUnchecked;
			var isAllUncheckedDDC = null;
			var isAllUncheckedAT = null;
			// 31Aug2016
			/*var isAllUncheckedPRD = this.getFilterStateFor("PRD",
				view).isAllUnchecked;*/
			var isAllUncheckedCAT = this.getFilterStateFor("CAT",
				view).isAllUnchecked;
			var isAllUncheckedPOL = this.getFilterStateFor("POL",
				view).isAllUnchecked;
			var isAllUncheckedPOA = this.getFilterStateFor("POA",
				view).isAllUnchecked;
			if (source === "DCL") {
				isAllUncheckedDDC = true;
				isAllUncheckedAT = true;
			} else {
				isAllUncheckedAT = true;
				isAllUncheckedDDC = this.getFilterStateFor("DDC",
					view).isAllUnchecked;
			}
			if (filterSection === "PA") {
				if (isAllUncheckedPF === true && isAllUncheckedOC === true && isAllUncheckedDDC === true && //isAllUncheckedPRD === true &&
					isAllUncheckedPOL === true && isAllUncheckedPOA === true && isAllUncheckedCAT === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}

			} else if (filterSection === "PF") {
				if (isAllUncheckedPA === true && isAllUncheckedOC === true && isAllUncheckedDDC === true && //isAllUncheckedPRD === true &&
					isAllUncheckedPOL === true && isAllUncheckedPOA === true && isAllUncheckedCAT === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}
			} else if (filterSection === "OC") {
				if (isAllUncheckedPF === true && isAllUncheckedPA === true && isAllUncheckedDDC === true && //isAllUncheckedPRD === true &&
					isAllUncheckedPOL === true && isAllUncheckedPOA === true && isAllUncheckedCAT === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}
			} else if (filterSection === "DDC") {
				if (isAllUncheckedPF === true && isAllUncheckedOC === true && isAllUncheckedPA === true && //isAllUncheckedPA\RD === true &&
					isAllUncheckedPOL === true && isAllUncheckedPOA === true && isAllUncheckedCAT === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}
			} else if (filterSection === "POL") {
				if (isAllUncheckedPF === true && isAllUncheckedOC === true && isAllUncheckedPA === true && //isAllUncheckedPRD === true &&
					isAllUncheckedDDC === true && isAllUncheckedPOA === true && isAllUncheckedCAT === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}
			} else if (filterSection === "POA") {
				if (isAllUncheckedPF === true && isAllUncheckedOC === true && isAllUncheckedPA === true && //isAllUncheckedPRD === true &&
					isAllUncheckedDDC === true && isAllUncheckedPOL === true && isAllUncheckedCAT === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}
			} else if (filterSection === "PRD") {
				if (isAllUncheckedPF === true && isAllUncheckedOC === true && isAllUncheckedPA === true && isAllUncheckedPOL === true &&
					isAllUncheckedDDC === true && isAllUncheckedPOA === true && isAllUncheckedCAT === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}
			} else if (filterSection === "CAT") {
				if (isAllUncheckedPF === true && isAllUncheckedOC === true && isAllUncheckedPA === true && //isAllUncheckedPRD === true &&
					isAllUncheckedDDC === true && isAllUncheckedPOA === true && isAllUncheckedPOL === true && isAllUncheckedAT === true) {
					return true;
				} else {
					return false;
				}
			} else if (filterSection === "AT") {
				if (isAllUncheckedPF === true && isAllUncheckedOC === true && isAllUncheckedPA === true && //isAllUncheckedPRD === true &&
					isAllUncheckedDDC === true && isAllUncheckedPOA === true && isAllUncheckedPOL === true && isAllUncheckedCAT === true) {
					return true;
				} else {
					return false;
				}
			}
		},

		//Added for performance
		getFilterState: function(oController, filterSection) {
			var view = this.getView();
			var filterSections = [{
				section: "PA",
				filterObj: this.getFilter("alignFilter")
			}, {
				section: "PF",
				filterObj: this.getFilter("priorityFilter")
			}, {
				section: "OC",
				filterObj: this.getFilter("countryFilter")
			}, {
				section: "DDC",
				filterObj: this.getFilter("destFilter")
			}, {
				section: "POL",
				filterObj: this.getFilter("polFilter")
			}, {
				section: "POA",
				filterObj: this.getFilter("poaFilter")
			}, 
			// 31Aug2016
			/*{
				section: "PRD",
				filterObj: this.getFilter("productFilter")
			}, */
			{
				section: "CAT",
				filterObj: this.getFilter("categoryFilter")
			}];
			var fs = [];
			/*var pos=0;
			if(filterSection!=="ALL"){
				for(var m=0;m<filterSections.length;m++){
					if(filterSections[m].section===filterSection){
						pos=m;
						break;
					}
				}
				filterSections.splice(pos,1);
			}*/

			for (var x = 0; x < filterSections.length; x++) {
				fs.push(this.getFilterStateFor(filterSections[x].section, view));
			}
			return fs;
		},
		//end

		computeCounters: function(filterS, oController, view,dataModel, source, fs) 
		{
			var d = new Date();
			$.sap.log.info("Start: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
			var fArr = null;
			if (source === "DCL") {
				fArr = [oController.priorityFilter,
					oController.alignFilter,
					// oController.prdFilter,
					// oController.catFilter,
					oController.productFilter,
					oController.categoryFilter,
					oController.countryFilter,
					oController.polFilter,
					oController.poaFilter
				];
			} else {
				fArr = [oController.priorityFilter,
					oController.alignFilter,
					oController.destFilter,
					// oController.prdFilter,
					// oController.catFilter,
					oController.productFilter,
					oController.categoryFilter,
					oController.countryFilter,
					oController.polFilter,
					oController.poaFilter
				];
			}
			var filterSection = [{
				section: "PA",
				filterObj: oController.alignFilter
			}, {
				section: "PF",
				filterObj: oController.priorityFilter
			}, {
				section: "OC",
				filterObj: oController.countryFilter
			}, {
				section: "DDC",
				filterObj: oController.destFilter
			}, {
				section: "POL",
				filterObj: oController.polFilter
			}, {
				section: "POA",
				filterObj: oController.poaFilter
			}, {
				section: "PRD",
				filterObj: oController.productFilter // oController.prdFilter
			}, {
				section: "CAT",
				filterObj: oController.categoryFilter //oController.catFilter
			}];
			/*, {
              section : "AT",
              filterObj : oController.atFilter
            } ];*/

			for (var x = 0; x < filterSection.length; x++) {
				if (source === "DCL") {
					if (filterSection[x].section === "DDC") {
						continue;
					}
				} else {
					if (filterSection[x].section === "AT") {
						continue;
					}
				}
				var filterVal = this
					.getFilterVal(filterSection[x].section);
				var oModel = new sap.ui.model.json.JSONModel(dataModel.getProperty("/"));
				oModel.setSizeLimit(99999);
				var oBinding = oModel
					.bindList("/ProductCollection");
				var cbArr = null;
				cbArr = fs[x].data;
				if (filterSection[x].section === "PRDZ" || filterSection[x].section === "CATZ") {
					if (filterSection[x].section === "CAT") {
						for (var i = 0; i < cbArr.length; i++) {
							var cb = view.byId(cbArr[i].cbId);
							var oFilter = [];
							var oFilterU = [];
							var lenBefore = 0;
							var lenAfter = 0;
							var len = 0;
							// for category
							var calcModel = new sap.ui.model.json.JSONModel(
								dataModel.oData);
							calcModel.setSizeLimit(99999);
							var oCalcBinding = calcModel
								.bindList("/ProductCollection");
							var searchFilter = new sap.ui.model.Filter(
								filterVal.field, "EQ",
								cb.getModel().getProperty(
									"/" + filterVal.context + "/" + i + "/value"));
							var count = 0;
							for (var j = 0; j < oCalcBinding
								.getLength(); j++) {

								var subBinding = oModel
									.bindList("/ProductCollection/" + j + "/ItemSet/results");
								subBinding.filter(searchFilter);
								var contexts = oCalcBinding.getContexts(0, oCalcBinding.getLength());
								if (subBinding.getLength() > 0) {
									count++;
									var item = oModel
										.getProperty(contexts[j].sPath);
									oFilterU.push(item.GUID);
								}
							}
							for (var a = 0; a < oFilterU.length; a++) {
								oFilter.push(new sap.ui.model.Filter(
									"GUID",
									sap.ui.model.FilterOperator.EQ,
									oFilterU[a]));
							}
							var oFilters = new sap.ui.model.Filter({
								aFilters: [],
								bAnd: false
							});
							if (cb.getSelected() === false) {
								lenBefore = oBinding.filter(
										oController.allFilters)
									.getLength();
								for (var k = 0; k < oFilter.length; k++) {
									this.addToFilter(oFilter[k],
										filterSection[x].filterObj,
										oController);
								}
								oController.adjustAllFilters("NONE",
									oController.allFilters, fArr);
								lenAfter = oBinding.filter(
										oController.allFilters)
									.getLength();

								// Added for test
								//var l = filterSection[x].filterObj.length;
								if (fs[x].isAllUnchecked === true && oController.source !== "PA" && oController.source !== "PF") {
									len = lenAfter;
								} else {
									len = lenAfter - lenBefore;
								}
								for (k = 0; k < oFilter.length; k++) {
									this.removeFromFilter(oFilter[k],
										filterSection[x].filterObj);
								}
								oController.adjustAllFilters("NONE",
									oController.allFilters, fArr);
								if (len < 0) {
									len = len + oBinding.filter(null)
										.getLength();
								}
							} else {

								for (var z = 0; z < oFilter.length; z++) {
									oFilters.aFilters.push(oFilter[z]);
								}
								len = oBinding
									.filter(
										new sap.ui.model.Filter({
											aFilters: [
												oController.allFilters,
												oFilters
											],
											bAnd: true
										})).getLength();
							}
							view.byId(cbArr[i].cbId + "Count").setText(
								len);

						}
					}
				} else {
					var field = filterVal.field;
					var op = sap.ui.model.FilterOperator.EQ;
					if (filterSection[x].section === "PRD") {
						field = "SKU";
						op = sap.ui.model.FilterOperator.Contains;
					} else if (filterSection[x].section === "CAT") {
						field = "CategoryDesc";
						op = sap.ui.model.FilterOperator.Contains;
					}

					for (i = 0; i < cbArr.length; i++) {
						cb = view.byId(cbArr[i].cbId);
						oFilter = new sap.ui.model.Filter(field, op, cb.getModel().getProperty(
							"/" + filterVal.context + "/" + i + "/value"));
						/*	oFilter = new sap.ui.model.Filter(
								filterVal.field, "EQ",
								cb.getModel().getProperty(
									"/" + filterVal.context + "/" + i + "/value"));*/
						// Added for Grayed Out Issue
						len = 0;
						lenBefore = 0;
						lenAfter = 0;
						if (cb.getSelected() === false) {
							lenBefore = oBinding.filter(
									oController.allFilters)
								.getLength();
							this.addToFilter(oFilter,
								filterSection[x].filterObj);
							oController.adjustAllFilters("NONE",
								oController.allFilters, fArr);
							lenAfter = oBinding.filter(
									oController.allFilters)
								.getLength();
							// Added for test
							if (fs[x].isAllUnchecked === true) {
								len = lenAfter;
							} else {
								len = lenAfter - lenBefore;
							}
							if (fs[x].isAllUnchecked === true && oController.source !== null && filterSection[x].filterObj.length > 1) {
								len = lenAfter - lenBefore;
							}

							this.removeFromFilter(oFilter,
								filterSection[x].filterObj);
							oController.adjustAllFilters("NONE",
								oController.allFilters, fArr);

							if (len < 0) {
								len = len + oBinding.filter(null)
									.getLength();
							}
						} else {
							len = oBinding
								.filter(
									new sap.ui.model.Filter({
										aFilters: [
											oController.allFilters,
											oFilter
										],
										bAnd: true
									})).getLength();
						}
						view.byId(cbArr[i].cbId + "Count").setText(
							len);
						if (oController.source === "PA" || oController.source === "PF") {
							// For auto tick in filters
							if (len !== 0 && ((filterSection[x].section !== "PA" && filterSection[x].section !== "PF") || (oController.source === "PA" &&
									filterSection[x].section === "PF") || (oController.source === "PF" && filterSection[x].section === "PA"))) {
								cb.setSelected(true);
								this.addToFilter(oFilter,
									filterSection[x].filterObj);
								oController.adjustAllFilters(
									"NONE",
									oController.allFilters,
									fArr);
							} else if (len === 0 && ((filterSection[x].section !== "PA" && filterSection[x].section !== "PF") || (oController.source ===
									"PA" &&
									filterSection[x].section === "PF") || (oController.source === "PF" && filterSection[x].section === "PA"))) {
								cb.setSelected(false);
								this.removeFromFilter(oFilter,
									filterSection[x].filterObj);
								oController.adjustAllFilters(
									"NONE",
									oController.allFilters,
									fArr);
							}
						}

					}
				}

			}
			this.hideBusy();
			d = new Date();
			$.sap.log.info("Stop: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
			//this.hideBusy();
		},
/*		computeCountersNew: function(filterS, oController, view, dataModel, source, fs) {
			var d = new Date();
			$.sap.log.info("Start: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
			var fArr = null;
			if (source === "DCL") {
				fArr = [oController.priorityFilterUC,
					oController.alignFilterUC,
					oController.productFilterUC,
					oController.categoryFilterUC,
					oController.countryFilterUC,
					oController.polFilterUC,
					oController.poaFilterUC
				];
			} else {
				fArr = [oController.priorityFilterUC,
					oController.alignFilterUC,
					oController.destFilterUC,
					oController.productFilterUC,
					oController.categoryFilterUC,
					oController.countryFilterUC,
					oController.polFilterUC,
					oController.poaFilterUC
				];
			}
			var filterSection = [{
				section: "PA",
				filterObj: oController.alignFilter
			}, {
				section: "PF",
				filterObj: oController.priorityFilter
			}, {
				section: "OC",
				filterObj: oController.countryFilter
			}, {
				section: "DDC",
				filterObj: oController.destFilter
			}, {
				section: "POL",
				filterObj: oController.polFilter
			}, {
				section: "POA",
				filterObj: oController.poaFilter
			}, {
				section: "PRD",
				filterObj: oController.productFilter
			}, {
				section: "CAT",
				filterObj: oController.categoryFilter
			}];
// 			, {
//               section : "AT",
//               filterObj : oController.atFilter
//             } ];

			for (var x = 0; x < filterSection.length; x++) {
				if (source === "DCL") {
					if (filterSection[x].section === "DDC") {
						continue;
					}
				} else {
					if (filterSection[x].section === "AT") {
						continue;
					}
				}
				var filterVal = this.getFilterVal(filterSection[x].section);
				var oModel = new sap.ui.model.json.JSONModel(dataModel.oData);
				oModel.setSizeLimit(99999);
				var oBinding = oModel.bindList("/ProductCollection");
				var cbArr = null;
				cbArr = fs[x].data;
				if (filterSection[x].section === "PRDZ" || filterSection[x].section === "CATZ") {
					if (filterSection[x].section === "CAT") {
						for (var i = 0; i < cbArr.length; i++) {
							var cb = view.byId(cbArr[i].cbId);
							var oFilter = [];
							var oFilterU = [];
							var lenBefore = cb.getModel().getProperty("/" + filterVal.context + "/" + i + "/Count");
							var lenAfter = 0;
							var len = 0;
							// for category
							var calcModel = new sap.ui.model.json.JSONModel(
								dataModel.oData);
							calcModel.setSizeLimit(99999);
							var oCalcBinding = calcModel
								.bindList("/ProductCollection");
							var searchFilter = new sap.ui.model.Filter(
								filterVal.field, "EQ",
								cb.getModel().getProperty("/" + filterVal.context + "/" + i + "/value"));
							var count = 0;
							for (var j = 0; j < oCalcBinding
								.getLength(); j++) {

								var subBinding = oModel
									.bindList("/ProductCollection/" + j + "/ItemSet/results");
								subBinding.filter(searchFilter);
								var contexts = oCalcBinding.getContexts(0, oCalcBinding.getLength());
								if (subBinding.getLength() > 0) {
									count++;
									var item = oModel
										.getProperty(contexts[j].sPath);
									//oFilterU.push(item.GUID);
									oFilter.push(new sap.ui.model.Filter(
										"GUID",
										sap.ui.model.FilterOperator.EQ,
										item.GUID));
								}
							}
				// 			for (var a = 0; a < oFilterU.length; a++) {
				// 					oFilter.push(new sap.ui.model.Filter(
				// 						"GUID",
				// 						sap.ui.model.FilterOperator.EQ,
				// 						oFilterU[a]));
				// 				}
							var oFilters = new sap.ui.model.Filter({
								aFilters: oFilter,
								bAnd: false
							});
							if (cb.getSelected() === false) {
								// lenBefore = oBinding.filter(
								// 		oController.allFilters)
								// 		.getLength();
								// 	for (var k = 0; k < oFilter.length; k++) {
								// 		this.addToFilter(oFilter[k],
								// 			filterSection[x].filterObj,
								// 			oController);
								// 	}
								// 	oController.adjustAllFilters("NONE",
								// 		oController.allFilters, fArr);
								lenAfter = oBinding.filter(oFilters).getLength();

								// Added for test
								//var l = filterSection[x].filterObj.length;
								if (fs[x].isAllUnchecked === true && oController.source !== "PA" && oController.source !== "PF") {
									len = lenBefore;
								} else {
									len = lenBefore - lenAfter;
								}
								// for (k = 0; k < oFilter.length; k++) {
								// 		this.removeFromFilter(oFilter[k],
								// 			filterSection[x].filterObj);
								// 	}
								// 	oController.adjustAllFilters("NONE",
								// 		oController.allFilters, fArr);
								// 	if (len < 0) {
								// 		len = len + oBinding.filter(null)
								// 			.getLength();
								// 	}
							} else {

								// 	for (var z = 0; z < oFilter.length; z++) {
								// 		oFilters.aFilters.push(oFilter[z]);
								// 	}
								len = oBinding
									.filter(
										new sap.ui.model.Filter({
											aFilters: [
												oController.allFilters,
												oFilters
											],
											bAnd: true
										})).getLength();
							}
							view.byId(cbArr[i].cbId + "Count").setText(
								len);

						}
					}
				} else {
					var field = filterVal.field;
					var op = sap.ui.model.FilterOperator.EQ;
					if (filterSection[x].section === "PRD") {
						field = "Products";
						op = sap.ui.model.FilterOperator.Contains;
					} else if (filterSection[x].section === "PRD") {
						field = "Catgories";
						op = sap.ui.model.FilterOperator.Contains;
					}
					for (i = 0; i < cbArr.length; i++) {
						cb = view.byId(cbArr[i].cbId);
						oFilter = new sap.ui.model.Filter(field, op, cb.getModel().getProperty(
							"/" + filterVal.context + "/" + i + "/value"));
						// Added for Grayed Out Issue
						len = 0;
						lenBefore = cb.getModel().getProperty("/" + filterVal.context + "/" + i + "/Count");
						lenAfter = 0;
						if (cb.getSelected() === false) {
				// 			lenBefore = oBinding.filter(
				// 					oController.allFilters)
				// 					.getLength();
				// 				this.addToFilter(oFilter,
				// 					filterSection[x].filterObj);
				// 				oController.adjustAllFilters("NONE",
				// 					oController.allFilters, fArr);
							lenAfter = oBinding.filter(
									oFilter)
								.getLength();
							// Added for test
							if (fs[x].isAllUnchecked === true) {
								len = lenBefore;
							} else {
								len = lenBefore - lenAfter;
							}
							if (fs[x].isAllUnchecked === true && oController.source !== null && filterSection[x].filterObj.length > 1) {
								len = lenBefore - lenAfter;
							}

								// this.removeFromFilter(oFilter,
								// 	filterSection[x].filterObj);
								// oController.adjustAllFilters("NONE",
								// 	oController.allFilters, fArr);

								// if (len < 0) {
								// 	len = len + oBinding.filter(null)
								// 		.getLength();
								// }
						} else {
							len = oBinding
								.filter(
									new sap.ui.model.Filter({
										aFilters: [
											oController.allFilters,
											oFilter
										],
										bAnd: true
									})).getLength();
						}
						view.byId(cbArr[i].cbId + "Count").setText(
							len);
						if (oController.source === "PA" || oController.source === "PF") {
							// For auto tick in filters
							if (len !== 0 && ((filterSection[x].section !== "PA" && filterSection[x].section !== "PF") || (oController.source === "PA" &&
									filterSection[x].section === "PF") || (oController.source === "PF" && filterSection[x].section === "PA"))) {
								cb.setSelected(true);
								this.addToFilter(oFilter,
									filterSection[x].filterObj);
								oController.adjustAllFilters(
									"NONE",
									oController.allFilters,
									fArr);
							} else if (len === 0 && ((filterSection[x].section !== "PA" && filterSection[x].section !== "PF") || (oController.source ===
									"PA" &&
									filterSection[x].section === "PF") || (oController.source === "PF" && filterSection[x].section === "PA"))) {
								cb.setSelected(false);
								this.removeFromFilter(oFilter,
									filterSection[x].filterObj);
								oController.adjustAllFilters(
									"NONE",
									oController.allFilters,
									fArr);
							}
						}

					}
				}

			}
			this.hideBusy();
			d = new Date();
			$.sap.log.info("Stop: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
			//this.hideBusy();
		},*/
		showBusy: function(controls) {
			var view = this.getView();
			for (var i = 0; i < controls.length; i++) {
				view.byId(controls[i]).setBusy(true);
			}
		},
		hideBusy: function() {
			var view = this.getView();
			view.byId("filterBox").setBusy(false);
			if (view.byId("graphBox")) {
				view.byId("graphBox").setBusy(false);
			}
			if (view.byId("alignDonut")) {
				view.byId("alignDonut").setBusy(false);
			}
			if (view.byId("flagDonut")) {
				view.byId("flagDonut").setBusy(false);
			}
			if (view.byId("idProductsTable1")) {
        		view.byId("idProductsTable1").setBusy(false);
        	}
	        if (view.byId("idProductsTable")) {
	          view.byId("idProductsTable").setBusy(false);
	        }
			if (view.byId("dcLoadChart")) {
				view.byId("dcLoadChart").setBusy(false);
			}
			if (view.byId("dcLoadDetails")) {
				view.byId("dcLoadDetails").setBusy(false);
			}
		},
		setDocTitle: function(name) {
			if (name === "Root" || name === "DashboardP") {
				return this.DASHBOARD;
			} else if (name === "PlanningAdvisor" || name === "PlanningAdvisorP") {
				return this.PA;
			} else if (name === "ContainerDetail" || name === "ContainerDetailP") {
				return this.DETAIL;
			} else if (name === "DistributionCenterLoad" || name === "DistributionCenterLoadP") {
				return this.DCL;
			} else {
				return "OCT Hub";
			}
		},

		isValidParameters: function(args, isDetail) {
			var maxdt = null;
			var mindt = null;
			var rA = false;
			var rD = false;

			if (args.direction !== "Inbound" && args.direction !== "Outbound") {
				this.getRouter().navTo("Error", null, true);
				return false;
				// 	this.updateMktModel(args.direction, args.companyCode);
				// } else if (args.direction === "Outbound") {
				// 	this.updateMktModel(args.direction, args.companyCode);
				// } else {
				// 	this.getRouter().navTo("Error", null, false);
				// 	return false;
			}

			if (args.type === "Arrival") {
				rA = true;
			} else if (args.type === "Departure") {
				rD = true;
			} else {
				this.getRouter().navTo("Error", null, true);
				return false;
			}

			if (isNaN(args.fromDate) || args.fromDate.toString().length !== 8) {
				this.showDateError("errDateFormat", "errDateRange",
					isDetail);
				return false;
			} else {
				try {
					mindt = sap.ui.core.format.DateFormat
						.getDateInstance({
							pattern: "yyyyMMdd",
							UTC: true
						}).parse(args.fromDate);
					mindt = args.fromDate.toString();
				} catch (err) {
					this.showDateError("errDateFormat",
						"errDateRange", isDetail);
					return false;
				}
			}

			if (isNaN(args.toDate) || args.toDate.toString().length !== 8) {
				this.showDateError("errDateFormat", "errDateRange",
					isDetail);
				return false;
			} else {
				try {
					maxdt = sap.ui.core.format.DateFormat
						.getDateInstance({
							pattern: "yyyyMMdd",
							UTC: true
						}).parse(args.toDate);
					maxdt = args.toDate.toString();
				} catch (err) {
					this.showDateError("errDateFormat",
						"errDateRange", isDetail);
					return false;
				}
			}

			var oDateRangeModel = new sap.ui.model.json.JSONModel();
			oDateRangeModel.setData({
				max: maxdt,
				min: mindt,
				rA: rA,
				rD: rD
			});
			this.getOwnerComponent().setModel(oDateRangeModel,
				"dateRangeModel");
			if (!this.isValidDateRange(mindt, maxdt, isDetail)) {
				return false;
			}
			this.updateMktModel(args.direction, args.companyCode);
			var oMktModel = this.getOwnerComponent().getModel("usrMktModel");
			var companyCodeCookie = oMktModel.getProperty("/UserId") + "-companyCode";
			if ($.inArray(args.companyCode, oMktModel.getProperty("/actualCompCodes")) === -1) {
				args.companyCode = oMktModel.getProperty("/actualCompCodes")[0];
				$.cookie(companyCodeCookie, oMktModel.getProperty("/actualCompCodes")[0], {
					expires: 3650
				});
				this.getModel("oMktModel").setProperty("/mkt", oMktModel.getProperty("/actualCompCodes")[0]);
			}
			this.updateAppPropertiesFromHash(mindt, maxdt, args.direction, args.type, args.companyCode);
			return true;
		},

		isValidDateRange: function(mindt, maxdt, isDetail) {
			if (parseInt(mindt) > parseInt(maxdt)) {
				this.showDateError("dateRangeErrText",
					"errDateRange", isDetail);
			} else {
				return true;
			}
		},

		showDateError: function(errText, errTitle, isDetail) {
			if (isDetail) {
				sap.m.MessageBox.alert(this.getResourceBundle()
					.getText(errText), {
						styleClass: "sapUiSizeCompact",
						icon: sap.m.MessageBox.Icon.ERROR,
						title: this.getResourceBundle().getText(errTitle),
						onClose: $.proxy(function(oAction) {
							this.getRouter().navTo("NotFound", null,
								false);
						}, this)
					});
			} else {
				sap.m.MessageBox.alert(this.getResourceBundle()
					.getText(errText), {
						styleClass: "sapUiSizeCompact",
						icon: sap.m.MessageBox.Icon.ERROR,
						title: this.getResourceBundle().getText(errTitle),
						onClose: $.proxy(function(oAction) {
							this.openCalender();
						}, this) 
					});
			}

		},
		//for GDN OData Integration
		getODataModel: function(fromDate, toDate) {
			fromDate = this.getModel("appProperties").getProperty("/fD");
			toDate = this.getModel("appProperties").getProperty("/tD");
			var oComp = this.getOwnerComponent();
			var country_CC = null;
			var fD = sap.ui.core.format.DateFormat
				.getDateTimeInstance({
					pattern: 'yyyyMMdd',
					UTC: true
				}).parse(fromDate);
			var tD = sap.ui.core.format.DateFormat
				.getDateTimeInstance({
					pattern: 'yyyyMMdd',
					UTC: true
				}).parse(toDate);
			fromDate = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: 'yyyy-MM-ddTHH:mm:ss',
				UTC: true
			}).format(fD, true);
			toDate = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: 'yyyy-MM-ddTHH:mm:ss',
				UTC: true
			}).format(tD, true);
			//        var mkt = oComp.getModel("usrMktModel").getProperty("/Market");
			var showCC = oComp.getModel("usrMktModel").getProperty("/showCompCodes");
			if (showCC) {
				country_CC = "Company";
			} else {
				country_CC = "Country";
			}
			var mkt = oComp.getModel("oMktModel").getProperty("/mkt");
			var direction = oComp.getModel("oMktModel").getProperty("/direction");
			var param = "";
			if (direction === "Inbound") {
				param = "Destination" + country_CC + " eq '" + mkt + "'";
			} else if (direction === "Outbound") {
				param = "Origin" + country_CC + " eq '" + mkt + "'";
			} else {
				$.sap.log.error(this.getResourceBundle().getText("errNoDirection"));
				return;
			}
			//Change for Date Indicator 11-04-2016
			var dateInd = "";
			if (this.getModel("appProperties").getProperty("/isRD") === true) {
				dateInd = "X";
			}
			param += " and DateInd eq '" + dateInd + "'";
			//End Change for Date Indicator 11-04-2016
			var self = this;
			var mConfig = oComp.getMetadata().getConfig();
			var octServerModelUrl = mConfig.GTPT_SRV_PERF.serviceUrl;
			var localModel = new sap.ui.model.json.JSONModel();
			localModel.setSizeLimit(99999);
			this.BUSY_DIALOG.setText(this.getResourceBundle().getText("fetchData"));
			this.busyIndicatorShow();
			var serverModel = new sap.ui.model.odata.ODataModel(octServerModelUrl, this.oDefaultODataParams);
			serverModel.read("/ProductSet?$filter=FromDate eq datetime'" +
				fromDate + "' and ToDate eq datetime'" +
				toDate + "' and " + param + "&$expand=ItemSet", null, [], null,
				// toDate + "' and " + param, null, [], null,
			// serverModel.read("/ProductSet?$filter=" + param + "&$expand=ItemSet", null, [], null,
				function(oData, oResponse) {
					var data = null;
					var uriParams = $.sap.getUriParameters(window.location.href);
					var limit = uriParams.get("limit");
					var isXmlDate = uriParams.get("xmldate");
					self.BUSY_DIALOG.setText("");
					self.busyIndicatorHide();
					data = oData.results;
					if (Utility.hasValue(isXmlDate) && isXmlDate.toLowerCase()==="x"){
						data=Utility.adjustXmlDatesToJSDates(data,["UDelDate","InitDelDate","LatestEventDate","LatestMsgDate","MsgCreateDate"]);
					}
					var newL = 0;
					if (Utility.hasValue(limit) && !isNaN(limit)) {
						if (limit > 2000) {
							limit = 2000;
						}
						while (true) {
							data = data.concat(data);
							newL = data.length;
							if (newL > limit) {
								data = data.slice(0, limit);
								break;
							}
						}
					}

					localModel.setData({
						ProductCollection: data
					});
					//self.calculateAlignStatus(localModel);
					self.adjustForNestedFilters(localModel);
					self.appendRatingModel(localModel);
					oComp.setModel(localModel, "LocalModel");
					if (self.getView().getController().oDefaultLoadFinishedDef !== undefined) {
						self.getView().getController().oDefaultLoadFinishedDef.resolve();
					}
					if (self.getView().getController().oLoadFinishedDef !== undefined) {
						self.getView().getController().oLoadFinishedDef.resolve();
					}
					if (self.oLoadFinishedDef !== undefined) {
						self.oLoadFinishedDef.resolve();
					}
					if (self.oLoadFinished !== undefined) {
						self.oLoadFinishedDef.resolve();
					}
					self.getOwnerComponent().oOverlayDef.resolve();
				},
				function(oData, oResponse) {
					self.BUSY_DIALOG.setText("");
					self.busyIndicatorHide();
					var error = JSON.parse(oData.response.body).error.message.value;
					sap.m.MessageBox.alert(error, {
						styleClass: "sapUiSizeCompact",
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error",
						onClose:$.proxy(function(){this.getOwnerComponent().oOverlayDef.resolve();},self)
					});
					localModel.setData({
						ProductCollection: []
					});
					self.appendRatingModel(localModel);
					oComp.setModel(localModel, "LocalModel");
					if (self.getView().getController().oDefaultLoadFinishedDef !== undefined) {
						self.getView().getController().oDefaultLoadFinishedDef.resolve();
					}
					if (self.getView().getController().oLoadFinishedDef !== undefined) {
						self.getView().getController().oLoadFinishedDef.resolve();
					}
					if (self.oLoadFinishedDef !== undefined) {
						self.oLoadFinishedDef.resolve();
					}
					if (self.oLoadFinished !== undefined) {
						self.oLoadFinishedDef.resolve();
					}

				}
			);
		},
		getODataModelForExcel: function(fromDate, toDate) {
			var country_CC = null,
				oComp = this.getOwnerComponent();
			var fD = sap.ui.core.format.DateFormat
				.getDateTimeInstance({
					pattern: 'yyyyMMdd',
					UTC: true
				}).parse(fromDate);
			var tD = sap.ui.core.format.DateFormat
				.getDateTimeInstance({
					pattern: 'yyyyMMdd',
					UTC: true
				}).parse(toDate);
			fromDate = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: 'yyyy-MM-ddTHH:mm:ss',
				UTC: true
			}).format(fD, true);
			toDate = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: 'yyyy-MM-ddTHH:mm:ss',
				UTC: true
			}).format(tD, true);
			//        var mkt = this.getOwnerComponent().getModel("usrMktModel").getProperty("/Market");
			//        var direction = this.getOwnerComponent().getModel("oMktModel").getProperty("/direction");
			//        var param = "";
			//        if (direction === "Inbound") {
			//          param = "DestinationCountry eq '" + mkt + "'";
			//        } else if (direction === "Outbound") {
			//          param = "OriginCountry eq '" + mkt + "'";
			//        } else {
			//          $.sap.log.error(this.getResourceBundle().getText("errNoDirection"));
			//          return;
			//        }
			//      var mkt = oComp.getModel("usrMktModel").getProperty("/Market");
			var showCC = oComp.getModel("usrMktModel").getProperty("/showCompCodes");
			if (showCC) {
				country_CC = "Company";
			} else {
				country_CC = "Country";
			}
			var mkt = oComp.getModel("oMktModel").getProperty("/mkt");
			var direction = oComp.getModel("oMktModel").getProperty("/direction");
			var param = "";
			if (direction === "Inbound") {
				param = "Destination" + country_CC + " eq '" + mkt + "'";
			} else if (direction === "Outbound") {
				param = "Origin" + country_CC + " eq '" + mkt + "'";
			} else {
				$.sap.log.error(this.getResourceBundle().getText("errNoDirection"));
				return;
			}
			//Change for Date Indicator 11-04-2016
			var dateInd = "";
			if (oComp.getModel("dateRangeModel").getProperty("/rD") === true) {
				dateInd = "X";
			}
			param += " and DateInd eq '" + dateInd + "'";
			//End Change for Date Indicator 11-04-2016
			var self = this;
			//        var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerModelUrl = mConfig.GTPT_SRV_PERF.serviceUrl;
			var localModel = new sap.ui.model.json.JSONModel();
			localModel.setSizeLimit(99999);
			var serverModel = new sap.ui.model.odata.ODataModel(octServerModelUrl, true);
			serverModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			serverModel.read("/ProductSet?$filter=FromDate eq datetime'" +
				fromDate + "' and ToDate eq datetime'" +
				toDate + "' and " + param + " and ExcelDownload eq 'X'" +
				"&$expand=ContainerDetailSet,EventSet,ItemSet", null, [], null,
				function(oData, oResponse) {
					localModel.setData({
						ProductCollection: oData.results
					});
					self.adjustForNestedFilters(localModel);
					oComp.setModel(localModel, "ExcelDownloadModel");
					self.oExcelLoadFinishedDef.resolve();

				},
				function(oData, oResponse) {
					var error = JSON.parse(oData.response.body).error.message.value;
					sap.m.MessageBox.alert(error, {
						styleClass: "sapUiSizeCompact",
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error"
					});
					localModel.setData({
						ProductCollection: []
					});
					oComp.setModel(localModel, "ExcelDownloadModel");
					self.oExcelLoadFinishedDef.resolve();
				}
			);
		},
		getContainerDetails: function(guid) {
			this.oDetailLoadFinishedDef = $.Deferred();
			var self = this;
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerModelUrl = mConfig.GTPT_SRV_PERF.serviceUrl;
			var containerModel = new sap.ui.model.json.JSONModel();
			containerModel.setSizeLimit(99999);
			this.BUSY_DIALOG.setText(this.getResourceBundle().getText("fetchData"));
			this.busyIndicatorShow();
			if (this.getView().getModel()) {
				this.tempID = this.getView().getModel().getProperty("/Container");
			}
			var self = this;
			var serverModel = new sap.ui.model.odata.ODataModel(octServerModelUrl, true);
			serverModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			serverModel.read("/ContainerDetailSet?$filter=GUID eq '" +
				guid + "'&$expand=EventSet", null, [], null,
				function(oData, oResponse) {
					var sValue = $.sap.getUriParameters().get("container");
					var sType = $.sap.getUriParameters().get("dummy");
					if (Utility.hasValue(sValue)) {
						if (self.tempID === sValue || sValue.toLowerCase() === "all") {
							if (Utility.hasValue(sType)) {
								if (sType.toLowerCase() === "x") {
									oData.results[0].EventSet = {
										"results": [{
											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "OA",
											"EventID": "ZZ_LEAVE_DEST",
											"EventDesc": "Empty OutGate from Ocean Terminal (CY or Port)",
											"Location": "BRSSZ",
											"LocDesc": "SANTOS",
											"EventDate": "2016-03-28T10:57:00.000Z", //null,
											"TimeZone": "GMTUK",
											"UTCReceiveDate": "2016-03-28T10:57:00.000Z",
											"TransitLeg": ""
										}, {
											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "",
											"EventID": "DEPARTURE",
											"EventDesc": "Departure",
											"Location": "BRCUO",
											"LocDesc": "Cubatão",
											"EventDate": "2016-03-28T12:00:00.000Z",
											"TimeZone": "BRAZIL",
											"UTCReceiveDate": "2016-03-29T13:45:00.000Z",
											"TransitLeg": "1"
										}, {
											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "I",
											"EventID": "ARRIV_DEST",
											"EventDesc": "Full InGate at Ocean Terminal (CY or Port)",
											"Location": "BRSSZ",
											"LocDesc": "SANTOS",
											"EventDate": "2016-03-30T12:16:00.000Z", //null,
											"TimeZone": "GMTUK",
											"UTCReceiveDate": "2016-03-31T12:16:00.000Z",
											"TransitLeg": "2"
										}, {
											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "AE",
											"EventID": "LOAD_END",
											"EventDesc": "On-Board Vessel at Port of Loading",
											"Location": "BRSSZ",
											"LocDesc": "SANTOS",
											"EventDate": "2016-04-02T17:13:00.000Z", //null,
											"TimeZone": "GMTUK",
											"UTCReceiveDate": "2016-04-03T17:13:00.000Z",
											"TransitLeg": "2"
										}, {
											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "VD",
											"EventID": "DEPARTURE",
											"EventDesc": "Vessel Departed from Port of Loading",
											"Location": "BRSSZ",
											"LocDesc": "SANTOS",
											"EventDate": "2016-04-03T11:00:00.000Z",
											"TimeZone": "GMTUK",
											"UTCReceiveDate": "2016-04-04T05:46:00.000Z",
											"TransitLeg": "2"
										}, {

											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "VA",
											"EventID": "ARRIV_DEST",
											"EventDesc": "Vessel Arrived at Port of Discharge",
											"Location": "USPHL",
											"LocDesc": "PHILADELPHIA",
											"EventDate": "2016-04-21T11:00:00.000Z",
											"TimeZone": "GMTUK",
											"UTCReceiveDate": "2016-04-21T22:48:00.000Z",
											"TransitLeg": "3"
										}, {
											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "UV",
											"EventID": "UNLOAD_END",
											"EventDesc": "Full Container Discharged at Port of Discharge",
											"Location": "USPHL",
											"LocDesc": "PHILADELPHIA",
											"EventDate": "2016-04-22T23:56:00.000Z", //null,
											"TimeZone": "GMTUK",
											"UTCReceiveDate": "2016-04-21T23:56:00.000Z",
											"TransitLeg": "4"
										}, {

											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "OA",
											"EventID": "DEPARTURE",
											"EventDesc": "Full OutGate from Ocean Terminal (CY or Port)",
											"Location": "USPHL",
											"LocDesc": "PHILADELPHIA",
											"EventDate": "2016-04-25T12:13:00.000Z", //null,
											"TimeZone": "GMTUK",
											"UTCReceiveDate": "2016-04-25T12:13:00.000Z",
											"TransitLeg": "4"
										}, {
											"GUID": "xWR6Pk0L7jMJ{PJf2Gh9ym",
											"ShipStatusCode": "",
											"EventID": "ARRIV_DEST",
											"EventDesc": "Arrival at Destination",
											"Location": "CABRP",
											"LocDesc": "Brampton",
											"EventDate": "2016-05-09T12:52:00.000Z",
											"TimeZone": "CET",
											"UTCReceiveDate": "2016-05-09T12:52:00.000Z",
											"TransitLeg": "4"
										}]
									};
								}
							}
							var GRInd=self.getView().getModel().getProperty("/GRInd");
							var i=0,j=0,legsPos=[],legs=[],currPos=0,posFirstEvtTL=0,flag=true,newEvt=[],grEvtPos=null;
							var evt = oData.results[0].EventSet.results;
							for (i = 0; i < evt.length; i++) {
							    if(evt[i].TransitLeg==="3" && evt[i].EventID==="ARRIV_DEST"){
							        grEvtPos=i;
							        break;
							    }
							}
							if(GRInd.toUpperCase()!=="X" && grEvtPos!==null){
							    var grEvt=evt.splice(grEvtPos,1);
							    evt.push(grEvt);
							}
							for (i = 0; i < evt.length; i++) {
							    evt[i].subEvents = [];
							    if(evt[i].TransitLeg!=="" && flag){
							        posFirstEvtTL=i;
							        flag=false;
							        legs.push(evt[i].TransitLeg);
							    }
							    else{
							        if(flag){
							            evt[i].TransitLeg="-1";
							        }
							       // legs.push(evt[i].TransitLeg);
							        legsPos.push(i);
							    }  
							    
							}
							
							for (i = posFirstEvtTL; i < evt.length; i++) {
							    if(evt[i].TransitLeg!==""){
							        currPos=i;
							     //   legs.push(evt[i].TransitLeg);
							    }
							    else{
							        evt[currPos].subEvents.push(evt[i]);
							    }
							}
							for(i=0;i<evt.length;i++){
							    if(evt[i].TransitLeg!==""){
							        newEvt.push(evt[i]);
							    }
							}
							newEvt.sort(function(a, b){
							    if(a.TransitLeg===""){
							        a.TransitLeg=99;
							    }
							    if(b.TransitLeg===""){
							        b.TransitLeg=99;
							    }
                                return Number(a.TransitLeg)-Number(b.TransitLeg);
                            });
                            oData.results[0].EventSet.results = newEvt;
							/*var i=0,j=0,legs=[],pos=[];
							var evt = oData.results[0].EventSet.results;
							for (i = evt.length - 1; i >= 0; i--) {
							    if(evt[i].TransitLeg!==""){
							        legs.push(evt[i].TransitLeg);
							    }
							    evt[i].subEvents = [];
							}
							legs=Utility.getUniqueElements(legs);
							legs.sort();
							var idxLast=-1,idxAD=-1,flag=true;
							for(var k=evt.length-1;k>=0;k--){
							    if(evt[k].TransitLeg==="3"){
							        if(flag){
							            idxLast=k;
							            flag=false;
							        }
							        if(evt[k].EventID==="ARRIV_DEST"){
							            idxAD=k;
							        }
							    }
							}
							if(idxAD!==-1 && idxLast!==-1 && idxAD!==idxLast){
							    var evtAD=evt.splice(idxAD,1)[0];
							    evt.splice(idxLast,0,evtAD);
							}
							for(i=0;i<legs.length;i++){
							    pos.push(-1);
							    for(j=evt.length - 1; j >= 0; j--){
							        if(evt[j].TransitLeg===legs[i]){
							            if(pos[i]===-1){
							                pos[i]=j;
							                evt[pos[i]].isValid=true;
							            }
							            else{
							                evt[pos[i]].subEvents.push(evt[j]);
							            }
							        }
							    }
							    
							}
							var events = [];
							var flag=0;
							for (j = 0; j < evt.length; j++) {
								if (evt[j].isValid) {
								    flag+=1;
									events.push(evt[j]);
								}
								else if((evt[j].TransitLeg==="" && flag===0)||(evt[j].TransitLeg==="" && flag===legs.length)){
								    events.push(evt[j]);
								    // if(events.length>0){
								    //     events[events.length-1].subEvents.push(evt[j]);
								    // }
								    // else{
								    //     events.push(evt[j]);
								    // }
								}
								// else if(evt[j].TransitLeg==="" && flag===legs.length){
								//     events.push(evt[j]);
								// }
							}
							oData.results[0].EventSet.results = events;
							events.forEach(function(evt, i) {
								if (evt.subEvents.length > 0 && i > 0) {
									events[i - 1].subEvents = events[i].subEvents.splice(0, evt.subEvents.length);
									events[i - 1].subEvents.reverse();
								}
							});*/

						}
					}
					self.BUSY_DIALOG.setText("");
					self.busyIndicatorHide();
					containerModel.setData(oData.results[0]);
					oComp.setModel(containerModel, "currContainerModel");
					self.oDetailLoadFinishedDef.resolve();
				},
				function(oData, oResponse) {
					self.BUSY_DIALOG.setText("");
					self.busyIndicatorHide();
					var error = JSON.parse(oData.response.body).error.message.value;
					sap.m.MessageBox.alert(error, {
						styleClass: "sapUiSizeCompact",
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Error"
					});
					containerModel.setData({});
					oComp.setModel(containerModel, "currContainerModel");
					self.oDetailLoadFinishedDef.resolve();
					//$.sap.log.error(oResponse.statusText);
				}
			);
		},
		onMetadataRequestFailed: function(oResponse) {
			this.oBatchMetadataLoadFinishedDef.reject();
			this.displayErrorMsg(oResponse.getParameter("response").body, this.getResourceBundle().getText("batchDetailErr"));
		},
		onMetadataLoaded: function(oResponse) {
			this.oBatchMetadataLoadFinishedDef.resolve();
		},
		displayErrorMsg: function(body, title) {
			$.sap.require("sap.m.MessageBox");
			var error = "";
			try {
				var xmlDoc = $.parseXML(body);
				$xml = $(xmlDoc);
				$errMsg = $xml.find("message");
				error = $errMsg.text();
			} catch (err) {
				error = JSON.parse(body).error.message.value;
			}
			this.batchModel.detachMetadataFailed(this.onMetadataRequestFailed, this);
			sap.m.MessageBox.alert(error, {
				styleClass: "sapUiSizeCompact",
				icon: sap.m.MessageBox.Icon.ERROR,
				title: title
			});
		},
		getBatchDetails: function(asn, sysAlias) {
			this.oBatchLoadFinishedDef = $.Deferred();
			this.oBatchMetadataLoadFinishedDef = $.Deferred();
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octBatchModelUrl = mConfig.batchModel.serviceUrl;
			var batchDtl = new sap.ui.model.json.JSONModel();
			batchDtl.setSizeLimit(99999);
			batchDtl.setData([]);
			this.getOwnerComponent().setModel(batchDtl, "batchModel");
			this.batchModel = new sap.ui.model.odata.ODataModel(octBatchModelUrl, {
				json: true,
				headers: {
					"system_alias": sysAlias,
					"DataServiceVersion": "2.0",
					"MaxDataServiceVersion": "2.0"
				}
			});
			this.batchModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0",
				"system_alias": sysAlias
			};
			var self = this;
			this.batchModel.attachMetadataFailed(this.onMetadataRequestFailed, this);
			this.batchModel.attachMetadataLoaded($.proxy(function() {
				this.oBatchMetadataLoadFinishedDef.resolve();
				this.batchModel.read("/DeliveryBatchSet?$filter=" + "ASN eq '" + asn + "'", null, [], null,
					function(oData, oResponse) {
						batchDtl.setData(oData.results);
						self.getOwnerComponent().setModel(batchDtl, "batchModel");
						self.oBatchLoadFinishedDef.resolve();
					},
					function(oData, oResponse) {
						batchDtl.setData([]);
						self.getOwnerComponent().setModel(batchDtl, "batchModel");
						self.oBatchLoadFinishedDef.resolve();
					});
			}, this), this);
		},
		calculateAlignStatus: function(localModel) {

			for (var i = 0; i < localModel.oData.ProductCollection.length; i++) {
				var actual = localModel.oData.ProductCollection[i].UDelDate;
				var planned = localModel.oData.ProductCollection[i].InitDelDate;
				if (actual === null || typeof actual === "undefined" || actual === "") {
					localModel.oData.ProductCollection[i].AlignStatus = "3";
				}
				try {
					var dateDiff = Utility.getDateDiff(planned, actual, "yyyyMMdd");
					if (Utility.getToday("yyyyMMdd") > actual) {
						localModel.oData.ProductCollection[i].AlignStatus = "2";
					} else {
						if (dateDiff === 0) {
							localModel.oData.ProductCollection[i].AlignStatus = "0";
						} else if (dateDiff > 0) {
							localModel.oData.ProductCollection[i].AlignStatus = "1";
						} else if (dateDiff < 0) {
							localModel.oData.ProductCollection[i].AlignStatus = "-1";
						}
					}
				} catch (err) {
					return '';
				}
			}
		},
		adjustForNestedFilters: function(localModel) {
		    var d=new Date();
		    console.log(d);
			var data = localModel.getProperty("/ProductCollection"),
				items = null,
				pList = null,
				cList = null;
			for (var i = 0; i < data.length; i++) {
				pList = [];
				cList = [];
				items = data[i].ItemSet.results;
				for (var j = 0; j < items.length; j++) {
					pList.push(items[j].SKU);
					cList.push(items[j].CategoryDesc);
				}
				cList = Utility.getUniqueElements(cList);
				localModel.setProperty("/ProductCollection/" + i + "/SKU", pList.join(","));
				localModel.setProperty("/ProductCollection/" + i + "/CategoryDesc", cList.join(","));
			}
			d=new Date();
			console.log(d);
		},
		appendRatingModel: function(localModel) {
			localModel.oData.RatingAppLabel = [{

				"Rating": "0",
				"Desc": "",
				"Stars": "",
				"RatingText": ""
			}, {

				"Rating": "1",
				"Desc": "Hated it",
				"Stars": "One Star",
				"RatingText": "X"
			}, {
				"Rating": "2",
				"Desc": "Disliked it",
				"Stars": "Two Stars",
				"RatingText": "XX"
			}, {
				"Rating": "3",
				"Desc": "Its OK",
				"Stars": "Three Stars",
				"RatingText": "XXX"
			}, {
				"Rating": "4",
				"Desc": "Liked it",
				"Stars": "Four Stars",
				"RatingText": "XXXX"
			}, {
				"Rating": "5",
				"Desc": "Loved it",
				"Stars": "Five Stars",
				"RatingText": "XXXXX"
			}];

		},
		waitForLoad: function(fnToExecute) {
			$.when(this.oLoadFinishedDef).then(
				$.proxy(fnToExecute, this));

		},
		waitForExcelLoad: function(fnToExecute) {
			$.when(this.oExcelLoadFinishedDef).then(
				$.proxy(fnToExecute, this));

		},
		waitForDefaultLoad: function(fnToExecute) {
			$.when(this.getView().getController().oDefaultLoadFinishedDef).then(
				$.proxy(fnToExecute, this));

		},
		waitForBatchLoad: function(fnToExecute) {
			$.when(this.oBatchMetadataLoadFinishedDef, this.oBatchLoadFinishedDef).then(
				$.proxy(fnToExecute, this));

		},
		waitForDetailLoad: function(fnToExecute) {
			$.when(this.oDetailLoadFinishedDef).then(
				$.proxy(fnToExecute, this));

		},
		getChatData: function(guid) {
			var view = this.getView();
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerChatModelUrl = mConfig.GTPT_CHAT.serviceUrl;
			var chatModel = new sap.ui.model.json.JSONModel();
			chatModel.setSizeLimit(99999);
			if (view.byId("feedLst")) {
				view.byId("feedLst").setBusy(true);
			}
			var serverChatModel = new sap.ui.model.odata.ODataModel(octServerChatModelUrl, true);
			serverChatModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			serverChatModel.read("ChatHeaderSet('" + guid + "')/ChatItemSet", null, [], null,
				function(oData, oResponse) {

					if (view.byId("feedLst")) {
						view.byId("feedLst").setBusy(false);
					}
					chatModel.setData({
						EntryCollection: oData.results
					});
					oComp.setModel(chatModel, "chatModel");
				},
				function(oData) {
					if (view.byId("feedLst")) {
						view.byId("feedLst").setBusy(false);
					}
					chatModel.setData({
						EntryCollection: []
					});
					oComp.setModel(chatModel, "chatModel");
				}
			);
			view.byId("feedLst").setModel(chatModel);
		},

		sendMail: function(recipients, subject, body, fnSuccess) {
			var view = this.getView();
			var self = this;
			var oEntry = {};
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerMailModelUrl = mConfig.mailModel.serviceUrl;
			this.BUSY_DIALOG.setText(this.getResourceBundle().getText("sendingMail"));
			this.busyIndicatorShow();
			var serverMailModel = new sap.ui.model.odata.ODataModel(octServerMailModelUrl, false);
			serverMailModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			var uid = this.getOwnerComponent().getModel("usrModel").getProperty("/UserId");
			oEntry.AppName = 'OCT_EMAIL';
			oEntry.Recipient = recipients;
			oEntry.Sender = uid;
			oEntry.Subject = subject;
			oEntry.Body = body;

			serverMailModel.create("/EmailSet", oEntry, null, fnSuccess, function(oData) {
				self.BUSY_DIALOG.setText("");
				self.busyIndicatorHide();
				var xmlDoc = $.parseXML(oData.response.body);
				$xml = $(xmlDoc);
				$errMsg = $xml.find("message");
				var error = $errMsg.text();
				sap.m.MessageBox.alert(error, {
					styleClass: "sapUiSizeCompact",
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error"
				});
			});

		},

		postChatComment: function(oEntry) {
			var view = this.getView();
			var self = this;
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerChatModelUrl = mConfig.GTPT_CHAT.serviceUrl;
			if (view.byId("feedLst")) {
				view.byId("commentBtn").setEnabled(false);
			}
			var serverChatModel = new sap.ui.model.odata.ODataModel(octServerChatModelUrl, false);
			serverChatModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			serverChatModel.create("/ChatHeaderSet", oEntry, null, function() {
				view.byId("feedInput").setValue("");
				self.getChatData(oEntry.ObjectKey);
				view.byId("commentBtn").setEnabled(true);
			}, function(oData) {
				var xmlDoc = $.parseXML(oData.response.body);
				var $xml = $(xmlDoc);
				var $errMsg = $xml.find("message");
				var error = $errMsg.text();
				sap.m.MessageBox.alert(error, {
					styleClass: "sapUiSizeCompact",
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Error"
				});
				view.byId("feedInput").setValue("");
				view.byId("commentBtn").setEnabled(true);
			});
		},
		postFeedback: function(feedback) {
			var usrModel = this.getOwnerComponent().getModel("usrModel");
			var uid = usrModel.getProperty("/UserId");
			var fN = usrModel.getProperty("/FirstName");
			var lN = usrModel.getProperty("/LastName");
			if (typeof feedback === 'undefined') {
				return;
			} else if (feedback === '') {
				return;
			}
			var oEntry = {
				__metadata: {
					type: "ns.type",
					properties: {
						UDate: {
							type: "Edm.DateTime"
						}
					}
				}
			};
			oEntry.ObjectKey = this.APPID;
			var chatItem = [];
			chatItem.push({
				ObjectKey: oEntry.ObjectKey,
				UDate: Utility.dateToTimestamp(),
				UserId: uid,
				FirstName: fN,
				LastName: lN,
				Type: 'Feedback',
				ChatText: feedback
			});
			oEntry.ChatItemSet = chatItem;
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerChatModelUrl = mConfig.GTPT_CHAT.serviceUrl;
			var serverChatModel = new sap.ui.model.odata.ODataModel(octServerChatModelUrl, false);
			serverChatModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			serverChatModel.create("/ChatHeaderSet", oEntry, null, function() {}, function(oData) {});
		},

		//end of oData Integration
		updateMktModel: function(direction, companyCode) {
			var oComp = this.getOwnerComponent();
			oComp.getModel("oMktModel").setProperty("/direction", direction);
			oComp.getModel("oMktModel").setProperty("/mkt", companyCode);
			oComp.getModel("oMktModel").setProperty("/key", direction + "-" + companyCode);
			this.updateDirectionCookie(direction);
			if (Utility.hasValue(companyCode) && oComp.getModel("usrMktModel").getProperty("/showCompCodes") === true) {
				this.updateCompanyCodeCookie(companyCode);
				// ga('set', 'dimension3', companyCode);
			}

			// ga('set', 'dimension4', direction);

			this.getView().byId("marketList").setSelectedKey(direction + "-" + companyCode);
			//this.getView().byId("marketList").getSelectedItem().getText();
		},
		getGraphDates: function(cData) {

			var planned = null;
			var actual = null;
			var min = 99999999;
			var max = 0;
			if (cData.length === 0) {
				var oDateModel = this.getModel("appProperties");
				min = oDateModel.getProperty("/fD");
				max = oDateModel.getProperty("/tD");
				return {
					min: min.toString(),
					max: max.toString()
				};
			}
			for (var i = 0; i < cData.length; i++) {
				if (cData[i].InitDelDate !== "") {
					planned = Number(Utility.getDateString(cData[i].InitDelDate,"yyyyMMdd",true));
					if (planned !== 0) {
						min = min < planned ? min : planned;
						max = max > planned ? max : planned;

					}
				}
				if (cData[i].UDelDate !== "") {
					actual = Number(Utility.getDateString(cData[i].UDelDate,"yyyyMMdd",true));
					if (actual !== 0) {
						min = min < actual ? min : actual;
						max = max > actual ? max : actual;

					}
				}
			}
			var dates = {
				min: min.toString(),
				max: max.toString()
			};
			return dates;

		},
		ddateProcess: function() {
			var falseElemsUpdate = ["#fbuDdateBefore", "#btnCanceluDate", "#btnAsnuDdate", "#fbafterProcessDdateSuccess", "#fbuDdateafter",
				"#thankyoudate"
			];
			for (var i = 0; i < falseElemsUpdate.length; i++) {
				$(falseElemsUpdate[i]).addClass("invisible");
			}
			$("#fbuDdateProcess").removeClass("invisible");
		},
		ddateSuccess: function() {
			var falseElemsUpdate = ["#fbuDdateProcess", "#fbuDdateBefore", "#btnCanceluDate", "#btnAsnuDdate", "#fbuDdateafter"];

			for (var i = 0; i < falseElemsUpdate.length; i++) {
				$(falseElemsUpdate[i]).addClass("invisible");
			}
			$("#fbafterProcessDdateSuccess").removeClass("invisible");
			$("#thankyoudate").removeClass("invisible");
		},

		ddateFailure: function() {

			var falseElemsUpdate = ["#fbuDdateProcess", "#fbuDdateBefore", "#btnAsnuDdate", "#fbafterProcessDdateSuccess", "#thankyoudate"];
			for (var i = 0; i < falseElemsUpdate.length; i++) {
				$(falseElemsUpdate[i]).addClass("invisible");
			}
			$("#fbuDdateafter").removeClass("invisible");
			$("#btnCanceluDdate").removeClass("invisible");
			$("#tryAgainuDdate").removeClass("invisible");

		},

		updateProcess: function() {
			var falseElems = ["#fbbefore", "#btnCancel12", "#btnAsn12", "#fbafterProcessSuccess", "#fbafter", "#thankyou"];

			for (var i = 0; i < falseElems.length; i++) {
				$(falseElems[i]).addClass("invisible");
			}
			$("#fbafterProcess").removeClass("invisible");
		},

		updateSuccess: function() {
			var falseElems = ["#fbafterProcess", "#fbbefore", "#btnCancel12", "#btnAsn12", "#fbafter"];

			for (var i = 0; i < falseElems.length; i++) {
				$(falseElems[i]).addClass("invisible");
			}
			$("#fbafterProcessSuccess").removeClass("invisible");
			$("#thankyou").removeClass("invisible");
		},

		updateFailure: function() {
			var falseElems = ["#fbafterProcess", "#fbbefore", "#btnAsn12", "#fbafterProcessSuccess", "#thankyou"];
			for (var i = 0; i < falseElems.length; i++) {
				$(falseElems[i]).addClass("invisible");
			}
			$("#fbafter").removeClass("invisible");
			$("#btnCancel12").removeClass("invisible");
			$("#tryAgain").removeClass("invisible");

		},
		containerUpdate: function() {
			var core = sap.ui.getCore();
			//var self=this;
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerContainerUpdateModelUrl = mConfig.updateContainerModel.serviceUrl;

			var serverContainerUpdateModel = new sap.ui.model.odata.ODataModel(octServerContainerUpdateModelUrl, true);
			serverContainerUpdateModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			var oEntry = {};

			oEntry.GUID = this.getView().getModel().getProperty("/GUID");
			oEntry.ParamValue = core.byId("containerinputId").getValue();
			oEntry.ParamType = 'C';
			oEntry.ParamName = 'ZZ_CONTAINER_NO';
			var self = this;

			serverContainerUpdateModel.attachRequestFailed(function() {
				self.updateFailure();
			});
			var params = "(GUID='" + oEntry.GUID + "',ParamType='" + oEntry.ParamType + "',ParamName='" + oEntry.ParamName + "')";
			//setTimeout(function(){
			serverContainerUpdateModel.update("/EHParameterSet" + params, oEntry, null,
				function(oData, oResponse) {
					var cnum = glb.gtmh.oct.util.Formatter.setContainer(self.getView().getModel().getProperty("/Container"));
					self.postLogInChat('CU', cnum, oEntry.ParamValue);
					self.updateModel("Container", oEntry.ParamValue);
					self.getView().getModel("cUpdError").setProperty("/error", self.getResourceBundle().getText("ErrorDesc"));
					self.updateSuccess();
					self.getView().byId("sel_priority").removeStyleClass("visHidden");
					self.getEventBus().publish("root", "localRefresh", {
						guid: oEntry.GUID,
						field: "Container",
						value: oEntry.ParamValue
					});
				},
				function(oData, oResponse) {
					var body = oData.response.body;
					if (body === null || typeof body === 'undefined') {
						body = oResponse.getParameter("response").body;
					}
					var error = Utility.getError(body);
					self.getView().getModel("cUpdError").setProperty("/error", (self.getResourceBundle().getText("ErrorDesc") + error));
					self.updateFailure();
					Utility.displayError(error, self.getResourceBundle().getText("err"));
				}
			);

		},
		updateDeliveryDateTM: function(guid, date) {
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerDeliveryDateTMUrl = mConfig.updateDeliveryDateTMModel.serviceUrl;

			var serverContainerDeliveryDateTM = new sap.ui.model.odata.ODataModel(octServerDeliveryDateTMUrl, true);
			serverContainerDeliveryDateTM.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			var oEntry = {};

			oEntry.GUID = guid;
			oEntry.ParamValue = date;
			oEntry.ParamType = 'C';
			oEntry.ParamName = 'ODT20_REQ_DELIV_DATE';
			var self = this;

			var params = "(GUID='" + oEntry.GUID + "',ParamType='" + oEntry.ParamType + "',ParamName='" + oEntry.ParamName + "')";

			serverContainerDeliveryDateTM.update("/EHParameterSet" + params, oEntry, null,
				function(oData, oResponse) {
					var uDelDate = Utility.convertToDate(oEntry.ParamValue, 'yyyyMMdd');
					self.updateModel("UDelDate", uDelDate);
					self.ddateSuccess();

					self.getEventBus().publish("root", "localRefresh", {
						guid: oEntry.GUID,
						field: "UDelDate",
						value: uDelDate
					});

				},
				function(oData, oResponse) {
					var body = oData.response.body;
					if (body === null || typeof body === 'undefined') {
						body = oResponse.getParameter("response").body;
					}
					var error = Utility.getError(body);
					self.updateFailure();
					Utility.displayError(error, self.getResourceBundle().getText("err"));

				}
			);

		},

		UpdatePODate: function(ponumber, udate) {
			var view = this.getView();
			var oUpdDateModel = view.getModel("updDateModel");
			var core = sap.ui.getCore();
			var self = this;
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerUpdateModelUrl = mConfig.updateModel.serviceUrl;
			var sysAliasPO = view.getModel("containerDetail").getProperty("/SysAliasSTO");
			var serverUpdateModel = new sap.ui.model.odata.ODataModel(octServerUpdateModelUrl, {
				json: true,
				headers: {
					"system_alias": sysAliasPO,
					"DataServiceVersion": "2.0",
					"MaxDataServiceVersion": "2.0"
				}
			});
			serverUpdateModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0",
				"system_alias": sysAliasPO
			};
			var oEntry = {};
			oEntry.PONumber = ponumber;
			oEntry.DeliveryDate = oUpdDateModel.getProperty("/dpValue");

			serverUpdateModel.update("/PODeliveryDateSet('" + oEntry.PONumber + "')", oEntry, null,
				function(oData, oResponse) {
					self.updateDeliveryDateTM(view.getModel().getProperty("/GUID"), oEntry.DeliveryDate);

				},
				function(oData, oResponse) {
					var body = oData.response.body;
					if (body === null || typeof body === 'undefined') {
						body = oResponse.getParameter("response").body;
					}
					var error = Utility.getError(body);

					self.ddateFailure();
					Utility.displayError(error, self.getResourceBundle().getText("err"));
				}
			);

		},
		getWeekModel: function(fromDate, toDate) {
			if (fromDate === "99999999" || toDate === "0") {
				fromDate = this.getOwnerComponent().getModel(
					"dateRangeModel").getProperty("/min");
				toDate = (Number(fromDate) + 21).toString();
			}
			fromDate = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern: 'yyyyMMdd',
					UTC: false
				}).parse(fromDate);
			toDate = sap.ui.core.format.DateFormat
				.getDateInstance({
					pattern: 'yyyyMMdd',
					UTC: false
				}).parse(toDate);
			//New logic
			var dayNumFD = fromDate.getDay();
			var dayNumTD = toDate.getDay();
			if (dayNumFD === 0) {
				dayNumFD = 7;
			}
			if (dayNumTD === 0) {
				dayNumTD = 7;
			}
			if (dayNumFD !== 1) {
				fromDate.setDate(fromDate.getDate() - (dayNumFD));
			}
			if (dayNumTD !== 7) {
				toDate.setDate(toDate.getDate() + (7 - dayNumTD));
			}
			//End of new logic
			/*if (fromDate.getDay() !== 1) {
				fromDate.setDate(fromDate.getDate() - 7);
			}
			toDate.setDate(toDate.getDate() + 1);*/
			var mondays = d3.time.mondays(fromDate, toDate);
			/*	if (toDate.getDay() !== 1) {
					toDate.setDate(toDate.getDate() + 7);
				}*/
			var mL = mondays.length;
			fromDate.setDate(fromDate.getDate()+1);
			toDate.setDate(toDate.getDate()+7);
			var sundays = d3.time.weeks(fromDate, toDate);
			/*	if (mL !== sundays.length) {
					sundays.splice(0, 1);
				}*/
			/*if (sundays.length !== 0) {
				toDate = sundays[sundays.length - 1];
			}*/

			if (mL < 3) {
			    fromDate.setDate(fromDate.getDate()-1);
			    toDate.setDate(toDate.getDate()-7);
				if (mL === 0) {
					if (toDate.getDay() !== 0) {
						toDate.setDate(toDate.getDate() + 21);
					} else {
						toDate.setDate(toDate.getDate() + 22);
					}
				} else {
					toDate.setDate(toDate.getDate() + (7 * (3 - mL)));
				}
				mondays = d3.time.mondays(fromDate, toDate);
				fromDate.setDate(fromDate.getDate()+1);
			    toDate.setDate(toDate.getDate()+7);
				sundays = d3.time.weeks(fromDate, toDate);
			}
			if (mondays[0] > sundays[0] && mondays.length < sundays.length) {
				sundays.splice(0, 1);
			}
			var weeks = [];
			var weekTxt = null;
			var weekNum = null;
			var weekDtRangeTxt = null;
			var weekStartDate = null;
			var weekEndDate = null;
			var mFormat = d3.time.format("%b");
			var dFormat = d3.time.format("%e");
			var yFormat = d3.time.format("%Y");
			var monthS = "";
			var monthE = "";
			for (var i = 0; i < mondays.length; i++) {
				weekStartDate = mondays[i];
				weekEndDate = sundays[i];
				// weekNum = d3.time.weekOfYear(weekStartDate) + 1;
				weekNum = d3.time.weekOfYear(weekStartDate) + 1;
				weekTxt = "Wk. " + weekNum;
				monthS = mFormat(weekStartDate);
				monthE = mFormat(weekEndDate);
				if (monthS !== 'May') {
					monthS += '. ';
				}
				if (monthE !== 'May') {
					monthE += '.';
				}
				weekDtRangeTxt = dFormat(weekStartDate) + " " + monthS + " - " + dFormat(weekEndDate) + " " + monthE + " " + yFormat(weekStartDate);
				weeks.push({
					weekStartDate: weekStartDate,
					weekEndDate: weekEndDate,
					weekNum: weekNum,
					weekTxt: weekTxt,
					weekDtRangeTxt: weekDtRangeTxt
				});

			}
			var weekModel = {
				minDate: Utility.formatDate(mondays[0], null, "yyyyMMdd"),
				maxDate: Utility.formatDate(sundays[sundays.length - 1], null, "yyyyMMdd"),
				weeks: weeks
			};
			return weekModel;
		},

		updatePriority: function(oldP, newP, guid) {
			var oComp = this.getOwnerComponent();
			var mConfig = oComp.getMetadata().getConfig();
			var octServerupdatePriorityModel = mConfig.updatePriorityModel.serviceUrl;

			var priorityUpdateModel = new sap.ui.model.odata.ODataModel(octServerupdatePriorityModel, true);
			priorityUpdateModel.oHeaders = {
				"DataServiceVersion": "2.0",
				"MaxDataServiceVersion": "2.0"
			};
			var self = this;
			var oEntry = {};
			oEntry.GUID = guid;

			oEntry.ParamValue = newP;
			oEntry.ParamType = 'C';
			oEntry.ParamName = 'ZZ_TRACK_PRIO';
			var paramPriority = "(GUID='" + oEntry.GUID + "',ParamType='" + oEntry.ParamType + "',ParamName='" + oEntry.ParamName + "')";

			priorityUpdateModel.update("/EHParameterSet" + paramPriority, oEntry, null,
				function(oData, oResponse) {

					self.BUSY_DIALOG.setText('');
					self.busyIndicatorHide();
					self.updateModel("Priority", newP);
					self.postLogInChat('PU', oldP, newP);
					sap.m.MessageBox.show(self.getView().getController().getResourceBundle().getText("priorityUpdated"), sap.m.MessageBox.Icon.SUCCESS);

					self.getEventBus().publish("root", "localRefresh", {
						guid: oEntry.GUID,
						field: "Priority",
						value: oEntry.ParamValue
					});
					self.getEventBus().publish("dtl", "localRefresh", {
						guid: oEntry.GUID,
						field: "Priority",
						value: oEntry.ParamValue
					});

				},
				function(oData, oResponse) {
					self.BUSY_DIALOG.setText('');
					self.busyIndicatorHide();
					var body = oData.response.body;
					if (body === null || typeof body === 'undefined') {
						body = oResponse.getParameter("response").body;
					}
					var error = Utility.getError(body);
					Utility.displayError(error, self.getResourceBundle().getText("err"));
					self.updateModel("Priority", oldP);
					self.getEventBus().publish("root", "localRefresh", {
						guid: oEntry.GUID,
						field: "Priority",
						value: oldP
					});
					self.getEventBus().publish("dtl", "localRefresh", {
						guid: oEntry.GUID,
						field: "Priority",
						value: oldP
					});
				}, true
			);

		},

		updateModel: function(field, value) {
			var oComp = this.getOwnerComponent();
			var oModel = this.getView().getModel();
			var guid = oModel.getProperty("/GUID");
			var sPath = "";
			oModel.setProperty("/" + field, value);
			var oFilter = new sap.ui.model.Filter("GUID", "EQ", guid);
			if (oComp.getModel("filterPC")) {
				var filterPC = oComp.getModel("filterPC");
				var oBinding = filterPC.bindList("/ProductCollection");
				oBinding.filter(oFilter);
				if (oBinding.getLength() > 0) {
					sPath = oBinding.getContexts()[0].sPath;
					filterPC.setProperty(sPath + "/" + field, value);
				}
			}
			var localModel = oComp.getModel("LocalModel");
			oBinding = localModel.bindList("/ProductCollection");
			oBinding.filter(oFilter);
			if (oBinding.getLength() > 0) {
				sPath = oBinding.getContexts()[0].sPath;
				localModel.setProperty(sPath + "/" + field, value);
			}
			if (oComp.getModel("filterSubPC")) {
				var filterSubPC = oComp.getModel("filterSubPC");
				oBinding = filterSubPC.bindList("/ProductCollection");
				oBinding.filter(oFilter);
				if (oBinding.getLength() > 0) {
					sPath = oBinding.getContexts()[0].sPath;
					filterSubPC.setProperty(sPath + "/" + field, value);
				}
			}
		},
		postLogInChat: function(logFor, oldV, newV) {
			var usrModel = this.getOwnerComponent().getModel("usrModel");
			var uid = usrModel.getProperty("/UserId");
			var fN = usrModel.getProperty("/FirstName");
			var lN = usrModel.getProperty("/LastName");
			var comment = '';
			var priorityText = '';
			var priorityColor = '';
			var priorityIcon = 'flag';
			if (logFor === 'PU') {
				if (newV === '1') {
					priorityText = 'Priority 1|' + this.getResourceBundle().getText("outOfStock");
					priorityColor = 'red';
				} else if (newV === '2') {
					priorityText = 'Priority 2|' + this.getResourceBundle().getText("lowStock");
					priorityColor = '#ffc200';
				} else if (newV === '3') {
					priorityText = 'Priority 3|' + this.getResourceBundle().getText("noFlag");
					priorityColor = 'green';
				}
				comment = this.getResourceBundle().getText("chatUpdFlag") + '<octicon>name=' + priorityIcon + '|color=' + priorityColor +
					'</octicon><octtext>' +
					priorityText + '</octtext>';
			} else if (logFor === 'CU') {
				comment = this.getResourceBundle().getText("logForContainerUpdate", [fN, lN, oldV, newV]);
			} else if (logFor === 'MS') {
				comment = this.getResourceBundle().getText("chatEmailSent", [oldV]) + '<octicon>name=email|color=#666666</octicon><octtext>' +
					newV +
					'</octtext>';
			} else {
				return;
			}
			var oEntry = {
				__metadata: {
					type: "ns.type",
					properties: {
						UDate: {
							type: "Edm.DateTime"
						}
					}
				}
			};
			oEntry.ObjectKey = this.getView().getModel().getProperty("/GUID");
			var chatItem = [];
			chatItem.push({
				ObjectKey: oEntry.ObjectKey,
				UDate: Utility.dateToTimestamp(),
				UserId: uid,
				FirstName: fN,
				LastName: lN,
				Type: 'Log',
				ChatText: comment
			});
			oEntry.ChatItemSet = chatItem;
			this.postChatComment(oEntry);
		},

		setUserModels: function() {
			var view = this.getView();
			var oModelUsr = new sap.ui.model.json.JSONModel();
			var oModelUsrMkt = new sap.ui.model.json.JSONModel();
			if (this.getOwnerComponent().getModel("usrMktModel")) {
				oModelUsrMkt.setData(this.getOwnerComponent().getModel("usrMktModel").getProperty("/"));
				this.getView().setModel(oModelUsrMkt, "userMarketModel");
			}
			if (this.getOwnerComponent().getModel("usrModel")) {
				oModelUsr.setData(this.getOwnerComponent().getModel("usrModel").getProperty("/"));
				view.setModel(oModelUsr, "userModel");
			}
		},
		confirmLogout: function(oEvent) {
			sap.m.MessageBox.show("Do you want to log off?", {
				icon: sap.m.MessageBox.Icon.QUESTION,
				title: "Logout Confirmation", // default
				onClose: $.proxy(function(oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						// this.logOff();
					}
				}, this), // default
				initialFocus: sap.m.MessageBox.Action.NO, // default
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO] // default
			});
		},
		logOut: function() {
			var url = location.protocol + '//' + location.host + '/sap/public/bc/icf/logoff';
			$.ajax({
				url: '/sap/public/bc/icf/logoff',
				async: false
			}).success(
				function(oResp) {
					try {
						$.removeData();
					} catch (e) {}
				}).error(
				function(oResp) {
					try {
						$.removeData();
					} catch (e) {}
				}).complete(
				function(oResp) {
					var out = window.location.href.replace(/:\/\//, '://log:out@');

					$.get(out).error(function() {
						window.location.href = url;
					});
				});
		},

		logOff: function(oAction) {
			var self = this;
			var url = location.protocol + '//' + location.host + '/sap/public/bc/icf/logoff';
			$.ajax({
				type: "POST",
				url: "/sap/public/bc/icf/logoff"
			}).success(
				function(resp) {
					try {
						$.removeData();
					} catch (e) {}
				}).error(
				function(err) {
					try {
						$.removeData();
					} catch (e) {}
				}).complete(function(data) {
				var sUrl = self.getOwnerComponent().getModel("usrMktModel").getProperty("/PortalURL");
				var urlParts = sUrl.match(/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i);
				var portalHome = "#";
				if (urlParts.length > 1) {
					portalHome = urlParts[1] + urlParts[2] + '/irj/portal';
				}
				sUrl += self.getOwnerComponent().getMetadata().getConfig().GTPT_SRV.serviceUrl;

				//Now clear the authentication header stored in the browser
				if (!document.execCommand("ClearAuthenticationCache")) {
					//"ClearAuthenticationCache" will work only for IE. Below code for other browsers
					$.ajax({
						type: "GET",
						url: sUrl, //any URL to a Gateway service
						username: 'dummy', //dummy credentials: when request fails, will clear the authentication header
						password: 'dummy',
						statusCode: {
							401: function() {
								//This empty handler function will prevent authentication pop-up in chrome/firefox
							}
						},
						error: function(err) {
							if (portalHome !== "#") {
								window.location.href = portalHome;
							} else {
								window.location.href = location.protocol + '//' + location.host + '/sap/public/bc/icf/logoff';
							}
						}
					});
				} else {
					if (portalHome !== "#") {
						window.location.href = portalHome;
					} else {
						window.location.href = location.protocol + '//' + location.host + '/sap/public/bc/icf/logoff';
					}
				}
			});
		},

		updateDirectionCookie: function(direction) {
			var userId = this.getOwnerComponent().getModel("usrMktModel").getProperty("/UserId");
			var directionCookie = userId + '-direction';
			$.cookie(directionCookie, direction, {
				expires: 3650
			});

		},
		updateTypeCookie: function(type) {
			var userId = this.getOwnerComponent().getModel("usrMktModel").getProperty("/UserId");
			var typeCookie = userId + '-type';
			$.cookie(typeCookie, type, {
				expires: 3650
			});

		},
		updateCompanyCodeCookie: function(companyCode) {
			var userId = this.getOwnerComponent().getModel("usrMktModel").getProperty("/UserId");
			var companyCodeCookie = userId + '-companyCode';
			$.cookie(companyCodeCookie, companyCode, {
				expires: 3650
			});

		},
		updateDateCookie: function(fromDate, toDate) {
			var userId = this.getOwnerComponent().getModel("usrMktModel").getProperty("/UserId");
			var fromDateCookie = userId + '-fromDate';
			var toDateCookie = userId + '-toDate';
			$.cookie(fromDateCookie, fromDate, {
				expires: 3650
			});
			$.cookie(toDateCookie, toDate, {
				expires: 3650
			});

		},
		onExcelDownload: function(oEvent) {
			sap.m.MessageBox.show(this.getResourceBundle().getText("confirmExcelDownload"), {
				icon: sap.m.MessageBox.Icon.QUESTION,
				title: this.getResourceBundle().getText("excelExportConfirm"), // default
				onClose: $.proxy(function(oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						var fD = this.getOwnerComponent().getModel("dateRangeModel").getProperty("/min");
						var tD = this.getOwnerComponent().getModel("dateRangeModel").getProperty("/max");
						this.oExcelLoadFinishedDef = $.Deferred();
						this.getODataModelForExcel(fD, tD);
						this.waitForExcelLoad($.proxy(function() {
							var data = this.getOwnerComponent().getModel("ExcelDownloadModel").getProperty("/ProductCollection");
							if (data.length === 0) {
								return;
							}
							var finalJSON = this.getJSONForExcel(data);
							this.exportToCSV(finalJSON, "OCT_Report", true);
						}, this));
					}
				}, this), // default
				initialFocus: sap.m.MessageBox.Action.NO, // default
				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO], // default
			});
		},
		exportToCSV: function(JSONData, ReportTitle, ShowLabel) {
			//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
			var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

			var CSV = '';
			//Set Report title in first row or line

			//CSV += ReportTitle + '\r\n\n';

			//This condition will generate the Label/Header
			if (ShowLabel) {
				var row = "";

				//This loop will extract the label from 1st index of on array
				for (var index in arrData[0]) {

					//Now convert each value to string and comma-seprated

					row += index + ',';

				}

				row = row.slice(0, -1);

				//append Label row with line break
				CSV += row + '\r\n';
			}

			//1st loop is to extract each row
			for (var i = 0; i < arrData.length; i++) {
				var row = "";

				//2nd loop will extract each column and convert it in string comma-seprated
				for (var index in arrData[i]) {

					row += '"' + arrData[i][index] + '",';
				}

				row.slice(0, row.length - 1);

				//add a line break after each row
				CSV += row + '\r\n';
			}

			if (CSV === '') {
				sap.m.MessageBox.alert(this.getResourceBundle().getText("excelErrText"), {
					styleClass: "sapUiSizeCompact",
					icon: sap.m.MessageBox.Icon.ERROR,
					title: this.getResourceBundle().getText("excelErrTitle")
				});
				return;
			}

			//Generate a file name
			var fileName = "";
			//this will remove the blank-spaces from the title and replace it with an underscore
			fileName += ReportTitle.replace(/ /g, "_");

			//For all browser compatibility compatibility
			var blob = new Blob([CSV], {
				type: "text/csv;charset=utf-8;"
			});

			if (navigator.msSaveOrOpenBlob) { // IE 10+
				navigator.msSaveOrOpenBlob(blob, fileName + ".csv");
			} else {
				var link = document.createElement("a");
				if (link.download !== undefined) { // feature detection
					// Browsers that support HTML5 download attribute
					var url = URL.createObjectURL(blob);
					link.setAttribute("href", url);
					link.setAttribute("download", fileName + ".csv");
					link.style = "visibility:hidden";
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			}
		},

		getJSONForExcel: function(JSONData) {
			var finalJSON = [];
			var iData = JSONData;
			var maxEvt = 0;
			var l = 0;
			var datePartsP = "";
			var datePartsA = "";
			var dateParts = "";
			var last = 0;
			var d = "";
			var t = "";
			var pTS = "";
			var aTS = "";
			var latestMsgDate = "";
			var msgCreateDate = "";
			for (var x in iData) {
				l = iData[x].EventSet.results.length;
				if (l > maxEvt) {
					maxEvt = l;
				}
			}
			for (var i in iData) {
				var cData = iData[i];
				var itemsData = cData.ItemSet.results
				var eventsData = cData.EventSet.results
				var initDate = Utility.formatDate(Utility.getDateString(cData["InitDelDate"],"yyyyMMdd",true), "yyyyMMdd", "dd-MMM-yyyy");
				var updDate = Utility.formatDate(Utility.getDateString(cData["UDelDate"],"yyyyMMdd",true), "yyyyMMdd", "dd-MMM-yyyy");
				dateParts = Utility.getDateParts(cData["LatestMsgDate"], true,true);
				d = Utility.dateConvert(dateParts.date, "yyyyMMdd",false,true);
				t = Utility.getAMPM(dateParts.time);
				latestMsgDate = d + " " + t;
				dateParts = Utility.getDateParts(cData["MsgCreateDate"], true,true);
				d = Utility.dateConvert(dateParts.date, "yyyyMMdd",false,true);
				t = Utility.getAMPM(dateParts.time);
				msgCreateDate = d + " " + t;
				var sku = [];
				for (var j in itemsData) {
					sku.push(itemsData[j].SKU);
				}
				finalJSON.push({
					"Container": cData.Container,
					"PO": cData.PO,
					"STO": cData.STO,
					"ASN": cData.ASN,
					"LDP": cData.CustPOID,
					"Origin City": cData.ContainerDetailSet.results[0].OriginCity,
					"Origin Country": cData.OriginCountry,
					"Origin Company": cData.OriginCompany,
					"Origin DC": cData.OriginDCDesc,
					"Destination City": cData.ContainerDetailSet.results[0].DestinationCity,
					"Destination Country": cData.DestinationCountry,
					"Destination Company": cData.DestinationCompany,
					"Destination DC": cData.DestinationDCDesc,
					"Sending Plant": cData.SendingPlant,
					"Priority": cData.Priority,
					"Message Create Date": msgCreateDate,
					"Latest Message Date": latestMsgDate,
					"Initial Delv Date": initDate,
					"Updated Delv Date": updDate,
					"Port of Loading": cData.PortOfLoading,
					"POD Desc": cData.PODDesc,
					"Port of Discharge": cData.PortOfDischarge,
					"POL Desc": cData.POLDesc,
					"Container Size": cData.ContainerDetailSet.results[0].ContainerDesc,
					"Carrier": cData.ContainerDetailSet.results[0].CarrierName,
					"Equipment Type": cData.ContainerDetailSet.results[0].EquiType,
					"Pallet": cData.Pallet,
					"Vesssel": cData.ContainerDetailSet.results[0].Vessel,
					"Voyage": cData.ContainerDetailSet.results[0].Voyage,
					"Gross Weight": cData.ContainerDetailSet.results[0].GrossWeight,
					"Gross Weight Unit": cData.ContainerDetailSet.results[0].GrossWeightUnit,
					"Gross Volume": cData.ContainerDetailSet.results[0].GrossVolume,
					"Gross Volume Unit": cData.ContainerDetailSet.results[0].GrossVolumeUnit,
					"Gross Volume %": cData.ContainerDetailSet.results[0].GrossPercVolume,
					"Max Volume": cData.ContainerDetailSet.results[0].MaxVolume,
					"VU Weight": cData.ContainerDetailSet.results[0].VUWeight,
					"VU Weight %": cData.ContainerDetailSet.results[0].VUPercWeight,
					"VU Volume": cData.ContainerDetailSet.results[0].VUVolume,
					"VU Volume %": cData.ContainerDetailSet.results[0].VUPercVolume,
					"System Alias DLV": cData.ContainerDetailSet.results[0].SysAliasDLV,
					"System Alias PO/STO": cData.ContainerDetailSet.results[0].SysAliasSTO,
					"Material": sku.join(";")

				});
				last = finalJSON.length - 1;
				for (var k = 0; k < maxEvt; k++) {
					if (typeof eventsData[k] !== 'undefined') {
						datePartsP = Utility.getDateParts(eventsData[k].EventDate, true);
						datePartsA = Utility.getDateParts(eventsData[k].UTCReceiveDate, true);
						d = Utility.dateConvert(datePartsP.date, "yyyyMMdd",false,true);
						t = Utility.getAMPM(datePartsP.time);
						pTS = d + " " + t;
						d = Utility.dateConvert(datePartsA.date, "yyyyMMdd",false,true);
						t = Utility.getAMPM(datePartsA.time);
						aTS = d + " " + t;
						finalJSON[last]["Event ID " + (k + 1)] = eventsData[k].EventID;
						finalJSON[last]["Location " + (k + 1)] = eventsData[k].Location;
						finalJSON[last]["Location Description " + (k + 1)] = eventsData[k].LocDesc;
						finalJSON[last]["Event Date " + (k + 1)] = pTS;
						finalJSON[last]["Time Zone " + (k + 1)] = eventsData[k].TimeZone;
						finalJSON[last]["UTC Receive Date " + (k + 1)] = aTS;
					} else {
						finalJSON[last]["Event ID " + (k + 1)] = "";
						finalJSON[last]["Location " + (k + 1)] = "";
						finalJSON[last]["Location Description " + (k + 1)] = "";
						finalJSON[last]["Event Date " + (k + 1)] = "";
						finalJSON[last]["Time Zone " + (k + 1)] = "";
						finalJSON[last]["UTC Receive Date " + (k + 1)] = "";
					}
				}

			}
			return finalJSON;
		},

		getLoadFinishedDefObj: function() {
			return this.oLoadFinishedDef;
		},
		isParamModelChanged: function(urlParams) {
			if (!$.isEmptyObject(urlParams)) {
				var oModel = this.getOwnerComponent().getModel("paramModel");
				var fD = oModel.getProperty("/fromDate");
				var tD = oModel.getProperty("/toDate");
				var direction = oModel.getProperty("/direction");
				var type = oModel.getProperty("/type");
				var companyCode = oModel.getProperty("/companyCode");
				var guid = null;
				if (oModel.getProperty("/guid")) {
					guid = oModel.getProperty("/guid");
				}
				if (guid === null || typeof guid === 'undefined') {
					if (fD === urlParams.fromDate && tD === urlParams.toDate && companyCode === urlParams.companyCode && direction === urlParams.direction &&
						type === urlParams.type) {
						return false;
					} else {
						return true;
					}
				} else {
					var oHistory = History.getInstance();
					var sPreviousHash = oHistory.getPreviousHash();
					var noChange = false;
					if (sPreviousHash) {
						if (sPreviousHash.indexOf("Dashboard") !== -1 || sPreviousHash.indexOf("PlanningAdvisor") !== -1 || sPreviousHash.indexOf(
								"DistributionCenterLoad") !== -1) {
							noChange = true;
						}
					}
					if ((guid === urlParams.guid || this.getView().byId("marketList").getEnabled() || noChange) && fD === urlParams.fromDate &&
						companyCode ===
						urlParams.companyCode && tD === urlParams.toDate && direction === urlParams.direction && type === urlParams.type) {
						return false;
					} else {
						return true;
					}
				}
			} else {
				return true;
			}

		},
		handleOnlyBtnPress: function(oControlEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			var onlyBtn = oControlEvent.getSource();
			var onlyBtnId = oControlEvent.getSource().getId();
			$.sap.delayedCall(0,this,function(){
			var view = this.getView(),
				cbArr = null,
				cbData = null,
				cb=null,
				i = 0,
				text = "",
				oFilter = null,
				fullCbId = null,
				filterSection = null,
				count = 0,
				k = 0,
				j = 0,
				item = null,
				calcModel = null,
				oBinding = null;
			
			var cb = onlyBtn.getParent().getContent()[0];
			var cbId = onlyBtn.getParent().getContent()[0].getId();
			cb.setSelected(true);
			if (onlyBtnId.indexOf("_pa_OnlyBtn_") !== -1) {
				filterSection = "PA";
				cbData = this.getFilterStateFor("PA", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
						var align = null;
						text = this.getView().byId(cbArr[i].cbId).getText();
						if (text === this.getResourceBundle().getText("late")) {
							align = "1";
						} else if (text === this.getResourceBundle().getText("early")) {
							align = "-1";
						} else if (text === this.getResourceBundle().getText("onTime")) {
							align = "0";
						} else if (text === this.getResourceBundle().getText("arrived")) {
							align = "2";
						} else if (text === this.getResourceBundle().getText("unidentified")) {
							align = "3";
						}
						oFilter = new sap.ui.model.Filter("AlignStatus", "EQ", align);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(oFilter, this.getFilter("alignFilter"));
				// 			this.addToFilter(oFilter, this.getFilter("alignFilterUC"));
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(oFilter, this.getFilter("alignFilter"));
				// 			this.removeFromFilter(oFilter, this.getFilter("alignFilterUC"));
						}

					}

				}
			} else if (onlyBtnId.indexOf("_pf_OnlyBtn_") !== -1) {
				filterSection = "PF";
				cbData = this.getFilterStateFor("PF", view);
				cbArr = cbData.data;
				var p = null;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
						text = this.getView().byId(cbArr[i].cbId).getText();
						if (text === this.getResourceBundle().getText("outOfStock")) {
							p = "1";
						} else if (text === this.getResourceBundle().getText("lowStock")) {
							p = "2";
						} else if (text === this.getResourceBundle().getText("noFlag")) {
							p = "3";
						}
						oFilter = new sap.ui.model.Filter("Priority", "EQ", p);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(oFilter, this.getFilter("priorityFilter"));
				// 			this.addToFilter(oFilter, this.getFilter("priorityFilterUC"));
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(oFilter, this.getFilter("priorityFilter"));
				// 			this.removeFromFilter(oFilter, this.getFilter("priorityFilterUC"));
						}
					}

				}
			} else if (onlyBtnId.indexOf("_oc_OnlyBtn_") !== -1) {
				filterSection = "OC";
				cbData = this.getFilterStateFor("OC", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
						text = this.getView().byId(cbArr[i].cbId).getText();
						oFilter = new sap.ui.model.Filter("OriginCountry", "EQ", text);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(oFilter, this.getFilter("countryFilter"));
				// 			this.addToFilter(oFilter, this.getFilter("countryFilterUC"));
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(oFilter, this.getFilter("countryFilter"));
				// 			this.removeFromFilter(oFilter, this.getFilter("countryFilterUC"));
						}
					}

				}
			} else if (onlyBtnId.indexOf("_dest_OnlyBtn_") !== -1) {
				filterSection = "DDC";
				cbData = this.getFilterStateFor("DDC", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
						text = this.getView().byId(cbArr[i].cbId).getText();
						oFilter = new sap.ui.model.Filter("DestinationDCDesc", "EQ", text);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(oFilter, this.getFilter("destFilter"));
				// 			this.addToFilter(oFilter, this.getFilter("destFilterUC"));
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(oFilter, this.getFilter("destFilter"));
				// 			this.removeFromFilter(oFilter, this.getFilter("destFilterUC"));
						}
					}

				}
			} else if (onlyBtnId.indexOf("_prod_OnlyBtn_") !== -1) {
				filterSection = "PRD";
				cbData = this.getFilterStateFor("PRD", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
				// 		text = this.getView().byId(cbArr[i].cbId).getText();
				// 		text = text.split(" ")[0];
				        cb=this.getView().byId(cbArr[i].cbId);
				        text = cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
						oFilter = [];

						//for product
						calcModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().getModel("filterPC").oData);
						calcModel.setSizeLimit(99999);
						oBinding = calcModel.bindList("/ProductCollection");
						jQuery.sap.log.info(oBinding);
						// var searchFilterProd = new sap.ui.model.Filter("SKU", "EQ", text);
						var searchFilterProd = new sap.ui.model.Filter("SKU", sap.ui.model.FilterOperator.Contains, text);
						count = oBinding.filter(searchFilterProd).getLength();
						/*	for (j = 0; j < oBinding.getLength(); j++) {
								var prodBinding = calcModel.bindList("/ProductCollection/" + j + "/ItemSet/results");
								prodBinding.filter(searchFilterProd);
								if (prodBinding.getLength() > 0) {
									count++;
									item = calcModel.getProperty(oBinding.getContexts()[j].sPath);
									oFilter.push(new sap.ui.model.Filter("GUID", sap.ui.model.FilterOperator.EQ, item.GUID));
								}
							}*/
						//end for prod
						//                  var oFilter = new sap.ui.model.Filter(
						//                      "Destination", "EQ", text);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(searchFilterProd, this.getFilter("productFilter"));
				// 			this.addToFilter(searchFilterProd, this.getFilter("productFilterUC"));
							/*for (k = 0; k < oFilter.length; k++) {
									this.removeFromFilter(oFilter[k], this.prdFilter);
								}*/
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(searchFilterProd, this.getFilter("productFilter"));
				// 			this.removeFromFilter(searchFilterProd, this.getFilter("productFilterUC"));
							/*for (k = 0; k < oFilter.length; k++) {
									this.addToFilter(oFilter[k], this.prdFilter);
								}*/
						}
					}

				}
			} else if (onlyBtnId.indexOf("_cat_OnlyBtn_") !== -1) {
				filterSection = "CAT";
				cbData = this.getFilterStateFor("CAT", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
						text = this.getView().byId(cbArr[i].cbId).getText();
						oFilter = [];

						//for category
						calcModel = new sap.ui.model.json.JSONModel(
							this.getOwnerComponent().getModel("filterPC").oData);
						calcModel.setSizeLimit(99999);
						oBinding = calcModel.bindList("/ProductCollection");
						jQuery.sap.log.info(oBinding);
						/*var searchFilterCat = new sap.ui.model.Filter("CategoryDesc", "EQ", text);
							count = 0;*/
						var searchFilterCat = new sap.ui.model.Filter("CategoryDesc", sap.ui.model.FilterOperator.Contains, text);
						count = oBinding.filter(searchFilterCat).getLength();
						/*for (j = 0; j < oBinding.getLength(); j++) {
								var catBinding = calcModel.bindList("/ProductCollection/" + j + "/ItemSet/results");
								//                      debugger;
								catBinding.filter(searchFilterCat);
								if (catBinding.getLength() > 0) {
									count++;
									item = calcModel.getProperty(oBinding.getContexts()[j].sPath);
									oFilter.push(new sap.ui.model.Filter("GUID", sap.ui.model.FilterOperator.EQ, item.GUID));
								}
							}*/
						//end for categroy
						//                  var oFilter = new sap.ui.model.Filter(
						//                      "Destination", "EQ", text);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(searchFilterCat, this.getFilter("categoryFilter"));
				// 			this.addToFilter(searchFilterCat, this.getFilter("categoryFilterUC"));
							/*for (k = 0; k < oFilter.length; k++) {
									this.removeFromFilter(oFilter[k], this.catFilter);
								}*/
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(searchFilterCat, this.getFilter("categoryFilter"));
				// 			this.removeFromFilter(searchFilterCat, this.getFilter("categoryFilterUC"));
							/*for (k = 0; k < oFilter.length; k++) {
									this.addToFilter(oFilter[k], this.catFilter);
								}*/
						}
					}

				}
			} else if (onlyBtnId.indexOf("_pol_OnlyBtn_") !== -1) {
				filterSection = "POL";
				cbData = this.getFilterStateFor("POL", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
				// 		text = this.getView().byId(cbArr[i].cbId).getText();
				// 		text = text.split(" ")[0];
				        cb=this.getView().byId(cbArr[i].cbId);
				        text = cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
						oFilter = new sap.ui.model.Filter("PortOfLoading", "EQ", text);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(oFilter, this.getFilter("polFilter"));
				// 			this.addToFilter(oFilter, this.getFilter("polFilterUC"));
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(oFilter, this.getFilter("polFilter"));
				// 			this.removeFromFilter(oFilter, this.getFilter("polFilterUC"));
						}
					}

				}
			} else if (onlyBtnId.indexOf("_poa_OnlyBtn_") !== -1) {
				filterSection = "POA";
				cbData = this.getFilterStateFor("POA", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === true) {
				// 		text = this.getView().byId(cbArr[i].cbId).getText();
				// 		text = text.split(" ")[0];
				        cb=this.getView().byId(cbArr[i].cbId);
				        text = cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
						oFilter = new sap.ui.model.Filter("PortOfDischarge", "EQ", text);
						fullCbId = this.getView().byId(cbArr[i].cbId).getId();
						if (fullCbId !== cbId) {
							this.removeFromFilter(oFilter, this.getFilter("poaFilter"));
				// 			this.addToFilter(oFilter, this.getFilter("poaFilterUC"));
							this.getView().byId(cbArr[i].cbId).setSelected(false);
						} else {
							this.addToFilter(oFilter, this.getFilter("poaFilter"));
				// 			this.removeFromFilter(oFilter, this.getFilter("poaFilterUC"));
						}
					}

				}
			} else {
				return;
			}
			this.refreshModel(filterSection);
			this.setSeeAllVisibility(filterSection);
			});
		},
		handleSeeAllPress: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			var view = this.getView(),
				i = 0,
				oFilter = null;
			var that = view.getController();
			var btnId = oEvent.getSource().getId();
			oEvent.getSource().setVisible(false);
			$.sap.delayedCall(0,this,function(){
			
			var paBtnId = view.byId("_pa_SeeAllBtn").getId();
			var pfBtnId = view.byId("_pf_SeeAllBtn").getId();
			var ocBtnId = view.byId("_oc_SeeAllBtn").getId();
			var destBtnId = null;
			if(this.fetchViewName()!=="DCL"){
			    destBtnId=view.byId("_dest_SeeAllBtn").getId();
			}
			var prodBtnId = view.byId("_prod_SeeAllBtn").getId();
			var catBtnId = view.byId("_cat_SeeAllBtn").getId();
			var polBtnId = view.byId("_pol_SeeAllBtn").getId();
			var poaBtnId = view.byId("_poa_SeeAllBtn").getId();
			var cbArr = null,
				cbData = null,
				cb=null,
				text = "";
			if (btnId === paBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("planningAlignment"));
				}
				cbData = this.getFilterStateFor("PA", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
						var align = null;
						text = view.byId(cbArr[i].cbId)
							.getText();
						if (text === this.getResourceBundle().getText("late")) {
							align = "1";
						} else if (text === this.getResourceBundle()
							.getText("early")) {
							align = "-1";
						} else if (text === this.getResourceBundle()
							.getText("onTime")) {
							align = "0";
						} else if (text === this.getResourceBundle()
							.getText("arrived")) {
							align = "2";
						} else if (text === this.getResourceBundle()
							.getText("unidentified")) {
							align = "3";
						}
						oFilter = new sap.ui.model.Filter(
							"AlignStatus", "EQ", align);
						this.addToFilter(oFilter, this.getFilter("alignFilter"));
						//SoC
				// 		this.removeFromFilter(oFilter, this.getFilter("alignFilterUC"));
						//EoC
						view.byId(cbArr[i].cbId).setSelected(true);
					}

				}
				that.refreshModel("PA");
			} else if (btnId === pfBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("priorityFlag"));
				}
				cbData = this.getFilterStateFor("PF", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
						var priority = null;
						text = view.byId(cbArr[i].cbId)
							.getText();

						if (text === this.getResourceBundle()
							.getText("outOfStock")) {
							priority = "1";
						} else if (text === this.getResourceBundle()
							.getText("lowStock")) {
							priority = "2";
						} else if (text === this.getResourceBundle()
							.getText("noFlag")) {
							priority = "3";
						}
						oFilter = new sap.ui.model.Filter(
							"Priority", "EQ", priority);
						this.addToFilter(oFilter, this.getFilter("priorityFilter"));
						//SoC
				// 		this.removeFromFilter(oFilter, this.getFilter("priorityFilterUC"));
						//EoC
						view.byId(cbArr[i].cbId).setSelected(true);
					}

				}
				that.refreshModel("PF");

			} else if (btnId === ocBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("originCountry"));
				}
				cbData = this.getFilterStateFor("OC", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
						text = view.byId(cbArr[i].cbId)
							.getText();
						oFilter = new sap.ui.model.Filter(
							"OriginCountry", "EQ", text);
						this.addToFilter(oFilter, this.getFilter("countryFilter"));
						//SoC
				// 		this.removeFromFilter(oFilter, this.getFilter("countryFilterUC"));
						//EoC
						view.byId(cbArr[i].cbId).setSelected(true);
					}

				}
				that.refreshModel("OC");
			} else if (btnId === destBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("destinationDC"));
				}
				cbData = this.getFilterStateFor("DDC", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
						text = view.byId(cbArr[i].cbId).getText();
						oFilter = new sap.ui.model.Filter("DestinationDCDesc", "EQ", text);
						this.addToFilter(oFilter, this.getFilter("destFilter"));
						//SoC
				// 		this.removeFromFilter(oFilter, this.getFilter("destFilterUC"));
						//EoC
						view.byId(cbArr[i].cbId).setSelected(true);
					}

				}
				that.refreshModel("DDC");
			} else if (btnId === prodBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("product"));
				}
				cbData = this.getFilterStateFor("PRD", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
					    cb=view.byId(cbArr[i].cbId);
				        text = cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
				// 		text = view.byId(cbArr[i].cbId).getText().split(" ")[0];
						oFilter = new sap.ui.model.Filter("SKU", sap.ui.model.FilterOperator.Contains, text);
						this.addToFilter(oFilter, this.getFilter("productFilter"));
						//SoC
				// 		this.removeFromFilter(oFilter, this.getFilter("productFilterUC"));
						//EoC
						view.byId(cbArr[i].cbId).setSelected(true);
					}
					/*  if (cbArr[i].isChecked === false) {
              text = view.byId(cbArr[i].cbId)
                .getText();
              text = text.split(" ")[0];

              // for product
              oFilter = [];
              calcModel = new sap.ui.model.json.JSONModel(
                this.getOwnerComponent().getModel(
                  "filterPC").oData);
              oBinding = calcModel
                .bindList("/ProductCollection");
              var searchFilterProd = new sap.ui.model.Filter(
                "SKU", "EQ", text);
              var count = 0;
              for (j = 0; j < oBinding.getLength(); j++) {

                var prodBinding = calcModel
                  .bindList("/ProductCollection/" + j + "/ItemSet/results");
                prodBinding.filter(searchFilterProd);
                var contexts = oBinding.getContexts(0, oBinding.getLength());
                if (prodBinding.getLength() > 0) {
                  count++;
                  var item = calcModel.getProperty(contexts[j].sPath);
                  oFilter.push(new sap.ui.model.Filter("GUID",sap.ui.model.FilterOperator.EQ,item.GUID));
                }
              }

              // end for product
              for (k = 0; k < oFilter.length; k++) {
                this.addToFilter(oFilter[k],this.prdFilter, this);
                this.removeFromFilter(oFilter[k],this.prdFilterUC, this);
              }

              this.getView().byId(cbArr[i].cbId).setSelected(true);
            }*/

				}
				that.refreshModel("PRD");
			} else if (btnId === catBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("category"));
				}
				cbData = this.getFilterStateFor("CAT", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
						text = view.byId(cbArr[i].cbId).getText();
						oFilter = new sap.ui.model.Filter("CategoryDesc", sap.ui.model.FilterOperator.Contains, text);
						this.addToFilter(oFilter, this.getFilter("categoryFilter"));
						//SoC
				// 		this.removeFromFilter(oFilter, this.getFilter("categoryFilterUC"));
						//EoC
						view.byId(cbArr[i].cbId).setSelected(true);
					}
					/*if (cbArr[i].isChecked === false) {
              text = view.byId(cbArr[i].cbId)
                .getText();

              // for categoryoFilter = [];
              oFilter=[];
              calcModel = new sap.ui.model.json.JSONModel(this.getOwnerComponent().getModel("filterPC").oData);
               oBinding = calcModel.bindList("/ProductCollection");
              var searchFilterCat = new sap.ui.model.Filter(
                "CategoryDesc", "EQ", text);
              count = 0;
              for (j = 0; j < oBinding.getLength(); j++) {

                var catBinding = calcModel.bindList("/ProductCollection/" + j + "/ItemSet/results");
                catBinding.filter(searchFilterCat);
                contexts = oBinding.getContexts(0, oBinding.getLength());
                if (catBinding.getLength() > 0) {
                  count++;
                  item = calcModel.getProperty(contexts[j].sPath);
                  oFilter.push(new sap.ui.model.Filter("GUID",sap.ui.model.FilterOperator.EQ,item.GUID));
                }
              }

              // end for category
              for (k = 0; k < oFilter.length; k++) {
                this.addToFilter(oFilter[k],this.catFilter, this);
                this.removeFromFilter(oFilter[k],this.catFilterUC, this);
              }

              this.getView().byId(cbArr[i].cbId).setSelected(true);
            }*/

				}
				that.refreshModel("CAT");
			} else if (btnId === polBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("pol"));
				}
				cbData = this.getFilterStateFor("POL", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
				// 		text = view.byId(cbArr[i].cbId).getText();
				// 		text=text.split(" ")[0];
				        cb=view.byId(cbArr[i].cbId);
				        text = cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
						oFilter = new sap.ui.model.Filter(
							"PortOfLoading", "EQ", text);
						this.addToFilter(oFilter, this.getFilter("polFilter"));
				// 		this.removeFromFilter(oFilter, this.getFilter("polFilterUC"));
						view.byId(cbArr[i].cbId).setSelected(true);
					}

				}
				that.refreshModel("POL");
			} else if (btnId === poaBtnId) {
				if (!that.isCustom) {
					// For GA Tagging
					this.trackGAEvent(this.EvtCat.FILTER,
						this.EvtAct.SEE_ALL, this.oBundleEn
						.getText("poa"));
				}
				cbData = this.getFilterStateFor("POA", view);
				cbArr = cbData.data;
				for (i = 0; i < cbArr.length; i++) {
					if (cbArr[i].isChecked === false) {
				// 		text = view.byId(cbArr[i].cbId).getText();
				// 		text=text.split(" ")[0];
				        cb=view.byId(cbArr[i].cbId);
				        text = cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
						oFilter = new sap.ui.model.Filter(
							"PortOfDischarge", "EQ", text);
						this.addToFilter(oFilter, this.getFilter("poaFilter"));
				// 		this.removeFromFilter(oFilter, this.getFilter("poaFilterUC"));
						view.byId(cbArr[i].cbId).setSelected(true);
					}
				}
				that.refreshModel("POA");
			} else {
				return;
			}
			
			that.isCustom = false;
			});
		},
		getRouteForHash: function() {
			var view = this.getView(),
				route = "";
			var viewName = view.getViewName().split(".").pop();
			if (viewName === "Root") {
				viewName = "Dashboard";
				route = "Dashboard";
			} else if (viewName === "RouteDetail") {
				viewName = "PlanningAdvisor";
				route = "PlanningAdvisor";
			} else if (viewName === "DistCenterLoad") {
				viewName = "DCL";
				route = "DistributionCenterLoad";
			}
			return {
				viewName: viewName,
				route: route
			};
		},

		handleDateRangePress: function(oEvent) {
			var view = this.getView();
			var data = this.getRouteForHash();

			// var oController=view.getController();
			var fromDate = this.getModel("appProperties").getProperty("/fD");
			var toDate = this.getModel("appProperties").getProperty("/tD");
			this.getModel("appProperties").setProperty("/dateRangeText", this.getModel("appProperties").getProperty("/type") === "Arrival" ?
				this.oBundle.getText("arrText", [Utility.dateConvert(fromDate, "yyyyMMdd", false, true), Utility.dateConvert(toDate, "yyyyMMdd",
					false, true)]) :
				this.oBundle.getText("depText", [Utility.dateConvert(fromDate, "yyyyMMdd", false, true), Utility.dateConvert(toDate, "yyyyMMdd",
					false, true)]));
			var fDate = Utility.formatDate(fromDate, null, "dd/MM/yyyy");
			var tDate = Utility.formatDate(toDate, null, "dd/MM/yyyy");
			var evtLabel = fDate + "_" + tDate;
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.DATE, this.EvtAct.CHANGE, evtLabel);

			if (!this.isValidDateRange(fromDate, toDate)) {
				view.byId("search").setModel(null);
			} else {
				this.updateDateCookie(fromDate, toDate);
				this.setCustomHashChange(false);
				this.setHash(data.route);
				// this.initiateMainServiceCall(true,data.viewName);
				// this.getODataModel(fromDate, toDate);
			}

		},

		resetFilters: function() {
			/*this.alignFilter = [];
			this.alignFilterUC = [];
			this.priorityFilter = [];
			this.priorityFilterUC = [];
			this.countryFilter = [];
			this.countryFilterUC = [];
			this.destFilter = [];
			this.destFilterUC = [];
			this.destFilterDCL = [];
			this.destFilterDCLUC = [];
			this.prodcutFilter = [];
			this.prodcutFilterUC = [];
			this.categoryFilter = [];
			this.categoryFilterUC = [];
			this.polFilter = [];
			this.polFilterUC = [];
			this.poaFilter = [];
			this.poaFilterUC = [];
			this.allFilters = new Filter({
				aFilters: [],
				bAnd: true
			});
			this.allFiltersUC = new Filter({
				aFilters: [],
				bAnd: true
			});*/
			var oModel = new JSONModel();
			oModel.setData({
				destFilter: [],
				catFilter: [],
				categoryFilter: [],
				polFilter: [],
				poaFilter: [],
				prdFilter: [],
				productFilter: [],
				allFilters: new Filter({
					aFilters: []
				}),
				alignFilter: [],
				priorityFilter: [],
				countryFilter: [],
				destFilterUC: [],
				catFilterUC: [],
				categoryFilterUC: [],
				polFilterUC: [],
				poaFilterUC: [],
				prdFilterUC: [],
				productFilterUC: [],
				allFiltersUC: new Filter({
					aFilters: []
				}),
				alignFilterUC: [],
				priorityFilterUC: [],
				countryFilterUC: [],
				nullFilterFlag: false
			});
			this.getOwnerComponent().setModel(oModel, "filterModel");
		},
		updateAppProperties: function() {
			var isArrival = this.getModel("appProperties").getProperty("/isRA");
			this.getModel("appProperties").setProperty("/type", isArrival === true ? "Arrival" : "Departure");
			this.getModel("appProperties").setProperty("/dateRangeText", this.getModel("appProperties").getProperty("/type") === "Arrival" ?
				this.getResourceBundle().getText("arrText", [Utility.dateConvert(this.getModel("appProperties").getProperty("/fD"), "yyyyMMdd", false, true),
					Utility.dateConvert(
						this.getModel("appProperties").getProperty("/tD"), "yyyyMMdd", false, true)
				]) : this.getResourceBundle().getText("depText", [Utility.dateConvert(this.getModel("appProperties")
					.getProperty("/fD"), "yyyyMMdd", false, true), Utility.dateConvert(this.getModel("appProperties").getProperty("/tD"), "yyyyMMdd", false, true)])
			);
			this.getModel("appProperties").setProperty("/direction", this.getModel("oMktModel").getProperty("/direction"));
			this.getModel("appProperties").setProperty("/mktOrCC", this.getModel("oMktModel").getProperty("/mkt"));
			this.updateParamModel();
		},
		updateAppPropertiesFromHash: function(fD, tD, direction, type, mktOrCC) {
			this.getModel("appProperties").setProperty("/oldfD", this.getModel("appProperties").getProperty("/fD"));
			this.getModel("appProperties").setProperty("/oldtD", this.getModel("appProperties").getProperty("/tD"));
			this.getModel("appProperties").setProperty("/oldType", this.getModel("appProperties").getProperty("/type"));
			this.getModel("appProperties").setProperty("/oldIsRA", this.getModel("appProperties").getProperty("/isRA"));
			this.getModel("appProperties").setProperty("/oldIsRD", this.getModel("appProperties").getProperty("/isRD"));
			this.getModel("appProperties").setProperty("/fD", fD);
			this.getModel("appProperties").setProperty("/tD", tD);
			this.updateDateCookie(fD, tD);
			this.getModel("appProperties").setProperty("/direction", direction);
			this.getModel("appProperties").setProperty("/type", type);
			this.updateTypeCookie(type);
			this.updateDirectionCookie(direction);
			this.getModel("appProperties").setProperty("/isRA", type === "Arrival" ? true : false);
			this.getModel("appProperties").setProperty("/isRD", type === "Departure" ? true : false);
			this.getModel("appProperties").setProperty("/dateRangeText", type === "Arrival" ?
				this.getResourceBundle().getText("arrText", [Utility.dateConvert(fD, "yyyyMMdd", false, true), Utility.dateConvert(tD, "yyyyMMdd",
					false, true)]) :
				this.getResourceBundle().getText("depText", [Utility.dateConvert(fD, "yyyyMMdd", false, true), Utility.dateConvert(tD, "yyyyMMdd",
					false, true)])
			);
			this.getModel("appProperties").setProperty("/mktOrCC", mktOrCC);
			// this.updateParamModel();
		},
		updateParamModel: function() {
			// var oController = this.getView().getController();
			// this.bParamModelChanged = this.isParamModelChanged(oController.urlParams);
			//Start of Change GDNK903907 - 10-May-2016
			this.getModel("paramModel").setProperty("/fromDate", this.getModel("appProperties").getProperty("/fD"));
			this.getModel("paramModel").setProperty("/toDate", this.getModel("appProperties").getProperty("/tD"));
			this.getModel("paramModel").setProperty("/direction", this.getModel("appProperties").getProperty("/direction"));
			this.getModel("paramModel").setProperty("/type", this.getModel("appProperties").getProperty("/type"));
			this.getModel("paramModel").setProperty("/companyCode", this.getModel("appProperties").getProperty("/mktOrCC"));
			//End of Change GDNK903907 - 10-May-2016
		},
		initiateMainServiceCall: function(isDBRefresh, source, isSelectAll) {
			if (!isSelectAll) {
				isSelectAll = false;
			}
			var isDCL = false,
				route = null,
				oController = this.getView().getController(),
				p = oController.urlParams;
			if (p) {
				this.updateAppPropertiesFromHash(p.fromDate, p.toDate, p.direction, p.type, p.companyCode);
				this.updateParamModel();
			}
			if (source === "Dashboard") {
				// modelFor="modelRoot";
				route = "Dashboard";
			} else if (source === "PlanningAdvisor") {
				// modelFor="modelPA";
				route = "PlanningAdvisor";
			} else if (source === "DCL") {
				// modelFor="modelDCL";
				route = "DistributionCenterLoad";
				isDCL = true;
			}
			var bus = this.getEventBus();
			this.oLoadFinishedDef = $.Deferred();
			if (!isDBRefresh) {
				this.oLoadFinishedDef.resolve();
				if (isSelectAll) {
					bus.publish("all", "prepareScreen", {
						src: source,
						isSelectAll: true
					});
				} else {
					bus.publish("all", "prepareScreen", {
						src: source,
						isSelectAll: false
					});
				}

			} else {
				// if (isManualRefresh) {
				this.updateAppProperties();
				// }
				// else{
				// oController.isCustomHashChange=true;
				// this.setHash(route);
				// }
				this.getODataModel(this.getModel("appProperties").getProperty("/fD"), this.getModel("appProperties").getProperty("/tD"));
				this.waitForLoad(function() {
					var model = this.getModel("LocalModel");
					var calcModel = new JSONModel(model.getProperty("/"));
					calcModel.setSizeLimit(99999);
					var oBindingforCalc = calcModel.bindList("/ProductCollection");
					var filterItems = [];
					if (oBindingforCalc.getLength() === 0) {
						/*sap.m.MessageBox.alert(this.oBundle
						            .getText("noDataInDtRange"), {
						          styleClass : "sapUiSizeCompact",
						          icon : sap.m.MessageBox.Icon.ERROR,
						          title : this.oBundle.getText("errNoData")
						        });*/
					} else {
						// For SORTING
						var oSorter = new sap.ui.model.Sorter("UDelDate");
						oBindingforCalc.sort(oSorter, true);
						var contexts = oBindingforCalc.getContexts(0, oBindingforCalc.getLength());
						for (var i = 0; i < oBindingforCalc.getLength(); i++) {
							var item = calcModel.getProperty(contexts[i].sPath);
							filterItems.push(item);
						}
						var view = this.getView();
						var h = (screen.availHeight * 0.7) / 2;
						var extra = (screen.availHeight * 0.03);
						if (view.byId("panelPA")) {
							view.byId("panelPA").setHeight(h + "px");
							view.byId("panelFC").setHeight(h + "px");
							view.byId("pid").setHeight((h * 1.97 + extra) + "px");
							view.byId("panelFC").addStyleClass("panel_margin2");
						}

					}
					var filterPC = new JSONModel();
					filterPC.setSizeLimit(99999);
					filterPC.setData({
						"ProductCollection": filterItems
					});
					this.getOwnerComponent().setModel(filterPC, "filterPC");
					this.getView().getController().totalcont = this.getModel("filterPC").getProperty("/ProductCollection").length;
					/*bus.publish("root", "navTo", {
					  src: "Direct"
					});*/
					var filterSection = [];
					if (isDCL) {
						filterSection = ["PA", "PF", "OC", "PRD", "CAT", "POL", "AT", "POA"];
					} else {
						filterSection = ["PA", "PF", "OC", "DDC", "PRD", "CAT", "POL", "POA"];
					}
					bus.publish("all", "prepareScreen", {
						src: source,
						isSelectAll: isSelectAll
					});
				});
			}

		},
		localRefresh: function(sChannelId, oEvent, data) {
			var oLocalModel = null,
				oFilterPCModel = null,
				oSubFilterPCModel = null,
				oBinding = null;
			var oFilter = new Filter("GUID", "EQ", data.guid);
			if (this.getModel("LocalModel")) {
				oLocalModel = this.getModel("LocalModel");
				oBinding = oLocalModel.bindList("/ProductCollection");
				var sPath = null;
				oBinding.filter(oFilter);
				if (oBinding.getLength() > 0) {
					sPath = oBinding.getContexts()[0].sPath;
					oLocalModel.setProperty(sPath + "/" + data.field, data.value);
					oLocalModel.refresh(true);
				}
			}
			if (this.getModel("filterPC")) {
				oFilterPCModel = this.getModel("filterPC");
				oBinding = oFilterPCModel.bindList("/ProductCollection");
				oBinding.filter(oFilter);
				if (oBinding.getLength() > 0) {
					sPath = oBinding.getContexts()[0].sPath;
					oFilterPCModel.setProperty(sPath + "/" + data.field, data.value);
					oFilterPCModel.refresh(true);
				}
			}
			if (this.getModel("subFilterPC")) {
				oSubFilterPCModel = this.getModel("subFilterPC");
				oBinding = oSubFilterPCModel.bindList("/ProductCollection");
				oBinding.filter(oFilter);
				if (oBinding.getLength() > 0) {
					sPath = oBinding.getContexts()[0].sPath;
					oSubFilterPCModel.setProperty(sPath + "/" + data.field, data.value);
					oSubFilterPCModel.refresh(true);
				}
			}
		},
		onRefresh: function(oEvent) {
			var view = this.getView();
			var viewName = view.getViewName().split(".").pop();
			if (viewName === "Root") {
				viewName = "Dashboard";
			} else if (viewName === "RouteDetail") {
				viewName = "PlanningAdvisor";
			} else if (viewName === "DistCenterLoad") {
				viewName = "DCL";
			}
			this.initiateMainServiceCall(true, viewName,true);
		},
		_loadData: function(sChannelId, oEvent, data) {
			var that = this.getView().getController();

			if (that.urlParams) {
				var isValid = this.isValidParameters(that.urlParams);
				if (isValid === false) {
					this.setDefaultModels();
				}
			} else {
				this.oDefaultLoadFinishedDef = $.Deferred();
				this.setDefaultModels();
				//Added to curb dual call
				this.isLocalRefresh = true;
			}
			this.setUserModels();
			this.waitForDefaultLoad(function() {
				that.isCustomDateChangeEvent = true;
				this.initiateMainServiceCall(true, this.fetchViewName());
				that.isCustomDateChangeEvent = false;
				if (typeof data !== 'undefined' && data.src === 'Component') {
					this.getEventBus().publish("root", "showOverlay");
				}
			});
			if (that.firstTime) {
				that.firstTime = false;
			}
		},
		checkFilter: function(filterVal, modelFor) {
			var view = this.getView();
			var j = 0,
				f = 0;
			var cArr = [];
			var cCB = [];
			var allC = [];
			var value = "",
				prefix = null;
			if (this.getModel(filterVal[modelFor])) {
				cArr = this.getModel(filterVal[modelFor]).getProperty("/" + filterVal.context);
				cCB = [];
				allC = [];
				prefix = filterVal.prefix;
				for (j = 0; j < cArr.length; j++) {
					allC.push(cArr[j].value);
					cCB.push(prefix + "_" + cArr[j].id);
				}

				if (this.getFilter(filterVal.filterArr) === null || this.getFilter(filterVal.filterArr).length === 0) {
					for (j = 0; j < cCB.length; j++) {
						view.byId(cCB[j]).setSelected(false);
					}

				} else {
					for (f = 0; f < this.getFilter(filterVal.filterArr).length; f++) {
						value = this.getFilter(filterVal.filterArr)[f].oValue1;
						for (j = 0; j < allC.length; j++) {
							if (value === allC[j]) {
								view.byId(cCB[j]).setSelected(true);
							}
						}

					}
				}
			}
		},
		checkFilters: function(filterSection, modelFor) {
			var i = 0,
				filterVal = null;
			if ($.isArray(filterSection)) {
				for (i = 0; i < filterSection.length; i++) {
					filterVal = this.getFilterVal(filterSection[i]);
					this.checkFilter(filterVal, modelFor);
				}
			} else if (typeof filterSection === "string") {
				filterVal = this.getFilterVal(filterSection);
				this.checkFilter(filterVal, modelFor);
			}
			/*	var filterPA = this.getFilterVal("PA");
				var filterPF = this.getFilterVal("PF");
				var filterOC = this.getFilterVal("OC");
				var filterDDC = this.getFilterVal("DDC");
				var filterCAT = this.getFilterVal("CAT");
				var filterPRD = this.getFilterVal("PRD");
				var filterPOL = this.getFilterVal("POL");
				var filterPOA = this.getFilterVal("POA");
				// for PA
				if (this.getModel(filterPA[modelFor])) {
					cArr = this.getModel(filterPA[modelFor]).getProperty("/PACollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("pa_" + cArr[i].id);
					}

					if (this.alignFilter === null || this.alignFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}

					} else {
						for (f = 0; f < this.alignFilter.length; f++) {
							value = this.alignFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}

						}
					}
				}
				// end for PA

				// for PF
				if (this.getModel(filterPF[modelFor])) {
					cArr = this.getModel(filterPF[modelFor]).getProperty("/PFCollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("pf_" + cArr[i].id);
					}

					if (this.priorityFilter === null || this.priorityFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}

					} else {
						for (f = 0; f < this.priorityFilter.length; f++) {
							value = this.priorityFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}

						}
					}
				}
				// end for PF

				if (this.getModel(filterOC[modelFor])) {
					cArr = this.getModel(filterOC[modelFor]).getProperty("/CountryCollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("oc_" + cArr[i].id);
					}

					if (this.countryFilter === null || this.countryFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}

					} else {
						for (f = 0; f < this.countryFilter.length; f++) {
							value = this.countryFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}

						}
					}
				}

				// for dest
				if (this.getModel(filterDDC[modelFor])) {
					cArr = this.getModel(filterDDC[modelFor]).getProperty("/DestinationCollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("dest_" + cArr[i].id);
					}

					if (this.destFilter === null || this.destFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}

					} else {
						for (f = 0; f < this.destFilter.length; f++) {
							value = this.destFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}

						}
					}
				}
				// end for dest
				// for category
				if (this.getModel(filterCAT[modelFor])) {
					cArr = this.getModel(filterCAT[modelFor]).getProperty("/CategoryCollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("cat_" + cArr[i].id);
					}
					if (this.categoryFilter === null || this.categoryFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}
					} else {
						for (f = 0; f < this.categoryFilter.length; f++) {
							value = this.categoryFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}
						}
					}
				}

				// for pol
				if (this.getModel(filterPOL[modelFor])) {
					cArr = this.getModel(filterPOL[modelFor]).getProperty("/POLCollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("pol_" + cArr[i].id);
					}

					if (this.polFilter === null || this.polFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}

					} else {
						for (f = 0; f < this.polFilter.length; f++) {
							value = this.polFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}

						}
					}
				}

				// for poa
				if (this.getModel(filterPOA[modelFor])) {
					cArr = this.getModel(filterPOA[modelFor]).getProperty("/POACollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("poa_" + cArr[i].id);
					}

					if (this.poaFilter === null || this.poaFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}

					} else {
						for (f = 0; f < this.poaFilter.length; f++) {
							value = this.poaFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}

						}
					}
				}

				// for prod
				if (this.getModel(filterPRD[modelFor])) {
					cArr = this.getModel(filterPRD[modelFor]).getProperty("/ProdCollection");
					cCB = [];
					allC = [];
					for (i = 0; i < cArr.length; i++) {
						allC.push(cArr[i].value);
						cCB.push("prod_" + cArr[i].id);
					}
					if (this.productFilter === null || this.productFilter.length === 0) {
						for (i = 0; i < cCB.length; i++) {
							view.byId(cCB[i]).setSelected(false);
						}

					} else {
						for (f = 0; f < this.productFilter.length; f++) {
							value = this.productFilter[f].oValue1;
							for (i = 0; i < allC.length; i++) {
								if (value === allC[i]) {
									view.byId(cCB[i]).setSelected(true);
								}
							}

						}

					}
				}*/
		},
		setMarket: function() {
			var view = this.getView();
			var oMktModel = this.getModel("oMktModel");
			if (typeof view.byId("marketList").getModel() === 'undefined') {
				view.byId("marketList").setModel(this.getModel("marketListModel"));
			}
			view.byId("marketList").setSelectedKey(oMktModel.getProperty("/key"));
		},
		getSearchLoadDefObj: function() {
			return this.getModel("filterModel").getProperty("/oSearchLoadFinishedDef");
		},
		setSearchLoadDefObj: function() {
			this.getModel("filterModel").setProperty("/oSearchLoadFinishedDef", $.Deferred());
		},
		getFilterLoadDefObj: function() {
			//  return this.getModel("filterModel").getProperty("/oFilterLoadFinishedDef");
			return this.getOwnerComponent().oFilterLoadFinishedDef;
		},
		setFilterLoadDefObj: function() {
			// this.getModel("filterModel").setProperty("/oFilterLoadFinishedDef",$.Deferred());
			this.getOwnerComponent().oFilterLoadFinishedDef = $.Deferred();
		},
		generateDynamicFilters: function(filterSection, modelFor, isDCL, isSelectAll, model) {
			var oFilterVal = null,
				view = this.getView(),
				oController = view.getController();
			var filterSections = null;
			this.setFilterLoadDefObj();
			if ($.isArray(filterSection)) {
				for (var i = 0; i < filterSection.length; i++) {
					oFilterVal = this.getFilterVal(filterSection[i]);
					if (view.byId(oFilterVal.list)) {
						view.byId(oFilterVal.list).destroyItems();
					}
					if (model && isDCL) {
						this.createFilter(oFilterVal.field, oFilterVal.prefix, oFilterVal.context, oFilterVal[modelFor], oFilterVal.list, this[
							oFilterVal.evtHandler], view, oController, model);
					} else {
						this.createFilter(oFilterVal.field, oFilterVal.prefix, oFilterVal.context, oFilterVal[modelFor], oFilterVal.list, this[
							oFilterVal.evtHandler], view, oController);
					}
				}
				$.when(this.getFilterLoadDefObj()).then($.proxy(function() {
					if (isDCL) {
						// filterSections = ["PA", "PF", "OC", "PRD", "CAT", "POL", "POA"];
						//31Aug2016
						filterSections = ["PA", "PF", "OC", "CAT", "POL", "POA"];
					} else {
						// filterSections = ["PA", "PF", "OC", "DDC", "PRD", "CAT", "POL", "POA"];
						//31 Aug2016
						filterSections = ["PA", "PF", "OC", "DDC", "CAT", "POL", "POA"];
					}
					if (modelFor !== "modelPA") {
						this.refreshPageElements(filterSections, modelFor, isDCL, isSelectAll);
					} else {
						if (isSelectAll) {
							this.refreshPageElements(filterSections, modelFor, isDCL, isSelectAll);
						}
					}

					if (this.getSearchLoadDefObj()) {
						this.getSearchLoadDefObj().resolve();
					}
					oFilterVal = this.getFilterVal("PRD");
					/* if(model && isDCL){
				    this.createFilter(oFilterVal.field, oFilterVal.prefix, oFilterVal.context, oFilterVal[modelFor], oFilterVal.list, this[oFilterVal.evtHandler],view,oController,model,true);
				}
				else{
				    this.createFilter(oFilterVal.field, oFilterVal.prefix, oFilterVal.context, oFilterVal[modelFor], oFilterVal.list, this[oFilterVal.evtHandler],view,oController,null,true);
				}
				// if(isSelectAll){
				// 		this.selectAllFilters(["PRD"],modelFor);
				// 	}
				// 	else{
				// 		this.uncheckAllFilters(["PRD"],modelFor);
				// 	}
					this.checkFilters(["PRD"],modelFor);*/
				}, this));
			} else if (typeof filterSections === "string") {
				oFilterVal = this.getFilterVal(filterSection);
				if (view.byId(oFilterVal.list)) {
					view.byId(oFilterVal.list).destroyItems();
				}
				this.createFilter(oFilterVal.field, oFilterVal.prefix, oFilterVal.context, oFilterVal[modelFor], oFilterVal.list, this[oFilterVal.evtHandler]);
				if (modelFor !== "modelPA") {
					this.refreshPageElements(filterSections, modelFor, isDCL, isSelectAll);
				} else {
					if (isSelectAll) {
						this.refreshPageElements(filterSections, modelFor, isDCL, isSelectAll);
					}
				}
			}

		},
		refreshPageElements: function(filterSections, modelFor, isDCL, isSelectAll) {

			if (isSelectAll) {
				this.selectAllFilters(filterSections, modelFor);
			} else {
				this.uncheckAllFilters(filterSections, modelFor);
			}
			this.checkFilters(filterSections, modelFor);
			this.refreshModel("ALL");
			this.setSeeAllVisibility("ALL", isDCL);
		},
		uncheckAllFilter: function(filterVal, modelFor) {
			var view = this.getView();
			var j = 0;
			var cArr = [];
			var id = "",
				prefix = null;
			if (this.getModel(filterVal[modelFor])) {
				cArr = this.getModel(filterVal[modelFor]).getProperty("/" + filterVal.context);
				prefix = filterVal.prefix;
				for (j = 0; j < cArr.length; j++) {
					id = prefix + "_" + cArr[j].id;
					view.byId(id).setSelected(false);
				}
			}
		},
		uncheckAllFilters: function(filterSection, modelFor) {
			var i = 0,
				filterVal = null;
			if ($.isArray(filterSection)) {
				for (i = 0; i < filterSection.length; i++) {
					filterVal = this.getFilterVal(filterSection[i]);
					this.uncheckAllFilter(filterVal, modelFor);
				}
			} else if (typeof filterSection === "string") {
				filterVal = this.getFilterVal(filterSection);
				this.uncheckAllFilter(filterVal, modelFor);
			}
		},
		selectAllFilters: function(filterSection, modelFor) {
			var cArr = [],
				oFilterVal = null,
				oFilter = null,
				i = 0,
				j = 0,
				filterOp = sap.ui.model.FilterOperator.EQ;
			for (i = 0; i < filterSection.length; i++) {
				oFilterVal = this.getFilterVal(filterSection[i]);
				if (this.getModel(oFilterVal[modelFor])) {
					if (oFilterVal.filterOp === "EQ") {
						filterOp = sap.ui.model.FilterOperator.EQ;
					} else if (oFilterVal.filterOp === "Contains") {
						filterOp = sap.ui.model.FilterOperator.Contains;
					}
					cArr = this.getModel(oFilterVal[modelFor]).getProperty("/" + oFilterVal.context);
					this.setFilter(oFilterVal.filterArr, []);
					this.setFilter(oFilterVal.filterArrUC, []);
					for (j = 0; j < cArr.length; j++) {
						oFilter = new Filter(oFilterVal.field, filterOp, cArr[j].value);
						this.getFilter(oFilterVal.filterArr).push(oFilter);
					}
				}
			}
			// this.setFilters();
			// this.refreshModel("ALL");
			// this.setSeeAllVisibility("ALL");
		},
		getCbId: function(cb) {
			var cbId = cb.getModel().getProperty(cb.getBindingContext().getPath() + "/id");
			return cbId;
		},
		prioritySelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			// var cbId=this.getCbId(oEvent.getSource());
			var text = oEvent.getSource().getText();
			this.currCbId = oEvent.getSource().getId();
			var isSelected = oEvent.getSource().getSelected();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("priorityFlag"));
			// for auto tick of filters
			this.source = null;
			this.filterSection = "PF";
			var priority = null;
			
			if (text === this.getResourceBundle().getText("outOfStock")) {
				priority = "1";
			} else if (text === this.getResourceBundle().getText("lowStock")) {
				priority = "2";
			} else if (text === this.getResourceBundle().getText("noFlag")) {
				priority = "3";
			}
			
			// var context=this.currCbId.getModel().
			var oFilter = new sap.ui.model.Filter("Priority", "EQ",
				priority);
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("priorityFilter"));
				//SoC
				// this.removeFromFilter(oFilter, this.getFilter("priorityFilterUC"));
				//EoC

			} else {
				this.removeFromFilter(oFilter, this.getFilter("priorityFilter"));
				//SoC
				// this.addToFilter(oFilter, this.getFilter("priorityFilterUC"));
				//EoC
			}
			this.setSeeAllVisibility("PF");
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") {
			this.refreshModel("PF");
			// }
		});
		},

		alignSelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			this.currCbId = oEvent.getSource().getId();
			var text = oEvent.getSource().getText();
			var isSelected = oEvent.getSource().getSelected();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("planningAlignment"));
			// for auto tick of filters
			this.source = null;
		
			this.filterSection = "PA";
			var align = null;
		
			if (text === this.getResourceBundle().getText("late")) {
				align = "1";
			} else if (text === this.getResourceBundle().getText("early")) {
				align = "-1";
			} else if (text === this.getResourceBundle().getText("onTime")) {
				align = "0";
			} else if (text === this.getResourceBundle().getText("arrived")) {
				align = "2";
			} else if (text === this.getResourceBundle().getText("unidentified")) {
				align = "3";
			}
			var oFilter = new sap.ui.model.Filter("AlignStatus",
				"EQ", align);
			//SoC
// 			var oFilterUC = new sap.ui.model.Filter("AlignStatus",
// 				"EQ", align);
			//EoC
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("alignFilter"));
				//SoC
				// this.removeFromFilter(oFilterUC, this.getFilter("alignFilterUC"));
				//EoC
			} else {
				this.removeFromFilter(oFilter, this.getFilter("alignFilter"));
				//SoC
				// this.addToFilter(oFilterUC, this.getFilter("alignFilterUC"));
				//EoC
			}

			this.setSeeAllVisibility("PA");
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") {
			this.refreshModel("PA");
			// }
		});
		},

		countrySelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			this.currCbId = oEvent.getSource().getId();
			var text = oEvent.getSource().getText();
			var isSelected = oEvent.getSource().getSelected();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("originCountry"));
			// for auto tick of filters
			this.source = null;
			
			this.filterSection = "OC";
			
			var oFilter = new sap.ui.model.Filter("OriginCountry", "EQ", text);
			//SoC
// 			var oFilterUC = new sap.ui.model.Filter("OriginCountry", "EQ", text);
			//EoC
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("countryFilter"));
				//SoC
				// this.removeFromFilter(oFilterUC, this.getFilter("countryFilterUC"));
				//EoC
			} else {
				this.removeFromFilter(oFilter, this.getFilter("countryFilter"));
				//SoC
				// this.addToFilter(oFilterUC, this.getFilter("countryFilterUC"));
				//EoC
			}

			this.setSeeAllVisibility("OC");
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") {
			this.refreshModel("OC");
			// }
		});
		},

		destinationSelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			this.currCbId = oEvent.getSource().getId();
			var isSelected = oEvent.getSource().getSelected();
			var text = oEvent.getSource().getText();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("destinationDC"));
			// for auto tick of filters
			this.source = null;
			
			this.filterSection = "DDC";
			
			var oFilter = new sap.ui.model.Filter("DestinationDCDesc", "EQ", text);
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("destFilter"));
				//SoC
				// this.removeFromFilter(oFilter, this.destFilterUC);
				//EoC
			} else {
				this.removeFromFilter(oFilter, this.getFilter("destFilter"));
				//SoC
				// this.addToFilter(oFilter, this.getFilter("destFilterUC"));
				//EoC
			}

			this.setSeeAllVisibility("DDC");
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") {
			this.refreshModel("DDC");
			// }
			});
		},

		prdSelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			var cb=oEvent.getSource();
			this.currCbId = cb.getId();
			var isSelected = oEvent.getSource().getSelected();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("product"));
			// for auto tick of filters
			this.source = null;
			
			var text=cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
			
			this.filterSection = "PRD";
// 			var text = oEvent.getSource().getText();
// 			text = text.split(" ")[0];
			var oFilter = new sap.ui.model.Filter("SKU", sap.ui.model.FilterOperator.Contains, text);
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("productFilter"));
				//SoC
				// this.removeFromFilter(oFilter, this.getFilter("productFilterUC"));
				//EoC
			} else {
				this.removeFromFilter(oFilter, this.getFilter("productFilter"));
				//SoC
				// this.addToFilter(oFilter, this.getFilter("productFilterUC"));
				//EoC
			}
			this.setSeeAllVisibility("PRD");
			/*if (sap.ui.getCore().byId(this.currCbId + "Count").getText() === "0") {
			  if (this.getFilterStateFor("PRD", this.getView()).isAllChecked === true) {
			    this.isCustom = true;
			    this.getView().byId("_prod_SeeAllBtn").firePress();
			  }
			  return;
			}*/
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") {
			this.refreshModel("ALL");
			// }
		});
		},

		catSelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			this.currCbId = oEvent.getSource().getId();
			var text = oEvent.getSource().getText();
			var isSelected = oEvent.getSource().getSelected();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("category"));
			// for auto tick of filters
			this.source = null;
			this.filterSection = "CAT";
			
			
			var oFilter = new sap.ui.model.Filter("CategoryDesc", sap.ui.model.FilterOperator.Contains, text);
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("categoryFilter"));
				//SoC
				// this.removeFromFilter(oFilter, this.getFilter("categoryFilterUC"));
				//EoC
			} else {
				this.removeFromFilter(oFilter, this.getFilter("categoryFilter"));
				//SoC
				// this.addToFilter(oFilter, this.getFilter("categoryFilterUC"));
				//EoC
			}

			/* var oFilterVal=this.getFilterVal("PRD");
        var viewName=this.fetchViewName();
        var modelFor=null;
        if(viewName==="Dashboard"){
            modelFor="modelRoot";
        }
        else if(viewName==="PlanningAdvisor"){
            modelFor="modelPA";
        }
        else if(viewName==="DCL"){
            modelFor="modelDCL";
        }
	    if(this.dclModel && viewName==="DCL"){
		    this.createFilter(oFilterVal.field, oFilterVal.prefix, oFilterVal.context, oFilterVal[modelFor], oFilterVal.list, this[oFilterVal.evtHandler],this.getView(),this.getView().getController(),this.dclModel,true);
		}
		else{
		    this.createFilter(oFilterVal.field, oFilterVal.prefix, oFilterVal.context, oFilterVal[modelFor], oFilterVal.list, this[oFilterVal.evtHandler],this.getView(),this.getView().getController(),null,true);
		}

        this.checkFilters(["PRD"],modelFor);*/
			this.setSeeAllVisibility("CAT");
			this.refreshModel("ALL");
			/*if (sap.ui.getCore().byId(this.currCbId + "Count").getText() === "0") {
			  if (this.getFilterStateFor("CAT", this.getView()).isAllChecked === true) {
			    this.isCustom = true;
			    this.getView().byId("_cat_SeeAllBtn")
			      .firePress();
			  }
			  return;
			}*/
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") 
		});
		},

		polSelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
			var cb=oEvent.getSource();
			var isSelected = cb.getSelected();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("pol"));
			// for auto tick of filters
			this.source = null;
			
			var text=cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
			this.currCbId = cb.getId();
			this.filterSection = "POL";
// 			var text = oEvent.getSource().getText();
// 			text = text.split(" ")[0];
			var oFilter = new sap.ui.model.Filter("PortOfLoading",
				"EQ", text);
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("polFilter"));
				//SoC
				// this.removeFromFilter(oFilter, this.getFilter("polFilterUC"));
				//EoC
			} else {
				this.removeFromFilter(oFilter, this.getFilter("polFilter"));
				//SoC
				// this.addToFilter(oFilter, this.getFilter("polFilterUC"));
				//EoC
			}
			this.setSeeAllVisibility("POL");
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") {
			this.refreshModel("POL");
			// }
		});
		},

		poaSelect: function(oEvent) {
			$.sap.delayedCall(0,this,function(){
				this.getView().byId("filterBox").setBusyIndicatorDelay(10);
				this.getView().byId("filterBox").setBusy(true);
			});
				var cb=oEvent.getSource();
				var isSelected = cb.getSelected();
			$.sap.delayedCall(100,this,function(){
			// For GA Tagging
			this.trackGAEvent(this.EvtCat.FILTER, this.EvtAct.USE,
				this.oBundleEn.getText("poa"));
			// for auto tick of filters
			this.source = null;
		
			var text=cb.getModel().getProperty(cb.getBindingContext().getPath()+"/value");
			this.currCbId = cb.getId();
			this.filterSection = "POA";
// 			var text = oEvent.getSource().getText();
// 			text = text.split(" ")[0];
			var oFilter = new sap.ui.model.Filter("PortOfDischarge",
				"EQ", text);
			
			if (isSelected === true) {
				this.addToFilter(oFilter, this.getFilter("poaFilter"));
				// this.removeFromFilter(oFilter, this.getFilter("poaFilterUC"));
				//EoC
			} else {
				this.removeFromFilter(oFilter, this.getFilter("poaFilter"));
				//SoC
				// this.addToFilter(oFilter, this.getFilter("poaFilterUC"));
				//EoC
			}
			this.setSeeAllVisibility("POA");
			// if (sap.ui.getCore().byId(this.currCbId + "Count")
			// .getText() === "0") {
			// return;
			// }
			// if (sap.ui.getCore().byId(this.currCbId + "Count").getText() !== "0") {
			this.refreshModel("POA");
			// }
			});
		},

		setSeeAllVisibility: function(filterSection, isDCL) {
			var view = this.getView();
			var id = null,
				cbData = null;
			if (filterSection === "OC") {
				id = "_oc_SeeAllBtn";
			} else if (filterSection === "PA") {
				id = "_pa_SeeAllBtn";
			} else if (filterSection === "PF") {
				id = "_pf_SeeAllBtn";
			} else if (filterSection === "DDC") {
				id = "_dest_SeeAllBtn";
			} else if (filterSection === "PRD") {
				id = "_prod_SeeAllBtn";
			} else if (filterSection === "CAT") {
				id = "_cat_SeeAllBtn";
			} else if (filterSection === "POL") {
				id = "_pol_SeeAllBtn";
			} else if (filterSection === "POA") {
				id = "_poa_SeeAllBtn";
			} else if (filterSection === "ALL") {
				/*filterSection = ["PA", "PF", "OC", "DDC", "PRD", "CAT", "POL", "POA"];
				id = ["_pa_SeeAllBtn", "_pf_SeeAllBtn",
					"_oc_SeeAllBtn", "_dest_SeeAllBtn",
					"_prod_SeeAllBtn", "_cat_SeeAllBtn",
					"_pol_SeeAllBtn", "_poa_SeeAllBtn"
				];*/
				// 31Aug2016
				filterSection = ["PA", "PF", "OC", "DDC", "CAT", "POL", "POA"];
				id = ["_pa_SeeAllBtn", "_pf_SeeAllBtn","_oc_SeeAllBtn", "_dest_SeeAllBtn",
					 "_cat_SeeAllBtn","_pol_SeeAllBtn", "_poa_SeeAllBtn"
				];
				for (var i = 0; i < filterSection.length; i++) {
					if (isDCL && filterSection[i] === "DDC") {
						continue;
					}
					cbData = this.getFilterStateFor(filterSection[i], view);
					if (cbData.isAllChecked === true) {
						this.getView().byId(id[i]).setVisible(false);
					} else {
						this.getView().byId(id[i]).setVisible(true);
					}
				}
				return;
			} else {
				return;
			}
			cbData = this.getFilterStateFor(filterSection, view);
			if (cbData.isAllChecked === true) {
				this.getView().byId(id).setVisible(false);
			} else {
				this.getView().byId(id).setVisible(true);
			}
		},
		getNullFilterFlag: function() {
			return this.getModel("filterModel").getProperty("/nullFilterFlag");
		},
		setNullFilterFlag: function(bVal) {
			this.getModel("filterModel").setProperty("/nullFilterFlag", bVal);
		},
		adjustAllFilters: function(filterSection, allFilters,
			filterArr, isUC) {
			var flag = false,
				flagUC = false;
			var filterObj = [];
			var l = filterArr.length;
			for (var i = 0; i < l; i++) {
				if (filterArr[i].length > 0) {
					filterObj.push(new sap.ui.model.Filter({
						aFilters: filterArr[i],
						bAnd: false
					}));
				} else {
					if (isUC) {
						flagUC = true;
						this.nullFilterFlagUC = true;
					} else {
						flag = true;
						this.setNullFilterFlag(true);
					}

				}
			}
			if (flag === false && !isUC) {
				this.setNullFilterFlag(false);
			}
			if (flagUC === false && isUC) {
				this.nullFilterFlagUC = false;
			}
			if (filterObj.length > 0) {
				allFilters.aFilters = filterObj;
				allFilters.bAnd = !isUC;
			} else {
				allFilters.aFilters = [];
				allFilters.bAnd = false;
			}
			this.getView().getController().adjustAllFilter(filterSection);
			// if (filterSection !== "NONE") {
			//   this.showBusy(['filterBox', 'alignDonut', 'flagDonut','idProductsTable1','idProductsTable']);
			// }
		},
		calculateCounters: function(filterSection, dataModel, dataModelIn, source, fs) {
			var view = this.getView();
			var oController = view.getController();
			var d = new Date();
			$.sap.log.info("Start: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());
			var fArr = null;
				//fArrUC = null;
			if (source === "DCL") {
				fArr = [this.getFilter("priorityFilter"),
					this.getFilter("alignFilter"),
					// 31Aug2016
					// this.getFilter("productFilter"),
					this.getFilter("categoryFilter"),
					this.getFilter("countryFilter"),
					this.getFilter("polFilter"),
					this.getFilter("poaFilter")
				];
			/*	fArrUC = [this.getFilter("priorityFilterUC"),
					this.getFilter("alignFilterUC"),
					this.getFilter("productFilterUC"),
					this.getFilter("categoryFilterUC"),
					this.getFilter("countryFilterUC"),
					this.getFilter("polFilterUC"),
					this.getFilter("poaFilterUC")
				];*/
			} else {
				fArr = [this.getFilter("priorityFilter"),
					this.getFilter("alignFilter"),
					this.getFilter("destFilter"),
					// 31Aug2016
					// this.getFilter("productFilter"),
					this.getFilter("categoryFilter"),
					this.getFilter("countryFilter"),
					this.getFilter("polFilter"),
					this.getFilter("poaFilter")
				];
				/*fArrUC = [this.getFilter("priorityFilterUC"),
					this.getFilter("alignFilterUC"),
					this.getFilter("destFilterUC"),
					this.getFilter("productFilterUC"),
					this.getFilter("categoryFilterUC"),
					this.getFilter("countryFilterUC"),
					this.getFilter("polFilterUC"),
					this.getFilter("poaFilterUC")
				];*/
			}
			var filterSections = [{
				section: "PA",
				filterObj: this.getFilter("alignFilter")
				// filterObjUC: this.getFilter("alignFilterUC")
			}, {
				section: "PF",
				filterObj: this.getFilter("priorityFilter")
				// filterObjUC: this.getFilter("priorityFilterUC")
			}, {
				section: "OC",
				filterObj: this.getFilter("countryFilter")
				// filterObjUC: this.getFilter("countryFilterUC")
			}, {
				section: "DDC",
				filterObj: this.getFilter("destFilter")
				// filterObjUC: this.getFilter("destFilterUC")
			}, {
				section: "POL",
				filterObj: this.getFilter("polFilter")
				// filterObjUC: this.getFilter("polFilterUC")
			}, {
				section: "POA",
				filterObj: this.getFilter("poaFilter")
				// filterObjUC: this.getFilter("poaFilterUC")
			}, 
			// 31Aug2016
		/*	{
				section: "PRD",
				filterObj: this.getFilter("productFilter")
				// filterObjUC: this.getFilter("productFilterUC")
			}, */
			{
				section: "CAT",
				filterObj: this.getFilter("categoryFilter")
				// filterObjUC: this.getFilter("categoryFilterUC")
			}];
			/*, {
              section : "AT",
              filterObj : oController.atFilter
            } ];*/
			// for(var l=0;l<filterSection.length;l++){
			/*	var pos=0;
				if(filterSection!=="ALL"){
					for(var m=0;m<filterSections.length;m++){
						if(filterSections[m].section===filterSection){
							pos=m;
							break;
						}
					}
				}
				filterSections.splice(pos,1);*/
			// }
			for (var x = 0; x < filterSections.length; x++) {
				if (source === "DCL") {
					if (filterSections[x].section === "DDC") {
						continue;
					}
				} else {
					if (filterSections[x].section === "AT") {
						continue;
					}
				}
				var filterVal = this.getFilterVal(filterSections[x].section);
				//var oModel = new sap.ui.model.json.JSONModel(dataModel.oData);
				var oBinding = dataModel.bindList("/ProductCollection");
				var oBindingIn = dataModelIn.bindList("/ProductCollection");
				// var oBindingOut = dataModelOut.bindList("/ProductCollection");
				var cbArr = null,
					i = 0,
					cb = null,
					oFilter = null,
					len = 0,
					lenInitial = 0,
					lenBefore = 0,
					lenAfter = 0,
					lenCurrent = 0,
					currFS = null;
				cbArr = fs[x].data;

				var field = filterVal.field;
				var op = sap.ui.model.FilterOperator.EQ;
				if (filterSections[x].section === "PRD") {
					field = "SKU";
					op = sap.ui.model.FilterOperator.Contains;
				} else if (filterSections[x].section === "CAT") {
					field = "CategoryDesc";
					op = sap.ui.model.FilterOperator.Contains;
				}
				for (i = 0; i < cbArr.length; i++) {
					cb = view.byId(cbArr[i].cbId);
					oFilter = new sap.ui.model.Filter(field, op, cb.getModel().getProperty(
						"/" + filterVal.context + "/" + i + "/value"));
					// Added for Grayed Out Issue
					len = 0;
					// lenBefore = cb.getModel().getProperty("/" + filterVal.context + "/" + i + "/Count");
					currFS = cb.getModel().getProperty(cb.getBindingContext().getPath() + "/section");
					lenInitial = cb.getModel().getProperty(cb.getBindingContext().getPath() + "/Count");
					lenCurrent = cb.getModel().getProperty(cb.getBindingContext().getPath() + "/CurrCount");
					lenAfter = 0;
					if (cb.getSelected() === false) {
						/*lenBefore = oBinding.filter(
								oController.allFilters)
								.getLength();
							this.addToFilter(oFilter,
								filterSections[x].filterObj);
							oController.adjustAllFilters("NONE",
								oController.allFilters, fArr);*/
						lenBefore = oBindingIn.getLength();
						this.addToFilter(oFilter, filterSections[x].filterObj);
						this.adjustAllFilters("NONE", this.getFilter("allFilters"), fArr);
						lenAfter = oBinding.filter(this.getFilter("allFilters")).getLength();
						this.removeFromFilter(oFilter, filterSections[x].filterObj);
						//  var oFilterUC=new Filter({aFilters:[this.allFilters,oFilter],bAnd:true});

						// lenAfter = oBindingOut.filter(oFilterUC).getLength();
						// lenAfter = oBindingOut.filter(oFilter).getLength();
						// Added for test
						if (fs[x].isAllUnchecked === true && this.filterSection === currFS) {
							len = lenInitial;
						} else {
							// if(currFS===filterSection){
							// 	len = lenCurrent;
							// }
							// else{
							len = lenAfter - lenBefore;
							// }

						}
						if (fs[x].isAllUnchecked === true && this.filterSection !== currFS) {
							len = lenAfter;
						}
						if (fs[x].isAllUnchecked === true && this.source !== null && filterSections[x].filterObj.length > 1) {
							len = lenBefore - lenAfter;
						}
						this.removeFromFilter(oFilter, filterSections[x].filterObj);
						this.adjustAllFilters("NONE", this.getFilter("allFilters"), fArr);

						if (len < 0) {
							len = len + oBinding.filter(null).getLength();
						}
					} else {
						len = oBinding.filter(new sap.ui.model.Filter({
							aFilters: [
								this.getFilter("allFilters"),
								oFilter
							],
							bAnd: true
						})).getLength();
					}

					/*	this.removeFromFilter(oFilter,
							filterSections[x].filterObj);
						oController.adjustAllFilters("NONE",
							oController.allFilters, fArr);

						if (len < 0) {
							len = len + oBinding.filter(null)
								.getLength();
						}*/
					/*} else {
						// var oFilterC=new Filter({aFilters:[this.allFilters,oFilter],bAnd:true});
						len = oBindingIn.filter(oFilter).getLength();
					}*/
					this.setCurrCountForCB(view.byId(cbArr[i].cbId), filterSections[x].section, len);
					//	view.byId(cbArr[i].cbId + "Count").setText(len);
					if (oController.source === "PA" || oController.source === "PF") {
						// For auto tick in filters
						if (len !== 0 && ((filterSections[x].section !== "PA" && filterSections[x].section !== "PF") || (oController.source === "PA" &&
								filterSections[x].section === "PF") || (oController.source === "PF" && filterSections[x].section === "PA"))) {
							cb.setSelected(true);
							this.addToFilter(oFilter, filterSections[x].filterObj);
				// 			this.removeFromFilter(oFilter, filterSections[x].filterObjUC);
							// this.adjustAllFilters("NONE",this.allFilters,fArr);
						} else if (len === 0 && ((filterSections[x].section !== "PA" && filterSections[x].section !== "PF") || (oController.source ===
								"PA" &&
								filterSections[x].section === "PF") || (oController.source === "PF" && filterSections[x].section === "PA"))) {
							cb.setSelected(false);
				// 			this.addToFilter(oFilter, filterSections[x].filterObjUC);
							this.removeFromFilter(oFilter, filterSections[x].filterObj);
							// this.adjustAllFilters("NONE",this.allFilters,fArr);
						}
					}

				}
				this.adjustAllFilters("NONE", this.getFilter("allFilters"), fArr);
				// this.adjustAllFilters("NONE", this.getFilter("allFiltersUC"), fArrUC, true);
			}
			if(source==="DP"){
				this.getView().byId("alignDonut").refreshDonutChartCust();
        		this.getView().byId("flagDonut").refreshDonutChartCust();
			}
			this.hideBusy();
			d = new Date();
			$.sap.log.info("Stop: " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds());

		},
		setCurrCountForCB: function(cb, filterSection, count) {
		    var viewName=this.fetchViewName();
			var filterVal = this.getFilterVal(filterSection);
			var modelRoot = this.getModel(filterVal.modelRoot);
			var modelPA = this.getModel(filterVal.modelPA);
			var modelDCL = this.getModel(filterVal.modelDCL);
			// var modelPath = cb.getBindingContext().getPath();
			// 		if(count===0 && filterSection==="PRD"){
			// 		    $("#"+cb.getParent().getId()).addClass("invisible");
			// 		}
			// 		else if(count>0 && filterSection==="PRD"){
			// 		    $("#"+cb.getParent().getId()).removeClass("invisible");
			// 		}
			var countPath = cb.getBindingContext().getPath() + "/CurrCount";
			if (modelRoot && viewName==="Dashboard") {
				modelRoot.setProperty(countPath, count);
			}
			if (modelPA  && viewName==="PlanningAdvisor") {
				modelPA.setProperty(countPath, count);
			}
			if (modelDCL && viewName==="DCL") {
				modelDCL.setProperty(countPath, count);
			}

		},
		getFilter: function(filterVar) {
			return this.getModel("filterModel").getProperty("/" + filterVar);
		},
		setFilter: function(filterVar, filterVal) {
			return this.getModel("filterModel").setProperty("/" + filterVar, filterVal);
		},
		setCustomHashChange: function(bVal) {
			this.getModel("appProperties").setProperty("/isCustomHashChange", bVal);
		},
		getCustomHashChange: function() {
			return this.getModel("appProperties").getProperty("/isCustomHashChange");
		},
		setHash: function(route) {
			var oController = this.getView().getController();
			var oHistory = History.getInstance();
			var oHashChanger = HashChanger.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			var direction = this.getModel("appProperties").getProperty("/direction");
			var type = this.getModel("appProperties").getProperty("/type");
			var fD = this.getModel("appProperties").getProperty("/fD");
			var tD = this.getModel("appProperties").getProperty("/tD");
			var mktOrCC = this.getModel("appProperties").getProperty("/mktOrCC");
			var hash = route + "/" + direction + "/" + type + "/" + fD + "/" + tD + "/" + mktOrCC;
			if (typeof sPreviousHash === "undefined" || !this.getCustomHashChange()) {
				//   this.isCustomHashChange = true;
				//this.getRouter().stop();
				oHashChanger.setHash(hash);

				//this.getRouter().initialize();
			}
			// oController.isLocalRefresh = false;
			if (this.getDateSelectionDialog()) {
				this.getDateSelectionDialog().close();
			}
		},
		fetchViewName: function() {
			var view = this.getView();
			var viewName = view.getViewName().split(".").pop();
			if (viewName === "Root") {
				viewName = "Dashboard";
			} else if (viewName === "RouteDetail") {
				viewName = "PlanningAdvisor";
			} else if (viewName === "DistCenterLoad") {
				viewName = "DCL";
			}
			return viewName;
		},
		typeSelect: function(oEvent) {
			var isSelected = oEvent.getParameter("selected");
			if (isSelected) {
				this.getModel("appProperties").setProperty("/type", "Arrival");
				this.updateTypeCookie("Arrival");
			} else {
				this.getModel("appProperties").setProperty("/type", "Departure");
				this.updateTypeCookie("Departure");
			}
		},
		getFilters: function() {
			/*filters.destFilter= [];
	      filters.catFilter= [];
	      filters.categoryFilter=[];
	      filters.polFilter= [];
	      filters.poaFilter= [];
	      filters.prdFilter= [];
	      filters.productFilter=[];
	      filters.allFilters= new sap.ui.model.Filter({
	        aFilters: []
	      });
	      filters.alignFilter= [];
	      filters.priorityFilter= [];
	      filters.countryFilter= [];
	      filters.destFilterUC= [];
	      filters.catFilterUC= [];
	      filters.categoryFilterUC=[];
	      filters.polFilterUC= [];
	      filters.poaFilterUC= [];
	      filters.prdFilterUC= [];
	      filters.productFilterUC=[];
	      filters.allFiltersUC= new sap.ui.model.Filter({
	        aFilters: []
	      });
	      filters.alignFilterUC= [];
	      filters.priorityFilterUC= [];
	      filters.countryFilterUC= [];
	      filters.nullFilterFlag=false;*/
		},
		getFragmentsPath:function(){
		    var metadata=this.getOwnerComponent().getMetadata();
		    var rootView=metadata.getRootView().viewName.split(".");
		    rootView.pop();
		    return rootView.join(".");
		}
	});

});