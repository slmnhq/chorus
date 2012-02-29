chorus.views.TypeAheadSearch = chorus.views.Base.extend({
    constructorName: "TypeAheadSearchView",
    className: "type_ahead_search",

    makeModel: function() {
        this._super("makeModel", arguments);
        this.resource = this.model = new chorus.models.TypeAheadSearchResult();
    },

    searchFor: function(query) {
        this.model.set({query: query}, {silent: true});
        this.model.fetch();
    }
});