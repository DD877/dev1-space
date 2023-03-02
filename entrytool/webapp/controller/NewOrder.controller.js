sap.ui.define([
    "sap/m/Button", "sap/m/Dialog", "sap/m/Label", "sap/m/MessageToast", "sap/m/Text",
    "entrytool/controller/BaseController", "sap/ui/model/json/JSONModel",
    "entrytool/model/formatter", "sap/ui/model/Filter", "sap/ui/model/Sorter",
    "sap/m/MessageBox", "sap/ui/layout/HorizontalLayout", "sap/ui/layout/VerticalLayout",
    "../services/RepoService"
], function (e, t, r, s, a, o, i, n, l, d, u, g, c, h) {
    "use strict";
    return o.extend("entrytool.controller.NewOrder", {
        custFormatter: n,
        handlePressOpenMenu: function (e) {
            var t = e.getSource();
            if (!this._menu) {
                this._menu = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.MenuItem", this);
                this.getView().addDependent(this._menu)
            }
            var r = sap.ui.core.Popup.Dock;
            this._menu.open(this._bKeyboard, t, r.BeginTop, r.BeginBottom, t)
        },
        handlePressOpenNewOrderPage: function () {
            var e = this.getOwnerComponent().getRouter();
            e.navTo("NewOrderPage")
        },
        handlePressOpenNewOrder: function (e) {
            var t = e.getSource();
            if (!this._new) {
                this._new = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.NewOrder", this);
                this.getView().addDependent(this._new)
            }
            var r = sap.ui.core.Popup.Dock;
            this._new.open(this._bKeyboard, t, r.BeginTop, r.BeginBottom, t)
        },
        closeCreateDialog: function () {
            if (this._new) {
                this._new.close();
                this._new = this._new.destroy(true)
            }
        },
        onInit: function () {
            var omodel = this.getOwnerComponent().getModel("CustomerDetails");
            this.getView().setModel(omodel, "CDs");
            this._getSystem();
            this._oViewProperties = new i({
                username: "",
                emailId: "",
                userid: "",
                LoginID: "",
                cusId: "",
                cusName: "",
                salesId: "",
                Distrchn: "",
                Division: "",
                DelvBlockId: "",
                ShipToId: "",
                ShipToName: "",
                ShipToAddr: "",
                Discount: "",
                IVHDRNETVAL: "",
                herderCurr: "",
                selectCurr: "",
                CustomerPOnumber: "",
                CustomerPODate: null,
                metrialNo: "",
                matrialDesc: "",
                ZMATRL_DESC: "",
                system: "",
                plant: "",
                HDRNETVAL: "",
                tenderFalg: false,
                ZTOTAL_AMT: "",
                ZFTRADE: "",
                ZFTRADE_DESC: "",
                ZDELIVERY_BLOCK_DESC: "",
                ZDEL_BLOCK_ID: "",
                sUserRole: true,
                DocID: ""
            });
            this.getView().setModel(this._oViewProperties, "viewProperties");
            this.fNotification = [];
            this.minDate = new Date;
            this.maxDate = new Date;
            this._data = {
                Products: [{
                    ZINTR_ORDNUM: "",
                    ZSYSTEM: "",
                    ZINTR_ITEMNUM: "",
                    ZMIN_ORDER_QUAN: "",
                    ZMAT_NUM: "",
                    ZTRGT_QTY: "",
                    ZPALLET_QTY: "",
                    ZTRGT_QTYUOM: "",
                    ZALT_UOM: "",
                    ZREQ_DLVRYDAT: "",
                    ZFOC_SMPL: "",
                    ZORD_NUM: "",
                    ZITEM_NUM: "",
                    ZDISCNT: "",
                    currency: "",
                    UNITPC: "",
                    matrialDesc: "",
                    ZMATRL_DESC: "",
                    NetQty: "",
                    ZMIN_QTY: "",
                    ZCOST: "",
                    ZGRP_DEVLPR: "",
                    ZFROZEN_PERIOD: "",
                    ZMAX_DATE: this.maxDate,
                    ZMIN_DATE: this.minDate,
                    ZPAL_QUAN: "",
                    ZFOC_ITMC_FLAG: "",
                    ZSCHD_TYPE: "",
                    ItemCategorySug: []
                }]
            };
            this.jModel = new sap.ui.model.json.JSONModel;
            this.jModel.setData(this._data);
            this.getView().setModel(this.jModel, "orderItemModel");
            this.getItemCategoryData();
            this.getOwnerComponent().getRouter().getRoute("NewOrder").attachPatternMatched(this._onRouteMatched, this);
            this.userLogin()

            var crr = {
                "curr": [{
                    "ZCURR": "EURO"
                }]
            }
            var omcurr = new sap.ui.model.json.JSONModel;
            omcurr.setData(crr)
            this.getView().setModel(omcurr, "CJson")
        },
        userLogin: function () {
            var e = new i,
                t = this;
            var r = this.getView().getModel("viewProperties");
            var s = this.getOwnerComponent().getModel(),
                a = "/SessionUser";
            //sap.ui.core.BusyIndicator.show();
            s.read(a, {
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.userId = r.setProperty("/LoginID", e.results[0].ZUSR_ID);
                    t.getOwnerComponent().sUserId = e.results[0].ZUSR_ID;
                    t.getOwnerComponent().sUserRole = e.results[0].ZUSR_ROLE;
                    r.setProperty("/sUserRole", e.results[0].ZUSR_ROLE);
                    t._getCustomerData()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onBeforeRendering: function () {
            this.byId("tblorder").setModel(this.jModel)
        },
        filterE: function () {
            this.getView().byId("table").filter(status, "approved")
        },
        _onRouteMatched: function (e) {
            this.getVisiblePlaceOrder();
            var t = this;
            setInterval(function () {
                t.userLogin()
            }, 3e5)
        },
        onDataReceived: function () {
            var e = this._smartTable.getTable(),
                t = 0,
                r = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = r.length; t > 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onRowItemSelection: function (e) {
            var t;
            if (e.getParameter("row")) {
                t = e.getParameter("row").getBindingContext().getObject()
            } else if (e.getParameter("rowContext")) {
                t = e.getParameter("rowContext").getObject()
            } else if (e.getSource().getBindingContext()) {
                t = e.getSource().getBindingContext().getObject()
            }
            if (t) {
                if (this.fNotification) {
                    this.fNotification.forEach(function (e) {
                        clearInterval(e)
                    });
                    this.fNotification = []
                }
                this.getRouter().navTo("sodetail", {
                    salesorder: t.ZsoNo,
                    soAppSystem: t.AoSystem
                })
            }
        },
        onBeforeRebindTable: function (e) { },
        onSimulateSubmit: function () {
            var e = "";
            var t = this;
            var r = sap.ui.getCore().byId("ID_OPEN_ORDER12");
            sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(false);
            var s = this._oSiDialog.getModel("salesorderData");
            var a = this.getView().getModel("viewProperties");
            var o;
            if (a.getData().system === "LEAN") {
                o = "L"
            } else {
                o = "T"
            }
            var i = [];
            var n = s.getData().TrustpaymatterSet;
            var l = 1;
            var d, g;
            if (n.length > 0) {
                n.forEach(function (e) {
                    if (e.ZDISCNT) {
                        d = e.ZDISCNT
                    } else {
                        d = "0"
                    }
                    if (parseInt(e.ZMIN_QTY)) {
                        g = e.ZMIN_QTY
                    } else {
                        g = "0"
                    }
                    i.push({
                        ZINTR_ORDNUM: "",
                        ZSYSTEM: o,
                        ZINTR_ITEMNUM: l.toString(),
                        ZMAT_NUM: e.ZMAT_NUM,
                        ZTRGT_QTY: e.ZTRGT_QTY,
                        ZTRGT_QTYUOM: e.UNITPC,
                        ZALT_UOM: e.UNITPC,
                        ZREQ_DLVRYDAT: t.formatDate1(e.ZREQ_DLVRYDAT),
                        ZMIN_QTY: g,
                        ZFOC_SMPL: e.ZFOC_SMPL,
                        ZORD_NUM: "",
                        ZITEM_NUM: e.ZITEM_NUM,
                        ZDISCNT: d,
                        ZCOST: e.NetQty,
                        ZGRP_DEVLPR: e.ZGRP_DEVLPR,
                        ZFROZEN_PERIOD: e.ZFROZEN_PERIOD,
                        ZPAL_QUAN: e.ZPAL_QUAN,
                        ZFOC_ITMC_FLAG: e.ZFOC_ITMC_FLAG,
                        ZSCHD_TYPE: e.ZSCHD_TYPE
                    });
                    l = l + 1
                })
            }
            var c;
            if (s.getData().Discount) {
                c = s.getData().Discount
            } else {
                c = "0"
            }
            if (!a.getData().DocID) {
                a.setProperty("/DocID", "")
            }
            var h = {
                ZORDER_HEADER: [{
                    ZINTR_ORDNUM: "",
                    ZSYSTEM: o,
                    ZORD_REF: "X",
                    ZCUST_NUM: a.getData().cusId,
                    ZSHIP_PRTY: a.getData().ShipToId,
                    ZPO_TYP: "X",
                    ZDISCNT: c,
                    ZCUST_PONUM: s.getData().CustomerPOnumber,
                    ZCUST_PODAT: a.getData().CustomerPODate,
                    ZDOC_ID: a.getProperty("/DocID"),
                    ZORD_STATUS: "SNOA",
                    ZORD_NUM: "",
                    ZAPPROVAL_STATUS: "",
                    ZLEAD_TIME: "",
                    ZMIN_ORDER_QUAN: "",
                    ZORDER_FORECAST: "",
                    ZFIT_CONTRACT_COND: "",
                    ZREQ_DELV_DAT: this.formatDate1(new Date),
                    ZTEDER_FLAG: s.getData().tenderFlag,
                    ZSALES_AREA: s.getData().salesId,
                    ZTOTAL_AMT: a.getData().ZTOTAL_AMT,
                    ZFTRADE: a.getData().ZFTRADE,
                    ZFTRADE_DESC: a.getData().ZFTRADE_DESC,
                    ZCURR: a.getData().herderCurr,
                    ZHCURR: a.getData().selectCurr,
                    ZDISTR_CHNL: a.getData().Distrchn,
                    ZDIVISION: a.getData().Division,
                    ZDEL_BLOCK_ID: a.getData().ZDEL_BLOCK_ID,
                    ZORD_APPROVAL_STATUS: "",
                    ZCOMMENTS: "",
                    ZCREATED_BY: this.getOwnerComponent().sUserId,
                    ZCHANGED_BY: ""
                }],
                ZORDER_ITEM: i
            };
            //sap.ui.core.BusyIndicator.show();
            var t = this;
            var _ = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
            $.ajax({
                url: _,
                type: "POST",
                data: JSON.stringify(h),
                dataType: "json",
                contentType: "application/json",
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
                    t.getOwnerComponent().getModel().refresh();
                    var s = e.message + " The Internal Order Number is " + e.orderID;
                    if (t.getOwnerComponent().sUserRole === "RSNO") {
                        t.onAddCM1Press(e.orderID)
                    } else {
                        u.show(s, {
                            icon: u.Icon.SUCCESS,
                            title: "SUCCESS",
                            onClose: this.onAssignClose,
                            actions: [u.Action.CLOSE],
                            styleClass: "sapUiSizeCompact myMessageBox"
                        })
                    }
                    t.onSimulateClose();
                    t._onClearOrder()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
                    u.show(e.responseJSON.message, {
                        icon: u.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [u.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onSimulatePress1:function(){
            u.confirm("Validation is complete!");
        },
        onSimulatePress: function () {
            var e = "",
                t, r = this;
            var s = this._handleValidation();
            if (!s) {
                return
            }
            var a = this.getView().byId("utpeas");
            var o = this.getView().byId("f4hCustomer");
            var n = this.getView().byId("f4hShipto");
            var l = this.getView().byId("iddiscount");
            var d = this.getView().byId("idcpono");
            var g = this.getView().byId("idcpodate");
            var c = this.getView().byId("idsystem");
            var h = this.getView().byId("idPlant");
            if (a.getSelectedKey() === "N") {
                e = "neworder"
            } else {
                e = "oldOrder"
            }
            var _ = this.getView().getModel("viewProperties");
            var D = this.getView().byId("idTenderFlag");
            if (_.getProperty("/tenderFalg") === true) {
                t = "X"
            } else {
                t = ""
            }
            var p = this.getView().byId("tblorder");
            var I = [];
            var M = p.getItems();
            var T = 1;
            var C;
            var _ = this.getView().getModel("viewProperties");
            var S = {
                order: e,
                cusId: o.getValue(),
                ShipToId: n.getValue(),
                Discount: l.getValue(),
                CustomerPOnumber: d.getValue(),
                CustomerPODate: g.getDateValue(),
                system: c.getValue(),
                ShipToAddr: _.getData().ShipToAddr,
                tenderFlag: t,
                salesId: _.getData().salesId,
                ZFTRADE: _.getData().ZFTRADE,
                ZFTRADE_DESC: _.getData().ZFTRADE_DESC
            };
            var m = new i;
            var f = sap.ui.getCore().byId("f4hCustomer") || this.getView().byId("f4hCustomer");
            var y;
            var O = S.system;
            var Z = this.getView().getModel("jsonSystemData").getData();
            for (var P = 0; P < Z.ysystemIdentification.length; P++) {
                if (Z.ysystemIdentification[P].Yydesc === "LEAN" && O === "LEAN") {
                    y = Z.ysystemIdentification[P].Yylow
                } else if (Z.ysystemIdentification[P].Yydesc === "TEMPO" && O === "TEMPO") {
                    y = Z.ysystemIdentification[P].Yylow
                }
            }
            var E = [];
            var R = [];
            var v = p.getItems();
            var N = 10;
            var w;
            var A;
            var V;
            if (v.length > 0) {
                v.forEach(function (e) {
                    if (e.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD === null) {
                        V = "0"
                    } else {
                        V = e.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD
                    }
                    if (e.getBindingContext("orderItemModel").getObject().ZFOC_ITMC_FLAG !== "X") {
                        if (e.getBindingContext("orderItemModel").getObject().ZFOC_SMPL === "YYAN") {
                            w = ""
                        } else if (e.getBindingContext("orderItemModel").getObject().ZFOC_SMPL) {
                            w = e.getBindingContext("orderItemModel").getObject().ZFOC_SMPL
                        } else {
                            w = ""
                        }
                        if (e.getBindingContext("orderItemModel").getObject().ZDISCNT) {
                            A = e.getBindingContext("orderItemModel").getObject().ZDISCNT
                        } else {
                            A = "0"
                        }
                        R.push({
                            ItmNumber: N.toString(),
                            SchedLine: "0001",
                            ReqQty: e.getBindingContext("orderItemModel").getObject().ZTRGT_QTY.toString(),
                            SchedType: ""
                        });
                        E.push({
                            ItemCateg: w,
                            ItmNumber: N.toString(),
                            Matnr: e.getBindingContext("orderItemModel").getObject().ZMAT_NUM,
                            Plant: "",
                            TargQty: e.getBindingContext("orderItemModel").getObject().ZTRGT_QTY.toString(),
                            DocType: "YOR",
                            ZMIN_ORD_QTY: e.getBindingContext("orderItemModel").getObject().ZMIN_QTY,
                            ZPAL_QUAN: e.getBindingContext("orderItemModel").getObject().ZPAL_QUAN,
                            ZTRGT_QTYUOM: e.getBindingContext("orderItemModel").getObject().ZALT_UOM,
                            ZALT_UOM: e.getBindingContext("orderItemModel").getObject().ZALT_UOM,
                            ZREQ_DLVRYDAT: r.formatDateT1Format(e.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT),
                            ZFOC_SMPL: w,
                            ZDISCNT: e.getBindingContext("orderItemModel").getObject().ZDISCNT,
                            UNITPC: e.getBindingContext("orderItemModel").getObject().UNITPC,
                            NetQty: "0",
                            ZGRP_DEVLPR: e.getBindingContext("orderItemModel").getObject().ZGRP_DEVLPR,
                            ZFROZEN_PERIOD: V,
                            CondValue: A
                        });
                        N = N + 10
                    }
                })
            }
            var U;
            if (_.getData().Discount) {
                U = _.getData().Discount
            } else {
                U = "0"
            }
            var L = {
                IvCustomer: _.getData().cusId,
                IvShipParty: _.getData().ShipToId,
                IvReqDateH: _.getData().CustomerPODate + "T00:00:00",
                IvDistchanl: _.getData().Distrchn,
                IvDivision: _.getData().Division,
                IvSalesorg: _.getData().salesId,
                IvSyssid: y,
                IvCurrency: _.getData().selectCurr,
                IvHdrCondVal: U,
                Navsosimulate: E,
                Navsosimulatescheduline: R,
                NavsosimulateReturn: [],
                NavsosimulateNetval: [],
                Navsosimulateschedlout: []
            };
            var b, B, r = this;
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").create("/ysalesordersimulationInputSet", L, {
                method: "POST",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e && e.NavsosimulateReturn && e.NavsosimulateReturn.results && e.NavsosimulateReturn.results.length) {
                        if (e.NavsosimulateReturn["results"][0].Type === "E") {
                            u.show(e.NavsosimulateReturn["results"][0].Message, {
                                icon: u.Icon.ERROR,
                                title: "Error",
                                actions: [u.Action.CLOSE],
                                styleClass: "sapUiSizeCompact myMessageBox"
                            });
                            return
                        }
                    }
                    var s = e.NavsosimulateNetval.results;
                    if (s.length > 0) {
                        s.forEach(function (e) {
                            I.push({
                                ZINTR_ORDNUM: "",
                                ZSYSTEM: c.getValue(),
                                ZINTR_ITEMNUM: T.toString(),
                                ZMAT_NUM: e.Matnr,
                                ZMATRL_DESC: e.ZMATRL_DESC,
                                ZTRGT_QTY: e.NetQty,
                                ZTRGT_QTYUOM: e.ZALT_UOM,
                                ZALT_UOM: e.ZALT_UOM,
                                ZREQ_DLVRYDAT: e.ZREQ_DLVRYDAT,
                                ZMIN_QTY: e.ZMIN_ORD_QTY,
                                ZFOC_SMPL: e.ItemCat,
                                ZORD_NUM: "",
                                ZITEM_NUM: "",
                                ZDISCNT: e.ZDISCNT,
                                UNITPC: e.ZALT_UOM,
                                NetQty: "",
                                ZGRP_DEVLPR: e.ZGRP_DEVLPR,
                                ZFROZEN_PERIOD: e.ZFROZEN_PERIOD,
                                ZSCHD_TYPE: e.SchedType,
                                ZPAL_QUAN: e.ZPAL_QUAN,
                                ZFOC_ITMC_FLAG: e.FreeCharge_Ind
                            });
                            T = T + 1
                        })
                    }
                    S.TrustpaymatterSet = I;
                    if (e && e.NavsosimulateNetval && e.NavsosimulateNetval.results && e.NavsosimulateNetval.results.length) {
                        S.HDRNETVAL = e.IVHDRNETVAL;
                        _.setProperty("/ZTOTAL_AMT", S.HDRNETVAL);
                        for (var a = 0; a < S.TrustpaymatterSet.length; a++) {
                            S.TrustpaymatterSet[a].NetQty = e.NavsosimulateNetval.results[a].ItemNetval;
                            S.TrustpaymatterSet[a].currency = e.NavsosimulateNetval.results[a].Currency;
                            S.herderCurr = S.TrustpaymatterSet[a].currency
                        }
                        _.setProperty("/herderCurr", S.herderCurr)
                    }
                    m.setData(S);
                    if (!r._oSiDialog) {
                        sap.ui.core.BusyIndicator.hide();
                        r._oSiDialog = sap.ui.xmlfragment("entrytool.fragments.orderSimulate", r);
                        r.getView().addDependent(r._oSiDialog);
                        r._oSiDialog.setModel(m, "salesorderData")
                    }
                    r._oSiDialog.open();
                    if (e.NavsosimulateReturn.results.length > 0) {
                        if (e.NavsosimulateReturn.results[0].Type === "E") {
                            B = "ERROR";
                            sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(false)
                        } else {
                            sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
                            B = "SUCCESS"
                        }
                    } else {
                        sap.ui.getCore().byId("idOrdrSimBtn").setEnabled(true);
                        B = "SUCCESS"
                    }
                    u.show(e.NavsosimulateReturn.results[0].Message, {
                        icon: u.Icon.ERROR,
                        title: B,
                        actions: [u.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    u.show(e.message + " " + e.responseText, {
                        icon: u.Icon.ERROR,
                        title: "Error",
                        actions: [u.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            if (!f.getValue()) {
                u.error("Please fill all mandatory Details", {
                    styleClass: "sapUiSizeCompact"
                })
            } else { }
        },
        soLineClose: function () {
            this._oSSOLDialog.close();
            if (this._oSSOLDialog) {
                this._oSSOLDialog = this._oSSOLDialog.destroy()
            }
        },
        onSimulateClose: function () {
            this._oSiDialog.close();
            this._oSiDialog.getModel("salesorderData").refresh();
            if (this._oSiDialog) {
                this._oSiDialog = this._oSiDialog.destroy()
            }
        },
        soLineShow: function (e) {
            var t = "20000.02";
            var r = e.getSource()._getBindingContext("salesorderData").getObject();
            var s = this._oSiDialog.getModel("salesorderData").getData();
            var a = this._oViewProperties = new i;
            a.setData(s);
            var o = this.getView().getModel("viewProperties");
            var n;
            var l = s.system;
            var d = this.getView().getModel("jsonSystemData").getData();
            for (var g = 0; g < d.length; g++) {
                if (d[g].Yydesc === "LEAN" && l === "LEAN") {
                    n = d[g].Yylow
                } else if (d[g].Yydesc === "TEMPO" && l === "TEMPO") {
                    n = d[g].Yylow
                }
            }
            var c = "datetime%27" + this.formatDateT1(r.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";
            var h;
            if (r.UNITPC) {
                h = r.UNITPC
            } else {
                h = "PC"
            }
            var _ = "/ysoschedulelinesSet(distchnl='" + o.getData().Distrchn + "',division='" + o.getData().Division + "',salesorg='" + o.getData().salesId + "',customer='" + o.getData().cusId + "',Material='" + r.ZMAT_NUM + "',Unit='" + h + "',Sysid='" + n + "',ReqDate=" + c + ",ReqQty=" + parseInt(r.ZTRGT_QTY) + ")";
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(_, {
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    var r = new i;
                    r.setData(e);
                    if (!this._oSSOLDialog) {
                        this._oSSOLDialog = sap.ui.xmlfragment("entrytool.fragments.orderSimulateSOLine", this);
                        this.getView().addDependent(this._oSSOLDialog);
                        this._oSSOLDialog.setModel(r, "ssoLineJson");
                        this._oSSOLDialog.setModel(a, "ssoLineJson1")
                    }
                    if (e.Retmsg) {
                        u.show(e.Retmsg, {
                            icon: u.Icon.ERROR,
                            title: "Error",
                            actions: [u.Action.CLOSE],
                            styleClass: "sapUiSizeCompact myMessageBox"
                        })
                    }
                    this._oSSOLDialog.open()
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    u.show(e.message, {
                        icon: u.Icon.ERROR,
                        title: "Error",
                        actions: [u.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }.bind(this)
            })
        },
        addRow: function (e) {
            this.minDate = new Date;
            this.maxDate = new Date;
            this._data.Products.push({
                ZSYSTEM: "",
                ZINTR_ITEMNUM: "",
                ZMAT_NUM: "",
                ZTRGT_QTY: "",
                ZTRGT_QTYUOM: "",
                ZALT_UOM: "",
                ZREQ_DLVRYDAT: "",
                ZFOC_SMPL: "",
                ZORD_NUM: "",
                ZITEM_NUM: "",
                ZDISCNT: "",
                ZPAL_QUAN: "",
                ZFOC_ITMC_FLAG: "",
                ZMAX_DATE: this.maxDate,
                ZMIN_DATE: this.minDate
            });
            this.jModel.refresh()
        },
        deleteRow: function (e) {
            var t = e.getSource().getBindingContext("orderItemModel").getObject();
            for (var r = 0; r < this._data.Products.length; r++) {
                if (this._data.Products[r] == t) {
                    this._data.Products.splice(r, 1);
                    this.jModel.refresh();
                    break
                }
            }
        },
        _onClearOrder: function () {
            var e = this.getView().getModel("viewProperties");
            e.setProperty("/cusId", "");
            e.setProperty("/cusName", "");
            e.setProperty("/ZINTR_ORDNUM", "");
            e.setProperty("/ShipToId", "");
            e.setProperty("/ShipToName", "");
            e.setProperty("/Discount", "");
            e.setProperty("/system", "");
            e.setProperty("/CustomerPOnumber", "");
            e.setProperty("/ShipToName", "");
            e.setProperty("/CustomerPODate", "");
            e.setProperty("/salesId", "");
            e.setProperty("/ShipToAddr", "");
            e.setProperty("/tenderFalg", false);
            e.setProperty("/selectCurr", "");
            e.setProperty("/ZFTRADE", "");
            e.setProperty("/ZFTRADE_DESC", "");
            e.setProperty("/pdfFile", "");
            this.getView().byId("idNewSelectCurr").setSelectedKey("");
            this.getView().byId("idNewSelectCurr").setValue("");
            this.clearRowItem()
        },
        clearRowItem: function () {
            this._data = {
                Products: [{
                    ZINTR_ORDNUM: "",
                    ZSYSTEM: "",
                    ZINTR_ITEMNUM: "",
                    ZMIN_ORDER_QUAN: "",
                    ZMAT_NUM: "",
                    ZTRGT_QTY: "",
                    ZTRGT_QTYUOM: "",
                    ZALT_UOM: "",
                    ZREQ_DLVRYDAT: "",
                    ZFOC_SMPL: "",
                    ZORD_NUM: "",
                    ZITEM_NUM: "",
                    ZDISCNT: "",
                    currency: "",
                    UNITPC: "",
                    matrialDesc: "",
                    ZMATRL_DESC: "",
                    NetQty: "",
                    ZMIN_QTY: "",
                    ZCOST: "",
                    ZGRP_DEVLPR: "",
                    ZFROZEN_PERIOD: "",
                    ZMAX_DATE: null,
                    ZMIN_DATE: null,
                    selectCurr: "",
                    ZPAL_QUAN: "",
                    ZFOC_ITMC_FLAG: "",
                    ItemCategorySug: []
                }]
            };
            this.jModel = new sap.ui.model.json.JSONModel;
            this.jModel.setData(this._data);
            this.getView().setModel(this.jModel, "orderItemModel")
        },
        handleDate: function (e) {
            var t = e.getSource(),
                r = t.getBindingPath("value"),
                s = new Date(t.getValue().replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3")),
                a = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd.MM.yyyy",
                    strictParsing: true
                }),
                o = t.getBindingContext("orderItemModel").sPath;
            var i = this.getView().getModel("orderItemModel").getProperty(o + "/ZMAX_DATE");
            this.dateFormat(s);
            this.dateFormat(i);
            if (s !== null) {
                s.setHours(0, 0, 0, 0)
            }
            var n = a.parse(this.getView().getModel("orderItemModel").getProperty(o + "/ZMAX_DATE"));
            if (n !== null) {
                i.setHours(0, 0, 0, 0)
            }
            if (s < i) {
                u.show("Please verify lead-time for requested delivery date not respecting frozen period", {
                    icon: u.Icon.WARNING,
                    title: "WARNING",
                    onClose: this.onAssignClose,
                    actions: [u.Action.CLOSE],
                    styleClass: "sapUiSizeCompact myMessageBox"
                })
            }
            this.getView().getModel("orderItemModel").setProperty(o + "/" + r, s);
            this.handleonValueInput(e)
        },
        handleonValueInput: function (e) {
            var t = e.getSource();
            if (t.getValue().length > 0) {
                t.setValueState("None")
            } else {
                t.setValueState("Error")
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
                var s = t;
                return s
            }
        },
        formatDateT1: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyy-MM-dd",
                    UTC: true
                });
                t = r.format(e);
                var s = t;
                return s
            }
        },
        formatDateT1Format: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyy-MM-dd",
                    UTC: false
                });
                t = r.format(e);
                var s = t + "T00:00:00";
                return s
            }
        },
        _onSaveOrder1: function(){
           
            var data =this.getView().getModel("OrderHeaderDetails").getData()
            var  x = Math.floor(Math.random() * (700 - 500)) + 500;
            data.OrderHeaderDetails.push({
                "__metadata": {
                    "type": "com.merckgroup.moet.services.odata.moet.OrderHeaderDetailsType",
                    "uri": "https://jx4aa4d355e1.hana.ondemand.com:443/com/merckgroup/moet/services/odata/moet.xsodata/OrderHeaderDetails(ZINTR_ORDNUM=460,ZSYSTEM='L',ZORD_NUM=null)"
                },
                "ZINTR_ORDNUM": x,
                "ZORD_NUM": null,
                "ZCUST_NUM": "210333226",
                "ZCUST_PONUM": "Test",
                "ZORD_STATUS": "SNOA",
                "ZORDER_STATUS_TEXT": "SNO Approval",
                "ZCREATED_BY": "Y204681"
            },)
            this.getView().getModel("OrderHeaderDetails").refresh()

            u.confirm("Order no. "+x+" is created!");
        },
        _onSaveOrder: function () {
            var e = this._handleValidation();
            if (!e) {
                return
            }
            var t = this.getView().getModel("viewProperties");
            var r = this.getView().byId("f4hCustomer"),
                s = this.getView().byId("f4hShipto"),
                a = this.getView().byId("iddiscount");
            this.getView().byId("save").setEnabled(false);
            var o = this;
            var n = "";
            var l = this.getView().byId("utpeas");
            var d = this.getView().byId("f4hCustomer");
            var g = this.getView().byId("f4hShipto");
            var c = this.getView().byId("iddiscount");
            var h = this.getView().byId("idcpono");
            var _ = this.getView().byId("idcpodate");
            var D = this.formatDate1(_.getDateValue());
            var p = this.getView().byId("idsystem"),
                I = "",
                M;
            if (p.getValue() === "TEMPO") {
                I = "T"
            } else {
                I = "L"
            }
            if (l.getSelectedKey() === "N") {
                n = "neworder"
            } else {
                n = "oldOrder"
            }
            var T = this.getView().byId("idTenderFlag");
            if (t.getProperty("/tenderFalg") === true) {
                M = "X"
            } else {
                M = ""
            }
            var C = this.getView().byId("tblorder");
            var S = [];
            var m = C.getItems();
            var f = 1;
            var y, O;
            if (m.length > 0) {
                m.forEach(function (e) {
                    if (e.getBindingContext("orderItemModel").getObject().ZDISCNT) {
                        y = e.getBindingContext("orderItemModel").getObject().ZDISCNT
                    } else {
                        y = "0"
                    }
                    if (parseInt(e.getBindingContext("orderItemModel").getObject().ZMIN_QTY)) {
                        O = e.getBindingContext("orderItemModel").getObject().ZMIN_QTY
                    } else {
                        O = "0"
                    }
                    S.push({
                        ZINTR_ORDNUM: "",
                        ZSYSTEM: I,
                        ZINTR_ITEMNUM: f.toString(),
                        ZMAT_NUM: e.getBindingContext("orderItemModel").getObject().ZMAT_NUM,
                        ZTRGT_QTY: e.getBindingContext("orderItemModel").getObject().ZTRGT_QTY,
                        ZTRGT_QTYUOM: e.getBindingContext("orderItemModel").getObject().ZALT_UOM,
                        ZALT_UOM: e.getBindingContext("orderItemModel").getObject().ZALT_UOM,
                        ZREQ_DLVRYDAT: o.formatDate1(e.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT),
                        ZMIN_QTY: O,
                        ZFOC_SMPL: e.getBindingContext("orderItemModel").getObject().ZFOC_SMPL,
                        ZORD_NUM: "",
                        ZITEM_NUM: "",
                        ZDISCNT: y,
                        ZCOST: "",
                        ZGRP_DEVLPR: e.getBindingContext("orderItemModel").getObject().ZGRP_DEVLPR,
                        ZFROZEN_PERIOD: e.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD,
                        ZPAL_QUAN: e.getBindingContext("orderItemModel").getObject().ZPAL_QUAN,
                        ZFOC_ITMC_FLAG: "",
                        ZSCHD_TYPE: ""
                    });
                    f = f + 1
                })
            }
            var Z;
            if (c.getValue()) {
                Z = c.getValue()
            } else {
                Z = "0"
            }
            if (!t.getData().DocID) {
                t.setProperty("/DocID", "")
            }
            var P = {
                ZORDER_HEADER: [{
                    ZINTR_ORDNUM: "",
                    ZSYSTEM: I,
                    ZORD_REF: "X",
                    ZCUST_NUM: t.getProperty("/cusId"),
                    ZSHIP_PRTY: t.getProperty("/ShipToId"),
                    ZPO_TYP: "X",
                    ZDISCNT: Z,
                    ZCUST_PONUM: h.getValue(),
                    ZCUST_PODAT: D,
                    ZDOC_ID: t.getProperty("/DocID"),
                    ZORD_STATUS: "DRFT",
                    ZORD_NUM: "",
                    ZAPPROVAL_STATUS: "",
                    ZLEAD_TIME: "",
                    ZMIN_ORDER_QUAN: "",
                    ZORDER_FORECAST: "",
                    ZFIT_CONTRACT_COND: "",
                    ZREQ_DELV_DAT: this.formatDate1(new Date),
                    ZTEDER_FLAG: M,
                    ZSALES_AREA: t.getProperty("/salesId"),
                    ZTOTAL_AMT: "",
                    ZFTRADE: t.getData().ZFTRADE,
                    ZFTRADE_DESC: t.getData().ZFTRADE_DESC,
                    ZCURR: "",
                    ZHCURR: t.getData().selectCurr,
                    ZDISTR_CHNL: t.getData().Distrchn,
                    ZDIVISION: t.getData().Division,
                    ZDEL_BLOCK_ID: t.getData().ZDEL_BLOCK_ID,
                    ZORD_APPROVAL_STATUS: "",
                    ZCOMMENTS: "",
                    ZCREATED_BY: this.getOwnerComponent().sUserId,
                    ZCHANGED_BY: ""
                }],
                ZORDER_ITEM: S
            };
            var E = new i;
            E.setData(P);
            var o = this;
            var R = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
            //sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: R,
                type: "POST",
                data: JSON.stringify(P),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    o.getOwnerComponent().getModel().refresh();
                    sap.ui.core.BusyIndicator.hide();
                    o._onClearOrder();
                    o.getView().byId("save").setEnabled(true);
                    var r = e.message + " The Internal Order Number is " + e.orderID;
                    u.show(r, {
                        icon: u.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [u.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    o.getView().byId("save").setEnabled(true);
                    u.show(e.responseJSON.message, {
                        icon: u.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [u.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onCusAssignClose: function () {
            this._oCUADialog.close();
            if (this._oCUADialog) {
                this._oCUADialog = this._oCUADialog.destroy()
            }
        },
        onArticleValueHelpRequest: function (e) {
            var t;
            var r = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.oArticleNo) {
                this.oArticleNo = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.OrderArticleNumber", this);
                t.addDependent(this.oArticleNo)
            }
            this.oArticleNo.setModel(this.getView().getModel("CDs"));
            this.oArticleNo.open()
        },
        handleArticleSearch: function (e) {
            var t = e.getParameter("value");
            var r = new l({
                filters: [new l("ZCUST_NUM", "Contains", t.toUpperCase()), new l("ZCUSTOMER_NAME", "Contains", t.toUpperCase())],
                and: false
            });
            var s = e.getSource().getBinding("items");
            s.filter([r])
        },
        onPressArticleValueListClose: function (e) {
            if (e.getId() === "cancel") {
                return
            }
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var s = this.getView().getModel("viewProperties");
            var a = this.getView().byId("utpeas");
            this._data.Products = [{
                ZINTR_ORDNUM: "",
                ZSYSTEM: "",
                ZINTR_ITEMNUM: "",
                ZMAT_NUM: "",
                ZTRGT_QTY: "",
                ZTRGT_QTYUOM: "",
                ZALT_UOM: "",
                ZREQ_DLVRYDAT: "",
                ZFOC_SMPL: "",
                ZORD_NUM: "",
                ZITEM_NUM: "",
                ZDISCNT: "",
                ZPAL_QUAN: "",
                ZFOC_ITMC_FLAG: "",
                ItemCategorySug: []
            }];
            this.jModel.refresh();
            var o = this.getView().byId("f4hCustomer");
            s.setProperty("/salesId", "");
            s.setProperty("/ShipToId", "");
            s.setProperty("/ShipToName", "");
            s.setProperty("/ShipToAddr", "");
            s.setProperty("/DocID", "");
            s.setProperty("/FileName", "");
            s.setProperty("/pdfFile", "");
            var i = this;
            if (t && t.length) {
                var n = r.getBindingContext("CDs").getObject();
                s.setProperty("/cusId", n.ZCUST_NUM);
                s.setProperty("/cusName", n.ZCUSTOMER_NAME);
                if (a.getSelectedKey() === "") {
                    s.setProperty("/ZINTR_ORDNUM", "");
                    this.getView().byId("oordref").setEnabled(true);
                    i.getInternalOrderNumber(n.ZCUST_NUM);
                    return
                }
                if (n.ZSYSTEM === "L") {
                    s.setProperty("/system", "LEAN")
                } else {
                    s.setProperty("/system", "TEMPO")
                }
                if (o.getValue() === "") {
                    o.setValueState("Error")
                } else {
                    o.setValueState("None")
                }
                i.showSalesOffice(n);
                i.showShiptoPartyValue(n);
                i.showFtradeValue(n);
                i.showDeliveryBlock(n);
                i._getCurrencyClear();
                i.getCurrency(n.ZCUST_NUM)
            }
            e.getSource().getBinding("items").filter([])
        },
        _getCustomerData: function () {
            var e = new i,
                t = this;
            var r = this.getOwnerComponent().getModel(),
                s = this.getView().getModel("viewProperties"),
                a = this.getOwnerComponent().getModel("appJson"),
                o = "/UserCustAssignDetails",
                n;
            if (t.getOwnerComponent().sUserRole === "ADMIN") {
                n = new l("ZCENTRL_DEL_FLAG", "EQ", "");
                o = "/CustomerDetails/?$select=ZCUSTMR_NUM,ZSYSTEM,ZCUST_NUM,ZCUSTOMER_NAME"
            } else {
                n = new l({
                    filters: [new l("ZUSR_ID", "EQ", s.getProperty("/LoginID")), new l("ZCUST_STATUS", "NE", "FFDL"), new l("ZCENTRL_DEL_FLAG", "NE", "X")],
                    and: true
                })
            }
            //sap.ui.core.BusyIndicator.show();
            r.read(o, {
                filters: [n],
                success: function (r) {
                    sap.ui.core.BusyIndicator.hide();
                    e.setData(r.results);
                    t.getView().setModel(e, "custJson")
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        showDeliveryBlock: function () {
            var e = this.getView().getModel("viewProperties");
            var t = this.getOwnerComponent().getModel(),
                r = "/CustomerDetails";
            //sap.ui.core.BusyIndicator.show();
            t.read(r, {
                filters: [new l("ZCUSTMR_NUM", "EQ", e.getProperty("/cusId"))],
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    if (t.results[0].ZDEL_BLOCK_ID === null) {
                        t.results[0].ZDEL_BLOCK_ID = ""
                    }
                    if (t.results[0].ZDELIVERY_BLOCK_DESC === null) {
                        t.results[0].ZDELIVERY_BLOCK_DESC = ""
                    }
                    e.setProperty("/ZDELIVERY_BLOCK_DESC", t.results[0].ZDELIVERY_BLOCK_DESC);
                    e.setProperty("/ZDEL_BLOCK_ID", t.results[0].ZDEL_BLOCK_ID)
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        showSalesOffice: function (e) {
            var t = this;
            var r;
            var s = this.getView().byId("f4hSalesOffc");
            var a = this.getView().getModel("viewProperties");
            var o = e.ZSYSTEM;
            var n = this.getView().getModel("jsonSystemData").getData();
            for (var l = 0; l < n.length; l++) {
                if (n[l].Yydesc === "LEAN" && o === "L") {
                    r = n[l].Yylow
                } else if (n[l].Yydesc === "TEMPO" && o === "T") {
                    r = n[l].Yylow
                }
            }
            var d = "/ysaleAreaInputSet(IvCustomer='" + e.ZCUST_NUM + "',IvSyssid='" + r + "')";
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(d, {
                urlParameters: {
                    $expand: "NavsalesArea"
                },
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.NavsalesArea.results.length === 0) {
                        s.setEnabled(false);
                        s.setShowValueHelp(false);
                        return
                    }
                    if (e.NavsalesArea.results.length > 1) {
                        s.setEnabled(true);
                        s.setShowValueHelp(true);
                        var o = new i;
                        t.getView().byId("idNewSelectCurr").setEnabled(true);
                        o.setData(e.NavsalesArea.results);
                        t.getView().setModel(o, "SalesOffice")
                    } else {
                        s.setShowValueHelp(false);
                        s.setEnabled(false);
                        a.setProperty("/salesId", e.NavsalesArea.results[0].Salesorg);
                        a.setProperty("/Distrchn", e.NavsalesArea.results[0].Distrchn);
                        a.setProperty("/Division", e.NavsalesArea.results[0].Division);
                        t.showMatrialValue(e.NavsalesArea.results[0])
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.getView().byId("f4hSalesOffc").setEnabled(false)
                }.bind(this)
            })
        },
        onShipToPartyValueHelpRequest: function (e) {
            var t;
            var r = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.F4HelpShipToParty) {
                this.F4HelpShipToParty = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.OrderF4HelpShipToParty", this);
                t.addDependent(this.F4HelpShipToParty)
            }
            this.F4HelpShipToParty.setModel(this.getView().getModel("CustomerShipToPartyAssignDetails"),"shipToPartyJson")
            this.F4HelpShipToParty.open()
        },
        handleShipToSearch: function (e) {
            var t = e.getParameter("value");
            var r = new l({
                filters: [new l("ZSHIP_TO_PARTY", "Contains", t.toUpperCase()), new l("ZSHIP_TO_PARTY_DESC", "Contains", t.toUpperCase())],
                and: false
            });
            var s = e.getSource().getBinding("items");
            s.filter([r])
        },
        onPressShipToPartyValueListClose: function (e) {
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var s = this.getView().getModel("viewProperties");
            var a = this.getView().byId("f4hShipto");
            s.setProperty("/ShipToAddr", "");
            if (t && t.length) {
                var o = r.getBindingContext("shipToPartyJson").getObject();
                s.setProperty("/ShipToId", o.ZSHIP_TO_PARTY);
                s.setProperty("/ShipToName", o.ZSHIP_TO_PARTY_DESC);
                var i, n;
                if (o.ZCITY === null) {
                    i = ""
                } else {
                    i = o.ZCITY
                }
                if (o.ZPOSTAL_CODE === null) {
                    n = ""
                } else {
                    n = o.ZPOSTAL_CODE
                }
                var l = i + " " + n;
                s.setProperty("/ShipToAddr", l);
                if (a.getValue() === "") {
                    a.setValueState("Error")
                } else {
                    a.setValueState("None")
                }
            }
        },
        showShiptoPartyValue: function (e) {
            var t = this;
            var r = this.getView().byId("f4hShipto");
            var s = this.getView().getModel("viewProperties");
            var a = new i;
            var o = this.getOwnerComponent().getModel(),
                n = "/CustomerShipToPartyAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            o.read(n, {
                filters: [new l("ZCUSTMR_NUM", "EQ", s.getProperty("/cusId"))],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        r.setEnabled(false);
                        r.setShowValueHelp(false);
                        return
                    }
                    if (e.results.length > 1) {
                        r.setEnabled(true);
                        r.setShowValueHelp(true);
                        a.setData(e.results);
                        t.getView().setModel(a, "shipToPartyJson")
                    } else {
                        r.setShowValueHelp(false);
                        r.setEnabled(false);
                        s.setProperty("/ShipToId", e.results[0].ZSHIP_TO_PARTY);
                        s.setProperty("/ShipToName", e.results[0].ZSHIP_TO_PARTY_DESC);
                        var o, i;
                        if (e.results[0].ZCITY === null) {
                            o = ""
                        } else {
                            o = e.results[0].ZCITY
                        }
                        if (e.results[0].ZPOSTAL_CODE === null) {
                            i = ""
                        } else {
                            i = e.results[0].ZPOSTAL_CODE
                        }
                        var n = o + " " + i;
                        s.setProperty("/ShipToAddr", n)
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        getItemCategory1: function (e, t) {
            var r = this;
            var s = this.getView().getModel("viewProperties");
            var a = new i;
            var o = this.getOwnerComponent().getModel(),
                n = "/CustMatItemCategoryAssign";
            for (var l = 0; l < t.length; l++) {
                //sap.ui.core.BusyIndicator.show();
                var d = t[l].ZMAT_NUM;
                r._getItemCategoryCustomerMaster(o, e, d, l)
            }
        },
        _getItemCategoryCustomerMaster: function (e, t, r, s) {
            var a = new i;
            e.read("/CustMatItemCategoryAssign", {
                filters: [new l("ZCUST_NUM", "EQ", t), new l("ZMAT_NUM", "EQ", r)],
                success: function (t) {
                    if (t.results.length > 0) {
                        this.getView().getModel("orderItemModel").setProperty("/Products/" + s + "/ItemCategorySug", t.results);
                        this.getView().getModel("orderItemModel").refresh()
                    } else {
                        this._getItemCategoryMatrialMaster(e, r, s)
                    }
                }.bind(this),
                error: function (e) { }
            })
        },
        _getItemCategoryMatrialMaster: function (e, t, r) {
            var s = new i;
            var a = this.getView().getModel("viewProperties");
            var o;
            if (a.getData().system === "TEMPO") {
                o = "T"
            } else {
                o = "L"
            }
            e.read("/MatItemCategoryAssign", {
                filters: [new l("ZMAT_NUM", "EQ", t), new l("ZSYSTEM", "EQ", o)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length > 0) {
                        this.getView().getModel("orderItemModel").setProperty("/Products/" + r + "/ItemCategorySug", e.results);
                        this.getView().getModel("orderItemModel").refresh()
                    } else { }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        showMatrialValue: function (e) {
            var t = this;
            var r = this.getView().getModel("viewProperties");
            var s = new i;
            var a = this.getOwnerComponent().getModel(),
                o = "/CustomerMatAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            var n = [];
            var u = [];
            u = [new d("ZMATRL_DESC", false)];
            if (r.getProperty("/selectCurr")) {
                n = [new l("ZCUST_NUM", "EQ", r.getProperty("/cusId")), new l("ZSALES_ORG", "EQ", r.getProperty("/salesId")), new l("ZCURR", "EQ", r.getProperty("/selectCurr")), new l("ZMAT_DEL_FLAG", "NE", "X")]
            } else {
                n = [new l("ZCUST_NUM", "EQ", r.getProperty("/cusId")), new l("ZSALES_ORG", "EQ", r.getProperty("/salesId")), new l("ZCURR", "EQ", r.getProperty("/selectCurr")), new l("ZMAT_DEL_FLAG", "NE", "X")]
            }
            a.read(o, {
                filters: n,
                sorters: u,
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    s.setData(e.results);
                    t.getView().setModel(s, "MaterialJson");
                    s.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onMaterialValueHelpRequest: function (e) {
            var t;
            this._material = e.getSource();
            var r = e.getSource().getValue();
            this.curentNewOrderItemRow = e.getSource().getBindingContext("orderItemModel").getPath().split("/").pop();
            if (!t) {
                t = this.getView()
            }
            if (!this.MaterialF4Help) {
                this.MaterialF4Help = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.OrderMaterialF4Help", this);
                t.addDependent(this.MaterialF4Help)
            }
            this.MaterialF4Help.setModel(this.getView().getModel("CustomerMatAssignDetails"), "MaterialJson")
            this.MaterialF4Help.open()
        },
        handleMaterialSearch: function (e) {
            var t = e.getParameter("value");
            var r = new l({
                filters: [new l("ZMAT_NUM", "Contains", t.toUpperCase()), new l("ZMATRL_DESC", "Contains", t.toUpperCase())],
                and: false
            });
            var s = e.getSource().getBinding("items");
            s.filter([r])
        },
        onPressMaterialValueListClose: function (e) {
            var t = this;
            var r = e.getParameter("selectedContexts");
            var s = e.getParameter("selectedItem");
            var a = this.getView().getModel("viewProperties");
            var o = this.getOwnerComponent().getModel();
            var i = this.getView().getModel("orderItemModel");
            if (r && r.length) {
                var n = s.getBindingContext("MaterialJson").getObject();
                var d = this._material.getBindingContext("orderItemModel");
                var u = d.getPath();
                if (n.ZMAT_NUM) {
                    this._material.setValueState("None")
                } else {
                    this._material.setValueState("Error")
                }
                i.setProperty(u + "/ZMAT_NUM", n.ZMAT_NUM);
                var g = n.ZMAT_NUM,
                    c = "/MaterialDetails";
                this._getItemCategoryCustomerMaster(o, a.getProperty("/cusId"), n.ZMAT_NUM, this.curentNewOrderItemRow);
                this.maxDate = new Date;
                this.getPallet(a, n.ZMAT_NUM, u);
                //sap.ui.core.BusyIndicator.show();
                o.read(c, {
                    filters: [new l("Z_MATRL_NUM", "EQ", g)],
                    success: function (e) {
                        if (e.results.length) {
                            i.setProperty(u + "/ZMATRL_DESC", e.results[0].ZMATRL_DESC);
                            i.setProperty(u + "/UNITPC", e.results[0].ZBASE_UNIT_MEASURE);
                            i.setProperty(u + "/ZALT_UOM", e.results[0].ZBASE_UNIT_MEASURE);
                            i.setProperty(u + "/ZMIN_QTY", e.results[0].ZMIN_ORDER_QUAN);
                            i.setProperty(u + "/ZGRP_DEVLPR", e.results[0].ZGRP_DEVLPR);
                            i.setProperty(u + "/ZFROZEN_PERIOD", e.results[0].ZFROZEN_PERIOD);
                            t.maxDate.setMonth(t.maxDate.getMonth() + (parseInt(e.results[0]["ZFROZEN_PERIOD"]) + 1));
                            t.maxDate.setDate(1);
                            i.setProperty(u + "/ZMAX_DATE", t.maxDate)
                        }
                    },
                    error: function (e) { }
                });
                e.getSource().getBinding("items").filter([])
            }
        },
        getPallet: function (e, t, r) {
            var s;
            var a = this.getView().getModel("orderItemModel");
            var o = e.getData().system;
            var i = this.getView().getModel("jsonSystemData").getData();
            for (var n = 0; n < i.length; n++) {
                if (i[n].Yydesc === "LEAN" && o === "LEAN") {
                    s = i[n].Yylow
                } else if (i[n].Yydesc === "TEMPO" && o === "TEMPO") {
                    s = i[n].Yylow
                }
            }
            a.setProperty(r + "/ZPAL_QUAN", 1);
                    a.setProperty(r + "/ZMIN_QTY",1);
            // this.getView().byId("simulate").setEnabled(false);
            // this.getView().byId("save").setEnabled(false);
            // var l = "/yminorderInputSet(IvMaterial='" + t + "',IvSyssid='" + s + "',IvCustomer='" + e.getData().cusId + "',IvSalesorg='" + e.getData().salesId + "',IvDisbchnl='" + e.getData().Distrchn + "',IvDivision='" + e.getData().Division + "')";
            //sap.ui.core.BusyIndicator.show();
            // this.getOwnerComponent().getModel("MOETSRV").read(l, {
            //     success: function (e, t) {
            //         this.getView().byId("simulate").setEnabled(true);
            //         this.getView().byId("save").setEnabled(true);
            //         a.setProperty(r + "/ZPAL_QUAN", e.EvPalletQty);
            //         a.setProperty(r + "/ZMIN_QTY", e.EvMinOrder);
            //         sap.ui.core.BusyIndicator.hide()
            //     }.bind(this),
            //     error: function (e) {
            //         this.getView().byId("simulate").setEnabled(true);
            //         this.getView().byId("save").setEnabled(true);
            //         sap.ui.core.BusyIndicator.hide()
            //     }.bind(this)
            // })
        },
        onSalesRequest: function (e) {
            var t;
            this._material = e.getSource();
            var r = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.SalesOffcF4Help) {
                this.SalesOffcF4Help = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.OrderSalesOffcF4Help", this);
                t.addDependent(this.SalesOffcF4Help)
            }
            this.SalesOffcF4Help.open()
        },
        handleSalesOffcSearch: function (e) {
            var t = e.getParameter("value");
            var r = new l("Salesorg", "Contains", t.toUpperCase());
            var s = e.getSource().getBinding("items");
            var a = new l({
                filters: [r],
                and: false
            });
            s.filter([a])
        },
        onPressSalesOffcValueListClose: function (e) {
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var s = this.getView().getModel("viewProperties");
            var a = this.getView().byId("f4hSalesOffc");
            var o = this;
            this._getCurrencyClear();
            this._onClreaTable();
            if (t && t.length) {
                var i = r.getBindingContext("SalesOffice").getObject();
                s.setProperty("/salesId", i.Salesorg);
                s.setProperty("/Distrchn", i.Distrchn);
                s.setProperty("/Division", i.Division);
                o.showMatrialValue(i);
                if (a.getValue() === "") {
                    a.setValueState("Error")
                } else {
                    a.setValueState("None")
                }
            }
            e.getSource().getBinding("items").filter([])
        },
        _handleValidation: function () {
            var e = this.getView();
            var t = this.getView().getModel("jsonViewMod");
            var r = [e.byId("f4hCustomer"), e.byId("f4hShipto"), e.byId("idcpono"), e.byId("idcpodate")];
            var s = false;
            jQuery.each(r, function (e, t) {
                if (t.getValue()) {
                    t.setValueState("None");
                    s = true
                } else {
                    t.setValueState("Error");
                    s = false
                }
            });
            jQuery.each(r, function (e, t) {
                if (t.getValueState() === "Error") {
                    s = false
                }
            });
            if (s === true) {
                s = this.handleAmountValid()
            }
            if (!s) {
                sap.m.MessageBox.alert("Please fill all required fields")
            }
            return s
        },
        handleAmountValid: function () {
            var e = this.getView().byId("tblorder"),
                t = e.getItems(),
                r = false;
            jQuery.each(t, function (e, t) {
                var s = t.getCells();
                jQuery.each(s, function (e, t) {
                    if (e === 0 || e === 4 || e === 5) {
                        if (t.getValue().toString().length > 0) {
                            r = true;
                            t.setValueState("None")
                        } else {
                            t.setValueState("Error")
                        }
                    }
                    if (e === 4) {
                        var s = t.getValue();
                        if (t.getValue().toString().length > 0 && s !== 0) {
                            r = true;
                            t.setValueState("None")
                        } else {
                            t.setValueState("Error")
                        }
                    }
                })
            });
            jQuery.each(t, function (e, t) {
                var s = t.getCells();
                jQuery.each(s, function (e, t) {
                    if (e === 0 || e === 4 || e === 5) {
                        if (t.getValueState() === "Error") {
                            r = false
                        }
                    }
                })
            });
            return r
        },
        onChangeDiscount: function (e) {
            var t = this.getView().byId("iddiscount");
            if (t.getValue() === "") {
                t.setValueState("Error")
            } else {
                t.setValueState("None")
            }
        },
        copyRow: function () {
            var e = this.getView().byId("idsystem"),
                t = this,
                r = "",
                s;
            if (e.getValue() === "TEMPO") {
                r = "T"
            } else {
                r = "L"
            }
            var a = this.getView().byId("tblorder");
            if (!a.getSelectedItem()) {
                u.warning("Select an Item Row to Copy", {
                    styleClass: "sapUiSizeCompact"
                });
                return
            }
            var o = [];
            var i = a.getSelectedItems();
            var n = 1;
            var l;
            if (i.length > 0) {
                i.forEach(function (r) {
                    if (r.getBindingContext("orderItemModel").getObject().ZFOC_SMPL) {
                        l = r.getBindingContext("orderItemModel").getObject().ZFOC_SMPL
                    } else {
                        l = ""
                    }
                    t._data.Products.push({
                        ZINTR_ORDNUM: "",
                        ZSYSTEM: e.getValue(),
                        ZINTR_ITEMNUM: n.toString(),
                        ZMAT_NUM: r.getBindingContext("orderItemModel").getObject().ZMAT_NUM,
                        ZMATRL_DESC: r.getBindingContext("orderItemModel").getObject().ZMATRL_DESC,
                        ZTRGT_QTY: r.getBindingContext("orderItemModel").getObject().ZTRGT_QTY,
                        ZTRGT_QTYUOM: r.getBindingContext("orderItemModel").getObject().ZALT_UOM,
                        ZALT_UOM: r.getBindingContext("orderItemModel").getObject().ZALT_UOM,
                        ZREQ_DLVRYDAT: r.getBindingContext("orderItemModel").getObject().ZREQ_DLVRYDAT,
                        ZMIN_QTY: r.getBindingContext("orderItemModel").getObject().ZMIN_QTY,
                        ZFOC_SMPL: l,
                        ZFROZEN_PERIOD: r.getBindingContext("orderItemModel").getObject().ZFROZEN_PERIOD,
                        ZORD_NUM: "",
                        ZITEM_NUM: "",
                        ZDISCNT: r.getBindingContext("orderItemModel").getObject().ZDISCNT,
                        UNITPC: r.getBindingContext("orderItemModel").getObject().ZALT_UOM,
                        NetQty: "",
                        ZMAX_DATE: r.getBindingContext("orderItemModel").getObject().ZMAX_DATE,
                        ZMIN_DATE: r.getBindingContext("orderItemModel").getObject().ZMIN_DATE,
                        ZGRP_DEVLPR: r.getBindingContext("orderItemModel").getObject().ZGRP_DEVLPR,
                        ZPAL_QUAN: r.getBindingContext("orderItemModel").getObject().ZPAL_QUAN,
                        ZFOC_ITMC_FLAG: "",
                        ItemCategorySug: r.getBindingContext("orderItemModel").getObject().ItemCategorySug,
                        ZSCHD_TYPE: r.getBindingContext("orderItemModel").getObject().ZSCHD_TYPE
                    });
                    n = n + 1
                })
            }
            t.jModel.refresh()
        },
        handleChangeCPONO: function (e) {
            var t = this.byId("idcpono");
            if (t.getValue() === "") {
                t.setValueState("Error")
            } else {
                t.setValueState("None")
            }
            var r = this.getView().getModel("viewProperties");
            var s = this.getOwnerComponent().getModel(),
                a = "/OrderHeaderDetails";
            //sap.ui.core.BusyIndicator.show();
            var o = new sap.ui.model.json.JSONModel;
            var i = this;
            //sap.ui.core.BusyIndicator.show();
            s.read(a, {
                filters: [new l("ZCUST_PONUM", "EQ", t.getValue()), new l("ZORD_STATUS", "EQ", "ORCR")],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length) {
                        u.warning("Customer PO number " + e.results[0].ZINTR_ORDNUM + " already exists", {
                            styleClass: "sapUiSizeCompact"
                        });
                        return
                    } else { }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        handleCustPoDate: function (e) {
            var t = this.getView().byId("idcpodate");
            if (t.getValue() === "") {
                t.setValueState("Error")
            } else {
                t.setValueState("None")
            }
        },
        handleTargetQty: function (e) {
            var t = e.getSource();
            if (t.getValue().length > 0) {
                t.setValueState("None")
            } else {
                t.setValueState("Error")
            }
        },
        onSelectFOC: function (e) {
            var t = e.getSource();
            var r = t.getBindingPath("selectedKey"),
                s = t.getSelectedKey(),
                a = t.getBindingContext("orderItemModel").sPath;
            this.getView().getModel("orderItemModel").setProperty(a + "/" + r, s)
        },
        dateFormat: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "dd-MM-yyyy",
                    UTC: true
                });
                t = r.format(e);
                var s = t;
                return s
            }
        },
        removePrecedingZero: function (e) {
            if (e) {
                if (isNaN(e)) {
                    return e
                } else {
                    return Number(e).toString()
                }
            } else {
                return ""
            }
        },
        focSmpl: function (e) {
            if (e === "YTA1") {
                return "Free of Charge Item"
            } else if (e === "YTS1") {
                return "Sample FOC Item"
            } else {
                return "Standard Order"
            }
        },
        onSelectOrder: function (e) {
            var t = this.getView().byId("utpeas").getSelectedKey();
            var r = this.getView().getModel("viewProperties");
            if (t === "") {
                this.getView().byId("oordrefl").setVisible(true);
                this.getView().byId("oordref").setVisible(true);
                this.getView().byId("oordref").setValue("");
                r.setProperty("/pdfFile", "");
                this.getView().byId("oordref").setEnabled(false);
                r.setProperty("/cusId", "");
                r.setProperty("/cusName", "");
                r.setProperty("/ShipToId", "");
                r.setProperty("/ShipToName", "");
                r.setProperty("/Discount", "");
                r.setProperty("/system", "");
                r.setProperty("/CustomerPOnumber", "");
                r.setProperty("/ShipToName", "");
                r.setProperty("/CustomerPODate", "");
                r.setProperty("/salesId", "");
                r.setProperty("/ShipToAddr", "");
                r.setProperty("/tenderFalg", false);
                r.setProperty("/ZFTRADE_DESC", "");
                this.clearRowItem()
            } else {
                this.getView().byId("oordrefl").setVisible(false);
                this.getView().byId("oordref").setVisible(false);
                this.getView().byId("oordref").setValue("");
                r.setProperty("/ZINTR_ORDNUM", "");
                r.setProperty("/cusId", "");
                r.setProperty("/cusName", "");
                r.setProperty("/ShipToId", "");
                r.setProperty("/ShipToName", "");
                r.setProperty("/Discount", "");
                r.setProperty("/system", "");
                r.setProperty("/CustomerPOnumber", "");
                r.setProperty("/ShipToName", "");
                r.setProperty("/CustomerPODate", "");
                r.setProperty("/salesId", "");
                r.setProperty("/ShipToAddr", "");
                r.setProperty("/tenderFalg", false);
                r.setProperty("/pdfFile", "");
                r.setProperty("/ZFTRADE_DESC", "");
                this.clearRowItem()
            }
        },
        _PoFormatDate: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "dd-MM-yyyy",
                    UTC: true
                });
                t = r.format(e);
                var s = t;
                return s
            }
        },
        handleChangeNo: function (e) {
            var t = this.byId("oordref").getValue();
            var r = this.getView().getModel("viewProperties");
            var s = this.getOwnerComponent().getModel(),
                a = t,
                o = "/OrderHeaderDetails";
            //sap.ui.core.BusyIndicator.show();
            var i = new sap.ui.model.json.JSONModel;
            var n = new sap.ui.model.json.JSONModel;
            var d = this;
            s.read(o, {
                filters: [new l("ZINTR_ORDNUM", "EQ", a)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length) {
                        i.setData(e.results[0]);
                        r.setProperty("/ZINTR_ORDNUM", e.results[0].ZINTR_ORDNUM);
                        r.setProperty("/cusId", e.results[0].ZCUST_NUM);
                        r.setProperty("/cusName", e.results[0].ZCUSTOMER_NAME);
                        r.setProperty("/ShipToId", e.results[0].ZSHIP_PRTY);
                        r.setProperty("/ShipToName", e.results[0].ZSHIP_TO_PARTY_DESC);
                        r.setProperty("/Discount", e.results[0].ZDISCNT);
                        r.setProperty("/salesId", e.results[0].ZSALES_AREA);
                        r.setProperty("/ZFOC_SMPL", e.results[0].ZFOC_SMPL);
                        r.setProperty("/CustomerPOnumber", "");
                        r.setProperty("/CustomerPODate", "");
                        if (e.results[0].ZSYSTEM === "L") {
                            r.setProperty("/system", "LEAN")
                        } else {
                            r.setProperty("/system", "TEMPO")
                        }
                        r.setProperty("/ZFTRADE_DESC", e.results[0].ZFTRADE_DESC);
                        r.setProperty("/ZFTRADE", e.results[0].ZFTRADE);
                        r.setProperty("/Distrchn", e.results[0].ZDISTR_CHNL);
                        r.setProperty("/Division", e.results[0].ZDIVISION);
                        r.setProperty("/ZDEL_BLOCK_ID", e.results[0].ZDEL_BLOCK_ID);
                        d.getView().byId("idNewSelectCurr").setSelectedKey(e.results[0].ZHCURR);
                        d.getView().byId("idNewSelectCurr").setValue(e.results[0].ZHCURR);
                        d.getCurrency(e.results[0].ZCUST_NUM);
                        if (e.results[0].ZTEDER_FLAG === "X") {
                            r.setProperty("/tenderFalg", true)
                        } else {
                            r.setProperty("/tenderFalg", false)
                        }
                        d._getShipToValue(e.results[0], e.results[0].ZSHIP_PRTY);
                        d._getSalesAreaValue(e.results[0], e.results[0].ZSALES_AREA);
                        d._getShowFtradeValue(e.results[0], e.results[0].ZFTRADE);
                        d.showDeliveryBlock(e.results[0])
                    } else {
                        u.warning("Order Number doesn't exists", {
                            styleClass: "sapUiSizeCompact"
                        });
                        d._onClearOrder();
                        return
                    }
                    var s = d.getOwnerComponent().getModel(),
                        a = t,
                        o = "/OrderItemDetails";
                    //sap.ui.core.BusyIndicator.show();
                    s.read(o, {
                        filters: [new l("ZINTR_ORDNUM", "EQ", a)],
                        success: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            if (e.results.length > 0) {
                                for (var t = 0; t < e.results.length; t++) {
                                    d.minDate = new Date;
                                    d.maxDate = new Date;
                                    e.results[t]["ItemCategorySug"] = [];
                                    d.maxDate.setMonth(d.maxDate.getMonth() + (parseInt(e.results[t]["ZFROZEN_PERIOD"]) + 1));
                                    d.maxDate.setDate(1);
                                    e.results[t]["ZMAX_DATE"] = d.maxDate
                                }
                            }
                            d._data = {
                                Products: e.results
                            };
                            d.jModel.setData(d._data);
                            d.getView().setModel(d.jModel, "orderItemModel");
                            d.getItemCategory1(r.getProperty("/cusId"), e.results);
                            d.getView().setModel(i, "OrderData1");
                            var s = {
                                header: d.getView().getModel("OrderData1"),
                                item: d.getView().getModel("OrderData12")
                            };
                            n.setData(s)
                        },
                        error: function (e) {
                            sap.ui.core.BusyIndicator.hide()
                        }
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _getShipToValue: function (e, t) {
            var r = this.getView().getModel("viewProperties");
            var s = this.getOwnerComponent().getModel(),
                a = "/CustomerShipToPartyAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            s.read(a, {
                filters: [new l("ZCUSTMR_NUM", "EQ", e.ZCUST_NUM)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        return
                    }
                    if (e.results.length) {
                        for (var s = 0; s < e.results.length; s++) {
                            if (e.results[s].ZSHIP_TO_PARTY === t) {
                                var a, o;
                                if (e.results[s].ZCITY === "" || e.results[s].ZCITY === null) {
                                    a = ""
                                } else {
                                    a = e.results[s].ZCITY
                                }
                                if (e.results[s].ZPOSTAL_CODE === null || e.results[s].ZPOSTAL_CODE === null) {
                                    o = ""
                                } else {
                                    o = e.results[s].ZPOSTAL_CODE
                                }
                                var i = a + " " + o;
                                r.setProperty("/ShipToAddr", i)
                            }
                        }
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _getSalesAreaValue: function (e, t) {
            var r = this;
            var s;
            var a = this.getView().getModel("viewProperties");
            var o = e.ZSYSTEM;
            var i = this.getView().getModel("jsonSystemData").getData();
            for (var n = 0; n < i.length; n++) {
                if (i[n].Yydesc === "LEAN" && o === "L") {
                    s = i[n].Yylow
                } else if (i[n].Yydesc === "TEMPO" && o === "T") {
                    s = i[n].Yylow
                }
            }
            var l = "/ysaleAreaInputSet(IvCustomer='" + e.ZCUST_NUM + "',IvSyssid='" + s + "')";
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(l, {
                urlParameters: {
                    $expand: "NavsalesArea"
                },
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.NavsalesArea.results.length === 0) {
                        return
                    }
                    if (e.NavsalesArea.results.length) {
                        for (var o = 0; o < e.NavsalesArea.results.length; o++) {
                            if (e.NavsalesArea.results[o].Salesorg === t) {
                                a.setProperty("/salesId", e.NavsalesArea.results[o].Salesorg);
                                a.setProperty("/Distrchn", e.NavsalesArea.results[o].Distrchn);
                                a.setProperty("/Division", e.NavsalesArea.results[o].Division);
                                r.showMatrialValue(e.NavsalesArea.results[o])
                            }
                        }
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }.bind(this)
            })
        },
        _getMaterialValue: function (e) {
            var t = this.getOwnerComponent().getModel();
            var r = this.getView().getModel("OrderData12");
            var s = this;
            var a = "/MaterialDetails";
            //sap.ui.core.BusyIndicator.show();
            t.read(a, {
                filters: [new l("Z_MATRL_NUM", "EQ", e)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    r.setProperty("/ZMATRL_DESC", e.results[0].ZMATRL_DESC);
                    r.setProperty("/UNITPC", e.results[0].ZBASE_UNIT_MEASURE);
                    r.setProperty("/ZALT_UOM", e.results[0].ZBASE_UNIT_MEASURE);
                    r.setProperty("/ZMIN_ORDER_QUAN", e.results[0].ZMIN_ORDER_QUAN);
                    r.setProperty("/ZGRP_DEVLPR", e.results[0].ZGRP_DEVLPR);
                    r.setProperty("/ZFROZEN_PERIOD", e.results[0].ZFROZEN_PERIOD);
                    s.maxDate.setMonth(s.maxDate.getMonth() + (parseInt(e.results[0]["ZFROZEN_PERIOD"]) + 1));
                    s.maxDate.setDate(1);
                    r.setProperty("/ZMAX_DATE", s.maxDate)
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onFtradeValueHelpRequest: function (e) {
            var t;
            var r = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.F4HelpFtrade) {
                this.F4HelpFtrade = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.OrderF4HelpFtrade", this);
                t.addDependent(this.F4HelpFtrade)
            }
            this.F4HelpFtrade.open()
        },
        handlefTradeSearch: function (e) {
            var t = e.getParameter("value");
            var r = new l({
                filters: [new l("ZSHIP_TO_PARTY", "Contains", t.toUpperCase()), new l("ZNAME_1", "Contains", t.toUpperCase())],
                and: false
            });
            var s = e.getSource().getBinding("items");
            s.filter([r])
        },
        onPressfTradeValueListClose: function (e) {
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var s = this.getView().getModel("viewProperties");
            var a = this.getView().byId("f4hFtrade");
            if (t && t.length) {
                var o = r.getBindingContext("fTradeJson").getObject();
                s.setProperty("/ZFTRADE", o.ZFTRADE);
                s.setProperty("/ZFTRADE_DESC", o.ZFTRADE_DESC);
                if (a.getValue() === "") {
                    a.setValueState("Error")
                } else {
                    a.setValueState("None")
                }
            }
        },
        showFtradeValue: function (e) {
            var t = this;
            var r = this.getView().byId("f4hFtrade");
            var s = this.getView().getModel("viewProperties");
            var a = new i;
            var o = this.getOwnerComponent().getModel(),
                n = "/CustomerFTradeAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            o.read(n, {
                filters: [new l("ZCUST_NUM", "EQ", s.getProperty("/cusId"))],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        r.setValue("");
                        r.setEnabled(false);
                        r.setShowValueHelp(false);
                        return
                    }
                    if (e.results.length > 1) {
                        r.setEnabled(true);
                        r.setShowValueHelp(true);
                        a.setData(e.results);
                        t.getView().setModel(a, "fTradeJson")
                    } else {
                        r.setShowValueHelp(false);
                        r.setEnabled(false);
                        s.setProperty("/ZFTRADE", e.results[0].ZFTRADE);
                        s.setProperty("/ZFTRADE_DESC", e.results[0].ZFTRADE_DESC)
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _getShowFtradeValue: function (e, t) {
            var r = this;core
            var s = this.getView().getModel("viewProperties");
            var a = new i;
            var o = this.getOwnerComponent().getModel(),
                n = "/CustomerFTradeAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            o.read(n, {
                filters: [new l("ZCUST_NUM", "EQ", s.getProperty("/cusId"))],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        return
                    }
                    if (e.results.length) {
                        for (var o = 0; o < e.results.length; o++) {
                            if (e.results[o].ZFTRADE === t) {
                                s.setProperty("/ZFTRADE", e.results[0].ZFTRADE);
                                s.setProperty("/ZFTRADE_DESC", e.results[0].ZFTRADE_DESC)
                            }
                        }
                        a.setData(e.results);
                        r.getView().setModel(a, "fTradeJson")
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onAddCM1Press: function (e) {
            var t;
            var r = this.getOwnerComponent().getModel(),
                s = "/OrderHeaderDetails";
            //sap.ui.core.BusyIndicator.show();
            var a = new sap.ui.model.json.JSONModel;
            var o = new sap.ui.model.json.JSONModel;
            var i = this;
            var n = {};
            r.read(s, {
                filters: [new l("ZINTR_ORDNUM", "EQ", e)],
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    a.setData(t.results[0]);
                    n = t.results;
                    var r = i.getOwnerComponent().getModel(),
                        s = "/OrderItemDetails";
                    //sap.ui.core.BusyIndicator.show();
                    i._getShipToValue(t.results[0], t.results[0].ZSHIP_PRTY);
                    var d = new sap.ui.model.json.JSONModel;
                    r.read(s, {
                        filters: [new l("ZINTR_ORDNUM", "EQ", e)],
                        success: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            d.setData(e.results);
                            i.getView().setModel(d, "OrderData12");
                            i.getView().setModel(a, "OrderData1");
                            var t = {
                                header: i.getView().getModel("OrderData1"),
                                item: i.getView().getModel("OrderData12")
                            };
                            o.setData(t);
                            if (!i._oCM1iDialog) {
                                i._oCM1iDialog = sap.ui.xmlfragment("entrytool.fragments.orderApprove", i);
                                i.getView().addDependent(i._oCM1iDialog);
                                i._oCM1iDialog.setModel(a, "OrderData1");
                                i._oCM1iDialog.setModel(o, "OrderDataF")
                            }
                            i._oCM1iDialog.open()
                        },
                        error: function (e) {
                            sap.ui.core.BusyIndicator.hide()
                        }
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onAddCM1Close: function () {
            this._oCM1iDialog.close();
            this._oCM1iDialog.getModel("OrderData1").refresh();
            this._oCM1iDialog.getModel("OrderDataF").refresh();
            if (this._oCM1iDialog) {
                this._oCM1iDialog = this._oCM1iDialog.destroy()
            }
        },
        onSelectTenderFlag: function (e) {
            var t = this.getView().getModel("viewProperties");
            if (e.getSource().getState() === true) {
                t.setProperty("/tenderFalg", true)
            } else {
                t.setProperty("/tenderFalg", false)
            }
        },
        onCurrencyChange: function (e) {
            var t = this.getView().getModel("viewProperties");
            this._onClreaTable();
            t.setProperty("/selectCurr", e.getSource().getSelectedKey());
            this.showMatrialValue(e.getSource().getSelectedKey())
        },
        _onClreaTable: function () {
            this._data = {
                Products: [{
                    ZINTR_ORDNUM: "",
                    ZSYSTEM: "",
                    ZINTR_ITEMNUM: "",
                    ZMIN_ORDER_QUAN: "",
                    ZMAT_NUM: "",
                    ZTRGT_QTY: "",
                    ZTRGT_QTYUOM: "",
                    ZALT_UOM: "",
                    ZREQ_DLVRYDAT: "",
                    ZFOC_SMPL: "",
                    ZORD_NUM: "",
                    ZITEM_NUM: "",
                    ZDISCNT: "",
                    currency: "",
                    UNITPC: "",
                    matrialDesc: "",
                    ZMATRL_DESC: "",
                    ZMAX_DATE: null,
                    ZMIN_DATE: null,
                    NetQty: "",
                    ZMIN_QTY: "",
                    ZCOST: "",
                    ZGRP_DEVLPR: "",
                    ZFROZEN_PERIOD: "",
                    selectCurr: "",
                    ZPAL_QUAN: "",
                    ZFOC_ITMC_FLAG: "",
                    ItemCategorySug: []
                }]
            };
            
            
            this.jModel.setData(this._data);
            this.getView().setModel(this.jModel, "orderItemModel")
        },
        getCurrency: function (e) {
            var t = new sap.ui.model.json.JSONModel,
                r = this.getOwnerComponent().getModel(),
                s = "/CurrencyParam(P_CUST_NUM='" + e + "')/Results";
            //sap.ui.core.BusyIndicator.show();
            r.read(s, {
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(e.results);
                    t.setSizeLimit(e.results.length);
                    this.getView().setModel(t, "currencyJson");
                    if (e.results.length > 0) {
                        this.getView().byId("idNewSelectCurr").setEnabled(true)
                    } else {
                        this.getView().byId("idNewSelectCurr").setEnabled(false)
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _getCurrencyClear: function () {
            var e = this.getView().getModel("viewProperties");
            e.setProperty("/selectCurr", "");
            this.getView().byId("idNewSelectCurr").setValue("")
        },
        pressAddAttachment: function (e) {
            this.oAttachData = e.getSource();
            if (!this.oAttachment) {
                this.oAttachment = sap.ui.xmlfragment("entrytool.fragments.Attachment", this);
                this.getView().addDependent(this.oAttachment)
            }
            var t = this.oAttachData.getBindingContext().getObject(),
                r, s, a, o, i = this.oAttachData.getCustomData()[0].getKey(),
                n = this.oAttachData.getCustomData()[0].getValue(),
                l = this.getView().getModel("RFileModel"),
                d = l.getProperty("/Links"),
                u = d.filter(function (e) {
                    return e.Type == i
                }),
                g = this._oResource.getText("SPEC_DOCUMENT_DIALOG_TITLE", [u[0].Desp, t.NAME]);
            l.setProperty("/SpecTitle", g);
            a = t[n];
            if (a) {
                r = a.split("_BRM_")[0];
                s = a.split("_BRM_")[1]
            } else {
                t[n] = ""
            }
            if (r && s) {
                o = {
                    Country: t.COUNTRY,
                    ComponentType: i,
                    documentId: r,
                    fileName: s,
                    url: "/BRMA_CMIS/brmacmis/download?docId=" + r,
                    attributes: [{
                        title: this._oResource.getText("UPLOADED_BY"),
                        text: t.CREATED_BY
                    }, {
                        title: this._oResource.getText("UPLOADED_ON"),
                        text: t.CREATED_ON
                    }]
                };
                l.setProperty("/attachments", [o])
            } else {
                l.setProperty("/attachments", [])
            }
            this.oAttachment.open();
            l.setProperty("/AttachmentTitle", this.getAttachmentTitleText())
        },
        getAttachmentTitleText: function () {
            var e = this.getView().getModel("RFileModel"),
                t = e.getProperty("/attachments"),
                r = this._oResource.getText("SPEC_DOCUMENT_UPLOAD_TITLE", [t.length]);
            if (t.length > 0) {
                e.setProperty("/Local/showUpload", false)
            } else {
                e.setProperty("/Local/showUpload", true)
            }
            return r
        },
        onAttachmentChange: function (e) {
            var t = new Date;
            var r = e.getParameter("files")[0],
                s = this,
                a = t.getTime() + "T_S" + e.getParameter("newValue");
            var o = e.getParameter("newValue");
            var i = this.getView().getModel("viewProperties");
            var n = h.uploadFile(r, a);
            //sap.ui.core.BusyIndicator.show();
            n.then(function (e) {
                sap.ui.core.BusyIndicator.hide();
                i.setProperty("/pdfFile", o);
                var t = e.docId + "_MOET_" + e.docName;
                i.setProperty("/DocID", t)
            }).catch(function (e) {
                sap.ui.core.BusyIndicator.hide();
                s._showErrorMessage(e.responseText.replace("Errorr", "Error"))
            })
        },
        onFileDeleted: function (e) {
            this._deleteItemById(e.getParameter("documentId"))
        },
        _deleteItemById: function (e) {
            var t = this.getView().getModel("RFileModel"),
                r = t.getProperty("/attachments"),
                s = this;
            return h.deleteFile(r[0].fileName, e).then(function (a) {
                var o = s.oAttachData.getBindingContext(),
                    i = o.getPath(),
                    n = s.oAttachData.getCustomData()[0].getValue();
                s.oAttachData.getModel().setProperty(i + "/" + n, "");
                jQuery.each(r, function (t) {
                    if (r[t] && r[t].documentId === e) {
                        r.splice(t, 1)
                    }
                });
                t.setProperty("/attachments", r);
                t.setProperty("/AttachmentTitle", s.getAttachmentTitleText())
            })
        },
        onInterOrderHelpRequest: function (e) {
            var t;
            if (!t) {
                t = this.getView()
            }
            if (!this.InterOrderDilg) {
                this.InterOrderDilg = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.OrderF4InternalNumber", this);
                t.addDependent(this.InterOrderDilg)
            }
            this.InterOrderDilg.setModel(this.getView().getModel("OrderHeaderDetails"),"InternalOrderJson")
            this.InterOrderDilg.open()
        },
        handleInternalOrderNumberSearch: function (e) {
            var t = e.getParameter("value");
            var r = new l({
                filters: [new l("ZINTR_ORDNUM", "EQ", t.toUpperCase()), new l("ZCUST_PONUM", "Contains", t.toUpperCase())],
                and: false
            });
            var s = e.getSource().getBinding("items");
            s.filter([r])
        },
        handleInternalOrderNumber: function (e) {
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var s = this.getView().getModel("viewProperties");
            var a = this;
            if (t && t.length) {
                var o = r.getBindingContext("InternalOrderJson").getObject();
                s.setProperty("/ZINTR_ORDNUM", o.ZINTR_ORDNUM);
                this.handleChangeNo()
            }
            e.getSource().getBinding("items").filter([])
        },
        getInternalOrderNumber: function (e) {
            var t = new sap.ui.model.json.JSONModel,
                r = this.getOwnerComponent().getModel(),
                s = "/OrderHeaderDetails";
            //sap.ui.core.BusyIndicator.show();
            r.read(s, {
                urlParameters: {
                    $select: "ZINTR_ORDNUM,ZCUST_PONUM"
                },
                filters: [new l("ZCUST_NUM", "EQ", e)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(e.results);
                    t.setSizeLimit(e.results.length);
                    this.getView().setModel(t, "InternalOrderJson")
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onClearDoc: function () {
            var e = this.getView().getModel("viewProperties");
            e.setProperty("/pdfFile", "");
            e.setProperty("/DocID", "")
        }
    })
});