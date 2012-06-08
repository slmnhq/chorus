chorus.views.WorkspaceQuickstart = chorus.views.Base.extend({
    constructorName: "WorkspaceQuickstartView",
    templateName: "workspace_quickstart",
    additionalClass: "workspace_show",
    useLoadingSection: true,

    events: {
        "click a.dismiss": "visitShowPage"
    },

    additionalContext: function() {
        return {
            workspaceUrl: this.model.showUrl(),
            needsMember: !this.model.get("hasAddedMember"),
            needsWorkfile: !this.model.get("hasAddedWorkfile"),
            needsSandbox: !this.model.get("hasAddedSandbox"),
            needsSettings: !this.model.get("hasChangedSettings")
        }
    },

    setup: function() {
        chorus.PageEvents.subscribe("modal:closed", this.dismissQuickStart, this);
        this.clickedDialogs = [];
    },

    dismissQuickStart: function() {
        this.model.fetch();
    },

    visitShowPage: function(e) {
        e && e.preventDefault();
        // TODO: set all 4 has_.. to true?
        chorus.router.navigate($(e.currentTarget).attr("href"));
    }
});
