;(function($, ns) {
    ns.pages.WorkfileShowPage = ns.pages.Base.extend({
        setup : function(workspaceId, workfileId) {
            this.workspace = new chorus.models.Workspace({id: workspaceId});
            this.workspace.fetch();
            this.model = new chorus.models.Workfile({workfileId: workfileId, workspaceId: workspaceId});
            this.model.fetch();

            this.breadcrumbs = new chorus.views.WorkspaceBreadcrumbsView({model: this.workspace});

            this.mainContent = new chorus.views.SubNavContentView({ 
                modelClass : "Workfile",
                tab : "summary",
                model : this.model,
                content : new chorus.views.StaticTemplate("plain_text", {text : t("users.details")})
            });
            
            // this.sidebar = new chorus.views.WorkfileListSidebar({model : workspace});
            // this.mainContent.content.bind("workfile:selected", function(workfileId) {
            //     this.sidebar.trigger("workfile:selected", workfileId)
            // }, this);
        }
    });


})(jQuery, chorus);
