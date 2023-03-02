/*!
 *@Author: Bikash R
 */
jQuery.sap.require("sap/ui/thirdparty/d3");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("glb.gtmh.oct.controls.DonutChartCustRenderer");
jQuery.sap.declare("glb.gtmh.oct.controls.DonutChartCust");

(function() {

  "use strict";

  /**
   * Constructor for a new DonutChartCust.
   *
   * @param {string} [sId] id for the new control, generated automatically if no id is given
   * @param {object} [mSettings] initial settings for the new control
   *
   * @class
   * This is the DonutChartCust control
   * @extends sap.ui.core.Control
   *
   * @author Bikash R
   *
   * @constructor
   * @public
   * @alias glb.gtmh.oct.controls.DonutChartCust
   */
  var DonutChartCust = sap.ui.core.Control.extend("glb.gtmh.oct.controls.DonutChartCust", /** @lends glb.gtmh.oct.controls.DonutChartCust.prototype */ {
      metadata : {

        library : "sap/ui/thirdparty/d3",
        properties : {
          /**
           * visibility of the control
           */
          visible : {type : "boolean", group : "Misc", defaultValue : true},
          /**
           * the inner radius
           */
          innerRadius : {type : "int", group : "Misc", defaultValue :6},

          /**
           * the outer radius
           */
          outerRadius : {type : "int", group : "Misc", defaultValue : 10},
          /**
           * no data Text
           */
          noDataText : {type : "string", group : "Misc", defaultValue : "No data"},
          /**
           * height
           */
          height : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "100%"},
          /**
           * height
           */
          width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "100%"},
          /**
           * left margin
           */
          marginLeft : {type : "int", group : "Misc", defaultValue : 0}

          },
      events: {
        "onChartSelect" : {
          parameters : {
              /**
               * id of the menu item
               */
              id : {type : "string"},
              /**
               * Data contained in the cell
               */
              data : {type : "object"}
            }
        }
      }
      }
  });
  DonutChartCust.prototype.init = function () {
  };

  DonutChartCust.prototype.exit = function () {
  };

  DonutChartCust.prototype.onBeforeRendering = function () {
  };

  DonutChartCust.prototype.onAfterRendering = function () {
    glb.gtmh.oct.controls.DonutChartCustRenderer.renderChart(this);
    this.setBusy(false);
  };

  DonutChartCust.prototype.createDonutChartCust= function () {
    /*
     * Called from renderer
     */
   // var oDonutChartCustLayout = new sap.m.VBox({alignItems:sap.m.FlexAlignItems.Center,justifyContent:sap.m.FlexJustifyContent.Center});
    var oDonutChartCustPanel = new sap.m.Panel({height:"95%",width:"100%",content:[]});
    oDonutChartCustPanel.addStyleClass("panelborder panel_margin noOverflow noHeaderHdr");
    /* ATTENTION: Important
     * This is where the magic happens: we need a handle for our SVG to attach to. We can get this using .getIdForLabel()
     * Check this in the 'Elements' section of the Chrome Devtools:
     * By creating the layout and the Flexbox, we create elements specific for this control, and SAPUI5 takes care of
     * ID naming. With this ID, we can append an SVG tag inside the FlexBox
     */
   // this.sParentId=oDonutChartCustPanel.getIdForLabel();
  //  oDonutChartCustLayout.addItem(oDonutChartCustPanel);
    return oDonutChartCustPanel;
  };

  DonutChartCust.prototype.refreshDonutChartCust= function () {
    glb.gtmh.oct.controls.DonutChartCustRenderer.renderChart(this);
    this.setBusy(false);
  };

  return DonutChartCust;
}());