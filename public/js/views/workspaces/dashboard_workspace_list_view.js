(function($, ns) {
    ns.DashboardWorkspaceList = chorus.views.Base.extend({
        className : "dashboard_workspace_list",
        tagName : "ul",
        additionalClass : "list",

        collectionModelContext: function(model) {
            var latestComment = model.get("latestCommentList")[0];

            return {
                imageUrl : model.defaultIconUrl(),
                showUrl : model.showUrl(),
                latestComment : latestComment,
                latestCommentTime : latestComment && Date.parseFromApi(latestComment.timestamp).toRelativeTime()
            }
        }
    });
})(jQuery, chorus.views);
