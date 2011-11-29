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
            this.updateFilterMenu();
        },

        triggerActive: function(e) {
            if (e) e.preventDefault();
            this.filter = 'active';
            this.trigger("filter:active");
            this.$(".menu").addClass("hidden");
            this.updateFilterMenu();
        },

        triggerAll: function(e) {
            if (e) e.preventDefault();
            this.filter = 'all';
            this.trigger("filter:all");
            this.$(".menu").addClass("hidden");
            this.updateFilterMenu();
        },

        updateFilterMenu: function() {
            if (this.filter === 'all') {
                this.$(".link_menu > a span").text(t("filter.all_workspaces"));
                this.$("li[data-type=all] .check").removeClass("hidden");
                this.$("li[data-type=active] .check").addClass("hidden");
            } else {
                this.$(".link_menu > a span").text(t("filter.active_workspaces"));
                this.$("li[data-type=active] .check").removeClass("hidden");
                this.$("li[data-type=all] .check").addClass("hidden");
            }
        }
    });
})(jQuery, chorus);
