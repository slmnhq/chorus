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

        subviews : {
            "#header": "header",
            "#main_content": "mainContent",
            "#breadcrumbs" : "breadcrumbs",
            "#sidebar" : "sidebar",
            "#sub_nav" : "subNav"
        },

        preInitialize : function() {
            this.bind("sidebarRendered", this.sidebarRendered, this);
        },

        postRender : function() {
            var resizeTimer;

            // avoid rapid-fire resize events
            //
            $(window).resize(_.bind(function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(_.bind(function() {
                    this.handleSidebarResize()
                }, this), 250);
            }, this));

            // delay the post-render scrollbar setup to allow the browser to finish measuring things
            //
            setTimeout(_.bind(function() {
                this.setupSidebarScrolling();
            }, this), 250)
        },

        setupSidebarScrolling : function() {
            var sidebar = this.$("#sidebar");
            if (sidebar.length > 0) {

                var oldPosition = sidebar.css("position");

                sidebar.lionbars();

                sidebar.css('position', oldPosition);

                sidebar.unbind('hover').hover(function() {
                    sidebar.find('.lb-v-scrollbar, .lb-h-scrollbar').fadeIn(150)
                }, function() {
                    sidebar.find('.lb-v-scrollbar, .lb-h-scrollbar').fadeOut(150)
                });

                sidebar.find('.lb-v-scrollbar, .lb-h-scrollbar').hide();

                sidebar.find('.lb-wrap').unbind('mousewheel').bind('mousewheel', function(event, d) {
                    if ((this.scrollTop === 0 && d > 0)) {
                        event.preventDefault();
                    } else if ((this.clientHeight + this.scrollTop >= this.scrollHeight) && d < 0) {
                        event.preventDefault();
                    }
                })
            }
        },

        handleSidebarResize : function() {
            this.setupSidebarScrolling();
        },

        sidebarRendered : function() {
            this.setupSidebarScrolling();
        },

        setupSubviews : function() {
            this.header = this.header || new chorus.views.Header();
            this.breadcrumbs = this.breadcrumbs || new chorus.views.BreadcrumbsView({
                breadcrumbs: _.isFunction(this.crumbs) ? this.crumbs() : this.crumbs
            });
        },

        createDialog : function(e) {
            e.preventDefault();
            var button = $(e.target);
            var dialog = new chorus.dialogs[button.data("dialog")]({ launchElement : button, pageModel : this.model, pageCollection : this.collection });
            dialog.launchModal();
        },

        createAlert : function(e) {
            e.preventDefault();
            var launchElement = $(e.target);
            var alert = new chorus.alerts[launchElement.data("alert")]({launchElement : launchElement, pageModel : this.model, pageCollection : this.collection });
            alert.launchModal();
        }
    })

})(chorus.pages)
