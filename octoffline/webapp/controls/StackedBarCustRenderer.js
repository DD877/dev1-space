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
jQuery.sap.declare("glb.gtmh.oct.controls.StackedBarCustRenderer");


  /**
   * StackedBarCustRenderer renderer.
   * @namespace
   */
  glb.gtmh.oct.controls.StackedBarCustRenderer = {

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
  render : function(oRm, oSBC) {
    var layout = oSBC.createStackedBarCust();
    oRm.write("<div");
    oRm.writeControlData(oSBC); // writes the Control ID and enables event handling - important!
    oRm.writeClasses(); // there is no class to write, but this enables
    // support for ColorBoxContainer.addStyleClass(...)

    oRm.write(">");
    oRm.renderControl(layout);
    //this.renderLane(oSBC);
    oRm.write("</div>");
  },

  renderChart : function (oSBC) {
    var id = oSBC.getIdForLabel();
    var currSel=null;
    if(d3.select("#"+id+"-dcLoadHdr1")){
      d3.select("#"+id+"-dcLoadHdr1").remove();
    }

    if(d3.select("#"+id+"-dcLoadHdr2")){
       d3.select("#"+id+"-dcLoadHdr2").remove();
    }

    if(d3.select("#"+id+"-dcLoadLegend")){
        d3.select("#"+id+"-dcLoadLegend").remove();
      }

    var oModel = oSBC.getModel();
    var daysWidth = oSBC.getDayWidth();
    if(typeof oModel !== 'undefined' && oModel !== null){
      var days = oModel.getProperty("/days");
        var data = oModel.getProperty("/data");
        var weeks = oModel.getProperty("/weeks");
        var todayX = oModel.getProperty("/todayX");
        var marginLeft = oSBC.getMarginLeft();
        var self=this;

        //Render Legend
        var margin = {
                top : 20,
                right : 20,
                bottom : 30,
                left : 10
              };
              var width = days.length * daysWidth - margin.left
                  - margin.right;
              var height = 200 - margin.top - margin.bottom;

                var leg = [ {
                p : glb.gtmh.oct.util.Utility.oBundle.getText("priority1"),
                desc : glb.gtmh.oct.util.Utility.oBundle.getText("legOS"),
                color : '#DC6868'
              }, {
                p : glb.gtmh.oct.util.Utility.oBundle.getText("priority2"),
                desc : glb.gtmh.oct.util.Utility.oBundle.getText("legLS"),
                color : '#FFBF00'
              }, {
                p : glb.gtmh.oct.util.Utility.oBundle.getText("priority3"),
                desc : glb.gtmh.oct.util.Utility.oBundle.getText("legNF"),
                color : '#66C17B'
              } ];
               var svgLegend=d3
              .select(".legendPanel .sapMPanelContent")
              .append("svg").attr(
                      "height",
                      45).attr("id", id+"-dcLoadLegend")
                  .attr(
                      "width",
                      function() {
                        return 400;//Math.round(window.innerWidth * .76);
                      }).style("background", "whitesmoke");

                       var legend = svgLegend.selectAll("g")
              .data(leg)
              .enter()
              .append("g")
              .attr("class", "legend")
              .attr(
                  "transform",
                  function(d, i) {

                    return "translate("
                        + (i* 100) + ",10)";
                  });

          legend.append("rect").attr("x", function(d, i) {
            return i * 50;
          }).attr("width", 10).attr("height", 10).style("fill",
              function(d, i) {

                return d.color;
              }).attr("rx", 3).attr("ry", 3);

          legend.append("text").attr("x", function(d, i) {
            return i * 50 + 14;
          }).attr("y", 8).attr("dy", ".25em").style({
            "text-anchor" : "start",
            "font-weight" : "bold",
            "font-size" : "12px"
          }).text(function(d) {
            return d.p;
          });
          legend.append("text").attr("x", function(d, i) {
            return i * 50 + 14;
          }).attr("y", 20).attr("dy", ".15em").style({
            "text-anchor" : "start",
            "font-size" : "10px"
          }).text(function(d) {
            return d.desc;
          });
        //End of legend rendering


//        var svg = d3.select(".chartPanelDC .sapMPanelContent")
        var svg = d3.select("#" + id+ " .sapMPanelContent")
        .append("svg").attr(
            "height",
            height + margin.top + margin.bottom
                + 120).attr("id", id+"-dcLoadHdr1")
        .attr(
            "width",
            function() {
             /* if (days.length * daysWidth < 945) {
                return Number(945 + margin.left
                    + margin.right);
              } else {
                return Number(days.length * daysWidth
                    + margin.left
                    + margin.right);
              }*/
              return ((days.length +1) * daysWidth) + margin.left + margin.right;
            }).style("background", "whitesmoke")
        .append("g").attr(
            "transform",
            "translate(" + (margin.left*4) + ","
                + margin.top + ")");

    var tip = d3
        .tip()
        .attr('class', 'd3-tip')
        .offset([ -10, 0 ])
        .html(
            function(d) {
              return "<span style='color:white;font-size:12px;font-weight:bold'>"
                  + glb.gtmh.oct.util.Utility
                      .dateConvert(
                          d.label,
                          "yyyyMMdd",false,true)
                  + "</span><br/><br/>"
                  + "<span style='color:white;font-size:12px'>"
                  + d.summary[0].name
                  + " : "
                  + d.summary[0].value
                  + "</span><br/>"
                  + "<span style='color:white;font-size:12px'>"
                  + d.summary[1].name
                  + " : "
                  + d.summary[1].value
                  + "</span><br/>"
                  + "<span style='color:white;font-size:12px'>"
                  + d.summary[2].name
                  + " : "
                  + d.summary[2].value
                  + "</span><br/>";
            });
    svg.call(tip);

    // For week
    svg.append("g").attr("id", id+"-g11").selectAll("rect")
        .data(weeks).enter().append("rect").attr("x",
            function(d, i) {
              return i * daysWidth * 7;// + margin.left;// + 60;
            }).attr("y", 0).attr("width", daysWidth * 7)
        .attr("fill", "whitesmoke").attr("height", 60);

    // For Week Text
    svg.selectAll("g").selectAll("text").data(weeks)
        .enter().append("text").attr(
            "x",
            function(d, i) {
              return (i * daysWidth * 7) + 120;
                 // + margin.left + 60;
            }).attr("y", function(d) {
          return 30;
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
    svg
        .selectAll("g").append("g")
        .selectAll("text")
        .data(weeks)
        .enter()
        .append("text")
        .attr(
            "x",
            function(d, i) {
              return (i * daysWidth * 7) + 120;//margin.left + 120 + 60;
                  //+ ((daysWidth * 2) + (daysWidth / 2));
            }).attr("y", function(d) {
          return 45;
        }).attr("fill", "black").style("stroke-width",
            1).style({
          "font-size" : "14px",
          "z-index" : "999999999",
          "font-weight" : "bold"
        }).style("text-anchor", "middle").text(
            function(d) {
              return d.weekDtRangeTxt;
            });

    // For day
    svg.append("g").attr("id",id+"-g22").attr("transform",
        "translate(0,60)").selectAll("rect").data(days)
        .enter().append("rect").attr("x",
            function(d, i) {
              return i * daysWidth;// + margin.left;
            }).attr("y", 0).attr("width", daysWidth).attr(
            "fill", "whitesmoke")
        .attr("height", 30);

    // For day text
    d3.select("#"+id+"-g22").selectAll("text").data(days).enter()
        .append("text").attr("x", function(d, i) {
          return (i * daysWidth) + 18 ;//+ margin.left;
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

    //var data = this.chartModel;
    if (data.length === 0) {
      svg.append("g").attr("id",id+"-noDatag").attr(
          "transform", "translate(0,135)").append(
          "rect").attr("x", 0).attr("y", 4).attr(
          "width", days.length * daysWidth).attr("fill",
          "whitesmoke").attr("height", 60);
      d3.select("#"+id+"-noDatag").append("text").attr("x",
          daysWidth * 11).attr("y", 30)
          .attr("fill", "black").style(
              "stroke-width", 1).style({
            "font-size" : "18px",
            "z-index" : "999999999"
          }).style({
            "text-anchor" : "middle",
            "font-weight" : "bold"
          }).text("No data!");
      // return;
    } else {

      // //for today
      //31Aug2016
      if (todayX.todayX > -1) {
        svg.append("g").attr("id", id+"-todayGDCL").attr(
            "transform", "translate(0,40)")
            .selectAll("rect").data([ todayX ])
            .enter().append("rect").attr(
                "x",
                function(d, i) {
                	// 31Aug2016
                  return d.todayX-8;
                     // + margin.left;
                }).attr("y", function(d, i) {
              return 0;
            }).attr("width", daysWidth).attr("rx", 5)
            .attr("ry", 5).attr("fill",
                function(d, i) {
                  return "rgb(255, 194, 0)";
                }).attr("height",
                function(d, i) {
                  return 230;
                }).style({
              "opacity" : .3
            });
        d3.select("#"+id+"-todayGDCL").append("text").attr(
            "x", todayX.todayX +20+6)//+ margin.left + 20) 31Aug2016
            .attr("y", 15).attr("fill", "black")
            .style("stroke-width", 1).style({
              "font-size" : "10px",
              "z-index" : "999999999"
            }).style({
              "text-anchor" : "middle"
            }).text("Today");
      }

      var x = d3.scale
          .ordinal()
          .rangeRoundBands(
              [
                  0,
                  (width+50) ],
              0.15);

      var y = d3.scale.linear().rangeRound([ height, 0 ]);

      var yAxis = d3.svg.axis().scale(y).orient("right")
          .ticks(5).tickSize(width+50).tickFormat(
              d3.format("1s"));

      var color = d3.scale.ordinal().range(
          [ '#DC6868', '#FFBF00', '#66C17B' ]);
      // For shade
      var sColor = d3.scale.ordinal().range(
          [ '#F6BAB4', '#FFE08A', '#B4E2C1' ]);
      var labelVar = 'day';
      var varNames = d3.keys(data[0]).filter(
          function(key) {
            return (key !== labelVar && key !== 'mapping' && key !== 'total');
          });
      color.domain(varNames);
      sColor.domain(varNames);
      var cnt = 0;
      data
          .forEach(function(d, i, j) {
            var y0 = 0;

            d.mapping = varNames
                .map(function(name) {
                  var p = null;
                  var leg = null;
                  if (name === "OutOfStock") {
                    p = 1;
                    leg = glb.gtmh.oct.util.Utility.oBundle
                        .getText("legOS");
                  } else if (name === "LowOnStock") {
                    p = 2;
                    leg = glb.gtmh.oct.util.Utility.oBundle
                        .getText("legLS");
                  } else if (name === "NoFlag") {
                    p = 3;
                    leg = glb.gtmh.oct.util.Utility.oBundle
                        .getText("legNF");
                  }
                  return {
                    name : leg,
                    priority : p,
                    label : d[labelVar],
                    y0 : y0,
                    y1 : y0 += +d[name],
                    summary : [
                        {
                          name : glb.gtmh.oct.util.Utility.oBundle
                              .getText("priority1"),
                          value : data[cnt].OutOfStock
                        },
                        {
                          name : glb.gtmh.oct.util.Utility.oBundle
                              .getText("priority2"),
                          value : data[cnt].LowOnStock
                        },
                        {
                          name : glb.gtmh.oct.util.Utility.oBundle
                              .getText("priority3"),
                          value : data[cnt].NoFlag
                        }

                    ]

                  };
                });
            d.total = d.mapping[d.mapping.length - 1].y1;
            cnt++;
          });
      x.domain(data.map(function(d, i) {
        return i;
      }));
      y.domain([ 0, d3.max(data, function(d) {
        if (d.total === 0) {
          return 1;
        } else {
          return d.total;
        }
      }) ]);

      var ticks = d3.max(data, function(d) {
        if (d.total === 0) {
          return 1;
        } else {
          return d.total;
        }
      });
      if (ticks < 5) {
        yAxis.ticks(ticks);
      } else {
        yAxis.ticks(5);
      }

      var yx = svg.append("g").attr("class", "y axis")
          .attr("transform", "translate(0,120)")
          .call(yAxis);

      yx.selectAll("g") // .filter(function(d) { return
      // d;
      // })
      .classed("minor", true);
      // .attr("class", "tick minor");

      yx.selectAll("text").attr("x", -20).attr("dy", 5)
          .attr("stroke", "grey");
      var selection = svg
          .selectAll(".series")
          .data(data)
          .enter()
          .append("g")
          .attr("class", "series")
          .attr(
              "transform",
              function(d, i) {
                return "translate("
                    + (x(i) - (daysWidth/3.4)) + ",120)";
              });

      selection
          .selectAll("rect")
          .data(function(d) {
            return d.mapping;
          })
          .enter()
          .append("rect")
          .attr("width", x.rangeBand())
          .attr("y", function(d) {
            return y(d.y1);
          })
          .attr("height", function(d) {
            return y(d.y0) - y(d.y1);
          })
          .style("fill", function(d) {
            return d3.rgb(sColor(d.name));
          })
          // .style("opacity", 0.4)
          .attr("rx", 3)
          .attr("ry", 3)
          // .style("stroke", "grey")
          .on(
              "click",
              function(d, i) {
                if (currSel !== null) {
                  currSel
                      .selectAll("rect")
                      .style(
                          "fill",
                          function(d) {
                            // return
                            // 0.4;
                            return d3
                                .rgb(sColor(d.name));
                          });
                }
                var p = d3
                    .select(this.parentNode);
                currSel = p;
                p
                    .selectAll("rect")
                    .style(
                        "fill",
                        function(d) {
                          // return 1;
                          return d3
                              .rgb(color(d.name));
                        });
                oSBC.fireOnBarClick({data:d});
              }).on("mouseover", tip.show).on(
              "mouseout", tip.hide);

      // //
    }

    // // //for today
    // if (todayX.todayX > 0) {
    // svg.append("g").attr("id", "todayGDCL").attr(
    // "transform", "translate(0,40)").selectAll(
    // "rect").data([ todayX ]).enter().append(
    // "rect").attr("x", function(d, i) {
    // return d.todayX + margin.left + 60;
    // }).attr("y", function(d, i) {
    // return 0;
    // }).attr("width", 45).attr("rx", 5).attr("ry", 5)
    // .attr("fill", function(d, i) {
    // return "rgb(255, 194, 0)";
    // }).attr("height", function(d, i) {
    // return 230;
    // }).style({
    // "opacity" : .3
    // });
    // d3.select("#todayGDCL").append("text").attr("x",
    // todayX.todayX + margin.left + 80).attr("y",
    // 15).attr("fill", "black").style(
    // "stroke-width", 1).style({
    // "font-size" : "12px",
    // "z-index" : "999999999"
    // }).style({
    // "text-anchor" : "middle"
    // }).text("Today");
    // }
   /* marginLeft = -30;
    oSBC.setMarginLeft(marginLeft);
    this.tblPageCount = 0;*/

    // d3.select("#"+id+"-dcLoadHdr1").style("margin-left",
    //     marginLeft + "px");
    }
  }

};