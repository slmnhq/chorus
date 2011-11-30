;(function($, ns) {
    ns.views.WorkspaceIndexContentHeader = ns.views.Base.extend({
        className : "workspace_index_content_header",

        postRender: function() {
            var self=this;
            var menu = new ns.views.LinkMenu({title : t("filter.show"), options : [
                {data : "active", text : t("filter.active_workspaces")},
                {data : "all", text : t("filter.all_workspaces")}
            ]});
            this.$(".menus").append(menu.render().el);
            menu.bind("choice", function(choice){
                self.choose(choice)
            });
        },
        choose : function(choice){
            this.filter = choice;
            this.trigger("filter:" + choice);
        }
    });
})(jQuery, chorus);
