sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function(NumberFormat) {
	"use strict";

	return {

		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		getSourceSystem: function(sValue) {
			if (sValue) {
				return sValue.substring(3, 6);
			}
			return "";
		},

		getAPDColor: function(sValue) {
			if (sValue === "Red") {
				return "Error";
			} else if (sValue === "Orange") {
				return "Warning";
			} else if (sValue === "Green") {
				return "Success";
			}
			return "None";
		},

		getOrderSubTitle: function(sChildFlag, sInterCompanyFlag) {
			if (sChildFlag === "X") {
				return "Crossbox Intercompany - Child Order";
			} else if (sInterCompanyFlag === "X") {
				return "Crossbox Dropship - Parent Order";
			} else {
				return "Sales Order";
			}
		},

		getOrderTitle: function(sChildFlag, sInterCompanyFlag, sInterCompanySO) {
			if (sChildFlag === "X") {
				return "Parent Order " + sInterCompanySO;
			} else if (sInterCompanyFlag === "X") {
				return "Child Order " + sInterCompanySO;
			} else {
				return "";
			}
		},

		getDropShipOrderSubTitle: function(sChildFlag, sInterCompanyFlag) {
			if (sChildFlag === "X") {
				return "Crossbox Dropship - Parent Order";
			} else if (sInterCompanyFlag === "X") {
				return "Crossbox Intercompany - Child Order";
			} else {
				return "Sales Order";
			}
		},

		getDropShipOrderItemTitle: function(childFlag, interCompanyFlag) {
			if (childFlag === "X") {
				return "Parent Order : Line Items";
			} else if (interCompanyFlag === "X") {
				return "Child Order : Line Items";
			} else {
				return "Line Items";
			}
		},

		getDropTitle: function(childFlag, interCompanyFlag) {
			if (childFlag === "X") {
				return "Parent Order Header Tiles";
			} else if (interCompanyFlag === "X") {
				return "Child Order Header Tiles";
			} else {
				return "Header Tiles";
			}
		},

		formatUrl: function(value, trackingNo) {
			var formattedURL = "";
			if (value) {
				if (value.indexOf("my.yrc.com") > -1) {
					/*eslint-disable*/
					trackingNo = trackingNo.trim();
					trackingNo = this.removePrecedingZero(trackingNo);
					formattedURL =
						"https://my.yrc.com/dynamic/national/servlet?CONTROLLER=com.rdwy.ec.rextracking.http.controller.ProcessPublicTrackingController&DESTINATION=/rextracking/quickTrakRequest.jsp&type=0&pro0=" +
						trackingNo;
				} else if (value.indexOf("shipnow.purolator.com") > -1) {
					trackingNo = trackingNo.trim();
					trackingNo = this.removePrecedingZero(trackingNo);
					formattedURL = "https://www.purolator.com/purolator/ship-track/tracking-details.page?pin=" + trackingNo;
				} else {
					formattedURL = value;
				}
			}
			/*eslint-enable*/
			return formattedURL;
		},

		removePrecedingZero: function(value) {
			if (value) {
				if (isNaN(value)) {
					return value;
				} else {
					return Number(value).toString();
				}
			} else {
				return "";
			}
		},
		otcDate: function(date) {
			if (!date) {
				return "";
			}
			date = new Date(date);
			var monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];
			var year = date.getFullYear();

			var day = date.getDate().toString();
			day = day.length > 1 ? day : "0" + day;

			return monthNames[date.getMonth()] + " " + day + " , " + year;
		},

		dateYYYYMMDDHHMMSS_to_Date: function(dateValue) {
			if (dateValue) {
				return dateValue.substring(6, 8) + "-" + dateValue.substring(4, 6) + "-" + dateValue.substring(0, 4) + " " +
					dateValue.substring(8, 10) + ":" +
					dateValue.substring(10, 12) + ":" + dateValue.substring(12, 14);
			}
			return "";
		},

		dateforProcessflow: function(dateVal) {
			if (!dateVal) {
				return "";
			}
			dateVal = new Date(dateVal);
			var monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];
			var year = dateVal.getFullYear();
			var h = dateVal.getHours();
			var m = dateVal.getMinutes();
			var s = dateVal.getSeconds();
			var day = dateVal.getDate().toString();
			day = day.length > 1 ? day : "0" + day;

			return monthNames[dateVal.getMonth()] + " " + day + " , " + year + " " + h + ":" + m + ":" + s;
		},

		prepareTileColorInformation: function(that, oRespData, obj) {
			var array = [];
			var systemList = ["DRP", "QRP", "URP", "PRP", "D01", "Q01", "P01", "U01", "C01"];
			/*if (that.soItemNumber) {
				for (var i = 0; i < oRespData.NavSalesOrderItems.results.length; i++) {
					if (oRespData.NavSalesOrderItems.results[i].ItemNo === that.soItemNumber) {
						array.push(oRespData.NavSalesOrderItems.results[i]);
						break;
					}
				}
				oRespData.NavSalesOrderItems.results = array;
			}*/

			obj.orderMgmtColor = "green";
			obj.complianceColor = "green";
			obj.billPayColor = "green";
			obj.shippingMgmtColor = "green";
			obj.availSchdColor = "";

			if (oRespData.NavSalesOrderItems.results) {
				for (var om = 0; om < oRespData.NavSalesOrderItems.results.length; om++) {
					var itemObject = oRespData.NavSalesOrderItems.results[om];
					var isChildOrderItem = (itemObject.ZChildFlag && itemObject.ZChildFlag.toLowerCase() === "x") ? true : false;
					var isIntercompanyFlag = itemObject.ZcbxOrdType.toUpperCase() === "I" ? true : false;

					itemObject.orderMgmtColor = that.getItemBlockBorderColor(itemObject, "ORDER_MANAGEMENT", obj);
					itemObject.complianceColor = that.getItemBlockBorderColor(itemObject, "COMPLIANCE", obj);
					itemObject.billPayColor = isChildOrderItem ? "" : that.getItemBlockBorderColor(itemObject, "BILLING", obj);
					itemObject.shippingMgmtColor = (!isChildOrderItem && !isIntercompanyFlag) ? "red" : that.getItemBlockBorderColor(itemObject,
						"SHIPPING", obj);
					itemObject.availSchdColor = that.getItemBlockBorderColor(itemObject, "SCHEDULING", obj);
					itemObject.cancel = itemObject.ZItemcancFlag === "X" ? true : false;
				}
			}
			var cancelCount = 0;
			var vlaidItemsCount = 0;
			var length = oRespData.NavSalesOrderItems.results.length;
			for (var omH = 0; omH < length; omH++) {
				var itemObjectH = oRespData.NavSalesOrderItems.results[omH];
				if (itemObjectH.cancel) {
					cancelCount++;
				}
			}
			if (cancelCount === length) {
				obj.orderMgmtColor = "orange";
				obj.complianceColor = "orange";
				obj.availSchdColor = "orange";
				obj.shippingMgmtColor = "orange";
				obj.billPayColor = "orange";
			} else {
				if (obj.CreditCheck === "NOT_OK" || obj.DeliveryBlock === "NOT_OK" || obj.BillingBlock === "NOT_OK" || obj.Incompletion === "NOT_OK" ||
					obj.PaymentCard === "NOT_OK") {
					obj.orderMgmtColor = "red";
				} else if (oRespData.NavSalesOrderItems.results) {
					length = oRespData.NavSalesOrderItems.results.length;
					var greenCount = 0,
						redCount = 0;
					for (omH = 0; omH < length; omH++) {
						var itemObjectH = oRespData.NavSalesOrderItems.results[omH];
						if (!itemObjectH.cancel) {
							vlaidItemsCount++;
							if (itemObjectH.orderMgmtColor === "green") {
								greenCount++;
							} else if (itemObjectH.orderMgmtColor === "red") {
								redCount++;
							}
						}
						/*else{
													length--;
													omH--;
												}*/
					}
					if (vlaidItemsCount === greenCount) {
						obj.orderMgmtColor = "green";
					} else if (vlaidItemsCount === redCount) {
						obj.orderMgmtColor = "red";
					} else {
						obj.orderMgmtColor = "orange";
					}

				}
				vlaidItemsCount = 0;
				/* compliance */
				if (obj.SplCheck === "NOT_OK" || obj.EmbargoCheck === "NOT_OK") {
					obj.complianceColor = "red";
				} else if (oRespData.NavSalesOrderItems.results) {
					length = oRespData.NavSalesOrderItems.results.length;
					greenCount = 0;
					redCount = 0;
					for (omH = 0; omH < length; omH++) {
						itemObjectH = oRespData.NavSalesOrderItems.results[omH];
						if (!itemObjectH.cancel) {
							vlaidItemsCount++;
							if (itemObjectH.complianceColor === "green") {
								greenCount++;
							} else if (itemObjectH.complianceColor === "red") {
								redCount++;
							}
						}
						/*else{
													length--;
													omH--;
												}*/
					}
					if (vlaidItemsCount === greenCount) {
						obj.complianceColor = "green";
					} else if (vlaidItemsCount === redCount) {
						obj.complianceColor = "red";
					} else {
						obj.complianceColor = "orange";
					}
				}

				if (systemList.indexOf(obj.AoSystem.substring(3, 6)) > -1) {
					obj.availSchdColor = "green";
				}
				vlaidItemsCount = 0;
				/* Shipping Management */
				if (!obj.ZChildFlag && obj.ZIntercompanyFlag) {
					obj.shippingMgmtColor = "";
				} else if (obj.NotProposed === 0 && obj.OpenDlv === 0 && obj.Shipped === 0 && obj.InProgress === 0) {
					obj.shippingMgmtColor = "red";
				} else if (oRespData.NavSalesOrderItems.results) {
					length = oRespData.NavSalesOrderItems.results.length;
					greenCount = 0;
					redCount = 0;
					var orange = 0;
					for (omH = 0; omH < length; omH++) {
						itemObjectH = oRespData.NavSalesOrderItems.results[omH];
						if (!itemObjectH.cancel) {
							vlaidItemsCount++;
							if (itemObjectH.shippingMgmtColor === "green") {
								greenCount++;
							} else if (itemObjectH.shippingMgmtColor === "orange") {
								orange++;
							} else if (itemObjectH.shippingMgmtColor === "red") {
								redCount++;
							}
						}
						/*else{
													length--;
													omH--;
												}*/
					}
					if (vlaidItemsCount === greenCount) {
						obj.shippingMgmtColor = "green";
					} else if (vlaidItemsCount === redCount) {
						obj.shippingMgmtColor = "red";
					} else {
						obj.shippingMgmtColor = "orange";
					}

				}
				vlaidItemsCount = 0;
				/*bill Pay*/
				if (obj.ZChildFlag) {
					obj.billPayColor = "";
				} else if (obj.Invoiced === 0 || obj.Payment === 0) {
					obj.billPayColor = "red";
				} else if (oRespData.NavSalesOrderItems.results) {
					length = oRespData.NavSalesOrderItems.results.length;
					greenCount = 0;
					redCount = 0;
					orange = 0;
					for (omH = 0; omH < length; omH++) {
						itemObjectH = oRespData.NavSalesOrderItems.results[omH];
						if (!itemObjectH.cancel) {
							vlaidItemsCount++;
							if (itemObjectH.billPayColor === "green") {
								greenCount++;
							} else if (itemObjectH.billPayColor === "orange") {
								orange++;
							} else if (itemObjectH.billPayColor === "red") {
								redCount++;
							}
						}
						/*else{
													length--;
													omH--;
												}*/
					}

					if (vlaidItemsCount === greenCount) {
						obj.billPayColor = "green";
					} else if (vlaidItemsCount === redCount) {
						obj.billPayColor = "red";
					} else {
						obj.billPayColor = "orange";
					}

				}
			}
		},

		dateFormat: function(dateValue) {
			if (dateValue) {
				return dateValue.substring(6, 10) + dateValue.substring(4, 6) + dateValue.substring(2, 4) + dateValue.substring(10, 16);
			} else {
				return null;
			}
		},
		dateFormatObject: function(dateValue) {
			if (dateValue) {
				var oDate = new Date(dateValue.substring(6, 10), dateValue.substring(4, 6), dateValue.substring(2, 4), dateValue.substring(10, 12),
					dateValue.substring(12, 14), dateValue.substring(14, 16));
				if (!oDate) {
					return "";
				}
				oDate = new Date(oDate);
				var monthNames = ["January", "February", "March", "April", "May", "June",
					"July", "August", "September", "October", "November", "December"
				];
				var year = oDate.getFullYear();

				var day = oDate.getDate().toString();
				day = day.length > 1 ? day : "0" + day;
				var h = oDate.getHours();
				var m = oDate.getMinutes();
				var s = oDate.getSeconds();
				return monthNames[oDate.getMonth()] + " " + day + " , " + year + " " + h + ":" + m + ":" + s;
			} else {
				return null;
			}
		},

		getImageSource: function(value) {
			var greenIconValues = ["ON_TIME", "OK", "Z_COMPL", "SHIPPED", "BILLED", "PAID", "COMPLETED", "PLANNED", "X"];
			var iconPath = "sap-icon://decline";
			if (value === "N/A") {
				iconPath = "sap-icon://decline";
			} else {
				iconPath = (greenIconValues.indexOf(value) > -1) ? "sap-icon://accept" : "sap-icon://decline";
			}
			return iconPath;
		},

		getImageColour: function(value) {
			var greenIconValues = ["ON_TIME", "OK", "Z_COMPL", "SHIPPED", "BILLED", "PAID", "COMPLETED", "PLANNED", "X"];
			var iconColor = "red";
			if (value === "N/A") {
				iconColor = "red";
			} else {
				iconColor = (greenIconValues.indexOf(value) > -1) ? "green" : "red";
			}
			return iconColor;
		},

		getSalesOrderStatusTooltip: function(value) {
			var greenIconValues = ["ON_TIME", "OK", "Z_COMPL", "SHIPPED", "BILLED", "PAID", "COMPLETED", "PLANNED", "X"];
			var sStaus = "Pending";
			if (value === "N/A") {
				sStaus = "Pending";
			} else {
				sStaus = (greenIconValues.indexOf(value) > -1) ? "Completed" : "Pending";
			}
			return sStaus;
		},

		formatTime: function(time) {
			if (time) {
				var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "HH:mm:ss"
				});
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
				return timeStr;

			} else {
				return null;
			}
		},

		getTileColor: function(oColor) {
			if (oColor === "green") {
				return "custTile custTileColorGreen";
			} else if (oColor === "orange") {
				return "custTile custTileColorOrange";
			} else {
				return "custTile custTileColorRed";
			}
		},

		getProcessFlowTitle: function(oValue, bIsHeader) {
			var pHeaderTitles = {
				"ORDMGT": "Order Header Details",
				"COMPLIANCE": "Compliance Header Details",
				"AVAIL_SCHD": "Availability and Scheduling Header Details",
				"SHIPPING": "Shipment Header Details",
				"BILL_PAY": "Billing and Payment Header Details"
			};

			var pItemTitles = {
				"ORDMGT": "Order Item Details",
				"COMPLIANCE": "Compliance Item Details",
				"AVAIL_SCHD": "Availability and Scheduling Item Details",
				"SHIPPING": "Shipment Item Details",
				"BILL_PAY": "Billing Item Details"
			};

			if (bIsHeader) {
				return pHeaderTitles[oValue];
			} else {
				return pItemTitles[oValue];
			}

		},

		getAvailSchdVisibility: function(oAoSystem) {
			var systemList = ["DRP", "QRP", "URP", "PRP", "D01", "Q01", "P01", "U01", "C01"];
			if (!oAoSystem) {
				return false;
			}
			return systemList.indexOf(oAoSystem.substring(3, 6)) > -1 ? true : false;
		},

		getNegAvailSchdVisibility: function(oAoSystem) {

			var systemList = ["DRP", "QRP", "URP", "PRP", "D01", "Q01", "P01", "U01", "C01"];
			if (!oAoSystem) {
				return true;
			}
			return systemList.indexOf(oAoSystem.substring(3, 6)) > -1 ? false : true;
		},

		getShippingMgmtLoadVisibility: function(applicationSystem) {
			var systemList = ["DRP", "PRE", "QRP", "URP", "PRP", "Q80", "Q70", "D01", "Q01", "I16", "P01", "U01", "C01", "T16",
				"D08", "P80", "P16", "UAT", "ORC", "PRO"
			];
			if (!applicationSystem) {
				return false;
			}
			if (applicationSystem.length === 3) {
				return systemList.indexOf(applicationSystem) > -1 ? true : false;
			} else {
				return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? true : false;
			}
		},

		// Anand
		getSalesGroupVisibility: function(applicationSystem) {
			var systemList = ["Q01", "P01", "C01", "P80", "Q80", "Q70", "P70", "P16", "T16", "I16"];
			if (!applicationSystem) {
				return false;
			}
			if (applicationSystem.length === 3) {
				return systemList.indexOf(applicationSystem) > -1 ? true : false;
			} else {
				return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? true : false;
			}
			//return systemList.indexOf(applicationSystem) > -1 ? true : false;
		},

		getShippingManagementLoadVisibility: function(shippingMgmtColor, applicationSystem) {
			if (shippingMgmtColor) {
				var systemList = ["Q01", "P01", "C01", "P80", "Q80", "Q70", "P70", "P16", "T16", "I16"];
				if (!applicationSystem) {
					return false;
				}
				if (applicationSystem.length === 3) {
					return systemList.indexOf(applicationSystem) > -1 ? true : false;
				} else {
					return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? true : false;
				}
				//return systemList.indexOf(applicationSystem) > -1 ? true : false;
			} else {
				return false;
			}

		},
		
		getShippingManagementNotLoadVisibility: function(shippingMgmtColor, applicationSystem) {
			if (shippingMgmtColor) {
				var systemList = ["Q01", "P01", "C01", "P80", "Q80", "Q70", "P70", "P16", "T16", "I16"];
				if (!applicationSystem) {
					return true;
				}
				if (applicationSystem.length === 3) {
					return systemList.indexOf(applicationSystem) > -1 ? false : true;
				} else {
					return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? false : true;
				}
				//return systemList.indexOf(applicationSystem) > -1 ? true : false;
			} else {
				return true;
			}

		},

		getAvailSchdVisibilityPaymentBlock: function(ZChildFlag, applicationSystem) {

			var systemList = ["DEN", "DRP", "QRP", "STN", "URP", "PRD", "PRP"];
			if (!applicationSystem) {
				return true;
			}
			if (applicationSystem.length === 3) {
				return systemList.indexOf(applicationSystem) > -1 ? true : false;
			} else {
				return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? true : false;
			}
			//return systemList.indexOf(applicationSystem) > -1 ? false : true;

		},

		getDestingCountryVisibility: function(applicationSystem) {
			var systemList = ["ORAPRO100", "SAPORC100", "ORAUAT100", "SAPDEM100"];
			if (!applicationSystem) {
				return false;
			}
			return systemList.indexOf(applicationSystem) > -1 ? true : false;
		},

		getNegDestingCountryVisibility: function(applicationSystem) {
			var systemList = ["ORAPRO100", "SAPORC100", "ORAUAT100", "SAPDEM100"];
			if (!applicationSystem) {
				return true;
			}
			return systemList.indexOf(applicationSystem) > -1 ? false : true;
		},
		getLoadingStatusVisibility: function(applicationSystem) {
			var systemList = ["DRP", "QRP", "URP", "PRP", "SEU", "D01", "Q01", "P01", "U01", "C01", "UAT", "ORC", "PRO"];
			if (!applicationSystem) {
				return false;
			}
			if (applicationSystem.length === 3) {
				return systemList.indexOf(applicationSystem) > -1 ? true : false;
			} else {
				return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? true : false;
			}
		},

		getMilestoneVisibility: function(applicationSystem) {
			var systemList = ["DRP", "QRP", "URP", "PRP"];
			if (!applicationSystem) {
				return false;
			}
			if (applicationSystem.length === 3) {
				return systemList.indexOf(applicationSystem) > -1 ? true : false;
			} else {
				return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? true : false;
			}
		},

		getSchedulingLinesVisibility: function(applicationSystem, itemcancFlag) {
			var systemList = ["D01", "Q01", "P01", "U01", "C01", "T16", "I16", "P16", "Q80", "Q70", "P80", "P70"];
			if (!applicationSystem || itemcancFlag) {
				return false;
			}
			return systemList.indexOf(applicationSystem.substring(3, 6)) > -1 ? true : false;
		},

		getZdelVisibility: function(plant, applicationSystem) {
			var oList = ["IN01", "IN03", "IN02", "CN01", "CN02", "CN05", "SG01", "KR01", "KR02", "DRP", "QRP", "URP", "PRP"];
			if (!plant && !applicationSystem) {
				return false;
			}
			return (oList.indexOf(applicationSystem) > -1 && oList.indexOf(plant) > -1) ? true : false;
		},

		validateEmail: function(value) {
			var mailformat =
				/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
			var valueState;
			if (value.match(mailformat)) {
				valueState = "Success";
			} else {
				valueState = "Error";
			}
			if (valueState === "Error") {
				return true;
			} else if (valueState === "Success") {
				return false;
			}
			return "None";
		},

		formatDate: function(iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "YYYY-MM-dd"
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1 + "T00:00:00";
				return dateVal;
			}
		},

		formatDateforAPDHistory: function(sDate) {
			var oDateObject,
				oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "MM-dd-YYYY"
				});
			if (sDate && sDate !== "00000000") {
				oDateObject = new Date(sDate.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3'));
				return oDateFormat.format(oDateObject);
			}
			return "";
		},

		formatDate1: function(iValue) {
			var value1;
			if (!iValue) {
				return null;
			} else {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
					pattern: "MM-dd-YYYY"
				});
				value1 = oDateFormat.format(iValue);
				var dateVal = value1;
				return dateVal;
			}
		},

		formatThousands: function(value) {
			var numberFormat = NumberFormat.getIntegerInstance();
			var text;
			if (value / 1000 < 1) {
				text = numberFormat.format(value);
			} else if (value / 1000000 < 1) {
				text = numberFormat.format(value / 1000) + "K";
			} else {
				text = numberFormat.format(value / 1000000) + "M";
			}

			return text;
		},

		addLeadingZeros: function(sValue) {
			while (sValue.length < 10) {
				sValue = "0" + sValue;
			}
			return sValue;
		},

		getChatBotIcon: function(sValue) {
			var sRootPath = jQuery.sap.getModulePath("com.OMT");
			if (sValue === "ChatBot") {
				return sRootPath + "/img/chatbot.png";
			} else {
				return sRootPath + "/img/user.png";
			}
		},

		trimLeadingZerosAlphanum: function(val) {
			var re = /^(-)?0+(?=\d)/;
			if (val) {
				return val.toString().replace(re, '$1');
			}
		},

		deliveryDateByRegion: function(system, plant) {
			var systems = (["DRP", "QRP", "URP", "PRP"].indexOf(system) > -1);
			var asiaRegions = (["CN01", "CN02", "IN01", "IN02", "IN03", "KR01", "KR02", "SG01", "CN04"].indexOf(plant) > -1);
			if (systems && asiaRegions) {
				return true;
			} else {
				return false;
			}
		}

	};

});