sap.ui.define([
    "entrytool/controller/BaseController",
    "entrytool/model/formatter",
    "sap/ui/model/Filter",
    'sap/ui/export/library',
    "sap/ui/export/Spreadsheet",
    "sap/ui/model/json/JSONModel"
], function (e, r, t, exportLibrary, Spreadsheet, JSONModel) {
    "use strict";
    var EdmType = exportLibrary.EdmType;
    return e.extend("entrytool.controller.OrderReport", {
        custFormatter: r,
        onInit: function () {
            var dataModelOTCHealthCareReport = this.getOwnerComponent().getModel("OTCHealthCareReport");
            this.getView().setModel(dataModelOTCHealthCareReport, "OTCHCR");

            this.getRouter().getRoute("OrderReport").attachPatternMatched(this._onRouteMatched, this);
            this._loadODataUtils()
            // this._wizard = this.byId("CreateProductWizard");
            // this.getView().byId("wizard").addStep(new sap.m.WizardStep("step1", {
            //     Title: "step1",
            //     Validate: true
            // }));
            // this.getView().byId("POStatusWizard").getCurrentStep();
            // this.getView().byId("wizard").setCurrentStep(this.byId("POCreate"));
            // this.getView().byId("POStatusWizard").getFinishButtonText();
            // this.getView().byId("POStatusWizard").getProgress();
            // this.getView().byId("POStatusWizard").getProgressStep();
            // this.getView().byId("POStatusWizard").getSteps();
            // this.getView().byId("POStatusWizard").gotostep(this.getView().byId("POApproveStatus1"), true);
            // this.getView().byId("POStatusWizard").invalidateStep(this.getView().byId("step3")); // invalidate
            // this.getView().byId("POStatusWizard").validateStep(this.getView().byId("step3")); //validate
            // this.getView().byId("POStatusWizard").nextStep();
            // this.getView().byId("POStatusWizard").previousStep();
            // this.getView().byId("POStatusWizard").indexOfStep(this.getView().byId("step2"));
            // this.getView().byId("POStatusWizard").removeAllSteps();
            // this.getView().byId("POStatusWizard").destroySteps();
            this._wizard = this.byId("POStatusWizard");
            var that = this;
            // Initialize view model to manipulate view
            var model = new JSONModel();
            model.setData({
                "PONumber": "",
                "visibleWizard": false
            });
            that.getView().setModel(model, "viewInitialModel");
            // initialize data model 
            var wizardModel = new JSONModel();
            var Wdata = [{
                "PONum": "54276977",
                "POCreate": "X",
                "POApprovedbySupplier": "",
                "POApprovedbyProgrammer": "",
                "POPicked": "",
                "POLoaded": "",
                "POAcknowledged": "",
                "PurchaseId": "L099000543",
                "PurchaseName": "sample Purchase1",
                "Status": "POCreated",
                "CreatedOn": "10042019",
                "CreatedBy": "persion1",
                "ApprovedBySupply": "Person1",
                "ApprovedOn": "",
                "ApprovedBy": "",
                "ApprovedByProgramme": "Person2",
                "ChiefOfProgramme": "Person3",
                "POType": "ZLO",
                "RecommendedDelDate": "02052019",
                "POPicStatus": "",
                "POPickedOn": "",
                "POLoadedOn": "",
                "POAck": ""
            }, {
                "PONum": "54278667",
                "POCreate": "X",
                "POApprovedbySupplier": "X",
                "POApprovedbyProgrammer": "",
                "POPicked": "",
                "POLoaded": "",
                "POAcknowledged": "",
                "PurchaseId": "L099000669",
                "PurchaseName": "sample Purchase2",
                "Status": "POApprovedbySupplier",
                "CreatedOn": "04042019",
                "CreatedBy": "Person1",
                "ApprovedBySupply": "Persion1",
                "ApprovedOn": "",
                "ApprovedBy": "Persion1",
                "ApprovedByProgramme": "Person2",
                "ChiefOfProgramme": "Person3",
                "POType": "ZLO",
                "RecommendedDelDate": "22042019",
                "POPicStatus": "",
                "POPickedOn": "",
                "POLoadedOn": "",
                "POAck": ""
            }, {
                "PONum": "54278881",
                "POCreate": "X",
                "POApprovedbySupplier": "X",
                "POApprovedbyProgrammer": "X",
                "POPicked": "",
                "POLoaded": "",
                "POAcknowledged": "",
                "PurchaseId": "L099000544",
                "PurchaseName": "sample Purchase Name",
                "Status": "POApprovedbyProgrammer",
                "CreatedOn": "01042019",
                "CreatedBy": "Person1",
                "ApprovedBySupply": "Person2",
                "ApprovedOn": "15042019",
                "ApprovedBy": "",
                "ApprovedByProgramme": "Person2",
                "ChiefOfProgramme": "Person3",
                "POType": "ZLO",
                "RecommendedDelDate": "17042019",
                "POPicStatus": "",
                "POPickedOn": "",
                "POLoadedOn": "",
                "POAck": ""
            }, {
                "PONum": "54277437",
                "POCreate": "X",
                "POApprovedbySupplier": "X",
                "POApprovedbyProgrammer": "X",
                "POPicked": "X",
                "POLoaded": "",
                "POAcknowledged": "",
                "PurchaseId": "L099000232",
                "PurchaseName": "sample Purchase3",
                "Status": "POPicked",
                "CreatedOn": "02042019",
                "CreatedBy": "Person1",
                "ApprovedBySupply": "Person2",
                "ApprovedOn": "04042019",
                "ApprovedByProgramme": "Person2",
                "ApprovedBy": "Approval1",
                "ChiefOfProgramme": "Person3",
                "POType": "ZLO",
                "RecommendedDelDate": "05042019",
                "POPicStatus": "partially",
                "POPickedOn": "",
                "POLoadedOn": "",
                "POAck": ""
            }, {
                "PONum": "54278968",
                "POCreate": "X",
                "POApprovedbySupplier": "X",
                "POApprovedbyProgrammer": "X",
                "POPicked": "X",
                "POLoaded": "X",
                "POAcknowledged": "",
                "PurchaseId": "L099000540",
                "PurchaseName": "sample Purchase4",
                "Status": "POLoaded",
                "CreatedOn": "17042019",
                "CreatedBy": "Person3",
                "ApprovedBySupply": "person2",
                "ApprovedOn": "18042019",
                "ApprovedBy": "Approval2",
                "ApprovedByProgramme": "Person2",
                "ChiefOfProgramme": "Person3",
                "POType": "ZLO",
                "RecommendedDelDate": "25042019",
                "POPicStatus": "fully",
                "POPickedOn": "2604019",
                "POLoadedOn": "",
                "POAck": ""
            }];
            wizardModel.setData(Wdata);
            that.getView().setModel(wizardModel, "wizardModel");
        },
        onCheckStatus: function (oEvent) {
            var that = this;
            var PONum = that.getView().getModel("viewInitialModel").getProperty("/PONumber");
            that.getView().getModel("viewInitialModel").setProperty("/visibleWizard", true);
            // getting static data 
            var sData = that.getView().getModel("wizardModel").getData();
            //added filter to get purchase order details based on given input value.
            var sObj = sData.filter(function (item) {
                return item.PONum === PONum;
            });
            // Initialize model to display purchase order details.
            var POStatusModel = new JSONModel(sObj[0]);
            that.getView().setModel(POStatusModel, "POStatusModel");

            // change current step dynamically.
            that.getView().byId("POStatusWizard").setCurrentStep(that.byId(sObj[0].Status));
        },
        additionalInfoValidation: function () {
            this._wizard.validateStep(this.byId("POCreated"));
            this._wizard.validateStep(this.byId("POApprovedbySupplier"));
        },
        _onRouteMatched: function (e) {
            this.onDataReceived();
            this.getVisiblePlaceOrder();
            var r = this;
            setInterval(function () {
                r.userLogin()
            }, 3e5)
        },
        onBeforeRebindTable: function (e) {
            var r = e.getSource();
            var t = this.getView().getModel("viewProperties");
            var o = t.getData().LoginID;
            var a = t.getData().sUserRole;
            var n;
            if (a === "RSNO") {
                n = "/OTCHealthCareReportSNOParam(P_USERID='" + o + "')/Results";
                r.setTableBindingPath(n)
            }
            if (a === "CUST") {
                n = "/OrderTrackingParam(P_USERID='" + o + "')/Results";
                r.setTableBindingPath(n)
            }
            var i = e.getParameter("bindingParams");
            if (!i.sorter.length) {
                i.sorter.push(new sap.ui.model.Sorter("CA_ZSO_CREATED_DATE", true))
            }
        },
        onBeforeRendering: function () { },
        onDataReceived: function () {
            var e = this.getView().byId("smartTable").getTable(),
                r = 0,
                t = e.getColumns();
            jQuery.sap.delayedCall(100, this, function () {
                for (r = t.length; r >= 0; r--) {
                    e.autoResizeColumn(r)
                }
            })
        },
        onAssignedFiltersChanged: function (e) {
            var r = e.getSource();
            for (var t in r._oFilterProvider._mTokenHandler) {
                var o = r._oFilterProvider._mTokenHandler[t];
                if (o && o.parser) {
                    o.parser.setDefaultOperation("Contains")
                }
            }
        },
        onInitialized: function (e) {
            var r = e.getSource();
            for (var t in r._oFilterProvider._mTokenHandler) {
                var o = r._oFilterProvider._mTokenHandler[t];
                if (o && o.parser) {
                    o.parser.setDefaultOperation("Contains")
                }
            }
        },
        reportOrderExport: function () {
            var aCols, oRowBinding, oSettings, oSheet, oTable;

            if (!this._oTable) {
                this._oTable = this.byId('table4');
            }

            oTable = this._oTable;
            oRowBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: {
                    columns: aCols,
                    hierarchyLevel: 'Level'
                },
                dataSource: oRowBinding,
                fileName: 'Order Report.xlsx',
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        createColumnConfig: function () {
            var aCols = [];

            aCols.push({
                label: 'SO Number',
                property: 'ZSO_NO',
                type: EdmType.String
            });

            aCols.push({
                label: 'Delivery No.',
                type: EdmType.String,
                property: 'ZDELIVERY_NO',
                scale: 0
            });

            aCols.push({
                label: 'Created By',
                property: 'ZCREATED_BY',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Created Date',
                property: 'ZSO_CREATED_DATE',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Buyer',
                property: 'ZSOLD_TO_PARTY',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Buyer Description',
                property: 'Z_SOLD_TO_DESC',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Ship',
                property: 'ZSHIP_TO_PARTY',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Ship Description',
                property: 'Z_SHIP_TO_DESC',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'SO ORG',
                property: 'Z_SO_SORG',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'HDR Status',
                property: 'ZHDR_STATUS',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Request Date',
                property: 'CA_ZREQEST_DELV_DATE',
                type: EdmType.String,
                scale: 0
            });

            aCols.push({
                label: 'Delhivery Date',
                property: 'CA_ZDELV_DATE',
                type: EdmType.String,
                scale: 0
            });
            return aCols;
        }
    })
});