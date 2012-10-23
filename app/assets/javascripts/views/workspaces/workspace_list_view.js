chorus.views.WorkspaceList = chorus.views.SelectableList.extend({
    templateName: "workspace_list",
    tagName: "ul",
    eventName: "workspace",

    collectionModelContext: function(model) {
        return {
            imageUrl: model.defaultIconUrl(),
            showUrl: model.showUrl(),
            ownerUrl: model.owner().showUrl(),
            archiverUrl: model.archiver().showUrl(),
            archiverFullName: model.archiver().displayName(),
            ownerFullName: model.owner().displayName(),
            active: model.isActive()
        };
    },

    postRender: function() {
        this._super("postRender")
        _.each(this.summaryViews, function(summaryView) {
          summaryView.teardown();
        });
        this.summaryViews = [];
        this.collection.each(function(model, index) {
            model.loaded = true;
            var summaryView = this["summaryView"+index] = new chorus.views.TruncatedText({model: model, attribute: "summary", attributeIsHtmlSafe: true})
            this.renderSubview("summaryView"+index, this.$(".summary:eq(" + index + ")"))
            this.summaryViews.push(summaryView);
            this.registerSubView(summaryView);
        }, this);
    }
});
