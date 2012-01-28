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
        this.$("input").unbind("textchange").bind("textchange", _.bind(this.searchItems, this));
    },

    collectionModelContext:function (model) {
        return {
            name:model.displayName(),
            imageUrl:model.picklistImageUrl()
        }
    },

    searchItems:function (e) {
        var self = this;
        var compare = this.$("input").val().toLowerCase();
        this.$("li").removeClass("filtered");
        this.collection.each(function (item, index) {
            if (item.displayName().toLowerCase().indexOf(compare) == -1) {
                self.$("li:eq(" + index + ")").addClass("filtered").removeClass("selected");
            }
        })

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
