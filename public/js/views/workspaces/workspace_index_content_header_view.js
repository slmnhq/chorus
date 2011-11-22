;(function($, ns) {
    ns.views.WorkspaceIndexContentHeader = ns.views.Base.extend({
        className : "workspace_index_content_header",
        events : {
            "click .link.filter a" : "togglePopup",
            "click .menu.popup_filter li[data-type=active] a" : "triggerActive",
            "click .menu.popup_filter li[data-type=all] a" : "triggerAll"
        },

        setup: function() {
            this.triggerActive();
        },

        postRender: function() {
            this.updateFilterMenu();
        },

        togglePopup : function(e){
            e.preventDefault();
            this.$(".menu").toggleClass("hidden");
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
                this.$(".link.filter a span").text(t("filter.all_workspaces"));
                this.$("li[data-type=all] .check").removeClass("hidden");
                this.$("li[data-type=active] .check").addClass("hidden");
            } else {
                this.$(".link.filter a span").text(t("filter.active_workspaces"));
                this.$("li[data-type=active] .check").removeClass("hidden");
                this.$("li[data-type=all] .check").addClass("hidden");
            }
        }
    });
})(jQuery, chorus);
