chorus.views.WorkspaceList = chorus.views.SelectableList.extend({
    templateName:"workspace_list",
    tagName:"ul",
    eventName: "workspace",

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
        this._super("postRender")
        this.collection.each(function(model, index) {
            model.loaded = true;
            this.summaryView = new chorus.views.TruncatedText({model:model, attribute:"summary", attributeIsHtmlSafe: true})
            this.renderSubview("summaryView", this.$(".summary:eq(" + index + ")"))
        }, this);
    }
});
