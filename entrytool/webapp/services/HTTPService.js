sap.ui.define(["sap/ui/base/Object"], function(e) {
    "use strict";
    var t = e.extend("entrytool.services.HTTPService", {
        constructor: function() {},
        http: function(e) {
            var t = {
                ajax: function(e, t, n, r, o) {
                    var i = new Promise(function(o, i) {
                        var a = new XMLHttpRequest;
                        var s = t;
                        if (r && e === "GET") {
                            s += "?";
                            var u = 0;
                            for (var c in r) {
                                if (r.hasOwnProperty(c)) {
                                    if (u++) {
                                        s += "&"
                                    }
                                    s += encodeURIComponent(c) + "=" + encodeURIComponent(r[c])
                                }
                            }
                        }
                        a.open(e, s, true);
                        if (r && (e === "POST" || e === "PUT")) {
                            var f = r
                        }
                        for (var p in n) {
                            if (n.hasOwnProperty(p)) {
                                a.setRequestHeader(p, n[p])
                            }
                        }
                        if (f) {
                            a.send(f instanceof FormData ? f : JSON.stringify(f))
                        } else {
                            a.send()
                        }
                        a.onload = function() {
                            if (this.status == 200 || this.status == 201) {
                                try {
                                    o(JSON.parse(this.response))
                                } catch (e) {
                                    o(this.response)
                                }
                            } else {
                                i(this)
                            }
                        };
                        a.onerror = function() {
                            i(this)
                        }
                    });
                    return i
                }
            };
            return {
                get: function(n, r) {
                    return t.ajax("GET", e, n, r)
                },
                post: function(n, r) {
                    return t.ajax("POST", e, n, r)
                },
                put: function(n, r) {
                    return t.ajax("PUT", e, n, r)
                },
                delete: function(n, r) {
                    return t.ajax("DELETE", e, n, r)
                }
            }
        }
    });
    return t
});