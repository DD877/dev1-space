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
jQuery.sap.declare("glb.gtmh.oct.controls.DonutChartCustRenderer");


  /**
   * DonutChartCustRenderer renderer.
   * @namespace
   */
  glb.gtmh.oct.controls.DonutChartCustRenderer = {

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
  render : function(oRm, oDCC) {
    var layout = oDCC.createDonutChartCust();
    oRm.write("<div style=\"height:80%;width:100%\" ");
    oRm.writeControlData(oDCC); // writes the Control ID and enables event handling - important!
    oRm.writeClasses(); // there is no class to write, but this enables
    // support for ColorBoxContainer.addStyleClass(...)

    oRm.write(">");
//    oRm.renderControl(layout);

    //this.renderLane(oDCC);
    oRm.write("</div>");
  },

  renderChart : function (oDCC) {
    var id = oDCC.getIdForLabel();
    if (d3.select("#"+id+"-alignDonut") !== null) {
          d3.select("#"+id+"-alignDonut").remove();
        }
      var tot = 0;
      var pnlId = id;
      var chartId = id+"-alignDonut";
      var oModel = oDCC.getModel();
      var iR=oDCC.getInnerRadius();
      var oR=oDCC.getOuterRadius();
      iR = Math.min(iR,10);
      oR = Math.min(oR,10);
      iR = Math.max(iR,1);
      oR = Math.max(oR,1);
      var $container = $("#" + id);
      var width = $container.width();
      var height = $container.height();
      var outerRadius = ((Math.min(width,height)/2)*oR)/10;
      var innerRadius = (outerRadius/10)*iR;
      var fontSize = (Math.min(width,height)/4);
      if(typeof oModel !== 'undefined' && oModel !== null){
      var data = oModel.getProperty("/");

//      if (chartFor === "PA") {
//        pnlId = "panelPA";
//        chartId = "alignDonut";
//      } else if (chartFor === "PF") {
//        pnlId = "panelFC";
//        chartId = "flagDonut";
//      }

      for (var i = 0; i < data.length; i++) {
        tot += Number(data[i].count);
      }
//      var self = this;
//
//      var pnl = this.getView().byId(pnlId);
//
//      var aCId = pnl.getId();
      var canvas = d3.select("#" + id )
      .append("svg").attr("id",
          chartId).attr("width", '100%').attr("height", '100%')
          .attr('viewBox','0 0 '+Math.min(width,height) +' '+Math.min(width,height) )
          .attr('preserveAspectRatio','xMinYMin')
          .append("g")
          .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")")
          .style("vertical-align", "middle");

      var tip = d3
          .tip()
          .attr('class', 'd3-tip')
          .offset([ -10, 0 ])
          .html(
              function(d) {
                return "<span style='color:white;font-size:12px'>"
                    + d.data.label
                    + " : "
                    + d.data.count + "</span>";
              });
      canvas.call(tip);

      var legend = canvas.append("g").attr("class", "legend")
      // .attr("x", w - 65)
      // .attr("y", 50)
      .attr("height", 100).attr("width", 100).attr(
          "visibility", "hidden").attr('transform',
          //'translate(190,10)');
        "translate(" + Math.min(width,height) / 1.8 + "," + ((Math.min(width,height) / 2)-height) + ")");
      legend.selectAll('rect').data(data).enter().append(
          "rect").filter(function(d) {
        return d.count > 0;
      }).attr("x", 0).attr("y", function(d, i) {
        return i * 20;
      }).attr("width", 10).attr("height", 10).attr("rx", 3)
          .attr("ry", 3).style("fill", function(d) {
            // var color =
            // colors[dataset.indexOf(d)][1];
            return d.color;
          });

      legend.selectAll('text').data(data).enter().append(
          "text").filter(function(d) {
        return d.count > 0;
      }).attr("x", 20).attr("y", function(d, i) {
        return i * 20 + 8;
      }).attr("fill", "black").style("stroke-width", 1)
          .style({
            "font-size" : "10px"
          }).style("text-anchor", "left").text(
              function(d) {
                return d.label;
              });

      var group = canvas.append("g").attr("transform",
          "translate(0,0)");

      var arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

      // var arc1 =
      // d3.svg.arc().innerRadius(45).outerRadius(85);

      var pie = d3.layout.pie().value(function(d) {
        return Number(d.count);
      }).sort(null);

      var arcs = group.selectAll(".arc").data(pie(data))
          .enter().append("g").filter(function(d) {
            return d.data.count > 0;
          }).attr("class", "arc");

      arcs.append("path").attr("d", arc).each(function(d) {
        this._current = d;
      }).attr("fill", function(d, i) {
        return d.data.color;
      }).on("click", function(d) {
          oDCC.fireOnChartSelect({data:d.data});

      }).on("mouseover", function(d) {
        var color = null;
        color = d3.rgb(d.data.color).darker(1);
        this.setAttribute("stroke", color);
        this.setAttribute("stroke-width", 1);
        tip.show(d);
      }).on("mouseout", function(d) {
        this.setAttribute("stroke", d.data.color);
        this.setAttribute("stroke-width", 1);
        tip.hide(d);
      });

      arcs.append("text").attr("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")";
      }).attr("text-anchor", "middle").attr("font-size",
          fontSize/3+'px').attr("fill", "white").attr(
          "font-weight", "bold").text(function(d) {
        return d.data.count;
      });
      arcs.append("text").filter(function(d, i) {
        return i === 0;
      }).attr("dy", fontSize/4).style("text-anchor", "middle")
          .attr("font-weight", "bold").attr("font-size",fontSize/2+'px').text(function(d) {
            return tot;
          });

//      if (tot === 0) {
//        var nodata = canvas.append("g").attr("class",
//            "nodata")
//        // .attr("x", w - 65)
//        // .attr("y", 50)
//        .attr("visibility", "visible").attr('transform',
//            'translate(100,60)');
//        nodata.append("rect").attr("height", 100).attr(
//            "width", 100).attr("fill", "white");
//        nodata.append("text").text(function(d) {
//          return oDCC.getNoDataText();//Utility.oBundle.getText("errNoData");
//        }).attr("x", 0).attr("y", 30).style({
//          "text-anchor" : "middle",
//          "stroke-width" : "1px",
//          "font-size" : fontSize
//        }).attr("fill", "black");
//      }

  }
      else{
        var canvas = d3.select("#" + id )
          .append("svg").attr("id",
              chartId).attr("width", '100%').attr("height", '100%')
              .attr('viewBox','0 0 '+Math.min(width,height) +' '+Math.min(width,height) )
              .attr('preserveAspectRatio','xMinYMin')
              .append("g")
              .attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")")
              .style("vertical-align", "middle");


              var nodata = canvas.append("g").attr("class",
                  "nodata")
              // .attr("x", w - 65)
              // .attr("y", 50)
              .attr("visibility", "visible").attr('transform',
                  'translate(100,60)');
              nodata.append("rect").attr("height", 100).attr(
                  "width", 100).attr("fill", "white");
              nodata.append("text").text(function(d) {
                return oDCC.getNoDataText();//Utility.oBundle.getText("errNoData");
              }).attr("x", 0).attr("y", 30).style({
                "text-anchor" : "middle",
                "stroke-width" : "1px",
                "font-size" : fontSize
              }).attr("fill", "black");

      }
  }

};