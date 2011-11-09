(function($, ns) {
    ns.Router = Backbone.Router.extend({
        routes: {
            ""    :   "dashboard",
            "/"    :   "dashboard",
            "/login"        :   "login",
            "/users"        :   "users",
            "/users/new"        :   "userNew"
        },

        dashboard : function() {
            page("Dashboard");
        },

        login : function() {
            page("Login");
        },

        users : function () {
            page("UserIndex");
        },

        userNew : function () {
            page("UserNew");
        }
    });

    function page(className){
        $("#content").html(new chorus.pages[className + "Page"]().render().el);
    }
})(jQuery, chorus);
