chorus.views.WorkspaceQuickstart = chorus.views.Base.extend({
    constructorName: "WorkspaceQuickstartView",
    className: "workspace_quickstart",
    additionalClass: "workspace_show",
    useLoadingSection: true,

    events: {
        "click .info_box a": "hideBox"
    },

    additionalContext: function() {
        return {
            workspaceUrl: this.model.showUrl()
        }
    },

    hideBox : function(e) {
        $(e.currentTarget).closest(".info_box").addClass("hidden");
    }

});
