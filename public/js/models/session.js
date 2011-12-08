;
(function(ns) {
    ns.Session = chorus.models.Base.extend({
        urlTemplate : "auth/login/",

        initialize : function() {
            this.bind("saved", storeSessionState, this)
            _.bindAll(this);
        },

        user : function() {
            this._user = this._user || new ns.User();

            //only mutate user when necessary so you can bind to chorus.session.user change
            if(!this._user.get("id") || !this._user.get("id") != this.get("id")) {
                this._user.set( _.extend({id: $.cookie("userId")}, this.attributes))
            }

            return this._user
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
                    self.clear();
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

    function storeSessionState() {
//        console.log("this is never getting put")
        $.cookie("userId", this.get("id"))
        this.user().set({id: this.get("id")})
    }
})(chorus.models);

