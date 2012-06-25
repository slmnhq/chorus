chorus.collections.DatasetSet = chorus.collections.LastFetchWins.include(
    chorus.Mixins.InstanceCredentials.model
).extend({
    constructorName: 'DatasetSet',
    model: chorus.models.Dataset,
    urlTemplate: "schemas/{{schemaId}}/datasets",

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
    }
});
