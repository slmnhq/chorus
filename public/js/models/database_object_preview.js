chorus.models.DatabaseObjectPreview = chorus.models.Base.extend(_.extend({}, chorus.Mixins.SQLResults, {
    urlTemplate: function() {
        if (this.get("tableName")) {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{tableName}}/sample";
        } else {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{viewName}}/sample";
        }
    }
}));