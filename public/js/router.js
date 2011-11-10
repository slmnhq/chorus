(function($, ns) {
    ns.Router = Backbone.Router.extend({
        initialize : function() {
            this.route("", "dashboard", makePage("Dashboard"));
            this.route("/", "dashboard", makePage("Dashboard"));
            this.route("/login", "login", makePage("Login"));
            this.route("/users", "users", makePage("UserIndex"));
            this.route("/users/new", "userNew", makePage("UserNew"));
        }
    });

    function makePage(className) {
        return function() {
            ns.page = new ns.pages[className + "Page"]()
            $("#page").html(ns.page.render().el);
        }
    }
})(jQuery, chorus);