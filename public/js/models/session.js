;
(function(ns) {
    ns.Session = chorus.models.Base.extend({
        urlTemplate : "auth/login/",

        initialize : function() {
            _.bindAll(this);
        },

        user : function() {
            if(!this._user && this.get("id")) {
                this._user = new ns.User(this.attributes);
            }

            return this._user
        },

        loggedIn : function() {
            return this._user && this._user.get("id");
        },

        fetch : function(options) {
            options = _.extend(options || {}, {
                url : "/edc/auth/checkLogin/?authid=" + $.cookie("authid")
            });

            var success = options.success;
            var self = this;

            options.success = function(model, response, xhr) {
                if (response.status !== "ok") {
                    self.serverErrors = undefined;
                    self.trigger("needsLogin");
                }
              if (success) success(model, response);

            };

            return chorus.models.Base.prototype.fetch.call(this, options);
        },

        check : function(destinationRoute) {
            if (destinationRoute != "Logout" && destinationRoute != "Login") {
                this.fetch();
            }
        },

        logout : function() {
            var self = this;

            if (!this.get("errors")) {
                $.get("/edc/auth/logout/?authid=" + $.cookie("authid"), function() {
                    self.clear();
                    delete self._user;
                    self.trigger("needsLogin")
                })
            } else {
                this.trigger("needsLogin")
            }
        },

        declareValidations : function(newAttrs) {
            this.require("userName", newAttrs);
            this.require("password", newAttrs);
        },

        attrToLabel : {
            "userName" : "login.username",
            "password" : "login.password"
        }
    });
})(chorus.models);

