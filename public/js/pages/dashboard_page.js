;
(function($, ns) {
    ns.pages.DashboardPage = ns.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home") }
        ],

        setup : function(){
            this.collection = this.workspaceSet = new ns.models.WorkspaceSet();
            this.workspaceSet.attributes.showLatestComments = true;
            this.workspaceSet.sortAsc("name");
            this.workspaceSet.fetch();

            this.model = chorus.session.user();

            this.mainContent = new ns.views.Dashboard({collection : this.workspaceSet})
        },

        postRender : function() {
            this._super('postRender');
            this.$("#sidebar_wrapper").remove();
        }
    });

})(jQuery, chorus);
