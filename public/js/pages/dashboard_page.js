chorus.pages.DashboardPage = chorus.pages.Base.extend({
    crumbs:[
        { label:t("breadcrumbs.home") }
    ],
    helpId: "dashboard",

    setup:function () {
        this.collection = this.workspaceSet = new chorus.collections.WorkspaceSet();
        this.workspaceSet.attributes.showLatestComments = true;
        this.workspaceSet.sortAsc("name");
        this.workspaceSet.fetch();

        this.instanceSet = new chorus.collections.InstanceSet([], {hasCredentials: true});
        this.instanceSet.fetch();

        this.model = chorus.session.user();

        this.mainContent = new chorus.views.Dashboard({ collection: this.workspaceSet, instanceSet: this.instanceSet });
    },

    postRender:function () {
        this._super('postRender');
        this.$("#sidebar_wrapper").remove();
    }
});
