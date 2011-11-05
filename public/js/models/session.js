;(function(ns) {
    ns.Session = chorus.models.Base.extend({
        urlTemplate : "auth/login/",

        initialize : function() {
            this.bind("saved", setUsernameCookie)
        },

        user : function() {
            var userName = $.cookie("userName");
            if (!userName) this.trigger("needsLogin");
            return new ns.User({userName : userName });
        }
    });

    function setUsernameCookie(){
        $.cookie("userName", this.get("userName"))
    }
})(chorus.models);

