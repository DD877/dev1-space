sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (e, n) {
    "use strict";
    return {
        createDeviceModel: function () {
            var i = new e(n);
            i.setDefaultBindingMode("OneWay");
            return i
        }
    }
});