chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    constructorName: "DatabaseObject",

    urlTemplate: function() {
        return "data/" + this.get("instance").id + "/database/{{encodeOnce databaseName}}/schema/{{encodeOnce schemaName}}/" + this.metaType() + "/{{encodeOnce objectName}}"
    },

    showUrlTemplate: function() {
        return "instances/" + (this.get("instance") && this.get("instance").id) + "/databases/{{doubleEncode databaseName}}/schemas/{{doubleEncode schemaName}}/{{objectType}}/" + encodeURIComponent(encodeURIComponent($.stripHtml(this.get("objectName"))))
    },

    urlTemplateAttributes: function() {
        return {
            databaseName: $.stripHtml(this.get("databaseName")),
            schemaName: $.stripHtml(this.get("schemaName")),
            objectName: $.stripHtml(this.get("objectName")),
            objectType: this.get("objectType")
        }
    },

    toText: function() {
        return this.safePGName(this.get("schemaName")) + '.' + this.safePGName(this.get("objectName"));
    },

    isChorusView: function() {
        return false;
    }
});
