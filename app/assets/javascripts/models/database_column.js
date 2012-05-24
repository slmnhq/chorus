chorus.models.DatabaseColumn = chorus.models.Base.extend({
    constructorName: "DatabaseColumn",
    urlTemplate: "data/{{instanceId}}/database/{{encode databaseName}}/schema/{{encode schemaName}}/{{parentType}}/{{encode parentName}}/column",

    urlParams: function() {
        return {
            type: "meta",
            filter: this.get("name")
        }
    },

    initialize: function() {
        if (this.tabularData) {
            this.set({
                instanceId: this.tabularData.instance().id,
                databaseName: this.tabularData.database().name(),
                schemaName: this.tabularData.schema().name(),
                parentName: this.tabularData.name(),
                parentType: this.tabularData.metaType()
            });
        }

        this.set({
            typeClass: chorus.models.DatabaseColumn.humanTypeMap[this.get("typeCategory")]
        });
    },

    toText: function() {
        return this.safePGName(this.get("name"));
    },

    quotedName: function() {
        return this.tabularData &&
            this.get("name") &&
            this.safePGName(this.tabularData.selectName(), this.get("name"));
    }
}, {
    humanTypeMap: {
        "WHOLE_NUMBER": "numeric",
        "REAL_NUMBER": "numeric",
        "STRING": "string",
        "LONG_STRING": "string",
        "BINARY": "binary",
        "BOOLEAN": "boolean",
        "DATE": "date",
        "TIME": "time",
        "DATETIME": "date_time",
        "OTHER": "other"
    }
});