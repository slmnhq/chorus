;
(function($, ns) {
    ns.pages.DashboardPage = ns.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home") }
        ],

        setup : function(){
            this.collection = this.workspaceSet = new ns.models.WorkspaceSet();
            this.workspaceSet.attributes.active = true;
            this.workspaceSet.attributes.user = chorus.session.user();
            this.workspaceSet.sortAsc("name");
            this.workspaceSet.fetchAll();

//          chorus.session.user().bind("change", this.workspaceSet.fetchAll); //why don't I work in chrome?
            chorus.session.user().bind("change", fetchWorkspaceSet, this);


            this.mainContent = new ns.views.Dashboard({collection : this.workspaceSet})
        }
    });

    function fetchWorkspaceSet() {
        this.workspaceSet.fetchAll()
    }
})(jQuery, chorus);