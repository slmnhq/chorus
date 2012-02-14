(function() {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs: function() {
            var instance = { id: this.model.get('instanceId'), name: this.model.get('instanceName')}
            return [
                {label: t("breadcrumbs.home"), url: "#/"},
                {label: t("breadcrumbs.instances"), url: '#/instances'},
                {label: this.model.get("instanceName"), dialog: "BrowseDatasets", data: { instance: instance} },
                {label: this.model.get("databaseName"), dialog: "BrowseDatasets",
                    data: { instance: instance, databaseName: this.model.get("databaseName")} },
                {label: this.model.get("name")}
            ];
        }
    });

    chorus.pages.SchemaBrowsePage = chorus.pages.Base.extend({
        helpId: "schema",

        setup: function(instanceId, databaseName, schemaName) {
            this.schema = new chorus.models.Schema({
                instanceId: instanceId,
                databaseName : databaseName,
                name : schemaName
            });

            this.instance = new chorus.models.Instance({id: instanceId});
            this.instance.bindOnce("loaded", function() {
                this.schema.set({instanceName : this.instance.get("name")});
                this.mainContent.contentHeader.options.title = this.schema.canonicalName();
                this.mainContent.contentHeader.render();
            }, this);
            this.instance.fetch();

            this.breadcrumbs = new breadcrumbsView({model: this.schema});

            this.collection = new chorus.collections.DatabaseObjectSet([], {instanceId: instanceId, databaseName: databaseName, schemaName:schemaName });
            this.collection.sortAsc("objectName");
            this.collection.fetch();

            this.mainContent = new chorus.views.MainContentList({
                modelClass: "Dataset",
                collection: this.collection,
                title: this.schema.canonicalName(),
                contentOptions: {browsingSchema: true}
            });

            this.sidebar = new chorus.views.DatasetListSidebar({browsingSchema: true});

            chorus.PageEvents.subscribe("dataset:selected", function(dataset) {
                this.model = dataset;
            }, this);
        }
    });
})();