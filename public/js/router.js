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
            ns.page = new ns.pages[className + "Page"]()
            $("#page").html(ns.page.render().el);
            if (true) {
                $("body > .routes").remove();
                $("body").append(new ns.views.RouteSplat().render().el);
            }
        }
    }
})(jQuery, chorus);