;(function($, ns) {
    ns.pages.WorkfileShowPage = ns.pages.Base.extend({
        setup : function(workspaceId, workfileId) {
            this.workspace = new ns.models.Workspace({id: workspaceId});
            this.workspace.fetch();
            this.model = new ns.models.Workfile({id: workfileId, workspaceId: workspaceId});
            this.model.bind("change", this.modelChanged, this);
            this.model.fetch();

            this.breadcrumbs = new ns.views.WorkspaceBreadcrumbsView({model: this.workspace});

            this.sidebar = new chorus.views.WorkfileShowSidebar({model : this.model });
            
            this.subNav = new ns.views.SubNav({workspace: this.workspace, tab: "workfiles"});

            this.mainContent = new ns.views.MainContentView({
                model : this.model,
                contentHeader : new ns.views.WorkfileHeader({model : this.model})
            });
        },

        modelChanged : function() {
            if (!this.mainContent.contentDetails) {
                this.mainContent.contentDetails = ns.views.WorkfileContentDetails.buildFor(this.model);
                this.mainContent.content = ns.views.WorkfileContent.buildFor(this.model);
                this.mainContent.contentDetails.forwardEvent("file:save", this.mainContent.content);
                this.mainContent.contentDetails.forwardEvent("file:edit", this.mainContent.content);
            }

            this.render();
        }
    });

    ns.views.WorkfileHeader = ns.views.Base.extend({
        className : "workfile_header",
        additionalContext : function() {
            return {
                iconUrl : this.model.get("fileType") && chorus.urlHelpers.fileIconUrl(this.model.get("fileType"))
            };
        }
    })

})(jQuery, chorus);
