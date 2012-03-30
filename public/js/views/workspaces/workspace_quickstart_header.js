chorus.views.WorkspaceQuickstartHeader = chorus.views.Base.extend({
    constructorName: "WorkspaceQuickstartHeaderView",
    className: "workspace_quickstart_header",

    additionalContext: function() {
        return {
            iconUrl: this.model.defaultIconUrl()
        }
    }
});