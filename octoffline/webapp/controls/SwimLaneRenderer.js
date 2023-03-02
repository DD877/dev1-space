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
jQuery.sap.declare("glb.gtmh.oct.controls.SwimLaneRenderer");


  /**
   * SwimLaneRenderer renderer.
   * @namespace
   */
  glb.gtmh.oct.controls.SwimLaneRenderer = {

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
  render : function(oRm, oSW) {
    var layout = oSW.createSwimLane();
    oRm.write("<div");

    oRm.writeControlData(oSW); // writes the Control ID and enables event handling - important!
    oRm.writeClasses(); // there is no class to write, but this enables
    // support for ColorBoxContainer.addStyleClass(...)

    oRm.write(">");
     oRm.renderControl(layout);
    //this.renderLane(oSW);
    oRm.write("</div>");
  },

  renderLane : function (oSW) {
    var id = oSW.getIdForLabel();
    if(d3.select("#"+id+"-swimLaneHeader")){
      d3.select("#"+id+"-swimLaneHeader").remove();
    }

    if(d3.select("#"+id+"-swimLaneHdr")){
       d3.select("#"+id+"-swimLaneHdr").remove();
    }
    var oModel = oSW.getModel();
    var daysWidth = oSW.getDayWidth();
    if(typeof oModel !== 'undefined' && oModel !== null){
    var days = oModel.getProperty("/days");
    var data = oModel.getProperty("/data");
    var weeks = oModel.getProperty("/weeks");
    var todayX = oModel.getProperty("/todayX");
    var marginLeft = oSW.getMarginLeft();
    var isAnimate = oSW.getAnimate();
    var duration = oSW.getAnimationDuration();
    var question="\u003f";
    var tick="\u2714";
    var self=this;
    //var marginRight = oSW.marginRight();
    // Added for header
        var headerCanvas = d3.select(
            ".drawPanelHdr .sapMPanelContent")
//    var headerCanvas = d3.select("#" + oSW.sParentId + ".sapMPanelContent")
            .append("svg").attr("id", id+"-swimLaneHeader")
            .attr("width", days.length * daysWidth)
            // .attr("class","swimLaneFixedHdr")
            .attr("height", function() {
              if (data.length > 0) {
                return 120;
              } else {
                return 165;
              }
            });

        headerCanvas.append("rect").attr("x", 0).attr("y", 0)
            .attr("width", days.length * daysWidth).attr(
                "fill", "whitesmoke")
            .attr("height", 30);

        // For Week Header
        headerCanvas.append("g").attr("id", "hdrg1").selectAll(
            "rect").data(weeks).enter().append("rect")
            .attr("x", function(d, i) {
              return i * daysWidth * 7;
            }).attr("y", 30).attr("width", daysWidth * 7)
            .attr("fill", "whitesmoke").attr("height", 60);

        // For Txt Header
        headerCanvas
            .selectAll("g")
            .selectAll("text")
            .data(weeks)
            .enter()
            .append("text")
            .attr(
                "x",
                function(d, i) {
                  return (i * daysWidth * 7)
                      + ((daysWidth * 2) + (daysWidth / 2));
                }).attr("y", function(d) {
              return 45;
            }).attr("fill", "grey").style("stroke-width",
                1).style({
              "font-size" : "14px",
              "z-index" : "999999999",
              "font-weight" : "normal"
            }).style("text-anchor", "middle").text(
                function(d) {
                  return d.weekTxt;
                });


        // For Date Range Header
        headerCanvas
            .selectAll("g").append("g")
            .selectAll("text")
            .data(weeks)
            .enter()
            .append("text")
            .attr(
                "x",
                function(d, i) {
                  return (i * daysWidth * 7)
                      + ((daysWidth * 2) + (daysWidth / 2));
                }).attr("y", function(d) {
              return 65;
            }).attr("fill", "black").style("stroke-width",
                1).style({
              "font-size" : "14px",
              "z-index" : "999999999",
              "font-weight" : "bold"
            }).style("text-anchor", "middle").text(
                function(d) {
                  return d.weekDtRangeTxt;
                });

        // For Day Header
        headerCanvas.append("g").attr("id", "hdrg2").attr(
            "transform", "translate(0,90)").selectAll(
            "rect").data(days).enter().append("rect").attr(
            "x", function(d, i) {
              return i * daysWidth;
            }).attr("y", 0).attr("width", daysWidth).attr(
            "fill", "whitesmoke").attr("height", 30);

        // For Txt Header 2
        d3.select("#hdrg2").selectAll("text").data(days)
            .enter().append("text").attr(
                "x",
                function(d, i) {
                  return (i * daysWidth)
                      + (daysWidth / 2 - 5);
                }).attr("y", function(d) {
              return 20;
            }).attr("fill", "black").style("stroke-width",
                1).style({
              "font-size" : "14px",
              "z-index" : "999999999"
            }).style("text-anchor", "left").text(
                function(d) {
                  return d;
                });

        var canvasHdr = headerCanvas.append("g").attr(
            "transform", "translate(0,120)");

        canvasHdr.append("g").attr("transform",
            "translate(0,-30)").selectAll("rect").data(
            weeks).enter().append("rect").attr(
            "x",
            function(d, i) {
              return ((i + 1) * (daysWidth * 7))
                  - (daysWidth * 2);
            }).attr("y", function() {
          return (0);
        }).attr("width", daysWidth * 2).attr("rx", 10).attr(
            "ry", 10).attr("fill", function() {
          return "rgb(230,230,230)";
        }).attr("height", function() {
          return data.length * 48 + 30;
        }).style({
          "opacity" : .5
        });

        // for today
        if (todayX.todayX >= 0) {
          canvasHdr.append("g").attr("id", "todayH").attr(
              "transform", "translate(0,-60)").selectAll(
              "rect").data([ todayX ]).enter().append(
              "rect").attr("x", function(d) {
            return d.todayX * daysWidth;
          }).attr("y", function() {
            return (10);
          }).attr("width", daysWidth).attr("rx", 5).attr(
              "ry", 5).attr("fill", function() {
            return "rgb(255, 194, 0)";
          }).attr("height", function() {
            return data.length * 48 + 50;
          }).style({
            "opacity" : .3
          });
        }
        d3.select("#todayH").append("text").attr("x",
            (todayX.todayX * daysWidth) + (daysWidth / 2))
            .attr("y", 20).attr("fill", "black").style(
                "stroke-width", 1).style({
              "font-size" : "10px",
              "z-index" : "999999999"
            }).style({
              "text-anchor" : "middle"
            }).text("Today");

        // End of header

//        var hdrCanvas = d3.select(
//            ".drawPanel .sapMPanelContent").append("svg")
        var hdrCanvas = d3.select("#" + id+ " .sapMPanelContent").append("svg")
            .attr("id", id+"-swimLaneHdr").attr("width",
                days.length * daysWidth)
            .attr("height", function() {
              if (data.length > 0) {
                return (data.length * 48 + 120);
              } else {
                return 165;
              }
            });
        // var canvas=null;
        if (data.length === 0) {
          hdrCanvas.append("g").attr("id", "noDatag").attr(
              "transform", "translate(0,135)").append(
              "rect").attr("x", 0).attr("y", 4).attr(
              "width", days.length * daysWidth).attr(
              "fill", "whitesmoke").attr("height", 60);
          d3.select("#noDatag").append("text").attr("x",
              daysWidth * 9).attr("y", 30).attr("fill",
              "black").style("stroke-width", 1).style({
            "font-size" : "18px",
            "z-index" : "999999999"
          }).style({
            "text-anchor" : "middle",
            "font-weight" : "bold"
          }).text("No data!");
          return;
        } else {

          var canvas = hdrCanvas.append("g").attr(
              "transform", "translate(0,120)");

          var div = d3.select("body").append("div").attr(
              "class", "tooltip")
              .attr("id", "swimLaneTT").style("opacity",
                  0);

          // For Border
          canvas.append("g").attr("transform",
              "translate(0,0)").selectAll("rect").data(
              data).enter().append("rect").attr("x",
              function() {
                return 0;
              }).attr("y", function(d, i) {
            return (i * 49);
          }).attr("width", days.length * daysWidth).attr(
              "fill", "whitesmoke").attr("height", 4);

          // For Row
          canvas.append("g").attr("transform",
              "translate(0,0)").selectAll("rect").data(
              data).enter().append("rect").attr("x",
              function() {
                return 0;
              }).attr("y", function(d, i) {
            return (i * 48 + 5);
          }).attr("width", days.length * daysWidth).attr(
              "fill", function(d, i) {
                if (i % 2 === 0) {
                  return "rgb(210, 210, 210)";
                } else {
                  return "rgb(240, 240, 240)";
                }
              }).attr("height", 44).style("cursor",
              "pointer").on(
              "click",
              function(d, i) {
              oSW.fireOnRowClick({data:d,rowIndex:i});
                /*self.getView().byId("lt").getRows()[i]
                    .getCells()[1].getItems()[0]
                    .firePress();*/
              });

          // for weekend
          canvas.append("g").attr("transform",
              "translate(0,0)").selectAll("rect").data(
              weeks).enter().append("rect").attr(
              "x",
              function(d, i) {
                return ((i + 1) * (daysWidth * 7))
                    - (daysWidth * 2);
              }).attr("y", function(d, i) {
            return (0);
          }).attr("width", daysWidth * 2)
          // .attr("rx",10)
          // .attr("ry",10)
          .attr("fill", function(d, i) {
            return "rgb(230,230,230)";
          }).attr("height", function(d, i) {
            return data.length * 48;
          }).style({
            "opacity" : .5
          });

          // //for today
          if (todayX.todayX >= 0) {
            canvas.append("g").attr("id", "todayG").attr(
                "transform", "translate(0,-12)")
                .selectAll("rect").data([ todayX ])
                .enter().append("rect")
                .attr("x", function(d, i) {
                  return d.todayX * daysWidth;
                }).attr("y", function(d, i) {
                  return (10);
                }).attr("width", daysWidth)
                // .attr("rx",5)
                // .attr("ry",5)
                .attr("fill", function(d, i) {
                  return "rgb(255, 194, 0)";
                }).attr("height", function(d, i) {
                  return data.length * 48 + 10;
                }).style({
                  "opacity" : .3
                });
          }
        }

        var line = canvas
            .append("g")
            .attr("transform", "translate(0,0)")
            .selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            // .filter(function(d){return d.AlignText<2;})
            .attr(
                "x",
                function(d) {
                  if (d.color === "#fad4d4") {

                    return (d.x * daysWidth) + daysWidth/3;//10;

                  } else if (d.color === "#b8d7e8") {
                    if (isAnimate) {
                      return (d.x * daysWidth)
                          + (d.width * daysWidth)+ daysWidth/3;
                    } else {
                      return (d.x * daysWidth) - + daysWidth/3;//10;
                    }
                  } else {
                    if (isAnimate) {
                      return (d.x * daysWidth) - + daysWidth/2.5;//15;
                    } else {
                      return (d.x * daysWidth) - + daysWidth/3;//10;
                    }
                  }
                })
            .attr("y", function(d, i) {
              return (i * 48) + 20;
            })
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("width", function(d) {
              if (isAnimate) {
                return 0;
              } else {
                if (d.color === "rgb(190,190,190)") {
                  return 0;
                }
                return (d.width * daysWidth);
              }
            })
            .attr("fill", function(d) {
              return d.color;
            })
            .attr("height", 8)
            .on(
                glb.gtmh.oct.util.Utility.mE,
                function(d) {
                div.transition().duration(100)
                      .style("opacity", 1);
                  div.html(self.createTooltip(d.GUID,
                      d.Container,
                      d.AlignmentNum,
                      d.AlignmentColor,
                      d.AlignmentText,
                      d.ActualDate, d.color,oSW));
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
                          function() {
                            if (d.color === "#28bc6e") {
                              return "#cce8d8";
                            } else {
                              return d.color;
                            }
                          });

                }).on(
                glb.gtmh.oct.util.Utility.mL,
                function(d) {
                  div.transition().duration(100)
                      .style("opacity", 0);
                });

        if (isAnimate) {
          line.transition().duration(duration).attr("width",
              function(d) {
                if (d.color === "rgb(190,190,190)") {
                  return 0;
                }
                return (d.width * daysWidth);
              }).attr("x", function(d) {
            if (d.color === "#fad4d4") {
              return (d.x * daysWidth)  + daysWidth/3;//10;
            } else {
              return (d.x * daysWidth) +  daysWidth/3;//10;
            }
          });
        }

        var circ = canvas.append("g").attr("id", "paCircle");
        var cir = circ
            .attr("transform", "translate(0,0)")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")

            .attr(
                "cx",
                function(d) {
                  if (d.color === "#fad4d4") {
                    if (isAnimate) {
                      return (d.x * daysWidth) + daysWidth/2.5;//14;
                    } else {
                      return (d.width * daysWidth)
                          + (d.x * daysWidth)
                          + daysWidth/2.5;//14;
                    }
                  } else if (d.color === "#b8d7e8") {
                    if (isAnimate) {
                      return (d.x * daysWidth)
                          + (d.width * daysWidth);
                    } else {
                      return (d.x * daysWidth) + daysWidth/2.5;//- 14;
                    }
                  } else {
                    if (isAnimate) {
                      return (d.x * daysWidth) + daysWidth/2.5;//14;
                    } else {
                      return (d.x * daysWidth) + daysWidth/2.5;//14;
                    }
                  }
                })
            .attr("cy", function(d, i) {
              return (i * 48) + 25;
            })
            .attr("r", 14)
            .attr(
                "fill",
                function(d) {
                  if (isAnimate) {
                    if (d.color === "rgb(190,190,190)") {
                      return d.color;
                    } else {
                      return "#28bc6e";
                    }
                  } else {
                    if (d.color === "#fad4d4") {
                      return "tomato";
                    } else if (d.color === "#b8d7e8") {
                      return "#1e90ff";
                    } else if (d.color === "#28bc6e"
                        || d.color === "rgb(190,190,190)"
                        || d.color === "#ffeaad") {

                      return d.color;
                    }
                  }
                })
            .on(
                glb.gtmh.oct.util.Utility.mE,
                function(d) {
                 div.transition().duration(100)
                      .style("opacity", 1);
                  div.html(self.createTooltip(d.GUID,
                      d.Container,
                      d.AlignmentNum,
                      d.AlignmentColor,
                      d.AlignmentText,
                      d.ActualDate, d.color,oSW));
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
                          function() {
                            if (d.color === "#28bc6e") {
                              return "#cce8d8";
                            } else {
                              return d.color;
                            }
                          });

                }).on(
                glb.gtmh.oct.util.Utility.mL,
                function(d) {
                 div.transition().duration(100)
                      .style("opacity", 0);
                });
        if (isAnimate) {
          cir
              .transition()
              .duration(duration)
              .attr(
                  "cx",
                  function(d) {
                    if (d.color === "#fad4d4") {
                      return (d.width * daysWidth)
                          + (d.x * daysWidth)
                          + daysWidth/2.5;//14;
                    } else if (d.color === "#b8d7e8") {
                      return (d.x * daysWidth) +daysWidth/2.5;//- 14;
                    } else if (d.color === "#28bc6e") {
                      return (d.x * daysWidth) + daysWidth/2.5;//14;
                    } else if (d.color === "#ffeaad") {
                      return (d.x * daysWidth) + daysWidth/2.5;//14;
                    } else if (d.color === "rgb(190,190,190)") {
                      return (d.x * daysWidth) + daysWidth/2.5;//14;
                    }
                  })
              .attr(
                  "fill",
                  function(d) {
                    if (d.color === "#fad4d4") {
                      return "tomato";
                    } else if (d.color === "#b8d7e8") {
                      return "#1e90ff";
                    } else if (d.color === "#28bc6e"
                        || d.color === "rgb(190,190,190)"
                        || d.color === "#ffeaad") {
                      return d.color;
                    }
                  });
        }

        //for (var i = 0; i < data.length; i++) {
        	
        	circ.selectAll("text").data(data).enter()
              .append("text")
              .attr("x", function(d){return (d.x * daysWidth)+ daysWidth/2.5;})//(data[i].x * daysWidth) + daysWidth/2.5)//14)
              .attr("y", function(d,i){return (i * 48) + 30;})
              .style("text-anchor", "middle")
              .attr("class", "checkmark")
              .attr("id", function(d,i){return id+"-txtArrived" + i;})
              .attr("fill", "white")
              .attr("font-weight", "normal")
              .on(
                  glb.gtmh.oct.util.Utility.mE,
                  function(d) {
                    div.transition().duration(100)
                        .style("opacity", 1);
                    div.html(self.createTooltip(
                        d.GUID, d.Container,
                        d.AlignmentNum,
                        d.AlignmentColor,
                        d.AlignmentText,
                        d.ActualDate, d.color,oSW));
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
                            function() {
                              if (d.color === "#28bc6e") {
                                return "#cce8d8";
                              } else {
                                return d.color;
                              }
                            });

                  })
              .on(
                  glb.gtmh.oct.util.Utility.mL,
                  function(d) {
                   div.transition().duration(100)
                        .style("opacity", 0);
                  })
              .text(
                  function(d) {
                    if (d.AlignStatus === "2") {
                      var t = tick;
                      return t;
                    } else if (d.AlignStatus === "3") {
                      t = question;
                      return t;
                    } else {
                      return "";
                    }
                  });
                  
          for (var i = 0; i < data.length; i++) {
          if (data[i].AlignStatus === "2") {
           // document.getElementById(id+"-txtArrived" + i).innerHTML = tick;
            $("#"+id+"-txtArrived" + i).innerText = tick;
          }
          if (data[i].AlignStatus === "3") {
            //document.getElementById(id+"-txtArrived" + i).innerHTML = question;
            $("#"+id+"-txtArrived" + i).innerText = question;
          }
          }
        	
          // For check
         /* circ
              .append("text")
              .attr("x", (data[i].x * daysWidth) + daysWidth/2.5)//14)
              .attr("y", (i * 48) + 30)
              .style("text-anchor", "middle")
              .attr("class", "checkmark")
              .attr("id", id+"-txtArrived" + i)
              .attr("fill", "white")
              .attr("font-weight", "normal")
              .on(
                  Utility.mE,
                  function(d) {
                    div.transition().duration(100)
                        .style("opacity", 1);
                    div.html(self.createTooltip(
                        d.GUID, d.Container,
                        d.AlignmentNum,
                        d.AlignmentColor,
                        d.AlignmentText,
                        d.ActualDate, d.color,oSW));
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
                            function() {
                              if (d.color === "#28bc6e") {
                                return "#cce8d8";
                              } else {
                                return d.color;
                              }
                            });

                  })
              .on(
                  Utility.mL,
                  function(d) {
                   div.transition().duration(100)
                        .style("opacity", 0);
                  })
              .text(
                  function() {
                    if (data[i].AlignStatus == "2") {
                      var t = tick;
                      return t;
                    } else if (data[i].AlignStatus == "3") {
                      t = question;
                      return t;
                    } else {
                      return "";
                    }
                  });
          if (data[i].AlignStatus == "2") {
           // document.getElementById(id+"-txtArrived" + i).innerHTML = tick;
            $("#"+id+"-txtArrived" + i).innerText = tick;
          }
          if (data[i].AlignStatus == "3") {
            //document.getElementById(id+"-txtArrived" + i).innerHTML = question;
            $("#"+id+"-txtArrived" + i).innerText = question;
          }*/
        //}

        d3.select("#"+id+"-swimLaneHdr").style("margin-left",
            marginLeft + "px");
        d3.select("#"+id+"-swimLaneHeader").style("margin-left",
            marginLeft + "px");
    }
  },

  createTooltip : function(guid, container, alignmentNum,
              alignmentColor, alignmentText, actualDate, color,oSW) {
            if (container === "") {
              container = glb.gtmh.oct.util.Utility.oBundle.getText("unidentifiedC");
              alignmentNum = glb.gtmh.oct.util.Utility.oBundle.getText("question");
              alignmentText = "";
            }
            var conData = new sap.ui.model.json.JSONModel(oSW.getModel().getProperty("/filterPC"));
            var oBinding = conData.bindList("/ProductCollection");
            var filter = new sap.ui.model.Filter("GUID", "EQ", guid);
            oBinding.filter(filter);
            var item = conData
                .getProperty(oBinding.getContexts()[0].sPath);
            //var events = item.EventSet.results;
            var i = 0;
            var daysAgoText = "";
            var lastEvt = "";
            var flag = false;
            var rd="";
            //Change for performance
            var rcvDate = item.LastEventDate;
            //Check for date existence
            if (rcvDate === ""
                  || typeof rcvDate === "undefined"
                  || rcvDate === null || Number(rcvDate)=== 0) {
                  daysAgoText=glb.gtmh.oct.util.Utility.oBundle.getText("na");
            }
            else{
                rd=glb.gtmh.oct.util.Utility.getDateParts(rcvDate,true).date;
                daysAgoText = " "
                    + glb.gtmh.oct.util.Utility.getDaysAgoText(
                        rd,
                        "yyyyMMdd");
           }
           if(glb.gtmh.oct.util.Utility.hasValue(item.LastEventDesc)){
                lastEvt = item.LastEventDesc + " ";
           }
           else{
              lastEvt = glb.gtmh.oct.util.Utility.oBundle.getText("lastEvent")+" ";
           }
            //End of change

            /*for (i in events) {
              var rcvDate = events[i].UTCReceiveDate;
              if (rcvDate === ""
                  || typeof rcvDate === "undefined"
                  || rcvDate === null || Number(rcvDate)=== 0) {
                rd=Utility.getDateParts(events[i- 1].UTCReceiveDate,true).date;
                daysAgoText = " "
                    + Utility.getDaysAgoText(
                        rd,
                        "yyyyMMdd");
                lastEvt = events[i - 1].EventID + " ";
                flag = true;
              }
            }
            if (flag === false) {
            if(events.length>0){
              rd=Utility.getDateParts(events[events.length - 1].UTCReceiveDate,true).date;
              daysAgoText = " "
                  + Utility
                      .getDaysAgoText(
                          rd,
                          "yyyyMMdd");
              lastEvt = events[events.length - 1].EventID + " ";
              }
              else{
                lastEvt = "";
              }
            }*/
            var rndLblClass = null;
            var date = ""
                + glb.gtmh.oct.util.Utility.formatDate(actualDate, "yyyyMMdd",
                    "dd/MM/yyyy");
            if (alignmentColor === "red") {
              rndLblClass = "roundLblRed";
            } else if (alignmentColor === "green") {
              rndLblClass = "roundLblGreen";
            } else if (alignmentColor === "blue") {
              rndLblClass = "roundLblBlue";
            }
            var tooltip = "<table role='presentation'  cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:98%;table-layout:fixed' class='sapUiMlt'>"
                + "<colgroup>"
                + "<col style='width:40%'>"
                + "<col style='width:40%'>"
                + "<col style='width:20%'>"
                + "</colgroup>"

                + "<tbody style='width: 100%; height: 100%'>"
                + "<tr>"
                + "<td colspan='2' style='height:35px;overflow:hidden;white-space:nowrap'>"
                + "<div style='height:35px;display:inline-block;vertical-align:middle' class=''></div>"
                + "<div style='display:inline-block;vertical-align:middle;max-height:35px;white-space:normal;width:100%' class=''>"
                + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
                + "<label style='direction:inherit;text-align:left' class='nestleSizeBig1 sapUiLbl sapUiLblNowrap'>"
                + container
                + "</label>"
                + "</div>"
                + "</div>"
                + "</td>"
                + "<td rowspan='3' style='overflow:hidden;height:60px;white-space:nowrap'>"
                + "<div style='height:60px;display:inline-block;vertical-align:middle' class=''></div>"
                + "<div style='display:inline-block;vertical-align:middle;max-height:60px;white-space:normal;width:100%' class=''>"
                + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
                + "<label style='direction:inherit;margin-top:-20px;text-align:left' class='roundLbl sapMLabel sapMLabelMaxWidth sapUiSelectable "
                + rndLblClass
                + "'>"
                + alignmentNum
                + "</label>"
                + "</div>"
                + "</div>"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td colspan='2' style='height:25px;overflow:hidden;white-space:nowrap'>"
                + "<div style='height:25px;display:inline-block;vertical-align:middle' class=''></div>"
                + "<div style='display:inline-block;vertical-align:middle;max-height:25px;white-space:normal;width:100%' class=''>"
                + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
                + "<label style='direction:inherit;text-align:left' class='sapUiLbl sapUiLblEmph sapUiLblNowrap'>"
                + alignmentText
                + "</label>"
                + "</div>"
                + "</div>"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td colspan='3' style='height:30px;overflow:hidden;white-space:nowrap'>"
                + "<div style='height:30px;display:inline-block;vertical-align:middle' class=''></div>"
                + "<div style='display:inline-block;vertical-align:middle;max-height:30px;white-space:normal;width:100%' class=''>"
                + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
                + "<label style='direction:inherit;text-align:left' class='sapUiLbl sapUiLblNowrap topText'>Date: "
                + date
                + "</label>"
                + "</div>"
                + "</div>"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td colspan='3' style='height:20px;overflow:hidden;white-space:nowrap'>"
                + "<div style='height:20px;display:inline-block;vertical-align:middle' class=''></div>"
                + "<div style='display:inline-block;vertical-align:middle;max-height:20px;white-space:normal;width:100%' class=''>"
                + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
                + "<label style='direction:inherit;text-align:left' class='sapUiLbl sapUiLblNowrap topText'>"
                + "Last Event"
                + "</label>"
                + "</div>"
                + "</div>"
                + "</td>"
                + "</tr>"
                + "<tr>"
                + "<td colspan='3' style='height:40px;overflow:hidden;white-space:nowrap'>"
                + "<div style='height:20px;display:inline-block;vertical-align:middle' class=''></div>"
                + "<div style='display:inline-block;vertical-align:middle;max-height:40px;white-space:normal;width:100%' class=''>"
                + "<div style='overflow:hidden;text-overflow:inherit' class='sapUiMltCell sapUiMltPadRight'>"
                + "<label style='direction:inherit;text-align:left' class='sapUiLbl sapUiLblEmph sapUiLblNowrap'>"
                + lastEvt
                + "</label>"
                + "<span class='topText'> "+glb.gtmh.oct.util.Utility.oBundle.getText("received")+" </span>"
                + "</label>"
                + "<label style='direction:inherit;text-align:left' class='sapUiLbl sapUiLblEmph sapUiLblNowrap'>"
                + daysAgoText
                + "</label>"
                + "</div>"
                + "</div>"
                + "</td>"
                + "</tr>"
                + "</tbody>"
                + "</table>";
            return tooltip;
          }


};