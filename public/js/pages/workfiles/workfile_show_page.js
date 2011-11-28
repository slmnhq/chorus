;(function($, ns) {
    ns.pages.WorkfileShowPage = ns.pages.Base.extend({
        setup : function(workspaceId, workfileId) {
            this.workspace = new ns.models.Workspace({id: workspaceId});
            this.workspace.fetch();
            this.model = new ns.models.Workfile({id: workfileId, workspaceId: workspaceId});
            this.model.fetch();

            this.breadcrumbs = new ns.views.WorkspaceBreadcrumbsView({model: this.workspace});

            this.subNav = new ns.views.SubNav({workspace: this.workspace, tab: "workfiles"});

            this.mainContent = new ns.views.MainContentView({
                model : this.model,
                contentHeader : new ns.views.WorkfileHeader({model : this.model}),
                contentDetails : new ns.views.WorkfileContentDetails({model : this.model}),
                content : new ns.views.StaticTemplate("plain_text", {text : t("users.details")})
            });
        }
    });

    ns.views.WorkfileHeader = ns.views.Base.extend({
        className : "workfile_header",
        additionalContext : function() {
            return {
                iconUrl : this.model.get("fileName") && chorus.urlHelpers.fileIconUrl(_.last(this.model.get("fileName").split('.')))
            };
        }
    })

    ns.views.WorkfileContentDetails = ns.views.Base.extend({
        className : "workfile_content_details"
    })

})(jQuery, chorus);
