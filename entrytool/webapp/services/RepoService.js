sap.ui.define(["./HTTPService"], function(e) {
    "use strict";
    var t = e.extend("entrytool.services.RepoService", {
        constructor: function() {},
        uploadFile: function(e, t) {
            var o = new FormData,
                a;
            o.append("fileName", t);
            o.append("file", e);
            var n = window.location.href.split(".")[0].split("-")[1];
            var r = new sap.ui.model.json.JSONModel;
            r.loadData(jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5.model", "/folderId.json"), null, false);
            var i = r.getData();
            for (var d = 0; d < i.length; d++) {
                if (i[d].subaccount === "aa4d355e1") {
                    if (n === "aa4d355e1") {
                        o.append("folderId", "cYsP2tOQ5fa15OTmAtVf-RhjT_geIDnJRJ3VE9WIThg")
                    }
                } else if (i[d].subaccount === "a3a4a7fd8") {
                    if (n === "a3a4a7fd8") {
                        o.append("folderId", "OdM8nQONL8vvafFcroZq_t0hdKg66be0UYVshrJDAvM")
                    }
                } else {
                    if (n === "ojww0j90sl") {
                        o.append("folderId", "sWrYJclf44vYnGYTGCtlQE_F0iQiYkr2hVhw0utMKqs")
                    }
                }
            }
            a = {
                settings: []
            };
            o.append("fileSettings", JSON.stringify(a));
            return this.http("/CMIS/cmis/upload").post(false, o)
        },
        deleteFile: function(e, t) {
            var o = new FormData;
            o.append("cmisaction", "delete");
            o.append("fileName", e);
            o.append("docId", t);
            var a = window.location.href.split(".")[0].split("-")[1];
            var n = new sap.ui.model.json.JSONModel;
            n.loadData(jQuery.sap.getModulePath("com.merckgroup.Moet_O2C_OrderCreation_UI5.model", "/folderId.json"), null, false);
            var r = n.getData();
            for (var i = 0; i < r.length; i++) {
                if (r[i].subaccount === "aa4d355e1") {
                    if (a === "aa4d355e1") {
                        o.append("folderId", "cYsP2tOQ5fa15OTmAtVf-RhjT_geIDnJRJ3VE9WIThg")
                    }
                } else if (r[i].subaccount === "a3a4a7fd8") {
                    if (a === "a3a4a7fd8") {
                        o.append("folderId", "OdM8nQONL8vvafFcroZq_t0hdKg66be0UYVshrJDAvM")
                    }
                } else {
                    if (a === "ojww0j90sl") {
                        o.append("folderId", "sWrYJclf44vYnGYTGCtlQE_F0iQiYkr2hVhw0utMKqs")
                    }
                }
            }
            return this.http("/CMIS/cmis/delete?docId=" + t).post(false, o)
        },
        getFiles: function() {
            return this.getRepoId().then(function(e) {
                return this.http("/BRMA_CMIS/brmacmis/json/" + e + "/root/").get()
            }.bind(this))
        },
        getFile: function(e) {
            return this.http(e).get()
        },
        getRepoId: function() {
            if (this.sRepoId) {
                return Promise.resolve(this.sRepoId)
            }
            return this.getRepoInfo().then(function(e) {
                for (var t in e) {
                    this.sReposId = e[t].repositoryId;
                    break
                }
                return this.sReposId
            }.bind(this))
        },
        getRepoInfo: function() {
            return this.http("/BRMA_CMIS/brmacmis/json").get()
        }
    });
    return new t
});