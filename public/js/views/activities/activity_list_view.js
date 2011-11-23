(function($, ns) {
    ns.ActivityList = chorus.views.Base.extend({
        tagName : "ul",
        className : "activity_list",

        collectionModelContext : function(model) {
            return {
                // imageUrl : model.imageUrl({size: "icon"}),
                // showUrl : model.showUrl(),
                // fullName : [model.get("firstName"), model.get("lastName")].join(' ')
            }
        }
    });
})(jQuery, chorus.views);

