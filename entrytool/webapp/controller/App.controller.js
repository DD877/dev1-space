sap.ui.define([
    "./BaseController", "sap/ui/core/Fragment", "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel", "sap/m/Button", "sap/ui/core/CustomData", "sap/ui/Device",
    "sap/m/MessageToast", "sap/m/library", "sap/m/MessageBox", "sap/ui/model/Filter"
], function (e, t, o, s, i, n, a, r, d, l, u) {
    "use strict";
    var g = d.PlacementType;
    var h = d.VerticalPlacementType;
    var c = d.ButtonType;
    return e.extend("entrytool.controller.App", {
        _bExpanded: true,
        _initViewPropertiesModel: function () {
            this._oViewProperty = new s({
                oYesButton: false,
                oNoButton: false,
                oYesEnabled: true,
                oNoEnabled: true
            });
            sap.ui.getCore().setModel(this._oViewProperty, "oViewProperties");
            this.getView().setModel(this._oViewProperty, "oViewProperties")
        },
        onInit: function () {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            this._initViewPropertiesModel();
            this.initializeSpeechRecognization();
            this.getPropertySet();
            this.getApproveOrderPropertySet();
            this.getItemCategoryData();
            this._getSystem();
            // this.userLogin();
            var e = {
                test: true,
                username: ""
            };
            var t = new s;
            t.setData(e);
            this.getOwnerComponent().setModel(t, "appJson");
            if (a.resize.width <= 1024) {
                this.onSideNavButtonPress()
            }
            a.media.attachHandler(function (e) {
                if (e.name === "Tablet" && this._bExpanded || e.name === "Desktop") {
                    this.onSideNavButtonPress();
                    this._bExpanded = e.name === "Desktop"
                }
            }.bind(this));
            this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));
            var o = new s([{
                Text: "How can I help you today?",
                Author: "ChatBot",
                styleClass: "cls_feedlInputList_Position",
                Date: new Date
            }]);
            this.setModel(o, "chatModel");
            var i = new sap.ui.model.json.JSONModel;
            i.loadData(jQuery.sap.getModulePath("entrytool.model", "/questionnaire.json"), null, false);
            this._questionnaire = i.getData().questionnaire;
            this.setModel(this._questionnaire, "oquestionnaireData");
            var n = new sap.ui.model.json.JSONModel;
            n.loadData(jQuery.sap.getModulePath("entrytool.model", "/sideContent.json"), null, false);
            this.osidecontentData = n.getData().navigation;
            this.setModel(this.osidecontentData, "osidecontentData")
        },
        onRouteChange: function (e) {
            this.getModel("side").setProperty("/selectedKey", e.getParameter("name"));
            if (a.system.phone) {
                this.onSideNavButtonPress()
            }
            var t = {
                navigation: [{
                    titleI18nKey: "sideContentHome",
                    icon: "sap-icon://home",
                    expanded: true,
                    key: "",
                    items: []
                }, {
                    titleI18nKey: "sideContentStatistics",
                    icon: "sap-icon://sales-order",
                    expanded: true,
                    key: "statistics",
                    items: [{
                        titleI18nKey: "sideContentOrdersDrft",
                        key: "Orders"
                    }, {
                        titleI18nKey: "sideContentOrderStatistics",
                        key: "ApproveOrders"
                    }, {
                        titleI18nKey: "sideContentOrderStatistics1",
                        key: "ProcessOrders"
                    }, {
                        titleI18nKey: "sideContentOrderReport",
                        key: "OrderReport"
                    }]
                }]
            };
            var o = {
                navigation: [{
                    titleI18nKey: "sideContentHome",
                    icon: "sap-icon://home",
                    expanded: true,
                    key: "",
                    items: []
                }, {
                    titleI18nKey: "sideContentStatistics",
                    icon: "sap-icon://sales-order",
                    expanded: true,
                    key: "statistics",
                    items: [{
                        titleI18nKey: "sideContentOrdersDrft",
                        key: "Orders"
                    }, {
                        titleI18nKey: "sideContentOrderStatistics",
                        key: "ApproveOrders"
                    }, {
                        titleI18nKey: "sideContentOrderStatistics1",
                        key: "ProcessOrders"
                    }, {
                        titleI18nKey: "sideContentOrderReport",
                        key: "OrderReport"
                    }]
                }]
            };
            var i = {
                navigation: [{
                    titleI18nKey: "sideContentHome",
                    icon: "sap-icon://home",
                    expanded: true,
                    key: "",
                    items: []
                }]
            };
            var n = new s;
            var r = "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser";
            var d = this;
            $.ajax({
                url: r,
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                success: function (e, s) {
                    if (e.d["results"][0].ZUSR_ROLE === "CUST") {
                        n.setData(o);
                        d.getView().byId("navListId").setModel(n, "side")
                    }
                    if (e.d["results"][0].ZUSR_ROLE === "RSNO" || e.d["results"][0].ZUSR_ROLE === "CSERV") {
                        n.setData(t);
                        d.getView().byId("navListId").setModel(n, "side")
                    }
                    if (e.d["results"][0].ZUSR_ROLE === "") {
                        n.setData(i);
                        d.getView().byId("navListId").setModel(n, "side")
                    }
                },
                error: function (e) { }
            });
            jQuery.sap.delayedCall(100, this, function () {
                if (this.getOwnerComponent().isChartBoot) {
                    this.onOpenChatbot()
                }
            })
        },
        fnSettingsPress: function () {
            this.onCusAssign(function () {
                this.getUserInfo(function () {
                    var e = this.getView().getModel("userCustomer").getData();
                    var t = this.getView().getModel("cusInfo").getData();
                    var o = new sap.ui.model.json.JSONModel;
                    var s = new sap.ui.model.json.JSONModel;
                    if (!this._oSettingDialog) {
                        this._oSettingDialog = sap.ui.xmlfragment("entrytool.fragments.settings", this);
                        o.setData(e);
                        s.setData(t);
                        this._oSettingDialog.setModel(o, "userCustomer");
                        this._oSettingDialog.setModel(s, "CusInfo");
                        this.getView().addDependent(this._oSettingDialog)
                    }
                    this._oSettingDialog.open()
                }.bind(this))
            }.bind(this))
        },
        fnSettingsClose: function () {
            this._oSettingDialog.close();
            if (this._oSettingDialog) {
                this._oSettingDialog = this._oSettingDialog.destroy()
            }
        },
        getUserInfo: function (e) {
            var t = new sap.ui.model.json.JSONModel;
            var o, s, i, n;
            var a = "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser";
            var r = this;
            // var modelSessionUser = this.getOwnerComponent().getModel("SessionUser");
            // var dataModelSessionUser = modelSessionUser.getData(); 
            // // this.getView().setModel(modelSessionUser);
            // this.getOwnerComponent().sUserId = dataModelSessionUser.d["results"][0].ZUSR_ID;
            // this.getOwnerComponent().sUserRole = dataModelSessionUser.d["results"][0].ZUSR_ROLE;
            
            // var s = dataModelSessionUser.d["results"][0].ZUSR_NAME;
            // r.getView().byId("userButton").setText(s);
            // t.setData(dataModelSessionUser.d["results"]);
            // this.getView().setModel(t, "cusInfo");

            $.ajax({
                url: a,
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                success: function (n, a) {
                    var n = {
                        "d": {
                            "results": [
                                {
                                    "__metadata": {
                                        "type": "com.merckgroup.moet.services.odata.moet.SessionUserType",
                                        "uri": "https://jx4aa4d355e1.hana.ondemand.com:443/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser('X234869')"
                                    },
                                    "ZUSR_ID": "X234869",
                                    "ZUSR_NAME": "DIBYA",
                                    "ZUSR_EMAILADD": "dibyakanta.deo@capgemini.com",
                                    "ZUSR_TYP": "I",
                                    "ZUSR_ROLE": "ADMIN",
                                    "ZROLE_NAME": "CG Admin"
                                }
                            ]
                        }
                    }
                    // o = n.d["results"][0].ZUSR_ID;
                    s = n.d["results"][0].ZUSR_NAME;
                    // i = n.d["results"][0].ZUSR_ROLE;
                    // r.getOwnerComponent().sUserId = n.d["results"][0].ZUSR_ID;
                    // r.getOwnerComponent().sUserRole = n.d["results"][0].ZUSR_ROLE;
                    r.getView().byId("userButton").setText(s);
                    t.setData(n.d["results"]);
                    r.getView().setModel(t, "cusInfo");
                    if (typeof e === "function") {
                        e()
                    }
                },
                error: function (e) {
                    var n = {
                        "d": {
                            "results": [
                                {
                                    "__metadata": {
                                        "type": "com.merckgroup.moet.services.odata.moet.SessionUserType",
                                        "uri": "https://jx4aa4d355e1.hana.ondemand.com:443/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser('X234869')"
                                    },
                                    "ZUSR_ID": "X234869",
                                    "ZUSR_NAME": "DIBYA",
                                    "ZUSR_EMAILADD": "dibyakanta.deo@capgemini.com",
                                    "ZUSR_TYP": "I",
                                    "ZUSR_ROLE": "ADMIN",
                                    "ZROLE_NAME": "CG Admin"
                                }
                            ]
                        }
                    }
                    var s = n.d["results"][0].ZUSR_NAME;

                    r.getView().byId("userButton").setText(s);
                    t.setData(n.d["results"]);
                    r.getView().setModel(t, "cusInfo");
                    if (typeof e === "function") {
                        e()
                    }
                    // l.show(JSON.parse("Your Id is not authorized, please contact the administrator").error.message.value, {
                    //     icon: l.Icon.ERROR,
                    //     title: "Error",
                    //     actions: [l.Action.CLOSE],
                    //     styleClass: "sapUiSizeCompact myMessageBox"
                    // })
                }
            })
        },
        returnUserRole: function () {
            var e, t, o;
            var s = "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser";
            var i = this;
            $.ajax({
                url: s,
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                success: function (e, t) {
                    return e.d["results"][0].ZUSR_ROLE
                },
                error: function (e) { }
            })
        },
        onSideNavButtonPress: function () {
            var e = this.byId("app");
            var t = e.getSideExpanded();
            this._setToggleButtonTooltip(t);
            e.setSideExpanded(!e.getSideExpanded())
        },
        _setToggleButtonTooltip: function (e) {
            var t = this.byId("sideNavigationToggleButton");
            this.getBundleText(e ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function (e) {
                t.setTooltip(e)
            })
        },
        onCusAssign: function (e) {
            var t = this;
            var o;
            // sap.ui.core.BusyIndicator.show();
            var s = new sap.ui.model.json.JSONModel,
                i = this.getOwnerComponent().getModel(),
                n = "/UserDetails('" + this.getOwnerComponent().sUserId + "')/UserCustDetails";
            i.read(n, {
                success: function (o) {
                    sap.ui.core.BusyIndicator.hide();
                    s.setData(o.results);
                    s.setSizeLimit(o.results.length);
                    t.getView().setModel(s, "userCustomer");
                    if (e) {
                        e()
                    }
                }.bind(this),
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onMaterialAssign: function (e) {
            var t = e.getSource().getBindingContext("userCustomer").getObject();
            var o = new sap.ui.model.json.JSONModel,
                s = this.getOwnerComponent().getModel(),
                i = "/CustomerMatAssignDetails";
            s.read(i, {
                filters: [new u("ZCUST_NUM", "EQ", t.ZCUST_NUM)],
                success: function (e) {
                    o.setData(e.results);
                    o.setSizeLimit(e.results.length);
                    if (!this._oMatAssgnDialog) {
                        this._oMatAssgnDialog = sap.ui.xmlfragment("entrytool.fragments.UserMaterialAssignment", this);
                        this.getView().addDependent(this._oMatAssgnDialog)
                    }
                    this._oMatAssgnDialog.setModel(o, "materialAssignment");
                    this._oMatAssgnDialog.open()
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
        showShiptoPartyValue: function (e) {
            var t = this;
            var o = e.getSource().getBindingContext("userCustomer").getObject();
            var i = new s;
            var n = this.getOwnerComponent().getModel(),
                a = "/CustomerShipToPartyAssignDetails";
            // sap.ui.core.BusyIndicator.show();
            n.read(a, {
                filters: [new u("ZCUSTMR_NUM", "EQ", o.ZCUST_NUM)],
                success: function (e) {
                    sap.ui.core.BusyIndicator.hide();
                    i.setData(e.results);
                    if (!t._oShipDialog) {
                        t._oShipDialog = sap.ui.xmlfragment("entrytool.fragments.UserShipto", t);
                        t.getView().addDependent(t._oShipDialog)
                    }
                    t._oShipDialog.setModel(i, "shiptoAssignment");
                    t._oShipDialog.open()
                },
                error: function (e) {
                    sap.ui.core.BusyIndicator.hide()
                }
            })
        },
        onShipClose: function () {
            this._oShipDialog.close();
            if (this._oShipDialog) {
                this._oShipDialog = this._oShipDialog.destroy()
            }
        },
        onUserInfoPress: function (e) {
            var t = new s;
            t = this.getView().getModel("cusInfo");
            if (!this._oUserInforDialog) {
                this._oUserInforDialog = sap.ui.xmlfragment("entrytool.fragments.userInfo", this);
                this.getView().addDependent(this._oUserInforDialog);
                this._oUserInforDialog.setModel(t, "oModel_UserInfo")
            }
            this._oUserInforDialog.openBy(e.getSource())
        },
        onUserInfoClose: function () {
            this._oUserInforDialog.close();
            if (this._oUserInforDialog) {
                this._oUserInforDialog = this._oUserInforDialog.destroy()
            }
        },
        getBundleText: function (e, t) {
            return this.getBundleTextByModel(e, this.getModel("i18n"), t)
        },
        onOpenChatbot: function (e) {
            this._getChatbot(e);
            this.getOwnerComponent().isChartBoot = true;
            $("#sap-ui-blocklayer-popup").addClass("testchatboat");
            var t = jQuery.sap.getModulePath("entrytool");
            var o = sap.ui.getCore().byId("idScroll");
            jQuery.sap.delayedCall(100, this, function () {
                o.scrollTo(0, 1e8, 0)
            })
        },
        onOpenChatWindow: function (e) {
            var t = this;
            $(document).bind("keypress", function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    t._onPostMessageByEnter()
                }
            })
        },
        _getChatbot: function (e) {
            var t = this.getView().byId("idChatwithme");
            var o = this;
            if (!this._chatbot) {
                this._chatbot = sap.ui.xmlfragment("entrytool.fragments.chatbot", this);
                this.getView().addDependent(this._chatbot)
            }
            this._chatbot.openBy(t)
        },
        onChatbotClose: function () {
            $(document).unbind("keypress");
            if (this._chatbot) {
                this._chatbot.close();
                this._chatbot = this._chatbot.destroy(true)
            }
            this.getOwnerComponent().isChartBoot = false
        },
        _onPostMessageByEnter: function () {
            var e = sap.ui.getCore().byId("idFeedInput").getValue();
            if (e) {
                this._processMessage(e)
            }
            sap.ui.getCore().byId("idFeedInput").setValue("")
        },
        onPostMessage: function (e) {
            var t = e.getParameter("value");
            this._processMessage(t)
        },
        _processMessage: function (e) {
            this._addChatItem(e, "user");
            this._getBotResponse(e)
        },
        _getBotResponse: function (e) {
            var t = "";
            var o = this;
            if (!jQuery.isNumeric(e)) {
                o.handlingUseractions(false)
            }
            var i = false;
            var n = this.getView().getModel("oquestionnaireData");
            for (var a = 0; a < n.length; a++) {
                e = e.trim();
                if (e.toLowerCase() === n[a].question.toLowerCase()) {
                    t = n[a].answer;
                    t = t.trim();
                    o._addChatItem(t, "bot");
                    i = true;
                    break
                }
            }
            if (!i) {
                if (e.toLowerCase().includes("hi") || e.toLowerCase().includes("hello")) {
                    if (e.toLowerCase().includes("order detail") || e.toLowerCase().includes("details of rti") || e.toLowerCase().includes("detail")) {
                        t = "Hello, Are you looking for Order Details, if Yes, please provide Order Number";
                        o._addChatItem(t, "bot")
                    } else {
                        t = "Hello, How can I help you?";
                        o._addChatItem(t, "bot")
                    }
                } else if (e.toLowerCase().includes("How are you")) {
                    t = "I am doing good hope you are good too...";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("How are you doing")) {
                    t = "I am doing good hope you are good too...";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("How are you going")) {
                    t = "I am doing good hope you are good too...";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("What???s up?")) {
                    t = "I am good hope you are good too...";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("What is your name")) {
                    t = "Well, people call me Bot.";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Good Morning")) {
                    t = "A very Good Morning";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Good evening")) {
                    t = "A very Good Evening";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Good afternoon")) {
                    t = "A very Good Afternoon";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Good night")) {
                    t = "A very Good Night";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Tell me something")) {
                    t = "How may i help you?";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Thank you")) {
                    t = "Thank you for your valuable time.";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Goodbye")) {
                    t = "Good bye ..Have a nice day";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("How can you help me?")) {
                    t = "I can help in getting the Order status details";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("what can you do?")) {
                    t = "I can help in getting the Order status details";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("I have a question")) {
                    t = "I can help in getting the Order status details";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("can you help me?")) {
                    t = "I can help in getting the Order status details";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Are you human?")) {
                    t = "How may I help you?";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Are you a robot?")) {
                    t = "How may I help you?";
                    o._addChatItem(t, "bot")
                } else if (e.toLowerCase().includes("Ask A Question")) {
                    t = "Please enter in your question";
                    o._addChatItem(t, "bot")
                } else if (jQuery.isNumeric(e)) {
                    var r = e;
                    var d = new u("ZINTR_ORDNUM", "EQ", r);
                    t = "Order with internal order no. "+r+" is Approved and Confirmed!";
                    o._addChatItem(t, "bot");
                    // this.getOwnerComponent().getModel().read("/OrderHeaderDetails", {
                    //     urlParameters: {
                    //         $skip: 0,
                    //         $top: 1
                    //     },
                    //     filters: [d],
                    //     success: function (e) {
                    //         if (e && e.results && e.results.length) {
                    //             t = "Navigating you to Order Details page, thanks";
                    //             o.getOwnerComponent().setModel(new s(e.results[0]), "SelectedSO");
                    //             t = " Internal Order Number " + e.results[0].ZINTR_ORDNUM + " : " + e.results[0].ZORDER_STATUS_TEXT + " \n Do you want me to open this order? ";
                    //             o._addChatItem(t, "bot");
                    //             o.handlingUseractions(true, null, true, true)
                    //         } else {
                    //             t = "Can you please provide valid Internal Order Number.";
                    //             o._addChatItem(t, "bot")
                    //         }
                    //     },
                    //     error: function () {
                    //         t = "Sorry i didn't understand.We are happy to help with correct inputs";
                    //         o._addChatItem(t, "bot")
                    //     }
                    // })
                } else {
                    t = "Sorry i didn't understand.We are happy to help with correct inputs";
                    o._addChatItem(t, "bot")
                }
            }
        },
        _addChatItem: function (e, t) {
            var o = this.getView().getModel("chatModel"),
                s = o.getData();
            s.push({
                Text: e,
                Author: t === "user" ? "User" : "ChatBot",
                styleClass: t === "user" ? "User" : "ChatBot",
                Date: new Date
            });
            o.refresh(true);
            var i = sap.ui.getCore().byId("idScroll");
            setTimeout(function () {
                i.scrollTo(0, 1e6)
            }, 0)
        },
        deleteChatHistory: function (e) {
            var t = this;
            var o = this.getView().getModel("chatModel"),
                s = o.getData();
            s = [];
            s.push({
                Text: "How can I help you today?",
                Author: "ChatBot",
                styleClass: "ChatBot",
                Date: new Date
            });
            o.setData(s);
            o.refresh(true);
            t.handlingUseractions(false, true, null, true)
        },
        _getUserDetails: function (e) {
            var t = this;
            var o = "";
            var s = e.getSource();
            if (e.getSource().getProperty("text") !== "Yes" && e.getSource().getProperty("text") !== "No") {
                var i = sap.ui.getCore().byId("idButtonFlexBox");
                var n = i.getItems();
                n.forEach(function (e) {
                    e.removeStyleClass("cl_Action_Button1")
                });
                s.toggleStyleClass("cl_Action_Button1")
            } else {
                var a = sap.ui.getCore().byId("idFlexbox");
                var r = a.getItems();
                r.forEach(function (e) {
                    e.removeStyleClass("cl_Action_Button1")
                });
                s.toggleStyleClass("cl_Action_Button1")
            }
            var d = e.getSource().getProperty("text");
            if (d === "Ask A Question") {
                sap.ui.getCore().byId("idInputfeed").setVisible(true);
                t.handlingUseractions(false)
            } else if (d === "Yes") {
                if (t.getOwnerComponent().sUserRole === "CUST" && t.getOwnerComponent().getModel("SelectedSO").getData().ZORDER_STATUS_TEXT === "SNO Approval") {
                    o = "Sorry you are not authorised to see this Order";
                    t._addChatItem(o, "bot");
                    t.handlingUseractions(null, false)
                } else {
                    var l = this.getView().getModel("SelectedSO").getData();
                    var u = t.getView().getModel("SelectedSO").getData().ZORDER_STATUS_TEXT;
                    if (u === "Order Created") {
                        this.getConfirmOrderData(l)
                    } else if (u === "Draft" || u === "SNO Reviewed") {
                        this.getEditOrderData(l)
                    } else if (u === "SNO Approval") {
                        this.getApproveOrderData(l)
                    }
                }
            } else if (d === "No") {
                o = "Thank You";
                t._addChatItem(o, "bot");
                t.handlingUseractions(null, false)
            } else if (d === "Place an Order") {
                sap.ui.getCore().byId("idInputfeed").setVisible(false);
                sap.ui.getCore().byId("idbtnyes").setVisible(false);
                sap.ui.getCore().byId("idbtnno").setVisible(false);
                o = "Navigating to Order creation page, Thanks ";
                t._addChatItem(o, "bot");
                return this.getRouter().navTo("NewOrder")
            } else if (d === "Open Orders") {
                sap.ui.getCore().byId("idInputfeed").setVisible(false);
                sap.ui.getCore().byId("idbtnyes").setVisible(false);
                o = "Navigating to Open Orders page, Thanks ";
                t._addChatItem(o, "bot");
                sap.ui.getCore().byId("idInputfeed").setVisible(false);
                return this.getRouter().navTo("Orders")
            } else if (d === "Confirmed Orders") {
                sap.ui.getCore().byId("idInputfeed").setVisible(false);
                sap.ui.getCore().byId("idbtnyes").setVisible(false);
                o = "Navigating to Confirmed Orders page, Thanks";
                t._addChatItem(o, "bot");
                sap.ui.getCore().byId("idInputfeed").setVisible(false);
                return this.getRouter().navTo("ProcessOrders")
            } else if (d === "Order Report") {
                sap.ui.getCore().byId("idInputfeed").setVisible(false);
                sap.ui.getCore().byId("idbtnyes").setVisible(false);
                o = "Navigating to Order Report page, Thanks";
                t._addChatItem(o, "bot");
                sap.ui.getCore().byId("idInputfeed").setVisible(false);
                return this.getRouter().navTo("OrderReport")
            } else if (d === "Order Status") {
                sap.ui.getCore().byId("idInputfeed").setVisible(true);
                o = "Please enter Internal Order Number";
                t._addChatItem(o, "bot")
            } else if(d === "682") {
                sap.ui.getCore().byId("idInputfeed").setVisible(true);
                o = "Approved and Confirmed!";
                t._addChatItem(o, "bot")
            }
            var g = false;
            var h = this.getView().getModel("oquestionnaireData");
            for (var c = 0; c < h.length; c++) {
                d = d.trim();
                if (d.toLowerCase() === h[c].question.toLowerCase()) {
                    o = h[c].answer;
                    o = o.trim();
                    t._addChatItem(o, "bot");
                    g = true;
                    break
                }
            }
            if (!g) {
                if (d.toLowerCase().includes("hi") || d.toLowerCase().includes("hello")) {
                    if (d.toLowerCase().includes("order detail") || d.toLowerCase().includes("details of rti") || e.toLowerCase().includes("detail")) {
                        o = "Hello, Are you looking for Order Details, if Yes, please provide Order Number";
                        t._addChatItem(o, "bot")
                    } else {
                        o = "Hello, How can I help you?";
                        t._addChatItem(o, "bot")
                    }
                }
                if (d.toLowerCase().includes("Ask A Question")) {
                    o = "Please enter in your question";
                    t._addChatItem(o, "bot")
                }
            }
        },
        onAfterRendering: function () {
            // e(document.getElementById("container-MOET---app--idChatwithme"));
            
            function e(e) {
                var t = 0,
                    o = 0,
                    s = 0,
                    i = 0;
                if (document.getElementById(e.id)) {
                    document.getElementById(e.id).onmousedown = n
                } else {
                    e.onmousedown = n
                }

                function n(e) {
                    e = e || window.event;
                    e.preventDefault();
                    s = e.clientX;
                    i = e.clientY;
                    document.onmouseup = r;
                    document.onmousemove = a
                }

                function a(n) {
                    n = n || window.event;
                    n.preventDefault();
                    t = s - n.clientX;
                    o = i - n.clientY;
                    s = n.clientX;
                    i = n.clientY;
                    e.style.top = e.offsetTop - o + "px";
                    e.style.left = e.offsetLeft - t + "px";
                    e.style.right = "auto";
                    e.style.bottom = "auto"
                }

                function r() {
                    document.onmouseup = null;
                    document.onmousemove = null
                }
            }
            e(document.getElementById("container-entrytool---App--idChatwithme"));
        },
        handlingUseractions: function (e, t, o, s) {
            var i = sap.ui.getCore().byId("idFlexbox");
            var n = i.getItems();
            if (e !== null) {
                this._oViewProperty.setProperty("/oYesButton", e);
                this._oViewProperty.setProperty("/oNoButton", e)
            }
            if (t !== null || t !== undefined) {
                this._oViewProperty.setProperty("/oYesEnabled", t);
                this._oViewProperty.setProperty("/oNoEnabled", t)
            }
            if (o) {
                this._oViewProperty.setProperty("/oYesEnabled", !this._oViewProperty.getProperty("/oYesEnabled"));
                this._oViewProperty.setProperty("/oNoEnabled", !this._oViewProperty.getProperty("/oNoEnabled"))
            }
            if (s) {
                n.forEach(function (e) {
                    e.removeStyleClass("cl_Action_Button1")
                })
            }
        },
        onStartRecording: function () {
            sap.ui.getCore().byId("idInputfeed").setVisible(true);
            var e = "";
            var t = this;
            this.recognition.start();
            sap.ui.getCore().byId("idSoundloud").setType("Accept");
            sap.ui.getCore().byId("idSoundloud").setEnabled(false);
            r.show("Recording started");
            this.recognition.onstart = function () { };
            this.recognition.onresult = function (o) {
                var s = "";
                for (var i = o.resultIndex; i < o.results.length; ++i) {
                    if (o.results[i].isFinal) {
                        e += o.results[i][0].transcript
                    } else {
                        s += o.results[i][0].transcript
                    }
                }
                if (e != "") {
                    t.submitValue(e);
                    e = ""
                }
            }
        },
        submitValue: function (e) {
            var t = e.toLowerCase().trim();
            sap.ui.getCore().byId("idFeedInput").setValue(t);
            sap.ui.getCore().byId("idSoundloud").setEnabled(true);
            this.recognition.stop();
            sap.ui.getCore().byId("idSoundloud").setType("Default");
            this._onPostMessageByEnter()
        },
        initializeSpeechRecognization: function () {
            this.recognition = new window.webkitSpeechRecognition;
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = "en-IN"
        }
    })
});