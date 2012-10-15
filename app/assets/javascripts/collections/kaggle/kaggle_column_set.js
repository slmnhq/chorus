chorus.collections.KaggleColumnSet = chorus.collections.Base.extend({
    constructorName: "KaggleColumnSet",
    model: chorus.models.KaggleColumn,

    setup: function() {
        var names = ["rank", "competitions", "competition_types", "fav_techniques", "fav_software", "location"];
        _.each(names, function(name) {
            this.add(new chorus.models.KaggleColumn({name: name}))
        }, this)
    }
});