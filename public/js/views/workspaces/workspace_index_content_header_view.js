;(function($, ns) {
    ns.views.WorkspaceIndexContentHeader = ns.views.Base.extend({
        className : "workspace_index_content_header",
        events : {
            "click .link.filter a" : "togglePopup",
            "click .menu.popup_filter a[data-type=active]" : "triggerActive",
            "click .menu.popup_filter a[data-type=all]" : "triggerAll"
        },

        togglePopup : function(e){
            e.preventDefault();
            this.$(".menu").toggleClass("hidden");
        },

        triggerActive: function(e) {
            e.preventDefault();
            this.trigger("filter:active");
            this.$(".menu").addClass("hidden");
            this.$(".link.filter a span").text(t("filter.active_workspaces"));
        },

        triggerAll: function(e) {
            e.preventDefault();
            this.trigger("filter:all");
            this.$(".menu").addClass("hidden");
            this.$(".link.filter a span").text(t("filter.all_workspaces"));
        }
    });
})(jQuery, chorus);
