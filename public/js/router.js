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
            $("#content").html(new chorus.views.Dashboard().render().el);
        },

        login : function() {
            $("#content").html(new chorus.views.Login({model : chorus.session}).render().el);
        },

        users : function () {
            $("#content").html(new chorus.pages.UserIndexPage().render().el);
        },

        userNew : function () {
            $("#content").html(new chorus.pages.UserNewPage().render().el);
        }
    });

})(jQuery, chorus);
