(function($, ns) {
    ns.CollectionPicklist = chorus.views.Base.extend({
        className : "collection_picklist",

        events : {
            'click li': 'selectItem',
        },

        preRender : function(el) {
            if (!this.collection.comparator) {
                this.collection.comparator = this.sortItems;
                this.collection.sort();
            }
        },

        postRender : function() {
            this.$("input").unbind("textchange").bind("textchange", _.bind(this.searchItems, this));
        },

        collectionModelContext : function(model) {
            return {
                name : model.displayName(),
                imageUrl : model.imageUrl()
            }
        },

        searchItems : function(e) {
            var self = this;
            var compare = this.$("input").val().toLowerCase();
            this.$("li").removeClass("filtered");
            this.collection.each(function(item, index) {
                if(item.displayName().toLowerCase().indexOf(compare) == -1){
                    self.$("li:eq(" + index + ")").addClass("filtered");
                }
            })
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
