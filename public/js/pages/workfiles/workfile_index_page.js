(function () {
    var breadcrumbsView = chorus.views.ModelBoundBreadcrumbsView.extend({
        getLoadedCrumbs:function () {
            return [
                {label:t("breadcrumbs.home"), url:"#/"},
                {label:t("breadcrumbs.workspaces"), url:'#/workspaces'},
                {label:this.model.displayShortName(), url:this.model.showUrl()},
                {label:t("breadcrumbs.workfiles.all")}
            ];
        }
    });

    chorus.pages.WorkfileIndexPage = chorus.pages.Base.extend({
        helpId: "workfiles",

        setup:function (workspaceId) {
            this.workspaceId = workspaceId;

            var workspace = new chorus.models.Workspace({id:workspaceId});
            workspace.fetch();
            this.requiredResources.push(workspace);
            this.breadcrumbs = new breadcrumbsView({model:workspace});

            this.collection = new chorus.collections.WorkfileSet([], {workspaceId:workspaceId});
            this.collection.fileType = "";
            this.collection.sortAsc("fileName");
            this.collection.fetch();
            this.requiredResources.push(this.collection);
            this.subNav = new chorus.views.SubNav({workspace:workspace, tab:"workfiles"});
            this.mainContent = new chorus.views.MainContentList({
                    modelClass:"Workfile",
                    collection:this.collection,
                    model:workspace,
                    title: t("workfiles.title"),
                    linkMenus:{
                        type:{
                            title:t("header.menu.filter.title"),
                            options:[
                                {data:"", text:t("workfiles.header.menu.filter.all")},
                                {data:"SQL", text:t("workfiles.header.menu.filter.sql")},
                                {data:"CODE", text:t("workfiles.header.menu.filter.code")},
                                {data:"TEXT", text:t("workfiles.header.menu.filter.text")},
                                {data:"OTHER", text:t("workfiles.header.menu.filter.other")}
                            ],
                            event:"filter"
                        },
                        sort:{
                            title:t("workfiles.header.menu.sort.title"),
                            options:[
                                {data:"alpha", text:t("workfiles.header.menu.sort.alphabetically")},
                                {data:"date", text:t("workfiles.header.menu.sort.by_date")}
                            ],
                            event:"sort"
                        }

                    }
                }
            );
            this.sidebar = new chorus.views.WorkfileListSidebar({workspace:workspace});
            chorus.PageEvents.subscribe("workfile:selected", this.setModel, this);

            this.mainContent.contentHeader.bind("choice:filter", function (choice) {
                this.collection.attributes.fileType = choice;
                this.collection.fetch();
            }, this)

            this.mainContent.contentHeader.bind("choice:sort", function (choice) {
                var field = choice == "alpha" ? "fileName" : "lastUpdatedStamp";
                this.collection.sortAsc(field)
                this.collection.fetch();
            }, this)
        },

        resourcesLoaded: function() {
            this.updateButtons();
        },

        setModel:function (workfile) {
            this.model = workfile;
        },

        updateButtons:function () {
            if (this.mainContent.model.canUpdate()) {
                this.mainContent.contentDetails.options.buttons = [
                    {
                        view:"WorkfilesImport",
                        text:t("actions.import_workfile"),
                        dataAttributes:[
                            {
                                name:"workspace-id",
                                value:this.mainContent.model.get("id")
                            }
                        ]
                    },
                    {
                        view:"WorkfilesSqlNew",
                        text:t("actions.create_sql_workfile"),
                        dataAttributes:[
                            {
                                name:"workspace-id",
                                value:this.mainContent.model.get("id")
                            }
                        ]
                    }
                ];

                this.mainContent.contentDetails.render();
            }
        }
    });
})();
