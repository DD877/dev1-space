sap.ui.define([
    "sap/ui/core/UIComponent",
    "./model/models",
    "sap/ui/core/routing/History",
    "sap/ui/model/resource/ResourceModel"
], function (e, t, s) {
    "use strict";
    return e.extend("entrytool.Component", {
        metadata: {
            manifest: "json"
        },
        init: function () {
            e.prototype.init.apply(this, arguments);
            this.setModel(t.createDeviceModel(), "device");
            this.getRouter().initialize()
        },
        myNavBack: function () {
            var e = s.getInstance();
            var t = e.getPreviousHash();
            if (t !== undefined) {
                window.history.go(-1)
            } else {
                this.getRouter().navTo("masterSettings", {}, true)
            }
        },
        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (!sap.ui.Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact"
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy"
                }
            }
            return this._sContentDensityClass
        }
    })
});