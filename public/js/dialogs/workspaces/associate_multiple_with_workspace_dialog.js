chorus.dialogs.AssociateMultipleWithWorkspace = chorus.dialogs.PickWorkspace.extend({
    constructorName: "AssociateWithWorkspace",

    title: t("dataset.associate.title"),
    buttonTitle: t("dataset.associate.button"),

    setup: function(options) {
        this.databaseObjects = options.databaseObjects;
        this.requiredResources.add(this.collection);
        this._super('setup', arguments);
    },

    submit: function() {
        this._super("submit", arguments);

        var workspace = this.selectedItem();
        var url = workspace.datasets().url();
        var params = {
            type: "SOURCE_TABLE",
            datasetIds: this.databaseObjects.pluck("id").join(",")
        };

        var self = this;
        $.post(url, params, function(data) { self.closeModal(); });
    }
});
