chorus.models.Dataset = chorus.models.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    nameAttribute: 'objectName',
    constructorName: "Dataset",
    entityType: "dataset",

    showUrlTemplate: "datasets/{{id}}",
    urlTemplate: function(options) {
        if(options && options.download) {
            return "datasets/{{id}}/download.csv"
        } else {
            return "datasets/{{id}}";
        }
    },

    initialize: function() {
        this.bind('invalidated', this.refetchAfterInvalidated, this);
        this.bind("change:associatedWorkspaces", this.invalidateWorkspacesAssociated, this);

        if (!this.has("type")) {
            this.set({type: this.get("datasetType") || "SOURCE_TABLE"}, { silent: true });
        }
    },

    metaType: function() {
        return this.constructor.metaTypeMap[this.get("objectType")] || "table";
    },

    isDeleteable: function() {
        var type = this.get("type")
        return type && (type == "SOURCE_TABLE" || type == "CHORUS_VIEW");
    },

    columns: function(options) {
        if (!this._columns) {
            this._columns = new chorus.collections.DatabaseColumnSet([], {
                id: this.get("id"),
                type: options && options.type
            });

            this._columns.dataset = this;
            var objectNameField = this.metaType() + "Name";
            this._columns.attributes[objectNameField] = (this.metaType() == "query") ? this.get("id") : this.name();
        }
        return this._columns;
    },

    instance: function() {
        return this.database().instance();
    },

    database: function() {
        return this.schema().database();
    },

    getImport: function() {
        return false;
    },

    hasImport: function() {
        return this.getImport() && this.getImport().has("id");
    },

    importRunsAt: function() {
        if (!this.hasImport() || !this.getImport().hasNextImport()) return;

        return chorus.helpers.relativeTimestamp(this.getImport().nextExecutionAt());
    },

    nextImportDestination: function() {
        if (!this.hasImport() || !this.getImport().hasNextImport()) return;

        return this.getImport().nextDestination();
    },

    lastImportDestination:function () {
        var importConfig = this.getImport();

        return importConfig
            && importConfig.thisDatasetIsSource()
            && importConfig.isInProgress()
            && importConfig.lastDestination();
    },

    canExport:function () {
        return this.workspace() && this.workspace().canUpdate()
            && this.hasCredentials()
            && this.canBeImportSource()
            && this.isImportConfigLoaded()
    },

    schema: function() {
        return new chorus.models.Schema(this.get("schema"));
    },

    workspace: function() {
        if (!this._workspace && this.get("workspace")) {
            this._workspace = new chorus.models.Workspace(this.get("workspace"));
        }
        return this._workspace;
    },

    workspacesAssociated: function() {
        if (!this._workspaceAssociated) {
            var workspaceList = this.get("associatedWorkspaces")
            this._workspaceAssociated = new chorus.collections.WorkspaceSet(workspaceList);
        }
        return this._workspaceAssociated;

    },

    workspaceArchived: function() {
        return this.workspace() && !this.workspace().isActive();
    },

    isImportConfigLoaded: function() {
        return this.getImport() && this.getImport().loaded;
    },

    invalidateWorkspacesAssociated: function() {
        delete this._workspaceAssociated
    },

    statistics: function() {
        if (!this._statistics) {
            this._statistics = new chorus.models.DatasetStatistics({ datasetId: this.id });
        }

        return this._statistics;
    },

    iconUrl: function(options) {
        var size = (options && options.size) || "large";
        var name = this.constructor.iconMap[this.get("type")][this.get("objectType")];
        return "/images/" + name + "_" + size + ".png";
    },

    lastComment: function() {
        var commentJson = this.get("recentComment");
        if (commentJson) {
            var comment = new chorus.models.Comment({
                body: commentJson.text,
                author: commentJson.author,
                commentCreatedStamp: commentJson.timestamp
            });
            comment.loaded = true;
            return comment;
        }
    },

    preview: function() {
        if (this.isChorusView()) {
            return new chorus.models.ChorusViewPreviewTask({
                query: this.query(),
                schemaId: this.schema().id,
                objectName: this.name()
            });
        } else {
            return new chorus.models.DataPreviewTask({dataset: {id: this.id}});
        }
    },

    download: function(options) {
        var data = { };
        if (options && options.rowLimit) {
            data.row_limit = options.rowLimit;
        }

        $.download(this.url({download: true}), data, "get");
    },

    isChorusView: function() {
        return false;
    },

    refetchAfterInvalidated: function() {
        this.collection && this.fetch()
    },

    quotedName: function() {
        return this.safePGName(this.name());
    },

    toText: function() {
        if (this.has("query")) {
            var query = this.get("query").trim().replace(/;$/, "").trim();
            return "(" + query + ") AS " + this.safePGName(this.name());
        } else {
            return this.safePGName(this.schema().name()) + '.' + this.safePGName(this.name());
        }
    },

    selectName: function() {
        if (this.aliasedName) {
            return this.aliasedName;
        }
        return this.quotedName();
    },

    setDatasetNumber: function(number) {
        this.datasetNumber = number;
        this.aliasedName = String.fromCharCode(96 + this.datasetNumber);
    },

    clearDatasetNumber: function() {
        delete this.datasetNumber;
        delete this.aliasedName;
    },

    fromClauseBody: function() {
        if (this.has("query")) {
            return "(" + this.get("query") + ")";
        }
        return this.safePGName(this.schema().name()) + "." + this.quotedName();
    },

    alias: function() {
        return this.aliasedName || this.quotedName();
    },

    aliased: function() {
        return this.datasetNumber || this.has("query");
    },

    fromClause: function() {
        if (this.aliased()) {
            return this.fromClauseBody() + " AS " + this.alias();
        }
        return this.fromClauseBody();
    },

    canBeImportSource: function() {
        return false;
    },

    canBeImportDestination: function() {
        return false;
    },

    canBeImportSourceOrDestination: function() {
        return this.canBeImportSource() || this.canBeImportDestination();
    },

    asWorkspaceDataset: function() {
        return new chorus.models.WorkspaceDataset(this);
    },

    hasCredentials: function() {
        return this.get('hasCredentials') !== false
    },

    analyzableObjectType: function() {
        return this.get("objectType") === "TABLE";
    },

    canAnalyze: function() {
        return this.hasCredentials() && this.analyzableObjectType() && !this.workspaceArchived();
    },

    analyze: function() {
        if (!this._analyze) {
            this._analyze = new chorus.models.DatasetAnalyze({
                tableId: this.get("id")
            });
        }

        return this._analyze;
    },

    makeBoxplotTask: function(taskAttrs) {
        return new chorus.models.BoxplotTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            dataset: this,
            bins: taskAttrs.bins
        });
    },

    makeFrequencyTask: function(taskAttrs) {
        return new chorus.models.FrequencyTask({
            yAxis: taskAttrs.yAxis,
            dataset: this,
            bins: taskAttrs.bins
        });
    },

    makeHistogramTask: function(taskAttrs) {
        return new chorus.models.HistogramTask({
            bins: taskAttrs.bins,
            xAxis: taskAttrs.xAxis,
            dataset: this
        });
    },

    makeHeatmapTask: function(taskAttrs) {
        return new chorus.models.HeatmapTask({
            xBins: taskAttrs.xBins,
            yBins: taskAttrs.yBins,
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            dataset: this
        });
    },

    makeTimeseriesTask: function(taskAttrs) {
        return new chorus.models.TimeseriesTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            aggregation: taskAttrs.aggregation,
            timeInterval: taskAttrs.timeInterval,
            dataset: this,
            timeType: taskAttrs.timeType
        });
    },

    importFrequency: $.noop
}, {
    metaTypeMap: {
        "TABLE": "table",
        "VIEW": "view",
        "EXTERNAL_TABLE": "table",
        "MASTER_TABLE": "table",
        "CHORUS_VIEW": "view"
    },

    entityTypeMap: {
        "SOURCE_TABLE": "dataset",
        "SANDBOX_TABLE": "dataset",
        "CHORUS_VIEW": "chorusView"
    },

    iconMap: {
        "CHORUS_VIEW": {
            CHORUS_VIEW: "chorus_view"
        },

        "SOURCE_TABLE": {
            "TABLE": "source_table",
            "EXTERNAL_TABLE": "source_table",
            "MASTER_TABLE": "source_table",
            "VIEW": "source_view",
            "HDFS_EXTERNAL_TABLE": "source_table"
        },

        "SANDBOX_TABLE": {
            "TABLE": "sandbox_table",
            "EXTERNAL_TABLE": "sandbox_table",
            "MASTER_TABLE": "sandbox_table",
            "VIEW": "sandbox_view",
            "HDFS_EXTERNAL_TABLE": "sandbox_table"
        }
    }
});
