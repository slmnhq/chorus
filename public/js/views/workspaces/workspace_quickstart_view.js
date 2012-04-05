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

    setup: function() {
        chorus.PageEvents.subscribe("modal:closed", this.dismissQuickStart, this);
        this.clickedDialogs = [];
    },

    postRender: function() {
        _.each(this.clickedDialogs, function(dialogType) {
            this.getContainingBox(this.$("a[data-dialog=" + dialogType + "]")).addClass("hidden");
        }, this);
    },

    hideBox : function(e) {
        var link = $(e.currentTarget);
        var clickedBox = this.getContainingBox(link);
        this.clickedDialogs.push(link.data("dialog"));
        clickedBox.addClass("hidden");
    },

    getContainingBox: function(link) {
        return link.closest(".info_box");
    },

    dismissQuickStart: function() {
        var allHidden = _.all(this.$(".info_box"), function(node) {
            return $(node).hasClass("hidden");
        });

        if(allHidden) {
            chorus.router.navigate(this.model.showUrl(), true);
        }
    }
});
