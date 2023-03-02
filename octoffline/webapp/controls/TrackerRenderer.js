/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*!
 *@Author: Bikash R
 */
jQuery.sap.require("sap/ui/thirdparty/d3");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("glb.gtmh.oct.util.Utility");
jQuery.sap.declare("glb.gtmh.oct.controls.TrackerRenderer");


  /**
   * TrackerRenderer renderer.
   * @namespace
   */
  glb.gtmh.oct.controls.TrackerRenderer = {

  /**
   * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
   *
   * @param {sap.ui.core.RenderManager}
   *            oRm the RenderManager that can be used for writing to the render
   *            output buffer
   * @param {sap.ui.core.Control}
   *            oOI an object representation of the control that should be
   *            rendered
   */
  render : function(oRm, oT) {
   // var layout = oT.createTracker();
    oRm.write("<div style=\"height:"+oT.getHeight()+";width:"+oT.getWidth()+"\" ");
    oRm.writeControlData(oT); // writes the Control ID and enables event handling - important!
    oRm.writeClasses(); // there is no class to write, but this enables
    // support for ColorBoxContainer.addStyleClass(...)

    oRm.write(">");
//    oRm.renderControl(layout);

    //this.renderLane(oT);
    oRm.write("</div>");
  },

  renderTracker : function (oT) {
    var id = oT.getIdForLabel();
    if (d3.select("#"+id+"-eventTracker")) {
          d3.select("#"+id+"-eventTracker").remove();
        }
      var tot = 0;
      var pnlId = id;
      var tId = id+"-eventTracker";
      var oModel = oT.getModel();
      var $container = $("#" + id);
      var width = $container.width();
      var cH = $container.height();
      if(typeof oModel !== 'undefined' && oModel !== null){
      var contData=oModel.getProperty(oT.getHeaderDataBindingPath());
      var data = oModel.getProperty(oT.getEventsBindingPath());
      var tED = oModel.getProperty(oT.getEventDetailsBindingPath());
      var tPD = oModel.getProperty(oT.getEventsLineStyleBindingPath());
      var lw=Number(oT.getEventLineWidth());
      var R=Number(oT.getMainEventCircleRadius());
      var r=Number(oT.getSubEventCircleRadius());
      if(data !== null && typeof data !== 'undefined'
        && tED !== null && typeof tED !== 'undefined'
          && tPD !== null && typeof tPD !== 'undefined'){


//      var tED = this.getTrackerEventDetails(data);
//      var tPD = this.getTrackerPathStyle(data);
      for (var i = 0; i < tED.length; i++) {
        if ((i === tPD.startDashME - 1 && tPD.startDashSE === 0)
            || (i === tPD.startDashME && tPD.startDashSE > 0)) { // (j>tPD.startDashME
          // &&
          // tPD.startDashSE>0)
          // ||
          // (j>tPD.startDashME-1
          // &&
          // tPD.startDashSE==0)
          tED[i].isExpanded = true;
        } else {
          tED[i].isExpanded = false;
        }
      }
      // var mR=20;
      // var sR=15;
      // var lw=100;
      // var R=20;
      // var r=15;
      // var data=data1.ProductCollection[0].Events;
     // var data = evt;
      var pos1 = [];
      for (i = 0; i < data.length; i++) {

        if (i === 0) {
          pos1.push(0);
        } else {
          var sp = null;
          var l = null;
          if (typeof (data[i - 1].subEvents) !== "undefined") {
            l = data[i - 1].subEvents.length;
          } else {
            l = 0;
          }
          if (tED[i - 1].isExpanded === true) {
            sp = pos1[i - 1] + ((l + 1) * lw) + 2 * R
                + 2 * l * r;
            pos1.push(sp);
          } else {
            sp = pos1[i - 1] + lw + 2 * R;
            pos1.push(sp);
          }
        }
      }

      cW = Number(pos1[pos1.length - 1]) + (2 * R) + lw;
      var top1 = cH / 2 - 70;
      var top2 = cH / 2 - 50;
      var middle = cH / 2;
      var bot1 = cH / 2 + 50;
      var bot2 = cH / 2 + 70;
      var canvas = d3.select("#" + id).append("svg").attr(
          "id", tId).attr("width",
          cW+40).attr("height", cH);

      var group = canvas.append("g").attr("transform",
          "translate(" + (0 - (lw - R)+40) + ",1)");

      var div = d3.select("body").append("div").attr("class",
          "tooltip").attr("id", "PATrackerTT").style(
          "opacity", 0);

      var mainGroups = [];
      var subGroups = [];
      for (var j = 0; j < data.length; j++) {
        var aDateParts=glb.gtmh.oct.util.Utility.getDateParts(data[j].UTCReceiveDate,true);
        var pDateParts=glb.gtmh.oct.util.Utility.getDateParts(data[j].EventDate,true);
        var g = group.append("g").attr("id",
            id + "-mG" + (j)).attr(
            "transform",
            "translate(" + Number(pos1[j]) + ",1)");

        // Change for Leg Expansion
        if (j === tPD.startDashME - 1) {
          mainGroups.push({
            isExpanded : true,
            group : g
          });
        } else {
          mainGroups.push({
            isExpanded : false,
            group : g
          });
        }

        if (j > 0) {
          var line = g.append("line") // .filter(function(){return
          // j>0;})
          .attr("x1", 0).attr("y1", middle).attr("x2",
              function() {
                // if(j==0){
                // return 0;
                // }
                // else{
                return Number(lw);
                // }
              })

          .attr("y2", middle).attr("stroke", "lightgrey")
          // .attr("stroke-linecap","round")
          .attr("stroke-width", 8).style("opacity", 1);
          if ((j > tPD.startDashME && tPD.startDashSE > 0)
              || (j > tPD.startDashME - 1 && tPD.startDashSE === 0)) {
            line.attr("x1", 3);
            line.attr("class", "dashLine");
          }
           else{
          //Added for days label
          var currD=glb.gtmh.oct.util.Utility.getDateParts(data[j].UTCReceiveDate,true).date;
          var prevD=glb.gtmh.oct.util.Utility.getDateParts(data[j-1].UTCReceiveDate,true).date;
          var dateDiff='';
          var daysTxt="";
          if(currD === ''){
            dateDiff = glb.gtmh.oct.util.Utility.getDateDiff(prevD,glb.gtmh.oct.util.Utility.getToday("yyyyMMdd"),"yyyyMMdd");
          }
          else{
            dateDiff = glb.gtmh.oct.util.Utility.getDateDiff(prevD,currD,"yyyyMMdd");
          }
          dateDiff=Math.floor(dateDiff);
          //For Transit Leg Calculation
            var sValue = $.sap.getUriParameters().get("container");
			if (glb.gtmh.oct.util.Utility.hasValue(sValue)) {
				if (sValue.toLowerCase() === "all") {
				    if(j<4){
				        var tl=data[j].TransitLeg;
				        if(tl>0 && tl<4){
				            dateDiff=contData["TransitTime"+tl];
				        }
				    }
				}
			}
          //End for Transit Leg
          if(dateDiff===1){
            daysTxt = dateDiff + glb.gtmh.oct.util.Utility.oBundle.getText(" day");
          }
          else if(dateDiff>1){
            daysTxt = dateDiff + glb.gtmh.oct.util.Utility.oBundle.getText(" days");
          }
          g.append("text")
          .attr("x", lw/2)
              .attr("y", (middle) - R/3)
              .attr("id", id+"-eventTracker"+"-txtDays" + j)
              .attr("class",
                  "evtTxt")
              .style("text-anchor", "middle")
              .attr("fill", "#333333")
              .attr("font-weight", "bold")
              .text(daysTxt)
              .attr('opacity',function(){
                    if(mainGroups[j-1].isExpanded===false){
                      return 1;
                    }
                    else{
                      return 0;
                      }
                    });
          //End
          }
        }
        var self = this;

        var cir = g
            .append("circle")
            .attr("cx", Number(lw) + R)
            .attr("cy", middle)
            .attr("id", id + "-MECircle" + j)
            .attr("r", R)
            .attr("class", "pointer " + tED[j].style)
            // .attr("fill",tED[j].style)
            .on(
                "click",
                function() { // needed for d3
                  // click
                  // functionality
                  self.toggleLeg(oT, this,mainGroups, canvas, cH);
                })
            .on(
                "mouseover",
                function(d) {
                 oT.fireOnEventCircleHover({data:data[this.getAttribute("id").substring(this.getAttribute("id").length - 1)],allEvents:data});
                  div.transition().duration(100)
                      .style("opacity", 1);
                  div
                      .html(
                          self.createTooltip(oT)
//                          self
//                          .createTooltip(data[this
//                              .getAttribute(
//                                  "id")
//                              .substring(
//                                  this
//                                      .getAttribute("id").length - 1)])
                                      );
                  div
                      .style(
                          "left",
                          (d3.event.pageX)
                              + "px")
                      .style(
                          "top",
                          (d3.event.pageY - 170)
                              + "px")
                      .style("background",
                          "rgb(235,235,235)"
                      // function() {
                      // if (d.color ===
                      // "#28bc6e") {
                      // return "#cce8d8";
                      // } else {
                      // return d.color;
                      // }
                      // }
                      );

                }).on(
                "mouseout",
                function() {
                  div.transition().duration(100)
                      .style("opacity", 0);
                });
        var dt = data[j].UTCReceiveDate;
        if (j === (data.length - 1)
            && (dt !== null
                || typeof dt !== "undefined" || dt !== "")) {

          g
              .append("text")
              .attr("x", cir.attr("cx"))
              .attr("y", (middle) + R / 4)
              .attr("id", "txtGR" + j)
              .attr("class",
                  "evtTxt pointer checkmark")
              .style("text-anchor", "middle")
              .attr("fill", "white")
              .attr("font-weight", "normal")
              .text(function(d) {
                return tED[j].text;
                // return "A&#10004;";
              })
              .on(
                  "mouseover",
                  function(d) {
                    oT.fireOnEventCircleHover({data:data[this.getAttribute("id").substring(this.getAttribute("id").length - 1)],allEvents:data});
                    div.transition().duration(
                        100).style(
                        "opacity", 1);
                    div
                        .html(
                            self.createTooltip(oT)
//                            self
//                            .createTooltip(data[this
//                                .getAttribute(
//                                    "id")
//                                .substring(
//                                    this
//                                        .getAttribute("id").length - 1)])
                                        );
                    div
                        .style(
                            "left",
                            (d3.event.pageX)
                                + "px")
                        .style(
                            "top",
                            (d3.event.pageY - 170)
                                + "px")
                        .style(
                            "background",
                            "rgb(235,235,235)"
                        // function() {
                        // if (d.color ===
                        // "#28bc6e") {
                        // return "#cce8d8";
                        // } else {
                        // return d.color;
                        // }
                        // }
                        );

                  }).on(
                  "mouseout",
                  function(d) {
                    div.transition().duration(
                        100).style(
                        "opacity", 0);
                  });
          document.getElementById("txtGR" + j).innerHTML = tED[j].text;
        } else {

          g
              .append("text")
              .attr("x", cir.attr("cx"))
              .attr("y", (middle) + R / 4)
              .attr("id", "txtGR" + j)
              .attr("class", "evtTxt pointer")
              .style("text-anchor", "middle")
              .attr("fill", "white")
              .attr("font-weight", "normal")
              .text(function() {
                return tED[j].text;
              })
              .on(
                  "click",
                  function() {
                    self.toggleLeg(oT, this,mainGroups, canvas, cH);
//                    self.toggleLeg(this, data,
//                        mainGroups, lw, r,
//                        R, canvas, top1,
//                        top2, middle, bot1,
//                        bot2, tPD, tED);
                  })
              .on(
                  "mouseover",
                  function(d) {
                  oT.fireOnEventCircleHover({data:data[this
                                                                        .getAttribute(
                                                                        "id")
                                                                    .substring(
                                                                        this
                                                                            .getAttribute("id").length - 1)]});
                    div.transition().duration(
                        100).style(
                        "opacity", 1);
                    div
                        .html(
                            self.createTooltip(oT)
//                            self
//                            .createTooltip(data[this
//                                .getAttribute(
//                                    "id")
//                                .substring(
//                                    this
//                                        .getAttribute("id").length - 1)])
                                        );
                    div
                        .style(
                            "left",
                            (d3.event.pageX)
                                + "px")
                        .style(
                            "top",
                            (d3.event.pageY - 170)
                                + "px")
                        .style(
                            "background",
                            "rgb(235,235,235)"
                        // function() {
                        // if (d.color ===
                        // "#28bc6e") {
                        // return "#cce8d8";
                        // } else {
                        // return d.color;
                        // }
                        // }
                        );

                  }).on(
                  "mouseout",
                  function(d) {
                    div.transition().duration(
                        100).style(
                        "opacity", 0);
                  });
          document.getElementById("txtGR" + j).innerHTML = tED[j].text;
        }

        // Main Event
        g.append("text").attr("x", function() {
          return Number(lw) + R;
        }).attr("y", function(d) {
          return top2;
        }).attr("fill", "black").style("stroke-width", 1)
            .style({
              "font-size" : "12px",
              "z-index" : "9"
            }).style("text-anchor", "middle").text(
                function(d) {
                  return data[j].EventDesc.replace(/_/g,' ');
                }).call(glb.gtmh.oct.util.Utility.wrap, (lw - r));
        // if(j===(tPD.startDashME) ||
        // (j===(tPD.startDashME-1) &&
        // (0===tPD.startDashSE))){
        // if(j===(tPD.startDashME-1)){
        //Not needed as per new UI Specs
       /* if ((j === tPD.startDashME && tPD.startDashSE > 0)
            || (j === tPD.startDashME - 1 && tPD.startDashSE === 0)) {
          g.append("text").attr("x", function() {
            return Number(lw) + R;
          }).attr("y", function() {
            return top1;
          }).attr("fill", "black").style("stroke-width",
              1).style({
            "font-size" : "12px",
            "z-index" : "9",
            "font-weight" : "bold"
          }).style("text-anchor", "middle").text(
              function() {
                return self.oBundle
                    .getText("lastEvtRecv");
              }).call(Utility.wrap, (lw - r));

          g.append("text").attr("x", function() {
            return Number(lw) + R;
          }).attr("y", function(d) {
            return bot2;
          }).attr("fill", "black").style("stroke-width",
              1).style({
            "font-size" : "12px",
            "z-index" : "9",
            "font-weight" : "bold"
          }).style("text-anchor", "middle").text(
              function(d) {
                var text = Utility.getDaysAgoText(
                    aDateParts.date,
                    "ddMMyyyy");
                return text;
              }).call(Utility.wrap, (lw - r));
        }*/

        // Main Event Details
        g.append("text").attr("x", function() {
          return Number(lw) + R;
        }).attr("y", function(d) {
          return bot1;
        }).attr("fill", "black").style("stroke-width", 1)
            .style({
              "font-size" : "12px",
              "z-index" : "9"
            }).style("text-anchor", "middle").text(
                function(d) {
                  return glb.gtmh.oct.util.Utility.dateConvert(
                     aDateParts.date, "yyyyMMdd");
                }).call(glb.gtmh.oct.util.Utility.wrap, (lw - r));

        if (tED[j].isExpanded === true) {
          if (j < data.length - 1) {
            if (typeof (data[j].subEvents) !== "undefined" && data[j].subEvents.length>0) {
              var sg = g
                  .append("g")
                  .attr(
                      "transform",
                      "translate("
                          + (Number(lw) + (2 * R))
                          + ",1)");
              // SubPath
              sg
                  .selectAll(".subPath line")
                  .data(data[j].subEvents)
                  .enter()
                  .append("line")
                  // .filter(function(d,i){return
                  // (i===j && j>0);})
                  .attr(
                      "class",
                      function(d, i) {
                        if (j >= tPD.startDashME
                            && i >= tPD.startDashSE) {
                          return "subPath dashLine";
                        } else {
                          return "subPath";
                        }
                      })
                  // .attr("stroke-linecap","round")
                  .attr(
                      "x1",
                      function(d, i) {
                        if (i > 0) {
                          return (i)
                              * (lw + 2 * r);
                        } else {
                          // return
                          // Number(lw)+2*R;
                          return 0;
                        }
                        // if(j>0){
                        // return
                        // (i+1)*Number(lw)+Number(sR)*(i+1);
                        // }
                        // else{
                        // return
                        // (i+1)*Number(lw)+Number(sR)*(i+1)+Number(lw);
                        // }
                      })
                  .attr("y1", middle)
                  .attr(
                      "x2",
                      function(d, i) {
                        return Number(this
                            .getAttribute("x1"))
                            + Number(lw);
                      }).attr("y2", middle)
                  .attr("stroke", "lightgrey")
                  .attr("stroke-width", 8);

              sg
                  .selectAll(".subEvent circle")
                  .data(data[j].subEvents)
                  .enter()
                  .append("circle")
                  .attr("class", "subEvent")
                  .attr(
                      "cx",
                      function(d, i) {

                        return (i + 1)
                            * Number(lw)
                            + Number(2 * r)
                            * i + r;
                      }).attr("cy", middle)
                  .attr("r", r).attr("class",
                      "greyEvent");
              // .attr("fill","red");

              // FOR SUB EVENTS TEXT
              sg
                  .selectAll(".subEvent text")
                  .data(data[j].subEvents)
                  .enter()
                  .append("text")
                  .attr("class", "subEvent")
                  .attr(
                      "x",
                      function(d, i) {
                        return (i + 1)
                            * Number(lw)
                            + Number(2 * r)
                            * i + r;
                      }).attr("y",
                      function() {
                        return top2;
                      })
                  .attr("fill", "black").style(
                      "stroke-width", 1)
                  .style({
                    "font-size" : "10px",
                    "z-index" : "9"
                  }).style("text-anchor",
                      "middle").text(
                      function(d) {
                        return d.EventDesc.replace(/_/g,' ');
                      }).call(glb.gtmh.oct.util.Utility.wrap,
                      (lw - r));

              // Sub Event Details
              sg
                  .selectAll(".subEventD text")
                  .data(data[j].subEvents)
                  .enter()
                  .append("text")
                  .attr("class", "subEventD")
                  .attr(
                      "x",
                      function(d, i) {
                        return (i + 1)
                            * Number(lw)
                            + Number(2 * r)
                            * i + r;
                      })
                  .attr("y", function(d) {
                    return bot1;
                  })
                  .attr("fill", "black")
                  .style("stroke-width", 1)
                  .style({
                    "font-size" : "10px",
                    "z-index" : "9"
                  })
                  .style("text-anchor", "middle")
                  .text(
                      function(d) {
                        return glb.gtmh.oct.util.Utility
                            .dateConvert(
                                glb.gtmh.oct.util.Utility.getDateParts(d.UTCReceiveDate,true).date,"yyyyMMdd");
                      }).call(glb.gtmh.oct.util.Utility.wrap,
                      (lw - r)).attr(
                      "opacity", "0")
                  .transition().duration(500)
                  .delay(function(d, i) {
                    return (i + 1) * 400;
                  }).attr("opacity", 1);
              // END FOR SUB EVENTS TEXT

              subGroups.push(sg);
            }
          }
        }
        // else{
        //
        // }

        // mainGroups.push({
        // isExpanded:true,
        // group:g
        // });
      }
      // for(var i=0;i<data.length;i++){
      // if(mainGroups[i].isExpanded===false){
      // d3.select("#"+view.getId()+"-MECircle"+i).trigger("click")();
      // }
      // }
      }
      }
  },

  toggleLeg:function(oT, that, mainGroups, canvas, cH){
    var oModel=oT.getModel();
    var top1 = cH / 2 - 70;
    var top2 = cH / 2 - 50;
    var middle = cH / 2;
    var bot1 = cH / 2 + 50;
    var bot2 = cH / 2 + 70;
    var lw=Number(oT.getEventLineWidth());
    var r=Number(oT.getSubEventCircleRadius());
    var data=oModel.getProperty(oT.getEventsBindingPath());
    var tED = oModel.getProperty(oT.getEventDetailsBindingPath());
      var tPD = oModel.getProperty(oT.getEventsLineStyleBindingPath());
    var R=Number(oT.getMainEventCircleRadius());
      var self = this;
      var id = that.parentNode.getAttribute("id");
      var num = Number(id.substring(id.length - 1));
      // var isExpanded=mainGroups[num].isExpanded;
      var isExpanded = tED[num].isExpanded;
      var len = null;
      if (typeof (data[num].subEvents) !== "undefined") {
        len = data[num].subEvents.length;
      }
      if (isExpanded) {
        // var
        // grp=d3.select("#"+id).select("g").transition()
        // .attr("visibility","hidden")
        // .duration(2000);
        d3.select("#"+oT.getId()+'-eventTracker-txtDays'+(num+1))
     	 .attr('opacity',1);
        // Group
        d3.select("#" + id).select("g").attr("opacity", 1)
            .transition().attr("opacity", 0).duration(
                1000).each(
                "end",
                function() {
                  d3.select("#" + id).select("g")
                      .remove();
                });

        for (var k = num + 1; k < data.length; k++) {

          mainGroups[k].group
              .transition()
              .attr(
                  "transform",
                  function() {
                    var xforms = mainGroups[k].group[0][0]
                        .getAttribute("transform");
                    var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
                        .exec(xforms);
                    var firstX = parts[1];
                    return "translate("
                        + (Number(firstX) - ((len * lw) + (len * 2 * r)))
                        + ",1)";
                  }).duration(1000).each("end",
                  function() {
                  });

          canvas
              .transition()
              // .delay(2000)
              .attr(
                  "width",
                  function() {
                    var xforms = mainGroups[data.length - 1].group[0][0]
                        .getAttribute("transform");
                    var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
                        .exec(xforms);
                    var firstX = parts[1];
                    return Number(firstX)
                        + (2 * R) + lw;
                  });

        }
        // mainGroups[num].isExpanded=false;
        tED[num].isExpanded = false;
      } else {
      d3.select("#"+oT.getId()+'-eventTracker-txtDays'+(num+1))
     	 .attr('opacity',function(){
         if (typeof (data[num].subEvents) !== "undefined" && data[num].subEvents.length>0) {
           return 0;
         }
         else{
          return 1;
         }
     	 });
        for (var k = num + 1; k < data.length; k++) {
          // var l=data[k-1].subEvents.length;
          mainGroups[k].group
              .transition()
              .attr(
                  "transform",
                  function() {
                    var xforms = mainGroups[k].group[0][0]
                        .getAttribute("transform");
                    var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
                        .exec(xforms);
                    var firstX = parts[1];
                    return "translate("
                        + (Number(firstX) + ((len * lw) + (len * 2 * r)))
                        + ",1)";
                  }).duration(1000);
          canvas
              .transition()
              .attr(
                  "width",
                  function() {
                    var xforms = mainGroups[data.length - 1].group[0][0]
                        .getAttribute("transform");
                    var parts = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/
                        .exec(xforms);
                    var firstX = parts[1];
                    return Number(firstX)
                        + (2 * (2 * R) + lw)
                        + ((len * lw) + (len * 2 * r));
                  });

        }

        // FOR ANIMATION
        if (typeof (data[num].subEvents) !== "undefined"  && data[num].subEvents.length>0) {
          var sg = d3.select("#" + id).append("g").attr(
              "transform",
              "translate(" + (Number(lw) + (2 * R))
                  + ",1)");
          sg
              .selectAll(".subPath line")
              .data(data[num].subEvents)
              .enter()
              .append("line")
              // .filter(function(d,i){return (i===j
              // && j>0);})
              .attr(
                  "class",
                  function(d, i) {
                    if (num >= tPD.startDashME
                        && i >= tPD.startDashSE) {
                      return "subPath dashLine";
                    } else {
                      return "subPath";
                    }
                  })
              // .attr("class","subPath")
              .attr("x1", function(d, i) {
                if (i > 0) {
                  return (i) * (lw + 2 * r);
                } else {
                  // return Number(lw)+2*R;
                  return 0;
                }
              })
              .attr("y1", middle)
              .attr(
                  "x2",
                  function() {
                    return Number(this
                        .getAttribute("x1"));
                  })
              .attr("y2", middle)
              .attr("stroke", "lightgrey")
              .attr("stroke-width", 8)
              .transition()
              .duration(500)
              .delay(function(d, i) {
                return i * 500;
              })
              .attr(
                  "x2",
                  function() {
                    return Number(this
                        .getAttribute("x1"))
                        + Number(lw);
                  });

          sg.selectAll(".subEvent circle").data(
              data[num].subEvents).enter().append(
              "circle").attr("class", "subEvent")
              .attr(
                  "cx",
                  function(d, i) {

                    return (i + 1) * Number(lw)
                        + Number(2 * r) * i
                        + r;
                  }).attr("cy", middle).attr("r",
                  r).attr("class", "greyEvent")
              // .attr("fill","red")
              .attr("opacity", "0").transition()
              .duration(500).delay(function(d, i) {
                return (i + 1) * 400;
              }).attr("opacity", 1);

          // END FOR ANIMATION
          // FOR SUB EVENTS TEXT
          sg.selectAll(".subEvent text").data(
              data[num].subEvents).enter().append(
              "text").attr("class", "subEvent").attr(
              "x",
              function(d, i) {
                return (i + 1) * Number(lw)
                    + Number(2 * r) * i + r;
              }).attr("y", function(d) {
            return top2;
          }).attr("fill", "black").style("stroke-width",
              1).style({
            "font-size" : "10px",
            "z-index" : "9"
          }).style("text-anchor", "middle").text(
              function(d) {
                return d.EventDesc.replace(/_/g,' ');
              }).call(glb.gtmh.oct.util.Utility.wrap, (lw - r))
              .attr("opacity", "0").transition()
              .duration(500).delay(function(d, i) {
                return (i + 1) * 400;
              }).attr("opacity", 1);

          // Sub Event Details
          sg
              .selectAll(".subEventD text")
              .data(data[num].subEvents)
              .enter()
              .append("text")
              .attr("class", "subEventD")
              .attr(
                  "x",
                  function(d, i) {
                    return (i + 1) * Number(lw)
                        + Number(2 * r) * i
                        + r;
                  })
              .attr("y", function(d) {
                return bot1;
              })
              .attr("fill", "black")
              .style("stroke-width", 1)
              .style({
                "font-size" : "10px",
                "z-index" : "9"
              })
              .style("text-anchor", "middle")
              .text(
                  function(d) {
                    return glb.gtmh.oct.util.Utility.dateConvert(
                        glb.gtmh.oct.util.Utility.getDateParts(d.UTCReceiveDate,true).date, "yyyyMMdd");
                  }).call(glb.gtmh.oct.util.Utility.wrap,
                  (lw - r)).attr("opacity",
                  "0").transition().duration(500)
              .delay(function(d, i) {
                return (i + 1) * 400;
              }).attr("opacity", 1);
          // END FOR SUB EVENTS TEXT
        }
        tED[num].isExpanded = true;
      }


  },
  createTooltip:function(oT){
  var evt=oT.getModel().getProperty("/lastHoverData");
  if(evt !== null && typeof evt !== 'undefined'){
//      var rndLblClass = null;
//      var rcvDate=Utility.getDateParts(evt.UTCReceiveDate,true);
//      var date = ""
//          + Utility.dateConvert(rcvDate.date,
//              "ddMMyyyy");
//
//      if (date === "") {
//        date = this.oBundle.getText("na");
//      }
//      var pDateParts=Utility.getDateParts(evt.EventDate,true);
//      var aDateParts=Utility.getDateParts(evt.UTCReceiveDate,true);
//      var dateDiff = Utility.getDateDiff(pDateParts.date,
//          aDateParts.date, "yyyyMMdd");
//      var alignmentStatus = Utility
//          .getAlignmentStatus(dateDiff);
//      var alignmentColor = Utility
//          .getAlignmentColor(alignmentStatus);
//
//      if (alignmentColor === "red") {
//        rndLblClass = "roundLblRed";
//      } else if (alignmentColor === "green") {
//        rndLblClass = "roundLblGreen";
//      } else if (alignmentColor === "blue") {
//        rndLblClass = "roundLblBlue";
//      }
//
//      var alignmentNum = Utility
//          .getAlignmentNumText(dateDiff);
          var location="";
          if(evt.LocDesc !== null && typeof evt.LocDesc !== 'undefined' && evt.LocDesc!== ""){
            location =evt.Location + " - " + evt.LocDesc;
          }
          else{
            location = evt.Location;
          }
      var tooltip = "<table role='presentation' cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:98%;table-layout:fixed' class='sapUiMlt'>"
          + "<colgroup>"
          + "<col style='width:40%'>"
          + "<col style='width:40%'>"
          + "<col style='width:20%'>"
          + "</colgroup>"
          + "<tbody style='width: 100%; height: 100%'>"
          + "<tr>"
          + "<td colspan='2' style='height:60px;overflow:visible;white-space:nowrap'>"
          + "<div style='height:60px;display:inline-block;vertical-align:middle' class=''></div>"
          + "<div style='display:inline-block;vertical-align:middle;max-height:60px;white-space:normal;width:100%' class=''>"
          + "<div style='overflow:visible;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
          + "<label style='direction:inherit;text-align:left' class='labelFont1rem bold sapUiLbl'>"
          + evt.EventDesc.replace(/_/g,' ')
          + "</label>"
          + "</div>"
          + "</div>"
          + "</td>"
          + "<td rowspan='2' style='overflow:hidden;height:60px;white-space:nowrap'>"
          + "<div style='height:60px;display:inline-block;vertical-align:top' class=''></div>"
          + "<div style='display:inline-block;vertical-align:middle;max-height:60px;white-space:normal;width:100%' class=''>"
          + "<div style='overflow:visible;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
          + "<label style='direction:inherit;text-align:left' class='roundLbl sapMLabel sapMLabelMaxWidth sapMLabelNoText sapUiSelectable "
          + evt.roundLblClass
          + "'>"
          + evt.alignmentNum
          + "</label>"
          + "</div>"
          + "</div>"
          + "</td>"
          + "</tr>"
          + "<tr>"
          + "<td colspan='2' style='height:40px;overflow:hidden;white-space:nowrap'>"
          + "<div style='height:10px;display:inline-block;vertical-align:bottom' class=''></div>"
          + "<div style='display:inline-block;vertical-align:middle;max-height:30px;white-space:normal;width:100%' class=''>"
          + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
          // + &#9719;
          + "<img src='img/loc.png'/>"
          /*+ "<label style='direction:inherit;text-align:left' class='sapUiLbl sapUiLblEmph sapUiLblNowrap'>"
          + "<span class='sapUiLblIco sapUiLblIcoL sapUiIcon sapUiIconMirrorInRTL'></span>"
          + location
          + "</label>"*/
          +"<span class='sapMText marginLeftHalfRem evtPopOverLocation sapMTextMaxWidth sapUiSelectable' style='direction:inherit;text-align:left'>"
          +location
          +"</span>"
          + "</div>"
          + "</div>"
          + "</td>"
          + "</tr>"
          + "<tr>"
          + "<td colspan='3' style='height:30px;overflow:hidden;white-space:nowrap'>"
          + "<div style='height:30px;display:inline-block;vertical-align:middle' class=''></div>"
          + "<div style='display:inline-block;vertical-align:middle;max-height:30px;white-space:normal;width:100%' class=''>"
          + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
          +"<img src='img/history.png' width='13px' height='15px'/>"
        //   + "&#x25f4;"//"\u2f54"
          + "<label style='direction:inherit;text-align:left' class='sapUiLbl marginLeftHalfRem sapUiLblEmph sapUiLblNowrap'>"
          //+ "<span class='sapUiLblIco sapUiLblIcoL sapUiIcon sapUiIconMirrorInRTL'>&#9716;</span>"
          // GM - 07/09/2015 - Text replacement
          //+ self.getView().getController().oBundle.getText("tooltipTextActual") + ": "
          //Overriding changes - Bikash
          + evt.actualDateLbl + ": "
          + evt.actualDate
          + "</label>"
          + "</div>"
          + "</div>"
          + "</td>"
          + "</tr>"
          + "<tr>"
          + "<td colspan='3' style='height:20px;overflow:visible;white-space:nowrap'>"
          + "<div style='height:20px;display:inline-block;vertical-align:top' class=''></div>"
          + "<div style='display:inline-block;vertical-align:top;max-height:20px;white-space:normal;width:100%' class=''>"
          + "<div style='overflow:visible;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
          + "<label style='direction:inherit;text-align:left' class='sapUiLbl margin1Rem topText'>"
          // GM - 07/09/2015 - Text replacement
          //+ self.getView().getController().oBundle.getText("tooltipTextFirstETD") + ": "
          //Overriding changes - Bikash
          + evt.plannedDateLbl + ": "
          + evt.plannedDate
          + "</label>"
          + "</div>"
          + "</div>"
          + "</td>"
          + "</tr>"
          + "</tbody>" + "</table>";

      return tooltip;
      }
      else{
        return("<p>No Data!</p>");
      }

  }
};