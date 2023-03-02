/*$.sap.require('sap.ui.core.format.DateFormat');
$.sap.require("glb.gtmh.oct.util.Utility");
$.sap.declare("glb.gtmh.oct.util.Formatter");

glb.gtmh.oct.util.Formatter = {*/
sap.ui.define([
    'sap/ui/core/Element',
    'sap/ui/core/format/DateFormat',
    'glb/gtmh/oct/util/Utility'
], function (Element, DateFormat,Utility) {
    "use strict";

    var Formatter = Element.extend("glb.gtmh.oct.util.Formatter");
    
  Formatter.setContainer=function(c) {
    var cNum = null;
    if (c === null || typeof c === "undefined" || c === "") {
      cNum = Utility.oBundle.getText("unidentified");
    } else {
      cNum = c;
    }
    return cNum;
  };
  Formatter.getPoSto=function(po,sto){
  	if(Utility.hasValue(sto)){
  		return sto;
  	}
  	else{
  		return po;
  	}
  };
  Formatter.setContainerText=function(c) {
    var cNum = null;
    if (c === null || typeof c === "undefined" || c === "") {
      cNum = Utility.oBundle.getText("unidentifiedC");
    } else {
      cNum = c;
    }
    return cNum;
  };
  Formatter.setNewContHdrText =function(direction){
    if(typeof direction ==='undefined' || direction === null){
      return Utility.oBundle.getText("newestInboundContainers");
    }
    else{
    if(direction === 'Outbound'){
      return Utility.oBundle.getText("newestOutboundContainers");
    }
    else{
      return Utility.oBundle.getText("newestInboundContainers");
    }
    }
  };
  Formatter.setWarningIcon =function(cNum){
    if (cNum === null || typeof cNum === "undefined" || cNum === "") {
      this.addStyleClass("invisible");
    }
    else{
      this.removeStyleClass("invisible");
    }
    return "#FFCC00";
  };
  Formatter.setLeftMargin =function(cNum){
    if (cNum === null || typeof cNum === "undefined" || cNum === "") {
      this.removeStyleClass("marginLeft2HalfRem");
      this.addStyleClass("marginTop10");
    }
    else{
      this.removeStyleClass("marginTop10");
      this.addStyleClass("marginLeft2HalfRem");
    }
    return false;
  };
  Formatter.setPOTextInPopup=function(po,asn,cNum) {
    if (cNum === null || typeof cNum === "undefined" || cNum === "") {
      return Utility.oBundle.getText("uic", [po,asn]);
    }
    else{
      return Utility.oBundle.getText("warningSetContainer", [asn]);
    }
  };
  Formatter.setASNTextInPopuptryAgain=function(asn) {
    return Utility.oBundle.getText("uictryAgain", [asn]);
  };
  Formatter.setPOTextInPopuptryAgainUdate=function(po) {
    return Utility.oBundle.getText("uictryAgainuDdate", [po]);
  };
  Formatter.setASNTextInPopupSuccess=function(cnum,asn) {
    return Utility.oBundle.getText("uicSucess", [cnum,asn]);
  };

  Formatter.setPODdateTextInPopupSuccess=function(po,ddate) {
  var finalddate=Utility.dateConvert(ddate, "yyyyMMdd",false,true);
    return Utility.oBundle.getText("uicSucessDdate", [po,finalddate]);
  };
  Formatter.setPriorityVisibility=function(value) {
    if (value === "3") {
      this.addStyleClass("visHidden");
    } else {
      this.removeStyleClass("visHidden");
    }
    return "";
  };
  Formatter.setGTNexusBtnVisibility=function(cnum){
    if (cnum === null || typeof cnum === "undefined" || cnum === "") {
      return false;
    }
    else{
      return true;
    }
  };
  Formatter.setFlagTooltip=function(priority, cid) {
    if (priority) {
      if (priority === "1") {
        return cid + ": " + Utility.oBundle.getText("outOfStock");
      } else if (priority === "2") {
        return cid + ": " + Utility.oBundle.getText("lowStock");
      } else if (priority === "3") {
        return cid + ": " + Utility.oBundle.getText("noFlag");
      } else {
        return "";
      }
    } else {
      return "";
    }
  };

  Formatter.setFlagColor=function(value) {
    if (value) {
      if (value === "1") {
        return "red";
      } else if (value === "2") {
        return "#ffc200";
      } else if (value === "3") {
        return "green";
      } else {
        return "black";
      }
    } else {
      return "black";
    }
  };

  Formatter.setFlagColorPA=function(value) {
    if (value) {
      if (value === "1") {
        return "red";
      } else if (value === "2") {
        return "#ffc200";
      } else if (value === "3") {
        return "transparent";
      } else if (value === "0") {
        return "white";
      } else {
        return "black";
      }
    } else {
      return "black";
    }
  };
  Formatter.setFlagColorDCL=function(value) {
    if (value) {
      if (value === "1") {
        this.getParent().getParent().addStyleClass("red");
        this.getParent().getParent().removeStyleClass("yellow");
        this.getParent().getParent().removeStyleClass("green");
        return "red";
      } else if (value === "2") {
        this.getParent().getParent().addStyleClass("yellow");
        this.getParent().getParent().removeStyleClass("red");
        this.getParent().getParent().removeStyleClass("green");
        return "#ffc200";
      } else if (value === "3") {
        this.getParent().getParent().addStyleClass("green");
        this.getParent().getParent().removeStyleClass("yellow");
        this.getParent().getParent().removeStyleClass("red");
        return "transparent";
      } else if (value === "0") {
        return "white";
      } else {
        return "black";
      }
    } else {
      return "black";
    }
  };
  Formatter.alignmentFormat=function(planned, actual, cnum, GRInd) {
    if (cnum === null || typeof cnum === "undefined" || cnum === "") {
      this.addStyleClass('etaUIColor');
      this.removeStyleClass('etaArrivedColor');
	    this.removeStyleClass('etaOnTimeColor');
	    this.removeStyleClass('etaLateColor');
	    this.removeStyleClass('etaEarlyColor');
      return Utility.oBundle.getText("legUI");
    }
    if (planned === null || typeof planned === "undefined" || planned === "") {
      return "";
    }
    if (actual === null || typeof actual === "undefined" || actual === "") {
      return "";
    }
    try {
      var dateDiff = Utility.getDateDiff(planned, actual, "yyyyMMdd");
      var numText = Utility.getAlignmentNumText(dateDiff);
     // if (Utility.getToday("yyyyMMdd") > Utility.getDateString(actual)) {
        if(GRInd.toUpperCase()==="X"){
        this.addStyleClass('etaArrivedColor');
        this.removeStyleClass('etaUIColor');
        this.removeStyleClass('etaOnTimeColor');
        this.removeStyleClass('etaLateColor');
        this.removeStyleClass('etaEarlyColor');
        return Utility.oBundle.getText("legArrived");
      } else {
        if (dateDiff === 0) {
          this.addStyleClass('etaOnTimeColor');
          this.removeStyleClass('etaUIColor');
	        this.removeStyleClass('etaArrivedColor');
	        this.removeStyleClass('etaLateColor');
	        this.removeStyleClass('etaEarlyColor');
          return Utility.oBundle.getText("legOnTime");// + " (" + numText + ")";
        } else if (dateDiff > 0) {
          this.addStyleClass('etaLateColor');
          this.removeStyleClass('etaUIColor');
	        this.removeStyleClass('etaOnTimeColor');
	        this.removeStyleClass('etaArrivedColor');
	        this.removeStyleClass('etaEarlyColor');
          return Utility.oBundle.getText("legLate") + " (" + numText + ")";
        } else if (dateDiff < 0) {
          this.addStyleClass('etaEarlyColor');
          this.removeStyleClass('etaUIColor');
	        this.removeStyleClass('etaOnTimeColor');
	        this.removeStyleClass('etaLateColor');
	        this.removeStyleClass('etaArrivedColor');
          return Utility.oBundle.getText("legEarly") + " (" + numText + ")";
        }
      }
    } catch (err) {
      return '';
    }
  };
  Formatter.alignmentStatus=function(planned, actual, cnum, GRInd) {
    if (cnum === null || typeof cnum === "undefined" || cnum === "") {
      return "";
    }
    if (planned === null || typeof planned === "undefined" || planned === "") {
      return "";
    }
    if (actual === null || typeof actual === "undefined" || actual === "") {
      return "";
    }
    try {
      var dateDiff = Utility.getDateDiff(planned, actual, "yyyyMMdd");
    //   if (Utility.getToday("yyyyMMdd") > Utility.getDateString(actual)) {
    if(GRInd.toUpperCase()==="X"){
        return "Arrived";
      } else {
        return Utility.getAlignmentStatus(dateDiff);
      }
    } catch (err) {
      return '';
    }
  };
  Formatter.alignmentText=function(planned, actual, cnum, GRInd) {
    if (cnum === null || typeof cnum === "undefined" || cnum === "") {
      return "";
    }
    if (planned === null || typeof planned === "undefined" || planned === "") {
      return "";
    }
    if (actual === null || typeof actual === "undefined" || actual === "") {
      return "";
    }
    try {
      var dateDiff = Utility.getDateDiff(planned, actual, "yyyyMMdd");
    //   if (Utility.getToday("yyyyMMdd") > Utility.getDateString(actual)) {
    if(GRInd.toUpperCase()==="X"){
        return "";
      } else {
        return Utility.getAlignmentText(dateDiff);
      }

    } catch (err) {
      return '';
    }
  };

  Formatter.containerStatusInfo=function(planned, actual, cnum, GRInd) {
    if (actual === null || typeof actual === "undefined" || actual === "" || cnum === null || typeof cnum === "undefined" || cnum === "") {
      if (this.hasStyleClass("roundLblRed")) {
        this.removeStyleClass("roundLblRed");
      }
      if (this.hasStyleClass("roundLblBlue")) {

        this.removeStyleClass("roundLblBlue");
      }
      if (this.hasStyleClass("roundLblGreen")) {

        this.removeStyleClass("roundLblGreen");
      }
      if (this.hasStyleClass("roundLblGrey")) {

        this.removeStyleClass("roundLblGrey");
      }
      this.addStyleClass('roundLblTrans');
      return "";
    }
    try {
      var dateDiff = Utility.getDateDiff(planned, actual, "yyyyMMdd");
      var numText = Utility.getAlignmentNumText(dateDiff);
    //   if (Utility.getToday("yyyyMMdd") > Utility.getDateString(actual)) {
    if(GRInd.toUpperCase()==="X"){
        if (this.hasStyleClass("roundLblRed")) {
          this.removeStyleClass("roundLblRed");
        }
        if (this.hasStyleClass("roundLblBlue")) {

          this.removeStyleClass("roundLblBlue");
        }
        if (this.hasStyleClass("roundLblGreen")) {

          this.removeStyleClass("roundLblGreen");
        }
        if (this.hasStyleClass("roundLblTrans")) {

          this.removeStyleClass("roundLblTrans");
        }
        this.addStyleClass('roundLblGrey');
        return numText;
      } else {
        if (dateDiff === 0) {
          if (this.hasStyleClass("roundLblRed")) {
            this.removeStyleClass("roundLblRed");
          }
          if (this.hasStyleClass("roundLblBlue")) {

            this.removeStyleClass("roundLblBlue");
          }
          if (this.hasStyleClass("roundLblGrey")) {

            this.removeStyleClass("roundLblGrey");
          }
          if (this.hasStyleClass("roundLblTrans")) {

            this.removeStyleClass("roundLblTrans");
          }
          this.addStyleClass('roundLblGreen');
          return numText;
        } else if (dateDiff > 0) {
          if (this.hasStyleClass("roundLblGreen")) {
            this.removeStyleClass("roundLblGreen");
          }
          if (this.hasStyleClass("roundLblBlue")) {
            this.removeStyleClass("roundLblBlue");
          }
          if (this.hasStyleClass("roundLblGrey")) {

            this.removeStyleClass("roundLblGrey");
          }
          if (this.hasStyleClass("roundLblTrans")) {

            this.removeStyleClass("roundLblTrans");
          }
          this.addStyleClass('roundLblRed');
          return numText;
        } else if (dateDiff < 0) {
          if (this.hasStyleClass("roundLblGreen")) {
            this.removeStyleClass("roundLblGreen");
          }
          if (this.hasStyleClass("roundLblRed")) {
            this.removeStyleClass("roundLblRed");
          }
          if (this.hasStyleClass("roundLblGrey")) {

            this.removeStyleClass("roundLblGrey");
          }
          if (this.hasStyleClass("roundLblTrans")) {

            this.removeStyleClass("roundLblTrans");
          }
          this.addStyleClass('roundLblBlue');
          return numText;
        } else {
          return '';
        }
      }
    } catch (err) {
      return '';
    }
  };

  Formatter.setAlignmentNumColor=function(value) {
    if (value) {
      var cat = value.substring(0, 1).toUpperCase();
      if (cat === '0') {
        if (this.hasStyleClass("roundLblRed")) {
          this.removeStyleClass("roundLblRed");
        }
        if (this.hasStyleClass("roundLblBlue")) {
          this.removeStyleClass("roundLblBlue");
        }
        this.addStyleClass('roundLblGreen');
        return value;
      } else if (cat === '+') {
        if (this.hasStyleClass("roundLblGreen")) {
          this.removeStyleClass("roundLblGreen");
        }
        if (this.hasStyleClass("roundLblBlue")) {
          this.removeStyleClass("roundLblBlue");
        }
        this.addStyleClass('roundLblRed');
        return value;
      } else if (cat === '-') {
        if (this.hasStyleClass("roundLblGreen")) {
          this.removeStyleClass("roundLblGreen");
        }
        if (this.hasStyleClass("roundLblRed")) {
          this.removeStyleClass("roundLblRed");
        }
        this.addStyleClass('roundLblBlue');
        return value;
      } else {
        return value;
      }
    } else {
      return '';
    }
  };
  Formatter.alignmentColor=function(planned, actual, cnum, GRInd) {
    try {
      if (actual === null || typeof actual === "undefined" || actual === "" || cnum === null || typeof cnum === "undefined" || cnum === "") {
        return "paleorange";
      }
      var dateDiff = Utility.getDateDiff(planned, actual, "yyyyMMdd");
    //   if (Utility.getToday("yyyyMMdd") > Utility.getDateString(actual)) {
    if(GRInd.toUpperCase()==="X"){
        return "darkgrey";
      } else {
        if (dateDiff === 0) {
          return "green";
        } else if (dateDiff > 0) {
          return "red";
        } else if (dateDiff < 0) {
          return "blue";
        }
      }
    } catch (err) {
      return '';
    }
  };

  Formatter.containerDetailColor=function(planned, actual, cnum, GRInd) {
    if (actual === null || typeof actual === "undefined" || actual === "" || cnum === null || typeof cnum === "undefined" || cnum === "") {
      if (this.hasStyleClass("green_panel")) {
        this.removeStyleClass("green_panel");
      }
      if (this.hasStyleClass("blue_panel")) {
        this.removeStyleClass("blue_panel");
      }
      if (this.hasStyleClass("grey_panel")) {
        this.removeStyleClass("grey_panel");
      }
      if (this.hasStyleClass("red_panel")) {
        this.removeStyleClass("red_panel");
      }
      this.addStyleClass('vorange_panel');
      return false;
    }
    try {
      var dateDiff = Utility.getDateDiff(planned, actual, "yyyyMMdd");
    //   if (Utility.getToday("yyyyMMdd") > Utility.getDateString(actual)) {
    if(GRInd.toUpperCase()==="X"){
        if (this.hasStyleClass("red_panel")) {
          this.removeStyleClass("red_panel");
        }
        if (this.hasStyleClass("blue_panel")) {
          this.removeStyleClass("blue_panel");
        }
        if (this.hasStyleClass("green_panel")) {
          this.removeStyleClass("green_panel");
        }
        if (this.hasStyleClass("vorange_panel")) {
          this.removeStyleClass("vorange_panel");
        }
        this.addStyleClass('grey_panel');
        return false;
      } else {
        if (dateDiff === 0) {
          if (this.hasStyleClass("red_panel")) {
            this.removeStyleClass("red_panel");
          }
          if (this.hasStyleClass("blue_panel")) {
            this.removeStyleClass("blue_panel");
          }
          if (this.hasStyleClass("grey_panel")) {
            this.removeStyleClass("grey_panel");
          }
          if (this.hasStyleClass("vorange_panel")) {
            this.removeStyleClass("vorange_panel");
          }
          this.addStyleClass('green_panel');
          return false;
        } else if (dateDiff > 0) {
          if (this.hasStyleClass("green_panel")) {
            this.removeStyleClass("green_panel");
          }
          if (this.hasStyleClass("blue_panel")) {
            this.removeStyleClass("blue_panel");
          }
          if (this.hasStyleClass("grey_panel")) {
            this.removeStyleClass("grey_panel");
          }
          if (this.hasStyleClass("vorange_panel")) {
            this.removeStyleClass("vorange_panel");
          }
          this.addStyleClass('red_panel');
          return false;
        } else if (dateDiff < 0) {
          if (this.hasStyleClass("red_panel")) {
            this.removeStyleClass("red_panel");
          }
          if (this.hasStyleClass("green_panel")) {
            this.removeStyleClass("green_panel");
          }
          if (this.hasStyleClass("grey_panel")) {
            this.removeStyleClass("grey_panel");
          }
          if (this.hasStyleClass("vorange_panel")) {
            this.removeStyleClass("vorange_panel");
          }
          this.addStyleClass('blue_panel');
          return false;
        } else {
          return false;
        }
      }
    } catch (err) {
      return false;
    }
  };
  Formatter.formatDate=function(date) {
    if (date === null || typeof date === 'undefined') {
      return '';
    }
    var dateObj = null;
    if (date instanceof Date) {
      dateObj = date;
    } else {
      try {
        dateObj = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: 'yyyyMMdd'
        }).parse(date);
      } catch (err) {
        return '';
      }
    }
    try {
      return " " + sap.ui.core.format.DateFormat.getDateInstance({
        pattern: 'dd/MM/yyyy'
        // style:'daysAgo'
      }).format(dateObj);
    } catch (err) {
      return '';
    }
  };
  Formatter.getActualDate=function(date) {
    var today = new Date();
    today = sap.ui.core.format.DateFormat.getDateInstance({
      pattern: 'yyyyMMdd'
    }).format(today);
    if (date === null || typeof date === 'undefined') {
      return Utility.oBundle.getText("na");
    } else {
      var dateObj1 = null;
      var dateObj2 = null;

      try {
        dateObj1 = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: 'yyyyMMdd'
        }).parse(date);
        dateObj2 = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: 'yyyyMMdd'
        }).format(dateObj1);
      } catch (err) {
        return Utility.oBundle.getText("na");
      }

      if (Number(today) < Number(dateObj2)) {
        return Utility.oBundle.getText("na");
      } else {
        try {
          return " " + sap.ui.core.format.DateFormat
            .getDateInstance({
              pattern: 'dd/MM/yyyy'
              // style:'daysAgo'
            }).format(dateObj1);
        } catch (err) {
          return Utility.oBundle.getText("na");
        }
      }

    }
  };
  Formatter.getURL=function(portalUrl, sysAliasAPO, sku, locno, lastETA) {
    lastETA = Utility.formatDate(lastETA, "yyyyMMdd", "dd.MM.yyyy");
    var url = "";
    if(Utility.hasValue(portalUrl)){
    if (Utility.hasValue(sku) && Utility.hasValue(locno) && Utility.hasValue(lastETA) && Utility.hasValue(sysAliasAPO)) {
    //var pattern="/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i";
    var urlParts = portalUrl.match(/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i);
    if(urlParts !== null && typeof urlParts !== 'undefined'){
       urlParts.splice(0,1);
      url=urlParts.join("");
    //"https://globe7eur.nestle.com:26001/irj/servlet/prt/portal/prtroot/ABJPRAP001
      url +=

 "pcd!3a!2f!2fportal_content!2ftemplates!2fiviews!2fsap_transaction_iview?TCode=/GLB/AGTPD01_CALLPB&SAP_TransType=TXN&SAP_TechRoleName=APO_ALERT_MONITOR&SAP_Market=XX&SAP_BoxCombination"+
"=_A&SAP_Zone=AMS&SAP_Source=EXT&SAP_IViewDesc=/GLB/AGTPD01_CALLPB&AutoStart=true&System="+
sysAliasAPO+"&SAP_DummySystem="+sysAliasAPO+"&DynamicParameter=P_DATE%3D" +
        lastETA + "%26P_DVIEW%3D78_WEEKS%26P_LOCNO%3D" + locno + "%26P_MATNR%3D" + sku + "%26P_MVIEW%3DGTSP_INTERACTIVE_4.1";

        return url;
    }
    else{
      return null;
    }
    }
    else{
      return null;
    }
    }
    else{
      return null;
    }
    return url;
  };

  Formatter.getImgURL=function(portalUrl, uid) {
  	if(uid==="NBGOONKO"){
		return "./img/kousik.jpg";
  	}
  	else if(uid === "NBROYBI"){
  		return "./img/profilepic.gif";
  	}
  	else if(uid === "CATAMK"){
  		return "./img/keith.png";
  	}
  	else if(uid === "CAHOSHINRE"){
  		return "./img/hoshino.jpg";
  	}
  	else if(uid === "CABEHANK"){
  		return "./img/kevin.png";
  	}
    /*var url;
    if(Utility.hasValue(portalUrl)){
   // var pattern="/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i";
    var urlParts = portalUrl.match(/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i);
   if(urlParts !== null && typeof urlParts !== 'undefined'){
    urlParts.splice(0,1);
      url=urlParts.join("");
       if (typeof uid !== "undefined") {

         //url = "http://globe7.nestle.com:26000/irj/servlet/prt/portal/prtroot/com.nestle.globe.ep7core.xx.uattrib.UPicture?userID=" + uid;
         url += "com.nestle.globe.ep7core.xx.uattrib.UPicture?userID=" + uid;

         return url;
       } else {

         return "#";
       }
    }
    else{
      return "#";
    }
    }
    else{
      return "#";
    }*/
  };

  Formatter.getDeliveryUrl=function(portalUrl, asn, sysAlias){
    var url;
   // var pattern="/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i";
   if(Utility.hasValue(portalUrl)){
    var urlParts = portalUrl.match(/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i);
    if(urlParts !== null && typeof urlParts !== 'undefined'){
      urlParts.splice(0,1);
      url=urlParts.join("");
      if(Utility.hasValue(asn) && Utility.hasValue(sysAlias)){
        url += "pcd!3a!2f!2fportal_content!2ftemplates!2fiviews!2fsap_transaction_iview?System="+sysAlias
          +"&TCode=VL03N&GuiType=WinGui&SAP_TransType=TXN&SAP_TechRoleName=CONTROL2007"
          +"&SAP_Market=XXSAP_DummySystem="+sysAlias+"&SAP_Source=EXT&SAP_IViewDesc=VL03N"
          +"&DynamicParameter=LIKP-VBELN%3d"+asn+"&AutoStart=true";
          return url;
        }
      else{
        return null;
      }
    }
    else{
      return null;
    }
    }
    else{
      return null;
    }
  };
  Formatter.getContainerUrl=function(portalUrl,asn,isSupportUser){
    if(Utility.hasValue(isSupportUser) && isSupportUser==='X'){
    this.setEnabled(true);
      var url="";
   // var pattern="/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i";
   if(Utility.hasValue(portalUrl)){
    var urlParts = portalUrl.match(/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i);
    if(urlParts !== null && typeof urlParts !== 'undefined'){
      urlParts.splice(0,1);
      url=urlParts.join("");
      if(Utility.hasValue(asn)){
        asn=asn.lpad('0',10);
        url += "pcd!3a!2f!2fportal_content!2ftemplates!2fiviews!2fsap_transaction_iview?System=STMG1"+
        "&TCode=/SAPTRX/EH_LIST&GuiType=WinGui&SAP_TransType=TXN&SAP_TechRoleName=CONTROL2007"+
        "&SAP_Market=XXSAP_DummySystem=STMG1&SAP_Source=EXT&SAP_IViewDesc=/SAPTRX/EH_LIST"+
        "&DynamicParameter=P_TRID-LOW%3d"+asn+"&DynamicParameter=P_TRTP-LOW%3dZZODT20_FU_ERP&AutoStart=true";
          return url;
        }
      else{
        return null;
      }
    }
    else{
      return null;
    }
    }
    else{
      return null;
    }
    }
    else{
      this.setEnabled(false);
      return null;
    }
  };
  Formatter.getPOUrl=function(portalUrl, po_sto, sysAliasSTO){
  if(Utility.hasValue(portalUrl)){
  if(Utility.hasValue(po_sto)){
    var url;
   // var pattern="/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i";
    var urlParts = portalUrl.match(/(http:\/\/|https:\/\/)(.*)(\/irj\/servlet\/prt\/portal\/prtroot\/)/i);
    if(urlParts !== null && typeof urlParts !== 'undefined'){
      urlParts.splice(0,1);
      url=urlParts.join("");
      if(Utility.hasValue(sysAliasSTO)){
        url += "pcd!3a!2f!2fportal_content!2ftemplates!2fiviews!2fsap_transaction_iview?System="+sysAliasSTO
          +"&TCode=/GLB/RGTPT01_ME23N&GuiType=WinGui&SAP_TransType=TXN&SAP_TechRoleName=CONTROL2007"
          +"&SAP_Market=XXSAP_DummySystem="+sysAliasSTO+"&SAP_Source=EXT&SAP_IViewDesc=/GLB/RGTPT01_ME23N"
          +"&DynamicParameter=P_EBELN%3d"+po_sto+"&AutoStart=true";
          return url;
        }
      else{
        return null;
      }
    }
    else{
      return null;
    }
    }
    else{
      return null;
    }
    }
    else{
      return null;
    }
  };
  Formatter.setBarColor=function(value) {
    if (value === 'red') {
      return sap.ui.core.BarColor.NEGATIVE;
    } else if (value === 'blue') {
      return sap.ui.core.BarColor.NEUTRAL;
    } else if (value === 'green') {
      return sap.ui.core.BarColor.POSITIVE;
    }
    return sap.ui.core.BarColor.NEUTRAL;
  };
  Formatter.dateConvert=function(date) {
    /*if(typeof date === 'undefined'){
      return '';
    }
    if(date.length>8){
      var dt=Number(date);
      if(dt>0){
      var dtStr=date.substring(1);
      date=dtStr.substring(0,8);
      }
      else{
        return '';
      }
    }*/
    var dt=Utility.getDateParts(date,true,true).date;
    return Utility.dateConvert(dt, "yyyyMMdd",false,true);
  };
  Formatter.setAppointmentTime=function(sE){
    var icon=this.getParent().getContent()[0];
    if(typeof sE === "undefined" || sE === null ){
      icon.addStyleClass("invisible");
    return "";
    }
    else{
      for(var i=0;i<sE.length;i++){
        if(sE[i].Event.toLowerCase() === "request appointment at dc" && ( sE[i].UTCReceiveTime !== "" || typeof (sE[i].UTCReceiveTime) !== "undefined" || sE[i].UTCReceiveTime !== null)){
//          pos=i;
          var time=Utility.getAMPM(sE[i].UTCReceiveTime);
          return time;
        }
      }
    }
  };
  Formatter.setDCLTableCat=function(items,origin){
    if(typeof items === "undefined"){
      return "";
    }
    var catArr=[];
    for(var i=0;i<items.length;i++){
      catArr.push(items[i].CategoryDesc);
    }
    if(catArr.length>1){
      catArr=Utility.getUniqueElements(catArr);
    }
    var categories=catArr.join();
    return categories+" from "+origin;
  };
  Formatter.dateTimeConvert=function(date,time){
    var d=Utility.dateConvert(date,"yyyyMMdd",false,true);
    var t=Utility.getAMPM(time);
    return d+" "+t;
  };
  Formatter.dateTimeConvert2=function(datetime){
    var dateParts=Utility.getDateParts(datetime,true);
      var d=Utility.dateConvert(dateParts.date,"yyyyMMdd");
      var t=Utility.getAMPM(dateParts.time);
      return d+" "+t;
  };
  Formatter.dateTimeConvertddMMyyyy=function(datetime){
    var dateParts=Utility.getDateParts(datetime,true);
      var d=Utility.dateConvert(dateParts.date,"ddMMyyy");
      var t=Utility.getAMPM(dateParts.time);
      return d+" "+t;
  };
  Formatter.getDateOnly=function(date){
    var dateParts=Utility.getDateParts(date,true);
    return Utility.dateConvert(dateParts.date,"yyyyMMdd");
  };
  Formatter.getLastETADateOnly=function(date){
    var dateParts=Utility.getDateParts(date,true);
    var dt="";
    var time="";
    if(Utility.hasValue(dateParts.date)){
    dt=sap.ui.core.format.DateFormat.getDateInstance({
          pattern: 'dd MMM, yyyy',
          style:'daysAgo'
        }).format(date);

     time=Utility.getAMPM(dateParts.time);
     }
    return Utility.oBundle.getText("ETAUpd")+" "+dt+", "+time;
    //return Utility.dateConvert(dateParts.date,"yyyyMMdd");
  };
  Formatter.getPallets=function(pallets){
    if(typeof pallets !== 'undefined'){
      return Number(pallets).toString();
    }
    else{
      return '';
    }
  };
  Formatter.getPalletsWithSuffix=function(pallets){
    if(typeof pallets !== 'undefined'){
      return (Number(pallets).toString() + " " + Utility.oBundle.getText("pallet"));
    }
    else{
      return '';
    }
  };
  Formatter.convertDate=function(date){
    var dt=Utility.formatDate(date,null,'yyyyMMdd');
    return Utility.dateConvert(date,'yyyyMMdd',false,true);
  };

  Formatter.tsToDate=function(ts){
    //var dt=Utility.timestampToDate(ts);
    var dt=new Date(ts);
    var fDt=Utility.formatDate(dt,null,'dd MMM, yyyy - HH:mm');
    return fDt;
  };
  Formatter.getOrderAndUnit=function(qty,unit){
    if(typeof unit === 'undefined'){
      unit="";
    }
    if(typeof qty !== 'undefined'){
      try{
        qty=Number(qty);

      }
      catch(err){
        qty="   ";
      }
      return qty.toString()+" "+unit;
    }
    else{
      return "    "+unit;
    }
  };
  Formatter.setPercentValue=function(p){
    if(typeof p === 'undefined'){
      return 0;
    }
    else{
      if(p === ""){
        return 0;
      }
      else{
        if(parseFloat(p)>100){
          p="100.00";
        }
        p=parseFloat(p).toFixed(2);
        return parseFloat(p);
      }
    }
  };
  Formatter.setPercentText=function(p){
    if(typeof p === 'undefined'){
      return "0%";
    }
    else{
        p=parseFloat(p).toFixed(2);
        return p+"%";
    }
  };
  Formatter.getWelcomeText=function(fN,lN){
    var welcome = Utility.oBundle.getText("welcome");
    if(fN ===null || typeof fN === 'undefined'){
        fN = "";
    }
    if(lN ===null || typeof lN === 'undefined'){
        fN = "";
    }
    return welcome + ", " + fN + " " + lN;
  };
  Formatter.formatDateBatchDtl=function(date) {
    if (date === null || typeof date === 'undefined') {
      return '';
    }
    var dateObj = null;
    if (date instanceof Date) {
      dateObj = date;
    } else {
      try {
        dateObj = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: 'yyyyMMdd'
        }).parse(date);
      } catch (err) {
        return '';
      }
    }
    try {
      return " " + sap.ui.core.format.DateFormat.getDateInstance({
        pattern: 'dd.MM.yyyy'
        // style:'daysAgo'
      }).format(dateObj);
    } catch (err) {
      return '';
    }
  };
  Formatter.setBatchDetails=function(asnItem,batchDetails,desc){
    var bd=[];
    var model=new sap.ui.model.json.JSONModel();
    if(typeof batchDetails !== 'undefined' && batchDetails !== null && batchDetails.length){
      for(var i=0;i<batchDetails.length;i++){
        if(asnItem===batchDetails[i].ASNItem){
          bd.push(batchDetails[i]);
        }
      }
    }
    model.setData({BatchDetails:bd});
    this.getTooltip().setModel(model,"batchDtl");
    return desc;
  };

  Formatter.getEventLocation=function(loc,locDesc){
    if(locDesc !== null && typeof locDesc !== 'undefined' && locDesc !== ""){
      return loc + " - " + locDesc;
    }
    else{
      return loc;
    }
  };
  Formatter.setDesc=function(name,desc){
    if(Utility.hasValue(desc)){
      return name + " - " + desc;
    }
    else{
      return name;
    }
  };
  Formatter.showIfExists=function(val){
    if(Utility.hasValue(val)){
      return true;
    }
    else{
      return false;
    }
  };

return Formatter;
});