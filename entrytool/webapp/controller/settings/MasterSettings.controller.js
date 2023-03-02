sap.ui.define([
    "entrytool/controller/BaseController", 
    "sap/m/MessageToast", 
    "sap/ui/model/json/JSONModel", 
    "entrytool/model/formatter"
], function(e, t, n, r) {
    
        "use strict";
    return e.extend("entrytool.controller.settings.MasterSettings", {
        formatter: r,
        onInit: function() {
            var e = new n({
                currentUser: "Administrator",
                lastLogin: new Date(Date.now() - 864e5)
            });
            this.setModel(e, "view")
        },
        onMasterPressed: function(e) {
            var n = e.getParameter("listItem").getBindingContext("side");
            var r = n.getPath() + "/selected";
            n.getModel().setProperty(r, true);
            var o = n.getProperty("key");
            switch (o) {
                case "systemSettings": {
                    this.getRouter().navTo(o);
                    break
                }
                default: {
                    this.getBundleText(n.getProperty("titleI18nKey")).then(function(e) {
                        this.getBundleText("clickHandlerMessage", [e]).then(function(e) {
                            t.show(e)
                        })
                    }.bind(this));
                    break
                }
            }
        },
        onSavePressed: function(e) {
            this.onGeneralButtonPress(e)
        },
        onCancelPressed: function(e) {
            this.onGeneralButtonPress(e)
        },
        onGeneralButtonPress: function(e) {
            var n = e.getSource().getText();
            this.getBundleText("clickHandlerMessage", [n]).then(function(e) {
                t.show(e)
            })
        },
        onNavButtonPress: function() {
            this.getOwnerComponent().myNavBack()
        },
        getBundleText: function(e, t) {
            return this.getBundleTextByModel(e, this.getModel("i18n"), t)
        }
    })
});