chorus.dialogs.WorkfilesAttach = chorus.dialogs.Attach.extend({
    constructorName: "WorkfilesAttachDialog",
    submitButtonTranslationKey: "workfiles.button.attach_file",
    emptyListTranslationKey: "workfiles.none",
    title:t("workfiles.attach"),
    collectionClass:chorus.collections.WorkfileSet,
    selectedEvent: 'files:selected',

    makeModel:function () {
        this.collection = new chorus.collections.WorkfileSet([], {workspaceId:this.options.workspaceId || this.options.launchElement.data("workspace-id")});
        this.collection.fetchAll();
    },

    picklistCollectionModelContext: function (model) {
        return {
            name: model.get("fileName"),
            imageUrl: model.isImage() ? model.thumbnailUrl() : model.iconUrl({size:"medium"})
        }
    },

    picklistCollectionModelComparator: function(model) {
        return -(Date.parseFromApi(model.get("lastUpdatedStamp")).getTime());
    }
})