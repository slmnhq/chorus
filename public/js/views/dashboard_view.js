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

            this.dashboardMain = new ns.views.MainContentView({
                contentHeader : ns.views.StaticTemplate("default_content_header", {title : "Dashboard"}),
                content : ns.views.StaticTemplate("plain_text", {text : ""})
            });
        },

        postRender : function(){
            $(this.el).append($(this.workspaceList.render().el).addClass("workspace_list"));
            $(this.el).append($(this.dashboardMain.render().el).addClass("dashboard_main"));
        }
    });
})(jQuery, chorus);
