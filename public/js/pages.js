(function(ns) {

    ns.Bare = chorus.views.Bare.extend({
        bindCallbacks: function() {
            if (chorus.user) chorus.user.bind("change", this.render);
        }
    });

    ns.Base = ns.Bare.extend({
        className : "logged_in_layout",

        events : {
            "click button.dialog" : "createDialog",
            "click a.dialog" : "createDialog",
            "click a.alert" : "createAlert"
        },

        postRender : function() {
            this.header = this.header || new chorus.views.Header();
            this.$("#header").replaceWith($(this.header.render().el).attr("id", "header"));

            this.$("#main_content").replaceWith($(this.mainContent.render().el).attr("id", "main_content"));

            this.breadcrumbs = this.breadcrumbs || new chorus.views.BreadcrumbsView({breadcrumbs: _.isFunction(this.crumbs) ? this.crumbs() : this.crumbs });
            this.$("#breadcrumbs").replaceWith($(this.breadcrumbs.render().el).attr("id", "breadcrumbs"));

            if (this.sidebar) {
                this.$("#sidebar").replaceWith($(this.sidebar.render().el).attr("id", "sidebar"));
            }

            if (this.subNav) {
                this.$("#sub_nav").replaceWith($(this.subNav.render().el).attr("id", "sub_nav"));
            }
        },

        createDialog : function(e) {
            e.preventDefault();
            var button = $(e.target);
            var dialog = new chorus.dialogs[button.data("dialog")]({ launchElement : button});
            dialog.attachPageModel(this.model);
            dialog.launchModal();
        },

        createAlert : function(e) {
            e.preventDefault();
            var launchElement = $(e.target);
            var alert = new chorus.alerts[launchElement.data("alert")]({launchElement : launchElement, pageModel : this.model});
            alert.attachPageModel(this.model);
            alert.launchModal();
        }
    })

})(chorus.pages)
