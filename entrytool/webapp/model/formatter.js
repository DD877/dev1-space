sap.ui.define(["sap/base/strings/formatMessage"],
    function (e) {
        "use strict"; return {
            formatMessage: e,
            srcImageValue: function (e, t) { if (e) { t += "_small" } return t + ".jpg" },
            dateFormat: function (e) { var t; if (!e) { return null } else { var r = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd.MM.yyyy", UTC: false }); t = r.format(e); var a = t; return a } },
            dateFormatOReport: function (e) {
                var t; if (!e) {
                    return null
                }
                
                else {
                    e = new Date(Number(e));
                    var r = sap.ui.core.format.DateFormat.getDateTimeInstance({
                        pattern: "dd.MM.yyyy", UTC: true, strictParsing: true
                    });
                    t = r.format(e);
                    var a = t;
                    if (a.includes(".-")) {
                        return null
                    }
                    else {
                        return a
                    }
                }
            },
            dateFormatWithTime: function (e) { var t; if (!e) { return null } else { var r = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd.MM.yyyy", UTC: true }); t = r.format(e); var a = t; return a } },
            getStatusTextFFDA: function (e) { if (e === "ACTV") { return "Active" } else if (e === "BLKD") { return "Blocked" } else if (e === "FFDA") { return "Flag For Deletion" } else if (e === "FFDL") { return "Flag For Deletion" } else { return "" } },
            focSmplVal: function (e) { var t = this.getOwnerComponent().getModel("ItemCategoryData"); if (t) { var r = t.getData(); for (var a = 0; a < r.length; a++) { if (r[a].ZITM_CATEGORY === e) { return r[a].ZITM_CATEGORY_DESC } } } return "" },
            focSmplValStn: function (e) { if (e === "YTA1") { return "Free of Charge Item" } else if (e === "YTS1") { return "Sample FOC Item" } else { return "" } },
            colorChange: function (e) { if (e === "SNO Approval") { this.addStyleClass("yellowColor"); return e } else if (e === "SNO Reviewed" || e === "Draft") { this.addStyleClass("redColor"); return e } else { this.addStyleClass("greenColor"); return e } },
            sysVal: function (e) { if (e === "L") { return "Lean" } else if (e === "T") { return "Tempo" } else { return "" } },
            UTCToDateObject2: function (e) { var t, r, a, n, o, s; if (e && e !== "00000000") { t = e.substring(0, 3); r = e.substring(3, 5); a = e.substring(5, 7); var u = new Date; u.setFullYear(t); u.setMonth(r); u.setMonth(u.getMonth() - 1); u.setDate(a); var i = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd.MM.yyyy" }); u = i.format(u); return u } },
            SalesOrderDateOrderReport: function (e) { var t, r, a, n, o, s; if (e && e !== "00000000") { t = e.substring(1, 5); r = e.substring(5, 7); a = e.substring(7, 9); var u = new Date; u.setFullYear(t); u.setMonth(r); u.setMonth(u.getMonth()); u.setDate(a); var i = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd.MM.yyyy " }); u = i.format(u); return u } },
            SalesOrderDate: function (e) { var t, r, a, n, o, s; if (e && e !== "000000000000000") { t = e.substring(1, 5); r = e.substring(5, 7); a = e.substring(7, 9); var u = new Date; u.setFullYear(t); u.setMonth(r); u.setMonth(u.getMonth() - 1); u.setDate(a); var i = sap.ui.core.format.DateFormat.getInstance({ pattern: "dd.MM.yyyy " }); u = i.format(u); return u } },
            removePrecedingZero: function (e) { if (e) { if (isNaN(e)) { return e } else { return Number(e).toString() } } else { return "" } },
            numberUnit: function (e, t) { var r = ""; if (e === undefined) { e = "" } if (e !== "") { e = parseFloat(parseFloat(e).toFixed(2)); r = e; if (e && t) { var a = new sap.ui.unified.Currency({ value: e, currency: t }); r = a.getFormattedValue() } } return r },
            formatPrice: function (e) { var t = sap.ui.core.format.NumberFormat.getCurrencyInstance({ currencyCode: false, customCurrencies: { Price: { isoCode: "IN", decimals: 0, currencyCode: false, showMeasure: false } } }); return t.format(e, "Price") },
            getChatBotIcon: function (e) { var t = jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5"); if (e === "ChatBot") { return t + "/img/CB.png" } else { return t + "/img/userpic.png" } }
        }
    });