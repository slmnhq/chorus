chorus.models.DatabasePreview = chorus.models.Base.extend({
    urlTemplate: function() {
        if(this.get("tableName") ) {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{tableName}}/sample";
        } else {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{viewName}}/sample";
        }
    }
});