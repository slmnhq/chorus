chorus.views.SearchWorkfileList = chorus.views.Base.extend({
    className: "search_workfile_list",
    additionalClass: "list",

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.total,
            moreResults: (this.collection.models.length < this.options.total)
        }
    },

    collectionModelContext: function(model){
        var workspace = model.workspace()

        return {
            showUrl: model.showUrl(),
            iconUrl: model.iconUrl(),
            comments: model.get("comments") ? model.get("comments").map(function(comment) {
                return comment.attributes || comment;
            }).slice(0, 3) : [],
            hasMoreComments: model.get("comments") && Math.max(0, model.get("comments").length - 3),
            workspaceLink: "<a href='"+workspace.showUrl()+"'>"+workspace.get('name')+"</a>"
        }
    }
});