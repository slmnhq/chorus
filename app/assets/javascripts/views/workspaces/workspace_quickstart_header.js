chorus.views.WorkspaceQuickstartHeader = chorus.views.Base.extend({
    constructorName: "WorkspaceQuickstartHeaderView",
    templateName: "workspace_quickstart_header",

    additionalContext: function() {
        return {
            iconUrl: this.model.defaultIconUrl()
        }
    }
});