sap.ui.define([
	"glb/gtmh/oct/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"glb/gtmh/oct/controls/SwimLane",
	"glb/gtmh/oct/util/Utility",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/routing/History"
], function(BaseController, JSONModel, MessageBox, SwimLane, Utility,DateFormat, History) {
	"use strict";
	return BaseController.extend("glb.gtmh.oct.controller.RouteDetail", {
      tblPageCount: 0,
      marginLeft: 0,
      iModelAllCnt: 0,
      fCont: [],
      filterModel: [],
      firstTime: true,
      searchFilters: [],
      renderBT: null,
      renderSL: null,
      oTabLoadFinishedDeferred: null,
      oSLLoadFinishedDeferred: null,
      oFilterAdjustedDeferred: null,
      //oFilterLoadFinishedDeferred: null,
      flag: true,
      currCbId: null,
      swimLaneModel: null,
      numOfWeeks: 3,
      dtDiff: 0,
      filterSwimLaneModel: null,
      currSwimLaneModel: null,
      weekModel: null,
      oQV: null,
      source: null,
      daysWidth: Math.round((window.innerWidth - (.22 * window.innerWidth + 300)) / 21),
    //   nullFilterFlag: false,
      nullModel: new sap.ui.model.json.JSONModel(),
      isCustom: false,
      isCustomDateChangeEvent: false,
      recPerPage: 10,
      urlParams: null,
      isCustomCollapse: false,
      firstLoad: false,
      isLocalRefresh: false,
      moreThreshold: 10,
      _oSwimLane: null,

      /**
       * Called when a controller is instantiated and its View
       * controls (if available) are already created. Can be used
       * to modify the View before it is displayed, to bind event
       * handlers and do other one-time initialization.
       *
       * @memberOf view.RouteDetail
       */
      onInit: function() {
      	BaseController.prototype.onInit.call(this);
        this.oBundle = this.getResourceBundle();
        // this.oLoadFinishedDef = this.getLoadFinishedDefObj();
        this.firstTime = true;
        this.firstLoad = true;
        var view = this.getView();
        var self = this;
        view.byId("drawPnl").setWidth((this.daysWidth * 21) + "px");
        this._oSwimLane = new SwimLane(view.createId('paSwimLane'), {
          dayWidth: this.daysWidth,
          animate: true,
          animationDuration: 1000,
          onRowClick: function(oEvent) {
            var i = oEvent.getParameter("rowIndex");
            view.byId("lt").getRows()[i].getCells()[1].getItems()[0].firePress();
          },
          onLaneHover: function(oEvent) {
            this.setTooltip(self.createQuickView(0, 0));
          }
        });
        view.byId("drawPnl").addContent(this._oSwimLane);
        this.router = sap.ui.core.UIComponent
          .getRouterFor(this);
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
        var bus = this.getEventBus();
        bus.subscribe("pa", "preventExecution",this._preventExecution, this);
        bus.subscribe("all", "showOverlay",this.showOverlay, this);
        bus.subscribe("all", "prepareScreen", this._prepareScreen, this);
        bus.subscribe("root", "loadData", this._loadData,this);
        bus.subscribe("container", "filter",this.filterContainers, this);
        bus.subscribe("filters", "reset", this._resetFilters, this);
        bus.subscribe("root", "localRefresh", this._localRefresh, this);
        this.recPerPage = this.getOwnerComponent().getModel("usrMktModel").getProperty("/Page");
        if (Number(this.recPerPage) !== 0) {
          view.byId("lt").setVisibleRowCount(this.recPerPage);
        }
        view.byId("lt").setVisibleRowCount(this.recPerPage);
         $.when(this.getOwnerComponent().oUsrLoadFinishedDef).then($.proxy(function(){
        		this.setUserModels();
        },this));
		
      },
      _preventExecution: function(sChannelId, oEvent, data) {
        	this.setCustomHashChange(true);
      },
      _localRefresh: function(sChannelId, oEvent, data) {
      	this.initiateMainServiceCall(false,"PlanningAdvisor");
      },
      onRouteMatched: function(oEvent) {
      	var name = oEvent.getParameter("name");
        document.title = this.setDocTitle(name);
        if (name !== "PlanningAdvisor" && name !== "PlanningAdvisorP") {
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
          var title = this.PA;
          this.trackGAScreenEvent(path, title);
          //New logic
          if(name==="PlanningAdvisorP"){
          	if(this.getModel("filterPC")){
          		var isValid = this.isValidParameters(oEvent.getParameters().arguments);
          		if(isValid){
          			this.getModel("appProperties").setProperty("/isPABusy",true);
          			this.showBusy(['filterBox', 'graphBox']);
          			this.urlParams = oEvent.getParameters().arguments;
                	var bParamModelChanged = this.isParamModelChanged(this.urlParams);
                	if (bParamModelChanged === false) {
                	    var oHistory = History.getInstance();
        				var sPreviousHash = oHistory.getPreviousHash();
		                // $.sap.delayedCall(1000, this, function () {
		                // 31Aug2016
		                $.sap.delayedCall(500, this, function () {
		                    if(this.getModel("appProperties").getProperty("/isPALoaded")===false){
		                        if(typeof sPreviousHash==="undefined" || sPreviousHash.indexOf("ContainerDetail")!==-1){
		                            this.initiateMainServiceCall(true,"PlanningAdvisor",true);
		                        }
		                        else {
		                            this.initiateMainServiceCall(false,"PlanningAdvisor",false);
		                        }
		                		
		                    }
		                    else{
		                        this.initiateMainServiceCall(false,"PlanningAdvisor");
		                    }
		                });
                	}
                	else{
                		// $.sap.delayedCall(1000, this, function () {
                		// 31Aug2016
                		$.sap.delayedCall(500, this, function () {
		                    this.initiateMainServiceCall(true,"PlanningAdvisor",true);
		                });
                	}
          		}
          		else{
          			this.getRouter().navTo("Error",null,true);
          			return;
          		}
          	}
          	else{
          		this.getModel("appProperties").setProperty("/isPABusy",true);
          		 this.showBusy(['filterBox', 'graphBox']);
          		this.urlParams=oEvent.getParameters().arguments;
          		// $.sap.delayedCall(1000, this, function () {
          		// 31Aug2016
          		$.sap.delayedCall(500, this, function () {
		            this.initiateMainServiceCall(true,"PlanningAdvisor",true);
		        });
          	}
          }
          else if(name==="PlanningAdvisor"){
          	this.getModel("appProperties").setProperty("/isPABusy",true);
          	this.setDefaultModels();
        	this.showBusy(['filterBox', 'graphBox']);
          	this.urlParams=null;
          	this.updateParamModel();
          	this.setCustomHashChange(false);
          	this.setHash("PlanningAdvisor");
      //    	$.sap.delayedCall(1000, this, function () {
		            // this.initiateMainServiceCall(true,"Dashboard");
		    // });
          }
          if (this._oPopover) {
          this._oPopover.close();
          this.getView().removeDependent(this._oPopover);
          this._oPopover.destroy();
          this._oPopover = null;
        }
          //End of new logic
        }
      },
      adjustAllFilter:function(filterSection){
      	
	      if (filterSection !== "NONE") {
	          this.showBusy(['filterBox']);
	      }
      },
      /**
       * Similar to onAfterRendering, but this hook is invoked
       * before the controller's View is re-rendered (NOT before
       * the first rendering! onInit() is used for that one!).
       *
       * @memberOf view.RouteDetail
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
       * @memberOf view.RouteDetail
       */
      onAfterRendering: function() {

        var btnTable = this.getView().byId("lt");
        var self = this;
        btnTable.addEventDelegate({
          onAfterRendering: function(e) {
            self.waitForLoad(function() {
            	if(self.oTabLoadFinishedDeferred){
            		self.oTabLoadFinishedDeferred.resolve();
            	}
              if (self.firstLoad === true) {
                self.firstLoad = false;
                /*self.isCustomCollapse = true;
                self.getView().byId("right").firePress();120416*/
              }
            });
          }
        });

        var view = this.getView();
        var allList = ["originCountryList", "destDCList", "productList","categoryList", "polList", "poaList"];
        view.byId(allList[0]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            self.onAfterListRendering(view.byId(allList[0]));
          }, self)
        }, self);

        view.byId(allList[1]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            self.onAfterListRendering(view.byId(allList[1]));
          }, self)
        }, self);

        view.byId(allList[2]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            self.onAfterListRendering(view.byId(allList[2]));
          }, self)
        }, self);

        view.byId(allList[3]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            self.onAfterListRendering(view.byId(allList[3]));
          }, self)
        }, self);

        view.byId(allList[4]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            self.onAfterListRendering(view.byId(allList[4]));
          }, self)
        }, self);

        view.byId(allList[5]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            self.onAfterListRendering(view.byId(allList[5]));
          }, self)
        }, self);

      },

      handleMoreLinkPress: function(oEvent) {
        var view = this.getView();
        var allListVid = ["originCountryLayout", "destinationDCLayout", "prodLayout", "categoryLayout", "polLayout", "poaLayout"];
        var linkMoreId = ["idLinkMoreOC", "idLinkMoreDDC", "idLinkMorePD", "idLinkMoreCL", "idLinkMorePOL", "idLinkMorePOA"];
        var allList = ["originCountryList", "destDCList", "productList",
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

      refreshModel: function(filterSection) {
        this.flag = false;
        this.oTabLoadFinishedDeferred = $.Deferred();
        var bCount = 0;
        var tableLeft = this.getView().byId("lt");
        tableLeft.updateRows();
        bCount = tableLeft.getVisibleRowCount();

        var view = this.getView();
        var filterArr = [
          this.getFilter("priorityFilter"), 
          this.getFilter("alignFilter"),
          this.getFilter("destFilter"), 
          //31Aug2016
          //this.getFilter("productFilter"),
          
          this.getFilter("categoryFilter"),
          this.getFilter("countryFilter"),
          this.getFilter("polFilter"), 
          this.getFilter("poaFilter")
        ];
        /*var filterArrUC = [
          this.getFilter("priorityFilterUC"), 
          this.getFilter("alignFilterUC"),
          this.getFilter("destFilterUC"),
          this.getFilter("productFilterUC"),
          this.getFilter("categoryFilterUC"),
          this.getFilter("countryFilterUC"),
          this.getFilter("polFilterUC"), 
          this.getFilter("poaFilterUC")
        ];*/
        if (filterSection !== "NAV") {
          this.tblPageCount = 0;
          this.adjustAllFilters(filterSection,this.getFilter("allFilters"), filterArr);
        //   this.adjustAllFilters(filterSection,this.getFilter("allFiltersUC"), filterArrUC,true) ;
          this.getView().byId("btn_prev").setEnabled(false);
        }
		
        var oBindingLeft = tableLeft.getBinding("rows");
        if (view.byId("filterBox").getVisible()) {
          var oFalseFilter = new sap.ui.model.Filter("GUID", "EQ", '0');
          if (this.getFilter("allFilters").aFilters.length === 0) {
            this.getFilter("allFilters").aFilters.push(oFalseFilter);
          }
          
          //New change
          	var calcModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
          	calcModel.setSizeLimit(99999);
	        var oBindingforCalc = calcModel.bindList("/ProductCollection");
	       /* var calcModelUC = new JSONModel(this.getModel("filterPC").getProperty("/"));
	        calcModelUC.setSizeLimit(99999);
	        var oBindingforCalcUC = calcModelUC.bindList("/ProductCollection");*/
	        if (this.getFilter("allFilters").aFilters.length > 0) {
	          oBindingforCalc.filter(this.getFilter("allFilters"));
	        }
	        /*if (this.getFilter("allFiltersUC").aFilters.length > 0) {
	          oBindingforCalcUC.filter(this.getFilter("allFiltersUC"));
	        }*/
	        var filterItems = [];//, filterItemsUC=[];
	       // var contextsUC = oBindingforCalcUC.getContexts(0, oBindingforCalcUC.getLength());
	       // contextsUC.forEach(function(c){
	       // 	filterItemsUC.push(calcModelUC.getProperty(c.sPath));
	       // });
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
	       /* if (this.nullFilterFlag === true) {
	          var nullModel = new JSONModel();
	          view.setModel(nullModel);
	        }*/
	        if (this.getNullFilterFlag() === false) {
	            oBindingLeft.filter(this.getFilter("allFilters"));
	            this.setFilterSwimLaneModel(this.getFilter("allFilters"));
	          } else {
	            oBindingLeft.filter(oFalseFilter);
	            this.setFilterSwimLaneModel(oFalseFilter);
	          }
	        // this.setSearchBoxModel(this.getOwnerComponent()
	        //   .getModel("filterPC"), "DP");
	
	        calcModel = new JSONModel(this.getModel("subFilterPC").getProperty("/"));
	        calcModel.setSizeLimit(99999);
	        oBindingforCalc = calcModel.bindList("/ProductCollection");
	      /*  if (this.nullFilterFlag === true) {
	          view.byId("containerText").setText("0");
	        } else {
	          view.byId("containerText").setText(oBindingforCalc.getLength());
	        }*/
          
          //End New Change
          
          
          
          /*if (this.nullFilterFlag === false) {
            oBindingLeft.filter(this.allFilters);
            this.setFilterSwimLaneModel(this.allFilters);
          } else {
            oBindingLeft.filter(oFalseFilter);
            this.setFilterSwimLaneModel(oFalseFilter);
          }*/
        } else {
          if (this.searchFilters.length > 0) {
            oBindingLeft.filter(this.searchFilters);
            this.setFilterSwimLaneModel(this.searchFilters);
          }
        }
        var aCount = tableLeft.getVisibleRowCount();
        var count = oBindingLeft.getLength();
        if (count === 0) {
          tableLeft.setVisibleRowCount(1);
        } else {
          if (count < this.recPerPage) {
            tableLeft.setVisibleRowCount(count);
          } else {
            tableLeft.setVisibleRowCount(this.recPerPage);
          }
        }
        if (count === 0) {
          this.oTabLoadFinishedDeferred.resolve();
        }
        if (bCount === aCount && filterSection !== "NAV") {
          tableLeft.invalidate();
        }
        view.byId("numOfContainers").setText( oBindingLeft.getLength());
        this.managePaginator(count);
        this.waitForLoading(function() {
          if (filterSection === "NAV") {
            this.renderBtnTable(false);
          } else {
            this.renderBtnTable(true);
          }
        });
        this.getModel("appProperties").setProperty("/isPABusy",false);
         $.sap.delayedCall(100,this,function(){
        	this.calculateCounters(filterSection,this.getModel("filterPC"),this.getModel("subFilterPC"), "PA", this.getFilterState(this,filterSection));	
        });
        this.getModel("appProperties").setProperty("/isPALoaded",true);
      },

      managePaginator: function(rowCount) {
        var view = this.getView();
        var pages = Math.ceil(rowCount / this.recPerPage);
        var paginator = view.byId("pa_paginator");
        paginator.setNumberOfPages(pages);
        paginator.setCurrentPage(1);
        view.byId("lt").setFirstVisibleRow(0);
      },

      handlePageEvent: function(oEvent) {
        var view = this.getView();
        this.marginLeft = 0;
        this.tblPageCount = 0;
        view.byId("btn_prev").setEnabled(false);
        var params = oEvent.getParameters();
        var tPage = params.targetPage;
        var oTable = view.byId("lt");
        var len = oTable.getBinding("rows").getLength();
        var vRC = len % this.recPerPage;
        if (tPage === oEvent.getSource().getNumberOfPages() && vRC !== 0) {
          oTable.setVisibleRowCount(vRC);

        } else {
          oTable.setVisibleRowCount(this.recPerPage);
        }
        oTable
          .setFirstVisibleRow((tPage - 1) * this.recPerPage);

        this.oTabLoadFinishedDeferred = $.Deferred();
        oTable.invalidate();
        this.waitForLoading(function() {
          this.renderBtnTable(true);
        });

      },
      _prepareScreen: function(sChannel, event, data) {
      	if(data.src==="PlanningAdvisor"){
    	this.setMarket();
    	// this.setFilters();
    // 	this.oFilterLoadFinished=$.Deferred();
        if(this.getSearchLoadDefObj()){
            if(this.getSearchLoadDefObj().state()!=="pending"){
                this.setSearchLoadDefObj();
            }
        }
        
    	var btnTable = this.getView().byId("lt");
        var oModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
        oModel.setSizeLimit(99999);
        var model = oModel.getProperty("/ProductCollection");
        var gDt = this.getGraphDates(model);
        var rowModel = this.getRowModel(model, gDt.min, gDt.max);
        var btnTabModel = new sap.ui.model.json.JSONModel(rowModel);
        btnTabModel.setSizeLimit(99999);
        this.swimLaneModel = rowModel;
        this.filterSwimLaneModel = new sap.ui.model.json.JSONModel();
        this.filterSwimLaneModel.setSizeLimit(99999);
        this.filterSwimLaneModel.setData({
          data: this.swimLaneModel.data
        });
        btnTable.setModel(btnTabModel);
    	
	    	if(data.isSelectAll){
	    		this.generateDynamicFilters(this.getAllFilterSections(),"modelPA",false,true);
	    		
	    	}
	    	else{
	    		this.generateDynamicFilters(this.getAllFilterSections(),"modelPA",false,false);
	    	}
	    	this.setSearchBoxModel(this.getModel("filterPC"), "PA");
	    	this.inPrepareScreen=true;
	    	/*if (this.source === "Link" || this.source === null) {
            this.getEventBus().publish("container", "filter", {
              src: "Link"
            });
          }*/
    	}
    	else{
    	    this.inPrepareScreen=false;
    	}
      },
      filterContainers: function(channel, event, data) {
        var view = this.getView();
        if(this.getSearchLoadDefObj()){
            if(this.getSearchLoadDefObj().state()!=="pending" && !this.inPrepareScreen){
                    this.setSearchLoadDefObj();
            }
        }
        else{
            this.setSearchLoadDefObj();
            if(this.inPrepareScreen){
                this.getSearchLoadDefObj().resolve();
                this.inPrepareScreen=false;
            }
        }
        
       /* if(data.src!=="Search"){
            this.getSearchLoadDefObj().resolve();
        }*/
        
        $.when(this.getSearchLoadDefObj()).then($.proxy(function(){
            var source = data.src;
        this.source = source;
        if (source === "PA") {
        this.getFilter("alignFilter").length=0;
          var data1 = data.status;
          var dataFilter = [];
          for (var j = 0; j < data1.length; j++) {
            var color = "";
            var id = null;
            if (data1[j].status === this.oBundle.getText("legOnTime")) {
              color = "0";
              id = this.getFilterVal("PA").prefix + "_" + this.oBundle.getText("onTime").replace(/\s/g, "");
            } else if (data1[j].status === this.oBundle.getText("legLate")) {
              color = "1";
              id = this.getFilterVal("PA").prefix + "_" + this.oBundle.getText("late").replace(/\s/g, "");
            } else if (data1[j].status === this.oBundle.getText("legEarly")) {
              color = "-1";
              id = this.getFilterVal("PA").prefix + "_" + this.oBundle.getText("early").replace(/\s/g, "");
            } else if (data1[j].status === this.oBundle
              .getText("legArrived")) {
              color = "2";
              id = this.getFilterVal("PA").prefix + "_" + this.oBundle.getText("arrived").replace(/\s/g, "");
            } else if (data1[j].status === this.oBundle.getText("legUI")) {
              color = "3";
              id = this.getFilterVal("PA").prefix + "_" + this.oBundle.getText( "unidentified").replace(/\s/g, "");
            }
            // this.currCbId = view.byId(id).getId();
            // this.currFS = "PA";
            view.byId(id).setSelected(true);
            this.getFilter("alignFilter").push(new sap.ui.model.Filter(this.getFilterVal("PA").field, "EQ", color));
          }
          //aF = dataFilter;
         /* this.waitForFilterLoad(function() {
            var filterSections = [ "PF", "CF", "DF",
              "PRDF", "CATF", "POLF", "POAF"
            ];
            this.selectAllFilters(filterSections, false);
          });*/
        } else if (source === "PF") {
          this.getFilter("priorityFilter").length=0;
          var data2 = data.priority;
          dataFilter = [];
          for (j = 0; j < data2.length; j++) {
            var priority = "";
            id = null;
            if (data2[j].priority === this.oBundle
              .getText("legOS")) {
              priority = "1";
              id = this.getFilterVal("PF").prefix + "_" + this.oBundle.getText("outOfStock").replace(/\s/g, "");
            } else if (data2[j].priority === this.oBundle.getText("legLS")) {
              priority = "2";
              id = this.getFilterVal("PF").prefix + "_" + this.oBundle.getText("lowStock").replace(/\s/g, "");
            } else if (data2[j].priority === this.oBundle
              .getText("legNF")) {
              priority = "3";
              id = this.getFilterVal("PF").prefix + "_" + this.oBundle.getText("noFlag").replace(/\s/g, "");
            }
            // this.currCbId = view.byId(id).getId();
            // this.currFS = "PF";
            view.byId(id).setSelected(true);
            this.getFilter("priorityFilter").push(new sap.ui.model.Filter(this.getFilterVal("PF").field, "EQ", priority));
            //this.refreshModel("ALL");
          }
          //this.priorityFilter = dataFilter;
           /*this.waitForFilterLoad(function() {
            var filterSections = [ "AF", "CF", "DF",
              "PRDF", "CATF", "POLF", "POAF"
            ];
            this.selectAllFilters(filterSections, false);
          });*/

        } else if (source === "Search") {
          this.searchFilters = data.searchFilters;
          view.byId("search").setValue(data.query);
          this.getView().byId("filterBox").setVisible(false);
        //   this.refreshModel("ALL");
        } else if (this.source === "Link") {
          /*this.waitForFilterLoad(function() {
            var filterSections = ["AF", "PF", "CF", "DF",
              "PRDF", "CATF", "POLF", "POAF"
            ];
            this.selectAllFilters(filterSections, false);*/
            /*this.isCustom = true;
            this.getView().byId("_prod_SeeAllBtn")
              .firePress();
            this.isCustom = false;120416*/
          //});
// 			this.refreshModel("All");
        }
        /*if (source === "Link" || this.firstTime !== true) {
          this.oFilterAdjustedDeferred.resolve();
        }*/
        // this.refreshModel("ALL");
        /*this.isCustom = true;
        this.getView().byId("_prod_SeeAllBtn").firePress();
        this.isCustom = true;
        this.getView().byId("_cat_SeeAllBtn").firePress();120416*/
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();
        if(typeof sPreviousHash!=="undefined"){
            this.refreshPageElements(this.getAllFilterSections(),"modelPA",false,false);
        }
        
        // this.uncheckZeroCounters();
        this.adjustAllFilters("NONE",
                  this.getFilter("allFilters"), [
                    this.getFilter("priorityFilter"), 
			        this.getFilter("alignFilter"),
			        this.getFilter("destFilter"),
			        // 31Aug2016
			        // this.getFilter("productFilter"),
			        this.getFilter("categoryFilter"),
			        this.getFilter("countryFilter"),
			        this.getFilter("polFilter"), 
			        this.getFilter("poaFilter")
                  ]);
        if (this.firstTime === true) {
          this.firstTime = false;
        }
        this.setSeeAllVisibility("ALL");
        this.isCustomCollapse=true;
        this.getView().byId("right").firePress();
        },this));
        
      },
      waitForFilterLoad: function(fnToExecute) {
        $.when(this.oFilterLoadFinishedDeferred).then(
          $.proxy(fnToExecute, this));

      },
      prevPage: function(oEvent) {
        this.tblPageCount--;
        if (this.tblPageCount <= 0) {
          sap.ui.getCore().byId(oEvent.getSource().getId()).setEnabled(false);
          this.getView().byId("btn_next").setEnabled(true);
        } else {
          sap.ui.getCore().byId(oEvent.getSource().getId()).setEnabled(true);
          this.getView().byId("btn_next").setEnabled(true);
        }
        this.refreshModel("NAV");
      },

      nextPage: function(oEvent) {
        this.tblPageCount++;
        if (this.tblPageCount < this.iModelAllCnt / 7 - 3) {
          sap.ui.getCore().byId(oEvent.getSource().getId())
            .setEnabled(true);
          this.getView().byId("btn_prev").setEnabled(true);
        } else {
          sap.ui.getCore().byId(oEvent.getSource().getId())
            .setEnabled(false);
        }
        this.refreshModel("NAV");

      },

      getRowModel: function(allData, minDate, maxDate) {
        var dataModel = [];
        var data2Model = [];
        var weekModel = [];
        var todayModel = {};
        minDate = sap.ui.core.format.DateFormat
          .getDateInstance({
            pattern: 'yyyyMMdd',
            UTC:true
          }).parse(minDate);

        var dn = minDate.getDay();
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
        var diff = Utility.getDateDiff(minDate, maxDate,
          "yyyyMMdd") + 1;

        var today = sap.ui.core.format.DateFormat
          .getDateInstance({
            pattern: 'yyyyMMdd'
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

          actualDate = rowData.UDelDate;
          plannedDate = rowData.InitDelDate;
          po = rowData.PO;

          pol = rowData.PortOfLoading;
          poa = rowData.PortOfDischarge;

          var date = DateFormat.getDateInstance({
              pattern: 'yyyyMMdd'
            }).parse(minDate);

          // var start = false, count = 0, weekn = Utility
          //     .getWeek(minDate, "yyyyMMdd");
          var data = {
            'GUID': rowData.GUID,
            'AlignmentText': alignmentText,
            'AlignmentColor': alignmentColor,
            'AlignStatus': rowData.AlignStatus,
            'ActualDate': actualDate,
            'PlannedDate': plannedDate,
            'DateDiff': dateDiff,
            'Container': container,
            'Priority': priority,
            'SKU':rowData.SKU,
            // 31Aug2016
            'GRInd':rowData.GRInd,
            'CategoryDesc':rowData.CategoryDesc,
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
          dataModel.push(data);
        }
        return {
          data: dataModel,
          data2: data2Model,
          weekModel: weekModel,
          todayModel: todayModel
        };
      },

      containerPress: function(oEvent) {
        // for auto tick of filters
        this.source = null;
        this.setfilterSubModel();
        var con = oEvent.getSource().getBindingContext().sPath;
        con = con.substring((con.lastIndexOf("/") + 1));
        var tot = this.getView().byId("lt").getRows().length;
        var cid = oEvent.getSource().getModel().oData.data[parseInt(con)].GUID;
        var paramModel = this.getOwnerComponent().getModel(
          "paramModel");
        // End
        var bus = this.getEventBus();
        this.getRouter().navTo("ContainerDetailP", {
          direction: paramModel.getProperty("/direction"),
          type: paramModel.getProperty("/type"),
          fromDate: paramModel.getProperty("/fromDate"),
          toDate: paramModel.getProperty("/toDate"),
          companyCode:paramModel.getProperty("/companyCode"),
          guid: cid
        }, false);
        $.sap.delayedCall(500,this,function(){
        bus.publish("container", "detail", {
          data: {
            Container: cid,
            // context: oEvent.getSource().getBindingContext(),
            total: tot,
            source: "RP",
            mkt: this.getView().byId("marketList")
              .getSelectedKey()
          }
        });
        });

      },

      navBack: function(oEvent) {
          if (this.getOwnerComponent().getModel("filterPC")) {
          if (this.getOwnerComponent().getModel("filterPC").oData.ProductCollection.length > 0) {
        // var oHistory = History.getInstance();
        // var sPreviousHash = oHistory.getPreviousHash();
        var paramModel = this.getModel("paramModel");
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
        /*if (this.getOwnerComponent().getModel("LocalModel")) {
          if (this.getOwnerComponent().getModel("LocalModel").oData.ProductCollection.length > 0) {
            // for auto tick of filters
            this.source = null;
            // this.priorityFilter = [];
            // this.alignFilter = [];
            // this.countryFilter = [];
            // this.destFilter = [];
            // this.prdFilter = [];
            // this.catFilter = [];
            // this.productFilter = [];
            // this.categoryFilter = [];
            // this.allFilters.aFilters = [];
            // this.allFilters.bAnd = false;
            // this.searchFilters = [];
            // this.currCbId = null;
            // this.setFilters();
            this.getView().byId("filterBox").setVisible(true);
            this.getView().byId("search").setValue("");
            var paramModel = this.getOwnerComponent().getModel(
              "paramModel");
            // End
            this.getRouter().navTo("DashboardP", {
              direction: paramModel.getProperty("/direction"),
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
        }*/

      },

      toDCLoad: function(oEvent) {
        if (this.getOwnerComponent().getModel("LocalModel")) {
          if (this.getOwnerComponent().getModel("LocalModel").oData.ProductCollection.length > 0) {
            // this.priorityFilter = [];
            // this.alignFilter = [];
            // this.countryFilter = [];
            // this.destFilter = [];
            // this.prdFilter = [];
            // this.catFilter = [];
            // this.productFilter = [];
            // this.categoryFilter = [];
            // this.allFilters.aFilters = [];
            // this.allFilters.bAnd = false;
            // this.searchFilters = [];
            // this.currCbId = null;
            // this.setFilters();
            this.getView().byId("filterBox").setVisible(true);
            this.getView().byId("search").setValue("");
            var paramModel = this.getOwnerComponent().getModel(
              "paramModel");
            this.getRouter().navTo("DistributionCenterLoadP", {
              direction: paramModel.getProperty("/direction"),
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
      },

      tableItemPress: function(oControlEvent)

      {
        this.setfilterSubModel();
        var sIdx = oControlEvent.getSource().getSelectedIndex();
        var context = oControlEvent.getSource().getRows()[sIdx]
          .getBindingContext().sPath;

        var tot = oControlEvent.getSource().getRows().length;
        var tabModel = oControlEvent.getSource().getModel();
        var cid = tabModel.getProperty(context + "/GUID");
        var paramModel = this.getOwnerComponent().getModel(
          "paramModel");
        // End
        var bus = this.getOwnerComponent().getEventBus();
        this.getRouter().navTo("ContainerDetailP", {
          direction: paramModel.getProperty("/direction"),
          type: paramModel.getProperty("/type"),
          fromDate: paramModel.getProperty("/fromDate"),
          toDate: paramModel.getProperty("/toDate"),
          companyCode:paramModel.getProperty("/companyCode"),
          guid: cid
        }, false);
        $.sap.delayedCall(500,this,function(){
        bus.publish("container", "detail", {
          data: {
            Container: cid,
            context: context,
            total: tot,
            source: "RP",
            mkt: this.getView().byId("marketList")
              .getSelectedKey()
          }
        });
        });
      },

      setfilterSubModel: function() {
        // Added for Sub filter Model
        var filter = null;
        if (this.getView().byId("filterBox").getVisible()) {
          filter = this.getFilter("allFilters");
        } else {
          filter = this.searchFilters;
        }
        var oModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
        oModel.setSizeLimit(99999);
        var oBindingforSubModel = oModel.bindList("/ProductCollection");
        oBindingforSubModel.filter(filter);
        var contexts = oBindingforSubModel.getContexts(0, oBindingforSubModel.getLength());
        var filterItems = [];
        for (var i = 0; i < oBindingforSubModel.getLength(); i++) {
          var item = oModel.getProperty(contexts[i].sPath);
          filterItems.push(item);
        }
        var filterSubPC = new sap.ui.model.json.JSONModel();
        filterSubPC.setSizeLimit(99999);
        filterSubPC.setData({
          "ProductCollection": filterItems
        });
        this.getOwnerComponent().setModel(filterSubPC,
          "filterSubPC");
      },

      search: function(oEvent) {
        // for auto tick of filters
        this.source = null;
        var btnId = oEvent.getSource().getId(),contexts=null;
        var rBtnId = this.getView().byId("refreshBtn").getId();
        var query = this.getView().byId("search").getValue();
        if (typeof query === "undefined" || query === "" || query === null || query.length === 0 || btnId === rBtnId) {
          if (btnId === rBtnId) {
            this.getView().byId("search").setValue("");
          }
          this.getView().byId("filterBox").setVisible(true);
          this.refreshModel("ALL");

        } else {
          this.getView().byId("filterBox").setVisible(false);
          query = "" + query;
          var searchModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
          searchModel.setSizeLimit(99999);
          var searchBinding = searchModel.bindList("/ProductCollection");
          contexts = searchBinding.getContexts(0, searchBinding.getLength());
          var compressedQuery = query;
          var filterParams = this.getFilterParameters(compressedQuery);
          var allSearchFilters = [];
          this.searchFilters = [];
          if (filterParams != null) {
            if (filterParams.searchField !== "") {
              if (filterParams.searchField === "SKU") {
                var searchFilterSKU = new sap.ui.model.Filter(
                  "SKU",
                  sap.ui.model.FilterOperator.Contains,
                  filterParams.searchEntry);
                /*for (var i = 0; i < searchBinding.getLength(); i++) {
                  var skuBinding = searchModel
                    .bindList("/ProductCollection/" + i + "/ItemSet/results");
                  skuBinding.filter(searchFilterSKU);

                  if (skuBinding.getLength() > 0) {
                    var item = searchModel
                      .getProperty(contexts[i].sPath);
                    allSearchFilters
                      .push(new sap.ui.model.Filter(
                        "GUID",
                        sap.ui.model.FilterOperator.EQ,
                        item.GUID));
                  }

                }

                this.searchFilters
                  .push(new sap.ui.model.Filter({
                    aFilters: allSearchFilters,
                    bAnd: false
                  }));*/
                  this.searchFilters.push(searchFilterSKU);
              } else {
                this.searchFilters
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
              allSearchFilters.push(searchFilterLDP);
              allSearchFilters.push(searchFilterCN);
              allSearchFilters.push(searchFilterPO);
              allSearchFilters.push(searchFilterASN);
              allSearchFilters.push(searchFilterSTO);

              /*searchFilterSKU = new sap.ui.model.Filter(
                "SKU", filterParams.filterOperator,
                filterParams.searchEntry);
              contexts = searchBinding.getContexts(0, searchBinding.getLength());
              for (i = 0; i < searchBinding.getLength(); i++) {

                skuBinding = searchModel
                  .bindList("/ProductCollection/" + i + "/ItemSet/results");
                skuBinding.filter(searchFilterSKU);

                if (skuBinding.getLength() > 0) {
                  item = searchModel
                    .getProperty(contexts[i].sPath);
                  allSearchFilters
                    .push(new sap.ui.model.Filter(
                      "GUID",
                      sap.ui.model.FilterOperator.EQ,
                      item.GUID));
                }

              }*/

              this.searchFilters
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
            if (this.searchFilters.length === 0) {
              var oFalseFilter1 = new sap.ui.model.Filter("Container", "EQ", '0');
              this.searchFilters.push(oFalseFilter1);
            }
          }
          searchBinding.filter(this.searchFilters);
          var rL = searchBinding.getLength();
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.SEARCH,this.EvtAct.DIS_RES, rL);
          this.refreshModel("NONE");
        }
      },
      _resetFilters: function(sChannelId, oEvent, data) {
        // this.priorityFilter = [];
        // this.alignFilter = [];
        // this.countryFilter = [];
        // this.destFilter = [];
        // this.prdFilter = [];
        // this.productFilter = [];
        // this.catFilter = [];
        // this.categoryFilter = [];
        // this.poaFilter = [];
        // this.polFilter = [];
        // this.allFilters.aFilters = [];
        // this.allFilters.bAnd = false;
        // var oFilter=new sap.ui.model.Filter("GUID","EQ",0);
        // this.removeFromFilter(oFilter,this.getFilter("allFilters"));
        this.searchFilters = [];
        // this.currCbId = null;
        // this.setFilters();
        this.getView().byId("filterBox").setVisible(true);
        this.getView().byId("search").setValue("");

      },
      clicktoExpand: function(evt) {
        var dph = this.getView().byId("drawPnlHdr");
        var dp = this.getView().byId("drawPnl");
        var pgPnl = this.getView().byId("pagPanel");
        var tsb = this.getView().byId("topSearchBarFixed");
        var oFilterBox = this.getView().byId("routePgHBox");
        var oGraphBox = this.getView().byId("graphBox");
        var icon = evt.getSource().getIcon();
        var prevBtn = this.getView().byId("btn_prev");
        var nextBtn = this.getView().byId("btn_next");
        if (icon === "sap-icon://media-reverse") {
          if (this.isCustomCollapse) {
            this.isCustomCollapse = false;
          } else {
            // For GA Tagging
            this.trackGAEvent(this.EvtCat.PANE,
              this.EvtAct.HIDE, "");
          }
          oFilterBox
            .addStyleClass("invisibleFirstFlexItem paTglCol");
          oFilterBox.removeStyleClass("zIdxTglBtnExpanded");
          oFilterBox.addStyleClass("zIdxTglBtnCollapsed");
          oGraphBox.addStyleClass("totalWidth");
          evt.getSource().setIcon("sap-icon://media-play");
          evt.getSource().setTooltip(this.oBundle.getText("expandFilter"));
          if (!prevBtn.hasStyleClass("fixedLeft3")) {
            prevBtn.addStyleClass("fixedLeft3");
          }
          if (!nextBtn.hasStyleClass("fixedLeft80")) {
            nextBtn.addStyleClass("fixedLeft80");
          }
          this.daysWidth = Math.round((window.innerWidth - (150 + (window.innerWidth * .12))) / 21);
          this.setSwimLaneModel(false);
          tsb.removeStyleClass("hlWidth");
          tsb.addStyleClass("hlWidthFull");

        } else {
          if (this.isCustomCollapse) {
            this.isCustomCollapse = false;
          } else {
            // For GA Tagging
            this.trackGAEvent(this.EvtCat.PANE,
              this.EvtAct.SHOW, "");
          }
          oFilterBox
            .removeStyleClass("invisibleFirstFlexItem paTglCol");
          oFilterBox.addStyleClass("zIdxTglBtnExpanded");
          oFilterBox.removeStyleClass("zIdxTglBtnCollapsed");
          oGraphBox.removeStyleClass("totalWidth");
          evt.getSource().setIcon("sap-icon://media-reverse");
          evt.getSource().setTooltip(this.oBundle.getText("collapseFilter"));
          if (prevBtn.hasStyleClass("fixedLeft3")) {
            prevBtn.removeStyleClass("fixedLeft3");
          }
          if (nextBtn.hasStyleClass("fixedLeft80")) {
            nextBtn.removeStyleClass("fixedLeft80");
          }
          this.daysWidth = Math.round((window.innerWidth - (.32 * window.innerWidth + 150)) / 21);
          this.setSwimLaneModel(false);
          tsb.removeStyleClass("hlWidthFull");
          tsb.addStyleClass("hlWidth");

        }
        dp.setWidth((this.daysWidth * 21) + "px");
        pgPnl.setWidth((this.daysWidth * 21) + "px");
        dph.setWidth((this.daysWidth * 21) + "px");
        this.marginLeft = 0 - (this.tblPageCount * this.daysWidth * 7);
        d3.select("#swimLaneHdr").style("margin-left",
          this.marginLeft + "px");
        d3.select("#swimLaneHeader").style("margin-left",
          this.marginLeft + "px");
       // this.getView().byId("lt").rerender();
       /* this.waitForLoading(function() {
          this.renderBtnTable(false);
        });*/
      },

      renderBtnTable: function(flag) {
        var btnTable = this.getView().byId("lt");
        var rows = btnTable.getRows();
        for (var i = 0; i < rows.length; i++) {
          var cells = rows[i].getCells();
          $.sap.byId(rows[i].sId).addClass(
            cells[0].getCustomData()[0].getValue());
        }
        if (flag === true) {
          this.marginLeft = 0;
          this.tblPageCount = 0;
        }
        if (this.flag) {
          this.setSwimLaneModel(true);
        }
        this.waitForLoad(function() {
          this.setSwimLaneModel(true);
          this.flag = true;
        });
      },
      waitForLoading: function(fnToExecute) {
        $.when(this.oTabLoadFinishedDeferred).then(
          $.proxy(fnToExecute, this));
      },
      waitForSLLoading: function(fnToExecute) {
        $.when(this.oSLLoadFinishedDeferred).then(
          $.proxy(fnToExecute, this));
      },
      waitForFilterAdjust: function(fnToExecute) {
        $.when(this.oFilterAdjustedDeferred).then(
          $.proxy(fnToExecute, this));
      },
      getSwimLaneChunkModel: function(rowModel, pageCount) {
        var start = pageCount * 7;
        var end = start + (this.numOfWeeks * 7) + 1;
        var columns = rowModel.columns.slice(start, end);
        var metaModel = {
          columns: columns,
          data: rowModel.data
        };
        return metaModel;
      },

      adjustData: function(data) {
        var start = 0;
        var end = 0;
        var view = this.getView();
        var p = view.byId("pa_paginator");
        var currPage = p.getCurrentPage();
        start = (currPage - 1) * this.recPerPage;
        end = start + this.recPerPage;
        if (currPage === p.getNumberOfPages()) {
          data = data.slice(start);
        } else {
          data = data.slice(start, end);
        }
        return data;
      },
      next: function(oEvent) {
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.CHART_RANGE,
          this.EvtAct.CLICK, "Next");
        var view = this.getView();

        this.tblPageCount += 1;
        if (this.tblPageCount < this.weekModel.length - 3) {

          oEvent.getSource().setEnabled(true);
          view.byId("btn_prev").setEnabled(true);
        } else {
          oEvent.getSource().setEnabled(false);
          view.byId("btn_prev").setEnabled(true);
        }

        this.marginLeft -= (this.daysWidth * 7);
        var id = this._oSwimLane.getId();
        this._oSwimLane.setMarginLeft(this.marginLeft);
        d3.select("#" + id + "-swimLaneHdr").style("margin-left",
          this.marginLeft + "px");
        d3.select("#" + id + "-swimLaneHeader").style("margin-left",
          this.marginLeft + "px");
      },
      previous: function(oEvent) {
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.CHART_RANGE,
          this.EvtAct.CLICK, "Previous");
        var view = this.getView();

        this.tblPageCount -= 1;
        if (this.tblPageCount === 0) {
          oEvent.getSource().setEnabled(false);
          view.byId("btn_next").setEnabled(true);
        } else {
          oEvent.getSource().setEnabled(true);
          view.byId("btn_next").setEnabled(true);
        }
        this.marginLeft += (this.daysWidth * 7);
        var id = this._oSwimLane.getId();
        this._oSwimLane.setMarginLeft(this.marginLeft);
        d3.select("#" + id + "-swimLaneHdr").style("margin-left",
          this.marginLeft + "px");
        d3.select("#" + id + "-swimLaneHeader").style("margin-left",
          this.marginLeft + "px");
      },
      remove: function() {
        if (document.getElementById("swimLaneHdr") !== null) {
          d3.select("#swimLaneHdr").remove();
        }
        if (document.getElementById("swimLaneHeader") !== null) {
          d3.select("#swimLaneHeader").remove();
        }
      },
      setFilterSwimLaneModel: function(filter) {
        var oBinding = this.filterSwimLaneModel.bindList("/data");
        oBinding.filter(filter);
        var filterItems = [];
        var contexts = oBinding.getContexts(0, oBinding.getLength());
        for (var i = 0; i < oBinding.getLength(); i++) {
          var item = this.filterSwimLaneModel.getProperty(contexts[i].sPath);
          filterItems.push(item);
        }
        this.currSwimLaneModel = new sap.ui.model.json.JSONModel();
        this.currSwimLaneModel.setSizeLimit(99999);
        this.currSwimLaneModel.setData({
          "data": filterItems
        });
      },

      uncheckZeroCounters: function() {
        var view = this.getView();
        var filterSection = [{
          section: "PRD",
          filterObj: this.getFilter("productFilter")
        //   filterObjUC: this.getFilter("productFilterUC")
        }, {
          section: "CAT",
          filterObj: this.getFilter("categoryFilter")
        //   filterObjUC: this.getFilter("categoryFilterUC")
        }];
        var filterVal=null,oFilter=null,cb=null,count=0,c=0,searchFilter=null;
         var calcModel = new JSONModel(this.getModel("filterPC").getProperty("/"));
         calcModel.setSizeLimit(99999);
         var oCalcBinding = calcModel.bindList("/ProductCollection");
        for (var x = 0; x < filterSection.length; x++) {
          filterVal = this.getFilterVal(filterSection[x].section);
          var fs = this.getFilterStateFor(filterSection[x].section, view);
          var cbArr = fs.data;
          for (var i = 0; i < cbArr.length; i++) {
            oFilter = [];
            cb = view.byId(cbArr[i].cbId);
            c = cb.getModel().getProperty(cb.getBindingContext().getPath() + "/CurrCount");
            // contexts = oCalcBinding.getContexts(0, oCalcBinding.getLength());
            searchFilter = new sap.ui.model.Filter(filterVal.field, sap.ui.model.FilterOperator.Contains, cb.getModel()
              .getProperty("/" + filterVal.context + "/" + i + "/value"));
            count = oCalcBinding.filter(searchFilter).getLength();
            if(count>0){
            	oFilter.push(searchFilter);
            }
           /* for (var j = 0; j < oCalcBinding.getLength(); j++) {

              var subBinding = oModel
                .bindList("/ProductCollection/" + j + "/ItemSet/results");
              subBinding.filter(searchFilter);

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
            }*/

            if (c === "0") {
              cb.setSelected(false);
              for (var k = 0; k < oFilter.length; k++) {
                this.removeFromFilter(oFilter[k],
                  filterSection[x].filterObj);
                //   this.addToFilter(oFilter[k],
                //   filterSection[x].filterObjUC);
                
              }
              
            }

          }
          /*this.adjustAllFilters("NONE",
                  this.allFilters, [
                    this.priorityFilter,
                    this.alignFilter,
                    this.destFilter,
                    this.productFilter,
                    this.categoryFilter,
                    this.countryFilter,
                    this.polFilter,
                    this.poaFilter
                  ]);
          this.checkCounters();*/
        }
       /* this.adjustAllFilters("NONE",
                  this.allFilters, [
                    this.priorityFilter,
                    this.alignFilter,
                    this.destFilter,
                    this.productFilter,
                    this.categoryFilter,
                    this.countryFilter,
                    this.polFilter,
                    this.poaFilter
                  ]);*/
          this.checkCounters();
      },
      checkCounters: function() {
        var view = this.getView();
        var filterSection = [{
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
			/*{
				section: "PRD",
				filterObj: this.getFilter("productFilter")
				// filterObjUC: this.getFilter("productFilterUC")
			},*/ 
			{
				section: "CAT",
				filterObj: this.getFilter("categoryFilter")
				// filterObjUC: this.getFilter("categoryFilterUC")
			}];
        for (var x = 0; x < filterSection.length; x++) {
          if (this.source === filterSection[x].section) {
            x++;
          }
          var filterVal = this.getFilterVal(filterSection[x].section);
          var fs = this.getFilterStateFor(filterSection[x].section, view);
          var cbArr = fs.data;
          var cb = null,
            oFilter = null;
          for (var i = 0; i < cbArr.length; i++) {
            cb = view.byId(cbArr[i].cbId);
            // fullCbId = view.byId(cbArr[i].cbId).getId();
            var c = cb.getModel().getProperty(cb.getBindingContext().getPath() + "/CurrCount");
            // if (fullCbId !== oController.currCbId ||
            // fullCbId === oController.currCbId) {
            oFilter = new sap.ui.model.Filter(filterVal.field, filterVal.filterOp, cb.getModel()
              .getProperty(
                "/" + filterVal.context + "/" + i + "/value"));
            if (c.toString() === "0") {
              cb.setSelected(false);
              this.removeFromFilter(oFilter,
                filterSection[x].filterObj);
            //   this.addToFilter(oFilter,
            //     filterSection[x].filterObjUC);
             
            }
            /*else{
                cb.setSelected(true);
              this.addToFilter(oFilter,
                filterSection[x].filterObj);
            }*/
          }
           /*this.adjustAllFilters("NONE",
                this.allFilters, [
                  this.priorityFilter,
                  this.alignFilter,
                  this.destFilter,
                  this.productFilter,
                  this.categoryFilter,
                  this.countryFilter,
                  this.polFilter,
                  this.poaFilter
                ]);*/
        }
        /*this.adjustAllFilters("NONE",
                this.allFilters, [
                  this.priorityFilter,
                  this.alignFilter,
                  this.destFilter,
                  this.productFilter,
                  this.categoryFilter,
                  this.countryFilter,
                  this.polFilter,
                  this.poaFilter
                ]);*/
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
      /*updateParamModel: function() {
        if (this.urlParams) {
          var paramModel = new sap.ui.model.json.JSONModel();
          paramModel.setData({
            direction: this.urlParams.direction,
            type: this.urlParams.type,
            fromDate: this.urlParams.fromDate,
            toDate: this.urlParams.toDate,
            companyCode: this.urlParams.companyCode
          });
          this.getOwnerComponent().setModel(paramModel, "paramModel");
        }
      },*/

      setSwimLaneModel: function(isAnimate) {
        var view = this.getView(),i=0;
        var d = ["M", "T", "W", "T", "F", "S", "S"];
        var days = [];

        var todayX = this.swimLaneModel.todayModel;
        var data = this.currSwimLaneModel.oData.data;
        data = this.adjustData(data);
        var dates = this.getGraphDates(data);
        var wM = this.getWeekModel(dates.min, dates.max);
        this.weekModel = wM.weeks;
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

        for ( i = 0; i < this.weekModel.length; i++) {
          days = days.concat(d);
        }

        //   if(isAnimate === true){
        // for start and end cell
        for ( i = 0; i < data.length; i++) {
          var rowData = data[i];
          if (rowData.AlignStatus === "1") {
            rowData.x = Utility.getDateDiff(wM.minDate, rowData.InitDelDate,
              "yyyyMMdd");
            rowData.width = Utility.getDateDiff(wM.minDate,
              rowData.UDelDate, "yyyyMMdd") - rowData.x;
          } else if (rowData.AlignStatus === "0") {
            rowData.x = Utility.getDateDiff(wM.minDate, rowData.InitDelDate,
              "yyyyMMdd");
          } else if (rowData.AlignStatus === "-1") {
            rowData.x = Utility.getDateDiff(wM.minDate,
              rowData.UDelDate, "yyyyMMdd");
            rowData.width = Utility.getDateDiff(wM.minDate,
              rowData.InitDelDate, "yyyyMMdd") - rowData.x;
          } else if (rowData.AlignStatus === "2") {
            rowData.x = Utility.getDateDiff(wM.minDate,
              rowData.UDelDate, "yyyyMMdd");
          } else if (rowData.AlignStatus === "3") {
            rowData.x = Utility.getDateDiff(wM.minDate, rowData.InitDelDate,
              "yyyyMMdd");
          }
        }
        var today = sap.ui.core.format.DateFormat
          .getDateInstance({
            pattern: 'yyyyMMdd'
          }).format(new Date());
        todayX = Utility.getDateDiff(wM.minDate, today,
          "yyyyMMdd");
        var todayModel = {
          todayX: todayX
        };
        todayX = todayModel;
        // end of start and end cell
        // }
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setProperty("/days", days);
        oModel.setProperty("/weeks", this.weekModel);
        oModel.setProperty("/data", data);
        oModel.setProperty("/todayX", todayX);
        oModel.setProperty("/filterPC", this.getModel("filterPC").getProperty("/"));
        this._oSwimLane.setModel(oModel);
        this._oSwimLane.setAnimate(isAnimate);
        this._oSwimLane.setMarginLeft(this.marginLeft);
        this._oSwimLane.setDayWidth(this.daysWidth);
        this._oSwimLane.refreshSwimLane();
      },
      getAllFilterSections:function(){
      	// return ["PA","PF","OC","DDC","PRD","CAT","POL","POA"];
      	// 31Aug2016
      	return ["PA","PF","OC","DDC","CAT","POL","POA"];
      }

      /**
       * Called when the Controller is destroyed. Use this one to free
       * resources and finalize activities.
       *
       * @memberOf view.RouteDetail
       */
      // onExit: function() {
      //
      // }
    });
});