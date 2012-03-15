chorus.views.Sidebar = chorus.views.Base.extend({
    constructorName: "SidebarView",

    events: {
        'click #sidebar_wrapper .jump_to_top': 'jumpToTop'
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

        if (chorus.isDevMode) {
            $("#sidebar_wrapper").attr("data-sidebar-template", this.className);
        }
    },

    jumpToTop: function(e) {
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