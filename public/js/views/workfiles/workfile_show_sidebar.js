chorus.views.WorkfileShowSidebar = chorus.views.Sidebar.extend({
    className:"workfile_show_sidebar",
    useLoadingSection:true,

    events:{
        "click a.version_list":"displayVersionList"
    },
    subviews:{
        '.activity_list':'activityList',
        '.tab_control':'tabControl'
    },

    setup:function () {
        this.collection = this.model.activities();
        this.collection.fetch();
        this.collection.bind("changed", this.render, this);
        this.activityList = new chorus.views.ActivityList({
            collection:this.collection,
            suppressHeading: true,
            headingText:t("workfile.content_details.activity"),
            additionalClass:"sidebar",
            displayStyle:['without_object', 'without_workspace']
        });

        this.allVersions = this.model.allVersions();
        this.versionList = new chorus.views.WorkfileVersionList({collection:this.allVersions});
        this.allVersions.fetch();
        this.model.bind("invalidated", this.allVersions.fetch, this.allVersions);
        this.allVersions.bind("changed", this.render, this);
        this.requiredResources.push(this.model);
        this.requiredResources.push(this.model.workspace());
    },

    resourcesLoaded:function () {
        var tabs = [
            {name:'activity_list'}
        ];

        if (this.model.isSql()) {
            tabs.push({name:'database_function_list'});
            tabs.push({name:"datasets_and_columns"});

            this.functionList = new chorus.views.DatabaseFunctionSidebarList({ sandbox:this.model.workspace().sandbox() });
            this.datasetList = new chorus.views.DatabaseDatasetSidebarList({ sandbox:this.model.workspace().sandbox() });
            this.columnList = new chorus.views.DatabaseColumnSidebarList({ sandbox:this.model.workspace().sandbox() });

            this.datasetList.bind("datasetSelected", function (tableOrView) {
                this.columnList.trigger("datasetSelected", tableOrView);
                this.$(".database_column_list").removeClass("hidden");
                this.$(".database_dataset_list").addClass("hidden");
            }, this);

            this.columnList.bind("back", function () {
                this.$("input.search").val("");
                this.$(".database_dataset_list").removeClass("hidden");
                this.$(".database_column_list").addClass("hidden");
            }, this);

            this.subviews[".tabbed_area .database_function_list"] = "functionList";
            this.subviews[".tabbed_area .database_dataset_list"] = "datasetList";
            this.subviews[".tabbed_area .database_column_list"] = "columnList";
        }
        this.tabControl = new chorus.views.TabControl(tabs);
        this.tabControl.bind("selected", _.bind(this.recalculateScrolling, this))
    },

    postRender:function () {
        this._super('postRender');
        var versionList = this.versionList.render();
        chorus.menu(this.$('a.version_list'), {
            content:$(versionList.el)
        });

    },

    displayVersionList:function (e) {
        e.preventDefault();
    },

    additionalContext:function (ctx) {
        return {
            updatedBy:[this.model.get("modifiedByFirstName"), this.model.get("modifiedByLastName")].join(' '),
            modifierUrl:this.model.modifier().showUrl(),
            downloadUrl:this.model.downloadUrl()
        }
    }
});