chorus.dialogs.WorkfilesAttach = chorus.dialogs.PickItems.extend({
    constructorName: "WorkfilesAttach",

    title:t("workfiles.attach"),
    constructorName: "WorkfilesAttachDialog",
    submitButtonTranslationKey: "workfiles.button.attach_file",
    emptyListTranslationKey: "workfiles.none",
    searchPlaceholderKey: "workfiles.dialog.search",
    selectedEvent: 'files:selected',
    modelClass: "Workfile",
    multiSelection: true,

    makeModel:function () {
        this.collection = new chorus.collections.WorkfileSet([], {workspaceId:this.options.workspaceId || this.options.launchElement.data("workspace-id")});
        this.collection.fetchAll();
    },

    collectionModelContext: function (model) {
        return {
            name: model.get("fileName"),
            imageUrl: model.iconUrl({size:"medium"})
        }
    },

    collectionComparator: function(model) {
        return -(Date.parseFromApi(model.get("versionInfo").updatedAt).getTime());
    }
})
