chorus.views.CollectionPicklist = chorus.views.Base.extend({
    className:"collection_picklist",

    events:{
        'click li':'selectItem'
    },

    preRender:function () {
        if (!this.collection.comparator) {
            this.collection.comparator = this.sortItems;
            this.collection.sort();
        }
    },

    postRender:function () {
        chorus.search({
            input: this.$("input"),
            list: this.$(".items ul"),
            onFilter: this.deselectItem,
            afterFilter: _.bind(this.afterFilter, this)
        });
    },

    collectionModelContext:function (model) {
        return {
            name:model.displayName(),
            imageUrl:model.picklistImageUrl()
        }
    },

    deselectItem: function(el) {
        el.removeClass("selected");
    },

    afterFilter: function() {
        if (this.$("li.selected").length == 0) {
            this.trigger("item:selected", undefined);
        }
    },

    selectItem:function (e) {
        var index = this.$("ul li").index($(e.currentTarget));
        this.$("li").removeClass("selected");
        $(e.currentTarget).addClass("selected");
        this.trigger("item:selected", this.selectedItem())
    },

    selectedItem:function () {
        var index = this.$("ul li").index(this.$("li.selected"));
        return this.collection.at(index);
    },

    sortItems:function (item) {
        return item.displayName().toLowerCase();
    }
});
