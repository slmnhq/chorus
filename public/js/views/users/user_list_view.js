(function($, ns) {
    ns.UserList = chorus.views.Base.extend({
        tagName : "ul",
        className : "user_list",

        collectionModelContext : function(model) {
            return {
                imageUrl : model.imageUrl({size: "icon"}),
                showUrl : model.showUrl()
            }
        }
    });
})(jQuery, chorus.views);
