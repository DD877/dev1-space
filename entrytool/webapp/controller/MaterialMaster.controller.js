sap.ui.define([
    "entrytool/controller/BaseController", 
    "sap/ui/model/json/JSONModel", 
    "entrytool/model/formatter", 
    "sap/ui/model/Filter", "sap/ui/export/Spreadsheet", 
    "sap/ui/model/Sorter", "sap/m/Token", 
    "sap/ui/model/FilterOperator", "sap/m/MessageBox"
], function (e, t, s, o, i, a, r, n, l) {
    "use strict";
    return e.extend("entrytool.controller.MaterialMaster", {
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
            var e = sap.ui.getCore().byId("idMaterialnumber").getValue();
            var s = sap.ui.getCore().byId("idMatMasSysI").getSelectedKey();
            var o;
            var i = this.getView().getModel("jsonSystemData").getData();
            for (var a = 0; a < i.length; a++) {
                if (i[a].Yydesc === "LEAN" && s === "L") {
                    o = i[a].Yylow
                } else if (i[a].Yydesc === "TEMPO" && s === "T") {
                    o = i[a].Yylow
                }
            }
            var r = "/ymaterialvalidationSet(IvMaterial='" + e + "',IvSyssid='" + o + "')";
            sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(r, {
                urlParameters: {
                    $expand: "Navmaterialvalidation"
                },
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    var o = new t;
                    o.setData(e);
                    sap.ui.getCore().byId("idMaterialDec").setValue(e.Navmaterialvalidation.MatnrDesc);
                    sap.ui.getCore().byId("idBaseUnitMeasure").setValue(e.Navmaterialvalidation.BaseUnitMeas)
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show("Select Correct System", {
                        icon: l.Icon.ERROR,
                        title: "ERROR",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }.bind(this)
            })
        },
        onValidate: function () {
            var e = sap.ui.getCore().byId("ID_ASS_MAT");
            e.setEnabled(true);
            l.show("Materials are Validated", {
                icon: l.Icon.SUCCESS,
                title: "SUCCESS",
                onClose: this.onAssignClose,
                actions: [l.Action.CLOSE],
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
            this.getRouter().getRoute("MaterialMaster").attachPatternMatched(this._onRouteMatched, this);
            this._loadODataUtils();
            this._getSystem();
            this.fNotification = [];
            this._oViewPropertiesCust = new t({
                custNo: "",
                customerid: "C001",
                bsystem: "",
                CustomerName: "",
                city: "",
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
            this._oViewPropertiesMatA = new t({
                matNo: "",
                itmCat: "",
                matDec: "",
                bsystem: ""
            });
            this.getView().setModel(this._oViewPropertiesMatA, "viewPropertiesMatA");
            this.getItemCategoryData()
        },
        fnSelectSystem: function (e) {
            var t = sap.ui.getCore().byId("idUominput1w").getSelectedKey();
            var s = this.getView().getModel("customerTest");
            var o = this.getView().getModel("viewPropertiesCust");
            for (var i = 0; i < s.getData().length; i++) {
                if (s.getData()[i].bsystem === t) {
                    o.setProperty("/bsystem", s.getData()[i].bsystem);
                    o.setProperty("/CustomerName", s.getData()[i].CustomerName);
                    o.setProperty("/city", s.getData()[i].city);
                    o.setProperty("/State", s.getData()[i].State);
                    o.setProperty("/Region", s.getData()[i].Region);
                    o.setProperty("/pocode", s.getData()[i].pocode);
                    o.setProperty("/ShipTo", s.getData()[i].ShipTo);
                    o.setProperty("/SalesOrganization", s.getData()[i].SalesOrganization);
                    o.setProperty("/DistributionChannel", s.getData()[i].DistributionChannel);
                    o.setProperty("/Division", s.getData()[i].Division);
                    o.setProperty("/SalesGroup", s.getData()[i].SalesGroup);
                    o.setProperty("/SalesOffice", s.getData()[i].SalesOffice);
                    o.setProperty("/Currency", s.getData()[i].Currency)
                }
            }
        },
        fnClearAllValue: function () {
            var e = this.getView().getModel("viewPropertiesCust");
            e.setProperty("/bsystem", "");
            e.setProperty("/CustomerName", "");
            e.setProperty("/city", "");
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
            this._oMMiDialog.close();
            if (this._oMMiDialog) {
                this._oMMiDialog = this._oMMiDialog.destroy()
            }
        },
        onAddCMPress: function () {
            this.fnClearAllValue();
            if (!this._oMMiDialog) {
                this._oMMiDialog = sap.ui.xmlfragment("entrytool.fragments.materialMaster", this);
                this.getView().addDependent(this._oMMiDialog)
            }
            this._oMMiDialog.open()
        },
        onAssignMaterial: function (e) {
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
            var r = new sap.ui.model.json.JSONModel,
                n = this.getOwnerComponent().getModel(),
                l = "/CustomerMatAssignDetails";
            sap.ui.core.BusyIndicator.show();
            n.read(l, {
                filters: [new o("ZCUST_NUM", "EQ", i.getData().ZCUSTMR_NUM)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    r.setData(e.results);
                    r.setSizeLimit(e.results.length);
                    if (!this._oMatAssgnDialog) {
                        this._oMatAssgnDialog = sap.ui.xmlfragment("entrytool.fragments.materialAssignment", this)
                    }
                    this._oMatAssgnDialog.setModel(r, "materialAssignment");
                    this._oMatAssgnDialog.open()
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onMatAssignClose: function () {
            this._oMatAssgnDialog.close();
            if (this._oMatAssgnDialog) {
                this._oMatAssgnDialog = this._oMatAssgnDialog.destroy()
            }
        },
        onAssignMatPress: function (e) {
            if (!this._oAssMatDialog) {
                this._oAssMatDialog = sap.ui.xmlfragment("entrytool.fragments.assignMaterial", this);
                this.getView().addDependent(this._oAssMatDialog)
            }
            this._oAssMatDialog.open()
        },
        onAssignMatClose: function () {
            this._oAssMatDialog.close();
            if (this._oAssMatDialog) {
                this._oAssMatDialog = this._oAssMatDialog.destroy()
            }
        },
        onShipClose: function () {
            this._oShipDialog.close();
            if (this._oShipDialog) {
                this._oShipDialog = this._oShipDialog.destroy()
            }
        },
        onShipPress: function () {
            if (!this._oShipDialog) {
                this._oShipDialog = sap.ui.xmlfragment("entrytool.fragments.shipto", this);
                this.getView().addDependent(this._oShipDialog)
            }
            this._oShipDialog.open()
        },
        onEditClose: function () {
            this._oupdateMatDialog.close();
            if (this._oupdateMatDialog) {
                this._oupdateMatDialog = this._oupdateMatDialog.destroy()
            }
        },
        onEditPress: function (e) {
            var s = this.getOwnerComponent().getModel();
            var o = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            if (!this._oupdateMatDialog) {
                this._oupdateMatDialog = sap.ui.xmlfragment("entrytool.fragments.editMaterial", this);
                this._oupdateMatDialog.setModel(o, "matEdit");
                this.getView().addDependent(this._oupdateMatDialog)
            }
            this._oupdateMatDialog.open()
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
            var s = new o("matDesc", n.Contains, t);
            e.getSource().getBinding("items").filter([s])
        },
        _handleValueHelpClose1: function (e) {
            var t = e.getParameter("selectedItems"),
                s = sap.ui.getCore().byId("multiInput1");
            if (t && t.length > 0) {
                t.forEach(function (e) {
                    s.addToken(new r({
                        text: e.getTitle()
                    }))
                })
            }
        },
        onSaveMaterialmaster: function (e) {
            if (!sap.ui.getCore().byId("idGroupDeveloper").getSelectedKey()) {
                l.show("Please select a Group Developer", {
                    icon: l.Icon.ERROR,
                    title: "Error",
                    onClose: this.onAssignClose,
                    actions: [l.Action.CLOSE],
                    styleClass: "sapUiSizeCompact myMessageBox"
                });
                return
            }
            var t = this.getOwnerComponent().getModel();
            var s = "";
            if (sap.ui.getCore().byId("idMatMasSysI").getSelectedKey() === "L") {
                s = "L"
            } else {
                s = "T"
            }
            var o = {
                Z_MATRL_NUM: sap.ui.getCore().byId("idMaterialnumber").getValue(),
                ZSYSTEM: s,
                ZMATRL_DESC: sap.ui.getCore().byId("idMaterialDec").getValue(),
                ZBASE_UNIT_MEASURE: sap.ui.getCore().byId("idBaseUnitMeasure").getValue(),
                ZMIN_ORDER_QUAN: "0",
                ZGRP_DEVLPR: sap.ui.getCore().byId("idGroupDeveloper").getSelectedKey(),
                ZFROZEN_PERIOD: sap.ui.getCore().byId("idFrozenPeriod").getValue(),
                ZDEL_FLAG: ""
            };
            var i = sap.ui.getCore().byId("idMaterialnumber").getValue();
            var a = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: a,
                type: "POST",
                data: JSON.stringify(o),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show("Material " + i + " created successfully", {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.refresh();
                    this._oMMiDialog.close();
                    if (this._oMMiDialog) {
                        this._oMMiDialog = this._oMMiDialog.destroy()
                    }
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oMMiDialog.close();
            if (this._oMMiDialog) {
                this._oMMiDialog = this._oMMiDialog.destroy()
            }
        },
        onSaveEMaterialmaster: function (e) {
            if (!sap.ui.getCore().byId("idEGroupDeveloper").getSelectedKey()) {
                l.show("Please select a Group Developer", {
                    icon: l.Icon.ERROR,
                    title: "Error",
                    onClose: this.onAssignClose,
                    actions: [l.Action.CLOSE],
                    styleClass: "sapUiSizeCompact myMessageBox"
                });
                return
            }
            var t = this.getOwnerComponent().getModel();
            var s = "";
            if (sap.ui.getCore().byId("idMatMasSysIE").getSelectedKey() === "L") {
                s = "L"
            } else {
                s = "T"
            }
            var o = sap.ui.getCore().byId("idEMaterialnumber").getValue();
            var i = {
                Z_MATRL_NUM: sap.ui.getCore().byId("idEMaterialnumber").getValue(),
                ZSYSTEM: s,
                ZMATRL_DESC: sap.ui.getCore().byId("idEMaterialDec").getValue(),
                ZBASE_UNIT_MEASURE: sap.ui.getCore().byId("idEBaseUnitMeasure").getValue(),
                ZMIN_ORDER_QUAN: "0",
                ZGRP_DEVLPR: sap.ui.getCore().byId("idEGroupDeveloper").getSelectedKey(),
                ZFROZEN_PERIOD: sap.ui.getCore().byId("idEFrozenPeriod").getValue(),
                ZDEL_FLAG: sap.ui.getCore().byId("idDelEditMat").getState() === true ? "X" : "",
                REVOKE_FLAG: sap.ui.getCore().byId("idDelEditMat").getState() === true ? "" : "X"
            };
            var a = this;
            var r = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: r,
                type: "PUT",
                data: JSON.stringify(i),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show("Material " + o + " updated successfully", {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.refresh();
                    a.onEditClose()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oMMiDialog.close();
            if (this._oMMiDialog) {
                this._oMMiDialog = this._oMMiDialog.destroy()
            }
        },
        onDeleteMatPress: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            var o = s.getData().Z_MATRL_NUM;
            var i = {
                Z_MATRL_NUM: o,
                ZSYSTEM: s.getData().ZSYSTEM
            };
            var a = this,
                r = "";
            var n = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
            if (s.getData().ZDEL_FLAG === "") {
                r = "Confirm to add deletion flag for Material " + o
            } else {
                r = "Confirm to delete Material " + o
            }
            l.confirm(r, {
                title: "Confirm",
                actions: [l.Action.OK, l.Action.CANCEL],
                emphasizedAction: l.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        a.deleteFunction(n, i)
                    }
                }
            })
        },
        deleteFunction: function (e, t) {
            var s = this.getOwnerComponent().getModel();
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: e,
                type: "DELETE",
                data: JSON.stringify(t),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.message, {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    s.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onDeleteMaterialAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("matItemAssignment").getObject())));
            var o = this.getOwnerComponent().getModel();
            var i = this,
                a = "";
            var r = {
                ZMAT_NUM: s.getData().ZMAT_NUM,
                ZITM_CATEGORY: s.getData().ZITM_CATEGORY,
                ZSYSTEM: s.getData().ZSYSTEM
            };
            if (s.getData().ZDEL_FLAG === "") {
                a = "Confirm to add deletion flag for Item Category " + s.getData().ZITM_CATEGORY
            } else {
                a = "Confirm to delete Item Category " + s.getData().ZITM_CATEGORY
            }
            var n = "/HANAXS/com/merckgroup/moet//services/xsjs/matItemCategoryAssign.xsjs";
            l.confirm(a, {
                title: "Confirm",
                actions: [l.Action.OK, l.Action.CANCEL],
                emphasizedAction: l.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        $.ajax({
                            url: n,
                            type: "DELETE",
                            data: JSON.stringify(r),
                            dataType: "json",
                            contentType: "application/json",
                            success: function (e, t) {
                                l.show(e.message, {
                                    icon: l.Icon.SUCCESS,
                                    title: "SUCCESS",
                                    onClose: this.onAssignClose,
                                    actions: [l.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                i._getAssignItemCategory()
                            },
                            error: function (e) {
                                l.show(e.responseJSON.message, {
                                    icon: l.Icon.ERROR,
                                    title: "Error",
                                    onClose: this.onAssignClose,
                                    actions: [l.Action.CLOSE],
                                    styleClass: "sapUiSizeCompact myMessageBox"
                                });
                                i._getAssignItemCategory()
                            }
                        })
                    }
                }
            })
        },
        onSaveMatAssign: function (e) {
            var t = this;
            var s = this._oViewPropertiesCust.getProperty("/custNo"),
                o = sap.ui.getCore().byId("idMaterialinput").getValue(),
                i = "X";
            var a = "/HANAXS/com/merckgroup/moet/services/xsjs/createCustMatAssign.xsjs";
            var r = {
                ZCUST_NUM: s,
                ZMAT_NUM: o,
                ZSYSTEM: i
            };
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: a,
                type: "POST",
                data: JSON.stringify(r),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.message, {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.onAssignMaterial(t.oSourceMat)
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oAssMatDialog.close();
            if (this._oAssMatDialog) {
                this._oAssMatDialog = this._oAssMatDialog.destroy()
            }
        },
        _onUpdateMatAssign: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("materialAssignment").getObject())));
            var o = s.getData();
            var i = {
                ZCUST_NUM: o.ZCUST_NUM,
                ZMAT_NUM: o.ZMAT_NUM
            };
            var a = this;
            var r = "/HANAXS/com/merckgroup/moet/services/xsjs/createCustMatAssign.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: r,
                type: "PUT",
                data: JSON.stringify(i),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.message, {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    a.onAssignMaterial(a.oSourceMat)
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oupdateMetAssDialog.close();
            if (this._oupdateMetAssDialog) {
                this._oupdateMetAssDialog = this._oupdateMetAssDialog.destroy()
            }
        },
        onAItemClose: function () {
            this._oAItemDialog.close();
            if (this._oAItemDialog) {
                this._oAItemDialog = this._oAItemDialog.destroy()
            }
        },
        onAItemPress: function (e) {
            var s;
            if (e.getId() === "press") {
                s = e.getSource();
                this.oSourceMat = s
            } else {
                s = e
            }
            this.oGetPerticulterRowValue = new t(JSON.parse(JSON.stringify(s._getBindingContext().getObject())));
            this._getAssignItemCategory(function () {
                if (!this._oAItemDialog) {
                    this._oAItemDialog = sap.ui.xmlfragment("entrytool.fragments.itemCategory", this);
                    this.getView().addDependent(this._oAItemDialog)
                }
                this._oAItemDialog.open()
            }.bind(this))
        },
        _getAssignItemCategory: function (e) {
            var t = this.getView().getModel("viewPropertiesMatA");
            t.setProperty("/matNo", this.oGetPerticulterRowValue.getData().Z_MATRL_NUM);
            t.setProperty("/matDec", this.oGetPerticulterRowValue.getData().ZMATRL_DESC);
            t.setProperty("/bsystem", this.oGetPerticulterRowValue.getData().ZSYSTEM);
            var s = new sap.ui.model.json.JSONModel,
                i = this.getOwnerComponent().getModel(),
                a = "/MatItemCategoryAssign";
            sap.ui.core.BusyIndicator.show();
            i.read(a, {
                filters: [new o("ZMAT_NUM", "EQ", this.oGetPerticulterRowValue.getData().Z_MATRL_NUM), new o("ZSYSTEM", "EQ", this.oGetPerticulterRowValue.getData().ZSYSTEM)],
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    s.setData(t.results);
                    s.setSizeLimit(t.results.length);
                    this._getItemCategory();
                    if (e) {
                        e()
                    }
                    this._oAItemDialog.setModel(s, "matItemAssignment")
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onAssignItemCategoryPress: function (e) {
            var t = this.getView().getModel("ItemCat").getData();
            var s = new sap.ui.model.json.JSONModel;
            if (!this._oAssItCateDialog) {
                this._oAssItCateDialog = sap.ui.xmlfragment("entrytool.fragments.assignItemCategory", this);
                s.setData(t);
                this._oAssItCateDialog.setModel(s, "ItemCategory");
                this.getView().addDependent(this._oAssItCateDialog)
            }
            this._oAssItCateDialog.open()
        },
        onAssignItemCategoryClose: function (e) {
            this._oAssItCateDialog.close();
            if (this._oAssItCateDialog) {
                this._oAssItCateDialog = this._oAssItCateDialog.destroy()
            }
        },
        onSaveItemToMaterial: function (e) {
            var t = this;
            var s = this._oViewPropertiesMatA.getProperty("/matNo"),
                o = sap.ui.getCore().byId("idMaterialIAIinput").getSelectedKey(),
                i = this._oViewPropertiesMatA.getProperty("/bsystem"),
                a = "";
            if (o) {
                a = o
            } else {
                a = ""
            }
            var r = "/HANAXS/com/merckgroup/moet/services/xsjs/matItemCategoryAssign.xsjs";
            var n = {
                ZMAT_NUM: s,
                ZITM_CATEGORY: a,
                ZSYSTEM: i,
                ZDEL_FLAG: ""
            };
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: r,
                type: "POST",
                data: JSON.stringify(n),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show("Item Category " + o + " created successfully", {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t._getAssignItemCategory()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this._oAssItCateDialog.close();
            if (this._oAssItCateDialog) {
                this._oAssItCateDialog = this._oAssItCateDialog.destroy()
            }
        },
        _getItemCategory: function () {
            var e = this.getView().getModel("viewPropertiesMatA");
            var t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/ItemCategory";
            sap.ui.core.BusyIndicator.show();
            s.read(i, {
                filters: [new o("ZSYSTEM", "EQ", e.getProperty("/bsystem"))],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(e.results);
                    this.getView().setModel(t, "ItemCat")
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onExportPress: function () {
            var e = {
                dataSource: {
                    type: "OData",
                    dataUrl: "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/MaterialAllDetails",
                    serviceUrl: "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/",
                    count: 17491,
                    useBatch: true,
                    headers: {},
                    sizeLimit: 500
                }
            };
            var t = new i(e);
            var s = t.build();
            s.then(function () { })
        },
        createColumns: function () {
            return [{
                label: "Matrial Number",
                property: "ZMAT_NUM"
            }, {
                label: "Matrial Discreption",
                property: "disc"
            }]
        },
        onUpdateMaterial: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            var o = this.getOwnerComponent().getModel();
            var i = this,
                a, r;
            if (e.getParameter("state") === true) {
                a = "X";
                r = ""
            } else {
                a = "";
                r = "X"
            }
            var n = {
                Z_MATRL_NUM: s.getData().Z_MATRL_NUM,
                ZSYSTEM: s.getData().ZSYSTEM,
                ZMATRL_DESC: s.getData().ZMATRL_DESC,
                ZBASE_UNIT_MEASURE: s.getData().ZBASE_UNIT_MEASURE,
                ZMIN_ORDER_QUAN: "0",
                ZGRP_DEVLPR: s.getData().ZGRP_DEVLPR,
                ZFROZEN_PERIOD: s.getData().ZFROZEN_PERIOD,
                ZDEL_FLAG: a,
                REVOKE_FLAG: r
            };
            var g = "/HANAXS/com/merckgroup/moet/services/xsjs/materialMaster.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: g,
                type: "PUT",
                data: JSON.stringify(n),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show("For Material " + s.getData().Z_MATRL_NUM + ", deletion flag revoked", {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    o.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onUpdateMaterialItem: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("matItemAssignment").getObject())));
            var o = this.getOwnerComponent().getModel();
            var i = this,
                a, r;
            if (e.getParameter("state") === true) {
                a = "X";
                r = ""
            } else {
                a = "";
                r = "X"
            }
            var n = {
                ZMAT_NUM: s.getData().ZMAT_NUM,
                ZITM_CATEGORY: s.getData().ZITM_CATEGORY,
                ZSYSTEM: s.getData().ZSYSTEM,
                ZDEL_FLAG: a,
                REVOKE_FLAG: r
            };
            var g = "/HANAXS/com/merckgroup/moet/services/xsjs/matItemCategoryAssign.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: g,
                type: "PUT",
                data: JSON.stringify(n),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show("For Assigned Item Category " + s.getData().ZITM_CATEGORY + ", deletion flag revoked", {
                        icon: l.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    i._getAssignItemCategory()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    l.show(e.responseJSON.message, {
                        icon: l.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [l.Action.CLOSE],
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
        onItemCategoryChange: function () {
            var e = this.getView().getModel("viewPropertiesMatA");
            var t = sap.ui.getCore().byId("idMaterialIAIinput").getSelectedKey();
            if (t) {
                sap.ui.getCore().byId("btnAssginCat").setEnabled(true)
            } else {
                sap.ui.getCore().byId("btnAssginCat").setEnabled(false)
            }
        },
        onExportAllData: function () {
            var e = this.getOwnerComponent().getModel(),
                t = "/MaterialDetails",
                s = [];
            sap.ui.core.BusyIndicator.show();
            e.read(t, {
                urlParameters: {
                    $select: "Z_MATRL_NUM"
                },
                filters: this.oDownLoadFilters,
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    e.results.forEach(function (e) {
                        s.push(new o("Z_MATRL_NUM", "EQ", e.Z_MATRL_NUM))
                    });
                    this._downloadMaterialAllData(s)
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _downloadMaterialAllData: function (e) {
            var t = "/MaterialAllDetails";
            var s = this;
            var o = this.getOwnerComponent().getModel();
            o.read(t, {
                filters: e,
                success: function (e) {
                    var t = e.results,
                        o, a;
                    var r = [];
                    t.forEach(function (e) {
                        e.ZSYSTEM = e.ZSYSTEM === "L" ? "LEAN" : "TEMPO";
                        e.ZITM_CATEGORY = e.ZITM_CATEGORY + "-" + s.ItemCategoryConversion(e.ZITM_CATEGORY)
                    });
                    var n = s.getOwnerComponent().getModel().getServiceMetadata();
                    for (var l = 0; l < n.dataServices.schema[0].entityType.length; l++) {
                        if (n.dataServices.schema[0].entityType[l].name === "MaterialAllDetailsType") {
                            o = n.dataServices.schema[0].entityType[l];
                            break
                        }
                    }
                    a = o.property;
                    a.forEach(function (e) {
                        if (e.type === "Edm.DateTime") {
                            var t = {
                                label: e.extensions[0].value,
                                property: e.name,
                                type: sap.ui.export.EdmType.Date
                            };
                            r.push(t)
                        } else {
                            var s = {
                                label: e.extensions[0].value,
                                property: e.name
                            };
                            r.push(s)
                        }
                    });
                    var g = new Date;
                    var c = g.toLocaleString();
                    var u = "Item Category" + " " + c;
                    var p = {
                        workbook: {
                            columns: r,
                            context: {
                                sheetName: "Item Category"
                            }
                        },
                        fileName: u + ".xlsx",
                        dataSource: t
                    };
                    var d = new i(p);
                    d.build()
                }.bind(this),
                error: function (e) { }
            })
        }
    })
});