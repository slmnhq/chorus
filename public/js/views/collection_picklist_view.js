chorus.views.CollectionPicklist = chorus.views.Base.extend({
    constructorName: "CollectionPicklistView",
    className:"collection_picklist",

    events:{
        'click li':'selectItem'
    },

    setup: function() {
        if (!this.collection.comparator) {
            this.collection.comparator = this.collectionComparator;
        }

        this.multiSelection = this.options.multiSelection || false;
        this.collection.onLoaded(this.collection.sort, this.collection);
    },

    postRender:function () {
        chorus.search({
            input: this.$("input"),
            list: this.$(".items ul"),
            onFilter: this.deselectItem,
            afterFilter: _.bind(this.afterFilter, this)
        });

        if (this.options.defaultSelection) {
            _.each(this.options.defaultSelection.models, function(user) {
                this.$("li[data-id='" + user.get("id") + "']").addClass("selected");
            }, this);
        }
    },

    additionalContext: function() {
        return {
            emptyListTranslationKey: this.emptyListTranslationKey || "none",
            placeholderTranslation: this.searchPlaceholderKey ? t(this.searchPlaceholderKey) : ""
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

    selectItem: function(e) {
        if (!this.multiSelection) {
            this.$("li").removeClass("selected");
        }

        $(e.currentTarget).toggleClass("selected");
        this.trigger("item:selected", this.selectedItem())
    },

    selectedItem: function() {
        var ids = _.map(this.$("ul li.selected"), function(item) {
            return $(item).data("id");
        });

        if (this.multiSelection) {
            return _.map(ids, function(id) {
                return this.collection.get(id);
            }, this);

        } else {
            return this.collection.get(ids[0]) || undefined;
        }
    },

    collectionComparator: function(model) {
        return model.name().toLowerCase();
    },

    collectionModelContext: function(model) {
        return {
            name: model.name()
        }
    }
});
