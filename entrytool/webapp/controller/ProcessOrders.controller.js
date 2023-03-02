sap.ui.define([
    "entrytool/controller/BaseController",
    "sap/ui/model/json/JSONModel", "entrytool/model/formatter",
    "sap/ui/model/Filter", "sap/ui/model/Sorter", "sap/m/MessageBox", "sap/ui/model/FilterOperator", 'sap/ui/export/library',
    "sap/ui/export/Spreadsheet"
], function (e, t, r, o, i, a, FilterOperator, exportLibrary, Spreadsheet) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    return e.extend("entrytool.controller.ProcessOrders", {
        custFormatter: r,
        onInit: function () {
            this.getRouter().getRoute("ProcessOrders").attachPatternMatched(this._onRouteMatched, this);
            this._loadODataUtils();
            this.getApproveOrderPropertySet();
            this._getSystem();
            this.getItemCategoryData()
            var omodel = this.getOwnerComponent().getModel("OrderHeaderDetails");
            this.getView().setModel(omodel, "OHDs");

            var oFilterStatus = new o("ZORD_STATUS", sap.ui.model.FilterOperator.Contains, "ORCR");
            this.getView().byId("table2").getBinding("items").filter([oFilterStatus]);

        },
        _onRouteMatched: function (e) {
            var t = this.getView().byId("smartTablePr");
            var r = this.getView().getModel("viewProperties");
            var o = r.getData().LoginID;
            var i = this.getOwnerComponent().sUserRole;
            var a;
            if (i === "RSNO") {
                a = "/SNOOrders";
                t.setTableBindingPath(a)
            }
            t.rebindTable();
            this.onDataReceived();
            this.getVisiblePlaceOrder();
            var s = this;
            setInterval(function () {
                s.userLogin()
            }, 3e5)
        },
        onDataReceived: function () {
            var e = this.getView().byId("smartTablePr").getTable(),
                t = 0,
                r = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = r.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onBeforeRendering: function () { },
        onBeforeRebindTable: function (e) {
            var t = e.getSource();
            var r;
            var a = e.getParameter("bindingParams");
            var s = this.getView().getModel("viewProperties");
            var n = s.getData().LoginID;
            var l = s.getData().sUserRole;
            if (l === "RSNO") { }
            a.filters.push(new o("ZORD_STATUS", "EQ", "ORCR", true));
            if (l === "CUST") {
                a.filters.push(new o("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId))
            }
            var g = new i({
                path: "ZCHANGED_ON",
                descending: true,
                group: true
            });
            if (!a.sorter.length) {
                a.sorter.push(new sap.ui.model.Sorter("ZINTR_ORDNUM", true));
                a.sorter.push(g)
            }
        },
        onSimulateClose: function () {
            this._oSiDialog.close();
            if (this._oSiDialog) {
                this._oSiDialog = this._oSiDialog.destroy()
            }
        },
        formatDate1: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyy-MM-dd",
                    UTC: false
                });
                t = r.format(e);
                var o = t;
                return o
            }
        },
        soLineClose: function () {
            this._oCSSOLADialog.close();
            if (this._oCSSOLADialog) {
                this._oCSSOLADialog = this._oCSSOLADialog.destroy()
            }
        },
        soLineShow: function (e) {
            var r = this._ConfirmDialog.getModel("OrderData1").getData();
            var o = this._ConfirmDialog.getModel("OrderDataF").getData();
            var i = this._ConfirmDialog.getModel("OrderData12");
            var s = this._oViewProperties = new t;
            s.setData(r);
            var n = e.getSource().getBindingContext("OrderData12").getObject();
            var l = this.getView().getModel("viewProperties1");
            var g, d = r.ZSYSTEM;
            var c = this.getView().getModel("jsonSystemData").getData();
            for (var u = 0; u < c.length; u++) {
                if (c[u].Yydesc === "LEAN" && d === "L") {
                    g = c[u].Yylow
                } else if (c[u].Yydesc === "TEMPO" && d === "T") {
                    g = c[u].Yylow
                }
            }
            var h = "datetime%27" + this.formatDate1(n.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";
            var m = "/ysoschedulelinesSet(distchnl='" + r.ZDISTR_CHNL + "',division='" + r.ZDIVISION + "',salesorg='" + r.ZSALES_AREA + "',customer='" + r.ZCUST_NUM + "',Material='" + n.ZMAT_NUM + "',Unit='" + "PC" + "',Sysid='" + g + "',ReqDate=" + h + ",ReqQty=" + n.ZTRGT_QTY + ")";
            sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(m, {
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    var o = new t;
                    o.setData(e);
                    if (!this._oCSSOLADialog) {
                        this._oCSSOLADialog = sap.ui.xmlfragment("entrytool.fragments.orderSimulateAprSOLine", this);
                        this.getView().addDependent(this._oCSSOLADialog);
                        this._oCSSOLADialog.setModel(o, "ssoLineJson");
                        this._oCSSOLADialog.setModel(s, "ssoLineJson1")
                    }
                    if (e.Retmsg) {
                        a.show(e.Retmsg, {
                            icon: a.Icon.ERROR,
                            title: "Error",
                            actions: [a.Action.CLOSE],
                            styleClass: "sapUiSizeCompact myMessageBox"
                        })
                    }
                    this._oCSSOLADialog.open()
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    a.show(e.message, {
                        icon: a.Icon.ERROR,
                        title: "Error",
                        actions: [a.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }.bind(this)
            })
        },
        onAddCM1Press: function (e) {
            var t;
            if (e.getParameter("row")) {
                t = e.getParameter("row").getBindingContext().getObject()
            } else if (e.getParameter("rowContext")) {
                t = e.getParameter("rowContext").getObject()
            } else if (e.getSource().getBindingContext()) {
                t = e.getSource().getBindingContext().getObject()
            }
            this.getConfirmOrderData(t)
        },
        pressAddAttachment: function (e) {
            var t = this.getView().getModel("viewProperties1");
            this.oAttachData = e.getSource();
            var r, o, i, a = t.getProperty("/ZDOC_ID");
            if (a) {
                r = a.split("_MOET_")[0];
                o = a.split("_MOET_")[1]
            } else {
                oData[sComSpec] = ""
            }
            if (r && o) {
                sap.m.URLHelper.redirect("/CMIS/cmis/download?docId=" + r, true)
            } else { }
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
        },
        cnfrmOrderExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId('table2');
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Confirmed Orders.xlsx',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                label: 'Internal Order No.',
                property: 'ZINTR_ORDNUM',
                type: EdmType.String
            });

            aCols.push({
                label: 'Sales Document No.',
                type: EdmType.String,
                property: 'ZORD_NUM',
                scale: 0
            });

            aCols.push({
                label: 'Customer',
                property: 'ZCUST_NUM',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'PO Number',
                property: 'ZCUST_PONUM',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Status',
                property: 'ZORD_STATUS',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Description',
                property: 'ZORDER_STATUS_TEXT',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Created By',
                property: 'ZCREATED_BY',
                type: EdmType.String,
                scale: 0
            });

            return aCols;
        }
    })
});