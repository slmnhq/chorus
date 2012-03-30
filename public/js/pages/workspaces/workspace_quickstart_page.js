chorus.pages.WorkspaceQuickstartPage = chorus.pages.WorkspaceShowPage.extend({

    setup: function() {
        this._super("setup", arguments);
        this.mainContent.content = new chorus.views.WorkspaceQuickstart({model: this.model});
        this.mainContent.contentHeader = new chorus.views.WorkspaceQuickstartHeader({model: this.model});
    }
});