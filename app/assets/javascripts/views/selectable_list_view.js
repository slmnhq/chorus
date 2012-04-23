chorus.views.SelectableList = chorus.views.Base.extend({
    additionalClass: "selectable list",
    tagName: "ul",

    setup: function() {
        this.selectedIndex = 0;
        this.collection.bind("paginate", function() {
            this.selectedIndex = 0;
        }, this);

        if(this.eventName) {
            chorus.PageEvents.subscribe(this.eventName + ":search", function() {
                this.selectItem(this.$("li:not(:hidden)").eq(0));
            }, this);
        }
    },

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
        var $lis = this.$(">li");
        $lis.removeClass("selected");
        $target.addClass("selected");

        this.selectedIndex = $lis.index($target);
        if (this.selectedIndex >= 0) {
            this.itemSelected(this.collection.at(this.selectedIndex));
        } else {
            this.selectedIndex = 0;
            this.itemDeselected();
        }
    },

    postRender: function() {
        this.selectItem(this.$(">li").eq(this.selectedIndex));
    },

    itemSelected: function(model) {
        if (this.eventName) {
            chorus.PageEvents.broadcast(this.eventName + ":selected", model);
        }
    },

    itemDeselected: function() {
        if (this.eventName) {
            chorus.PageEvents.broadcast(this.eventName + ":deselected");
        }
    }
});
