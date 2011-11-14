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
        },

        logout : function() {
            var self = this;

            if (this.loggedInUser && !this.loggedInUser.get("errors")) {
                $.get("/edc/auth/logout/?authid=" + $.cookie("authid"), function() {
                    self.trigger("needsLogin")
                })
            } else {
                this.trigger("needsLogin")
            }
        }
    });

    function setUsernameCookie(){
        $.cookie("userName", this.get("userName"))
    }
})(chorus.models);

