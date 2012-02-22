chorus.views.Dashboard = chorus.views.Base.extend({
    className:"dashboard",
    subviews: {
        '.dashboard_main': "dashboardMain",
        '.instance_list': "instanceList",
        '.workspace_list': "workspaceList"
    },

    setup: function() {
        this.workspaceList = new chorus.views.MainContentView({
            collection: this.collection,
            contentHeader:chorus.views.StaticTemplate("default_content_header", {title:t("header.my_workspaces")}),
            contentDetails:new chorus.views.StaticTemplate("dashboard_workspace_list_content_details"),
            content:new chorus.views.DashboardWorkspaceList({ collection: this.collection })
        });

        this.instanceList = new chorus.views.MainContentView({
            collection: this.options.instanceSet,
            contentHeader: chorus.views.StaticTemplate("default_content_header", {title:t("header.browse_data")}),
            contentDetails: new chorus.views.StaticTemplate("dashboard_instance_list_content_details"),
            content: new chorus.views.DashboardInstanceList({ collection: this.options.instanceSet })
        });

        var activities = chorus.session.user().activities('home');

        activities.fetch();
        this.activityList = new chorus.views.ActivityList({
            collection: activities,
            suppressHeading: true,
            additionalClass: "dashboard"
        });

        this.dashboardMain = new chorus.views.MainContentView({
            contentHeader: new chorus.views.DashboardContentHeader(),
            content: this.activityList
        });

        this.dashboardMain.contentHeader.bind("filter:insights", activities.filterInsights, activities);
        this.dashboardMain.contentHeader.bind("filter:all",      activities.filterAll,      activities);
    }
});

