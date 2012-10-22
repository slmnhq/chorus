chorus.collections.KaggleColumnSet = chorus.collections.Base.extend({
    constructorName: "KaggleColumnSet",
    model: chorus.models.KaggleColumn,

    setup: function() {
        var names = ["Rank", "Number of Entered Competitions", "Past Competition Types", "Favorite Technique", "Favorite Software", "Location"];
        _.each(names, function(name) {
            this.add(new chorus.models.KaggleColumn({name: name}))
        }, this)
    }
});