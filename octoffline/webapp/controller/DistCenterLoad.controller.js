sap.ui.define([
	"glb/gtmh/oct/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"glb/gtmh/oct/controls/StackedBarCust",
	"glb/gtmh/oct/util/Utility",
	"sap/ui/core/routing/History"
], function(BaseController, JSONModel, MessageBox, Filter, StackedBarCust, Utility, History) {
	"use strict";
	return BaseController.extend("glb.gtmh.oct.controller.DistCenterLoad", {
      
      /**
       * Called when a controller is instantiated and its View
       * controls (if available) are already created. Can be used
       * to modify the View before it is displayed, to bind event
       * handlers and do other one-time initialization.
       *
       * @memberOf view.DistCenterLoad
       */
      onInit: function() {
        BaseController.prototype.onInit.call(this);
	    this.initializeVariables();
        this.oBundle = this.getResourceBundle();
        this.oLoadFinishedDef = this.getLoadFinishedDefObj();
        var bus = this.getEventBus();
        // bus.subscribe("dcl", "load", this._loadData, this);
        bus.subscribe("dcl", "preventExecution", this._preventExecution, this);
        bus.subscribe("all", "prepareScreen", this._prepareScreen, this);
        bus.subscribe("dcl", "reset", this._resetdcl, this);
        // bus.subscribe("root", "loadData", this._loadData,this);
        bus.subscribe("all", "showOverlay", this.showOverlay, this);
        bus.subscribe("root", "localRefresh", this._localRefresh, this);
        // bus.subscribe("dcl", "navTo", this._navToDcl, this);
        var view = this.getView();
        view.byId("dcLoadChart").setWidth((this.daysWidth * 21 + 50) + "px");
        view.byId("dcLoadDetails").setWidth((this.daysWidth * 21 + 50) + "px");

        //Added for custom control
        this._oDclChart = new StackedBarCust(view.createId('dclChart'), {
          dayWidth: this.daysWidth,
          onBarClick: jQuery.proxy(function(oEvent) {
            var d = oEvent.getParameter("data");
            this.refreshTableModel(d);
          }, this)
        });
        view.byId("dcLoadChart").addContent(this._oDclChart);

        //End of custom control addition
        // Added for Search

        view.byId("search").setFilterFunction(
          function(sTerm, oItem) {
            // A case-insensitive 'string contains'
            // style filter
            return oItem.getText().match(
              new RegExp(sTerm, "i"));
          });
        var btnId = this.getView().byId("searchBtn").getId();
        view.byId("search").onsapenter = function(e) {
          if (sap.m.InputBase.prototype.onsapenter) {
            sap.m.InputBase.prototype.onsapenter.apply(
              this, arguments);
          }
          sap.ui.getCore().byId(btnId).firePress();
        };
        // End
        this.router = sap.ui.core.UIComponent.getRouterFor(this);
        // this.router.attachRoutePatternMatched(this._handleRouteMatched, this);
        
         $.when(this.getOwnerComponent().oUsrLoadFinishedDef).then($.proxy(function(){
        		this.setUserModels();
        	},this));
      },
      _preventExecution: function(sChannelId, oEvent, data) {
        this.setCustomHashChange(true);
      },
      _localRefresh: function(sChannelId, oEvent, data) {
        if(data.isLocal){
      		this.getView().byId("refreshIcon").firePress();
      	}
      	else{
      		this.initiateMainServiceCall(false,"DCL");
      	}
      },
      _prepareScreen: function(sChannel, event, data) {
      	
    	this.setMarket();
    	// this.setFilters();
    	// this.oFilterLoadFinished=$.Deferred();
    	if(data.src==="DCL"){
    	    this.setDestinationDCLFilter();
    	    var gDt = this.getGraphDates(this.dclModel.getProperty("/ProductCollection"));
            var rowModel = this.getRowModel(this.dclModel.getProperty("/ProductCollection"), gDt.min, gDt.max);
            this.dcLoadModel = rowModel;
	    	if(data.isSelectAll){
	    		this.generateDynamicFilters(this.getAllFilterSections(),"modelDCL",true,true,this.dclModel);
	    		
	    	}
	    	else{
	    		this.generateDynamicFilters(this.getAllFilterSections(),"modelDCL",true,false,this.dclModel);
	    	}
	    	this.setSearchBoxModel(this.getModel("filterPC"), "DCL");
	    
    	}
    	/*$.when(this.oFilterLoadFinished).then($.proxy(function(){
    		this.refreshModel("ALL");
    		this.setSeeAllVisibility("ALL");
    	},this));*/
      },
      getAllFilterSections:function(){
      	// return ["PA","PF","OC","PRD","CAT","POL","POA"];
      	// 31Aug2016
      	return ["PA","PF","OC","CAT","POL","POA"];
      },
        onRouteMatched: function(oEvent) {
      	var name = oEvent.getParameter("name");
        document.title = this.setDocTitle(name);
        if (name !== "DistributionCenterLoad" && name !== "DistributionCenterLoadP") {
          if (this.getDateSelectionDialog()) {
            if (this.getDateSelectionDialog().isOpen()) {
              this.onCloseDialog();
            }
          }
        } else {
        	 if (this.getCustomHashChange() === true) {
	        	this.setCustomHashChange(false);
	          return;
	        }
          var locArr = window.location.href.split("#");
          var path = "";
          if (locArr.length > 1) {
            path = "#" + locArr[1];
          }
          var title = this.DCL;
          this.trackGAScreenEvent(path, title);
          
          //New logic
          if(name==="DistributionCenterLoadP"){
            // this.adjustDestFilter();
          	if(this.getModel("filterPC")){
          		var isValid = this.isValidParameters(oEvent.getParameters().arguments);
          		if(isValid){
          			this.getModel("appProperties").setProperty("/isDCLBusy",true);
          			this.showBusy(['filterBox', 'dcLoadChart', 'dcLoadDetails']);
          			this.urlParams = oEvent.getParameters().arguments;
                	var bParamModelChanged = this.isParamModelChanged(this.urlParams);
                	if (bParamModelChanged === false) {
                		// 31Aug2016
		                // $.sap.delayedCall(1000, this, function () {
		                $.sap.delayedCall(0, this, function () {
		                	var oHistory = History.getInstance();
        					var sPreviousHash = oHistory.getPreviousHash();
		              //  	if(sPreviousHash.indexOf("ContainerDetail")!==-1){
		                    if(this.getModel("appProperties").getProperty("/isDCLLoaded")===false){
		                		if(typeof sPreviousHash==="undefined" || sPreviousHash.indexOf("ContainerDetail")!==-1){
		                            this.initiateMainServiceCall(true,"DCL",true);
		                        }
		                        else {
		                            this.initiateMainServiceCall(false,"DCL",false);
		                        }
		                	}
		                	else{
		                		this.initiateMainServiceCall(false,"DCL");
		                	}
		                    
		                });
                	}
                	else{
                		// $.sap.delayedCall(1000, this, function () {
                		// 31Aug2016
                		$.sap.delayedCall(0, this, function () {
		                    this.initiateMainServiceCall(true,"DCL",true);
		                });
                	}
          		}
          		else{
          			this.getRouter().navTo("Error",null,true);
          			return;
          		}
          	}
          	else{
          		this.showBusy(['filterBox', 'dcLoadChart', 'dcLoadDetails']);
          		this.urlParams=oEvent.getParameters().arguments;
          		// $.sap.delayedCall(1000, this, function () {
          		// 31Aug2016
          		$.sap.delayedCall(0, this, function () {
		            this.initiateMainServiceCall(true,"DCL",true);
		        });
          	}
          }
          else if(name==="DistributionCenterLoad"){
          	this.getModel("appProperties").setProperty("/isDCLBusy",true);
          	this.setDefaultModels();
          	this.showBusy(['filterBox', 'dcLoadChart', 'dcLoadDetails']);
          	this.urlParams=null;
          	this.updateParamModel();
          	this.setCustomHashChange(false);
          	this.setHash("DistributionCenterLoad");
      //    	$.sap.delayedCall(1000, this, function () {
		    //         this.initiateMainServiceCall(true,"Dashboard");
		    // });
          }
        }
        },
      _resetdcl: function(sChannelId, oEvent, data) {
        this.tblPageCount = 0;
        this.marginLeft = -30;
       /* this.priorityFilter = [];
        this.alignFilter = [];
        this.countryFilter = [];
        this.destFilter = [];
        this.prdFilter = [];
        this.catFilter = [];
        this.poaFilter = [];
        this.polFilter = [];
        this.atFilter = [];
        this.allFilters.aFilters = [];
        this.allFilters.bAnd = false;*/
        this.searchFilter = [];
        this.currCbId = null;
        /*this.setFilters();*/
        this.getView().byId("filterBox").setVisible(true);
      },

      /*handleDateRangePress: function(oEvent) {
        var view = this.getView();
        this.oFilterLoadFinishedDeferred = jQuery.Deferred();
        var fType = null;
        var fromDate = null;
        var toDate = null;
        var oDateRangeModel = new sap.ui.model.json.JSONModel();
        oDateRangeModel.setData(this.getOwnerComponent()
          .getModel("dateRangeModel").oData);
        fromDate = oDateRangeModel.getProperty("/min");
        toDate = oDateRangeModel.getProperty("/max");
        if (oDateRangeModel.getProperty("/rA") === true) {
          fType = this.oBundle.getText("arrBet");
        } else {
          fType = this.oBundle.getText("depBet");
        }
        if (!this.isValidDateRange(fromDate, toDate)) {
          view.byId("search").setModel(null);
          return;
        }
        if (!this.firstTime) {
          var fDate = Utility.formatDate(fromDate, null,
            "dd/MM/yyyy");
          var tDate = Utility.formatDate(toDate, null,
            "dd/MM/yyyy");
          var evtLabel = fDate + "_" + tDate;
          if (this.isCustomDateChangeEvent === false) {
            // For GA Tagging
            this.trackGAEvent(this.EvtCat.DATE,
              this.EvtAct.CHANGE, evtLabel);
          }
        }
        this.oLoadFinishedDef = jQuery.Deferred();
        if (this.isLocalRefresh) {
          this.oLoadFinishedDef.resolve();
        } else {
          this.getODataModel(fromDate, toDate);
        }
        this.waitForLoad(function() {
          var filterItems = [];
          var model = this.getOwnerComponent().getModel("LocalModel");
          var calcModel = new sap.ui.model.json.JSONModel(
            model.oData);
            calcModel.setSizeLimit(99999);
          var oBindingforCalc = calcModel
            .bindList("/ProductCollection");
          $.sap.log.info(oBindingforCalc);
          if (typeof this.getOwnerComponent().getModel("filterPC") === 'undefined') {
            var filterPCModel = new sap.ui.model.json.JSONModel();
            filterPCModel.setSizeLimit(99999);
            filterPCModel.setData({
              ProductCollection: []
            });
            this.getOwnerComponent().setModel(filterPCModel, "filterPC");
          }
          if (oBindingforCalc.getLength() === 0) {
            this.getOwnerComponent().getModel("filterPC").setProperty("/ProductCollection", []);
            // sap.m.MessageBox.alert(this.oBundle
            //             .getText("noDataInDtRange"), {
            //           styleClass : "sapUiSizeCompact",
            //           icon : sap.m.MessageBox.Icon.ERROR,
            //           title : this.oBundle.getText("errNoData")
            //         });
          } else {
            // For SORTING
            var oSorter = new sap.ui.model.Sorter("UDelDate");
            oBindingforCalc.sort(oSorter, true);
            var contexts = oBindingforCalc.getContexts(0, oBindingforCalc.getLength());
            for (var i = 0; i < oBindingforCalc.getLength(); i++) {
              var item = calcModel
                .getProperty(contexts[i].sPath);
              filterItems.push(item);
            }
          }
          var filterPC = new sap.ui.model.json.JSONModel();
          filterPC.setSizeLimit(99999);
          filterPC.setData({
            "ProductCollection": filterItems
          });
          this.getOwnerComponent().setModel(filterPC,
            "filterPC");
          var bus = this.getEventBus();
          if (oBindingforCalc.getLength() === 0) {
            this._resetdcl();
          }
          bus.publish("dcl", "navTo", {
            src: "Direct"
          });
          $.sap.delayedCall(500,this,function(){this.getEventBus().publish("root","navTo",{src:"DCL"});});
        });
        oDateRangeModel.setProperty("/min", fromDate);
        oDateRangeModel.setProperty("/max", toDate);
        this.updateDateCookie(fromDate, toDate);
        this.getOwnerComponent().setModel(oDateRangeModel,
          "dateRangeModel");

        // Added for router
        $.sap.require("sap.ui.core.routing.HashChanger");
        var oHashChanger = sap.ui.core.routing.HashChanger
          .getInstance();
        var type = null;
        var direction = this.getOwnerComponent().getModel(
          "oMktModel").getProperty("/direction");
          var companyCode = this.getOwnerComponent().getModel(
          "oMktModel").getProperty("/mkt");
        if (oDateRangeModel.getProperty("/rA") === true) {
          type = "Arrival";
        } else {
          type = "Departure";
        }
        var paramModel = new sap.ui.model.json.JSONModel();
        paramModel.setData({
          direction: direction,
          type: type,
          fromDate: fromDate,
          toDate: toDate,
          companyCode: companyCode
        });
        this.getOwnerComponent().setModel(paramModel,
          "paramModel");
        var hash = "DistributionCenterLoad/" + direction + "/" + type + "/" + fromDate + "/" + toDate + "/" + companyCode;

        if (!this.isLocalRefresh) {
          this.isCustomHashChange = true;
          oHashChanger.setHash(hash);
        }
        this.isLocalRefresh = false;
        // End
        if (this.getDateSelectionDialog()) {
          this.getDateSelectionDialog().close();
        }

        view.byId("filterType").setText(fType);
        var dtRangeText = Utility.dateConvert(fromDate,
          "yyyyMMdd") + " - " + Utility.dateConvert(toDate, "yyyyMMdd");
        view.byId("dateRangeText").setText(dtRangeText);
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
        this.firstTime = false;
      },*/

      /**
       * Similar to onAfterRendering, but this hook is invoked
       * before the controller's View is re-rendered (NOT before
       * the first rendering! onInit() is used for that one!).
       *
       * @memberOf view.DistCenterLoad
       */
      // onBeforeRendering: function() {
      //
      // },

      onAfterListRendering: function(pList) {

        var layout = pList.getParent();
        var layoutDom = document.getElementById(layout.getId());
        var link = this.getView().byId(layoutDom.parentNode.nextSibling.firstChild.id);
        var num = pList.getItems().length;
        /*var num=0;
        for(var i=0;i<count;i++){
            if(!$("#"+pList.getItems()[i].getId()).hasClass("invisible")){
               num+=1; 
            }
        }*/
        var height = null;
        if (num < 11) {
          height = (num) * 1.1;
          link.addStyleClass("invisible");
        } else {
          height = this.moreThreshold * 1.1;
          link.removeStyleClass("invisible");
        }
        $("#" + layout.getId()).css("height", height + "rem");
      },
      /**
       * Called when the View has been rendered (so its HTML is
       * part of the document). Post-rendering manipulations of
       * the HTML could be done here. This hook is the same one
       * that SAPUI5 controls get after being rendered.
       *
       * @memberOf view.DistCenterLoad
       */
      onAfterRendering: function() {
        var view = this.getView();
        var allList = ["originCountryList", "productList",
          "categoryList", "polList", "poaList"
        ];
        view.byId(allList[0]).addEventDelegate({
          onAfterRendering: jQuery.proxy(function() {
            this.onAfterListRendering(view.byId(allList[0]));
          }, this)
        }, this);
        view.byId(allList[1]).addEventDelegate({
          onAfterRendering: jQuery.proxy(function() {
            this.onAfterListRendering(view.byId(allList[1]));
          }, this)
        }, this);
        view.byId(allList[2]).addEventDelegate({
          onAfterRendering: jQuery.proxy(function() {
            this.onAfterListRendering(view.byId(allList[2]));
          }, this)
        }, this);
        view.byId(allList[3]).addEventDelegate({
          onAfterRendering: jQuery.proxy(function() {
            this.onAfterListRendering(view.byId(allList[3]));
          }, this)
        }, this);
        view.byId(allList[4]).addEventDelegate({
          onAfterRendering: jQuery.proxy(function() {
            this.onAfterListRendering(view.byId(allList[4]));
          }, this)
        }, this);

      },

      handleMoreLinkPress: function(oEvent) {
        var view = this.getView();
        var allListVid = ["originCountryLayout", "prodLayout", "categoryLayout", "polLayout", "poaLayout"];
        var linkMoreId = ["idLinkMoreOC", "idLinkMorePD", "idLinkMoreCL", "idLinkMorePOL", "idLinkMorePOA"];
        var allList = ["originCountryList", "productList",
          "categoryList", "polList", "poaList"
        ];
        var id = oEvent.getSource().getId();
        var text = oEvent.getSource().getText();
        for (var i = 0; i < linkMoreId.length; i++) {
          if (view.byId(linkMoreId[i]).getId() === id) {
            if (text === this.getResourceBundle().getText("more")) {
              $("#" + view.byId(allListVid[i]).getId()).css("height", "auto");
              oEvent.getSource().setText(this.getResourceBundle().getText("less"));
            } else {
              view.byId(allList[i]).rerender();
              oEvent.getSource().setText(this.getResourceBundle().getText("more"));
            }
          }
        }

      },
      /**
       * Called when the Controller is destroyed. Use this one to
       * free resources and finalize activities.
       *
       * @memberOf view.DistCenterLoad
       */
      // onExit: function() {
      //
      // }
      _loadData: function(sChannel, oEvent, data) {
        if (this.urlParams) {
          var isValid = this
            .isValidParameters(this.urlParams);
          if (isValid === false) {
            this.oDefaultLoadFinishedDef = jQuery.Deferred();
            this.setDefaultModels();
          } else {
            this.updateParamModel();
          }
        } else {
          this.oDefaultLoadFinishedDef = jQuery.Deferred();
          this.setDefaultModels();
        }
        this.setUserModels();
        this.isCustomDateChangeEvent = true;
        this.handleDateRangePress();
        this.isCustomDateChangeEvent = false;
        if (typeof data !== 'undefined' && data.src === 'Component') {
          this.getEventBus().publish("root", "showOverlay");
        }
        if (this.firstTime) {
          this.firstTime = false;
        }
      },

      _navToDcl: function(sChannelId, oEvent, data) {
        this.oLoadFinishedDeferred = jQuery.Deferred();
        this.oFilterLoadFinishedDeferred = jQuery.Deferred();
        this.source = data.src;
        var view = this.getView();
        var oMktModel=this.getOwnerComponent().getModel("oMktModel");
        this.oFilterAdjustedDeferred = jQuery.Deferred();
        if (typeof view.byId("marketList").getModel() === 'undefined') {
          view.byId("marketList").setModel(this.getOwnerComponent().getModel("marketListModel"));
        }
        view.byId("marketList").setSelectedKey(
          oMktModel.getProperty("/key"));

        this.setSearchBoxModel(this.getOwnerComponent()
          .getModel("filterPC"), "DP");
        view.byId("search").setModel(
          this.getOwnerComponent().getModel(
            "searchBoxModel"));
        var datamodel = this.getOwnerComponent().getModel(
          "dtRangeTextmodel").oData;
        view.byId("filterType").setText(datamodel.arrivalbet);
        view.byId("dateRangeText").setText(
          datamodel.dtRangeText);
        this.setDestinationDCLFilter();
        this.waitForLoadFinished(function() {
          var filterPA = this.getFilterVal("PA");
          var filterPF = this.getFilterVal("PF");
          var filterOC = this.getFilterVal("OC");
          var filterCAT = this.getFilterVal("CAT");
          //31Aug2016
          //var filterPRD = this.getFilterVal("PRD");
          var filterPOL = this.getFilterVal("POL");
          var filterPOA = this.getFilterVal("POA");
          //  var filterAT = this.getFilterVal("AT");
          this.createFilter(filterCAT.field,
            filterCAT.prefix, filterCAT.context,
            filterCAT.modelDCL, filterCAT.list,
            this.categorySelect, view, this,
            this.dclModel);
            //31Aug2016
          /*this.createFilter(filterPRD.field,
            filterPRD.prefix, filterPRD.context,
            filterPRD.modelDCL, filterPRD.list,
            this.productSelect, view, this,
            this.dclModel);*/
          this.createFilter(filterPA.field, filterPA.prefix,
            filterPA.context, filterPA.modelDCL,
            filterPA.list, this.alignSelect, view,
            this, this.dclModel);
          this.createFilter(filterPF.field, filterPF.prefix,
            filterPF.context, filterPF.modelDCL,
            filterPF.list, this.prioritySelect, view,
            this, this.dclModel);
          this.createFilter(filterOC.field, filterOC.prefix,
            filterOC.context, filterOC.modelDCL,
            filterOC.list, this.countrySelect, view,
            this, this.dclModel);
          this.createFilter(filterPOL.field,
            filterPOL.prefix, filterPOL.context,
            filterPOL.modelDCL, filterPOL.list,
            this.polSelect, view, this, this.dclModel);
          this.createFilter(filterPOA.field,
            filterPOA.prefix, filterPOA.context,
            filterPOA.modelDCL, filterPOA.list,
            this.poaSelect, view, this, this.dclModel);
        });

        var oModel = new sap.ui.model.json.JSONModel(this
          .getOwnerComponent().getModel("filterPC"));
         oModel.setSizeLimit(99999);
        var model = oModel
          .getProperty("/oData/ProductCollection");
        //Change for Wave 4 - DCL View - 29-Sep-2015
        var gDt = this.getGraphDates(model);
        var rowModel = this
          .getRowModel(model, gDt.min, gDt.max);
        //End of Change

        this.dcLoadModel = rowModel;
        this.waitForFilterLoad(function() {
        //31Aug2016
          //var filterSections = ["AF", "PF", "CF", "PRDF","CATF", "POLF", "POAF"]; //, "ATF" ];
          var filterSections = ["AF", "PF", "CF","CATF", "POLF", "POAF"]; //, "ATF" ];
          this.selectAllFilters(filterSections, false);
          //31Aug2016
          //this.isCustom = true;
          //this.getView().byId("_prod_SeeAllBtn").firePress();
          this.setFilters();
          this.refreshModel("ALL");
        });
        this.waitForFilterAdjust(function() {
          this.generateDCLChartModel(rowModel, null);
          this.setDCLChartModel();
        });
        if (this.firstTime === true) {
          this.firstTime = false;
        }
      },

      waitForFilterLoad: function(fnToExecute) {
        jQuery.when(this.oFilterLoadFinishedDeferred).then(
          jQuery.proxy(fnToExecute, this));
      },

      waitForFilterAdjust: function(fnToExecute) {
        jQuery.when(this.oFilterAdjustedDeferred).then(
          jQuery.proxy(fnToExecute, this));
      },
      waitForLoadFinished: function(fnToExecute) {
        jQuery.when(this.oLoadFinishedDeferred).then(
          jQuery.proxy(fnToExecute, this));
      },

      toPlanAdvisor: function() {
        if (this.getOwnerComponent().getModel("filterPC")) {
          if (this.getOwnerComponent().getModel("filterPC").getProperty("/ProductCollection").length > 0) {
            // //Added for router
            var paramModel = this.getOwnerComponent().getModel("paramModel");
            // End
            this.setCustomHashChange(false);
            this.setFilterLoadDefObj();
            this.getRouter().navTo("PlanningAdvisorP", {
              direction: paramModel
                .getProperty("/direction"),
              type: paramModel.getProperty("/type"),
              fromDate: paramModel.getProperty("/fromDate"),
              toDate: paramModel.getProperty("/toDate"),
              companyCode:paramModel.getProperty("/companyCode")
            }, false);
            $.sap.delayedCall(0, this, function () {
              this.getEventBus().publish("filters", "reset");
              this.getEventBus().publish("container", "filter", {
                src: "Link"
              });
            });
          } else {
            sap.m.MessageBox.alert(this.oBundle
              .getText("noDataInDtRange"), {
                styleClass: "sapUiSizeCompact",
                icon: sap.m.MessageBox.Icon.ERROR,
                title: this.oBundle.getText("errNoData")
              });
          }
        } else {
          sap.m.MessageBox.alert(this.oBundle
            .getText("noDataInDtRange"), {
              styleClass: "sapUiSizeCompact",
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.oBundle.getText("errNoData")
            });
        }
      },

      toDashboard: function(oEvent) {
        var btnId = oEvent.getSource().getId();
        var paramModel = this.getOwnerComponent().getModel("paramModel");
        if (btnId === this.getView().byId("dashboardBtn").getId()) {
               if (this.getOwnerComponent().getModel("filterPC")) {
          if (this.getOwnerComponent().getModel("filterPC").getProperty("/ProductCollection").length > 0) {
        // var oHistory = History.getInstance();
        // var sPreviousHash = oHistory.getPreviousHash();
        this.getRouter().navTo("DashboardP", {
            direction: paramModel.getProperty("/direction"),
            type: paramModel.getProperty("/type"),
            fromDate: paramModel.getProperty("/fromDate"),
            toDate: paramModel.getProperty("/toDate"),
            companyCode: paramModel.getProperty("/companyCode")
          }, false);
          } else {
            sap.m.MessageBox.alert(this.oBundle
              .getText("noDataInDtRange"), {
                styleClass: "sapUiSizeCompact",
                icon: sap.m.MessageBox.Icon.ERROR,
                title: this.oBundle.getText("errNoData")
              });
          }
        } else {
          sap.m.MessageBox.alert(this.oBundle
            .getText("noDataInDtRange"), {
              styleClass: "sapUiSizeCompact",
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.oBundle.getText("errNoData")
            });
        }
          }
          /*if (this.getOwnerComponent().getModel("LocalModel")) {
            if (this.getOwnerComponent().getModel("LocalModel").oData.ProductCollection.length > 0) {
              this.router.navTo("DashboardP", {
                direction: paramModel
                  .getProperty("/direction"),
                type: paramModel.getProperty("/type"),
                fromDate: paramModel.getProperty("/fromDate"),
                toDate: paramModel.getProperty("/toDate"),
                companyCode:paramModel.getProperty("/companyCode")
              }, false);
            } else {
              sap.m.MessageBox.alert(this.oBundle
                .getText("noDataInDtRange"), {
                  styleClass: "sapUiSizeCompact",
                  icon: sap.m.MessageBox.Icon.ERROR,
                  title: this.oBundle.getText("errNoData")
                });
            }
          } else {
            sap.m.MessageBox.alert(this.oBundle
              .getText("noDataInDtRange"), {
                styleClass: "sapUiSizeCompact",
                icon: sap.m.MessageBox.Icon.ERROR,
                title: this.oBundle.getText("errNoData")
              });
          }
        }*/

      },
      remove: function() {
        if (document.getElementById("dcLoadHdr1") !== null) {
          d3.select("#dcLoadHdr1").remove();
        }
        if (document.getElementById("dcLoadLegend") !== null) {
          d3.select("#dcLoadLegend").remove();
        }
        if (document.getElementById("dcLoadHdr2") !== null) {
          d3.select("#dcLoadHdr2").remove();
        }
      },
      next: function(oEvent) {
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.CHART_RANGE,
          this.EvtAct.CLICK, "Next");
        var view = this.getView();
        var self = this;

        this.tblPageCount += 1;
        if (this.tblPageCount < this.weekModel.length - 3) {

          oEvent.getSource().setEnabled(true);
          view.byId("btn_prev").setEnabled(true);
        } else {
          oEvent.getSource().setEnabled(false);
          view.byId("btn_prev").setEnabled(true);
        }
        /*if (this.tblPageCount === 1) {
          this.marginLeft -= ((this.daysWidth * 7) + 30);
        } else {
          this.marginLeft -= (this.daysWidth * 7);
        }

        //Added for custom control
        this._oDclChart.setMarginLeft(this.marginLeft);
        d3
          .selectAll(".chartPanelDC .legend")
          .attr(
            "transform",
            function() {
              var xforms = this
                .getAttribute("transform");
              var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
                .exec(xforms);
              var firstX = parts[1];
              return "translate(" + (Number(firstX) + (self.daysWidth * 7)) + ",-20)";
            });
        d3
          .selectAll(".y.axis")
          .attr(
            "transform",
            function() {
              //var xforms = this
              //  .getAttribute("transform");
              //var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
              //  .exec(xforms);
              //var firstX = parts[1];
              return "translate(" + (-20 - self.marginLeft) + ",120)";
            });*/
            this.setDCLChartModel("next");
      },
      previous: function(oEvent) {
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.CHART_RANGE,
          this.EvtAct.CLICK, "Previous");
        var view = this.getView();
        var self = this;
        this.tblPageCount -= 1;
        if (this.tblPageCount === 0) {
          oEvent.getSource().setEnabled(false);
          view.byId("btn_next").setEnabled(true);
          this.marginLeft += ((this.daysWidth * 7) + 30);
        } else {
          oEvent.getSource().setEnabled(true);
          view.byId("btn_next").setEnabled(true);
          this.marginLeft += (this.daysWidth * 7);
        }
        //Added for custom control
       /* var id = this._oDclChart.getId();
        this._oDclChart.setMarginLeft(this.marginLeft);
        d3.select("#" + id + "-dcLoadHdr1").style("margin-left",
          this.marginLeft + "px");
        //End of addition
        d3
          .selectAll(".chartPanelDC .legend")
          .attr(
            "transform",
            function() {
              var xforms = this
                .getAttribute("transform");
              var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
                .exec(xforms);
              var firstX = parts[1];
              return "translate(" + (Number(firstX) - (self.daysWidth * 7)) + ",-20)";
            });
        d3
          .select(".y.axis")
          .attr(
            "transform",
            function() {
              //var xforms = this
              //  .getAttribute("transform");
              //var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
              //  .exec(xforms);
              //var firstX = parts[1];
              return "translate(" + (-20 - self.marginLeft) + ",120)";
            });*/
            this.setDCLChartModel("prev");
      },

      setDestinationDCLFilter: function() {
        // For Destination DC CheckBox
        var allDestDCL = [];
        var cArr = this.getModel("filterPC").getProperty("/ProductCollection");
        for (var i = 0; i < cArr.length; i++) {
          allDestDCL.push(cArr[i].DestinationDCDesc);
        }
        allDestDCL = Utility.getUniqueElements(allDestDCL);
        var calcModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
        calcModel.setSizeLimit(99999);
        var oBinding = calcModel.bindList("/ProductCollection");
        var destFilterDCL = [];
        for (i = 0; i < allDestDCL.length; i++) {
          var filters = [];
          filters.push(new Filter("DestinationDCDesc","EQ", allDestDCL[i]));
          destFilterDCL.push(new Filter({
            aFilters: filters,
            bAnd: true
          }));
        }
        var uDestDCL = [];
        for (var j = 0; j < allDestDCL.length; j++) {
          oBinding.filter(destFilterDCL[j]);
          uDestDCL.push({
            "DestinationDCDesc": allDestDCL[j],
            "Count": oBinding.getLength(),
            "id": allDestDCL[j].replace(/[^\w]/g, '') //(/[`~!@#$%^&*()_|+\-=?;:,.<>\{\}\[\]\\\/'"\sÃ©]/g, '')
          });
        }
        var destModelDCL = new JSONModel();
        destModelDCL.setSizeLimit(99999);
        destModelDCL.setData({
          DestinationCollection: uDestDCL
        });
        this.getOwnerComponent().setModel(destModelDCL,"destModelDCL");
        var context = "/DestinationCollection";
        var destListDCL = this.getView().byId("destDCList");
        destListDCL.destroyItems();
        destListDCL
          .bindAggregation(
            "items",
            context,
            jQuery
            .proxy(
              function(sId, oContext) {
                var cb = new sap.m.RadioButton({
                    id: this
                      .getView()
                      .createId(
                        "destdcl_" + oContext
                        .getProperty("id")),
                    text: "{DestinationDCDesc}",
                    tooltip: "{DestinationDCDesc}",
                    select: [
                      this.destinationdclSelect,
                      this
                    ]
                  })
                  .addStyleClass(
                    "routePgChkBox radio dcl")
                  .addStyleClass(
                    "handPointer");
                var lbl = new sap.m.Label({
                    id: this
                      .getView()
                      .createId(
                        "destdcl_" + oContext
                        .getProperty("id") + "Count"),
                    text: "{Count}"
                  })
                  .addStyleClass("countLbl");

                var hBox = new sap.m.HBox(
                    this
                    .getView()
                    .createId(
                      "rp_cb_hb_destdcl_" + oContext
                      .getProperty("id")), {
                      items: [new sap.ui.layout.HorizontalLayout({
                          content: [

                            cb,
                            lbl
                          ]
                        })
                        .addStyleClass("filterHdr filterWidth")
                      ]
                    })
                  .addStyleClass("firstFilterBoxWidthWithoutBtn");
                return new sap.m.CustomListItem({
                  content: [hBox]
                });
              }, this));

        destListDCL.setModel(destModelDCL);
        /*if (uDestDCL.length > 0) {
          this.getView().byId("destdcl_" + uDestDCL[0].id)
            .setSelected(true);
        }*/
        var oModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
        oModel.setSizeLimit(99999);
        // var destModel = this.getModel("destModelDCL").getProperty("/DestinationCollection");
        this.filterDCLoadModel = oModel;
        oBinding = this.filterDCLoadModel.bindList("/ProductCollection");
        // if (destModel.length > 0) {
        //   this.oFilter = new sap.ui.model.Filter("DestinationDCDesc","EQ", destModel[0].DestinationDCDesc);
            this.adjustDestFilter();
            oBinding.filter(this.oFilter);
            
        // }
        //Start of Change GDNK903907 - 10-May-2016
        var dest=null;
        if(this.oFilter && this.oFilter.oValue1){
        	dest=this.oFilter.oValue1;
        }
        var id=null;
        uDestDCL.forEach(function(val){
            if(val.DestinationDCDesc===dest){
                id=val.id;
            }
        });
        if (uDestDCL.length > 0) {
          this.getView().byId("destdcl_" + id).setSelected(true);
        }
        //End of Change GDNK903907 - 10-May-2016
        var filterItems = [];
        var contexts = oBinding.getContexts(0, oBinding.getLength());
        for (i = 0; i < oBinding.getLength(); i++) {
          var item = this.filterDCLoadModel.getProperty(contexts[i].sPath);
          filterItems.push(item);
        }
        this.dclModel = new JSONModel();
        this.dclModel.setSizeLimit(99999);
        this.dclModel.setData({
          "ProductCollection": filterItems
        });
        // this.oLoadFinishedDeferred.resolve();
        // End of Destination DC CheckBox
      },

      destinationdclSelect: function(oEvent) {
        var view = this.getView();
        this.showBusy(['filterBox', 'dcLoadChart', 'dcLoadDetails']);
        if (oEvent.getParameter("selected") === true) {
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.FILTER,
            this.EvtAct.USE, this.oBundleEn
            .getText("destinationDC"));
        //   this.oFilterLoadFinishedDeferred = jQuery.Deferred();
        //   this.oFilterAdjustedDeferred = jQuery.Deferred();
          this.currRbId = oEvent.getSource().getId();
          var text = oEvent.getSource().getText();

          var oBinding = this.filterDCLoadModel.bindList("/ProductCollection");
          this.oFilter = new sap.ui.model.Filter("DestinationDCDesc", "EQ", text);
          oBinding.filter(this.oFilter);
          var filterItems = [];
          var contexts = oBinding.getContexts(0, oBinding.getLength());
          for (var i = 0; i < oBinding.getLength(); i++) {
            var item = this.filterDCLoadModel.getProperty(contexts[i].sPath);
            filterItems.push(item);
          }
          this.dclModel = new JSONModel();
          this.dclModel.setSizeLimit(99999);
          this.dclModel.setData({
            "ProductCollection": filterItems
          });
        this.getEventBus().publish("all","prepareScreen",{
                    src: "DCL",
		            isSelectAll:true
        });
                // generateDynamicFilters(this.getAllFilterSections(),"modelDCL",true,false,this.dclModel);
          /*view.byId("paList").destroyItems();
          view.byId("pfList").destroyItems();
          view.byId("originCountryList").destroyItems();
          view.byId("productList").destroyItems();
          view.byId("categoryList").destroyItems();
          view.byId("polList").destroyItems();
          view.byId("poaList").destroyItems();
          //view.byId("atList").destroyItems();
          var filterPA = this.getFilterVal("PA");
          var filterPF = this.getFilterVal("PF");
          var filterOC = this.getFilterVal("OC");
          var filterCAT = this.getFilterVal("CAT");
          var filterPRD = this.getFilterVal("PRD");
          var filterPOL = this.getFilterVal("POL");
          var filterPOA = this.getFilterVal("POA");
          //var filterAT = this.getFilterVal("AT");
          this.createFilter(filterCAT.field,
            filterCAT.prefix, filterCAT.context,
            filterCAT.modelDCL, filterCAT.list,
            this.categorySelect, view, this,
            this.dclModel);
          this.createFilter(filterPRD.field,
            filterPRD.prefix, filterPRD.context,
            filterPRD.modelDCL, filterPRD.list,
            this.productSelect, view, this,
            this.dclModel);
          this.createFilter(filterPA.field, filterPA.prefix,
            filterPA.context, filterPA.modelRoot,
            filterPA.list, this.alignSelect, view,
            this, this.dclModel);
          this.createFilter(filterPF.field, filterPF.prefix,
            filterPF.context, filterPF.modelDCL,
            filterPF.list, this.prioritySelect, view,
            this, this.dclModel);
          this.createFilter(filterOC.field, filterOC.prefix,
            filterOC.context, filterOC.modelDCL,
            filterOC.list, this.countrySelect, view,
            this, this.dclModel);
        //   this.createFilter(filterAT.field, filterAT.prefix,
        //               filterAT.context, filterAT.modelDCL,
        //               filterAT.list, this.atSelect, view, this,
        //               this.dclModel);
          this.createFilter(filterPOL.field,
            filterPOL.prefix, filterPOL.context,
            filterPOL.modelDCL, filterPOL.list,
            this.polSelect, view, this, this.dclModel);
          this.createFilter(filterPOA.field,
            filterPOA.prefix, filterPOA.context,
            filterPOA.modelDCL, filterPOA.list,
            this.poaSelect, view, this, this.dclModel);

          this
            .waitForFilterLoad(function() {
              var filterSections = ["AF", "PF",
                "CF", "PRDF", "CATF", "POLF",
                "POAF"
              ]; //, "ATF" ];
              this.selectAllFilters(filterSections,
                false);
              this.isCustom = true;
              this.getView().byId("_prod_SeeAllBtn")
                .firePress();
              this.setFilters();
              this.refreshModel("ALL");
            });

          this.waitForFilterAdjust(function() {
            this.generateDCLChartModel(this.dcLoadModel,
              text);
            this.setDCLChartModel();
          });*/
        }
      },

      refreshModel: function(filterSection) {
      	
      	
       this.adjustAllFilters(filterSection, this.getFilter("allFilters"), [
          this.getFilter("priorityFilter"), 
          this.getFilter("alignFilter"),
          //this.getFilter("destFilter"), 
          //31Aug2016
          //this.getFilter("productFilter"),
          this.getFilter("categoryFilter"),
          this.getFilter("countryFilter"),
          this.getFilter("polFilter"), 
          this.getFilter("poaFilter")
        ]);
       /* this.adjustAllFilters(filterSection, this.getFilter("allFiltersUC"), [
          this.getFilter("priorityFilterUC"), 
          this.getFilter("alignFilterUC"),
          this.getFilter("destFilterUC"),
          this.getFilter("productFilterUC"),
          this.getFilter("categoryFilterUC"),
          this.getFilter("countryFilterUC"),
          this.getFilter("polFilterUC"), 
          this.getFilter("poaFilterUC")
        ],true);*/
        var view = this.getView();
        view.byId("search").setValue("");
        var calcModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
        calcModel.setSizeLimit(99999);
        var oBindingforCalc = calcModel.bindList("/ProductCollection");
       /* var calcModelUC = new JSONModel(this.getModel("filterPC").getProperty("/"));
        calcModelUC.setSizeLimit(99999);
        var oBindingforCalcUC = calcModelUC.bindList("/ProductCollection");*/
        if (this.getFilter("allFilters").aFilters.length > 0) {
          oBindingforCalc.filter(this.getFilter("allFilters"));
        }
       /* if (this.getFilter("allFiltersUC").aFilters.length > 0) {
          oBindingforCalcUC.filter(this.getFilter("allFiltersUC"));
        }*/
        var filterItems = [];//, filterItemsUC=[];
       /* var contextsUC = oBindingforCalcUC.getContexts(0, oBindingforCalcUC.getLength());
        contextsUC.forEach(function(c){
        	filterItemsUC.push(calcModelUC.getProperty(c.sPath));
        });*/
        var contexts = oBindingforCalc.getContexts(0, oBindingforCalc.getLength());
        for (var i = 0; i < oBindingforCalc.getLength(); i++) {
          var item = calcModel.getProperty(contexts[i].sPath);
          filterItems.push(item);
        }

        var subFilterPC = new JSONModel();
        subFilterPC.setSizeLimit(99999);
        subFilterPC.setData({
          "ProductCollection": filterItems
        });
        this.getOwnerComponent().setModel(subFilterPC,"subFilterPC");
        // Change for null filter
        view.setModel(this.getModel("subFilterPC"));
        /*var filterOutPC = new JSONModel();
        filterOutPC.setSizeLimit(99999);
        filterOutPC.setData({
          "ProductCollection": filterItemsUC
        });
        this.getOwnerComponent().setModel(filterOutPC,"filterOutPC");*/
        if (this.getNullFilterFlag() === true) {
          var nullModel = new JSONModel();
          view.setModel(nullModel);
        }
        // this.setSearchBoxModel(this.getOwnerComponent()
        //   .getModel("filterPC"), "DP");

        calcModel = new JSONModel(this.getModel("subFilterPC").getProperty("/"));
        calcModel.setSizeLimit(99999);
        oBindingforCalc = calcModel.bindList("/ProductCollection");
        if (this.getNullFilterFlag() === true) {
          view.byId("numOfContainers").setText("0");
        } else {
          view.byId("numOfContainers").setText(oBindingforCalc.getLength());
        }
        var val=null;
        if(this.oFilter){
         val = this.oFilter.oValue1;
        }
        // else{
            
        // }
        if (val === null || typeof val === "undefined") {
          this.generateDCLChartModel(this.dcLoadModel, null);
        } else {
          this.generateDCLChartModel(this.dcLoadModel, val);
        }
        this.setDCLChartModel();
        this.getModel("appProperties").setProperty("/isDCLBusy",false);
        $.sap.delayedCall(100,this,function(){
        	this.calculateCounters(filterSection,this.getModel("filterPC"),this.getModel("subFilterPC"), "DCL", this.getFilterState(this,filterSection));	
        });
        this.getModel("appProperties").setProperty("/isDCLLoaded",true);
      },

      _clicktoExpand: function(evt) {
        var view = this.getView();
        var dph = this.getView().byId("dcLoadChart");
        var dp = this.getView().byId("dcLoadDetails");
        var oFilterBox = view.byId("fBox");
        var oMainBox = view.byId("upperArea");
        var icon = evt.getSource().getIcon();
        var prevBtn = view.byId("btn_prev");
        var nextBtn = view.byId("btn_next");

        if (icon === "sap-icon://media-reverse") {
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.PANE,
            this.EvtAct.HIDE, "");
          oFilterBox
            .addStyleClass("invisibleFirstFlexItem dclTglCol");
          oMainBox.addStyleClass("totalWidth");
          evt.getSource().setIcon("sap-icon://media-play");
          evt.getSource().setTooltip(this.oBundle.getText("expandFilter"));
          if (!prevBtn.hasStyleClass("fixedLeft1")) {
            prevBtn.addStyleClass("fixedLeft1");
          }
          if (!nextBtn.hasStyleClass("fixedLeft80")) {
            nextBtn.addStyleClass("fixedLeft80");
          }
          //this.daysWidth = Math.round((window.innerWidth - 50) / 22);
          this.daysWidth = Math.round((window.innerWidth - 150) / 21);
         // this.refreshModel("ALL");
        } else {
          if (this.isCustomCollapse) {
            this.isCustomCollapse = false;
          } else {
            // For GA Tagging
            this.trackGAEvent(this.EvtCat.PANE,
              this.EvtAct.SHOW, "");
          }
          oFilterBox
            .removeStyleClass("invisibleFirstFlexItem dclTglCol");
          oMainBox.removeStyleClass("totalWidth");
          evt.getSource().setIcon("sap-icon://media-reverse");
          evt.getSource().setTooltip(this.oBundle.getText("collapseFilter"));
          if (prevBtn.hasStyleClass("fixedLeft1")) {
            prevBtn.removeStyleClass("fixedLeft1");
          }
          if (nextBtn.hasStyleClass("fixedLeft80")) {
            nextBtn.removeStyleClass("fixedLeft80");
          }
          //this.daysWidth = Math.round((window.innerWidth - (.25 * window.innerWidth)) / 21);
          this.daysWidth = Math.round((window.innerWidth - (.21 * window.innerWidth)-150) / 21);
          //this.refreshModel("ALL");
        }
        dp.setWidth((this.daysWidth * 21+50) + "px");
        dph.setWidth((this.daysWidth * 21+50) + "px");
        this.marginLeft = -30 - (this.tblPageCount * this.daysWidth * 7);
        /*d3.select("#dcLoadHdr1").style("margin-left",
          this.marginLeft + "px");
        d3.select("#dcLoadHdr2").style("margin-left",
          this.marginLeft + "px");*/
          this.setDCLChartModel("toggle");
      },

      generateDCLChartModel: function(rowModel, dest) {
        var view = this.getView();
        var dates = rowModel.dateModel;
        if (dates.length === 0) {
          this.chartModel = [];
          view.byId("numOfContainers").setText("0");
          view.byId("idProductsTableDcl").setModel(
            new sap.ui.model.json.JSONModel());
          view.byId("fullDateText").setText("");
          return;
        }
        var l = dates.length;
        if (l < 21) {
          var lastDate = sap.ui.core.format.DateFormat
            .getDateInstance({
              pattern: 'yyyyMMdd'
            }).parse(dates[l - 1]);
          for (var j = 21; j > l; j--) {
            lastDate.setDate(lastDate.getDate() + 1);
            dates.push(sap.ui.core.format.DateFormat
              .getDateInstance({
                pattern: 'yyyyMMdd'
              }).format(lastDate));
          }
        }
        var chartModel = [];
        var os = 0;
        var ls = 0;
        var nf = 0;
        var oFilterOS = new sap.ui.model.Filter("Priority",
          "EQ", "1");
        var oFilterLS = new sap.ui.model.Filter("Priority",
          "EQ", "2");
        var oFilterNF = new sap.ui.model.Filter("Priority",
          "EQ", "3");

        var oModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
        oModel.setSizeLimit(99999);
        var destModel = this.getModel("destModelDCL").getProperty("/DestinationCollection");
        this.filterDCLoadModel = oModel;
        var oBinding = this.filterDCLoadModel.bindList("/ProductCollection");
        if (!Utility.hasValue(dest)) {
          this.oFilter = new Filter("DestinationDCDesc", "EQ", destModel[0].DestinationDCDesc);
        } else {
          this.oFilter = new Filter("DestinationDCDesc", "EQ", dest);
        }
        this.masterFilter = new Filter({
          aFilters: [this.oFilter, this.getFilter("allFilters")],
          bAnd: true
        });
        oBinding.filter(this.masterFilter);
        var filterItems = [];
        var contexts = oBinding.getContexts(0, oBinding.getLength());
        for (var i = 0; i < oBinding.getLength(); i++) {
          var item = this.filterDCLoadModel.getProperty(contexts[i].sPath);
          filterItems.push(item);
        }
        this.currDCLoadModel = new JSONModel();
        this.currDCLoadModel.setSizeLimit(99999);
        this.currDCLoadModel.setData({
          "ProductCollection": filterItems
        });

        var oBindingDC = this.currDCLoadModel.bindList("/ProductCollection");
        for (i = 0; i < dates.length; i++) {
          var d = Utility.convertToDate(dates[i], 'yyyyMMdd');
          d=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
          //var oFilter = new sap.ui.model.Filter("UDelDate","EQ", d);
          var oFilter = new Filter({
          	path:"UDelDate",
          	test:function(oValue){
          		var val=new Date(oValue);
          		val= Utility.getDateString(val,"yyyyMMdd",false);
          		return val===dates[i];
          	}
          });
          oBindingDC.filter(oFilter);
          // START MODEL

          filterItems = [];
          var contexts = oBindingDC.getContexts(0, oBindingDC.getLength());
          for (var j = 0; j < oBindingDC.getLength(); j++) {
            item = this.currDCLoadModel.getProperty(contexts[j].sPath);
            filterItems.push(item);
          }
          var oDayModel = new sap.ui.model.json.JSONModel();
          oDayModel.setData({
            "data": filterItems
          });
          var oBindingDay = oDayModel.bindList("/data");
          os = oBindingDay.filter(oFilterOS).getLength();
          ls = oBindingDay.filter(oFilterLS).getLength();
          nf = oBindingDay.filter(oFilterNF).getLength();

          chartModel.push({
            "day": dates[i],
            "OutOfStock": os,
            "LowOnStock": ls,
            "NoFlag": nf
          });

          // END MODEL

        }
        oBinding.filter(this.oFilter);
        filterItems = [];
        var contexts = oBinding.getContexts(0, oBinding.getLength());
        for (i = 0; i < oBinding.getLength(); i++) {
          item = this.filterDCLoadModel.getProperty(contexts[i].sPath);
          filterItems.push(item);
        }
        this.dclModel = new sap.ui.model.json.JSONModel();
        this.dclModel.setSizeLimit(99999);
        this.dclModel.setData({
          "ProductCollection": filterItems
        });
        if (this.getNullFilterFlag() === true) {
          var nullModel = new sap.ui.model.json.JSONModel();
          view.byId("idProductsTableDcl").setModel(nullModel);
          view.byId("fullDateText").setText("");
        } else {
          view.byId("idProductsTableDcl").setModel(this.currDCLoadModel);
          view.byId("fullDateText").setText("");
        }
        var oTable = view.byId("idProductsTableDcl");
        oBinding = oTable.getBinding("items");
        if (this.getNullFilterFlag() === true) {
          view.byId("numOfContainers").setText("0");
          this.chartModel = [];
        } else {
          view.byId("numOfContainers").setText(oBinding.getLength());
          this.chartModel = chartModel;
        }
        var oFalseFilter = new sap.ui.model.Filter("ASN", "EQ","0");
        oBinding.filter(oFalseFilter);
      },

      refreshTableModel: function(d) {
        var view = this.getView();
        var dt = Utility.convertToDate(d.label, 'yyyyMMdd');
        dt=new Date(Date.UTC(dt.getFullYear(),dt.getMonth(),dt.getDate()));
        // var oFilter1 = new sap.ui.model.Filter("UDelDate", "EQ",dt);
         var oFilter1 = new Filter({
          	path:"UDelDate",
          	test:function(oValue){
          		var val=new Date(oValue);
          		val= Utility.getDateString(val,"yyyyMMdd",false);
          		return val===d.label;
          	}
          });
        var oTable = view.byId("idProductsTableDcl");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(oFilter1);

        view.byId("fullDateText").setText(
          Utility.dateConvert(d.label, "yyyyMMdd", true));
      },

      search: function(oEvent) {
        var view = this.getView();
        var btnId = oEvent.getSource().getId();
        var rBtnId = view.byId("refreshBtn").getId();
        var search = view.byId("search");
        var query = search.getValue();
        if (!Utility.hasValue(query) || query.length === 0 || btnId === rBtnId) {
          if (btnId === rBtnId) {
            search.setValue("");
          }
          this.refreshModel("NONE");
        } else {
          query = "" + query;
          var searchModel = new sap.ui.model.json.JSONModel(
            this.getOwnerComponent().getModel(
              "filterPC").oData);
        searchModel.setSizeLimit(99999);
          var searchBinding = searchModel.bindList("/ProductCollection");
          var compressedQuery = query; //.toUpperCase();.replace(/\s/g, "");
          var filterParams = this.getFilterParameters(compressedQuery);
          var allSearchFilters = [],searchFilterSKU=null;
          this.searchFilter = [];
          if (filterParams != null) {
            if (filterParams.searchField !== "") {
              if (filterParams.searchField === "SKU") {
                searchFilterSKU = new sap.ui.model.Filter(
                  "SKU",
                  sap.ui.model.FilterOperator.Contains,
                  filterParams.searchEntry);
                /*for (var i = 0; i < searchBinding
                  .getLength(); i++) {

                  var skuBinding = searchModel
                    .bindList("/ProductCollection/" + i + "/ItemSet/results");
                  skuBinding.filter(searchFilterSKU);
                  var contexts = searchBinding.getContexts(0, searchBinding.getLength());
                  if (skuBinding.getLength() > 0) {
                    var item = searchModel
                      .getProperty(contexts[i].sPath);
                    allSearchFilters
                      .push(new sap.ui.model.Filter(
                        "GUID",
                        sap.ui.model.FilterOperator.EQ,
                        item.GUID));
                  }
                }*/
                /*this.searchFilter
                  .push(new sap.ui.model.Filter({
                    aFilters: allSearchFilters,
                    bAnd: false
                  }));*/
                  this.searchFilter.push(searchFilterSKU);
              } else {
                this.searchFilter
                  .push(new sap.ui.model.Filter(
                    filterParams.searchField,
                    filterParams.filterOperator,
                    filterParams.searchEntry));
              }
            } else {
              var searchFilterCN = new sap.ui.model.Filter(
                "Container",
                filterParams.filterOperator,
                filterParams.searchEntry);
              var searchFilterPO = new sap.ui.model.Filter(
                "PO", filterParams.filterOperator,
                filterParams.searchEntry);
              var searchFilterASN = new sap.ui.model.Filter(
                "ASN", filterParams.filterOperator,
                filterParams.searchEntry);
              var searchFilterSTO = new sap.ui.model.Filter(
                "STO", filterParams.filterOperator,
                filterParams.searchEntry);
	            var searchFilterLDP = new sap.ui.model.Filter(
	            "CustPOID", filterParams.filterOperator,
	            filterParams.searchEntry);
	          searchFilterSKU = new sap.ui.model.Filter(
                "SKU", sap.ui.model.FilterOperator.Contains,
                filterParams.searchEntry);
              allSearchFilters.push(searchFilterCN);
              allSearchFilters.push(searchFilterPO);
              allSearchFilters.push(searchFilterASN);
              allSearchFilters.push(searchFilterSTO);
              allSearchFilters.push(searchFilterLDP);
              allSearchFilters.push(searchFilterSKU);

             /* var searchFilterSKU = new sap.ui.model.Filter(
                "SKU", filterParams.filterOperator,
                filterParams.searchEntry);
              for (var i = 0; i < searchBinding
                .getLength(); i++) {

                var skuBinding = searchModel
                  .bindList("/ProductCollection/" + i + "/ItemSet/results");
                skuBinding.filter(searchFilterSKU);
                var contexts = searchBinding.getContexts(0, searchBinding.getLength());
                if (skuBinding.getLength() > 0) {
                  var item = searchModel
                    .getProperty(contexts[i].sPath);
                  allSearchFilters
                    .push(new sap.ui.model.Filter(
                      "GUID",
                      sap.ui.model.FilterOperator.EQ,
                      item.GUID));
                }

              }*/

              this.searchFilter
                .push(new sap.ui.model.Filter({
                  aFilters: allSearchFilters,
                  bAnd: false
                }));
            }
          } else {
            sap.m.MessageBox.alert(this.oBundle
              .getText("noDataText"), {
                styleClass: "sapUiSizeCompact",
                icon: sap.m.MessageBox.Icon.ERROR,
                title: this.oBundle.getText("errNoData")
              });
            return;
          }
          searchBinding.filter(this.searchFilter);
          var rL = searchBinding.getLength();
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.SEARCH,
            this.EvtAct.DIS_RES, rL);
          var bus = this.getOwnerComponent().getEventBus();
          var router = sap.ui.core.UIComponent.getRouterFor(this);
          var paramModel = this.getModel("paramModel");
          var context=null;
          if (rL === 1) {
            var cid = searchModel.getProperty(searchBinding.getContexts()[0] + "/GUID");
            context = searchBinding.getContexts()[0].sPath;
            // End

            router.navTo("ContainerDetailP", {
              direction: paramModel.getProperty("/direction"),
              type: paramModel.getProperty("/type"),
              fromDate: paramModel.getProperty("/fromDate"),
              toDate: paramModel.getProperty("/toDate"),
              companyCode:paramModel.getProperty("/companyCode"),
              guid: cid
            }, false);
            bus.publish("container", "detail", {
              data: {
                Container: cid,
                context: context,
                total: 1,
                source: "DP",
                mkt: this.getView().byId("marketList")
                  .getSelectedKey()
              },
              context: context
            });

          } else if (rL > 1) {
            context = searchBinding.getContexts(0, searchBinding.getLength());
            paramModel = this.getModel("paramModel");
            // End
            router.navTo("PlanningAdvisorP", {
              direction: paramModel.getProperty("/direction"),
              type: paramModel.getProperty("/type"),
              fromDate: paramModel.getProperty("/fromDate"),
              toDate: paramModel.getProperty("/toDate"),
              companyCode:paramModel.getProperty("/companyCode")
            }, false);
            this.setFilterLoadDefObj();
            bus.publish("filters", "reset");
            bus.publish("container", "filter", {
              src: "Search",
              query: query,
              searchFilters: this.searchFilter,
              mkt: this.getView().byId("marketList").getSelectedKey()

            });
          } else if (rL === 0) {
            sap.m.MessageBox.alert(this.oBundle
              .getText("noDataText"), {
                styleClass: "sapUiSizeCompact",
                icon: sap.m.MessageBox.Icon.ERROR,
                title: this.oBundle.getText("errNoData")
              });

          }
        }
      },
    adjustAllFilter:function(filterSection){
      	if (filterSection !== "NONE") {
          this.showBusy(['filterBox', 'dcLoadChart', 'dcLoadDetails']);
      	}
      },
      liveChange: function(oControlEvent) {
        this.checkLiveChange(this, oControlEvent);
      },

      selectChange: function(oControlEvent) {
        this.checkChange(this, oControlEvent);
      },

      sendRatingApp: function(oControlEvent) {
        this.checksendRatingApp(oControlEvent);
      },
      dclTableItemPress: function(oEvent) {
        var context = oEvent.getSource().getBindingContext();
        var tabModel = oEvent.getSource().getModel();
        var guid = tabModel.getProperty(context + "/GUID");
        var paramModel = this.getOwnerComponent().getModel(
          "paramModel");
        var bus = this.getOwnerComponent().getEventBus();
        var router = sap.ui.core.UIComponent.getRouterFor(this);
        router.navTo("ContainerDetailP", {
          direction: paramModel.getProperty("/direction"),
          type: paramModel.getProperty("/type"),
          fromDate: paramModel.getProperty("/fromDate"),
          toDate: paramModel.getProperty("/toDate"),
          companyCode:paramModel.getProperty("/companyCode"),
          guid: guid
        }, false);
        bus.publish("container", "detail", {
          data: {
            GUID: guid,
            context: context,
            source: "DCL",
            mkt: this.getView().byId("marketList")
              .getSelectedKey()
          },
          context: context
        });
      },

      setDCLChartModel: function(type) {
        var view = this.getView();
        
        var i=0;
        var idx=0;
        var oModel = new sap.ui.model.json.JSONModel();
        //Start
    	if(!Utility.hasValue(type)){
    		
      		var dd = ["M", "T", "W", "T", "F", "S", "S"];
	        this.days = [];
	        // var weeks = this.dcLoadModel.weekModel;
	        // for (i = 0; i < weeks.length; i++) {
	        //   this.days = this.days.concat(dd);
	        // }
	        //var todayX = this.dcLoadModel.todayModel;
			var today = sap.ui.core.format.DateFormat
	          .getDateInstance({
	            pattern: 'yyyyMMdd'
	          }).format(new Date());
	        //Change for Wave 4 - DCL View - 29-Sep-2015
	        this.data = this.chartModel;
	        this.dates = this.getGraphDates(this.dcLoadModel.data);
	        // this.wM = this.getWeekModel(this.dates.min, this.dates.max);
	         this.wM = this.getWeekModel(this.data[0].day, this.data[this.data.length-1].day);
	        this.diff=Utility.getDateDiff(this.wM.minDate, today,"yyyyMMdd");
	        this.weekModel = this.wM.weeks;
	        //Added for handling next and previous button visibility
	        if (this.tblPageCount < this.weekModel.length - 3) {
	          view.byId("btn_next").setEnabled(true);
	        } else {
	          view.byId("btn_next").setEnabled(false);
	          view.byId("btn_prev").setEnabled(true);
	        }
	        if (this.tblPageCount === 0) {
	          view.byId("btn_prev").setEnabled(false);
	        }
	
	        for (i = 0; i < this.weekModel.length; i++) {
	          this.days = this.days.concat(dd);
	        }
	        
	        var todayX = Utility.getDateDiff(this.wM.minDate, today,"yyyyMMdd") * this.daysWidth;
	        var todayModel = {
	          todayX: todayX
	        };
	        todayX = todayModel;
	        //End of change
      		// oModel.setProperty("/days", days);
	       // oModel.setProperty("/weeks", this.weekModel);
	       // oModel.setProperty("/data", data);
	       // oModel.setProperty("/todayX", todayX);
      	
    	}
        //End
        
    		var pDays=[],pData=[],pWeeks=[],pTodayX={};
    		var tX=this.diff*this.daysWidth;
    		var lowX=((this.tblPageCount)*(this.daysWidth*7));//this.tblPageCount*this.daysWidth;
    		var highX=((this.tblPageCount+3)*(this.daysWidth*7));//(this.tblPageCount+3)*this.daysWidth;
    		if(tX>=lowX && tX<=highX){
    			pTodayX.todayX=tX-lowX;
    		}
    		else{
    			pTodayX.todayX=-1;
    		}
    		/*var count=0;
    		if(type==="next"){
    			count=this.tblPageCount+1;
    		}
    		else if(type==="prev"){
    			count=this.tblPageCount-1;
    		}*/
	        for(i=this.tblPageCount;i<(this.tblPageCount+3);i++){
	        	pWeeks.push(this.weekModel[i]);
	        	for(var j=0;j<7;j++){
	        		idx=(i*7)+j;
	        		pDays.push(this.days[idx]);
	        		if(this.data[idx]){
	        			pData.push(this.data[idx]);
	        		}
	        	}
	        	
	        }
      		// if(type==="next"){
      			oModel.setProperty("/days", pDays);
		        oModel.setProperty("/weeks", pWeeks);
		        oModel.setProperty("/data", pData);
		        oModel.setProperty("/todayX", pTodayX);
      		// }
      		// else if(type==="previous"){
      			
      		// }
      	
        /*oModel.setProperty("/days", days);
        oModel.setProperty("/weeks", this.weekModel);
        oModel.setProperty("/data", data);
        oModel.setProperty("/todayX", todayX);*/
        oModel.setProperty("/filterPC", this.getOwnerComponent().getModel("filterPC").oData);
        this._oDclChart.setModel(oModel);
        this._oDclChart.setMarginLeft(this.marginLeft);
        this._oDclChart.setDayWidth(this.daysWidth);
        this._oDclChart.refreshStackedBarCust();
      },
      initializeVariables:function(){
          this.router= null;
          this.dcLoadModel= null;
          this.tblPageCount= 0;
          this.marginLeft= -30;
          this.oFilter= null;
          this.filterDCLoadModel= null;
          this.currDCLoadModel= null;
          this.chartModel= null;
          this.dclModel= null;
          this.currSel= null;
          this.masterFilter= null;
        //   this.oFilterLoadFinishedDeferred= null;
          this.oFilterAdjustedDeferred= null;
          this.nullModel= new sap.ui.model.json.JSONModel();
          this.isCustom= false;
          this.isCustomDateChangeEvent= false;
          this.urlParams= null;
        //   isCustomHashChange= null;
          this.isLocalRefresh= false;
          this.firstTime= true;
          this.moreThreshold= 10;
          //this.daysWidth= Math.round((window.innerWidth - (.25 * window.innerWidth)) / 21);
          this.daysWidth= Math.round((window.innerWidth - (.21 * window.innerWidth)-150) / 21);
          this._oDclChart= null;
          this.searchFilter=[];
      },
      adjustDestFilter:function(){
          var oModel=null;
          var filterVal=this.getFilterVal("DDC");
         
          if(this.getModel(filterVal.modelDCL)){
              oModel=this.getModel(filterVal.modelDCL);
              var tempDestFilter=[],dest=oModel.getProperty("/"+filterVal.context);
              for(var i=0;i<dest.length;i++){
                  tempDestFilter.push(new Filter(filterVal.field,sap.ui.model.FilterOperator.EQ,oModel.getProperty("/"+filterVal.context+"/"+i+"/DestinationDCDesc")));
              }
              if(this.getFilter("destFilter").length===0){
                  this.oFilter=new Filter(filterVal.field,sap.ui.model.FilterOperator.EQ,oModel.getProperty("/"+filterVal.context+"/0/DestinationDCDesc"));
                  if(this.oFilter && this.oFilter.oValue1){
                	this.addToFilter(this.oFilter,this.getFilter("destFilter"));
                  }
                //   this.removeFromFilter(this.oFilter,this.getFilter("destFilterUC"));
              }
              else{
                  if(this.oFilter && this.oFilter.oValue1){
                      var posOld=this.hasFilter(this.oFilter,this.getFilter("destFilter"));
                      var posNew=this.hasFilter(this.oFilter,tempDestFilter);
                      if(posOld>=0 && posNew>=0){
                          if(posOld>0){
                            //   this.addToFilter(this.getFilter("destFilter")[0],this.getFilter("destFilterUC"));
                          }
                          this.getFilter("destFilter")[0]=this.oFilter;
                        //   var removed=
                          this.getFilter("destFilter").splice(1,this.getFilter("destFilter").length-1);
                         /* removed.forEach($.proxy(function(filter){
                              this.addToFilter(filter,this.getFilter("destFilterUC"));
                          }),this);*/ 
                      }
                      else if(posNew>=0){
                         /* this.getFilter("destFilter").forEach($.proxy(function(filter){
                              this.addToFilter(filter,this.getFilter("destFilterUC"));
                          }),this); */
                          this.getFilter("destFilter").length=0;
                          this.getFilter("destFilter").push(tempDestFilter[posNew]);
                        //   this.removeFromFilter(this.getFilter("destFilter")[0],this.getFilter("destFilterUC"));
                      }
                      else {
                         /* this.getFilter("destFilter").forEach($.proxy(function(filter){
                              this.addToFilter(filter,this.getFilter("destFilterUC"));
                          }),this); */
                          this.getFilter("destFilter").length=0;
                          this.oFilter=tempDestFilter[0];
                          this.getFilter("destFilter").push(tempDestFilter[0]);
                        //   this.removeFromFilter(this.getFilter("destFilter")[0],this.getFilter("destFilterUC"));
                      }
                  }
                  else{
                      this.oFilter=new Filter(filterVal.field,sap.ui.model.FilterOperator.EQ,oModel.getProperty("/"+filterVal.context+"/0/DestinationDCDesc"));
                      /* this.getFilter("destFilter").forEach($.proxy(function(filter){
                              this.addToFilter(filter,this.getFilter("destFilterUC"));
                          }),this); */
                      this.getFilter("destFilter").length=0;
                      this.getFilter("destFilter").push(new Filter(filterVal.field,sap.ui.model.FilterOperator.EQ,oModel.getProperty("/"+filterVal.context+"/0/DestinationDCDesc")));
                    //   this.removeFromFilter(this.getFilter("destFilter")[0],this.getFilter("destFilterUC"));
                  }
                  
              }
          } 
      }
    });
});