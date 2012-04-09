chorus.views.PaginatedJoinTablesList = chorus.views.Base.extend({
    className: "paginated_join_tables",

    subviews: {
        '.join_pagination': 'joinTablePaginator'
    },

    setup: function() {
        this.joinTablePaginator = new chorus.views.ListContentDetails({
            collection: this.collection,
            modelClass: "Dataset",
            hideIfNoPagination: true
        });
    },

    collectionModelContext: function(model) {
        return {
            isView: model.metaType() == "view",
            iconUrl: model.iconUrl({ size: "medium" })
        };
    }
});
