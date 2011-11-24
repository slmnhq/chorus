(function($, ns) {
    ns.CollectionPicklist = chorus.views.Base.extend({
        className : "collection_picklist",

        collectionModelContext : function(model) {
            return {
                name : model.displayName(),
                imageUrl : model.imageUrl()
            }
        }
    });
})(jQuery, chorus.views);
