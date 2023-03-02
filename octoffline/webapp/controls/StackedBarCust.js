/*!
 *@Author: Bikash R
 */
jQuery.sap.require("sap/ui/thirdparty/d3");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("glb.gtmh.oct.controls.StackedBarCustRenderer");
jQuery.sap.declare("glb.gtmh.oct.controls.StackedBarCust");

(function() {

  "use strict";

  /**
   * Constructor for a new StackedBarCust.
   *
   * @param {string} [sId] id for the new control, generated automatically if no id is given
   * @param {object} [mSettings] initial settings for the new control
   *
   * @class
   * This is the StackedBarCust control
   * @extends sap.ui.core.Control
   *
   * @author Bikash R
   *
   * @constructor
   * @public
   * @alias glb.gtmh.oct.controls.StackedBarCust
   */
  var StackedBarCust = sap.ui.core.Control.extend("glb.gtmh.oct.controls.StackedBarCust", /** @lends glb.gtmh.oct.controls.StackedBarCust.prototype */ {
      metadata : {

        library : "sap/ui/thirdparty/d3",
        properties : {
          /**
           * visibility of the control
           */
          visible : {type : "boolean", group : "Misc", defaultValue : true},
          /**
           * the width of a day
           */
          dayWidth : {type : "int", group : "Misc", defaultValue :Math.round((window.innerWidth - 300)/21)},

          /**
           * the height of a day
           */
          dayHeight : {type : "int", group : "Misc", defaultValue : 40},
          /**
           * left margin
           */
          marginLeft : {type : "int", group : "Misc", defaultValue : 0}

          },
      events: {
        "onBarClick" : {
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
        },
        "onLaneHover":{
          parameters : {
              /**
               * cell Id clicked
               */
              id : {type : "string"},
              /**
               * Data from the cell
               */
              data : {type : "object"}
            }
        }
      }
      }
  });
  StackedBarCust.prototype.init = function () {
    this.sParentId = "";
  },

  StackedBarCust.prototype.exit = function () {

  };

  StackedBarCust.prototype.setMarginLeft = function (mL) {
    //this.setProperty("marginLeft", mL);
    d3.select("#"+this.getId()+"-dcLoadHdr1").style("margin-left",
        mL + "px");

  };

  StackedBarCust.prototype.onBeforeRendering = function () {
  };

  StackedBarCust.prototype.onAfterRendering = function () {
    glb.gtmh.oct.controls.StackedBarCustRenderer.renderChart(this);
    this.setBusy(false);
  };

  StackedBarCust.prototype.createStackedBarCust= function () {
    /*
     * Called from renderer
     */
   // var oStackedBarCustLayout = new sap.m.VBox({alignItems:sap.m.FlexAlignItems.Center,justifyContent:sap.m.FlexJustifyContent.Center});
    var oStackedBarCustPanel = new sap.m.Panel({height:"400px",width:"100%",content:[]});
    oStackedBarCustPanel.addStyleClass("panelnoborder topMargin90 bgInherit noHeaderHdr noPaddingPanel");
    /* ATTENTION: Important
     * This is where the magic happens: we need a handle for our SVG to attach to. We can get this using .getIdForLabel()
     * Check this in the 'Elements' section of the Chrome Devtools:
     * By creating the layout and the Flexbox, we create elements specific for this control, and SAPUI5 takes care of
     * ID naming. With this ID, we can append an SVG tag inside the FlexBox
     */
   // this.sParentId=oStackedBarCustPanel.getIdForLabel();
  //  oStackedBarCustLayout.addItem(oStackedBarCustPanel);
    return oStackedBarCustPanel;
  };

  StackedBarCust.prototype.refreshStackedBarCust= function () {

    glb.gtmh.oct.controls.StackedBarCustRenderer.renderChart(this);
    this.setBusy(false);
  };

  return StackedBarCust;
}());