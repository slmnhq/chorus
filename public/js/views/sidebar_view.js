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

        var sidebar = $(this.el).closest("#sidebar")
        sidebar.removeAttr("style")
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

        $("#sidebar_wrapper").find(".jump_to_top").bind("click", function (e) {
            $(this).siblings("#sidebar_nano").nanoScroller({scroll:'top'});
            $("#sidebar").find(".lb-wrap").scrollTop(0);
            $(this).removeClass("clickable");
        });
    },

    setupSidebarScrolling:function () {
        var sidebar = $(this.el).closest("#sidebar_nano");
        if (sidebar) {
            sidebar.nanoScroller();
            sidebar.find('.nano_content').unbind('mousewheel').bind('mousewheel', this.onMouseWheel)
            sidebar.find('.jump_to_top').unbind('mousewheel').bind('mousewheel', this.onJumpMouseWheel)
        }
    },

    onMouseWheel:function (event, d) {
        $("#sidebar_wrapper").find(".jump_to_top").toggleClass("clickable", this.scrollTop > 10);

        if ((this.scrollTop === 0 && d > 0)) {
            event.preventDefault();
        } else if ((this.clientHeight + this.scrollTop >= this.scrollHeight) && d < 0) {
            event.preventDefault();
        }

        return true;
    },

    onJumpMouseWheel:function (event) {
        event.preventDefault();
    }
}); 