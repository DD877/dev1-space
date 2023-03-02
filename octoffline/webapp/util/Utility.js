/**
 *
 *
 *
 */
/*$.sap.require('sap.ui.core.format.DateFormat');
$.sap.require("sap.m.MessageBox");
$.sap.declare("glb.gtmh.oct.util.Utility");
String.prototype.lpad = function(padString, length) {
           var str = this;
           while (str.length < length)
               str = padString + str;
           return str;
       };
glb.gtmh.oct.util.Utility = function() {};
$.extend(glb.gtmh.oct.util.Utility.prototype, {*/
sap.ui.define([
	'sap/m/MessageBox',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/Element'
], function(MessageBox,DateFormat, Element) {
	"use strict";


	var Utility = Element.extend("glb.gtmh.oct.util.Utility");
     Utility.mE = "mouseenter";
      Utility.mL = "mouseleave";
      Utility.oBundle = $.sap.resources({
        url: "./i18n/i18n.properties",
        locale: sap.ui.getCore().getConfiguration()
          .getLanguage()
      });
      Utility.oBundleEn = $.sap.resources({
        url: "./i18n/i18n.properties",
        locale: "en-US"
      });
      Utility.getError=function(body){
        var error = "";
        try {
          var xmlDoc = $.parseXML(body);
         var $xml = $(xmlDoc);
          var $errMsg = $xml.find("message");
          error = $errMsg.text();
        } catch (err) {
            try{
                error = JSON.parse(body).error.message.value;
            }
            catch(e){
                error=body;
            }
          
        }
        return error;
      };
      Utility.displayError= function(errMsg, title) {
        sap.m.MessageBox.alert(errMsg, {
          styleClass: "sapUiSizeCompact",
          icon: sap.m.MessageBox.Icon.ERROR,
          title: title
        });
      };

      Utility.getToday= function(pattern) {
        var today = sap.ui.core.format.DateFormat
          .getDateInstance({
            pattern: pattern
          }).format(new Date());
        return today;
      };

      Utility.formatDate= function(date, inputFormat, outputFormat) {
        if (!this.hasValue(date)) {
          return "";
        }
        var dateObj = null;
        if (date instanceof Date) {
          dateObj = date;
        } else {
          try {
            dateObj = sap.ui.core.format.DateFormat
              .getDateInstance({
                pattern: inputFormat
              }).parse(date);
          } catch (err) {
            return '';
          }
        }
        try {
          return sap.ui.core.format.DateFormat
            .getDateInstance({
              pattern: outputFormat
            }).format(dateObj);
        } catch (err) {
          return '';
        }
      };

      Utility.getWeek= function(dateStr, pattern) {
        var date = sap.ui.core.format.DateFormat
          .getDateInstance({
            pattern: pattern,
            UTC:true
          }).parse(dateStr);

        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of
        // weeks from date to week1.
        return 1 + Math
          .round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1
            .getDay() + 6) % 7) / 7);

      };
      Utility.getDateDiff= function(a, b, pattern) {
        if (this.hasValue(a) && Number(a) !== 0 && this.hasValue(b) &&
          Number(b) !== 0) {
          a = this.getDateString(a, pattern);
          b = this.getDateString(b, pattern);
          var mnDt = sap.ui.core.format.DateFormat
            .getDateInstance({
              pattern: pattern
            }).parse(a);
          var mxDt = sap.ui.core.format.DateFormat
            .getDateInstance({
              pattern: pattern
            }).parse(b);
          var diff = (mxDt - mnDt) / 86400000;
          return Math.floor(diff);
        } else {
          return this.oBundle.getText("na");
        }
      };

      Utility.getAlignmentColor= function(alignmentText) {
        if (alignmentText) {
          if (alignmentText === this.oBundle
            .getText("legOnTime")) {
            return "green";
          } else if (alignmentText === this.oBundle
            .getText("legUI")) {
            return "paleorange";
          } else if (alignmentText === this.oBundle
            .getText("legLate")) {
            return "red";
          } else if (alignmentText === this.oBundle
            .getText("legEarly")) {
            return "blue";
          } else if (alignmentText === this.oBundle
            .getText("legArrived")) {
            return "grey";
          } else {
            return '';
          }
        } else {
          return '';
        }
      };

      Utility.getAlignmentText= function(dateDiff) {
        if (dateDiff === 0) {
          return this.oBundle.getText("alignWithPOETA");
        } else if (dateDiff > 0 || dateDiff < 0) {
          return this.oBundle.getText("misalignWithPOETA");
        } else if (dateDiff === "") {
          return "";
        }

      };

      Utility.getAlignmentNumText= function(dateDiff) {
        if (dateDiff === 0) {
          return "0";
        } else if (dateDiff < 0) {
          return "" + Math.floor(dateDiff);
        } else if (dateDiff > 0) {
          return "+" + Math.floor(dateDiff);
        } else if (dateDiff === "") {
          return this.oBundle.getText("question");
        } else if (dateDiff === this.oBundle.getText("na")) {
          return "";
        }
      };
      Utility.getDaysAgoText= function(date, pattern) {
        var today = new Date();
        today = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: pattern
        }).format(today);
        var dateDiff = this.getDateDiff(date, today, pattern);
        return dateDiff + " " + this.oBundle.getText("daysAgo");
      };
      Utility.getAlignmentStatus= function(dateDiff) {
        if (dateDiff === 0) {
          return this.oBundle.getText("legOnTime");
        } else if (dateDiff > 0) {
          return this.oBundle.getText("legLate");
        } else if (dateDiff < 0) {
          return this.oBundle.getText("legEarly");
        } else if (dateDiff === "") {
          return this.oBundle.getText("legUI");
        }
      };

      Utility.getUniqueElements= function(arr) {
        var n = {},
          unique = [],
          i = 0;
        if (typeof arr[0] === "object") {
          for (i = 0; i < arr.length; i++) {
            if (!n[arr[i].value]) {
              n[arr[i].value] = true;
              unique.push(arr[i]);
            }
          }
        } else {
          for (i = 0; i < arr.length; i++) {
            if (!n[arr[i]]) {
              n[arr[i]] = true;
              unique.push(arr[i]);
            }
          }
        }

        return unique;
      };
      Utility.wrap= function(text, width) {
        text
          .each(function() {
            var txt = d3.select(this),
              words = txt
              .text().split(/\s+/).reverse(),
              word, line = [],
              lineNumber = -1,
              lineHeight = 1.2, // ems
              x = txt.attr("x"),
              y = txt.attr("y"),
              dy = -1, // parseFloat(text.attr("dy")),
              tspan = txt.text(null).append("tspan")
              .attr("x", x).attr("y", y).attr(
                "dy", dy + "em");
            while (word = words.pop()) {
              line.push(word);
              tspan.text(line.join(" "));
              if (tspan.text().length > (width / 5)) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = txt.append("tspan").attr(
                  "x", x).attr("y", y).attr(
                  "dy", ++lineNumber * lineHeight + 1 + dy + "em").text(word);
              }
            }
          });
      };
      Utility.dateConvert= function(date, pattern, isFullMonth,isUTC) {
        if (!this.hasValue(date) || Number(date) === 0) {
          return this.oBundle.getText("na");
        }
        if(isUTC!==true){
        	isUTC=false;
        }
        var dt = null,year=null,month=null,day=null;
        if (date instanceof Date) {
          dt = date;
        } else {
             if(typeof date ==='string' && date.indexOf("/Date(")!==-1){
                date=new Date(Number(date.substring(date.indexOf("(")+1,date.indexOf(")/"))));
            }
            else{
                  try {
                    dt = sap.ui.core.format.DateFormat.getDateInstance({
                      pattern: pattern,
                      UTC:isUTC
                    }).parse(date);
                  } catch (err) {
                    $.sap.log.errror(this.oBundle
                      .getText("errDateFormat"));
                  }
            }
        }
        
        var month_list = ["Jan", "Feb", "Mar", "Apr", "May",
          "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        var month_listFull = ["January", "February", "March", "April", "May",
          "June", "July", "August", "September", "October", "November", "December"
        ];
        if(isUTC){
            year = dt.getUTCFullYear();
            month = dt.getUTCMonth();
            day = dt.getUTCDate();
        }
        else{
            year = dt.getFullYear();
            month = dt.getMonth();
            day = dt.getDate();
        }
        
        if (isFullMonth === true) {
          month = month_listFull[parseInt(month)];
        } else {
          month = month_list[parseInt(month)];
        }

        
        var result = day + " " + month + ", " + year;

        return result;
      };

      Utility.ISO6346Check= function(cNum) {
        var num = 0;
        var charCode = "0123456789A?BCDEFGHIJK?LMNOPQRSTU?VWXYZ";
        if (!cNum || cNum.length !== 11) {
          return false;
        }
        cNum = cNum.toUpperCase();
        for (var i = 0; i < 10; i++) {
          var chr = cNum.substring(i, i + 1);
          var idx = chr == '?' ? -1 : charCode.indexOf(chr);
          if (idx < 0) {
            return false;
          }
          idx = idx * Math.pow(2, i);
          num += idx;
        }
        num = (num % 11) % 10;
        return parseInt(cNum.substring(10, 11)) === num;
      };
      Utility.getAMPM= function(time) {
        if (this.hasValue(time)) {
          var timeArr = time.split(":");
          if (timeArr.length === 2) {
            var t = "";
            var h = Number(timeArr[0]);
            var m = Number(timeArr[1]);
            if(m<10){
              m="0"+m;
            }
            if (h > 11) {
              h = h - 12;
              t = h + ":" + m + "PM";
              return t;
            } else {
              t = h + ":" + m + "AM";
              return t;
            }
          } else {
            return "";
          }
        } else {
          return "";
        }
      };
      Utility.removeLeadingZeroes= function(val) {
        return val.replace(/\b0+/g, "");
      };
      Utility.getDateParts= function(date, isFullDate,isUTC) {
         if(!isUTC){
             isUTC=false;
         }
         else{
             isUTC=true;
         }
         var h = null,m=null,s=null,time=null,dt=null;
        if (typeof date === 'undefined') {
          return {
            date: '',
            time: '',
            h: '',
            m: '',
            s: ''
          };
        } else if (date instanceof Date) {
            if(isUTC){
                h = date.getUTCHours();
                m = date.getUTCMinutes();
                s = date.getUTCSeconds();
            }
            else{
                h = date.getHours();
                m = date.getMinutes();
                s = date.getSeconds();
            }
            time = h + ":" + m;
            dt = this.getDateString(date,"yyyyMMdd",isUTC);
            return {
              date: dt,
              time: time,
              h: h,
              m: m,
              s: s
            };
          } else {
              try{
                date=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-ddTHH:mm:ss.sssZ",UTC:isUTC}).parse(date);
                if(isUTC){
                h = date.getUTCHours();
                m = date.getUTCMinutes();
                s = date.getUTCSeconds();
            }
            else{
                h = date.getHours();
                m = date.getMinutes();
                s = date.getSeconds();
            }
                time = h + ":" + m;
                dt = this.getDateString(date,"yyyyMMdd",isUTC);
                return {
                  date: dt,
                  time: time,
                  h: h,
                  m: m,
                  s: s
                };
              }
              catch(e){
                   return {
                          date: '',
                          time: '',
                          h: '',
                          m: '',
                          s: ''
                        };
              }
           
          }
        

      };
      Utility.getDateString= function(date, pattern,isUTC) {
        if (!(date instanceof Date)) {
            if(typeof date ==='string' && date.indexOf("/Date(")!==-1){
                date=new Date(Number(date.substring(date.indexOf("(")+1,date.indexOf(")/"))));
            }
            else{
                try{
                  date = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: pattern
                  }).parse(date);
                }
                catch(err){
                    return 0;
                }
            }
        }
        var year=0,month=0,day=0;
        if(!isUTC){
            isUTC=false;
        }
        else{
            isUTC=true;
        }
        if(isUTC){
            year = date.getUTCFullYear().toString();
            month = date.getUTCMonth() + 1;
            day = date.getUTCDate().toString();
        }
        else{
            year = date.getFullYear().toString();
            month = date.getMonth() + 1;
            day = date.getDate().toString();
        }
        
        if (day < 10) {
          day = "0" + day;
        } else {
          day = day.toString();
        }
        if (month < 10) {
          month = "0" + month;
        } else {
          month = month.toString();
        }
        if (pattern === "yyyyMMdd") {
          return year + month + day;
        } else if (pattern === "ddMMyyyy") {
          return day + month + year;
        } else if (pattern === "MMddyyyy") {
          return month + day + year;
        } else {
          return year + month + day;
        }
      };
      Utility.timestampToDate= function(xmlDate) {
        var dt = new Date();
        var dtS = xmlDate.slice(xmlDate.indexOf('T') + 1, xmlDate.indexOf('.'))
        var TimeArray = dtS.split(":");
        dt.setUTCHours(TimeArray[0], TimeArray[1], TimeArray[2]);
        dtS = xmlDate.slice(0, xmlDate.indexOf('T'))
        TimeArray = dtS.split("-");
        dt.setUTCFullYear(TimeArray[0], Number(TimeArray[1])-1, TimeArray[2]);
        return dt;
      };
      Utility.dateToTimestamp= function() {
        var dt = new Date();
        var dtUTC = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: 'yyyy-MM-ddTHH:mm:ss'
        }).format(dt, true);
        return dtUTC;
      };
      Utility.convertToDate= function(date, inputFormat) {
        if (!this.hasValue(date)) {
          return "";
        }
        var dateObj = null;
        if (date instanceof Date) {
          dateObj = date;
        } else {
          try {
            dateObj = sap.ui.core.format.DateFormat
              .getDateInstance({
                pattern: inputFormat,
                UTC:true
              }).parse(date);
          } catch (err) {
            return '';
          }
        }
        return dateObj;
      };
      Utility.hasValue = function(val){
          if(val === null || typeof val === 'undefined' || val === ''){
            return false;
          }
          else{
            return true;
          }
      };
      Utility.adjustXmlDatesToJSDates = function(data,fields){
      	for(var i=0;i<fields.length;i++){
      		for(var j=0;j<data.length;j++){
      			if(this.hasValue(data[j][fields[i]])){
      				data[j][fields[i]]=this.timestampToDate(data[j][fields[i]]);
      			}
      		}
      	}
      	return data;
      };
      	return Utility;
});
//     });

// var Utility = new glb.gtmh.oct.util.Utility();