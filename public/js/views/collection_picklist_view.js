(function($, ns) {
    ns.CollectionPicklist = chorus.views.Base.extend({
        className : "collection_picklist",

        events : {
            'click li': 'selectWorkspace'
        },

        collectionModelContext : function(model) {
            return {
                name : model.displayName(),
                imageUrl : model.imageUrl()
            }
        },

        selectWorkspace : function(e) {
            this.$("li").removeClass("selected");
            $(e.currentTarget).addClass("selected");
        }

    });
})(jQuery, chorus.views);
