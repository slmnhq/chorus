chorus.pages.WorkspaceQuickstartPage = chorus.pages.WorkspaceShowPage.extend({

    setup: function() {
        // set property to prevent parent page object from infinitely looping
        this.quickstartNavigated = true;
        this._super("setup", arguments);
        this.mainContent.content = new chorus.views.WorkspaceQuickstart({model: this.model});
        this.mainContent.contentHeader = new chorus.views.WorkspaceQuickstartHeader({model: this.model});
    }
});