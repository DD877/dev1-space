/*!
 *@Author: Bikash R
 */
jQuery.sap.require("sap/ui/thirdparty/d3");
jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("glb.gtmh.oct.controls.TrackerRenderer");
jQuery.sap.declare("glb.gtmh.oct.controls.Tracker");

(function() {

  "use strict";

  /**
   * Constructor for a new Tracker.
   *
   * @param {string} [sId] id for the new control, generated automatically if no id is given
   * @param {object} [mSettings] initial settings for the new control
   *
   * @class
   * This is the Tracker control
   * @extends sap.ui.core.Control
   *
   * @author Bikash R
   *
   * @constructor
   * @public
   * @alias glb.gtmh.oct.controls.Tracker
   */
  var Tracker = sap.ui.core.Control.extend("glb.gtmh.oct.controls.Tracker", /** @lends glb.gtmh.oct.controls.Tracker.prototype */ {
      metadata : {

        library : "sap/ui/thirdparty/d3",
        properties : {
          /**
           * visibility of the control
           */
          visible : {type : "boolean", group : "Misc", defaultValue : true},
          /**
           * no data Text
           */
          noDataText : {type : "string", group : "Misc", defaultValue : "No data"},
          /**
           * height
           */
          height : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "100%"},
          /**
           * eventLineWidth
           */
          eventLineWidth : {type : "int", group : "Misc", defaultValue : "150"},
          /**
           * mainEventCircleRadius
           */
          mainEventCircleRadius : {type : "int", group : "Misc", defaultValue : "20"},
          /**
           * subEventCircleRadius
           */
          subEventCircleRadius : {type : "int", group : "Misc", defaultValue : "15"},
          /**
           * width
           */
          width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "auto"},
          /**
           * eventBindingPath
           */
          eventsBindingPath : {type : "string", group : "Misc", defaultValue : "/Events"},
          /**
           * eventDetailsBindingPath
           */
          eventDetailsBindingPath : {type : "string", group : "Misc", defaultValue : "/EventDetails"},
          /**
           * eventLineStyleBindingPath
           */
          eventsLineStyleBindingPath : {type : "string", group : "Misc", defaultValue : "/EventsLineStyle"},
           /**
           * headerDataBindingPath
           */
          headerDataBindingPath : {type : "string", group : "Misc", defaultValue : "/HeaderData"},
          /**
           * left margin
           */
          marginLeft : {type : "int", group : "Misc", defaultValue : 0}

          },
      events: {
        "onEventCircleHover" : {
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
               * all data
               */
              allEvents : {type : "object"}
            }
        }
      }
      }
  });
  Tracker.prototype.init = function () {
  },

  Tracker.prototype.exit = function () {
  };

  Tracker.prototype.onBeforeRendering = function () {
  };

  Tracker.prototype.onAfterRendering = function () {
    glb.gtmh.oct.controls.TrackerRenderer.renderTracker(this);
  };

  Tracker.prototype.createTracker= function () {
    /*
     * Called from renderer
     */
    //var oTrackerLayout = new sap.ui.layout.VerticalLayout({alignItems:sap.m.FlexAlignItems.Center,justifyContent:sap.m.FlexJustifyContent.Center});
    var oTrackerPanel = new sap.m.Panel({height:"95%",width:"100%",content:[]});
    oTrackerPanel.addStyleClass("panelborder panel_margin noOverflow noHeaderHdr");
    /* ATTENTION: Important
     * This is where the magic happens: we need a handle for our SVG to attach to. We can get this using .getIdForLabel()
     * Check this in the 'Elements' section of the Chrome Devtools:
     * By creating the layout and the Flexbox, we create elements specific for this control, and SAPUI5 takes care of
     * ID naming. With this ID, we can append an SVG tag inside the FlexBox
     */
   // this.sParentId=oTrackerPanel.getIdForLabel();
  //  oTrackerLayout.addItem(oTrackerPanel);
    return oTrackerPanel;
  };

  Tracker.prototype.refreshTracker= function () {
    glb.gtmh.oct.controls.TrackerRenderer.renderTracker(this);
  };

  return Tracker;
}());