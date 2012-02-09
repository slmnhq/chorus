chorus.collections.DatabaseTableSet = chorus.collections.Base.extend({
    model:chorus.models.DatabaseTable,
    urlTemplate:"data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}/table",

    findByName:function (name) {
        return this.find(function (table) {
            return table.get("objectName") === name;
        });
    },

    parse:function (resp) {
        var modelsJson = this._super("parse", arguments);
        return _.map(modelsJson, function (modelJson) {
            return _.extend({
                instanceId:this.attributes.instanceId,
                databaseName:this.attributes.databaseName,
                schemaName:this.attributes.schemaName
            }, modelJson);
        }, this);
    }
});
