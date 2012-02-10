chorus.models.DatabaseObject = chorus.models.TabularData.extend({
    urlTemplate: function() {
        return "data/" + this.get('instance').id + "/database/{{databaseName}}/schema/{{schemaName}}/" + this.metaType() + "/{{objectName}}"
    },

    showUrlTemplate: "/"

});