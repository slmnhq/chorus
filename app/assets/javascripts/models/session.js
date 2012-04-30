chorus.models.Session = chorus.models.Base.extend({
    constructorName: "Session",
    urlTemplate: "sessions",

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
        options || (options = {});
        var success = options.success, error = options.error;

        options.success = function(model, data, xhr) {
            chorus.models.Config.instance();
            if (success) success(model, data);
        };

        options.error = function(model, xhr) {
            model.clear();
            if (error) error(model, xhr);
        };

        return this._super('fetch', [options]);
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

        if (this.get("errors")) {
            this.rememberPathBeforeLoggedOut();
            this.trigger("needsLogin")
        } else {
            this.requestLogout(function() {
                self.trigger("needsLogin")
            });
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
        this.require("username", newAttrs);
        this.require("password", newAttrs);
    },

    attrToLabel: {
        "username": "login.username",
        "password": "login.password"
    }
});
