sap.ui.define([
    "./BaseController", "sap/ui/model/json/JSONModel", "sap/ui/Device", "sap/ui/model/Filter",
    "entrytool/model/formatter", 
    "sap/m/MessageBox",
    "sap/viz/ui5/controls/VizFrame"
], function (e, t, o, r, s, i, n) {
    "use strict";
    return e.extend("entrytool.controller.Home", {
        formatter: s,
        onInit: function () {
            var dataModel = this.getOwnerComponent().getModel("data");
            this.getView().setModel(dataModel);
            
            var omodel = this.getOwnerComponent().getModel("OrderHeaderDetails");
            this.getView().setModel(omodel, "OHDs");

            this.getOwnerComponent().countFlag = false;  //commented this 
            // this.getOwnerComponent().countFlag = true;      //added this change 

            this._getSystem();
            var e = new t({
                visible: true
            });
            this.getView().setModel(e, "jsonHomeVisible");
            this.getRouter().getRoute("home").attachPatternMatched(this._onRouteMatched, this);
            this.getPropertySet();
            this.getItemCategoryData();
            this.getApproveOrderPropertySet();
            this.userLogin();
            var r = new t({
                isPhone: o.system.phone
            });
            this.setModel(r, "view");
            var s = new t({
                Draft: "12",
                Approve: "29",
                Confirm: "30"
            });
            this.getView().setModel(s, "jsonCount");
            o.media.attachHandler(function (e) {
                this.getModel("view").setProperty("/isPhone", e.name === "Phone")
            }.bind(this));
            var i = this.getOwnerComponent().getModel();
            i.metadataLoaded().then(function () {
                this.userLoginHome()
            }.bind(this))
        },
        userLoginHome: function () {
            var e = this;
            var t = this.getOwnerComponent().getModel(),
                o = "/SessionUser";
            // sap.ui.core.BusyIndicator.show();
            t.read(o, {
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    var o = e.getView().getModel("jsonHomeVisible");
                    if (t.results[0].ZUSR_ROLE === "") {
                        o.setProperty("/visible", false)
                    }
                    e.getOwnerComponent().sUserId = t.results[0].ZUSR_ID;
                    e.getOwnerComponent().sUserRole = t.results[0].ZUSR_ROLE;
                    e.GetValue()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        _onRouteMatched: function (e) {
            if (this.getOwnerComponent().countFlag === false) {
                this.GetValue()
            }
            this.getVisiblePlaceOrder();
            var t = this;
            setInterval(function () {
                t.userLogin()
            }, 3e5)
        },
        onBeforeRebindTable: function (e) {
            var t = e.getParameter("bindingParams");
            var o = this.getView().byId("smartTableHome");
            var s = this.getView().getModel("viewProperties");
            var i = s.getData().LoginID;
            var n = this.getOwnerComponent().sUserRole;
            var a;
            if (n === "RSNO") {
                a = "/SNOOrders";
                o.setTableBindingPath(a)
            }
            if (this.getOwnerComponent().sUserRole === "CUST") {
                t.filters.push(new r("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId));
                t.filters.push(new r("ZORD_STATUS", "EQ", "DRFT"));
                t.filters.push(new r("ZORD_STATUS", "EQ", "SNOR"))
            }
            if (this.getOwnerComponent().sUserRole === "RSNO") {
                t.filters.push(new r("ZORD_STATUS", "EQ", "DRFT", true));
                t.filters.push(new r("ZORD_STATUS", "EQ", "SNOR", true));
                t.filters.push(new r("ZORD_STATUS", "EQ", "SNOA", true));
                t.filters.push(new r("ZORD_STATUS", "EQ", "ORCR", true))
            }
            if (!t.sorter.length) {
                t.sorter.push(new sap.ui.model.Sorter("ZCHANGED_ON", true))
            }
        },
        soLineShow: function (e) {
            var o = this.getView().getModel("OrderData1").getData();
            var r = this._oViewProperties = new t;
            r.setData(o);
            var s = e.getSource().getBindingContext("OrderData12") ? e.getSource().getBindingContext("OrderData12").getObject() : e.getSource().getBindingContext("salesorderData").getObject();
            var n, a = o.ZSYSTEM;
            var g = this.getView().getModel("jsonSystemData").getData();
            for (var d = 0; d < g.length; d++) {
                if (g[d].Yydesc === "LEAN" && a === "L") {
                    n = g[d].Yylow
                } else if (g[d].Yydesc === "TEMPO" && a === "T") {
                    n = g[d].Yylow
                }
            }
            var u = "datetime%27" + this.formatDate1(s.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";
            var l = "/ysoschedulelinesSet(distchnl='" + o.ZDISTR_CHNL + "',division='" + o.ZDIVISION + "',salesorg='" + o.ZSALES_AREA + "',customer='" + o.ZCUST_NUM + "',Material='" + s.ZMAT_NUM + "',Unit='" + "PC" + "',Sysid='" + n + "',ReqDate=" + u + ",ReqQty=" + parseInt(s.ZTRGT_QTY) + ")";
            // sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(l, {
                success: function (e, o) {
                    sap.ui.core.BusyIndicator.hide();
                    var s = new t;
                    s.setData(e);
                    if (!this._oCSSOLADialog) {
                        this._oCSSOLADialog = sap.ui.xmlfragment("entry.fragments.orderSimulateAprSOLine", this);
                        this.getView().addDependent(this._oCSSOLADialog);
                        this._oCSSOLADialog.setModel(s, "ssoLineJson");
                        this._oCSSOLADialog.setModel(r, "ssoLineJson1")
                    }
                    if (e.Retmsg) {
                        i.show(e.Retmsg, {
                            icon: i.Icon.ERROR,
                            title: "Error",
                            actions: [i.Action.CLOSE],
                            styleClass: "sapUiSizeCompact myMessageBox"
                        })
                    }
                    this._oCSSOLADialog.open()
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    i.show(e.message, {
                        icon: i.Icon.ERROR,
                        title: "Error",
                        actions: [i.Action.CLOSE],
                        styleClass: "sapUiSizeCompact myMessageBox"
                    })
                }.bind(this)
            })
        },
        soLineClose: function () {
            this._oCSSOLADialog.close();
            if (this._oCSSOLADialog) {
                this._oCSSOLADialog = this._oCSSOLADialog.destroy()
            }
        },
        GetValue: function () {
            var e = this;
            e.oModel = this.getOwnerComponent().getModel();
            var t = this.getOwnerComponent().sUserId;
            var o = this.getOwnerComponent().sUserRole;
            var r = this.getView().getModel("jsonCount");
            var s = "/OrderStatusCountParam(P_USR_ID='" + t + "',P_USER_ROLE='" + o + "')/Results";
            // sap.ui.core.BusyIndicator.show();
            e.oModel.read(s, {
                success: function (t) {
                    sap.ui.core.BusyIndicator.hide();
                    e.getOwnerComponent().countFlag = true;
                    var o = t.results[0].DRFT + t.results[0].SNOR;
                    r.setProperty("/Draft", o);
                    r.setProperty("/Approve", t.results[0].SNOA);
                    r.setProperty("/Confirm", t.results[0].ORCR);
                    e.DountChartdisplay()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        DountChartdisplay: function () {
            this.oVizFrame = new n({
                id: "idPostEventVizFrame",
                vizType: "donut",
                width: "100%",
                height: "350px"
            });
            var e = this.getView().getModel("jsonCount");
            var o = new t;
            o.setData([{
                events: "Open Orders",
                tot_events: e.getData().Draft
            }, {
                events: "Approval Pending Orders",
                tot_events: e.getData().Approve
            }, {
                events: "Confirmed Orders",
                tot_events: e.getData().Confirm
            }]);
            if (o.getData()[0].tot_events === 0 && o.getData()[1].tot_events === 0 && o.getData()[2].tot_events === 0) {
                o.getData()[0].tot_events = 1
            }
            this.oVizFrame.setModel(o, "oJsonaPostOnEvent1");
            this.getVisiblePlaceOrder();
            var r = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [{
                    name: "Color",
                    value: "{oJsonaPostOnEvent1>events}"
                }],
                measures: [{
                    name: "Events",
                    value: "{oJsonaPostOnEvent1>tot_events}"
                }],
                data: {
                    path: "oJsonaPostOnEvent1>/"
                }
            });
            this.oVizFrame.setDataset(r);
            this.oVizFrame.setVizProperties({
                title: {
                    text: "Sales Order Status",
                    layout: {
                        maxHeight: .05,
                        height: .05
                    },
                    visible: "false",
                    style: {
                        fontSize: 16
                    }
                },
                valueAxis: {
                    title: {
                        visible: "true"
                    }
                },
                general: {
                    groupData: "true",
                    layout: {
                        isFixedPadding: "true",
                        padding: 1
                    }
                },
                categoryAxis: {
                    title: {
                        visible: "true"
                    }
                },
                plotArea: {
                    radius: .3,
                    dataPointSize: {
                        min: 10,
                        max: 10
                    },
                    dataLabel: {
                        visible: "true",
                        hideWhenOverlap: "false",
                        distance: "-1"
                    },
                    colorPalette: ["#FFC832", "#A5CD50", "#E61E50", "#EB3C96"],
                    drawingEffect: "glossy"
                },
                legendGroup: {
                    layout: {
                        position: "right",
                        alignment: "center",
                        width: "0.35"
                    }
                }
            });
            var s = new sap.viz.ui5.controls.common.feeds.FeedItem({
                uid: "size",
                type: "Measure",
                values: ["Events"]
            }),
                i = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    uid: "color",
                    type: "Dimension",
                    values: ["Color"]
                });
            this.oVizFrame.addFeed(s);
            this.oVizFrame.addFeed(i);
            this.getView().byId("vizFrameDonut").addItem(this.oVizFrame);
            this.oVizFrame.getModel("oJsonaPostOnEvent1").refresh()
        },
        pressAppr: function () {
            var e = sap.ui.core.UIComponent.getRouterFor(this);
            if (this.getOwnerComponent().sUserRole === "CUST") {
                return
            } else {
                e.navTo("ApproveOrders")
            }
        },
        pressTran: function () {
            var e = sap.ui.core.UIComponent.getRouterFor(this);
            e.navTo("ProcessOrders")
        },
        pressTrack: function () {
            var e = sap.ui.core.UIComponent.getRouterFor(this);
            e.navTo("OrderReport")
        },
        press: function () {
            var e = sap.ui.core.UIComponent.getRouterFor(this);
            e.navTo("Orders")
        },
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
        onPressApproveOrder: function (e) {
            var t;
            if (e.getParameter("row")) {
                t = e.getParameter("row").getBindingContext().getObject()
            } else if (e.getParameter("rowContext")) {
                t = e.getParameter("rowContext").getObject()
            } else if (e.getSource().getBindingContext()) {
                t = e.getSource().getBindingContext().getObject()
            }
            this.getApproveOrderData(t)
        },
        onPressConfirmHome: function (e) {
            var t;
            if (e.getParameter("row")) {
                t = e.getParameter("row").getBindingContext().getObject()
            } else if (e.getParameter("rowContext")) {
                t = e.getParameter("rowContext").getObject()
            } else if (e.getSource().getBindingContext()) {
                t = e.getSource().getBindingContext().getObject()
            }
            this.getConfirmOrderData(t)
        }
    })
});