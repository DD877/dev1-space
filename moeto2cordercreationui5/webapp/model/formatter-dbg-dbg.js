sap.ui.define([
	"sap/base/strings/formatMessage"
], function (formatMessage) {
	"use strict";

	return {
		formatMessage: formatMessage,

		/**
		 * Determines the path of the image depending if its a phone or not the smaller or larger image version is loaded
		 *
		 * @public
		 * @param {boolean} bIsPhone the value to be checked
		 * @param {string} sImagePath The path of the image
		 * @returns {string} path to image
		 */
		srcImageValue: function (bIsPhone, sImagePath) {
			if (bIsPhone) {
				sImagePath += "_small";
			}
			return sImagePath + ".jpg";
		},
		dateFormat: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "dd.MM.yyyy",
					UTC: false
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},
		dateFormatOReport: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "dd.MM.yyyy",
					UTC: true,
					strictParsing: true
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				
				if(dateVal.includes(".-")){
					return null;
				}else{
				return dateVal;
				}
			}
		},
		dateFormatWithTime: function (iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "dd.MM.yyyy",
					UTC: true
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},

		getStatusTextFFDA: function (value) {
			if (value === "ACTV") {
				return 'Active';
			} else if (value === "BLKD") {
				return 'Blocked';
			} else if (value === "FFDA") {
				return 'Flag For Deletion';
			} else if (value === "FFDL") {
				return 'Flag For Deletion';
			} else {
				return "";
			}
		},

		focSmplVal: function (value) {
			var oModel = this.getOwnerComponent().getModel("ItemCategoryData");
			if (oModel) {
				var data = oModel.getData();
				for (var i = 0; i < data.length; i++) {
					if (data[i].ZITM_CATEGORY === value) {
						return data[i].ZITM_CATEGORY_DESC;
					}
					/*if (value === "YTAN") {
						return "Standard Order";
					}*/
				}
			}
			return "";
		},

		focSmplValStn: function (value) {
			if (value === "YTA1") {
				return 'Free of Charge Item';
			} else if (value === "YTS1") {
				return 'Sample FOC Item';
			} else {
				return '';
			}
		},

		colorChange: function (value) {
			if (value === "SNO Approval") {
				this.addStyleClass("yellowColor");
				return value;
				//return 'Free of Charge Item';
			} else if (value === "SNO Reviewed" || value === "Draft") {
				this.addStyleClass("redColor");
				return value;
			} else {
				this.addStyleClass("greenColor");
				return value;
			}
		},

		sysVal: function (value) {
			if (value === "L") {
				return 'Lean';
			} else if (value === "T") {
				return 'Tempo';
			} else {
				return '';
			}
		},
		UTCToDateObject2: function (sVlaue) {

			var yy, mm, dd, hh, min, sec;
			if (sVlaue && sVlaue !== "00000000") {
				yy = sVlaue.substring(0, 3);
				mm = sVlaue.substring(3, 5);
				dd = sVlaue.substring(5, 7);
				var mydate = new Date();
				mydate.setFullYear(yy);
				mydate.setMonth(mm);
				mydate.setMonth(mydate.getMonth() - 1);
				mydate.setDate(dd);
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "dd.MM.yyyy"
				});
				mydate = oDateFormat.format(mydate);
				return mydate;
			}
		},

		SalesOrderDateOrderReport: function (sVlaue) {
			var yy, mm, dd, hh, min, sec;
			if (sVlaue && sVlaue !== "00000000") {
				yy = sVlaue.substring(1, 5);
				mm = sVlaue.substring(5, 7);
				dd = sVlaue.substring(7, 9);
				var mydate = new Date();
				mydate.setFullYear(yy);
				mydate.setMonth(mm);
				mydate.setMonth(mydate.getMonth());
				mydate.setDate(dd);
				// mydate.setHours(hh);
				// mydate.setMinutes(min);
				// mydate.setSeconds(sec);
				//    var dateVal = value1 ;
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "dd.MM.yyyy "
				});
				mydate = oDateFormat.format(mydate);
				return mydate;
			}
		},

		SalesOrderDate: function (sVlaue) {
			var yy, mm, dd, hh, min, sec;
			if (sVlaue && sVlaue !== "000000000000000") {
				yy = sVlaue.substring(1, 5);
				mm = sVlaue.substring(5, 7);
				dd = sVlaue.substring(7, 9);
				var mydate = new Date();
				mydate.setFullYear(yy);
				mydate.setMonth(mm);
				mydate.setMonth(mydate.getMonth() - 1);
				mydate.setDate(dd);
				// mydate.setHours(hh);
				// mydate.setMinutes(min);
				// mydate.setSeconds(sec);
				//    var dateVal = value1 ;
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "dd.MM.yyyy "
				});
				mydate = oDateFormat.format(mydate);
				return mydate;
			}
		},
		removePrecedingZero: function (value) {
			if (value) {
				if (isNaN(value)) {
					return value;
				} else {
					return Number(value).toString();
				}
			} else {
				return '';
			}
		},
		
		numberUnit: function(val, cur) {
                var sVal = "";
                if(val === undefined){
                    val = "";
                }
                if (val !== "") {
                    val = parseFloat(parseFloat(val).toFixed(2));
                    sVal = val;
                    if (val && cur) {
                        var oCurr = new sap.ui.unified.Currency({
                            value: val,
                            currency: cur
                        });
                        sVal = oCurr.getFormattedValue();
                    }
                }
                return sVal;
           
    /*        if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);*/
        },

		formatPrice: function (value) {
			var oPriceFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
				"currencyCode": false,
				"customCurrencies": {
					"Price": {
						"isoCode": "IN",
						"decimals": 0,
						"currencyCode": false,
						"showMeasure": false
					}
				}
			});
			return oPriceFormat.format(value, "Price");
			/*if (value) {
				if (isNaN(value)) {
					return value;
				} else {
					return Number(value).toString();
				}
			} else {
				return '';
			}*/
		},

		getChatBotIcon: function (sValue) {
			var sRootPath = jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5");
			if (sValue === "ChatBot") {
				return sRootPath + "/img/CB.png";
			} else {
				return sRootPath + "/img/userpic.png";
			}
		}
	};
});