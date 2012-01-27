(function(ns) {
    ns.models.DatabaseColumn = chorus.models.Base.extend({
        toText: function() {
            return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("parentName"))
                + '.' + this.safePGName(this.get("name"));
        },

        humanType : function() {
            return ns.models.DatabaseColumn.humanTypeMap[this.get("typeCategory")]
        }
    }, {
        humanTypeMap : {
            "WHOLE_NUMBER" : "numeric",
            "REAL_NUMBER" : "numeric",
            "STRING" : "string",
            "LONG_STRING" : "string",
            "BINARY" : "binary",
            "BOOLEAN" : "boolean",
            "DATE" : "date",
            "TIME" : "time",
            "DATETIME" : "date_time",
            "OTHER" : "other"
        }
    });
})(chorus);