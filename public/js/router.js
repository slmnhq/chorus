(function($, ns) {
    ns.Router = Backbone.Router.extend({
        showDevLinks : true,
        maps : [
            ["", "Dashboard"],
            ["/", "Dashboard"],
            ["/login", "Login"],
            ["/users", "UserIndex"],
            ["/users/new", "UserNew"],
            ["/workspaces", "WorkspaceIndex"],
            ["/workspaces/:id", "WorkspaceShow"]
        ],

        initialize : function(app) {
            var self = this;
            self.app = app;

            _.each(this.maps, function(map){
                self.route(map[0], map[1], generateRouteCallback(map[1]))
            });
            
            self.route("/logout", "logout", self.app.session.logout);

            function generateRouteCallback(className) {
                return function(id) {
                    self.app.page = new ns.pages[className + "Page"](id)
                    $("#page").html(self.app.page.render().el);

                    if (this.showDevLinks) {
                        $("body > .routes").remove();
                        $("body").append(new ns.views.RouteSplat().render().el);
                    }
                }
            }
        },

        navigate : function(fragment, triggerRoute) {
            if (Backbone.history.fragment == fragment) {
                Backbone.history.loadUrl(fragment);

            } else {
                this.__proto__.navigate(fragment, triggerRoute);
            }
        }
    });


})(jQuery, chorus);