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
            iconUrl: model.get("fileType") && chorus.urlHelpers.fileIconUrl(model.get("fileType")),
            workspaceLink: "<a href='"+workspace.showUrl()+"'>"+workspace.get('name')+"</a>"
        }
    }
});
