(function(ns) {
    ns.collections.DatabaseColumnSet = ns.collections.Base.extend({
        model : ns.models.DatabaseColumn,

        urlTemplate: function() {
            if (this.attributes.tableName) {
                return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table/{{tableName}}/column";
            } else if (this.attributes.viewName) {
                return "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/view/{{viewName}}/column";
            }
        },

        _add : function(model, options) {
            model = this._super("_add", arguments);
            model.set({"schemaName": this.attributes.schemaName});
            model.set({"parentName": this.attributes.tableName || this.attributes.viewName});
            return model;
        }

    });
})(chorus);
