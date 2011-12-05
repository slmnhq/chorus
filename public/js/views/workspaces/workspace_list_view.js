(function($, ns) {
    ns.WorkspaceList = chorus.views.Base.extend({
        className : "workspace_list",
        tagName : "ul",
        additionalClass : "list",

        collectionModelContext: function(model) {
            return {
                imageUrl: model.defaultIconUrl(),
                showUrl: model.showUrl(),
                ownerUrl: model.owner().showUrl()
            };
        }
    });
})(jQuery, chorus.views);
