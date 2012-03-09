chorus.views.SelectableList = chorus.views.Base.extend({
    additionalClass: "list",
    tagName: "ul",

    delegateEvents: function() {
        this._super("delegateEvents", arguments);
        $(this.el)
            .off("click." + this.cid)
            .on("click." + this.cid, "ul.list > li", null, _.bind(this.listItemClicked, this));
    },

    listItemClicked: function(e) {
        this.selectItem($(e.currentTarget));
    },

    selectItem: function($target) {
        if ($target.hasClass("selected")) {
            return;
        }

        var $lis = this.$("> li");
        $lis.removeClass("selected");
        $target.addClass("selected");

        this.itemSelected(this.collection.at($lis.index($target)));
    },

    postRender: function() {
        this.selectItem(this.$(">li:eq(0)"));
    }
});