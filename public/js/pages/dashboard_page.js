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

        this.userSet = new chorus.collections.UserSet();
        this.userSet.bindOnce("loaded", function() {
            this.userCount = this.userSet.pagination.records;
            this.showUserCount()
        }, this);
        this.userSet.fetch();
    },

    showUserCount: function() {
        if (this.userCount) {
            this.$("#user_count a").text(t("dashboard.user_count", {count: this.userCount}));
            this.$("#user_count").removeClass("hidden");
        }
    },

    postRender:function () {
        this._super('postRender');
        this.$("#sidebar_wrapper").remove();
        this.showUserCount();
    }
});
