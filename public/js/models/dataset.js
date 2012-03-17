chorus.models.Dataset = chorus.models.TabularData.extend({
    constructorName: "Dataset",

    urlTemplate: function() {
        var components = [
            "workspace",
            this.get("workspace").id,
            "dataset"
        ]

        if (this.get("id")) {
            components.push(this.get("id"))
        }

        return components.join("/");
    },

    showUrlTemplate: function() {
        return [
            "workspaces",
            this.get("workspaceId") || this.get("workspace").id,
            "datasets",
            this.get("compositeId") || this.get("id")
        ].join("/");
    },

    iconUrl: function() {
        var result = this._super("iconUrl", arguments);
        if (this.get('hasCredentials') === false) {
            result = result.replace(".png", "_locked.png");
        }
        return result;
    },

    tableOrViewTranslationKey: function() {
        return "dataset.types." + this.metaType();
    },

    isChorusView: function() {
        return this.get("type") === "CHORUS_VIEW";
    },

    deriveChorusView: function() {
        var chorusView = new chorus.models.ChorusView({sourceObjectId: this.id});
        chorusView.sourceObject = this;
        return chorusView;
    },

    statistics: function() {
        var stats = this._super("statistics")

        if (this.isChorusView() && !stats.datasetId) {
            stats.set({ workspace: this.get("workspace")})
            stats.datasetId = this.get("id")
        }

        return stats;
    },

    getImport: function() {
        if (!this._datasetImport) {
            this._datasetImport = new chorus.models.DatasetImport({
                datasetId: this.get("id"),
                workspaceId: this.get("workspace").id
            });
        }
        return this._datasetImport
    },

    setImport: function(datasetImport) {
        this._datasetImport = datasetImport;
    },

    importFrequency: function() {
        return this.getImport().frequency() || this.get('importFrequency')
    },

    columns: function(options) {
        var result = this._super('columns', arguments);
        result.attributes.workspaceId = this.get("workspace").id;
        return result;
    },

    hasOwnPage: function() {
        return true;
    },

    lastImportSource: function() {
        var importInfo = this.get("importInfo");
        if (importInfo && importInfo.sourceId) {
            return new chorus.models.Dataset({
                id: importInfo.sourceId,
                objectName: importInfo.sourceTable,
                workspaceId: this.get("workspace").id
            });
        }
    },

    isImportable: function() {
        return true;
    },

    setWorkspace: function(workspace) {
        this.set({workspace: {id: workspace.get('id')}});
    },

     activities: function() {
        var original = this._super("activities", arguments);
        if (this.isChorusView()) {
           original.attributes.workspace = this.get("workspace");
        }

        return original;
    }
});
