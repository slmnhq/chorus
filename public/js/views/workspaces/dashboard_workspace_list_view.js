(function($, ns) {
    ns.DashboardWorkspaceList = chorus.views.Base.extend({
        className : "dashboard_workspace_list",
        tagName : "ul",
        additionalClass : "list",

        collectionModelContext: function(model) {
            return {
                imageUrl : model.defaultIconUrl(),
                showUrl : model.showUrl(),
                latestComment : model.get("latestCommentList")[0]
            }
        }
    });
})(jQuery, chorus.views);
