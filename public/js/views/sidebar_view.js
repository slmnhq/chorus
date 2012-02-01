chorus.views.Sidebar = chorus.views.Base.extend({
    preRender:function () {
        this._super("preRender", arguments);

        // We don't want to deal with having multiple declarations of `events`,
        // so we unbind click in preRender and bind it in postRender.
        $("#sidebar_wrapper").find(".jump_to_top").unbind("click");

        if (this.subviews && !this.subviewsBound) {
            _.each(this.subviews, _.bind(function (property, selector) {
                var view = this.getSubview(property);
                if (view) {
                    view.bind("rendered", this.setupSidebarScrolling, this)
                }
            }, this));
            this.subviewsBound = true;
        }
    },

    template:function () {
        var result = this._super('template', arguments);
        return "<div class='spacer'/>" + result;
    },

    postRender:function () {
        this._super('postRender');

        this.setupSidebarScrolling();

        var resizeTimer;

        // avoid rapid-fire resize events
        //
        $(window).resize(_.bind(function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(_.bind(function () {
                this.setupSidebarScrolling();
            }, this), 100);
        }, this));

        $("#sidebar_wrapper .jump_to_top").bind("click", function (e) {
            var api = $("#sidebar").data("jsp")
            if (api) {
                api.scrollTo(0, 0);
                $(this).removeClass("clickable");
            }
        });
    },

    setupSidebarScrolling:function () {
        var sidebar = $("#sidebar")
        if (sidebar) {
            var api = sidebar.data("jsp");
            if (api) {
                api.reinitialise();
            } else {
                sidebar.jScrollPane();
                sidebar.find('.jspContainer').unbind('mousewheel', this.onMouseWheel).bind('mousewheel', this.onMouseWheel)
                sidebar.siblings('.jump_to_top').unbind('mousewheel').bind('mousewheel', this.onJumpMouseWheel)

                sidebar.unbind('hover').hover(function () {
                    sidebar.find('.jspVerticalBar, .jspHorizontalBar').fadeIn(150)
                }, function () {
                    sidebar.find('.jspVerticalBar, .jspHorizontalBar').fadeOut(150)
                });
            }


            sidebar.find('.jspVerticalBar, .jspHorizontalBar').fadeOut(0)
        }
    },

    onMouseWheel:function (event, d) {
        var api = $("#sidebar").data("jsp")
        $("#sidebar_wrapper .jump_to_top").toggleClass("clickable", api.getContentPositionY() > 10);
        event.preventDefault();
        return true;
    },

    onJumpMouseWheel:function (event) {
        event.preventDefault();
    }
}); 