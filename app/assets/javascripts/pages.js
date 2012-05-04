chorus.pages.Bare = chorus.views.Bare.extend({
    el: 'body',

    bindCallbacks: function() {
        if (chorus.user) this.bindings.add(chorus.user, "change", this.render);
    },

    requiredResourcesFetchNotFound: function() {
        chorus.pageOptions = this.failurePageOptions();
        Backbone.history.loadUrl("/invalidRoute");
    },

    requiredResourcesFetchForbidden: function() {
        chorus.pageOptions = this.failurePageOptions();
        Backbone.history.loadUrl("/unauthorized");
    },

    dependOn: function(model, functionToCallWhenLoaded) {
        this.bindings.add(model, "fetchNotFound", this.requiredResourcesFetchNotFound);
        this.bindings.add(model, "fetchForbidden", _.bind(this.requiredResourcesFetchForbidden, this, model));
        this.bindings.add(model, "change", this.render);
        if (functionToCallWhenLoaded) {
            if (model.loaded) {
                functionToCallWhenLoaded.apply(this);
            } else {
                this.bindings.add(model, "loaded", functionToCallWhenLoaded);
            }
        }
    },

    failurePageOptions: function() {}
});

chorus.pages.Base = chorus.pages.Bare.extend({
    constructorName: "Page",
    templateName: "logged_in_layout",

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
        this.breadcrumbs = new chorus.views.BreadcrumbsView({
            breadcrumbs: _.isFunction(this.crumbs) ? this.crumbs() : this.crumbs
        });
    },

    showHelp: function(e) {
        e.preventDefault();
        chorus.help();
    }
})
