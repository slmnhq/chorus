chorus.dialogs.WorkfilesAttach = chorus.dialogs.Attach.extend({
    submitButtonTranslationKey: "workfiles.button.attach_file",
    emptyListTranslationKey: "workfiles.none",
    title:t("workfiles.attach"),
    collectionClass:chorus.collections.WorkfileSet,
    selectedEvent: 'files:selected',

    makeModel:function () {
        this.collection = new chorus.collections.WorkfileSet([], {workspaceId:this.options.workspaceId || this.options.launchElement.data("workspace-id")});
        this.collection.fetchAll();
    },

    collectionModelContext: function (model) {
        return {
            iconUrl: model.iconUrl({size:"medium"}),
            name: model.get("fileName")
        }
    },

    additionalContext:function (ctx) {
        return {
            models:_.sortBy(ctx.models, function (model) {
                return -(Date.parseFromApi(model.lastUpdatedStamp).getTime())
            })
        }
    }
})