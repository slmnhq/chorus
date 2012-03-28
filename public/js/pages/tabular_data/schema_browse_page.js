chorus.pages.SchemaBrowsePage = chorus.pages.Base.include(
    chorus.Mixins.InstanceCredentials.page
).extend({
    helpId: "schema",

    setup: function(instanceId, databaseName, schemaName) {
        this.schema = new chorus.models.Schema({
            instanceId: instanceId,
            databaseName: databaseName,
            name: schemaName
        });

        this.instance = new chorus.models.Instance({id: instanceId});
        this.instance.fetch();
        this.dependOn(this.instance, this.instanceLoaded);

        this.collection = new chorus.collections.DatabaseObjectSet([], {instanceId: instanceId, databaseName: databaseName, schemaName: schemaName });
        this.collection.sortAsc("objectName");
        this.collection.fetch();
        this.dependOn(this.collection);

        this.sidebar = new chorus.views.TabularDataSidebar({listMode: true});

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Dataset",
            collection: this.collection
        });

        chorus.PageEvents.subscribe("tabularData:selected", function(dataset) {
            this.model = dataset;
        }, this);
    },

    crumbs: function() {
        var database = new chorus.models.Database({instanceId: this.instance.id, name: this.schema.get("databaseName")});
        return [
            {label: t("breadcrumbs.home"), url: "#/"},
            {label: t("breadcrumbs.instances"), url: '#/instances'},
            {label: this.instance.get("name"), url: this.instance.showUrl()},
            {label: this.schema.get("databaseName"), url: database.showUrl() },
            {label: this.schema.get("name")}
        ];
    },

    instanceLoaded: function() {
        this.schema.set({instanceName: this.instance.get("name")});

        var self = this;
        var onTextChangeFunction = _.debounce(function(e) {
            self.collection.attributes.filter = $(e.target).val();
            self.mainContent.contentDetails.startLoading(".count");
            self.collection.fetch({silent: true, success: function() {
                self.mainContent.content.render();
                self.mainContent.contentFooter.render();
                self.mainContent.contentDetails.updatePagination();
            }});
        }, 300);

        this.mainContent = new chorus.views.MainContentList({
            modelClass: "Dataset",
            collection: this.collection,
            title: this.schema.canonicalName(),
            search: {
                placeholder: t("schema.search"),
                onTextChange: onTextChangeFunction
            }
        });

        this.mainContent.contentDetails.bind("search:content", _.debounce(function(input) {
            this.collection.attributes.filter = input;
            this.collection.fetch({silent: true, success: _.bind(function() {
                this.mainContent.content.render();
                this.mainContent.contentFooter.render();
                this.mainContent.contentDetails.updatePagination();
            }, this)});
        }, 300), this);

        this.render();
    }
});
