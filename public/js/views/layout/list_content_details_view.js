chorus.views.ListContentDetails = chorus.views.Base.extend({
    constructorName: "ListContentDetailsView",
    className:"list_content_details",

    events:{
        "keyup input.search": "triggerSearch",
        "change input.search": "triggerSearch",
        "paste input.search": "triggerSearch",
        "click a.next":"fetchNextPage",
        "click a.previous":"fetchPreviousPage"
    },

    triggerSearch: function(e) {
        this.trigger("search:content", this.$("input.search").val());
    },

    fetchNextPage:function () {
        var page = parseInt(this.collection.pagination.page);
        this.collection.fetchPage(page + 1);
        this.scrollToTopOfPage();
    },

    fetchPreviousPage:function () {
        var page = parseInt(this.collection.pagination.page);
        this.collection.fetchPage(page - 1);
        this.scrollToTopOfPage();
    },

    scrollToTopOfPage:function () {
        window.scroll(0, 0);
    },

    postRender:function (el) {
        this.updatePagination();
        if (this.$(".pagination").hasClass("hidden") && this.options.hideIfNoPagination) {
            el.addClass("hidden");
        } else {
            el.removeClass("hidden")
        }
    },

    updatePagination: function() {
        var count = this.collection.pagination ? parseInt(this.collection.pagination.records) : this.collection.length;
        this.$(".count").text(t("entity.name." + this.options.modelClass, {count: count}));

        if (this.collection.loaded && this.collection.pagination) {
            if (this.collection.length > 0) {
                this.$(".current").text(this.collection.pagination.page);
                this.$(".total").text(this.collection.pagination.total);
            }

            var page = parseInt(this.collection.pagination.page);
            var total = parseInt(this.collection.pagination.total);

            this.$(".pagination").toggleClass("hidden", !(total > 1));

            var hasPreviousLink = page > 1;
            this.$("a.previous").toggleClass("hidden", !hasPreviousLink);
            this.$("span.previous").toggleClass("hidden", hasPreviousLink);

            var hasNextLink = page < total;
            this.$("a.next").toggleClass("hidden", !hasNextLink);
            this.$("span.next").toggleClass("hidden", hasNextLink);
        } else {
            this.$(".pagination").addClass("hidden");
        }
    },

    additionalContext:function (ctx) {
        var hash = {
            hideCounts:this.options.hideCounts,
            search:this.options.search,
            buttons:this.options.buttons
        }

        if (this.collection.loaded && this.collection.pagination) {
            var page = parseInt(this.collection.pagination.page);
            var total = parseInt(this.collection.pagination.total);

            hash.nextPage = page < total;
        }

        return hash;
    }
});