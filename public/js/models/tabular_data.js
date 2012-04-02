chorus.models.TabularData = chorus.models.Base.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: "TabularData",
    nameAttribute: 'objectName',

    initialize: function() {
        this.resetEntityType();
        this.bind("change:type", this.resetEntityType, this);
        this.bind('invalidated', this.refetchAfterInvalidated, this);

        if (!this.has("type")) {
            this.set({type: this.get("datasetType") || "SOURCE_TABLE"}, { silent: true });
        }
    },

    getEntityType: function() {
        return this.get("entityType") || this.constructor.entityTypeMap[this.get("type")] || "databaseObject"
    },

    resetEntityType: function() {
        this.entityType = this.getEntityType();
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
                tabularData: this,
                instanceId: this.get("instance").id,
                databaseName: this.get("databaseName"),
                schemaName: this.get("schemaName"),
                type: options && options.type
            });

            var objectNameField = this.metaType() + "Name";
            this._columns.attributes[objectNameField] = (this.metaType() == "query") ? this.get("id") : this.get("objectName");
        }
        return this._columns;
    },

    instance: function() {
        if (!this._instance) {
            this._instance = new chorus.models.Instance({
                id: this.get("instance").id,
                name: this.get("instance").name
            });
        }
        return this._instance;
    },

    schema: function() {
        if (!this._schema) {
            this._schema = new chorus.models.Schema({
                instanceId: this.get("instance").id,
                databaseName: this.get("databaseName"),
                name: this.get("schemaName"),
                instanceName: this.get("instance").name
            });
        }
        return this._schema;
    },

    database: function() {
        if (!this._database) {
            this._database = new chorus.models.Database({
                instanceId: this.get("instance").id,
                name: this.get("databaseName"),
                instanceName: this.get("instance").name
            });
        }
        return this._database;
    },

    workspace: function() {
        if (!this._workspace) {
            this._workspace = new chorus.models.Workspace(this.get("workspace"));
        }
        return this._workspace;
    },

    workspacesAssociated: function() {
        if (!this._workspaceAssociated) {
            var workspaceList = this.get("workspaceUsed") && this.get("workspaceUsed").workspaceList
            this._workspaceAssociated = new chorus.collections.WorkspaceSet(workspaceList);
        }
        return this._workspaceAssociated;

    },

    statistics: function() {
        if (!this._statistics) {
            this._statistics = new chorus.models.DatabaseObjectStatistics({
                instanceId: this.has("instance") ? this.get("instance").id : this.collection.attributes.instanceId,
                databaseName: this.get("databaseName"),
                schemaName: this.get("schemaName"),
                type: this.get("type"),
                objectType: this.get("objectType"),
                objectName: this.get("objectName")
            });
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

    preview: function(inEditChorusView) {
        if (!this._preview) {
            this._preview = new chorus.models.TabularDataPreview({
                instanceId: this.get("instance").id,
                databaseName: this.get("databaseName"),
                schemaName: this.get("schemaName")
            });
        }

        var objectName = this.get("objectName");
        var metaType = this.metaType();
        if (inEditChorusView) {
            this._preview.set({query: this.get("query"), workspaceId: this.get("workspace").id}, {silent: true});
        } else if (metaType == "table") {
            this._preview.set({tableName: objectName}, {silent: true});
        } else if (metaType == "view") {
            this._preview.set({viewName: objectName}, {silent: true});
        } else {
            this._preview.set({datasetId: this.get("id"), workspaceId: this.get("workspace").id}, {silent: true});
        }

        return this._preview;
    },

    refetchAfterInvalidated: function() {
        this.collection && this.fetch()
    },

    quotedName: function() {
        return this.safePGName(this.get("objectName"));
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
        return this.safePGName(this.get("schemaName")) + "." + this.quotedName();
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

    asDataset: function() {
        return new chorus.models.Dataset(this);
    },

    hasCredentials: function() {
        return this.get('hasCredentials') !== false
    },

    canAnalyze: function() {
        return this.get("objectType") === "BASE_TABLE";
    },

    analyze: function() {
        if (!this._analyze) {
            this._analyze = new chorus.models.TabularDataAnalyze({
                instanceId: this.instance().get("id"),
                databaseName: this.database().get("name"),
                schemaName: this.schema().get("name"),
                objectName: this.name(),
                metaType: this.metaType()
            });
        }

        return this._analyze;
    },

    makeBoxplotTask: function(taskAttrs) {
        return new chorus.models.BoxplotTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            tabularData: this,
            bins: taskAttrs.bins
        });
    },

    makeFrequencyTask: function(taskAttrs) {
        return new chorus.models.FrequencyTask({
            yAxis: taskAttrs.yAxis,
            tabularData: this,
            bins: taskAttrs.bins
        });
    },

    makeHistogramTask: function(taskAttrs) {
        return new chorus.models.HistogramTask({
            bins: taskAttrs.bins,
            xAxis: taskAttrs.xAxis,
            tabularData: this
        });
    },

    makeHeatmapTask: function(taskAttrs) {
        return new chorus.models.HeatmapTask({
            xBins: taskAttrs.xBins,
            yBins: taskAttrs.yBins,
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            tabularData: this
        });
    },

    makeTimeseriesTask: function(taskAttrs) {
        return new chorus.models.TimeseriesTask({
            xAxis: taskAttrs.xAxis,
            yAxis: taskAttrs.yAxis,
            aggregation: taskAttrs.aggregation,
            timeInterval: taskAttrs.timeInterval,
            tabularData: this,
            timeType: taskAttrs.timeType
        });
    },

    importFrequency: $.noop

}, {

    metaTypeMap: {
        "BASE_TABLE": "table",
        "VIEW": "view",
        "EXTERNAL_TABLE": "table",
        "MASTER_TABLE": "table",
        "CHORUS_VIEW": "view",
        "QUERY": "query"
    },

    entityTypeMap: {
        "SOURCE_TABLE": "databaseObject",
        "SANDBOX_TABLE": "databaseObject",
        "CHORUS_VIEW": "chorusView"
    },

    iconMap: {
        "CHORUS_VIEW": {
            "QUERY": "chorus_view"
        },

        "SOURCE_TABLE": {
            "BASE_TABLE": "source_table",
            "EXTERNAL_TABLE": "source_table",
            "MASTER_TABLE": "source_table",
            "VIEW": "source_view",
            "HDFS_EXTERNAL_TABLE": "source_table"
        },

        "SANDBOX_TABLE": {
            "BASE_TABLE": "sandbox_table",
            "EXTERNAL_TABLE": "sandbox_table",
            "MASTER_TABLE": "sandbox_table",
            "VIEW": "sandbox_view",
            "HDFS_EXTERNAL_TABLE": "sandbox_table"
        }
    }
});
