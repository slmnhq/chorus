chorus.dialogs.ManageJoinTables = chorus.dialogs.Base.extend({
    className: "manage_join_tables",
    additionalClass: "with_sub_header",
    title: t("dataset.manage_join_tables.title"),

    events: {
        "click a.join": "joinLinkClicked",
        "click a.preview_columns": "onClickPreviewColumns"
    },

    subviews: {
        '.paginated_join_tables' : 'paginatedJoinTables'
    },

    makeModel: function() {
        this._super("makeModel", arguments);
        this.model = this.options.launchElement.data("chorusView")
    },

    setup: function() {
        var schema = this.pageModel.schema();
        this.schemas = schema.database().schemas();
        this.requiredResources.add(this.schemas);
        this.schemas.fetch();
        this.fetchDatabaseObjects(schema.databaseObjects());
    },

    fetchDatabaseObjects: function(dbObjects) {
        this.resource = this.collection = dbObjects;
        this.paginatedJoinTables = new chorus.views.PaginatedJoinTablesList({collection: dbObjects });
        this.renderSubviews();
        this.collection.fetchPage(1);
    },

    schemaSelected: function(schema) {
        var dbObjects = schema.databaseObjects();
        this.fetchDatabaseObjects(dbObjects);
        this.displaySchemaName(schema.get("name"));
    },

    joinableDatasetsSelected: function() {
        var workspace = this.pageModel.workspace();
        var datasets = workspace.datasetsInDatabase(this.pageModel.schema().database());
        this.fetchDatabaseObjects(datasets);
        this.displaySchemaName(t("dataset.manage_join_tables.this_workspace"));
    },

    displaySchemaName: function(schemaName) {
        this.$(".schema_qtip").text(schemaName);
    },

    postRender: function() {
        this._super("postRender");

        var onTextChangeFunction = _.debounce(_.bind(function(e) {
            this.collection.search($(e.target).val());
        }, this), 300);

        var menuItems = this.schemas.map(function(schema) {
            return {
                name: schema.get("name"),
                text: schema.get("name"),
                data: schema,
                onSelect: _.bind(this.schemaSelected, this)
            };
        }, this);

        menuItems.unshift({
            name: "this_workspace",
            text: t("dataset.manage_join_tables.this_workspace"),
            onSelect: _.bind(this.joinableDatasetsSelected, this)
        });

        var menu = new chorus.views.Menu({
            launchElement: this.$("a.schema_qtip"),
            items: menuItems,
            checkable: true,
            additionalClass: "join_schemas"
        });

        menu.selectItem(this.pageModel.schema().get("name"));

        chorus.search({
            input: this.$(".search input:text"),
            onTextChange: onTextChangeFunction
        });
    },

    joinLinkClicked: function(e) {
        e.preventDefault();
        var clickedId = $(e.target).closest("li").data("cid")
        var databaseObject = this.collection.getByCid(clickedId);

        var joinConfigurationDialog = new chorus.dialogs.JoinConfiguration({
            model: this.model,
            destinationObject: databaseObject.clone()
        });
        this.launchSubModal(joinConfigurationDialog);
    },

    onClickPreviewColumns: function(e) {
        e.preventDefault();

        var clickedId = $(e.target).closest("li").data("cid")
        var databaseObject = this.collection.getByCid(clickedId);

        var previewColumnsDialog = new chorus.dialogs.PreviewColumns({model: databaseObject});
        this.launchSubModal(previewColumnsDialog);
    },

    additionalContext: function() {
        var schema = this.pageModel.schema();
        return {
            instanceName: schema.get("instanceName"),
            databaseName: schema.get("databaseName")
        };
    }
});
