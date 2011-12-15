;
(function($, ns) {
    ns.views.Dashboard = ns.views.Base.extend({
        className : "dashboard",

        setup : function() {
            this.workspaceList = new ns.views.MainContentView({
                collection : this.collection,
                contentHeader : ns.views.StaticTemplate("default_content_header", {title : t("header.my_workspaces")}),
                content : new ns.views.DashboardWorkspaceList({collection : this.collection}),
                contentFooter : new ns.views.StaticTemplate("dashboard_workspace_list_footer")
            });

            var activities = chorus.session.user().activities();
            activities.fetch();
            this.activityList = new ns.views.ActivityList({ collection : activities, activityType: t("dashboard.activity"), additionalClass : "dashboard"});

            this.dashboardMain = new ns.views.MainContentView({
                contentHeader : ns.views.StaticTemplate("default_content_header", {title : t("dashboard.activity")}),
                content : this.activityList
            });
        },

        subviews: {
            '.dashboard_main': "dashboardMain",
            '.workspace_list': "workspaceList"
        }
    });
})(jQuery, chorus);
