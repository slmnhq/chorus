chorus.views.SearchWorkfileList = chorus.views.Base.extend({
    className: "search_workfile_list",

    makeModel: function() {
        this.collection = new chorus.collections.WorkfileSet(this.options.workfileResults.docs);
    },

    additionalContext: function() {
        return {
            shown: this.collection.models.length,
            total: this.options.workfileResults.numFound
        }
    },

    collectionModelContext: function(model){
        return {
            showUrl: model.showUrl()
        }
    }
});