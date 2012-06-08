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

    render: function() {

        if (this.model.get("hasAddedMember") == true &&
            this.model.get("hasAddedSandbox") == true &&
            this.model.get("hasAddedWorkfile") == true &&
            this.model.get("hasChangedSettings") == true) {

            chorus.router.navigate("/workspaces/" + this.model.id);
        }

        this._super("render", arguments);
    },

    visitShowPage: function(e) {
        var quickstart = new chorus.models.WorkspaceQuickstart({
            workspaceId: this.model.get("id")
        });
        quickstart.destroy();

        e && e.preventDefault();
        chorus.router.navigate($(e.currentTarget).attr("href"));
    }
});
