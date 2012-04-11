chorus.dialogs.ManageJoinTables = chorus.dialogs.Base.extend({
    className: "manage_join_tables",
    additionalClass: "with_sub_header",
    title: t("dataset.manage_join_tables.title"),
    useLoadingSection: true,

    events: {
        "click li": "tableClicked",
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
        this.schema = this.pageModel.schema();
        this.fetchDatabaseObjects(this.schema.databaseObjects());
    },

    fetchDatabaseObjects: function(dbObjects) {
        this.resource = this.collection = dbObjects;

        var urlParams = this.collection.urlParams;
        this.collection.urlParams = function() {
            return _.extend({rows: 9}, urlParams && urlParams.call(this));
        };

        this.collection.fetchIfNotLoaded();

        this.paginatedJoinTables = new chorus.views.PaginatedJoinTablesList({collection: this.collection})

        this.schemas = new chorus.collections.SchemaSet([], {instanceId: this.schema.get("instanceId"), databaseName: this.schema.get("databaseName")});
        this.schemas.fetch();
    },

    schemasLoaded: function() {
        var $menuContent = $("<ul class='schema_menu'></ul>")

        this.schemas.each(function(schema) {
            schema.set({ instanceName: this.schema.get("instanceName") });

            $li = $("<li></li>");
            $li.addClass("menu_item");

            $a = $("<a href='#'></a>")
            $a.addClass("schema");

            if (schema.get("name") == this.schema.get("name")) {
                $a.append($("<div class='check'></div>"))
            }
            $a.append(schema.get("name"));

            $a.click(_.bind(function(e) {
                e && e.preventDefault();
                this.schema = schema;
                var dbObjects = schema.databaseObjects();
                this.bindings.add(dbObjects, "change reset remove", this.render);

                this.fetchDatabaseObjects(dbObjects);
                this.render();
            }, this));

            $li.append($a);
            $menuContent.append($li);
        }, this);

        chorus.menu(this.$("a.schema_qtip"), {
            content: $menuContent
        });

    },

    postRender: function() {
        this._super("postRender");

        this.schemas.onLoaded(this.schemasLoaded, this);

        var onTextChangeFunction = _.debounce(_.bind(function(e) {
            this.collection.search($(e.target).val());
        }, this), 300);

        chorus.search({
            input: this.$(".search input:text"),
            onTextChange: onTextChangeFunction
        });
    },

    tableClicked: function(e) {
        var clickedLi = $(e.target).closest("li");
        this.$("li").removeClass("selected");
        clickedLi.addClass("selected");
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
        return {
            instanceName: this.schema.get("instanceName"),
            databaseName: this.schema.get("databaseName"),
            schemaName: this.schema.get("name")
        };
    }
});
