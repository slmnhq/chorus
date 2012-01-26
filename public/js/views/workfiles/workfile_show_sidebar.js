(function($, ns) {
    ns.views.WorkfileShowSidebar = ns.views.Sidebar.extend({
        className : "workfile_show_sidebar",
        useLoadingSection: true,

        events : {
            "click a.version_list" : "displayVersionList"
        },
        subviews : {
            '.activity_list' : 'activityList',
            '.tab_control' : 'tabControl'
        },

        setup : function() {
            this.collection = this.model.activities();
            this.collection.fetch();
            this.collection.bind("changed", this.render, this);
            this.activityList = new ns.views.ActivityList({
                collection : this.collection,
                headingText : t("workfile.content_details.activity"),
                additionalClass : "sidebar",
                displayStyle : ['without_object', 'without_workspace']
            });

            this.allVersions = this.model.allVersions();
            this.versionList = new ns.views.WorkfileVersionList({collection : this.allVersions});
            this.allVersions.fetch();
            this.model.bind("invalidated", this.allVersions.fetch, this.allVersions);
            this.allVersions.bind("changed", this.render, this);
            this.requiredResources.push(this.model);
            this.requiredResources.push(this.model.workspace());
        },

        resourcesLoaded: function() {
            var tabs = [{name: 'activity_list'}];

            if(this.model.isSql()) {
                tabs.push({name: 'database_function_list'});
                tabs.push({name: "datasets_and_columns"});

                this.functionList = new ns.views.DatabaseFunctionListSidebar({ sandbox: this.model.sandbox() });
                this.datasetList  = new ns.views.DatabaseDatasetListSidebar({ sandbox: this.model.sandbox() });
                this.columnList   = new ns.views.DatabaseColumnSidebarList({ sandbox: this.model.sandbox() });

                this.datasetList.bind("datasetSelected", function(tableOrView) {
                    this.columnList.trigger("datasetSelected", tableOrView);
                    this.$(".database_column_list").removeClass("hidden");
                    this.$(".database_dataset_list").addClass("hidden");
                }, this);

                this.columnList.bind("back", function() {
                    this.$("input.search").val("");
                    this.$(".database_dataset_list").removeClass("hidden");
                    this.$(".database_column_list").addClass("hidden");
                }, this);

                this.subviews[".tabbed_area .database_function_list"] = "functionList";
                this.subviews[".tabbed_area .database_dataset_list"] = "datasetList";
                this.subviews[".tabbed_area .database_column_list"] = "columnList";
            }
            this.tabControl = new chorus.views.TabControl(tabs);
            this.tabControl.bind("selected", _.bind(this.setupSidebarScrolling, this))
            this.trigger("sidebar:loaded");
        },

        postRender : function() {
            var versionList = this.versionList;
            this.$("a.version_list").qtip({
                    content: {
                        text : function() {
                            return $(versionList.render().el);
                        }
                    },
                    show: 'click',
                    hide: 'unfocus',
                    position: {
                        my: "top center",
                        at: "bottom center"
                    },
                    style: {
                        classes: "tooltip-white",
                        tip: {
                            width: 20,
                            height: 15
                        }
                    }
            });
            this._super('postRender');
        },

        displayVersionList : function(e) {
            e.preventDefault();
        },

        additionalContext : function(ctx) {
            return {
                updatedBy : [this.model.get("modifiedByFirstName"), this.model.get("modifiedByLastName")].join(' '),
                modifierUrl : this.model.modifier().showUrl(),
                downloadUrl : this.model.downloadUrl()
            }
        }
    });
})(jQuery, chorus);
