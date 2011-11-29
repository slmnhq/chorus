;(function($, ns) {
    ns.views.WorkspaceIndexContentHeader = ns.views.Base.extend({
        className : "workspace_index_content_header",
        events : {
            "click .menu.popup_filter li[data-type=active] a" : "triggerActive",
            "click .menu.popup_filter li[data-type=all] a" : "triggerAll"
        },

        setup: function() {
            this.triggerActive();
        },

        postRender: function() {
            var menu = new ns.views.LinkMenu({title : t("filter.show"), options : [
                {data : "active", text : t("filter.active_workspaces")},
                {data : "all", text : t("filter.all_workspaces")}
            ]});
            this.$(".menus").append(menu.render().el);
        },

        triggerActive: function(e) {
            if (e) e.preventDefault();
            this.filter = 'active';
            this.trigger("filter:active");
            this.$(".menu").addClass("hidden");
        },

        triggerAll: function(e) {
            if (e) e.preventDefault();
            this.filter = 'all';
            this.trigger("filter:all");
            this.$(".menu").addClass("hidden");
        }

    });
})(jQuery, chorus);
