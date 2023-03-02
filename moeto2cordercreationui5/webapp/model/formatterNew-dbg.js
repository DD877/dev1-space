sap.ui.define(["sap/ui/core/format/NumberFormat"],function(e){"use strict";return{numberUnit:function(e){if(!e){return""}return parseFloat(e).toFixed(2)},getSourceSystem:function(e){if(e){return e.substring(3,6)}return""},getAPDColor:function(e){if(e==="Red"){return"Error"}else if(e==="Orange"){return"Warning"}else if(e==="Green"){return"Success"}return"None"},getOrderSubTitle:function(e,r){if(e==="X"){return"Crossbox Intercompany - Child Order"}else if(r==="X"){return"Crossbox Dropship - Parent Order"}else{return"Sales Order"}},getOrderTitle:function(e,r,t){if(e==="X"){return"Parent Order "+t}else if(r==="X"){return"Child Order "+t}else{return""}},getDropShipOrderSubTitle:function(e,r){if(e==="X"){return"Crossbox Dropship - Parent Order"}else if(r==="X"){return"Crossbox Intercompany - Child Order"}else{return"Sales Order"}},getDropShipOrderItemTitle:function(e,r){if(e==="X"){return"Parent Order : Line Items"}else if(r==="X"){return"Child Order : Line Items"}else{return"Line Items"}},getDropTitle:function(e,r){if(e==="X"){return"Parent Order Header Tiles"}else if(r==="X"){return"Child Order Header Tiles"}else{return"Header Tiles"}},formatUrl:function(e,r){var t="";if(e){if(e.indexOf("my.yrc.com")>-1){r=r.trim();r=this.removePrecedingZero(r);t="https://my.yrc.com/dynamic/national/servlet?CONTROLLER=com.rdwy.ec.rextracking.http.controller.ProcessPublicTrackingController&DESTINATION=/rextracking/quickTrakRequest.jsp&type=0&pro0="+r}else if(e.indexOf("shipnow.purolator.com")>-1){r=r.trim();r=this.removePrecedingZero(r);t="https://www.purolator.com/purolator/ship-track/tracking-details.page?pin="+r}else{t=e}}return t},removePrecedingZero:function(e){if(e){if(isNaN(e)){return e}else{return Number(e).toString()}}else{return""}},otcDate:function(e){if(!e){return""}e=new Date(e);var r=["January","February","March","April","May","June","July","August","September","October","November","December"];var t=e.getFullYear();var n=e.getDate().toString();n=n.length>1?n:"0"+n;return r[e.getMonth()]+" "+n+" , "+t},dateYYYYMMDDHHMMSS_to_Date:function(e){if(e){return e.substring(6,8)+"-"+e.substring(4,6)+"-"+e.substring(0,4)+" "+e.substring(8,10)+":"+e.substring(10,12)+":"+e.substring(12,14)}return""},dateforProcessflow:function(e){if(!e){return""}e=new Date(e);var r=["January","February","March","April","May","June","July","August","September","October","November","December"];var t=e.getFullYear();var n=e.getHours();var i=e.getMinutes();var l=e.getSeconds();var a=e.getDate().toString();a=a.length>1?a:"0"+a;return r[e.getMonth()]+" "+a+" , "+t+" "+n+":"+i+":"+l},prepareTileColorInformation:function(e,r,t){var n=[];var i=["DRP","QRP","URP","PRP","D01","Q01","P01","U01","C01"];t.orderMgmtColor="green";t.complianceColor="green";t.billPayColor="green";t.shippingMgmtColor="green";t.availSchdColor="";if(r.NavSalesOrderItems.results){for(var l=0;l<r.NavSalesOrderItems.results.length;l++){var a=r.NavSalesOrderItems.results[l];var s=a.ZChildFlag&&a.ZChildFlag.toLowerCase()==="x"?true:false;var o=a.ZcbxOrdType.toUpperCase()==="I"?true:false;a.orderMgmtColor=e.getItemBlockBorderColor(a,"ORDER_MANAGEMENT",t);a.complianceColor=e.getItemBlockBorderColor(a,"COMPLIANCE",t);a.billPayColor=s?"":e.getItemBlockBorderColor(a,"BILLING",t);a.shippingMgmtColor=!s&&!o?"red":e.getItemBlockBorderColor(a,"SHIPPING",t);a.availSchdColor=e.getItemBlockBorderColor(a,"SCHEDULING",t);a.cancel=a.ZItemcancFlag==="X"?true:false}}var u=0;var f=0;var g=r.NavSalesOrderItems.results.length;for(var c=0;c<g;c++){var d=r.NavSalesOrderItems.results[c];if(d.cancel){u++}}if(u===g){t.orderMgmtColor="orange";t.complianceColor="orange";t.availSchdColor="orange";t.shippingMgmtColor="orange";t.billPayColor="orange"}else{if(t.CreditCheck==="NOT_OK"||t.DeliveryBlock==="NOT_OK"||t.BillingBlock==="NOT_OK"||t.Incompletion==="NOT_OK"||t.PaymentCard==="NOT_OK"){t.orderMgmtColor="red"}else if(r.NavSalesOrderItems.results){g=r.NavSalesOrderItems.results.length;var m=0,P=0;for(c=0;c<g;c++){var d=r.NavSalesOrderItems.results[c];if(!d.cancel){f++;if(d.orderMgmtColor==="green"){m++}else if(d.orderMgmtColor==="red"){P++}}}if(f===m){t.orderMgmtColor="green"}else if(f===P){t.orderMgmtColor="red"}else{t.orderMgmtColor="orange"}}f=0;if(t.SplCheck==="NOT_OK"||t.EmbargoCheck==="NOT_OK"){t.complianceColor="red"}else if(r.NavSalesOrderItems.results){g=r.NavSalesOrderItems.results.length;m=0;P=0;for(c=0;c<g;c++){d=r.NavSalesOrderItems.results[c];if(!d.cancel){f++;if(d.complianceColor==="green"){m++}else if(d.complianceColor==="red"){P++}}}if(f===m){t.complianceColor="green"}else if(f===P){t.complianceColor="red"}else{t.complianceColor="orange"}}if(i.indexOf(t.AoSystem.substring(3,6))>-1){t.availSchdColor="green"}f=0;if(!t.ZChildFlag&&t.ZIntercompanyFlag){t.shippingMgmtColor=""}else if(t.NotProposed===0&&t.OpenDlv===0&&t.Shipped===0&&t.InProgress===0){t.shippingMgmtColor="red"}else if(r.NavSalesOrderItems.results){g=r.NavSalesOrderItems.results.length;m=0;P=0;var O=0;for(c=0;c<g;c++){d=r.NavSalesOrderItems.results[c];if(!d.cancel){f++;if(d.shippingMgmtColor==="green"){m++}else if(d.shippingMgmtColor==="orange"){O++}else if(d.shippingMgmtColor==="red"){P++}}}if(f===m){t.shippingMgmtColor="green"}else if(f===P){t.shippingMgmtColor="red"}else{t.shippingMgmtColor="orange"}}f=0;if(t.ZChildFlag){t.billPayColor=""}else if(t.Invoiced===0||t.Payment===0){t.billPayColor="red"}else if(r.NavSalesOrderItems.results){g=r.NavSalesOrderItems.results.length;m=0;P=0;O=0;for(c=0;c<g;c++){d=r.NavSalesOrderItems.results[c];if(!d.cancel){f++;if(d.billPayColor==="green"){m++}else if(d.billPayColor==="orange"){O++}else if(d.billPayColor==="red"){P++}}}if(f===m){t.billPayColor="green"}else if(f===P){t.billPayColor="red"}else{t.billPayColor="orange"}}}},dateFormat:function(e){if(e){return e.substring(6,10)+e.substring(4,6)+e.substring(2,4)+e.substring(10,16)}else{return null}},dateFormatObject:function(e){if(e){var r=new Date(e.substring(6,10),e.substring(4,6),e.substring(2,4),e.substring(10,12),e.substring(12,14),e.substring(14,16));if(!r){return""}r=new Date(r);var t=["January","February","March","April","May","June","July","August","September","October","November","December"];var n=r.getFullYear();var i=r.getDate().toString();i=i.length>1?i:"0"+i;var l=r.getHours();var a=r.getMinutes();var s=r.getSeconds();return t[r.getMonth()]+" "+i+" , "+n+" "+l+":"+a+":"+s}else{return null}},getImageSource:function(e){var r=["ON_TIME","OK","Z_COMPL","SHIPPED","BILLED","PAID","COMPLETED","PLANNED","X"];var t="sap-icon://decline";if(e==="N/A"){t="sap-icon://decline"}else{t=r.indexOf(e)>-1?"sap-icon://accept":"sap-icon://decline"}return t},getImageColour:function(e){var r=["ON_TIME","OK","Z_COMPL","SHIPPED","BILLED","PAID","COMPLETED","PLANNED","X"];var t="red";if(e==="N/A"){t="red"}else{t=r.indexOf(e)>-1?"green":"red"}return t},getSalesOrderStatusTooltip:function(e){var r=["ON_TIME","OK","Z_COMPL","SHIPPED","BILLED","PAID","COMPLETED","PLANNED","X"];var t="Pending";if(e==="N/A"){t="Pending"}else{t=r.indexOf(e)>-1?"Completed":"Pending"}return t},formatTime:function(e){if(e){var r=sap.ui.core.format.DateFormat.getTimeInstance({pattern:"HH:mm:ss"});var t=new Date(0).getTimezoneOffset()*60*1e3;var n=r.format(new Date(e.ms+t));return n}else{return null}},getTileColor:function(e){if(e==="green"){return"custTile custTileColorGreen"}else if(e==="orange"){return"custTile custTileColorOrange"}else{return"custTile custTileColorRed"}},getProcessFlowTitle:function(e,r){var t={ORDMGT:"Order Header Details",COMPLIANCE:"Compliance Header Details",AVAIL_SCHD:"Availability and Scheduling Header Details",SHIPPING:"Shipment Header Details",BILL_PAY:"Billing and Payment Header Details"};var n={ORDMGT:"Order Item Details",COMPLIANCE:"Compliance Item Details",AVAIL_SCHD:"Availability and Scheduling Item Details",SHIPPING:"Shipment Item Details",BILL_PAY:"Billing Item Details"};if(r){return t[e]}else{return n[e]}},getAvailSchdVisibility:function(e){var r=["DRP","QRP","URP","PRP","D01","Q01","P01","U01","C01"];if(!e){return false}return r.indexOf(e.substring(3,6))>-1?true:false},getNegAvailSchdVisibility:function(e){var r=["DRP","QRP","URP","PRP","D01","Q01","P01","U01","C01"];if(!e){return true}return r.indexOf(e.substring(3,6))>-1?false:true},getShippingMgmtLoadVisibility:function(e){var r=["DRP","PRE","QRP","URP","PRP","Q80","Q70","D01","Q01","I16","P01","U01","C01","T16","D08","P80","P16","UAT","ORC","PRO"];if(!e){return false}if(e.length===3){return r.indexOf(e)>-1?true:false}else{return r.indexOf(e.substring(3,6))>-1?true:false}},getSalesGroupVisibility:function(e){var r=["Q01","P01","C01","P80","Q80","Q70","P70","P16","T16","I16"];if(!e){return false}if(e.length===3){return r.indexOf(e)>-1?true:false}else{return r.indexOf(e.substring(3,6))>-1?true:false}},getShippingManagementLoadVisibility:function(e,r){if(e){var t=["Q01","P01","C01","P80","Q80","Q70","P70","P16","T16","I16"];if(!r){return false}if(r.length===3){return t.indexOf(r)>-1?true:false}else{return t.indexOf(r.substring(3,6))>-1?true:false}}else{return false}},getShippingManagementNotLoadVisibility:function(e,r){if(e){var t=["Q01","P01","C01","P80","Q80","Q70","P70","P16","T16","I16"];if(!r){return true}if(r.length===3){return t.indexOf(r)>-1?false:true}else{return t.indexOf(r.substring(3,6))>-1?false:true}}else{return true}},getAvailSchdVisibilityPaymentBlock:function(e,r){var t=["DEN","DRP","QRP","STN","URP","PRD","PRP"];if(!r){return true}if(r.length===3){return t.indexOf(r)>-1?true:false}else{return t.indexOf(r.substring(3,6))>-1?true:false}},getDestingCountryVisibility:function(e){var r=["ORAPRO100","SAPORC100","ORAUAT100","SAPDEM100"];if(!e){return false}return r.indexOf(e)>-1?true:false},getNegDestingCountryVisibility:function(e){var r=["ORAPRO100","SAPORC100","ORAUAT100","SAPDEM100"];if(!e){return true}return r.indexOf(e)>-1?false:true},getLoadingStatusVisibility:function(e){var r=["DRP","QRP","URP","PRP","SEU","D01","Q01","P01","U01","C01","UAT","ORC","PRO"];if(!e){return false}if(e.length===3){return r.indexOf(e)>-1?true:false}else{return r.indexOf(e.substring(3,6))>-1?true:false}},getMilestoneVisibility:function(e){var r=["DRP","QRP","URP","PRP"];if(!e){return false}if(e.length===3){return r.indexOf(e)>-1?true:false}else{return r.indexOf(e.substring(3,6))>-1?true:false}},getSchedulingLinesVisibility:function(e,r){var t=["D01","Q01","P01","U01","C01","T16","I16","P16","Q80","Q70","P80","P70"];if(!e||r){return false}return t.indexOf(e.substring(3,6))>-1?true:false},getZdelVisibility:function(e,r){var t=["IN01","IN03","IN02","CN01","CN02","CN05","SG01","KR01","KR02","DRP","QRP","URP","PRP"];if(!e&&!r){return false}return t.indexOf(r)>-1&&t.indexOf(e)>-1?true:false},validateEmail:function(e){var r=/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;var t;if(e.match(r)){t="Success"}else{t="Error"}if(t==="Error"){return true}else if(t==="Success"){return false}return"None"},formatDate:function(e){var r;if(!e){return null}else{var t=sap.ui.core.format.DateFormat.getInstance({pattern:"YYYY-MM-dd"});r=t.format(e);var n=r+"T00:00:00";return n}},formatDateforAPDHistory:function(e){var r,t=sap.ui.core.format.DateFormat.getInstance({pattern:"MM-dd-YYYY"});if(e&&e!=="00000000"){r=new Date(e.replace(/(\d{4})(\d{2})(\d{2})/g,"$1-$2-$3"));return t.format(r)}return""},formatDate1:function(e){var r;if(!e){return null}else{var t=sap.ui.core.format.DateFormat.getInstance({pattern:"MM-dd-YYYY"});r=t.format(e);var n=r;return n}},formatThousands:function(r){var t=e.getIntegerInstance();var n;if(r/1e3<1){n=t.format(r)}else if(r/1e6<1){n=t.format(r/1e3)+"K"}else{n=t.format(r/1e6)+"M"}return n},addLeadingZeros:function(e){while(e.length<10){e="0"+e}return e},getChatBotIcon:function(e){var r=jQuery.sap.getModulePath("com.OMT");if(e==="ChatBot"){return r+"/img/chatbot.png"}else{return r+"/img/user.png"}},trimLeadingZerosAlphanum:function(e){var r=/^(-)?0+(?=\d)/;if(e){return e.toString().replace(r,"$1")}},deliveryDateByRegion:function(e,r){var t=["DRP","QRP","URP","PRP"].indexOf(e)>-1;var n=["CN01","CN02","IN01","IN02","IN03","KR01","KR02","SG01","CN04"].indexOf(r)>-1;if(t&&n){return true}else{return false}}}});