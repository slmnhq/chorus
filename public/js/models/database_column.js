chorus.models.DatabaseColumn = chorus.models.Base.extend({

    urlTemplate: "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/{{parentType}}/{{parentName}}/column",

    urlParams: function() {
        return {
            type: "meta",
            filter: this.get("name")
        }
    },

    initialize: function() {
        if (this.tabularData) {
            this.set({
                instanceId: this.tabularData.get("instance").id,
                databaseName: this.tabularData.get("databaseName"),
                schemaName: this.tabularData.get("schemaName"),
                parentName: this.tabularData.get("objectName"),
                parentType: this.tabularData.metaType()
            });
        }

        this.set({
            typeClass: chorus.models.DatabaseColumn.humanTypeMap[this.get("typeCategory")]
        });
    },

    toText: function() {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("parentName"))
            + '.' + this.safePGName(this.get("name"));
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