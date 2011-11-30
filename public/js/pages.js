(function(ns) {

    ns.Bare = chorus.views.Bare.extend({
        bindCallbacks: function() {
            if (chorus.user) chorus.user.bind("change", this.render);
        }
    })

    ns.Base = ns.Bare.extend({
        className : "logged_in_layout",

        events : {
            "click button.dialog" : "createDialog",
            "click a.dialog" : "createDialog",
            "click a.alert" : "createAlert"
        },

        postRender : function() {
            this.header = this.header || new chorus.views.Header();
            this.header.el = this.$("#header");
            this.header.delegateEvents();
            this.header.render();

            this.mainContent.el = this.$("#main_content");
            this.mainContent.delegateEvents();
            this.mainContent.render();

            this.breadcrumbs = this.breadcrumbs || new chorus.views.BreadcrumbsView({breadcrumbs: _.isFunction(this.crumbs) ? this.crumbs() : this.crumbs })
            this.breadcrumbs.el = this.$("#breadcrumbs")
            this.breadcrumbs.delegateEvents();
            this.breadcrumbs.render();

            //do we make a default sidebar?
            if (this.sidebar) {
                this.sidebar.el = this.$("#sidebar")
                this.sidebar.delegateEvents()
                this.sidebar.render();
            }

            if (this.subNav) {
                this.$("#sub_nav").replaceWith(this.subNav.render().el);
            }
        },

        createDialog : function(e) {
            e.preventDefault();
            var button = $(e.target);
            var dialog = new chorus.dialogs[button.data("dialog")]({launchElement : button });
            dialog.launchModal();
        },

        createAlert : function(e) {
            e.preventDefault();
            var launchElement = $(e.target);
            var alert = new chorus.alerts[launchElement.data("alert")]({launchElement : launchElement});
            alert.launchModal();
        }
    })

})(chorus.pages)
