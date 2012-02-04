(function() {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs: function() {
            return [
                {label: t("breadcrumbs.home"), url: "#/"},
                {label: t("breadcrumbs.instances"), url: '#/instances'},
                {label: this.model.get("instanceName"), url: "#"},
                {label: this.model.get("databaseName"), url: "#"},
                {label: this.model.get("name")}
            ];
        }
    });

    chorus.pages.SchemaBrowsePage = chorus.pages.Base.extend({
        setup: function(instanceId, databaseName, schemaName) {
            this.schema = new chorus.models.Schema({
                instanceId: instanceId,
                databaseName : databaseName,
                name : schemaName
            });
            this.schema.fetch();

            this.instance = new chorus.models.Instance({id: instanceId});
            this.instance.bindOnce("loaded", function() {
                this.schema.set({instanceName : this.instance.get("name")});
                this.mainContent.contentHeader.options.title = this.schema.canonicalName();
                this.mainContent.contentHeader.render();
            }, this);
            this.instance.fetch();

            this.breadcrumbs = new breadcrumbsView({model: this.schema});

            this.collection = new chorus.collections.DatasetSet([], {workspaceId: 10000});
            this.collection.sortAsc("objectName");
            this.collection.fetch();

            this.mainContent = new chorus.views.MainContentList({
                modelClass: "Dataset",
                collection: this.collection,
                title: this.schema.canonicalName()
            });

            this.sidebar = new chorus.views.DatasetListSidebar();

            this.mainContent.content.forwardEvent("dataset:selected", this.sidebar);
            this.mainContent.content.bind("dataset:selected", function(dataset) {
                this.model = dataset;
            }, this);
        }
    });
})();