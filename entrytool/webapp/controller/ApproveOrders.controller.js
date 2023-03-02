sap.ui.define([
    "entrytool/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "entrytool/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    'sap/ui/model/FilterOperator'

], function (e, t, o, i, r, s, FilterOperator) {
    "use strict";
    return e.extend("entrytool.controller.ApproveOrders", {
        custFormatter: o,
        onInit: function () {
            var omodel = this.getOwnerComponent().getModel("OrderHeaderDetails");
            this.getView().setModel(omodel, "OHDs");

            var oFilterStatus = new i("ZORD_STATUS", sap.ui.model.FilterOperator.Contains, "SNOA");
            this.getView().byId("table1").getBinding("items").filter([oFilterStatus])

            this.getRouter().getRoute("ApproveOrders").attachPatternMatched(this._onRouteMatched, this);
            // this._loadODataUtils();
            this.getApproveOrderPropertySet();
            this.getItemCategoryData();
            this._getSystem();
            var e = new t({
                visible: true
            });
            this.getView().setModel(e, "jsonVisible")
        },
        _onRouteMatched: function (e) {
            var t = this.getView().byId("smartTableApprove");
            var o = this.getView().getModel("viewProperties");
            var i = o.getData().LoginID;
            var r = this.getOwnerComponent().sUserRole;
            var s;
            if (r === "RSNO") {
                s = "/SNOOrders";
                t.setTableBindingPath(s)
            }
            t.rebindTable();
            this.onDataReceived();
            this.getVisiblePlaceOrder();
            var a = this;
            setInterval(function () {
                a.userLogin()
            }, 3e5)
        },
        onDataReceived: function () {
            var e = this.getView().byId("smartTableApprove").getTable(),
                t = 0,
                o = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (t = o.length; t >= 0; t--) {
                    e.autoResizeColumn(t)
                }
            })
        },
        onBeforeRendering: function () { },
        onBeforeRebindTable: function (e) {
            var t = e.getParameter("bindingParams");
            t.filters.push(new i("ZORD_STATUS", "EQ", "SNOA"));
            var o = this.getView().getModel("jsonVisible");
            if (this.getOwnerComponent().sUserRole === "CUST") {
                t.filters.push(new i("ZCREATED_BY", "EQ", this.getOwnerComponent().sUserId));
                o.setProperty("/visible", false)
            }
            if (!t.sorter.length) {
                t.sorter.push(new sap.ui.model.Sorter("ZINTR_ORDNUM", true));
                t.sorter.push(new sap.ui.model.Sorter("ZCHANGED_ON", true))
            }
        },
        onSimulateClose: function () {
            this._oSiDialog.close();
            if (this._oSiDialog) {
                this._oSiDialog = this._oSiDialog.destroy()
            }
        },
        soLineClose: function () {
            this._oSSOLADialog.close();
            if (this._oSSOLADialog) {
                this._oSSOLADialog = this._oSSOLADialog.destroy()
            }
        },
        soLineShow: function (e) {
            var o = this._oCM1iDialog.getModel("OrderData1").getData();
            var i = this._oCM1iDialog.getModel("OrderDataF").getData();
            var r = this._oCM1iDialog.getModel("OrderData12");
            var a = this._oViewProperties = new t;
            a.setData(o);
            var n = e.getSource().getBindingContext("OrderData12").getObject();
            var l = this.getView().getModel("viewProperties1");
            var g, d = o.ZSYSTEM;
            var c = this.getView().getModel("jsonSystemData").getData();
            for (var h = 0; h < c.length; h++) {
                if (c[h].Yydesc === "LEAN" && d === "L") {
                    g = c[h].Yylow
                } else if (c[h].Yydesc === "TEMPO" && d === "T") {
                    g = c[h].Yylow
                }
            }
            var u = "datetime%27" + this.formatDate1(n.ZREQ_DLVRYDAT) + "T00%3A00%3A00%27";
            var S = "/ysoschedulelinesSet(distchnl='" + o.ZDISTR_CHNL + "',division='" + o.ZDIVISION + "',salesorg='" + o.ZSALES_AREA + "',customer='" + o.ZCUST_NUM + "',Material='" + n.ZMAT_NUM + "',Unit='" + n.ZALT_UOM + "',Sysid='" + g + "',ReqDate=" + u + ",ReqQty=" + n.ZTRGT_QTY + ")";
            sap.ui.core.BusyIndicator.show();
            this.getOwnerComponent().getModel("MOETSRV").read(S, {
                success: function (e, o) {
                    sap.ui.core.BusyIndicator.hide();
                    var i = new t;
                    i.setData(e);
                    if (!this._oSSOLADialog) {
                        this._oSSOLADialog = sap.ui.xmlfragment("entrytool.fragments.orderSimulateAprSOLine", this);
                        this.getView().addDependent(this._oSSOLADialog);
                        this._oSSOLADialog.setModel(i, "ssoLineJson");
                        this._oSSOLADialog.setModel(a, "ssoLineJson1")
                    }
                    if (e.Retmsg) {
                        s.show(e.Retmsg, {
                            icon: s.Icon.ERROR,
                            title: "Error",
                            actions: [s.Action.CLOSE],
                            styleClass: "sapUiSizeCompact myMessageBox"
                        })
                    }
                    this._oSSOLADialog.open()
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    s.show(e.message, {
                        icon: s.Icon.ERROR,
                        title: "Error",
                        actions: [s.Action.CLOSE],
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
            this.getApproveOrderData(t)
        },
        pressAddAttachment: function (e) {
            var t = this.getView().getModel("viewProperties1");
            this.oAttachData = e.getSource();
            var o, i, r, s = t.getProperty("/ZDOC_ID");
            if (s) {
                o = s.split("_MOET_")[0];
                i = s.split("_MOET_")[1]
            } else {
                oData[sComSpec] = ""
            }
            if (o && i) {
                sap.m.URLHelper.redirect("/CMIS/cmis/download?docId=" + o, true)
            } else { }
        },
        onAssignedFiltersChanged: function (e) {
            var t = e.getSource();
            for (var o in t._oFilterProvider._mTokenHandler) {
                var i = t._oFilterProvider._mTokenHandler[o];
                if (i && i.parser) {
                    i.parser.setDefaultOperation("Contains")
                }
            }
        },
        onInitialized: function (e) {
            var t = e.getSource();
            for (var o in t._oFilterProvider._mTokenHandler) {
                var i = t._oFilterProvider._mTokenHandler[o];
                if (i && i.parser) {
                    i.parser.setDefaultOperation("Contains")
                }
            }
        },
        approveOrder: function (e) {
            var data = e.getSource().getParent().getCells()
            var contextData = [];
            data.forEach((x) => { contextData.push(x.getProperty('text')) })
            console.log(contextData)
            var data2 = this.getView().getModel("CustomerShipToPartyAssignDetails").getData().CustomerShipToPartyAssignDetails[0]
            var d = new Date();
            var mainData =
            {
                "ZCUSTOMER_NAME": contextData[1],
                "ZSHIP_TO_PARTY_DESC": data2.ZSHIP_TO_PARTY_DESC,
                "ShipToAddr": data2.ZCITY + ", "+ data2.ZPOSTAL_CODE,
                "ZFTRADE_DESC": "",
                "ZCUST_PONUM": contextData[0],
                "ZSYSTEM": "",
                "ZTEDER_FLAG": "X",
                "ZCUST_PODAT": d.toDateString(),
                "ZTOTAL_AMT": "",
                "ZDISCNT": "",
                "FileName": ""
            }


            var modelSata = new t();
            modelSata.setData(mainData)
            this.getView().setModel(modelSata,"OrderData1")
            if (!this.orderApprove) {
                this.orderApprove = sap.ui.xmlfragment("entrytool.fragments.orderApprove", this);
                this.getView().addDependent(this.orderApprove)
            }
            var matModel = this.getView().getModel('CustomerMatAssignDetails')
            this.orderApprove.setModel(matModel,'MatD')
            this.orderApprove.setModel("OrderData1")
            this.orderApprove.open()
            // this.byId("idlead").getParameters("state")
            // // 
        },
        onAddCM1Close: function (e) {
            this.orderApprove.close()
            if (this.orderApprove) {
                this.orderApprove = this.orderApprove.destroy()
            }
            this.getView().getModel("viewProperties1").getData().idlead = false
            this.getView().getModel("viewProperties1").getData().iddisc = false
            this.getView().getModel("viewProperties1").getData().idchk = false
            this.getView().getModel("viewProperties1").getData().idmin = false
        },
        onReview: function(){
            // this.byId("idlead").getParameters("state")
        },
        onAppr: function(e){
            var IntOrderNum =  this.getView().getModel('OrderData1').getData().ZCUST_PONUM
            var  numId;
            // var that =this;
            var arr = this.getView().getModel('OrderHeaderDetails').getData()
            arr.OrderHeaderDetails.forEach(
                (x,i)=>{
                    if(x.ZINTR_ORDNUM==IntOrderNum ){
                        numId = i
                    }
                })
                console.log(numId)
                var  wss = Math.floor(Math.random() * (5100019232 - 5100010232)) + 5100009232;
                arr.OrderHeaderDetails[numId] = {
                    "__metadata": {
                        "type": "com.merckgroup.moet.services.odata.moet.OrderHeaderDetailsType",
                        "uri": "https://jx4aa4d355e1.hana.ondemand.com:443/com/merckgroup/moet/services/odata/moet.xsodata/OrderHeaderDetails(ZINTR_ORDNUM=460,ZSYSTEM='L',ZORD_NUM=null)"
                    },
                    "ZINTR_ORDNUM": IntOrderNum,
                    "ZORD_NUM": wss,
                    "ZCUST_NUM": "210333226",
                    "ZCUST_PONUM": "Test",
                    "ZORD_STATUS": "ORCR",
                    "ZORDER_STATUS_TEXT": "Order Created",
                    "ZCREATED_BY": "Y204681"
                }
                this.getView().getModel('OrderHeaderDetails').setData(arr)
                this.getView().getModel("OrderHeaderDetails").refresh()
                s.confirm("Sales Document No. "+wss+" is generated!");
                this.onAddCM1Close();

        }
    })
});