chorus.dialogs.WorkfilesAttach = chorus.dialogs.PickItems.extend({
    title:t("workfiles.attach"),
    constructorName: "WorkfilesAttachDialog",
    submitButtonTranslationKey: "workfiles.button.attach_file",
    emptyListTranslationKey: "workfiles.none",
    searchPlaceholderKey: "workfiles.dialog.search",
    selectedEvent: 'files:selected',
    modelClass: "Workfile",

    makeModel:function () {
        this.collection = new chorus.collections.WorkfileSet([], {workspaceId:this.options.workspaceId || this.options.launchElement.data("workspace-id")});
        this.collection.fetchAll();
    },

    collectionModelContext: function (model) {
        return {
            name: model.get("fileName"),
            imageUrl: model.isImage() ? model.thumbnailUrl() : model.iconUrl({size:"medium"})
        }
    },

    collectionComparator: function(model) {
        return -(Date.parseFromApi(model.get("lastUpdatedStamp")).getTime());
    }
})
