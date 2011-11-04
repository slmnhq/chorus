;(function(ns) {
    ns.Session = chorus.models.Base.extend({
        urlTemplate : "auth/login/",

        user : function() {
            var userName = $.cookie("authuser");
            if (!userName) this.trigger("needsLogin");
            return new ns.User({userName : userName });
        }
    });
})(chorus.models);

