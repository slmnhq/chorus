(function($, ns) {
    ns.WorkspaceList = chorus.views.Base.extend({
        className : "workspace_list",
        tagName : "ul",
        additionalClass : "list",
        events : {
            "click a.link" : "toggleSummary"
        },

        collectionModelContext: function(model) {
            var archivedTimeMatch = model.get("archivedTimestamp") && model.get("archivedTimestamp").match(/(.+)\.\d{1,3}/);
            if (archivedTimeMatch && archivedTimeMatch[1]) {
                var timeAgo = Date.parse(archivedTimeMatch[1]).toRelativeTime()
            }

            return {
                imageUrl: model.defaultIconUrl(),
                showUrl: model.showUrl(),
                ownerUrl: model.owner().showUrl(),
                archiverUrl: model.archiver().showUrl(),
                archiverFullName : model.archiver().get("fullName"),
                truncatedSummary : model.truncatedSummary(100),
                isTruncated: model.isTruncated(),
                timeAgo : timeAgo
            };
        },

        toggleSummary: function(e) {
            e.preventDefault();
            $(e.target).closest("li").toggleClass("more");
        }
    });
})(jQuery, chorus.views);
