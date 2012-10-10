chorus.collections.GnipInstanceSet = chorus.collections.Base.extend({
    constructorName: "GnipInstanceSet",
    model: chorus.models.GnipInstance,
    urlTemplate: "gnip_instances",

    comparator: function(instance) {
        return instance.get("name").toLowerCase();
    }
});
