chorus.models.Session = chorus.models.Base.extend({
    constructorName: "Session",
    urlTemplate:"auth/login/",

    initialize:function () {
        this.sandboxPermissionsCreated = {}
        _.bindAll(this, ['logout']);
    },

    user:function () {
        if (!this._user && this.get("id")) {
            this._user = new chorus.models.User(this.attributes);
        }

        return this._user
    },

    loggedIn:function () {
        return $.cookie("authid") && this._user && this._user.get("id");
    },

    fetch:function (options) {
        options = _.extend(options || {}, {
            url:"/edc/auth/checkLogin/?authid=" + $.cookie("authid")
        });

        var success = options.success;
        var self = this;

        options.success = function (model, response, xhr) {
            if (response.status !== "ok") {
                self.serverErrors = undefined;
                delete self._user;
                self.clear();
                self.trigger("needsLogin");
            }
            if (success) success(model, response);

        };

        return this._super('fetch', [options]);
    },

    check:function (destinationRoute) {
        if (destinationRoute != "Logout" && destinationRoute != "Login") {
            this.fetch();
        }
    },

    logout:function () {
        var self = this;

        if (!this.get("errors")) {
            $.get("/edc/auth/logout/?authid=" + $.cookie("authid"), function () {
                self.clear();
                delete self._user;
                self.sandboxPermissionsCreated = {};
                self.trigger("needsLogin")
            })
        } else {
            chorus.session.pathBeforeLoggedOut = Backbone.history.fragment;
            this.trigger("needsLogin")
        }
    },

    declareValidations:function (newAttrs) {
        this.require("userName", newAttrs);
        this.require("password", newAttrs);
    },

    attrToLabel:{
        "userName":"login.username",
        "password":"login.password"
    }
});