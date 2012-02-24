chorus.views.SearchWorkfileList = chorus.views.Base.extend({
    className: "search_workfile_list",
    additionalClass: "list",

    makeModel: function() {
        this.collection = new chorus.collections.WorkfileSet(this.options.workfileResults.docs);
    },

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.workfileResults.numFound,
            moreResults: (this.collection.models.length < this.options.workfileResults.numFound)
        }
    },

    collectionModelContext: function(model){
        var workspace = new chorus.models.Workspace(model.get("workspace"));

        return {
            showUrl: model.showUrl(),
            iconUrl: model.get("fileType") && chorus.urlHelpers.fileIconUrl(model.get("fileType")),
            workspaceLink: "<a href='"+workspace.showUrl()+"'>"+workspace.get('name')+"</a>"
        }
    }
});