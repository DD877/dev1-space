sap.ui.define([
    "entrytool/controller/BaseController", "sap/ui/model/json/JSONModel", 
    "entrytool/model/formatter", "sap/ui/model/Filter", 
    "sap/ui/model/Sorter", "sap/m/Token", "sap/ui/model/FilterOperator", "sap/m/MessageBox", 
    "sap/m/MessageToast", "sap/ui/export/Spreadsheet"
], function (e, t, s, i, o, r, a, n, u, l) {
    "use strict";
    return e.extend("entrytool.controller.UserMaintenance", {
        custFormatter: s,
        closeCreateDialog: function () {
            if (this._new) {
                this._new.close();
                this._new = this._new.destroy(true)
            }
        },
        onInit: function () {
            var omodel = this.getOwnerComponent().getModel("UserDetails");
            this.getView().setModel(omodel, "UDs");
           
            this.getRouter().getRoute("UserMaintenance").attachPatternMatched(this._onRouteMatched, this);
            this._loadODataUtils();
            this.fNotification = [];
            this.getUserRoleDataUpdate();
            this.getUserCustomer();
            this._oViewProperties = new t({
                username: "",
                emailId: "",
                userid: "",
                cusId: ""
            });
            this.getView().setModel(this._oViewProperties, "viewProperties");
            var e = this;
            var s = sap.ui.getCore().byId("idUominput123")
        },
        fnClearAllValue: function () {
            var e = this.getView().getModel("viewProperties");
            e.setProperty("/username", "");
            e.setProperty("/emailId", "");
            e.setProperty("/userid", "")
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
                for (t = s.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onBeforeRebindTable: function (e) {
            this.oDownLoadFilters = e.getParameter("bindingParams").filters
        },
        handleValueHelp: function (e) {
            var t = e.getSource().getValue();
            if (!this._valueHelpDialog) {
                this._valueHelpDialog = sap.ui.xmlfragment(this.getView().getId(), "entrytool.fragments.ShiptoF4Help", this);
                this.getView().addDependent(this._valueHelpDialog);
                this._openValueHelpDialog(t);
                this._valueHelpDialog.setModel(this.products, "products1")
            } else {
                this._openValueHelpDialog(t)
            }
        },
        _openValueHelpDialog: function (e) {
            this._valueHelpDialog.open(e)
        },
        _handleValueHelpSearch: function (e) {
            var t = e.getParameter("value");
            var s = new i("shiptoDesc", a.Contains, t);
            e.getSource().getBinding("items").filter([s])
        },
        _handleValueHelpClose: function (e) {
            var t = e.getParameter("selectedItems"),
                s = sap.ui.getCore().byId("multiInput");
            if (t && t.length > 0) {
                t.forEach(function (e) {
                    s.addToken(new r({
                        text: e.getTitle()
                    }))
                })
            }
        },
        onDeletePress: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            var i = s.oData.ZUSR_ID;
            var o = s.oData.ZUSR_ROLE;
            var r = this,
                a = "";
            var u = {
                ZUSR_ID: i,
                OLDROLE: o
            };
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/user.xsjs";
            a = "Confirm to add deletion flag for User " + s.getData().ZUSR_ID;
            n.confirm(a, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        r.deleteFunction(l, u)
                    }
                }
            })
        },
        deleteFunction: function (e, t) {
            var s = this;
            var i = this.getOwnerComponent().getModel();
            $.ajax({
                url: e,
                type: "DELETE",
                data: JSON.stringify(t),
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
                    i.refresh();
                    s._getAssignCustomer()
                },
                error: function (e) {
                    n.show(e.responseJSON.message, {
                        icon: n.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    i.refresh();
                    s._getAssignCustomer()
                }
            })
        },
        onEditCustAssignPress: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("userCustomer1").getObject())));
            if (!this._oECADialog) {
                this._oECADialog = sap.ui.xmlfragment("entrytool.fragments.editCustAssign", this);
                this.getView().addDependent(this._oECADialog)
            }
            this._oECADialog.setModel(s, "EditCustAssign");
            this._oECADialog.open()
        },
        onEditCustAssignClose: function () {
            this._oECADialog.close();
            if (this._oECADialog) {
                this._oECADialog = this._oECADialog.destroy()
            }
        },
        onEditPress: function (e) {
            var s = new t(JSON.parse(JSON.stringify(e.getSource().getBindingContext().getObject())));
            var i = this.getView().getModel("userType");
            if (!this._oNEDialog) {
                this._oNEDialog = sap.ui.xmlfragment("entrytool.fragments.editUser", this);
                this.getView().addDependent(this._oNEDialog)
            }
            this._oNEDialog.open();
            if (s.getData().ZUSR_ROLE === "CUST") {
                sap.ui.getCore().byId("ID_SEL_USER_TYPE").setVisible(false);
                sap.ui.getCore().byId("ID_SEL_USER_TYPE_TXT").setVisible(true);
                sap.ui.getCore().byId("idUom1or").setVisible(true);
                sap.ui.getCore().byId("idUom1").setVisible(false)
            } else {
                sap.ui.getCore().byId("ID_SEL_USER_TYPE").setVisible(true);
                sap.ui.getCore().byId("ID_SEL_USER_TYPE_TXT").setVisible(false);
                sap.ui.getCore().byId("idUom1or").setVisible(false);
                sap.ui.getCore().byId("idUom1").setVisible(true)
            }
            this._oNEDialog.setModel(i, "userType1");
            this.oldRole = s.getData().ZUSR_ROLE;
            this._oNEDialog.setModel(s, "EditUser");
            this._oNEDialog.setModel(s, "EditUser1")
        },
        handleRoleChange: function () { },
        onEditEClose: function () {
            this._oNEDialog.close();
            if (this._oNEDialog) {
                this._oNEDialog = this._oNEDialog.destroy()
            }
        },
        onAssignPress: function (e) {
            if (!this._oAssignDialog) {
                this._oAssignDialog = sap.ui.xmlfragment("entrytool.fragments.userMain", this);
                this.getView().addDependent(this._oAssignDialog)
            }
            this._oAssignDialog.open()
        },
        onAssignClose: function () {
            this._oAssignDialog.close();
            if (this._oAssignDialog) {
                this._oAssignDialog = this._oAssignDialog.destroy()
            }
        },
        onSelect: function (e) {
            var t = sap.ui.getCore().byId("utpe").getSelectedKey();
            if (t !== "I") {
                sap.ui.getCore().byId("idQuantityinputE91u").setEnabled(true);
                sap.ui.getCore().byId("idQuantityinput91u").setEnabled(true);
                sap.ui.getCore().byId("idMaterial1u").setVisible(false);
                sap.ui.getCore().byId("idUominput123").setVisible(false);
                sap.ui.getCore().byId("idUom1u").setVisible(false);
                sap.ui.getCore().byId("idUominput1u").setVisible(false);
                sap.ui.getCore().byId("idQuantityinput91u").setEnabled(true)
            } else {
                sap.ui.getCore().byId("idQuantityinputE91u").setEnabled(false);
                sap.ui.getCore().byId("idQuantityinputE91u").setValue("");
                sap.ui.getCore().byId("idQuantityinput91u").setEnabled(false);
                sap.ui.getCore().byId("idQuantityinput91u").setValue("");
                sap.ui.getCore().byId("idMaterial1u").setVisible(true);
                sap.ui.getCore().byId("idUominput123").setVisible(true);
                sap.ui.getCore().byId("idUom1u").setVisible(true);
                sap.ui.getCore().byId("idUominput1u").setVisible(true);
                sap.ui.getCore().byId("idQuantity19u").setVisible(true);
                sap.ui.getCore().byId("idQuantityinput91u").setVisible(true)
            }
        },
        handleChangeemail: function (e) {
            var t = sap.ui.getCore().byId("idQuantityinputE91u").getValue();
            if (t === "test@email.com") {
                n.error("This Email Already Exists", {
                    styleClass: "sapUiSizeCompact"
                })
            } else {
                n.confirm("User creation In Process.", {
                    styleClass: "sapUiSizeCompact"
                })
            }
        },
        onAssignCustPress: function (e) {
            var t = this.getView().getModel("viewProperties");
            t.setProperty("/cusId", "");
            if (!this._ACUDialog) {
                this._ACUDialog = sap.ui.xmlfragment("entrytool.fragments.assignCustomer", this);
                this.getView().addDependent(this._ACUDialog);
                this._getCustomerDetails("L")
            }
            this._ACUDialog.open()
        },
        onValidate: function () {
            var e = sap.ui.getCore().byId("idassignSave");
            var t = sap.ui.getCore().byId("idUominput1234").getValue();
            var s = sap.ui.getCore().byId("uSystem").getSelectedKey();
            var i;
            var o = this.getView().getModel("jsonSystemData").getData();
            for (var r = 0; r < o.length; r++) {
                if (o[r].Yydesc === "LEAN" && s === "L") {
                    i = o[r].Yylow
                } else if (o[r].Yydesc === "TEMPO" && s === "T") {
                    i = o[r].Yylow
                }
            }
            var a = "/ycustomervalidationSet(IvCustomer='" + t + "',IvShipParty='" + t + "',IvSyssid='" + i + "')";
            this.getOwnerComponent().getModel("MOETSRV").read(a, {
                success: function (t, s) {
                    e.setEnabled(true)
                }.bind(this),
                error: function (t) {
                    e.setEnabled(false);
                    n.show("Customer is Not Validated, Enter Correct Customer Number", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }.bind(this)
            })
        },
        onAssignCustClose: function () {
            this._ACUDialog.close();
            if (this._ACUDialog) {
                this._ACUDialog = this._ACUDialog.destroy()
            }
        },
        onAddCMClose: function () {
            this._oCMiDialog.close();
            if (this._oCMiDialog) {
                this._oCMiDialog = this._oCMiDialog.destroy()
            }
        },
        onCusAssignClose: function () {
            this._oCUADialog.close();
            if (this._oCUADialog) {
                this._oCUADialog = this._oCUADialog.destroy()
            }
        },
        onCusAssignClose1: function () {
            this._oCUADialog.close();
            if (this._oCUADialog) {
                this._oCUADialog = this._oCUADialog.destroy()
            }
        },
        onArticleValueHelpRequest: function (e) {
            var t;
            var s = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.oArticleNo) {
                this.oArticleNo = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.ArticleNumber", this);
                t.addDependent(this.oArticleNo)
            }
            this.oArticleNo.open()
        },
        handleArticleSearch: function (e) {
            var t = e.getParameter("value");
            var s = new i({
                filters: [new i("ZCUSTMR_NUM", "Contains", t.toUpperCase()), new i("ZNAME_1", "Contains", t.toUpperCase())],
                and: false
            });
            var o = e.getSource().getBinding("items");
            o.filter([s])
        },
        onPressArticleValueListClose: function (e) {
            var t = e.getParameter("selectedContexts");
            var s = e.getParameter("selectedItem");
            var o = this.getView().getModel("viewProperties");
            if (t && t.length) {
                var r = s.getBindingContext("CustomerDetails1").getObject();
                o.setProperty("/cusId", r.ZCUSTMR_NUM);
                var a = this.getOwnerComponent().getModel(),
                    n = r.ZCUSTMR_NUM,
                    u = "/CustomerDetails";
                // sap.ui.core.BusyIndicator.show();
                a.read(u, {
                    filters: [new i("ZCUSTMR_NUM", "EQ", n)],
                    success: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                        o.setProperty("/username", e.results[0].FULL_NAME);
                        o.setProperty("/emailId", e.results[0].MAIL);
                        sap.ui.getCore().byId("idassignSave").setEnabled(true)
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide()
                    }
                })
            }
            e.getSource().getBinding("items").filter([])
        },
        onSelectSystem: function () {
            var e = sap.ui.getCore().byId("uSystem").getSelectedKey();
            this._getCustomerDetails(e)
        },
        _getCustomerDetails: function (e) {
            var t = new sap.ui.model.json.JSONModel;
            var s = this.getOwnerComponent().getModel(),
                o = "/CustomerDetails",
                r = this,
                a;
            if (e === "L") {
                a = "L"
            } else {
                a = "T"
            }
            var n = sap.ui.getCore().byId("idUominput1234");
            // sap.ui.core.BusyIndicator.show();
            s.read(o, {
                filters: [new i("ZSYSTEM", "EQ", a)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(e.results);
                    r.getView().setModel(t, "CustomerDetails1");
                    n.setEnabled(true)
                },
                error: function (e) {
                    n.setEnabled(false);
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        custFragDestroy: function () {
            this._oCUADialog.close();
            if (this._oCUADialog) {
                this._oCUADialog = this._oCUADialog.destroy()
            }
        },
        onCusAssign: function (e) {
            var s = this.getView().getModel("userCustomer");
            var i = this;
            var o;
            if (e.getId() === "press") {
                o = e.getSource();
                this.oSourceCust = o
            } else {
                o = e
            }
            this.oGetRowValueCut = new t(JSON.parse(JSON.stringify(o._getBindingContext().getObject())));
            this._getAssignCustomer(function () {
                if (!this._oCUADialog) {
                    this._oCUADialog = sap.ui.xmlfragment("entrytool.fragments.customerAssignment", this);
                    this.getView().addDependent(this._oCUADialog)
                }
                this._oCUADialog.open()
            }.bind(this))
        },
        _getAssignCustomer: function (e) {
            var t = this.oGetRowValueCut.oData.ZUSR_ID,
                s = this;
            var i = this.getView().getModel("viewProperties");
            i.setProperty("/userid", this.oGetRowValueCut.oData.ZUSR_ID);
            var o = new sap.ui.model.json.JSONModel,
                r = this.getOwnerComponent().getModel(),
                a = "/UserDetails('" + t + "')/UserCustDetails";
            var n;
            // sap.ui.core.BusyIndicator.show();
            r.read(a, {
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    o.setData(t.results);
                    o.setSizeLimit(t.results.length);
                    if (e) {
                        e()
                    }
                    s.getView().setModel(o, "userCustomer12");
                    this._oCUADialog.setModel(o, "userCustomer1")
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        getUserRoleData: function () {
            var e = this,
                t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/UserRole";
            // sap.ui.core.BusyIndicator.show();
            s.read(i, {
                success: function (s) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(s.results);
                    t.setSizeLimit(s.results.length);
                    e.getView().setModel(t, "uroleData1")
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        getEmployeeDetailsData: function () {
            var e = this,
                t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/EmployeeDetails";
            // sap.ui.core.BusyIndicator.show();
            s.read(i, {
                success: function (s) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(s.results);
                    t.setSizeLimit(s.results.length);
                    e.getView().setModel(t, "empData")
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onAddCMPress1: function (eve) {
            
        },
        onAddCMPress: function () {
            this.fnClearAllValue();
            if (!this._oCMiDialog) {
                this._oCMiDialog = sap.ui.xmlfragment("entrytool.fragments.userMain", this);
                this.getView().addDependent(this._oCMiDialog)
            }
            this._oCMiDialog.open()
        },
        onChangeEmp: function (e) {
            var t = this,
                s = e.getSource(),
                o = this.getOwnerComponent().getModel(),
                r = s.getValue(),
                a = this.getView().getModel("viewProperties"),
                n = "/EmployeeDetails";
            // sap.ui.core.BusyIndicator.show();
            o.read(n, {
                filters: [new i("USERID", "EQ", r)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    a.setProperty("/username", e.results[0].FULL_NAME);
                    a.setProperty("/userid", e.results[0].USERID);
                    a.setProperty("/emailId", e.results[0].MAIL)
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onCancelPress: function () {
            var e = this.getView().getModel("viewProperties");
            this._oCMiDialog.close();
            if (this._oCMiDialog) {
                this._oCMiDialog = this._oCMiDialog.destroy()
            }
            e.setProperty("/username", "");
            e.setProperty("/userid", "");
            e.setProperty("/emailId", "")
        },
        _onCancelAssgnCust: function () {
            this._ACUDialog.close();
            if (this._ACUDialog) {
                this._ACUDialog = this._ACUDialog.destroy()
            }
        },
        onSaveAssignCustomer: function (e) {
            var t = sap.ui.getCore().byId("idUominput11").getValue(),
                s = sap.ui.getCore().byId("uSystem").getSelectedKey(),
                i = sap.ui.getCore().byId("idUominput1234").getValue(),
                o = sap.ui.getCore().byId("idQuantit3rycom").getValue(),
                r = "",
                a = "",
                u = "",
                l = i;
            if (s === "L") {
                u = "L"
            } else {
                u = "T"
            }
            var g = [{
                ZUSR_ID: t,
                ZCUST_NUM: l,
                ZSYSTEM: u,
                ZCOMMENTS: o,
                ZCUST_STATUS: "ACTV"
            }];
            var c = this;
            var d = "/HANAXS/com/merckgroup/moet/services/xsjs/userCustAssign.xsjs";
            // sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: d,
                type: "POST",
                data: JSON.stringify(g),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("Customer " + l + " is assigned to user successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    c._getAssignCustomer()
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
            this._ACUDialog.close();
            if (this._ACUDialog) {
                this._ACUDialog = this._ACUDialog.destroy()
            }
        },
        onSave1: function(){
            var userModel = this.getView().getModel("UDs");
            var i = sap.ui.getCore().byId("idUominput123").getValue();
            var o = sap.ui.getCore().byId("idQuantityinput91u").getValue();
            var r = "I";
            var a = sap.ui.getCore().byId("idQuantityinputE91u").getValue();
            var u = "Active";
            var l = sap.ui.getCore().byId("utpe").getSelectedKey();
            if (l !== "I") {
                r = "E"
            }
            if (!i) {
                i = ""
            }
            if (sap.ui.getCore().byId("idUominput1u").getSelectedItem()) {
                var g = sap.ui.getCore().byId("idUominput1u").getSelectedItem().getProperty("key")
            } else {
                g = "CUST"
            }


            var uData  =  {
                "ZUSR_ID": "",
                "ZUSR_NAME": o,
                "ZUSR_TYP": r,
                "ZUSR_ROLE": g,
                "ZUSR_EMAILADD": a,
                "ZUSR_STATUS_TXT": u,
                "ZROLE_NAME": "Capgemini Admin"
            }
            userModel.getData().UserDetails.push(uData)
            userModel.refresh()
            this.onCancelPress()
        },
        onSave: function (e) {
            var t = e;
            var s = this.getOwnerComponent().getModel();
            var i = sap.ui.getCore().byId("idUominput123").getValue();
            var o = sap.ui.getCore().byId("idQuantityinput91u").getValue();
            var r = "I";
            var a = sap.ui.getCore().byId("idQuantityinputE91u").getValue();
            var u = "ACTV";
            var l = sap.ui.getCore().byId("utpe").getSelectedKey();
            if (l !== "I") {
                r = "E"
            }
            if (!i) {
                i = ""
            }
            if (sap.ui.getCore().byId("idUominput1u").getSelectedItem()) {
                var g = sap.ui.getCore().byId("idUominput1u").getSelectedItem().getProperty("key")
            } else {
                g = "CUST"
            }
            var c = {
                ZUSR_ID: i,
                ZUSR_NAME: o,
                ZUSR_TYP: r,
                ZUSR_ROLE: g,
                ZUSR_EMAILADD: a,
                ZUSR_STATUS: u,
                OLDROLE: ""
            };
            var d = "/HANAXS/com/merckgroup/moet/services/xsjs/user.xsjs";
            // sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: d,
                type: "POST",
                data: JSON.stringify(c),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    s.refresh();
                    sap.ui.core.BusyIndicator.hide();
                    n.show("User " + o + " created successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    s.refresh();
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
        getUserRoleDataUpdate: function () {
            var e = this,
                t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/UserRolesParam(P_USR_TYP='I')/Results";
            // sap.ui.core.BusyIndicator.show();
            s.read(i, {
                success: function (s) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(s.results);
                    t.setSizeLimit(s.results.length);
                    e.getView().setModel(t, "userType")
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        getUserCustomer: function () {
            var e = this,
                t = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/UserDetails('KSURAVAR')/UserCustDetails";
            // sap.ui.core.BusyIndicator.show();
            s.read(i, {
                success: function (s) {
                    sap.ui.core.BusyIndicator.hide();
                    t.setData(s.results);
                    t.setSizeLimit(s.results.length);
                    e.getView().setModel(t, "userCustomer")
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        fStatus: function (e) {
            if (e === "Active") {
                return "ACTV"
            } else if (e === "Blocked") {
                return "BLKD"
            } else {
                return "FFDL"
            }
        },
        _onDeleteCustAssign: function (e) {
            var s = this.getOwnerComponent().getModel();
            var i = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext("userCustomer1").getObject())));
            var o = i.getData();
            var r = {
                ZUSR_ID: o.ZUSR_ID,
                ZCUST_NUM: o.ZCUST_NUM,
                ZSYSTEM: o.ZSYSTEM
            };
            var a = this,
                u = "";
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/userCustAssign.xsjs";
            u = "Confirm to add deletion flag for assigned customer " + o.ZCUST_NUM;
            n.confirm(u, {
                title: "Confirm",
                actions: [n.Action.OK, n.Action.CANCEL],
                emphasizedAction: n.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        a.deleteFunction(l, r)
                    }
                }
            })
        },
        _onUpdateCustAssign: function (e) {
            var t = this.getOwnerComponent().getModel();
            var s = this._oECADialog.getModel("EditCustAssign");
            var i = s.getData();
            var o = sap.ui.getCore().byId("ID_TEXTAREA_COMMENT").getValue();
            var r = sap.ui.getCore().byId("ID_SEL_STATUS").getProperty("selectedKey");
            var a = {
                ZUSR_ID: i.ZUSR_ID,
                ZCUST_NUM: i.ZCUST_NUM,
                ZCOMMENTS: o,
                ZCUST_STATUS: r
            };
            var u = this;
            var l = "/HANAXS/com/merckgroup/moet/services/xsjs/userCustAssign.xsjs";
            // sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: l,
                type: "PUT",
                data: JSON.stringify(a),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("User Assignment " + i.ZUSR_ID + " updated successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    u._getAssignCustomer()
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
                    u._getAssignCustomer()
                }
            });
            this._oECADialog.close();
            if (this._oECADialog) {
                this._oECADialog = this._oECADialog.destroy()
            }
        },
        _onUpdateUser: function (e) {
            var t = this.getOwnerComponent().getModel();
            var s = sap.ui.getCore().byId("ID_INPUT_USER_ID").getValue();
            var i = sap.ui.getCore().byId("ID_INPUT_USER_NAME").getValue();
            var o = sap.ui.getCore().byId("ID_INPUT_USER_EMIAL_ID").getValue();
            var r = this._oNEDialog.getModel("EditUser1");
            var a = this.oldRole;
            var u;
            if (sap.ui.getCore().byId("ID_SEL_USER_TYPE").getSelectedItem()) {
                u = sap.ui.getCore().byId("ID_SEL_USER_TYPE").getSelectedItem().getProperty("key")
            } else {
                u = "CUST"
            }
            var l = sap.ui.getCore().byId("ID_SEL_STATUS").getSelectedItem().getProperty("key");
            var g = {
                ZUSR_ID: s,
                ZUSR_ROLE: u,
                ZUSR_STATUS: l,
                OLDROLE: a
            };
            var c = "/HANAXS/com/merckgroup/moet/services/xsjs/user.xsjs";
            // sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: c,
                type: "PUT",
                data: JSON.stringify(g),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    sap.ui.core.BusyIndicator.hide();
                    n.show("User " + i + " updated successfully", {
                        icon: n.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [n.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.refresh()
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
                    t.refresh()
                }
            });
            this._oNEDialog.close();
            if (this._oNEDialog) {
                this._oNEDialog = this._oNEDialog.destroy()
            }
        },
        onCustomerValueHelpRequest: function (e) {
            var t;
            var s = e.getSource().getValue();
            if (!t) {
                t = this.getView()
            }
            if (!this.Customer) {
                this.Customer = sap.ui.xmlfragment(t.getId(), "entrytool.fragments.CustomerF4Help", this);
                t.addDependent(this.Customer)
            }
            this.Customer.open()
        },
        handleCustomerSearch: function (e) {
            var t = e.getParameter("value");
            var s = new i({
                filters: [new i("USERID", "Contains", t.toUpperCase()), new i("FULL_NAME", "Contains", t.toUpperCase())],
                and: false
            });
            var o = e.getSource().getBinding("items");
            o.filter([s])
        },
        onPressCustomerValueListClose: function (e) {
            var t = e.getParameter("selectedContexts");
            var s = e.getParameter("selectedItem");
            var o = this.getView().getModel("viewProperties");
            if (t && t.length) {
                var r = s.getBindingContext().getObject();
                o.setProperty("/cusId", r.USERID);
                var a = this.getOwnerComponent().getModel(),
                    n = r.USERID,
                    u = "/EmployeeDetails";
                // sap.ui.core.BusyIndicator.show();
                a.read(u, {
                    filters: [new i("USERID", "EQ", n)],
                    success: function (e) {
                        sap.ui.core.BusyIndicator.hide();
                        o.setProperty("/username", e.results[0].FULL_NAME);
                        o.setProperty("/userid", e.results[0].USERID);
                        o.setProperty("/emailId", e.results[0].MAIL)
                    },
                    error: function (e) {
                        sap.ui.core.BusyIndicator.hide()
                    }
                })
            }
            e.getSource().getBinding("items").filter([])
        },
        onAssignedFiltersChanged: function (e) {
            var t = e.getSource();
            for (var s in t._oFilterProvider._mTokenHandler) {
                var i = t._oFilterProvider._mTokenHandler[s];
                if (i && i.parser) {
                    i.parser.setDefaultOperation("Contains")
                }
            }
        },
        onInitialized: function (e) {
            var t = e.getSource();
            for (var s in t._oFilterProvider._mTokenHandler) {
                var i = t._oFilterProvider._mTokenHandler[s];
                if (i && i.parser) {
                    i.parser.setDefaultOperation("Contains")
                }
            }
        },
        onExportAllData: function () {
            var e = this.getOwnerComponent().getModel(),
                t = "/UserDetails",
                s = [];
            // sap.ui.core.BusyIndicator.show();
            e.read(t, {
                urlParameters: {
                    $select: "ZUSR_ID"
                },
                filters: this.oDownLoadFilters,
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    e.results.forEach(function (e) {
                        s.push(new i("ZUSR_ID", "EQ", e.ZUSR_ID))
                    });
                    this._downloadCustomerAllData(s)
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _downloadCustomerAllData: function (e) {
            var t = "/UserCustAssignDetails";
            var s = this,
                i, o;
            var r = this.getOwnerComponent().getModel();
            r.read(t, {
                filters: e,
                success: function (e) {
                    var t = e.results;
                    var r = [];
                    t.forEach(function (e) {
                        e.ZSYSTEM = e.ZSYSTEM === "L" ? "LEAN" : "TEMPO"
                    });
                    var a = s.getOwnerComponent().getModel().getServiceMetadata();
                    for (var n = 0; n < a.dataServices.schema[0].entityType.length; n++) {
                        if (a.dataServices.schema[0].entityType[n].name === "UserCustAssignDetailsType") {
                            i = a.dataServices.schema[0].entityType[n];
                            break
                        }
                    }
                    o = i.property;
                    o.forEach(function (e) {
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
                    var u = new Date;
                    var g = u.toLocaleString();
                    var c = "User Details" + " " + g;
                    var d = {
                        workbook: {
                            columns: r,
                            context: {
                                sheetName: "Customer Details"
                            }
                        },
                        fileName: c + ".xlsx",
                        dataSource: t
                    };
                    var C = new l(d);
                    C.build()
                },
                error: function (e) { }
            })
        }
    })
});