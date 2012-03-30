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

        this.schemas = new chorus.collections.SchemaSet([], {instanceId: this.schema.get("instanceId"), databaseName: this.schema.get("databaseName")});
    },

    postRender: function() {
        this._super("postRender");

        var $menuContent = $("<ul class='schema_menu'></ul>")
        chorus.menu(this.$("a.schema_qtip"), {
            content: $menuContent,
            classes: "schema_menu",
            style: {
                width: "auto"
            },
            qtipArgs: {
                events: {
                    show: _.bind(function(event, api) {
                        this.schemas.fetchIfNotLoaded();
                        this.schemas.bind("loaded", function() {
                            _.each(this.schemas.models, function(schema) {
                                $li = $("<li></li>");
                                $li.addClass("menu_item");
                                $li.data("schema", schema);

                                $a = $("<a href='#'></a>")
                                $a.addClass("schema");

                                if (schema.get("name") == this.schema.get("name")) {
                                    $a.append($("<div class='check'></div>"))
                                }
                                $a.append(schema.get("name"));

                                $a.click(function(e) {
                                    e && e.preventDefault();
                                    api.hide();
                                });

                                $li.append($a);

                                $menuContent.append($li);
                            }, this);
                        }, this);
                    }, this)
                }
            }
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
    },

    collectionModelContext: function(model) {
        return {
            isView:  model.metaType() == "view",
            iconUrl: model.iconUrl({ size: "medium" })
        };
    }
});
