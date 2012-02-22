chorus.dialogs.ManageJoinTables = chorus.dialogs.Base.extend({
    className: "manage_join_tables",
    additionalClass: "with_sub_header",
    title: t("dataset.manage_join_tables.title"),
    useLoadingSection:true,

    events: {
        "click li":     "tableClicked",
        "click a.join": "joinLinkClicked",
        "click a.preview_columns": "onClickPreviewColumns"
    },

    subviews: {
        '.join_pagination': 'joinTablePaginator'
    },

    makeModel: function() {
        this._super("makeModel", arguments);
        this.model = this.options.launchElement.data("chorusView")
    },

    setup: function() {
        this.schema = this.pageModel.schema();
        this.resource = this.collection = this.schema.databaseObjects();

        var urlParams = this.collection.urlParams;
        this.collection.urlParams = function() {
            return _.extend({rows: 9}, urlParams && urlParams());
        };

        this.collection.fetchIfNotLoaded();

        this.joinTablePaginator = new chorus.views.ListContentDetails({collection:this.collection, modelClass:"Dataset", hideIfNoPagination:true});
    },

    postRender: function() {
        this.setupScrolling(this.$(".list"));
    },

    tableClicked: function(e) {
        var clickedLi = $(e.target).closest("li");
        this.$("li").removeClass("selected");
        clickedLi.addClass("selected");
    },

    joinLinkClicked: function(e) {
        e.preventDefault();
        var clickedId = $(e.target).closest("li").attr("table_id")
        var databaseObject = this.collection.findWhere({ id: clickedId });
        if (databaseObject == this.collection.get(this.pageModel.get("id"))) {
            return;
        }

        var joinConfigurationDialog = new chorus.dialogs.JoinConfiguration({
            model: this.model,
            destinationObject: databaseObject
        });
        this.launchSubModal(joinConfigurationDialog);
    },

    onClickPreviewColumns: function(e) {
        e.preventDefault();

        var clickedId = $(e.target).closest("li").attr("table_id")
        var databaseObject = this.collection.findWhere({ id: clickedId });

        var previewColumnsDialog = new chorus.dialogs.PreviewColumns({model: databaseObject});
        this.launchSubModal(previewColumnsDialog);
    },

    additionalContext: function() {
        return { canonicalName: this.schema.canonicalName() }
    },

    collectionModelContext: function(model) {
        return {
            isView:  model.metaType() == "view",
            iconUrl: model.iconUrl({ size: "small" }),
            original: model.id == this.pageModel.get("id")
        };
    }
});
