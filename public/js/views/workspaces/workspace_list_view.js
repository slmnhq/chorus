(function($, ns) {
    ns.WorkspaceList = chorus.views.Base.extend({
        className : "workspace_list",
        tagName : "ul",
        additionalClass : "list",
        events : {
            "click a.link" : "toggleSummary"
        },

        collectionModelContext: function(model) {

            var utcDate = model.get("archivedTimestamp") && model.get("archivedTimestamp").trim().replace(/\s/, "T").slice(0, -4)
            return {
                imageUrl: model.defaultIconUrl(),
                showUrl: model.showUrl(),
                ownerUrl: model.owner().showUrl(),
                archiverUrl: model.archiver().showUrl(),
                archiverFullName : model.archiver().get("fullName"),
                truncatedSummary : model.truncatedSummary(100),
                isTruncated: model.isTruncated(),
                timeAgo : utcDate && new Date(utcDate).toRelativeTime()
            };
        },

        toggleSummary: function(e) {
            e.preventDefault();
            $(e.target).closest("li").toggleClass("more");
        }
    });
})(jQuery, chorus.views);
