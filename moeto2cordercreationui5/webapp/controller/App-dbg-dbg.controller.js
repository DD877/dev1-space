sap.ui.define([
	'./BaseController',
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',

	'sap/m/Button',

	'sap/ui/core/CustomData',

	'sap/ui/Device',
	"sap/m/MessageToast",
	'sap/m/library',
	"sap/m/MessageBox",
	"sap/ui/model/Filter"
], function (
	BaseController,
	Fragment,
	Controller,
	JSONModel,

	Button,

	CustomData,

	Device,
	MessageToast,
	mobileLibrary,
	MessageBox,
	Filter
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.VerticalPlacementType
	var VerticalPlacementType = mobileLibrary.VerticalPlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	return BaseController.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.controller.App", {

		_bExpanded: true,

		_initViewPropertiesModel: function () {
			this._oViewProperty = new JSONModel({
				oYesButton: false,
				oNoButton: false,
				oYesEnabled: true,
				oNoEnabled: true
			});
			sap.ui.getCore().setModel(this._oViewProperty, "oViewProperties");
			this.getView().setModel(this._oViewProperty, "oViewProperties");
		},

		onInit: function () {
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this._initViewPropertiesModel();
			this.initializeSpeechRecognization();
			this.getPropertySet();
			this.getApproveOrderPropertySet();
			this.getItemCategoryData();
			this._getSystem();
			this.userLogin();
			var a = {
				"test": true,
				"username": ""
			};

			var newJson = new JSONModel();
			newJson.setData(a);
			this.getOwnerComponent().setModel(newJson, "appJson");

			// if the app starts on desktop devices with small or meduim screen size, collaps the sid navigation
			if (Device.resize.width <= 1024) {
				this.onSideNavButtonPress();
			}

			Device.media.attachHandler(function (oDevice) {
				if ((oDevice.name === "Tablet" && this._bExpanded) || oDevice.name === "Desktop") {
					this.onSideNavButtonPress();
					// set the _bExpanded to false on tablet devices
					// extending and collapsing of side navigation should be done when resizing from
					// desktop to tablet screen sizes)
					this._bExpanded = (oDevice.name === "Desktop");
				}
			}.bind(this));

			this.getRouter().attachRouteMatched(this.onRouteChange.bind(this));

			var oChatModel = new JSONModel([{
				Text: "How can I help you today?",
				Author: "ChatBot",
				styleClass: "cls_feedlInputList_Position",
				Date: new Date()
			}]);
			this.setModel(oChatModel, "chatModel");
			var oquestionnaireData = new sap.ui.model.json.JSONModel();
			oquestionnaireData.loadData(jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5.model", "/questionnaire.json"),
				null, false);
			this._questionnaire = (oquestionnaireData.getData()).questionnaire;
			this.setModel(this._questionnaire, "oquestionnaireData");
			var osidecontentData = new sap.ui.model.json.JSONModel();
			osidecontentData.loadData(jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5.model", "/sideContent.json"),
				null, false);
			this.osidecontentData = (osidecontentData.getData()).navigation;
			this.setModel(this.osidecontentData, "osidecontentData");
		},

		onRouteChange: function (oEvent) {
			this.getModel('side').setProperty('/selectedKey', oEvent.getParameter('name'));

			if (Device.system.phone) {
				this.onSideNavButtonPress();
			}

			var aSide = {
				"navigation": [{
					"titleI18nKey": "sideContentHome",
					"icon": "sap-icon://home",
					"expanded": true,
					"key": "",
					"items": []
				}, {
					"titleI18nKey": "sideContentStatistics",
					"icon": "sap-icon://sales-order",
					"expanded": true,
					"key": "statistics",
					"items": [{
							"titleI18nKey": "sideContentOrdersDrft",
							"key": "Orders"
						}, {
							"titleI18nKey": "sideContentOrderStatistics",
							"key": "ApproveOrders"
						},

						{
							"titleI18nKey": "sideContentOrderStatistics1",
							"key": "ProcessOrders"
						},

						{
							"titleI18nKey": "sideContentOrderReport",
							"key": "OrderReport"
						}
					]
				}]
			};

			var aSideCust = {
				"navigation": [{
					"titleI18nKey": "sideContentHome",
					"icon": "sap-icon://home",
					"expanded": true,
					"key": "",
					"items": []
				}, {
					"titleI18nKey": "sideContentStatistics",
					"icon": "sap-icon://sales-order",
					"expanded": true,
					"key": "statistics",
					"items": [{
						"titleI18nKey": "sideContentOrdersDrft",
						"key": "Orders"
					}, {
							"titleI18nKey": "sideContentOrderStatistics",
							"key": "ApproveOrders"
						},
					{
						"titleI18nKey": "sideContentOrderStatistics1",
						"key": "ProcessOrders"
					}, {
						"titleI18nKey": "sideContentOrderReport",
						"key": "OrderReport"
					}]
				}]
			};
			
			var aSideNone = {
				"navigation": [{
					"titleI18nKey": "sideContentHome",
					"icon": "sap-icon://home",
					"expanded": true,
					"key": "",
					"items": []
				}]
			};
			

			var newJsonSide = new JSONModel();

			//var sUserId, sFullName, sRoleId;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser";
			var that = this;
			//
			$.ajax({
				url: sUrl,
				type: "GET",
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					//return data.d["results"][0].ZROLE_ID;

					if (data.d["results"][0].ZUSR_ROLE === "CUST") {
						newJsonSide.setData(aSideCust);
						that.getView().byId("navListId").setModel(newJsonSide, "side");
						//newJsonSide.setData(aSide);
					}

					if (data.d["results"][0].ZUSR_ROLE === "RSNO" || data.d["results"][0].ZUSR_ROLE === "CSERV") {
						newJsonSide.setData(aSide);
						that.getView().byId("navListId").setModel(newJsonSide, "side");
						//newJsonSide.setData(aSide);
					}
					
					if (data.d["results"][0].ZUSR_ROLE === "") {
						newJsonSide.setData(aSideNone);
						that.getView().byId("navListId").setModel(newJsonSide, "side");
						//newJsonSide.setData(aSide);
					}
					
					//that.getView().byId("userButton").setText(sFullName);
				},
				error: function (oError) {

				}
			});

			jQuery.sap.delayedCall(100, this, function () {
				if (this.getOwnerComponent().isChartBoot) {
					this.onOpenChatbot();
				}
			});

		},
		fnSettingsPress: function () {
			this.onCusAssign(function () {
				this.getUserInfo(function () {
					var aUserCustomer = this.getView().getModel("userCustomer").getData();
					var aCusInfo = this.getView().getModel("cusInfo").getData();
					var oJsonModel = new sap.ui.model.json.JSONModel();
					var CusInfoModel = new sap.ui.model.json.JSONModel();
					if (!this._oSettingDialog) {
						this._oSettingDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.settings", this);
						oJsonModel.setData(aUserCustomer);
						CusInfoModel.setData(aCusInfo);
						this._oSettingDialog.setModel(oJsonModel, "userCustomer");
						this._oSettingDialog.setModel(CusInfoModel, "CusInfo");
						this.getView().addDependent(this._oSettingDialog);
					}
					this._oSettingDialog.open();
				}.bind(this));
			}.bind(this));
		},

		fnSettingsClose: function () {
			this._oSettingDialog.close();
			if (this._oSettingDialog) {
				this._oSettingDialog = this._oSettingDialog.destroy();
			}
		},

		getUserInfo: function (fCallback) {
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var sUserId, sFullName, sRoleId, sUserRole;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser";
			var that = this;
			//
			$.ajax({
				url: sUrl,
				type: "GET",
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					sUserId = data.d["results"][0].ZUSR_ID;
					sFullName = data.d["results"][0].ZUSR_NAME;
					sRoleId = data.d["results"][0].ZUSR_ROLE;
					that.getOwnerComponent().sUserId = data.d["results"][0].ZUSR_ID;
					that.getOwnerComponent().sUserRole = data.d["results"][0].ZUSR_ROLE;
					that.getView().byId("userButton").setText(sFullName);
					oJsonModel.setData(data.d["results"]);
					that.getView().setModel(oJsonModel, "cusInfo");
					if (typeof fCallback === "function") {
						fCallback();
					}
				},
				error: function (oError) {
					MessageBox.show(
						JSON.parse("Your Id is not authorized, please contact the administrator").error.message.value, {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.CLOSE],
							styleClass: "sapUiSizeCompact myMessageBox"
						}
					);
				}
			});

		},

		returnUserRole: function () {
			var sUserId, sFullName, sRoleId;
			var sUrl = "/HANAXS/com/merckgroup/moet/services/odata/moet.xsodata/SessionUser";
			var that = this;
			//
			$.ajax({
				url: sUrl,
				type: "GET",
				dataType: "json",
				contentType: "application/json",
				success: function (data, response) {
					return data.d["results"][0].ZUSR_ROLE;
					//that.getView().byId("userButton").setText(sFullName);
				},
				error: function (oError) {

				}
			});

		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("app");
			var bSideExpanded = oToolPage.getSideExpanded();
			this._setToggleButtonTooltip(bSideExpanded);
			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
			//
		},

		_setToggleButtonTooltip: function (bSideExpanded) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			this.getBundleText(bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function (sTooltipText) {
				oToggleButton.setTooltip(sTooltipText);
			});
		},

		onCusAssign: function (fCallback) {
			var that = this;
			var oSource;
			sap.ui.core.BusyIndicator.show();
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/UserDetails('" + this.getOwnerComponent().sUserId + "')/UserCustDetails";
			oModel.read(sPath, {
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);
					that.getView().setModel(oJsonModel, "userCustomer");
					if (fCallback) {
						fCallback();
					}
				}.bind(this),
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onMaterialAssign: function (oEvent) {
			var oObject = oEvent.getSource().getBindingContext("userCustomer").getObject();
			var oJsonModel = new sap.ui.model.json.JSONModel(),
				// oUrlParams = oEvent.getParameter("arguments"),
				oModel = this.getOwnerComponent().getModel(),
				sPath = "/CustomerMatAssignDetails";

			oModel.read(sPath, {
				filters: [new Filter("ZCUST_NUM", "EQ", oObject.ZCUST_NUM)],
				success: function (oResp) {
					oJsonModel.setData(oResp.results);
					oJsonModel.setSizeLimit(oResp.results.length);

					if (!this._oMatAssgnDialog) {
						this._oMatAssgnDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.UserMaterialAssignment",
							this);
						this.getView().addDependent(this._oMatAssgnDialog);
					}
					this._oMatAssgnDialog.setModel(oJsonModel, "materialAssignment");
					this._oMatAssgnDialog.open();

					//
				}.bind(this),
				error: function (err) {}
			});

		},
		onMatAssignClose: function () {
			this._oMatAssgnDialog.close();
			if (this._oMatAssgnDialog) {
				this._oMatAssgnDialog = this._oMatAssgnDialog.destroy();
			}
		},

		showShiptoPartyValue: function (oEvent) {

			var that = this;
			var oObject = oEvent.getSource().getBindingContext("userCustomer").getObject();
			var oModel_shiptoParty = new JSONModel();
			var oModel = this.getOwnerComponent().getModel(),

				sPath = "/CustomerShipToPartyAssignDetails";
			sap.ui.core.BusyIndicator.show();
			oModel.read(sPath, {
				filters: [new Filter("ZCUSTMR_NUM", "EQ", oObject.ZCUST_NUM)],
				success: function (oResp) {
					sap.ui.core.BusyIndicator.hide();
					oModel_shiptoParty.setData(oResp.results);
					if (!that._oShipDialog) {
						that._oShipDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.UserShipto", that);
						that.getView().addDependent(that._oShipDialog);
					}
					that._oShipDialog.setModel(oModel_shiptoParty, "shiptoAssignment");
					that._oShipDialog.open();

				},
				error: function (err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},
		onShipClose: function () {
			this._oShipDialog.close();
			if (this._oShipDialog) {
				this._oShipDialog = this._oShipDialog.destroy();
			}
		},

		onUserInfoPress: function (oEvent) {
			var oModel_User = new JSONModel();
			oModel_User = this.getView().getModel("cusInfo");

			if (!this._oUserInforDialog) {
				this._oUserInforDialog = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.userInfo", this);
				this.getView().addDependent(this._oUserInforDialog);
				this._oUserInforDialog.setModel(oModel_User, "oModel_UserInfo");
			}
			this._oUserInforDialog.openBy(oEvent.getSource());
		},

		onUserInfoClose: function () {
			this._oUserInforDialog.close();
			if (this._oUserInforDialog) {
				this._oUserInforDialog = this._oUserInforDialog.destroy();
			}
		},

		/**
		 * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
		getBundleText: function (sI18nKey, aPlaceholderValues) {
			return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
		},

		//************************ Chat Bot Code Start *******************************//
		onOpenChatbot: function (oEvent) {
			//open chatbot logic
			this._getChatbot(oEvent);
			this.getOwnerComponent().isChartBoot = true;
			$("#sap-ui-blocklayer-popup").addClass("testchatboat");
			//set user icon
			var sRootPath = jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5");
			// var sUserIconPath = sRootPath + "/img/userpic.png";
			// this.byId("idFeedInput").setIcon(sUserIconPath);

			var oScrollContainer = sap.ui.getCore().byId("idScroll");
			jQuery.sap.delayedCall(100, this, function () {
				oScrollContainer.scrollTo(0, 100000000, 0);
			});
		},

		onOpenChatWindow: function (oEvent) {
			var that = this;
			$(document).bind("keypress", function (e) {
				if (e.keyCode === 13) {
					e.preventDefault();
					that._onPostMessageByEnter();
				}

			});
		},

		_getChatbot: function (oEvent) {

			var oButton = this.getView().byId("idChatwithme");

			// create popover
			var that = this;

			if (!this._chatbot) {
				this._chatbot = sap.ui.xmlfragment("com.merckgroup.Moet_O2C_OrderCreation_UI5.fragments.chatbot", this);
				this.getView().addDependent(this._chatbot);

			}
			this._chatbot.openBy(oButton);

		},

		onChatbotClose: function () {
			$(document).unbind("keypress");
			if (this._chatbot) {
				this._chatbot.close();
				this._chatbot = this._chatbot.destroy(true);
			}
			this.getOwnerComponent().isChartBoot = false;
		},

		_onPostMessageByEnter: function () {
			//post message from enter key
			var oFeedInput = sap.ui.getCore().byId("idFeedInput").getValue();
			if (oFeedInput) {
				this._processMessage(oFeedInput);
			}
			sap.ui.getCore().byId("idFeedInput").setValue("");
		},

		onPostMessage: function (oEvent) {
			//post message event handler

			//get the message from FeedInput
			var oFeedInput = oEvent.getParameter("value");
			this._processMessage(oFeedInput);

		},

		_processMessage: function (oFeedInput) {
			//process message logic

			//add chatItem as FeedInput
			this._addChatItem(oFeedInput, "user");
			//collect the bot response on the basis of FeedInput
			//var botResponse = this._getBotResponse(oFeedInput);
			this._getBotResponse(oFeedInput);

		},

		_getBotResponse: function (feedInput) {
			//return bot response
			var botResponse = "";
			var that = this;
			if (!jQuery.isNumeric(feedInput)) {
				that.handlingUseractions(false);

			}
			//flag if question found in questionnaire
			var flagQuestionFound = false;
			//bot response logic - first question needs to check in questionnaire
			var _questionnaire = this.getView().getModel("oquestionnaireData");
			for (var k = 0; k < _questionnaire.length; k++) {
				feedInput = feedInput.trim();
				if (feedInput.toLowerCase() === _questionnaire[k].question.toLowerCase()) { //question found in questionnaire
					botResponse = _questionnaire[k].answer;
					botResponse = botResponse.trim();
					that._addChatItem(botResponse, "bot");
					flagQuestionFound = true;
					break;
				}
			}
			//flag for custom label ends
			//bot response logic
			if (!flagQuestionFound) {

				if (feedInput.toLowerCase().includes("hi") || feedInput.toLowerCase().includes("hello")) {
					if (feedInput.toLowerCase().includes("order detail") || feedInput.toLowerCase().includes("details of rti") || feedInput.toLowerCase()
						.includes(
							"detail")) {
						botResponse =
							"Hello, Are you looking for Order Details, if Yes, please provide Order Number";
						that._addChatItem(botResponse, "bot");
					} else {
						botResponse = "Hello, How can I help you?";
						that._addChatItem(botResponse, "bot");
					}
				} else if (feedInput.toLowerCase().includes("How are you")) {
					botResponse =
						"I am doing good hope you are good too...";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("How are you doing")) {
					botResponse =
						"I am doing good hope you are good too...";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("How are you going")) {
					botResponse =
						"I am doing good hope you are good too...";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("What’s up?")) {
					botResponse =
						"I am good hope you are good too...";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("What is your name")) {
					botResponse =
						"Well, people call me Bot.";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Good Morning")) {
					botResponse =
						"A very Good Morning";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Good evening")) {
					botResponse =
						"A very Good Evening";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Good afternoon")) {
					botResponse =
						"A very Good Afternoon";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Good night")) {
					botResponse =
						"A very Good Night";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Tell me something")) {
					botResponse =
						"How may i help you?";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Thank you")) {
					botResponse =
						"Thank you for your valuable time.";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Goodbye")) {
					botResponse =
						"Good bye ..Have a nice day";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("How can you help me?")) {
					botResponse =
						"I can help in getting the Order status details";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("what can you do?")) {
					botResponse =
						"I can help in getting the Order status details";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("I have a question")) {
					botResponse =
						"I can help in getting the Order status details";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("can you help me?")) {
					botResponse =
						"I can help in getting the Order status details";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Are you human?")) {
					botResponse =
						"How may I help you?";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Are you a robot?")) {
					botResponse =
						"How may I help you?";
					that._addChatItem(botResponse, "bot");
				} else if (feedInput.toLowerCase().includes("Ask A Question")) {
					botResponse =
						"Please enter in your question";
					that._addChatItem(botResponse, "bot");

				} else if (jQuery.isNumeric(feedInput)) {
					//if user respond with correct format
					var prdId = feedInput; //.split("#")[1];if (jQuery.type(parseInt(feedInput) === 'number')
					var oFilter = new Filter("ZINTR_ORDNUM", "EQ", prdId);

					this.getOwnerComponent().getModel().read("/OrderHeaderDetails", {
						urlParameters: {
							"$skip": 0,
							"$top": 1
						},
						filters: [oFilter],

						success: function (oData) {

							if (oData && oData.results && oData.results.length) {
								botResponse = "Navigating you to Order Details page, thanks";

								that.getOwnerComponent().setModel(new JSONModel(oData.results[0]), "SelectedSO");

								// botResponse = " Internal Order Number " + oData.results[0].ZINTR_ORDNUM + " : " + oData.results[0].ZORDER_STATUS_TEXT +
								// 	" Do you want me to open this order? Yes or No ";
								// botResponse = " Internal Order Number " + oData.results[0].ZINTR_ORDNUM + " : " + oData.results[0].ZORDER_STATUS_TEXT + " ";
								botResponse = " Internal Order Number " + oData.results[0].ZINTR_ORDNUM + " : " + oData.results[0].ZORDER_STATUS_TEXT +
									" \n Do you want me to open this order? ";
								that._addChatItem(botResponse, "bot");

								that.handlingUseractions(true, null, true, true);

							} else {
								botResponse = "Can you please provide valid Internal Order Number.";
								that._addChatItem(botResponse, "bot");
							}

						},
						error: function () {
							botResponse = "Sorry i didn't understand.We are happy to help with correct inputs";
							that._addChatItem(botResponse, "bot");
						}
					});

				} else {
					//if request is not in correct format
					botResponse =
						"Sorry i didn't understand.We are happy to help with correct inputs";
					that._addChatItem(botResponse, "bot");

				}

			}

		},

		_addChatItem: function (input, userType) {

			var oChatModel = this.getView().getModel("chatModel"),
				oChatData = oChatModel.getData();
			oChatData.push({
				Text: input,
				Author: userType === "user" ? "User" : "ChatBot",
				styleClass: userType === "user" ? "User" : "ChatBot",
				Date: new Date()
			});
			oChatModel.refresh(true);
			var oScroll = sap.ui.getCore().byId("idScroll");
			setTimeout(function () {
				oScroll.scrollTo(0, 1000000);
			}, 0);
		},

		deleteChatHistory: function (oEvent) {
			//delete chat history
			var that = this;
			var oChatModel = this.getView().getModel("chatModel"),
				oChatData = oChatModel.getData();
			oChatData = [];
			oChatData.push({
				Text: "How can I help you today?",
				Author: "ChatBot",
				styleClass: "ChatBot",
				Date: new Date()
			});
			oChatModel.setData(oChatData);
			oChatModel.refresh(true);
			that.handlingUseractions(false, true, null, true);

		},

		_getUserDetails: function (feedInput) {
			var that = this;
			var botResponse = "";
			var oButton = feedInput.getSource();
			if (feedInput.getSource().getProperty("text") !== "Yes" &&
				feedInput.getSource().getProperty("text") !== "No") {
				var oButtonFlexBox = sap.ui.getCore().byId("idButtonFlexBox");
				var items = oButtonFlexBox.getItems();
				items.forEach(function (itm) {
					itm.removeStyleClass("cl_Action_Button1");
				});
				oButton.toggleStyleClass("cl_Action_Button1");
			} else {
				var oFlexbox = sap.ui.getCore().byId("idFlexbox");
				var oItems = oFlexbox.getItems();
				oItems.forEach(function (itm) {
					itm.removeStyleClass("cl_Action_Button1");
				});
				oButton.toggleStyleClass("cl_Action_Button1");
			}

			var oFeedInput = feedInput.getSource().getProperty("text");

			if (oFeedInput === "Ask A Question") {
				sap.ui.getCore().byId("idInputfeed").setVisible(true);
				that.handlingUseractions(false);

			} else if (oFeedInput === "Yes") {

				if (that.getOwnerComponent().sUserRole === "CUST" && that.getOwnerComponent().getModel("SelectedSO").getData().ZORDER_STATUS_TEXT ===
					"SNO Approval") {

					botResponse =
						"Sorry you are not authorised to see this Order";
					that._addChatItem(botResponse, "bot");
					that.handlingUseractions(null, false);

				} else {

					var oDataObject = this.getView().getModel("SelectedSO").getData();
					var Order_Status = that.getView().getModel("SelectedSO").getData().ZORDER_STATUS_TEXT;

					if (Order_Status === "Order Created") {
						this.getConfirmOrderData(oDataObject);

					} else if (Order_Status === "Draft" || Order_Status === "SNO Reviewed") {
						this.getEditOrderData(oDataObject);

					} else if (Order_Status === "SNO Approval") {

						//	var dataObject =ZINTR_ORDNUM = that.getView().getModel("SelectedSO").getData();
						this.getApproveOrderData(oDataObject);

					}

				}

			} else if (oFeedInput === "No") {

				botResponse =
					"Thank You";
				that._addChatItem(botResponse, "bot");
				that.handlingUseractions(null, false);

			} else if (oFeedInput === "Place an Order") {
				sap.ui.getCore().byId("idInputfeed").setVisible(false);
				sap.ui.getCore().byId("idbtnyes").setVisible(false);
				sap.ui.getCore().byId("idbtnno").setVisible(false);
				botResponse =
					"Navigating to Order creation page, Thanks ";

				that._addChatItem(botResponse, "bot");

				return this.getRouter().navTo("NewOrder");

			} else if (oFeedInput === "Open Orders") {
				sap.ui.getCore().byId("idInputfeed").setVisible(false);
				sap.ui.getCore().byId("idbtnyes").setVisible(false);
				botResponse =
					"Navigating to Open Orders page, Thanks ";
				that._addChatItem(botResponse, "bot");
				sap.ui.getCore().byId("idInputfeed").setVisible(false);

				return this.getRouter().navTo("Orders");
			} else if (oFeedInput === "Confirmed Orders") {
				sap.ui.getCore().byId("idInputfeed").setVisible(false);
				sap.ui.getCore().byId("idbtnyes").setVisible(false);
				botResponse =
					"Navigating to Confirmed Orders page, Thanks";
				that._addChatItem(botResponse, "bot");
				sap.ui.getCore().byId("idInputfeed").setVisible(false);

				return this.getRouter().navTo("ProcessOrders");
			} else if (oFeedInput === "Order Report") {
				sap.ui.getCore().byId("idInputfeed").setVisible(false);
				sap.ui.getCore().byId("idbtnyes").setVisible(false);
				botResponse =
					"Navigating to Order Report page, Thanks";
				that._addChatItem(botResponse, "bot");
				sap.ui.getCore().byId("idInputfeed").setVisible(false);

				return this.getRouter().navTo("OrderReport");
			} else if (oFeedInput === "Order Status") {
				sap.ui.getCore().byId("idInputfeed").setVisible(true);
				botResponse =
					"Please enter Internal Order Number";
				that._addChatItem(botResponse, "bot");

			}

			//flag if question found in questionnaire
			var flagQuestionFound = false;
			//bot response logic - first question needs to check in questionnaire
			var _questionnaire = this.getView().getModel("oquestionnaireData");
			for (var k = 0; k < _questionnaire.length; k++) {
				oFeedInput = oFeedInput.trim();
				if (oFeedInput.toLowerCase() === _questionnaire[k].question.toLowerCase()) { //question found in questionnaire
					botResponse = _questionnaire[k].answer;
					botResponse = botResponse.trim();
					that._addChatItem(botResponse, "bot");
					flagQuestionFound = true;
					break;
				}
			}
			//flag for custom label ends
			//bot response logic
			if (!flagQuestionFound) {
				if (oFeedInput.toLowerCase().includes("hi") || oFeedInput.toLowerCase().includes("hello")) {
					if (oFeedInput.toLowerCase().includes("order detail") || oFeedInput.toLowerCase().includes("details of rti") || feedInput.toLowerCase()
						.includes(
							"detail")) {
						botResponse =
							"Hello, Are you looking for Order Details, if Yes, please provide Order Number";
						that._addChatItem(botResponse, "bot");
					} else {
						botResponse = "Hello, How can I help you?";
						that._addChatItem(botResponse, "bot");
					}
				}
				if (oFeedInput.toLowerCase().includes("Ask A Question")) {
					botResponse =
						"Please enter in your question";
					that._addChatItem(botResponse, "bot");

				}

			}

		},

		onAfterRendering: function () {
			dragElement(document.getElementById("container-MOET---app--idChatwithme"));

			function dragElement(elmnt) {
				var pos1 = 0,
					pos2 = 0,
					pos3 = 0,
					pos4 = 0;
				if (document.getElementById(elmnt.id)) {
					// if present, the header is where you move the DIV from:
					document.getElementById(elmnt.id).onmousedown = dragMouseDown;
				} else {
					// otherwise, move the DIV from anywhere inside the DIV:
					elmnt.onmousedown = dragMouseDown;
				}

				function dragMouseDown(e) {
					e = e || window.event;
					e.preventDefault();
					// get the mouse cursor position at startup:
					pos3 = e.clientX;
					pos4 = e.clientY;
					document.onmouseup = closeDragElement;
					// call a function whenever the cursor moves:
					document.onmousemove = elementDrag;
				}

				function elementDrag(e) {
					e = e || window.event;
					e.preventDefault();
					// calculate the new cursor position:
					pos1 = pos3 - e.clientX;
					pos2 = pos4 - e.clientY;
					pos3 = e.clientX;
					pos4 = e.clientY;
					// set the element's new position:

					elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
					elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

					elmnt.style.right = "auto";
					elmnt.style.bottom = "auto";
				}

				function closeDragElement() {
					// stop moving when mouse button is released:
					document.onmouseup = null;
					document.onmousemove = null;
				}
			}

		},

		handlingUseractions: function (bVisibility, bEnable, bChangeEnability, bClearSelection) {
			var oFlexbox = sap.ui.getCore().byId("idFlexbox");
			var oItems = oFlexbox.getItems();
			if (bVisibility !== null) {

				this._oViewProperty.setProperty("/oYesButton", bVisibility);
				this._oViewProperty.setProperty("/oNoButton", bVisibility);
			}
			if (bEnable !== null || bEnable !== undefined) {

				this._oViewProperty.setProperty("/oYesEnabled", bEnable);
				this._oViewProperty.setProperty("/oNoEnabled", bEnable);

			}
			if (bChangeEnability) {
				this._oViewProperty.setProperty("/oYesEnabled", !this._oViewProperty.getProperty("/oYesEnabled"));
				this._oViewProperty.setProperty("/oNoEnabled", !this._oViewProperty.getProperty("/oNoEnabled"));

			}
			if (bClearSelection) {

				oItems.forEach(function (itm) {
					itm.removeStyleClass("cl_Action_Button1");
				});
			}
		},
		onStartRecording: function () {

			sap.ui.getCore().byId("idInputfeed").setVisible(true);
			var final_transcript = '';
			var that = this;
			this.recognition.start();
			sap.ui.getCore().byId("idSoundloud").setType("Accept");
			sap.ui.getCore().byId("idSoundloud").setEnabled(false);
			MessageToast.show("Recording started");
			this.recognition.onstart = function () {};
			this.recognition.onresult = function (event) {

				var interim_transcript = '';

				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						final_transcript += event.results[i][0].transcript;
					} else {
						interim_transcript += event.results[i][0].transcript;
					}

				}

				if (final_transcript != "") {
					that.submitValue(final_transcript);
					final_transcript = "";
				}
			};
		},
		submitValue: function (final_transcript) {
			var key = final_transcript.toLowerCase().trim();
			sap.ui.getCore().byId("idFeedInput").setValue(key);
			sap.ui.getCore().byId("idSoundloud").setEnabled(true);
			this.recognition.stop();
			sap.ui.getCore().byId("idSoundloud").setType("Default");
			this._onPostMessageByEnter();
		},
		initializeSpeechRecognization: function () {
			this.recognition = new window.webkitSpeechRecognition();
			this.recognition.continuous = true;
			this.recognition.interimResults = false;
			this.recognition.lang = 'en-IN';

		}

		/*********************** Chat Bot Code End ***************************/

	});
});