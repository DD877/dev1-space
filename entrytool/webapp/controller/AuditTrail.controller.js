sap.ui.define([
    "entrytool/controller/BaseController",
    "sap/ui/model/json/JSONModel", "entrytool/model/formatter",
    "sap/ui/model/Filter", "sap/ui/model/Sorter"
], function (e, t, i, a, n) {
    "use strict";
    return e.extend("entrytool.controller.AuditTrail", {
        custFormatter: i,
        handlePressOpenMenu: function (e) {
            var t = e.getSource();
            if (!this._menu) {
                this._menu = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.MenuItem", this);
                this.getView().addDependent(this._menu)
            }
            var i = sap.ui.core.Popup.Dock;
            this._menu.open(this._bKeyboard, t, i.BeginTop, i.BeginBottom, t)
        },
        handlePressOpenNewOrderPage: function () {
            var e = this.getOwnerComponent().getRouter();
            e.navTo("NewOrder")
        },
        handlePressOpenNewOrder: function (e) {
            var t = e.getSource();
            if (!this._new) {
                this._new = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.NewOrder", this);
                this.getView().addDependent(this._new)
            }
            var i = sap.ui.core.Popup.Dock;
            this._new.open(this._bKeyboard, t, i.BeginTop, i.BeginBottom, t)
        },
        closeCreateDialog: function () {
            if (this._new) {
                this._new.close();
                this._new = this._new.destroy(true)
            }
        },
        onInit: function () {
            this.getRouter().getRoute("AuditTrail").attachPatternMatched(this._onRouteMatched, this);
            // this._loadODataUtils();
            this.fNotification = []
            // var omdel = this.getView().getmodel("auditTrailCustomerMaintenance");
            // this.getView().setmodel(omdel,"ATCM")

            var omdel = this.getOwnerComponent().getModel("auditTrailCustomerMaintenance");
            this.getView().setModel(omdel, "ATCM");
            
            var omdel2 = this.getOwnerComponent().getModel("auditrailUserMaint");
            this.getView().setModel(omdel2, "ATUM");
        },
        _onRouteMatched: function (e) {
            this.getVisiblePlaceOrder();
            var t = this;
            setInterval(function () {
                t.userLogin()
            }, 3e5)
        },
        onDataReceived: function () {
            var e = this.getView().byId("STUserMaintenance").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onBeforeRebindTable: function (e) { },
        onDataMater: function () {
            var e = this.getView().byId("STMatMaitainLog").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedCM: function () {
            var e = this.getView().byId("STCustMainten").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedUC: function () {
            var e = this.getView().byId("STSFBUserCustMaitain").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedCMAT: function () {
            var e = this.getView().byId("STSFBCustMatMaitain").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedCSHIP: function () {
            var e = this.getView().byId("STCustShipToMaitain").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedCFT: function () {
            var e = this.getView().byId("STCustFTradeMaitain").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedMATI: function () {
            var e = this.getView().byId("STMatItemCategory").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedOH: function () {
            var e = this.getView().byId("STOrderHeader").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onDataReceivedOI: function () {
            var e = this.getView().byId("STOrderItem").getTable(),
                t = 0,
                i = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = i.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onSectionCahnges: function (e) {
            var t = this.getView().byId("ObjectPageLayout");
            if (e.getParameter("section").getTitle() === "User Maintenance") {
                this.getView().byId("SFBUserMaintenance").fireSearch(true);
                this.onDataReceived()
            }
            if (e.getParameter("section").getTitle() === "Customer Maintenance") {
                this.getView().byId("SFBCustMaintenA").fireSearch(true);
                this.onDataReceivedCM()
            }
            if (e.getParameter("section").getTitle() === "Material Maintenance") {
                this.getView().byId("SFBMatMaitainLog").fireSearch(true);
                this.onDataMater()
            }
            if (e.getParameter("section").getTitle() === "User Customer Assignment") {
                this.getView().byId("SFBUserCustMaitain").fireSearch(true);
                this.onDataReceivedUC()
            }
            if (e.getParameter("section").getTitle() === "Customer Material Assignment") {
                this.getView().byId("SFBCustMatMaitain").fireSearch(true);
                this.onDataReceivedCMAT()
            }
            if (e.getParameter("section").getTitle() === "Customer Ship To Party Assignment") {
                this.getView().byId("SFBCustShipToMaitain").fireSearch(true);
                this.onDataReceivedCSHIP()
            }
            if (e.getParameter("section").getTitle() === "Customer FTRADE Assignment") {
                this.getView().byId("SFBCustFTradeMaitain").fireSearch(true);
                this.onDataReceivedCFT()
            }
            if (e.getParameter("section").getTitle() === "Material Item Category Assignment") {
                this.getView().byId("SFBMatItemCategory").fireSearch(true);
                this.onDataReceivedMATI()
            }
            if (e.getParameter("section").getTitle() === "Order Header Details") {
                this.getView().byId("SFBOrderHeader").fireSearch(true);
                this.onDataReceivedOH()
            }
            if (e.getParameter("section").getTitle() === "Order Item Details") {
                this.getView().byId("SFBOrderItem").fireSearch(true);
                this.onDataReceivedOI()
            }
        },
        onAssignedFiltersChanged: function (e) {
            var t = e.getSource();
            for (var i in t._oFilterProvider._mTokenHandler) {
                var a = t._oFilterProvider._mTokenHandler[i];
                if (a && a.parser) {
                    a.parser.setDefaultOperation("Contains")
                }
            }
        },
        onInitialized: function (e) {
            var t = e.getSource();
            for (var i in t._oFilterProvider._mTokenHandler) {
                var a = t._oFilterProvider._mTokenHandler[i];
                if (a && a.parser) {
                    a.parser.setDefaultOperation("Contains")
                }
            }
        }
    })
});