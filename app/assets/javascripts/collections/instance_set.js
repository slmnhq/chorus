chorus.collections.InstanceSet = chorus.collections.Base.extend({
    constructorName: "InstanceSet",
    model:chorus.models.Instance,
    urlTemplate:"instances/",

    urlParams: function() {
        return _.extend(this._super('urlParams') || {}, {hasCredentials: this.attributes.hasCredentials});
    },

    comparator: function(instance) {
        return instance.get("name").toLowerCase();
    }
});
