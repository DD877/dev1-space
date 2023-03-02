sap.ui.define([
    "entrytool/controller/BaseController",
    "sap/ui/model/json/JSONModel", "entrytool/model/formatter",
    "sap/ui/model/Filter", "sap/ui/model/Sorter", "sap/m/Token", "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (e, t, o, s, a, i, n, r) {
    "use strict";
    return e.extend("entrytool.controller.ItemCategory", {
        custFormatter: o,
        onInit: function () {
            var omodel = this.getOwnerComponent().getModel("ItemCategory");
            this.getView().setModel(omodel, "ICs");
            this.getRouter().getRoute("ItemCategory").attachPatternMatched(this._onRouteMatched, this);
            this._loadODataUtils();
            this.fNotification = [];
            this._oViewPropertiesMatA = new t({
                matNo: "",
                itmCat: "",
                matDec: "",
                bsystem: ""
            });
            this.getView().setModel(this._oViewPropertiesMatA, "viewPropertiesMatA")
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
            var e = this._smartTable.getTable(),
                t = 0,
                o = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = o.length; t > 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onBeforeRebindTable: function (e) { },
        onAddItmCatClose: function () {
            this._oItmCatDialog.close();
            if (this._oItmCatDialog) {
                this._oItmCatDialog = this._oItmCatDialog.destroy()
            }
        },
        onAddItmCatPress: function () {
            if (!this._oItmCatDialog) {
                this._oItmCatDialog = sap.ui.xmlfragment("entrytool.fragments.addItemCategory", this);
                this.getView().addDependent(this._oItmCatDialog)
            }
            this._oItmCatDialog.open()
        },
        onDeleteItmPress: function (e) {
            var o = this.getOwnerComponent().getModel();
            var s = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            var a = this,
                i = "";
            var n = s.getData().ZITM_CATEGORY;
            var C = {
                ZITM_CATEGORY: s.getData().ZITM_CATEGORY,
                ZSYSTEM: s.getData().ZSYSTEM
            };
            var c = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
            if (s.getData().ZDEL_FLAG === "") {
                i = "Confirm to add deletion flag for Item Category " + s.getData().ZITM_CATEGORY
            } else {
                i = "Confirm to delete Item Category " + s.getData().ZITM_CATEGORY
            }
            r.confirm(i, {
                title: "Confirm",
                actions: [r.Action.OK, r.Action.CANCEL],
                emphasizedAction: r.Action.OK,
                onClose: function (e) {
                    if (e === "OK") {
                        a.deleteFunction(c, C)
                    }
                }
            })
        },
        deleteFunction: function (e, t) {
            var o = this.getOwnerComponent().getModel();
            $.ajax({
                url: e,
                type: "DELETE",
                data: JSON.stringify(t),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    r.show(e.message, {
                        icon: r.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    o.refresh()
                },
                error: function (e) {
                    r.show(e.responseJSON.message, {
                        icon: r.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onUpdateItmPress: function (e) {
            var o = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            if (!this._oupdateItmCatDialog) {
                this._oupdateItmCatDialog = sap.ui.xmlfragment("entrytool.fragments.itemCatEdit", this);
                this._oupdateItmCatDialog.setModel(o, "editItmCat");
                this.getView().addDependent(this._oupdateItmCatDialog)
            }
            this._oupdateItmCatDialog.open()
        },
        onUpdateItmClose: function (e) {
            this._oupdateItmCatDialog.close();
            if (this._oupdateItmCatDialog) {
                this._oupdateItmCatDialog = this._oupdateItmCatDialog.destroy()
            }
            this._oupdateItmCatDialog.getModel("editItmCat").refresh()
        },
        onUpdateItmSavePress: function (e) {
            var t = this.getOwnerComponent().getModel();
            var o = sap.ui.getCore().byId("idEItemCat").getValue();
            var s = {
                ZITM_CATEGORY: sap.ui.getCore().byId("idEItemCat").getValue(),
                ZSYSTEM: sap.ui.getCore().byId("idEItemCatSys").getSelectedKey(),
                ZITM_CATEGORY_DESC: sap.ui.getCore().byId("idEItemCatDec").getValue(),
                ZDEL_FLAG: sap.ui.getCore().byId("idDeletionFlag").getState() === true ? "X" : ""
            };
            var a = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
            $.ajax({
                url: a,
                type: "POST",
                data: JSON.stringify(s),
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    r.show("Item Category " + o + " updated successfully", {
                        icon: r.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    t.refresh()
                },
                error: function (e) {
                    r.show(e.responseJSON.message, {
                        icon: r.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this.onUpdateItmClose()
        },
        onSaveItemMaster: function (e) {
            var t = this;
            var o = this.getOwnerComponent().getModel();
            var s = sap.ui.getCore().byId("idItemCat").getValue();
            var a = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
            var i = {
                ZITM_CATEGORY: sap.ui.getCore().byId("idItemCat").getValue(),
                ZSYSTEM: sap.ui.getCore().byId("idItemCatSys").getSelectedKey(),
                ZITM_CATEGORY_DESC: sap.ui.getCore().byId("idItemCatDec").getValue(),
                ZDEL_FLAG: ""
            };
            $.ajax({
                url: a,
                type: "POST",
                data: JSON.stringify(i),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    r.show("Item Category " + s + " created successfully", {
                        icon: r.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    o.refresh()
                },
                error: function (e) {
                    r.show(e.responseJSON.message, {
                        icon: r.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            });
            this.onAddItmCatClose()
        },
        onUpdateItem: function (e) {
            var o = new t(JSON.parse(JSON.stringify(e.getSource()._getBindingContext().getObject())));
            var s = this.getOwnerComponent().getModel();
            var a = this,
                i;
            if (e.getParameter("state") === true) {
                i = "X"
            } else {
                i = ""
            }
            var n = {
                ZITM_CATEGORY: o.getData().ZITM_CATEGORY,
                ZSYSTEM: o.getData().ZSYSTEM,
                ZITM_CATEGORY_DESC: o.getData().ZITM_CATEGORY_DESC,
                ZDEL_FLAG: i
            };
            var C = "/HANAXS/com/merckgroup/moet/services/xsjs/itemCategory.xsjs";
            sap.ui.core.BusyIndicator.show();
            $.ajax({
                url: C,
                type: "POST",
                data: JSON.stringify(n),
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    sap.ui.core.BusyIndicator.hide();
                    r.show("For Item Category " + o.getData().ZITM_CATEGORY + ", deletion flag revoked", {
                        icon: r.Icon.SUCCESS,
                        title: "SUCCESS",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    });
                    s.refresh()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    r.show(e.responseJSON.message, {
                        icon: r.Icon.ERROR,
                        title: "Error",
                        onClose: this.onAssignClose,
                        actions: [r.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }
            })
        },
        onAssignedFiltersChanged: function (e) {
            var t = e.getSource();
            for (var o in t._oFilterProvider._mTokenHandler) {
                var s = t._oFilterProvider._mTokenHandler[o];
                if (s && s.parser) {
                    s.parser.setDefaultOperation("Contains")
                }
            }
        },
        onInitialized: function (e) {
            var t = e.getSource();
            for (var o in t._oFilterProvider._mTokenHandler) {
                var s = t._oFilterProvider._mTokenHandler[o];
                if (s && s.parser) {
                    s.parser.setDefaultOperation("Contains")
                }
            }
        }
    })
});