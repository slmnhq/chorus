chorus.models.DatabaseColumn = chorus.models.Base.extend({
    constructorName: "DatabaseColumn",
    urlTemplate: function() {
        return ["datasets", this.dataset.id, "columns"].join("/");
    },

    urlParams: function() {
        return {
            filter: this.get("name")
        }
    },

    initialize: function() {
        this.set({
            typeClass: chorus.models.DatabaseColumn.humanTypeMap[this.get("typeCategory")]
        });
    },

    toText: function() {
        return this.safePGName(this.get("name"));
    },

    quotedName: function() {
        return this.dataset &&
            this.get("name") &&
            this.safePGName(this.dataset.selectName(), this.get("name"));
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
