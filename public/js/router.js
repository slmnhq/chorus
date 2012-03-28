(function() {
    chorus.Router = Backbone.Router.include(
        chorus.Mixins.Events
    ).extend({
        constructor: function chorus$Router() {
            Backbone.Router.apply(this, arguments);
        },

        maps:[
            // routes are evaluated in LIFO format, so adding a match-all route first will act as a fallback properly
            // (as long as `maps` is evaluated in order)
            ["*path", "InvalidRoute"],
            ["/unauthorized", "Unauthorized"],
            ["/invalidRoute", "InvalidRoute"],
            ["", "Dashboard"],
            ["/", "Dashboard"],
            ["/login", "Login"],
            ["/search/:query", "SearchIndex"],
            ["/search/:scope/:entityType/:query", "SearchIndex"],
            ["/users", "UserIndex"],
            ["/users/:id", "UserShow"],
            ["/users/:id/edit", "UserEdit"],
            ["/users/new", "UserNew"],
            ["/workspaces", "WorkspaceIndex"],
            ["/workspaces/:id", "WorkspaceShow"],
            ["/workspaces/:workspaceId/workfiles", "WorkfileIndex"],
            ["/workspaces/:workspaceId/datasets/:datasetId", "DatasetShow"],
            ["/workspaces/:workspaceId/workfiles/:workfileId", "WorkfileShow"],
            ["/workspaces/:workspaceId/workfiles/:workfileId/versions/:versionId", "WorkfileShow"],
            ["/workspaces/:workspaceId/datasets", "DatasetIndex"],
            ["/workspaces/:workspaceId/search/:query", "WorkspaceSearchIndex"],
            ["/workspaces/:workspaceId/search/:scope/:entityType/:query", "WorkspaceSearchIndex"],
            ["/instances", "InstanceIndex"],
            ["/instances/:instanceId/databases", "DatabaseIndex"],
            ["/instances/:instanceId/databases/:databaseName", "SchemaIndex"],
            ["/instances/:instanceId/databases/:databaseName/schemas/:schemaName", "SchemaBrowse"],
            ["/instances/:instanceId/databases/:databaseName/schemas/:schemaName/:metaType/:objectName", "TabularDataShow"],
            ["/instances/:instanceId/browse/*path", "HdfsEntryIndex"],
            ["/instances/:instanceId/browseFile/*path", "HdfsShowFile"],
            ["/notifications", "NotificationIndex"],
            ["/styleguide", "StyleGuide"]
        ],

        initialize:function (app) {
            var self = this;
            self.app = app;

            _.each(this.maps, function (map) {
                var pattern = map[0],
                    pageClassName = map[1],
                    callback = self.generateRouteCallback(pageClassName);
                self.route(pattern, pageClassName, callback);
            });

            self.route("/logout", "Logout", self.app.session.logout);
        },

        navigate:function (fragment, triggerRoute, pageOptions) {
            this.app.pageOptions = pageOptions;
            fragment = fragment.match(/#?(.+)/)[1];
            if (Backbone.history.fragment == fragment || Backbone.history.fragment == decodeURIComponent(fragment)) {
                Backbone.history.loadUrl(fragment);
            } else {
                Backbone.Router.prototype.navigate(fragment, triggerRoute);
            }
        },

        reload: function() {
            this.navigate(Backbone.history.fragment);
        },

        generateRouteCallback:function (className) {
            var self = this;
            return function () {
                var args = arguments;
                var navFunction = function () {
                    chorus.PageEvents.reset();
                    if (className == "Login" && self.app.session.loggedIn()) {
                        self.navigate("/", true);
                    } else {
                        self.trigger("leaving");
                        var pageClass = chorus.pages[className + "Page"];
                        var page = applyConstructor(pageClass, args);
                        page.pageOptions = self.app.pageOptions;
                        delete self.app.pageOptions;
                        self.app.page = page;

                        $("#page").html(page.render().el).attr("data-page", className);

                        if (self.app.modal) self.app.modal.closeModal();
                    }

                    window.scroll(0, 0);
                };

                if (className === 'Login' || className === 'StyleGuide') {
                    navFunction();
                } else {
                    self.app.session.fetch({
                        success:function (session, resp) {
                            if (resp.status == "ok") {
                                navFunction();
                            }
                        }
                    });
                }
            };
        }
    });


    // apply arbitrary number of arguments to constructor (for routes with parameters)
    // code taken from http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible/1608546#1608546
    function applyConstructor(constructor, args) {
        function chorus$Page() {
            return constructor.apply(this, args);
        }

        chorus$Page.prototype = constructor.prototype;
        return new chorus$Page;
    }
})();

