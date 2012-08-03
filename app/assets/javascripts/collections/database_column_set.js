chorus.collections.DatabaseColumnSet = chorus.collections.Base.extend({
    constructorName: "DatabaseColumnSet",
    model: chorus.models.DatabaseColumn,

    modelAdded: function(model) {
        if (this.dataset) model.dataset = this.dataset;
    },

    urlTemplate: function() {
        return "datasets/{{id}}/columns"
    },

    urlParams: function() {
        return {
            type: this.attributes.type
        };
    }
});
