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
        if (this.$(".pagination").length == 0 && this.options.hideIfNoPagination) {
            el.addClass("hidden");
        } else {
            el.removeClass("hidden")
        }
    },

    additionalContext:function (ctx) {
        var hash = {
            modelClass:this.options.modelClass,
            pagination:this.collection.length > 0 ? this.collection.pagination : undefined,
            records:this.collection.pagination ? parseInt(this.collection.pagination.records) : this.collection.length,
            hideCounts:this.options.hideCounts,
            search:this.options.search,
            buttons:this.options.buttons
        }

        hash.entityTypePluralization = t("entity.name." + this.options.modelClass, {count: hash.records});
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