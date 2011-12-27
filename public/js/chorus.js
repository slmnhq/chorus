(function($) {
    window.Chorus = function() {
        var self = this;
        self.models = {};
        self.views = {};
        self.pages = {};
        self.presenters = {};
        self.dialogs = {};
        self.alerts = {};
        self.templates = {};

        self.initialize = function() {
            self.session = new chorus.models.Session();
            self.router = new chorus.Router(self);

            //bind global state events here
            self.session.bind("needsLogin", self.requireLogin);
            self.router.bind("route", self.session.check);

            self.startHistory();
        };

        self.startHistory = function() {
            Backbone.history.start();
        };

        self.requireLogin = function requireLogin() {
            self.router.navigate("/login", true);
        };
    }

    window.chorus = window.chorus || new Chorus();
})(jQuery);
