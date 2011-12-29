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
        self.features = {};
        self.locale = 'en';

        self.initialize = function() {
            self.session = new chorus.models.Session();
            self.router = new chorus.Router(self);
            self.detectFeatures();

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

        self.detectFeatures = function() {
            self.features.multipleFileUpload = !$.browser.mozilla || (parseInt($.browser.version) >= 2);
        }
    }

    window.chorus = window.chorus || new Chorus();
})(jQuery);
