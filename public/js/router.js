(function($, ns) {
    ns.Router = Backbone.Router.extend({
        maps : [
            ["", "Dashboard"],
            ["/", "Dashboard"],
            ["/login", "Login"],
            ["/users", "UserIndex"],
            ["/users/new", "UserNew"],
            ["/workspaces", "WorkspaceIndex"]
        ],

        initialize : function() {
            var self = this;
            _.each(this.maps, function(map){
                self.route(map[0], map[1], makePage(map[1]))
            });
            self.route("/logout", "logout", this.logout);

            self.route("/workspace/:id/workfiles", "WorkfileIndex", makePage("WorkfileIndex"))
        },

        navigate : function(fragment, triggerRoute) {
            if (Backbone.history.fragment == fragment) {
                Backbone.history.loadUrl(fragment);

            } else {
                this.__proto__.navigate(fragment, triggerRoute);
            }
        },

        logout : function() {
            var self = this;
            if (!chorus.user || chorus.user.get("errors")) {
                this.navigate("/login", true);
            } else {
                $.get("/edc/auth/logout/?authid=" + $.cookie("authid"), function() {
                    self.navigate("/login", true);
                })
            }
        }
    });

    function makePage(className) {
        return function() {
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
            ns.page = construct();
            $("#page").html(ns.page.render().el);
            if (true) {
                $("body > .routes").remove();
                $("body").append(new ns.views.RouteSplat().render().el);
            }
        }
    }
})(jQuery, chorus);