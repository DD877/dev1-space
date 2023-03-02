sap.ui.define([
	"./HTTPService"
], function (HTTPService) {
	"use strict";

	var RepoService = HTTPService.extend("com.merckgroup.Moet_O2C_OrderCreation_UI5.RepoService", {
		constructor: function () {},
		/**
		 * Method to upload the Specification Document to Document Services.
		 * @param {object} oFile file to be uploaded to Repository.
		 * @param {string} sFileName file name passed in form data.
		 * @returns {http.post} returns the upload file with content
		 * @public
		 */
		uploadFile: function (oFile, sFileName) {
			var oForm = new FormData(),
				oSettings;
			/* eslint-disable */
			oForm.append("fileName", sFileName);
			oForm.append("file", oFile);

			//oForm.append("folderId", "cYsP2tOQ5fa15OTmAtVf-RhjT_geIDnJRJ3VE9WIThg");

			var sSubAccount = window.location.href.split(".")[0].split("-")[1];

			var oFileModel = new sap.ui.model.json.JSONModel();
			oFileModel.loadData(jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5.model", "/folderId.json"),
				null, false);
			var afolderId = oFileModel.getData();

			for (var i = 0; i < afolderId.length; i++) {
				if (afolderId[i].subaccount === "aa4d355e1") {
					if (sSubAccount === "aa4d355e1") {
						oForm.append("folderId", "cYsP2tOQ5fa15OTmAtVf-RhjT_geIDnJRJ3VE9WIThg");
					}
				}else if (afolderId[i].subaccount === "a3a4a7fd8") {
					if (sSubAccount === "a3a4a7fd8") {
						oForm.append("folderId", "OdM8nQONL8vvafFcroZq_t0hdKg66be0UYVshrJDAvM");
					}
				} else {
					if (sSubAccount === "ojww0j90sl") {
						oForm.append("folderId", "sWrYJclf44vYnGYTGCtlQE_F0iQiYkr2hVhw0utMKqs");
					}
				}
			}

			oSettings = {
				"settings": []
			};
			oForm.append("fileSettings", JSON.stringify(oSettings));
			/* eslint-enable */
			return this.http("/CMIS/cmis/upload").post(false, oForm);
		},
		/**
		 * Method to delete the Specification Document from Document Services.
		 * @param {string} sName file name passed in form data.
		 * @param {string} sdocId file docId passed in form data.
		 * @returns {http.post} returns the delete file.
		 * @public
		 */
		deleteFile: function (sName, sdocId) {
			var oForm = new FormData();
			/* eslint-disable */
			oForm.append("cmisaction", "delete");
			oForm.append("fileName", sName);
			oForm.append("docId", sdocId);
			//oForm.append("folderId", "TNRhvTKh3fGgOWjK4AX1bC-fTbFSIncDe8BNV13hnTs");
			/*oForm.append("folderId", "cYsP2tOQ5fa15OTmAtVf-RhjT_geIDnJRJ3VE9WIThg");*/
			
			var sSubAccount = window.location.href.split(".")[0].split("-")[1];

			var oFileModel = new sap.ui.model.json.JSONModel();
			oFileModel.loadData(jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5.model", "/folderId.json"),
				null, false);
			var afolderId = oFileModel.getData();

			for (var i = 0; i < afolderId.length; i++) {
				if (afolderId[i].subaccount === "aa4d355e1") {
					if (sSubAccount === "aa4d355e1") {
						oForm.append("folderId", "cYsP2tOQ5fa15OTmAtVf-RhjT_geIDnJRJ3VE9WIThg");
					}
				}else if (afolderId[i].subaccount === "a3a4a7fd8") {
					if (sSubAccount === "a3a4a7fd8") {
						oForm.append("folderId", "OdM8nQONL8vvafFcroZq_t0hdKg66be0UYVshrJDAvM");
					}
				} else {
					if (sSubAccount === "ojww0j90sl") {
						oForm.append("folderId", "sWrYJclf44vYnGYTGCtlQE_F0iQiYkr2hVhw0utMKqs");
					}
				}
			}
			
			
			/* eslint-enable */
			//return this.http("/BRMA_CMIS/brmacmis/delete?docId=" + sdocId).post(false, oForm);
			return this.http("/CMIS/cmis/delete?docId=" + sdocId).post(false, oForm);
		},
		/**
		 * Method to get all files from repository.
		 * @public
		 * @returns {http.post} returns the repository details
		 */
		getFiles: function () {
			return this.getRepoId().then(function (sReposId) {
				return this.http("/BRMA_CMIS/brmacmis/json/" + sReposId + "/root/").get();
			}.bind(this));

		},
		/**
		 * Method to get a single File data.
		 * @param {string} sPath to get the related file.
		 * @returns {http.get} returns the uploaded file
		 * @public
		 */
		getFile: function (sPath) {
			return this.http(sPath).get();
		},
		/**
		 * Method to get the Repository id.
		 * @public
		 * @returns {sReposId} returns the repository id.
		 */
		getRepoId: function () {
			/* eslint-disable */
			if (this.sRepoId) {
				return Promise.resolve(this.sRepoId);
			}
			return this.getRepoInfo().then(function (info) {
				for (var field in info) {
					this.sReposId = info[field].repositoryId;
					break;
				}
				return this.sReposId;
			}.bind(this));
			/* eslint-enable */
		},
		/**
		 * Method to get the Repository information.
		 * @returns {http.get} returns the repository information.
		 * @public
		 */
		getRepoInfo: function () {
			return this.http("/BRMA_CMIS/brmacmis/json").get();
		}
	});
	return new RepoService();
});