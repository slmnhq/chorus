chorus.views.PickItemsList = chorus.views.Base.extend({
    constructorName: "PickItemsList",

    templateName: 'pick_items_list',

    subviews: {
        ".pagination": "paginationView"
    },

    setup: function () {
        if (this.options.pagination) {
            this.paginationView = new chorus.views.ListContentDetails({
                collection: this.collection,
                modelClass: this.options.modelClass
            });
        }

        this.bindings.add(this.collection, 'searched', this.render);
    },

    additionalContext: function() {
        return {
            pagination: this.options.pagination,
            emptyListTranslationKey: this.options.emptyListTranslationKey || "pickitem.dialog.empty"
        }
    }
});
