chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    constructorName: "DatabaseObject",

    urlTemplate: function() {
        return "data/" + this.get("instance").id + "/database/{{encode databaseName}}/schema/{{encode schemaName}}/" + this.metaType() + "/{{encode objectName}}"
    },

    showUrlTemplate: function() {
        return "instances/" + (this.get("instance") && this.get("instance").id) + "/databases/{{encode databaseName}}/schemas/{{encode schemaName}}/{{objectType}}/" + encodeURIComponent($.stripHtml(this.get("objectName")))
    },

    urlTemplateAttributes: function() {
        return {
            databaseName: $.stripHtml(this.get("databaseName")),
            schemaName: $.stripHtml(this.get("schemaName")),
            objectName: $.stripHtml(this.get("objectName")),
            objectType: this.get("objectType")
        }
    },

    isChorusView: function() {
        return false;
    }
});
