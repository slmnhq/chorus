chorus.pages.WorkspaceQuickstartPage = chorus.pages.WorkspaceShowPage.extend({

    setup: function() {
        this._super("setup", arguments);
        this.mainContent.content = new chorus.views.WorkspaceQuickstart({model: this.model});
    }
});