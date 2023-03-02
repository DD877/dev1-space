sap.ui.define([
	"glb/gtmh/oct/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"glb/gtmh/oct/controls/Tracker",
	"glb/gtmh/oct/util/Utility",
	"sap/ui/core/routing/History",
	"sap/ui/core/routing/HashChanger"
], function(BaseController, JSONModel, MessageBox, Tracker, Utility, History,HashChanger) {
	"use strict";
	return BaseController.extend("glb.gtmh.oct.controller.ContainerDtl", {
      cid: "",
      context: null,
      totalcont: 0,
      current: 0,
      trackerId: "hTracker",
      source: null,
      firstTime: true,
      urlParams: null,
      currentPriority: 0,
      _oTracker: null,

      /**
       * Called when a controller is instantiated and its View
       * controls (if available) are already created. Can be used
       * to modify the View before it is displayed, to bind event
       * handlers and do other one-time initialization.
       *
       * @memberOf view.ContainerDtl
       */
      onInit: function() {
        BaseController.prototype.onInit.call(this);
        var view = this.getView();
		var bus=this.getEventBus();
        view.setModel(this.getModel("usrMktModel"), "userMarketModel");
        view.byId("pidallEvents").setVisible(false);
        this.firstTime = true;
        var self = this;
        this._oTracker = new Tracker(view.createId("paDetailTracker"), {
          height: "180px",
          onEventCircleHover: function(oEvent) {
            var data = oEvent.getParameter("data");
            var allEvents=oEvent.getParameter("allEvents");
            var eventDetail = self.getTrackerTooltipDetails(data,allEvents);
            this.getModel().setProperty("/lastHoverData", eventDetail);
          }
        });
        view.byId("TransRt").addContent(this._oTracker);
        bus.subscribe("all", "showOverlay", this.showOverlay, this);
        bus.subscribe("dtl", "localRefresh", this._localRefresh, this);
        bus.subscribe("container", "detail",this._setContainerDetails, this);
        bus.subscribe("all", "prepareScreen", this._prepareScreen, this);
        view.byId("feedInput").setModel(this.getModel("usrMktModel"));
        $.when(this.getOwnerComponent().oUsrLoadFinishedDef).then($.proxy(function(){
        		this.setUserModels();
        },this));

      },
      _localRefresh: function(sChannelId, oEvent, data) {
        if (data.field === 'Priority') {
          var isSelected = data.value;
          this.getView().byId("sel_priority").setSelectedKey(isSelected);
          if (isSelected === "1") {
            this.getView().byId("flag").setColor("red");
            this.getView().byId("flagText").setText(
              this.getTextFromBundle("outOfStock"));
          } else if (isSelected === "2") {
            this.getView().byId("flag").setColor("#ffc200");
            this.getView().byId("flagText").setText(
              this.getTextFromBundle("lowStock"));
          } else if (isSelected === "3") {
            this.getView().byId("flag").setColor("green");
            this.getView().byId("flagText").setText(
              this.getTextFromBundle("noFlag"));
          }
        }
      },
      _loadData: function(channelId, eventId, data) {
        if (this.firstTime === true) {
          this.firstTime = false;
        }
        this.source = "DP";
        if (this.urlParams) {
          var isValid = this.isValidParameters(
            this.urlParams, true);
          if (isValid === false) {
            this.setDefaultModels();
          } else {
            this.updateParamModel();
            this.setDefaultModels(this.urlParams.fromDate,
              this.urlParams.toDate,
              this.urlParams.direction,
              this.urlParams.type);
            this.waitForLoad(function() {
              this.setUserModels();
              this
                .getEventBus()
                .publish(
                  "container",
                  "detail", {
                    data: {
                      Container: this.urlParams.guid,
                      source: this.source
                    }
                  });
              if (typeof data !== 'undefined' && data.src === 'Component') {
                this.getEventBus().publish("root", "showOverlay");
              }
            });
          }
        } else {
          this.getRouter().navTo("Error", null, false);
        }
      },
      _prepareScreen: function(sChannel, event, data) {
    	
    	if(data.src==="ContainerDtl"){
    	this.setMarket();
    	if(this.firstTime){
    		this.getEventBus().publish("container", "detail", {
                      data: {
                        Container: this.urlParams.guid,
                        GUID: this.urlParams.guid,
                        source: this.source
                      }
                    });
            this.firstTime=false;
    	}
    
    	}
      },
      onRouteMatched:function(oEvent){
      	var view = this.getView();
      	this.firstTime=true;
      	view.byId("feedInput").setValue("");
      	
        var name = oEvent.getParameter("name");
        document.title = this.setDocTitle(name);
        if (this._odDateUpdLayover) {
          this._odDateUpdLayover.close();
          this._odDateUpdLayover.destroy();
          this.getView().removeDependent(
            this._odDateUpdLayover);
          this._odDateUpdLayover = null;
        }
        if (name === "ContainerDetailP") {
        	if (this.getCustomHashChange() === true) {
	          this.setCustomHashChange(false);
	          return;
	        }
          var locArr = window.location.href.split("#");
          var path = "";
          if (locArr.length > 1) {
            path = "#" + locArr[1];
          }
          var title = this.DETAIL;
          this.trackGAScreenEvent(path, title);
          if(!Utility.hasValue(this.source)){
              
          	this.source="DP";
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if(typeof sPreviousHash!=="undefined"){
                if(sPreviousHash.indexOf("PlanningAdvisor")!==-1){
                    this.source="RP";
                }
            }
          }
          var isValid = this.isValidParameters(oEvent.getParameters().arguments);
          var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();
          if(this.getModel("filterPC")){
          	
          	if(isValid){
          	        if(sPreviousHash.indexOf("Dashboard")!==-1){
          	            this.source="DP";
          	        }
          	        else if(sPreviousHash.indexOf("DistributionCenterLoad")!==-1){
          	            this.source="DCL";
          	        }
          	        else if(sPreviousHash.indexOf("PlanningAdvisor")!==-1){
          	            this.source="RP";
          	        }
          			// this.showBusy(['filterBox', 'alignDonut', 'flagDonut', 'idProductsTable1', 'idProductsTable']);
          			this.urlParams = oEvent.getParameters().arguments;
                	var bParamModelChanged = this.isParamModelChanged(this.urlParams);
                	if (bParamModelChanged === false) {
                		this.setDefaultModels(this.urlParams.fromDate,this.urlParams.toDate,this.urlParams.direction,this.urlParams.type);
		                $.sap.delayedCall(0, this, function () {
		                    this.initiateMainServiceCall(false,"ContainerDtl");
		                });
                	}
                	else{
                		this.setDefaultModels(this.urlParams.fromDate,this.urlParams.toDate,this.urlParams.direction,this.urlParams.type);
                		$.sap.delayedCall(0, this, function () {
		                    this.initiateMainServiceCall(true,"ContainerDtl");
		                });
                	}
          		}
          		else{
          			this.getRouter().navTo("Error",null,true);
          			return;
          		}
          }
          else{
          	if(isValid){
          		this.urlParams=oEvent.getParameters().arguments;
          		this.setDefaultModels(this.urlParams.fromDate,this.urlParams.toDate,this.urlParams.direction,this.urlParams.type);
          		$.sap.delayedCall(0, this, function () {
		            this.initiateMainServiceCall(true,"ContainerDtl");
		        });
          	}
          	else{
          			this.getRouter().navTo("Error",null,true);
          			return;
          		}
          }
        }
      },
      _handleRouteMatched: function(oEvent) {
        this.getView().byId("feedInput").setValue("");
        if (this.isCustomHashChange === true) {
          this.isCustomHashChange = false;
          return;
        }
        var name = oEvent.getParameter("name");
        document.title = this.setDocTitle(name);
        if (this._odDateUpdLayover) {
          this._odDateUpdLayover.close();
          this._odDateUpdLayover.destroy();
          this.getView().removeDependent(
            this._odDateUpdLayover);
          this._odDateUpdLayover = null;
        }
        if (name === "ContainerDetailP") {
          var locArr = window.location.href.split("#");
          var path = "";
          if (locArr.length > 1) {
            path = "#" + locArr[1];
          }
          var title = this.DETAIL;
          this.trackGAScreenEvent(path, title);
          this.urlParams = oEvent.getParameters().arguments;
          this.oDefaultLoadFinishedDef = jQuery.Deferred();
          var isValid = this.isValidParameters(this.urlParams, true);
          if (isValid === false) {
            this.setDefaultModels();
          } else {
            //Added to curb dual call
            var bParamModelChanged = true;
            if (this.getOwnerComponent().getModel("paramModel")) {
              bParamModelChanged = this.isParamModelChanged(this.urlParams);
            }
            this.updateParamModel();
            if (bParamModelChanged === false) {
              this.setDefaultModels(
                this.urlParams.fromDate,
                this.urlParams.toDate,
                this.urlParams.direction,
                this.urlParams.type);
            }
            //Change for Wave 4 - Detail View - 29-Sep-2015
            if (this.source === null) {
              this.source = 'DP';
            }
            if (this.source && this.firstTime && bParamModelChanged === false) {
              this.waitForLoad(function() {
                this
                  .getEventBus()
                  .publish(
                    "container",
                    "detail", {
                      data: {
                        Container: this.urlParams.guid,
                        GUID: this.urlParams.guid,
                        source: this.source
                      }
                    });
              });
            }
          }
        }
      },
      MailClicked: function(oEvent) {
        // create overlay
        var portalURL = this.getOwnerComponent().getModel("usrMktModel").getProperty("/PortalURL");
        var model = this.getView().getModel();
        var cnum = model.getProperty("/Container");
        var asn = model.getProperty("/ASN");
        var po = model.getProperty("/PO");
        var subject = [];
        if (!Utility.hasValue(cnum)) {
          cnum = "";
        } else {
          cnum = "Cont# " + cnum;
          subject.push(cnum);
        }
        if (!Utility.hasValue(asn)) {
          asn = "";
        } else {
          asn = "ASN " + asn;
          subject.push(asn);
        }
        if (!Utility.hasValue(po)) {
          po = "";
        } else {
          po = "PO " + po;
          subject.push(po);
        }
        var aViewName = this.getView().getViewName().split(".");
        aViewName.pop();
        var sViewPath = aViewName.join(".");
        if (typeof(this._oMailDialog) === "undefined" || this._oMailDialog === null) {
          if (oEvent.getSource().getId()) {
            this._oMailDialog = sap.ui
              .xmlfragment(sViewPath + ".fragments.containerDtlMail", this);
            this.getView().addDependent(
              this._oMailDialog);
            this._oMailDialog.open();
            var urlParts = location.href.split("#");
            var urlLeft = urlParts[0].split("?");
            var path = urlLeft[0].substr(urlLeft[0].indexOf("/sap"));
            portalURL = portalURL + path + "?target=" + urlParts[1];
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
              recipients:'',
              subject:subject.join(' / '),
              body:portalURL
            });
            this._oMailDialog.setModel(oModel);
          }
        }
      },
      onSendMail: function(oEvent) {
        var oModel=this._oMailDialog.getModel();
        var recipients = oModel.getProperty("/recipients");
        var countR = (recipients.match(/@/g) || []).length;
        var countP = (recipients.match(/;/g) || []).length;
        if (countR < 1) {
          sap.m.MessageBox.alert(this.getTextFromBundle("errValidRecipient"), {
            styleClass: "sapUiSizeCompact",
            icon: sap.m.MessageBox.Icon.ERROR,
            title: this.getTextFromBundle("err")
          });
          return;
        } else {
          if (countP !== (countR - 1)) {
            sap.m.MessageBox.alert(this.getTextFromBundle("errRecipientSep"), {
              styleClass: "sapUiSizeCompact",
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getTextFromBundle("err")
            });
            return;
          }
        }

        var subject = oModel.getProperty("/subject");
        subject = subject.replace("/\s/g", '');
        if (subject.length === 0) {
          sap.m.MessageBox.alert(this.getTextFromBundle("errValidSubLine"), {
            styleClass: "sapUiSizeCompact",
            icon: sap.m.MessageBox.Icon.ERROR,
            title: this.getTextFromBundle("err")
          });
          return;
        } else if (subject.length > 50) {
          sap.m.MessageBox.alert(this.getTextFromBundle("errSubLengthExceed"), {
            styleClass: "sapUiSizeCompact",
            icon: sap.m.MessageBox.Icon.ERROR,
            title: this.getTextFromBundle("err")
          });
          return;
        }
        var body = oModel.getProperty("/body");
        body = body.replace("/\n/g", "|");
        if (body.length === 0) {
          sap.m.MessageBox.alert(this.getTextFromBundle("errValidMailBody"), {
            styleClass: "sapUiSizeCompact",
            icon: sap.m.MessageBox.Icon.ERROR,
            title: this.getTextFromBundle("err")
          });
          return;
        }
        var fnSuccess = jQuery.proxy(function() {
          var core=sap.ui.getCore();
          this.BUSY_DIALOG.setText("");
          this.busyIndicatorHide();
          var sentTo = recipients.split(";");
          sentTo = sentTo.join("|");
          var cNum = this.getView().getModel().getProperty("/Container");
          if (typeof cNum === 'undefined' || cNum === null || cNum === '') {
            cNum = "'" + Utility.oBundle.getText("unidentified") + "'";
          } else {
            cNum = "'" + cNum + "'";
          }
          this.postLogInChat('MS', cNum, sentTo);
          core.byId("mailCancel").firePress();
          sap.m.MessageToast.show(this.getTextFromBundle("mailSent"));
        }, this);
        this.sendMail(recipients, subject, body, fnSuccess);
      },
      onCloseMailDialog: function(oEvent) {
        if (this._oMailDialog) {
          this._oMailDialog.close();
          this.getView().removeDependent(
            this._oMailDialog);
          this._oMailDialog.destroy();
          this._oMailDialog = null;
        }
      },
      openGTNexus: function() {
        var cnum = this.getView().getModel().getProperty("/Container");
        this.openGTNexusUrl(cnum);
      },
      updateClicked: function(oEvent) {
        var oModel = this.getView().getModel();
        var btnId=oEvent.getSource().getId();
        var po=null;
        if(btnId === this.getView().byId("POBtn").getId()){
            po=oModel.getProperty("/PO");
            if (!Utility.hasValue(po)) {
          sap.m.MessageBox.alert(this.oBundle
            .getText("errNoPO"), {
              styleClass: "sapUiSizeCompact",
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getTextFromBundle("errNoUpdDDate")
            });
          return;
        }
        }
        else if(btnId === this.getView().byId("STOBtn").getId()){
            po = oModel.getProperty("/STO");
            if (!Utility.hasValue(po)) {
          sap.m.MessageBox.alert(this.oBundle
            .getText("errNoSTO"), {
              styleClass: "sapUiSizeCompact",
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getTextFromBundle("errNoUpdDDate")
            });
          return;
        }
        }
        // if (!Utility.hasValue(po)) {
        //   sap.m.MessageBox.alert(this.oBundle
        //     .getText("errNoPO"), {
        //       styleClass: "sapUiSizeCompact",
        //       icon: sap.m.MessageBox.Icon.ERROR,
        //       title: this.getTextFromBundle("errNoUpdDDate")
        //     });
        //   return;
        // }
        // For GA Tagging
        var eta = Utility.getDateString(oModel.getProperty("/UDelDate"));
        var dDate = Utility.getDateString(oModel.getProperty("/InitDelDate"));
        var dateDiff = "" + Utility.getDateDiff(dDate, eta, "yyyyMMdd");
        this.trackGAEvent(this.EvtCat.UPD_DDATE,
          this.EvtAct.CLICK, dateDiff);
        // create overlay
        var aViewName = this.getView().getViewName().split(".");
        aViewName.pop();
        var sViewPath = aViewName.join(".");
        if (typeof(this._odDateUpdLayover) === "undefined" || this._odDateUpdLayover === null) {
          if (oEvent.getSource().getId()) {
            this._odDateUpdLayover = sap.ui
              .xmlfragment(sViewPath + ".fragments.containerDtlDelDateUpd", this);
            this.getView().addDependent(
              this._odDateUpdLayover);
            this._odDateUpdLayover.open();
            var today = new Date();
            today = Utility.formatDate(today, null,
              "yyyyMMdd");
            var updDateModel = new sap.ui.model.json.JSONModel();
            updDateModel.setData({
              "InitDelDate": this.getView().getModel().getProperty("/InitDelDate"),
              "dateValue": "",
              "dpValue": eta,
              "errorUpdDate": ""
            });
            this.getView().setModel(updDateModel, "updDateModel");
            sap.ui.getCore().byId("DP5").fireChange();
            $("#fbuDdateafter").addClass("invisible");
            $("#fbuDdateProcess").addClass("invisible");
            $("#tryAgainuDdate").addClass("invisible");
            $("#fbafterProcessDdateSuccess").addClass("invisible");
            $("#thankyoudate").addClass("invisible");
            $("#btnCanceluDdate").removeClass("invisible");
          }
        }
        // End of for OVERLAY
      },

      setContainerUIC: function(oEvent) {
        // For GA tagging
        this.trackGAEvent(this.EvtCat.SET_CNUM,
          this.EvtAct.CLICK, "");
        var aViewNameContUIC = this.getView().getViewName()
          .split(".");
        aViewNameContUIC.pop();
        var sViewPath = aViewNameContUIC.join(".");
        if (typeof(this._setContainerLayoverCont) === "undefined" || this._setContainerLayoverCont === null) {
          if (oEvent.getSource().getId()) {
            this._setContainerLayoverCont = sap.ui
              .xmlfragment(sViewPath + ".fragments.containerDtlSetContainer",
                this);
            this.getView().addDependent(
              this._setContainerLayoverCont);
            var oErrorModel=new sap.ui.model.json.JSONModel();
            oErrorModel.setData({error:this.getTextFromBundle("ErrorDesc")});
            this.getView().setModel(oErrorModel,"cUpdError");
            this._setContainerLayoverCont.open();
            $("#fbafter").addClass("invisible");
            $("#fbafterProcess").addClass("invisible");
            $("#tryAgain").addClass("invisible");
            $("#fbafterProcessSuccess").addClass("invisible");
            $("#thankyou").addClass("invisible");
          }
        }
      },

      setContainerUICPOP: function() {
        var inputFieldError = sap.ui.getCore().byId(
          "containerinputId");
        if (inputFieldError === null || typeof(inputFieldError) === "undefined" || inputFieldError.getValue() === "") {
          inputFieldError.addStyleClass("errorBoderCol");
          sap.ui.getCore().byId("errorlblId").setText(
            this.getTextFromBundle("erroMessageUIC"));
          sap.ui.getCore().byId("errorlblId").addStyleClass(
            "errorText");
          sap.ui.getCore().byId("containerNoLbl")
            .addStyleClass("errorText");
        } else if (Utility.ISO6346Check(inputFieldError.getValue()) === false) {
          sap.ui
            .getCore()
            .byId("errorlblId")
            .setText(
              this.oBundle
              .getText("errorMessageInvalid"));
          sap.ui.getCore().byId("errorlblId").addStyleClass(
            "errorText");

        }
        else if(inputFieldError.getValue().toUpperCase()=== this.getView().getModel().getProperty("/Container")){
          sap.ui
            .getCore()
            .byId("errorlblId")
            .setText(
              this.oBundle
              .getText("errorMessageSameCont"));
          sap.ui.getCore().byId("errorlblId").addStyleClass(
            "errorText");
        }
        else if (!$("#fbbefore").hasClass("invisible")) {
          this.updateProcess();
          $.sap.delayedCall(0, this, function() {
            this.containerUpdate();
          });
        }
      },

      onTryAgain: function(oEvent) {
        var dialog = this._setContainerLayoverCont;
        dialog.close();
        this.getView().removeDependent(dialog);
        dialog.destroy();
        this._setContainerLayoverCont = null;
        this.getView().byId("ASNBtn").firePress();
      },

      onThankYou: function(oEvent) {
        if (this._setContainerLayoverCont) {
          var dialog = this._setContainerLayoverCont;
          dialog.close();
          this.getView().removeDependent(dialog);
          dialog.destroy();
          this._setContainerLayoverCont = null;
        }
      },
      onDDateChange: function(oEvent) {
        var dtVal = oEvent.getSource().getValue();
        this.getView().getModel("updDateModel").setProperty("/dateValue", Utility.dateConvert(dtVal, "yyyyMMdd", false,true));
      },
      onDateLiveChange: function(oEvent) {
        var dt = oEvent.getParameter("value");
        if (typeof dt === 'undefined' || dt === null || dt === '') {
          this.getView().getModel("updDateModel").setProperty("/dateValue", '');
        }
      },

      UpdateDdatePopup: function() {
        var core = sap.ui.getCore();
        var model = this.getView().getModel("updDateModel");
        var oInput = sap.ui.getCore().byId("dateValue");
        var dt = oInput.getValue();
        dt = model.getProperty("/dateValue");
        var test1 = /^((0[1-9]|[1-9]|[1-2][0-9]|3[0-1])\u0020(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$)/i;
        var test2 = /^\u0020\d{4}$/;
        var dtArr = dt.split(",");
        var res1 = test1.test(dtArr[0]);
        var res2 = test2.test(dtArr[1]);
        var today = Utility.formatDate(new Date(), null,
          "yyyyMMdd");
        if (dt === null || typeof dt === 'undefined' || dt === "") {
          oInput.addStyleClass("udateDPickerErrorText");
          model.setProperty("/errorUpdDate", this.getTextFromBundle("udateMandatory"));
          core.byId("newdate").addStyleClass(
            "errorText");
          model.setProperty("/dpValue", '');
        } else if (dtArr.length === 2 && res1 === true && res2 === true) {
          model.setProperty("/errorUpdDate", '');
          var eta = sap.ui.core.format.DateFormat
            .getDateInstance({
              pattern: "dd MMM, yyyy",
              UTC:true
            }, new sap.ui.core.Locale('en-US')).parse(dt);
          eta = sap.ui.core.format.DateFormat
            .getDateInstance({
              pattern: "yyyyMMdd",
              UTC:true
            }).format(eta);
          model.setProperty("/dpValue", eta);
          this.ddateProcess();
          $.sap.delayedCall(0, this, function() {
              var view=this.getView();
              
              if(view.byId("STOBtn").getVisible()){
                  if(Utility.hasValue(view.getModel().getProperty("/STO"))){
                  this.UpdatePODate(view.getModel().getProperty("/STO"), eta);
              }
              }
              else if(view.byId("POBtn").getVisible()){
                  if(Utility.hasValue(view.getModel().getProperty("/PO"))){
                    this.UpdatePODate(view.getModel().getProperty("/PO"), eta);
                }
              }
          });
        } else {
          model.setProperty("/errorUpdDate", this.getTextFromBundle("validUdateFormat"));
          core.byId("newdate").addStyleClass(
            "errorText");
        }
      },

      tryAgainUdate: function() {
        this._odDateUpdLayover.close();
        this._odDateUpdLayover.destroy();
        this._odDateUpdLayover = null;
        this.getView().byId("STOBtn").firePress();
      },

      onThankYouUdate: function(oEvent) {
        if (this._odDateUpdLayover) {
          var dialog = this._odDateUpdLayover;
          dialog.close();
          this.getView().removeDependent(dialog);
          dialog.destroy();
          this._odDateUpdLayover = null;
        }
      },

      closeDialog: function(oEvent) {
        if (this._odDateUpdLayover) {
          this.getView().removeDependent(
            this._odDateUpdLayover);
          this._odDateUpdLayover.destroy();
          this._odDateUpdLayover = null;
        }
      },

      closeDialogUIC: function() {
        if (this._setContainerLayoverCont) {
          this.getView().removeDependent(
            this._setContainerLayoverCont);
          this._setContainerLayoverCont.destroy();
          this._setContainerLayoverCont = null;
        }
      },

      /**
       * Similar to onAfterRendering, but this hook is invoked
       * before the controller's View is re-rendered (NOT before
       * the first rendering! onInit() is used for that one!).
       *
       * @memberOf view.ContainerDtl
       */
      onBeforeRendering: function() {

      },

      /**
       * Called when the View has been rendered (so its HTML is
       * part of the document). Post-rendering manipulations of
       * the HTML could be done here. This hook is the same one
       * that SAPUI5 controls get after being rendered.
       *
       * @memberOf view.ContainerDtl
       */
      onAfterRendering: function() {

      },

      prevContainer: function(oControlEvent) {
        var view = this.getView();
        var modelname = "filterPC";
        if (this.source === "RP") {
          modelname = "filterSubPC";
        }
        var prv = this.getModel(modelname).getProperty("/ProductCollection/"+(this.current - 1));
        this.setVisibility(prv);
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.FLIP, this.EvtAct.CLICK, "Previous");
        var p = this.getModel(modelname).getProperty("/ProductCollection/"+(this.current - 1)+"/Priority");
        this.currentPriority = p;
        //
        view.byId("sel_priority").setSelectedKey(p);
        if (p === "1") {
          view.byId("flagText").setText(this.getTextFromBundle("outOfStock"));
        }
        if (p === "2") {
         view.byId("flagText").setText(this.getTextFromBundle("lowStock"));
        }
        if (p === "3") {
          view.byId("flagText").setText(this.getTextFromBundle("noFlag"));
        }
        var mod = new JSONModel();
        this.current--;
        var ctx = "/ProductCollection/" + this.current;
        if (this.current > 0) {
          mod.setData(this.getModel(modelname).getProperty("/ProductCollection/"+this.current));
          //For Performance
          view.setModel(mod);
          this.getContainerDetails(mod.getProperty("/GUID"));
          this.waitForDetailLoad(function() {
            var mod = this.getOwnerComponent().getModel("currContainerModel");
            var currContainerModel = new sap.ui.model.json.JSONModel();
            currContainerModel.setData(mod.getProperty("/"));
            this.setRcvEvtModel(currContainerModel);
            this.getView().setModel(currContainerModel, "containerDetail");
            this.setBatchModel();
            this.getView().byId("next").setEnabled(true);
            this.refreshTracker();
          });

          //End

        } else if (this.current === 0) {
          mod.setData(this.getModel(modelname).getProperty("/ProductCollection/"+this.current));
          //For Performance
          view.setModel(mod);
          this.getContainerDetails(mod.getProperty("/GUID"));
          this.waitForDetailLoad(function() {
            var mod = this.getOwnerComponent().getModel("currContainerModel");
            var currContainerModel = new sap.ui.model.json.JSONModel();
            currContainerModel.setData(mod.getProperty("/"));
            this.setRcvEvtModel(currContainerModel);
            this.getView().setModel(currContainerModel, "containerDetail");
            this.setBatchModel();
            this.getView().byId("prev").setEnabled(false);
            this.refreshTracker();
          });

          //End

        }
        view.byId("lbl_totcont").setText("" + this.totalcont + " " + this.getTextFromBundle("containers"));
        view.byId("lbl_current").setText("" + (this.current + 1) + "/" + this.totalcont);

        // Added for router
        // $.sap.require("sap.ui.core.routing.HashChanger");
        var oHashChanger = HashChanger.getInstance();
        var type = this.getModel("appProperties").getProperty("/type");
        var direction = this.getModel("oMktModel").getProperty("/direction");
        /*if (this.getOwnerComponent().getModel("dateRangeModel")
          .getProperty("/rA") === true) {
          type = "Arrival";
        } else {
          type = "Departure";
        }*/
        var paramModel = new sap.ui.model.json.JSONModel();
        paramModel.setData({
          direction: direction,
          type: type,
          fromDate: this.urlParams.fromDate,
          toDate: this.urlParams.toDate,
          companyCode: this.urlParams.companyCode
        });
        this.getOwnerComponent().setModel(paramModel,"paramModel");
        var hash = "ContainerDetail/" + direction + "/" + type + "/" + this.urlParams.fromDate + "/" + this.urlParams.toDate
         + "/" + this.urlParams.companyCode + "/guid/" + mod.oData.GUID;
        this.setCustomHashChange(true);
        oHashChanger.replaceHash(hash);
        this.getChatData(mod.oData.GUID);
        // End
      },

      nextContainer: function(oControlEvent) {
        var modelname = "filterPC";
        if (this.source === "RP") {
          modelname = "filterSubPC";
        }
        var nxt = this.getOwnerComponent().getModel(
          modelname).oData.ProductCollection[this.current + 1];
        this.setVisibility(nxt);
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.FLIP, this.EvtAct.CLICK,
          "Next");
        var p = this.getOwnerComponent().getModel(modelname).oData.ProductCollection[this.current + 1].Priority;
        this.currentPriority = p;
        this
          .getView()
          .byId("sel_priority")
          .setSelectedKey(
            this.getOwnerComponent().getModel(
              modelname).oData.ProductCollection[this.current + 1].Priority);
        if (p === "1") {
          this.getView().byId("flagText").setText(
            this.getTextFromBundle("outOfStock"));
        }
        if (p === "2") {
          this.getView().byId("flagText").setText(
            this.getTextFromBundle("lowStock"));
        }
        if (p === "3") {
          this.getView().byId("flagText").setText(
            this.getTextFromBundle("noFlag"));
        }
        var mod = new sap.ui.model.json.JSONModel();

        var view = this.getView();
        mod
          .setData(this.getOwnerComponent().getModel(
            modelname).oData.ProductCollection[this.current+1]);
        //For Performance
        view.setModel(mod);
        this.getContainerDetails(mod.getProperty("/GUID"));
        this.waitForDetailLoad(function() {
          var mod = this.getOwnerComponent().getModel("currContainerModel");
          var currContainerModel = new sap.ui.model.json.JSONModel();
          currContainerModel.setData(mod.getProperty("/"));
          this.setRcvEvtModel(currContainerModel);
          this.getView().setModel(currContainerModel, "containerDetail");
          this.setBatchModel();
          this.refreshTracker();
        });

        //End

        ++this.current;
        if (this.totalcont === this.current + 1) {
          view.byId("next").setEnabled(false);
          view.byId("prev").setEnabled(true);

        } else if (this.totalcont > this.current + 1) {

          view.byId("prev").setEnabled(true);
        }
        view.byId("lbl_totcont").setText(
          "" + this.totalcont + " " + this.getTextFromBundle("containers"));
        view.byId("lbl_current").setText(
          "" + (this.current + 1) + "/" + this.totalcont);

        // Added for router
        $.sap.require("sap.ui.core.routing.HashChanger");
        var oHashChanger = sap.ui.core.routing.HashChanger
          .getInstance();
        var type = null;
        var direction = this.getOwnerComponent().getModel(
          "oMktModel").getProperty("/direction");
          var companyCode = this.getOwnerComponent().getModel(
          "oMktModel").getProperty("/companyCode");
        if (this.getOwnerComponent().getModel("dateRangeModel")
          .getProperty("/rA") === true) {
          type = "Arrival";
        } else {
          type = "Departure";
        }
        var paramModel = new sap.ui.model.json.JSONModel();
        paramModel.setData({
          direction: direction,
          type: type,
          fromDate: this.urlParams.fromDate,
          toDate: this.urlParams.toDate,
          companyCode: this.urlParams.companyCode
        });
        this.getOwnerComponent().setModel(paramModel,
          "paramModel");
        var hash = "ContainerDetail/" + direction + "/" + type + "/" + this.urlParams.fromDate + "/" + this.urlParams.toDate
         + "/" + this.urlParams.companyCode + "/guid/" + mod.oData
          .GUID;
        this.setCustomHashChange(true);
        oHashChanger.replaceHash(hash);
        this.getChatData(mod.oData.GUID);
        // End

      },
      /**
       * Called when the Controller is destroyed. Use this one to
       * free resources and finalize activities.
       *
       * @memberOf view.ContainerDtl
       */
      onExit: function() {
        if (this._odDateUpdLayover) {
          this._odDateUpdLayover.close();
          this.getView().removeDependent(
            this._odDateUpdLayover);
          this._odDateUpdLayover = null;
        }
      },
      _setContainerDetails: function(channelId, eventId, data) {
        var view = this.getView();
        var oMktModel=this.getOwnerComponent().getModel("oMktModel");
        if (this.firstTime === true) {
          this.firstTime = false;
        }
        if (typeof view.byId("marketList").getModel() === 'undefined') {
          view.byId("marketList").setModel(this.getModel("marketListModel"));
        }
        view.byId("marketList").setSelectedKey(oMktModel.getProperty("/key"));
        view.byId("marketList").setEnabled(false);

        // var datamodel = this.getOwnerComponent().getModel("dtRangeTextmodel").oData;
        // this.getView().byId("filterType").setText(datamodel.arrivalbet);
        // this.getView().byId("dateRangeText").setText(datamodel.dtRangeText);
        this.source = data.data.source;
        this.setNavBtnVisibility();
        var modelName = "filterPC";
        if (this.source === "RP") {
          modelName = "filterSubPC";
          view.byId("backBtn").setText(this.getTextFromBundle("backToResultView"));
        } else if (this.source === "DP") {
          view.byId("backBtn").setText(this.getTextFromBundle("backToDashboardPage"));
        } else if (this.source === "DCL") {
          view.byId("backBtn").setText(this.getTextFromBundle("backToDCLView"));
        }
        var PC = this.getModel(modelName).getProperty("/ProductCollection");
        var data1 = null;
        if (this.source === "DCL") {
          data1 = data.data.GUID;
        } else {
          data1 = data.data.Container;
        }
        var allC = PC;
        this.cid = data1;
        this.totalcont = PC.length;
        var isFound = false;
        for (var i = 0; i < allC.length; i++) {
          var id = null;
           id = allC[i].GUID;
          /*if (this.source === "DCL") {
            id = allC[i].GUID;
          } else {
            id = allC[i].GUID;
          }*/
          //$.sap.log.info(allC[i].Container);
          if (this.cid === id) {
            isFound = true;
            this.current = parseInt(i);
            var p = PC[this.current].Priority;
            view.byId("sel_priority").setSelectedKey(PC[this.current].Priority);
            if (p === "1") {
              view.byId("flagText").setText(this.getTextFromBundle("outOfStock"));
            }
            if (p === "2") {
              view.byId("flagText").setText(this.getTextFromBundle("lowStock"));
            }
            if (p === "3") {
              view.byId("flagText").setText(this.getTextFromBundle("noFlag"));
            }
            break;
          }

        }
        if (isFound === false) {
          //$.sap.require("sap.m.MessageBox");
          MessageBox.alert(this.getTextFromBundle("noMatchingContDesc", [this.cid]), {
            styleClass: "sapUiSizeCompact",
            icon: sap.m.MessageBox.Icon.ERROR,
            title: this.getTextFromBundle("noMatchingContText"),
            onClose: $.proxy(function(oAction) {
              this.getRouter().navTo("DashboardP", {
                direction: this.urlParams.direction,
                type: this.urlParams.type,
                fromDate: this.urlParams.fromDate,
                toDate: this.urlParams.toDate,
                companyCode: this.urlParams.companyCode
              }, false);
            }, this)
          });
          return;
        }
        var mod = new JSONModel();
        //Added for chat
        this.getChatData(this.cid);
        if (this.cid.length > 0) {
          mod.setData(PC[this.current]);
          //For Performance
          view.setModel(mod);
          this.getContainerDetails(mod.getProperty("/GUID"));
          this.waitForDetailLoad(function() {
            var mod = this.getModel("currContainerModel");
            var currContainerModel = new JSONModel();
            currContainerModel.setData(mod.getProperty("/"));
            this.setRcvEvtModel(currContainerModel);
            this.getView().setModel(currContainerModel, "containerDetail");
            this.setVisibility(PC[this.current]);
            this.setBatchModel();
          });
          //End
        } else {
          mod.setData(PC[0]);
          //For Performance
          view.setModel(mod);
          this.getContainerDetails(mod.getProperty("/GUID"));
          this.waitForDetailLoad(function() {
            var mod = this.getOwnerComponent().getModel("currContainerModel");
            var currContainerModel = new sap.ui.model.json.JSONModel();
            currContainerModel.setData(mod.getProperty("/"));
            this.setRcvEvtModel(currContainerModel);
            this.getView().setModel(currContainerModel, "containerDetail");
            this.setVisibility(PC[this.current]);
            this.setBatchModel();
          });
          //End

        }
        this.currentPriority = mod.getProperty("/Priority");
        view.byId("lbl_totcont").setText("" + this.totalcont + " " + this.getTextFromBundle("containers"));
        view.byId("lbl_current").setText("" + (this.current + 1) + "/" + this.totalcont);

        if (this.current >= 0 && (this.current + 1) < this.totalcont) {
          view.byId("next").setEnabled(true);
        } else {
          view.byId("next").setEnabled(false);
        }
        if (this.current > 0) {
          view.byId("prev").setEnabled(true);
        } else {
          view.byId("prev").setEnabled(false);
        }
      },
      setVisibility: function(curr) {
        var view = this.getView();
        if (curr.PO === "N/A" || !Utility.hasValue(curr.PO)) {
          view.byId("POBtn").setVisible(false);
        } else {
          view.byId("POBtn").setVisible(true);
        }
        if (curr.STO === "N/A" || !Utility.hasValue(curr.STO)) {
          view.byId("STOBtn").setVisible(false);
        } else {
          view.byId("STOBtn").setVisible(true);
          view.byId("POBtn").setVisible(false);
        }
        
        this.refreshTracker();
        this.getView().byId("summaryId").addStyleClass("bold");
        this.getView().byId("linkid").removeStyleClass("bold");
        this.getView().byId("pidallEvents").setVisible(false);
        this.getView().byId("TransRt").removeStyleClass(
          "invisible");
      },
      onChangePriority: function(oEvent) {

        this.BUSY_DIALOG.setText(this.getTextFromBundle("processingUpdate"));
        this.busyIndicatorShow();

        var isSelected = oEvent.getSource().getSelectedKey();
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.P_FLAG, this.EvtAct.UPD,
          isSelected);
        $.sap.delayedCall(0, this, function() {
          this.updatePriority(this.currentPriority, isSelected, this.getView().getModel().getProperty("/GUID"));
        });
      },

      onPoStoClick: function(oEvent) {
        var view = this.getView();
    var id=oEvent.getSource().getId();
    var missingParams = [],errFlag=false,poFlag=false;
    var poId=view.byId("poLink").getId(),stoId=view.byId("stoLink");
        var oModel = view.getModel("containerDetail");
        var portalURL = view.getModel("userMarketModel").getProperty("/PortalURL");
        var sysAliasSTO = oModel.getProperty("/SysAliasSTO");
        var po_sto = oEvent.getSource().getText();
        if(poId===id){
          poFlag=true;
        }
            if(!Utility.hasValue(portalURL)){
          missingParams.push(this.getTextFromBundle("portalUrl"));
          errFlag=true;
        }
        if(!Utility.hasValue(po_sto)){
          missingParams.push((poFlag) ? this.getTextFromBundle("poNum") : this.getTextFromBundle("stoNum"));
          errFlag=true;
          po_sto="";
        }
            if(!Utility.hasValue(sysAliasSTO)){
          missingParams.push(this.getTextFromBundle("sysAlias"));
          errFlag=true;
        }
        if (errFlag===true) {
          Utility.displayError(this.getTextFromBundle("errURLGenerationText",[missingParams.join(",")]), this.getTextFromBundle("errURLGenerationTitle"));
        }
    // For GA Tagging
        this.trackGAEvent((poFlag) ? this.EvtCat.PO : this.EvtCat.STO, this.EvtAct.CLICK,
          po_sto);


      },

      onASNClick: function(oEvent) {
         var view = this.getView();
        var oModel = view.getModel("containerDetail");
        var missingParams = [],errFlag=false;
              var portalURL = view.getModel("userMarketModel").getProperty("/PortalURL");
              var sysAliasDLV = oModel.getProperty("/SysAliasDLV");
              var asn = oEvent.getSource().getText();
        if(!Utility.hasValue(portalURL)){
          missingParams.push(this.getTextFromBundle("portalUrl"));
          errFlag=true;
        }
        if(!Utility.hasValue(asn)){
          missingParams.push(this.getTextFromBundle("delvNum"));
          errFlag=true;
          asn="";
        }
              if(!Utility.hasValue(sysAliasDLV)){
          missingParams.push(this.getTextFromBundle("sysAlias"));
          errFlag=true;
        }
        if (errFlag===true) {
          Utility.displayError(this.getTextFromBundle("errURLGenerationText",[missingParams.join(",")]), this.getTextFromBundle("errURLGenerationTitle"));
        }
    // For GA Tagging
        this.trackGAEvent(this.EvtCat.ASN, this.EvtAct.CLICK,
          asn);

      },

      onSKUClick: function(oEvent) {
        var view = this.getView();
        var oModel = view.getModel();
        var missingParams = [],errFlag=false;
        var locno = view.getModel("containerDetail").getProperty("/ReceivingPlant");
        var sysAliasAPO = view.getModel("userMarketModel").getProperty("/SysAliasAPO");
        var portalURL = view.getModel("userMarketModel").getProperty("/PortalURL");
        var lastETA = oModel.getProperty("/UDelDate");
        var sku = oEvent.getSource().getText();
        if(!Utility.hasValue(portalURL)){
          missingParams.push(this.getTextFromBundle("portalUrl"));
          errFlag=true;
        }
        if(!Utility.hasValue(sku)){
          missingParams.push(this.getTextFromBundle("matnr"));
          errFlag=true;
        }
        if(!Utility.hasValue(locno)){
          missingParams.push(this.getTextFromBundle("loc"));
          errFlag=true;
        }
        if(!Utility.hasValue(lastETA)){
          missingParams.push(this.getTextFromBundle("actDelDate"));
          errFlag=true;
        }
        if(!Utility.hasValue(sysAliasAPO)){
          missingParams.push(this.getTextFromBundle("apoSysAlias"));
          errFlag=true;
        }
        if (errFlag===true) {
          Utility.displayError(this.getTextFromBundle("errURLGenerationText",[missingParams.join(", ")]), this.getTextFromBundle("errURLGenerationTitle"));
        }
        // For GA Tagging
        this.trackGAEvent(this.EvtCat.SKU, this.EvtAct.CLICK,
          sku);
      },

      navBack: function(oEvent) {
        var bus = this.getOwnerComponent().getEventBus();
        // if (this.source === "DCL") {
        //   bus.publish("dcl", "preventExecution");
        // } else if (this.source === "RP") {
        //   bus.publish("pa", "preventExecution");
        // } else if (this.source === "DP") {
        //   bus.publish("dp", "preventExecution");
        // }
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();
        var btnId = oEvent.getSource().getId();
         var paramModel = this.getOwnerComponent().getModel("paramModel");
        if (oEvent.getSource().getText()===this.getTextFromBundle("backToDashboardPage")){
          //&& typeof sPreviousHash === 'undefined')) {
         
          // End
          if(typeof sPreviousHash === "undefined"){
          	// this.setCustomHashChange(true);
          	this.getRouter().navTo("DashboardP", {
            direction: paramModel.getProperty("/direction"),
            type: paramModel.getProperty("/type"),
            fromDate: paramModel.getProperty("/fromDate"),
            toDate: paramModel.getProperty("/toDate"),
            companyCode: paramModel.getProperty("/companyCode")
          }, false);
          	
          }
          /*$.sap.delayedCall(2000,this,function(){
          	this.getEventBus().publish("root", "localRefresh", {
		            src: "Dashboard",
		            isSelectAll:true,
		            isLocal:false
		          });
          });*/
          	
          //}
          else{
          	this.setCustomHashChange(true);
          	this.getRouter().navTo("DashboardP", {
            direction: paramModel.getProperty("/direction"),
            type: paramModel.getProperty("/type"),
            fromDate: paramModel.getProperty("/fromDate"),
            toDate: paramModel.getProperty("/toDate"),
            companyCode: paramModel.getProperty("/companyCode")
          }, false);
          }
        }
        else if(btnId === this.getView().byId("dashboardBtn").getId()){
            this.getRouter().navTo("DashboardP", {
            direction: paramModel.getProperty("/direction"),
            type: paramModel.getProperty("/type"),
            fromDate: paramModel.getProperty("/fromDate"),
            toDate: paramModel.getProperty("/toDate"),
            companyCode: paramModel.getProperty("/companyCode")
          }, false);
        }
        else if (oEvent.getSource().getText()===this.getTextFromBundle("backToResultView")){
          //&& typeof sPreviousHash === 'undefined')) {
         
          // End
          if(typeof sPreviousHash === "undefined"){
          	// this.setCustomHashChange(true);
          	this.getRouter().navTo("PlanningAdvisorP", {
            direction: paramModel.getProperty("/direction"),
            type: paramModel.getProperty("/type"),
            fromDate: paramModel.getProperty("/fromDate"),
            toDate: paramModel.getProperty("/toDate"),
            companyCode: paramModel.getProperty("/companyCode")
          }, false);
          	
          }
          else{
          	this.setCustomHashChange(true);
          	this.getRouter().navTo("PlanningAdvisorP", {
            direction: paramModel.getProperty("/direction"),
            type: paramModel.getProperty("/type"),
            fromDate: paramModel.getProperty("/fromDate"),
            toDate: paramModel.getProperty("/toDate"),
            companyCode: paramModel.getProperty("/companyCode")
          }, false);
          }
        }
        else {

          // The history contains a previous entry
          
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            this.router.navTo("Root", null, false);
          }
        }
      },
      toDCLoad: function(oEvent) {
        if (this.getOwnerComponent().getModel("filterPC").oData.ProductCollection.length > 0) {
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
            companyCode: paramModel.getProperty("/companyCode")
          }, false);
        } else {
          sap.m.MessageBox.alert(this.oBundle
            .getText("noDataInDtRange"), {
              styleClass: "sapUiSizeCompact",
              icon: sap.m.MessageBox.Icon.ERROR,
              title: this.getTextFromBundle("errNoData")
            });
        }

      },

      setNavBtnVisibility: function() {
      	var view = this.getView();
        var nb = view.byId("next");
        var pb = view.byId("prev");
        var totcnt = view.byId("lbl_totcont");
        var curr = view.byId("lbl_current");
        if (this.source === "DP" || this.source === "DCL") {
          nb.setVisible(false);
          pb.setVisible(false);
          totcnt.setVisible(false);
          curr.setVisible(false);
        } else {
          nb.setVisible(true);
          pb.setVisible(true);
          totcnt.setVisible(true);
          curr.setVisible(true);
        }
      },

      clicktoExpand: function(evt) {
        var oCommentBox = this.getView().byId("commentsid");
        var oMainBox = this.getView().byId("upperArea");
        var icon = evt.getSource().getIcon();
        if (icon === "sap-icon://media-play") {
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.PANE,
            this.EvtAct.HIDE, "");
          oCommentBox.addStyleClass("invisible");
          oMainBox.addStyleClass("width99");
          evt.getSource().setIcon("sap-icon://media-reverse");

        } else {
          // For GA Tagging
          this.trackGAEvent(this.EvtCat.PANE,
            this.EvtAct.SHOW, "");
          oCommentBox.removeStyleClass("invisible");
          oMainBox.removeStyleClass("width99");
          evt.getSource().setIcon("sap-icon://media-play");
        }
      },

      refreshTracker: function() {
        var evt = this.getView().getModel("containerDetail").oData.EventSet.results;
        var view = this.getView();
        var align = view.getModel().oData.AlignStatus;
        var hl = view.byId("sel_priority").getParent()
          .getParent();
        if (align === "3") {
          hl.addStyleClass("visHidden");
        } else {
          hl.removeStyleClass("visHidden");
        }
        this.setTrackerModel(evt);
        //this.getView().byId("tpHdrLayout").addStyleClass("transitProgHdr");
      },
      setHeaderText: function(oEvent) {
        var oPanel = oEvent.getSource();
        var isExpanded = oEvent.getParameter("expand");
        if (isExpanded === true) {
          oPanel.setHeaderText(this.oBundle
            .getText("moreDetailsCollapsed"));
        } else {
          oPanel.setHeaderText(this.oBundle
            .getText("moreDetailsExpanded"));
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
      allEvents: function(evt) {
        if (evt.getSource().getId() === this.getView().byId(
          "linkid").getId()) {
          evt.getSource().addStyleClass("bold");
          this.getView().byId("summaryId").removeStyleClass(
            "bold");
          this.getView().byId("TransRt").addStyleClass(
            "invisible");
          this.getView().byId("pidallEvents")
            .setVisible(true);
        } else if (evt.getSource().getId() === this.getView()
          .byId("summaryId").getId()) {
          evt.getSource().addStyleClass("bold");
          this.getView().byId("linkid").removeStyleClass(
            "bold");
          this.getView().byId("pidallEvents").setVisible(
            false);
          this.getView().byId("TransRt").removeStyleClass(
            "invisible");
        }
      },
      setRcvEvtModel: function(model) {
        var events = model.getProperty("/EventSet/results");
        var rcvEvt = [];
        var eM = new sap.ui.model.json.JSONModel();
        eM.setSizeLimit(99999);
        var rcvD = null;
        for (var i = events.length - 1; i >= 0; i--) {
          if (typeof(events[i].subEvents) !== "undefined") {
            var sE = events[i].subEvents;
            for (var j = sE.length - 1; j >= 0; j--) {
              rcvD = sE[j].UTCReceiveDate;
              if (typeof rcvD !== "undefined" || rcvD !== "" || Number(rcvD) !== 0) {
                rcvEvt.push(sE[j]);
              }
            }
          }
          rcvD = events[i].UTCReceiveDate;
          if (typeof(rcvD) === "undefined" || rcvD === "") {
            continue;
          } else {
            rcvEvt.push(events[i]);
          }

        }
        eM.setData({
          Events: rcvEvt
        });
        this.getView().byId("idProductsTableallEvents")
          .setModel(eM);
      },
      updateParamModel: function() {
        if (this.urlParams) {
          var paramModel = new sap.ui.model.json.JSONModel();
          paramModel.setData({
            direction: this.urlParams.direction,
            type: this.urlParams.type,
            fromDate: this.urlParams.fromDate,
            toDate: this.urlParams.toDate,
            companyCode: this.urlParams.companyCode,
            guid: this.urlParams.guid
          });
          this.getOwnerComponent().setModel(paramModel, "paramModel");
        }
      },

      postComment: function(oEvent) {
        var comment = this.getView().byId("feedInput").getValue();
        comment = comment.replace(/^\s+|\s+$/g, '');
        if (comment.length === 0) {
          $.sap.require("sap.m.MessageBox");
          sap.m.MessageBox.alert(Utility.oBundle
            .getText(Utility.oBundle.getText("reqText")), {
              styleClass: "sapUiSizeCompact",
              icon: sap.m.MessageBox.Icon.ERROR,
              title: Utility.oBundle.getText("err")
            });
          return;
        }
        var usrModel = this.getOwnerComponent().getModel("usrModel");
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
          UserId: usrModel.getProperty("/UserId"),
          FirstName: usrModel.getProperty("/FirstName"),
          LastName: usrModel.getProperty("/LastName"),
          Type: 'Comment',
          ChatText: comment
        });
        oEntry.ChatItemSet = chatItem;
        this.postChatComment(oEntry);
      },
      getTrackerTooltipDetails: function(eventData,allEvents) {
        var rcvDate = Utility.getDateParts(eventData.UTCReceiveDate, true);
        var aDate = "" + Utility.dateConvert(rcvDate.date,
          "yyyyMMdd");

        if (aDate === "") {
          aDate = this.getTextFromBundle("na");
        }
        var rndLblClass = "";

        var pDateParts = Utility.getDateParts(eventData.EventDate, true);
        var aDateParts = Utility.getDateParts(eventData.UTCReceiveDate, true);
        var dateDiff = 0;
        dateDiff = Utility.getDateDiff(pDateParts.date, aDateParts.date, "yyyyMMdd");
        // }
        //For Transit Leg Calculation
            var evtPos=null;
            for(var i=0;i<allEvents.length;i++){
                if(eventData.EventID===allEvents[i].EventID && eventData.EventDesc===allEvents[i].EventDesc){
                    evtPos=i;
                }
            }
            var sValue = $.sap.getUriParameters().get("container");
			if (Utility.hasValue(sValue)) {
				if (sValue.toLowerCase() === "all") {
				    if(evtPos!==null){
				        if(evtPos<4){
				            var tl=eventData.TransitLeg;
				            if(tl>0 && tl<4){
				                dateDiff=this.getModel("currContainerModel").getProperty("/TransitTime"+tl)-dateDiff;
				            }
				        }
				        
				    }
				}
			}
          //End for Transit Leg
        var alignmentStatus = Utility
          .getAlignmentStatus(dateDiff);
        var alignmentColor = Utility
          .getAlignmentColor(alignmentStatus);
        if (alignmentColor === "red") {
          rndLblClass = "roundLblRed";
        } else if (alignmentColor === "green") {
          rndLblClass = "roundLblGreen";
        } else if (alignmentColor === "blue") {
          rndLblClass = "roundLblBlue";
        }
        var alignmentNum = Utility
          .getAlignmentNumText(dateDiff);
        var aDateLbl = this.getTextFromBundle("tooltipTextActual");
        
        var pDateLbl = "",firstEventPos=0;
        for(var i=0;i<allEvents.length;i++){
            if(allEvents[i].EventID!=="ARRIV_DEST"){
                firstEventPos=i;
                break;
            }
        }
        if(eventData.EventID===allEvents[firstEventPos].EventID && eventData.EventDesc === allEvents[firstEventPos].EventDesc){
            pDateLbl=this.getTextFromBundle("tooltipTextFirstETD");
        }
        else{
            pDateLbl=this.getTextFromBundle("tooltipTextFirstETA");
        }
        var pDate = Utility.dateConvert(pDateParts.date,
          "yyyyMMdd");
        return {
          "roundLblClass": rndLblClass,
          "actualDate": aDate,
          "plannedDate": pDate,
          "actualDateLbl": aDateLbl,
          "plannedDateLbl": pDateLbl,
          "alignmentNum": alignmentNum,
          "EventID": eventData.EventID,
          "EventDesc": eventData.EventDesc,
          "Location": eventData.Location,
          "LocDesc": eventData.LocDesc
        };
      },
      setTrackerModel: function(evt) {
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.setData({
          "Events": evt,
          "EventDetails": this.getTrackerEventDetails(evt),
          "EventsLineStyle": this.getTrackerPathStyle(evt),
          "HeaderData":this.getModel("currContainerModel").getProperty("/")
        });
        this._oTracker.setModel(oModel);
        this._oTracker.refreshTracker();

      },
      setBatchModel: function() {
        var view = this.getView();
        var oModel = view.getModel();
        var oContModel = view.getModel("containerDetail");
        this.getBatchDetails(oModel.getProperty("/ASN"), oContModel.getProperty("/SysAliasDLV"));
        this.waitForBatchLoad(function() {
          var mod = this.getOwnerComponent().getModel("batchModel");
          var batchModel = new sap.ui.model.json.JSONModel();
          batchModel.setSizeLimit(99999);
          batchModel.setData({
            BatchDetails: mod.getProperty("/")
          });
          view.setModel(batchModel, "batchModel");
        });

      }
	});

});