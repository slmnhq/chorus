chorus.pages.Bare = chorus.views.Bare.extend({
    bindCallbacks:function () {
        if (chorus.user) this.bindings.add(chorus.user, "change", this.render);
    }
});

chorus.pages.Base = chorus.pages.Bare.extend({
    className:"logged_in_layout",

    events:{
        "click button.dialog":"createDialog",
        "click a.dialog":"createDialog",
        "click a.alert":"createAlert"
    },

    subviews:{
        "#header":"header",
        "#main_content":"mainContent",
        "#breadcrumbs":"breadcrumbs",
        "#sidebar":"sidebar",
        "#sub_nav":"subNav"
    },

    setupSubviews:function () {
        this.header = this.header || new chorus.views.Header();
        this.breadcrumbs = this.breadcrumbs || new chorus.views.BreadcrumbsView({
            breadcrumbs:_.isFunction(this.crumbs) ? this.crumbs() : this.crumbs
        });
    },

    createDialog:function (e) {
        e.preventDefault();
        var button = $(e.target);
        var dialog = new chorus.dialogs[button.data("dialog")]({ launchElement:button, pageModel:this.model, pageCollection:this.collection });
        dialog.launchModal();
    },

    createAlert:function (e) {
        e.preventDefault();
        var launchElement = $(e.target);
        var alert = new chorus.alerts[launchElement.data("alert")]({launchElement:launchElement, pageModel:this.model, pageCollection:this.collection });
        alert.launchModal();
    }
})