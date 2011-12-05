;
(function(ns) {
    ns.Session = chorus.models.Base.extend({
        urlTemplate : "auth/login/",

        initialize : function() {
            this.bind("saved", setUserIdCookie)
            _.bindAll(this);
        },

        user : function() {
              return new ns.User(this.attributes);
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
              if (success) success(model, resp);
              
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
                    self.trigger("needsLogin")
                })
            } else {
                this.trigger("needsLogin")
            }
        },

        declareValidations : function() {
            this.require("userName")
            this.require("password")
        },

        attrToLabel : {
            "userName" : "login.username",
            "password" : "login.password"
        }
    });

    function setUserIdCookie() {
        $.cookie("userId", this.get("id"))
    }
})(chorus.models);

