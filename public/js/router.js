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
                var pattern       = map[0],
                    pageClassName = map[1],
                    callback      = generateRouteCallback.call(self, pageClassName);
                self.route(pattern, pageClassName, callback);
            });

            self.route("/logout", "Logout", self.app.session.logout);
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

    function generateRouteCallback(className) {
        var self = this;

        return function() {
            var pageClass = ns.pages[className + "Page"];
            var page = applyConstructor(pageClass, arguments);
            self.trigger("route", className, arguments);
            self.app.page = page;

            $("#page").html(page.render().el).attr("data-page", className);

            if (self.app.modal) self.app.modal.closeModal();
        }
    };

    // apply arbitrary number of arguments to constructor (for routes with parameters)
    // code taken from http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/1608546#1608546
    function applyConstructor(constructor, args) {
        function F() { return constructor.apply(this, args); };
        F.prototype = constructor.prototype;
        return new F;
    };
})(jQuery, chorus);
