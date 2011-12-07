;
(function($, ns) {
    ns.pages.DashboardPage = ns.pages.Base.extend({
        crumbs : [
            { label: t("breadcrumbs.home") }
        ],

        setup : function(){
            this.collection = new ns.models.WorkspaceSet();
            this.collection.attributes.active = true;
            this.collection.attributes.membersOnly = true;
            this.collection.fetchAll();

            this.mainContent = new ns.views.MainContentView({
                contentHeader : ns.views.StaticTemplate("default_content_header", {title : t("header.my_workspaces")}),
                content : new ns.views.WorkspaceList({collection : this.collection})
            });
        }
    });

})(jQuery, chorus);