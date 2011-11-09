(function($) {
    window.Chorus = function() {
        var self = this;
        self.models = {};
        self.views = {};
        self.pages = {};

        self.initialize = function() {
            self.session = new chorus.models.Session();
            self.router = new chorus.Router();

            //bind global state events here
            self.session.bind("needsLogin", self.requireLogin)

            self.user = self.fetchUser();

            self.startHistory();
        }


        self.fetchUser = function(){
            var user = self.session.user();
            if (user) user.fetch();
            return user
        }

        self.startHistory = function() {
            Backbone.history.start();
        }

        self.requireLogin = function requireLogin() {
            self.router.navigate("/login", true)
        }
    }



    window.chorus = window.chorus || new Chorus();
})(jQuery);
