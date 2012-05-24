chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    constructorName: "DatabaseObject",

    urlTemplate: function() {
        return "data/" + this.instance().id + "/database/{{encode databaseName}}/schema/{{encode schemaName}}/" + this.metaType() + "/{{encode objectName}}"
    },

    showUrlTemplate: function() {
        return "instances/" + this.instance().id + "/databases/{{encode databaseName}}/schemas/{{encode schemaName}}/{{objectType}}/" + encodeURIComponent($.stripHtml(this.get("objectName")))
    },

    urlTemplateAttributes: function() {
        return {
            databaseName: $.stripHtml(this.database().name()),
            schemaName: $.stripHtml(this.schema().name()),
            objectName: $.stripHtml(this.name()),
            objectType: this.get("objectType")
        }
    },

    isChorusView: function() {
        return false;
    }
});
