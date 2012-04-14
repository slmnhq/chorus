chorus.views.WorkfileShowSidebar = chorus.views.Sidebar.extend({
    constructorName: "WorkfileShowSidebarView",
    templateName:"workfile_show_sidebar",
    useLoadingSection:true,

    events:{
        "click a.version_list":"displayVersionList"
    },

    subviews:{
        '.tab_control':'tabs'
    },

    setup:function () {
        this.collection = this.model.activities();
        this.collection.fetch();

        this.allVersions = this.model.allVersions();
        this.versionList = new chorus.views.WorkfileVersionList({collection:this.allVersions});
        this.allVersions.fetch();

        this.bindings.add(this.collection, "changed", this.render, this);
        this.bindings.add(this.model, "invalidated", this.allVersions.fetch, this.allVersions);
        this.bindings.add(this.allVersions, "changed", this.render);

        chorus.PageEvents.subscribe("datasetSelected", this.jumpToTop, this);

        this.requiredResources.push(this.model);
        this.requiredResources.push(this.model.workspace());
    },

    resourcesLoaded:function () {
        if (this.model.isSql() && this.model.workspace().isActive()) {
            this.tabs = new chorus.views.TabControl(["activity", "database_function_list", "datasets_and_columns"]);
            var schema = this.model.executionSchema();
            this.tabs.database_function_list = new chorus.views.DatabaseFunctionSidebarList({ schema: schema });
            this.tabs.datasets_and_columns = new chorus.views.DatasetAndColumnList({ model: schema })
        } else {
            this.tabs = new chorus.views.TabControl(["activity"]);
        }

        this.tabs.activity = new chorus.views.ActivityList({
            collection: this.collection,
            additionalClass: "sidebar",
            displayStyle: ['without_object', 'without_workspace']
        });
        this.tabs.bind("selected", _.bind(this.recalculateScrolling, this))
    },

    postRender:function () {
        var versionList = this.versionList.render();
        chorus.menu(this.$('a.version_list'), {
            content:$(versionList.el)
        });
        this._super('postRender');
    },

    displayVersionList:function (e) {
        e.preventDefault();
    },

    additionalContext:function (ctx) {
        var modifier = this.model.modifier();
        return {
            updatedBy: modifier.displayShortName(),
            modifierUrl: modifier.showUrl(),
            downloadUrl: this.model.downloadUrl(),
            isActiveWorkspace: this.model.workspace().isActive()
        }
    }
});
