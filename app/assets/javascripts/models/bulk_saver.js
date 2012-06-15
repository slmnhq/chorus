chorus.models.BulkSaver = chorus.models.Base.extend({
    url: function() {
        return this.attributes.collection.url();
    },

    initialize: function() {
        this.bind("saved", _.bind(function() {
            this.trigger("saved");
        }, this.attributes.collection));
    },

    handleRequestFailure: function() {
        var collection = this.attributes.collection;
        collection.handleRequestFailure.apply(collection, arguments);
    }
});