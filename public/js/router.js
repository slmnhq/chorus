(function($, ns) {
    ns.Router = Backbone.Router.extend({
        maps : [
            // routes are evaluated in LIFO format, so adding a match-all route first will act as a fallback properly
            // (as long as `maps` is evaluated in order)
            ["*path", "InvalidRoute"],
            ["", "Dashboard"],
            ["/", "Dashboard"],
            ["/login", "Login"],
            ["/users", "UserIndex"],
            ["/users/:id", "UserShow"],
            ["/users/:id/edit", "UserEdit"],
            ["/users/new", "UserNew"],
            ["/workspaces", "WorkspaceIndex"],
            ["/workspaces/:id", "WorkspaceSummary"],
            ["/workspaces/:workspaceId/workfiles", "WorkfileIndex"],
            ["/workspaces/:workspaceId/workfiles/:workspaceId", "WorkfileShow"],
            ["/styleguide", "StyleGuide"]
        ],

        initialize : function(app) {
            var self = this;
            self.app = app;

            _.each(this.maps, function(map){
                self.route(map[0], map[1], generateRouteCallback(map[1]))
            });
            self.route("/logout", "Logout", self.app.session.logout);

            function generateRouteCallback(className) {
                return function() {
                    self.trigger("route", className, arguments);
                    // apply arbitrary number of arguments to constructor (for routes with parameters)
                    // code taken from http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/1608546#1608546
                    var args = arguments;
                    function construct() {
                        var cls = ns.pages[className + "Page"];
                        function F() {
                            return cls.apply(this, args);
                        }

                        F.prototype = cls.prototype;
                        return new F();
                    }
                    self.app.page = construct();
                    $("#page").html(self.app.page.render().el).attr("data-page", className);
                }
            }
        },

        navigate : function(fragment, triggerRoute) {
            fragment = fragment.match(/#?(.+)/)[1];
            if (Backbone.history.fragment == fragment) {
                Backbone.history.loadUrl(fragment);
            } else {
                Backbone.Router.prototype.navigate(fragment, triggerRoute);
            }
        }
    });
})(jQuery, chorus);
