chorus.views.ListContentDetails = chorus.views.Base.extend({
    constructorName: "ListContentDetailsView",
    templateName:"list_content_details",

    events:{
        "click a.next": "fetchNextPage",
        "click a.previous": "fetchPreviousPage",
        "click a.close_provisioning": "closeProvisioningBar",
        "click a.select_all": "selectAll",
        "click a.select_none": "selectNone"
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

    selectAll: function(e) {
        e.preventDefault();
        chorus.PageEvents.broadcast("selectAll");
    },

    selectNone: function(e) {
        e.preventDefault();
        chorus.PageEvents.broadcast("selectNone");
    },

    postRender:function (el) {
        this.updatePagination();
        if (this.$(".pagination").hasClass("hidden") && this.options.hideIfNoPagination) {
            el.addClass("hidden");
        } else {
            el.removeClass("hidden")
        }

        if (this.options.search) {
            this.setupSearch();
        }

        if (this.provisioningState == "provisioning") {
            this.$(".provisioning_bar").removeClass("hidden");
        } else if (this.provisioningState == "fault") {
            this.$(".provisioning_fault_bar").removeClass("hidden");
        }
    },

    closeProvisioningBar: function(e) {
        e && e.preventDefault();

        this.$(".provisioning_bar").addClass("hidden");
        this.$(".provisioning_fault_bar").addClass("hidden");
    },

    setupSearch: function() {
        chorus.search(_.extend(
            {
                input: this.$("input.search:text"),
                afterFilter: _.bind(this.updateFilterCount, this)
            },
            this.options.search)
        );
    },

    startLoading: function(selector) {
        this.$(selector).text(t("loading"));
    },

    updateFilterCount: function() {
        var count = this.options.search.list.find("> li").not(".hidden").length;
        this.$(".count").text(t("entity.name." + this.options.modelClass, {count: count}));
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
            buttons:this.options.buttons,
            search: this.options.search,
            workspaceId: this.collection && this.collection.attributes && this.collection.attributes.workspaceId,
            multiSelect: this.options.multiSelect
        }

        if (this.collection.loaded && this.collection.pagination) {
            var page = parseInt(this.collection.pagination.page);
            var total = parseInt(this.collection.pagination.total);

            hash.nextPage = page < total;
        }

        return hash;
    }
});
