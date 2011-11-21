(function($) {
    window.Chorus = function() {
        var self = this;
        self.models = {};
        self.views = {};
        self.pages = {};
        self.dialogs = {};


        self.initialize = function() {
            self.session = new chorus.models.Session();
            self.router = new chorus.Router(self);
            self.user = self.session;

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

    window.t = function(key) {
        if (_.isEmpty($.i18n.map)) {
            jQuery.i18n.properties({
                name:'Messages',
                path:'messages/',
                mode:'map',
                language: "en_US"});
        }

        return $.i18n.prop.apply(this, arguments);
    }

    // set up default qTip style
    $.fn.qtip.styles.chorus = {
        background: "red",
        color: "white",
        tip: {
            corner :"leftMiddle",
            color: "red"
        },
        border: {
            width: 0
        }
    };
})(jQuery);
