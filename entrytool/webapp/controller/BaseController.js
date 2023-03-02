sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel", "sap/ui/model/odata/ODataUtils", 
    "sap/base/security/encodeURL", "sap/base/assert", "sap/ui/model/FilterProcessor", 
    "sap/ui/core/format/DateFormat", "sap/ui/core/CalendarType", 
    "entrytool/model/formatter", 
    "sap/ui/model/Filter", 
    "sap/ui/model/Sorter", "sap/m/MessageBox", 
    "../services/RepoService"
], function (e, t, r, a, s, o, i, n, l, u, g, d, D, _) {
    "use strict";
    return e.extend("entrytool.controller.BaseController", {
        custFormatter: u,
        getPropertySet: function () {
            var e = new r;
            var t = {
                visible: true
            };
            e.setData(t);
            this.getView().setModel(e, "UIState");
            this._oViewProperties = new r({
                ZAPPROVAL_STATUS: "",
                ZAPPROVAL_STATUS_1: "",
                ZCHANGED_BY: "",
                ZCHANGED_ON: null,
                ZCOMMENTS: "",
                ZCREATED_BY: "",
                ZCREATED_ON: "",
                ZCUSTOMER_NAME: "",
                ZCUST_NUM: "",
                ZCUST_PODAT: null,
                ZCUST_PONUM: "",
                ZDATE: "",
                ZDISCNT: "",
                ZDOC_ID: "",
                ZINTR_ORDNUM: "",
                ZORDER_STATUS_TEXT: "",
                ZORD_NUM: "",
                ZORD_REF: "",
                ZORD_STATUS: "",
                ZPO_TYP: "",
                ZSHIP_PRTY: "",
                ZSHIP_TO_PARTY_DESC: "",
                ZSYSTEM: "",
                ZTEDER_FLAG: false,
                ZREQ_DELV_DAT: null,
                ZSALES_AREA: "",
                LoginID: "",
                salesId: "",
                Distrchn: "",
                Division: "",
                ShipToAddr: "",
                herderCurr: "",
                HDRNETVAL: "",
                ZTOTAL_AMT: "",
                ZFTRADE: "",
                ZFTRADE_DESC: "",
                ZDELIVERY_BLOCK_DESC: "",
                ZDEL_BLOCK_ID: "",
                ZHCURR: "",
                sUserRole: true
            });
            this.getView().setModel(this._oViewProperties, "viewProperties");
            this.minDate = new Date;
            this.maxDate = new Date;
            this._data = {
                Products: [{
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
                    UNITPC: "",
                    matrialDesc: "",
                    ZMATRL_DESC: "",
                    ZMIN_ORDER_QUAN: "",
                    NetQty: "",
                    currency: "",
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
            this.jModel.setData(this._data, "OrderData12")
        },
        getApproveOrderPropertySet: function () {
            this._oViewProperties1 = new r({
                username: "",
                emailId: "",
                userid: "",
                LoginID: "",
                cusId: "",
                cusName: "",
                salesId: "",
                Distrchn: "",
                Division: "",
                ShipToId: "",
                ShipToName: "",
                ShipToAddr: "",
                Discount: "",
                IVHDRNETVAL: "",
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
                ZHCURR: "",
                comments: "",
                idlead: false,
                idmin: false,
                idchk: false,
                iddisc: false,
                idCommentsinput: "",
                ZDOC_ID: "",
                FileName: ""
            });
            this.getView().setModel(this._oViewProperties1, "viewProperties1")
        },
        getRouter: function () {
            return t.getRouterFor(this)
        },
        getModel: function (e) {
            return this.getView().getModel(e)
        },
        onSettingsPress: function () {
            if (!this._oSDialog) {
                this._oSDialog = sap.ui.xmlfragment("entrytool.fragments.settings", this);
                this.getView().addDependent(this._oSDialog)
            }
            this._oSDialog.open()
        },
        setModel: function (e, t) {
            return this.getView().setModel(e, t)
        },
        handlePressOpenNewOrderPage: function () {
            this.getRouter().navTo("NewOrder")
        },
        getBundleTextByModel: function (e, t, r) {
            return t.getResourceBundle().then(function (t) {
                return t.getText(e, r)
            })
        },
        getItemCategoryData: function (e) {
            var t = this.getOwnerComponent().getModel(),
                r = "/ItemCategory";
            t.read(r, {
                success: function (t) {
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(t.results), "ItemCategoryData");
                    if (e) {
                        e()
                    }
                }.bind(this),
                error: function (e) { 
                    console.log(e)
                }
            })
        },
        ItemCategoryConversion: function (e) {
            var t = this.getOwnerComponent().getModel("ItemCategoryData");
            if (t) {
                var r = t.getData();
                for (var a = 0; a < r.length; a++) {
                    if (r[a].ZITM_CATEGORY === e) {
                        return r[a].ZITM_CATEGORY_DESC
                    }
                }
            }
            return ""
        },
        getVisiblePlaceOrder: function () {
            var e = new r;
            var t = {
                placeVis: this.getView().getViewName() === "entrytool.view.Home" ? false : true
            };
            e.setData(t);
            this.getOwnerComponent().setModel(e, "VisiableJson");
            this.getOwnerComponent().getModel("VisiableJson").refresh()
        },
        _loadODataUtils: function () {
            var e, t, r, i = /^([-+]?)0*(\d+)(\.\d+|)$/,
                u, g = /\.$/,
                d = /0+$/;

            function D() {
                if (!e) {
                    e = n.getDateInstance({
                        pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss''",
                        calendarType: l.Gregorian
                    });
                    t = n.getDateInstance({
                        pattern: "'datetime'''yyyy-MM-dd'T'HH:mm:ss.SSS''",
                        calendarType: l.Gregorian
                    });
                    r = n.getDateInstance({
                        pattern: "'datetimeoffset'''yyyy-MM-dd'T'HH:mm:ss'Z'''",
                        calendarType: l.Gregorian
                    });
                    u = n.getTimeInstance({
                        pattern: "'time''PT'HH'H'mm'M'ss'S'''",
                        calendarType: l.Gregorian
                    })
                }
            }
            a._createFilterSegment = function (e, t, r, a, i, n, l) {
                var u, g;
                if (l === undefined) {
                    l = true
                }
                if (r) {
                    u = t._getPropertyMetadata(r, e);
                    g = u && u.type;
                    o(u, "PropertyType for property " + e + " of EntityType " + r.name + " not found!")
                }
                if (g) {
                    i = this.formatValue(i, g, l);
                    n = n !== null ? this.formatValue(n, g, l) : null
                } else {
                    o(null, "Type for filter property could not be found in metadata!")
                }
                if (i) {
                    i = s(String(i))
                }
                if (n) {
                    n = s(String(n))
                }
                if (l && g === "Edm.String") {
                    e = "toupper(" + e + ")"
                }
                switch (a) {
                    case "EQ":
                        if (e === "toupper(ZCURR)") {
                            return e + "%20" + a.toLowerCase() + "%20" + i
                        } else if (e === "ZINTR_ORDNUM") {
                            return "(" + e + "%20eq%20" + i + ")"
                        } else {
                            return "substringof(toupper(" + i + ")," + e + ")"
                        }
                    case "NE":
                    case "GT":
                    case "GE":
                    case "LT":
                    case "LE":
                        return "(" + e + ")%20" + a.toLowerCase() + "%20" + i;
                    case "BT":
                        return "(" + e + "%20ge%20" + i + "%20and%20" + e + "%20le%20" + n + ")";
                    case "NB":
                        return "not%20(" + e + "%20ge%20" + i + "%20and%20" + e + "%20le%20" + n + ")";
                    case "Contains":
                        if (e === "ZINTR_ORDNUM") {
                            return "(" + e + "%20eq%20" + i + ")"
                        } else {
                            return "substringof(toupper(" + i + ")," + e + ")"
                        }
                    case "NotContains":
                        return "not%20substringof(" + i + "," + e + ")";
                    case "StartsWith":
                        return "startswith(" + e + ",toupper(" + i + "))";
                    case "NotStartsWith":
                        return "not%20startswith(" + e + "," + i + ")";
                    case "EndsWith":
                        return "endswith(" + e + "," + i + ")";
                    case "NotEndsWith":
                        return "not%20endswith(" + e + "," + i + ")";
                    default:
                        Log.error("ODataUtils :: Unknown filter operator " + a);
                        return "true"
                }
            };
            a.formatValue = function (a, s, o) {
                var i, n;
                if (o === undefined) {
                    o = true
                }
                if (a === null || a === undefined) {
                    return "null"
                }
                D();
                switch (s) {
                    case "Edm.String":
                        a = o ? a : a.toUpperCase();
                        n = "'" + String(a).replace(/'/g, "''") + "'";
                        break;
                    case "Edm.Time":
                        if (typeof a === "object") {
                            n = u.format(new Date(a.ms), true)
                        } else {
                            n = "time'" + a + "'"
                        }
                        break;
                    case "Edm.DateTime":
                        i = a instanceof Date ? a : new Date(a);
                        if (i.getMilliseconds() > 0) {
                            n = t.format(i, true)
                        } else {
                            n = e.format(i, true)
                        }
                        break;
                    case "Edm.DateTimeOffset":
                        i = a instanceof Date ? a : new Date(a);
                        n = r.format(i, true);
                        break;
                    case "Edm.Guid":
                        n = "guid'" + a + "'";
                        break;
                    case "Edm.Decimal":
                        n = a + "m";
                        break;
                    case "Edm.Int64":
                        n = a + "l";
                        break;
                    case "Edm.Double":
                        n = a + "d";
                        break;
                    case "Edm.Float":
                    case "Edm.Single":
                        n = a + "f";
                        break;
                    case "Edm.Binary":
                        n = "binary'" + a + "'";
                        break;
                    default:
                        n = String(a);
                        break
                }
                return n
            }
        },
        getEditOrderData: function (e) {
            var t = this.getView().getModel("viewProperties");
            var r = this.getOwnerComponent().getModel(),
                a = e.ZINTR_ORDNUM,
                s = "/OrderHeaderDetails";
            // //sap.ui.core.BusyIndicator.show();
            var o = new sap.ui.model.json.JSONModel;
            var i = new sap.ui.model.json.JSONModel;
            var n = this;
            r.read(s, {
                filters: [new g("ZINTR_ORDNUM", "EQ", a)],
                success: function (r) {
                    sap.ui.core.BusyIndicator.hide();
                    o.setData(r.results[0]);
                    t.setProperty("/ZCREATED_BY", r.results[0].ZCREATED_BY);
                    t.setProperty("/ZINTR_ORDNUM", r.results[0].ZINTR_ORDNUM);
                    t.setProperty("/ZCUST_NUM", r.results[0].ZCUST_NUM);
                    t.setProperty("/ZCUSTOMER_NAME", r.results[0].ZCUSTOMER_NAME);
                    t.setProperty("/ZSHIP_PRTY", r.results[0].ZSHIP_PRTY);
                    t.setProperty("/ZDISCNT", r.results[0].ZDISCNT);
                    t.setProperty("/ZSYSTEM", r.results[0].ZSYSTEM);
                    t.setProperty("/ZCUST_PONUM", r.results[0].ZCUST_PONUM);
                    t.setProperty("/ZSHIP_TO_PARTY_DESC", r.results[0].ZSHIP_TO_PARTY_DESC);
                    t.setProperty("/ZCUST_PODAT", r.results[0].ZCUST_PODAT);
                    t.setProperty("/ZTEDER_FLAG", r.results[0].ZTEDER_FLAG);
                    t.setProperty("/ZSALES_AREA", r.results[0].ZSALES_AREA);
                    t.setProperty("/ZFTRADE", r.results[0].ZFTRADE);
                    t.setProperty("/ZFTRADE_DESC", r.results[0].ZFTRADE_DESC);
                    t.setProperty("/Distrchn", r.results[0].ZDISTR_CHNL);
                    t.setProperty("/Division", r.results[0].ZDIVISION);
                    t.setProperty("/ZDEL_BLOCK_ID", r.results[0].ZDEL_BLOCK_ID);
                    t.setProperty("/ZHCURR", r.results[0].ZHCURR);
                    t.setProperty("/ZDOC_ID", r.results[0].ZDOC_ID);
                    var a = t.getProperty("/ZDOC_ID"),
                        s, l;
                    var u = n.getView().getModel("UIState");
                    var d = u.getData();
                    if (a) {
                        l = a.split("_MOET_")[0];
                        s = a.split("T_S")[1];
                        t.setProperty("/FileName", s);
                        d.visible = true;
                        u.setData(d)
                    } else {
                        d.visible = false;
                        u.setData(d)
                    }
                    n.getCurrency(r.results[0].ZCUST_NUM);
                    if (r.results[0].ZTEDER_FLAG === "X") {
                        t.setProperty("/ZTEDER_FLAG", true)
                    } else {
                        t.setProperty("/ZTEDER_FLAG", false)
                    }
                    n._getShipToValue(r.results[0], r.results[0].ZSHIP_PRTY);
                    n._getSalesAreaValue(r.results[0], r.results[0].ZSALES_AREA);
                    n._getShowFtradeValue(r.results[0], r.results[0].ZFTRADE);
                    n.showDeliveryBlock(r.results[0]);
                    var D = n.getOwnerComponent().getModel(),
                        _ = e.ZINTR_ORDNUM,
                        T = "/OrderItemDetails";
                    // //sap.ui.core.BusyIndicator.show();
                    var c = new sap.ui.model.json.JSONModel;
                    D.read(T, {
                        filters: [new g("ZINTR_ORDNUM", "EQ", _)],
                        success: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            if (e.results.length > 0) {
                                for (var r = 0; r < e.results.length; r++) {
                                    e.results[r]["ItemCategorySug"] = [];
                                    n.minDate = new Date;
                                    n.maxDate = new Date;
                                    n.maxDate.setMonth(n.maxDate.getMonth() + (parseInt(e.results[r]["ZFROZEN_PERIOD"]) + 1));
                                    n.maxDate.setDate(1);
                                    e.results[r]["ZMAX_DATE"] = n.maxDate
                                }
                            }
                            n._data = {
                                Products: e.results
                            };
                            n.jModel.setData(n._data);
                            n.getView().setModel(n.jModel, "OrderData12");
                            n.getItemCategory1(t.getProperty("/ZCUST_NUM"), e.results);
                            n.getView().setModel(o, "OrderData1");
                            var a = {
                                header: n.getView().getModel("OrderData1"),
                                item: n.getView().getModel("OrderData12")
                            };
                            i.setData(a);
                            n.onUpdateClose();
                            n.onClearDoc();
                            if (!n._editSalesorderDialog) {
                                n._editSalesorderDialog = sap.ui.xmlfragment("entrytool.fragments.editOrder", n);
                                n.getView().addDependent(n._editSalesorderDialog);
                                n._editSalesorderDialog.setModel(o, "OrderData1");
                                n._editSalesorderDialog.setModel(i, "OrderDataF")
                            }
                            n._editSalesorderDialog.open()
                        },
                        error: function (e) {
                            sap.ui.core.BusyIndicator.hide()
                        }
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    D.show(JSON.parse(e.responseText).error.message.value, {
                        icon: D.Icon.ERROR,
                        title: "Error",
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        _getSystem: function () {
            var e = this.getView().getModel("viewProperties");
            var t = new r;
            var a = this.getOwnerComponent().getModel(),
                s = this,
                o = "/ysystemIdentificationSet";
            // //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(o, {
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(e.results);
                    s.getView().setModel(t, "jsonSystemData")
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }.bind(this)
            })
        },
        _getShipToValue: function (e, t) {
            var a = this.getView().getModel("viewProperties");
            var s = new r;
            var o = this.getOwnerComponent().getModel(),
                i = this,
                n = "/CustomerShipToPartyAssignDetails";
            // //sap.ui.core.BusyIndicator.show();
            o.read(n, {
                filters: [new g("ZCUSTMR_NUM", "EQ", e.ZCUST_NUM)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        return
                    }
                    if (e.results.length) {
                        for (var r = 0; r < e.results.length; r++) {
                            if (e.results[r].ZSHIP_TO_PARTY === t) {
                                var o, n;
                                if (e.results[r].ZCITY === "" || e.results[r].ZCITY === null) {
                                    o = ""
                                } else {
                                    o = e.results[r].ZCITY
                                }
                                if (e.results[r].ZPOSTAL_CODE === null || e.results[r].ZPOSTAL_CODE === null) {
                                    n = ""
                                } else {
                                    n = e.results[r].ZPOSTAL_CODE
                                }
                                var l = o + " " + n;
                                a.setProperty("/ShipToAddr", l)
                            }
                        }
                        s.setData(e.results);
                        i.getView().setModel(s, "shipToPartyJson")
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _getSalesAreaValue: function (e, t) {
            var a = this;
            var s;
            var o = this.getView().getModel("viewProperties");
            var i = e.ZSYSTEM;
            var n = this.getView().getModel("jsonSystemData").getData();
            for (var l = 0; l < n.length; l++) {
                if (n[l].Yydesc === "LEAN" && i === "L") {
                    s = n[l].Yylow
                } else if (n[l].Yydesc === "TEMPO" && i === "T") {
                    s = n[l].Yylow
                }
            }
            var u = "/ysaleAreaInputSet(IvCustomer='" + e.ZCUST_NUM + "',IvSyssid='" + s + "')";
            // //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(u, {
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
                                a.showMatrialValue(e.NavsalesArea.results[o])
                            }
                        }
                        var i = new r;
                        i.setData(e.NavsalesArea.results);
                        a.getView().setModel(i, "SalesOffice")
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }.bind(this)
            })
        },
        showDeliveryBlock: function () {
            var e = this.getView().getModel("viewProperties");
            var t = this.getOwnerComponent().getModel(),
                r = "/CustomerDetails";
            // //sap.ui.core.BusyIndicator.show();
            t.read(r, {
                filters: [new g("ZCUSTMR_NUM", "EQ", e.getProperty("/ZCUST_NUM"))],
                success: function (t) {
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
        showMatrialValue: function (e) {
            var t = this;
            var a;
            var s = this.getView().getModel("viewProperties");
            var o = new r;
            var i = this.getOwnerComponent().getModel(),
                n = "/CustomerMatAssignDetails";
            var l = [];
            if (s.getProperty("/ZHCURR")) {
                l = [new g("ZCUST_NUM", "EQ", s.getProperty("/ZCUST_NUM")), new g("ZSALES_ORG", "EQ", s.getProperty("/ZSALES_AREA")), new g("ZCURR", "EQ", s.getProperty("/ZHCURR")), new g("ZMAT_DEL_FLAG", "NE", "X")]
            } else {
                l = [new g("ZCUST_NUM", "EQ", s.getProperty("/ZCUST_NUM")), new g("ZSALES_ORG", "EQ", s.getProperty("/ZSALES_AREA")), new g("ZCURR", "EQ", s.getProperty("/ZHCURR")), new g("ZMAT_DEL_FLAG", "NE", "X")]
            }
            // //sap.ui.core.BusyIndicator.show();
            i.read(n, {
                filters: l,
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    o.setData(e.results);
                    t.getView().setModel(o, "MaterialJson");
                    o.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
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
            this.oArticleNo.open()
        },
        handleArticleSearch: function (e) {
            var t = e.getParameter("value");
            var r = new g({
                filters: [new g("ZCUST_NUM", "Contains", t.toUpperCase()), new g("ZCUSTOMER_NAME", "Contains", t.toUpperCase())],
                and: false
            });
            var a = e.getSource().getBinding("items");
            a.filter([r])
        },
        onPressArticleValueListClose: function (e) {
            if (e.getId() === "cancel") {
                return
            }
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var a = this.getView().getModel("viewProperties");
            if (t && t.length) {
                var s = r.getBindingContext("custJson").getObject();
                if (a.getProperty("/ZSYSTEM") !== s.ZSYSTEM) {
                    D.warning("Please select same customer system", {
                        styleClass: "sapUiSizeCompact"
                    });
                    return
                }
            }
            a.setProperty("/enableCurrField", false);
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
                ZGRP_DEVLPR: "",
                ZPAL_QUAN: "",
                ZFOC_ITMC_FLAG: "",
                ItemCategorySug: []
            }];
            this.jModel.refresh();
            a.setProperty("/ZCUSTOMER_NAME", "");
            a.setProperty("/ZCUST_NUM", "");
            a.setProperty("/ZSALES_AREA", "");
            a.setProperty("/ZSHIP_PRTY", "");
            a.setProperty("/ZSHIP_TO_PARTY_DESC", "");
            a.setProperty("/ShipToAddr", "");
            a.setProperty("/pdfFile", "");
            a.setProperty("/ZDOC_ID", "");
            a.setProperty("/FileName", "");
            a.setProperty("/ZFTRADE", "");
            a.setProperty("/ZFTRADE_DESC", "");
            var o = this;
            if (t && t.length) {
                a.setProperty("/ZCUST_NUM", s.ZCUST_NUM);
                a.setProperty("/ZCUSTOMER_NAME", s.ZCUSTOMER_NAME);
                if (s.ZSYSTEM === "L") {
                    a.setProperty("/ZSYSTEM", s.ZSYSTEM)
                } else {
                    a.setProperty("/ZSYSTEM", s.ZSYSTEM)
                }
                o._getCurrencyClear();
                o.getCurrency(s.ZCUST_NUM);
                o.showSalesOffice(s);
                o.showShiptoPartyValue(s);
                o.showFtradeValue(s);
                o.showDeliveryBlock(s)
            }
        },
        _getCurrencyClear: function () {
            var e = this.getView().getModel("viewProperties");
            e.setProperty("/ZHCURR", "")
        },
        getCurrency: function (e) {
            var t = new sap.ui.model.json.JSONModel,
                r = this.getOwnerComponent().getModel(),
                a = "/CurrencyParam(P_CUST_NUM='" + e + "')/Results";
            // //sap.ui.core.BusyIndicator.show();
            r.read(a, {
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(e.results);
                    t.setSizeLimit(e.results.length);
                    this.getView().setModel(t, "currencyJson")
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        showSalesOffice: function (e) {
            var t = this;
            var a;
            var s = sap.ui.getCore().byId("f4hSalesOffc");
            var o = this.getView().getModel("viewProperties");
            var i = e.ZSYSTEM;
            var n = this.getView().getModel("jsonSystemData").getData();
            for (var l = 0; l < n.length; l++) {
                if (n[l].Yydesc === "LEAN" && i === "L") {
                    a = n[l].Yylow
                } else if (n[l].Yydesc === "TEMPO" && i === "T") {
                    a = n[l].Yylow
                }
            }
            var u = "/ysaleAreaInputSet(IvCustomer='" + e.ZCUST_NUM + "',IvSyssid='" + a + "')";
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(u, {
                urlParameters: {
                    $expand: "NavsalesArea"
                },
                success: function (e, a) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.NavsalesArea.results.length === 0) {
                        s.setEnabled(false);
                        s.setShowValueHelp(false);
                        o.setProperty("/enableCurrField", false);
                        return
                    }
                    if (e.NavsalesArea.results.length > 1) {
                        s.setEnabled(true);
                        s.setShowValueHelp(true);
                        var i = new r;
                        i.setData(e.NavsalesArea.results);
                        t.getView().setModel(i, "SalesOffice")
                    } else {
                        s.setShowValueHelp(false);
                        s.setEnabled(false);
                        sap.ui.getCore().byId("idNewSelectCurrEdit").setEnabled(true);
                        o.setProperty("/ZSALES_AREA", e.NavsalesArea.results[0].Salesorg);
                        o.setProperty("/Distrchn", e.NavsalesArea.results[0].Distrchn);
                        o.setProperty("/Division", e.NavsalesArea.results[0].Division);
                        t.showMatrialValue(e.NavsalesArea.results[0])
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.getView().byId("f4hSalesOffc").setEnabled(false)
                }.bind(this)
            })
        },
        showShiptoPartyValue: function (e) {
            var t = this;
            var a;
            var s = sap.ui.getCore().byId("f4hShipto");
            var o = this.getView().getModel("viewProperties");
            var i = new r;
            var n = this.getOwnerComponent().getModel(),
                l = "/CustomerShipToPartyAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            n.read(l, {
                filters: [new g("ZCUSTMR_NUM", "EQ", o.getProperty("/ZCUST_NUM"))],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        s.setEnabled(false);
                        s.setShowValueHelp(false);
                        return
                    }
                    if (e.results.length > 1) {
                        s.setEnabled(true);
                        s.setShowValueHelp(true);
                        i.setData(e.results);
                        t.getView().setModel(i, "shipToPartyJson")
                    } else {
                        s.setShowValueHelp(false);
                        s.setEnabled(false);
                        var r = e.results[0].ZPOSTAL_CODE + " " + e.results[0].ZCITY;
                        o.setProperty("/ZSHIP_PRTY", e.results[0].ZSHIP_TO_PARTY);
                        o.setProperty("/ZSHIP_TO_PARTY_DESC", e.results[0].ZSHIP_TO_PARTY_DESC);
                        o.setProperty("/ShipToAddr", r)
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        showFtradeValue: function (e) {
            var t = this;
            var a = sap.ui.getCore().byId("f4hFtrade");
            var s = this.getView().getModel("viewProperties");
            var o = new r;
            var i = this.getOwnerComponent().getModel(),
                n = "/CustomerFTradeAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            i.read(n, {
                filters: [new g("ZCUST_NUM", "EQ", s.getProperty("/ZCUST_NUM"))],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        a.setValue("");
                        a.setEnabled(false);
                        a.setShowValueHelp(false);
                        return
                    }
                    if (e.results.length > 1) {
                        a.setEnabled(true);
                        a.setShowValueHelp(true);
                        o.setData(e.results);
                        t.getView().setModel(o, "fTradeJson")
                    } else {
                        a.setShowValueHelp(false);
                        a.setEnabled(false);
                        s.setProperty("/ZFTRADE", e.results[0].ZFTRADE);
                        s.setProperty("/ZFTRADE_DESC", e.results[0].ZFTRADE_DESC)
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
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
            var r = new g("Salesorg", "Contains", t.toUpperCase());
            var a = e.getSource().getBinding("items");
            var s = new g({
                filters: [r],
                and: false
            });
            a.filter([s])
        },
        onPressSalesOffcValueListClose: function (e) {
            if (e.getId() === "cancel") {
                return
            }
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var a = this.getView().getModel("viewProperties");
            this._getCurrencyClear();
            var s = this;
            if (t && t.length) {
                var o = r.getBindingContext("SalesOffice").getObject();
                a.setProperty("/ZSALES_AREA", o.Salesorg);
                a.setProperty("/Distrchn", o.Distrchn);
                a.setProperty("/Division", o.Division);
                a.setProperty("/enableCurrField", true);
                s.showMatrialValue(o)
            }
            e.getSource().getBinding("items").filter([])
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
            this.F4HelpShipToParty.open()
        },
        handleShipToSearch: function (e) {
            var t = e.getParameter("value");
            var r = new g({
                filters: [new g("ZSHIP_TO_PARTY", "Contains", t.toUpperCase()), new g("ZNAME_1", "Contains", t.toUpperCase())],
                and: false
            });
            var a = e.getSource().getBinding("items");
            a.filter([r])
        },
        onPressShipToPartyValueListClose: function (e) {
            if (e.getId() !== "cancel") {
                var t = e.getParameter("selectedContexts");
                var r = e.getParameter("selectedItem");
                var a = this.getView().getModel("viewProperties");
                a.setProperty("/ShipToAddr", "");
                var s = this;
                if (t && t.length) {
                    var o = r.getBindingContext("shipToPartyJson").getObject();
                    a.setProperty("/ZSHIP_PRTY", o.ZSHIP_TO_PARTY);
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
                    a.setProperty("/ShipToAddr", l)
                }
            }
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
            var r = new g({
                filters: [new g("ZSHIP_TO_PARTY", "Contains", t.toUpperCase()), new g("ZNAME_1", "Contains", t.toUpperCase())],
                and: false
            });
            var a = e.getSource().getBinding("items");
            a.filter([r])
        },
        onPressfTradeValueListClose: function (e) {
            if (e.getId() === "cancel") {
                return
            }
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var a = this.getView().getModel("viewProperties");
            var s = this.getView().byId("f4hFtrade");
            if (t && t.length) {
                var o = r.getBindingContext("fTradeJson").getObject();
                a.setProperty("/ZFTRADE", o.ZFTRADE);
                a.setProperty("/ZFTRADE_DESC", o.ZFTRADE_DESC);
                if (s.getValue() === "") {
                    s.setValueState("Error")
                } else {
                    s.setValueState("None")
                }
            }
        },
        onMaterialValueHelpRequest: function (e) {
            var t;
            this._material = e.getSource();
            var r = e.getSource().getValue();
            this.curentNewOrderItemRow = e.getSource().getBindingContext("OrderData12").getPath().split("/").pop();
            if (!t) {
                t = this.getView()
            }
            if (!this.MaterialF4Help) {
                this.MaterialF4Help = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.OrderMaterialF4Help", this);
                t.addDependent(this.MaterialF4Help)
            }
            this.MaterialF4Help.open()
        },
        handleMaterialSearch: function (e) {
            var t = e.getParameter("value");
            var r = new g({
                filters: [new g("ZMAT_NUM", "Contains", t.toUpperCase()), new g("ZMATRL_DESC", "Contains", t.toUpperCase())],
                and: false
            });
            var a = e.getSource().getBinding("items");
            a.filter([r])
        },
        onPressMaterialValueListClose: function (e) {
            var t = e.getParameter("selectedContexts");
            var r = e.getParameter("selectedItem");
            var a = this.getView().getModel("viewProperties");
            var s = this.getOwnerComponent().getModel();
            var o = this.getView().getModel("OrderData12");
            if (t && t.length) {
                var i = r.getBindingContext("MaterialJson").getObject();
                var n = this._material.getBindingContext("OrderData12");
                var l = n.getPath();
                if (i.ZMAT_NUM) {
                    this._material.setValueState("None")
                } else {
                    this._material.setValueState("Error")
                }
                o.setProperty(l + "/ZMAT_NUM", i.ZMAT_NUM);
                this._getItemCategoryCustomerMaster(s, a.getProperty("/ZCUST_NUM"), i.ZMAT_NUM, this.curentNewOrderItemRow);
                this.getPallet(a, i.ZMAT_NUM, l);
                var u = i.ZMAT_NUM,
                    d = "/MaterialDetails";
                var D = this;
                this.maxDate = new Date;
                //sap.ui.core.BusyIndicator.show();
                s.read(d, {
                    filters: [new g("Z_MATRL_NUM", "EQ", u)],
                    success: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                        o.setProperty(l + "/ZMATRL_DESC", e.results[0].ZMATRL_DESC);
                        o.setProperty(l + "/ZALT_UOM", e.results[0].ZBASE_UNIT_MEASURE);
                        o.setProperty(l + "/ZTRGT_QTYUOM", e.results[0].ZBASE_UNIT_MEASURE);
                        o.setProperty(l + "/ZMIN_QTY", e.results[0].ZMIN_ORDER_QUAN);
                        o.setProperty(l + "/ZGRP_DEVLPR", e.results[0].ZGRP_DEVLPR);
                        o.setProperty(l + "/ZFROZEN_PERIOD", e.results[0].ZFROZEN_PERIOD);
                        D.maxDate.setMonth(D.maxDate.getMonth() + (parseInt(e.results[0].ZFROZEN_PERIOD) + 1));
                        D.maxDate.setDate(1);
                        o.setProperty(l + "/ZMAX_DATE", D.maxDate)
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide()
                    }
                })
            }
            e.getSource().getBinding("items").filter([])
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
                    ZSCHD_TYPE: "",
                    ItemCategorySug: []
                }]
            };
            this.jModel = new sap.ui.model.json.JSONModel;
            this.jModel.setData(this._data);
            this.getView().setModel(this.jModel, "OrderData12")
        },
        onClearDoc: function () {
            var e = this.getView().getModel("viewProperties");
            e.setProperty("/pdfFile", "");
            e.setProperty("/ZDOC_ID", "")
        },
        onAttachmentChange: function (e) {
            var t = new Date;
            var r = e.getParameter("files")[0],
                a = this,
                s = t.getTime() + "T_S" + e.getParameter("newValue");
            var o = e.getParameter("newValue");
            var i = this.getView().getModel("viewProperties");
            var n = _.uploadFile(r, s);
            n.then(function (e) {
                sap.ui.core.BusyIndicator.hide();
                i.setProperty("/pdfFile", o);
                var t = e.docId + "_MOET_" + e.docName;
                i.setProperty("/ZDOC_ID", t)
            }).catch(function (e) {
                sap.ui.core.BusyIndicator.hide();
                a._showErrorMessage(e.responseText.replace("Errorr", "Error"))
            })
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
        onFileDeleted: function (e) {
            D.confirm("Confirm to delete the attachment", {
                title: "Confirm",
                actions: [D.Action.OK, D.Action.CANCEL],
                emphasizedAction: D.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        sap.ui.getCore().byId("idUploadFileLink").setText("");
                        this.onClearDoc()
                    }
                }
            })
        },
        _deleteItemById: function (e) {
            var t = this.getView().getModel("RFileModel"),
                r = t.getProperty("/attachments"),
                a = this;
            return _.deleteFile(r[0].fileName, e).then(function (s) {
                var o = a.oAttachData.getBindingContext(),
                    i = o.getPath(),
                    n = a.oAttachData.getCustomData()[0].getValue();
                a.oAttachData.getModel().setProperty(i + "/" + n, "");
                jQuery.each(r, function (t) {
                    if (r[t] && r[t].documentId === e) {
                        r.splice(t, 1)
                    }
                });
                t.setProperty("/attachments", r);
                t.setProperty("/AttachmentTitle", a.getAttachmentTitleText())
            })
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
                var a = t + "T00:00:00";
                return a
            }
        },
        pressAddAttachment: function (e) {
            var t = this.getView().getModel("viewProperties");
            this.oAttachData = e.getSource();
            var r, a, s, o = t.getProperty("/ZDOC_ID");
            if (o) {
                r = o.split("_MOET_")[0];
                a = o.split("_MOET_")[1]
            } else {
                oData[sComSpec] = ""
            }
            if (r && a) {
                sap.m.URLHelper.redirect("/CMIS/cmis/download?docId=" + r, true)
            } else { }
        },
        getPallet: function (e, t, r) {
            var a;
            var s = this.getView().getModel("OrderData12");
            var o = this.getView().getModel("viewProperties");
            var i = o.getData().ZSYSTEM;
            if (i === "L") {
                i = "LEAN"
            } else {
                i = "TEMPO"
            }
            var n = this.getView().getModel("jsonSystemData").getData();
            for (var l = 0; l < n.length; l++) {
                if (n[l].Yydesc === "LEAN" && i === "LEAN") {
                    a = n[l].Yylow
                } else if (n[l].Yydesc === "TEMPO" && i === "TEMPO") {
                    a = n[l].Yylow
                }
            }
            var u = "/yminorderInputSet(IvMaterial='" + t + "',IvSyssid='" + a + "',IvCustomer='" + o.getData().ZCUST_NUM + "',IvSalesorg='" + e.getData().salesId + "',IvDisbchnl='" + e.getData().Distrchn + "',IvDivision='" + e.getData().Division + "')";
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(u, {
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    s.setProperty(r + "/ZPAL_QUAN", e.EvPalletQty);
                    s.setProperty(r + "/ZMIN_QTY", e.EvMinOrder)
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }.bind(this)
            })
        },
        onCurrencyChange: function (e) {
            var t = this.getView().getModel("viewProperties");
            t.setProperty("/ZHCURR", e.getSource().getSelectedKey());
            this.showMatrialValue(e.getSource().getSelectedKey());
            this.clearRowItem()
        },
        formatDateWithOutTime: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyy-MM-dd",
                    UTC: false
                });
                t = r.format(e);
                var a = t;
                return a
            }
        },
        copyRow: function () {
            var e = sap.ui.getCore().byId("idsystem"),
                t = this,
                r = "",
                a;
            if (e.getValue() === "TEMPO") {
                r = "T"
            } else {
                r = "L"
            }
            var s = sap.ui.getCore().byId("tblupdateorder");
            if (!s.getSelectedItem()) {
                D.warning("Select an Item Row to Copy", {
                    styleClass: "sapUiSizeCompact"
                });
                return
            }
            var o = [];
            var i = s.getSelectedItems();
            var n = 1;
            var l;
            if (i.length > 0) {
                i.forEach(function (e) {
                    if (e.getBindingContext("OrderData12").getObject().ZFOC_SMPL) {
                        l = e.getBindingContext("OrderData12").getObject().ZFOC_SMPL
                    } else {
                        l = ""
                    }
                    t._data.Products.push({
                        ZINTR_ORDNUM: e.getBindingContext("OrderData12").getObject().ZINTR_ORDNUM,
                        ZSYSTEM: r,
                        ZINTR_ITEMNUM: n.toString(),
                        ZMAT_NUM: e.getBindingContext("OrderData12").getObject().ZMAT_NUM,
                        ZMATRL_DESC: e.getBindingContext("OrderData12").getObject().ZMATRL_DESC,
                        ZTRGT_QTY: e.getBindingContext("OrderData12").getObject().ZTRGT_QTY,
                        ZTRGT_QTYUOM: e.getBindingContext("OrderData12").getObject().ZTRGT_QTYUOM,
                        ZALT_UOM: e.getBindingContext("OrderData12").getObject().ZALT_UOM,
                        ZREQ_DLVRYDAT: e.getBindingContext("OrderData12").getObject().ZREQ_DLVRYDAT,
                        ZMIN_QTY: e.getBindingContext("OrderData12").getObject().ZMIN_QTY,
                        ZFOC_SMPL: l,
                        ZFROZEN_PERIOD: e.getBindingContext("OrderData12").getObject().ZFROZEN_PERIOD,
                        ZORD_NUM: "",
                        ZITEM_NUM: "",
                        ZDISCNT: e.getBindingContext("OrderData12").getObject().ZDISCNT,
                        NetQty: "",
                        currency: "",
                        ZMAX_DATE: e.getBindingContext("OrderData12").getObject().ZMAX_DATE,
                        ZMIN_DATE: e.getBindingContext("OrderData12").getObject().ZMIN_DATE,
                        ZGRP_DEVLPR: e.getBindingContext("OrderData12").getObject().ZGRP_DEVLPR,
                        ZPAL_QUAN: e.getBindingContext("OrderData12").getObject().ZPAL_QUAN,
                        ZFOC_ITMC_FLAG: e.getBindingContext("OrderData12").getObject().ZFOC_ITMC_FLAG,
                        ItemCategorySug: e.getBindingContext("OrderData12").getObject().ItemCategorySug,
                        ZSCHD_TYPE: e.getBindingContext("OrderData12").getObject().ZSCHD_TYPE
                    });
                    n = n + 1
                })
            }
            t.jModel.refresh()
        },
        getItemCategory1: function (e, t) {
            var a = this;
            var s = this.getView().getModel("viewProperties");
            var o = new r;
            var i = this.getOwnerComponent().getModel(),
                n = "/CustMatItemCategoryAssign";
            for (var l = 0; l < t.length; l++) {
                //sap.ui.core.BusyIndicator.show();
                var u = t[l].ZMAT_NUM;
                a._getItemCategoryCustomerMaster(i, e, u, l)
            }
        },
        _getItemCategoryCustomerMaster: function (e, t, a, s) {
            var o = new r;
            e.read("/CustMatItemCategoryAssign", {
                filters: [new g("ZCUST_NUM", "EQ", t), new g("ZMAT_NUM", "EQ", a)],
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    if (t.results.length > 0) {
                        this.getView().getModel("OrderData12").setProperty("/Products/" + s + "/ItemCategorySug", t.results);
                        this.getView().getModel("OrderData12").refresh()
                    } else {
                        this._getItemCategoryMatrialMaster(e, a, s)
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _getItemCategoryMatrialMaster: function (e, t, a) {
            var s = new r;
            var o = this.getView().getModel("viewProperties");
            var i;
            if (o.getData().system === "TEMPO") {
                i = "T"
            } else {
                i = "L"
            }
            e.read("/MatItemCategoryAssign", {
                filters: [new g("ZMAT_NUM", "EQ", t), new g("ZSYSTEM", "EQ", i)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length > 0) {
                        this.getView().getModel("OrderData12").setProperty("/Products/" + a + "/ItemCategorySug", e.results);
                        this.getView().getModel("OrderData12").refresh()
                    } else { }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onSelectTenderFlag: function (e) {
            var t = this.getView().getModel("viewProperties");
            if (e.getSource().getState() === true) {
                t.setProperty("/ZTEDER_FLAG", true)
            } else {
                t.setProperty("/ZTEDER_FLAG", false)
            }
        },
        deleteRow: function (e) {
            var t = e.getSource().getBindingContext("OrderData12").getObject();
            for (var r = 0; r < this._data.Products.length; r++) {
                if (this._data.Products[r] == t) {
                    this._data.Products.splice(r, 1);
                    this.jModel.refresh();
                    break
                }
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
                var a = t;
                return a
            }
        },
        onUpdateClose: function () {
            if (this._editSalesorderDialog) {
                this._editSalesorderDialog.close();
                this._editSalesorderDialog = this._editSalesorderDialog.destroy(true)
            }
        },
        formatDate1: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyy-MM-dd",
                    UTC: true
                });
                t = r.format(e);
                var a = t;
                return a
            }
        },
        formatDate2: function (e) {
            var t;
            if (!e) {
                return null
            } else {
                var r = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "yyyy-MM-dd",
                    UTC: false
                });
                t = r.format(e);
                var a = t;
                return a
            }
        },
        onSimulate: function () {
            var e = this._handleValidation();
            if (!e) {
                return
            }
            var t = this.getView().getModel("viewProperties"),
                a = sap.ui.getCore().byId("idsystem"),
                s = this;
            var o = "",
                i = "";
            if (a.getValue() === "TEMPO") {
                i = "T"
            } else {
                i = "L"
            }
            var n = sap.ui.getCore().byId("tblupdateorder");
            var l = [];
            var u = n.getItems();
            var g = 1,
                d;
            var _ = this.getView().getModel("viewProperties");
            var T = {
                ZORDER_HEADER: [{
                    ZINTR_ORDNUM: t.getData().ZINTR_ORDNUM,
                    ZSYSTEM: i,
                    ZORD_REF: "X",
                    ZCUST_NUM: t.getData().ZCUST_NUM,
                    ZCUSTOMER_NAME: _.getData().ZCUSTOMER_NAME,
                    ZSHIP_PRTY: t.getData().ZSHIP_PRTY,
                    ZSHIP_TO_PARTY_DESC: _.getData().ZSHIP_TO_PARTY_DESC,
                    ZPO_TYP: "X",
                    ZDISCNT: t.getData().ZDISCNT,
                    ZCUST_PONUM: t.getData().ZCUST_PONUM,
                    ZCUST_PODAT: t.getData().ZCUST_PODAT,
                    ZDOC_ID: t.getData().ZDOC_ID,
                    ZORD_STATUS: "DRFT",
                    ZORD_NUM: "",
                    ZAPPROVAL_STATUS: "",
                    ZLEAD_TIME: "",
                    ZMIN_ORDER_QUAN: "",
                    ZORDER_FORECAST: "",
                    ZFIT_CONTRACT_COND: "",
                    ZTEDER_FLAG: t.getData().ZTEDER_FLAG,
                    ZREQ_DELV_DAT: t.getData().ZREQ_DELV_DAT,
                    ZSALES_AREA: t.getData().ZSALES_AREA,
                    ZTOTAL_AMT: t.getData().ZTOTAL_AMT,
                    ZFTRADE: _.getData().ZFTRADE,
                    ZFTRADE_DESC: _.getData().ZFTRADE_DESC,
                    ZCURR: "",
                    ZHCURR: _.getData().ZHCURR,
                    ZORD_APPROVAL_STATUS: "",
                    ZCOMMENTS: "",
                    ZCREATED_BY: _.getData().ZCREATED_BY,
                    ZCHANGED_BY: this.getOwnerComponent().sUserId,
                    ShipToAddr: t.getData().ShipToAddr,
                    herderCurr: "",
                    HDRNETVAL: ""
                }]
            };
            var c = new r;
            var Z = sap.ui.getCore().byId("f4hCustomer") || this.getView().byId("f4hCustomer");
            var C;
            var S = T.ZORDER_HEADER[0].ZSYSTEM;
            var O = this.getView().getModel("jsonSystemData").getData();
            for (var g = 0; g < O.length; g++) {
                if (O[g].Yydesc === "LEAN" && S === "L") {
                    C = O[g].Yylow
                } else if (O[g].Yydesc === "TEMPO" && S === "T") {
                    C = O[g].Yylow
                }
            }
            var E = [];
            var M = [];
            var R = n.getItems();
            var p = 10,
                h;
            var I;
            var f;
            if (R.length > 0) {
                R.forEach(function (e) {
                    if (e.getBindingContext("OrderData12").getObject().ZFROZEN_PERIOD === null) {
                        f = "0"
                    } else {
                        f = e.getBindingContext("OrderData12").getObject().ZFROZEN_PERIOD
                    }
                    if (e.getBindingContext("OrderData12").getObject().ZFOC_ITMC_FLAG !== "X") {
                        if (e.getBindingContext("OrderData12").getObject().ZFOC_SMPL === "YYAN") {
                            h = ""
                        } else if (e.getBindingContext("OrderData12").getObject().ZFOC_SMPL) {
                            h = e.getBindingContext("OrderData12").getObject().ZFOC_SMPL
                        } else {
                            h = ""
                        }
                        if (e.getBindingContext("OrderData12").getObject().ZDISCNT) {
                            I = e.getBindingContext("OrderData12").getObject().ZDISCNT
                        } else {
                            I = "0"
                        }
                        M.push({
                            ItmNumber: p.toString(),
                            SchedLine: "0001",
                            ReqQty: e.getBindingContext("OrderData12").getObject().ZTRGT_QTY.toString(),
                            SchedType: ""
                        });
                        E.push({
                            ItemCateg: h,
                            ItmNumber: p.toString(),
                            Matnr: e.getBindingContext("OrderData12").getObject().ZMAT_NUM,
                            Plant: "",
                            TargQty: e.getBindingContext("OrderData12").getObject().ZTRGT_QTY.toString(),
                            DocType: "YOR",
                            ZMIN_ORD_QTY: e.getBindingContext("OrderData12").getObject().ZMIN_QTY,
                            ZPAL_QUAN: e.getBindingContext("OrderData12").getObject().ZPAL_QUAN,
                            ZTRGT_QTYUOM: e.getBindingContext("OrderData12").getObject().ZALT_UOM,
                            ZALT_UOM: e.getBindingContext("OrderData12").getObject().ZALT_UOM,
                            ZREQ_DLVRYDAT: s.formatDateT1Format(e.getBindingContext("OrderData12").getObject().ZREQ_DLVRYDAT),
                            ZFOC_SMPL: h,
                            ZDISCNT: e.getBindingContext("OrderData12").getObject().ZDISCNT,
                            UNITPC: e.getBindingContext("OrderData12").getObject().ZALT_UOM,
                            NetQty: "0",
                            ZGRP_DEVLPR: e.getBindingContext("OrderData12").getObject().ZGRP_DEVLPR,
                            ZFROZEN_PERIOD: f,
                            CondValue: I
                        });
                        p = p + 10
                    }
                })
            }
            var A;
            if (_.getData().ZDISCNT) {
                A = _.getData().ZDISCNT
            } else {
                A = "0"
            }
            var N = {
                IvCustomer: _.getData().ZCUST_NUM,
                IvShipParty: _.getData().ZSHIP_PRTY,
                IvReqDateH: s.formatDateT1Format(_.getData().ZCUST_PODAT),
                IvDistchanl: _.getData().Distrchn,
                IvDivision: _.getData().Division,
                IvSalesorg: _.getData().ZSALES_AREA,
                IvSyssid: C,
                IvCurrency: _.getData().selectCurr,
                IvHdrCondVal: A,
                Navsosimulate: E,
                Navsosimulatescheduline: M,
                NavsosimulateReturn: [],
                NavsosimulateNetval: []
            };
            N.Navsosimulate[0].ItmNumber = "000010";
            var m, v, s = this,
                y;
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").create("/ysalesordersimulationInputSet", N, {
                method: "POST",
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e && e.NavsosimulateReturn && e.NavsosimulateReturn.results && e.NavsosimulateReturn.results.length) {
                        if (e.NavsosimulateReturn["results"][0].Type === "E") {
                            D.show(e.NavsosimulateReturn["results"][0].Message, {
                                icon: D.Icon.ERROR,
                                title: "Error",
                                actions: [D.Action.CLOSE],
                                styleClass: "sapUiSizeCompact myMessageBox"
                            });
                            return
                        }
                    }
                    if (e && e.NavsosimulateNetval && e.NavsosimulateNetval.results && e.NavsosimulateNetval.results.length) {
                        var a = e.NavsosimulateNetval.results;
                        var o = 1;
                        if (a.length > 0) {
                            a.forEach(function (e) {
                                l.push({
                                    ZINTR_ORDNUM: t.getData().ZINTR_ORDNUM,
                                    ZSYSTEM: i,
                                    ZINTR_ITEMNUM: o.toString(),
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
                                o = o + 1
                            })
                        }
                        T.ZORDER_ITEM = l;
                        T.ZORDER_HEADER[0].HDRNETVAL = e.IVHDRNETVAL;
                        for (var n = 0; n < T.ZORDER_ITEM.length; n++) {
                            T.ZORDER_ITEM[n].NetQty = e.NavsosimulateNetval.results[n].ItemNetval;
                            T.ZORDER_ITEM[n].currency = e.NavsosimulateNetval.results[n].Currency;
                            T.ZORDER_HEADER[0].herderCurr = T.ZORDER_ITEM[n].currency
                        }
                        _.setProperty("/herderCurr", T.ZORDER_HEADER[0].herderCurr);
                        _.setProperty("/HDRNETVAL", T.ZORDER_HEADER[0].HDRNETVAL)
                    }
                    c.setData(T);
                    if (!s._UpdateSiDialog) {
                        s._UpdateSiDialog = sap.ui.xmlfragment("entrytool.fragments.updateOrderSimulate", s);
                        s.getView().addDependent(s._UpdateSiDialog);
                        s._UpdateSiDialog.setModel(c, "salesorderData")
                    }
                    s._UpdateSiDialog.open();
                    if (e.NavsosimulateReturn.results.length > 0) {
                        if (e.NavsosimulateReturn.results[0].Type === "E") {
                            v = "ERROR"
                        } else {
                            v = "SUCCESS"
                        }
                    } else {
                        v = "SUCCESS"
                    }
                    D.show(e.NavsosimulateReturn.results[0].Message, {
                        icon: D.Icon.ERROR,
                        title: v,
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    D.show(e.message + " " + e.responseText, {
                        icon: D.Icon.ERROR,
                        title: "Error",
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            if (!Z.getValue()) {
                D.error("Please fill all mandatory Details", {
                    styleClass: "sapUiSizeCompact"
                })
            }
        },
        onSimulateClose: function () {
            this._UpdateSiDialog.close();
            if (this._UpdateSiDialog) {
                this._UpdateSiDialog = this._UpdateSiDialog.destroy()
            }
        },
        onUpdateOrder: function () {
            var e = this.getView().getModel("viewProperties"),
                t = this,
                a = sap.ui.getCore().byId("idsystem");
            var s = "",
                o = "";
            if (a.getValue() === "TEMPO") {
                o = "T"
            } else {
                o = "L"
            }
            if (e.getData().ZTEDER_FLAG === true) {
                e.getData().ZTEDER_FLAG = "X"
            } else {
                e.getData().ZTEDER_FLAG = ""
            }
            var i = this._UpdateSiDialog.getModel("salesorderData");
            var n = i.getData().ZORDER_ITEM;
            var l = sap.ui.getCore().byId("tblupdateorder");
            var u = [];
            if (n.length > 0) {
                n.forEach(function (e) {
                    if (e.ZMIN_QTY) {
                        e.ZMIN_QTY = e.ZMIN_QTY
                    } else {
                        e.ZMIN_QTY = "0"
                    }
                    if (e.ZDISCNT) {
                        e.ZDISCNT = e.ZDISCNT
                    } else {
                        e.ZDISCNT = "0"
                    }
                    u.push({
                        ZINTR_ORDNUM: e.ZINTR_ORDNUM,
                        ZSYSTEM: o,
                        ZINTR_ITEMNUM: e.ZINTR_ITEMNUM,
                        ZMAT_NUM: e.ZMAT_NUM,
                        ZTRGT_QTY: e.ZTRGT_QTY,
                        ZTRGT_QTYUOM: e.ZTRGT_QTYUOM,
                        ZALT_UOM: e.ZALT_UOM,
                        ZREQ_DLVRYDAT: t.formatDateWithOutTime(e.ZREQ_DLVRYDAT),
                        ZMIN_QTY: e.ZMIN_QTY,
                        ZFOC_SMPL: e.ZFOC_SMPL,
                        ZORD_NUM: "",
                        ZITEM_NUM: "",
                        ZDISCNT: e.ZDISCNT,
                        ZCOST: e.NetQty,
                        ZGRP_DEVLPR: e.ZGRP_DEVLPR,
                        ZFROZEN_PERIOD: e.ZFROZEN_PERIOD,
                        ZPAL_QUAN: e.ZPAL_QUAN,
                        ZFOC_ITMC_FLAG: e.ZFOC_ITMC_FLAG,
                        ZSCHD_TYPE: e.ZSCHD_TYPE
                    })
                })
            }
            var g = {
                ZORDER_HEADER: [{
                    ZINTR_ORDNUM: e.getData().ZINTR_ORDNUM,
                    ZSYSTEM: o,
                    ZORD_REF: "X",
                    ZCUST_NUM: e.getData().ZCUST_NUM,
                    ZSHIP_PRTY: e.getData().ZSHIP_PRTY,
                    ZPO_TYP: "X",
                    ZDISCNT: e.getData().ZDISCNT,
                    ZCUST_PONUM: e.getData().ZCUST_PONUM,
                    ZCUST_PODAT: t.formatDate1(e.getData().ZCUST_PODAT),
                    ZDOC_ID: e.getData().ZDOC_ID,
                    ZORD_STATUS: "SNOA",
                    ZORD_NUM: "",
                    ZAPPROVAL_STATUS: "",
                    ZLEAD_TIME: "",
                    ZMIN_ORDER_QUAN: "",
                    ZORDER_FORECAST: "",
                    ZFIT_CONTRACT_COND: "",
                    ZTEDER_FLAG: e.getData().ZTEDER_FLAG,
                    ZREQ_DELV_DAT: this.formatDate1(new Date),
                    ZSALES_AREA: e.getData().ZSALES_AREA,
                    ZTOTAL_AMT: e.getData().HDRNETVAL,
                    ZFTRADE: e.getData().ZFTRADE,
                    ZFTRADE_DESC: e.getData().ZFTRADE_DESC,
                    ZCURR: e.getData().herderCurr,
                    ZHCURR: e.getData().ZHCURR,
                    ZDISTR_CHNL: e.getData().Distrchn,
                    ZDIVISION: e.getData().Division,
                    ZDEL_BLOCK_ID: e.getData().ZDEL_BLOCK_ID,
                    ZORD_APPROVAL_STATUS: "",
                    ZCOMMENTS: "",
                    ZCREATED_BY: e.getData().ZCREATED_BY,
                    ZCHANGED_BY: this.getOwnerComponent().sUserId
                }],
                ZORDER_ITEM: u
            };
            var d = new r;
            d.setData(g);
            //sap.ui.core.BusyIndicator.show();
            var t = this;
            var _ = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
            var T = {
                ZINTR_ORDNUM: e.getData().ZINTR_ORDNUM
            };
            //sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: _,
                type: "DELETE",
                data: JSON.stringify(T),
                dataType: "json",
                contentType: "application/json",
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    $.ajax({
                        url: _,
                        type: "POST",
                        data: JSON.stringify(g),
                        dataType: "json",
                        contentType: "application/json",
                        success: function (e, r) {
                            sap.ui.core.BusyIndicator.hide();
                            $.ajax({
                                url: "/HANAXS/com/merckgroup/moet/services/xsjs/splitOrder.xsjs",
                                type: "DELETE",
                                data: JSON.stringify(T),
                                dataType: "json",
                                contentType: "application/json",
                                success: function (e, t) { },
                                error: function (e) {
                                    sap.ui.core.BusyIndicator.hide();
                                    D.show(e.responseJSON.message, {
                                        icon: D.Icon.ERROR,
                                        title: "Error",
                                        onClose: this.onAssignClose,
                                        actions: [D.Action.CLOSE],
                                        styleClass: "sapUiSizeCompact myMessageBox"
                                    })
                                }
                            });
                            D.show("Order " + g.ZORDER_HEADER[0].ZINTR_ORDNUM + " is Updated Successfully", {
                                icon: D.Icon.SUCCESS,
                                title: "SUCCESS",
                                onClose: this.onAssignClose,
                                actions: [D.Action.CLOSE],
                                styleClass: "sapUiSizeCompact myMessageBox"
                            });
                            t.getOwnerComponent().getModel().refresh();
                            t.onSimulateClose();
                            t.onUpdateClose()
                        },
                        error: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            D.show(e.responseJSON.message, {
                                icon: D.Icon.ERROR,
                                title: "Error",
                                onClose: this.onAssignClose,
                                actions: [D.Action.CLOSE],
                                styleClass: "sapUiSizeCompact myMessageBox"
                            })
                        }
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    D.show(e.responseJSON.message, {
                        icon: D.Icon.ERROR,
                        title: "Error",
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        handleDate: function (e) {
            var t = e.getSource(),
                r = t.getBindingPath("value"),
                a = new Date(t.getValue().replace(/(\d{2}).(\d{2}).(\d{4})/, "$2/$1/$3")),
                s = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd.MM.yyyy",
                    strictParsing: true
                }),
                o = t.getBindingContext("OrderData12").sPath;
            var i = this.getView().getModel("OrderData12").getProperty(o + "/ZMAX_DATE");
            if (a !== null) {
                a.setHours(0, 0, 0, 0)
            }
            var n = s.parse(this.getView().getModel("OrderData12").getProperty(o + "/ZMAX_DATE"));
            if (n !== null) {
                i.setHours(0, 0, 0, 0)
            }
            if (a < i) {
                D.show("Please verify lead-time for requested delivery date not respecting frozen period", {
                    icon: D.Icon.WARNING,
                    title: "WARNING",
                    onClose: this.onAssignClose,
                    actions: [D.Action.CLOSE],
                    styleClass: "sapUiSizeCompact myMessageBox"
                })
            }
            this.getView().getModel("OrderData12").setProperty(o + "/" + r, a);
            this.handleonValueInput(e)
        },
        onChangePODate: function (e) {
            var t = this.getView().getModel("viewProperties");
            var r = sap.ui.getCore().byId("idcpodate");
            if (r.getValue() === "") {
                r.setValueState("Error")
            } else {
                r.setValueState("None")
            }
            var a = e.getSource(),
                s = a.getBindingPath("value"),
                o = a.getDateValue();
            t.setProperty("/ZCUST_PODAT", o)
        },
        handleonValueInput: function (e) {
            var t = e.getSource();
            if (t.getValue().length > 0) {
                t.setValueState("None")
            } else {
                t.setValueState("Error")
            }
        },
        addRow: function (e) {
            this.minDate = new Date;
            this.maxDate = new Date;
            this._data.Products.push({
                ZINTR_ORDNUM: this.getView().getModel("OrderData1").getData().ZINTR_ORDNUM,
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
                ZGRP_DEVLPR: "",
                ZPAL_QUAN: "",
                ZFOC_ITMC_FLAG: "",
                ZMAX_DATE: this.maxDate,
                ZMIN_DATE: this.minDate,
                ItemCategorySug: [],
                ZFROZEN_PERIOD: "",
                ZSCHD_TYPE: ""
            });
            this.jModel.refresh()
        },
        soLineClose: function () {
            this._oSSOLAEDialog.close();
            if (this._oSSOLAEDialog) {
                this._oSSOLAEDialog = this._oSSOLAEDialog.destroy()
            }
        },
        soLineShow: function (e) {
            var t = e.getSource()._getBindingContext("salesorderData").getObject();
            var a = this._UpdateSiDialog.getModel("salesorderData").getData();
            var s = this._oViewProperties = new r;
            var o = this.getView().getModel("viewProperties");
            s.setData(a);
            var i;
            var n = t.ZSYSTEM;
            var l = this.getView().getModel("jsonSystemData").getData();
            for (var u = 0; u < l.length; u++) {
                if (l[u].Yydesc === "LEAN" && n === "L") {
                    i = l[u].Yylow
                } else if (l[u].Yydesc === "TEMPO" && n === "T") {
                    i = l[u].Yylow
                }
            }
            if (t.ZALT_UOM) {
                t.ZALT_UOM = t.ZALT_UOM
            } else {
                t.ZALT_UOM = "PC"
            }
            var g = "datetime%27" + this.formatDateT1(t.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";
            var d = "/ysoschedulelinesSet(distchnl='" + o.getData().Distrchn + "',division='" + o.getData().Division + "',salesorg='" + o.getData().ZSALES_AREA + "',customer='" + o.getData().ZCUST_NUM + "',Material='" + t.ZMAT_NUM + "',Unit='" + t.ZALT_UOM + "',Sysid='" + i + "',ReqDate=" + g + ",ReqQty=" + parseInt(t.ZTRGT_QTY) + ")";
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(d, {
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    var a = new r;
                    a.setData(e);
                    if (!this._oSSOLAEDialog) {
                        this._oSSOLAEDialog = sap.ui.xmlfragment("entrytool.fragments.orderSimulateEditSOLine", this);
                        this.getView().addDependent(this._oSSOLAEDialog);
                        this._oSSOLAEDialog.setModel(a, "ssoLineJson");
                        this._oSSOLAEDialog.setModel(s, "ssoLineJson1")
                    }
                    if (e.Retmsg) {
                        D.show(e.Retmsg, {
                            icon: D.Icon.ERROR,
                            title: "Error",
                            actions: [D.Action.CLOSE],
                            styleClass: "sapUiSizeCompact myMessageBox"
                        })
                    }
                    this._oSSOLAEDialog.open()
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    D.show(e.message, {
                        icon: D.Icon.ERROR,
                        title: "Error",
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }.bind(this)
            })
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
                var a = t;
                return a
            }
        },
        _getShowFtradeValue: function (e, t) {
            var a = this;
            var s = this.getView().getModel("viewProperties");
            var o = new r;
            var i = this.getOwnerComponent().getModel(),
                n = "/CustomerFTradeAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            i.read(n, {
                filters: [new g("ZCUST_NUM", "EQ", s.getProperty("/cusId"))],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        return
                    }
                    if (e.results.length) {
                        for (var r = 0; r < e.results.length; r++) {
                            if (e.results[r].ZFTRADE === t) {
                                s.setProperty("/ZFTRADE", e.results[0].ZFTRADE);
                                s.setProperty("/ZFTRADE_DESC", e.results[0].ZFTRADE_DESC)
                            }
                        }
                        o.setData(e.results);
                        a.getView().setModel(o, "fTradeJson")
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _onSaveOrderInEdit: function () {
            var e = this._handleValidation();
            if (!e) {
                return
            }
            var t = this.getView().getModel("viewProperties"),
                a = this,
                s = sap.ui.getCore().byId("idsystem");
            var o = "",
                i = "";
            if (s.getValue() === "TEMPO") {
                i = "T"
            } else {
                i = "L"
            }
            if (t.getData().ZTEDER_FLAG === true) {
                t.getData().ZTEDER_FLAG = "X"
            } else {
                t.getData().ZTEDER_FLAG = ""
            }
            var n = 1;
            var l = sap.ui.getCore().byId("tblupdateorder");
            var u = [];
            var g = this.getView().getModel("OrderData12").getData().Products;
            if (g.length > 0) {
                g.forEach(function (e) {
                    if (e.ZFOC_ITMC_FLAG !== "X") {
                        if (e.ZMIN_QTY) {
                            e.ZMIN_QTY = e.ZMIN_QTY
                        } else {
                            e.ZMIN_QTY = "0"
                        }
                        if (e.ZDISCNT) {
                            e.ZDISCNT = e.ZDISCNT
                        } else {
                            e.ZDISCNT = "0"
                        }
                        u.push({
                            ZINTR_ORDNUM: t.getData().ZINTR_ORDNUM,
                            ZSYSTEM: i,
                            ZINTR_ITEMNUM: n.toString(),
                            ZMAT_NUM: e.ZMAT_NUM,
                            ZTRGT_QTY: e.ZTRGT_QTY,
                            ZTRGT_QTYUOM: e.ZTRGT_QTYUOM,
                            ZALT_UOM: e.ZALT_UOM,
                            ZREQ_DLVRYDAT: a.formatDate2(e.ZREQ_DLVRYDAT),
                            ZMIN_QTY: e.ZMIN_QTY,
                            ZFOC_SMPL: e.ZFOC_SMPL,
                            ZORD_NUM: "",
                            ZITEM_NUM: "",
                            ZDISCNT: e.ZDISCNT,
                            ZCOST: "",
                            ZGRP_DEVLPR: e.ZGRP_DEVLPR,
                            ZFROZEN_PERIOD: e.ZFROZEN_PERIOD,
                            ZPAL_QUAN: e.ZPAL_QUAN,
                            ZFOC_ITMC_FLAG: e.ZFOC_ITMC_FLAG,
                            ZSCHD_TYPE: e.ZSCHD_TYPE
                        })
                    }
                    n = n + 1
                })
            }
            var d = {
                ZORDER_HEADER: [{
                    ZINTR_ORDNUM: t.getData().ZINTR_ORDNUM,
                    ZSYSTEM: i,
                    ZORD_REF: "X",
                    ZCUST_NUM: t.getData().ZCUST_NUM,
                    ZSHIP_PRTY: t.getData().ZSHIP_PRTY,
                    ZPO_TYP: "X",
                    ZDISCNT: t.getData().ZDISCNT,
                    ZCUST_PONUM: t.getData().ZCUST_PONUM,
                    ZCUST_PODAT: a.formatDate2(t.getData().ZCUST_PODAT),
                    ZDOC_ID: t.getData().ZDOC_ID,
                    ZORD_STATUS: "DRFT",
                    ZORD_NUM: "",
                    ZAPPROVAL_STATUS: "",
                    ZLEAD_TIME: "",
                    ZMIN_ORDER_QUAN: "",
                    ZORDER_FORECAST: "",
                    ZFIT_CONTRACT_COND: "",
                    ZTEDER_FLAG: t.getData().ZTEDER_FLAG,
                    ZREQ_DELV_DAT: this.formatDate1(new Date),
                    ZSALES_AREA: t.getData().ZSALES_AREA,
                    ZTOTAL_AMT: t.getData().HDRNETVAL,
                    ZFTRADE: t.getData().ZFTRADE,
                    ZFTRADE_DESC: t.getData().ZFTRADE_DESC,
                    ZCURR: t.getData().herderCurr,
                    ZHCURR: t.getData().ZHCURR,
                    ZDISTR_CHNL: t.getData().Distrchn,
                    ZDIVISION: t.getData().Division,
                    ZDEL_BLOCK_ID: t.getData().ZDEL_BLOCK_ID,
                    ZORD_APPROVAL_STATUS: "",
                    ZCOMMENTS: "",
                    ZCREATED_BY: t.getData().ZCREATED_BY,
                    ZCHANGED_BY: this.getOwnerComponent().sUserId
                }],
                ZORDER_ITEM: u
            };
            var _ = new r;
            _.setData(d);
            //sap.ui.core.BusyIndicator.show();
            var a = this;
            var T = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
            var c = {
                ZINTR_ORDNUM: t.getData().ZINTR_ORDNUM
            };
            sap.ui.getCore().byId("btnEditSave").setEnabled(false);
            $.ajax({
                url: T,
                type: "DELETE",
                data: JSON.stringify(c),
                dataType: "json",
                contentType: "application/json",
                success: function (e, r) {
                    $.ajax({
                        url: T,
                        type: "POST",
                        data: JSON.stringify(d),
                        dataType: "json",
                        contentType: "application/json",
                        success: function (e, r) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.ui.getCore().byId("btnEditSave").setEnabled(true);
                            var s = e.message + " The Internal Order Number is " + t.getData().ZINTR_ORDNUM;
                            D.show(s, {
                                icon: D.Icon.SUCCESS,
                                title: "SUCCESS",
                                onClose: this.onAssignClose,
                                actions: [D.Action.CLOSE],
                                styleClass: "sapUiSizeCompact myMessageBox"
                            });
                            a.getOwnerComponent().getModel().refresh();
                            a.onUpdateClose()
                        },
                        error: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            sap.ui.getCore().byId("btnEditSave").setEnabled(true);
                            D.show(e.responseJSON.message, {
                                icon: D.Icon.ERROR,
                                title: "Error",
                                onClose: this.onAssignClose,
                                actions: [D.Action.CLOSE],
                                styleClass: "sapUiSizeCompact myMessageBox"
                            })
                        }
                    })
                },
                error: function (e) {
                    D.show(e.responseJSON.message, {
                        icon: D.Icon.ERROR,
                        title: "Error",
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        handleChangeCPONO: function (e) {
            var t = sap.ui.getCore().byId("idcpono");
            var r = this.getView().getModel("viewProperties");
            var a = this.getOwnerComponent().getModel(),
                s = "/OrderHeaderDetails";
            //sap.ui.core.BusyIndicator.show();
            var o = new sap.ui.model.json.JSONModel;
            var i = this;
            if (t.getValue() === "") {
                t.setValueState("Error")
            } else {
                t.setValueState("None")
            }
            //sap.ui.core.BusyIndicator.show();
            a.read(s, {
                filters: [new g("ZCUST_PONUM", "EQ", t.getValue()), new g("ZORD_STATUS", "EQ", "ORCR")],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length) {
                        D.warning("This Customer PO Number Already exists", {
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
        onDeletePress: function (e) {
            var t = this,
                r = this.getOwnerComponent().getModel();
            var a = "/HANAXS/com/merckgroup/moet/services/xsjs/orderDraft.xsjs";
            var s = e.getSource().getBindingContext().getObject();
            var o = {
                ZINTR_ORDNUM: s.ZINTR_ORDNUM,
                ZSYSTEM: s.ZSYSTEM
            };
            D.confirm("Please Confirm to delete intrenal order number " + s.ZINTR_ORDNUM, {
                title: "Confirm",
                actions: [D.Action.OK, D.Action.CANCEL],
                emphasizedAction: D.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        //sap.ui.core.BusyIndicator.show();
                        $.ajax({
                            url: a,
                            type: "DELETE",
                            data: JSON.stringify(o),
                            dataType: "json",
                            contentType: "application/json",
                            success: function (e, t) {
                                sap.ui.core.BusyIndicator.hide();
                                D.show(e.message, {
                                    icon: D.Icon.SUCCESS,
                                    title: "SUCCESS",
                                    actions: [D.Action.CLOSE],
                                    emphasizedAction: D.Action.CLOSE,
                                    onClose: function (e) {
                                        if (e === "CLOSE") {
                                            r.refresh()
                                        }
                                    }
                                })
                            },
                            error: function (e) {
                                sap.ui.core.BusyIndicator.hide();
                                D.show(e.responseJSON.message, {
                                    icon: D.Icon.ERROR,
                                    title: "Error",
                                    actions: [D.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                })
                            }
                        })
                    }
                }
            })
        },
        userLogin: function () {
            var e = new r,
                t = this;
            var a = this.getView().getModel("viewProperties");
            var s = this.getOwnerComponent().getModel(),
                o = "/SessionUser";
            // //sap.ui.core.BusyIndicator.show();
            s.read(o, {
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.userId = a.setProperty("/LoginID", e.results[0].ZUSR_ID);
                    t.getOwnerComponent().sUserId = e.results[0].ZUSR_ID;
                    t.getOwnerComponent().sUserRole = e.results[0].ZUSR_ROLE;
                    a.setProperty("/sUserRole", e.results[0].ZUSR_ROLE);
                    t._getCustomerData()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _getCustomerData: function () {
            var e = new r,
                t = this;
            var a = this.getOwnerComponent().getModel(),
                s = this.getView().getModel("viewProperties"),
                o = this.getOwnerComponent().getModel("appJson"),
                i = "/UserCustAssignDetails",
                n;
            if (t.getOwnerComponent().sUserRole === "ADMIN") {
                n = new g("ZCENTRL_DEL_FLAG", "EQ", "");
                i = "/CustomerDetails/?$select=ZCUSTMR_NUM,ZSYSTEM,ZCUST_NUM,ZCUSTOMER_NAME"
            } else {
                n = new g({
                    filters: [new g("ZUSR_ID", "EQ", s.getProperty("/LoginID")), new g("ZCUST_STATUS", "NE", "FFDL"), new g("ZCENTRL_DEL_FLAG", "NE", "X")],
                    and: true
                })
            }
            //sap.ui.core.BusyIndicator.show();
            a.read(i, {
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
        getApproveOrderData: function (e) {
            var t = this.getView().getModel("viewProperties1");
            var r = this.getOwnerComponent().getModel(),
                a = e.ZINTR_ORDNUM,
                s = "/OrderHeaderDetails";
            //sap.ui.core.BusyIndicator.show();
            var o = new sap.ui.model.json.JSONModel;
            var i = new sap.ui.model.json.JSONModel;
            var n = this;
            var l = {};
            r.read(s, {
                filters: [new g("ZINTR_ORDNUM", "EQ", a)],
                success: function (r) {
                    sap.ui.core.BusyIndicator.hide();
                    o.setData(r.results[0]);
                    l = r.results;
                    t.setProperty("/ZCREATED_BY", r.results[0].ZCREATED_BY);
                    t.setProperty("/idlead", false);
                    t.setProperty("/idmin", false);
                    t.setProperty("/idchk", false);
                    t.setProperty("/iddisc", false);
                    t.setProperty("/idCommentsinput", "");
                    t.setProperty("/ZDOC_ID", "");
                    t.setProperty("/FileName", "");
                    t.setProperty("/ZDOC_ID", r.results[0].ZDOC_ID);
                    var a = t.getProperty("/ZDOC_ID"),
                        s, u;
                    if (a) {
                        u = a.split("_MOET_")[0];
                        s = a.split("T_S")[1];
                        t.setProperty("/FileName", s)
                    }
                    var d = n.getOwnerComponent().getModel(),
                        D = e.ZINTR_ORDNUM,
                        _ = "/OrderItemDetails";
                    //sap.ui.core.BusyIndicator.show();
                    n._getShipToValueApprove(r.results[0], r.results[0].ZSHIP_PRTY);
                    var T = new sap.ui.model.json.JSONModel;
                    d.read(_, {
                        filters: [new g("ZINTR_ORDNUM", "EQ", D)],
                        success: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            T.setData(e.results);
                            n.getView().setModel(T, "OrderData12");
                            n.getView().setModel(o, "OrderData1");
                            var t = {
                                header: n.getView().getModel("OrderData1"),
                                item: n.getView().getModel("OrderData12")
                            };
                            i.setData(t);
                            if (!n._oCM1iDialog) {
                                if (n.getOwnerComponent().sUserRole === "CUST") {
                                    n._oCM1iDialog = sap.ui.xmlfragment("entrytool.fragments.confirmedOrders", n)
                                } else {
                                    n._oCM1iDialog = sap.ui.xmlfragment("entrytool.fragments.orderApprove", n)
                                }
                                n.getView().addDependent(n._oCM1iDialog);
                                n._oCM1iDialog.setModel(o, "OrderData1");
                                n._oCM1iDialog.setModel(i, "OrderDataF")
                            }
                            n._oCM1iDialog.open()
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
        _onClearOrder: function () {
            var e = sap.ui.getCore();
            var t = [e.byId("idlead"), e.byId("idmin"), e.byId("idchk"), e.byId("iddisc")];
            jQuery.each(t, function (e, t) {
                t.setState(false)
            });
            e.byId("idCommentsinput").setValue("")
        },
        onAppr: function () {
            var e = "";
            var t = this.getOwnerComponent().getModel();
            var r = sap.ui.getCore().byId("idlead");
            var a = sap.ui.getCore().byId("idmin");
            var s = sap.ui.getCore().byId("idchk");
            var o = sap.ui.getCore().byId("iddisc");
            var i = sap.ui.getCore().byId("idCommentsinput").getValue();
            var n = "",
                l = "",
                u = "",
                g = "";
            if (r.getState()) {
                n = "X"
            }
            if (a.getState()) {
                l = "X"
            }
            if (s.getState()) {
                u = "X"
            }
            if (o.getState()) {
                g = "X"
            }
            var d = sap.ui.getCore().byId("ID_OPEN_ORDER12");
            var _ = this.getView().getModel("OrderData12");
            var T = this.getView().getModel("OrderData1");
            this._getSalesAreaValueApprove(T.getData(), T.getData().ZSALES_AREA);
            var c = [];
            var Z = [];
            var C = [];
            var S = [];
            var O = _.getData()[0].ZREQ_DLVRYDAT;
            var E = T.getData().ZCUST_PODAT;
            var M = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "YYYY-MM-dd"
            });
            var R = M.format(O);
            var p = M.format(E);
            var h = _.getData();
            var I;
            if (h.length > 0) {
                h.forEach(function (e) {
                    var t = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: "YYYY-MM-dd"
                    });
                    c.push({
                        ZINTR_ORDNUM: T.getData().ZINTR_ORDNUM,
                        ZSYSTEM: T.getData().ZSYSTEM,
                        ZINTR_ITEMNUM: e.ZINTR_ITEMNUM,
                        ZMAT_NUM: e.ZMAT_NUM,
                        ZTRGT_QTY: e.ZTRGT_QTY,
                        ZTRGT_QTYUOM: e.ZTRGT_QTYUOM,
                        ZALT_UOM: e.ZALT_UOM,
                        ZREQ_DLVRYDAT: t.format(e.ZREQ_DLVRYDAT),
                        ZMIN_QTY: e.ZMIN_QTY,
                        ZFOC_SMPL: e.ZFOC_SMPL,
                        ZORD_NUM: "",
                        ZITEM_NUM: "",
                        ZDISCNT: e.ZDISCNT,
                        ZCOST: e.ZCOST,
                        ZGRP_DEVLPR: e.ZGRP_DEVLPR,
                        ZFROZEN_PERIOD: e.ZFROZEN_PERIOD,
                        ZPAL_QUAN: e.ZPAL_QUAN,
                        ZFOC_ITMC_FLAG: e.ZFOC_ITMC_FLAG,
                        ZSCHD_TYPE: e.ZSCHD_TYPE
                    })
                })
            }
            var f = {
                ZORDER_HEADER: [{
                    ZINTR_ORDNUM: T.getData().ZINTR_ORDNUM,
                    ZSYSTEM: T.getData().ZSYSTEM,
                    ZORD_REF: "X",
                    ZCUST_NUM: T.getData().ZCUST_NUM,
                    ZSHIP_PRTY: T.getData().ZSHIP_PRTY,
                    ZPO_TYP: "X",
                    ZDISCNT: T.getData().ZDISCNT,
                    ZCUST_PONUM: T.getData().ZCUST_PONUM,
                    ZCUST_PODAT: this.formatDate1(T.getData().ZCUST_PODAT),
                    ZDOC_ID: T.getData().ZDOC_ID,
                    ZORD_STATUS: "ORCR",
                    ZORD_NUM: "",
                    ZAPPROVAL_STATUS: "Order Created",
                    ZLEAD_TIME: n,
                    ZMIN_ORDER_QUAN: l,
                    ZORDER_FORECAST: u,
                    ZFIT_CONTRACT_COND: g,
                    ZREQ_DELV_DAT: R,
                    ZTEDER_FLAG: T.getData().ZTEDER_FLAG,
                    ZSALES_AREA: T.getData().ZSALES_AREA,
                    ZTOTAL_AMT: T.getData().ZTOTAL_AMT,
                    ZFTRADE: T.getData().ZFTRADE,
                    ZFTRADE_DESC: T.getData().ZFTRADE_DESC,
                    ZCURR: T.getData().ZCURR,
                    ZHCURR: T.getData().ZHCURR,
                    ZDISTR_CHNL: T.getData().ZDISTR_CHNL,
                    ZDIVISION: T.getData().ZDIVISION,
                    ZDEL_BLOCK_ID: T.getData().ZDEL_BLOCK_ID,
                    ZORD_APPROVAL_STATUS: "A",
                    ZCOMMENTS: i,
                    ZCREATED_BY: T.getData().ZCREATED_BY,
                    ZCHANGED_BY: this.getOwnerComponent().sUserId
                }],
                ZORDER_ITEM: c
            };
            var A = _.getData();
            if (A.length > 0) {
                A.forEach(function (e) {
                    if (e.ZFOC_SMPL === "YYAN") {
                        I = ""
                    } else {
                        I = e.ZFOC_SMPL
                    }
                    Z.push({
                        ItmNumber: e.ZINTR_ITEMNUM.toString(),
                        Matnr: e.ZMAT_NUM,
                        TargQty: e.ZTRGT_QTY,
                        ItmCateg: I,
                        GroupDev: e.ZGRP_DEVLPR,
                        FreeCharge: e.ZFOC_ITMC_FLAG
                    })
                })
            }
            var N = _.getData();
            if (N.length > 0) {
                N.forEach(function (e) {
                    C.push({
                        ItmNumber: e.ZINTR_ITEMNUM.toString(),
                        CondType: "",
                        CondValue: e.ZDISCNT,
                        Currency: "",
                        GroupDev: e.ZGRP_DEVLPR
                    })
                })
            }
            var m;
            var v;
            var y = _.getData();
            if (y.length > 0) {
                y.forEach(function (e) {
                    m = M.format(e.ZREQ_DLVRYDAT);
                    if (m) {
                        v = m + "T00:00:00"
                    } else {
                        v = "2021-01-29" + "T00:00:00"
                    }
                    S.push({
                        ItmNumber: e.ZINTR_ITEMNUM.toString(),
                        SchedLine: e.ZINTR_ITEMNUM.toString(),
                        ReqQty: e.ZTRGT_QTY,
                        SchedType: e.ZSCHD_TYPE,
                        FirstDate: v,
                        GroupDev: e.ZGRP_DEVLPR,
                        FreeCharge: e.ZFOC_ITMC_FLAG
                    })
                })
            }
            var P = "";
            var U = T.getData().ZSYSTEM;
            var w = this.getView().getModel("jsonSystemData").getData();
            for (var L = 0; L < w.length; L++) {
                if (w[L].Yydesc === "LEAN" && U === "L") {
                    P = w[L].Yylow
                } else if (w[L].Yydesc === "TEMPO" && U === "T") {
                    P = w[L].Yylow
                }
            }
            var V;
            var Y;
            if (R) {
                V = R + "T00:00:00"
            } else {
                V = this.formatDate1(new Date) + "T00:00:00"
            }
            if (p) {
                Y = p + "T00:00:00"
            } else {
                Y = ""
            }
            var F = this.getView().getModel("viewProperties1");
            var B = {
                IvSoldParty: T.getData().ZCUST_NUM,
                IvDlvBlock: T.getData().ZDEL_BLOCK_ID,
                IvCondValue: T.getData().ZDISCNT,
                IvDistchanl: T.getData().ZDISTR_CHNL,
                IvTextLine: i,
                IvTendFlag: T.getData().ZTEDER_FLAG,
                IvDivision: T.getData().ZDIVISION,
                IvOrdReason: "Y01",
                IvSalesorg: T.getData().ZSALES_AREA,
                IvShipParty: T.getData().ZSHIP_PRTY,
                IvSyssid: P,
                Ivdoctype: "YOR",
                IvReqdt: V,
                IvPurchdt: Y,
                IvPomethod: "WEB",
                IvCustRef: T.getData().ZCUST_PONUM,
                Ftrade: T.getData().ZFTRADE,
                EvSono: "",
                IvCurrency: T.getData().ZCURR,
                Navsocrtescheduleline: S,
                NavSoheaditem: Z,
                NavSocrtCondition: C,
                navSoinputreturn: [],
                ysocrtgroupoutNav: []
            };
            var b = this;
            var Q = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
            if (r.getState() === true && a.getState() === true && s.getState() === true && o.getState() === true) {
                //sap.ui.core.BusyIndicator.show();
                b.getOwnerComponent().getModel("MOETSRV").create("/YSOCREATEinputSet", B, {
                    method: "POST",
                    success: function (e, r) {
                        sap.ui.core.BusyIndicator.hide();
                        var a = [];
                        var s;
                        if (e.EvSono !== "") {
                            f.ZORDER_HEADER[0].ZORD_NUM = e.EvSono;
                            e.ysocrtgroupoutNav["results"].sort(function (e, t) {
                                if (e.ItemNumber < t.ItemNumber) return -1;
                                if (e.ItemNumber > t.ItemNumber) return 1;
                                return 0
                            });
                            for (var o = 0; o < e.ysocrtgroupoutNav["results"].length; o++) {
                                a[o] = e.ysocrtgroupoutNav["results"][o].SoNumber;
                                if (f.ZORDER_ITEM[o].ZINTR_ITEMNUM.toString() === Number(e.ysocrtgroupoutNav["results"][o].ItemNumber).toString()) {
                                    f.ZORDER_ITEM[o].ZORD_NUM = e.ysocrtgroupoutNav["results"][o].SoNumber;
                                    f.ZORDER_ITEM[o].ZITEM_NUM = e.ysocrtgroupoutNav["results"][o].ItemNumber
                                }
                            }
                            a = b.getUnique(a);
                            b._onClearOrder();
                            b.onAddCM1Close();
                            s = "Order Approved and Created. " + "Sales Document Number: " + a.toString();
                            D.show(s, {
                                icon: D.Icon.SUCCESS,
                                title: "SUCCESS",
                                actions: [D.Action.CLOSE],
                                styleClass: "sapUiSizeCompact myMessageBox"
                            });
                            $.ajax({
                                url: Q,
                                type: "POST",
                                data: JSON.stringify(f),
                                dataType: "json",
                                contentType: "application/json",
                                success: function (e, r) {
                                    t.refresh()
                                },
                                error: function (e) {
                                    sap.ui.core.BusyIndicator.hide();
                                    D.show(e.responseJSON.message, {
                                        icon: D.Icon.ERROR,
                                        title: "Error",
                                        onClose: this.onAssignClose,
                                        actions: [D.Action.CLOSE],
                                        styleClass: "sapUiSizeCompact myMessageBox"
                                    })
                                }
                            })
                        } else {
                            if (e.navSoinputreturn["results"].length === 1) {
                                s = e.navSoinputreturn["results"][0].Message;
                                D.show(s, {
                                    icon: D.Icon.ERROR,
                                    title: "ERROR",
                                    actions: [D.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                })
                            } else {
                                var i = new sap.ui.model.json.JSONModel;
                                i.setData(e.navSoinputreturn.results);
                                if (!b.ErrorMessageDialog) {
                                    b.ErrorMessageDialog = sap.ui.xmlfragment("entrytool.fragments.ErrorMessage", b);
                                    b.getView().addDependent(b.ErrorMessageDialog);
                                    b.ErrorMessageDialog.setModel(i, "oErrorJson")
                                }
                                b.ErrorMessageDialog.open()
                            }
                        }
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                        D.show("Error")
                    }
                })
            } else {
                D.show("Check all boxes, for the order to be approved", {
                    icon: D.Icon.ERROR,
                    title: "Approve Orders",
                    styleClass: "sapUiSizeCompact",
                    initialFocus: "Approve"
                })
            }
        },
        onCloseErrorMessage: function () {
            this.ErrorMessageDialog.close()
        },
        onCommentfun: function (e) {
            var t = this;
            var r = /^(?![0-9].*$).*/;
            var a = sap.ui.getCore().byId("idCommentsinput").getValue();
            if (!a.match(r) || a.length >= 132) {
                sap.ui.getCore().byId("idCommentsinput").setValueState("Error")
            } else {
                sap.ui.getCore().byId("idCommentsinput").setValueState("None")
            }
            var s = "/132";
            var o = "" + e.mParameters.newValue.length + "";
            var i = o.concat(s);
            var n = sap.ui.getCore().byId("idText").setText(i)
        },
        getUnique: function (e) {
            var t = [];
            for (var r = 0; r < e.length; r++) {
                if (t.indexOf(e[r]) === -1) {
                    t.push(e[r])
                }
            }
            return t
        },
        onReview: function () {
            var e = "";
            var t = this.getOwnerComponent().getModel();
            var a = sap.ui.getCore().byId("idlead");
            var s = sap.ui.getCore().byId("idmin");
            var o = sap.ui.getCore().byId("idchk");
            var i = sap.ui.getCore().byId("iddisc");
            var n = sap.ui.getCore().byId("idCommentsinput").getValue();
            var l = "",
                u = "",
                g = "",
                d = "";
            if (a.getState()) {
                l = "X"
            }
            if (s.getState()) {
                u = "X"
            }
            if (o.getState()) {
                g = "X"
            }
            if (i.getState()) {
                d = "X"
            }
            var _ = sap.ui.getCore().byId("ID_OPEN_ORDER12");
            var T = this.getView().getModel("OrderData12");
            var c = this._oCM1iDialog.getModel("OrderData1");
            this._getSalesAreaValueApprove(c.getData(), c.getData().ZSALES_AREA);
            var Z = [];
            var C = [];
            var S = [];
            var O = [];
            var E = T.getData()[0].ZREQ_DLVRYDAT;
            var M = c.getData().ZCUST_PODAT;
            var R = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "YYYY-MM-dd"
            });
            var p = R.format(E);
            var h = R.format(M);
            var I = T.getData();
            if (I.length > 0) {
                I.forEach(function (e) {
                    var t = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: "YYYY-MM-dd"
                    });
                    Z.push({
                        ZINTR_ORDNUM: c.getData().ZINTR_ORDNUM,
                        ZSYSTEM: c.getData().ZSYSTEM,
                        ZINTR_ITEMNUM: e.ZINTR_ITEMNUM,
                        ZMAT_NUM: e.ZMAT_NUM,
                        ZTRGT_QTY: e.ZTRGT_QTY,
                        ZTRGT_QTYUOM: e.ZTRGT_QTYUOM,
                        ZALT_UOM: e.ZALT_UOM,
                        ZREQ_DLVRYDAT: t.format(e.ZREQ_DLVRYDAT),
                        ZMIN_QTY: e.ZMIN_QTY,
                        ZFOC_SMPL: e.ZFOC_SMPL,
                        ZORD_NUM: "",
                        ZITEM_NUM: "",
                        ZDISCNT: e.ZDISCNT,
                        ZCOST: e.ZCOST,
                        ZGRP_DEVLPR: e.ZGRP_DEVLPR,
                        ZFROZEN_PERIOD: e.ZFROZEN_PERIOD,
                        ZPAL_QUAN: e.ZPAL_QUAN,
                        ZFOC_ITMC_FLAG: e.ZFOC_ITMC_FLAG,
                        ZSCHD_TYPE: e.ZSCHD_TYPE
                    })
                })
            }
            var f = {
                ZORDER_HEADER: [{
                    ZINTR_ORDNUM: c.getData().ZINTR_ORDNUM,
                    ZSYSTEM: c.getData().ZSYSTEM,
                    ZORD_REF: "X",
                    ZCUST_NUM: c.getData().ZCUST_NUM,
                    ZSHIP_PRTY: c.getData().ZSHIP_PRTY,
                    ZPO_TYP: "X",
                    ZDISCNT: c.getData().ZDISCNT,
                    ZCUST_PONUM: c.getData().ZCUST_PONUM,
                    ZCUST_PODAT: this.formatDate1(c.getData().ZCUST_PODAT),
                    ZDOC_ID: c.getData().ZDOC_ID,
                    ZORD_STATUS: "SNOR",
                    ZORD_NUM: "",
                    ZAPPROVAL_STATUS: "Order Created",
                    ZLEAD_TIME: l,
                    ZMIN_ORDER_QUAN: u,
                    ZORDER_FORECAST: g,
                    ZFIT_CONTRACT_COND: d,
                    ZREQ_DELV_DAT: p,
                    ZTEDER_FLAG: c.getData().ZTEDER_FLAG,
                    ZSALES_AREA: c.getData().ZSALES_AREA,
                    ZTOTAL_AMT: c.getData().ZTOTAL_AMT,
                    ZFTRADE: c.getData().ZFTRADE,
                    ZFTRADE_DESC: c.getData().ZFTRADE_DESC,
                    ZCURR: c.getData().ZCURR,
                    ZHCURR: c.getData().ZHCURR,
                    ZDISTR_CHNL: c.getData().ZDISTR_CHNL,
                    ZDIVISION: c.getData().ZDIVISION,
                    ZDEL_BLOCK_ID: c.getData().ZDEL_BLOCK_ID,
                    ZORD_APPROVAL_STATUS: "A",
                    ZCOMMENTS: n,
                    ZCREATED_BY: c.getData().ZCREATED_BY,
                    ZCHANGED_BY: this.getOwnerComponent().sUserId
                }],
                ZORDER_ITEM: Z
            };
            var A = new r;
            A.setData(f);
            //sap.ui.core.BusyIndicator.show();
            var N = this;
            var m = "/HANAXS/com/merckgroup/moet/services/xsjs/order.xsjs";
            $.ajax({
                url: m,
                type: "POST",
                data: JSON.stringify(f),
                dataType: "json",
                contentType: "application/json",
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    D.show("Order " + f.ZORDER_HEADER[0].ZINTR_ORDNUM + " is Reviewed", {
                        icon: D.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.refresh();
                    N.onAddCM1Close()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    N.onAddCM1Close();
                    D.show(e.responseJSON.message, {
                        icon: D.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [D.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        _getSalesAreaValueApprove: function (e, t) {
            var r = this;
            var a;
            var s = this.getView().getModel("viewProperties1");
            var o = e.ZSYSTEM;
            var i = this.getView().getModel("jsonSystemData").getData();
            for (var n = 0; n < i.length; n++) {
                if (i[n].Yydesc === "LEAN" && o === "L") {
                    a = i[n].Yylow
                } else if (i[n].Yydesc === "TEMPO" && o === "T") {
                    a = i[n].Yylow
                }
            }
            var l = "/ysaleAreaInputSet(IvCustomer='" + e.ZCUST_NUM + "',IvSyssid='" + a + "')";
            //sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(l, {
                urlParameters: {
                    $expand: "NavsalesArea"
                },
                success: function (e, r) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.NavsalesArea.results.length === 0) {
                        return
                    }
                    if (e.NavsalesArea.results.length) {
                        for (var a = 0; a < e.NavsalesArea.results.length; a++) {
                            if (e.NavsalesArea.results[a].Salesorg === t) { }
                        }
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }.bind(this)
            })
        },
        _getShipToValueApprove: function (e, t) {
            var r = this.getView().getModel("viewProperties1");
            var a = this.getOwnerComponent().getModel(),
                s = "/CustomerShipToPartyAssignDetails";
            //sap.ui.core.BusyIndicator.show();
            //sap.ui.core.BusyIndicator.show();
            a.read(s, {
                filters: [new g("ZCUSTMR_NUM", "EQ", e.ZCUST_NUM)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.results.length === 0) {
                        return
                    }
                    if (e.results.length) {
                        for (var a = 0; a < e.results.length; a++) {
                            if (e.results[a].ZSHIP_TO_PARTY === t) {
                                var s, o;
                                if (e.results[a].ZCITY === "" || e.results[a].ZCITY === null) {
                                    s = ""
                                } else {
                                    s = e.results[a].ZCITY
                                }
                                if (e.results[a].ZPOSTAL_CODE === null || e.results[a].ZPOSTAL_CODE === null) {
                                    o = ""
                                } else {
                                    o = e.results[a].ZPOSTAL_CODE
                                }
                                var i = s + " " + o;
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
        onAddCM1Close: function () {
            this._oCM1iDialog.close();
            this._oCM1iDialog.getModel("OrderData1").refresh();
            this._oCM1iDialog.getModel("OrderDataF").refresh();
            if (this._oCM1iDialog) {
                this._oCM1iDialog = this._oCM1iDialog.destroy()
            }
        },
        getConfirmOrderData: function (e) {
            var t = this.getOwnerComponent().getModel(),
                r = e.ZINTR_ORDNUM,
                a = e.ZORD_NUM,
                s = "/OrderHeaderDetails";
            //sap.ui.core.BusyIndicator.show();
            var o = new sap.ui.model.json.JSONModel;
            var i = new sap.ui.model.json.JSONModel;
            var n = this.getView().getModel("viewProperties1");
            n.setProperty("/ZDOC_ID", "");
            n.setProperty("/FileName", "");
            var l = this;
            var u = {};
            t.read(s, {
                filters: [new g("ZINTR_ORDNUM", "EQ", r), new g("ZORD_NUM", "EQ", a)],
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    o.setData(t.results[0]);
                    u = t.results;
                    n.setProperty("/ZDOC_ID", t.results[0].ZDOC_ID);
                    var r = n.getProperty("/ZDOC_ID"),
                        s, d;
                    if (r) {
                        d = r.split("_MOET_")[0];
                        s = r.split("T_S")[1];
                        n.setProperty("/FileName", s)
                    }
                    var D = l.getOwnerComponent().getModel(),
                        _ = e.ZINTR_ORDNUM,
                        T = "/OrderItemDetails";
                    //sap.ui.core.BusyIndicator.show();
                    l._getShipToValueApprove(t.results[0], t.results[0].ZSHIP_PRTY);
                    var c = new sap.ui.model.json.JSONModel;
                    D.read(T, {
                        filters: [new g("ZINTR_ORDNUM", "EQ", _), new g("ZORD_NUM", "EQ", a)],
                        success: function (e) {
                            sap.ui.core.BusyIndicator.hide();
                            c.setData(e.results);
                            l.getView().setModel(c, "OrderData12");
                            l.getView().setModel(o, "OrderData1");
                            var t = {
                                header: l.getView().getModel("OrderData1"),
                                item: l.getView().getModel("OrderData12")
                            };
                            i.setData(t);
                            if (!l._ConfirmDialog) {
                                l._ConfirmDialog = sap.ui.xmlfragment("entrytool.fragments.confirmedOrders", l);
                                l.getView().addDependent(l._ConfirmDialog);
                                l._ConfirmDialog.setModel(o, "OrderData1");
                                l._ConfirmDialog.setModel(i, "OrderDataF")
                            }
                            l._ConfirmDialog.open()
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
        onConfirmDilogClose: function () {
            if (this._ConfirmDialog) {
                this._ConfirmDialog.close();
                this._ConfirmDialog.getModel("OrderData1").refresh();
                this._ConfirmDialog.getModel("OrderDataF").refresh()
            }
            if (this._ConfirmDialog) {
                this._ConfirmDialog = this._ConfirmDialog.destroy()
            }
            if (this._oCM1iDialog) {
                this._oCM1iDialog.close();
                this._oCM1iDialog.getModel("OrderData1").refresh()
            }
            if (this._oCM1iDialog) {
                this._oCM1iDialog = this._oCM1iDialog.destroy()
            }
        },
        _handleValidation: function () {
            var e = this.getView();
            var t = this.getView().getModel("jsonViewMod");
            var r = [sap.ui.getCore().byId("f4hCustomer"), sap.ui.getCore().byId("idcpono"), sap.ui.getCore().byId("idcpodate")];
            var a = false;
            jQuery.each(r, function (e, t) {
                if (t.getValue()) {
                    t.setValueState("None");
                    a = true
                } else {
                    t.setValueState("Error");
                    a = false
                }
            });
            jQuery.each(r, function (e, t) {
                if (t.getValueState() === "Error") {
                    a = false
                }
            });
            if (a === true) {
                a = this.handleAmountValid()
            }
            if (!a) {
                sap.m.MessageBox.alert("Please fill all required fields")
            }
            return a
        },
        handleAmountValid: function () {
            var e = sap.ui.getCore().byId("tblupdateorder"),
                t = e.getItems(),
                r = false;
            jQuery.each(t, function (e, t) {
                var a = t.getCells();
                jQuery.each(a, function (e, t) {
                    if (e === 0 || e === 4 || e === 5) {
                        if (t.getValue().toString().length > 0) {
                            r = true;
                            t.setValueState("None")
                        } else {
                            t.setValueState("Error")
                        }
                    }
                    if (e === 4) {
                        var a = t.getValue();
                        if (t.getValue().toString().length > 0 && a !== 0) {
                            r = true;
                            t.setValueState("None")
                        } else {
                            t.setValueState("Error")
                        }
                    }
                })
            });
            jQuery.each(t, function (e, t) {
                var a = t.getCells();
                jQuery.each(a, function (e, t) {
                    if (e === 0 || e === 4 || e === 5) {
                        if (t.getValueState() === "Error") {
                            r = false
                        }
                    }
                })
            });
            return r
        }
    })
});