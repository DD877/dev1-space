sap.ui.define([
    "sap/m/Button", "sap/m/Dialog", "sap/m/Label", "sap/m/MessageToast", "sap/m/Text",
    "sap/m/TextArea", "entrytool/controller/BaseController",
    "sap/ui/model/json/JSONModel", "entrytool/model/formatter",
    "sap/ui/model/Filter", "sap/ui/model/Sorter", "sap/m/MessageBox",
    "sap/ui/layout/HorizontalLayout", "sap/ui/layout/VerticalLayout",
    "../services/RepoService",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'

], function (e, t, r, o, i, a, s, n, l, u, d, g, c, p, _,Filter,FilterOperator) {
    "use strict";
    return s.extend("entrytool.controller.Orders", {
        custFormatter: l,
        onInit: function () {
            var omodel = this.getOwnerComponent().getModel("OrderHeaderDetails");
            this.getView().setModel(omodel, "OHDs");

            var oFilterStatus = new Filter("ZORD_STATUS",sap.ui.model.FilterOperator.Contains, "DRFT");
            this.getView().byId("table").getBinding("items").filter([oFilterStatus]);

            this.getRouter().getRoute("Orders").attachPatternMatched(this._onRouteMatched, this);
            this._loadODataUtils();
            this.getPropertySet();
            this._getSystem();
            this.fNotification = [];
            this.getItemCategoryData();
            this.userLogin()
        },
        _onRouteMatched: function (e) {
            var t = this.getView().byId("smartTableOrd");
            var r = this.getView().getModel("viewProperties");
            var o = r.getData().LoginID;
            var i = this.getOwnerComponent().sUserRole;
            var a;
            if (i === "RSNO") {
                a = "/SNOOrders";
                t.setTableBindingPath(a)
            }
            // t.rebindTable();
            this.onDataReceived();
            this.getVisiblePlaceOrder();
            var s = this;
            setInterval(function () {
                s.userLogin()
            }, 3e5)
        },
        onBeforeRebindTable: function (e) {
            var t = e.getParameter("bindingParams");
            t.filters.push(new u("ZORD_STATUS", "EQ", "DRFT"));
            t.filters.push(new u("ZORD_STATUS", "EQ", "SNOR"));
            if (this.getOwnerComponent().sUserRole === "CUST") {
                t.filters.push(new u("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId))
            }
            if (!t.sorter.length) {
                t.sorter.push(new sap.ui.model.Sorter("ZCHANGED_ON", true));
                t.sorter.push(new sap.ui.model.Sorter("ZINTR_ORDNUM", true))
            }
        },
        onBeforeRendering: function () { },
        onEditPress: function (e) {
            var t;
            if (e.getParameter("row")) {
                t = e.getParameter("row").getBindingContext().getObject()
            } else if (e.getParameter("rowContext")) {
                t = e.getParameter("rowContext").getObject()
            } else if (e.getSource().getBindingContext()) {
                t = e.getSource().getBindingContext().getObject()
            }
            this.getEditOrderData(t)
        },
        _getMaterialValue: function (e) {
            var t = this.getOwnerComponent().getModel();
            var r = this.getView().getModel("OrderData12");
            var o = "/MaterialDetails";
            sap.ui.core.BusyIndicator.show();
            t.read(o, {
                filters: [new u("Z_MATRL_NUM", "EQ", e)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    r.setProperty("/ZMATRL_DESC", e.results[0].ZMATRL_DESC);
                    r.setProperty("/ZTRGT_QTYUOM", e.results[0].ZBASE_UNIT_MEASURE);
                    r.setProperty("/ZALT_UOM", e.results[0].ZBASE_UNIT_MEASURE);
                    r.setProperty("/ZMIN_QTY", e.results[0].ZMIN_ORDER_QUAN);
                    r.setProperty("/ZGRP_DEVLPR", e.results[0].ZGRP_DEVLPR)
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onDataReceived: function () {
            var e = this.getView().byId("smartTableOrd").getTable(),
                t = 0,
                r = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = r.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onAssignedFiltersChanged: function (e) {
            var t = e.getSource();
            for (var r in t._oFilterProvider._mTokenHandler) {
                var o = t._oFilterProvider._mTokenHandler[r];
                if (o && o.parser) {
                    o.parser.setDefaultOperation("Contains")
                }
            }
        },
        onInitialized: function (e) {
            var t = e.getSource();
            for (var r in t._oFilterProvider._mTokenHandler) {
                var o = t._oFilterProvider._mTokenHandler[r];
                if (o && o.parser) {
                    o.parser.setDefaultOperation("Contains")
                }
            }
        }
    })
});