;(function($, ns) {
    ns.WorkspaceShowPage = chorus.pages.Base.extend({
        crumbs : function() {
            return [
                { label: t("breadcrumbs.home"), url: "/" },
                { label: this.model.get("name") }
            ]
        },

        setup : function(args) {
            this.model = new chorus.models.Workspace({id : args[0]});
            this.model.fetch();
            this.mainContent = new chorus.views.SubNavContent({modelClass : "Workspace", tab : "summary", model : this.model});
        }
    });
})(jQuery, chorus.pages);