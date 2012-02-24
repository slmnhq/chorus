chorus.collections.SearchResultSet = chorus.collections.Base.extend({
    model:chorus.models.SearchResult,
    urlTemplate: "search/global",

    urlParams: function() {
        return {query: this.get("query")}
    }
});