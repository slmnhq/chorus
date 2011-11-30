(function($, ns) {
    ns.ListContentDetails = chorus.views.Base.extend({
        className : "list_content_details",

        events: {
            "click a.next" : "fetchNextPage",
            "click a.previous" : "fetchPreviousPage"
        },

        fetchNextPage : function() {
            var page = parseInt(this.collection.pagination.page);
            this.collection.fetchPage(page + 1);
        },

        fetchPreviousPage : function() {
            var page = parseInt(this.collection.pagination.page);
            this.collection.fetchPage(page - 1);
        },

        additionalContext: function(ctx) {
            var hash = {
                modelClass : this.options.modelClass,
                pagination : this.collection.pagination
            }

            if (this.collection.loaded) {
                var page = parseInt(this.collection.pagination.page);
                var total = parseInt(this.collection.pagination.total);

                hash.nextPage = page < total;
                hash.prevPage = page > 1;
            }

            return hash;
        }
    });
})(jQuery, chorus.views);