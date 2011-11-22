;
(function(ns) {
    ns.Session = chorus.models.Base.extend({
        urlTemplate : "auth/login/",

        initialize : function() {
            this.bind("saved", setUsernameCookie)
            _.bindAll(this);
        },

        user : function() {
            var userName = $.cookie("userName");
            if (!userName) this.trigger("needsLogin");
            return new ns.User({userName : userName });
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

        performValidation : function() {
            this.errors = {}
            this.require("userName")
            this.require("password")
            return _(this.errors).isEmpty();
        }
    });

    function setUsernameCookie() {
        $.cookie("userName", this.get("userName"))
    }
})(chorus.models);

