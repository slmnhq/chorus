chorus.views.Sidebar = chorus.views.Base.extend({
    constructorName: "SidebarView",
    preRender:function () {
        this._super("preRender", arguments);

        // We don't want to deal with having multiple declarations of `events`,
        // so we unbind click in preRender and bind it in postRender.
        $("#sidebar_wrapper").find(".jump_to_top").unbind("click");
    },

    template: function() {
        var result = this._super('template', arguments);
        return "<div class='spacer'/>" + result;
    },

    postRender: function() {
        this._super('postRender');

        var sidebar = $(this.el).closest("#sidebar");
        this.setupScrolling(sidebar, {
            contentWidth: sidebar.width()
        });

        $("#sidebar_wrapper .jump_to_top").bind("click", _.bind(this.jumpToTop, this));

        if (chorus.isDevMode) {
            $("#sidebar_wrapper").attr("data-sidebar-template", this.className);
        }
    },

    jumpToTop: function(e) {
        e.preventDefault()
        var api = $("#sidebar").data("jsp");
        if (api) {
            api.scrollTo(0, 0);
            $(e.currentTarget).removeClass("clickable");
        }
    },

    onMouseWheel: function(event, d) {
        var api = $("#sidebar").data("jsp")
        $("#sidebar_wrapper .jump_to_top").toggleClass("clickable", api.getContentPositionY() > 10);
        event.preventDefault();
        return true;
    },

    recalculateScrolling: function() {
        this._super("recalculateScrolling", [$(this.el).closest(".custom_scroll")])
    }
});