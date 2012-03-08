chorus.pages.Bare = chorus.views.Bare.extend({
    bindCallbacks: function() {
        if (chorus.user) this.bindings.add(chorus.user, "change", this.render);
    }
});

chorus.pages.Base = chorus.pages.Bare.extend({
    constructorName: "Page",

    className: "logged_in_layout",

    subviews: {
        "#header": "header",
        "#main_content": "mainContent",
        "#breadcrumbs": "breadcrumbs",
        "#sidebar .sidebar_content.primary": "sidebar",
        "#sidebar .sidebar_content.secondary": "secondarySidebar",
        "#sub_nav": "subNav"
    },

    setupSubviews: function() {
        this.header = this.header || new chorus.views.Header({ workspaceId: this.workspaceId });
        this.breadcrumbs = this.breadcrumbs || new chorus.views.BreadcrumbsView({
            breadcrumbs: _.isFunction(this.crumbs) ? this.crumbs() : this.crumbs
        });
    },

    showHelp: function(e) {
        e.preventDefault();
        chorus.help();
    }
})
