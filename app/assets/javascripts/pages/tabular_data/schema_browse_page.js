chorus.pages.SchemaBrowsePage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    helpId: "schema",

    setup: function(instance_id, database_id, schemaName) {
        this.schema = new chorus.models.Schema({
            instance_id: instance_id,
            database_id: database_id,
            database_name: "REMOVEME",
            name: schemaName
        });

        this.instance = new chorus.models.Instance({id: instance_id});
        this.instance.fetch();
        this.dependOn(this.instance, this.instanceLoaded);

        // TODO: We no longer have db name, so eventually we need to remove databaseName from the DatabaseObjectSet constructor
        this.collection = new chorus.collections.DatabaseObjectSet([], {instance_id: instance_id, databaseName: "REMOVEME", schemaName: schemaName });
        this.collection.sortAsc("objectName");
        this.collection.fetch();
        this.dependOn(this.collection);

        this.sidebar = new chorus.views.TabularDataSidebar({listMode: true});

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "TabularData",
            collection: this.collection
        });

        chorus.PageEvents.subscribe("tabularData:selected", function(dataset) {
            this.model = dataset;
        }, this);

        this.bindings.add(this.collection, 'searched', function() {
            this.mainContent.content.render();
            this.mainContent.contentFooter.render();
            this.mainContent.contentDetails.updatePagination();
        })
    },

    crumbs: function() {
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.instances"), url: '#/instances'},
            {label: this.instance.get("name"), url: this.instance.showUrl()},
            {label: this.schema.database().name(), url: this.schema.database().showUrl() },
            {label: this.schema.get("name")}
        ];
    },

    instanceLoaded: function() {
        this.schema.set({instanceName: this.instance.get("name")});

        var onTextChangeFunction = _.debounce(_.bind(function(e) {
            this.collection.search($(e.target).val());
            this.mainContent.contentDetails.startLoading(".count");
        }, this), 300);

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "TabularData",
            collection: this.collection,
            title: this.schema.canonicalName(),
            search: {
                placeholder: t("schema.search"),
                onTextChange: onTextChangeFunction
            },
            contentOptions: { checkable: true },
            contentDetailsOptions: { multiSelect: true }
        });

        this.render();
    }
});
