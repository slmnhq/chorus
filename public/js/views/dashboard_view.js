chorus.views.Dashboard = chorus.views.Base.extend({
    className:"dashboard",

    setup:function () {
        this.workspaceList = new chorus.views.MainContentView({
            collection: this.collection,
            contentHeader:chorus.views.StaticTemplate("default_content_header", {title:t("header.my_workspaces")}),
            contentDetails:new chorus.views.StaticTemplate("dashboard_workspace_list_content_details"),
            content:new chorus.views.DashboardWorkspaceList({ collection: this.collection })
        });

        this.instanceList = new chorus.views.MainContentView({
            collection: this.options.instanceSet,
            contentHeader: chorus.views.StaticTemplate("default_content_header", {title:t("header.browse_data")}),
            contentDetails: new chorus.views.StaticTemplate("dashboard_workspace_list_content_details"),
            content: new chorus.views.DashboardInstanceList({ collection: this.options.instanceSet })
        });

        var activities = chorus.session.user().activities('home');
        activities.fetch();
        this.activityList = new chorus.views.ActivityList({
            collection:activities,
            headingText:t("dashboard.activity"),
            additionalClass:"dashboard"
        });

        this.dashboardMain = new chorus.views.MainContentView({
            contentHeader:chorus.views.StaticTemplate("default_content_header", {title:t("dashboard.activity")}),
            content:this.activityList
        });
    },

    subviews:{
        '.dashboard_main': "dashboardMain",
        '.instance_list': "instanceList",
        '.workspace_list': "workspaceList"
    }
});

