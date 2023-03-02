sap.ui.define([
    "entrytool/controller/BaseController", 
    "sap/ui/model/json/JSONModel", 
    "entrytool/model/formatter", 
    "sap/ui/model/Filter", "sap/ui/model/Sorter", "sap/m/Token", 
    "sap/ui/model/FilterOperator", "sap/m/MessageBox", 
    "sap/ui/export/Spreadsheet"
], function (e, t, s, o, i, a, r, n, l) {
    "use strict";
    return e.extend("entrytool.controller.CustomerMaster", {
        custFormatter: s,
        handlePressOpenMenu: function (e) {
            var t = e.getSource();
            if (!this._menu) {
                this._menu = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.MenuItem", this);
                this.getView().addDependent(this._menu)
            }
            var s = sap.ui.core.Popup.Dock;
            this._menu.open(this._bKeyboard, t, s.BeginTop, s.BeginBottom, t)
        },
        handleChange: function () {
            var e = sap.ui.getCore().byId("ID_ASS_MAT");
            e.setEnabled(false)
        },
        formatShipTo: function (e) {
            if (e === "L") {
                return "LEAN"
            } else {
                return "TEMPO"
            }
        },
        handleChangeShipto: function () {
            var e = sap.ui.getCore().byId("idShiptoCustinput").getValue();
            var s = sap.ui.getCore().byId("idShiptoAinput").getValue();
            var o = sap.ui.getCore().byId("idShiptoAinput");
            if (o.getValue() === "") {
                o.setValueState("Error")
            } else {
                o.setValueState("None")
            }
            var i = sap.ui.getCore().byId("idShiptoSystAinput").getValue();
            var a;
            var r = this.getView().getModel("jsonSystemData").getData();
            for (var n = 0; n < r.length; n++) {
                if (r[n].Yydesc === "LEAN" && i === "LEAN") {
                    a = r[n].Yylow
                } else if (r[n].Yydesc === "TEMPO" && i === "TEMPO") {
                    a = r[n].Yylow
                }
            }
            var l = "/ycustomervalidationSet(IvCustomer='" + e + "',IvShipParty='" + s + "',IvSyssid='" + a + "')";
            this.getOwnerComponent().getModel("MOETSRV").read(l, {
                success: function (e, s) {
                    var o = new t;
                    o.setData(e);
                    sap.ui.getCore().byId("idShiptoDescAinput").setValue(e.ShipToPartyDesc);
                    sap.ui.getCore().byId("idShiptoCityAinput").setValue(e.ShipToCity);
                    sap.ui.getCore().byId("idShiptoPoAinput").setValue(e.ShipToPostcode);
                    sap.ui.getCore().byId("idShiptoRegAinput").setValue(e.ShipToRegion)
                }.bind(this),
                error: function (e) { }.bind(this)
            })
        },
        handleChangeFtrade: function () {
            var e = sap.ui.getCore().byId("idFtradeCustinput").getValue();
            var s = sap.ui.getCore().byId("idFtradeAinput").getValue();
            var o = sap.ui.getCore().byId("idFtradeSystAinput").getValue();
            var i;
            var a = sap.ui.getCore().byId("idFtradeAinput");
            if (a.getValue() === "") {
                a.setValueState("Error")
            } else {
                a.setValueState("None")
            }
            var r = this.getView().getModel("jsonSystemData").getData();
            for (var n = 0; n < r.length; n++) {
                if (r[n].Yydesc === "LEAN" && o === "LEAN") {
                    i = r[n].Yylow
                } else if (r[n].Yydesc === "TEMPO" && o === "TEMPO") {
                    i = r[n].Yylow
                }
            }
            var l = "/ycustomervalidationSet(IvCustomer='" + e + "',IvShipParty='" + s.toUpperCase() + "',IvSyssid='" + i + "')";
            this.getOwnerComponent().getModel("MOETSRV").read(l, {
                success: function (e, s) {
                    var o = new t;
                    o.setData(e);
                    sap.ui.getCore().byId("idFtradeADescinput").setValue(e.ShipToPartyDesc);
                    sap.ui.getCore().byId("idFtCityAinput").setValue(e.ShipToCity);
                    sap.ui.getCore().byId("idFtPcAinput").setValue(e.ShipToPostcode);
                    sap.ui.getCore().byId("idFtRegAinput").setValue(e.ShipToRegion)
                }.bind(this),
                error: function (e) { }.bind(this)
            })
        },
        onValidate: function () {
            var e = sap.ui.getCore().byId("ID_ASS_MAT");
            e.setEnabled(true);
            n.show("Materials are Validated", {
                icon: n.Icon.SUCCESS,
                title: "SUCCESS",
                onClose: this.onAssignClose,
                actions: [n.Action.CLOSE],
                styleClass: "sapUiSizeCompact myMessageBox"
            })
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
            var s = sap.ui.core.Popup.Dock;
            this._new.open(this._bKeyboard, t, s.BeginTop, s.BeginBottom, t)
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
            this.getRouter().getRoute("CustomerMaster").attachPatternMatched(this._onRouteMatched, this);
            this._loadODataUtils();
            this._getSystem();
            this.fNotification = [];
            var e = new t;
            this._oViewPropertiesCust = new t({
                custNo: "",
                customerid: "C001",
                bsystem: "",
                CustomerName: "",
                city: "",
                Street: "",
                State: "",
                Region: "",
                pocode: "",
                ShipTo: "",
                SalesOrganization: "",
                DistributionChannel: "",
                Division: "",
                SalesGroup: "",
                SalesOffice: "",
                Currency: ""
            });
            this.getView().setModel(this._oViewPropertiesCust, "viewPropertiesCust");
            this._oViewPropertiesMat = new t({
                matDesc: "",
                matNo: ""
            });
            this.getView().setModel(this._oViewPropertiesMat, "viewPropertiesMat");
            this._oViewPropertiesSO = new t({
                salesArea: "",
                salesId: "",
                Distrchn: "",
                Division: ""
            });
            this.getView().setModel(this._oViewPropertiesSO, "viewPropertiesSO");
            this._oViewPropertiesCMatA = new t({
                matNo: "",
                custNo: "",
                itmCat: "",
                matDec: "",
                bsystem: ""
            });
            this.getView().setModel(this._oViewPropertiesCMatA, "viewPropertiesCMatA");
            this.getItemCategoryData()
        },
        fnSelectSystem: function (e) {
            var s = sap.ui.getCore().byId("idUominput1w").getSelectedKey();
            var i = this.getView().getModel("customerTest");
            var a = this.getView().getModel("viewPropertiesCust");
            var r = sap.ui.getCore().byId("idMaterialinput1w");
            if (r.getValue() === "") {
                r.setValueState("Error")
            } else {
                r.setValueState("None")
            }
            var l = new o({
                filters: [new o("IvCustomer", "EQ", "210100139"), new o("IvShipParty", "EQ", "210100139"), new o("IvSyssid", "EQ", "DLACLNT100")],
                and: true
            });
            var g = sap.ui.getCore().byId("idMaterialinput1w").getValue();
            this._getDeliveryBlock(sap.ui.getCore().byId("idUominput1w").getSelectedKey());
            var c = sap.ui.getCore().byId("idUominput1w").getSelectedKey();
            var u;
            var C = this.getView().getModel("jsonSystemData").getData();
            for (var d = 0; d < C.length; d++) {
                if (C[d].Yydesc === "LEAN" && c === "L") {
                    u = C[d].Yylow
                } else if (C[d].Yydesc === "TEMPO" && c === "T") {
                    u = C[d].Yylow
                }
            }
            if (g === "") {
                return
            }
            var p = "/ycustomervalidationSet(IvCustomer='" + g + "',IvShipParty='" + g + "',IvSyssid='" + u + "')";
            sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(p, {
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    if (e.Retmsg === "") {
                        var o = new t;
                        o.setData(e);
                        sap.ui.getCore().byId("idQuantityinputE1w").setValue(e.CustmCity);
                        sap.ui.getCore().byId("idQuantityinput1w").setValue(e.CustmName);
                        sap.ui.getCore().byId("idCustStreet").setValue(e.CustmStreet);
                        sap.ui.getCore().byId("idQuantityinputE21w").setValue(e.CustmRegion);
                        sap.ui.getCore().byId("idQuantityinputE31w").setValue(e.PostalCode)
                    } else {
                        this.fnClearAllValue();
                        n.show(e.Retmsg, {
                            icon: n.Icon.ERROR,
                            title: "Error",
                            onClose: this.onAssignClose,
                            actions: [n.Action.CLOSE],
                            styleClass: "sapUiSizeCompact myMessageBox"
                        })
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    this.fnClearAllValue();
                    n.show("Please enter correct customer number", {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }.bind(this)
            })
        },
        fnClearAllValue: function () {
            var e = this.getView().getModel("viewPropertiesCust");
            e.setProperty("/bsystem", "");
            e.setProperty("/CustomerName", "");
            e.setProperty("/city", "");
            e.setProperty("/Street", "");
            e.setProperty("/State", "");
            e.setProperty("/Region", "");
            e.setProperty("/pocode", "");
            e.setProperty("/ShipTo", "");
            e.setProperty("/SalesOrganization", "");
            e.setProperty("/DistributionChannel", "");
            e.setProperty("/Division", "");
            e.setProperty("/SalesGroup", "");
            e.setProperty("/SalesOffice", "");
            e.setProperty("/Currency", "")
        },
        _onRouteMatched: function (e) {
            this.onDataReceived();
            this.getVisiblePlaceOrder();
            var t = this;
            setInterval(function () {
                t.userLogin()
            }, 3e5)
        },
        onDataReceived: function () {
            var e = this.getView().byId("smartTable").getTable(),
                t = 0,
                s = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = s.length; t > 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onBeforeRebindTable: function (e) {
            this.oDownLoadFilters = e.getParameter("bindingParams").filters
        },
        onAddCMClose: function () {
            this._oCMiDialog.close();
            if (this._oCMiDialog) {
                this._oCMiDialog = this._oCMiDialog.destroy()
            }
        },
        onAddCMPress: function () {
            this.fnClearAllValue();
            if (!this._oCMiDialog) {
                this._oCMiDialog = sap.ui.xmlfragment("entrytool.fragments.customerMaster", this);
                this.getView().addDependent(this._oCMiDialog)
            }
            this._oCMiDialog.open()
        },
        onAssignMaterial: function (e) {
            var s;
            if (e.getId() === "press") {
                s = e.getSource();
                this.oSourceMat = s
            } else {
                s = e
            }
            this.oGetRowValue = new t(JSON.parse(JSON.stringify(s._getBindingContext().getObject())));
            this._getAssignMaterial(function () {
                if (!this._oMatAssgnDialog) {
                    this._oMatAssgnDialog = sap.ui.xmlfragment("entrytool.fragments.materialAssignment", this);
                    this.getView().addDependent(this._oMatAssgnDialog)
                }
                this._oMatAssgnDialog.open()
            }.bind(this))
        },
        _getAssignMaterial: function (e) {
            var t = this.getView().getModel("viewPropertiesCust");
            t.setProperty("/custNo", this.oGetRowValue.getData().ZCUSTMR_NUM);
            t.setProperty("/bsystem", this.oGetRowValue.getData().ZSYSTEM);
            var s = new sap.ui.model.json.JSONModel,
                i = this.getOwnerComponent().getModel(),
                a = "/CustomerMatAssignDetails";
            i.read(a, {
                filters: [new o("ZCUST_NUM", "EQ", this.oGetRowValue.getData().ZCUSTMR_NUM)],
                success: function (t) {
                    s.setData(t.results);
                    s.setSizeLimit(t.results.length);
                    if (e) {
                        e()
                    }
                    this._oMatAssgnDialog.setModel(s, "materialAssignment")
                }.bind(this),
                error: function (e) { }
            })
        },
        onMatAssignClose: function () {
            this._oMatAssgnDialog.close();
            if (this._oMatAssgnDialog) {
                this._oMatAssgnDialog = this._oMatAssgnDialog.destroy()
            }
        },
        onAssignMatPress: function (e) {
            var s = this;
            var i = this.getView().getModel("viewPropertiesMat");
            i.setProperty("/matNo", "");
            var a = this.getView().getModel("viewPropertiesSO");
            a.setProperty("/salesId", "");
            a.setProperty("/Distrchn", "");
            a.setProperty("/Division", "");
            var r = this.getView().getModel("viewPropertiesCust").getProperty("/custNo");
            var n = "";
            var l = this.getView().getModel("viewPropertiesCust").getProperty("/bsystem");
            var g = this.getView().getModel("jsonSystemData").getData();
            for (var c = 0; c < g.length; c++) {
                if (g[c].Yydesc === "LEAN" && l === "L") {
                    n = g[c].Yylow
                } else if (g[c].Yydesc === "TEMPO" && l === "T") {
                    n = g[c].Yylow
                }
            }
            var u = "/MaterialDetails",
                C = new o("ZSYSTEM", "EQ", l);
            var d = new t;
            var p = this.getOwnerComponent().getModel();
            p.read(u, {
                filters: [C],
                success: function (e) {
                    d.setData(e.results);
                    s.getView().setModel(d, "oModelmat1")
                },
                error: function (e) { }
            });
            var S = "/ysaleAreaInputSet(IvCustomer='" + r + "',IvSyssid='" + n + "')";
            this.getOwnerComponent().getModel("MOETSRV").read(S, {
                urlParameters: {
                    $expand: "NavsalesArea"
                },
                success: function (e, o) {
                    var i = new t;
                    i.setData(e.NavsalesArea.results);
                    s.getView().setModel(i, "SalesOfficeMA");
                    if (!s._oAssMatDialog) {
                        s._oAssMatDialog = sap.ui.xmlfragment("entrytool.fragments.assignMaterial", s);
                        s.getView().addDependent(s._oAssMatDialog)
                    }
                    this._oAssMatDialog.open()
                }.bind(this),
                error: function (e) { }.bind(this)
            })
        },
        onSalesRequestMA: function (e) {
            var t;
            this._material = e.getSource();
            var s = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.SalesOffcF4HelpMA) {
                this.SalesOffcF4HelpMA = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.SalesOffcF4HelpMA", this);
                t.addDependent(this.SalesOffcF4HelpMA)
            }
            this.SalesOffcF4HelpMA.open()
        },
        handleSalesOffcSearchMA: function (e) {
            var t = e.getParameter("value");
            var s = new o("Salesorg", "Contains", t.toUpperCase());
            var i = e.getSource().getBinding("items");
            var a = new o({
                filters: [s],
                and: false
            });
            i.filter([a])
        },
        onPressSalesOffcValueListMAClose: function (e) {
            var t = e.getParameter("selectedContexts");
            var s = e.getParameter("selectedItem");
            var o = this.getView().getModel("viewPropertiesSO");
            var i = this;
            if (t && t.length) {
                var a = s.getBindingContext("SalesOfficeMA").getObject();
                o.setProperty("/salesId", a.Salesorg);
                o.setProperty("/Distrchn", a.Distrchn);
                o.setProperty("/Division", a.Division)
            }
            e.getSource().getBinding("items").filter([])
        },
        onAssignMatClose: function () {
            this._oAssMatDialog.close();
            if (this._oAssMatDialog) {
                this._oAssMatDialog = this._oAssMatDialog.destroy()
            }
        },
        onAssignShiptoPress: function (e) {
            if (!this._oAssShiptoDialog) {
                this._oAssShiptoDialog = sap.ui.xmlfragment("entrytool.fragments.assignShipto", this);
                this.getView().addDependent(this._oAssShiptoDialog)
            }
            this._oAssShiptoDialog.open()
        },
        onAssignShiptoClose: function (e) {
            this._oAssShiptoDialog.close();
            sap.ui.getCore().byId("idShiptoAinput").setValue("");
            sap.ui.getCore().byId("idShiptoDescAinput").setValue("");
            sap.ui.getCore().byId("idShiptoCityAinput").setValue("");
            sap.ui.getCore().byId("idShiptoRegAinput").setValue("");
            sap.ui.getCore().byId("idShiptoPoAinput").setValue("");
            if (this._oAssShiptoDialog) {
                this._oAssShiptoDialog = this._oAssShiptoDialog.destroy()
            }
        },
        onShipClose: function () {
            this._oShipDialog.close();
            if (this._oShipDialog) {
                this._oShipDialog = this._oShipDialog.destroy()
            }
        },
        onShipPress: function (e) {
            var s;
            if (e.getId() === "press") {
                s = e.getSource();
                this.oSourceMat = s
            } else {
                s = e
            }
            this.oGetPerticulterRowValue = new t(JSON.parse(JSON.stringify(s._getBindingContext().getObject())));
            this.test(function () {
                if (!this._oShipDialog) {
                    this._oShipDialog = sap.ui.xmlfragment("entrytool.fragments.shipto", this);
                    this.getView().addDependent(this._oShipDialog)
                }
                this._oShipDialog.open()
            }.bind(this))
        },
        test: function (e) {
            var t = this.getView().getModel("viewPropertiesCust");
            t.setProperty("/custNo", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM);
            t.setProperty("/bsystem", this.oGetPerticulterRowValue.getData().ZSYSTEM);
            var s = new sap.ui.model.json.JSONModel,
                i = this.getOwnerComponent().getModel(),
                a = "/CustomerShipToPartyAssignDetails";
            i.read(a, {
                filters: [new o("ZCUSTMR_NUM", "EQ", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM)],
                success: function (t) {
                    s.setData(t.results);
                    s.setSizeLimit(t.results.length);
                    if (e) {
                        e()
                    }
                    this._oShipDialog.setModel(s, "shiptoAssignment")
                }.bind(this),
                error: function (e) { }
            })
        },
        onFtradePress: function (e) {
            var s;
            if (e.getId() === "press") {
                s = e.getSource();
                this.oSourceMat = s
            } else {
                s = e
            }
            this.oGetPerticulterRowValue = new t(JSON.parse(JSON.stringify(s._getBindingContext().getObject())));
            this._getFtrade(function () {
                if (!this._oFtradeDialog) {
                    this._oFtradeDialog = sap.ui.xmlfragment("entrytool.fragments.fTrade", this);
                    this.getView().addDependent(this._oFtradeDialog)
                }
                this._oFtradeDialog.open()
            }.bind(this))
        },
        _getFtrade: function (e) {
            var t = this.getView().getModel("viewPropertiesCust");
            t.setProperty("/custNo", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM);
            t.setProperty("/bsystem", this.oGetPerticulterRowValue.getData().ZSYSTEM);
            var s = new sap.ui.model.json.JSONModel,
                i = this.getOwnerComponent().getModel(),
                a = "/CustomerFTradeAssignDetails";
            i.read(a, {
                filters: [new o("ZCUST_NUM", "EQ", this.oGetPerticulterRowValue.getData().ZCUSTMR_NUM)],
                success: function (t) {
                    s.setData(t.results);
                    s.setSizeLimit(t.results.length);
                    if (e) {
                        e()
                    }
                    this._oFtradeDialog.setModel(s, "ftradeAssignment")
                }.bind(this),
                error: function (e) { }
            })
        },
        onBlockPress: function (e) {
            var s;
            if (e.getId() === "press") {
                s = e.getSource();
                this.oSourceMat = s
            } else {
                s = e
            }
            var i = new t(JSON.parse(JSON.stringify(s._getBindingContext().getObject())));
            var a = this.getView().getModel("viewPropertiesCust");
            a.setProperty("/custNo", i.getData().ZCUSTMR_NUM);
            a.setProperty("/bsystem", i.getData().ZSYSTEM);
            var r = new sap.ui.model.json.JSONModel,
                n = this.getOwnerComponent().getModel(),
                l = "/CustomerDeliveryBlock";
            n.read(l, {
                filters: [new o("ZCUST_NUM", "EQ", i.getData().ZCUSTMR_NUM)],
                success: function (e) {
                    r.setData(e.results);
                    r.setSizeLimit(e.results.length);
                    if (!this._oblockDialog) {
                        this._oblockDialog = sap.ui.xmlfragment("entrytool.fragments.Blocks", this);
                        this.getView().addDependent(this._oblockDialog)
                    }
                    this._oblockDialog.setModel(r, "blockAssignment");
                    this._oblockDialog.open()
                }.bind(this),
                error: function (e) { }
            })
        },
        onAssignBlockPress: function () {
            if (!this._oAssBlockDialog) {
                this._oAssBlockDialog = sap.ui.xmlfragment("entrytool.fragments.assignBlock", this);
                this.getView().addDependent(this._oAssBlockDialog)
            }
            this._oAssBlockDialog.open()
        },
        onAssignBlockClose: function () {
            this._oAssBlockDialog.close();
            if (this._oAssBlockDialog) {
                this._oAssBlockDialog = this._oAssBlockDialog.destroy()
            }
        },
        onAssignFtradePress: function () {
            if (!this._oAssFtradeDialog) {
                this._oAssFtradeDialog = sap.ui.xmlfragment("entrytool.fragments.assignFtrade", this);
                this.getView().addDependent(this._oAssFtradeDialog)
            }
            this._oAssFtradeDialog.open()
        },
        onAssignFtradeClose: function () {
            this._oAssFtradeDialog.close();
            if (this._oAssFtradeDialog) {
                this._oAssFtradeDialog = this._oAssFtradeDialog.destroy()
            }
        },
        onSaveBlockmaster: function (e) {
            var t = this;
            var s = this._oViewPropertiesCust.getProperty("/custNo"),
                o = "/HANAXS/com/merckgroup/moet/services/xsjs/custDeliveryBlock.xsjs";
            var i = {
                ZCUST_NUM: s,
                ZDEL_BLOCK_ID: sap.ui.getCore().byId("idBlockinput").getSelectedItem().getKey(),
                ZLANGUAGE: "EN",
                ZDEL_BLOCK_DESC: sap.ui.getCore().byId("idBlockinput").getSelectedItem().getText()
            };
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: o,
                type: "POST",
                data: JSON.stringify(i),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.message, {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        _onUpdateBlockAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("blockAssignment").getObject())));
            var o = s.getData();
            var i = {
                ZCUST_NUM: o.ZCUST_NUM,
                ZDEL_BLOCK_ID: o.ZDEL_BLOCK_ID
            };
            var a = this;
            sap.ui.core.BusyIndicator.show();
            var r = "/HANAXS/com/merckgroup/moet/services/xsjs/custDeliveryBlock.xsjs";
            $.ajax({
                url: r,
                type: "DELETE",
                data: JSON.stringify(i),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.message, {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onSaveFtrademaster: function (e) {
            var t = this;
            var s = this._oViewPropertiesCust.getProperty("/custNo"),
                o = sap.ui.getCore().byId("idFtradeAinput").getValue(),
                i = sap.ui.getCore().byId("idFtradeADescinput").getValue(),
                a = sap.ui.getCore().byId("idFtCityAinput").getValue(),
                r = sap.ui.getCore().byId("idFtRegAinput").getValue(),
                l = sap.ui.getCore().byId("idFtPcAinput").getValue(),
                g = sap.ui.getCore().byId("idFtradeSystAinput").getValue();
            if (g === "LEAN") {
                g = "L"
            } else {
                g = "T"
            }
            var c = "/HANAXS/com/merckgroup/moet/services/xsjs/custForeignTrade.xsjs";
            var u = {
                ZCUST_NUM: s,
                ZFTRADE: o.toUpperCase(),
                ZFTRADE_DESC: i,
                ZCITY: a,
                ZREGION: r,
                ZPOSTAL_CODE: l,
                ZDEL_FLAG: "",
                ZSYSTEM: g
            };
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: c,
                type: "POST",
                data: JSON.stringify(u),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("FTrade " + i + " is assigned to the customer successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t._getFtrade();
                    t.onAssignFtradeClose()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        _onUpdateFtradeAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("ftradeAssignment").getObject())));
            var o = s.getData();
            var i = {
                ZCUST_NUM: o.ZCUST_NUM,
                ZFTRADE: o.ZFTRADE
            };
            var a = this,
                r;
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/custForeignTrade.xsjs";
            if (o.ZDEL_FLAG === "") {
                r = "Confirm to add deletion flag for FTrade " + o.ZFTRADE
            } else {
                r = "Confirm to delete Material " + o.ZFTRADE
            }
            n.confirm(r, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        sap.ui.core.BusyIndicator.show();
                        $.ajax({
                            url: l,
                            type: "DELETE",
                            data: JSON.stringify(i),
                            dataType: "json",
                            contentType: "application/json",
                            success: function (e, t) {
                                sap.ui.core.BusyIndicator.hide();
                                n.show(e.message, {
                                    icon: n.Icon.SUCCESS,
                                    title: "SUCCESS",
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                a._getFtrade()
                            },
                            error: function (e) {
                                sap.ui.core.BusyIndicator.hide();
                                n.show(e.responseJSON.message, {
                                    icon: n.Icon.ERROR,
                                    title: "Error",
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                a._getFtrade()
                            }
                        })
                    }
                }
            })
        },
        onFtradeClose: function () {
            this._oFtradeDialog.close();
            if (this._oFtradeDialog) {
                this._oFtradeDialog = this._oFtradeDialog.destroy()
            }
        },
        onCEditClose: function () {
            this._oupdateCustDialog.close();
            if (this._oupdateCustDialog) {
                this._oupdateCustDialog = this._oupdateCustDialog.destroy()
            }
        },
        onCEditPress: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            this._getDeliveryBlockUpdate(s.getData().ZSYSTEM);
            if (!this._oupdateCustDialog) {
                this._oupdateCustDialog = sap.ui.xmlfragment("entrytool.fragments.customerMasterEdit", this);
                this._oupdateCustDialog.setModel(s, "editCustomer");
                this.getView().addDependent(this._oupdateCustDialog)
            }
            this._oupdateCustDialog.open()
        },
        handleValueHelp1: function (e) {
            var t = e.getSource().getValue();
            if (!this._valueHelpDialog1) {
                this._valueHelpDialog1 = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.MaterialF4Help", this);
                this.getView().addDependent(this._valueHelpDialog1);
                this._openValueHelpDialog1(t);
                this._valueHelpDialog1.setModel(this.products1, "products2")
            } else {
                this._openValueHelpDialog1(t)
            }
        },
        _openValueHelpDialog1: function (e) {
            this._valueHelpDialog1.open(e)
        },
        _handleValueHelpSearch1: function (e) {
            var t = e.getParameter("value");
            var s = new o("matDesc", r.Contains, t);
            e.getSource().getBinding("items").filter([s])
        },
        _handleValueHelpClose1: function (e) {
            var t = e.getParameter("selectedItems"),
                s = sap.ui.getCore().byId("multiInput1");
            if (t && t.length > 0) {
                t.forEach(function (e) {
                    s.addToken(new a({
                        text: e.getTitle()
                    }))
                })
            }
        },
        onEditCust: function (e) {
            var t = this.getOwnerComponent().getModel();
            var s = this;
            var o = this._oupdateCustDialog.getModel("editCustomer");
            var t = this.getOwnerComponent().getModel();
            var i = o.getData().ZCUSTMR_NUM;
            var a = sap.ui.getCore().byId("selBlockId");
            var r = {
                ZCUSTMR_NUM: i,
                ZSYSTEM: o.getData().ZSYSTEM,
                ZNAME_1: o.getData().ZNAME_1,
                ZCITY: o.getData().ZCITY,
                ZREGION: o.getData().ZREGION,
                ZSTREET: o.getData().ZSTREET,
                ZCENTRL_DEL_FLAG: "",
                ZPOSTAL_CODE: o.getData().ZPOSTAL_CODE,
                ZDEL_BLOCK_ID: a.getSelectedKey()
            };
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: l,
                type: "PUT",
                data: JSON.stringify(r),
                dataType: "json",
                contentType: "application/json",
                success: function (e, o) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Customer " + i + " updated successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.refresh();
                    s.onCEditClose()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onSaveCustomermaster: function (e) {
            var t = this._handleValidation();
            if (!t) {
                return
            }
            var s = this.getOwnerComponent().getModel(),
                o = sap.ui.getCore().byId("idMaterialinput1w").getValue();
            var i = {
                ZCUSTMR_NUM: sap.ui.getCore().byId("idMaterialinput1w").getValue(),
                ZSYSTEM: sap.ui.getCore().byId("idUominput1w").getSelectedKey(),
                ZNAME_1: sap.ui.getCore().byId("idQuantityinput1w").getValue(),
                ZCITY: sap.ui.getCore().byId("idQuantityinputE1w").getValue(),
                ZREGION: sap.ui.getCore().byId("idQuantityinputE21w").getValue(),
                ZSTREET: sap.ui.getCore().byId("idCustStreet").getValue(),
                ZCENTRL_DEL_FLAG: "",
                ZPOSTAL_CODE: sap.ui.getCore().byId("idQuantityinputE31w").getValue(),
                ZDEL_BLOCK_ID: sap.ui.getCore().byId("selDeliveryBlock").getSelectedKey()
            };
            var a = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: a,
                type: "POST",
                data: JSON.stringify(i),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Customer " + o + " created successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    s.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oCMiDialog.close();
            if (this._oCMiDialog) {
                this._oCMiDialog = this._oCMiDialog.destroy()
            }
        },
        onDeleteCustPress: function (e) {
            var s = this.getOwnerComponent().getModel();
            var o = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            var i = o.getData().ZCUSTMR_NUM;
            var a = {
                ZCUSTMR_NUM: i,
                ZSYSTEM: o.getData().ZSYSTEM
            };
            var r = this,
                l = "";
            var g = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
            if (o.getData().ZCENTRL_DEL_FLAG === "") {
                l = "Confirm to add deletion flag for Customer " + i
            } else {
                l = "Confirm to delete Customer " + i
            }
            n.confirm(l, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        r.deleteFunction(g, a)
                    }
                }
            })
        },
        deleteFunction: function (e, t) {
            var s = this.getOwnerComponent().getModel();
            var o = this;
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: e,
                type: "DELETE",
                data: JSON.stringify(t),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.message, {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    s.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    var t = o.getView().getModel("viewPropertiesCust");
                    t.setProperty("/custErrorMessage", e.responseJSON.message);
                    var i = new sap.ui.model.json.JSONModel;
                    if (e.responseJSON.UserID[0]) {
                        i.setData(e.responseJSON.UserID)
                    } else if (e.responseJSON.ForeignTrade[0]) {
                        i.setData(e.responseJSON.ForeignTrade)
                    } else if (e.responseJSON.ShipToParty[0]) {
                        i.setData(e.responseJSON.ShipToParty)
                    } else {
                        i.setData(e.responseJSON.MatNum)
                    }
                    if (!o.CustErrorMessageDialog) {
                        o.CustErrorMessageDialog = sap.ui.xmlfragment("entrytool.fragments.CustomerErrorMessage", o);
                        o.getView().addDependent(o.CustErrorMessageDialog);
                        o.CustErrorMessageDialog.setModel(i, "aCustErrorJson")
                    }
                    s.refresh();
                    o.CustErrorMessageDialog.open()
                }
            })
        },
        onDeleteMaterialAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("materialAssignment").getObject())));
            var o = this.getOwnerComponent().getModel();
            var i = s.getData().ZCUST_NUM;
            var a = this,
                r = "";
            var l = {
                ZCUST_NUM: i,
                ZDEL_FLAG: ""
            };
            var g = "/HANAXS/com/merckgroup/moet//services/xsjs/CustomerMatAssignDetails.xsjs";
            sap.ui.core.BusyIndicator.show();
            if (s.getData().ZDEL_FLAG === "") {
                r = "Confirm to add deletion flag for Material Assigned " + i
            } else {
                r = "Confirm to delete Material Assigned " + i
            }
            n.confirm(r, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        a.deleteFunction(g, l)
                    }
                }
            })
        },
        onSaveMatAssign: function (e) {
            var t = this;
            var s = this._oViewPropertiesCust.getProperty("/custNo"),
                o = sap.ui.getCore().byId("idMaterialinput").getValue(),
                i = sap.ui.getCore().byId("idSalesAreaLinput").getValue(),
                a = sap.ui.getCore().byId("idDivisionlLinput").getValue(),
                r = sap.ui.getCore().byId("idDistributionChnlLinput").getValue();
            var l = "";
            if (this.getView().getModel("viewPropertiesCust").getProperty("/bsystem") === "L") {
                l = "L"
            } else {
                l = "T"
            }
            if (i === "") {
                n.show("Please Select a Sales Organization", {
                    icon: n.Icon.ERROR,
                    title: "ERROR",
                    onClose: this.onAssignClose,
                    actions: [n.Action.CLOSE],
                    styleClass: "sapUiSizeCompact myMessageBox"
                });
                return
            } else { }
            var g = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";
            sap.ui.core.BusyIndicator.show();
            var c = {
                ZCUST_NUM: s,
                ZMAT_NUM: o,
                ZSYSTEM: l,
                ZSALES_ORG: i,
                ZDISTR_CHNL: r,
                ZDIVISION: a,
                ZCURR: sap.ui.getCore().byId("idSelectCurr").getSelectedKey(),
                ZDEL_FLAG: "",
                CRUD_TYPE: "C"
            };
            $.ajax({
                url: g,
                type: "POST",
                data: JSON.stringify(c),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Material " + o + " is assigned to the customer successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t._getAssignMaterial()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oAssMatDialog.close();
            if (this._oAssMatDialog) {
                this._oAssMatDialog = this._oAssMatDialog.destroy()
            }
        },
        onSaveShiptomaster: function (e) {
            var t = this;
            var s = this._handleValidationSaveShipto();
            if (!s) {
                return
            }
            var o = this._oViewPropertiesCust.getProperty("/custNo"),
                i = sap.ui.getCore().byId("idShiptoAinput").getValue(),
                a = sap.ui.getCore().byId("idShiptoDescAinput").getValue(),
                r = sap.ui.getCore().byId("idShiptoCityAinput").getValue(),
                l = sap.ui.getCore().byId("idShiptoRegAinput").getValue(),
                g = sap.ui.getCore().byId("idShiptoPoAinput").getValue(),
                c = sap.ui.getCore().byId("idShiptoSystAinput").getValue();
            if (c === "LEAN") {
                c = "L"
            } else {
                c = "T"
            }
            var u = "/HANAXS/com/merckgroup/moet/services/xsjs/custShiptoPartyAssign.xsjs";
            sap.ui.core.BusyIndicator.show();
            var C = {
                ZCUSTMR_NUM: o,
                ZSHIP_TO_PARTY: i,
                ZSHIP_TO_PARTY_DESC: a,
                ZCITY: r,
                ZREGION: l,
                ZPOSTAL_CODE: g,
                ZDEL_FLAG: "",
                ZSYSTEM: c
            };
            $.ajax({
                url: u,
                type: "POST",
                data: JSON.stringify(C),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Ship to " + i + " is assigned to the customer successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.test()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oAssShiptoDialog.close();
            if (this._oAssShiptoDialog) {
                this._oAssShiptoDialog = this._oAssShiptoDialog.destroy()
            }
        },
        _onUpdateShipAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("shiptoAssignment").getObject())));
            var o = s.getData();
            var i = this,
                a = "";
            var r = {
                ZCUSTMR_NUM: o.ZCUSTMR_NUM,
                ZSHIP_TO_PARTY: o.ZSHIP_TO_PARTY
            };
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/custShiptoPartyAssign.xsjs";
            if (o.ZDEL_FLAG === "") {
                a = "Confirm to add deletion flag for assigned Ship to party " + o.ZSHIP_TO_PARTY
            } else {
                a = "Confirm to delete assigned Ship to party " + o.ZSHIP_TO_PARTY
            }
            n.confirm(a, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        $.ajax({
                            url: l,
                            type: "DELETE",
                            data: JSON.stringify(r),
                            dataType: "json",
                            contentType: "application/json",
                            success: function (e, t) {
                                n.show(e.message, {
                                    icon: n.Icon.SUCCESS,
                                    title: "SUCCESS",
                                    onClose: this.onAssignClose,
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                i.test()
                            },
                            error: function (e) {
                                n.show(e.responseJSON.message, {
                                    icon: n.Icon.ERROR,
                                    title: "Error",
                                    onClose: this.onAssignClose,
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                i.test()
                            }
                        })
                    }
                }
            })
        },
        onUpdateMatAssignment: function (e) {
            var t = this;
            var s = this._oUpdateCustMastDialog.getModel("updateMatAssign");
            var o = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";
            var i = {
                ZCUST_NUM: s.getData().ZCUST_NUM,
                ZMAT_NUM: s.getData().ZMAT_NUM,
                ZSYSTEM: s.getData().ZSYSTEM,
                ZSALES_ORG: s.getData().ZSALES_ORG,
                ZDISTR_CHNL: s.getData().ZDISTR_CHNL,
                ZDIVISION: s.getData().ZDIVISION,
                ZCURR: sap.ui.getCore().byId("idESelectCurr").getSelectedKey(),
                ZDEL_FLAG: "",
                CRUD_TYPE: "U"
            };
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: o,
                type: "POST",
                data: JSON.stringify(i),
                dataType: "json",
                contentType: "application/json",
                success: function (e, o) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Material " + s.getData().ZMAT_NUM + " assignment to the customer " + s.getData().ZCUST_NUM + " is successfully updated", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t._getAssignMaterial();
                    t._onUpdateMatAssignClose()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        _onUpdateMatAssign: function (e) {
            var s = new t(e.getSource().getBindingContext("materialAssignment").getObject());
            if (!this._oUpdateCustMastDialog) {
                this._oUpdateCustMastDialog = sap.ui.xmlfragment("entrytool.fragments.updateCustomerMaster", this);
                this._oUpdateCustMastDialog.setModel(s, "updateMatAssign");
                this.getView().addDependent(this._oUpdateCustMastDialog)
            }
            this._oUpdateCustMastDialog.open()
        },
        _onUpdateMatAssignClose: function (e) {
            this._oUpdateCustMastDialog.close();
            if (this._oUpdateCustMastDialog) {
                this._oUpdateCustMastDialog = this._oUpdateCustMastDialog.destroy()
            }
        },
        _onDeleteMatAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("materialAssignment").getObject())));
            var o = s.getData();
            var i = {
                ZCUST_NUM: o.ZCUST_NUM,
                ZMAT_NUM: o.ZMAT_NUM
            };
            var a = this,
                r = "";
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";
            if (o.ZDEL_FLAG === "") {
                r = "Confirm to add deletion flag for assigned Materail " + o.ZMAT_NUM
            } else {
                r = "Confirm to delete assigned Materail" + o.ZMAT_NUM
            }
            n.confirm(r, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        $.ajax({
                            url: l,
                            type: "DELETE",
                            data: JSON.stringify(i),
                            dataType: "json",
                            contentType: "application/json",
                            success: function (e, t) {
                                n.show(e.message, {
                                    icon: n.Icon.SUCCESS,
                                    title: "SUCCESS",
                                    onClose: this.onAssignClose,
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                a._getAssignMaterial()
                            },
                            error: function (e) {
                                n.show(e.responseJSON.message, {
                                    icon: n.Icon.ERROR,
                                    title: "Error",
                                    onClose: this.onAssignClose,
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                a._getAssignMaterial()
                            }
                        })
                    }
                }
            })
        },
        onArticleValueHelpRequest: function (e) {
            var t;
            var s = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.oMaterialNoF) {
                this.oMaterialNoF = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.MaterialNumber", this);
                t.addDependent(this.oMaterialNoF)
            }
            this.oMaterialNoF.open()
        },
        handleArticleSearch: function (e) {
            var t = e.getParameter("value");
            var s = new o({
                filters: [new o("Z_MATRL_NUM", "Contains", t.toUpperCase()), new o("ZMATRL_DESC", "Contains", t.toUpperCase())],
                and: false
            });
            var i = e.getSource().getBinding("items");
            i.filter([s])
        },
        onPressArticleValueListClose: function (e) {
            var s = e.getParameter("selectedContexts");
            var i = e.getParameter("selectedItem");
            var a = this.getView().getModel("viewPropertiesMat");
            var r = this;
            if (s && s.length) {
                var n = i.getBindingContext("oModelmat1").getObject();
                a.setProperty("/matNo", n.Z_MATRL_NUM);
                var l = this.getOwnerComponent().getModel(),
                    g = n.Z_MATRL_NUM,
                    c = "/MaterialDetails";
                var u = sap.ui.getCore().byId("ID_ASS_MAT");
                sap.ui.core.BusyIndicator.show();
                l.read(c, {
                    filters: [new o("Z_MATRL_NUM", "EQ", g)],
                    success: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                        a.setProperty("/matDesc", e.results[0].ZMATRL_DESC);
                        a.setProperty("/matNo", e.results[0].Z_MATRL_NUM);
                        u.setEnabled(true);
                        var s = r.getView().getModel("viewPropertiesCust");
                        var o = s.getData().custNo;
                        var i = "";
                        var n = s.getData().bsystem;
                        var l = r.getView().getModel("jsonSystemData").getData();
                        for (var g = 0; g < l.length; g++) {
                            if (l[g].Yydesc === "LEAN" && n === "L") {
                                i = l[g].Yylow
                            } else if (l[g].Yydesc === "TEMPO" && n === "T") {
                                i = l[g].Yylow
                            }
                        }
                        var c = "/ysaleAreaInputSet(IvCustomer='" + o + "',IvSyssid='" + i + "')";
                        r.getOwnerComponent().getModel("MOETSRV").read(c, {
                            urlParameters: {
                                $expand: "NavsalesArea"
                            },
                            success: function (e, s) {
                                var o = new t;
                                o.setData(e.NavsalesArea.results);
                                r.getView().setModel(o, "SalesOfficeM")
                            },
                            error: function (e) { }
                        })
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide()
                    }
                })
            }
            e.getSource().getBinding("items").filter([])
        },
        onACMItemPress: function (e) {
            var s;
            if (e.getId() === "press") {
                s = e.getSource();
                this.oSourceMat = s
            } else {
                s = e
            }
            this.oGetRowValueItemCat = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("materialAssignment").getObject())));
            this._getonACMItemCat(function () {
                if (!this._oACMItemDialog) {
                    this._oACMItemDialog = sap.ui.xmlfragment("entrytool.fragments.custMatItemCategory", this);
                    this.getView().addDependent(this._oACMItemDialog)
                }
                this._oACMItemDialog.open()
            }.bind(this))
        },
        _getonACMItemCat: function (e) {
            var t = this.getView().getModel("viewPropertiesCMatA");
            t.setProperty("/matNo", this.oGetRowValueItemCat.getData().ZMAT_NUM);
            t.setProperty("/custNo", this.oGetRowValueItemCat.getData().ZCUST_NUM);
            t.setProperty("/matDec", this.oGetRowValueItemCat.getData().ZMATRL_DESC);
            t.setProperty("/bsystem", this.oGetRowValueItemCat.getData().ZSYSTEM);
            var s = new sap.ui.model.json.JSONModel,
                i = this.getOwnerComponent().getModel(),
                a = "/CustMatItemCategoryAssign";
            i.read(a, {
                filters: [new o("ZMAT_NUM", "EQ", this.oGetRowValueItemCat.getData().ZMAT_NUM), new o("ZCUST_NUM", "EQ", this.oGetRowValueItemCat.getData().ZCUST_NUM)],
                success: function (t) {
                    s.setData(t.results);
                    this._getItemCategory();
                    s.setSizeLimit(t.results.length);
                    if (e) {
                        e()
                    }
                    this._oACMItemDialog.setModel(s, "cmatItemAssignment")
                }.bind(this),
                error: function (e) { }
            })
        },
        onACMItemClose: function () {
            this._oACMItemDialog.close();
            if (this._oACMItemDialog) {
                this._oACMItemDialog = this._oACMItemDialog.destroy()
            }
        },
        _getItemCategory: function () {
            var e = this.getView().getModel("viewPropertiesCMatA");
            var t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/ItemCategory";
            s.read(i, {
                filters: [new o("ZSYSTEM", "EQ", e.getProperty("/bsystem"))],
                success: function (e) {
                    t.setData(e.results);
                    this.getView().setModel(t, "ItemCat")
                }.bind(this),
                error: function (e) { }
            })
        },
        onAssignCMItemCategoryPress: function (e) {
            var t = this.getView().getModel("ItemCat").getData();
            var s = new sap.ui.model.json.JSONModel;
            if (!this._oAssCMItCateDialog) {
                this._oAssCMItCateDialog = sap.ui.xmlfragment("entrytool.fragments.assignCMItemCategory", this);
                s.setData(t);
                this._oAssCMItCateDialog.setModel(s, "ItemCategory");
                this.getView().addDependent(this._oAssCMItCateDialog)
            }
            this._oAssCMItCateDialog.open()
        },
        onAssignCMItemCategoryClose: function (e) {
            this._oAssCMItCateDialog.close();
            if (this._oAssCMItCateDialog) {
                this._oAssCMItCateDialog = this._oAssCMItCateDialog.destroy()
            }
        },
        onSaveCMItemToMaterial: function (e) {
            var t = this;
            var s = this._oViewPropertiesCMatA.getData().matNo,
                o = sap.ui.getCore().byId("idCustICAIinput").getSelectedKey(),
                i = this._oViewPropertiesCMatA.getData().bsystem,
                a = this._oViewPropertiesCMatA.getData().custNo,
                r = "";
            if (o) {
                r = o
            } else {
                r = ""
            }
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatItemCategory.xsjs";
            var g = {
                ZCUST_NUM: a,
                ZMAT_NUM: s,
                ZITM_CATEGORY: r,
                ZSYSTEM: i,
                ZDEL_FLAG: ""
            };
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: l,
                type: "POST",
                data: JSON.stringify(g),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Item Category " + o + " is assigned to the customer successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.onAssignCMItemCategoryClose();
                    t._getonACMItemCat();
                    t._oACMItemDialog.getModel("cmatItemAssignment").refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.onAssignCMItemCategoryClose();
                    t._oACMItemDialog.getModel("cmatItemAssignment").refresh()
                }
            })
        },
        onDeleteCMItemAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("cmatItemAssignment").getObject())));
            var o = this.getOwnerComponent().getModel();
            var i = s.getData().ZCUST_NUM;
            var a = this,
                r = "";
            var l = {
                ZCUST_NUM: s.getData().ZCUST_NUM,
                ZMAT_NUM: s.getData().ZMAT_NUM,
                ZITM_CATEGORY: s.getData().ZITM_CATEGORY
            };
            var g = "/HANAXS/com/merckgroup/moet//services/xsjs/custMatItemCategory.xsjs";
            if (s.getData().ZDEL_FLAG === "") {
                r = "Confirm to add deletion flag for Assigned Item Category " + s.getData().ZITM_CATEGORY
            } else {
                r = "Confirm to delete assigned Item Category " + s.getData().ZITM_CATEGORY
            }
            n.confirm(r, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        $.ajax({
                            url: g,
                            type: "DELETE",
                            data: JSON.stringify(l),
                            dataType: "json",
                            contentType: "application/json",
                            success: function (e, t) {
                                n.show(e.message, {
                                    icon: n.Icon.SUCCESS,
                                    title: "SUCCESS",
                                    onClose: this.onAssignClose,
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                a._getonACMItemCat()
                            },
                            error: function (e) {
                                n.show(e.responseJSON.message, {
                                    icon: n.Icon.ERROR,
                                    title: "Error",
                                    onClose: this.onAssignClose,
                                    actions: [n.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                a._getonACMItemCat()
                            }
                        });
                        a._getonACMItemCat()
                    }
                }
            })
        },
        _getDeliveryBlock: function (e) {
            var t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/DeliveryBlockDetails";
            s.read(i, {
                filters: [new o("ZSYSTEM", "EQ", e)],
                success: function (e) {
                    var s = {
                        ZDELIVERY_BLOCK_ID: "",
                        ZLANGUAGE: "",
                        ZDELIVERY_BLOCK_DESC: "",
                        ZSYSTEM: ""
                    };
                    e.results.push(s);
                    t.setData(e.results);
                    this._oCMiDialog.setModel(t, "DeliveryBlock")
                }.bind(this),
                error: function (e) { }
            })
        },
        _getDeliveryBlockUpdate: function (e) {
            var t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/DeliveryBlockDetails";
            s.read(i, {
                filters: [new o("ZSYSTEM", "EQ", e)],
                success: function (e) {
                    var s = {
                        ZDELIVERY_BLOCK_ID: "",
                        ZLANGUAGE: "",
                        ZDELIVERY_BLOCK_DESC: "",
                        ZSYSTEM: ""
                    };
                    e.results.push(s);
                    t.setData(e.results);
                    this._oupdateCustDialog.setModel(t, "DeliveryBlock")
                }.bind(this),
                error: function (e) { }
            })
        },
        onCloseCustErrorMessage: function () {
            this.CustErrorMessageDialog.close();
            if (this.CustErrorMessageDialog) {
                this.CustErrorMessageDialog = this.CustErrorMessageDialog.destroy()
            }
        },
        _onEditFTrade: function (e) {
            var s = e.getSource().getBindingContext("ftradeAssignment").getObject();
            var o = new t;
            if (!this.editAssignFtrade) {
                this.editAssignFtrade = sap.ui.xmlfragment("entrytool.fragments.editAssignFtrade", this);
                o.setData(s);
                this.editAssignFtrade.setModel(o, "editAssignFtrade");
                this.getView().addDependent(this.editAssignFtrade)
            }
            this.editAssignFtrade.open()
        },
        onEditFtradeClose: function () {
            this.editAssignFtrade.close();
            if (this.editAssignFtrade) {
                this.editAssignFtrade = this.editAssignFtrade.destroy()
            }
        },
        onUpdateFtrademaster: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("ftradeAssignment").getObject())));
            var o = s.getData();
            var i = this.getOwnerComponent().getModel();
            var a = this;
            var a = this,
                r;
            if (e.getParameter("state") === true) {
                r = "X"
            } else {
                r = ""
            }
            var l = {
                ZCUST_NUM: o.ZCUST_NUM,
                ZFTRADE: o.ZFTRADE.toUpperCase(),
                ZFTRADE_DESC: o.ZFTRADE_DESC,
                ZCITY: o.ZCITY,
                ZREGION: o.ZREGION,
                ZPOSTAL_CODE: o.ZPOSTAL_CODE,
                ZDEL_FLAG: r,
                ZSYSTEM: o.ZSYSTEM
            };
            var g = "/HANAXS/com/merckgroup/moet/services/xsjs/custForeignTrade.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: g,
                type: "PUT",
                data: JSON.stringify(l),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("For FTrade " + o.ZFTRADE_DESC + ", deletion flag revoked", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    a._getFtrade();
                    a.onEditFtradeClose()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onUpdateShipto: function (e) {
            var t = e.getSource().getBindingContext("shiptoAssignment").getObject();
            var s = this.getOwnerComponent().getModel();
            var o = this,
                i;
            if (e.getParameter("state") === true) {
                i = "X"
            } else {
                i = ""
            }
            var a = {
                ZCUSTMR_NUM: t.ZCUSTMR_NUM,
                ZSHIP_TO_PARTY: t.ZSHIP_TO_PARTY,
                ZSHIP_TO_PARTY_DESC: t.ZSHIP_TO_PARTY_DESC,
                ZCITY: t.ZCITY,
                ZREGION: t.ZREGION,
                ZPOSTAL_CODE: t.ZPOSTAL_CODE,
                ZDEL_FLAG: i,
                ZSYSTEM: t.ZSYSTEM
            };
            var r = "/HANAXS/com/merckgroup/moet/services/xsjs/custShiptoPartyAssign.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: r,
                type: "PUT",
                data: JSON.stringify(a),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Ship to " + t.ZSHIP_TO_PARTY_DESC + " deletion flag revoked", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    o.test()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onUpdateMaterial: function (e) {
            var t = e.getSource().getBindingContext("materialAssignment").getObject();
            var s = this.getOwnerComponent().getModel();
            var o = this,
                i;
            if (e.getParameter("state") === true) {
                i = "X"
            } else {
                i = ""
            }
            var a = {
                ZCUST_NUM: t.ZCUST_NUM,
                ZMAT_NUM: t.ZMAT_NUM,
                ZSYSTEM: t.ZSYSTEM,
                ZSALES_ORG: t.ZSALES_ORG,
                ZDISTR_CHNL: t.ZDISTR_CHNL,
                ZDIVISION: t.ZDIVISION,
                ZCURR: t.ZCURR,
                ZDEL_FLAG: i,
                CRUD_TYPE: "U"
            };
            var r = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatAssign.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: r,
                type: "POST",
                data: JSON.stringify(a),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("For Material " + t.ZMAT_NUM + ", deletion flag revoked", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    o._getAssignMaterial()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onUpdateMaterialItemCat: function (e) {
            var t = e.getSource().getBindingContext("cmatItemAssignment").getObject();
            var s = this.getOwnerComponent().getModel();
            var o = this,
                i;
            if (e.getParameter("state") === true) {
                i = "X"
            } else {
                i = ""
            }
            var a = {
                ZCUST_NUM: t.ZCUST_NUM,
                ZMAT_NUM: t.ZMAT_NUM,
                ZITM_CATEGORY: t.ZITM_CATEGORY,
                ZSYSTEM: t.ZSYSTEM,
                ZDEL_FLAG: i
            };
            var r = "/HANAXS/com/merckgroup/moet/services/xsjs/custMatItemCategory.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: r,
                type: "PUT",
                data: JSON.stringify(a),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("For Item Category " + t.ZITM_CATEGORY + ", deletion flag revoked", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    o._getonACMItemCat();
                    o._oACMItemDialog.getModel("cmatItemAssignment").refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onUpdateCustomer: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            var o = this.getOwnerComponent().getModel();
            var i = this,
                a;
            if (e.getParameter("state") === true) {
                a = "X"
            } else {
                a = ""
            }
            var r = {
                ZCUSTMR_NUM: s.getData().ZCUSTMR_NUM,
                ZSYSTEM: s.getData().ZSYSTEM,
                ZNAME_1: s.getData().ZNAME_1,
                ZCITY: s.getData().ZCITY,
                ZREGION: s.getData().ZREGION,
                ZSTREET: s.getData().ZSTREET,
                ZCENTRL_DEL_FLAG: a,
                ZPOSTAL_CODE: s.getData().ZPOSTAL_CODE,
                ZDEL_BLOCK_ID: s.getData().ZDEL_BLOCK_ID
            };
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/customerMasterCRUD.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: l,
                type: "PUT",
                data: JSON.stringify(r),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("For Customer " + s.getData().ZCUSTMR_NUM + ", deletion flag revoked", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    o.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onAssignedFiltersChanged: function (e) {
            var t = e.getSource();
            for (var s in t._oFilterProvider._mTokenHandler) {
                var o = t._oFilterProvider._mTokenHandler[s];
                if (o && o.parser) {
                    o.parser.setDefaultOperation("Contains")
                }
            }
        },
        onInitialized: function (e) {
            var t = e.getSource();
            for (var s in t._oFilterProvider._mTokenHandler) {
                var o = t._oFilterProvider._mTokenHandler[s];
                if (o && o.parser) {
                    o.parser.setDefaultOperation("Contains")
                }
            }
        },
        _handleValidation: function () {
            var e = this.getView();
            var t = this.getView().getModel("jsonViewMod");
            var s = [sap.ui.getCore().byId("idMaterialinput1w"), sap.ui.getCore().byId("idQuantityinput1w")];
            return this._handleValidation1(s)
        },
        _handleValidation1: function (e) {
            var t = false;
            jQuery.each(e, function (e, s) {
                if (s.getValue()) {
                    s.setValueState("None");
                    t = true
                } else {
                    s.setValueState("Error")
                }
            });
            jQuery.each(e, function (e, s) {
                if (s.getValueState() === "Error") {
                    t = false
                }
            });
            if (!t) {
                sap.m.MessageBox.alert("Please fill all required fields")
            }
            return t
        },
        _handleValidationSaveShipto: function () {
            var e = this.getView();
            var t = this.getView().getModel("jsonViewMod");
            var s = [sap.ui.getCore().byId("idShiptoAinput"), sap.ui.getCore().byId("idShiptoDescAinput")];
            return this._handleValidation1(s)
        },
        onExportAllData: function () {
            var e = this.getOwnerComponent().getModel(),
                t = "/CustomerDetails",
                s = [];
            sap.ui.core.BusyIndicator.show();
            e.read(t, {
                urlParameters: {
                    $select: "ZCUSTMR_NUM"
                },
                filters: this.oDownLoadFilters,
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    e.results.forEach(function (e) {
                        s.push(new o("ZCUSTMR_NUM", "EQ", e.ZCUSTMR_NUM))
                    });
                    this._downloadCustomerAllData(s)
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _downloadCustomerAllData: function (e) {
            var t = "/CustomerAllDetails";
            var s = this,
                o, i;
            var a = this.getOwnerComponent().getModel();
            a.read(t, {
                filters: e,
                success: function (e) {
                    var t = e.results;
                    var a = [];
                    t.forEach(function (e) {
                        e.ZSYSTEM = e.ZSYSTEM === "L" ? "LEAN" : "TEMPO";
                        e.ZITM_CATEGORY = e.ZITM_CATEGORY + "-" + s.ItemCategoryConversion(e.ZITM_CATEGORY)
                    });
                    var r = s.getOwnerComponent().getModel().getServiceMetadata();
                    for (var n = 0; n < r.dataServices.schema[0].entityType.length; n++) {
                        if (r.dataServices.schema[0].entityType[n].name === "CustomerAllDetailsType") {
                            o = r.dataServices.schema[0].entityType[n];
                            break
                        }
                    }
                    i = o.property;
                    i.forEach(function (e) {
                        if (e.type === "Edm.DateTime") {
                            var t = {
                                label: e.extensions[0].value,
                                property: e.name,
                                type: sap.ui.export.EdmType.Date
                            };
                            a.push(t)
                        } else {
                            var s = {
                                label: e.extensions[0].value,
                                property: e.name
                            };
                            a.push(s)
                        }
                    });
                    var g = new Date;
                    var c = g.toLocaleString();
                    var u = "Customer Details" + " " + c;
                    var C = {
                        workbook: {
                            columns: a,
                            context: {
                                sheetName: "Customer Details"
                            }
                        },
                        fileName: u + ".xlsx",
                        dataSource: t
                    };
                    var d = new l(C);
                    d.build()
                },
                error: function (e) { }
            })
        }
    })
});