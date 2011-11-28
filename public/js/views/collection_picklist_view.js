(function($, ns) {
    ns.CollectionPicklist = chorus.views.Base.extend({
        className : "collection_picklist",

        events : {
            'click li': 'selectItem'
        },

        preRender : function(el) {
            if (!this.collection.comparator) {
                this.collection.comparator = this.sortItems;
                this.collection.sort();
            }
        },

        collectionModelContext : function(model) {
            return {
                name : model.displayName(),
                imageUrl : model.imageUrl()
            }
        },

        selectItem : function(e) {
            this.$("li").removeClass("selected");
            $(e.currentTarget).addClass("selected");
        },

        sortItems : function(item) {
            return item.displayName().toLowerCase();
        }
    });
})(jQuery, chorus.views);
