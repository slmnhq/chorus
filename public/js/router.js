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
        }
    });

    function makePage(className) {
        return function() {
            ns.page = new ns.pages[className + "Page"]()
            $("#page").html(ns.page.render().el);
        }
    }
})(jQuery, chorus);