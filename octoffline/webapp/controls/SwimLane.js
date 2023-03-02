/*!
 *@Author: Bikash R
 */
jQuery.sap.require("sap/ui/thirdparty/d3");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("glb.gtmh.oct.controls.SwimLaneRenderer");
jQuery.sap.declare("glb.gtmh.oct.controls.SwimLane");

(function() {

  "use strict";

  /**
   * Constructor for a new SwimLane.
   *
   * @param {string} [sId] id for the new control, generated automatically if no id is given
   * @param {object} [mSettings] initial settings for the new control
   *
   * @class
   * This is the SwimLane control
   * @extends sap.ui.core.Control
   *
   * @author Bikash R
   *
   * @constructor
   * @public
   * @alias glb.gtmh.oct.controls.SwimLane
   */
  var SwimLane = sap.ui.core.Control.extend("glb.gtmh.oct.controls.SwimLane", /** @lends glb.gtmh.oct.controls.SwimLane.prototype */ {
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
           * visibility of the animation
           */
          animate : {type : "boolean", group : "Misc", defaultValue : true},
          /**
           * duration of animation in milliseconds
           */
          animationDuration : {type : "int", group : "Misc", defaultValue : 1000},
          /**
           * left margin
           */
          marginLeft : {type : "int", group : "Misc", defaultValue : 0}

          },
      events: {
        "onRowClick" : {
          parameters : {
              /**
               * id of the menu item
               */
              id : {type : "string"},
              /**
               * Data contained in the cell
               */
              data : {type : "object"},
              /**
               * Row Index
               */
              rowIndex : {type : "int"}
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
  SwimLane.prototype.init = function () {
    this.sParentId = "";
  },

  SwimLane.prototype.exit = function () {

  };

  SwimLane.prototype.onBeforeRendering = function () {
  };

  SwimLane.prototype.onAfterRendering = function () {
    glb.gtmh.oct.controls.SwimLaneRenderer.renderLane(this);
  };

  SwimLane.prototype.createSwimLane= function () {
    /*
     * Called from renderer
     */
   // var oSwimLaneLayout = new sap.m.VBox({alignItems:sap.m.FlexAlignItems.Center,justifyContent:sap.m.FlexJustifyContent.Center});
    var oSwimLanePanel = new sap.m.Panel({height:"auto",width:"100%",content:[]});
    oSwimLanePanel.addStyleClass("drawPanel noHeaderHdr");
    /* ATTENTION: Important
     * This is where the magic happens: we need a handle for our SVG to attach to. We can get this using .getIdForLabel()
     * Check this in the 'Elements' section of the Chrome Devtools:
     * By creating the layout and the Flexbox, we create elements specific for this control, and SAPUI5 takes care of
     * ID naming. With this ID, we can append an SVG tag inside the FlexBox
     */
   // this.sParentId=oSwimLanePanel.getIdForLabel();
  //  oSwimLaneLayout.addItem(oSwimLanePanel);
    return oSwimLanePanel;
  };

  SwimLane.prototype.refreshSwimLane= function () {

    glb.gtmh.oct.controls.SwimLaneRenderer.renderLane(this);
  };

  return SwimLane;
}());