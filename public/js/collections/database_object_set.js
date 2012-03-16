chorus.collections.DatabaseObjectSet = chorus.collections.Base.extend(_.extend({}, chorus.Mixins.InstanceCredentials.model, {
    model: chorus.models.DatabaseObject,
    urlTemplate: "data/{{instanceId}}/database/{{databaseName}}/schema/{{schemaName}}",

    urlParams: function() {
        return {type: "meta"}
    },

    parse: function(resp) {
        var modelsJson = this._super("parse", arguments);
        return _.map(modelsJson, function (modelJson) {
            return _.extend({
                instance: { id: this.attributes.instanceId },
                databaseName: this.attributes.databaseName,
                schemaName: this.attributes.schemaName
            }, modelJson);
        }, this);
    }
}));
