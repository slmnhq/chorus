chorus.views.WorkspaceList = chorus.views.Base.extend({
    className:"workspace_list",
    tagName:"ul",
    additionalClass:"list",

    collectionModelContext:function (model) {
        var date = Date.parseFromApi(model.get("archivedTimestamp"));

        return {
            imageUrl:model.defaultIconUrl(),
            showUrl:model.showUrl(),
            ownerUrl:model.owner().showUrl(),
            archiverUrl:model.archiver().showUrl(),
            archiverFullName:model.archiver().get("fullName"),
            ownerFullName:model.owner().displayName()
        };
    },

    postRender: function() {
        this.collection.each(function(model, index) {
            model.loaded = true;
            this.summaryView = new chorus.views.TruncatedText({model:model, attribute:"summary"})
            this.renderSubview("summaryView", this.$(".summary:eq(" + index + ")"))
        }, this);
    }
});