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
    }

});
