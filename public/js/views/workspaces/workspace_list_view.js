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
        var i = 0;
        var $summary = this.$('li .summary');
        this.collection.each(function(model) {
            model.loaded = true;
            var text = new chorus.views.TruncatedText({model:model, attribute:"summary", characters:300, lines:2})
            $summary.eq(i++).append(text.render().el);
        });
    }
});