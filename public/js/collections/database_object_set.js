chorus.collections.DatabaseObjectSet = chorus.collections.Base.extend({
    model: chorus.models.DatabaseObject,
    urlTemplate: "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}",

    urlParams: function() {
        return {type: "meta"}
    },

    findByName:function (name) {
        return this.find(function(tableOrView) {
            return tableOrView.get("objectName") === name;
        });
    },

    parse: function(resp) {
        var modelsJson = this._super("parse", arguments);
        return _.map(modelsJson, function (modelJson) {
            return _.extend({
                instanceId: this.attributes.instanceId,
                databaseName: this.attributes.databaseName,
                schemaName: this.attributes.schemaName
            }, modelJson);
        }, this);
    }
});
