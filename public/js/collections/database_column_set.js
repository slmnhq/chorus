chorus.collections.DatabaseColumnSet = chorus.collections.Base.extend({
    model:chorus.models.DatabaseColumn,

    urlTemplate:function () {
        if (this.attributes.tableName) {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{tableName}}/column";
        } else if (this.attributes.viewName) {
            return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{viewName}}/column";
        } else if (this.attributes.queryName) {
            return "workspace/{{workspaceId}}/dataset/{{queryName}}/column";
        }
    },

    _add:function (model, options) {
        model = this._super("_add", arguments);
        model.set({"schemaName":this.attributes.schemaName}, {silent:true});
        model.set({"parentName":this.attributes.tableName || this.attributes.viewName}, {silent:true});
        return model;
    }
});