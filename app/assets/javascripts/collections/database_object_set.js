chorus.collections.DatabaseObjectSet = chorus.collections.LastFetchWins.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: 'DatabaseObjectSet',
    model: chorus.models.DatabaseObject,
    urlTemplate: "schemas/{{schemaId}}/database_objects",

    urlParams: function() {
        if (this.attributes && this.attributes.filter) {
            return {type: "meta", filter: this.attributes.filter}
        } else {
            return {type: "meta"}
        }
    },

    search: function(term) {
        var self = this;
        self.attributes.filter = term;
        self.fetch({silent: true, success: function() { self.trigger('searched'); }});
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
});
