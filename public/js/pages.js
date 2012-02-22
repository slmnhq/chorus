chorus.pages.Bare = chorus.views.Bare.extend({
    bindCallbacks: function() {
        if (chorus.user) this.bindings.add(chorus.user, "change", this.render);
        $(window).bind("resize", _.bind(function() {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(_.bind(function() {
                this.trigger("resized")
            }, this), 100);
        }, this));
    }
});

chorus.pages.Base = chorus.pages.Bare.extend({
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
        this.header = this.header || new chorus.views.Header();
        this.breadcrumbs = this.breadcrumbs || new chorus.views.BreadcrumbsView({
            breadcrumbs: _.isFunction(this.crumbs) ? this.crumbs() : this.crumbs
        });
    },

    createDialog: function(e) {
        e.preventDefault();
        var button = $(e.target).closest("button, a");
        var dialog = new chorus.dialogs[button.data("dialog")]({ launchElement: button, pageModel: this.model, pageCollection: this.collection });
        dialog.launchModal();
    },

    createAlert: function(e) {
        e.preventDefault();
        var launchElement = $(e.target).closest("button, a");
        var alert = new chorus.alerts[launchElement.data("alert")]({launchElement: launchElement, pageModel: this.model, pageCollection: this.collection });
        alert.launchModal();
    },

    showHelp: function(e) {
        e.preventDefault();
        chorus.help();
    }
})