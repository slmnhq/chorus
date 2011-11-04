(function($) {
    var Chorus = function() {
        var self = this;
        self.models = {};
        self.views = {};

        self.initialize = function() {
            Backbone.history.start();
            self.session = new self.models.Session();
        }
    }

    window.chorus = window.chorus || new Chorus();
})(jQuery);
