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

        self.toast = function(message, options) {
            options = options || {};
            var defaultOpts = {sticky: false, life: 5000};
            var toastOpts = _.extend(defaultOpts, options.toastOpts);
            $.jGrowl(t(message, options), toastOpts);
        }

        self.styleSelect = function(element, options) {
            var $element = $(element);
            if($element.data('selectmenu')){$element.selectmenu("destroy");}

            var changeFunction = function() {
                $(element).trigger('change');
            }
            $element.selectmenu({change: changeFunction, position: {offset: "0 -1"}});
        }
    }

    window.chorus = window.chorus || new Chorus();
})(jQuery);
