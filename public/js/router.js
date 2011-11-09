(function($, ns) {
    ns.Router = Backbone.Router.extend({
        initialize : function(){
            this.route("", "dashboard", makePage("Dashboard"));
            this.route("/", "dashboard", makePage("Dashboard"));
            this.route("/login", "login", makePage("Login"));
            this.route("/users", "users", makePage("UserIndex"));
            this.route("/users/new", "userNew", makePage("UserNew"));
        }
    });

    function page(className){
        $("#content").html(new chorus.pages[className + "Page"]().render().el);
    }
    function makePage(className) {
        return function() { page(className); }
    }
})(jQuery, chorus);