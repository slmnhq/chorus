chorus.models.Session = chorus.models.Base.extend({
    constructorName: "Session",
    urlTemplate: "auth/login/",

    initialize: function() {
        this.sandboxPermissionsCreated = {}
        _.bindAll(this, ['logout']);
    },

    user: function() {
        if (!this._user && this.get("id")) {
            this._user = new chorus.models.User(this.attributes);
        }

        return this._user
    },

    loggedIn: function() {
        return $.cookie("authid") && this._user && this._user.get("id");
    },

    fetch: function(options) {
        options = _.extend(options || {}, {
            url: "/auth/checkLogin/?authid=" + $.cookie("authid")
        });

        var success = options.success;
        var self = this;

        options.success = function(model, response, xhr) {
            if (response.status !== "ok") {
                self.clear();
                self.trigger("needsLogin");
            }
            if (success) success(model, response);
            chorus.models.Config.instance();
        };

        return this._super('fetch', [options]);
    },

    check: function(destinationRoute) {
        if (destinationRoute != "Logout" && destinationRoute != "Login") {
            this.fetch();
        }
    },

    clear: function() {
        delete this.serverErrors;
        delete this._user;
        delete this.id;
        this.sandboxPermissionsCreated = {};
        this._super('clear', arguments);
    },

    logout: function() {
        var self = this;

        if (!this.get("errors")) {
            this.requestLogout(function() {
                self.trigger("needsLogin")
            });
        } else {
            this.rememberPathBeforeLoggedOut();
            this.trigger("needsLogin")
        }
    },

    requestLogout: function(logoutSucceeded) {
        var self = this;
        $.get("/auth/logout/?authid=" + $.cookie("authid"), function() {
            self.clear();
            logoutSucceeded();
        });
    },

    rememberPathBeforeLoggedOut: function() {
        if (Backbone.history.fragment != "/logout") {
            this._pathBeforeLoggedOut = Backbone.history.fragment;
        } else {
            delete this._pathBeforeLoggedOut;
        }
    },

    shouldResume: function () {
        return this._pathBeforeLoggedOut;
    },

    resumePath: function() {
        return this._pathBeforeLoggedOut;
    },

    declareValidations: function(newAttrs) {
        this.require("userName", newAttrs);
        this.require("password", newAttrs);
    },

    attrToLabel: {
        "userName": "login.username",
        "password": "login.password"
    }
});
