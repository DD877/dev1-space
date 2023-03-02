sap.ui.define([
	"glb/gtmh/oct/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"glb/gtmh/oct/controls/DonutChartCust",
	"glb/gtmh/oct/util/Utility",
	"sap/ui/core/routing/History"
], function(BaseController, JSONModel, MessageBox, DonutChartCust, Utility, History) {
	"use strict";
	return BaseController.extend("glb.gtmh.oct.controller.Root", {
		onInit:function(){
			BaseController.prototype.onInit.call(this);
			this.initializeVariables();
			var view = this.getView();
			var bus=this.getEventBus();
	        bus.subscribe("all", "showOverlay", this.showOverlay, this);
	        bus.subscribe("root", "loadData", this._loadData, this);
	        bus.subscribe("all", "prepareScreen", this._prepareScreen, this);
	        bus.subscribe("root", "localRefresh", this._localRefresh, this);
	        bus.subscribe("root", "clicktoExpand",this._clicktoExpand, this);
	        bus.subscribe("dp", "preventExecution",this._preventExecution, this);
			var btnId = this.getView().byId("searchBtn").getId();
	        view.byId("search").setFilterFunction(
	          function(sTerm, oItem) {
	            // A case-insensitive 'string contains'
	            // style filter
	            return oItem.getText().match(
	              new RegExp(sTerm, "i"));
	          });
	        view.byId("search").onsapenter = function(e) {
	          if (sap.m.InputBase.prototype.onsapenter) {
	            sap.m.InputBase.prototype.onsapenter.apply(
	              this, arguments);
	          }
	
	          sap.ui.getCore().byId(btnId).firePress();
	        };
	        this.oPieLoadFinishedDeferred = $.Deferred();
	        this._oAlignDonut = new DonutChartCust(view.createId('alignDonut'), {
	          noDataText: "No data!",
	          outerRadius: 9,
	          innerRadius: 6,
	          onChartSelect: $.proxy(function(oEvent) {
	            var data = oEvent.getParameter("data");
	            this.alignChartSelect(data);
	          }, this)
	        });
	        view.byId("panelPA").addContent(this._oAlignDonut);
	
	        this._oFlagDonut = new DonutChartCust(view.createId('flagDonut'), {
	          noDataText: "No data!",
	          outerRadius: 9,
	          innerRadius: 6,
	          onChartSelect: $.proxy(function(oEvent) {
	            var data = oEvent.getParameter("data");
	            this.priorityChartSelect(data);
	          }, this)
	        });
	        view.byId("panelFC").addContent(this._oFlagDonut);
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
      		this.initiateMainServiceCall(false,"Dashboard");
      	}
      },
      _clicktoExpand: function(evt) {
        var oFilterBox = this.getView().byId("fBox");
        var oMainBox = this.getView().byId("upperArea");
        var icon = evt.getSource().getIcon();

        if (icon.toLowerCase() === "sap-icon://media-reverse") {
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.PANE,
            this.EvtAct.HIDE, "");
          oFilterBox
            .addStyleClass("invisibleFirstFlexItem dpTglCol");
          oMainBox.addStyleClass("totalWidth");
          evt.getSource().setIcon("sap-icon://media-play");
          evt.getSource().setTooltip(this.oBundle.getText("expandFilter"));
          d3.selectAll(".legend").attr("visibility",
            "visible");
        } else {
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.PANE,this.EvtAct.SHOW, "");
          oFilterBox.removeStyleClass("invisibleFirstFlexItem dpTglCol");
          oMainBox.removeStyleClass("totalWidth");
          evt.getSource().setIcon("sap-icon://media-reverse");
          evt.getSource().setTooltip(this.oBundle.getText("collapseFilter"));
          d3.selectAll(".legend")
            .attr("visibility", "hidden");
        }

      },
		tableItemPress: function(oControlEvent) {
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.DASHBOARD,
          this.EvtAct.CLICK, "Recent ETA Update");
        var context = oControlEvent.getSource().getBindingContext();
        var tot = oControlEvent.getSource().getAggregation("cells").length;
        var tabModel = context.getModel();
        var cid = tabModel.getProperty(context + "/GUID");
        // Added for router
        var paramModel = this.getOwnerComponent().getModel( "paramModel");
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
       /* $.sap.delayedCall(500,this,function(){
        	bus.publish("container", "detail", {
          data: {
            Container: cid,
            context: context,
            total: tot,
            source: "DP",
            mkt: this.getView().byId("marketList")
              .getSelectedKey()
          },
          context: context
        });
        });*/
        
      },

      /**
       * Similar to onAfterRendering, but this hook is invoked
       * before the controller's View is re-rendered (NOT before
       * the first rendering! onInit() is used for that one!).
       *
       * @memberOf view.Root
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

      onAfterRendering: function() {
        var view = this.getView();
        var oTab1=view.byId("idProductsTable1");
        var oTab2=view.byId("idProductsTable");
        oTab1.addEventDelegate({
          onAfterRendering: $.proxy(function() {
            oTab1.setBusy(false);
            if(Utility.hasValue(this.oRenderDef)){
              this.oRenderDef.resolve();
            }
          }, this)
        }, this);

        oTab2.addEventDelegate({
          onAfterRendering: $.proxy(function() {
            oTab2.setBusy(false);
          }, this)
        }, this);

        var allList = ["originCountryList", "destDCList", "productList",
          "categoryList", "polList", "poaList"
        ];
        view.byId(allList[0]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            this.onAfterListRendering(view.byId(allList[0]));
          }, this)
        }, this);

        view.byId(allList[1]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            this.onAfterListRendering(view.byId(allList[1]));
          }, this)
        }, this);

        view.byId(allList[2]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            this.onAfterListRendering(view.byId(allList[2]));
          }, this)
        }, this);

        view.byId(allList[3]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            this.onAfterListRendering(view.byId(allList[3]));
          }, this)
        }, this);

        view.byId(allList[4]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            this.onAfterListRendering(view.byId(allList[4]));
          }, this)
        }, this);

        view.byId(allList[5]).addEventDelegate({
          onAfterRendering: $.proxy(function() {
            this.onAfterListRendering(view.byId(allList[5]));
          }, this)
        }, this);
	
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

      onExit: function() {
        if (this._oPopoverOL) {
          this._oPopoverOL.destroy();
          this._oPopoverOL = null;
        }
      },
      getPAChartModel: function() {
        var dataForPA = {
          "ContainerStatusCollection": [{
            "Alignment": this.oBundle
              .getText("legEarly"),
            "Containers": this.countE
          }, {
            "Alignment": this.oBundle
              .getText("legOnTime"),
            "Containers": this.countO
          }, {
            "Alignment": this.oBundle
              .getText("legLate"),
            "Containers": this.countL
          }, {
            "Alignment": this.oBundle
              .getText("legArrived"),
            "Containers": this.countA
          }, {
            "Alignment": this.oBundle
              .getText("legUI"),
            "Containers": this.countUI
          }]
        };
        this.modelPAChart.setData(dataForPA);
        var cntModel = {
          "Early": this.countE,
          "OnTime": this.countO,
          "Late": this.countL,
          "Arrived": this.countA,
          "Unidentified": this.countUI,
          "OutOfStock": this.countNS,
          "LowStock": this.countLS,
          "NoFlag": this.countNF,
          "MinDate": this.getOwnerComponent().getModel(
            "dateRangeModel").oData.min,
          "MaxDate": this.getOwnerComponent().getModel(
            "dateRangeModel").oData.max
        };

        this.countModel.setData(cntModel);
        this.getOwnerComponent().setModel(this.countModel,
          "countModel");

        this.getOwnerComponent().setModel(this.modelPAChart,
          "modelPAChart");
        return this.modelPAChart;

      },

      getFCChartModel: function() {
        var dataForFC = {
          "ContainerFlagCollection": [{
            "Flag": this.oBundle.getText("legNF"),
            "count": this.countNF
          }, {
            "Flag": this.oBundle.getText("legOS"),
            "count": this.countNS
          }, {
            "Flag": this.oBundle.getText("legLS"),
            "count": this.countLS
          }]

        };
        this.modelFCChart.setData(dataForFC);

        var cntModel = {
          "Early": this.countE,
          "OnTime": this.countO,
          "Late": this.countL,
          "Arrived": this.countA,
          "OutOfStock": this.countNS,
          "LowStock": this.countLS,
          "NoFlag": this.countNF,
          "MinDate": this.getOwnerComponent().getModel(
            "dateRangeModel").oData.min,
          "MaxDate": this.getOwnerComponent().getModel(
            "dateRangeModel").oData.max
        };

        this.countModel.setData(cntModel);
        this.getOwnerComponent().setModel(this.countModel,
          "countModel");
        this.getOwnerComponent().setModel(this.modelFCChart,
          "modelFCChart");

        return this.modelFCChart;

      },
      toPlanAdvisor: function() {
        if (this.getOwnerComponent().getModel("filterPC")) {
          if (this.getOwnerComponent().getModel("filterPC").oData.ProductCollection.length > 0) {
            // //Added for router
            var paramModel = this.getOwnerComponent().getModel(
              "paramModel");
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
      toDCLoad: function() {
        if (this.getOwnerComponent().getModel("subFilterPC")) {
          if (this.getOwnerComponent().getModel("subFilterPC").oData.ProductCollection.length > 0) {
            // var bus = this.getOwnerComponent().getEventBus();
            var paramModel = this.getOwnerComponent().getModel(
              "paramModel");
            var router = sap.ui.core.UIComponent
              .getRouterFor(this);
            router.navTo("DistributionCenterLoadP", {
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

      onRouteMatched: function(oEvent) {
      	var name = oEvent.getParameter("name");
        document.title = this.setDocTitle(name);
        if (name !== "Root" && name !== "RootNav" && name !== "DashboardP") {
          if (this.getDateSelectionDialog()) {
            if (this.getDateSelectionDialog().isOpen()) {
              this.onCloseDialog();
            }
          }
        } else {
            //Panel Height Fix
          $.sap.delayedCall(1000,this,function(){
          		var view = this.getView();
				var h = (screen.availHeight * 0.7) / 2;
				var extra = (screen.availHeight * 0.03);
				if (view.byId("panelPA")) {
					view.byId("panelPA").setHeight(h + "px");
					view.byId("panelFC").setHeight(h + "px");
					view.byId("pid").setHeight((h * 1.97 + extra) + "px");
					view.byId("panelFC").addStyleClass("panel_margin2");
				}
          });
          

          //End of Panel Height Fix
        	 if (this.getCustomHashChange() === true) {
	        	this.setCustomHashChange(false);
	          return;
	        }
          var locArr = window.location.href.split("#");
          var path = "";
          if (locArr.length > 1) {
            path = "#" + locArr[1];
          }
          var title = this.DASHBOARD;
          this.trackGAScreenEvent(path, title);
          
          
          //New logic
          if(name==="DashboardP"){
          	if(this.getModel("filterPC")){
          		var isValid = this.isValidParameters(oEvent.getParameters().arguments);
          		if(isValid){
          			this.getModel("appProperties").setProperty("/isDashboardBusy",true);
          			this.showBusy(['filterBox', 'alignDonut', 'flagDonut', 'idProductsTable1', 'idProductsTable']);
          			this.urlParams = oEvent.getParameters().arguments;
                	var bParamModelChanged = this.isParamModelChanged(this.urlParams);
                	if (bParamModelChanged === false) {
		              //  $.sap.delayedCall(0, this, function () {
		                	var oHistory = History.getInstance();
        					var sPreviousHash = oHistory.getPreviousHash();
		              //  	if(sPreviousHash.indexOf("Dashboard")===-1){
		                    if(this.getModel("appProperties").getProperty("/isDashboardLoaded")===false){
		                		if(typeof sPreviousHash==="undefined" || sPreviousHash.indexOf("ContainerDetail")!==-1){
		                		    $.sap.delayedCall(500, this, function () {
		                                this.initiateMainServiceCall(true,"Dashboard",true);
		                		    });
		                        }
		                        else {
		                            $.sap.delayedCall(500, this, function () {
		                                this.initiateMainServiceCall(false,"Dashboard",false);
		                            });
		                        }
		                	}
		                	else{
		                	    $.sap.delayedCall(500, this, function () {
		                		    this.initiateMainServiceCall(false,"Dashboard");
		                	    });
		                	}
		                    
		              //  });
                	}
                	else{
                		$.sap.delayedCall(500, this, function () {
		                    this.initiateMainServiceCall(true,"Dashboard",true);
		                });
                	}
          		}
          		else{
          			this.getRouter().navTo("Error",null,true);
          			return;
          		}
          	}
          	else{
          		this.getModel("appProperties").setProperty("/isDashboardBusy",true);
          		this.showBusy(['filterBox', 'alignDonut', 'flagDonut', 'idProductsTable1', 'idProductsTable']);
          		this.urlParams=oEvent.getParameters().arguments;
          		$.sap.delayedCall(1000, this, function () {
		            this.initiateMainServiceCall(true,"Dashboard",true);
		        });
          	}
          }
          else if(name==="Root" || name ==="RootNav"){
          	this.getModel("appProperties").setProperty("/isDashboardBusy",true);
          	this.setDefaultModels();
          	this.showBusy(['filterBox', 'alignDonut', 'flagDonut', 'idProductsTable1', 'idProductsTable']);
          	this.urlParams=null;
          	this.updateParamModel();
          	this.setCustomHashChange(false);
          	this.setHash("Dashboard");
      //    	$.sap.delayedCall(1000, this, function () {
		    //         this.initiateMainServiceCall(true,"Dashboard");
		    // });
          }
          
          //End of new logic
          
          
          
          
         /* if (this.getModel("filterPC")) {
            if (name === "DashboardP") {
              //if(this.noComputation===false){
            	this.showBusy(['filterBox', 'alignDonut', 'flagDonut', 'idProductsTable1', 'idProductsTable']);
              //}
              var isValid = this.isValidParameters(oEvent.getParameters().arguments);
              if (isValid === false) {
                // this.setDefaultModels();
              } else {
                this.urlParams = oEvent.getParameters().arguments;
                var bParamModelChanged = this.isParamModelChanged(this.urlParams);
                // this.updateParamModel();
                // if(this.noComputation===false){
                if (bParamModelChanged === false) {
                $.sap.delayedCall(1000, this, function () {
                    this.isCustomDateChangeEvent = true;
                    this.isLocalRefresh = false;
                    // this.handleDateRangePress();
                    this.initiateMainServiceCall(false,"Dashboard");
                    this.isCustomDateChangeEvent = false;
                });
                 
                } else {
                  $.sap.delayedCall(1000, this, function () {
                    // this.handleDateRangePress();
                    this.initiateMainServiceCall(true,"Dashboard");
                    });
                 
                }
                // }
                // else{
                //   this.noComputation=false;
                // }
              }
            } else {
              //if(this.noComputation===false){
              this.showBusy(['filterBox', 'alignDonut', 'flagDonut', 'idProductsTable1', 'idProductsTable']);
              this.setDefaultModels();
              $.sap.delayedCall(1000, this, function () {
                this.isCustomDateChangeEvent = true;
                this.initiateMainServiceCall(true,"Dashboard");
                this.isCustomDateChangeEvent = false;
              });
              
            // }
            //   else{
            //     this.noComputation=false;
            //   }
            }
          } else {
            if (name === "DashboardP") {
              this.showBusy(['filterBox', 'alignDonut', 'flagDonut', 'idProductsTable1', 'idProductsTable']);
              this.urlParams = oEvent.getParameters().arguments;

            } else if (name === "Root" && this.getModel("LocalModel")) {
              this.urlParams = null;
              this.setDefaultModels();
              $.sap.delayedCall(1000, this, function () {
                this.isCustomDateChangeEvent = true;
                this.initiateMainServiceCall(true,"Dashboard");
                this.isCustomDateChangeEvent = false;
              });
            } else {
              this.urlParams = null;
            }
          }*/
        }
        if (this._oPopover) {
          this._oPopover.close();
          this.getView().removeDependent(this._oPopover);
          this._oPopover.destroy();
          this._oPopover = null;
        }

      },
		initializeVariables:function(){
			this.firstTime = true;
			this.searchFilter = [];
			this.countModel = new JSONModel();
			this.modelPAChart = new JSONModel();
			this.modelFCChart = new JSONModel();
			this.countModel.setSizeLimit(99999);
			this.modelPAChart.setSizeLimit(99999);
			this.modelFCChart.setSizeLimit(99999);
			this.currCbId = null;
			this.source = null;
			this.oFilterLoadFinishedDeferred = null;
			this.oPieLoadFinishedDeferred = null;
			this.maxExpires = 3650;
			this.setNullFilterFlag(false);
			this.nullModel = new sap.ui.model.json.JSONModel();
			this.isCustomDateChangeEvent = false;
			this.urlParams = null;
			this.isLocalRefresh = false;
			this.moreThreshold = 10;
			this.isSuppressDateRangePress = false;
			this._oAlignDonut = null;
			this._oFlagDonut = null;
			this.countE = 0;
			this.countL = 0;
			this.countO = 0;
			this.countA = 0;
			this.countUI = 0;
			this.countNS = 0;
			this.countLS = 0;
			this.countNF = 0;
		},
		setOnlyBtnVisibility: function(btnId, isVisible) {
        sap.ui.getCore().byId(btnId).setVisible(isVisible);
      },
      liveChange: function(oControlEvent) {
        this.checkLiveChange(this, oControlEvent);
      },
      inGeniusQVRatingLiveChange: function(oEvent) {
        this.checkLiveChangeIngenius(this, oEvent);
      },
      selectChange: function(oControlEvent) {
        this.checkChange(this, oControlEvent);
      },
      sendRatingApp: function(oControlEvent) {
        this.checksendRatingApp(oControlEvent);
      },
      adjustAllFilter:function(filterSection){
      	if (filterSection !== "NONE") {
          this.showBusy(['filterBox', 'alignDonut', 'flagDonut','idProductsTable1','idProductsTable']);
      	}
      },
      refreshModel: function(filterSection) {
        this.adjustAllFilters(filterSection, this.getFilter("allFilters"), [
          this.getFilter("priorityFilter"), 
          this.getFilter("alignFilter"),
          this.getFilter("destFilter"), 
          //31Aug2016
          //this.getFilter("productFilter"),
          this.getFilter("categoryFilter"),
          this.getFilter("countryFilter"),
          this.getFilter("polFilter"), 
          this.getFilter("poaFilter")
        ]);
        /*this.adjustAllFilters(filterSection, this.getFilter("allFiltersUC"), [
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
        /*var calcModelUC = new JSONModel(this.getModel("filterPC").getProperty("/"));
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
          view.byId("containerText").setText("0");
        } else {
          view.byId("containerText").setText(oBindingforCalc.getLength());
        }

        var oFilterO = new sap.ui.model.Filter("AlignStatus","EQ", "0");
        var oFilterE = new sap.ui.model.Filter("AlignStatus", "EQ", "-1");
        var oFilterL = new sap.ui.model.Filter("AlignStatus", "EQ", "1");
        var oFilterA = new sap.ui.model.Filter("AlignStatus", "EQ", "2");
        var oFilterUI = new sap.ui.model.Filter("AlignStatus", "EQ", "3");

        var oFilterNS = new sap.ui.model.Filter("Priority","EQ", "1");
        var oFilterLS = new sap.ui.model.Filter("Priority","EQ", "2");
        var oFilterNF = new sap.ui.model.Filter("Priority","EQ", "3");

		// For on time
        oBindingforCalc.filter(oFilterO);
        this.countO = oBindingforCalc.getLength();
        // For Early
        oBindingforCalc.filter(oFilterE);
        this.countE = oBindingforCalc.getLength();
        // For Late
        oBindingforCalc.filter(oFilterL);
        this.countL = oBindingforCalc.getLength();
        // For Arrived
        oBindingforCalc.filter(oFilterA);
        this.countA = oBindingforCalc.getLength();
        // For Unidentified
        oBindingforCalc.filter(oFilterUI);
        this.countUI = oBindingforCalc.getLength();

        // For No Stock
        oBindingforCalc.filter(oFilterNS);
        this.countNS = oBindingforCalc.getLength();
        // For Low Stock
        oBindingforCalc.filter(oFilterLS);
        this.countLS = oBindingforCalc.getLength();
        // For No Flag
        oBindingforCalc.filter(oFilterNF);
        this.countNF = oBindingforCalc.getLength();

        this.getPAChartModel();
        this.getFCChartModel();
        var paramsPA = this.getChartParams("PA");
        this.setDonutChartModel(paramsPA.data, "PA");
        var paramsFC = this.getChartParams("PF");
        this.setDonutChartModel(paramsFC.data, "PF");
        this.getModel("appProperties").setProperty("/isDashboardBusy",false);
        $.sap.delayedCall(100,this,function(){
        	this.calculateCounters(filterSection,this.getModel("filterPC"),this.getModel("subFilterPC"), "DP", this.getFilterState(this,filterSection));	
        });
        this.getModel("appProperties").setProperty("/isDashboardLoaded",true);
      },

	setDonutChartModel: function(data, chartFor) {
        var model = new sap.ui.model.json.JSONModel();
        model.setSizeLimit(99999);
        model.setData(data);
        if (chartFor === "PA") {
          this._oAlignDonut.setModel(model);
          this._oAlignDonut.refreshDonutChartCust();
        } else if (chartFor === "PF") {
          this._oFlagDonut.setModel(model);
          this._oFlagDonut.refreshDonutChartCust();
        }
      },

      onGAClick:function(){
          window.open("https://www.google.com/analytics/web/?authuser=0#dashboard/j8EDt98nRgSfn3P469H3LQ/a60735627w95250854p99294867/","_blank");
      },
      onMaintainMarket:function(){
         var portalUrl=null,url="",view=this.getView();
         if(view.getModel("userMarketModel")){
            portalUrl=view.getModel("userMarketModel").getProperty("/PortalURL"); 
         }
         if(Utility.hasValue(portalUrl)){
            var urlParts = portalUrl.match(/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i);
            if(urlParts !== null && typeof urlParts !== 'undefined'){
                urlParts.splice(0,1);
                url=urlParts.join("");
            //"https://globe7eur.nestle.com:26001/irj/servlet/prt/portal/prtroot/ABJPRAP001
                url += "pcd!3a!2f!2fportal_content!2ftemplates!2fiviews!2fsap_transaction_iview"
                +"?System=NGWE1&TCode=SU3&GuiType=WinGui&SAP_TransType=TXN&SAP_TechRoleName=CONTROL2007"
                +"&SAP_Market=XXSAP_DummySystem=%20NGWE1&SAP_Source=EXT&SAP_IViewDesc=SU3";
            }
         }
         if(Utility.hasValue(url)){
            window.open(url,"_blank");
         }
         else{
             Utility.displayError(this.getTextFromBundle("errUrlGenerationGeneral"),this.getTextFromBundle("errURLGenerationTitle"));
         }
      },
       waitForRender: function(fnToExecute) {
        $.when(this.oRenderDef).then(
          $.proxy(fnToExecute, this));

      },
      _prepareScreen: function(sChannel, event, data) {
      	
    	this.setMarket();
    	// this.setFilters();
    	// this.oFilterLoadFinished=$.Deferred();
    	if(data.src==="Dashboard"){
	    	if(data.isSelectAll){
	    		this.generateDynamicFilters(this.getAllFilterSections(),"modelRoot",false,true);
	    		
	    	}
	    	else{
	    		this.generateDynamicFilters(this.getAllFilterSections(),"modelRoot",false,false);
	    	}
	    	this.setSearchBoxModel(this.getModel("filterPC"), "DP");
    	}
    	/*$.when(this.oFilterLoadFinished).then($.proxy(function(){
    		this.refreshModel("ALL");
    		this.setSeeAllVisibility("ALL");
    	},this));*/
      },
      getAllFilterSections:function(){
      	// return ["PA","PF","OC","DDC","PRD","CAT","POL","POA"];
      	// 31Aug2016
      	return ["PA","PF","OC","DDC","CAT","POL","POA"];
      },
      waitForPieLoad: function(fnToExecute) {
        $.when(this.oPieLoadFinishedDeferred).then(
          $.proxy(fnToExecute, this));
      },

      getChartParams: function(chart) {
        var data = [];
        var dimension = new Array();
        var measure = new Array();
        var dataPath = null;
        var properties = {
          id: "",
          width: "100%",
          height: "100%",
          xT: "",
          xTV: false,
          yT: "",
          yTV: false,
          lV: true,
          lT: "",
          lTV: true
        };
        var colorPalette = new Array();
        var isPan = true;
        var isDonut = true;
        var evtSelHandler = null;
        if (chart === "PA") {
          dimension = [{
            name: "Status",
            axis: 1,
            value: "{Alignment}"
          }];
          measure = [{
            name: "CNT",
            axis: 1,
            value: "{Containers}"
          }];

          dataPath = "/ContainerStatusCollection";
          properties.height = "78%";
          properties.id = "chartPA";
          colorPalette = ['#7ECFFF', '#66C17B', '#DC6868',
            'rgb(190, 190, 190)', "#fec10d"
          ];
          evtSelHandler = this.alignChartSelect;

          // for d3

          var d = this.getOwnerComponent().getModel(
            "modelPAChart").oData.ContainerStatusCollection;
          if (this.getNullFilterFlag() === true) {
            d = [];
          }
          for (var i = 0; i < d.length; i++) {
            data.push({
              label: d[i].Alignment,
              count: d[i].Containers,
              color: colorPalette[i]
            });
          }
          // end for d3
        } else if (chart === "PF") {
          dimension = [{
            name: "Priority",
            axis: 1,
            value: "{Flag}"
          }];
          measure = [{
            name: "Count",
            axis: 1,
            value: "{count}"
          }];

          dataPath = "/ContainerFlagCollection";
          properties.height = "78%";
          properties.id = "chartFC";
          colorPalette = ['#66C17B', '#DC6868', '#FEC10D'];
          evtSelHandler = this.priorityChartSelect;

          // for d3
          d = this.getOwnerComponent().getModel(
            "modelFCChart").oData.ContainerFlagCollection;
          if (this.getNullFilterFlag() === true) {
            d = [];
          }
          for (i = 0; i < d.length; i++) {
            data.push({
              label: d[i].Flag,
              count: d[i].count,
              color: colorPalette[i]
            });
          }
          // end for d3
        }
        var params = {
          dimension: dimension,
          measure: measure,
          dataPath: dataPath,
          properties: properties,
          colorPalette: colorPalette,
          isPan: isPan,
          isDonut: isDonut,
          evtSelHandler: evtSelHandler,
          data: data
        };
        return params;
      },

      alignChartSelect: function(data) {
        var status = [];
        var sts = null;
        sts = data.label;
        var evtLabel = this.oBundleEn
          .getText("apoPlanningAlignment");
        if (sts === this.oBundle.getText("legEarly")) {
          evtLabel += this.oBundleEn.getText("legEarly");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        } else if (sts === this.oBundle.getText("legOnTime")) {
          evtLabel += this.oBundleEn.getText("legOnTime");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        } else if (sts === this.oBundle.getText("legLate")) {
          evtLabel += this.oBundleEn.getText("legLate");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        } else if (sts === this.oBundle.getText("legArrived")) {
          evtLabel += this.oBundleEn.getText("legArrived");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        } else if (sts === this.oBundle.getText("legUI")) {
          evtLabel += this.oBundleEn.getText("legUI");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        }
        status.push({
          status: sts
        });
        // Added for router
        var paramModel = this.getOwnerComponent().getModel(
          "paramModel");
        // End
        var bus = this.getOwnerComponent().getEventBus();
        var router = sap.ui.core.UIComponent.getRouterFor(this);
        this.setFilterLoadDefObj();
        router.navTo("PlanningAdvisorP", {
          direction: paramModel.getProperty("/direction"),
          type: paramModel.getProperty("/type"),
          fromDate: paramModel.getProperty("/fromDate"),
          toDate: paramModel.getProperty("/toDate"),
          companyCode:paramModel.getProperty("/companyCode")
        }, false);
        var view = this.getView();
        $.sap.delayedCall(1000, this, function () {
          bus.publish("filters", "reset");
          bus.publish("container", "filter", {
            status: status,
            src: "PA",
            mkt: view.byId("marketList")
              .getSelectedKey()

          });
        });
        /*setTimeout(function() {
          bus.publish("filters", "reset");
          bus.publish("container", "filter", {

            status: status,
            src: "PA",
            mkt: view.byId("marketList")
              .getSelectedKey()

          });
        }, 1000);*/
      },

      priorityChartSelect: function(data) {
        var status = [];
        var priority = null;
        priority = data.label;
        var evtLabel = this.oBundle
          .getText("flaggedContainers");
        if (priority === this.oBundle.getText("legNF")) {
          evtLabel += this.oBundleEn.getText("legNF");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        } else if (priority === this.oBundle.getText("legOS")) {
          evtLabel += this.oBundleEn.getText("legOS");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        } else if (priority === this.oBundle.getText("legLS")) {
          evtLabel += this.oBundleEn.getText("legLS");
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.DASHBOARD,
            this.EvtAct.CLICK, evtLabel);
        }
        status.push({
          priority: priority
        });
        // Added for router
        var paramModel = this.getOwnerComponent().getModel(
          "paramModel");
        // End
        var bus = this.getOwnerComponent().getEventBus();
        var router = sap.ui.core.UIComponent.getRouterFor(this);
        this.setFilterLoadDefObj();
        router.navTo("PlanningAdvisorP", {
          direction: paramModel.getProperty("/direction"),
          type: paramModel.getProperty("/type"),
          fromDate: paramModel.getProperty("/fromDate"),
          toDate: paramModel.getProperty("/toDate"),
          companyCode:paramModel.getProperty("/companyCode")
        }, false);
        var view = this.getView();
        
        $.sap.delayedCall(1000, this, function () {
          bus.publish("filters", "reset");
          bus.publish("container", "filter", {
            priority: status,
            src: "PF",
            mkt: view.byId("marketList").getSelectedKey()
          });
        });
       /* setTimeout(function() {
          bus.publish("filters", "reset");
          bus.publish("container", "filter", {

            priority: status,
            src: "PF",
            mkt: view.byId("marketList")
              .getSelectedKey()

          });
        }, 1000);*/
      }
	});

});