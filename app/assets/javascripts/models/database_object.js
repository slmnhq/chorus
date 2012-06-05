chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    constructorName: "DatabaseObject",

    urlTemplate: function() {
        return "database_objects/" + this.id
    },

    showUrlTemplate: function() {
        return "database_objects/" + this.id
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
