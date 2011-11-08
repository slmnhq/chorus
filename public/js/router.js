(function($, ns) {
    ns.Router = Backbone.Router.extend({
        routes: {
            "/"    :   "dashboard",
            "/login"        :   "login",
            "/users"        :   "users"
        },

        dashboard : function() {
            $("#content").html(new chorus.views.Dashboard().render().el);
        },

        login : function() {
            $("#content").html(new chorus.views.Login({model : chorus.session}).render().el);
        },

        users : function () {
            $("#content").html(new chorus.views.UserIndexPage().render().el);
        }
    });

})(jQuery, chorus);
