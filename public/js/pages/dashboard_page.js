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

//          chorus.session.user().bind("change", this.workspaceSet.fetchAll); //why don't I work in chrome?
            chorus.session.user().bind("change", fetchWorkspaceSet, this);


            this.mainContent = new ns.views.Dashboard({collection : this.workspaceSet})
        }
    });

    function fetchWorkspaceSet() {
        this.workspaceSet.fetch()
    }
})(jQuery, chorus);