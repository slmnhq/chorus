chorus.models.DatabaseColumn = chorus.models.Base.extend({
    constructorName: "DatabaseColumn",
    urlTemplate: "database_objects/{{id}}/columns",

    urlParams: function() {
        return {
            filter: this.get("name")
        }
    },

    initialize: function() {
        if (this.tabularData) {
            this.set({
                id: this.tabularData.id
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