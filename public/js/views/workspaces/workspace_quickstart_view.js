chorus.views.WorkspaceQuickstart = chorus.views.Base.extend({
    constructorName: "WorkspaceQuickstartView",
    className: "workspace_quickstart",
    additionalClass: "workspace_show",
    useLoadingSection: true,

    additionalContext: function() {
        return {
            workspaceUrl: this.model.showUrl()
        }
    }
});
