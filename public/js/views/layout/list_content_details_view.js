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
            this.scrollToTopOfPage();
        },

        fetchPreviousPage : function() {
            var page = parseInt(this.collection.pagination.page);
            this.collection.fetchPage(page - 1);
            this.scrollToTopOfPage();
        },

        scrollToTopOfPage : function() {
            window.scroll(0, 0);
        },

        postRender : function(el) {
            if (this.$(".pagination").length == 0 && this.options.hideIfNoPagination) {
                el.addClass("hidden");
            } else {
                el.removeClass("hidden")
            }
        },

        additionalContext: function(ctx) {
            var hash = {
                modelClass : this.options.modelClass,
                pagination : this.collection.length > 0 ? this.collection.pagination : undefined,
                records : this.collection.pagination ? this.collection.pagination.records : this.collection.length,
                hideCounts : this.options.hideCounts
            }

            if (this.collection.loaded && this.collection.pagination) {
                var page = parseInt(this.collection.pagination.page);
                var total = parseInt(this.collection.pagination.total);

                hash.nextPage = page < total;
                hash.prevPage = page > 1;
                hash.multiPage = total > 1;
            }

            return hash;
        }
    });
})(jQuery, chorus.views);