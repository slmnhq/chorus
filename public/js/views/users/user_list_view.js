(function($, ns) {
    ns.UserList = chorus.views.Base.extend({
        tagName : "ul",
        className : "user_list",
        additionalClass : "list",

        collectionModelContext : function(model) {
            return {
                imageUrl : model.imageUrl({size: "icon"}),
                showUrl : model.showUrl(),
                fullName : [model.get("firstName"), model.get("lastName")].join(' '),
                title: model.get("title")
            }
        }
    });
})(jQuery, chorus.views);
