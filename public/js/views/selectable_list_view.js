chorus.views.SelectableList = chorus.views.Base.extend({
    additionalClass: "list",
    tagName: "ul",

    delegateEvents: function() {
        this._super("delegateEvents", arguments);
        $(this.el).on("click", "ul.list > li", null, _.bind(this.selectItem, this));
    },

    selectItem: function(e) {
        var $target = $(e.currentTarget);
        if ($target.hasClass("selected")) {
            return;
        }

        var $lis = this.$("> li");
        $lis.removeClass("selected");
        $target.addClass("selected");

        this.itemSelected(this.collection.at($lis.index($target)));
    },

    postRender: function() {
        this.$(">li:eq(0)").click();
    }
});